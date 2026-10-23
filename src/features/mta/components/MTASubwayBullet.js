import React from "react";

const MTASubwayBullet = ({ route, size }) => {
  const iconName = ["6X", "7X", "FX"].includes(route)
    ? route.replace("X", "d")
    : route?.toLowerCase();

  return (
    <img
      src={`/svg/${iconName}.svg`}
      alt={route?.endsWith("X") ? `${route.slice(0, -1)} express` : route}
      className={`subway-bullet ${size === "sm" ? "subway-bullet-small" : "subway-bullet-large"}`}
    />
  );
};

export default MTASubwayBullet;
