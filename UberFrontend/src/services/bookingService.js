import { bookingApi } from "./api";

export const createBooking = (data) =>
  bookingApi.post("/api/v1/booking", data);

export const getMyBookings = () =>
  bookingApi.get("/api/v1/booking/passenger/my-bookings");

export const getDriverBookings = () =>
  bookingApi.get("/api/v1/booking/driver/my-bookings");

export const updateBooking = (bookingId, data) =>
  bookingApi.post(`/api/v1/booking/${bookingId}`, data);

export const cancelBooking = (bookingId) =>
  bookingApi.put(`/api/v1/booking/${bookingId}/cancel`);
