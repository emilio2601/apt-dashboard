import React from "react";
import RouteDescription from "../../components/RouteDescription";
import useBayWheelsData from "../../hooks/useBayWheelsData";
import RouteBullet from "../../components/RouteBullet";

const BayWheels = ({station}) => {
  const data = useBayWheelsData(station);

  return station && (
      <>
        <RouteBullet bulletColor="#000000" routeColor="white" routeName="BW" />
        <RouteDescription destination={`${data?.num_bikes_available} regular bikes`} location="Telegraph Av & Shattuck Av" />
        <span className="font-medium col-span-3 items-center">
        </span>
      </>
  )
}

export default BayWheels; 