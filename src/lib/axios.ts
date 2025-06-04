import Axios from "axios";

export const api = Axios.create({
  baseURL: "https://us-central1-dev-3irmaos.cloudfunctions.net/api/v1",
});

//dev - http://127.0.0.1:5001/dev-3irmaos/us-central1/api/v1
//prod - https://us-central1-dev-3irmaos.cloudfunctions.net/api/v1
