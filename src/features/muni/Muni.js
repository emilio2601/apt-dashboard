import React, { Fragment } from "react";
import RouteBullet from "../../components/RouteBullet";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import useMuniData from "../../hooks/useMuniData";

const Muni = ({stops, routes}) => {
  const data = useMuniData(stops, routes);

  return data.map((route, idx) => (
    <Fragment key={idx}>
      <RouteBullet bulletColor={`#${route.route.color}`} routeColor={`#${route.route.textColor}`} routeName={route.route.id}/>
      <RouteDescription destination={`${route.route.title.slice(route.route.id.length + 1)} / ${route.values[0].direction.destinationName.slice(route.values[0].direction.name.length + 4)}`} location={route.stop.name} />
      <RouteETA etas={route.values.map((est) => est.minutes)} threshold={5} />      
    </Fragment>
  ))
}

export default Muni; 