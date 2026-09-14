import { reviewApi } from "./api";

export const createReview  = (data) => reviewApi.post("/api/v1/reviews", data);
export const getAllReviews  = ()     => reviewApi.get("/api/v1/reviews");
export const getReviewById = (id)   => reviewApi.get(`/api/v1/reviews/${id}`);
export const updateReview  = (id, data) => reviewApi.put(`/api/v1/reviews/${id}`, data);
export const deleteReview  = (id)   => reviewApi.delete(`/api/v1/reviews/${id}`);
