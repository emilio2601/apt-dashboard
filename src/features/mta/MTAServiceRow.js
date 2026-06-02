import React from "react";
import { Stops } from "../../stops";
import MTADestinationRow from "./MTADestinationRow";
import MTASubwayBullet from "./components/MTASubwayBullet";
import AlertRow from "./components/AlertRow";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import { processTripUpdatesForStop, convertTripTimesToMinutes, getTripArrivalTimeAtStop, getRawTripArrivalTimeAtStop } from "./mtaHelpers";

/**
 * Renders a row for a specific MTA subway service, displaying upcoming train information.
 *
 * @param {object} props - The component props.
 * @param {string} props.originStation - The ID of the station to get upcoming trips for.
 * @param {number} props.arrivalThreshold - The minimum number of minutes away a trip must be to be considered the "next" trip.
 * @param {object} props.rawData - The raw GTFS-RT data for the relevant subway lines.
 * @param {Array<object>} props.alerts - A list of active MTA alerts.
 * @param {string|null} [props.destinationStation=null] - An optional destination station to show arrival times for.
 * @param {boolean} [props.onlyTrainsStoppingAtDestination=false] - If true, only shows trips that stop at the destination station.
 * @param {number} props.currentTime - The current time in Unix epoch seconds, used to calculate arrival times.
 * @returns {React.ReactElement|null} A component that displays the service information, or null if no relevant trips are found.
 */
const MTAServiceRow = ({ originStation, arrivalThreshold, rawData, alerts, destinationStation = null, onlyTrainsStoppingAtDestination = false, transfer = null, currentTime}) => {

  const destinations = destinationStation
    ? (Array.isArray(destinationStation) ? destinationStation : [destinationStation])
    : [];

  const upcomingTrips = processTripUpdatesForStop(rawData, originStation);
  const upcomingTripsInMinutes = convertTripTimesToMinutes(upcomingTrips, currentTime).sort((a, b) => a.arrival - b.arrival);

  const relevantTrips = upcomingTripsInMinutes.filter((trip) =>
    !onlyTrainsStoppingAtDestination || destinations.some(d => trip.stoppingAt.includes(d))
  );

  const etas = relevantTrips.map((trip) => trip.arrival);
  const nextTrip = relevantTrips.find((trip) => trip.arrival > arrivalThreshold);

  let bestDest = null;
  for (const dest of destinations) {
    const trip = relevantTrips.find((t) => t.arrival > arrivalThreshold && t.stoppingAt.includes(dest));
    if (trip) {
      const arrivalTime = getTripArrivalTimeAtStop(rawData, dest, trip.tripId, currentTime);
      if (arrivalTime && (!bestDest || arrivalTime < bestDest.arrivalTime)) {
        bestDest = { dest, trip, arrivalTime };
      }
    }
  }

  let destinationStationRow = null;
  if (bestDest) {
    const isDifferentTrain = nextTrip && bestDest.trip.tripId !== nextTrip.tripId;
    destinationStationRow = <MTADestinationRow route={bestDest.trip.route} arrivalTime={bestDest.arrivalTime} destinationStation={Stops[bestDest.dest]} departureTime={isDifferentTrain ? bestDest.trip.arrival : null} />;
  }

  let transferRow = null;
  if (transfer && bestDest) {
    const rawArrivalAtDest = getRawTripArrivalTimeAtStop(rawData, bestDest.dest, bestDest.trip.tripId);
    const transferTrips = processTripUpdatesForStop(transfer.rawData, transfer.originStation);

    if (rawArrivalAtDest) {
      const nextTransferTrip = transferTrips
        .filter(t => t.arrival.time > (rawArrivalAtDest + (transfer.transferTime || 120)))
        .sort((a, b) => a.arrival.time - b.arrival.time)[0];

      if (nextTransferTrip) {
        const transferArrival = transfer.destinationStation
          ? getTripArrivalTimeAtStop(transfer.rawData, transfer.destinationStation, nextTransferTrip.tripId, currentTime)
          : null;

        transferRow = <MTADestinationRow route={nextTransferTrip.route} arrivalTime={transferArrival} destinationStation={Stops[transfer.destinationStation]} isTransfer />;
      }
    }
  }

  // If there are no upcoming trips that meet the criteria, render nothing.
  if (!nextTrip) {
    return null;
  }
  
  const destinationStopId = nextTrip.stoppingAt[nextTrip.stoppingAt.length - 1];

  return (
    <>
      <MTASubwayBullet route={nextTrip.route} size="lg"/>
      <RouteDescription destination={Stops[destinationStopId]} location={Stops[originStation]} />
      <RouteETA etas={etas} threshold={arrivalThreshold} />
      {destinationStationRow}
      {transferRow}
      {alerts.filter((a) => a.alert.informedEntity[0].routeId === nextTrip.route).map((a) => <AlertRow key={a.id} alert={a} />)}
      {alerts.filter((a) => a.alert.informedEntity[0].stopId === originStation).map((a) => <AlertRow key={a.id} alert={a} />)}
      {destinations.map(d => alerts.filter((a) => a.alert.informedEntity[0].stopId === d).map((a) => <AlertRow key={a.id} alert={a} />))}
    </>
  )
}

export default MTAServiceRow; 