import React, { Fragment } from "react";
import RouteBullet from "../../components/RouteBullet";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import useBartData from "../../hooks/useBartData";


const BART = ({stationCode, stationName, destinations}) => {
  const data = useBartData(stationCode, destinations);
  
  return data.map((route, idx) => (
    <Fragment key={idx}>
      <RouteBullet bulletColor={route.estimate[0].hexcolor} />
      <RouteDescription destination={route.destination} location={`${stationName} BART`} />
      <RouteETA etas={route.estimate.map((est) => est.minutes)} threshold={12} />
    </Fragment>
  ))
}

export default BART; 