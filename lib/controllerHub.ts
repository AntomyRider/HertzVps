import { prisma } from "@/lib/prisma";
import type {
  ControllerStats,
  ControllerChartPoint,
  ControllerAccountItem,
  ControllerGroupItem,
  ControllerLogItem,
  ControllerReactionType,
  ControllerLogActionType,
  ControllerLogStatusType,
} from "@/store/controllerStore";

export type ControllerTimeRange = "7d" | "30d" | "1y";
export type ControllerMonitorPreset = "smooth" | "balanced" | "hd";

export interface ControllerMonitorConfig {
  paused: boolean;
  preset: ControllerMonitorPreset;
}

export type ControllerCommandType =
  | "START_ALL_ACCOUNTS"
  | "STOP_ALL_ACCOUNTS"
  | "TOGGLE_ACCOUNT"
  | "RESET_ACCOUNT_STATS"
  | "DELETE_ACCOUNT"
  | "CREATE_GROUP"
  | "UPDATE_GROUP"
  | "TOGGLE_GROUP"
  | "DELETE_GROUP"
  | "DELETE_ALL_GROUPS"
  | "CLEAR_LOGS"
  | "MONITOR_CONFIG"
  | "RTC_SIGNAL"
  // Legacy / Desktop alias actions in Hertz Auto Post
  | "START_ALL"
  | "STOP_ALL"
  | "START_USER"
  | "STOP_USER"
  | "RESET_USER_STATS";

export interface ControllerProgramCommand {
  id: string;
  type: ControllerCommandType;
  action: string;
  accountId?: string;
  groupId?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface ControllerSnapshot {
  keyCode: string;
  isConnected: boolean;
  isProgramOnline: boolean;
  isReconnecting: boolean;
  stats: ControllerStats;
  chartData: ControllerChartPoint[];
  timeRange: ControllerTimeRange;
  accounts: ControllerAccountItem[];
  groupsByAccount: Record<string, ControllerGroupItem[]>;
  logs: ControllerLogItem[];
  screenFrame: string | null;
  screenResolution: string | null;
  screenUpdatedAt: string | null;
  monitorConfig: ControllerMonitorConfig;
}

export interface ControllerWebSSEEvent {
  type:
    | "SNAPSHOT"
    | "STATE_UPDATED"
    | "ACCOUNT_UPDATED"
    | "GROUPS_UPDATED"
    | "OVERVIEW_UPDATED"
    | "LOG_PUSHED"
    | "SCREEN_FRAME"
    | "RTC_SIGNAL"
    | "PROGRAM_STATUS"
    | "PROGRAM_OFFLINE";
  data: Partial<ControllerSnapshot> & {
    log?: ControllerLogItem;
    logs?: ControllerLogItem[];
    account?: ControllerAccountItem;
    accountId?: string;
    rtcSignal?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface ControllerProgramSSEEvent {
  type: "CONNECTED" | "COMMAND" | "COMMAND_BATCH" | "PING";
  command?: ControllerProgramCommand;
  commands?: ControllerProgramCommand[];
  timestamp: string;
}

interface ControllerKeySession {
  keyCode: string;
  isProgramOnline: boolean;
  isReconnecting: boolean;
  lastHeartbeatAt: number;
  offlineTimer: ReturnType<typeof setTimeout> | null;
  stats: ControllerStats;
  chartDataByRange: Record<ControllerTimeRange, ControllerChartPoint[]>;
  accounts: ControllerAccountItem[];
  groupsByAccount: Record<string, ControllerGroupItem[]>;
  logs: ControllerLogItem[];
  screenFrame: string | null;
  screenResolution: string | null;
  screenUpdatedAt: string | null;
  monitorConfig: ControllerMonitorConfig;
  pendingCommands: ControllerProgramCommand[];
  webSubscribers: Set<(event: ControllerWebSSEEvent) => void>;
  programSubscribers: Set<(event: ControllerProgramSSEEvent) => void>;
}

const GRACE_PERIOD_MS = 15_000;
const MAX_LOGS_IN_MEMORY = 500;
const MAX_PENDING_COMMANDS = 200;
const DEFAULT_DEV_KEY = "HERTZ-1CA1-FF66-C7B9";

export const buildZeroChartPoints = (
  range: ControllerTimeRange
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

export const buildChartFromDailyStats = (
  dailyStats: Array<{
    date?: string;
    success?: number;
    failed?: number;
    pending?: number;
  }>
): Record<ControllerTimeRange, ControllerChartPoint[]> => {
  const mapByDate = new Map<
    string,
    { success: number; failed: number; pending: number }
  >();
  const mapByMonth = new Map<
    string,
    { success: number; failed: number; pending: number }
  >();

  for (const item of dailyStats) {
    if (!item?.date) continue;
    const dateKey = String(item.date).slice(0, 10);
    const monthKey = dateKey.slice(0, 7);
    const s = Number(item.success) || 0;
    const f = Number(item.failed) || 0;
    const p = Number(item.pending) || 0;

    mapByDate.set(dateKey, { success: s, failed: f, pending: p });

    const prevMonth = mapByMonth.get(monthKey) || {
      success: 0,
      failed: 0,
      pending: 0,
    };
    mapByMonth.set(monthKey, {
      success: prevMonth.success + s,
      failed: prevMonth.failed + f,
      pending: prevMonth.pending + p,
    });
  }

  const buildDays = (days: number): ControllerChartPoint[] => {
    const now = new Date();
    const list: ControllerChartPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      const found = mapByDate.get(key) || { success: 0, failed: 0, pending: 0 };

      list.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        success: found.success,
        failed: found.failed,
        pending: found.pending,
      });
    }
    return list;
  };

  const buildMonths = (): ControllerChartPoint[] => {
    const now = new Date();
    const list: ControllerChartPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      const found = mapByMonth.get(key) || {
        success: 0,
        failed: 0,
        pending: 0,
      };

      list.push({
        date: d.toISOString(),
        label: d.toLocaleDateString("th-TH", { month: "short" }),
        success: found.success,
        failed: found.failed,
        pending: found.pending,
      });
    }
    return list;
  };

  return {
    "7d": buildDays(7),
    "30d": buildDays(30),
    "1y": buildMonths(),
  };
};

export const formatCurrentThaiTime = () =>
  new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const createEmptyChartMap = (): Record<
  ControllerTimeRange,
  ControllerChartPoint[]
> => ({
  "7d": buildZeroChartPoints("7d"),
  "30d": buildZeroChartPoints("30d"),
  "1y": buildZeroChartPoints("1y"),
});

const globalForController = globalThis as unknown as {
  __hertzControllerSessions?: Map<string, ControllerKeySession>;
};

const sessions =
  globalForController.__hertzControllerSessions ??
  new Map<string, ControllerKeySession>();

if (!globalForController.__hertzControllerSessions) {
  globalForController.__hertzControllerSessions = sessions;
}

export const getOrCreateSession = (rawCode: string): ControllerKeySession => {
  const keyCode = rawCode.trim();
  const existing = sessions.get(keyCode);
  if (existing) {
    return existing;
  }

  const created: ControllerKeySession = {
    keyCode,
    isProgramOnline: false,
    isReconnecting: false,
    lastHeartbeatAt: 0,
    offlineTimer: null,
    stats: {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
    },
    chartDataByRange: createEmptyChartMap(),
    accounts: [],
    groupsByAccount: {},
    logs: [],
    screenFrame: null,
    screenResolution: null,
    screenUpdatedAt: null,
    monitorConfig: {
      paused: false,
      preset: "balanced",
    },
    pendingCommands: [],
    webSubscribers: new Set(),
    programSubscribers: new Set(),
  };

  sessions.set(keyCode, created);
  return created;
};

export async function validateControllerKey(
  rawCode: string,
  rawHwid?: string
): Promise<{
  valid: boolean;
  error?: string;
  status?: number;
  keyCode?: string;
}> {
  const cleanCode = typeof rawCode === "string" ? rawCode.trim() : "";
  const cleanHwid = typeof rawHwid === "string" ? rawHwid.trim() : "";

  if (!cleanCode) {
    return {
      valid: false,
      error: "กรุณาระบุรหัสคีย์ (code)",
      status: 400,
    };
  }

  let keyRecord = await prisma.key.findUnique({
    where: { code: cleanCode },
  });

  // หากเป็นคีย์มาตรฐานของตัวโปรแกรม (HERTZ-1CA1-FF66-C7B9) และยังไม่มีใน DB ให้สร้างให้อัตโนมัติ
  if (!keyRecord && cleanCode === DEFAULT_DEV_KEY) {
    try {
      keyRecord = await prisma.key.create({
        data: {
          code: DEFAULT_DEV_KEY,
          isActive: true,
          durationDays: 365,
        },
      });
    } catch {
      keyRecord = await prisma.key.findUnique({
        where: { code: cleanCode },
      });
    }
  }

  if (!keyRecord) {
    return {
      valid: false,
      error: "ไม่พบรหัสคีย์นี้ในระบบ กรุณาตรวจสอบความถูกต้อง",
      status: 404,
    };
  }

  const { code: dbCode, isActive, expiresAt, hwid: dbHwid } = keyRecord;

  if (!isActive) {
    return {
      valid: false,
      error: "คีย์นี้ถูกระงับหรือปิดการใช้งานโดยผู้ดูแลระบบ",
      status: 403,
    };
  }

  if (expiresAt && expiresAt < new Date()) {
    return {
      valid: false,
      error: "คีย์นี้หมดอายุการใช้งานแล้ว กรุณาต่ออายุคีย์",
      status: 403,
    };
  }

  if (cleanHwid && dbHwid && dbHwid !== cleanHwid) {
    return {
      valid: false,
      error: "Hardware ID (HWID) ไม่ตรงกับเครื่องที่ผูกไว้กับคีย์นี้",
      status: 403,
    };
  }

  return {
    valid: true,
    keyCode: dbCode,
  };
}

export const broadcastToWeb = (
  keyCode: string,
  event: Omit<ControllerWebSSEEvent, "timestamp">
) => {
  const session = sessions.get(keyCode.trim());
  if (!session || session.webSubscribers.size === 0) return;

  const fullEvent: ControllerWebSSEEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  for (const send of session.webSubscribers) {
    try {
      send(fullEvent);
    } catch {
      session.webSubscribers.delete(send);
    }
  }
};

export const broadcastToProgram = (
  keyCode: string,
  event: Omit<ControllerProgramSSEEvent, "timestamp">
): boolean => {
  const session = sessions.get(keyCode.trim());
  if (!session || session.programSubscribers.size === 0) return false;

  const fullEvent: ControllerProgramSSEEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  let delivered = false;
  for (const send of session.programSubscribers) {
    try {
      send(fullEvent);
      delivered = true;
    } catch {
      session.programSubscribers.delete(send);
    }
  }

  return delivered;
};

export const getSessionSnapshot = (
  keyCode: string,
  timeRange: ControllerTimeRange = "7d"
): ControllerSnapshot => {
  const session = getOrCreateSession(keyCode);
  const validRange: ControllerTimeRange =
    timeRange === "30d" || timeRange === "1y" ? timeRange : "7d";

  if (!session.isProgramOnline && !session.isReconnecting) {
    return {
      keyCode: session.keyCode,
      isConnected: true,
      isProgramOnline: false,
      isReconnecting: false,
      stats: { total: 0, success: 0, failed: 0, pending: 0 },
      chartData: buildZeroChartPoints(validRange),
      timeRange: validRange,
      accounts: [],
      groupsByAccount: {},
      logs: [],
      screenFrame: null,
      screenResolution: null,
      screenUpdatedAt: null,
      monitorConfig: { ...session.monitorConfig },
    };
  }

  return {
    keyCode: session.keyCode,
    isConnected: true,
    isProgramOnline: session.isProgramOnline,
    isReconnecting: session.isReconnecting,
    stats: { ...session.stats },
    chartData:
      session.chartDataByRange[validRange] || buildZeroChartPoints(validRange),
    timeRange: validRange,
    accounts: [...session.accounts],
    groupsByAccount: { ...session.groupsByAccount },
    logs: [...session.logs],
    screenFrame: session.screenFrame,
    screenResolution: session.screenResolution,
    screenUpdatedAt: session.screenUpdatedAt,
    monitorConfig: { ...session.monitorConfig },
  };
};

export const markProgramOnline = (keyCode: string): ControllerKeySession => {
  const session = getOrCreateSession(keyCode);

  if (session.offlineTimer) {
    clearTimeout(session.offlineTimer);
    session.offlineTimer = null;
  }

  const wasOfflineOrReconnecting =
    !session.isProgramOnline || session.isReconnecting;

  session.isProgramOnline = true;
  session.isReconnecting = false;
  session.lastHeartbeatAt = Date.now();

  if (wasOfflineOrReconnecting) {
    broadcastToWeb(session.keyCode, {
      type: "PROGRAM_STATUS",
      data: {
        isProgramOnline: true,
        isReconnecting: false,
      },
    });
  }

  return session;
};

export const wipeSessionData = (keyCode: string) => {
  const session = sessions.get(keyCode.trim());
  if (!session) return;

  if (session.offlineTimer) {
    clearTimeout(session.offlineTimer);
    session.offlineTimer = null;
  }

  session.isProgramOnline = false;
  session.isReconnecting = false;
  session.lastHeartbeatAt = 0;
  session.stats = { total: 0, success: 0, failed: 0, pending: 0 };
  session.chartDataByRange = createEmptyChartMap();
  session.accounts = [];
  session.groupsByAccount = {};
  session.logs = [];
  session.screenFrame = null;
  session.screenResolution = null;
  session.screenUpdatedAt = null;
  session.pendingCommands = [];

  broadcastToWeb(session.keyCode, {
    type: "PROGRAM_OFFLINE",
    data: {
      isProgramOnline: false,
      isReconnecting: false,
      stats: { total: 0, success: 0, failed: 0, pending: 0 },
      chartData: buildZeroChartPoints("7d"),
      accounts: [],
      groupsByAccount: {},
      logs: [],
      screenFrame: null,
      screenResolution: null,
      screenUpdatedAt: null,
    },
  });
};

export const handleProgramDisconnect = (
  keyCode: string,
  immediate = false
) => {
  const session = sessions.get(keyCode.trim());
  if (!session) return;

  if (immediate) {
    wipeSessionData(keyCode);
    return;
  }

  if (session.programSubscribers.size > 0) {
    return;
  }

  session.isReconnecting = true;
  broadcastToWeb(session.keyCode, {
    type: "PROGRAM_STATUS",
    data: {
      isProgramOnline: session.isProgramOnline,
      isReconnecting: true,
    },
  });

  if (session.offlineTimer) {
    clearTimeout(session.offlineTimer);
  }

  session.offlineTimer = setTimeout(() => {
    const current = sessions.get(keyCode.trim());
    if (!current) return;

    const elapsedSinceLastBeat = Date.now() - current.lastHeartbeatAt;
    if (
      current.programSubscribers.size === 0 &&
      elapsedSinceLastBeat >= GRACE_PERIOD_MS - 500
    ) {
      wipeSessionData(keyCode);
    }
  }, GRACE_PERIOD_MS);
};

export const enqueueCommandForProgram = (
  keyCode: string,
  type: ControllerCommandType,
  options?: {
    action?: string;
    accountId?: string;
    groupId?: string;
    payload?: Record<string, unknown>;
  }
): ControllerProgramCommand => {
  const session = getOrCreateSession(keyCode);
  const command: ControllerProgramCommand = {
    id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    action: options?.action || type,
    accountId: options?.accountId,
    groupId: options?.groupId,
    payload: options?.payload || {},
    timestamp: new Date().toISOString(),
  };

  const deliveredImmediately = broadcastToProgram(session.keyCode, {
    type: "COMMAND",
    command,
  });

  if (!deliveredImmediately) {
    session.pendingCommands = [
      ...session.pendingCommands.slice(-(MAX_PENDING_COMMANDS - 1)),
      command,
    ];
  }

  return command;
};

export const consumePendingCommands = (
  keyCode: string,
  ackCommandIds?: string[]
): ControllerProgramCommand[] => {
  const session = markProgramOnline(keyCode);

  if (Array.isArray(ackCommandIds) && ackCommandIds.length > 0) {
    const ackSet = new Set(ackCommandIds);
    session.pendingCommands = session.pendingCommands.filter(
      (cmd) => !ackSet.has(cmd.id)
    );
  }

  const commands = [...session.pendingCommands];
  session.pendingCommands = [];
  return commands;
};

export const incrementTodayChartPoint = (
  session: ControllerKeySession,
  delta: { success?: number; failed?: number; pending?: number }
) => {
  const sDelta = delta.success || 0;
  const fDelta = delta.failed || 0;
  const pDelta = delta.pending || 0;

  (["7d", "30d", "1y"] as ControllerTimeRange[]).forEach((range) => {
    const list = session.chartDataByRange[range];
    if (!list || list.length === 0) return;
    const lastIdx = list.length - 1;
    const lastPoint = list[lastIdx];
    list[lastIdx] = {
      ...lastPoint,
      success: Math.max(0, lastPoint.success + sDelta),
      failed: Math.max(0, lastPoint.failed + fDelta),
      pending: Math.max(0, lastPoint.pending + pDelta),
    };
  });
};

export const appendLogToSession = (
  session: ControllerKeySession,
  rawLog: {
    id?: string;
    timestamp?: string;
    accountId: string;
    accountName: string;
    groupName?: string;
    action: ControllerLogActionType;
    status: ControllerLogStatusType;
    message: string;
  },
  updateStatsAutomatically = false
): ControllerLogItem => {
  const newLog: ControllerLogItem = {
    id:
      rawLog.id ||
      `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: rawLog.timestamp || formatCurrentThaiTime(),
    accountId: rawLog.accountId,
    accountName: rawLog.accountName,
    groupName: rawLog.groupName,
    action: rawLog.action,
    status: rawLog.status,
    message: rawLog.message,
  };

  session.logs = [...session.logs.slice(-(MAX_LOGS_IN_MEMORY - 1)), newLog];

  if (updateStatsAutomatically && rawLog.action !== "SYSTEM") {
    const isSuccess = rawLog.status === "SUCCESS";
    const isFailed = rawLog.status === "FAILED";

    session.stats = {
      ...session.stats,
      total: session.stats.total + 1,
      success: session.stats.success + (isSuccess ? 1 : 0),
      failed: session.stats.failed + (isFailed ? 1 : 0),
    };

    incrementTodayChartPoint(session, {
      success: isSuccess ? 1 : 0,
      failed: isFailed ? 1 : 0,
    });

    session.accounts = session.accounts.map((acc) => {
      if (acc.id !== rawLog.accountId) return acc;
      return {
        ...acc,
        stats: {
          total: acc.stats.total + 1,
          success: acc.stats.success + (isSuccess ? 1 : 0),
          failed: acc.stats.failed + (isFailed ? 1 : 0),
          post: acc.stats.post + (rawLog.action === "POST" ? 1 : 0),
          comment: acc.stats.comment + (rawLog.action === "COMMENT" ? 1 : 0),
          reaction:
            acc.stats.reaction + (rawLog.action === "REACTION" ? 1 : 0),
        },
      };
    });
  }

  return newLog;
};

export const buildGroupItem = (
  accountId: string,
  rawGroup: Partial<ControllerGroupItem> & {
    name?: string;
    images?: string[];
    imagePreviews?: Record<string, string>;
    links?: string | string[];
    content?: string;
    comment?: string;
    comments?: string;
    reaction?: ControllerReactionType;
    randomContent?: boolean;
    randomImage?: boolean;
    randomReaction?: boolean;
    isActive?: boolean;
  },
  fallbackIndex = 1
): ControllerGroupItem => {
  let resolvedImages: string[] = [];

  if (
    rawGroup.imagePreviews &&
    typeof rawGroup.imagePreviews === "object" &&
    Object.keys(rawGroup.imagePreviews).length > 0
  ) {
    resolvedImages = Object.values(rawGroup.imagePreviews).filter(Boolean);
  } else if (Array.isArray(rawGroup.images)) {
    resolvedImages = rawGroup.images.filter(
      (img) =>
        typeof img === "string" &&
        (img.startsWith("data:") || img.startsWith("/") || img.startsWith("http"))
    );
  } else if (rawGroup.image) {
    resolvedImages = [rawGroup.image];
  }

  const resolvedLinks = Array.isArray(rawGroup.links)
    ? rawGroup.links.join("\n")
    : typeof rawGroup.links === "string"
      ? rawGroup.links
      : "";

  const resolvedComment =
    typeof rawGroup.comment === "string"
      ? rawGroup.comment
      : typeof rawGroup.comments === "string"
        ? rawGroup.comments
        : "";

  const resolvedEnabled =
    typeof rawGroup.enabled === "boolean"
      ? rawGroup.enabled
      : typeof rawGroup.isActive === "boolean"
        ? rawGroup.isActive
        : true;

  return {
    id:
      String(rawGroup.id || "") ||
      `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    accountId,
    name: (rawGroup.name || "").trim() || `หมวดหมู่กลุ่ม #${fallbackIndex}`,
    enabled: resolvedEnabled,
    image: resolvedImages.length > 0 ? resolvedImages[0] : null,
    images: resolvedImages,
    links: resolvedLinks,
    content: rawGroup.content || "",
    comment: resolvedComment,
    reaction: (rawGroup.reaction || "") as ControllerReactionType,
    randomContent: Boolean(rawGroup.randomContent),
    randomImage: Boolean(rawGroup.randomImage),
    randomReaction: Boolean(rawGroup.randomReaction),
  };
};

export const normalizeGroupsByAccount = (
  rawGroupsByAccount: Record<string, unknown[]>
): Record<string, ControllerGroupItem[]> => {
  const result: Record<string, ControllerGroupItem[]> = {};
  for (const [accountId, list] of Object.entries(rawGroupsByAccount)) {
    if (!Array.isArray(list)) {
      result[accountId] = [];
      continue;
    }
    result[accountId] = list.map((item, idx) =>
      buildGroupItem(
        accountId,
        (item || {}) as Parameters<typeof buildGroupItem>[1],
        idx + 1
      )
    );
  }
  return result;
};

export const normalizeAccounts = (
  rawAccounts: Array<
    Partial<ControllerAccountItem> & {
      groupInfo?: {
        groupName?: string;
        groupCurrent?: number;
        groupTotal?: number;
      } | null;
    }
  >,
  normalizedGroupsByAccount: Record<string, ControllerGroupItem[]>
): ControllerAccountItem[] => {
  return rawAccounts.map((acc, idx) => {
    const uid = String(acc.id || `acc-${idx + 1}`);
    const userGroups = normalizedGroupsByAccount[uid] || [];
    const activeGroups = userGroups.filter((g) => g.enabled);
    const firstGroupName =
      activeGroups[0]?.name || userGroups[0]?.name || "ยังไม่มีกลุ่มเป้าหมาย";

    const totalLinksCount = activeGroups.reduce((sum, g) => {
      const linkLines = (g.links || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean).length;
      return sum + linkLines;
    }, 0);

    const groupName =
      acc.groupInfo?.groupName || acc.groupName || firstGroupName;
    const groupCurrent = Number(
      acc.groupInfo?.groupCurrent ?? acc.groupCurrent ?? 0
    );
    const groupTotal = Number(
      acc.groupInfo?.groupTotal ?? acc.groupTotal ?? totalLinksCount
    );

    return {
      id: uid,
      fbId: String(acc.fbId || uid),
      name: String(acc.name || `Account ${uid}`),
      avatar: acc.avatar || null,
      isRunning: Boolean(acc.isRunning),
      currentTask:
        acc.currentTask || (acc.isRunning ? "กำลังรันงาน..." : "พร้อมทำงาน"),
      groupName,
      groupCurrent,
      groupTotal,
      stats: {
        total: Number(acc.stats?.total) || 0,
        success: Number(acc.stats?.success) || 0,
        failed: Number(acc.stats?.failed) || 0,
        post: Number(acc.stats?.post) || 0,
        comment: Number(acc.stats?.comment) || 0,
        reaction: Number(acc.stats?.reaction) || 0,
      },
    };
  });
};

export const normalizeIncomingLogs = (
  rawLogs: Array<{
    id?: string;
    timestamp?: string;
    accountId?: string;
    accountName?: string;
    groupName?: string;
    action?: ControllerLogActionType;
    status?: ControllerLogStatusType;
    level?: string;
    source?: string;
    message?: string;
  }>,
  accounts: ControllerAccountItem[]
): ControllerLogItem[] => {
  return rawLogs
    .filter((item) => item && item.message)
    .map((item, idx) => {
      const msg = String(item.message || "");
      let status: ControllerLogStatusType = item.status || "INFO";
      if (!item.status && item.level) {
        const lv = item.level.toLowerCase();
        if (lv === "success" || msg.includes("สำเร็จ")) status = "SUCCESS";
        else if (lv === "error" || lv === "warn" || msg.includes("ล้มเหลว"))
          status = "FAILED";
        else status = "INFO";
      }

      let action: ControllerLogActionType = item.action || "SYSTEM";
      if (!item.action) {
        if (msg.includes("คอมเมนต์") || msg.toLowerCase().includes("comment"))
          action = "COMMENT";
        else if (
          msg.includes("ความรู้สึก") ||
          msg.includes("ถูกใจ") ||
          msg.toLowerCase().includes("reaction")
        )
          action = "REACTION";
        else if (msg.includes("โพสต์") || msg.toLowerCase().includes("post"))
          action = "POST";
        else action = "SYSTEM";
      }

      const sourceStr = String(item.accountName || item.source || "System");
      const matchedAcc = accounts.find(
        (a) =>
          a.id === item.accountId ||
          a.name === sourceStr ||
          sourceStr === `USER-${a.id}`
      );

      return {
        id: String(item.id || `log_${Date.now()}_${idx}`),
        timestamp: item.timestamp || formatCurrentThaiTime(),
        accountId: item.accountId || matchedAcc?.id || "system",
        accountName:
          item.accountName ||
          matchedAcc?.name ||
          (sourceStr === "SYSTEM" || sourceStr === "REMOTE"
            ? "ระบบควบคุม"
            : sourceStr),
        groupName: item.groupName,
        action,
        status,
        message: msg,
      };
    });
};
