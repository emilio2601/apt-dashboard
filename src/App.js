import React, { useState, useEffect } from "react";
import { settings } from "./config/settings";

import MTASubway from "./features/mta/MTASubway";
import MTABus from "./features/mta/MTABus";
import Curbside from "./features/curbside/Curbside";
import BART from "./features/bart/BART";
import ACTransit from "./features/acTransit/ACTransit";
import Muni from "./features/muni/Muni";
import BayWheels from "./features/bayWheels/BayWheels";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selection, setSelection] = useState("home"); // Or "work"

  const checkDarkMode = () => {
    const date = new Date();
    setIsDarkMode(date.getHours() < 6 || date.getHours() > 20);
  };

  useEffect(() => {
    const id = setInterval(checkDarkMode, 600_000);
    checkDarkMode();
    return () => clearInterval(id);
  }, []);

  // Basic location selection logic, can be expanded later
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'h') setSelection('home');
      if (e.key === 'w') setSelection('work');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const currentSettings = settings[selection];

  return (
    <div className={`px-16 pt-12 pb-64 grid grid-cols-10 gap-x-16 gap-y-4 items-center ${isDarkMode ? "bg-gray-900 text-white" : ""}`}>
      {/* {currentSettings.bart && <BART {...currentSettings.bart} />}
      {currentSettings.ac.length > 0 && <ACTransit stops={currentSettings.ac} />}
      {currentSettings.muni.length > 0 && <Muni stops={currentSettings.muni} />}
      {currentSettings.curbside && <Curbside />}
      {currentSettings.baywheels && <BayWheels station={currentSettings.baywheels} />} */}
      <MTABus />
      <MTASubway />
    </div>
  );
}

export default App;
