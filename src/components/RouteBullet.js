import React from "react";

const RouteBullet = ({ bulletColor, routeColor, routeName }) => {
  return (
    <div className="rounded-full w-32 h-20 text-center" style={{backgroundColor: bulletColor}}>
      <span className="text-[48px]" style={{color: routeColor}}>{routeName}</span>
    </div>
  )
}

export default RouteBullet; 