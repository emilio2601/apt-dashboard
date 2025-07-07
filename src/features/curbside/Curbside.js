import React from "react";
import RouteDescription from "../../components/RouteDescription";
import useCurbsideData from "../../hooks/useCurbsideData";

const Curbside = () => {
  const { hasMaltball } = useCurbsideData();

  return hasMaltball && (
      <>
        <img src="https://pbs.twimg.com/profile_images/1216872103976136704/y4zak545_400x400.jpg" className="rounded-full self-center w-24"/>
        <RouteDescription destination="Vanilla Maltball" location="Telegraph Av & 49th St" />
        <span className="font-medium col-span-3 items-center">
        </span>
      </>
  )
}

export default Curbside; 