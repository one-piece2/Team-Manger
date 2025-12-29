import axios from "axios";
import { baseURL } from "./base-url";
import { useStore } from "@/store/store";
import { type CustomError } from "@/types/custom-error.type";

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

API.interceptors.request.use(
  (config) => {
    const accessToken = useStore.getState().accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error, "error");

    const { data } = error.response;
    // if (data === "Unauthorized" && status === 401) {
    //   window.location.href = "/";
    // }
    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;