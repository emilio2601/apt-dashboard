import React from "react";
import MTASubwayBullet from "./MTASubwayBullet";

const AlertRow = ({ alert }) => {
  const engText = alert.alert.headerText?.translation?.find((t) => t.language == "en")?.text?.replace(/\n/g, ". ")
  
  // find line names in brackets and replace for line icon
  // e.g [F] to <img src="https://api.mta.info/lineIcons/F.svg" className="rounded-full w-10 inline px-1 mb-1"/>

  const separateText = engText?.split(/\[(.*?)\]/g)

  const replacedText = separateText?.map((t) => {
    if (t.length == 1 || t.length == 2) { 
      return <MTASubwayBullet route={t} size="sm" />
    } else {
      return t
    }
  })

  const alertStart = new Date(alert.alert.activePeriod[0].start * 1000)
  const alertSecondsAgo = Math.round((new Date().getTime() - alertStart.getTime()) / 1000)
  const alertMinutesAgo = Math.round(alertSecondsAgo / 60)
  const showAlert = alertMinutesAgo < 800

  return showAlert && (
    <>
      <div className="col-span-1"/>
      <div className="col-span-8 flex flex-row gap-4 items-center p-4 ml-4 border-yellow bg-yellow-100 rounded-xl ">
        <span className="text-xl rounded-full font-medium text-white text-center w-8 h-8">⚠️</span>
        <span className="font-semibold text-xl text-yellow-800">{replacedText} ({alertMinutesAgo} minutes ago)</span>
      </div>
      <div className="col-span-1"/>
    </>
  )
}

export default AlertRow; 