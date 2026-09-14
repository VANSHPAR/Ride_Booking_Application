import { authApi } from "./api";

export const signupPassenger = (data) =>
  authApi.post("/api/v1/auth/signup/passenger", data);

export const signupDriver = (data) =>
  authApi.post("/api/v1/auth/signup/driver", data);

export const signinPassenger = (data) =>
  authApi.post("/api/v1/auth/signin/passenger", data);

export const signinDriver = (data) =>
  authApi.post("/api/v1/auth/signin/driver", data);
