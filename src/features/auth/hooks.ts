import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { router } from "expo-router";
import { axiosPrivate } from "~/lib/config/axios";
import { saveToken, deleteToken } from "~/lib/secure-storage";
import { handleApiError } from "~/lib/utils/error-handler";
import { notifyError, notifySuccess } from "~/lib/utils/toast";
import { useAuthStore } from "~/hooks/use-auth-store";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import type { ApiErrorResponse } from "~/types/api";
import AuthService from "./api";

export function useGetProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.users.me,
    queryFn: AuthService.getProfile,
    retry: false,
  });
}

export function useLogin() {
  const { setAuthToken } = useAuthStore();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: async (data) => {
      setAuthToken(data);
      axiosPrivate.defaults.headers.common["Authorization"] =
        `Bearer ${data.access}`;
      await saveToken(data.access);
      router.replace("/(tabs)");
    },
    onError: (error) => {
      const errorData = (error as AxiosError).response?.data as ApiErrorResponse;
      handleApiError(error, {
        404: () =>
          notifyError({
            message:
              "Invalid credentials, please check your inputs and try again",
          }),
        401: () =>
          notifyError({ message: errorData?.message || "Authentication failed" }),
        403: () =>
          notifyError({
            message: "Account not activated. Please check your email.",
          }),
      });
    },
  });
}

export function useLogout() {
  const { clearAuthToken, token } = useAuthStore();

  return useMutation({
    mutationFn: () =>
      token ? AuthService.logout({ token: token.access }) : Promise.resolve(),
    onSuccess: async () => {
      clearAuthToken();
      await deleteToken();
      notifySuccess({ message: "Logged out successfully" });
      router.replace("/(auth)/sign-in");
    },
    onError: async () => {
      // Force logout even on error
      clearAuthToken();
      await deleteToken();
      router.replace("/(auth)/sign-in");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: () => {
      notifySuccess({
        message: "Password reset email sent. Please check your inbox.",
      });
      router.push("/(auth)/reset-password");
    },
    onError: (error) => {
      handleApiError(error, {
        404: () =>
          notifyError({
            message: "No account found with that email address.",
          }),
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () => {
      notifySuccess({
        message: "Password reset successfully! Please sign in.",
      });
      router.replace("/(auth)/sign-in");
    },
    onError: (error) => {
      handleApiError(error, {
        400: () =>
          notifyError({
            message: "OTP is invalid or has expired. Please try again.",
          }),
        401: () =>
          notifyError({
            message: "OTP is invalid or has expired. Please try again.",
          }),
      });
    },
  });
}
