import Axios from "axios";

export const api = Axios.create({
  baseURL: "https://us-central1-dev-3irmaos.cloudfunctions.net/api/v1",
});
