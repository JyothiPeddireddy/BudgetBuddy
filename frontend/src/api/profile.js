import api from "./axios";

export const getMyProfile = () => api.get("/profile/me");
export const updateMyProfile = (data) => api.put("/profile/me", data);