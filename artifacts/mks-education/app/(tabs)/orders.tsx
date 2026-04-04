import React, { useState } from "react";
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
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_ORDERS } from "@/data/mockData";

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = filter === "all" ? SAMPLE_ORDERS : SAMPLE_ORDERS.filter(o => o.status === filter);

  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const, color: "#f59e0b" },
    in_progress: { label: "In Progress", variant: "primary" as const, color: "#0d9488" },
    review: { label: "In Review", variant: "info" as const, color: "#3b82f6" },
    completed: { label: "Completed", variant: "success" as const, color: "#10b981" },
    cancelled: { label: "Cancelled", variant: "danger" as const, color: "#ef4444" },
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "Active" },
    { key: "completed", label: "Done" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Order Tracking</Text>
        <Text style={styles.subtitle}>{SAMPLE_ORDERS.length} total orders</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f.key ? "#fff" : "rgba(255,255,255,0.2)" },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? colors.primary : "#fff" }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="clipboard" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Orders</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No orders match the selected filter
            </Text>
          </View>
        ) : (
          filtered.map(order => {
            const sc = statusConfig[order.status];
            const completedSteps = order.steps.filter(s => s.completed).length;
            const progress = completedSteps / order.steps.length;

            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: "/order-detail", params: { id: order.id } })}
                activeOpacity={0.85}
              >
                <Card variant="elevated" style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={[styles.orderIcon, { backgroundColor: sc.color + "15" }]}>
                      <Feather name="clipboard" size={20} color={sc.color} />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderTitle, { color: colors.foreground }]}>{order.serviceTitle}</Text>
                      <Text style={[styles.orderMeta, { color: colors.mutedForeground }]}>
                        {order.createdAt} • {order.studentName}
                      </Text>
                    </View>
                    <Badge label={sc.label} variant={sc.variant} size="sm" />
                  </View>

                  {/* Progress Stepper */}
                  <View style={styles.stepperContainer}>
                    {order.steps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepLeft}>
                          <View style={[
                            styles.stepDot,
                            {
                              backgroundColor: step.completed ? colors.primary : "transparent",
                              borderColor: step.completed ? colors.primary : colors.border,
                            },
                          ]}>
                            {step.completed && <Feather name="check" size={10} color="#fff" />}
                          </View>
                          {i < order.steps.length - 1 && (
                            <View style={[
                              styles.stepLine,
                              { backgroundColor: step.completed ? colors.primary : colors.border },
                            ]} />
                          )}
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={[
                            styles.stepTitle,
                            { color: step.completed ? colors.foreground : colors.mutedForeground },
                          ]}>
                            {step.title}
                          </Text>
                          {step.date && (
                            <Text style={[styles.stepDate, { color: colors.mutedForeground }]}>{step.date}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.orderFooter}>
                    <View style={styles.progressRow}>
                      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                        <View style={[styles.progressFill, { backgroundColor: sc.color, width: `${progress * 100}%` }]} />
                      </View>
                      <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                        {completedSteps}/{order.steps.length}
                      </Text>
                    </View>
                    {order.assignedAgent && (
                      <View style={styles.agentRow}>
                        <Feather name="user" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.agentText, { color: colors.mutedForeground }]}>
                          {order.assignedAgent}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 14 },
  filterRow: { flexDirection: "row" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  orderCard: { gap: 14 },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 15, fontWeight: "700" },
  orderMeta: { fontSize: 12, marginTop: 2 },
  stepperContainer: { gap: 0 },
  stepRow: { flexDirection: "row", gap: 12 },
  stepLeft: { alignItems: "center", width: 20 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 2,
  },
  stepContent: { flex: 1, paddingBottom: 12 },
  stepTitle: { fontSize: 13, fontWeight: "500" },
  stepDate: { fontSize: 11, marginTop: 2 },
  orderFooter: { gap: 8 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 11, fontWeight: "600" },
  agentRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  agentText: { fontSize: 12 },
  empty: { alignItems: "center", padding: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
