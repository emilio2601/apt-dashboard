import React from "react";
import MTAServiceRow from "./MTAServiceRow";
import useMtaSubwayData from "../../hooks/useMtaSubwayData";

const MTASubway = () => {
  const { alerts, l, irt, nqrw, bdfm, currentTime } = useMtaSubwayData(['l', 'irt', 'nqrw', 'bdfm']);

  return  <>
    <MTAServiceRow originStation="L06N" arrivalThreshold={6} rawData={l} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="636N" arrivalThreshold={8} rawData={irt} alerts={alerts} destinationStation="631N" currentTime={currentTime} />
    <MTAServiceRow originStation="636S" arrivalThreshold={8} rawData={irt} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="R21S" arrivalThreshold={10} rawData={nqrw} alerts={alerts} destinationStation="R32S" currentTime={currentTime} />
    <MTAServiceRow originStation="R21N" arrivalThreshold={10} rawData={nqrw} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="R20S" arrivalThreshold={11} rawData={nqrw} alerts={alerts} destinationStation="D25S" onlyTrainsStoppingAtDestination currentTime={currentTime} />
    <MTAServiceRow originStation="F14S" arrivalThreshold={10} rawData={bdfm} alerts={alerts} currentTime={currentTime} />
  </>
}

export default MTASubway; 