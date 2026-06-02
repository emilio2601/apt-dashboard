import React from "react";
import MTASubwayBullet from "./components/MTASubwayBullet";


const MTADestinationRow = ({ route, arrivalTime, destinationStation, isTransfer = false, departureTime = null }) => {
  return (
    <>
      <div className="col-span-1"></div>
      <div className="col-span-9 space-x-4 pl-4 text-2xl">
        {!!arrivalTime && (isTransfer
          ? <span>Transfer to the <MTASubwayBullet route={route} size="sm"/> and arrive at <span className="font-semibold">{destinationStation}</span> in <span className="text-green font-bold">{arrivalTime}</span> mins</span>
          : departureTime
            ? <span>The next <MTASubwayBullet route={route} size="sm"/> departs in <span className="text-green font-bold">{departureTime}</span> mins and arrives at <span className="font-semibold">{destinationStation}</span> in <span className="text-green font-bold">{arrivalTime}</span> mins</span>
            : <span>The next <MTASubwayBullet route={route} size="sm"/> arrives at <span className="font-semibold">{destinationStation}</span> in <span className="text-green font-bold">{arrivalTime}</span> mins</span>
        )}
      </div>
    </>
  )
}

export default MTADestinationRow; 