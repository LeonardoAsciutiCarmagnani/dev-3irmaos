import axios from "axios";
export const api = axios.create({
  baseURL: "https://us-central1-kyoto-f1764.cloudfunctions.net/api",
});
