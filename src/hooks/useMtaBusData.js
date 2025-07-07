import { useState, useEffect } from 'react';
import { fetchMtaBusData } from '../services/mtaApi';

const useMtaBusData = (busStopId, busLineRef) => {
  const [data, setData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000);

  useEffect(() => {
    const fetchData = async () => {
      if (busStopId && busLineRef) {
        const result = await fetchMtaBusData(busStopId, busLineRef);
        setData(result);
      }
    };

    const fetchDataInterval = setInterval(fetchData, 60_000);
    fetchData();

    const updateCurrentTime = () => setCurrentTime(new Date().getTime() / 1000);
    const timeInterval = setInterval(updateCurrentTime, 1_000);

    return () => {
      clearInterval(fetchDataInterval);
      clearInterval(timeInterval);
    };
  }, [busStopId, busLineRef]);

  const times = data.map(t => Math.round((t - currentTime) / 60)).filter(time => time >= 0).slice(0, 4);

  return times;
};

export default useMtaBusData; 