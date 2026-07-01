import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "~/components/logo";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useResetPassword } from "~/features/auth/hooks";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "~/features/auth/schemas";

export default function ResetPasswordScreen() {
  const { mutate: resetPassword, isPending } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", rePassword: "" },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPassword(values);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="gap-8">
          {/* Header */}
          <View className="items-center flex-col gap-2">
            <Logo size="lg" />
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground">
                Reset password
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Enter the code from your email and choose a new password
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-10">
            <Controller
              control={control}
              name="otp"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  variant="auth"
                  label="Reset Code"
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.otp?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  variant="auth"
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  endAdornment={
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#71717a"
                      />
                    </Pressable>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="rePassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  variant="auth"
                  label="Confirm Password"
                  placeholder="••••••••"
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.rePassword?.message}
                  endAdornment={
                    <Pressable
                      onPress={() => setShowConfirm((v) => !v)}
                      hitSlop={8}
                      accessibilityLabel={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#71717a"
                      />
                    </Pressable>
                  }
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isPending || isSubmitting}
              size="lg"
            >
              Reset password
            </Button>
          </View>

          {/* Footer */}
          <View className="gap-2">
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-muted-foreground">
                Didn't receive a code?
              </Text>
              <Link href="/(auth)/forgot-password">
                <Text className="text-sm font-semibold text-primary">
                  Resend
                </Text>
              </Link>
            </View>
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-muted-foreground">Back to</Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-sm font-semibold text-primary">
                  Sign in
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
