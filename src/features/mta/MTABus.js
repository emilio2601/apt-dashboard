import React from "react";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import RouteBullet from "../../components/RouteBullet";
import useMtaBusData from "../../hooks/useMtaBusData";


const MTABus = () => {
  const times = useMtaBusData('401557', 'M8');

  return  <>
    <RouteBullet bulletColor="#1d59b3" routeColor="white" routeName="M8"/>
    <RouteDescription destination="West Village" location="E 9th St & 2nd Ave" />
    <RouteETA etas={times} threshold={4} />
  </>
}

export default MTABus; 