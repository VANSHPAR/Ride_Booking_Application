import { reviewApi } from "./api";

export const getPassengerProfile = ()     => reviewApi.get("/api/v1/profile/passenger");
export const getDriverProfile    = ()     => reviewApi.get("/api/v1/profile/driver");
export const updatePassengerProfile = (data) => reviewApi.put("/api/v1/profile/passenger", data);
export const updateDriverProfile    = (data) => reviewApi.put("/api/v1/profile/driver", data);
