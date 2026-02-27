import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
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

export const getOptimization = async (months: number) => {
  const res = await API.post("/optimize", { months });
  return res.data;
};