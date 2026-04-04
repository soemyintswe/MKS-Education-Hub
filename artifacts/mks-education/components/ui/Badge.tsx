import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function Badge({ label, variant = "default", size = "md", style }: BadgeProps) {
  const colors = useColors();

  const configs = {
    default: { bg: colors.muted, text: colors.mutedForeground },
    primary: { bg: colors.primaryLight, text: colors.primary },
    secondary: { bg: colors.secondaryLight, text: "#92400e" },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    danger: { bg: "#fee2e2", text: colors.destructive },
    info: { bg: colors.infoLight, text: colors.info },
    outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  };

  const config = configs[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: "border" in config ? config.border : "transparent",
          borderWidth: "border" in config ? 1 : 0,
          paddingHorizontal: size === "sm" ? 6 : 10,
          paddingVertical: size === "sm" ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text, fontSize: size === "sm" ? 10 : 12 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
