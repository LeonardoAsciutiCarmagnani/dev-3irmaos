const ambient = import.meta.env.VITE_APLICATION_AMBIENT; // "development", "production", "test"
const apiBaseUrl =
  ambient !== "development"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://127.0.0.1:5001/server-kyoto/us-central1/api/v1";

console.log(apiBaseUrl);

export default apiBaseUrl;
