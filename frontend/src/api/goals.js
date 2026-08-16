import api from "./axios";

export const getGoals = () => api.get("/goals/");
export const addGoal = (data) => api.post("/goals/", data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const contributeToGoal = (id, amount) => api.patch(`/goals/${id}/contribute`, { amount });