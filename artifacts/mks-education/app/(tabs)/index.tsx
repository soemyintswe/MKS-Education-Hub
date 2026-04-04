import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { SAMPLE_ORDERS, NOTIFICATIONS, SERVICES, PAYMENT_RECORDS } from "@/data/mockData";
import { SPACING, FONT_SIZE, SHADOW } from "@/constants/theme";

export default function HomeScreen() {
  const colors = useColors();
  const { user, activeRole } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const activeOrders = SAMPLE_ORDERS.filter(o => o.status === "in_progress" || o.status === "pending");
  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;
  const totalPaid = PAYMENT_RECORDS.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingPay = PAYMENT_RECORDS.filter(p => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  const quickServices = SERVICES.slice(0, 6);

  const roleLabel = activeRole === "student" ? "Student" : activeRole === "agent" ? "Partner Agent" : "Administrator";
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoBadge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.logoText}>MKS</Text>
            </View>
            <View>
              <Text style={styles.headerGreeting}>{greeting()},</Text>
              <Text style={styles.headerName}>{user?.name?.split(" ")[0]} 👋</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/notifications")}
            >
              <Feather name="bell" size={20} color="#fff" />
              {unreadNotifs > 0 && (
                <View style={[styles.notifDot, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.notifCount}>{unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setShowRoleSwitcher(true)}
            >
              <Feather name="user" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Role Badge */}
        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name={activeRole === "student" ? "book-open" : activeRole === "agent" ? "briefcase" : "shield"} size={12} color="#fff" />
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
          {activeRole === "student" && user?.studentId && (
            <Text style={styles.studentId}>ID: {user.studentId}</Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeOrders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatMMK(totalPaid)}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, pendingPay > 0 && { color: colors.secondary }]}>
              {formatMMK(pendingPay)}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Active Orders"
              icon="clock"
              onSeeAll={() => router.push("/(tabs)/orders")}
            />
            {activeOrders.map(order => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: "/order-detail", params: { id: order.id } })}
              >
                <Card style={styles.orderCard} variant="elevated">
                  <View style={styles.orderTop}>
                    <Text style={[styles.orderTitle, { color: colors.foreground }]}>{order.serviceTitle}</Text>
                    <Badge
                      label={order.status === "in_progress" ? "In Progress" : "Pending"}
                      variant={order.status === "in_progress" ? "primary" : "warning"}
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.orderMeta, { color: colors.mutedForeground }]}>
                    {order.assignedAgent ? `Agent: ${order.assignedAgent}` : "Awaiting Assignment"}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(order.steps.filter(s => s.completed).length / order.steps.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                    {order.steps.filter(s => s.completed).length}/{order.steps.length} steps completed
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Services */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Services"
            icon="grid"
            onSeeAll={() => router.push("/(tabs)/services")}
          />
          <View style={styles.servicesGrid}>
            {quickServices.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, { backgroundColor: colors.card, ...SHADOW.sm }]}
                onPress={() => router.push({ pathname: "/service-detail", params: { id: svc.id } })}
                activeOpacity={0.8}
              >
                <View style={[styles.svcIcon, { backgroundColor: svc.color + "20" }]}>
                  <Feather name={svc.icon as any} size={22} color={svc.color} />
                </View>
                <Text style={[styles.svcTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {svc.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <SectionHeader
            title="Notifications"
            icon="bell"
            onSeeAll={() => router.push("/notifications")}
          />
          {NOTIFICATIONS.slice(0, 3).map(notif => (
            <Card key={notif.id} style={styles.notifCard} variant={notif.read ? "outlined" : "elevated"}>
              <View style={styles.notifRow}>
                <View style={[styles.notifIcon, {
                  backgroundColor: notif.type === "success" ? colors.successLight :
                    notif.type === "warning" ? colors.warningLight :
                    notif.type === "alert" ? "#fee2e2" : colors.infoLight
                }]}>
                  <Feather
                    name={notif.icon as any}
                    size={16}
                    color={notif.type === "success" ? colors.success :
                      notif.type === "warning" ? colors.warning :
                      notif.type === "alert" ? colors.destructive : colors.info}
                  />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>{notif.title}</Text>
                    {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.notifMessage, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {notif.message}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Finance Summary */}
        <View style={styles.section}>
          <SectionHeader title="Financial Summary" icon="credit-card" onSeeAll={() => router.push("/financials")} />
          <Card variant="primary" style={styles.financeCard}>
            <Text style={styles.financeLabel}>Total Amount Paid</Text>
            <Text style={styles.financeAmount}>{totalPaid.toLocaleString()} MMK</Text>
            {pendingPay > 0 && (
              <View style={[styles.pendingPill, { backgroundColor: "rgba(251,191,36,0.25)" }]}>
                <Feather name="alert-circle" size={14} color={colors.secondary} />
                <Text style={[styles.pendingText, { color: colors.secondary }]}>
                  {pendingPay.toLocaleString()} MMK outstanding
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Admin-only Stats */}
        {activeRole === "admin" && (
          <View style={styles.section}>
            <SectionHeader title="System Overview" icon="activity" />
            <View style={styles.adminGrid}>
              {[
                { label: "Total Students", value: "1,248", icon: "users", color: colors.primary },
                { label: "Active Agents", value: "24", icon: "briefcase", color: "#8b5cf6" },
                { label: "Orders Today", value: "37", icon: "clipboard", color: colors.warning },
                { label: "Revenue (Apr)", value: "12.4M", icon: "trending-up", color: colors.success },
              ].map(stat => (
                <Card key={stat.label} style={styles.adminStatCard} variant="elevated">
                  <View style={[styles.adminStatIcon, { backgroundColor: stat.color + "15" }]}>
                    <Feather name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.adminStatValue, { color: colors.foreground }]}>{stat.value}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Role Switcher Modal */}
      <Modal visible={showRoleSwitcher} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <RoleSwitcher onClose={() => setShowRoleSwitcher(false)} />
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: colors.muted }]}
              onPress={() => setShowRoleSwitcher(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatMMK(amount: number) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f2027",
    letterSpacing: 0.5,
  },
  headerGreeting: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCount: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0f2027",
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  studentId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 4 },
  section: { marginBottom: 20 },
  orderCard: { marginBottom: 10 },
  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  orderMeta: {
    fontSize: 12,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e2f5f5",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceCard: {
    width: "30%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 8,
    minWidth: 95,
    flex: 1,
    maxWidth: "32%",
  },
  svcIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  svcTitle: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  notifCard: { marginBottom: 8 },
  notifRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  notifTitle: { fontSize: 14, fontWeight: "600" },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5 },
  notifMessage: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  financeCard: { padding: 20 },
  financeLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 4 },
  financeAmount: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 12 },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  pendingText: { fontSize: 13, fontWeight: "600" },
  adminGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  adminStatCard: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    alignItems: "center",
    padding: 16,
    gap: 6,
  },
  adminStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adminStatValue: { fontSize: 22, fontWeight: "700" },
  adminStatLabel: { fontSize: 12, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalClose: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: { fontSize: 15, fontWeight: "600" },
});
