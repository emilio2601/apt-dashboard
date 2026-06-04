import React from "react";

export const ETA_DISPLAY_LIMIT = 5;

const RouteETA = ({ etas, threshold }) => {
  const capped = etas.slice(0, ETA_DISPLAY_LIMIT)

  return (
    <span className="font-medium col-span-3 items-center text-[40px]">
      {capped.map((est, idx) => <span key={idx} className={est > threshold ? "text-green" : "text-red"}>{est}{idx === capped.length - 1 ? "" : ", "}</span>)}
      <span className="float-right">min</span>
    </span>
  )
}

export default RouteETA; 