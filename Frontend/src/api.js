import axios from "axios";

// This will use the URL from your .env file in production, 
// and fall back to localhost:5000 if the variable is missing.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://20.207.197.45";

export const runCode = async (code, language) => {
  const res = await axios.post(`${API_BASE_URL}/run`, {
    code,
    language,
  });
  return res.data;
};

export const getAIReview = async (code) => {
  const res = await axios.post(`${API_BASE_URL}/ai`, {
    code,
  });
  return res.data;
};