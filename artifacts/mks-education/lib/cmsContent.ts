import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SERVICES, UNIVERSITIES } from "@/data/mockData";

export type CmsServiceCategory = "education" | "legal" | "document";
export type CmsUniversityType = "university" | "college" | "vocational";

export type CmsAbout = {
  titleEn: string;
  titleMy: string;
  bodyEn: string;
  bodyMy: string;
  highlightsEn: string[];
  highlightsMy: string[];
};

export type CmsNews = {
  id: string;
  titleEn: string;
  titleMy: string;
  summaryEn: string;
  summaryMy: string;
  categoryEn: string;
  categoryMy: string;
  date: string;
};

export type CmsService = {
  id: string;
  title: string;
  titleEn?: string;
  titleMy?: string;
  icon: string;
  description: string;
  descriptionEn?: string;
  descriptionMy?: string;
  category: CmsServiceCategory;
  price: string;
  duration: string;
  color: string;
};

export type CmsDirectory = {
  id: string;
  name: string;
  nameEn?: string;
  nameMy?: string;
  type: CmsUniversityType;
  location: string;
  country: string;
  programs: string[];
  requirements: string;
  degreeTypes: string[];
  tuitionRange: string;
  ranking?: string;
  intake: string[];
  logo?: string;
};

export type CmsBundle = {
  about: CmsAbout;
  news: CmsNews[];
  services: CmsService[];
  directory: CmsDirectory[];
};

export const DEFAULT_ABOUT: CmsAbout = {
  titleEn: "MKS Education & Legal Service",
  titleMy: "MKS ပညာရေးနှင့် ဥပဒေဝန်ဆောင်မှုလုပ်ငန်း",
  bodyEn:
    "We support students, partner agents, and families with admission, academic documentation, legal translation, and service tracking workflows.",
  bodyMy:
    "ကျောင်းသားများ၊ ပူးပေါင်းအေးဂျင့်များနှင့် မိဘအုပ်ထိန်းသူများအတွက် ဝင်ခွင့်၊ ပညာရေးစာရွက်စာတမ်း၊ ဥပဒေဘာသာပြန်နှင့် လုပ်ငန်းဆောင်ရွက်မှုအခြေအနေများကို တစ်နေရာတည်းမှာ စီမံနိုင်အောင် ကူညီပေးပါသည်။",
  highlightsEn: [
    "University/College admissions and transfers",
    "Certificate, transcript, and legal document services",
    "End-to-end order tracking and notifications",
  ],
  highlightsMy: [
    "တက္ကသိုလ်/ကောလိပ် ဝင်ခွင့်နှင့် ပြောင်းရွှေ့ဝန်ဆောင်မှု",
    "အောင်လက်မှတ်၊ transcript နှင့် ဥပဒေစာရွက်စာတမ်း ဝန်ဆောင်မှု",
    "လုပ်ငန်းအဆင့်လိုက် tracking နှင့် အသိပေးချက်စနစ်",
  ],
};

export const DEFAULT_NEWS: CmsNews[] = [
  {
    id: "news001",
    titleEn: "2026 University Admission Window Opened",
    titleMy: "2026 တက္ကသိုလ်ဝင်ခွင့် လျှောက်လွှာကာလ ဖွင့်လှစ်",
    summaryEn: "MKS now accepts new admission service requests for local and international universities.",
    summaryMy: "ပြည်တွင်းနှင့် ပြည်ပ တက္ကသိုလ်ဝင်ခွင့် ဝန်ဆောင်မှုများကို MKS မှ လက်ခံဆောင်ရွက်နေပါသည်။",
    date: "2026-05-01",
    categoryEn: "Admissions",
    categoryMy: "ဝင်ခွင့်",
  },
  {
    id: "news002",
    titleEn: "Document Legalization Fast-Track Added",
    titleMy: "စာရွက်စာတမ်းအတည်ပြု Fast-Track ဝန်ဆောင်မှု ထပ်တိုး",
    summaryEn: "Urgent legalization and notary requests can now be processed with priority handling.",
    summaryMy: "အရေးပေါ် Notary နှင့် Legalization လုပ်ငန်းများကို အမြန်ဦးစားပေးစနစ်ဖြင့် ဆောင်ရွက်ပေးနေပါသည်။",
    date: "2026-04-26",
    categoryEn: "Legal",
    categoryMy: "ဥပဒေဝန်ဆောင်မှု",
  },
  {
    id: "news003",
    titleEn: "Agent Onboarding Program Launch",
    titleMy: "Agent Onboarding Program စတင်ဖွင့်လှစ်",
    summaryEn: "Partner schools and education agents can now onboard and manage bulk student requests.",
    summaryMy: "ပူးပေါင်းကျောင်းများနှင့် အေးဂျင့်များအတွက် ကျောင်းသားအစုလိုက်အပြုံလိုက် တင်ပြစနစ်ကို စတင်အသုံးပြုနိုင်ပါပြီ။",
    date: "2026-04-18",
    categoryEn: "Partners",
    categoryMy: "ပူးပေါင်းရေး",
  },
];

export const DEFAULT_SERVICES: CmsService[] = SERVICES.map(service => ({
  ...service,
}));

export const DEFAULT_DIRECTORY: CmsDirectory[] = UNIVERSITIES.map(uni => ({
  ...uni,
}));

function sanitizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function sanitizeStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter(item => typeof item === "string") as string[];
}

export async function loadCmsContent(): Promise<CmsBundle> {
  let about = DEFAULT_ABOUT;
  let news = DEFAULT_NEWS;
  let services = DEFAULT_SERVICES;
  let directory = DEFAULT_DIRECTORY;

  try {
    const aboutSnap = await getDoc(doc(db, "cms_about", "main"));
    if (aboutSnap.exists()) {
      const data = aboutSnap.data() as Record<string, unknown>;
      about = {
        titleEn: sanitizeString(data.titleEn, DEFAULT_ABOUT.titleEn),
        titleMy: sanitizeString(data.titleMy, DEFAULT_ABOUT.titleMy),
        bodyEn: sanitizeString(data.bodyEn, DEFAULT_ABOUT.bodyEn),
        bodyMy: sanitizeString(data.bodyMy, DEFAULT_ABOUT.bodyMy),
        highlightsEn: sanitizeStringArray(data.highlightsEn, DEFAULT_ABOUT.highlightsEn),
        highlightsMy: sanitizeStringArray(data.highlightsMy, DEFAULT_ABOUT.highlightsMy),
      };
    }
  } catch {
    // Keep defaults when public fetch fails.
  }

  try {
    const newsQuery = query(collection(db, "cms_news"), orderBy("date", "desc"));
    const newsSnap = await getDocs(newsQuery);
    if (!newsSnap.empty) {
      news = newsSnap.docs.map(docSnap => {
        const data = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          titleEn: sanitizeString(data.titleEn),
          titleMy: sanitizeString(data.titleMy),
          summaryEn: sanitizeString(data.summaryEn),
          summaryMy: sanitizeString(data.summaryMy),
          categoryEn: sanitizeString(data.categoryEn),
          categoryMy: sanitizeString(data.categoryMy),
          date: sanitizeString(data.date),
        };
      });
    }
  } catch {
    // Keep defaults when public fetch fails.
  }

  try {
    const servicesSnap = await getDocs(collection(db, "cms_services"));
    if (!servicesSnap.empty) {
      services = servicesSnap.docs.map(docSnap => {
        const data = docSnap.data() as Record<string, unknown>;
        const categoryRaw = sanitizeString(data.category, "education");
        const category: CmsServiceCategory =
          categoryRaw === "legal" || categoryRaw === "document" ? categoryRaw : "education";
        return {
          id: docSnap.id,
          title: sanitizeString(data.title, sanitizeString(data.titleEn)),
          titleEn: sanitizeString(data.titleEn),
          titleMy: sanitizeString(data.titleMy),
          icon: sanitizeString(data.icon, "grid"),
          description: sanitizeString(data.description, sanitizeString(data.descriptionEn)),
          descriptionEn: sanitizeString(data.descriptionEn),
          descriptionMy: sanitizeString(data.descriptionMy),
          category,
          price: sanitizeString(data.price, ""),
          duration: sanitizeString(data.duration, ""),
          color: sanitizeString(data.color, "#0d9488"),
        };
      });
    }
  } catch {
    // Keep defaults when public fetch fails.
  }

  try {
    const dirSnap = await getDocs(collection(db, "cms_directory"));
    if (!dirSnap.empty) {
      directory = dirSnap.docs.map(docSnap => {
        const data = docSnap.data() as Record<string, unknown>;
        const typeRaw = sanitizeString(data.type, "university");
        const type: CmsUniversityType =
          typeRaw === "college" || typeRaw === "vocational" ? typeRaw : "university";
        return {
          id: docSnap.id,
          name: sanitizeString(data.name, sanitizeString(data.nameEn)),
          nameEn: sanitizeString(data.nameEn),
          nameMy: sanitizeString(data.nameMy),
          type,
          location: sanitizeString(data.location),
          country: sanitizeString(data.country),
          programs: sanitizeStringArray(data.programs),
          requirements: sanitizeString(data.requirements),
          degreeTypes: sanitizeStringArray(data.degreeTypes),
          tuitionRange: sanitizeString(data.tuitionRange),
          ranking: sanitizeString(data.ranking),
          intake: sanitizeStringArray(data.intake),
          logo: sanitizeString(data.logo, "🏫"),
        };
      });
    }
  } catch {
    // Keep defaults when public fetch fails.
  }

  return { about, news, services, directory };
}

async function hasAnyDoc(collectionName: string): Promise<boolean> {
  const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
  return !snapshot.empty;
}

export async function ensureCmsAboutSeed() {
  const aboutSnap = await getDoc(doc(db, "cms_about", "main"));
  if (aboutSnap.exists()) return;
  await setDoc(doc(db, "cms_about", "main"), { ...DEFAULT_ABOUT, seeded: true }, { merge: true });
}

export async function ensureCmsNewsSeed() {
  if (await hasAnyDoc("cms_news")) return;
  await Promise.all(
    DEFAULT_NEWS.map(item =>
      setDoc(doc(db, "cms_news", item.id), {
        ...item,
        seeded: true
      })
    )
  );
}

export async function ensureCmsServicesSeed() {
  if (await hasAnyDoc("cms_services")) return;
  await Promise.all(
    DEFAULT_SERVICES.map(item =>
      setDoc(doc(db, "cms_services", item.id), {
        ...item,
        seeded: true
      })
    )
  );
}

export async function ensureCmsDirectorySeed() {
  if (await hasAnyDoc("cms_directory")) return;
  await Promise.all(
    DEFAULT_DIRECTORY.map(item =>
      setDoc(doc(db, "cms_directory", item.id), {
        ...item,
        seeded: true
      })
    )
  );
}

export async function deleteCmsNews(id: string) {
  await ensureCmsNewsSeed();
  await deleteDoc(doc(db, "cms_news", id));
}

export async function deleteCmsAbout() {
  await ensureCmsAboutSeed();
  await deleteDoc(doc(db, "cms_about", "main"));
}

export async function deleteCmsService(id: string) {
  await ensureCmsServicesSeed();
  await deleteDoc(doc(db, "cms_services", id));
}

export async function deleteCmsDirectory(id: string) {
  await ensureCmsDirectorySeed();
  await deleteDoc(doc(db, "cms_directory", id));
}
