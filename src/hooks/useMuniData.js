import { useState, useEffect } from 'react';
import { fetchMuniData } from '../services/muniApi';

const useMuniData = (stops, routes) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchMuniData(stops, routes);
      setData(result);
    };

    const id = setInterval(fetchData, 60_000);
    fetchData();

    return () => clearInterval(id);
  }, [stops, routes]);

  return data;
};

export default useMuniData; 