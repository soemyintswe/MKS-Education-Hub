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
import { UNIVERSITIES } from "@/data/mockData";
import { useI18n } from "@/hooks/useI18n";
import { useCmsContent } from "@/hooks/useCmsContent";

export default function UniversityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { language } = useI18n();
  const { content } = useCmsContent();
  const uni = (content?.directory ?? UNIVERSITIES).find(u => u.id === id);

  if (!uni) return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title={language === "my" ? "တက္ကသိုလ်" : "University"} showBack />
      <View style={styles.notFound}><Text style={{ color: colors.foreground }}>{language === "my" ? "မတွေ့ပါ" : "Not found"}</Text></View>
    </View>
  );

  const typeColor = uni.type === "university" ? "#3b82f6" : uni.type === "college" ? "#8b5cf6" : "#f59e0b";

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      (language === "my" ? "လျှောက်ထားမည် - " : "Apply to ") + uni.name,
      language === "my"
        ? "သင့်ဝင်ခွင့်လျှောက်လွှာကို ကျွန်ုပ်တို့အဖွဲ့မှ ကူညီဆောင်ရွက်ပေးပါမည်။"
        : "Our team will assist you with your admission application.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader title={uni.name} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Card variant="elevated" style={styles.heroCard}>
          <View style={[styles.logo, { backgroundColor: typeColor + "15" }]}>
            <Text style={styles.logoText}>{uni.logo}</Text>
          </View>
          <Text style={[styles.uniName, { color: colors.foreground }]}>{uni.name}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{uni.location}, {uni.country}</Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge
              label={uni.type === "university"
                ? (language === "my" ? "တက္ကသိုလ်" : "University")
                : uni.type === "college"
                  ? (language === "my" ? "ကောလိပ်" : "College")
                  : (language === "my" ? "အသက်မွေးဝမ်းကျောင်း" : "Vocational")}
              variant={uni.type === "university" ? "info" : uni.type === "college" ? "primary" : "warning"}
            />
            {uni.ranking && <Badge label={uni.ranking} variant="secondary" />}
          </View>
        </Card>

        {/* Intake */}
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{language === "my" ? "လက်ခံသည့်ကာလ" : "Intake Periods"}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{uni.intake.join(", ")}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.secondaryLight }]}>
              <Feather name="dollar-sign" size={16} color="#92400e" />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{language === "my" ? "ကျောင်းလခအတိုင်းအတာ" : "Tuition Range"}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{uni.tuitionRange}</Text>
            </View>
          </View>
        </Card>

        {/* Requirements */}
        <Card variant="elevated">
          <View style={styles.sectionHeader}>
            <Feather name="check-circle" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{language === "my" ? "ဝင်ခွင့်လိုအပ်ချက်များ" : "Admission Requirements"}</Text>
          </View>
          <Text style={[styles.reqText, { color: colors.foreground }]}>{uni.requirements}</Text>
        </Card>

        {/* Programs */}
        <Card variant="elevated">
          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{language === "my" ? "ရရှိနိုင်သောဘာသာရပ်များ" : "Available Programs"}</Text>
          </View>
          <View style={styles.programGrid}>
            {uni.programs.map(p => (
              <View key={p} style={[styles.programTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.programText, { color: colors.primary }]}>{p}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Degree Types */}
        <Card variant="elevated">
          <View style={styles.sectionHeader}>
            <Feather name="award" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{language === "my" ? "ဘွဲ့အမျိုးအစားများ" : "Degree Types"}</Text>
          </View>
          <View style={styles.programGrid}>
            {uni.degreeTypes.map(d => (
              <View key={d} style={[styles.degreeTag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.degreeText, { color: colors.foreground }]}>{d}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Button
          onPress={handleApply}
          label={language === "my" ? "ဝင်ခွင့်လျှောက်မည်" : "Apply for Admission"}
          fullWidth
          size="lg"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroCard: { alignItems: "center", gap: 10 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 40 },
  uniName: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 14 },
  badgeRow: { flexDirection: "row", gap: 8 },
  infoCard: { gap: 12 },
  infoRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  reqText: { fontSize: 14, lineHeight: 22 },
  programGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  programTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  programText: { fontSize: 13, fontWeight: "600" },
  degreeTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  degreeText: { fontSize: 13, fontWeight: "600" },
});
