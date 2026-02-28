import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000,
});

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await API.post("/upload", formData);
  return res.data;
};

export const getMetrics = async (cashBalance?: number) => {
  const params = cashBalance ? { cash_balance: cashBalance } : {};
  const res = await API.get("/metrics", { params });
  return res.data;
};

export const getOptimization = async (cashBalance?: number) => {
  const res = await API.post("/optimize", { cash_balance: cashBalance });
  return res.data;
};

export const getInsights = async (cashBalance?: number) => {
  const params = cashBalance ? { cash_balance: cashBalance } : {};
  const res = await API.get("/insights", { params });
  return res.data;
};

export const getReport = async (months: number, cashBalance?: number) => {
  const res = await API.post("/report", { months, cash_balance: cashBalance });
  return res.data;
};

export const runScenario = async (scenario: {
  new_hires?: number;
  avg_salary?: number;
  marketing_change_pct?: number;
  revenue_growth_pct?: number;
  additional_monthly_cost?: number;
  additional_monthly_revenue?: number;
  cash_balance?: number;
}) => {
  const res = await API.post("/scenario", scenario);
  return res.data;
};

export const getAnomalies = async () => {
  const res = await API.get("/anomalies");
  return res.data;
};

export const askCFO = async (question: string, cashBalance?: number) => {
  const res = await API.post("/ask", { question, cash_balance: cashBalance });
  return res.data;
};