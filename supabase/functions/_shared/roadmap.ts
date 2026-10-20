export const validString = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

/**
 * Reads request text incrementally so an untrusted caller cannot force the
 * function to buffer an arbitrarily large body before the size check.
 */
export async function readTextWithinLimit(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<string> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError("Maximum request size must be a non-negative safe integer");
  }
  if (!body) return "";

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // The body may already have errored; the size limit still applies.
        }
        throw new RangeError("Request body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bytes);
}

export function validateRoadmap(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.sections) || data.sections.length < 1 || data.sections.length > 12) return false;
  if (data.sections.some((section) => {
    if (!section || typeof section !== "object") return true;
    const item = section as Record<string, unknown>;
    return !validString(item.title, 120) || !Array.isArray(item.topics) ||
      item.topics.length < 1 || item.topics.length > 20 ||
      item.topics.some((topic) => !validString(topic, 160));
  })) return false;
  if (data.resources !== undefined && (!Array.isArray(data.resources) || data.resources.length > 30)) return false;
  if (Array.isArray(data.resources) && data.resources.some((resource) => {
    if (!resource || typeof resource !== "object") return true;
    const item = resource as Record<string, unknown>;
    if (!validString(item.title, 160) || !validString(item.url, 2048)) return true;
    try { if (new URL(item.url).protocol !== "https:") return true; } catch { return true; }
    return !["documentation", "course", "tutorial", "guide"].includes(String(item.type));
  })) return false;
  return true;
}
