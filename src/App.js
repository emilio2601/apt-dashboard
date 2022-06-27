import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    const stopIds = [55989, 52935]
    const token = "AB9BD2A779420B5ECAF4172AFCAC6C58"

    const newData = await stopIds.reduce(async (acc, stopId) => {
      const data = await axios.get("https://api.actransit.org/transit/actrealtime/prediction", {params: {stpid: stopId, token: token}})
      return [...await acc, ...data.data['bustime-response'].prd || []]
    }, [])

    const byRoute = {}

    newData.forEach(trip => {
      const key = `${trip.rt}-${trip.rtdir}`
      const base = byRoute[key] || []
      byRoute[key] = [...base, trip]
    })

    console.log(byRoute)

    setData(byRoute)
  }

  useEffect(() => {
    fetchData()
  }, [])


  return (
    <div className="p-16 space-y-2 text-[72px] grid grid-cols-4 gap-x-4 items-center">
      {Object.values(data).map((prds, idx) => (
        <Fragment key={idx}>
        <div className="col-span-3 space-x-8">
          <span className="rounded-full bg-[#6BBF4B] text-white px-4 py-2 w-max">{prds[0].rt}</span>
          <span className="">{prds[0].rtdir.substring(3)}</span>
        </div>
        <span className="font-medium">{prds.map((prd, idx) => <span className={prd.prdctdn > 7 ? "text-green" : "text-red"}>{prd.prdctdn}{idx === prds.length - 1 ? "" : ", "}</span>)} min</span>
        </Fragment>
      ))}
    </div>
  );
}

export default App;
