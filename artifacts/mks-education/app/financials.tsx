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
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppHeader } from "@/components/AppHeader";
import { PAYMENT_RECORDS } from "@/data/mockData";

export default function FinancialsScreen() {
  const colors = useColors();
  const [selectedTab, setSelectedTab] = useState<"all" | "paid" | "pending">("all");

  const filtered = selectedTab === "all" ? PAYMENT_RECORDS : PAYMENT_RECORDS.filter(p => {
    if (selectedTab === "pending") return p.status === "pending" || p.status === "overdue";
    return p.status === selectedTab;
  });

  const totalPaid = PAYMENT_RECORDS.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = PAYMENT_RECORDS.filter(p => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  const statusConfig = {
    paid: { variant: "success" as const, label: "Paid" },
    pending: { variant: "warning" as const, label: "Pending" },
    overdue: { variant: "danger" as const, label: "Overdue" },
  };

  const typeIcon: Record<string, string> = {
    payment: "credit-card",
    fee: "tag",
    refund: "refresh-cw",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title="Financial Records" showBack subtitle="Payment history & tuition" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card variant="primary" style={styles.summaryCard}>
            <Feather name="check-circle" size={20} color="rgba(255,255,255,0.75)" />
            <Text style={styles.summaryAmount}>{totalPaid.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Paid (MMK)</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: totalPending > 0 ? "#fff7ed" : colors.card, borderColor: totalPending > 0 ? colors.warning : colors.border, borderWidth: 1 }]}>
            <Feather name="clock" size={20} color={totalPending > 0 ? colors.warning : colors.mutedForeground} />
            <Text style={[styles.summaryAmount, { color: totalPending > 0 ? colors.warning : colors.foreground }]}>
              {totalPending.toLocaleString()}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Outstanding (MMK)</Text>
          </Card>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {(["all", "paid", "pending"] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tab,
                { backgroundColor: selectedTab === tab ? "#fff" : "transparent" },
              ]}
            >
              <Text style={[styles.tabText, { color: selectedTab === tab ? colors.primary : colors.mutedForeground }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ledger */}
        <View style={styles.ledger}>
          <Text style={[styles.ledgerHeader, { color: colors.mutedForeground }]}>
            TRANSACTION LEDGER
          </Text>
          {filtered.map((record, i) => {
            const sc = statusConfig[record.status];
            return (
              <Card key={record.id} variant={i % 2 === 0 ? "default" : "outlined"} style={styles.ledgerRow}>
                <View style={styles.ledgerLeft}>
                  <View style={[styles.ledgerIcon, { backgroundColor: colors.muted }]}>
                    <Feather name={typeIcon[record.type] as any} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.ledgerInfo}>
                    <Text style={[styles.ledgerDesc, { color: colors.foreground }]} numberOfLines={2}>
                      {record.description}
                    </Text>
                    <View style={styles.ledgerMeta}>
                      <Text style={[styles.ledgerDate, { color: colors.mutedForeground }]}>{record.date}</Text>
                      {record.method && (
                        <>
                          <Text style={{ color: colors.border }}>•</Text>
                          <Text style={[styles.ledgerDate, { color: colors.mutedForeground }]}>{record.method}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.ledgerRight}>
                  <Text style={[
                    styles.ledgerAmount,
                    { color: record.status === "paid" ? colors.success : record.status === "overdue" ? colors.destructive : colors.warning },
                  ]}>
                    {record.type === "refund" ? "+" : "-"}{record.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.ledgerCurrency, { color: colors.mutedForeground }]}>MMK</Text>
                  <Badge label={sc.label} variant={sc.variant} size="sm" />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    padding: 16,
  },
  summaryAmount: { fontSize: 22, fontWeight: "700", color: "#fff" },
  summaryLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", textAlign: "center" },
  tabRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  ledger: { gap: 8 },
  ledgerHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ledgerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ledgerLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  ledgerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ledgerInfo: { flex: 1 },
  ledgerDesc: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  ledgerMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  ledgerDate: { fontSize: 12 },
  ledgerRight: { alignItems: "flex-end", gap: 4 },
  ledgerAmount: { fontSize: 16, fontWeight: "700" },
  ledgerCurrency: { fontSize: 11 },
});
