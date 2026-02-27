import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000"
});

export const uploadCSV = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/upload", formData);
};

export const getOptimization = (months: number) => {
  return API.post("/optimize", { months });
};

export const getMetrics = () => {
  return API.get("/metrics").then((r) => r.data);
};