import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, activeRole } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "My Account",
      items: [
        { title: "Documents Hub", icon: "folder", route: "/documents", color: "#3b82f6" },
        { title: "Financial Records", icon: "credit-card", route: "/financials", color: "#10b981" },
        { title: "Delivery Tracking", icon: "truck", route: "/delivery", color: "#f59e0b" },
        { title: "Notifications", icon: "bell", route: "/notifications", color: "#8b5cf6", badge: "2" },
      ],
    },
    {
      title: "Communication",
      items: [
        { title: "Chat & Messaging", icon: "message-circle", route: "/chat", color: "#0d9488" },
      ],
    },
    ...(activeRole === "admin" || activeRole === "agent" ? [{
      title: "Management",
      items: [
        { title: "Student Management", icon: "users", route: "/admin/students", color: "#3b82f6" },
        { title: "Agent Management", icon: "briefcase", route: "/admin/agents", color: "#8b5cf6" },
        { title: "Reports & Analytics", icon: "bar-chart-2", route: "/admin/reports", color: "#f59e0b" },
      ],
    }] : []),
    {
      title: "Information",
      items: [
        { title: "About MKS", icon: "info", route: "/about", color: "#6b7280" },
        { title: "Contact Us", icon: "phone", route: "/contact", color: "#0d9488" },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.studentId && (
              <Text style={styles.userMeta}>ID: {user.studentId}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Feather name="edit-2" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <Card variant="elevated" style={styles.menuCard}>
              {section.items.map((item, i) => (
                <React.Fragment key={item.route}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                      <Feather name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.title}</Text>
                    {item.badge && (
                      <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  {i < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        <View style={[styles.versionBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
            MKS Education & Legal v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#0f2027" },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  userEmail: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  userMeta: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginLeft: 4 },
  menuCard: { padding: 0, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  divider: { height: 1, marginLeft: 64 },
  versionBadge: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  versionText: { fontSize: 12 },
});
