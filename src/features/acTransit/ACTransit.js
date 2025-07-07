import React, { Fragment } from "react";
import RouteBullet from "../../components/RouteBullet";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import useAcTransitData from "../../hooks/useAcTransitData";

const ACTransit = ({stops}) => {
  const data = useAcTransitData(stops);

  const routeColors = {
    "6": "#006db8",
    "18": "#8d6539",
    "800": "#b8cf2e",
  }

  return data.map((prds, idx) => (
    <Fragment key={idx}>
      <RouteBullet bulletColor={routeColors[prds[0].rt]} routeColor="white" routeName={prds[0].rt}/>
      <RouteDescription destination={prds[0].rtdir.substring(3)} location={prds[0].stpnm} />
      <RouteETA etas={prds.map((est) => est.prdctdn)} threshold={7} />
    </Fragment>
  ))
}

export default ACTransit; 