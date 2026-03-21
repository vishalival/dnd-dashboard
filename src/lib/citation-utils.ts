export interface Citation {
  docId: string;
  title: string;
  quote: string;
}

export interface ParsedResponse {
  text: string;
  citations: Citation[];
}

export function parseAssistantResponse(raw: string): ParsedResponse {
  const sourcesMatch = raw.match(/<sources>\s*([\s\S]*?)\s*<\/sources>/);
  if (!sourcesMatch) {
    return { text: raw.trim(), citations: [] };
  }

  const text = raw.slice(0, raw.indexOf("<sources>")).trim();
  let citations: Citation[] = [];

  try {
    const parsed = JSON.parse(sourcesMatch[1]);
    if (Array.isArray(parsed)) {
      citations = parsed.filter(
        (c: unknown): c is Citation =>
          typeof c === "object" &&
          c !== null &&
          "docId" in c &&
          "title" in c &&
          "quote" in c
      );
    }
  } catch {
    // Graceful degradation: no citations if parsing fails
  }

  return { text, citations };
}
