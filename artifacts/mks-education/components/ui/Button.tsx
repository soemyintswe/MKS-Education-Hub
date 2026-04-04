import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  onPress: () => void;
  label?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  label,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: colors.primaryForeground },
    secondary: { bg: colors.secondary, text: colors.secondaryForeground },
    outline: { bg: "transparent", text: colors.primary, border: colors.primary },
    ghost: { bg: "transparent", text: colors.primary },
    danger: { bg: colors.destructive, text: colors.destructiveForeground },
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, gap: 4 },
    md: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, gap: 6 },
    lg: { paddingHorizontal: 24, paddingVertical: 14, fontSize: 17, gap: 8 },
  };

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: vs.bg,
          borderColor: vs.border ?? "transparent",
          borderWidth: vs.border ? 1.5 : 0,
          paddingHorizontal: ss.paddingHorizontal,
          paddingVertical: ss.paddingVertical,
          opacity: disabled ? 0.5 : 1,
          gap: ss.gap,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {icon}
          {(label || children) && (
            <Text style={[styles.text, { color: vs.text, fontSize: ss.fontSize }, textStyle]}>
              {label ?? children}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
