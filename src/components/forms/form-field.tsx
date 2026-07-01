import { type ComponentProps, useState } from "react";
import { Pressable, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "~/components/ui/input";

/**
 * Supported field types. Each maps to sensible TextInput defaults
 * (keyboard, autoComplete, capitalization, secure entry). `password`
 * additionally renders a show/hide toggle.
 */
export type FieldType =
  "text" | "email" | "password" | "number" | "phone" | "url" | "otp";

const FIELD_PRESETS: Record<FieldType, TextInputProps> = {
  text: { autoCapitalize: "sentences" },
  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoComplete: "email",
    autoCorrect: false,
  },
  password: {
    secureTextEntry: true,
    autoCapitalize: "none",
    autoComplete: "password",
    autoCorrect: false,
  },
  number: { keyboardType: "numeric" },
  phone: { keyboardType: "phone-pad", autoComplete: "tel" },
  url: {
    keyboardType: "url",
    autoCapitalize: "none",
    autoComplete: "url",
    autoCorrect: false,
  },
  otp: { keyboardType: "number-pad", autoComplete: "one-time-code" },
};

// Props coming from Input we control internally (value/error/adornment) or set
// via the `type` preset (secureTextEntry). Everything else on TextInput passes
// through.
type PassthroughInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChangeText" | "onBlur" | "secureTextEntry" | "error"
>;

interface FormFieldProps<T extends FieldValues> extends PassthroughInputProps {
  control: Control<T>;
  name: Path<T>;
  /** Field type — drives keyboard, autoComplete, and password toggle. Defaults to "text". */
  type?: FieldType;
  label?: string;
  hint?: string;
  containerClassName?: string;
}

/**
 * A React Hook Form-connected input. Replaces the repeated
 * `<Controller ... render={<Input .../>} />` boilerplate.
 *
 * @example
 * <FormField control={control} name="email" type="email" label="Email" />
 * <FormField control={control} name="password" type="password" label="Password" />
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  type = "text",
  ...inputProps
}: FormFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const preset = FIELD_PRESETS[type];
  const isPassword = type === "password";

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <Input
          {...preset}
          {...inputProps}
          value={value ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          secureTextEntry={isPassword && !showPassword}
          endAdornment={
            isPassword ? (
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
            ) : (
              inputProps.endAdornment
            )
          }
        />
      )}
    />
  );
}
