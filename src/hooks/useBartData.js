import { useState, useEffect } from 'react';
import { fetchBartData } from '../services/bartApi';

const useBartData = (stationCode, destinations) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchBartData(stationCode, destinations);
      setData(result);
    };

    const id = setInterval(fetchData, 60_000);
    fetchData();

    return () => clearInterval(id);
  }, [stationCode, destinations]);

  return data;
};

export default useBartData; 