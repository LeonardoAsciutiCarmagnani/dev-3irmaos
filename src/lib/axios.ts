import axios from "axios";

export const api = axios.create({
  baseURL: "https://us-central1-server-kyoto.cloudfunctions.net/api",
});
