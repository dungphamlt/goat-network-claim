import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import Cookies from "js-cookie";

const API_URL = "https://goat-airdrop-be-production.up.railway.app/";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}
// Tạo instance Axios cho client-side
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor để thêm token vào headers
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý response 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn hoặc không hợp lệ
      Cookies.remove("token");

      // Redirect về trang login nếu đang ở client-side
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const redirectUrl =
          currentPath !== "/login"
            ? `/login?redirect=${encodeURIComponent(currentPath)}`
            : "/login";
        // Use replace instead of href for immediate navigation
        window.location.replace(redirectUrl);
      }
    }
    return Promise.reject(error);
  }
);

// Hàm xử lý response chung
const handleResponse = <T>(response: AxiosResponse): ApiResponse<T> => {
  return {
    success: true,
    data: response.data,
    message: response.data?.message,
    status: response.status,
  };
};

// Hàm xử lý lỗi chung
const handleError = <T>(error: AxiosError): ApiResponse<T> => {
  return {
    success: false,
    error: (error.response?.data as any)?.message || error.message,
    status: error.response?.status,
  };
};

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await axiosClient.get<T>(endpoint);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError<T>(error as AxiosError);
  }
}

export async function post<T>(
  endpoint: string,
  data: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosClient.post<T>(endpoint, data);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError<T>(error as AxiosError);
  }
}

export async function put<T>(
  endpoint: string,
  data: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosClient.put<T>(endpoint, data);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError<T>(error as AxiosError);
  }
}

export async function patch<T>(
  endpoint: string,
  data: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosClient.patch<T>(endpoint, data);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError<T>(error as AxiosError);
  }
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await axiosClient.delete<T>(endpoint);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError<T>(error as AxiosError);
  }
}
