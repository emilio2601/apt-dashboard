import React from "react";
import MTAServiceRow from "./MTAServiceRow";
import useMtaSubwayData from "../../hooks/useMtaSubwayData";

const MTASubway = () => {
  const { alerts, l, irt, nqrw, bdfm, ace, currentTime } = useMtaSubwayData(['l', 'irt', 'nqrw', 'bdfm', 'ace']);

  const efToQueens = { entity: [...bdfm.entity, ...ace.entity] };

  return  <>
    <MTAServiceRow originStation="L06N" arrivalThreshold={6} rawData={l} alerts={alerts} currentTime={currentTime} />
    <MTAServiceRow originStation="636N" arrivalThreshold={8} rawData={irt} alerts={alerts} destinationStation="630N" transfer={{ rawData: efToQueens, originStation: "F11N", destinationStation: "F09N", transferTime: 120 }} currentTime={currentTime} />
    <MTAServiceRow originStation="R21N" arrivalThreshold={10} rawData={nqrw} alerts={alerts} destinationStation={["R09N", "G21N"]} currentTime={currentTime} />
    <MTAServiceRow originStation="R20N" arrivalThreshold={11} rawData={nqrw} alerts={alerts} destinationStation={["R09N", "G21N"]} currentTime={currentTime} />
    <MTAServiceRow originStation="F14N" arrivalThreshold={10} rawData={bdfm} alerts={alerts} currentTime={currentTime} />
  </>
}

export default MTASubway; 