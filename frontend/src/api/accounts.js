import api from "./axios";

export const getAccounts = () => api.get("/accounts/");
export const addAccount = (data) => api.post("/accounts/", data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);