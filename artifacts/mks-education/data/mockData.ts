export interface University {
  id: string;
  name: string;
  type: "university" | "college" | "vocational";
  location: string;
  country: string;
  programs: string[];
  requirements: string;
  degreeTypes: string[];
  tuitionRange: string;
  ranking?: string;
  intake: string[];
  logo?: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: "u001",
    name: "Yangon University",
    type: "university",
    location: "Yangon",
    country: "Myanmar",
    programs: ["Engineering", "Medicine", "Law", "Economics", "Science"],
    requirements: "University Matriculation Exam (Merit)",
    degreeTypes: ["B.Sc", "B.A", "B.E", "M.Sc", "Ph.D"],
    tuitionRange: "500,000 - 2,000,000 MMK/year",
    ranking: "Top 5 in Myanmar",
    intake: ["June", "December"],
    logo: "🏛️",
  },
  {
    id: "u002",
    name: "Mandalay University of Medicine",
    type: "university",
    location: "Mandalay",
    country: "Myanmar",
    programs: ["Medicine", "Dentistry", "Pharmacy", "Nursing"],
    requirements: "A1 in Biology, Chemistry, Physics",
    degreeTypes: ["M.B.B.S", "B.D.S", "B.Pharm"],
    tuitionRange: "1,500,000 - 5,000,000 MMK/year",
    ranking: "Top 3 Medical",
    intake: ["August"],
    logo: "🏥",
  },
  {
    id: "u003",
    name: "Myanmar Institute of Technology",
    type: "university",
    location: "Mandalay",
    country: "Myanmar",
    programs: ["Computer Science", "Electrical", "Civil", "Mechanical", "Chemical Engineering"],
    requirements: "Merit in Mathematics and Physics",
    degreeTypes: ["B.E", "M.E", "Ph.D"],
    tuitionRange: "800,000 - 2,500,000 MMK/year",
    ranking: "Top Engineering School",
    intake: ["June"],
    logo: "⚙️",
  },
  {
    id: "u004",
    name: "National Management Degree College",
    type: "college",
    location: "Yangon",
    country: "Myanmar",
    programs: ["Business Administration", "Accounting", "Finance", "Marketing"],
    requirements: "Matriculation Pass",
    degreeTypes: ["B.B.A", "M.B.A", "DipBA"],
    tuitionRange: "400,000 - 1,500,000 MMK/year",
    intake: ["January", "July"],
    logo: "📊",
  },
  {
    id: "u005",
    name: "Yangon Technological University",
    type: "university",
    location: "Yangon",
    country: "Myanmar",
    programs: ["Architecture", "Civil Engineering", "Information Technology"],
    requirements: "Merit in Science subjects",
    degreeTypes: ["B.Arch", "B.E", "B.I.T"],
    tuitionRange: "700,000 - 2,000,000 MMK/year",
    intake: ["June"],
    logo: "🏗️",
  },
  {
    id: "u006",
    name: "Central Vocational School",
    type: "vocational",
    location: "Yangon",
    country: "Myanmar",
    programs: ["Auto Mechanics", "Welding", "Electrical Installation", "Fashion Design"],
    requirements: "Grade 8 Pass",
    degreeTypes: ["Certificate", "Diploma"],
    tuitionRange: "200,000 - 600,000 MMK/year",
    intake: ["January", "June", "October"],
    logo: "🔧",
  },
  {
    id: "u007",
    name: "University of Computer Studies",
    type: "university",
    location: "Yangon",
    country: "Myanmar",
    programs: ["Computer Science", "Information Technology", "Data Science", "AI"],
    requirements: "Merit in Mathematics",
    degreeTypes: ["B.C.Sc", "B.I.T", "M.C.Sc"],
    tuitionRange: "600,000 - 2,000,000 MMK/year",
    ranking: "Top IT University",
    intake: ["June"],
    logo: "💻",
  },
  {
    id: "u008",
    name: "Pathein University",
    type: "university",
    location: "Pathein",
    country: "Myanmar",
    programs: ["Arts", "Science", "Economics", "Law"],
    requirements: "Matriculation Pass",
    degreeTypes: ["B.A", "B.Sc", "B.Econ", "LL.B"],
    tuitionRange: "300,000 - 1,200,000 MMK/year",
    intake: ["June"],
    logo: "📚",
  },
];

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: "education" | "legal" | "document";
  price: string;
  duration: string;
  color: string;
}

export const SERVICES: Service[] = [
  {
    id: "svc001",
    title: "High School Exam & Certificate",
    icon: "award",
    description: "Registration and processing for high school board examinations and certificate issuance",
    category: "education",
    price: "50,000 - 150,000 MMK",
    duration: "2-4 weeks",
    color: "#0d9488",
  },
  {
    id: "svc002",
    title: "University Admission",
    icon: "book-open",
    description: "Complete university admission application support and processing",
    category: "education",
    price: "100,000 - 300,000 MMK",
    duration: "4-8 weeks",
    color: "#3b82f6",
  },
  {
    id: "svc003",
    title: "University Transfer",
    icon: "shuffle",
    description: "Transfer application between universities with credit transfer support",
    category: "education",
    price: "150,000 - 400,000 MMK",
    duration: "6-12 weeks",
    color: "#8b5cf6",
  },
  {
    id: "svc004",
    title: "Major Change",
    icon: "refresh-cw",
    description: "Application for changing academic major within the same university",
    category: "education",
    price: "80,000 - 200,000 MMK",
    duration: "3-6 weeks",
    color: "#f59e0b",
  },
  {
    id: "svc005",
    title: "Notary Translation",
    icon: "file-text",
    description: "Certified document translation and notarization for official use",
    category: "legal",
    price: "30,000 - 100,000 MMK",
    duration: "1-3 days",
    color: "#10b981",
  },
  {
    id: "svc006",
    title: "Court Affidavit",
    icon: "pen-tool",
    description: "Preparation and filing of court affidavits and sworn statements",
    category: "legal",
    price: "50,000 - 200,000 MMK",
    duration: "3-7 days",
    color: "#ef4444",
  },
  {
    id: "svc007",
    title: "Document Legalization",
    icon: "check-square",
    description: "Apostille and legalization of documents for international use",
    category: "legal",
    price: "100,000 - 500,000 MMK",
    duration: "2-4 weeks",
    color: "#f97316",
  },
  {
    id: "svc008",
    title: "Scholarship Application",
    icon: "star",
    description: "Assistance with government and private scholarship applications",
    category: "education",
    price: "Free - 200,000 MMK",
    duration: "4-10 weeks",
    color: "#fbbf24",
  },
  {
    id: "svc009",
    title: "Academic Certificate Verification",
    icon: "shield",
    description: "Verification and authentication of academic certificates",
    category: "document",
    price: "30,000 - 80,000 MMK",
    duration: "3-5 days",
    color: "#06b6d4",
  },
  {
    id: "svc010",
    title: "Student Visa Support",
    icon: "globe",
    description: "Complete visa application support for studying abroad",
    category: "education",
    price: "200,000 - 800,000 MMK",
    duration: "4-12 weeks",
    color: "#ec4899",
  },
  {
    id: "svc011",
    title: "Transcript & Grade Report",
    icon: "clipboard",
    description: "Official academic transcript and grade report processing",
    category: "document",
    price: "20,000 - 60,000 MMK",
    duration: "5-10 days",
    color: "#84cc16",
  },
];

export interface OrderTracking {
  id: string;
  serviceTitle: string;
  studentName: string;
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  steps: { title: string; completed: boolean; date?: string }[];
  assignedAgent?: string;
}

export const SAMPLE_ORDERS: OrderTracking[] = [
  {
    id: "ord001",
    serviceTitle: "University Admission",
    studentName: "Aye Mya Thaw",
    status: "in_progress",
    createdAt: "2026-03-15",
    updatedAt: "2026-04-01",
    assignedAgent: "Ko Zin Min",
    steps: [
      { title: "Application Received", completed: true, date: "Mar 15, 2026" },
      { title: "Document Verification", completed: true, date: "Mar 20, 2026" },
      { title: "Application Submitted", completed: true, date: "Mar 28, 2026" },
      { title: "University Review", completed: false },
      { title: "Admission Result", completed: false },
    ],
  },
  {
    id: "ord002",
    serviceTitle: "Notary Translation",
    studentName: "Aye Mya Thaw",
    status: "completed",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-15",
    assignedAgent: "Ma Htwe",
    steps: [
      { title: "Documents Received", completed: true, date: "Feb 10, 2026" },
      { title: "Translation Started", completed: true, date: "Feb 11, 2026" },
      { title: "Notarization", completed: true, date: "Feb 14, 2026" },
      { title: "Ready for Collection", completed: true, date: "Feb 15, 2026" },
    ],
  },
  {
    id: "ord003",
    serviceTitle: "High School Certificate",
    studentName: "Aung Ko Ko",
    status: "pending",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
    steps: [
      { title: "Application Received", completed: false },
      { title: "Document Verification", completed: false },
      { title: "Certificate Processing", completed: false },
      { title: "Certificate Ready", completed: false },
    ],
  },
];

export interface PaymentRecord {
  id: string;
  description: string;
  amount: number;
  type: "payment" | "refund" | "fee";
  date: string;
  status: "paid" | "pending" | "overdue";
  method?: string;
}

export const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: "pay001",
    description: "University Admission Service",
    amount: 250000,
    type: "payment",
    date: "2026-03-15",
    status: "paid",
    method: "KBZ Pay",
  },
  {
    id: "pay002",
    description: "Document Verification Fee",
    amount: 30000,
    type: "fee",
    date: "2026-03-15",
    status: "paid",
    method: "Cash",
  },
  {
    id: "pay003",
    description: "Notary Translation Service",
    amount: 75000,
    type: "payment",
    date: "2026-02-10",
    status: "paid",
    method: "Wave Money",
  },
  {
    id: "pay004",
    description: "High School Certificate Processing",
    amount: 80000,
    type: "payment",
    date: "2026-04-01",
    status: "pending",
    method: "KBZ Pay",
  },
  {
    id: "pay005",
    description: "Tuition Fee - Semester 2",
    amount: 1200000,
    type: "payment",
    date: "2026-03-01",
    status: "overdue",
    method: "Bank Transfer",
  },
];

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: "text" | "image" | "document";
}

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg001",
    senderId: "a001",
    senderName: "Ko Zin Min",
    content: "Hello! Your university admission documents have been verified. We're now proceeding with the application.",
    timestamp: "10:30 AM",
    isOwn: false,
    type: "text",
  },
  {
    id: "msg002",
    senderId: "s001",
    senderName: "Aye Mya Thaw",
    content: "Thank you! How long will it take for the university to respond?",
    timestamp: "10:35 AM",
    isOwn: true,
    type: "text",
  },
  {
    id: "msg003",
    senderId: "a001",
    senderName: "Ko Zin Min",
    content: "Usually 2-3 weeks. I'll notify you as soon as we receive any update from the university.",
    timestamp: "10:37 AM",
    isOwn: false,
    type: "text",
  },
  {
    id: "msg004",
    senderId: "s001",
    senderName: "Aye Mya Thaw",
    content: "Perfect, thank you for the update!",
    timestamp: "10:40 AM",
    isOwn: true,
    type: "text",
  },
];

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
  icon: string;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "notif001",
    title: "Application Update",
    message: "Your university admission application has been submitted successfully.",
    time: "2 hours ago",
    read: false,
    type: "success",
    icon: "check-circle",
  },
  {
    id: "notif002",
    title: "Payment Due",
    message: "Semester 2 tuition fee is overdue. Please make payment as soon as possible.",
    time: "1 day ago",
    read: false,
    type: "warning",
    icon: "alert-triangle",
  },
  {
    id: "notif003",
    title: "New Message",
    message: "Ko Zin Min sent you a message about your admission status.",
    time: "3 hours ago",
    read: true,
    type: "info",
    icon: "message-circle",
  },
  {
    id: "notif004",
    title: "Documents Ready",
    message: "Your notary translation documents are ready for collection.",
    time: "3 days ago",
    read: true,
    type: "success",
    icon: "file-check",
  },
];

export interface DeliveryStatus {
  id: string;
  trackingNumber: string;
  documents: string;
  carrier: string;
  status: "processing" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
  estimatedDate: string;
  origin: string;
  destination: string;
  steps: { title: string; location: string; time?: string; completed: boolean }[];
}

export const DELIVERIES: DeliveryStatus[] = [
  {
    id: "del001",
    trackingNumber: "MKS-2026-00123",
    documents: "University Admission Letter, Transcripts",
    carrier: "MKS Express",
    status: "in_transit",
    estimatedDate: "Apr 8, 2026",
    origin: "MKS Office, Yangon",
    destination: "Yangon University, Yangon",
    steps: [
      { title: "Documents Prepared", location: "MKS Office", time: "Apr 3, 9:00 AM", completed: true },
      { title: "Picked Up", location: "MKS Office", time: "Apr 3, 2:00 PM", completed: true },
      { title: "In Transit", location: "Yangon Sorting Center", time: "Apr 4, 8:00 AM", completed: true },
      { title: "Out for Delivery", location: "Yangon", completed: false },
      { title: "Delivered", location: "Yangon University", completed: false },
    ],
  },
];
