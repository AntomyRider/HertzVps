import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateControlSession,
  popPendingCommands,
  type SseSubscriber,
} from "@/lib/controlHub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim() || "";
  const role = searchParams.get("role")?.trim() || "web";

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing key code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = await prisma.key.findUnique({
    where: { code },
  });

  if (!key || !key.isActive) {
    return new Response(JSON.stringify({ error: "Invalid or inactive key" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = getOrCreateControlSession(code);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent: SseSubscriber = (event, data) => {
        const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      if (role === "bot") {
        session.botSubscribers.add(sendEvent);
        const queued = popPendingCommands(code);
        for (const cmd of queued) {
          sendEvent("COMMAND", cmd);
        }
      } else {
        session.webSubscribers.add(sendEvent);
        const isOnline =
          session.lastSyncAt > 0 && Date.now() - session.lastSyncAt < 10000;
        sendEvent("STATE_UPDATED", {
          online: isOnline,
          lastSyncAt: session.lastSyncAt
            ? new Date(session.lastSyncAt).toISOString()
            : null,
          state: session.telemetry,
        });
      }

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        if (role === "bot") {
          session.botSubscribers.delete(sendEvent);
        } else {
          session.webSubscribers.delete(sendEvent);
        }
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
