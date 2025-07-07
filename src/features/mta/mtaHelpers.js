import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

/**
 * Fetches data from a URL and decodes it using GTFS-realtime bindings.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage>} The decoded GTFS-realtime feed message.
 */
export const getDecodedData = async (url) => {
  const response = await axios.get(url, {
    headers: { "x-api-key": process.env.REACT_APP_MTA_GTFS_API_KEY },
    responseType: "arraybuffer",
  });
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(response.data)
  );
};

/**
 * Processes raw GTFS-RT feed data to extract trip updates for a specific stop.
 * @param {object} gtfsFeed - The raw GTFS-RT feed message.
 * @param {string} stopId - The ID of the stop to get updates for.
 * @returns {Array<object>} A list of trip updates for the given stop.
 */
export const processTripUpdatesForStop = (gtfsFeed, stopId) => {
  // Extract all trip updates from the feed entities.
  const tripUpdates = gtfsFeed.entity.map((entity) => entity.tripUpdate).filter(Boolean);

  // For each trip, find the specific stop time update for the requested stop.
  const tripUpdatesForStop = tripUpdates.map((tripUpdate) => {
    const stopTimeUpdateForStop = tripUpdate.stopTimeUpdate.filter((update) => update.stopId === stopId);

    if (stopTimeUpdateForStop.length > 0) {
      const firstStopTimeUpdate = stopTimeUpdateForStop[0];
      
      return {
        arrival: firstStopTimeUpdate.arrival,
        departure: firstStopTimeUpdate.departure,
        tripId: tripUpdate.trip.tripId,
        route: tripUpdate.trip.routeId,
        // Collect all stop IDs for this trip to know its full path.
        stoppingAt: tripUpdate.stopTimeUpdate.map((update) => update.stopId)
      }
    }
  }).filter(Boolean);

  return tripUpdatesForStop;
};

/**
 * Converts arrival times from Unix epoch seconds to minutes from now.
 * @param {Array<object>} tripUpdates - A list of trip updates with arrival times.
 * @param {number} currentTime - The current time in Unix epoch seconds.
 * @returns {Array<object>} A list of trips with arrival times in minutes.
 */
export const convertTripTimesToMinutes = (tripUpdates, currentTime) => {
  const tripsWithArrivalMinutes = tripUpdates.map((trip) => ({
    arrival: Math.round((trip.arrival.time - currentTime) / 60),
    tripId: trip.tripId,
    route: trip.route,
    stoppingAt: trip.stoppingAt
  }));

  // Filter out trips that have already departed.
  return tripsWithArrivalMinutes.filter((trip) => trip.arrival > 0);
};

/**
 * Finds the arrival time of a specific trip at a given stop.
 * This is useful for finding when a train arriving at an origin station will reach a subsequent destination station.
 * @param {object} gtfsFeed - The raw GTFS-RT feed message.
 * @param {string} stopId - The ID of the destination stop.
 * @param {string} tripId - The ID of the trip to check.
 * @param {number} currentTime - The current time in Unix epoch seconds.
 * @returns {number|null} The arrival time in minutes, or null if not found.
 */
export const getTripArrivalTimeAtStop = (gtfsFeed, stopId, tripId, currentTime) => {
  // Note: This re-processes the entire feed. For high-performance needs, this could be optimized
  // by passing in pre-processed data. For this use case, it's acceptable.
  const tripUpdatesForStop = processTripUpdatesForStop(gtfsFeed, stopId);
  const trip = tripUpdatesForStop.find((update) => update.tripId === tripId);
  
  if (trip?.arrival?.time) {
    return Math.round((trip.arrival.time - currentTime) / 60);
  }
  
  return null;
};

/**
 * Filters a GTFS-RT alerts feed to return only active alerts.
 * @param {object} alertsFeed - The raw GTFS-RT alerts feed message.
 * @returns {Array<object>} A list of active alert entities.
 */
export const processMtaAlerts = (alertsFeed) => {
  if (!alertsFeed?.entity) {
    return [];
  }
  
  const now = new Date().getTime() / 1000;

  return alertsFeed.entity.filter(a => {
    if (!a.alert?.activePeriod?.[0]) {
      return false;
    }
    const { start, end } = a.alert.activePeriod[0];
    
    const isStarted = start < now;
    // An alert is active if it has started and either has no end time or the end time is in the future.
    const isNotEnded = !end || end > now;

    return isStarted && isNotEnded;
  });
}; 