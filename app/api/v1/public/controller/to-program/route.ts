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
  buildGroupItem,
  formatCurrentThaiTime,
  type ControllerTimeRange,
  type ControllerProgramSSEEvent,
} from "@/lib/controllerHub";
import type {
  ControllerLogItem,
  ControllerReactionType,
} from "@/store/controllerStore";

export const dynamic = "force-dynamic";

// GET /api/v1/public/controller/to-program?code=KEY&mode=stream|poll
// สำหรับตัวโปรแกรมเชื่อมต่อรับคำสั่งแบบ Realtime (SSE) หรือดึงคิวคำสั่ง (Poll)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";
    const hwid = searchParams.get("hwid") || undefined;
    const mode = searchParams.get("mode") || "stream";

    const { valid, error, status, keyCode } = await validateControllerKey(
      code,
      hwid
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    if (
      mode === "poll" &&
      !req.headers.get("accept")?.includes("text/event-stream")
    ) {
      const ackParam = searchParams.get("ack") || "";
      const ackIds = ackParam
        ? ackParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const commands = consumePendingCommands(keyCode, ackIds);
      return NextResponse.json({
        success: true,
        keyCode,
        isProgramOnline: true,
        commands,
      });
    }

    const session = markProgramOnline(keyCode);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const sendEvent = (event: ControllerProgramSSEEvent) => {
          try {
            if (event.type === "COMMAND" && event.command) {
              // ส่งทั้ง event: COMMAND (ตรงกับ Hertz Auto Post) และ event: command
              const cmdJson = JSON.stringify(event.command);
              controller.enqueue(
                encoder.encode(`event: COMMAND\ndata: ${cmdJson}\n\n`)
              );
              controller.enqueue(
                encoder.encode(`event: command\ndata: ${JSON.stringify(event)}\n\n`)
              );
              return;
            }

            if (
              event.type === "COMMAND_BATCH" &&
              Array.isArray(event.commands)
            ) {
              for (const cmd of event.commands) {
                controller.enqueue(
                  encoder.encode(
                    `event: COMMAND\ndata: ${JSON.stringify(cmd)}\n\n`
                  )
                );
              }
              return;
            }

            const payload = `event: ${event.type.toLowerCase()}\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch {
            session.programSubscribers.delete(sendEvent);
          }
        };

        session.programSubscribers.add(sendEvent);

        sendEvent({
          type: "CONNECTED",
          timestamp: new Date().toISOString(),
        });

        // ส่ง MONITOR_CONFIG เริ่มต้น (ปิดแชร์หน้าจอ paused = true เสมอ) ให้ตัวโปรแกรมทันที
        enqueueCommandForProgram(keyCode, "MONITOR_CONFIG", {
          action: "MONITOR_CONFIG",
          payload: {
            ...session.monitorConfig,
            hasWebViewers: session.webSubscribers.size > 0,
          },
        });

        if (session.pendingCommands.length > 0) {
          const queued = [...session.pendingCommands];
          session.pendingCommands = [];
          sendEvent({
            type: "COMMAND_BATCH",
            commands: queued,
            timestamp: new Date().toISOString(),
          });
        }

        const pingInterval = setInterval(() => {
          session.lastHeartbeatAt = Date.now();
          sendEvent({
            type: "PING",
            timestamp: new Date().toISOString(),
          });
        }, 15_000);

        req.signal.addEventListener("abort", () => {
          clearInterval(pingInterval);
          session.programSubscribers.delete(sendEvent);
          handleProgramDisconnect(keyCode, false);
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
    console.error("GET /api/v1/public/controller/to-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเชื่อมต่อช่องทางคำสั่งโปรแกรม" },
      { status: 500 }
    );
  }
}

// POST /api/v1/public/controller/to-program
// สำหรับหน้าเว็บเชื่อมต่อคีย์, สร้างกลุ่มใหม่, หรือสั่งเริ่ม/หยุดทุกบัญชี
export async function POST(req: NextRequest) {
  try {
    const {
      code,
      action,
      accountId,
      payload,
      timeRange,
    }: {
      code?: string;
      action?:
        | "CONNECT_WEB"
        | "RTC_SIGNAL"
        | "CREATE_GROUP"
        | "START_ALL_ACCOUNTS"
        | "STOP_ALL_ACCOUNTS"
        | "UPDATE_CONFIG";
      accountId?: string;
      payload?: {
        name?: string;
        images?: string[];
        links?: string;
        content?: string;
        comment?: string;
        reaction?: ControllerReactionType;
        randomContent?: boolean;
        randomImage?: boolean;
        randomReaction?: boolean;
        viewerId?: string;
        signalType?: string;
        sdp?: unknown;
        candidate?: unknown;
        config?: Record<string, unknown>;
      };
      timeRange?: ControllerTimeRange;
    } = await req.json();

    const { valid, error, status, keyCode } = await validateControllerKey(
      code || ""
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = getOrCreateSession(keyCode);

    if (action === "RTC_SIGNAL" && payload) {
      enqueueCommandForProgram(keyCode, "RTC_SIGNAL", {
        action: "RTC_SIGNAL",
        payload: payload as Record<string, unknown>,
      });
      return NextResponse.json({ success: true });
    }

    if (!action || action === "CONNECT_WEB") {
      const snapshot = getSessionSnapshot(keyCode, timeRange || "7d");
      return NextResponse.json({
        success: true,
        connected: true,
        key: keyCode,
        ...snapshot,
      });
    }

    if (action === "CREATE_GROUP") {
      if (!accountId) {
        return NextResponse.json(
          { error: "กรุณาระบุรหัสบัญชี (accountId)" },
          { status: 400 }
        );
      }

      const currentGroups = session.groupsByAccount[accountId] || [];
      const newGroup = buildGroupItem(
        accountId,
        payload || {},
        currentGroups.length + 1
      );
      const updatedGroups = [newGroup, ...currentGroups];
      session.groupsByAccount[accountId] = updatedGroups;

      const linksList = (newGroup.links || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const command = enqueueCommandForProgram(keyCode, "CREATE_GROUP", {
        action: "CREATE_GROUP",
        accountId,
        groupId: newGroup.id,
        payload: {
          userId: accountId,
          accountId,
          images: newGroup.images,
          group: {
            ...newGroup,
            userId: accountId,
            comments: newGroup.comment,
            links: linksList,
            link: linksList,
            images: newGroup.images,
            isActive: newGroup.enabled,
          },
        },
      });

      broadcastToWeb(keyCode, {
        type: "GROUPS_UPDATED",
        data: {
          accountId,
          groupsByAccount: { ...session.groupsByAccount },
        },
      });

      return NextResponse.json({
        success: true,
        group: newGroup,
        groupsByAccount: session.groupsByAccount,
        command,
      });
    }

    if (action === "START_ALL_ACCOUNTS") {
      const now = formatCurrentThaiTime();
      const newLogs: ControllerLogItem[] = session.accounts.map((acc, idx) => ({
        id: `log_${Date.now()}_${idx}`,
        timestamp: now,
        accountId: acc.id,
        accountName: acc.name,
        groupName: acc.groupName,
        action: "SYSTEM",
        status: "INFO",
        message: "เริ่มการทำงานอัตโนมัติสำหรับทุกกลุ่มที่เปิดใช้งาน",
      }));

      session.accounts = session.accounts.map((acc) => ({
        ...acc,
        isRunning: true,
        currentTask: "กำลังเริ่มรันงาน...",
      }));
      session.logs = [...session.logs, ...newLogs].slice(-500);

      const command = enqueueCommandForProgram(keyCode, "START_ALL_ACCOUNTS", {
        action: "START_ALL",
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          accounts: [...session.accounts],
          logs: [...session.logs],
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
        logs: session.logs,
        command,
      });
    }

    if (action === "STOP_ALL_ACCOUNTS") {
      const now = formatCurrentThaiTime();
      const newLogs: ControllerLogItem[] = session.accounts.map((acc, idx) => ({
        id: `log_${Date.now()}_${idx}`,
        timestamp: now,
        accountId: acc.id,
        accountName: acc.name,
        action: "SYSTEM",
        status: "INFO",
        message: "สั่งหยุดการทำงานของบัญชีเรียบร้อยแล้ว",
      }));

      session.accounts = session.accounts.map((acc) => ({
        ...acc,
        isRunning: false,
        currentTask: "หยุดการทำงานแล้ว",
      }));
      session.logs = [...session.logs, ...newLogs].slice(-500);

      const command = enqueueCommandForProgram(keyCode, "STOP_ALL_ACCOUNTS", {
        action: "STOP_ALL",
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          accounts: [...session.accounts],
          logs: [...session.logs],
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
        logs: session.logs,
        command,
      });
    }

    if (action === "UPDATE_CONFIG") {
      const configPayload = payload?.config;
      if (!configPayload || typeof configPayload !== "object") {
        return NextResponse.json(
          { error: "ต้องระบุ config ที่จะอัปเดต" },
          { status: 400 }
        );
      }

      const command = enqueueCommandForProgram(keyCode, "UPDATE_CONFIG", {
        action: "UPDATE_CONFIG",
        payload: { config: configPayload },
      });

      const now = formatCurrentThaiTime();
      const configLog: ControllerLogItem = {
        id: `log_${Date.now()}_cfg`,
        timestamp: now,
        accountId: "system",
        accountName: "WEB",
        action: "SYSTEM",
        status: "INFO",
        message: "เว็บส่งคำสั่งอัปเดตการตั้งค่าให้โปรแกรม",
      };
      session.logs = [...session.logs, configLog].slice(-500);

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: { logs: [...session.logs] },
      });

      return NextResponse.json({
        success: true,
        logs: session.logs,
        command,
      });
    }

    return NextResponse.json(
      { error: "ไม่รู้จักคำสั่ง (action) ที่ระบุ" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST /api/v1/public/controller/to-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งคำสั่งไปยังตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/public/controller/to-program
// แก้ไขข้อมูลกลุ่มแบบเต็ม (Update Group Full CRUD)
export async function PUT(req: NextRequest) {
  try {
    const {
      code,
      accountId,
      groupId,
      payload,
    }: {
      code?: string;
      accountId?: string;
      groupId?: string;
      payload?: {
        name: string;
        images: string[];
        links: string;
        content: string;
        comment: string;
        reaction: ControllerReactionType;
        randomContent: boolean;
        randomImage: boolean;
        randomReaction: boolean;
      };
    } = await req.json();

    const { valid, error, status, keyCode } = await validateControllerKey(
      code || ""
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    if (!accountId || !groupId || !payload) {
      return NextResponse.json(
        { error: "กรุณาระบุ accountId, groupId และ payload ให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const session = getOrCreateSession(keyCode);
    const currentGroups = session.groupsByAccount[accountId] || [];
    const existingGroup = currentGroups.find((g) => g.id === groupId);
    const oldName = existingGroup?.name || payload.name.trim();

    const coverImage =
      Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images[0]
        : null;

    let updatedGroup = null;
    session.groupsByAccount[accountId] = currentGroups.map((grp) => {
      if (grp.id !== groupId) return grp;
      updatedGroup = {
        ...grp,
        name: payload.name.trim() || grp.name,
        image: coverImage,
        images: Array.isArray(payload.images) ? payload.images : [],
        links: payload.links,
        content: payload.content,
        comment: payload.comment,
        reaction: payload.reaction,
        randomContent: Boolean(payload.randomContent),
        randomImage: Boolean(payload.randomImage),
        randomReaction: Boolean(payload.randomReaction),
      };
      return updatedGroup;
    });

    const linksList = (payload.links || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const command = enqueueCommandForProgram(keyCode, "UPDATE_GROUP", {
      action: "UPDATE_GROUP",
      accountId,
      groupId,
      payload: {
        userId: accountId,
        accountId,
        groupId,
        oldName,
        existingImages: [],
        newImages: Array.isArray(payload.images) ? payload.images : [],
        images: Array.isArray(payload.images) ? payload.images : [],
        data: {
          userId: accountId,
          oldName,
          name: payload.name.trim() || oldName,
          content: payload.content,
          comments: payload.comment,
          reaction: payload.reaction,
          links: linksList,
          link: linksList,
          existingImages: [],
          newImages: Array.isArray(payload.images) ? payload.images : [],
          randomContent: Boolean(payload.randomContent),
          randomImage: Boolean(payload.randomImage),
          randomReaction: Boolean(payload.randomReaction),
          isActive: existingGroup ? existingGroup.enabled : true,
        },
      },
    });

    broadcastToWeb(keyCode, {
      type: "GROUPS_UPDATED",
      data: {
        accountId,
        groupsByAccount: { ...session.groupsByAccount },
      },
    });

    return NextResponse.json({
      success: true,
      group: updatedGroup,
      groupsByAccount: session.groupsByAccount,
      command,
    });
  } catch (err) {
    console.error("PUT /api/v1/public/controller/to-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลกลุ่ม" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/public/controller/to-program
// สลับสถานะ เริ่ม/หยุด รายบัญชี, รีเซ็ตสถิติบัญชี, เปิด/ปิด กลุ่ม, หรือตั้งค่าหน้าจอมอนิเตอร์สด
export async function PATCH(req: NextRequest) {
  try {
    const {
      code,
      action,
      accountId,
      groupId,
      enabled,
      isRunning,
      paused,
      preset,
    }: {
      code?: string;
      action?:
        | "TOGGLE_ACCOUNT"
        | "RESET_ACCOUNT_STATS"
        | "TOGGLE_GROUP"
        | "UPDATE_MONITOR_CONFIG";
      accountId?: string;
      groupId?: string;
      enabled?: boolean;
      isRunning?: boolean;
      paused?: boolean;
      preset?: "smooth" | "balanced" | "hd";
    } = await req.json();

    const { valid, error, status, keyCode } = await validateControllerKey(
      code || ""
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = getOrCreateSession(keyCode);

    if (action === "UPDATE_MONITOR_CONFIG") {
      session.monitorConfig = {
        paused:
          typeof paused === "boolean" ? paused : session.monitorConfig.paused,
        preset:
          preset === "smooth" || preset === "balanced" || preset === "hd"
            ? preset
            : session.monitorConfig.preset,
      };

      const command = enqueueCommandForProgram(keyCode, "MONITOR_CONFIG", {
        action: "MONITOR_CONFIG",
        payload: {
          ...session.monitorConfig,
          hasWebViewers: session.webSubscribers.size > 0,
        },
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          monitorConfig: { ...session.monitorConfig },
        },
      });

      return NextResponse.json({
        success: true,
        monitorConfig: session.monitorConfig,
        command,
      });
    }

    if (action === "TOGGLE_ACCOUNT") {
      if (!accountId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId" },
          { status: 400 }
        );
      }

      const target = session.accounts.find((acc) => acc.id === accountId);
      const nextRunning =
        typeof isRunning === "boolean"
          ? isRunning
          : target
            ? !target.isRunning
            : false;

      if (target) {
        const newLog: ControllerLogItem = {
          id: `log_${Date.now()}`,
          timestamp: formatCurrentThaiTime(),
          accountId: target.id,
          accountName: target.name,
          groupName: target.groupName,
          action: "SYSTEM",
          status: "INFO",
          message: nextRunning
            ? "เริ่มเดินงานอัตโนมัติของบัญชี"
            : "หยุดการทำงานของบัญชีชั่วคราว",
        };
        session.logs = [...session.logs, newLog].slice(-500);
      }

      session.accounts = session.accounts.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          isRunning: nextRunning,
          currentTask: nextRunning ? "กำลังรันงาน..." : "พร้อมทำงาน",
        };
      });

      const command = enqueueCommandForProgram(keyCode, "TOGGLE_ACCOUNT", {
        action: nextRunning ? "START_USER" : "STOP_USER",
        accountId,
        payload: { accountId, isRunning: nextRunning },
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          accounts: [...session.accounts],
          logs: [...session.logs],
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
        logs: session.logs,
        command,
      });
    }

    if (action === "RESET_ACCOUNT_STATS") {
      if (!accountId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId" },
          { status: 400 }
        );
      }

      session.accounts = session.accounts.map((acc) =>
        acc.id === accountId
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
      );

      const command = enqueueCommandForProgram(keyCode, "RESET_ACCOUNT_STATS", {
        action: "RESET_USER_STATS",
        accountId,
        payload: { accountId },
      });

      broadcastToWeb(keyCode, {
        type: "ACCOUNT_UPDATED",
        data: {
          accounts: [...session.accounts],
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
        command,
      });
    }

    if (action === "TOGGLE_GROUP") {
      if (!accountId || !groupId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId และ groupId" },
          { status: 400 }
        );
      }

      const currentGroups = session.groupsByAccount[accountId] || [];
      const targetGroup = currentGroups.find((g) => g.id === groupId);
      let nextEnabled = Boolean(enabled);

      session.groupsByAccount[accountId] = currentGroups.map((grp) => {
        if (grp.id !== groupId) return grp;
        nextEnabled = typeof enabled === "boolean" ? enabled : !grp.enabled;
        return {
          ...grp,
          enabled: nextEnabled,
        };
      });

      const command = enqueueCommandForProgram(keyCode, "TOGGLE_GROUP", {
        action: "TOGGLE_GROUP",
        accountId,
        groupId,
        payload: {
          userId: accountId,
          accountId,
          groupId,
          name: targetGroup?.name || "",
          groupName: targetGroup?.name || "",
          enabled: nextEnabled,
          isActive: nextEnabled,
        },
      });

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
        command,
      });
    }

    return NextResponse.json(
      { error: "ไม่รู้จักคำสั่ง (action) ที่ระบุ" },
      { status: 400 }
    );
  } catch (err) {
    console.error("PATCH /api/v1/public/controller/to-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตสถานะไปยังตัวโปรแกรม" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/public/controller/to-program
// ลบบัญชี, ลบกลุ่มเดี่ยว, ลบกลุ่มทั้งหมดของบัญชี, หรือล้างประวัติ Log
export async function DELETE(req: NextRequest) {
  try {
    const {
      code,
      target,
      accountId,
      groupId,
    }: {
      code?: string;
      target?: "ACCOUNT" | "GROUP" | "ALL_GROUPS" | "LOGS";
      accountId?: string;
      groupId?: string;
    } = await req.json();

    const { valid, error, status, keyCode } = await validateControllerKey(
      code || ""
    );
    if (!valid || !keyCode) {
      return NextResponse.json(
        { error: error || "คีย์ไม่ถูกต้อง" },
        { status: status || 400 }
      );
    }

    const session = getOrCreateSession(keyCode);

    if (target === "ACCOUNT") {
      if (!accountId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId" },
          { status: 400 }
        );
      }

      session.accounts = session.accounts.filter((acc) => acc.id !== accountId);
      delete session.groupsByAccount[accountId];

      const command = enqueueCommandForProgram(keyCode, "DELETE_ACCOUNT", {
        action: "DELETE_ACCOUNT",
        accountId,
        payload: { accountId },
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          accounts: [...session.accounts],
          groupsByAccount: { ...session.groupsByAccount },
        },
      });

      return NextResponse.json({
        success: true,
        accounts: session.accounts,
        groupsByAccount: session.groupsByAccount,
        command,
      });
    }

    if (target === "GROUP") {
      if (!accountId || !groupId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId และ groupId" },
          { status: 400 }
        );
      }

      const currentGroups = session.groupsByAccount[accountId] || [];
      const targetGroup = currentGroups.find((g) => g.id === groupId);
      session.groupsByAccount[accountId] = currentGroups.filter(
        (g) => g.id !== groupId
      );

      const command = enqueueCommandForProgram(keyCode, "DELETE_GROUP", {
        action: "DELETE_GROUP",
        accountId,
        groupId,
        payload: {
          userId: accountId,
          accountId,
          groupId,
          name: targetGroup?.name || "",
          groupName: targetGroup?.name || "",
        },
      });

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
        command,
      });
    }

    if (target === "ALL_GROUPS") {
      if (!accountId) {
        return NextResponse.json(
          { error: "กรุณาระบุ accountId" },
          { status: 400 }
        );
      }

      const currentGroups = session.groupsByAccount[accountId] || [];
      session.groupsByAccount[accountId] = [];

      const command = enqueueCommandForProgram(keyCode, "DELETE_ALL_GROUPS", {
        action: "DELETE_ALL_GROUPS",
        accountId,
        payload: {
          userId: accountId,
          accountId,
          groupNames: currentGroups.map((g) => g.name),
        },
      });

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
        command,
      });
    }

    if (target === "LOGS") {
      session.logs = [];

      const command = enqueueCommandForProgram(keyCode, "CLEAR_LOGS", {
        action: "CLEAR_LOGS",
      });

      broadcastToWeb(keyCode, {
        type: "STATE_UPDATED",
        data: {
          logs: [],
        },
      });

      return NextResponse.json({
        success: true,
        logs: [],
        command,
      });
    }

    return NextResponse.json(
      { error: "กรุณาระบุเป้าหมายที่ต้องการลบ (target)" },
      { status: 400 }
    );
  } catch (err) {
    console.error("DELETE /api/v1/public/controller/to-program error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}
