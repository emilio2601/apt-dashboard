import axios from "axios";

export const fetchBayWheelsData = async (stationId) => {
  const response = await axios.get(`https://gbfs.baywheels.com/gbfs/es/station_status.json`);
  return response.data.data.stations.find(st => st.station_id === stationId);
}; 