import { get, post } from "./api";
import Cookies from "js-cookie";

export interface AuthMessageResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

export interface LoginRequest {
  address: string;
  signature: string;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  address: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  address: string;
}

export const authService = {
  /**
   * Get message to sign for authentication
   */
  getMessage: async (address: string) => {
    return get<AuthMessageResponse>(`/api/auth/message/${address}`);
  },

  /**
   * Authenticate user with wallet signature
   */
  login: async (address: string, signature: string, message: string) => {
    const result = await post<LoginResponse>("/api/auth/login", {
      address,
      signature,
      message,
    });
    // Lưu token vào cookie sau khi login thành công
    if (result.success && result.data?.token) {
      Cookies.set("token", result.data.token, { expires: 3 }); // 3h
    }
    return result;
  },

  /**
   * Verify if token is valid
   */
  verify: async () => {
    return post<VerifyResponse>("/api/auth/verify", {});
  },
};
