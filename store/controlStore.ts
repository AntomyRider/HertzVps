import { create } from "zustand";
import axios from "axios";

const STORAGE_KEY = "hertz_control_key_code";

export interface ControlKeyInfo {
  id: string;
  code: string;
  isActive: boolean;
  hwid: string | null;
  durationDays: number;
  activatedAt: string | null;
  hwidResetAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ControlStatsData {
  total: number;
  success: number;
  failed: number;
  pending: number;
}

export type ControlChartRange = 1 | 7 | 30 | 90;

export interface ControlDailyStat {
  date: string;
  success: number;
  failed: number;
  pending: number;
}

export interface ControlAccountStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  post: number;
  comment: number;
  reaction: number;
}

export interface ControlAccountItem {
  id: string;
  fbId: string;
  name: string;
  avatar: string | null;
  isActive: boolean;
  isRunning: boolean;
  currentTask: string;
  taskTimer: { duration: number; remaining: number; endTime?: number } | null;
  groupInfo: {
    groupName: string;
    groupCurrent: number;
    groupTotal: number;
  } | null;
  stats: ControlAccountStats;
}

export type ControlReactionType =
  | ""
  | "LIKE"
  | "LOVE"
  | "CARE"
  | "HAHA"
  | "WOW"
  | "SAD"
  | "ANGRY";

export interface ControlUploadImage {
  name: string;
  data: string;
}

export interface ControlGroupItem {
  id: string;
  accountId: string;
  name: string;
  content: string;
  comments: string;
  reaction: ControlReactionType;
  links: string[];
  images: string[];
  imagePreviews?: Record<string, string>;
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
  isActive: boolean;
}

export type ControlLogLevel = "info" | "success" | "warn" | "error" | "debug";

export interface ControlLogItem {
  id: string;
  timestamp: string;
  level: ControlLogLevel;
  source: string;
  message: string;
}

export type ControlDelayRangeKey =
  | "typingDelay"
  | "delay"
  | "delayBetweenLinks"
  | "delayBetweenGroups"
  | "nextRoundDelay";

export interface ControlDelayRange {
  min: number;
  max: number;
}

export interface ControlBotConfig {
  textMode: "typing" | "paste";
  typingDelay: ControlDelayRange;
  delay: ControlDelayRange;
  delayBetweenLinks: ControlDelayRange;
  delayBetweenGroups: ControlDelayRange;
  nextRoundDelay: ControlDelayRange;
  hideScreen: boolean;
  autoRetry: boolean;
  autoUpdate: boolean;
  skipPending: boolean;
}

export const DEFAULT_BOT_CONFIG: ControlBotConfig = {
  textMode: "typing",
  typingDelay: { min: 20, max: 60 },
  delay: { min: 2, max: 4 },
  delayBetweenLinks: { min: 60, max: 180 },
  delayBetweenGroups: { min: 180, max: 600 },
  nextRoundDelay: { min: 1800, max: 3600 },
  hideScreen: false,
  autoRetry: true,
  autoUpdate: true,
  skipPending: false,
};

const nowTimeStr = () => {
  const d = new Date();
  return d.toLocaleTimeString("th-TH", { hour12: false });
};

interface ControlState {
  keyInfo: ControlKeyInfo | null;
  isBotOnline: boolean;
  lastSyncAt: string | null;
  stats: ControlStatsData;
  chartRange: ControlChartRange;
  dailyStats: ControlDailyStat[];

  // Worker & Accounts
  accounts: ControlAccountItem[];
  accountSearch: string;
  workerFilter: "all" | "running" | "idle";
  isAllRunning: boolean;

  // Groups per Account
  groupsByAccount: Record<string, ControlGroupItem[]>;
  groupSearch: string;
  editingGroup: ControlGroupItem | null;
  isGroupDialogOpen: boolean;

  // Live Logger
  logs: ControlLogItem[];
  logLevelFilter: "all" | ControlLogLevel;
  logSearchQuery: string;
  logAutoScroll: boolean;

  // Bot Configuration (No Presets)
  config: ControlBotConfig;
  settingsTab: "delay" | "advance" | "data";

  // Auth states
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  // Basic Setters
  clearError: () => void;
  setStats: (stats: Partial<ControlStatsData>) => void;
  setChartRange: (range: ControlChartRange) => void;
  setDailyStats: (dailyStats: ControlDailyStat[]) => void;
  setAccountSearch: (search: string) => void;
  setWorkerFilter: (filter: "all" | "running" | "idle") => void;
  setGroupSearch: (search: string) => void;
  setEditingGroup: (group: ControlGroupItem | null) => void;
  setIsGroupDialogOpen: (open: boolean) => void;
  setSettingsTab: (tab: "delay" | "advance" | "data") => void;

  // Remote Sync & Command Dispatch
  lastCommandSentAt: number;
  applyRemoteSnapshot: (payload: {
    online?: boolean;
    lastSyncAt?: string | null;
    state?: Partial<{
      stats: ControlStatsData;
      dailyStats: ControlDailyStat[];
      accounts: ControlAccountItem[];
      groupsByAccount: Record<string, ControlGroupItem[]>;
      config: ControlBotConfig;
      logs: ControlLogItem[];
      isAllRunning: boolean;
    }>;
  }) => void;
  fetchRemoteState: () => Promise<void>;
  sendRemoteCommand: (
    action: string,
    payload?: Record<string, unknown>
  ) => Promise<void>;

  // Worker & Account Actions
  startAll: () => void;
  stopAll: () => void;
  startUser: (accountId: string) => void;
  stopUser: (accountId: string) => void;
  deleteAccount: (accountId: string) => void;
  resetAllStats: () => void;
  resetUserStats: (accountId: string) => void;

  // Group Actions
  createGroup: (
    accountId: string,
    data: Omit<ControlGroupItem, "id" | "accountId"> & {
      newImages?: ControlUploadImage[];
    }
  ) => void;
  updateGroup: (
    accountId: string,
    groupId: string,
    data: Partial<Omit<ControlGroupItem, "id" | "accountId">> & {
      existingImages?: string[];
      newImages?: ControlUploadImage[];
    }
  ) => void;
  deleteGroup: (accountId: string, groupId: string) => void;
  toggleGroupActive: (accountId: string, groupId: string) => void;

  // Logger Actions
  addLog: (level: ControlLogLevel, source: string, message: string) => void;
  clearLogs: () => void;
  setLogLevelFilter: (filter: "all" | ControlLogLevel) => void;
  setLogSearchQuery: (query: string) => void;
  setLogAutoScroll: (auto: boolean) => void;

  // Config Actions (No Presets)
  setDelayRange: (
    key: ControlDelayRangeKey,
    bound: "min" | "max",
    value: number
  ) => void;
  setTextMode: (mode: "typing" | "paste") => void;
  setToggleSetting: (
    key: "hideScreen" | "autoRetry" | "autoUpdate" | "skipPending",
    value: boolean
  ) => void;
  resetConfig: () => void;

  // Auth Actions
  loginWithKey: (code: string) => Promise<{ success: boolean; error?: string }>;
  restoreSession: () => Promise<void>;
  logoutKey: () => void;
}

export const useControlStore = create<ControlState>((set, get) => ({
  keyInfo: null,
  isBotOnline: false,
  lastSyncAt: null,
  stats: {
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
  },
  chartRange: 7,
  dailyStats: [],

  accounts: [],
  accountSearch: "",
  workerFilter: "all",
  isAllRunning: false,

  groupsByAccount: {},
  groupSearch: "",
  editingGroup: null,
  isGroupDialogOpen: false,

  logs: [
    {
      id: "init-1",
      timestamp: nowTimeStr(),
      level: "info",
      source: "SYSTEM",
      message: "เชื่อมต่อระบบ Web Remote Control พร้อมรับคำสั่งแล้ว",
    },
  ],
  logLevelFilter: "all",
  logSearchQuery: "",
  logAutoScroll: true,

  config: { ...DEFAULT_BOT_CONFIG },
  settingsTab: "delay",

  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
  lastCommandSentAt: 0,

  clearError: () => set({ error: null }),
  setStats: (newStats) =>
    set((state) => ({ stats: { ...state.stats, ...newStats } })),
  setChartRange: (chartRange) => set({ chartRange }),
  setDailyStats: (dailyStats) => set({ dailyStats }),
  setAccountSearch: (accountSearch) => set({ accountSearch }),
  setWorkerFilter: (workerFilter) => set({ workerFilter }),
  setGroupSearch: (groupSearch) => set({ groupSearch }),
  setEditingGroup: (editingGroup) => set({ editingGroup }),
  setIsGroupDialogOpen: (isGroupDialogOpen) => set({ isGroupDialogOpen }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),

  applyRemoteSnapshot: (payload) => {
    if (!payload?.state) return;
    // Prevent an in-flight snapshot older than 1200ms after a web mutation from overwriting optimistic UI
    if (Date.now() - get().lastCommandSentAt < 1200) return;

    const {
      stats,
      dailyStats,
      accounts,
      groupsByAccount,
      config,
      logs,
      isAllRunning,
    } = payload.state;

    set((prev) => ({
      isBotOnline: Boolean(payload.online),
      lastSyncAt: payload.lastSyncAt || null,
      ...(stats ? { stats } : {}),
      ...(Array.isArray(dailyStats) ? { dailyStats } : {}),
      ...(Array.isArray(accounts) ? { accounts } : {}),
      ...(groupsByAccount ? { groupsByAccount } : {}),
      ...(config && payload.online ? { config } : {}),
      ...(Array.isArray(logs) && logs.length > 0
        ? { logs }
        : { logs: prev.logs }),
      ...(typeof isAllRunning === "boolean" ? { isAllRunning } : {}),
    }));
  },

  fetchRemoteState: async () => {
    const { keyInfo, applyRemoteSnapshot } = get();
    if (!keyInfo?.code) return;

    try {
      const { data } = await axios.get(
        `/api/v1/public/control/state?code=${encodeURIComponent(keyInfo.code)}`
      );
      if (data?.success && data.state) {
        applyRemoteSnapshot(data);
      }
    } catch {
      // Ignore transient poll errors
    }
  },

  sendRemoteCommand: async (action, payload) => {
    const { keyInfo } = get();
    if (!keyInfo?.code) return;

    set({ lastCommandSentAt: Date.now() });
    try {
      await axios.post("/api/v1/public/control/command", {
        code: keyInfo.code,
        action,
        payload,
      });
    } catch {
      // Ignore error
    }
  },

  addLog: (level, source, message) =>
    set((state) => ({
      logs: [
        ...state.logs.slice(-199),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: nowTimeStr(),
          level,
          source,
          message,
        },
      ],
    })),

  startAll: () => {
    const { accounts, addLog, sendRemoteCommand } = get();
    set({
      isAllRunning: true,
      accounts: accounts.map((acc) => ({
        ...acc,
        isRunning: true,
        currentTask: "กำลังเตรียมเปิดลิงก์กลุ่มเป้าหมาย...",
        taskTimer: { duration: 15, remaining: 15 },
      })),
    });
    addLog("info", "WORKER", "ส่งคำสั่งเริ่มทำงานทั้งหมด (START_ALL) ไปยังบอทแล้ว");
    void sendRemoteCommand("START_ALL");
  },

  stopAll: () => {
    const { accounts, addLog, sendRemoteCommand } = get();
    set({
      isAllRunning: false,
      accounts: accounts.map((acc) => ({
        ...acc,
        isRunning: false,
        currentTask: "พร้อมทำงาน",
        taskTimer: null,
      })),
    });
    addLog("warn", "WORKER", "ส่งคำสั่งหยุดทำงานทั้งหมด (STOP_ALL) เรียบร้อยแล้ว");
    void sendRemoteCommand("STOP_ALL");
  },

  startUser: (accountId) => {
    const { accounts, addLog, sendRemoteCommand } = get();
    const target = accounts.find((a) => a.id === accountId);
    const updated = accounts.map((acc) =>
      acc.id === accountId
        ? {
            ...acc,
            isRunning: true,
            currentTask: "กำลังเริ่มรันงาน...",
            taskTimer: { duration: 10, remaining: 10 },
          }
        : acc
    );
    set({
      accounts: updated,
      isAllRunning: updated.length > 0 && updated.every((a) => a.isRunning),
    });
    addLog(
      "info",
      target?.name || accountId,
      `สั่งเริ่มทำงานบัญชี "${target?.name || accountId}"`
    );
    void sendRemoteCommand("START_USER", { accountId });
  },

  stopUser: (accountId) => {
    const { accounts, addLog, sendRemoteCommand } = get();
    const target = accounts.find((a) => a.id === accountId);
    const updated = accounts.map((acc) =>
      acc.id === accountId
        ? {
            ...acc,
            isRunning: false,
            currentTask: "หยุดการทำงานแล้ว",
            taskTimer: null,
          }
        : acc
    );
    set({
      accounts: updated,
      isAllRunning: updated.length > 0 && updated.every((a) => a.isRunning),
    });
    addLog(
      "warn",
      target?.name || accountId,
      `สั่งหยุดทำงานบัญชี "${target?.name || accountId}"`
    );
    void sendRemoteCommand("STOP_USER", { accountId });
  },

  deleteAccount: (accountId) => {
    const { accounts, groupsByAccount, addLog, sendRemoteCommand } = get();
    const target = accounts.find((a) => a.id === accountId);
    const nextGroups = { ...groupsByAccount };
    delete nextGroups[accountId];
    set({
      accounts: accounts.filter((a) => a.id !== accountId),
      groupsByAccount: nextGroups,
    });
    addLog(
      "warn",
      "ACCOUNT",
      `ลบบัญชี "${target?.name || accountId}" ออกจากระบบแล้ว`
    );
    void sendRemoteCommand("DELETE_ACCOUNT", { accountId });
  },

  resetAllStats: () => {
    const { accounts, addLog, sendRemoteCommand } = get();
    set({
      stats: { total: 0, success: 0, failed: 0, pending: 0 },
      dailyStats: [],
      accounts: accounts.map((acc) => ({
        ...acc,
        stats: {
          total: 0,
          success: 0,
          failed: 0,
          pending: 0,
          post: 0,
          comment: 0,
          reaction: 0,
        },
      })),
    });
    addLog("info", "SYSTEM", "รีเซ็ตสถิติทั้งหมดของระบบเป็น 0 เรียบร้อยแล้ว");
    void sendRemoteCommand("RESET_ALL_STATS");
  },

  resetUserStats: (accountId) => {
    const { accounts, addLog, sendRemoteCommand } = get();
    const target = accounts.find((a) => a.id === accountId);
    set({
      accounts: accounts.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              stats: {
                total: 0,
                success: 0,
                failed: 0,
                pending: 0,
                post: 0,
                comment: 0,
                reaction: 0,
              },
            }
          : acc
      ),
    });
    addLog(
      "info",
      target?.name || accountId,
      `รีเซ็ตสถิติของบัญชี "${target?.name || accountId}" เรียบร้อยแล้ว`
    );
    void sendRemoteCommand("RESET_USER_STATS", { accountId });
  },

  createGroup: (accountId, data) => {
    const { groupsByAccount, addLog, sendRemoteCommand } = get();
    const current = groupsByAccount[accountId] || [];
    const uploadedNewImages = Array.isArray(data.newImages) ? data.newImages : [];
    const optimisticPreviews: Record<string, string> = {
      ...(data.imagePreviews || {}),
    };
    const imageFileNames: string[] = [...(data.images || [])];

    for (const img of uploadedNewImages) {
      if (img.name && img.data) {
        if (!imageFileNames.includes(img.name)) {
          imageFileNames.push(img.name);
        }
        optimisticPreviews[img.name] = img.data;
      }
    }

    const newGroup: ControlGroupItem = {
      id: `grp-${Date.now()}`,
      accountId,
      name: data.name,
      content: data.content,
      comments: data.comments,
      reaction: data.reaction,
      links: data.links,
      images: imageFileNames,
      imagePreviews: optimisticPreviews,
      randomContent: Boolean(data.randomContent),
      randomImage: Boolean(data.randomImage),
      randomReaction: Boolean(data.randomReaction),
      isActive: data.isActive !== false,
    };
    set({
      groupsByAccount: {
        ...groupsByAccount,
        [accountId]: [newGroup, ...current],
      },
    });
    addLog("success", "GROUP", `สร้างหมวดหมู่กลุ่ม "${data.name}" สำเร็จ`);
    void sendRemoteCommand("CREATE_GROUP", {
      accountId,
      userId: accountId,
      name: data.name,
      content: data.content,
      comments: data.comments,
      reaction: data.reaction,
      link: data.links,
      links: data.links,
      images:
        uploadedNewImages.length > 0
          ? uploadedNewImages.map((img) => ({ name: img.name, data: img.data }))
          : data.images || [],
      newImages: uploadedNewImages.map((img) => ({ name: img.name, data: img.data })),
      randomContent: Boolean(data.randomContent),
      randomImage: Boolean(data.randomImage),
      randomReaction: Boolean(data.randomReaction),
      isActive: data.isActive !== false,
      group: newGroup,
    });
  },

  updateGroup: (accountId, groupId, data) => {
    const { groupsByAccount, addLog, sendRemoteCommand } = get();
    const current = groupsByAccount[accountId] || [];
    const oldTarget = current.find((g) => g.id === groupId);
    const oldName = oldTarget?.name || data.name || "";
    const existingImagesList = Array.isArray(data.existingImages)
      ? data.existingImages
      : data.images ?? oldTarget?.images ?? [];
    const uploadedNewImages = Array.isArray(data.newImages) ? data.newImages : [];

    const nextPreviews: Record<string, string> = {};
    const prevPreviews = oldTarget?.imagePreviews || {};
    for (const fileName of existingImagesList) {
      if (prevPreviews[fileName]) {
        nextPreviews[fileName] = prevPreviews[fileName];
      }
    }
    const finalImageNames = [...existingImagesList];
    for (const img of uploadedNewImages) {
      if (img.name && img.data) {
        if (!finalImageNames.includes(img.name)) {
          finalImageNames.push(img.name);
        }
        nextPreviews[img.name] = img.data;
      }
    }

    const updatedItem: Partial<ControlGroupItem> = {
      ...data,
      images: finalImageNames,
      imagePreviews: nextPreviews,
    };

    const merged: ControlGroupItem | undefined = oldTarget
      ? { ...oldTarget, ...updatedItem }
      : undefined;

    set({
      groupsByAccount: {
        ...groupsByAccount,
        [accountId]: current.map((g) =>
          g.id === groupId ? { ...g, ...updatedItem } : g
        ),
      },
    });
    addLog(
      "info",
      "GROUP",
      `อัปเดตข้อมูลหมวดหมู่กลุ่ม "${data.name || groupId}" เรียบร้อยแล้ว`
    );
    void sendRemoteCommand("UPDATE_GROUP", {
      accountId,
      userId: accountId,
      groupId,
      oldName,
      name: merged?.name ?? data.name ?? oldName,
      content: merged?.content ?? data.content ?? "",
      comments: merged?.comments ?? data.comments ?? "",
      reaction: merged?.reaction ?? data.reaction ?? "",
      link: merged?.links ?? data.links ?? [],
      links: merged?.links ?? data.links ?? [],
      existingImages: existingImagesList,
      images: uploadedNewImages.map((img) => ({ name: img.name, data: img.data })),
      newImages: uploadedNewImages.map((img) => ({ name: img.name, data: img.data })),
      randomContent: Boolean(merged?.randomContent ?? data.randomContent),
      randomImage: Boolean(merged?.randomImage ?? data.randomImage),
      randomReaction: Boolean(merged?.randomReaction ?? data.randomReaction),
      isActive: merged?.isActive ?? true,
      data: updatedItem,
    });
  },

  deleteGroup: (accountId, groupId) => {
    const { groupsByAccount, addLog, sendRemoteCommand } = get();
    const current = groupsByAccount[accountId] || [];
    const target = current.find((g) => g.id === groupId);
    set({
      groupsByAccount: {
        ...groupsByAccount,
        [accountId]: current.filter((g) => g.id !== groupId),
      },
    });
    addLog(
      "warn",
      "GROUP",
      `ลบหมวดหมู่กลุ่ม "${target?.name || groupId}" เรียบร้อยแล้ว`
    );
    void sendRemoteCommand("DELETE_GROUP", {
      accountId,
      userId: accountId,
      groupId,
      name: target?.name,
      groupName: target?.name,
    });
  },

  toggleGroupActive: (accountId, groupId) => {
    const { groupsByAccount, sendRemoteCommand } = get();
    const current = groupsByAccount[accountId] || [];
    const target = current.find((g) => g.id === groupId);
    const nextActive = target ? !target.isActive : true;
    set({
      groupsByAccount: {
        ...groupsByAccount,
        [accountId]: current.map((g) =>
          g.id === groupId ? { ...g, isActive: nextActive } : g
        ),
      },
    });
    void sendRemoteCommand("TOGGLE_GROUP", {
      accountId,
      userId: accountId,
      groupId,
      name: target?.name,
      groupName: target?.name,
      isActive: nextActive,
    });
  },

  clearLogs: () => {
    const { sendRemoteCommand } = get();
    set({ logs: [] });
    void sendRemoteCommand("CLEAR_LOGS");
  },
  setLogLevelFilter: (logLevelFilter) => set({ logLevelFilter }),
  setLogSearchQuery: (logSearchQuery) => set({ logSearchQuery }),
  setLogAutoScroll: (logAutoScroll) => set({ logAutoScroll }),

  setDelayRange: (key, bound, value) => {
    const { config, sendRemoteCommand } = get();
    const updatedConfig = {
      ...config,
      [key]: {
        ...config[key],
        [bound]: Math.max(0, value),
      },
    };
    set({ config: updatedConfig });
    void sendRemoteCommand("UPDATE_CONFIG", { config: updatedConfig });
  },

  setTextMode: (textMode) => {
    const { config, sendRemoteCommand } = get();
    const updatedConfig = {
      ...config,
      textMode,
    };
    set({ config: updatedConfig });
    void sendRemoteCommand("UPDATE_CONFIG", { config: updatedConfig });
  },

  setToggleSetting: (key, value) => {
    const { config, sendRemoteCommand } = get();
    const updatedConfig = {
      ...config,
      [key]: value,
    };
    set({ config: updatedConfig });
    void sendRemoteCommand("UPDATE_CONFIG", { config: updatedConfig });
  },

  resetConfig: () => {
    const { addLog, sendRemoteCommand } = get();
    set({ config: { ...DEFAULT_BOT_CONFIG } });
    addLog("info", "CONFIG", "คืนค่าการตั้งค่าระบบกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว");
    void sendRemoteCommand("RESET_CONFIG", { config: DEFAULT_BOT_CONFIG });
  },

  loginWithKey: async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      const msg = "กรุณากรอกรหัสคีย์ก่อนเข้าใช้งาน";
      set({ error: msg });
      return { success: false, error: msg };
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post("/api/v1/public/control/auth", {
        code: trimmed,
      });

      const validatedKey: ControlKeyInfo = data.key;

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, validatedKey.code);
      }

      set({
        keyInfo: validatedKey,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      void get().fetchRemoteState();
      return { success: true };
    } catch (err: unknown) {
      let errorMsg = "ไม่สามารถตรวจสอบรหัสคีย์ได้";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({
        keyInfo: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  },

  restoreSession: async () => {
    if (typeof window === "undefined") {
      set({ isInitializing: false });
      return;
    }

    const savedCode = localStorage.getItem(STORAGE_KEY);
    if (!savedCode) {
      set({ isInitializing: false });
      return;
    }

    set({ isInitializing: true, error: null });
    try {
      const { data } = await axios.post("/api/v1/public/control/auth", {
        code: savedCode,
      });
      set({
        keyInfo: data.key,
        isAuthenticated: true,
        isInitializing: false,
        error: null,
      });
      void get().fetchRemoteState();
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({
        keyInfo: null,
        isAuthenticated: false,
        isInitializing: false,
        error: null,
      });
    }
  },

  logoutKey: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      keyInfo: null,
      isAuthenticated: false,
      isBotOnline: false,
      error: null,
    });
  },
}));
