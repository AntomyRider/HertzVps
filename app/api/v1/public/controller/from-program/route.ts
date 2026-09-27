import { NextRequest, NextResponse } from "next/server";
import {
  validateControllerKey,
  getOrCreateSession,
  getSessionSnapshot,
  markProgramOnline,
  handleProgramDisconnect,
  enqueueCommandForProgram,
  consumePendingCommands,
  broadcastToWeb,
  appendLogToSession,
  incrementTodayChartPoint,
  buildGroupItem,
  buildChartFromDailyStats,
  normalizeGroupsByAccount,
  normalizeAccounts,
  normalizeIncomingLogs,
  formatCurrentThaiTime,
  scheduleKeyDailyStatFlush,
  syncHistoricalDailyStats,
  type ControllerTimeRange,
  type ControllerWebSSEEvent,
} from "@/lib/controllerHub";
import type {
  ControllerStats,
  ControllerChartPoint,
  ControllerAccountItem,
  ControllerGroupItem,
  ControllerLogItem,
  ControllerLogActionType,
  ControllerLogStatusType,
} from "@/store/controllerStore";

export const dynamic = "force-dynamic";

// GET /api/v1/public/controller/from-program?code=KEY&mode=stream|snapshot&timeRange=7d|30d|1y
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";
    const mode = searchParams.get("mode") || "snapshot";
    const rawRange = searchParams.get("timeRange") || "7d";
    const timeRange: ControllerTimeRange =
      rawRange === "30d" || rawRange === "1y" ? rawRange : "7d";

    const { valid, error, status, keyCode, keyId } = await validateControllerKey(code);
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    if (
      mode === "snapshot" &&
      !req.headers.get("accept")?.includes("text/event-stream")
    ) {
      const snapshot = getSessionSnapshot(keyCode, timeRange);
      return NextResponse.json(snapshot);
    }

    const session = getOrCreateSession(keyCode, keyId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const sendWebEvent = (event: ControllerWebSSEEvent) => {
          try {
            const payload = `event: ${event.type.toLowerCase()}\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch {
            session.webSubscribers.delete(sendWebEvent);
          }
        };

        session.webSubscribers.add(sendWebEvent);

        const initialSnapshot = getSessionSnapshot(keyCode, timeRange);
        sendWebEvent({
          type: "SNAPSHOT",
          data: initialSnapshot,
          timestamp: new Date().toISOString(),
        });

        // แจ้งตัวโปรแกรมทันทีว่ามีผู้ชมบนหน้าเว็บเปิดดูหน้าจอสดอยู่
        enqueueCommandForProgram(keyCode, "MONITOR_CONFIG", {
          action: "MONITOR_CONFIG",
          payload: {
            ...session.monitorConfig,
            hasWebViewers: true,
          },
        });

        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch {
            clearInterval(keepAliveInterval);
            session.webSubscribers.delete(sendWebEvent);
          }
        }, 15_000);

        req.signal.addEventListener("abort", () => {
          clearInterval(keepAliveInterval);
          session.webSubscribers.delete(sendWebEvent);
          if (session.webSubscribers.size === 0) {
            enqueueCommandForProgram(keyCode, "MONITOR_CONFIG", {
              action: "MONITOR_CONFIG",
              payload: {
                ...session.monitorConfig,
                hasWebViewers: false,
              },
            });
          }
          try {
            controller.close();
          } catch {
            // Stream closed already
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("GET /api/v1/public/controller/from-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลจากตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// POST /api/v1/public/controller/from-program
// รับข้อมูล Telemetry, Screen Frame, Sync, Accounts, Groups, DailyStats, และ Logs จากตัวโปรแกรม (Hertz Auto Post)
export async function POST(req: NextRequest) {
  try {
    const {
      code,
      hwid,
      action,
      rtcSignal,
      screenFrame,
      screenResolution,
      stats,
      dailyStats,
      chartData,
      timeRange,
      accounts,
      groupsByAccount,
      account,
      accountId,
      group,
      log,
      logs,
      autoCountStats,
      ackCommandIds,
    }: {
      code?: string;
      hwid?: string;
      action?:
        | "SYNC_STATE"
        | "RTC_SIGNAL"
        | "PUSH_SCREEN_FRAME"
        | "ADD_ACCOUNT"
        | "UPSERT_ACCOUNT"
        | "ADD_GROUP"
        | "UPSERT_GROUP"
        | "PUSH_LOG"
        | "PUSH_LOGS"
        | "HEARTBEAT";
      rtcSignal?: Record<string, unknown>;
      screenFrame?: string;
      screenResolution?: string;
      stats?: Partial<ControllerStats>;
      dailyStats?: Array<{
        date?: string;
        success?: number;
        failed?: number;
        pending?: number;
      }>;
      chartData?: ControllerChartPoint[];
      timeRange?: ControllerTimeRange;
      accounts?: Array<
        Partial<ControllerAccountItem> & {
          groupInfo?: {
            groupName?: string;
            groupCurrent?: number;
            groupTotal?: number;
          } | null;
        }
      >;
      groupsByAccount?: Record<string, unknown[]>;
      account?: ControllerAccountItem;
      accountId?: string;
      group?: Partial<ControllerGroupItem>;
      log?: {
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
      };
      logs?: Array<{
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
      }>;
      autoCountStats?: boolean;
      ackCommandIds?: string[];
    } = await req.json();

    const { valid, error, status, keyCode, keyId } = await validateControllerKey(
      code || "",
      hwid
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = markProgramOnline(keyCode, keyId);

    // 0. Fast-path สำหรับ WebRTC Signaling (RTC_SIGNAL: Offer / ICE จากตัวโปรแกรม -> หน้าเว็บ)
    if (action === "RTC_SIGNAL" && rtcSignal) {
      broadcastToWeb(keyCode, {
        type: "RTC_SIGNAL",
        data: {
          rtcSignal,
        },
      });
      return NextResponse.json({
        success: true,
        monitorActive: !session.monitorConfig.paused,
      });
    }

    // 0.1 Fast-path สำหรับส่งภาพหน้าจอสด (PUSH_SCREEN_FRAME Fallback)
    if (action === "PUSH_SCREEN_FRAME" && screenFrame) {
      session.screenFrame = screenFrame;
      session.screenResolution = screenResolution || "1280x720";
      session.screenUpdatedAt = formatCurrentThaiTime();

      broadcastToWeb(keyCode, {
        type: "SCREEN_FRAME",
        data: {
          screenFrame: session.screenFrame,
          screenResolution: session.screenResolution,
          screenUpdatedAt: session.screenUpdatedAt,
        },
      });

      return NextResponse.json({
        success: true,
        monitorActive: !session.monitorConfig.paused,
        monitorConfig: session.monitorConfig,
      });
    }

    if (action === "HEARTBEAT") {
      const commands = consumePendingCommands(keyCode, ackCommandIds);
      return NextResponse.json({
        success: true,
        isProgramOnline: true,
        commands,
      });
    }

    if (action === "PUSH_LOG" || action === "PUSH_LOGS" || log) {
      const rawList = Array.isArray(logs) ? logs : log ? [log] : [];
      const shouldUpdateStats = autoCountStats ?? true;
      const createdLogs: ControllerLogItem[] = [];

      for (const item of rawList) {
        if (!item || !item.message) continue;
        const appended = appendLogToSession(
          session,
          {
            id: item.id,
            timestamp: item.timestamp,
            accountId: item.accountId || "system",
            accountName: item.accountName || item.source || "System",
            groupName: item.groupName,
            action: item.action || "SYSTEM",
            status: item.status || "INFO",
            message: item.message,
          },
          shouldUpdateStats
        );
        createdLogs.push(appended);
      }

      broadcastToWeb(keyCode, {
        type: "LOG_PUSHED",
        data: {
          logs: [...session.logs],
          stats: { ...session.stats },
          chartData: session.chartDataByRange["7d"],
          accounts: [...session.accounts],
        },
      });

      scheduleKeyDailyStatFlush(keyCode);

      const commands = consumePendingCommands(keyCode, ackCommandIds);
      return NextResponse.json({
        success: true,
        addedCount: createdLogs.length,
        stats: session.stats,
        commands,
      });
    }

    if ((action === "ADD_ACCOUNT" || action === "UPSERT_ACCOUNT") && account) {
      const exists = session.accounts.some((a) => a.id === account.id);
      if (exists) {
        session.accounts = session.accounts.map((a) =>
          a.id === account.id ? { ...a, ...account } : a
        );
      } else {
        session.accounts = [...session.accounts, account];
      }

      if (!session.groupsByAccount[account.id]) {
        session.groupsByAccount[account.id] = [];
      }

      broadcastToWeb(keyCode, {
        type: "ACCOUNT_UPDATED",
        data: {
          accounts: [...session.accounts],
          groupsByAccount: { ...session.groupsByAccount },
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
      });
    }

    if (
      (action === "ADD_GROUP" || action === "UPSERT_GROUP") &&
      accountId &&
      group
    ) {
      const currentGroups = session.groupsByAccount[accountId] || [];
      const built = buildGroupItem(accountId, group, currentGroups.length + 1);
      const exists = currentGroups.some((g) => g.id === built.id);

      session.groupsByAccount[accountId] = exists
        ? currentGroups.map((g) => (g.id === built.id ? built : g))
        : [built, ...currentGroups];

      broadcastToWeb(keyCode, {
        type: "GROUPS_UPDATED",
        data: {
          accountId,
          groupsByAccount: { ...session.groupsByAccount },
        },
      });

      return NextResponse.json({
        success: true,
        group: built,
        groupsByAccount: session.groupsByAccount,
      });
    }

    // Full Telemetry / Initial Sync from Hertz Auto Post
    if (stats) {
      session.stats = {
        total: Number(stats.total ?? session.stats.total),
        success: Number(stats.success ?? session.stats.success),
        failed: Number(stats.failed ?? session.stats.failed),
        pending: Number(stats.pending ?? session.stats.pending),
      };
      scheduleKeyDailyStatFlush(keyCode);
    }

    if (Array.isArray(dailyStats) && dailyStats.length > 0) {
      session.chartDataByRange = buildChartFromDailyStats(dailyStats);
      syncHistoricalDailyStats(keyCode, dailyStats).catch(console.error);
    } else if (Array.isArray(chartData) && chartData.length > 0) {
      const targetRange: ControllerTimeRange =
        timeRange === "30d" || timeRange === "1y" ? timeRange : "7d";
      session.chartDataByRange[targetRange] = chartData;
    }

    if (groupsByAccount && typeof groupsByAccount === "object") {
      session.groupsByAccount = normalizeGroupsByAccount(groupsByAccount);
    }

    if (Array.isArray(accounts)) {
      session.accounts = normalizeAccounts(accounts, session.groupsByAccount);
    }

    if (Array.isArray(logs)) {
      session.logs = normalizeIncomingLogs(logs, session.accounts).slice(-500);
    }

    if (screenFrame) {
      session.screenFrame = screenFrame;
      session.screenResolution =
        screenResolution || session.screenResolution || "1280x720";
      session.screenUpdatedAt = formatCurrentThaiTime();
    }

    const snapshot = getSessionSnapshot(keyCode, timeRange || "7d");
    broadcastToWeb(keyCode, {
      type: "SNAPSHOT",
      data: snapshot,
    });

    const commands = consumePendingCommands(keyCode, ackCommandIds);
    return NextResponse.json({
      success: true,
      isProgramOnline: true,
      monitorActive: !session.monitorConfig.paused,
      monitorConfig: session.monitorConfig,
      snapshot,
      commands,
    });
  } catch (err) {
    console.error("POST /api/v1/public/controller/from-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการรับข้อมูลจากตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/public/controller/from-program
export async function PUT(req: NextRequest) {
  try {
    const {
      code,
      hwid,
      accounts,
      groupsByAccount,
      stats,
      dailyStats,
      chartData,
      timeRange,
    }: {
      code?: string;
      hwid?: string;
      accounts?: ControllerAccountItem[];
      groupsByAccount?: Record<string, unknown[]>;
      stats?: ControllerStats;
      dailyStats?: Array<{
        date?: string;
        success?: number;
        failed?: number;
        pending?: number;
      }>;
      chartData?: ControllerChartPoint[];
      timeRange?: ControllerTimeRange;
    } = await req.json();

    const { valid, error, status, keyCode, keyId } = await validateControllerKey(
      code || "",
      hwid
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = markProgramOnline(keyCode, keyId);

    if (groupsByAccount && typeof groupsByAccount === "object") {
      session.groupsByAccount = normalizeGroupsByAccount(groupsByAccount);
    }
    if (Array.isArray(accounts)) {
      session.accounts = normalizeAccounts(accounts, session.groupsByAccount);
    }
    if (stats) {
      session.stats = stats;
      scheduleKeyDailyStatFlush(keyCode);
    }
    if (Array.isArray(dailyStats) && dailyStats.length > 0) {
      session.chartDataByRange = buildChartFromDailyStats(dailyStats);
      syncHistoricalDailyStats(keyCode, dailyStats).catch(console.error);
    } else if (Array.isArray(chartData) && chartData.length > 0) {
      const targetRange: ControllerTimeRange =
        timeRange === "30d" || timeRange === "1y" ? timeRange : "7d";
      session.chartDataByRange[targetRange] = chartData;
    }

    const snapshot = getSessionSnapshot(keyCode, timeRange || "7d");
    broadcastToWeb(keyCode, {
      type: "STATE_UPDATED",
      data: snapshot,
    });

    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (err) {
    console.error("PUT /api/v1/public/controller/from-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเขียนทับข้อมูลจากตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/public/controller/from-program
export async function PATCH(req: NextRequest) {
  try {
    const {
      code,
      hwid,
      accountId,
      accountPatch,
      stats,
      statsDelta,
      chartPointDelta,
      groupId,
      groupPatch,
    }: {
      code?: string;
      hwid?: string;
      accountId?: string;
      accountPatch?: Partial<ControllerAccountItem>;
      stats?: Partial<ControllerStats>;
      statsDelta?: Partial<ControllerStats>;
      chartPointDelta?: {
        success?: number;
        failed?: number;
        pending?: number;
      };
      groupId?: string;
      groupPatch?: Partial<ControllerGroupItem>;
    } = await req.json();

    const { valid, error, status, keyCode, keyId } = await validateControllerKey(
      code || "",
      hwid
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = markProgramOnline(keyCode, keyId);

    if (accountId && accountPatch) {
      session.accounts = session.accounts.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          ...accountPatch,
          stats: accountPatch.stats
            ? { ...acc.stats, ...accountPatch.stats }
            : acc.stats,
        };
      });
    }

    if (accountId && groupId && groupPatch) {
      const currentGroups = session.groupsByAccount[accountId] || [];
      session.groupsByAccount[accountId] = currentGroups.map((grp) =>
        grp.id === groupId ? { ...grp, ...groupPatch } : grp
      );
    }

    if (stats) {
      session.stats = {
        ...session.stats,
        ...stats,
      };
    }

    if (statsDelta) {
      session.stats = {
        total: Math.max(0, session.stats.total + (statsDelta.total || 0)),
        success: Math.max(0, session.stats.success + (statsDelta.success || 0)),
        failed: Math.max(0, session.stats.failed + (statsDelta.failed || 0)),
        pending: Math.max(0, session.stats.pending + (statsDelta.pending || 0)),
      };
    }

    if (chartPointDelta) {
      incrementTodayChartPoint(session, chartPointDelta);
    }

    if (stats || statsDelta || chartPointDelta) {
      scheduleKeyDailyStatFlush(keyCode);
    }

    broadcastToWeb(keyCode, {
      type: "STATE_UPDATED",
      data: {
        stats: { ...session.stats },
        chartData: session.chartDataByRange["7d"],
        accounts: [...session.accounts],
        groupsByAccount: { ...session.groupsByAccount },
      },
    });

    return NextResponse.json({
      success: true,
      stats: session.stats,
      accounts: session.accounts,
    });
  } catch (err) {
    console.error("PATCH /api/v1/public/controller/from-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตความคืบหน้าจากตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/public/controller/from-program
export async function DELETE(req: NextRequest) {
  try {
    const {
      code,
      hwid,
      target,
      accountId,
      groupId,
    }: {
      code?: string;
      hwid?: string;
      target?: "SESSION" | "OFFLINE" | "ACCOUNT" | "GROUP" | "LOGS";
      accountId?: string;
      groupId?: string;
    } = await req.json();

    const { valid, error, status, keyCode, keyId } = await validateControllerKey(
      code || "",
      hwid
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = getOrCreateSession(keyCode, keyId);

    if (!target || target === "SESSION" || target === "OFFLINE") {
      handleProgramDisconnect(keyCode, true);
      return NextResponse.json({
        success: true,
        isProgramOnline: false,
        message:
          "ตัวโปรแกรมตัดการเชื่อมต่อและล้างข้อมูลชั่วคราวบนเว็บไซต์เรียบร้อยแล้ว",
      });
    }

    if (target === "ACCOUNT" && accountId) {
      session.accounts = session.accounts.filter((a) => a.id !== accountId);
      delete session.groupsByAccount[accountId];
      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          accounts: [...session.accounts],
          groupsByAccount: { ...session.groupsByAccount },
        },
      });
      return NextResponse.json({ success: true, accounts: session.accounts });
    }

    if (target === "GROUP" && accountId && groupId) {
      const currentGroups = session.groupsByAccount[accountId] || [];
      session.groupsByAccount[accountId] = currentGroups.filter(
        (g) => g.id !== groupId
      );
      broadcastToWeb(keyCode, {
        type: "GROUPS_UPDATED",
        data: {
          accountId,
          groupsByAccount: { ...session.groupsByAccount },
        },
      });
      return NextResponse.json({
        success: true,
        groupsByAccount: session.groupsByAccount,
      });
    }

    if (target === "LOGS") {
      session.logs = [];
      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: { logs: [] },
      });
      return NextResponse.json({ success: true, logs: [] });
    }

    return NextResponse.json(
      { error: "ข้อมูลคำสั่งลบไม่ครบถ้วน" },
      { status: 400 }
    );
  } catch (err) {
    console.error("DELETE /api/v1/public/controller/from-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตัดการเชื่อมต่อหรือลบข้อมูลจากตัวโปรแกรม" },
      { status: 500 }
    );
  }
}
