import { z } from "zod";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { retrieveRelevantChunks, type RetrievedChunk } from "@/lib/rag/retrieve";
import { jsonError } from "@/lib/api-response";
import { MAX_CHAT_HISTORY_MESSAGES, MAX_CHAT_MESSAGE_LENGTH } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

const FALLBACK_MESSAGE =
  "\n\nI'm not able to help with that. Please reach out via /contact and our team will follow up directly.";
const ERROR_MESSAGE = "\n\nSomething went wrong on our end. Please try again in a moment.";
// Gemini finish reasons that mean the response was blocked/incomplete, not a normal stop.
const NON_STOP_FINISH_REASONS = new Set(["SAFETY", "RECITATION", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "OTHER"]);

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
      }),
    )
    .min(1)
    .max(MAX_CHAT_HISTORY_MESSAGES),
});

const SYSTEM_PROMPT = `You are the AI assistant embedded on Torq Studio's website (a software development agency). Answer visitor questions about Torq Studio's services, solutions, industries, technologies, pricing, and case studies.

Each user turn may include a CONTEXT block pulled from the site's own content. Base your answer only on that context and on the ongoing conversation — don't invent services, pricing, or case study results that aren't in the context. When the context includes a URL for something you reference, add it as a markdown link. If the context doesn't cover the question, say so plainly and suggest visiting /contact to talk to the team — don't guess.

Keep answers short and conversational (2-4 sentences unless the visitor asks for more detail). No markdown headers; a short bullet list is fine when comparing options.`;

function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c, i) => `[${i + 1}] ${c.title}${c.url ? ` (${c.url})` : ""}\n${c.content}`)
    .join("\n\n---\n\n");
}

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };
type GeminiStreamChunk = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
};

export async function POST(req: Request) {
  if (!(await isFeatureEnabled("floating_chat_assistant"))) {
    return jsonError(503, "Chat assistant is unavailable.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return jsonError(503, "Chat assistant is not configured.");
  }

  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonError(400, "Invalid payload");
    }
    body = parsed.data;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const { messages } = body;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return jsonError(400, "The last message must be from the user.");
  }

  let chunks: RetrievedChunk[] = [];
  try {
    chunks = await retrieveRelevantChunks(lastMessage.content, 5);
  } catch (err) {
    // Degrade gracefully (e.g. vector index still building) rather than failing the whole
    // chat — the model answers without site-specific context.
    console.error("RAG retrieval failed:", err);
  }

  const history: GeminiContent[] = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const finalUserContent = chunks.length
    ? `CONTEXT:\n${buildContextBlock(chunks)}\n\nUser question: ${lastMessage.content}`
    : lastMessage.content;
  const contents: GeminiContent[] = [...history, { role: "user", parts: [{ text: finalUserContent }] }];

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents,
              generationConfig: { maxOutputTokens: 1024 },
            }),
          },
        );

        if (!res.ok || !res.body) {
          throw new Error(`Gemini request failed (${res.status}): ${await res.text()}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finishReason: string | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIndex: number;
          while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, sepIndex);
            buffer = buffer.slice(sepIndex + 2);
            const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const chunk = JSON.parse(dataLine.slice("data: ".length)) as GeminiStreamChunk;
            const candidate = chunk.candidates?.[0];
            const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
            if (text) controller.enqueue(encoder.encode(text));
            if (candidate?.finishReason) finishReason = candidate.finishReason;
          }
        }

        if (finishReason && NON_STOP_FINISH_REASONS.has(finishReason)) {
          controller.enqueue(encoder.encode(FALLBACK_MESSAGE));
        }
      } catch (err) {
        console.error("Gemini stream error:", err);
        controller.enqueue(encoder.encode(ERROR_MESSAGE));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
