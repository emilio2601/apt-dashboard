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

const RouteDescription = ({ destination, location }) => {
  return (
    <div className="col-span-6 space-x-4 pl-4">
      <span className="text-[40px]">{destination}</span>
      <span className="text-[16px]">at {location}</span>
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
      <BART {...settings[selection].bart} />
      <ACTransit stops={settings[selection].ac} />
      <Muni {...settings[selection].muni} />
      <BayWheels station={settings[selection].baywheels}/>
      {settings[selection].curbside && <Curbside />}
    </div>
  );
}

export default App;
