import React from "react";
import MTAServiceRow from "./MTAServiceRow";
import useMtaSubwayData from "../../hooks/useMtaSubwayData";

const MTASubway = () => {
  const { alerts, l, irt, nqrw, bdfm, currentTime } = useMtaSubwayData(['l', 'irt', 'nqrw', 'bdfm']);

  return  <>
    <MTAServiceRow originStation="L06N" arrivalThreshold={6} rawData={l} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="L06S" arrivalThreshold={6} rawData={l} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="636N" arrivalThreshold={8} rawData={irt} alerts={alerts} destinationStation="630N" currentTime={currentTime} />
    <MTAServiceRow originStation="R21N" arrivalThreshold={10} rawData={nqrw} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="F14N" arrivalThreshold={10} rawData={bdfm} alerts={alerts} currentTime={currentTime} />
  </>
}

export default MTASubway;
