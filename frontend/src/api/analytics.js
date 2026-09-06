import api from "./axios";

/*
 * All analytics endpoints are user-scoped server-side (via get_current_user),
 * so no user id needs to be passed from here.
 */

export const getSpendingByCategory = (month, year, startDate, endDate) =>
  api.get("/analytics/spending-by-category", {
    params: {
      month,
      year,
      start_date: startDate,
      end_date: endDate,
    },
  });

export const getMonthlyTrend = (months = 6) =>
  api.get("/analytics/monthly-trend", {
    params: { months },
  });

export const getSavingsProgress = () =>
  api.get("/analytics/savings-progress");

export const getAnalyticsSummary = (month, year, startDate, endDate) =>
  api.get("/analytics/summary", {
    params: {
      month,
      year,
      start_date: startDate,
      end_date: endDate,
    },
  });

// Premium+ only — per-category spending broken out by month, for the
// stacked bar chart. Returns [{month, label, categories: {cat: total}}, ...]

export const getCategoryTrend = (months = 6) =>
  api.get("/analytics/category-trend", {
    params: { months },
  });