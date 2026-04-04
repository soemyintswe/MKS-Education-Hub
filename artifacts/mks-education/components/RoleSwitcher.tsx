import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp, UserRole } from "@/context/AppContext";

const ROLES: { role: UserRole; label: string; icon: string; desc: string }[] = [
  { role: "student", label: "Student", icon: "book-open", desc: "View your applications & progress" },
  { role: "agent", label: "Agent", icon: "briefcase", desc: "Manage client applications" },
  { role: "admin", label: "Admin", icon: "shield", desc: "Full system management" },
];

export function RoleSwitcher({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const { activeRole, setActiveRole } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.header, { color: colors.foreground }]}>Switch Role (Demo)</Text>
      {ROLES.map(({ role, label, icon, desc }) => {
        const active = activeRole === role;
        return (
          <TouchableOpacity
            key={role}
            onPress={() => { setActiveRole(role); onClose(); }}
            style={[
              styles.roleCard,
              {
                backgroundColor: active ? colors.primaryLight : colors.surfaceSecondary,
                borderColor: active ? colors.primary : colors.border,
                borderWidth: active ? 1.5 : 1,
              },
            ]}
          >
            <View style={[styles.roleIcon, { backgroundColor: active ? colors.primary : colors.muted }]}>
              <Feather name={icon as any} size={20} color={active ? "#fff" : colors.mutedForeground} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={[styles.roleLabel, { color: active ? colors.primary : colors.foreground }]}>{label}</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{desc}</Text>
            </View>
            {active && <Feather name="check-circle" size={20} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  header: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  roleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
