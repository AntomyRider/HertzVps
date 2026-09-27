import { create } from "zustand";
import axios from "axios";

export interface ControllerStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
}

export interface ControllerChartPoint {
  date: string;
  label: string;
  success: number;
  failed: number;
  pending: number;
}

export interface ControllerAccountStats {
  total: number;
  success: number;
  failed: number;
  post: number;
  comment: number;
  reaction: number;
}

export interface ControllerAccountItem {
  id: string;
  fbId: string;
  name: string;
  avatar: string | null;
  isRunning: boolean;
  currentTask: string;
  groupName: string;
  groupCurrent: number;
  groupTotal: number;
  stats: ControllerAccountStats;
}

export type ControllerReactionType =
  | ""
  | "LIKE"
  | "LOVE"
  | "CARE"
  | "HAHA"
  | "WOW"
  | "SAD"
  | "ANGRY";

export interface ControllerGroupItem {
  id: string;
  accountId: string;
  name: string;
  enabled: boolean;
  image: string | null;
  images: string[];
  links: string;
  content: string;
  comment: string;
  reaction: ControllerReactionType;
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
}

export type ControllerLogActionType = "POST" | "COMMENT" | "REACTION" | "SYSTEM";
export type ControllerLogStatusType = "SUCCESS" | "FAILED" | "INFO";

export interface ControllerLogItem {
  id: string;
  timestamp: string;
  accountId: string;
  accountName: string;
  groupName?: string;
  action: ControllerLogActionType;
  status: ControllerLogStatusType;
  message: string;
}

export interface ControllerLogFilter {
  search: string;
  accountId: string;
  status: "ALL" | ControllerLogStatusType;
  autoScroll: boolean;
}

interface ControllerState {
  // Key & Connection state
  keyCode: string;
  inputKey: string;
  isConnected: boolean;
  isProgramOnline: boolean;
  isReconnecting: boolean;
  isConnecting: boolean;
  isAuthChecking: boolean;
  showKey: boolean;
  connectError: string | null;

  // Overview stats & chart state
  stats: ControllerStats;
  chartData: ControllerChartPoint[];
  timeRange: "7d" | "30d" | "1y";
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Manage accounts state
  accounts: ControllerAccountItem[];
  accountSearch: string;

  // Groups state & modal
  groupsByAccount: Record<string, ControllerGroupItem[]>;
  groupSearch: string;
  isGroupDialogOpen: boolean;
  editingGroup: ControllerGroupItem | null;

  // Logger state
  logs: ControllerLogItem[];
  logFilter: ControllerLogFilter;

  // Screen Monitor state
  screenFrame: string | null;
  screenResolution: string | null;
  screenUpdatedAt: string | null;
  isMonitorPaused: boolean;
  monitorPreset: "smooth" | "balanced" | "hd";
  isMonitorFullscreen: boolean;

  // Actions
  setInputKey: (val: string) => void;
  setShowKey: (show: boolean) => void;
  connectWithKey: (code?: string) => Promise<{ success: boolean; error?: string }>;
  disconnectKey: () => void;
  initRealtimeIfNeeded: () => Promise<void>;
  fetchOverviewData: (
    range?: "7d" | "30d" | "1y",
    silent?: boolean
  ) => Promise<void>;
  setTimeRange: (range: "7d" | "30d" | "1y") => void;

  // Monitor actions
  toggleMonitorPaused: () => Promise<void>;
  setMonitorPreset: (preset: "smooth" | "balanced" | "hd") => Promise<void>;
  setIsMonitorFullscreen: (open: boolean) => void;
  sendRtcSignal: (payload: Record<string, unknown>) => Promise<void>;

  // Manage actions (Full CRUD -> /api/v1/public/controller/to-program)
  setAccountSearch: (search: string) => void;
  startAllAccounts: () => Promise<void>;
  stopAllAccounts: () => Promise<void>;
  toggleAccountRunning: (id: string) => Promise<void>;
  resetAccountStats: (id: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Groups actions (Full CRUD -> /api/v1/public/controller/to-program)
  setGroupSearch: (search: string) => void;
  openCreateGroupDialog: () => void;
  openEditGroupDialog: (group: ControllerGroupItem) => void;
  closeGroupDialog: () => void;
  toggleGroupEnabled: (
    accountId: string,
    groupId: string,
    enabled?: boolean
  ) => Promise<void>;
  saveGroup: (
    accountId: string,
    payload: {
      name: string;
      images: string[];
      links: string;
      content: string;
      comment: string;
      reaction: ControllerReactionType;
      randomContent: boolean;
      randomImage: boolean;
      randomReaction: boolean;
    }
  ) => Promise<void>;
  deleteGroup: (accountId: string, groupId: string) => Promise<void>;
  deleteAllGroups: (accountId: string) => Promise<void>;

  // Logger actions
  updateLogFilter: (patch: Partial<ControllerLogFilter>) => void;
  clearLogs: () => Promise<void>;
  addLog: (log: Omit<ControllerLogItem, "id" | "timestamp">) => void;
}

const SESSION_STORAGE_KEY = "hertz_controller_key";

let activeEventSource: EventSource | null = null;
let activeSubscribedKey = "";

type ScreenFrameListener = (
  frame: string,
  resolution?: string | null,
  updatedAt?: string | null
) => void;

const screenFrameListeners = new Set<ScreenFrameListener>();
let latestScreenFrameCache: string | null = null;

export const subscribeScreenFrame = (listener: ScreenFrameListener) => {
  screenFrameListeners.add(listener);
  if (latestScreenFrameCache) {
    listener(latestScreenFrameCache);
  }
  return () => {
    screenFrameListeners.delete(listener);
  };
};

const emitScreenFrameFast = (
  frame: string | null | undefined,
  resolution?: string | null,
  updatedAt?: string | null
) => {
  if (!frame) return;
  latestScreenFrameCache = frame;
  for (const listener of screenFrameListeners) {
    try {
      listener(frame, resolution, updatedAt);
    } catch {}
  }
};

type RtcSignalListener = (signal: Record<string, unknown>) => void;
const rtcSignalListeners = new Set<RtcSignalListener>();

export const subscribeRtcSignal = (listener: RtcSignalListener) => {
  rtcSignalListeners.add(listener);
  return () => {
    rtcSignalListeners.delete(listener);
  };
};

const emitRtcSignal = (signal: Record<string, unknown> | undefined) => {
  if (!signal) return;
  for (const listener of rtcSignalListeners) {
    try {
      listener(signal);
    } catch {}
  }
};

const closeActiveSSE = () => {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
  activeSubscribedKey = "";
};

const buildZeroChartPoints = (
  range: "7d" | "30d" | "1y"
): ControllerChartPoint[] => {
  const count = range === "7d" ? 7 : range === "30d" ? 30 : 12;
  const now = new Date();
  const points: ControllerChartPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "1y") {
      d.setMonth(d.getMonth() - i);
      points.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", { month: "short" }),
        success: 0,
        failed: 0,
        pending: 0,
      });
    } else {
      d.setDate(d.getDate() - i);
      points.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        success: 0,
        failed: 0,
        pending: 0,
      });
    }
  }

  return points;
};

const formatCurrentTime = () =>
  new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const INITIAL_LOG_FILTER: ControllerLogFilter = {
  search: "",
  accountId: "",
  status: "ALL",
  autoScroll: true,
};

const EMPTY_STATS: ControllerStats = {
  total: 0,
  success: 0,
  failed: 0,
  pending: 0,
};

export const useControllerStore = create<ControllerState>((set, get) => {
  const openSSEStreamForKey = (targetKey: string) => {
    if (typeof window === "undefined" || !targetKey) return;
    if (activeEventSource && activeSubscribedKey === targetKey) return;

    closeActiveSSE();
    activeSubscribedKey = targetKey;

    const url = `/api/v1/public/controller/from-program?code=${encodeURIComponent(
      targetKey
    )}&mode=stream&timeRange=${get().timeRange}`;

    const es = new EventSource(url);
    activeEventSource = es;

    const applyIncomingData = (raw: string) => {
      try {
        const parsed = JSON.parse(raw);
        const data = parsed?.data || parsed;
        if (!data) return;

        if (parsed.type === "PROGRAM_OFFLINE") {
          set({
            isProgramOnline: false,
            isReconnecting: false,
            stats: { ...EMPTY_STATS },
            chartData: buildZeroChartPoints(get().timeRange),
            accounts: [],
            groupsByAccount: {},
            logs: [],
            screenFrame: null,
            screenResolution: null,
            screenUpdatedAt: null,
            isMonitorPaused: true,
          });
          return;
        }

        set((state) => ({
          ...(typeof data.isProgramOnline === "boolean"
            ? { isProgramOnline: data.isProgramOnline }
            : {}),
          ...(typeof data.isReconnecting === "boolean"
            ? { isReconnecting: data.isReconnecting }
            : {}),
          ...(data.stats ? { stats: data.stats } : {}),
          ...(Array.isArray(data.chartData) && data.chartData.length > 0
            ? { chartData: data.chartData }
            : {}),
          ...(Array.isArray(data.accounts)
            ? { accounts: data.accounts }
            : {}),
          ...(data.groupsByAccount
            ? { groupsByAccount: data.groupsByAccount }
            : {}),
          ...(Array.isArray(data.logs) ? { logs: data.logs } : {}),
          ...(typeof data.screenFrame === "string" && data.screenFrame
            ? { screenFrame: data.screenFrame }
            : {}),
          ...(typeof data.screenResolution === "string"
            ? { screenResolution: data.screenResolution }
            : {}),
          ...(typeof data.screenUpdatedAt === "string"
            ? { screenUpdatedAt: data.screenUpdatedAt }
            : {}),
          ...(data.monitorConfig
            ? {
                isMonitorPaused: Boolean(data.monitorConfig.paused),
                monitorPreset: data.monitorConfig.preset || state.monitorPreset,
              }
            : {}),
          isConnected: true,
          error: null,
          isLoading: false,
          isRefreshing: false,
        }));
      } catch {
        // Ignore malformed SSE frame
      }
    };

    es.addEventListener("rtc_signal", (evt) => {
      try {
        const parsed = JSON.parse((evt as MessageEvent).data || "{}");
        const data = parsed.data || parsed;
        if (data && data.rtcSignal) {
          emitRtcSignal(data.rtcSignal as Record<string, unknown>);
        }
      } catch {}
    });

    es.addEventListener("screen_frame", (evt) => {
      try {
        const parsed = JSON.parse((evt as MessageEvent).data || "{}");
        const data = parsed.data || parsed;
        if (typeof data.screenFrame === "string" && data.screenFrame) {
          emitScreenFrameFast(
            data.screenFrame,
            data.screenResolution,
            data.screenUpdatedAt
          );
          const cur = get();
          if (
            !cur.screenFrame ||
            !cur.isProgramOnline ||
            (data.screenResolution &&
              cur.screenResolution !== data.screenResolution)
          ) {
            set({
              screenFrame: data.screenFrame,
              screenResolution: data.screenResolution || cur.screenResolution,
              screenUpdatedAt: data.screenUpdatedAt || cur.screenUpdatedAt,
              isProgramOnline: true,
              isReconnecting: false,
            });
          }
        }
      } catch {}
    });

    [
      "snapshot",
      "state_updated",
      "account_updated",
      "groups_updated",
      "overview_updated",
      "log_pushed",
      "program_status",
      "program_offline",
    ].forEach((eventName) => {
      es.addEventListener(eventName, (evt) => {
        try {
          const parsed = JSON.parse((evt as MessageEvent).data || "{}");
          const data = parsed.data || parsed;
          if (typeof data.screenFrame === "string" && data.screenFrame) {
            emitScreenFrameFast(
              data.screenFrame,
              data.screenResolution,
              data.screenUpdatedAt
            );
          }
        } catch {}
        applyIncomingData((evt as MessageEvent).data);
      });
    });
  };

  return {
    keyCode: "",
    inputKey: "",
    isConnected: false,
    isProgramOnline: false,
    isReconnecting: false,
    isConnecting: false,
    isAuthChecking: true,
    showKey: false,
    connectError: null,

    stats: { ...EMPTY_STATS },
    chartData: buildZeroChartPoints("7d"),
    timeRange: "7d",
    isLoading: false,
    isRefreshing: false,
    error: null,

    // ข้อมูลทั้งหมดจะว่างเปล่าจนกว่าจะเชื่อมต่อและตัวโปรแกรมส่งข้อมูลขึ้นมา
    accounts: [],
    accountSearch: "",

    groupsByAccount: {},
    groupSearch: "",
    isGroupDialogOpen: false,
    editingGroup: null,

    logs: [],
    logFilter: INITIAL_LOG_FILTER,

    screenFrame: null,
    screenResolution: null,
    screenUpdatedAt: null,
    isMonitorPaused: true,
    monitorPreset: "balanced",
    isMonitorFullscreen: false,

    setInputKey: (inputKey) => set({ inputKey, connectError: null }),
    setShowKey: (showKey) => set({ showKey }),

    initRealtimeIfNeeded: async () => {
      if (typeof window === "undefined") return;
      const currentKey = get().keyCode;
      if (currentKey) {
        set({ isAuthChecking: false });
        openSSEStreamForKey(currentKey);
        return;
      }

      const savedKey = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedKey) {
        set({ inputKey: savedKey, isAuthChecking: true });
        await get().connectWithKey(savedKey);
      } else {
        set({ isAuthChecking: false });
      }
    },

    connectWithKey: async (customCode) => {
      const targetKey = (customCode ?? get().inputKey).trim();
      if (!targetKey) {
        const error = "กรุณากรอกรหัสคีย์เพื่อเข้าสู่ระบบ";
        set({ connectError: error, isAuthChecking: false, isConnecting: false });
        return { success: false, error };
      }

      set({ isConnecting: true, connectError: null });
      try {
        const {
          data: {
            connected,
            key,
            isProgramOnline,
            isReconnecting,
            stats,
            chartData,
            accounts,
            groupsByAccount,
            logs,
            screenFrame,
            screenResolution,
            screenUpdatedAt,
            monitorConfig,
          },
        } = await axios.post<{
          connected: boolean;
          key?: string;
          isProgramOnline?: boolean;
          isReconnecting?: boolean;
          stats?: ControllerStats;
          chartData?: ControllerChartPoint[];
          accounts?: ControllerAccountItem[];
          groupsByAccount?: Record<string, ControllerGroupItem[]>;
          logs?: ControllerLogItem[];
          screenFrame?: string | null;
          screenResolution?: string | null;
          screenUpdatedAt?: string | null;
          monitorConfig?: {
            paused: boolean;
            preset: "smooth" | "balanced" | "hd";
          };
        }>("/api/v1/public/controller/to-program", {
          code: targetKey,
          action: "CONNECT_WEB",
          timeRange: get().timeRange,
        });

        const resolvedKey = key || targetKey;
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, resolvedKey);
        }

        set({
          keyCode: resolvedKey,
          inputKey: resolvedKey,
          isConnected: Boolean(connected ?? true),
          isProgramOnline: Boolean(isProgramOnline),
          isReconnecting: Boolean(isReconnecting),
          isConnecting: false,
          isAuthChecking: false,
          connectError: null,
          stats: stats || { ...EMPTY_STATS },
          chartData:
            Array.isArray(chartData) && chartData.length > 0
              ? chartData
              : buildZeroChartPoints(get().timeRange),
          accounts: Array.isArray(accounts) ? accounts : [],
          groupsByAccount: groupsByAccount || {},
          logs: Array.isArray(logs) ? logs : [],
          screenFrame: screenFrame || null,
          screenResolution: screenResolution || null,
          screenUpdatedAt: screenUpdatedAt || null,
          isMonitorPaused:
            typeof monitorConfig?.paused === "boolean"
              ? monitorConfig.paused
              : true,
          monitorPreset: monitorConfig?.preset || "balanced",
        });

        openSSEStreamForKey(resolvedKey);
        return { success: true };
      } catch (err) {
        closeActiveSSE();
        const errMsg =
          axios.isAxiosError(err) && err.response?.data?.error
            ? String(err.response.data.error)
            : "ไม่พบคีย์ในระบบ หรือไม่สามารถเชื่อมต่อได้";

        set({
          keyCode: "",
          isConnected: false,
          isProgramOnline: false,
          isReconnecting: false,
          isConnecting: false,
          isAuthChecking: false,
          connectError: errMsg,
          stats: { ...EMPTY_STATS },
          chartData: buildZeroChartPoints(get().timeRange),
          accounts: [],
          groupsByAccount: {},
          logs: [],
          screenFrame: null,
          screenResolution: null,
          screenUpdatedAt: null,
          isMonitorPaused: true,
        });
        return { success: false, error: errMsg };
      }
    },

    disconnectKey: () => {
      closeActiveSSE();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }

      set({
        keyCode: "",
        inputKey: "",
        isConnected: false,
        isProgramOnline: false,
        isReconnecting: false,
        isConnecting: false,
        isAuthChecking: false,
        connectError: null,
        stats: { ...EMPTY_STATS },
        chartData: buildZeroChartPoints(get().timeRange),
        accounts: [],
        groupsByAccount: {},
        logs: [],
        screenFrame: null,
        screenResolution: null,
        screenUpdatedAt: null,
        isMonitorPaused: true,
      });
    },

    fetchOverviewData: async (range, silent = false) => {
      const selectedRange = range || get().timeRange;
      get().initRealtimeIfNeeded();
      const { keyCode } = get();

      if (!keyCode) {
        set({
          chartData: buildZeroChartPoints(selectedRange),
          isLoading: false,
          isRefreshing: false,
        });
        return;
      }

      if (!silent) {
        set({ isLoading: true, error: null });
      } else {
        set({ isRefreshing: true, error: null });
      }

      try {
        const query = `?mode=snapshot&timeRange=${selectedRange}&code=${encodeURIComponent(
          keyCode
        )}`;

        const {
          data: {
            stats,
            chartData,
            timeRange,
            isConnected,
            isProgramOnline,
            isReconnecting,
            accounts,
            groupsByAccount,
            logs,
          },
        } = await axios.get<{
          stats: ControllerStats;
          chartData: ControllerChartPoint[];
          timeRange: "7d" | "30d" | "1y";
          isConnected?: boolean;
          isProgramOnline?: boolean;
          isReconnecting?: boolean;
          accounts?: ControllerAccountItem[];
          groupsByAccount?: Record<string, ControllerGroupItem[]>;
          logs?: ControllerLogItem[];
        }>(`/api/v1/public/controller/from-program${query}`);

        set({
          stats: stats || { ...EMPTY_STATS },
          chartData:
            Array.isArray(chartData) && chartData.length > 0
              ? chartData
              : buildZeroChartPoints(selectedRange),
          timeRange: timeRange || selectedRange,
          ...(typeof isConnected === "boolean" ? { isConnected } : {}),
          ...(typeof isProgramOnline === "boolean" ? { isProgramOnline } : {}),
          ...(typeof isReconnecting === "boolean" ? { isReconnecting } : {}),
          ...(Array.isArray(accounts) ? { accounts } : {}),
          ...(groupsByAccount ? { groupsByAccount } : {}),
          ...(Array.isArray(logs) ? { logs } : {}),
          isLoading: false,
          isRefreshing: false,
          error: null,
        });

        openSSEStreamForKey(keyCode);
      } catch {
        set({
          chartData: buildZeroChartPoints(selectedRange),
          isLoading: false,
          isRefreshing: false,
        });
      }
    },

    setTimeRange: (range: "7d" | "30d" | "1y") => {
      set({
        timeRange: range,
        chartData: buildZeroChartPoints(range),
      });
      void get().fetchOverviewData(range, true);
    },

    toggleMonitorPaused: async () => {
      const { keyCode, isMonitorPaused, monitorPreset } = get();
      const nextPaused = !isMonitorPaused;
      set({ isMonitorPaused: nextPaused });

      if (!keyCode) return;
      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "UPDATE_MONITOR_CONFIG",
          paused: nextPaused,
          preset: monitorPreset,
        });
      } catch {
        // Ignore
      }
    },

    setMonitorPreset: async (preset) => {
      const { keyCode, isMonitorPaused } = get();
      set({ monitorPreset: preset });

      if (!keyCode) return;
      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "UPDATE_MONITOR_CONFIG",
          paused: isMonitorPaused,
          preset,
        });
      } catch {
        // Ignore
      }
    },

    setIsMonitorFullscreen: (isMonitorFullscreen) =>
      set({ isMonitorFullscreen }),

    sendRtcSignal: async (payload) => {
      const { keyCode } = get();
      if (!keyCode) return;
      try {
        await axios.post("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "RTC_SIGNAL",
          payload,
        });
      } catch {}
    },

    setAccountSearch: (accountSearch) => set({ accountSearch }),

    startAllAccounts: async () => {
      const { keyCode, accounts } = get();
      if (!keyCode || accounts.length === 0) return;

      const now = formatCurrentTime();
      const newLogs: ControllerLogItem[] = accounts.map((acc, idx) => ({
        id: `log-${Date.now()}-${idx}`,
        timestamp: now,
        accountId: acc.id,
        accountName: acc.name,
        groupName: acc.groupName,
        action: "SYSTEM",
        status: "INFO",
        message: "เริ่มการทำงานอัตโนมัติสำหรับทุกกลุ่มที่เปิดใช้งาน",
      }));

      set((state) => ({
        accounts: state.accounts.map((acc) => ({
          ...acc,
          isRunning: true,
          currentTask: "กำลังเริ่มรันงาน...",
        })),
        logs: [...state.logs, ...newLogs],
      }));

      try {
        await axios.post("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "START_ALL_ACCOUNTS",
        });
      } catch {
        // State will resync from SSE
      }
    },

    stopAllAccounts: async () => {
      const { keyCode, accounts } = get();
      if (!keyCode || accounts.length === 0) return;

      const now = formatCurrentTime();
      const newLogs: ControllerLogItem[] = accounts.map((acc, idx) => ({
        id: `log-${Date.now()}-${idx}`,
        timestamp: now,
        accountId: acc.id,
        accountName: acc.name,
        action: "SYSTEM",
        status: "INFO",
        message: "สั่งหยุดการทำงานของบัญชีเรียบร้อยแล้ว",
      }));

      set((state) => ({
        accounts: state.accounts.map((acc) => ({
          ...acc,
          isRunning: false,
          currentTask: "หยุดการทำงานแล้ว",
        })),
        logs: [...state.logs, ...newLogs],
      }));

      try {
        await axios.post("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "STOP_ALL_ACCOUNTS",
        });
      } catch {
        // State will resync from SSE
      }
    },

    toggleAccountRunning: async (id) => {
      const { keyCode, accounts } = get();
      if (!keyCode) return;

      const target = accounts.find((acc) => acc.id === id);
      const nextRunning = target ? !target.isRunning : false;

      set((state) => {
        const newLog: ControllerLogItem | null = target
          ? {
              id: `log-${Date.now()}`,
              timestamp: formatCurrentTime(),
              accountId: target.id,
              accountName: target.name,
              groupName: target.groupName,
              action: "SYSTEM",
              status: "INFO",
              message: nextRunning
                ? "เริ่มเดินงานอัตโนมัติของบัญชี"
                : "หยุดการทำงานของบัญชีชั่วคราว",
            }
          : null;

        return {
          accounts: state.accounts.map((acc) =>
            acc.id === id
              ? {
                  ...acc,
                  isRunning: nextRunning,
                  currentTask: nextRunning ? "กำลังรันงาน..." : "พร้อมทำงาน",
                }
              : acc
          ),
          logs: newLog ? [...state.logs, newLog] : state.logs,
        };
      });

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "TOGGLE_ACCOUNT",
          accountId: id,
          isRunning: nextRunning,
        });
      } catch {
        // State will resync from SSE
      }
    },

    resetAccountStats: async (id) => {
      const { keyCode } = get();
      if (!keyCode) return;

      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc.id === id
            ? {
                ...acc,
                stats: {
                  total: 0,
                  success: 0,
                  failed: 0,
                  post: 0,
                  comment: 0,
                  reaction: 0,
                },
              }
            : acc
        ),
      }));

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "RESET_ACCOUNT_STATS",
          accountId: id,
        });
      } catch {
        // State will resync from SSE
      }
    },

    deleteAccount: async (id) => {
      const { keyCode } = get();
      if (!keyCode) return;

      set((state) => ({
        accounts: state.accounts.filter((acc) => acc.id !== id),
      }));

      try {
        await axios.delete("/api/v1/public/controller/to-program", {
          data: {
            code: keyCode,
            target: "ACCOUNT",
            accountId: id,
          },
        });
      } catch {
        // State will resync from SSE
      }
    },

    setGroupSearch: (groupSearch) => set({ groupSearch }),

    openCreateGroupDialog: () =>
      set({
        editingGroup: null,
        isGroupDialogOpen: true,
      }),

    openEditGroupDialog: (group) =>
      set({
        editingGroup: group,
        isGroupDialogOpen: true,
      }),

    closeGroupDialog: () =>
      set({
        isGroupDialogOpen: false,
        editingGroup: null,
      }),

    toggleGroupEnabled: async (accountId, groupId, enabled) => {
      const { keyCode, groupsByAccount } = get();
      if (!keyCode) return;

      const current = groupsByAccount[accountId] || [];
      const target = current.find((g) => g.id === groupId);
      const nextEnabled =
        typeof enabled === "boolean"
          ? enabled
          : target
            ? !target.enabled
            : true;

      set((state) => ({
        groupsByAccount: {
          ...state.groupsByAccount,
          [accountId]: (state.groupsByAccount[accountId] || []).map((grp) =>
            grp.id === groupId ? { ...grp, enabled: nextEnabled } : grp
          ),
        },
      }));

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "TOGGLE_GROUP",
          accountId,
          groupId,
          enabled: nextEnabled,
        });
      } catch {
        // State will resync from SSE
      }
    },

    saveGroup: async (accountId, payload) => {
      const { keyCode, editingGroup } = get();
      if (!keyCode) return;

      const coverImage = payload.images.length > 0 ? payload.images[0] : null;

      if (editingGroup) {
        const targetGroupId = editingGroup.id;
        set((state) => {
          const current = state.groupsByAccount[accountId] || [];
          return {
            groupsByAccount: {
              ...state.groupsByAccount,
              [accountId]: current.map((grp) =>
                grp.id === targetGroupId
                  ? {
                      ...grp,
                      name: payload.name.trim() || grp.name,
                      image: coverImage,
                      images: payload.images,
                      links: payload.links,
                      content: payload.content,
                      comment: payload.comment,
                      reaction: payload.reaction,
                      randomContent: payload.randomContent,
                      randomImage: payload.randomImage,
                      randomReaction: payload.randomReaction,
                    }
                  : grp
              ),
            },
            isGroupDialogOpen: false,
            editingGroup: null,
          };
        });

        try {
          await axios.put("/api/v1/public/controller/to-program", {
            code: keyCode,
            accountId,
            groupId: targetGroupId,
            payload,
          });
        } catch {
          // State will resync from SSE
        }
        return;
      }

      set({
        isGroupDialogOpen: false,
        editingGroup: null,
      });

      try {
        const { data } = await axios.post<{
          groupsByAccount?: Record<string, ControllerGroupItem[]>;
        }>("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "CREATE_GROUP",
          accountId,
          payload,
        });

        if (data?.groupsByAccount) {
          set({ groupsByAccount: data.groupsByAccount });
        }
      } catch {
        // State will resync from SSE
      }
    },

    deleteGroup: async (accountId, groupId) => {
      const { keyCode } = get();
      if (!keyCode) return;

      set((state) => ({
        groupsByAccount: {
          ...state.groupsByAccount,
          [accountId]: (state.groupsByAccount[accountId] || []).filter(
            (g) => g.id !== groupId
          ),
        },
      }));

      try {
        await axios.delete("/api/v1/public/controller/to-program", {
          data: {
            code: keyCode,
            target: "GROUP",
            accountId,
            groupId,
          },
        });
      } catch {
        // State will resync from SSE
      }
    },

    deleteAllGroups: async (accountId) => {
      const { keyCode } = get();
      if (!keyCode) return;

      set((state) => ({
        groupsByAccount: {
          ...state.groupsByAccount,
          [accountId]: [],
        },
      }));

      try {
        await axios.delete("/api/v1/public/controller/to-program", {
          data: {
            code: keyCode,
            target: "ALL_GROUPS",
            accountId,
          },
        });
      } catch {
        // State will resync from SSE
      }
    },

    updateLogFilter: (patch) =>
      set((state) => ({
        logFilter: { ...(state.logFilter || INITIAL_LOG_FILTER), ...patch },
      })),

    clearLogs: async () => {
      const { keyCode } = get();
      set({ logs: [] });
      if (!keyCode) return;

      try {
        await axios.delete("/api/v1/public/controller/to-program", {
          data: {
            code: keyCode,
            target: "LOGS",
          },
        });
      } catch {
        // Ignore
      }
    },

    addLog: (log) =>
      set((state) => ({
        logs: [
          ...(state.logs || []),
          {
            ...log,
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: formatCurrentTime(),
          },
        ],
      })),
  };
});
