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
  const [alerts, setAlerts] = useState([]);
  const [rawData, setRawData] = useState({entity: []});
  const [rawIRTData, setRawIRTData] = useState({entity: []});
  const [data, setData] = useState({lStops: [], fStops: [], irtNorthStops: [], irtSouthStops: []})
  const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000)

  const processData = (data, stop) => {
    const tripUpdates = data.entity.map((e) => e.tripUpdate).filter(Boolean);
    const dataForStop = tripUpdates.map((u) => {
      const stopTimeUpdatesForStop = u.stopTimeUpdate.filter((s) => s.stopId == stop);

      if (stopTimeUpdatesForStop.length > 0) {
        const stu = stopTimeUpdatesForStop[0];
        return {
          arrival: stu.arrival,
          departure: stu.departure,
          tripId: u.trip.tripId,
          route: u.trip.routeId
        }
      }
    }).filter(Boolean);

    return dataForStop;
  }

  const getStopArrivalTimeForTrip = (data, stop, tripId, currentTime) => {
    const dataForStop = processData(data, stop);
    const arrivalTime = dataForStop.filter((d) => d.tripId == tripId)[0]?.arrival?.time;
    return [arrivalTime, Math.round((arrivalTime - currentTime) / 60)];
  }

  const transformUnixToMinutes = (tripUpdates, currentTime) => {
    const times = tripUpdates.map((t) => ({
      arrival: Math.round((t.arrival.time - currentTime) / 60),
      tripId: t.tripId
    }))

    const filteredTimes = times.filter((t) => t.arrival > 0)

    return filteredTimes
  }

  const getFirstTrainToDest = (data, candidateTrips, dest) => {
    const tripsArrivingAtDest = processData(data, dest).filter((t) => candidateTrips.includes(t.tripId))
    const byArrivalTime = tripsArrivingAtDest.sort((a, b) => a.arrival.time - b.arrival.time)
    return byArrivalTime[0]
  }


  const fetchData = async () => {
    const res = await axios.get("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l", {headers: {"x-api-key": "tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD"}, responseType: "arraybuffer"})
    const decoded = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(res.data)
    );

    const fRes = await axios.get("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm", {headers: {"x-api-key": "tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD"}, responseType: "arraybuffer"})
    const fDecoded = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(fRes.data)
    );

    const irtRes = await axios.get("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs", {headers: {"x-api-key": "tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD"}, responseType: "arraybuffer"})
    const irtDecoded = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(irtRes.data)
    );

    const alertsRes = await axios.get("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts", {headers: {"x-api-key": "tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD"}, responseType: "arraybuffer"})
    const alertsDecoded = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(alertsRes.data)
    );

    const activeAlerts = alertsDecoded.entity.filter((a) => a.alert.activePeriod[0].start < currentTime && (a.alert.activePeriod[0].end && a.alert.activePeriod[0].end > currentTime))
    const relevantAlerts = activeAlerts.filter((a) => a.alert.informedEntity[0].routeId == "6")

    console.log(decoded)
    console.log(fDecoded)
    console.log(relevantAlerts)
    setRawData(decoded)
    setRawIRTData(irtDecoded)
    setAlerts(relevantAlerts)


    const lStops = processData(decoded, "L06N")
    const fStops = processData(fDecoded, "F14N")
    setData({lStops: lStops, fStops: fStops, irtNorthStops: processData(irtDecoded, "635N"), irtSouthStops: processData(irtDecoded, "635S")})
  }

  const lTimes = transformUnixToMinutes(data.lStops, currentTime).slice(0, 5).sort((a, b) => a.arrival - b.arrival)
  const fTimes = transformUnixToMinutes(data.fStops, currentTime).slice(0, 5).sort((a, b) => a.arrival - b.arrival)

  const firstUnionSqTripId = lTimes.filter((t) => t.arrival > 10)[0]?.tripId;
  const unionSqArrivalTime = getStopArrivalTimeForTrip(rawData, "L03N", firstUnionSqTripId, currentTime);

  const candidateUptownTrains = data.irtNorthStops.filter((t) => t.arrival.time > (unionSqArrivalTime[0] + 75));
  const firstTrainAtLex = getFirstTrainToDest(rawIRTData, candidateUptownTrains.map((t) => t.tripId), "629N");
  const firstTrainAtLexArrivalTime = getStopArrivalTimeForTrip(rawIRTData, "629N", firstTrainAtLex?.tripId, currentTime);


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
    <MTASubwayBullet route="L" size="lg"/>
    <RouteDescription destination="8 Av" location="1 Av" />
    <RouteETA etas={lTimes.map((t) => t.arrival)} threshold={10} />
    <div className="col-span-1"/>
    <div className="col-span-9 space-x-4 pl-4 text-2xl">
      <span>The next <span className="font-semibold">8 Av</span>-bound <MTASubwayBullet route="L" size="sm"/> arrives at <span className="font-semibold">14 St—Union Sq</span> in <span className="text-green font-bold">{unionSqArrivalTime[1]}</span> mins</span>
    </div>
    <TransferRow route={firstTrainAtLex?.route} direction="uptown" destination="59 St—Lexington Ave" arrivalMins={firstTrainAtLexArrivalTime[1]} />
    {alerts.slice(0,10).map((a) => <AlertRow alert={a} />)}
    <MTASubwayBullet route="F" size="lg"/>
    <RouteDescription destination="Jamaica—179 St" location="2 Av" />
    <RouteETA etas={fTimes.map((t) => t.arrival)} threshold={12} />
  </>
}

const MTASubwayBullet = ({ route, size }) => {
  const transformRouteName = () => {
    if (route == "6X" || route == "7X") {
      return route.replace("X", "d")
    }

    return route?.toLowerCase()
  }

  const customClass = size == "sm" ? "w-8 h-8" : "w-32 h-32"

  return (
    <img src={`https://unpkg.com/mta-subway-bullets@0.5.0/svg/${transformRouteName()}.svg`} className={`rounded-full inline px-1 mb-1 ${customClass}`}/>
  )
}

const AlertRow = ({ alert }) => {
  console.log(alert)
  const engText = alert.alert.headerText?.translation?.find((t) => t.language == "en")?.text
  
  // find line names in brackets and replace for line icon
  // e.g [F] to <img src="https://api.mta.info/lineIcons/F.svg" className="rounded-full w-10 inline px-1 mb-1"/>

  const separateText = engText?.split(/\[(.*?)\]/g)

  const replacedText = separateText?.map((t) => {
    if (t.length == 1) {
      return <MTASubwayBullet route={t} size="sm" />
    } else {
      return t
    }
  })

  const alertStart = new Date(alert.alert.activePeriod[0].start * 1000)
  const alertSecondsAgo = Math.round((new Date().getTime() - alertStart.getTime()) / 1000)
  const alertMinutesAgo = Math.round(alertSecondsAgo / 60)

  return (
    <>
      <div className="col-span-1"/>
      <div className="col-span-8 flex flex-row gap-4 items-center p-4 ml-4 border-yellow bg-yellow-50 rounded-xl text-yellow-800 ">
        <span className="text-3xl text-yellow-700 font-semibold mb-1">⚠️</span>
        <span className="font-semibold">{replacedText} ({alertMinutesAgo} minutes ago)</span>
      </div>
      <div className="col-span-1"/>
    </>
  )
}

const TransferRow = ({ route, direction, destination, arrivalMins }) => {
  const termini = {
    uptown: {
      "1": "Van Cortlandt Park—242 St",
      "2": "Wakefield—241 St",
      "3": "Harlem—148 St",
      "4": "Woodlawn",
      "5": "Eastchester—Dyre Av",
      "6": "Pelham Bay Park",
      "7": "Flushing—Main St",
      "A": "Inwood—207 St",
      "B": "Bedford Park Blvd",
      "C": "168 St",
      "D": "Norwood—205 St",
      "E": "Jamaica Center—Parsons/Archer",
      "F": "Jamaica—179 St",
      "G": "Court Sq",
      "J": "Jamaica Center—Parsons/Archer",
      "L": "8 Av",
      "M": "Middle Village—Metropolitan Av",
      "N": "Astoria—Ditmars Blvd",
      "Q": "96 St",
      "R": "Forest Hills—71 Av",
      "W": "Astoria—Ditmars Blvd",
    }, 
    downtown: {
      "1": "South Ferry",
      "2": "Flatbush Av",
      "3": "New Lots Av",
      "4": "Crown Hts—Utica Av",
      "5": "Flatbush Av",
      "6": "Brooklyn Bridge—City Hall",
      "7": "34 St—Hudson Yards",
      "A": "Far Rockaway—Mott Av",
      "B": "Brighton Beach",
      "C": "Euclid Av",
      "D": "Coney Island—Stillwell Av",
      "E": "World Trade Center",
      "F": "Coney Island—Stillwell Av",
      "G": "Church Av",
      "J": "Broad St",
      "L": "Canarsie—Rockaway Pkwy",
      "M": "Forest Hills—71 Av",
      "N": "Coney Island—Stillwell Av",
      "Q": "Coney Island—Stillwell Av",
      "R": "Bay Ridge—95 St",
      "W": "Whitehall St",
    }
  }

  return (
    <>
      <div className="col-span-1"/>
       <div className="col-span-9 space-x-4 pl-4 text-2xl">
        <span>Transfer to {direction == "uptown" ? "an" : "a"} {direction} <span className="font-semibold">{termini[direction][route]}</span>-bound <MTASubwayBullet route={route} size="sm" /> and arrive at <span className="font-semibold">{destination}</span> in <span className="text-green font-bold">{arrivalMins}</span> mins</span>
      </div>
    </>
  )
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  
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

  const checkDarkMode = () => {
    const date = new Date();
    
    if (date.getHours() < 6) {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }
  }

  useEffect(() => {
    const id = setInterval(checkDarkMode, 600_000)
    checkDarkMode()
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`px-16 pt-12 pb-64 grid grid-cols-10 gap-x-16 gap-y-4 items-center ${isDarkMode ? "bg-gray-900 text-white" : ""}`}>
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
