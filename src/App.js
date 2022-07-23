import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";


const ACTransit = ({stops}) => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    const token = "AB9BD2A779420B5ECAF4172AFCAC6C58"

    const newData = await stops.reduce(async (acc, stopId) => {
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
    const id = setInterval(fetchData, 60_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  const routeColors = {
    "6": "bg-[#006db8]",
    "18": "bg-[#8d6539]",
    "800": "bg-[#b8cf2e]",
  }

  return Object.values(data).map((prds, idx) => (
    <Fragment key={idx}>
      <div className={`rounded-full w-40 text-center ${routeColors[prds[0].rt]}`}>
        <span className="text-white text-[60px]">{prds[0].rt}</span>
      </div>

      <div className="col-span-6 space-x-4 pl-4">
        <span>{prds[0].rtdir.substring(3)}</span>
        <span className="text-[16px]">at {prds[0].stpnm}</span>
      </div>

      <span className="font-medium col-span-3">
        {prds.map((prd, idx) => <span key={idx} className={prd.prdctdn > 7 ? "text-green" : "text-red"}>{prd.prdctdn}{idx === prds.length - 1 ? "" : ", "}</span>)}
        <span className="float-right text-[40px]">min</span>
      </span>
    </Fragment>
  ))
}

const BART = ({stationCode, stationName, destinations}) => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    const res = await axios.get(`https://api.bart.gov/api/etd.aspx?cmd=etd&orig=${stationCode}&key=MW9S-E7SL-26DU-VV8V&json=y`)

    console.log(res.data.root.station[0].etd)
    setData(res.data.root.station[0].etd.filter(etd => destinations.includes(etd.abbreviation)))
  }

  useEffect(() => {
    const id = setInterval(fetchData, 60_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  
  return data.map((route, idx) => (
    <Fragment key={idx}>
      <div className={`rounded-full w-40 h-24`} style={{backgroundColor: route.estimate[0].hexcolor}}></div>
      <div className="col-span-6 space-x-4 pl-4">
        <span>{route.destination}</span>
        <span className="text-[16px]">at {stationName} BART</span>
      </div>
      <span className="font-medium col-span-3 items-center">
        {route.estimate.map((est, idx) => <span key={idx} className={est.minutes > 12 ? "text-green" : "text-red"}>{est.minutes}{idx === route.estimate.length - 1 ? "" : ", "}</span>)}
        <span className="float-right text-[40px]">min</span>
      </span>
      
    </Fragment>
  ))
}

const Muni = ({stops, routes}) => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    const aggregated = await stops.reduce(async (acc, stop) => {
      const res = await axios.get(`https://webservices.umoiq.com/api/pub/v1/agencies/sf-muni/stopcodes/${stop}/predictions?key=0be8ebd0284ce712a63f29dcaf7798c4`)
      const filteredRoutes = res.data.filter((route) => route.values.length > 0 && routes.includes(route.route.id))
      return [...await acc, ...filteredRoutes]
    }, [])

    setData(aggregated)
    console.log(aggregated)
  }

  useEffect(() => {
    const id = setInterval(fetchData, 60_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  

  return data.map((route, idx) => (
    <Fragment key={idx}>
      <div className="rounded-full w-40 h-24 text-center" style={{backgroundColor: `#${route.route.color}`}}>
        <span className="text-[60px]" style={{color: `#${route.route.textColor}`}}>{route.route.id}</span>
      </div>
      <div className="col-span-6 space-x-4 pl-4">
        <span>{route.route.title.slice(route.route.id.length + 1)} / {route.values[0].direction.destinationName.slice(route.values[0].direction.name.length + 4)}</span>
        <span className="text-[16px]">at {route.stop.name}</span>
      </div>
      <span className="font-medium col-span-3 items-center">
        {route.values.map((est, idx) => <span key={idx} className={est.minutes > 3 ? "text-green" : "text-red"}>{est.minutes}{idx === route.values.length - 1 ? "" : ", "}</span>)}
        <span className="float-right text-[40px]">min</span>
      </span>
      
    </Fragment>
  ))
}


const App = () => {
  const [selection, setSelection] = useState("home")
  
  const settings = {
    "home": {
      bart: {
        stationCode: "MCAR",
        stationName: "MacArthur",
        destinations: ["SFIA", "DALY"]
      },
      ac: [55989, 52935, 55898],
      muni: [],
    },
    "work": {
      bart: {
        stationCode: "16TH",
        stationName: "16th Street/Mission",
        destinations: ["ANTC", "RICH"]
      },
      muni: {
        stops: [15551, 15552, 13293, 13291, 13292],
        routes: ["14", "14R", "49"]
      },
      ac: []
    }
  }

  return (
    <div className="px-16 pt-8 text-[40px] grid grid-cols-10 gap-x-16 gap-y-16 items-center">
      <BART {...settings[selection].bart} />
      <ACTransit stops={settings[selection].ac} />
      <Muni {...settings[selection].muni} />
    </div>
  );
}

export default App;
