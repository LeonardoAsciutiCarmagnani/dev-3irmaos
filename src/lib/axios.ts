import Axios from "axios";

export const api = Axios.create({
  baseURL: "http://127.0.0.1:5001/dev-3irmaos/us-central1/api/v1",
});
