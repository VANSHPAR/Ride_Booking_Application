import axios from "axios";

// Central axios instances per service
const makeApi = (baseURL) =>
  axios.create({
    baseURL,
    withCredentials: true,   // sends HttpOnly JWT cookie automatically
    headers: { "Content-Type": "application/json" },
  });

export const authApi      = makeApi("http://localhost:7838");
export const bookingApi   = makeApi("http://localhost:7464");
export const locationApi  = makeApi("http://localhost:7777");
export const reviewApi    = makeApi("http://localhost:8080");   // Review + Profile service
export const socketApi    = makeApi("http://localhost:8500");

export const SOCKET_URL   = "http://localhost:8500/ws";       // SockJS endpoint
