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
import { Checkbox } from "~/components/ui/checkbox";
import { useLogin } from "~/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "~/features/auth/schemas";

export default function SignInScreen() {
  const { mutate: login, isPending } = useLogin();
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="gap-8">
          {/* Header */}
          <View className="items-center flex-col gap-2">
            <Logo size="lg" />
            <Text className="text-sm text-muted-foreground">
              Sign in to get started
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
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

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  variant="auth"
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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

            {/* Keep me logged in + Forgot password */}
            <View className="flex-row items-center justify-between mb-8">
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
              Sign in
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
