import React, { Fragment, useState, useEffect } from "react";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
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
    "6": "#006db8",
    "18": "#8d6539",
    "800": "#b8cf2e",
  }

  return Object.values(data).map((prds, idx) => (
    <Fragment key={idx}>
      <RouteBullet bulletColor={routeColors[prds[0].rt]} routeColor="white" routeName={prds[0].rt}/>
      <RouteDescription destination={prds[0].rtdir.substring(3)} location={prds[0].stpnm} />
      <RouteETA etas={prds.map((est) => est.prdctdn)} threshold={7} />
    </Fragment>
  ))
}

const BART = ({stationCode, stationName, destinations}) => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    const res = await axios.get(`https://api.bart.gov/api/etd.aspx?cmd=etd&orig=${stationCode}&key=MW9S-E7SL-26DU-VV8V&json=y`)

    console.log(res.data.root.station[0].etd)
    setData(res.data.root.station[0].etd?.filter(etd => destinations.includes(etd.abbreviation)) || [])
  }

  useEffect(() => {
    const id = setInterval(fetchData, 60_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  
  return data.map((route, idx) => (
    <Fragment key={idx}>
      <RouteBullet bulletColor={route.estimate[0].hexcolor} />
      <RouteDescription destination={route.destination} location={`${stationName} BART`} />
      <RouteETA etas={route.estimate.map((est) => est.minutes)} threshold={12} />
    </Fragment>
  ))
}

const RouteBullet = ({ bulletColor, routeColor, routeName }) => {
  return (
    <div className="rounded-full w-32 h-20 text-center" style={{backgroundColor: bulletColor}}>
      <span className="text-[48px]" style={{color: routeColor}}>{routeName}</span>
    </div>
  )
}

const MTABusBullet = ({ routeName, customClass }) => {
  return (
    <div className={`rounded-full text-center bg-[#1d59b3] ${customClass}`}>
      <span className="text-[20px] font-bold text-white my-auto mx-auto">{routeName}</span>
    </div>
  )
}

const RouteDescription = ({ destination, location }) => {
  return (
    <div className="col-span-6 space-x-4 pl-4">
      <span className="text-[40px]">{destination}</span>
      <span className="text-[20px]">at {location}</span>
    </div>
  )
}

const RouteETA = ({ etas, threshold }) => {
  return (
    <span className="font-medium col-span-3 items-center text-[40px]">
      {etas.map((est, idx) => <span key={idx} className={est > threshold ? "text-green" : "text-red"}>{est}{idx === etas.length - 1 ? "" : ", "}</span>)}
      <span className="float-right">min</span>
    </span>
  )
}

const Muni = ({stops, routes}) => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    if (!stops) {
      return []
    }
    
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
      <RouteBullet bulletColor={`#${route.route.color}`} routeColor={`#${route.route.textColor}`} routeName={route.route.id}/>
      <RouteDescription destination={`${route.route.title.slice(route.route.id.length + 1)} / ${route.values[0].direction.destinationName.slice(route.values[0].direction.name.length + 4)}`} location={route.stop.name} />
      <RouteETA etas={route.values.map((est) => est.minutes)} threshold={5} />      
    </Fragment>
  ))
}

const BayWheels = ({station}) => {
  const [data, setData] = useState({})

  const fetchData = async () => {
    const res = await axios.get(`https://gbfs.baywheels.com/gbfs/es/station_status.json`)
    setData(res.data.data.stations.filter((st) => st.station_id == station)[0])
  }

  useEffect(() => {
    const id = setInterval(fetchData, 600_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  return station && (
      <>
        <img src="https://pbs.twimg.com/profile_images/1460855608567992321/dOlFd5Pj_400x400.jpg" className="rounded-full border"/>
        <RouteDescription destination={`${data?.num_bikes_available} regular bikes`} location="Telegraph Av & Shattuck Av" />
        <span className="font-medium col-span-3 items-center">
        </span>
      </>
  )
}

const Curbside = () => {
  const [data, setData] = useState([])

  const hasMaltball = data.filter((f) => f.toLowerCase().includes("malt")).length > 0

  const fetchData = async () => {
    const res = await axios.get("http://ep.wefunder.ai:12345/")
    const el = document.createElement("html")
    el.innerHTML = res.data
    const scoopsElement = Array.from(el.getElementsByTagName("h2")).filter((e) => e.textContent == "Scoops")[0]
    const flavors = Array.from(scoopsElement.nextSibling.children).map((e) => e.children[0].textContent)
    setData(flavors)
  }

  useEffect(() => {
    const id = setInterval(fetchData, 600_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  return hasMaltball && (
      <>
        <img src="https://pbs.twimg.com/profile_images/1216872103976136704/y4zak545_400x400.jpg" className="rounded-full self-center w-24"/>
        <RouteDescription destination="Vanilla Maltball" location="Telegraph Av & 49th St" />
        <span className="font-medium col-span-3 items-center">
        </span>
      </>
  )
}

const MTASubway = () => {
  const [data, setData] = useState({manhStops: [], brooklynStops: []})
  const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000)

  const fetchData = async () => {
    const res = await axios.get("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l", {headers: {"x-api-key": "tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD"}, responseType: "arraybuffer"})
    const decoded = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(res.data)
    );
    console.log(decoded)

    const manhStops = decoded.entity.map((e) => e.tripUpdate?.stopTimeUpdate?.filter((s) => s.stopId == "L06N")[0]?.arrival?.time).filter(Boolean).sort()
    const brooklynStops = decoded.entity.map((e) => e.tripUpdate?.stopTimeUpdate?.filter((s) => s.stopId == "L06S")[0]?.arrival?.time).filter(Boolean).sort()
    setData({manhStops: manhStops, brooklynStops: brooklynStops})
  }

  const manhTimes = data.manhStops.map((t) => Math.round((t - currentTime) / 60)).filter((x) => x > 0).slice(0, 6)
  const brooklynTimes = data.brooklynStops.map((t) => Math.round((t - currentTime) / 60)).filter((x) => x > 0).slice(0, 6)

  const updateCurrentTime = () => {
    setCurrentTime(new Date().getTime() / 1000)
  }


  useEffect(() => {
    const id = setInterval(fetchData, 600_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(updateCurrentTime, 1_000)
    updateCurrentTime()
    return () => clearInterval(id)
  }, [])


  return  <>
    <img src="https://api.mta.info/lineIcons/L.svg" className="rounded-full w-24"/>
    <RouteDescription destination="8 Av" location="1 Av" />
    <RouteETA etas={manhTimes} threshold={9} />
    <div className="col-span-1"/>
    <div className="col-span-9 space-x-4 pl-4 text-2xl">
      <span>The next <span className="font-semibold">8 Av</span>-bound <img src="https://api.mta.info/lineIcons/L.svg" className="rounded-full w-10 inline px-1"/> arrives at <span className="font-semibold">14 St—Union Sq</span> in <span className="text-green font-bold">{manhTimes.filter((t) => t > 9)[0] + 2}</span> mins</span>
    </div>
    <img src="https://api.mta.info/lineIcons/L.svg" className="rounded-full w-24"/>
    <RouteDescription destination="Canarsie—Rockaway Pkwy" location="1 Av" />
    <RouteETA etas={brooklynTimes} threshold={8} />  
  </>
}

const MTABus = () => {
  const [data, setData] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000)

  const fetchData = async () => {
    const res = await axios.get("http://localhost:8008/")
    const stops = res.data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit

    const times = stops.map((s) => new Date(s.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).getTime() / 1000)
    setData(times)
  }
  
  const updateCurrentTime = () => {
    setCurrentTime(new Date().getTime() / 1000)
  }

  const times = data.map((t) => Math.round((t - currentTime) / 60)).filter(Boolean).slice(0, 4)

  useEffect(() => {
    const id = setInterval(fetchData, 600_000)
    fetchData()
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(updateCurrentTime, 1_000)
    updateCurrentTime()
    return () => clearInterval(id)
  }, [])

  return  <>
    <MTABusBullet routeName="M14D-SBS" customClass="flex w-32 h-12 mx-auto my-auto"/>
    <RouteDescription destination="11 Av via 14 St" location="E 11th St & Av C" />
    <RouteETA etas={times} threshold={4} />
    <div className="col-span-1"/>
    <div className="col-span-6 space-x-4 pl-4 text-lg">
      <span>The next <span className="font-semibold">11 Av</span>-bound <MTABusBullet routeName="M14D-SBS" customClass="p-2 inline mx-1"/> arrives at <span className="font-semibold">14 St—Union Sq</span> in <span className="text-green font-bold">{times.filter((t) => t > 4)[0] + 11}</span> mins</span>
    </div>
  </>
}


const App = () => {
  const [selection, setSelection] = useState("home")
  
  const settings = {
    "home": {
      bart: {
        stationCode: "MCAR",
        stationName: "MacArthur",
        destinations: ["SFIA", "DALY", "MLBR"]
      },
      ac: [55989, 52935, 55898],
      muni: [],
      baywheels: "c3f56bed-65e3-425b-999e-82b3a4f73aeb",
      curbside: true,
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
      ac: [],
    }
  }

  return (
    <div className="px-16 pt-8 grid grid-cols-10 gap-x-16 gap-y-12 items-center">
      {/* <BART {...settings[selection].bart} />
      <ACTransit stops={settings[selection].ac} />
      <Muni {...settings[selection].muni} />
      <BayWheels station={settings[selection].baywheels}/>
      {settings[selection].curbside && <Curbside />} */}
      <MTASubway />
      {/* <MTABus /> */}
    </div>
  );
}

export default App;
