import { useState, useEffect } from 'react';
import { fetchBayWheelsData } from '../services/bayWheelsApi';

const useBayWheelsData = (station) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!station) return;

    const fetchData = async () => {
      const result = await fetchBayWheelsData(station);
      setData(result || {});
    };

    const id = setInterval(fetchData, 600_000);
    fetchData();

    return () => clearInterval(id);
  }, [station]);

  return data;
};

export default useBayWheelsData; 