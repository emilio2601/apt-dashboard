import React from "react";

const MTASubwayBullet = ({ route, size }) => {
  const transformRouteName = () => {
    if (route == "6X" || route == "7X" || route == "FX") {
      return route.replace("X", "d")
    }

    return route?.toLowerCase()
  }

  const getClass = (route, size) => {
    if (size == "sm" && route?.endsWith("X")) {
      return "w-10 h-10"
    } else if (size == "sm") {
      return "w-8 h-8"
    } else if (route?.endsWith("X")) {
      return "w-36 h-36"
    } {
      return "w-32 h-32"
    }
  }

  return (
    <img src={`/svg/${transformRouteName()}.svg`} className={`rounded-full inline px-1 mb-1 ${getClass(route, size)}`}/>
  )
}

export default MTASubwayBullet; 