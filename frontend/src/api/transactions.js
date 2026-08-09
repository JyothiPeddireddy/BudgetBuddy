import api from "./axios";

// Expenses
export const getExpenses = () => api.get("/expenses/");
export const addExpense = (data) => api.post("/expenses/", data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getExpenseSummary = () => api.get("/expenses/summary");
export const getDashboard = (year, month) => {
  const params = {};
  if (year && month) {
    params.year = year;
    params.month = month;
  }
  return api.get("/expenses/dashboard", { params });
};

// Income
export const getIncomes = () => api.get("/incomes/");
export const addIncome = (data) => api.post("/incomes/", data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

// Budgets
export const getBudgets = () => api.get("/budgets/");
export const addBudget = (data) => api.post("/budgets/", data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);