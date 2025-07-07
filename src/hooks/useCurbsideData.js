import { useState, useEffect } from 'react';
import { fetchCurbsideData } from '../services/curbsideApi';

const useCurbsideData = () => {
  const [flavors, setFlavors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCurbsideData();
      setFlavors(result);
    };

    const id = setInterval(fetchData, 600_000);
    fetchData();

    return () => clearInterval(id);
  }, []);

  const hasMaltball = flavors.some(f => f.toLowerCase().includes("malt") && !f.toLowerCase().includes("cookie"));

  return { flavors, hasMaltball };
};

export default useCurbsideData; 