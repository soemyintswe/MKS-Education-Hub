import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { HeaderNavButtons } from "@/components/HeaderNavButtons";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/hooks/useI18n";

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  color: string;
  badge?: string;
  action?: "toggle_language";
}

export default function MoreScreen() {
  const colors = useColors();
  const { t, language, toggleLanguage } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, activeRole, logout, unreadNotificationCount } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
          <View style={styles.headerNavRow}>
            <HeaderNavButtons iconColor="#fff" buttonColor="rgba(255,255,255,0.15)" />
          </View>
          <Text style={styles.userName}>{t("account")}</Text>
          <Text style={styles.userEmail}>{t("loginRegisterContinue")}</Text>
        </View>

        <View style={[styles.loggedOutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>{t("login")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.authBtnText, { color: colors.secondaryForeground }]}>{t("register")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t("myAccount"),
      items: [
        { title: t("profile"), icon: "user", route: "/profile", color: "#0d9488" },
        { title: t("documentsHub"), icon: "folder", route: "/documents", color: "#3b82f6" },
        { title: t("financialRecords"), icon: "credit-card", route: "/financials", color: "#10b981" },
        { title: t("deliveryTracking"), icon: "truck", route: "/delivery", color: "#f59e0b" },
        {
          title: t("notifications"),
          icon: "bell",
          route: "/notifications",
          color: "#8b5cf6",
          badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : undefined,
        },
        {
          title: language === "en" ? t("languageSwitchToMyanmar") : t("languageSwitchToEnglish"),
          icon: "globe",
          color: "#0d9488",
          action: "toggle_language",
        },
      ],
    },
    {
      title: t("communication"),
      items: [
        { title: t("chatMessaging"), icon: "message-circle", route: "/chat", color: "#0d9488" },
      ],
    },
    ...((activeRole === "admin" || activeRole === "agent") ? [{
      title: t("management"),
      items: [
        { title: t("students"), icon: "users", route: "/students", color: "#3b82f6" },
        { title: t("addStudent"), icon: "user-plus", route: "/student-add", color: "#0d9488" },
        ...(activeRole === "admin" ? [{ title: t("userPermissions"), icon: "users", route: "/admin-users", color: "#3b82f6" }] : []),
        ...(activeRole === "admin" ? [{ title: language === "my" ? "Content စီမံခန့်ခွဲမှု" : "Content Admin", icon: "edit-3", route: "/content-admin", color: "#0d9488" }] : []),
      ],
    }] : []),
    {
      title: t("security"),
      items: [
        { title: t("changePassword"), icon: "lock", route: "/change-password", color: "#0d9488" },
      ],
    },
    {
      title: t("information"),
      items: [
        { title: t("aboutMks"), icon: "info", route: "/about", color: "#6b7280" },
        { title: t("contactUs"), icon: "phone", route: "/contact", color: "#0d9488" },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerNavRow}>
          <HeaderNavButtons iconColor="#fff" buttonColor="rgba(255,255,255,0.15)" />
        </View>
        <View style={styles.userRow}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
              <Text style={styles.avatarText}>
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.studentId && (
              <Text style={styles.userMeta}>ID: {user.studentId}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/profile")}>
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
                    onPress={() => {
                      if (item.action === "toggle_language") {
                        toggleLanguage();
                        return;
                      }
                      if (item.route) router.push(item.route as any);
                    }}
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
            {t("appVersion")}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive }]}
          onPress={() => {
            logout()
              .then(() => router.replace("/login"))
              .catch(() => {
                // no-op
              });
          }}
        >
          <Feather name="log-out" size={17} color="#fff" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerNavRow: { marginBottom: 10 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  logoutBtn: {
    marginTop: 4,
    alignSelf: "stretch",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  loggedOutCard: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  authBtn: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  authBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
