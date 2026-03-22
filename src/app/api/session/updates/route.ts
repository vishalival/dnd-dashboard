import { NextRequest } from "next/server";
import { agentEmitter, type AgentMessage } from "@/lib/sse-emitter";

// GET /api/session/updates?sessionId=xxx
// Server-Sent Events stream. The frontend opens this before calling /api/session/end,
// then listens for { agent, state, data } messages.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("sessionId required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: AgentMessage) => {
        const data = `data: ${JSON.stringify(msg)}\n\n`;
        controller.enqueue(encoder.encode(data));
        if (msg.state === "done" || msg.state === "error") {
          agentEmitter.off(`session:${sessionId}`, send);
          clearInterval(heartbeat);
          controller.close();
        }
      };

      agentEmitter.on(`session:${sessionId}`, send);

      // Send a comment ping every 20s so proxies/browsers don't close the
      // idle connection between 30s chunk-processing events.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 20_000);

      // Clean up if the client disconnects before done
      req.signal.addEventListener("abort", () => {
        agentEmitter.off(`session:${sessionId}`, send);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
