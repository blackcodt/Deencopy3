// Simple localStorage-based store for admin settings & user data

export interface AdminSettings {
  admobBannerId: string;
  admobInterstitialId: string;
  adsensePublisherId: string;
  adsenseSlotId: string;
  adProvider: "admob" | "adsense";
  theme: "emerald" | "midnight" | "desert";
  adminPassword: string;
}

export interface UserData {
  currentPage: number;
  bookmarks: number[];
  notes: Record<number, string>;
  readingStreak: number;
  lastReadDate: string;
  totalPagesRead: number;
  fontSize: number;
  darkMode: boolean;
}

const DEFAULT_ADMIN: AdminSettings = {
  admobBannerId: "",
  admobInterstitialId: "",
  adsensePublisherId: "",
  adsenseSlotId: "",
  adProvider: "adsense",
  theme: "emerald",
  adminPassword: "admin123",
};

const DEFAULT_USER: UserData = {
  currentPage: 0,
  bookmarks: [],
  notes: {},
  readingStreak: 0,
  lastReadDate: "",
  totalPagesRead: 0,
  fontSize: 16,
  darkMode: false,
};

export function getAdminSettings(): AdminSettings {
  try {
    const stored = localStorage.getItem("deen-admin");
    return stored ? { ...DEFAULT_ADMIN, ...JSON.parse(stored) } : DEFAULT_ADMIN;
  } catch {
    return DEFAULT_ADMIN;
  }
}

export function saveAdminSettings(settings: Partial<AdminSettings>) {
  const current = getAdminSettings();
  localStorage.setItem("deen-admin", JSON.stringify({ ...current, ...settings }));
}

export function getUserData(): UserData {
  try {
    const stored = localStorage.getItem("deen-user");
    return stored ? { ...DEFAULT_USER, ...JSON.parse(stored) } : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUserData(data: Partial<UserData>) {
  const current = getUserData();
  const today = new Date().toDateString();
  
  // Update reading streak
  if (current.lastReadDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = current.lastReadDate === yesterday.toDateString();
    data.readingStreak = isConsecutive ? current.readingStreak + 1 : 1;
    data.lastReadDate = today;
  }

  localStorage.setItem("deen-user", JSON.stringify({ ...current, ...data }));
}
