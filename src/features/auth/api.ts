import { axiosInstance, axiosPrivate } from "~/lib/config/axios";
import type { Token, LoginDTO, User } from "./types";

// TODO: Align these endpoints with your backend's auth API.
const AuthService = {
  login: async (data: LoginDTO): Promise<Token> => {
    const { data: response } = await axiosInstance.post<{ data: Token }>(
      "/auth/signin",
      data,
    );
    return response.data;
  },

  logout: async (data: { token: string }): Promise<void> => {
    await axiosPrivate.post("/auth/logout", data);
  },

  forgotPassword: async (data: { email: string }) => {
    const { data: response } = await axiosInstance.post(
      "/auth/forgot-password",
      data,
    );
    return response;
  },

  resetPassword: async (data: {
    otp: string;
    password: string;
    rePassword: string;
  }) => {
    const { data: response } = await axiosInstance.post(
      "/auth/confirm-password",
      data,
    );
    return response;
  },

  getProfile: async (): Promise<User> => {
    const { data: response } = await axiosPrivate.get<User>("/auth/me");
    return response;
  },
};

export default AuthService;
