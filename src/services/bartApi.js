import axios from "axios";

export const fetchBartData = async (stationCode, destinations) => {
  const response = await axios.get(`https://api.bart.gov/api/etd.aspx?cmd=etd&orig=${stationCode}&key=${process.env.REACT_APP_BART_API_KEY}&json=y`);
  const allRoutes = response.data.root.station[0].etd || [];
  
  const relevantRoutes = allRoutes
    .filter(etd => destinations.includes(etd.abbreviation))
    .map(route => ({
      ...route,
      estimate: route.estimate.filter(est => !isNaN(parseInt(est.minutes))),
    }))
    .filter(route => route.estimate.length > 0);
    
  return relevantRoutes;
}; 