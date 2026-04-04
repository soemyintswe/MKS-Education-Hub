import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppHeader } from "@/components/AppHeader";

interface Document {
  id: string;
  title: string;
  type: "nrc" | "household" | "certificate" | "transcript" | "photo";
  size: string;
  date: string;
  status: "verified" | "pending" | "rejected";
}

const DOCUMENTS: Document[] = [
  { id: "d1", title: "NRC Card (Front & Back)", type: "nrc", size: "2.4 MB", date: "Mar 15, 2026", status: "verified" },
  { id: "d2", title: "Family Household List", type: "household", size: "1.1 MB", date: "Mar 10, 2026", status: "verified" },
  { id: "d3", title: "Matriculation Certificate", type: "certificate", size: "890 KB", date: "Feb 28, 2026", status: "verified" },
  { id: "d4", title: "Academic Transcript", type: "transcript", size: "1.5 MB", date: "Mar 20, 2026", status: "pending" },
  { id: "d5", title: "Passport Photo (4 copies)", type: "photo", size: "800 KB", date: "Mar 25, 2026", status: "verified" },
];

export default function DocumentsScreen() {
  const colors = useColors();
  const [docs, setDocs] = useState(DOCUMENTS);

  const typeConfig: Record<Document["type"], { icon: string; color: string; label: string }> = {
    nrc: { icon: "credit-card", color: "#3b82f6", label: "NRC Card" },
    household: { icon: "home", color: "#10b981", label: "Household" },
    certificate: { icon: "award", color: "#f59e0b", label: "Certificate" },
    transcript: { icon: "file-text", color: "#8b5cf6", label: "Transcript" },
    photo: { icon: "image", color: "#ef4444", label: "Photo" },
  };

  const statusVariant: Record<Document["status"], "success" | "warning" | "danger"> = {
    verified: "success",
    pending: "warning",
    rejected: "danger",
  };

  const handleUpload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Upload Document", "Select document type to upload", [
      { text: "NRC Card", onPress: () => {} },
      { text: "Certificate", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const docCategories = [
    { type: "nrc" as const, label: "Identity Documents", desc: "NRC cards, passport, ID photos" },
    { type: "household" as const, label: "Household Documents", desc: "Family list, residence proof" },
    { type: "certificate" as const, label: "Academic Certificates", desc: "Matriculation, degrees, awards" },
    { type: "transcript" as const, label: "Transcripts & Records", desc: "Grade reports, academic records" },
    { type: "photo" as const, label: "Passport Photos", desc: "Official passport-size photos" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader
        title="Document Hub"
        showBack
        subtitle="Manage your documents"
        rightElement={
          <TouchableOpacity onPress={handleUpload} style={[styles.uploadBtn, { backgroundColor: colors.secondary }]}>
            <Feather name="upload" size={16} color="#0f2027" />
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{docs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Docs</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.success }]}>{docs.filter(d => d.status === "verified").length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Verified</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.warning }]}>{docs.filter(d => d.status === "pending").length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
          </Card>
        </View>

        {/* Documents List */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MY DOCUMENTS</Text>
        {docs.map(doc => {
          const tc = typeConfig[doc.type];
          return (
            <Card key={doc.id} variant="elevated" style={styles.docCard}>
              <View style={styles.docRow}>
                <View style={[styles.docIcon, { backgroundColor: tc.color + "15" }]}>
                  <Feather name={tc.icon as any} size={22} color={tc.color} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={[styles.docTitle, { color: colors.foreground }]}>{doc.title}</Text>
                  <View style={styles.docMeta}>
                    <Text style={[styles.docSize, { color: colors.mutedForeground }]}>{doc.size}</Text>
                    <Text style={{ color: colors.border }}>•</Text>
                    <Text style={[styles.docDate, { color: colors.mutedForeground }]}>{doc.date}</Text>
                  </View>
                </View>
                <View style={styles.docActions}>
                  <Badge label={doc.status} variant={statusVariant[doc.status]} size="sm" />
                  <TouchableOpacity style={styles.docBtn}>
                    <Feather name="download" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Upload Guide */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 8 }]}>UPLOAD GUIDE</Text>
        {docCategories.map(cat => {
          const tc = typeConfig[cat.type];
          return (
            <Card key={cat.type} variant="outlined" style={styles.guideCard}>
              <View style={styles.guideRow}>
                <View style={[styles.guideIcon, { backgroundColor: tc.color + "15" }]}>
                  <Feather name={tc.icon as any} size={18} color={tc.color} />
                </View>
                <View style={styles.guideInfo}>
                  <Text style={[styles.guideTitle, { color: colors.foreground }]}>{cat.label}</Text>
                  <Text style={[styles.guideDesc, { color: colors.mutedForeground }]}>{cat.desc}</Text>
                </View>
                <TouchableOpacity onPress={handleUpload}>
                  <Feather name="plus-circle" size={22} color={tc.color} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadText: { fontSize: 12, fontWeight: "700", color: "#0f2027" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  statCard: { flex: 1, alignItems: "center", padding: 14, gap: 4 },
  statNum: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 4 },
  docCard: {},
  docRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: "600" },
  docMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  docSize: { fontSize: 12 },
  docDate: { fontSize: 12 },
  docActions: { alignItems: "flex-end", gap: 6 },
  docBtn: { padding: 4 },
  guideCard: {},
  guideRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  guideIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  guideInfo: { flex: 1 },
  guideTitle: { fontSize: 14, fontWeight: "600" },
  guideDesc: { fontSize: 12, marginTop: 1 },
});
