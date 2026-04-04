import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/ui/SearchBar";
import { UNIVERSITIES, University } from "@/data/mockData";

type FilterType = "all" | "university" | "college" | "vocational";
type CountryFilter = "all" | "Myanmar" | "Abroad";

export default function DirectoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");

  const filtered = useMemo(() => {
    return UNIVERSITIES.filter(u => {
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
  }, [search, typeFilter, countryFilter]);

  const typeColors: Record<FilterType, string> = {
    all: colors.primary,
    university: "#3b82f6",
    college: "#8b5cf6",
    vocational: "#f59e0b",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Education Directory</Text>
        <Text style={styles.headerSub}>{filtered.length} institutions found</Text>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search universities, programs..."
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
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
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
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UniversityCard university={item} colors={colors} onPress={() =>
            router.push({ pathname: "/university-detail", params: { id: item.id } })
          } />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Results</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try different keywords or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

function UniversityCard({ university, colors, onPress }: { university: University; colors: any; onPress: () => void }) {
  const typeColor = university.type === "university" ? "#3b82f6" : university.type === "college" ? "#8b5cf6" : "#f59e0b";
  const typeLabel = university.type.charAt(0).toUpperCase() + university.type.slice(1);

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
  empty: { alignItems: "center", padding: 40, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
