import React from "react";

const RouteDescription = ({ destination, location }) => {
  return (
    <div className="route-description col-span-6 pl-4">
      <span className="route-destination text-[40px]">{destination}</span>
      <span className="route-location text-[20px]">at {location}</span>
    </div>
  )
}

export default RouteDescription;
