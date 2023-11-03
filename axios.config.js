// import axios from "axios";
const axios = require("axios");
import getConfig  from "next/config";

const { publicRuntimeConfig } = getConfig();
const { apiBaseUrl } = publicRuntimeConfig;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const instance = axios.create({
  baseURL: `${apiBaseUrl}`,
});

/*instance.interceptors.request.use(
  (config) => {

    config.withCredentials = true;
    return config;
  }
);

instance.interceptors.response.use((response) => {
  console.log(`response ${response}`);
  return response;
}, (error) => {

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
});*/

module.exports = instance;
