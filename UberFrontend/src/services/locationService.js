import { locationApi } from "./api";

export const saveDriverLocation = (driverId, latitude, longitude) =>
  locationApi.post("/api/location/drivers", { driverId, latitude, longitude });

export const getNearbyDrivers = (latitude, longitude) =>
  locationApi.post("/api/location/nearby/drivers", { latitude, longitude });
