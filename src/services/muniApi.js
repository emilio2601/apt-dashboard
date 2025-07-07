import axios from "axios";

const getPredictionsForStop = async (stop, routes) => {
  const response = await axios.get(`https://webservices.umoiq.com/api/pub/v1/agencies/sf-muni/stopcodes/${stop}/predictions?key=${process.env.REACT_APP_MUNI_API_KEY}`);
  return response.data.filter(route => route.values.length > 0 && routes.includes(route.route.id));
};

export const fetchMuniData = async (stops, routes) => {
  if (!stops || stops.length === 0) {
    return [];
  }
  const predictions = await Promise.all(stops.map(stop => getPredictionsForStop(stop, routes)));
  return predictions.flat();
}; 