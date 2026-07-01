import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "~/components/logo";
import { Input } from "~/components/ui/input";
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
    formState: { errors, isSubmitting },
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
                Forgot password?
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Enter your email and we'll send you a reset code
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-10">
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  variant="auth"
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isPending || isSubmitting}
              size="lg"
            >
              Send reset code
            </Button>

            {isSuccess && (
              <View className="rounded-xl border border-success/20 bg-success/10 px-4 py-3">
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
            <Link href="/(auth)/sign-in">
              <Text className="text-sm font-semibold text-primary">
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
