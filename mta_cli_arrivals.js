const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fs = require('fs');
const path = require('path');

const API_KEY = 'tM18qpEMTq1zYoiRmXeB64RNMl3JqI0c6xwvOsBD';

const GTFS_FEEDS = {
    BMT: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
};
const STOP_IDS = {
    EIGHT_ST: 'R21S',
    UNION_ST: 'R32S',
    FOURTEEN_ST_UNION_SQ: 'R20S',
    SEVENTH_AVE: 'D25S',
};
const CSV_FILE = path.join(__dirname, 'mta_travel_times.csv');

const WALKING_TIME_TO_8ST = 9;
const WALKING_TIME_TO_UNION_SQ = 11;
const DELAY_FROM_UNION_ST = 7;
const DELAY_FROM_7AVE = 9;

async function fetchData(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'x-api-key': API_KEY },
            responseType: 'arraybuffer',
        });
        return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));
    } catch (error) {
        console.error('Error fetching MTA data:', error);
        return null;
    }
}

async function getTrainArrivals(stopId, filterRoutes = [], walkingTime = 0) {
    const feed = await fetchData(GTFS_FEEDS.BMT);
    if (!feed) return [];

    const tripUpdates = feed.entity.map((e) => e.tripUpdate).filter(Boolean);
    const arrivals = tripUpdates.flatMap((update) =>
        update.stopTimeUpdate
            .filter((stop) => stop.stopId === stopId && (filterRoutes.length === 0 || filterRoutes.includes(update.trip.routeId)))
            .map((stop) => ({
                route: update.trip.routeId,
                arrival: stop.arrival?.time,
                tripId: update.trip.tripId,
            }))
    );

    const currentTime = Math.floor(Date.now() / 1000);
    return arrivals
        .map(({ route, arrival, tripId }) => ({
            route,
            tripId,
            minutesAway: ((arrival - currentTime) / 60).toFixed(2),
            arrivalTime: arrival,
        }))
        .filter((t) => t.minutesAway > walkingTime)
        .sort((a, b) => a.minutesAway - b.minutesAway);
}

async function getTotalTravelTime(startStop, endStop, filterRoutes = [], walkingTime = 0, fixedDelay = 0) {
    const startArrivals = await getTrainArrivals(startStop, filterRoutes, walkingTime);
    if (startArrivals.length === 0) return null;

    const firstTrip = startArrivals[0];
    const endArrivals = await getTrainArrivals(endStop, filterRoutes);
    const matchingTrip = endArrivals.find((t) => t.tripId === firstTrip.tripId);

    if (!matchingTrip) return null;

    console.log(firstTrip)
    console.log(matchingTrip)

    return (parseFloat(matchingTrip.minutesAway) + fixedDelay).toFixed(2);
}

function writeToCSV(timestamp, unionStTravelTime, seventhAveTravelTime) {
    const headers = '"Timestamp","Total Time: 8 St to Union St (R, N)","Total Time: 14 St Union Sq to 7 Ave (Q)"\n';
    const data = `"${timestamp}","${unionStTravelTime ?? 'N/A'}","${seventhAveTravelTime ?? 'N/A'}"\n`;

    if (!fs.existsSync(CSV_FILE)) {
        fs.writeFileSync(CSV_FILE, headers, 'utf8');
    }
    fs.appendFileSync(CSV_FILE, data, 'utf8');
}

async function displayTravelTimes() {
    while (true) {
        console.clear();

        const unionStTravelTime = await getTotalTravelTime(STOP_IDS.EIGHT_ST, STOP_IDS.UNION_ST, ['R'], WALKING_TIME_TO_8ST, DELAY_FROM_UNION_ST);
        const seventhAveTravelTime = await getTotalTravelTime(STOP_IDS.FOURTEEN_ST_UNION_SQ, STOP_IDS.SEVENTH_AVE, ['Q'], WALKING_TIME_TO_UNION_SQ, DELAY_FROM_7AVE);

        const timestamp = new Date().toISOString();
        console.log(`\n[${timestamp}]`);
        console.log(`Total estimated travel time from now for 8 St to Union St (R, N only): ${unionStTravelTime ?? 'N/A'} min`);
        console.log(`Total estimated travel time from now for 14 St Union Sq to 7 Ave (Q only): ${seventhAveTravelTime ?? 'N/A'} min`);
        
        writeToCSV(timestamp, unionStTravelTime, seventhAveTravelTime);

        await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
}

displayTravelTimes();

