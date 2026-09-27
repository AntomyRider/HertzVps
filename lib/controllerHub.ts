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

export type ControllerTimeRange = "1d" | "7d" | "30d" | "1y";
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
  keyId?: string;
  isProgramOnline: boolean;
  isReconnecting: boolean;
  lastHeartbeatAt: number;
  lastSeenAt?: number;
  offlineTimer: ReturnType<typeof setTimeout> | null;
  stats: ControllerStats;
  lastKnownStats?: ControllerStats;
  chartDataByRange: Record<ControllerTimeRange, ControllerChartPoint[]>;
  accounts: ControllerAccountItem[];
  groupsByAccount: Record<string, ControllerGroupItem[]>;
  logs: ControllerLogItem[];
  recentErrorHistory?: ControllerLogItem[];
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
  if (range === "1d") {
    const points: ControllerChartPoint[] = [];
    const now = new Date();
    // 12 points, every 2 hours covering past 24 hours
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      const evenHour = Math.floor(d.getHours() / 2) * 2;
      points.push({
        date: d.toISOString(),
        label: `${String(evenHour).padStart(2, "0")}:00`,
        success: 0,
        failed: 0,
        pending: 0,
      });
    }
    return points;
  }

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
    "1d": buildZeroChartPoints("1d"),
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
  "1d": buildZeroChartPoints("1d"),
  "7d": buildZeroChartPoints("7d"),
  "30d": buildZeroChartPoints("30d"),
  "1y": buildZeroChartPoints("1y"),
});

const globalForController = globalThis as unknown as {
  __hertzControllerSessions?: Map<string, ControllerKeySession>;
  __hertzFleetSubscribers?: Set<() => void>;
};

const sessions =
  globalForController.__hertzControllerSessions ??
  new Map<string, ControllerKeySession>();

if (!globalForController.__hertzControllerSessions) {
  globalForController.__hertzControllerSessions = sessions;
}

const fleetSubscribers =
  globalForController.__hertzFleetSubscribers ?? new Set<() => void>();

if (!globalForController.__hertzFleetSubscribers) {
  globalForController.__hertzFleetSubscribers = fleetSubscribers;
}

export const subscribeToFleetUpdates = (subscriber: () => void) => {
  fleetSubscribers.add(subscriber);
  return () => {
    fleetSubscribers.delete(subscriber);
  };
};

let fleetNotifyTimeout: ReturnType<typeof setTimeout> | null = null;

export const notifyFleetUpdated = () => {
  if (fleetNotifyTimeout) return;
  fleetNotifyTimeout = setTimeout(() => {
    fleetNotifyTimeout = null;
    for (const sub of fleetSubscribers) {
      try {
        sub();
      } catch {
        fleetSubscribers.delete(sub);
      }
    }
  }, 600);
};

export const getBangkokDateString = (
  date: Date | string = new Date()
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

export async function flushFleetDailyStat() {
  try {
    const todayDateStr = getBangkokDateString();
    const todayDateObj = new Date(todayDateStr + "T00:00:00.000Z");

    let fleetTotal = 0;
    let fleetSuccess = 0;
    let fleetFailed = 0;
    let fleetPending = 0;
    let fleetPostCount = 0;
    let fleetCommentCount = 0;
    let fleetReactCount = 0;

    for (const session of sessions.values()) {
      const s = session.isProgramOnline
        ? session.stats
        : session.lastKnownStats || session.stats;
      fleetTotal += s.total || 0;
      fleetSuccess += s.success || 0;
      fleetFailed += s.failed || 0;
      fleetPending += s.pending || 0;

      let sessionPost = 0;
      let sessionComment = 0;
      let sessionReact = 0;

      if (session.accounts && session.accounts.length > 0) {
        for (const acc of session.accounts) {
          if (acc.stats) {
            sessionPost += acc.stats.post || 0;
            sessionComment += acc.stats.comment || 0;
            sessionReact += acc.stats.reaction || 0;
          }
        }
      }

      if (sessionPost === 0 && sessionComment === 0 && sessionReact === 0) {
        const allLogs = [
          ...(session.logs || []),
          ...(session.recentErrorHistory || []),
        ];
        for (const log of allLogs) {
          if (log.action === "POST") sessionPost++;
          else if (log.action === "COMMENT") sessionComment++;
          else if (log.action === "REACTION") sessionReact++;
        }
      }

      fleetPostCount += sessionPost;
      fleetCommentCount += sessionComment;
      fleetReactCount += sessionReact;
    }

    if (
      fleetTotal === 0 &&
      fleetSuccess === 0 &&
      fleetFailed === 0 &&
      fleetPending === 0 &&
      fleetPostCount === 0 &&
      fleetCommentCount === 0 &&
      fleetReactCount === 0
    ) {
      return;
    }

    if (!prisma || !("programDailyStat" in prisma)) {
      return;
    }

    await prisma.programDailyStat.upsert({
      where: { date: todayDateObj },
      create: {
        date: todayDateObj,
        total: fleetTotal,
        success: fleetSuccess,
        failed: fleetFailed,
        pending: fleetPending,
        postCount: fleetPostCount,
        commentCount: fleetCommentCount,
        reactCount: fleetReactCount,
      },
      update: {
        total: fleetTotal,
        success: fleetSuccess,
        failed: fleetFailed,
        pending: fleetPending,
        postCount: fleetPostCount,
        commentCount: fleetCommentCount,
        reactCount: fleetReactCount,
      },
    });
  } catch (err) {
    console.error("flushFleetDailyStat error:", err);
  }
}

export const flushKeyDailyStat = async (_keyCode?: string) => {
  await flushFleetDailyStat();
};

let flushDailyStatsTimer: ReturnType<typeof setTimeout> | null = null;

export const scheduleKeyDailyStatFlush = (_keyCode?: string) => {
  if (flushDailyStatsTimer) return;
  flushDailyStatsTimer = setTimeout(async () => {
    flushDailyStatsTimer = null;
    await flushFleetDailyStat();
  }, 2000);
};

export async function syncHistoricalDailyStats(
  keyCodeOrStatsList: unknown,
  maybeStatsList?: Array<{
    date?: string;
    success?: number;
    failed?: number;
    pending?: number;
    total?: number;
  }>
) {
  const statsList = Array.isArray(maybeStatsList)
    ? maybeStatsList
    : Array.isArray(keyCodeOrStatsList)
      ? keyCodeOrStatsList
      : [];

  if (statsList.length === 0) return;
  if (!prisma || !("programDailyStat" in prisma)) return;

  for (const item of statsList) {
    if (!item?.date) continue;
    const dateStr = String(item.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
    const dateObj = new Date(dateStr + "T00:00:00.000Z");
    const s = Number(item.success) || 0;
    const f = Number(item.failed) || 0;
    const p = Number(item.pending) || 0;
    const t = Number(item.total) || s + f + p;

    await prisma.programDailyStat.upsert({
      where: { date: dateObj },
      create: {
        date: dateObj,
        total: t,
        success: s,
        failed: f,
        pending: p,
      },
      update: {
        total: { increment: t },
        success: { increment: s },
        failed: { increment: f },
        pending: { increment: p },
      },
    });
  }
}

export const getOrCreateSession = (
  rawCode: string,
  keyId?: string
): ControllerKeySession => {
  const keyCode = rawCode.trim();
  const existing = sessions.get(keyCode);
  if (existing) {
    if (keyId && !existing.keyId) {
      existing.keyId = keyId;
    }
    return existing;
  }

  const created: ControllerKeySession = {
    keyCode,
    keyId,
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
      paused: true,
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
  keyId?: string;
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

  const { id: keyId, code: dbCode, isActive, expiresAt, hwid: dbHwid } = keyRecord;

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
    keyId,
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

export const markProgramOnline = (
  keyCode: string,
  keyId?: string
): ControllerKeySession => {
  const session = getOrCreateSession(keyCode, keyId);
  if (keyId && !session.keyId) {
    session.keyId = keyId;
  }

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
    notifyFleetUpdated();
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

  // บันทึกสถิติลง DB ก่อนล้างข้อมูลชั่วคราวใน RAM
  flushKeyDailyStat(keyCode).catch(console.error);

  notifyFleetUpdated();

  if (session.offlineTimer) {
    clearTimeout(session.offlineTimer);
    session.offlineTimer = null;
  }

  session.isProgramOnline = false;
  session.isReconnecting = false;
  session.lastSeenAt = session.lastHeartbeatAt || Date.now();
  session.lastHeartbeatAt = 0;

  if (session.stats.total > 0 || session.stats.failed > 0) {
    session.lastKnownStats = { ...session.stats };
  }

  const failedLogs = session.logs.filter((l) => l.status === "FAILED");
  if (failedLogs.length > 0) {
    session.recentErrorHistory = [
      ...(session.recentErrorHistory || []),
      ...failedLogs,
    ].slice(-20);
  }

  session.stats = { total: 0, success: 0, failed: 0, pending: 0 };
  session.chartDataByRange = createEmptyChartMap();
  session.accounts = [];
  session.groupsByAccount = {};
  session.logs = [];
  session.screenFrame = null;
  session.screenResolution = null;
  session.screenUpdatedAt = null;
  session.monitorConfig = {
    paused: true,
    preset: session.monitorConfig.preset || "balanced",
  };
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
      monitorConfig: { ...session.monitorConfig },
    },
  });
};

export const handleProgramDisconnect = (
  keyCode: string,
  immediate = false
) => {
  const session = sessions.get(keyCode.trim());
  if (!session) return;

  flushKeyDailyStat(keyCode).catch(console.error);

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

  (["1d", "7d", "30d", "1y"] as ControllerTimeRange[]).forEach((range) => {
    const list = session.chartDataByRange[range];
    if (!list || list.length === 0) return;

    let targetIdx = list.length - 1;
    if (range === "1d") {
      const currentEvenHour = Math.floor(new Date().getHours() / 2) * 2;
      const targetLabel = `${String(currentEvenHour).padStart(2, "0")}:00`;
      const matchedIdx = list.findIndex((p) => p.label === targetLabel);
      if (matchedIdx !== -1) targetIdx = matchedIdx;
    }

    const lastPoint = list[targetIdx];
    list[targetIdx] = {
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

  if (newLog.status === "FAILED") {
    session.recentErrorHistory = [
      ...(session.recentErrorHistory || []),
      newLog,
    ].slice(-20);
  }

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

    scheduleKeyDailyStatFlush(session.keyCode);
  }

  notifyFleetUpdated();

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

export interface ActionHealthMetric {
  action: "POST" | "COMMENT" | "REACTION";
  label: string;
  total: number;
  success: number;
  failed: number;
  successRate: number; // 0 - 100%
}

export interface KeyProgramHealth {
  id: string;
  code: string;
  isActive: boolean;
  durationDays: number;
  hwid: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  isOnline: boolean;
  isReconnecting: boolean;
  lastHeartbeatAt: number;
  lastSeenAt: number;
  accountCount: number;
  stats: ControllerStats;
  successRate: number;
  actions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric>;
  weakestAction: ActionHealthMetric | null;
  recentErrors: ControllerLogItem[];
}

export interface FleetChartPoint {
  date: string;
  label: string;
  success: number;
  failed: number;
  pending: number;
  total: number;
}

export interface FleetProgramOverview {
  summary: {
    totalKeys: number;
    onlineCount: number;
    offlineCount: number;
    errorCount: number;
    fleetSuccess: number;
    fleetFailed: number;
    fleetPending: number;
    fleetTotal: number;
    fleetSuccessRate: number;
    weakestAction: ActionHealthMetric | null;
    fleetActions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric>;
  };
  chartDataByRange: Record<ControllerTimeRange, FleetChartPoint[]>;
  keys: KeyProgramHealth[];
  recentFleetErrors: Array<ControllerLogItem & { keyCode: string }>;
}

export const getProgramOverviewData = async (
  dbKeys: Array<{
    id: string;
    code: string;
    isActive: boolean;
    durationDays: number;
    hwid: string | null;
    activatedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }>
): Promise<FleetProgramOverview> => {
  const calcRate = (success: number, failed: number) => {
    const sum = success + failed;
    if (sum === 0) return 100;
    return Math.round((success / sum) * 1000) / 10;
  };

  const keyIds = dbKeys.map((k) => k.id);
  const todayStr = getBangkokDateString();
  const currentMonthStr = todayStr.slice(0, 7);
  const todayDateObj = new Date(todayStr + "T00:00:00.000Z");

  const oneYearAgo = new Date(todayDateObj);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // ดึงสถิติรายวันภาพรวมของระบบย้อนหลัง 1 ปี จาก DB
  let dbDailyStats: Array<{
    date: Date;
    total: number;
    success: number;
    failed: number;
    pending: number;
    postCount: number;
    commentCount: number;
    reactCount: number;
  }> = [];

  try {
    if (prisma && "programDailyStat" in prisma) {
      dbDailyStats = await prisma.programDailyStat.findMany({
        where: {
          date: { gte: oneYearAgo },
        },
        orderBy: { date: "asc" },
      });
    }
  } catch (dbErr) {
    console.warn("Could not query programDailyStat from DB, falling back to memory:", dbErr);
  }

  const dbPastDaysMap = new Map<
    string,
    {
      total: number;
      success: number;
      failed: number;
      pending: number;
      postCount: number;
      commentCount: number;
      reactCount: number;
    }
  >();
  const dbMonthsMap = new Map<
    string,
    { total: number; success: number; failed: number; pending: number }
  >();

  for (const stat of dbDailyStats) {
    const dateKey = getBangkokDateString(stat.date);
    const monthKey = dateKey.slice(0, 7);

    dbPastDaysMap.set(dateKey, {
      total: stat.total,
      success: stat.success,
      failed: stat.failed,
      pending: stat.pending,
      postCount: stat.postCount,
      commentCount: stat.commentCount,
      reactCount: stat.reactCount,
    });

    const prevMonth = dbMonthsMap.get(monthKey) || {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
    };
    dbMonthsMap.set(monthKey, {
      total: prevMonth.total + stat.total,
      success: prevMonth.success + stat.success,
      failed: prevMonth.failed + stat.failed,
      pending: prevMonth.pending + stat.pending,
    });
  }

  const keyHealthList: KeyProgramHealth[] = [];
  const allFleetErrors: Array<ControllerLogItem & { keyCode: string }> = [];

  const fleetActionCounts: Record<
    "POST" | "COMMENT" | "REACTION",
    { total: number; success: number; failed: number }
  > = {
    POST: { total: 0, success: 0, failed: 0 },
    COMMENT: { total: 0, success: 0, failed: 0 },
    REACTION: { total: 0, success: 0, failed: 0 },
  };

  let onlineCount = 0;
  let offlineCount = 0;
  let errorCount = 0;
  let fleetSuccess = 0;
  let fleetFailed = 0;
  let fleetPending = 0;
  let fleetTotal = 0;

  for (const k of dbKeys) {
    const session = sessions.get(k.code.trim());
    if (session && !session.keyId) {
      session.keyId = k.id;
    }
    const isOnline = Boolean(session && session.isProgramOnline);
    const isReconnecting = Boolean(session && session.isReconnecting);
    const lastHeartbeatAt = session ? session.lastHeartbeatAt : 0;
    const lastSeenAt = session
      ? session.lastSeenAt || session.lastHeartbeatAt || 0
      : 0;
    const accountCount = session ? session.accounts.length : 0;

    let currentStats: ControllerStats;
    if (isOnline) {
      currentStats = session?.stats || {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
      };
    } else if (
      session?.lastKnownStats &&
      (session.lastKnownStats.total > 0 || session.lastKnownStats.failed > 0)
    ) {
      currentStats = { ...session.lastKnownStats };
    } else if (
      session?.stats &&
      (session.stats.total > 0 || session.stats.failed > 0)
    ) {
      currentStats = { ...session.stats };
    } else {
      currentStats = { total: 0, success: 0, failed: 0, pending: 0 };
    }

    // รวม Logs และ Recent Error History
    const rawLogs = [
      ...(session?.logs || []),
      ...(session?.recentErrorHistory || []),
    ];
    const seenLogIds = new Set<string>();
    const uniqueLogs: ControllerLogItem[] = [];
    for (const l of rawLogs) {
      if (!seenLogIds.has(l.id)) {
        seenLogIds.add(l.id);
        uniqueLogs.push(l);
      }
    }

    const keyActionCounts: Record<
      "POST" | "COMMENT" | "REACTION",
      { total: number; success: number; failed: number }
    > = {
      POST: { total: 0, success: 0, failed: 0 },
      COMMENT: { total: 0, success: 0, failed: 0 },
      REACTION: { total: 0, success: 0, failed: 0 },
    };

    if (session?.accounts && session.accounts.length > 0) {
      for (const acc of session.accounts) {
        if (acc.stats) {
          keyActionCounts.POST.total += acc.stats.post || 0;
          keyActionCounts.COMMENT.total += acc.stats.comment || 0;
          keyActionCounts.REACTION.total += acc.stats.reaction || 0;
        }
      }
    }

    for (const log of uniqueLogs) {
      if (
        log.action === "POST" ||
        log.action === "COMMENT" ||
        log.action === "REACTION"
      ) {
        if (log.status === "SUCCESS") {
          keyActionCounts[log.action].success += 1;
        } else if (log.status === "FAILED") {
          keyActionCounts[log.action].failed += 1;
        }
      }
    }



    for (const act of ["POST", "COMMENT", "REACTION"] as const) {
      keyActionCounts[act].total = Math.max(
        keyActionCounts[act].total,
        keyActionCounts[act].success + keyActionCounts[act].failed
      );
    }

    const keyActions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric> = {
      POST: {
        action: "POST",
        label: "โพสต์กลุ่ม",
        total: keyActionCounts.POST.total,
        success: keyActionCounts.POST.success,
        failed: keyActionCounts.POST.failed,
        successRate: calcRate(
          keyActionCounts.POST.success,
          keyActionCounts.POST.failed
        ),
      },
      COMMENT: {
        action: "COMMENT",
        label: "คอมเมนต์",
        total: keyActionCounts.COMMENT.total,
        success: keyActionCounts.COMMENT.success,
        failed: keyActionCounts.COMMENT.failed,
        successRate: calcRate(
          keyActionCounts.COMMENT.success,
          keyActionCounts.COMMENT.failed
        ),
      },
      REACTION: {
        action: "REACTION",
        label: "กดความรู้สึก",
        total: keyActionCounts.REACTION.total,
        success: keyActionCounts.REACTION.success,
        failed: keyActionCounts.REACTION.failed,
        successRate: calcRate(
          keyActionCounts.REACTION.success,
          keyActionCounts.REACTION.failed
        ),
      },
    };

    const keyRate = calcRate(currentStats.success, currentStats.failed);

    // Identify weakest action
    let weakestAction: ActionHealthMetric | null = null;
    const actionsWithWork = Object.values(keyActions).filter(
      (a) => a.total > 0 || a.failed > 0
    );
    if (actionsWithWork.length > 0) {
      actionsWithWork.sort(
        (a, b) => a.successRate - b.successRate || b.failed - a.failed
      );
      if (actionsWithWork[0].failed > 0 || actionsWithWork[0].successRate < 100) {
        weakestAction = actionsWithWork[0];
      }
    }

    const recentErrors = uniqueLogs
      .filter((l) => l.status === "FAILED")
      .slice(-5)
      .reverse();

    if (isOnline) onlineCount += 1;
    else offlineCount += 1;

    if (
      currentStats.failed > 0 ||
      (currentStats.total > 0 && keyRate < 80) ||
      (weakestAction && weakestAction.failed > 0)
    ) {
      errorCount += 1;
    }

    fleetSuccess += currentStats.success;
    fleetFailed += currentStats.failed;
    fleetPending += currentStats.pending;
    fleetTotal += currentStats.total;

    for (const act of ["POST", "COMMENT", "REACTION"] as const) {
      fleetActionCounts[act].total += keyActionCounts[act].total;
      fleetActionCounts[act].success += keyActionCounts[act].success;
      fleetActionCounts[act].failed += keyActionCounts[act].failed;
    }

    for (const err of recentErrors) {
      allFleetErrors.push({ ...err, keyCode: k.code });
    }

    keyHealthList.push({
      id: k.id,
      code: k.code,
      isActive: k.isActive,
      durationDays: k.durationDays,
      hwid: k.hwid,
      activatedAt: k.activatedAt ? k.activatedAt.toISOString() : null,
      expiresAt: k.expiresAt ? k.expiresAt.toISOString() : null,
      createdAt: k.createdAt.toISOString(),
      isOnline,
      isReconnecting,
      lastHeartbeatAt,
      lastSeenAt,
      accountCount,
      stats: currentStats,
      successRate: keyRate,
      actions: keyActions,
      weakestAction,
      recentErrors,
    });
  }

  // หากรีสตาร์ตเซิร์ฟเวอร์ และ RAM ยังไม่มีสถิติวันนี้ แต่มีสถิติภาพรวมที่เคยบันทึกไว้ใน DB
  const todayDbStat = dbPastDaysMap.get(todayStr);
  if (fleetTotal === 0 && todayDbStat && todayDbStat.total > 0) {
    fleetTotal = todayDbStat.total;
    fleetSuccess = todayDbStat.success;
    fleetFailed = todayDbStat.failed;
    fleetPending = todayDbStat.pending;

    if (fleetActionCounts.POST.total === 0 && todayDbStat.postCount > 0) {
      fleetActionCounts.POST.total = todayDbStat.postCount;
      fleetActionCounts.POST.success = Math.min(
        todayDbStat.postCount,
        fleetSuccess
      );
      fleetActionCounts.POST.failed = Math.max(
        0,
        todayDbStat.postCount - fleetActionCounts.POST.success
      );
    }
    if (fleetActionCounts.COMMENT.total === 0 && todayDbStat.commentCount > 0) {
      fleetActionCounts.COMMENT.total = todayDbStat.commentCount;
      fleetActionCounts.COMMENT.success = Math.min(
        todayDbStat.commentCount,
        fleetSuccess
      );
      fleetActionCounts.COMMENT.failed = Math.max(
        0,
        todayDbStat.commentCount - fleetActionCounts.COMMENT.success
      );
    }
    if (fleetActionCounts.REACTION.total === 0 && todayDbStat.reactCount > 0) {
      fleetActionCounts.REACTION.total = todayDbStat.reactCount;
      fleetActionCounts.REACTION.success = Math.min(
        todayDbStat.reactCount,
        fleetSuccess
      );
      fleetActionCounts.REACTION.failed = Math.max(
        0,
        todayDbStat.reactCount - fleetActionCounts.REACTION.success
      );
    }
  }

  // Calculate fleet actions
  const fleetActions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric> = {
    POST: {
      action: "POST",
      label: "โพสต์กลุ่ม",
      total: fleetActionCounts.POST.total,
      success: fleetActionCounts.POST.success,
      failed: fleetActionCounts.POST.failed,
      successRate: calcRate(
        fleetActionCounts.POST.success,
        fleetActionCounts.POST.failed
      ),
    },
    COMMENT: {
      action: "COMMENT",
      label: "คอมเมนต์",
      total: fleetActionCounts.COMMENT.total,
      success: fleetActionCounts.COMMENT.success,
      failed: fleetActionCounts.COMMENT.failed,
      successRate: calcRate(
        fleetActionCounts.COMMENT.success,
        fleetActionCounts.COMMENT.failed
      ),
    },
    REACTION: {
      action: "REACTION",
      label: "กดความรู้สึก",
      total: fleetActionCounts.REACTION.total,
      success: fleetActionCounts.REACTION.success,
      failed: fleetActionCounts.REACTION.failed,
      successRate: calcRate(
        fleetActionCounts.REACTION.success,
        fleetActionCounts.REACTION.failed
      ),
    },
  };

  let fleetWeakestAction: ActionHealthMetric | null = null;
  const fleetActionsWithWork = Object.values(fleetActions).filter(
    (a) => a.total > 0 || a.failed > 0
  );
  if (fleetActionsWithWork.length > 0) {
    fleetActionsWithWork.sort(
      (a, b) => a.successRate - b.successRate || b.failed - a.failed
    );
    if (
      fleetActionsWithWork[0].failed > 0 ||
      fleetActionsWithWork[0].successRate < 100
    ) {
      fleetWeakestAction = fleetActionsWithWork[0];
    }
  }

  // Sort keys: online first, then error count descending, then code
  keyHealthList.sort((a, b) => {
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
    if (a.stats.failed !== b.stats.failed) return b.stats.failed - a.stats.failed;
    return a.code.localeCompare(b.code);
  });

  // Calculate fleet chart data across ranges (1d, 7d, 30d, 1y)
  const chartDataByRange: Record<ControllerTimeRange, FleetChartPoint[]> = {
    "1d": buildZeroChartPoints("1d").map((p) => ({
      date: p.date,
      label: p.label,
      success: 0,
      failed: 0,
      pending: 0,
      total: 0,
    })),
    "7d": buildZeroChartPoints("7d").map((p) => ({
      date: p.date,
      label: p.label,
      success: 0,
      failed: 0,
      pending: 0,
      total: 0,
    })),
    "30d": buildZeroChartPoints("30d").map((p) => ({
      date: p.date,
      label: p.label,
      success: 0,
      failed: 0,
      pending: 0,
      total: 0,
    })),
    "1y": buildZeroChartPoints("1y").map((p) => ({
      date: p.date,
      label: p.label,
      success: 0,
      failed: 0,
      pending: 0,
      total: 0,
    })),
  };

  // 1. คำนวณ Chart 1d (12 สล็อต ทุก 2 ชม.) โดยนับเฉพาะฟิลด์ total, success, failed, pending
  const fleet1dPoints = chartDataByRange["1d"];
  for (const session of sessions.values()) {
    const s1d = session.chartDataByRange?.["1d"];
    if (!Array.isArray(s1d)) continue;
    for (const pt of s1d) {
      const matchedPoint = fleet1dPoints.find((p) => p.label === pt.label);
      if (matchedPoint) {
        matchedPoint.success += Number(pt.success) || 0;
        matchedPoint.failed += Number(pt.failed) || 0;
        matchedPoint.pending += Number(pt.pending) || 0;
      }
    }
  }

  if (fleet1dPoints.length > 0) {
    const currentEvenHour = Math.floor(new Date().getHours() / 2) * 2;
    const currentLabel = `${String(currentEvenHour).padStart(2, "0")}:00`;
    const matchedSlotIdx = fleet1dPoints.findIndex((p) => p.label === currentLabel);
    const targetIdx = matchedSlotIdx !== -1 ? matchedSlotIdx : fleet1dPoints.length - 1;

    fleet1dPoints[targetIdx].success = Math.max(
      fleet1dPoints[targetIdx].success,
      fleetSuccess
    );
    fleet1dPoints[targetIdx].failed = Math.max(
      fleet1dPoints[targetIdx].failed,
      fleetFailed
    );
    fleet1dPoints[targetIdx].pending = Math.max(
      fleet1dPoints[targetIdx].pending,
      fleetPending
    );
  }
  fleet1dPoints.forEach((pt) => {
    pt.total = pt.success + pt.failed + pt.pending;
  });

  // 2. คำนวณ Chart 7d (ข้อมูลย้อนหลังจาก DB รวมกับวันนี้)
  const fleet7dPoints = chartDataByRange["7d"];
  fleet7dPoints.forEach((pt, idx) => {
    const pointDateStr = getBangkokDateString(new Date(pt.date));
    if (pointDateStr === todayStr || idx === fleet7dPoints.length - 1) {
      pt.success = fleetSuccess;
      pt.failed = fleetFailed;
      pt.pending = fleetPending;
      pt.total = fleetTotal || (fleetSuccess + fleetFailed + fleetPending);
    } else {
      const pastStat = dbPastDaysMap.get(pointDateStr) || {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
      };
      pt.success = pastStat.success;
      pt.failed = pastStat.failed;
      pt.pending = pastStat.pending;
      pt.total = pastStat.total || (pastStat.success + pastStat.failed + pastStat.pending);
    }
  });

  // 3. คำนวณ Chart 30d (ข้อมูลย้อนหลังจาก DB รวมกับวันนี้)
  const fleet30dPoints = chartDataByRange["30d"];
  fleet30dPoints.forEach((pt, idx) => {
    const pointDateStr = getBangkokDateString(new Date(pt.date));
    if (pointDateStr === todayStr || idx === fleet30dPoints.length - 1) {
      pt.success = fleetSuccess;
      pt.failed = fleetFailed;
      pt.pending = fleetPending;
      pt.total = fleetTotal || (fleetSuccess + fleetFailed + fleetPending);
    } else {
      const pastStat = dbPastDaysMap.get(pointDateStr) || {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
      };
      pt.success = pastStat.success;
      pt.failed = pastStat.failed;
      pt.pending = pastStat.pending;
      pt.total = pastStat.total || (pastStat.success + pastStat.failed + pastStat.pending);
    }
  });

  // 4. คำนวณ Chart 1y (12 เดือน รวมจาก DB รายเดือน)
  const fleet1yPoints = chartDataByRange["1y"];
  fleet1yPoints.forEach((pt, idx) => {
    const pointDate = new Date(pt.date);
    const monthKey = `${pointDate.getFullYear()}-${String(
      pointDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthStat = dbMonthsMap.get(monthKey) || {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
    };

    if (monthKey === currentMonthStr || idx === fleet1yPoints.length - 1) {
      const todayInDb = dbPastDaysMap.get(todayStr) || {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
      };
      const additionalTodaySuccess = Math.max(0, fleetSuccess - todayInDb.success);
      const additionalTodayFailed = Math.max(0, fleetFailed - todayInDb.failed);
      const additionalTodayPending = Math.max(0, fleetPending - todayInDb.pending);

      pt.success = monthStat.success + additionalTodaySuccess;
      pt.failed = monthStat.failed + additionalTodayFailed;
      pt.pending = monthStat.pending + additionalTodayPending;
      pt.total = pt.success + pt.failed + pt.pending;
    } else {
      pt.success = monthStat.success;
      pt.failed = monthStat.failed;
      pt.pending = monthStat.pending;
      pt.total = monthStat.total || (monthStat.success + monthStat.failed + monthStat.pending);
    }
  });

  return {
    summary: {
      totalKeys: dbKeys.length,
      onlineCount,
      offlineCount,
      errorCount,
      fleetSuccess,
      fleetFailed,
      fleetPending,
      fleetTotal,
      fleetSuccessRate: calcRate(fleetSuccess, fleetFailed),
      weakestAction: fleetWeakestAction,
      fleetActions,
    },
    chartDataByRange,
    keys: keyHealthList,
    recentFleetErrors: allFleetErrors.slice(0, 20),
  };
};
