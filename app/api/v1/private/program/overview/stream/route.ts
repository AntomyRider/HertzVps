import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { subscribeToFleetUpdates } from "@/lib/controllerHub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const sendEvent = (event: string, data: Record<string, unknown>) => {
        if (isClosed) return;
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          isClosed = true;
          unsubscribe();
        }
      };

      const unsubscribe = subscribeToFleetUpdates(() => {
        sendEvent("fleet_update", {
          timestamp: new Date().toISOString(),
        });
      });

      // Send initial connect greeting
      sendEvent("connected", { connected: true, timestamp: new Date().toISOString() });

      const keepAlive = setInterval(() => {
        if (isClosed) {
          clearInterval(keepAlive);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          isClosed = true;
          clearInterval(keepAlive);
          unsubscribe();
        }
      }, 15_000);

      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(keepAlive);
        unsubscribe();
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
}
