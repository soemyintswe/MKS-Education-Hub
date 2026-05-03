import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/ui/SearchBar";
import { HeaderNavButtons } from "@/components/HeaderNavButtons";
import { UNIVERSITIES, University } from "@/data/mockData";
import { useI18n } from "@/hooks/useI18n";
import { useApp } from "@/context/AppContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { CmsDirectory, deleteCmsDirectory } from "@/lib/cmsContent";

type FilterType = "all" | "university" | "college" | "vocational";
type CountryFilter = "all" | "Myanmar" | "Abroad";

export default function DirectoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { language } = useI18n();
  const { activeRole } = useApp();
  const { content, refresh } = useCmsContent();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const canManageContent = activeRole === "admin";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");

  const allUniversities = (content?.directory ?? UNIVERSITIES) as (CmsDirectory | University)[];

  const filtered = useMemo(() => {
    return allUniversities.filter(u => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
        u.location.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || u.type === typeFilter;
      const matchCountry =
        countryFilter === "all" ||
        (countryFilter === "Myanmar" && u.country === "Myanmar") ||
        (countryFilter === "Abroad" && u.country !== "Myanmar");
      return matchSearch && matchType && matchCountry;
    });
  }, [allUniversities, search, typeFilter, countryFilter]);

  const typeColors: Record<FilterType, string> = {
    all: colors.primary,
    university: "#3b82f6",
    college: "#8b5cf6",
    vocational: "#f59e0b",
  };
  const typeLabels: Record<FilterType, string> = {
    all: language === "my" ? "အားလုံး" : "All",
    university: language === "my" ? "တက္ကသိုလ်" : "University",
    college: language === "my" ? "ကောလိပ်" : "College",
    vocational: language === "my" ? "အသက်မွေးဝမ်းကျောင်း" : "Vocational",
  };
  const countryLabels: Record<CountryFilter, string> = {
    all: language === "my" ? "အားလုံး" : "All",
    Myanmar: language === "my" ? "မြန်မာ" : "Myanmar",
    Abroad: language === "my" ? "ပြည်ပ" : "Abroad",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerNavRow}>
          <HeaderNavButtons iconColor="#fff" buttonColor="rgba(255,255,255,0.15)" />
        </View>
        <Text style={styles.headerTitle}>{language === "my" ? "ပညာရေးလမ်းညွှန်" : "Education Directory"}</Text>
        <Text style={styles.headerSub}>
          {language === "my" ? `${filtered.length} ခု တွေ့ရှိသည်` : `${filtered.length} institutions found`}
        </Text>
        {canManageContent ? (
          <TouchableOpacity
            style={[styles.manageBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
            onPress={() => router.push({ pathname: "/content-admin" as any, params: { section: "directory" } })}
          >
            <Feather name="edit-3" size={14} color="#fff" />
            <Text style={styles.manageBtnText}>{language === "my" ? "Directory စီမံရန်" : "Manage Directory"}</Text>
          </TouchableOpacity>
        ) : null}

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={language === "my" ? "တက္ကသိုလ်၊ ဘာသာရပ်များ ရှာဖွေပါ..." : "Search universities, programs..."}
          style={styles.searchBar}
        />

        {/* Type Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(["all", "university", "college", "vocational"] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setTypeFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: typeFilter === f ? "#fff" : "rgba(255,255,255,0.2)",
                  borderColor: typeFilter === f ? "#fff" : "transparent",
                },
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: typeFilter === f ? typeColors[f] : "#fff" },
              ]}>
                {typeLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {(["all", "Myanmar", "Abroad"] as CountryFilter[]).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setCountryFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: countryFilter === f ? colors.secondary : "rgba(255,255,255,0.2)",
                  borderColor: "transparent",
                },
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: countryFilter === f ? "#0f2027" : "#fff" },
              ]}>
                {countryLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UniversityCard university={item} colors={colors} language={language} onPress={() =>
            router.push({ pathname: "/university-detail", params: { id: item.id } })
          } canManageContent={canManageContent} onEdit={() => router.push({ pathname: "/content-admin" as any, params: { section: "directory", editId: item.id } })} onDelete={async () => {
            Alert.alert(
              language === "my" ? "ဖျက်မည်လား" : "Delete Directory?",
              language === "my" ? "ဤ Directory item ကို ဖျက်မည်လား?" : "Do you want to delete this directory item?",
              [
                { text: language === "my" ? "မဖျက်တော့" : "Cancel", style: "cancel" },
                {
                  text: language === "my" ? "ဖျက်မည်" : "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await deleteCmsDirectory(item.id);
                    await refresh();
                  },
                },
              ]
            );
          }} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {language === "my" ? "ရလဒ်မတွေ့ပါ" : "No Results"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {language === "my" ? "အခြား keyword သို့မဟုတ် filter ဖြင့် ထပ်ရှာကြည့်ပါ" : "Try different keywords or filters"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function UniversityCard({
  university,
  colors,
  onPress,
  language,
  canManageContent,
  onEdit,
  onDelete
}: {
  university: University | CmsDirectory;
  colors: any;
  onPress: () => void;
  language: "en" | "my";
  canManageContent: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeColor = university.type === "university" ? "#3b82f6" : university.type === "college" ? "#8b5cf6" : "#f59e0b";
  const typeLabel = university.type === "university"
    ? (language === "my" ? "တက္ကသိုလ်" : "University")
    : university.type === "college"
      ? (language === "my" ? "ကောလိပ်" : "College")
      : (language === "my" ? "အသက်မွေးဝမ်းကျောင်း" : "Vocational");

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardWrapper}>
      <Card variant="elevated" style={styles.uniCard}>
        <View style={styles.uniTop}>
          <View style={[styles.uniLogo, { backgroundColor: typeColor + "15" }]}>
            <Text style={styles.uniLogoText}>{university.logo}</Text>
          </View>
          <View style={styles.uniInfo}>
            <Text style={[styles.uniName, { color: colors.foreground }]} numberOfLines={2}>
              {university.name}
            </Text>
            <View style={styles.uniMeta}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[styles.uniMetaText, { color: colors.mutedForeground }]}>
                {university.location}, {university.country}
              </Text>
            </View>
          </View>
          <Badge label={typeLabel} variant={
            university.type === "university" ? "info" :
            university.type === "college" ? "primary" : "warning"
          } size="sm" />
        </View>

        {university.ranking && (
          <View style={[styles.rankingBadge, { backgroundColor: colors.secondaryLight }]}>
            <Feather name="award" size={12} color="#92400e" />
            <Text style={[styles.rankingText, { color: "#92400e" }]}>{university.ranking}</Text>
          </View>
        )}

        <View style={styles.programsRow}>
          {university.programs.slice(0, 3).map(p => (
            <View key={p} style={[styles.programTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.programText, { color: colors.mutedForeground }]}>{p}</Text>
            </View>
          ))}
          {university.programs.length > 3 && (
            <View style={[styles.programTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.programText, { color: colors.mutedForeground }]}>+{university.programs.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={styles.uniFooter}>
          <View style={styles.uniFooterItem}>
            <Feather name="book" size={12} color={colors.mutedForeground} />
            <Text style={[styles.uniFooterText, { color: colors.mutedForeground }]}>
              {university.degreeTypes.join(", ")}
            </Text>
          </View>
          <View style={styles.uniFooterItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.uniFooterText, { color: colors.mutedForeground }]}>
              {university.intake.join(", ")}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.primary} />
          {canManageContent ? (
            <View style={styles.rowActions}>
              <Pressable style={[styles.rowIconBtn, { borderColor: colors.primary }]} onPress={onEdit}>
                <Feather name="edit-2" size={14} color={colors.primary} />
              </Pressable>
              <Pressable style={[styles.rowIconBtn, { borderColor: colors.destructive }]} onPress={onDelete}>
                <Feather name="trash-2" size={14} color={colors.destructive} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
  },
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
  searchBar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  cardWrapper: {},
  uniCard: { gap: 10 },
  uniTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  uniLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uniLogoText: { fontSize: 28 },
  uniInfo: { flex: 1 },
  uniName: { fontSize: 15, fontWeight: "700", lineHeight: 20, marginBottom: 4 },
  uniMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  uniMetaText: { fontSize: 12 },
  rankingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  rankingText: { fontSize: 12, fontWeight: "600" },
  programsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  programTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  programText: { fontSize: 11, fontWeight: "500" },
  uniFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2f5f5",
  },
  uniFooterItem: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  uniFooterText: { fontSize: 11, flex: 1 },
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
  empty: { alignItems: "center", padding: 40, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
