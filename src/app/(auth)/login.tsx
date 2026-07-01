import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "~/components/screen";
import { Logo } from "~/components/logo";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useLogin } from "~/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "~/features/auth/schemas";

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
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
            <Text className="text-sm text-muted-foreground">
              Sign in to get started
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <FormField
              control={control}
              name="email"
              type="email"
              variant="auth"
              label="Email"
              placeholder="you@example.com"
            />

            <FormField
              control={control}
              name="password"
              type="password"
              variant="auth"
              label="Password"
              placeholder="••••••••"
            />

            {/* Keep me logged in + Forgot password */}
            <View className="mb-8 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Checkbox
                  checked={keepLoggedIn}
                  onCheckedChange={setKeepLoggedIn}
                />
                <Text className="text-sm text-muted-foreground">
                  Keep me logged in
                </Text>
              </View>
              <Link href="/(auth)/forgot-password">
                <Text className="text-sm text-primary">Forgot password?</Text>
              </Link>
            </View>

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isPending || isSubmitting}
              size="lg"
            >
              Login
            </Button>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
