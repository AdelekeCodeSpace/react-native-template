import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "~/components/screen";
import { Logo } from "~/components/logo";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { useResetPassword } from "~/features/auth/hooks";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "~/features/auth/schemas";

export default function ResetPasswordScreen() {
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
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
      <Screen
        variant="detail"
        padded={false}
        className="bg-transparent px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="gap-8">
          {/* Header */}
          <View className="flex-col items-center gap-2">
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
            <FormField
              control={control}
              name="otp"
              type="otp"
              variant="auth"
              label="Reset Code"
              placeholder="Enter OTP"
            />

            <FormField
              control={control}
              name="password"
              type="password"
              variant="auth"
              label="New Password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <FormField
              control={control}
              name="rePassword"
              type="password"
              variant="auth"
              label="Confirm Password"
              placeholder="••••••••"
              autoComplete="new-password"
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
                Didn&apos;t receive a code?
              </Text>
              <Link href="/(auth)/forgot-password">
                <Text className="text-sm font-semibold text-primary">
                  Resend
                </Text>
              </Link>
            </View>
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-muted-foreground">Back to</Text>
              <Link href="/(auth)/login">
                <Text className="text-sm font-semibold text-primary">
                  Login
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
