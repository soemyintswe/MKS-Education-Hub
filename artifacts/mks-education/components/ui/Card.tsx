import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { SHADOW } from "@/constants/theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined" | "primary" | "accent";
  padding?: number;
}

export function Card({ children, style, variant = "default", padding = 16 }: CardProps) {
  const colors = useColors();

  const variantStyles: ViewStyle = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.card,
      ...SHADOW.md,
    },
    outlined: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    accent: {
      backgroundColor: colors.secondaryLight,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
  }[variant];

  return (
    <View style={[styles.card, { borderRadius: 12, padding }, variantStyles, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
