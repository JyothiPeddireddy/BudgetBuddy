import api from "./axios";

export const getSystemAnalytics = () =>
  api.get("/admin/system-analytics");

export const listAllUsers = () =>
  api.get("/admin/users");

export const getUserDetail = (userId) =>
  api.get(`/admin/users/${userId}`);

export const getUserSummary = (userId, month, year) =>
  api.get(`/admin/users/${userId}/summary`, {
    params: { month, year },
  });

export const getUserExpenses = (
  userId,
  skip = 0,
  limit = 100
) =>
  api.get(`/admin/users/${userId}/expenses`, {
    params: { skip, limit },
  });

export const getUserIncomes = (
  userId,
  skip = 0,
  limit = 100
) =>
  api.get(`/admin/users/${userId}/incomes`, {
    params: { skip, limit },
  });

export const getUserGoals = (userId) =>
  api.get(`/admin/users/${userId}/goals`);

export const getUserAccounts = (userId) =>
  api.get(`/admin/users/${userId}/accounts`);

export const approvePremium = (userId) =>
  api.post(`/admin/users/${userId}/approve-premium`);

export const rejectPremium = (userId) =>
  api.post(`/admin/users/${userId}/reject-premium`);

export const downgradePremium = (userId) =>
  api.post(`/admin/users/${userId}/downgrade-premium`);