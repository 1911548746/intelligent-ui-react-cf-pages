import { SYSTEM_PROMPT } from "../_shared/system-prompt.generated";
import type { PagesContext, RuntimeEnv } from "../_shared/types";

const MAX_ITEMS = 60;
const MAX_BODY_BYTES = 1_000_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function toMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null;
  const messages = value.flatMap((item): ChatMessage[] => {
    if (!item || typeof item !== "object") return [];
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return [];
    if (typeof content === "string") return [{ role, content }];
    if (!Array.isArray(content)) return [];
    const text = content.map((part) => (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string" ? (part as { text: string }).text : "")).join("");
    return [{ role, content: text }];
  });
  return messages.length ? messages.slice(-MAX_ITEMS) : null;
}

export async function onRequestPost({ request, env }: PagesContext<RuntimeEnv>) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: { message: "请求体必须是 application/json。" } }, { status: 415 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return Response.json({ error: { message: "请求体过大。" } }, { status: 413 });
  }

  let messages: ChatMessage[] | null = null;
  try {
    messages = toMessages((JSON.parse(raw) as { messages?: unknown }).messages);
  } catch {
    messages = null;
  }
  if (!messages) return Response.json({ error: { message: "messages 必须是非空数组。" } }, { status: 400 });

  const baseUrl = env.LLM_BASE_URL?.trim().replace(/\/+$/, "");
  const model = env.LLM_MODEL?.trim();
  if (!baseUrl || !model) {
    return Response.json({ error: { message: "Pages 环境中必须配置 LLM_BASE_URL 和 LLM_MODEL。" } }, { status: 500 });
  }

  const headers = new Headers({ "Content-Type": "application/json", Accept: "text/event-stream" });
  if (env.LLM_API_KEY?.trim()) headers.set("Authorization", `Bearer ${env.LLM_API_KEY.trim()}`);

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(
        { 
          model, 
          messages: 
          [{ role: "system", content: SYSTEM_PROMPT }, ...messages], 
          enable_thinking: false,
          stream: true 
        }
      ),
      signal: request.signal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: { message: `上游模型请求失败：${message}` } }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = (await upstream.text().catch(() => "")).slice(0, 1000);
    return Response.json({ error: { message: `上游模型返回 ${upstream.status}${detail ? `：${detail}` : "。"}` } }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
