import api from "./axios";

export const getAccounts = () => api.get("/accounts/");
export const addAccount = (data) => api.post("/accounts/", data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);