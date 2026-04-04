import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/AppHeader";
import { SERVICES } from "@/data/mockData";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const svc = SERVICES.find(s => s.id === id);

  if (!svc) return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title="Service" showBack />
      <View style={styles.notFound}>
        <Text style={{ color: colors.foreground }}>Service not found</Text>
      </View>
    </View>
  );

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Application Started", `Your application for "${svc.title}" has been initiated. Our team will contact you shortly.`, [
      { text: "OK" },
    ]);
  };

  const requirements = [
    "Valid NRC Card (Front and Back copies)",
    "Family Household List (official document)",
    "Academic certificates/transcripts",
    "Passport-size photos (4 copies)",
    "Application form (provided by MKS)",
    ...(svc.category === "legal" ? ["Sworn statement if required"] : []),
  ];

  const process = [
    "Submit your application with required documents",
    "Document verification by MKS team (1-2 business days)",
    "Application submitted to relevant authority",
    "Processing and review period",
    "Result notification and document collection",
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title={svc.title} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Card variant="primary" style={styles.heroCard}>
          <View style={[styles.svcIcon, { backgroundColor: svc.color + "30" }]}>
            <Feather name={svc.icon as any} size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{svc.title}</Text>
          <Text style={styles.heroDesc}>{svc.description}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Feather name="tag" size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.heroMetaText}>{svc.price}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.heroMetaText}>{svc.duration}</Text>
            </View>
          </View>
        </Card>

        {/* Category */}
        <View style={styles.categoryRow}>
          <Badge
            label={svc.category.charAt(0).toUpperCase() + svc.category.slice(1) + " Service"}
            variant={svc.category === "education" ? "info" : svc.category === "legal" ? "primary" : "success"}
          />
        </View>

        {/* Requirements */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="check-square" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Required Documents</Text>
          </View>
          {requirements.map((req, i) => (
            <View key={i} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.listText, { color: colors.foreground }]}>{req}</Text>
            </View>
          ))}
        </Card>

        {/* Process */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="git-branch" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Application Process</Text>
          </View>
          {process.map((step, i) => (
            <View key={i} style={styles.processRow}>
              <View style={[styles.processNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.processNumText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.processText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </Card>

        {/* Apply Button */}
        <Button
          onPress={handleApply}
          label="Apply for This Service"
          fullWidth
          size="lg"
          style={styles.applyBtn}
        />

        <TouchableOpacity style={styles.chatLink}>
          <Feather name="message-circle" size={16} color={colors.primary} />
          <Text style={[styles.chatLinkText, { color: colors.primary }]}>
            Have questions? Chat with our team
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroCard: { alignItems: "center", gap: 10 },
  svcIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "#fff", textAlign: "center" },
  heroDesc: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20 },
  heroMeta: { flexDirection: "row", gap: 20, marginTop: 4 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  categoryRow: { flexDirection: "row" },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  listText: { fontSize: 14, flex: 1, lineHeight: 20 },
  processRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  processNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  processNumText: { fontSize: 13, fontWeight: "700" },
  processText: { fontSize: 14, flex: 1, lineHeight: 20, paddingTop: 3 },
  applyBtn: { marginTop: 4 },
  chatLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  chatLinkText: { fontSize: 14, fontWeight: "600" },
});
