import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3001",
});

instance.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

instance.interceptors.response.use(
  (response) => {
    console.log(`response ${response}`);
    return response;
  },
  (error) => {
    const statusCode = error.response ? error.response.status : null;
    if (statusCode === 401) {
      window.location = "/Login";
    }
    return Promise.reject(error);
  }
);

export default instance;
