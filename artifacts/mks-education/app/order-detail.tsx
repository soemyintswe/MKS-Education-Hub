import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppHeader } from "@/components/AppHeader";
import { SAMPLE_ORDERS } from "@/data/mockData";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const order = SAMPLE_ORDERS.find(o => o.id === id);

  if (!order) return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title="Order Detail" showBack />
      <View style={styles.notFound}><Text style={{ color: colors.foreground }}>Order not found</Text></View>
    </View>
  );

  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const, color: "#f59e0b" },
    in_progress: { label: "In Progress", variant: "primary" as const, color: "#0d9488" },
    review: { label: "In Review", variant: "info" as const, color: "#3b82f6" },
    completed: { label: "Completed", variant: "success" as const, color: "#10b981" },
    cancelled: { label: "Cancelled", variant: "danger" as const, color: "#ef4444" },
  };

  const sc = statusConfig[order.status];
  const completedSteps = order.steps.filter(s => s.completed).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title="Order Detail" showBack subtitle={`#${order.id.toUpperCase()}`} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <Card variant="primary" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryService}>{order.serviceTitle}</Text>
              <Text style={styles.summaryStudent}>{order.studentName}</Text>
            </View>
            <Badge label={sc.label} variant={sc.variant} />
          </View>
          <View style={styles.summaryMeta}>
            <View style={styles.summaryMetaItem}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.summaryMetaText}>Created: {order.createdAt}</Text>
            </View>
            <View style={styles.summaryMetaItem}>
              <Feather name="refresh-cw" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.summaryMetaText}>Updated: {order.updatedAt}</Text>
            </View>
          </View>
          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{completedSteps}/{order.steps.length} steps</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <View style={[
                styles.progressFill,
                {
                  backgroundColor: "#fff",
                  width: `${(completedSteps / order.steps.length) * 100}%`,
                },
              ]} />
            </View>
          </View>
        </Card>

        {/* Agent */}
        {order.assignedAgent && (
          <Card variant="elevated" style={styles.agentCard}>
            <View style={styles.agentRow}>
              <View style={[styles.agentAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.agentInitials, { color: colors.primary }]}>
                  {order.assignedAgent.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={[styles.agentName, { color: colors.foreground }]}>{order.assignedAgent}</Text>
                <Text style={[styles.agentRole, { color: colors.mutedForeground }]}>Assigned Agent</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/chat")}
                style={[styles.chatBtn, { backgroundColor: colors.primaryLight }]}
              >
                <Feather name="message-circle" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Step Timeline */}
        <Card variant="elevated" style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Feather name="activity" size={18} color={colors.primary} />
            <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Service Steps</Text>
          </View>

          {order.steps.map((step, i) => {
            const isLast = i === order.steps.length - 1;
            const isNext = !step.completed && (i === 0 || order.steps[i - 1]?.completed);
            return (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    {
                      backgroundColor: step.completed ? colors.primary : isNext ? "transparent" : "transparent",
                      borderColor: step.completed ? colors.primary : isNext ? colors.primary : colors.border,
                      borderWidth: 2,
                    },
                  ]}>
                    {step.completed && <Feather name="check" size={10} color="#fff" />}
                    {isNext && !step.completed && (
                      <View style={[styles.nextDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.stepLine,
                      { backgroundColor: step.completed ? colors.primary : colors.border },
                    ]} />
                  )}
                </View>
                <View style={[styles.stepContent, !isLast && { paddingBottom: 20 }]}>
                  <Text style={[
                    styles.stepTitle,
                    {
                      color: step.completed ? colors.foreground : isNext ? colors.primary : colors.mutedForeground,
                      fontWeight: (step.completed || isNext) ? "600" : "400",
                    },
                  ]}>
                    {step.title}
                    {isNext && " (Current)"}
                  </Text>
                  {step.date && (
                    <View style={styles.stepDateRow}>
                      <Feather name="clock" size={11} color={colors.primary} />
                      <Text style={[styles.stepDate, { color: colors.primary }]}>{step.date}</Text>
                    </View>
                  )}
                  {!step.completed && !isNext && (
                    <Text style={[styles.stepPending, { color: colors.mutedForeground }]}>Upcoming</Text>
                  )}
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryCard: { gap: 14 },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  summaryService: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 2 },
  summaryStudent: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  summaryMeta: { gap: 6 },
  summaryMetaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryMetaText: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  progressContainer: { gap: 6 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  progressValue: { fontSize: 12, color: "#fff", fontWeight: "600" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  agentCard: {},
  agentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  agentInitials: { fontSize: 16, fontWeight: "700" },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: "600" },
  agentRole: { fontSize: 12, marginTop: 2 },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCard: { gap: 0 },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  timelineTitle: { fontSize: 16, fontWeight: "700" },
  stepRow: { flexDirection: "row", gap: 14 },
  stepLeft: { alignItems: "center", width: 24 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextDot: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 2, flex: 1, minHeight: 12, marginVertical: 3 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14 },
  stepDateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  stepDate: { fontSize: 12, fontWeight: "500" },
  stepPending: { fontSize: 12, marginTop: 2 },
});
