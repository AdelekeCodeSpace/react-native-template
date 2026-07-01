import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "~/components/screen";
import { Logo } from "~/components/logo";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { useForgotPassword } from "~/features/auth/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "~/features/auth/schemas";

export default function ForgotPasswordScreen() {
  const { mutate: sendReset, isPending, isSuccess } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    sendReset(values);
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
                Forgot password?
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset code
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-10">
            <FormField
              control={control}
              name="email"
              type="email"
              variant="auth"
              label="Email"
              placeholder="you@example.com"
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isPending || isSubmitting}
              size="lg"
            >
              Send reset code
            </Button>

            {isSuccess && (
              <View className="border-success/20 bg-success/10 rounded-xl border px-4 py-3">
                <Text className="text-center text-sm text-success">
                  Check your email for the reset code
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Remember your password?
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-sm font-semibold text-primary">Login</Text>
            </Link>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
