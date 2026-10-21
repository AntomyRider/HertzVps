import { create } from "zustand";
import axios from "axios";

export interface ControllerStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  share?: number;
  shareTotal?: number;
  shareFailed?: number;
  sharePending?: number;
  boost?: number;
  boostTotal?: number;
  boostFailed?: number;
}

export interface ControllerChartPoint {
  date: string;
  label: string;
  success: number;
  failed: number;
  pending: number;
  total?: number;
  share?: number;
  shareTotal?: number;
  shareFailed?: number;
  sharePending?: number;
  boost?: number;
  boostTotal?: number;
  boostFailed?: number;
}

export interface ControllerAccountStats {
  total: number;
  success: number;
  failed: number;
  post: number;
  comment: number;
  reaction: number;
}

export interface ControllerAccountTimer {
  duration?: number;
  remaining?: number;
  endTime?: number;
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
  taskTimer?: ControllerAccountTimer | null;
  stats: ControllerAccountStats;
  proxy?: string | null;
  isActive?: boolean;
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
  // ใช้กับ delta image sync จากโปรแกรม (ภายใน hub — UI อ่าน images อย่างเดียว)
  imageNames?: string[];
  imagePreviewsByName?: Record<string, string>;
  imageHashByName?: Record<string, string>;
  links: string;
  content: string;
  comment: string;
  reaction: ControllerReactionType;
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
  shareMode?: boolean;
  share?: string;
  shareContent?: string;
  boostMode?: boolean;
  boostLinks?: string;
  boostComments?: string;
  boostRandomComment?: boolean;
  boostCommentCount?: number;
}

export type ControllerLogActionType = "POST" | "COMMENT" | "REACTION" | "SYSTEM";
export type ControllerLogStatusType = "SUCCESS" | "FAILED" | "INFO";
export type LogLevel = "info" | "success" | "warn" | "error" | "debug";
export type LogLevelFilter = "all" | LogLevel;

export interface ControllerLogItem {
  id: string;
  timestamp: string;
  accountId: string;
  accountName: string;
  groupName?: string;
  action: ControllerLogActionType;
  status: ControllerLogStatusType;
  level?: LogLevel;
  source?: string;
  message: string;
}

export interface ControllerLogFilter {
  search: string;
  accountId: string;
  status: "ALL" | ControllerLogStatusType;
  level: LogLevelFilter;
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
  timeRange: "1d" | "7d" | "30d" | "90d" | "1y";
  statsMode: "post" | "share" | "boost";
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
  createGroupInitialData: { name?: string; links?: string[] } | null;

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

  // App config (จากโปรแกรม — แก้ได้ผ่านหน้า setting)
  config: Record<string, unknown> | null;
  isSavingConfig: boolean;

  // Real-time tool event (scan-joined, search-join, etc.)
  lastToolEvent: ControllerToolEvent | null;

  // Actions
  setInputKey: (val: string) => void;
  setShowKey: (show: boolean) => void;
  connectWithKey: (code?: string) => Promise<{ success: boolean; error?: string }>;
  disconnectKey: () => void;
  initRealtimeIfNeeded: () => Promise<void>;
  fetchOverviewData: (
    range?: "1d" | "7d" | "30d" | "90d" | "1y",
    silent?: boolean
  ) => Promise<void>;
  setTimeRange: (range: "1d" | "7d" | "30d" | "90d" | "1y") => void;
  setStatsMode: (mode: "post" | "share" | "boost") => void;

  // Monitor actions
  toggleMonitorPaused: () => Promise<void>;
  setMonitorPreset: (preset: "smooth" | "balanced" | "hd") => Promise<void>;
  setIsMonitorFullscreen: (open: boolean) => void;
  sendRtcSignal: (payload: Record<string, unknown>) => Promise<void>;

  // App config actions (ส่งคำสั่ง UPDATE_CONFIG — คืน null เมื่อส่งสำเร็จ หรือข้อความ error)
  updateAppConfig: (patch: Record<string, unknown>) => Promise<string | null>;

  // Manage actions (Full CRUD -> /api/v1/public/controller/to-program)
  actionLoading: Record<string, boolean>;
  isAllActionLoading: boolean;
  setAccountSearch: (search: string) => void;
  startAllAccounts: () => Promise<void>;
  stopAllAccounts: () => Promise<void>;
  startAccount: (id: string) => Promise<void>;
  stopAccount: (id: string) => Promise<void>;
  toggleAccountRunning: (id: string) => Promise<void>;
  resetAccountStats: (id: string) => Promise<void>;
  resetAllStats: () => Promise<boolean>;
  resetCategoryStats: (
    accountId: string,
    category: "post" | "share" | "boost"
  ) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<void>;

  // Key & License actions
  keyDetails: {
    hwid?: string | null;
    remainingDays?: number;
    expiresAt?: string;
    isActive?: boolean;
    isActivated?: boolean;
  } | null;
  fetchKeyDetails: () => Promise<void>;
  resetHwid: () => Promise<{ success: boolean; message?: string; error?: string }>;

  // Groups actions (Full CRUD -> /api/v1/public/controller/to-program)
  setGroupSearch: (search: string) => void;
  openCreateGroupDialog: () => void;
  openCreateGroupWithData: (data: { name?: string; links?: string[] }) => void;
  openEditGroupDialog: (group: ControllerGroupItem) => void;
  closeGroupDialog: () => void;
  batchCopyGroups: (
    sourceAccountId: string,
    targetAccountId: string,
    groupNames: string[]
  ) => Promise<{ success: boolean; message?: string; count?: number }>;
  updateAccountProfile: (
    accountId: string,
    data: {
      name?: string;
      avatar?: string | null;
      proxy?: string | null;
      isActive?: boolean;
    }
  ) => Promise<{ success: boolean; message?: string }>;
  sendToolCommand: (
    action: string,
    accountId: string,
    payload?: Record<string, unknown>
  ) => Promise<{ success: boolean; message?: string; data?: unknown }>;
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
      shareMode?: boolean;
      share?: string;
      shareContent?: string;
      boostMode?: boolean;
      boostLinks?: string;
      boostComments?: string;
      boostRandomComment?: boolean;
      boostCommentCount?: number;
    }
  ) => Promise<void>;
  deleteGroup: (accountId: string, groupId: string) => Promise<void>;
  deleteAllGroups: (accountId: string) => Promise<void>;

  // Logger actions
  updateLogFilter: (patch: Partial<ControllerLogFilter>) => void;
  toggleLogAutoScroll: () => void;
  setLogLevelFilter: (level: LogLevelFilter) => void;
  setLogSearchQuery: (query: string) => void;
  copyLogs: () => Promise<boolean>;
  clearLogs: () => Promise<void>;
  addLog: (log: Omit<ControllerLogItem, "id" | "timestamp">) => void;
}

const SESSION_STORAGE_KEY = "hertz_controller_key";

let activeEventSource: EventSource | null = null;
let activeSubscribedKey = "";
const pendingStopAccountIds = new Map<string, number>();
let pendingStopAllUntil = 0;

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

export interface ControllerToolEvent {
  tool: string;
  userId?: string;
  type: string;
  message?: string;
  groups?: unknown[];
  results?: unknown[];
  data?: unknown;
  mode?: string;
  code?: number;
  [key: string]: unknown;
}

type ToolEventListener = (event: ControllerToolEvent) => void;
const toolEventListeners = new Set<ToolEventListener>();

export const subscribeToolEvent = (listener: ToolEventListener) => {
  toolEventListeners.add(listener);
  return () => {
    toolEventListeners.delete(listener);
  };
};

const emitToolEvent = (event: ControllerToolEvent | undefined) => {
  if (!event) return;
  for (const listener of toolEventListeners) {
    try {
      listener(event);
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
  range: "1d" | "7d" | "30d" | "90d" | "1y"
): ControllerChartPoint[] => {
  if (range === "1d") {
    const defaultTwoHourSlots = [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ];
    return defaultTwoHourSlots.map((slot) => ({
      date: slot,
      label: slot,
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
      share: 0,
      shareTotal: 0,
      shareFailed: 0,
      sharePending: 0,
      boost: 0,
      boostTotal: 0,
      boostFailed: 0,
    }));
  }

  const count =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 12;
  const now = new Date();
  const points: ControllerChartPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "1y") {
      d.setMonth(d.getMonth() - i);
      points.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", { month: "short" }),
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        share: 0,
        shareTotal: 0,
        shareFailed: 0,
        sharePending: 0,
        boost: 0,
        boostTotal: 0,
        boostFailed: 0,
      });
    } else {
      d.setDate(d.getDate() - i);
      points.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        share: 0,
        shareTotal: 0,
        shareFailed: 0,
        sharePending: 0,
        boost: 0,
        boostTotal: 0,
        boostFailed: 0,
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
  level: "all",
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
            isMonitorPaused: false,
          });
          return;
        }

        let accountsToApply = data.accounts;
        if (Array.isArray(accountsToApply)) {
          const now = Date.now();
          const isStopAllActive = pendingStopAllUntil > now;
          accountsToApply = accountsToApply.map((acc: ControllerAccountItem) => {
            const isAccStopActive = (pendingStopAccountIds.get(acc.id) || 0) > now;
            if (isStopAllActive || isAccStopActive) {
              return {
                ...acc,
                isRunning: false,
                currentTask: "หยุดการทำงานแล้ว",
                taskTimer: null,
              };
            }
            return acc;
          });
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
          ...(Array.isArray(accountsToApply)
            ? { accounts: accountsToApply }
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
          ...(data.config && typeof data.config === "object"
            ? { config: data.config as Record<string, unknown> }
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

    es.addEventListener("tool_event", (evt) => {
      try {
        const parsed = JSON.parse((evt as MessageEvent).data || "{}");
        const data = parsed.data || parsed;
        if (data && data.toolEvent) {
          emitToolEvent(data.toolEvent as ControllerToolEvent);
          set({ lastToolEvent: data.toolEvent as ControllerToolEvent });
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
    config: null,
    isSavingConfig: false,
    keyDetails: null,

    stats: { ...EMPTY_STATS },
    chartData: buildZeroChartPoints("7d"),
    timeRange: "7d",
    statsMode: "post",
    isLoading: false,
    isRefreshing: false,
    error: null,

    // ข้อมูลทั้งหมดจะว่างเปล่าจนกว่าจะเชื่อมต่อและตัวโปรแกรมส่งข้อมูลขึ้นมา
    accounts: [],
    accountSearch: "",
    actionLoading: {},
    isAllActionLoading: false,

    groupsByAccount: {},
    groupSearch: "",
    isGroupDialogOpen: false,
    editingGroup: null,
    createGroupInitialData: null,

    logs: [],
    logFilter: INITIAL_LOG_FILTER,

    screenFrame: null,
    screenResolution: null,
    screenUpdatedAt: null,
    isMonitorPaused: false,
    monitorPreset: "balanced",
    isMonitorFullscreen: false,
    lastToolEvent: null,

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
              : false,
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
          isMonitorPaused: false,
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
            config,
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
          config?: Record<string, unknown> | null;
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
          ...(config && typeof config === "object" ? { config } : {}),
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

    setTimeRange: (range: "1d" | "7d" | "30d" | "90d" | "1y") => {
      set({
        timeRange: range,
        chartData: buildZeroChartPoints(range),
      });
      void get().fetchOverviewData(range, true);
    },

    setStatsMode: (mode: "post" | "share" | "boost") => {
      set({ statsMode: mode });
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

    updateAppConfig: async (patch) => {
      const { keyCode } = get();
      if (!keyCode) return "ยังไม่ได้เชื่อมต่อด้วย key";
      set({ isSavingConfig: true });
      try {
        await axios.post("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "UPDATE_CONFIG",
          payload: { config: patch },
        });
        // อัปเดต optimistic — ค่าจริงจะยืนยันกลับมาทาง snapshot หลังแอปนำไปใช้
        set({
          config: { ...(get().config || {}), ...patch },
          isSavingConfig: false,
        });
        return null;
      } catch (err) {
        set({ isSavingConfig: false });
        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "ส่งคำสั่งไม่สำเร็จ";
        return message;
      }
    },

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
      const { keyCode, accounts, isAllActionLoading } = get();
      if (!keyCode || accounts.length === 0 || isAllActionLoading) return;

      pendingStopAllUntil = 0;
      pendingStopAccountIds.clear();

      set({ isAllActionLoading: true });

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
      } finally {
        set({ isAllActionLoading: false });
      }
    },

    stopAllAccounts: async () => {
      const { keyCode, accounts, isAllActionLoading } = get();
      if (!keyCode || accounts.length === 0 || isAllActionLoading) return;

      pendingStopAllUntil = Date.now() + 5000;
      for (const acc of accounts) {
        pendingStopAccountIds.set(acc.id, Date.now() + 5000);
      }

      set({ isAllActionLoading: true });

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
          taskTimer: null,
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
      } finally {
        set({ isAllActionLoading: false });
      }
    },

    startAccount: async (id: string) => {
      const { keyCode, accounts, actionLoading } = get();
      if (!keyCode || actionLoading[id]) return;

      pendingStopAccountIds.delete(id);
      pendingStopAllUntil = 0;

      const target = accounts.find((acc) => acc.id === id);
      if (!target) return;

      set((state) => {
        const newLog: ControllerLogItem = {
          id: `log-${Date.now()}`,
          timestamp: formatCurrentTime(),
          accountId: target.id,
          accountName: target.name,
          groupName: target.groupName,
          action: "SYSTEM",
          status: "INFO",
          message: "เริ่มเดินงานอัตโนมัติของบัญชี",
        };
        return {
          actionLoading: { ...state.actionLoading, [id]: true },
          accounts: state.accounts.map((acc) =>
            acc.id === id
              ? {
                  ...acc,
                  isRunning: true,
                  currentTask: "กำลังเริ่มรันงาน...",
                }
              : acc
          ),
          logs: [...state.logs, newLog],
        };
      });

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "TOGGLE_ACCOUNT",
          accountId: id,
          isRunning: true,
        });
      } catch {
        // State will resync from SSE
      } finally {
        set((state) => ({
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    },

    stopAccount: async (id: string) => {
      const { keyCode, accounts, actionLoading } = get();
      if (!keyCode || actionLoading[id]) return;

      pendingStopAccountIds.set(id, Date.now() + 5000);

      const target = accounts.find((acc) => acc.id === id);
      if (!target) return;

      set((state) => {
        const newLog: ControllerLogItem = {
          id: `log-${Date.now()}`,
          timestamp: formatCurrentTime(),
          accountId: target.id,
          accountName: target.name,
          groupName: target.groupName,
          action: "SYSTEM",
          status: "INFO",
          message: "หยุดการทำงานของบัญชีชั่วคราว",
        };
        return {
          actionLoading: { ...state.actionLoading, [id]: true },
          accounts: state.accounts.map((acc) =>
            acc.id === id
              ? {
                  ...acc,
                  isRunning: false,
                  currentTask: "หยุดการทำงานแล้ว",
                  taskTimer: null,
                }
              : acc
          ),
          logs: [...state.logs, newLog],
        };
      });

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "TOGGLE_ACCOUNT",
          accountId: id,
          isRunning: false,
        });
      } catch {
        // State will resync from SSE
      } finally {
        set((state) => ({
          actionLoading: { ...state.actionLoading, [id]: false },
        }));
      }
    },

    toggleAccountRunning: async (id: string) => {
      const { accounts, actionLoading } = get();
      if (actionLoading[id]) return;

      const target = accounts.find((acc) => acc.id === id);
      if (!target) return;

      if (target.isRunning) {
        await get().stopAccount(id);
      } else {
        await get().startAccount(id);
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

    resetAllStats: async () => {
      const { keyCode } = get();
      if (!keyCode) return false;

      set((state) => ({
        accounts: state.accounts.map((acc) => ({
          ...acc,
          stats: {
            total: 0,
            success: 0,
            failed: 0,
            post: 0,
            comment: 0,
            reaction: 0,
          },
        })),
        stats: { total: 0, success: 0, failed: 0, pending: 0 },
      }));

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "RESET_ALL_STATS",
        });
        return true;
      } catch {
        return false;
      }
    },

    resetCategoryStats: async (accountId, category) => {
      const { keyCode } = get();
      if (!keyCode) return false;

      set((state) => ({
        accounts: state.accounts.map((acc) => {
          if (acc.id !== accountId) return acc;
          const newStats = { ...acc.stats };
          if (category === "post") {
            newStats.total = Math.max(0, newStats.total - newStats.post);
            newStats.post = 0;
          } else if (category === "share") {
            // share
          } else if (category === "boost") {
            newStats.comment = 0;
            newStats.reaction = 0;
          }
          return {
            ...acc,
            stats: newStats,
          };
        }),
      }));

      try {
        await axios.patch("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "RESET_CATEGORY_STATS",
          accountId,
          category,
        });
        return true;
      } catch {
        return false;
      }
    },

    fetchKeyDetails: async () => {
      const { keyCode } = get();
      if (!keyCode) return;

      try {
        const { data } = await axios.get<{
          valid: boolean;
          status: string;
          key?: {
            code: string;
            hwid: string | null;
            isActive: boolean;
            isActivated: boolean;
            durationDays: number;
            remainingDays: number;
            remainingSeconds: number;
            activatedAt: string | null;
            expiresAt: string | null;
          };
        }>(`/api/v1/public/keys/status?code=${encodeURIComponent(keyCode)}`);

        if (data.valid && data.key) {
          set({
            keyDetails: {
              hwid: data.key.hwid || null,
              remainingDays: data.key.remainingDays,
              expiresAt: data.key.expiresAt || undefined,
              isActive: data.key.isActive,
              isActivated: data.key.isActivated,
            },
          });
        }
      } catch (err) {
        console.error("fetchKeyDetails error:", err);
      }
    },

    resetHwid: async () => {
      const { keyCode } = get();
      if (!keyCode) {
        return { success: false, error: "ไม่พบรหัส License Key สำหรับการรีเซ็ต HWID" };
      }

      try {
        const { data } = await axios.post<{
          success?: boolean;
          message?: string;
          error?: string;
        }>("/api/v1/public/keys/reset-hwid", { code: keyCode });

        if (data.success) {
          set((state) => ({
            keyDetails: state.keyDetails
              ? { ...state.keyDetails, hwid: null }
              : null,
          }));
          return {
            success: true,
            message: data.message || "รีเซ็ต HWID สำเร็จ สามารถนำคีย์ไปเปิดใช้งานบนเครื่องใหม่ได้ทันที",
          };
        }
        return { success: false, error: data.error || "ไม่สามารถรีเซ็ต HWID ได้" };
      } catch (err: any) {
        const errMsg =
          err?.response?.data?.error || err.message || "เกิดข้อผิดพลาดในการรีเซ็ต HWID";
        return { success: false, error: errMsg };
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
        createGroupInitialData: null,
        isGroupDialogOpen: true,
      }),

    openCreateGroupWithData: (data) =>
      set({
        editingGroup: null,
        createGroupInitialData: data,
        isGroupDialogOpen: true,
      }),

    openEditGroupDialog: (group) =>
      set({
        editingGroup: group,
        createGroupInitialData: null,
        isGroupDialogOpen: true,
      }),

    closeGroupDialog: () =>
      set({
        isGroupDialogOpen: false,
        editingGroup: null,
        createGroupInitialData: null,
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
                      shareMode: payload.shareMode,
                      share: payload.share,
                      shareContent: payload.shareContent,
                      boostMode: payload.boostMode,
                      boostLinks: payload.boostLinks,
                      boostComments: payload.boostComments,
                      boostRandomComment: payload.boostRandomComment,
                      boostCommentCount: payload.boostCommentCount,
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

    batchCopyGroups: async (sourceAccountId, targetAccountId, groupNames) => {
      const { keyCode } = get();
      if (!keyCode) return { success: false, message: "กรุณาเชื่อมต่อคีย์ก่อนดำเนินการ" };

      try {
        const { data } = await axios.post<{
          success?: boolean;
          copiedCount?: number;
          groupsByAccount?: Record<string, ControllerGroupItem[]>;
          message?: string;
        }>("/api/v1/public/controller/to-program", {
          code: keyCode,
          action: "BATCH_COPY_GROUPS",
          payload: {
            sourceAccountId,
            targetAccountId,
            groupNames,
          },
        });

        if (data?.groupsByAccount) {
          set({ groupsByAccount: data.groupsByAccount });
        }

        return {
          success: true,
          count: data?.copiedCount || groupNames.length,
          message: `คัดลอกสำเร็จ ${data?.copiedCount || groupNames.length} กลุ่ม`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการคัดลอกกลุ่ม";
        return { success: false, message: msg };
      }
    },

    updateAccountProfile: async (accountId, data) => {
      const { keyCode, accounts } = get();
      if (!keyCode) return { success: false, message: "กรุณาเชื่อมต่อคีย์ก่อนดำเนินการ" };

      set({
        accounts: accounts.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                name: data.name?.trim() || acc.name,
                avatar: data.avatar !== undefined ? data.avatar : acc.avatar,
                proxy: data.proxy !== undefined ? data.proxy : acc.proxy,
                isActive: data.isActive !== undefined ? data.isActive : acc.isActive,
              }
            : acc
        ),
      });

      try {
        const res = await axios.post<{ success?: boolean; message?: string }>(
          "/api/v1/public/controller/to-program",
          {
            code: keyCode,
            action: "UPDATE_ACCOUNT_PROFILE",
            payload: {
              accountId,
              ...data,
            },
          }
        );
        return { success: true, message: res.data?.message || "บันทึกโปรไฟล์สำเร็จ" };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
        return { success: false, message: msg };
      }
    },

    sendToolCommand: async (action, accountId, payload) => {
      const { keyCode } = get();
      if (!keyCode) return { success: false, message: "กรุณาเชื่อมต่อคีย์ก่อนดำเนินการ" };

      try {
        const { data } = await axios.post<{ success?: boolean; message?: string; command?: unknown }>(
          "/api/v1/public/controller/to-program",
          {
            code: keyCode,
            action: "TOOL_COMMAND",
            payload: {
              toolId: action,
              accountId,
              toolPayload: payload,
            },
          }
        );
        return { success: true, data };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งคำสั่ง";
        return { success: false, message: msg };
      }
    },

    updateLogFilter: (patch) =>
      set((state) => ({
        logFilter: { ...(state.logFilter || INITIAL_LOG_FILTER), ...patch },
      })),

    toggleLogAutoScroll: () =>
      set((state) => ({
        logFilter: {
          ...(state.logFilter || INITIAL_LOG_FILTER),
          autoScroll: !(state.logFilter?.autoScroll ?? true),
        },
      })),

    setLogLevelFilter: (level) =>
      set((state) => ({
        logFilter: {
          ...(state.logFilter || INITIAL_LOG_FILTER),
          level,
        },
      })),

    setLogSearchQuery: (query) =>
      set((state) => ({
        logFilter: {
          ...(state.logFilter || INITIAL_LOG_FILTER),
          search: query,
        },
      })),

    copyLogs: async () => {
      const { logs, logFilter } = get();
      const currentLevelFilter = logFilter?.level || "all";
      const searchQuery = (logFilter?.search || "").toLowerCase().trim();

      const filtered = logs.filter((item) => {
        const itemLevel = (
          item.level ||
          (item.status === "SUCCESS"
            ? "success"
            : item.status === "FAILED"
            ? "error"
            : "info")
        ).toLowerCase();

        const matchLevel =
          currentLevelFilter === "all" || itemLevel === currentLevelFilter;
        const matchSearch =
          !searchQuery ||
          item.message.toLowerCase().includes(searchQuery) ||
          (item.source && item.source.toLowerCase().includes(searchQuery)) ||
          (item.accountName &&
            item.accountName.toLowerCase().includes(searchQuery)) ||
          itemLevel.includes(searchQuery);

        return matchLevel && matchSearch;
      });

      if (filtered.length === 0) return false;

      const text = filtered
        .map((l) => {
          const lv = (
            l.level ||
            (l.status === "SUCCESS"
              ? "SUCCESS"
              : l.status === "FAILED"
              ? "ERROR"
              : "INFO")
          ).toUpperCase();
          return `[${l.timestamp}] [${lv}] ${l.message}`;
        })
        .join("\n");

      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

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
