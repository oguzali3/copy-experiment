// src/utils/apiClient.ts
import axios from "axios";
import { getAuthToken } from "@/services/auth.service";

const API_URL = import.meta.env.VITE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      console.log(
        "Adding auth token to request:",
        token.substring(0, 10) + "..."
      );
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No auth token available for request");
    }

    // Log the request URL for debugging
    console.log(
      `${config.method?.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `Response from ${response.config.url}: Status ${response.status}`
    );
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized request, redirecting to signin");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
