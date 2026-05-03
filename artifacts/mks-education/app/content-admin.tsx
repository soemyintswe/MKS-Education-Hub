import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/AppHeader";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useCmsContent } from "@/hooks/useCmsContent";
import {
  CmsDirectory,
  CmsNews,
  CmsService,
  DEFAULT_ABOUT,
  DEFAULT_DIRECTORY,
  DEFAULT_NEWS,
  DEFAULT_SERVICES
} from "@/lib/cmsContent";
import { db } from "@/lib/firebase";
import { useI18n } from "@/hooks/useI18n";

type SectionKey = "about" | "news" | "services" | "directory";

type NewsForm = Omit<CmsNews, "id">;
type ServiceForm = Omit<CmsService, "id">;
type DirectoryForm = Omit<CmsDirectory, "id">;

const EMPTY_NEWS_FORM: NewsForm = {
  titleEn: "",
  titleMy: "",
  summaryEn: "",
  summaryMy: "",
  categoryEn: "",
  categoryMy: "",
  date: ""
};

const EMPTY_SERVICE_FORM: ServiceForm = {
  title: "",
  titleEn: "",
  titleMy: "",
  icon: "grid",
  description: "",
  descriptionEn: "",
  descriptionMy: "",
  category: "education",
  price: "",
  duration: "",
  color: "#0d9488"
};

const EMPTY_DIRECTORY_FORM: DirectoryForm = {
  name: "",
  nameEn: "",
  nameMy: "",
  type: "university",
  location: "",
  country: "Myanmar",
  programs: [],
  requirements: "",
  degreeTypes: [],
  tuitionRange: "",
  ranking: "",
  intake: [],
  logo: "🏫"
};

function csvToArray(value: string) {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function arrayToCsv(value: string[]) {
  return value.join(", ");
}

function textByLang(language: "en" | "my", enText: string, myText: string) {
  return language === "my" ? myText : enText;
}

export default function ContentAdminScreen() {
  const colors = useColors();
  const { language } = useI18n();
  const { user, activeRole } = useApp();
  const { content, refresh } = useCmsContent();
  const params = useLocalSearchParams<{ section?: string; editId?: string }>();
  const initialSection = (params.section as SectionKey) || "about";
  const editId = typeof params.editId === "string" ? params.editId : "";
  const [section, setSection] = useState<SectionKey>(initialSection);
  const [saving, setSaving] = useState(false);

  const [aboutTitleEn, setAboutTitleEn] = useState(DEFAULT_ABOUT.titleEn);
  const [aboutTitleMy, setAboutTitleMy] = useState(DEFAULT_ABOUT.titleMy);
  const [aboutBodyEn, setAboutBodyEn] = useState(DEFAULT_ABOUT.bodyEn);
  const [aboutBodyMy, setAboutBodyMy] = useState(DEFAULT_ABOUT.bodyMy);
  const [aboutHighlightsEnCsv, setAboutHighlightsEnCsv] = useState(arrayToCsv(DEFAULT_ABOUT.highlightsEn));
  const [aboutHighlightsMyCsv, setAboutHighlightsMyCsv] = useState(arrayToCsv(DEFAULT_ABOUT.highlightsMy));

  const [newsForm, setNewsForm] = useState<NewsForm>(EMPTY_NEWS_FORM);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState<ServiceForm>(EMPTY_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [directoryForm, setDirectoryForm] = useState<DirectoryForm>(EMPTY_DIRECTORY_FORM);
  const [directoryProgramsCsv, setDirectoryProgramsCsv] = useState("");
  const [directoryDegreesCsv, setDirectoryDegreesCsv] = useState("");
  const [directoryIntakeCsv, setDirectoryIntakeCsv] = useState("");
  const [editingDirectoryId, setEditingDirectoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!content) return;
    setAboutTitleEn(content.about.titleEn);
    setAboutTitleMy(content.about.titleMy);
    setAboutBodyEn(content.about.bodyEn);
    setAboutBodyMy(content.about.bodyMy);
    setAboutHighlightsEnCsv(arrayToCsv(content.about.highlightsEn));
    setAboutHighlightsMyCsv(arrayToCsv(content.about.highlightsMy));
  }, [content]);

  useEffect(() => {
    if (!content || !editId) return;
    if (section === "news") {
      const item = (content.news ?? []).find(news => news.id === editId);
      if (!item) return;
      setEditingNewsId(item.id);
      setNewsForm({
        titleEn: item.titleEn,
        titleMy: item.titleMy,
        summaryEn: item.summaryEn,
        summaryMy: item.summaryMy,
        categoryEn: item.categoryEn,
        categoryMy: item.categoryMy,
        date: item.date
      });
      return;
    }
    if (section === "services") {
      const item = (content.services ?? []).find(service => service.id === editId);
      if (!item) return;
      setEditingServiceId(item.id);
      setServiceForm({
        title: item.title,
        titleEn: item.titleEn || item.title,
        titleMy: item.titleMy || "",
        icon: item.icon,
        description: item.description,
        descriptionEn: item.descriptionEn || item.description,
        descriptionMy: item.descriptionMy || "",
        category: item.category,
        price: item.price,
        duration: item.duration,
        color: item.color
      });
      return;
    }
    if (section === "directory") {
      const item = (content.directory ?? []).find(directory => directory.id === editId);
      if (!item) return;
      setEditingDirectoryId(item.id);
      setDirectoryForm({
        name: item.name,
        nameEn: item.nameEn || item.name,
        nameMy: item.nameMy || "",
        type: item.type,
        location: item.location,
        country: item.country,
        programs: item.programs,
        requirements: item.requirements,
        degreeTypes: item.degreeTypes,
        tuitionRange: item.tuitionRange,
        ranking: item.ranking || "",
        intake: item.intake,
        logo: item.logo || "🏫"
      });
      setDirectoryProgramsCsv(arrayToCsv(item.programs));
      setDirectoryDegreesCsv(arrayToCsv(item.degreeTypes));
      setDirectoryIntakeCsv(arrayToCsv(item.intake));
    }
  }, [content, editId, section]);

  const newsList = content?.news ?? DEFAULT_NEWS;
  const serviceList = content?.services ?? DEFAULT_SERVICES;
  const directoryList = content?.directory ?? DEFAULT_DIRECTORY;

  const sectionLabel = useMemo(() => {
    if (section === "about") return textByLang(language, "About MKS", "MKS အကြောင်း");
    if (section === "news") return textByLang(language, "Latest News", "နောက်ဆုံးရသတင်းများ");
    if (section === "services") return textByLang(language, "Featured Services", "ဝန်ဆောင်မှုများ");
    return textByLang(language, "Education Directory", "Education Directory");
  }, [language, section]);

  if (!user || activeRole !== "admin") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <AppHeader title={textByLang(language, "Content Admin", "Content စီမံခန့်ခွဲမှု")} showBack />
        <View style={styles.center}>
          <Text style={[styles.accessTitle, { color: colors.foreground }]}>
            {textByLang(language, "Admin Permission Required", "Admin ခွင့်ပြုချက် လိုအပ်ပါသည်")}
          </Text>
          <Text style={[styles.accessBody, { color: colors.mutedForeground }]}>
            {textByLang(
              language,
              "Only admin accounts can create, edit, or delete website content.",
              "Website အချက်အလက်များကို ဖန်တီး၊ ပြင်ဆင်၊ ဖျက်သိမ်းရန် Admin အကောင့်ဖြင့်သာ ရပါသည်။"
            )}
          </Text>
        </View>
      </View>
    );
  }

  const onSaveAbout = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "cms_about", "main"), {
        titleEn: aboutTitleEn.trim(),
        titleMy: aboutTitleMy.trim(),
        bodyEn: aboutBodyEn.trim(),
        bodyMy: aboutBodyMy.trim(),
        highlightsEn: csvToArray(aboutHighlightsEnCsv),
        highlightsMy: csvToArray(aboutHighlightsMyCsv),
        updatedAt: serverTimestamp(),
        updatedBy: user.id
      }, { merge: true });
      await refresh();
      Alert.alert(
        textByLang(language, "Saved", "သိမ်းပြီး"),
        textByLang(language, "About content updated.", "About content ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။")
      );
    } catch {
      Alert.alert(textByLang(language, "Error", "အမှား"), textByLang(language, "Failed to save.", "သိမ်းဆည်းမရပါ။"));
    } finally {
      setSaving(false);
    }
  };

  const resetNewsForm = () => {
    setNewsForm(EMPTY_NEWS_FORM);
    setEditingNewsId(null);
  };

  const onSubmitNews = async () => {
    setSaving(true);
    try {
      const payload = {
        ...newsForm,
        titleEn: newsForm.titleEn.trim(),
        titleMy: newsForm.titleMy.trim(),
        summaryEn: newsForm.summaryEn.trim(),
        summaryMy: newsForm.summaryMy.trim(),
        categoryEn: newsForm.categoryEn.trim(),
        categoryMy: newsForm.categoryMy.trim(),
        date: newsForm.date.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: user.id
      };
      if (editingNewsId) {
        await updateDoc(doc(db, "cms_news", editingNewsId), payload);
      } else {
        await addDoc(collection(db, "cms_news"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.id
        });
      }
      await refresh();
      resetNewsForm();
    } finally {
      setSaving(false);
    }
  };

  const onDeleteNews = async (id: string) => {
    await deleteDoc(doc(db, "cms_news", id));
    await refresh();
  };

  const resetServiceForm = () => {
    setServiceForm(EMPTY_SERVICE_FORM);
    setEditingServiceId(null);
  };

  const onSubmitService = async () => {
    setSaving(true);
    try {
      const payload = {
        ...serviceForm,
        title: serviceForm.title.trim(),
        titleEn: serviceForm.titleEn?.trim() || serviceForm.title.trim(),
        titleMy: serviceForm.titleMy?.trim() || serviceForm.title.trim(),
        description: serviceForm.description.trim(),
        descriptionEn: serviceForm.descriptionEn?.trim() || serviceForm.description.trim(),
        descriptionMy: serviceForm.descriptionMy?.trim() || serviceForm.description.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: user.id
      };
      if (editingServiceId) {
        await updateDoc(doc(db, "cms_services", editingServiceId), payload);
      } else {
        await addDoc(collection(db, "cms_services"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.id
        });
      }
      await refresh();
      resetServiceForm();
    } finally {
      setSaving(false);
    }
  };

  const onDeleteService = async (id: string) => {
    await deleteDoc(doc(db, "cms_services", id));
    await refresh();
  };

  const resetDirectoryForm = () => {
    setDirectoryForm(EMPTY_DIRECTORY_FORM);
    setDirectoryProgramsCsv("");
    setDirectoryDegreesCsv("");
    setDirectoryIntakeCsv("");
    setEditingDirectoryId(null);
  };

  const onSubmitDirectory = async () => {
    setSaving(true);
    try {
      const payload = {
        ...directoryForm,
        name: directoryForm.name.trim(),
        nameEn: directoryForm.nameEn?.trim() || directoryForm.name.trim(),
        nameMy: directoryForm.nameMy?.trim() || directoryForm.name.trim(),
        location: directoryForm.location.trim(),
        country: directoryForm.country.trim(),
        programs: csvToArray(directoryProgramsCsv),
        requirements: directoryForm.requirements.trim(),
        degreeTypes: csvToArray(directoryDegreesCsv),
        tuitionRange: directoryForm.tuitionRange.trim(),
        ranking: directoryForm.ranking?.trim() || "",
        intake: csvToArray(directoryIntakeCsv),
        logo: directoryForm.logo?.trim() || "🏫",
        updatedAt: serverTimestamp(),
        updatedBy: user.id
      };
      if (editingDirectoryId) {
        await updateDoc(doc(db, "cms_directory", editingDirectoryId), payload);
      } else {
        await addDoc(collection(db, "cms_directory"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.id
        });
      }
      await refresh();
      resetDirectoryForm();
    } finally {
      setSaving(false);
    }
  };

  const onDeleteDirectory = async (id: string) => {
    await deleteDoc(doc(db, "cms_directory", id));
    await refresh();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title={textByLang(language, "Content Admin", "Content စီမံခန့်ခွဲမှု")} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 30 : 16 }]}
      >
        <View style={styles.sectionTabs}>
          {(["about", "news", "services", "directory"] as SectionKey[]).map(key => (
            <Pressable
              key={key}
              onPress={() => setSection(key)}
              style={[
                styles.tabBtn,
                {
                  borderColor: section === key ? colors.primary : colors.border,
                  backgroundColor: section === key ? colors.primary : colors.card
                }
              ]}
            >
              <Text style={{ color: section === key ? colors.primaryForeground : colors.foreground, fontWeight: "700", fontSize: 12 }}>
                {key.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{sectionLabel}</Text>

        {section === "about" ? (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Title (EN)</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} value={aboutTitleEn} onChangeText={setAboutTitleEn} />
            <Text style={[styles.label, { color: colors.foreground }]}>Title (MY)</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} value={aboutTitleMy} onChangeText={setAboutTitleMy} />
            <Text style={[styles.label, { color: colors.foreground }]}>Body (EN)</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]}
              value={aboutBodyEn}
              onChangeText={setAboutBodyEn}
              multiline
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Body (MY)</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]}
              value={aboutBodyMy}
              onChangeText={setAboutBodyMy}
              multiline
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Highlights EN (comma separated)</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} value={aboutHighlightsEnCsv} onChangeText={setAboutHighlightsEnCsv} />
            <Text style={[styles.label, { color: colors.foreground }]}>Highlights MY (comma separated)</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} value={aboutHighlightsMyCsv} onChangeText={setAboutHighlightsMyCsv} />
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} disabled={saving} onPress={onSaveAbout}>
              <Text style={[styles.saveText, { color: colors.primaryForeground }]}>{saving ? "Saving..." : "Save About"}</Text>
            </Pressable>
          </View>
        ) : null}

        {section === "news" ? (
          <>
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.formHeader, { color: colors.foreground }]}>{editingNewsId ? "Edit News" : "Add News"}</Text>
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Title EN" placeholderTextColor={colors.mutedForeground} value={newsForm.titleEn} onChangeText={value => setNewsForm(prev => ({ ...prev, titleEn: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Title MY" placeholderTextColor={colors.mutedForeground} value={newsForm.titleMy} onChangeText={value => setNewsForm(prev => ({ ...prev, titleMy: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Date YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} value={newsForm.date} onChangeText={value => setNewsForm(prev => ({ ...prev, date: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Category EN" placeholderTextColor={colors.mutedForeground} value={newsForm.categoryEn} onChangeText={value => setNewsForm(prev => ({ ...prev, categoryEn: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Category MY" placeholderTextColor={colors.mutedForeground} value={newsForm.categoryMy} onChangeText={value => setNewsForm(prev => ({ ...prev, categoryMy: value }))} />
              <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]} placeholder="Summary EN" placeholderTextColor={colors.mutedForeground} value={newsForm.summaryEn} onChangeText={value => setNewsForm(prev => ({ ...prev, summaryEn: value }))} multiline />
              <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]} placeholder="Summary MY" placeholderTextColor={colors.mutedForeground} value={newsForm.summaryMy} onChangeText={value => setNewsForm(prev => ({ ...prev, summaryMy: value }))} multiline />
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSubmitNews} disabled={saving}>
                  <Text style={[styles.actionText, { color: colors.primaryForeground }]}>{editingNewsId ? "Update" : "Add"}</Text>
                </Pressable>
                {editingNewsId ? (
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={resetNewsForm}>
                    <Text style={[styles.actionText, { color: colors.foreground }]}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {newsList.map(item => (
              <View key={item.id} style={[styles.itemCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.titleEn}</Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.date} · {item.categoryEn}</Text>
                <Text style={[styles.itemDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.summaryEn}</Text>
                <View style={styles.rowButtons}>
                  <Pressable
                    style={[styles.smallBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                      setEditingNewsId(item.id);
                      setNewsForm({
                        titleEn: item.titleEn,
                        titleMy: item.titleMy,
                        summaryEn: item.summaryEn,
                        summaryMy: item.summaryMy,
                        categoryEn: item.categoryEn,
                        categoryMy: item.categoryMy,
                        date: item.date
                      });
                    }}
                  >
                    <Text style={[styles.smallText, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                  <Pressable style={[styles.smallBtn, { borderColor: colors.destructive }]} onPress={() => onDeleteNews(item.id)}>
                    <Text style={[styles.smallText, { color: colors.destructive }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {section === "services" ? (
          <>
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.formHeader, { color: colors.foreground }]}>{editingServiceId ? "Edit Service" : "Add Service"}</Text>
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Title EN" placeholderTextColor={colors.mutedForeground} value={serviceForm.titleEn} onChangeText={value => setServiceForm(prev => ({ ...prev, titleEn: value, title: value || prev.title }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Title MY" placeholderTextColor={colors.mutedForeground} value={serviceForm.titleMy} onChangeText={value => setServiceForm(prev => ({ ...prev, titleMy: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Icon (Feather name)" placeholderTextColor={colors.mutedForeground} value={serviceForm.icon} onChangeText={value => setServiceForm(prev => ({ ...prev, icon: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Category (education/legal/document)" placeholderTextColor={colors.mutedForeground} value={serviceForm.category} onChangeText={value => setServiceForm(prev => ({ ...prev, category: value as ServiceForm["category"] }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Price" placeholderTextColor={colors.mutedForeground} value={serviceForm.price} onChangeText={value => setServiceForm(prev => ({ ...prev, price: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Duration" placeholderTextColor={colors.mutedForeground} value={serviceForm.duration} onChangeText={value => setServiceForm(prev => ({ ...prev, duration: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Color (#hex)" placeholderTextColor={colors.mutedForeground} value={serviceForm.color} onChangeText={value => setServiceForm(prev => ({ ...prev, color: value }))} />
              <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]} placeholder="Description EN" placeholderTextColor={colors.mutedForeground} value={serviceForm.descriptionEn} onChangeText={value => setServiceForm(prev => ({ ...prev, descriptionEn: value, description: value || prev.description }))} multiline />
              <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]} placeholder="Description MY" placeholderTextColor={colors.mutedForeground} value={serviceForm.descriptionMy} onChangeText={value => setServiceForm(prev => ({ ...prev, descriptionMy: value }))} multiline />
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSubmitService} disabled={saving}>
                  <Text style={[styles.actionText, { color: colors.primaryForeground }]}>{editingServiceId ? "Update" : "Add"}</Text>
                </Pressable>
                {editingServiceId ? (
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={resetServiceForm}>
                    <Text style={[styles.actionText, { color: colors.foreground }]}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {serviceList.map(item => (
              <View key={item.id} style={[styles.itemCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.titleEn || item.title}</Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.category} · {item.price}</Text>
                <View style={styles.rowButtons}>
                  <Pressable
                    style={[styles.smallBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                      setEditingServiceId(item.id);
                      setServiceForm({
                        title: item.title,
                        titleEn: item.titleEn || item.title,
                        titleMy: item.titleMy || "",
                        icon: item.icon,
                        description: item.description,
                        descriptionEn: item.descriptionEn || item.description,
                        descriptionMy: item.descriptionMy || "",
                        category: item.category,
                        price: item.price,
                        duration: item.duration,
                        color: item.color
                      });
                    }}
                  >
                    <Text style={[styles.smallText, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                  <Pressable style={[styles.smallBtn, { borderColor: colors.destructive }]} onPress={() => onDeleteService(item.id)}>
                    <Text style={[styles.smallText, { color: colors.destructive }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {section === "directory" ? (
          <>
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.formHeader, { color: colors.foreground }]}>{editingDirectoryId ? "Edit School" : "Add School"}</Text>
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Name EN" placeholderTextColor={colors.mutedForeground} value={directoryForm.nameEn} onChangeText={value => setDirectoryForm(prev => ({ ...prev, nameEn: value, name: value || prev.name }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Name MY" placeholderTextColor={colors.mutedForeground} value={directoryForm.nameMy} onChangeText={value => setDirectoryForm(prev => ({ ...prev, nameMy: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Type (university/college/vocational)" placeholderTextColor={colors.mutedForeground} value={directoryForm.type} onChangeText={value => setDirectoryForm(prev => ({ ...prev, type: value as DirectoryForm["type"] }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Location" placeholderTextColor={colors.mutedForeground} value={directoryForm.location} onChangeText={value => setDirectoryForm(prev => ({ ...prev, location: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Country" placeholderTextColor={colors.mutedForeground} value={directoryForm.country} onChangeText={value => setDirectoryForm(prev => ({ ...prev, country: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Programs (comma separated)" placeholderTextColor={colors.mutedForeground} value={directoryProgramsCsv} onChangeText={setDirectoryProgramsCsv} />
              <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]} placeholder="Requirements" placeholderTextColor={colors.mutedForeground} value={directoryForm.requirements} onChangeText={value => setDirectoryForm(prev => ({ ...prev, requirements: value }))} multiline />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Degree Types (comma separated)" placeholderTextColor={colors.mutedForeground} value={directoryDegreesCsv} onChangeText={setDirectoryDegreesCsv} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Intake Months (comma separated)" placeholderTextColor={colors.mutedForeground} value={directoryIntakeCsv} onChangeText={setDirectoryIntakeCsv} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Tuition Range" placeholderTextColor={colors.mutedForeground} value={directoryForm.tuitionRange} onChangeText={value => setDirectoryForm(prev => ({ ...prev, tuitionRange: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Ranking (optional)" placeholderTextColor={colors.mutedForeground} value={directoryForm.ranking} onChangeText={value => setDirectoryForm(prev => ({ ...prev, ranking: value }))} />
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Logo Emoji" placeholderTextColor={colors.mutedForeground} value={directoryForm.logo} onChangeText={value => setDirectoryForm(prev => ({ ...prev, logo: value }))} />
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSubmitDirectory} disabled={saving}>
                  <Text style={[styles.actionText, { color: colors.primaryForeground }]}>{editingDirectoryId ? "Update" : "Add"}</Text>
                </Pressable>
                {editingDirectoryId ? (
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={resetDirectoryForm}>
                    <Text style={[styles.actionText, { color: colors.foreground }]}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {directoryList.map(item => (
              <View key={item.id} style={[styles.itemCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.nameEn || item.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.location}, {item.country}</Text>
                <View style={styles.rowButtons}>
                  <Pressable
                    style={[styles.smallBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                      setEditingDirectoryId(item.id);
                      setDirectoryForm({
                        name: item.name,
                        nameEn: item.nameEn || item.name,
                        nameMy: item.nameMy || "",
                        type: item.type,
                        location: item.location,
                        country: item.country,
                        programs: item.programs,
                        requirements: item.requirements,
                        degreeTypes: item.degreeTypes,
                        tuitionRange: item.tuitionRange,
                        ranking: item.ranking || "",
                        intake: item.intake,
                        logo: item.logo || "🏫"
                      });
                      setDirectoryProgramsCsv(arrayToCsv(item.programs));
                      setDirectoryDegreesCsv(arrayToCsv(item.degreeTypes));
                      setDirectoryIntakeCsv(arrayToCsv(item.intake));
                    }}
                  >
                    <Text style={[styles.smallText, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                  <Pressable style={[styles.smallBtn, { borderColor: colors.destructive }]} onPress={() => onDeleteDirectory(item.id)}>
                    <Text style={[styles.smallText, { color: colors.destructive }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  accessTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  accessBody: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  sectionTabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tabBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  formHeader: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, fontSize: 13 },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: "top"
  },
  saveBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  saveText: { fontWeight: "700", fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  actionText: { fontWeight: "700", fontSize: 13 },
  itemCard: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 6 },
  itemTitle: { fontSize: 15, fontWeight: "700" },
  itemMeta: { fontSize: 12, fontWeight: "500" },
  itemDesc: { fontSize: 13, lineHeight: 18 },
  rowButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
  smallBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  smallText: { fontSize: 12, fontWeight: "700" }
});
