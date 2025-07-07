import React from "react";

const RouteDescription = ({ destination, location }) => {
  return (
    <div className="col-span-6 space-x-4 pl-4">
      <span className="text-[40px]">{destination}</span>
      <span className="text-[20px]">at {location}</span>
    </div>
  )
}

export default RouteDescription; 