import api from "./axios";

export const requestPremiumUpgrade = () => api.post("/subscription/request-premium");