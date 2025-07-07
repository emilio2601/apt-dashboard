import React from "react";
import { Stops } from "../../stops";
import MTADestinationRow from "./MTADestinationRow";
import MTASubwayBullet from "./components/MTASubwayBullet";
import AlertRow from "./components/AlertRow";
import RouteDescription from "../../components/RouteDescription";
import RouteETA from "../../components/RouteETA";
import { processTripUpdatesForStop, convertTripTimesToMinutes, getTripArrivalTimeAtStop } from "./mtaHelpers";

/**
 * Renders a row for a specific MTA subway service, displaying upcoming train information.
 *
 * @param {object} props - The component props.
 * @param {string} props.originStation - The ID of the station to get upcoming trips for.
 * @param {number} props.arrivalThreshold - The minimum number of minutes away a trip must be to be considered the "next" trip.
 * @param {object} props.rawData - The raw GTFS-RT data for the relevant subway lines.
 * @param {Array<object>} props.alerts - A list of active MTA alerts.
 * @param {string|null} [props.destinationStation=null] - An optional destination station to show arrival times for.
 * @param {boolean} [props.onlyTrainsStoppingAtDestination=false] - If true, only shows trips that stop at the destination station.
 * @param {number} props.currentTime - The current time in Unix epoch seconds, used to calculate arrival times.
 * @returns {React.ReactElement|null} A component that displays the service information, or null if no relevant trips are found.
 */
const MTAServiceRow = ({ originStation, arrivalThreshold, rawData, alerts, destinationStation = null, onlyTrainsStoppingAtDestination = false, currentTime}) => {
  
  // Get all upcoming trips for the origin station.
  const upcomingTrips = processTripUpdatesForStop(rawData, originStation);
  
  // Convert trip arrival times to minutes from now, and sort them.
  const upcomingTripsInMinutes = convertTripTimesToMinutes(upcomingTrips, currentTime).sort((a, b) => a.arrival - b.arrival);
  
  // Filter for trips that will stop at the destination, if specified.
  const relevantTrips = upcomingTripsInMinutes.filter((trip) => !onlyTrainsStoppingAtDestination || trip.stoppingAt.includes(destinationStation));
  
  const etas = relevantTrips.map((trip) => trip.arrival);
  
  // Find the next trip that meets the arrival threshold.
  const nextTrip = relevantTrips.find((trip) => trip.arrival > arrivalThreshold);
  
  // Find the next trip that also stops at the destination station.
  const nextTripStoppingAtDest = relevantTrips.find((trip) => trip.arrival > arrivalThreshold && trip.stoppingAt.includes(destinationStation));

  let destinationStationRow = null;

  if (destinationStation && nextTripStoppingAtDest) {
    const arrivalTimeAtDestination = getTripArrivalTimeAtStop(rawData, destinationStation, nextTripStoppingAtDest.tripId, currentTime);

    destinationStationRow = <MTADestinationRow route={nextTripStoppingAtDest.route} arrivalTime={arrivalTimeAtDestination} destinationStation={Stops[destinationStation]} /> 
  }

  // If there are no upcoming trips that meet the criteria, render nothing.
  if (!nextTrip) {
    return null;
  }
  
  const destinationStopId = nextTrip.stoppingAt[nextTrip.stoppingAt.length - 1];

  return (
    <>
      <MTASubwayBullet route={nextTrip.route} size="lg"/>
      <RouteDescription destination={Stops[destinationStopId]} location={Stops[originStation]} />
      <RouteETA etas={etas} threshold={arrivalThreshold} />
      {destinationStationRow}
      {alerts.filter((a) => a.alert.informedEntity[0].routeId === nextTrip.route).map((a) => <AlertRow key={a.id} alert={a} />)}
      {alerts.filter((a) => a.alert.informedEntity[0].stopId === originStation).map((a) => <AlertRow key={a.id} alert={a} />)}
      {destinationStation && alerts.filter((a) => a.alert.informedEntity[0].stopId === destinationStation).map((a) => <AlertRow key={a.id} alert={a} />)}
    </>
  )
}

export default MTAServiceRow; 