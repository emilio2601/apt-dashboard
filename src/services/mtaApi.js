import axios from "axios";
import { getDecodedData } from "../features/mta/mtaHelpers";

const MTA_GTFS_FEEDS = {
  'l': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
  'bdfm': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
  'nqrw': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
  'irt': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
  'ace': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
  'g': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
  'jz': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
  'sir': "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si",
};

const ALERTS_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts";

export const fetchMtaSubwayData = async (feeds = []) => {
  const urlsToFetch = feeds.map(feed => MTA_GTFS_FEEDS[feed]).filter(Boolean);
  const decodedData = await Promise.all(urlsToFetch.map(getDecodedData));
  
  const result = {};
  feeds.forEach((feed, index) => {
    result[feed] = decodedData[index];
  });
  
  return result;
};

export const fetchMtaAlerts = async () => {
  return await getDecodedData(ALERTS_URL);
};

export const fetchMtaBusData = async (busStopId, busLineRef) => {
    const monitoringRef = `MTA_${busStopId}`;
    const lineRef = `MTA NYCT_${busLineRef}`;

    // Build URL with proper encoding and without template string interpolation
    const baseUrl = "https://bustime.mta.info/api/2/siri/stop-monitoring.json";
    const url = new URL(baseUrl);
    const apiKey = process.env.REACT_APP_MTA_BUS_API_KEY || "";
    url.searchParams.set("key", apiKey);
    url.searchParams.set("OperatorRef", "MTA NYCT");
    url.searchParams.set("MonitoringRef", monitoringRef);
    url.searchParams.set("LineRef", lineRef);

    const response = await axios.get("https://api.allorigins.win/get", {
        params: { url: url.toString() }
    });

    if (response.data.contents) {
        const busData = JSON.parse(response.data.contents);
        const stops = busData.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
        return stops.map(s => new Date(s.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).getTime() / 1000);
    }
    return [];
}; 