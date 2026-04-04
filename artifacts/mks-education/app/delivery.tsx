import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppHeader } from "@/components/AppHeader";
import { DELIVERIES } from "@/data/mockData";

export default function DeliveryScreen() {
  const colors = useColors();

  const statusConfig = {
    processing: { label: "Processing", variant: "warning" as const, color: colors.warning },
    picked_up: { label: "Picked Up", variant: "info" as const, color: colors.info },
    in_transit: { label: "In Transit", variant: "primary" as const, color: colors.primary },
    out_for_delivery: { label: "Out for Delivery", variant: "secondary" as const, color: colors.secondary },
    delivered: { label: "Delivered", variant: "success" as const, color: colors.success },
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title="Delivery Tracking" showBack subtitle="Document shipping status" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {DELIVERIES.map(delivery => {
          const sc = statusConfig[delivery.status];
          return (
            <View key={delivery.id} style={styles.deliveryGroup}>
              {/* Header Card */}
              <Card variant="primary" style={styles.headerCard}>
                <View style={styles.trackRow}>
                  <View>
                    <Text style={styles.trackLabel}>Tracking Number</Text>
                    <Text style={styles.trackNum}>{delivery.trackingNumber}</Text>
                  </View>
                  <Badge label={sc.label} variant={sc.variant} />
                </View>
                <View style={styles.routeRow}>
                  <View style={styles.routePoint}>
                    <Feather name="map-pin" size={14} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.routeText}>{delivery.origin}</Text>
                  </View>
                  <View style={styles.routeArrow}>
                    <View style={styles.routeLine} />
                    <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
                  </View>
                  <View style={styles.routePoint}>
                    <Feather name="flag" size={14} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.routeText}>{delivery.destination}</Text>
                  </View>
                </View>
                <View style={styles.deliveryMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="package" size={13} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metaText}>{delivery.documents}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="truck" size={13} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metaText}>{delivery.carrier}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={13} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metaText}>Est: {delivery.estimatedDate}</Text>
                  </View>
                </View>
              </Card>

              {/* Timeline */}
              <Card variant="elevated" style={styles.timelineCard}>
                <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Shipment Timeline</Text>
                {delivery.steps.map((step, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        {
                          backgroundColor: step.completed ? colors.primary : "transparent",
                          borderColor: step.completed ? colors.primary : colors.border,
                        },
                      ]}>
                        {step.completed && <Feather name="check" size={10} color="#fff" />}
                      </View>
                      {i < delivery.steps.length - 1 && (
                        <View style={[
                          styles.timelineLine,
                          { backgroundColor: step.completed ? colors.primary : colors.border },
                        ]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[
                        styles.timelineStepTitle,
                        { color: step.completed ? colors.foreground : colors.mutedForeground, fontWeight: step.completed ? "600" : "400" },
                      ]}>
                        {step.title}
                      </Text>
                      <Text style={[styles.timelineLocation, { color: colors.mutedForeground }]}>
                        {step.location}
                      </Text>
                      {step.time && (
                        <Text style={[styles.timelineTime, { color: colors.primary }]}>{step.time}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          );
        })}

        {DELIVERIES.length === 0 && (
          <View style={styles.empty}>
            <Feather name="truck" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Active Deliveries</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your document shipments will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  deliveryGroup: { gap: 12 },
  headerCard: { gap: 14 },
  trackRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  trackLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  trackNum: { fontSize: 16, fontWeight: "700", color: "#fff" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  routePoint: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  routeText: { fontSize: 12, color: "rgba(255,255,255,0.85)", flex: 1 },
  routeArrow: { flexDirection: "row", alignItems: "center" },
  routeLine: { width: 16, height: 1, backgroundColor: "rgba(255,255,255,0.4)" },
  deliveryMeta: { gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontSize: 12, color: "rgba(255,255,255,0.8)", flex: 1 },
  timelineCard: { gap: 0 },
  timelineTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  timelineRow: { flexDirection: "row", gap: 14 },
  timelineLeft: { alignItems: "center", width: 22 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 3,
  },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineStepTitle: { fontSize: 14 },
  timelineLocation: { fontSize: 12, marginTop: 2 },
  timelineTime: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  empty: { alignItems: "center", padding: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
