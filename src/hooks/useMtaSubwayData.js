import { useState, useEffect, useCallback } from 'react';
import { fetchMtaSubwayData, fetchMtaAlerts } from '../services/mtaApi';
import { processMtaAlerts } from '../features/mta/mtaHelpers';

const useMtaSubwayData = (feeds = []) => {
  const [data, setData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000);

  const feedsString = JSON.stringify(feeds);

  const fetchDataAndAlerts = useCallback(async () => {
    const currentFeeds = JSON.parse(feedsString);
    const promises = [fetchMtaAlerts()];
    if (currentFeeds && currentFeeds.length > 0) {
      promises.push(fetchMtaSubwayData(currentFeeds));
    }

    const [alertsDecoded, feedData] = await Promise.all(promises);

    if (feedData) {
      setData(feedData);
    } else {
      setData({});
    }
    
    setAlerts(processMtaAlerts(alertsDecoded));
  }, [feedsString]);

  useEffect(() => {
    fetchDataAndAlerts();
    const interval = setInterval(fetchDataAndAlerts, 60_000);
    return () => clearInterval(interval);
  }, [fetchDataAndAlerts]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().getTime() / 1000)
    }, 1_000);
    return () => clearInterval(timeInterval);
  }, []);

  const returnData = {};
  for (const feed of feeds) {
      returnData[feed] = data[feed] || { entity: [] };
  }
  
  return { ...returnData, alerts, currentTime };
};

export default useMtaSubwayData; 