import axios from "axios";

const getPredictions = async (stopId) => {
  const token = process.env.REACT_APP_AC_TRANSIT_TOKEN;
  const response = await axios.get("https://api.actransit.org/transit/actrealtime/prediction", {
    params: { stpid: stopId, token: token }
  });
  const predictions = response.data['bustime-response'].prd || [];
  return predictions.filter(p => !isNaN(parseInt(p.prdctdn)));
};

export const fetchAcTransitData = async (stops) => {
  const predictions = await Promise.all(stops.map(stopId => getPredictions(stopId)));
  const flattenedPredictions = predictions.flat();

  const byRoute = {};
  flattenedPredictions.forEach(trip => {
    const key = `${trip.rt}-${trip.rtdir}`;
    const base = byRoute[key] || [];
    byRoute[key] = [...base, trip];
  });

  return Object.values(byRoute);
}; 