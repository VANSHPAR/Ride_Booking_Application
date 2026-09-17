import { reviewApi } from "./api";

export const getPassengerProfile = ()     => reviewApi.get("/api/v1/profile/passenger");
export const getDriverProfile    = ()     => reviewApi.get("/api/v1/profile/driver");

export const updatePassengerProfile = (data) => {
  const params = {};
  if (data.name) params.name = data.name;
  if (data.rating !== undefined && data.rating !== "") params.rating = Number(data.rating);
  if (data.home?.latitude !== undefined && data.home?.latitude !== "") params["home.latitude"] = data.home.latitude;
  if (data.home?.longitude !== undefined && data.home?.longitude !== "") params["home.longitude"] = data.home.longitude;
  if (data.lastKnownLocation?.latitude !== undefined && data.lastKnownLocation?.latitude !== "") params["lastKnownLocation.latitude"] = data.lastKnownLocation.latitude;
  if (data.lastKnownLocation?.longitude !== undefined && data.lastKnownLocation?.longitude !== "") params["lastKnownLocation.longitude"] = data.lastKnownLocation.longitude;

  return reviewApi.put("/api/v1/profile/passenger", data, { params });
};

export const updateDriverProfile = (data) => reviewApi.put("/api/v1/profile/driver", data);

export const updateDriverAvailability = (isAvailable) =>
  reviewApi.put("/api/v1/profile/driver/availability", { isAvailable });
