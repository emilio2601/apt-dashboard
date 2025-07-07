import { useState, useEffect } from 'react';
import { fetchAcTransitData } from '../services/acTransitApi';

const useAcTransitData = (stops) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchAcTransitData(stops);
      setData(result);
    };

    const id = setInterval(fetchData, 60_000);
    fetchData();

    return () => clearInterval(id);
  }, [stops]);

  return data;
};

export default useAcTransitData; 