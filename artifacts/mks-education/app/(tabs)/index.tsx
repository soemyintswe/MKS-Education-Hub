import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SAMPLE_ORDERS, SERVICES, PAYMENT_RECORDS, UNIVERSITIES } from "@/data/mockData";
import { SHADOW } from "@/constants/theme";
import { getScopedOrders, getScopedPayments } from "@/lib/roleScope";
import { useI18n } from "@/hooks/useI18n";
import { useCmsContent } from "@/hooks/useCmsContent";
import { DEFAULT_ABOUT, DEFAULT_NEWS, deleteCmsAbout, deleteCmsDirectory, deleteCmsNews, deleteCmsService } from "@/lib/cmsContent";
import {
  translateNotificationMessage,
  translateNotificationTitle,
  translateServiceTitle
} from "@/lib/i18n";

function textByLang(language: "en" | "my", enText: string, myText: string) {
  return language === "my" ? myText : enText;
}

function formatMMK(amount: number) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
}

export default function HomeScreen() {
  const colors = useColors();
  const { t, language } = useI18n();
  const {
    user,
    activeRole,
    notifications,
    unreadNotificationCount,
    logout,
    toggleLanguage,
  } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { content, refresh } = useCmsContent();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const scopedOrders = useMemo(
    () => getScopedOrders(SAMPLE_ORDERS, user, activeRole),
    [user, activeRole]
  );
  const scopedPayments = useMemo(
    () => getScopedPayments(PAYMENT_RECORDS, scopedOrders, activeRole),
    [scopedOrders, activeRole]
  );

  const activeOrders = scopedOrders.filter(o => o.status === "in_progress" || o.status === "pending");
  const totalPaid = scopedPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingPay = scopedPayments
    .filter(p => p.status === "pending" || p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);

  const roleLabel =
    activeRole === "student" ? t("roleStudent") : activeRole === "agent" ? t("roleAgent") : t("roleAdmin");
  const canManageContent = activeRole === "admin";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("goodMorning");
    if (h < 17) return t("goodAfternoon");
    return t("goodEvening");
  };

  const menuEntries = user
    ? [
        {
          key: "profile",
          icon: "user",
          label: textByLang(language, "Profile", "ပရိုဖိုင်"),
          onPress: async () => router.push("/profile"),
        },
        {
          key: "orders",
          icon: "clipboard",
          label: textByLang(language, "My Orders", "ကျွန်ုပ်၏အော်ဒါများ"),
          onPress: async () => router.push("/(tabs)/orders"),
        },
        {
          key: "students",
          icon: "users",
          label: textByLang(language, "Students", "ကျောင်းသားများ"),
          onPress: async () => router.push("/students"),
        },
        ...(canManageContent
          ? [
              {
                key: "content-admin",
                icon: "edit-3",
                label: textByLang(language, "Content Admin", "Content စီမံခန့်ခွဲမှု"),
                onPress: async () => router.push("/content-admin" as any),
              },
            ]
          : []),
        {
          key: "logout",
          icon: "log-out",
          label: loggingOut
            ? textByLang(language, "Logging out...", "ထွက်နေသည်...")
            : textByLang(language, "Logout", "အကောင့်ထွက်ရန်"),
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
              router.replace("/");
            } catch {
              Alert.alert(
                textByLang(language, "Error", "အမှား"),
                textByLang(language, "Unable to logout. Please try again.", "Logout မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။")
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    : [
        {
          key: "services",
          icon: "grid",
          label: textByLang(language, "Services", "ဝန်ဆောင်မှုများ"),
          onPress: async () => router.push("/(tabs)/services"),
        },
        {
          key: "directory",
          icon: "book-open",
          label: textByLang(language, "Education Directory", "ပညာရေးလမ်းညွှန်"),
          onPress: async () => router.push("/(tabs)/directory"),
        },
        {
          key: "login",
          icon: "log-in",
          label: textByLang(language, "Login", "လော့ဂ်အင်"),
          onPress: async () => router.push("/login"),
        },
        {
          key: "register",
          icon: "user-plus",
          label: textByLang(language, "Register", "စာရင်းသွင်းရန်"),
          onPress: async () => router.push("/register"),
        },
      ];

  const renderCommonPublicSections = (showSharedCard: boolean) => {
    const publicServices = (content?.services ?? SERVICES).slice(0, 6);
    const previewSchools = (content?.directory ?? UNIVERSITIES).slice(0, 4);
    const about = content?.about ?? DEFAULT_ABOUT;
    const highlights =
      language === "my"
        ? about?.highlightsMy ?? []
        : about?.highlightsEn ?? [];

    return (
      <>
        <View style={styles.section}>
          <SectionHeader
            title={textByLang(language, "About MKS", "MKS အကြောင်း")}
            icon="info"
            onSeeAll={
              canManageContent
                ? () => router.push({ pathname: "/content-admin" as any, params: { section: "about" } })
                : undefined
            }
          />
          <Card variant="elevated" style={styles.aboutCard}>
            <View style={styles.aboutTitleRow}>
              <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
                {language === "my" ? about?.titleMy ?? "" : about?.titleEn ?? ""}
              </Text>
              {canManageContent ? (
                <View style={styles.inlineActions}>
                  <Pressable
                    style={[styles.inlineActionBtn, { borderColor: colors.primary }]}
                    onPress={() => router.push({ pathname: "/content-admin" as any, params: { section: "about" } })}
                  >
                    <Feather name="edit-2" size={13} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.inlineActionBtn, { borderColor: colors.destructive }]}
                    onPress={() => {
                      Alert.alert(
                        language === "my" ? "About ကို reset လုပ်မည်လား" : "Reset About Content?",
                        language === "my"
                          ? "About content ကို default ပြန်ထားမည်လား?"
                          : "Do you want to reset About content to default?",
                        [
                          { text: language === "my" ? "မလုပ်တော့" : "Cancel", style: "cancel" },
                          {
                            text: language === "my" ? "ပြန်ချိန်မည်" : "Reset",
                            style: "destructive",
                            onPress: async () => {
                              await deleteCmsAbout();
                              await refresh();
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Feather name="trash-2" size={13} color={colors.destructive} />
                  </Pressable>
                </View>
              ) : null}
            </View>
            <Text style={[styles.aboutBody, { color: colors.mutedForeground }]}>
              {language === "my" ? about?.bodyMy ?? "" : about?.bodyEn ?? ""}
            </Text>
            <View style={styles.aboutHighlights}>
              {highlights.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.aboutHighlightRow}>
                  <Feather name="check-circle" size={16} color={colors.primary} />
                  <Text style={[styles.aboutHighlightText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={textByLang(language, "Featured Services", "ရရှိနိုင်သည့် ဝန်ဆောင်မှုများ")}
            icon="layers"
            onSeeAll={
              canManageContent
                ? () => router.push({ pathname: "/content-admin" as any, params: { section: "services" } })
                : () => router.push("/(tabs)/services")
            }
          />
          <View style={styles.servicesGrid}>
            {publicServices.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, { backgroundColor: colors.card, ...SHADOW.sm }]}
                onPress={() => router.push({ pathname: "/service-detail", params: { id: svc.id } })}
                activeOpacity={0.85}
              >
                <View style={[styles.svcIcon, { backgroundColor: svc.color + "20" }]}>
                  <Feather name={svc.icon as any} size={22} color={svc.color} />
                </View>
                <Text style={[styles.svcTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {translateServiceTitle(language, svc.id, svc.title)}
                </Text>
                {canManageContent ? (
                  <View style={styles.cardActionsRow}>
                    <Pressable
                      style={[styles.inlineActionBtn, { borderColor: colors.primary }]}
                      onPress={event => {
                        event.stopPropagation();
                        router.push({ pathname: "/content-admin" as any, params: { section: "services", editId: svc.id } });
                      }}
                    >
                      <Feather name="edit-2" size={12} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={[styles.inlineActionBtn, { borderColor: colors.destructive }]}
                      onPress={event => {
                        event.stopPropagation();
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
                      <Feather name="trash-2" size={12} color={colors.destructive} />
                    </Pressable>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={textByLang(language, "Latest News", "နောက်ဆုံးရသတင်းများ")}
            icon="radio"
            onSeeAll={
              canManageContent
                ? () => router.push({ pathname: "/content-admin" as any, params: { section: "news" } })
                : undefined
            }
          />
          {(content?.news ?? DEFAULT_NEWS).map(news => (
            <Card key={news.id} variant="elevated" style={styles.newsCard}>
              <View style={styles.newsTop}>
                <Badge
                  label={language === "my" ? news.categoryMy : news.categoryEn}
                  variant="info"
                  size="sm"
                />
                <View style={styles.newsTopRight}>
                  <Text style={[styles.newsDate, { color: colors.mutedForeground }]}>{news.date}</Text>
                  {canManageContent ? (
                    <View style={styles.newsActions}>
                      <Pressable
                        style={[styles.newsActionBtn, { borderColor: colors.primary }]}
                        onPress={() => router.push({ pathname: "/content-admin" as any, params: { section: "news", editId: news.id } })}
                      >
                        <Feather name="edit-2" size={13} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        style={[styles.newsActionBtn, { borderColor: colors.destructive }]}
                        onPress={() => {
                          Alert.alert(
                            language === "my" ? "ဖျက်မည်လား" : "Delete News?",
                            language === "my" ? "ဤ News item ကို ဖျက်မည်လား?" : "Do you want to delete this news item?",
                            [
                              { text: language === "my" ? "မဖျက်တော့" : "Cancel", style: "cancel" },
                              {
                                text: language === "my" ? "ဖျက်မည်" : "Delete",
                                style: "destructive",
                                onPress: async () => {
                                  await deleteCmsNews(news.id);
                                  await refresh();
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Feather name="trash-2" size={13} color={colors.destructive} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
              <Text style={[styles.newsTitle, { color: colors.foreground }]}>
                {language === "my" ? news.titleMy : news.titleEn}
              </Text>
              <Text style={[styles.newsSummary, { color: colors.mutedForeground }]}>
                {language === "my" ? news.summaryMy : news.summaryEn}
              </Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={textByLang(language, "Education Directory", "Education Directory")}
            icon="book-open"
            onSeeAll={
              canManageContent
                ? () => router.push({ pathname: "/content-admin" as any, params: { section: "directory" } })
                : () => router.push("/(tabs)/directory")
            }
          />
          <View style={styles.directoryGrid}>
            {previewSchools.map(school => (
              <TouchableOpacity
                key={school.id}
                style={[styles.directoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: "/university-detail", params: { id: school.id } })}
                activeOpacity={0.85}
              >
                <Text style={styles.directoryEmoji}>{school.logo ?? "🏫"}</Text>
                <Text style={[styles.directoryName, { color: colors.foreground }]} numberOfLines={2}>
                  {school.name}
                </Text>
                <Text style={[styles.directoryMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {school.location}, {school.country}
                </Text>
                {canManageContent ? (
                  <View style={styles.cardActionsRow}>
                    <Pressable
                      style={[styles.inlineActionBtn, { borderColor: colors.primary }]}
                      onPress={event => {
                        event.stopPropagation();
                        router.push({ pathname: "/content-admin" as any, params: { section: "directory", editId: school.id } });
                      }}
                    >
                      <Feather name="edit-2" size={12} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={[styles.inlineActionBtn, { borderColor: colors.destructive }]}
                      onPress={event => {
                        event.stopPropagation();
                        Alert.alert(
                          language === "my" ? "ဖျက်မည်လား" : "Delete School?",
                          language === "my" ? "ဤ Directory item ကို ဖျက်မည်လား?" : "Do you want to delete this directory item?",
                          [
                            { text: language === "my" ? "မဖျက်တော့" : "Cancel", style: "cancel" },
                            {
                              text: language === "my" ? "ဖျက်မည်" : "Delete",
                              style: "destructive",
                              onPress: async () => {
                                await deleteCmsDirectory(school.id);
                                await refresh();
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Feather name="trash-2" size={12} color={colors.destructive} />
                    </Pressable>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showSharedCard ? (
          <View style={styles.section}>
            <Card variant="outlined" style={styles.sharedInfoCard}>
              <Text style={[styles.sharedInfoTitle, { color: colors.foreground }]}>
                {textByLang(language, "Public Information Area", "လူတိုင်းကြည့်နိုင်သော အချက်အလက်များ")}
              </Text>
              <Text style={[styles.sharedInfoText, { color: colors.mutedForeground }]}>
                {textByLang(
                  language,
                  "This information is visible to Admin, Agent, and Student users, and also to guests before login.",
                  "ဤအချက်အလက်များကို Admin / Agent / Student အားလုံးနှင့် Guest အသုံးပြုသူများလည်း Login မဝင်ခင် ကြည့်ရှုနိုင်ပါသည်။"
                )}
              </Text>
            </Card>
          </View>
        ) : null}
      </>
    );
  };

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.landingHero, { backgroundColor: colors.primary }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.headerLeft}>
                <View style={[styles.logoBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.logoText}>MKS</Text>
                </View>
                <View>
                  <Text style={styles.headerGreeting}>{textByLang(language, "Welcome to", "ကြိုဆိုပါတယ်")}</Text>
                  <Text style={styles.headerName}>{textByLang(language, "MKS Education Hub", "MKS Education Hub")}</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerBtn} onPress={toggleLanguage}>
                  <Feather name="globe" size={18} color="#fff" />
                  <Text style={styles.langText}>{language === "en" ? "EN" : "MM"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/login")}>
                  <Feather name="log-in" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/register")}>
                  <Feather name="user-plus" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setMenuVisible(true)}>
                  <Feather name="menu" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {textByLang(language, "Your Trusted Education & Legal Partner", "ပညာရေးနှင့် ဥပဒေဝန်ဆောင်မှု ယုံကြည်ရသော မိတ်ဖက်")}
            </Text>
            <Text style={styles.heroSubtitle}>
              {textByLang(
                language,
                "Apply, track, and manage education services in one place.",
                "ပညာရေးဝန်ဆောင်မှု လုပ်ငန်းများကို တစ်နေရာတည်းတွင် လျှောက်ထား၊ စောင့်ကြည့်၊ စီမံနိုင်ပါသည်။"
              )}
            </Text>

            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: colors.secondary }]}
                onPress={() => router.push("/login")}
              >
                <Feather name="log-in" size={16} color="#0f2027" />
                <Text style={[styles.heroActionText, { color: "#0f2027" }]}>{t("login")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heroActionBtn,
                  {
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                ]}
                onPress={() => router.push("/register")}
              >
                <Feather name="user-plus" size={16} color="#fff" />
                <Text style={[styles.heroActionText, { color: "#fff" }]}>{t("register")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderCommonPublicSections(false)}
        </ScrollView>

        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <Pressable style={[styles.modalPanel, { backgroundColor: colors.card }]} onPress={() => null}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {textByLang(language, "Menu", "မီနူး")}
              </Text>
              {menuEntries.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.modalItem, { borderColor: colors.border }]}
                  onPress={async () => {
                    setMenuVisible(false);
                    await item.onPress();
                  }}
                >
                  <Feather name={item.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.modalItemText, { color: colors.foreground }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoBadge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.logoText}>MKS</Text>
            </View>
            <View>
              <Text style={styles.headerGreeting}>{greeting()},</Text>
              <Text style={styles.headerName}>{user?.name?.split(" ")[0]} 👋</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={toggleLanguage}>
              <Feather name="globe" size={18} color="#fff" />
              <Text style={styles.langText}>{language === "en" ? "EN" : "MM"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            >
              <Feather name="home" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/notifications")}>
              <Feather name="bell" size={20} color="#fff" />
              {unreadNotificationCount > 0 ? (
                <View style={[styles.notifDot, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.notifCount}>{unreadNotificationCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/profile")}>
              <Feather name="user" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setMenuVisible(true)}>
              <Feather name="menu" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roleBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather
              name={activeRole === "student" ? "book-open" : activeRole === "agent" ? "briefcase" : "shield"}
              size={12}
              color="#fff"
            />
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
          {activeRole === "student" && user?.studentId ? (
            <Text style={styles.studentId}>ID: {user.studentId}</Text>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeOrders.length}</Text>
            <Text style={styles.statLabel}>{t("activeOrders")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatMMK(totalPaid)}</Text>
            <Text style={styles.statLabel}>{t("paid")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, pendingPay > 0 && { color: colors.secondary }]}>
              {formatMMK(pendingPay)}
            </Text>
            <Text style={styles.statLabel}>{t("pending")}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeOrders.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={t("activeOrders")}
              icon="clock"
              onSeeAll={() => router.push("/(tabs)/orders")}
            />
            {activeOrders.map(order => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: "/order-detail", params: { id: order.id } })}
              >
                <Card style={styles.orderCard} variant="elevated">
                  <View style={styles.orderTop}>
                    <Text style={[styles.orderTitle, { color: colors.foreground }]}>{order.serviceTitle}</Text>
                    <Badge
                      label={order.status === "in_progress" ? t("inProgress") : t("pending")}
                      variant={order.status === "in_progress" ? "primary" : "warning"}
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.orderMeta, { color: colors.mutedForeground }]}>
                    {order.assignedAgent
                      ? t("agentLabel", { name: order.assignedAgent })
                      : t("awaitingAssignment")}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(order.steps.filter(s => s.completed).length / order.steps.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                    {t("stepsCompleted", {
                      done: order.steps.filter(s => s.completed).length,
                      total: order.steps.length,
                    })}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title={t("quickServices")}
            icon="grid"
            onSeeAll={() => router.push("/(tabs)/services")}
          />
          <View style={styles.servicesGrid}>
            {SERVICES.slice(0, 6).map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, { backgroundColor: colors.card, ...SHADOW.sm }]}
                onPress={() => router.push({ pathname: "/service-detail", params: { id: svc.id } })}
                activeOpacity={0.85}
              >
                <View style={[styles.svcIcon, { backgroundColor: svc.color + "20" }]}>
                  <Feather name={svc.icon as any} size={22} color={svc.color} />
                </View>
                <Text style={[styles.svcTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {translateServiceTitle(language, svc.id, svc.title)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t("notificationsSection")}
            icon="bell"
            onSeeAll={() => router.push("/notifications")}
          />
          {notifications.slice(0, 3).map(notif => (
            <Card key={notif.id} style={styles.notifCard} variant={notif.read ? "outlined" : "elevated"}>
              <View style={styles.notifRow}>
                <View
                  style={[
                    styles.notifIcon,
                    {
                      backgroundColor:
                        notif.type === "success"
                          ? colors.successLight
                          : notif.type === "warning"
                            ? colors.warningLight
                            : notif.type === "alert"
                              ? "#fee2e2"
                              : colors.infoLight,
                    },
                  ]}
                >
                  <Feather
                    name={notif.icon as any}
                    size={16}
                    color={
                      notif.type === "success"
                        ? colors.success
                        : notif.type === "warning"
                          ? colors.warning
                          : notif.type === "alert"
                            ? colors.destructive
                            : colors.info
                    }
                  />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                      {translateNotificationTitle(language, notif.id, notif.title)}
                    </Text>
                    {!notif.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                  <Text style={[styles.notifMessage, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {translateNotificationMessage(language, notif.id, notif.message)}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
                </View>
              </View>
            </Card>
          ))}
          {notifications.length === 0 ? (
            <Card style={styles.notifCard} variant="outlined">
              <Text style={[styles.notifMessage, { color: colors.mutedForeground }]}>{t("noNotifications")}</Text>
            </Card>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title={t("financialSummary")} icon="credit-card" onSeeAll={() => router.push("/financials")} />
          <Card variant="primary" style={styles.financeCard}>
            <Text style={styles.financeLabel}>{t("totalAmountPaid")}</Text>
            <Text style={styles.financeAmount}>{totalPaid.toLocaleString()} MMK</Text>
            {pendingPay > 0 ? (
              <View style={[styles.pendingPill, { backgroundColor: "rgba(251,191,36,0.25)" }]}>
                <Feather name="alert-circle" size={14} color={colors.secondary} />
                <Text style={[styles.pendingText, { color: colors.secondary }]}>
                  {t("outstanding", { amount: pendingPay.toLocaleString() })}
                </Text>
              </View>
            ) : null}
          </Card>
        </View>

        {activeRole === "admin" ? (
          <View style={styles.section}>
            <SectionHeader title={t("systemOverview")} icon="activity" />
            <View style={styles.adminGrid}>
              {[
                { label: t("totalStudents"), value: "1,248", icon: "users", color: colors.primary },
                { label: t("activeAgents"), value: "24", icon: "briefcase", color: "#8b5cf6" },
                { label: t("ordersToday"), value: "37", icon: "clipboard", color: colors.warning },
                { label: t("revenueApr"), value: "12.4M", icon: "trending-up", color: colors.success },
              ].map(stat => (
                <Card key={stat.label} style={styles.adminStatCard} variant="elevated">
                  <View style={[styles.adminStatIcon, { backgroundColor: stat.color + "15" }]}>
                    <Feather name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.adminStatValue, { color: colors.foreground }]}>{stat.value}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        {renderCommonPublicSections(true)}
      </ScrollView>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={[styles.modalPanel, { backgroundColor: colors.card }]} onPress={() => null}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {textByLang(language, "Menu", "မီနူး")}
            </Text>
            {menuEntries.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[styles.modalItem, { borderColor: colors.border }]}
                onPress={async () => {
                  setMenuVisible(false);
                  await item.onPress();
                }}
              >
                <Feather name={item.icon as any} size={16} color={colors.primary} />
                <Text style={[styles.modalItemText, { color: colors.foreground }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  landingHero: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  heroActionBtn: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  heroActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  logoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f2027",
    letterSpacing: 0.5,
  },
  headerGreeting: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  langText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  notifDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCount: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0f2027",
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  studentId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 4 },
  section: { marginBottom: 20 },
  aboutCard: {
    gap: 10,
    padding: 16,
  },
  aboutTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  aboutTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  aboutBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  aboutHighlights: {
    gap: 8,
    marginTop: 2,
  },
  aboutHighlightRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  aboutHighlightText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceCard: {
    width: "30%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 8,
    minWidth: 95,
    flex: 1,
    maxWidth: "32%",
  },
  svcIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  svcTitle: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  inlineActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  cardActionsRow: {
    width: "100%",
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  newsCard: {
    marginBottom: 10,
  },
  newsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  newsTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  newsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  newsActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  newsDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 13,
    lineHeight: 19,
  },
  directoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  directoryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    width: "48%",
    gap: 6,
  },
  directoryEmoji: {
    fontSize: 24,
  },
  directoryName: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  directoryMeta: {
    fontSize: 12,
  },
  sharedInfoCard: {
    padding: 15,
    gap: 6,
  },
  sharedInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  sharedInfoText: {
    fontSize: 13,
    lineHeight: 19,
  },
  orderCard: { marginBottom: 10 },
  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  orderMeta: {
    fontSize: 12,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e2f5f5",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
  },
  notifCard: { marginBottom: 8 },
  notifRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  notifTitle: { fontSize: 14, fontWeight: "600" },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5 },
  notifMessage: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  financeCard: { padding: 20 },
  financeLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 4 },
  financeAmount: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 12 },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  pendingText: { fontSize: 13, fontWeight: "600" },
  adminGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  adminStatCard: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    alignItems: "center",
    padding: 16,
    gap: 6,
  },
  adminStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adminStatValue: { fontSize: 22, fontWeight: "700" },
  adminStatLabel: { fontSize: 12, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS === "web" ? 84 : 70,
    paddingRight: 14,
  },
  modalPanel: {
    borderRadius: 14,
    width: 270,
    padding: 14,
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalItemText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
