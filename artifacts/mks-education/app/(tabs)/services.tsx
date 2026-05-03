import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HeaderNavButtons } from "@/components/HeaderNavButtons";
import { SERVICES } from "@/data/mockData";
import { useI18n } from "@/hooks/useI18n";
import { translateServiceTitle } from "@/lib/i18n";
import { useApp } from "@/context/AppContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { CmsService, deleteCmsService } from "@/lib/cmsContent";

type CategoryFilter = "all" | "education" | "legal" | "document";

export default function ServicesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { language } = useI18n();
  const { activeRole } = useApp();
  const { content, refresh } = useCmsContent();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [category, setCategory] = useState<CategoryFilter>("all");
  const canManageContent = activeRole === "admin";

  const allServices = (content?.services ?? SERVICES) as CmsService[];
  const filtered = category === "all" ? allServices : allServices.filter(s => s.category === category);

  const categoryConfig: Record<CategoryFilter, { label: string; icon: string; color: string }> = {
    all: { label: language === "my" ? "ဝန်ဆောင်မှုအားလုံး" : "All Services", icon: "grid", color: colors.primary },
    education: { label: language === "my" ? "ပညာရေး" : "Education", icon: "book-open", color: "#3b82f6" },
    legal: { label: language === "my" ? "ဥပဒေ" : "Legal", icon: "shield", color: "#8b5cf6" },
    document: { label: language === "my" ? "စာရွက်စာတမ်း" : "Documents", icon: "file-text", color: "#10b981" },
  };
  const categoryBadgeLabel: Record<"education" | "legal" | "document", string> = {
    education: language === "my" ? "ပညာရေး" : "Education",
    legal: language === "my" ? "ဥပဒေ" : "Legal",
    document: language === "my" ? "စာရွက်စာတမ်း" : "Document",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerNavRow}>
          <HeaderNavButtons iconColor="#fff" buttonColor="rgba(255,255,255,0.15)" />
        </View>
        <Text style={styles.title}>{language === "my" ? "ဝန်ဆောင်မှုများ" : "Our Services"}</Text>
        <Text style={styles.subtitle}>
          {language === "my" ? "ပညာရေးနှင့် ဥပဒေဆိုင်ရာဝန်ဆောင်မှုများ" : "Comprehensive education & legal solutions"}
        </Text>
        {canManageContent ? (
          <TouchableOpacity
            style={[styles.manageBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
            onPress={() => router.push({ pathname: "/content-admin" as any, params: { section: "services" } })}
          >
            <Feather name="edit-3" size={14} color="#fff" />
            <Text style={styles.manageBtnText}>{language === "my" ? "Service များစီမံရန်" : "Manage Services"}</Text>
          </TouchableOpacity>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(Object.entries(categoryConfig) as [CategoryFilter, typeof categoryConfig[CategoryFilter]][]).map(([key, conf]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setCategory(key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: category === key ? "#fff" : "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Feather name={conf.icon as any} size={13} color={category === key ? conf.color : "#fff"} />
              <Text style={[styles.filterText, { color: category === key ? conf.color : "#fff" }]}>
                {conf.label}
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
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {language === "my" ? `${filtered.length} ခု ရရှိနိုင်သည်` : `${filtered.length} services available`}
        </Text>

        {filtered.map(svc => (
          <TouchableOpacity
            key={svc.id}
            onPress={() => router.push({ pathname: "/service-detail", params: { id: svc.id } })}
            activeOpacity={0.85}
          >
            <Card variant="elevated" style={styles.svcCard}>
              <View style={styles.svcRow}>
                <View style={[styles.svcIcon, { backgroundColor: svc.color + "20" }]}>
                  <Feather name={svc.icon as any} size={26} color={svc.color} />
                </View>
                <View style={styles.svcInfo}>
                  <View style={styles.svcTitleRow}>
                    <Text style={[styles.svcTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {translateServiceTitle(language, svc.id, svc.title)}
                    </Text>
                    <Badge
                      label={categoryBadgeLabel[svc.category]}
                      variant={svc.category === "education" ? "info" : svc.category === "legal" ? "primary" : "success"}
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.svcDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {svc.description}
                  </Text>
                  <View style={styles.svcMeta}>
                    <View style={styles.svcMetaItem}>
                      <Feather name="tag" size={12} color={svc.color} />
                      <Text style={[styles.svcMetaText, { color: colors.mutedForeground }]}>{svc.price}</Text>
                    </View>
                    <View style={styles.svcMetaItem}>
                      <Feather name="clock" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.svcMetaText, { color: colors.mutedForeground }]}>{svc.duration}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  {canManageContent ? (
                    <>
                      <Pressable
                        style={[styles.rowIconBtn, { borderColor: colors.primary }]}
                        onPress={() => router.push({ pathname: "/content-admin" as any, params: { section: "services", editId: svc.id } })}
                      >
                        <Feather name="edit-2" size={14} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        style={[styles.rowIconBtn, { borderColor: colors.destructive }]}
                        onPress={() => {
                          Alert.alert(
                            language === "my" ? "ဖျက်မည်လား" : "Delete Service?",
                            language === "my" ? "ဤ Service ကို ဖျက်မည်လား?" : "Do you want to delete this service?",
                            [
                              { text: language === "my" ? "မဖျက်တော့" : "Cancel", style: "cancel" },
                              {
                                text: language === "my" ? "ဖျက်မည်" : "Delete",
                                style: "destructive",
                                onPress: async () => {
                                  await deleteCmsService(svc.id);
                                  await refresh();
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Feather name="trash-2" size={14} color={colors.destructive} />
                      </Pressable>
                    </>
                  ) : null}
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerNavRow: {
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 14 },
  manageBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 10,
  },
  manageBtnText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  filterRow: { flexDirection: "row", marginBottom: 4 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  count: { fontSize: 13, marginBottom: 4 },
  svcCard: { gap: 0 },
  svcRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  svcIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  svcInfo: { flex: 1 },
  svcTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  svcTitle: { fontSize: 15, fontWeight: "700", flex: 1, lineHeight: 20 },
  svcDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  svcMeta: { flexDirection: "row", gap: 14 },
  svcMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  svcMetaText: { fontSize: 12 },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
