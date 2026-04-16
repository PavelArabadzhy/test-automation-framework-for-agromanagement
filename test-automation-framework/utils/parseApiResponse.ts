import { APIResponse } from "@playwright/test";

function extractNumberField(raw: string, field: string): number | undefined {
  const match = raw.match(new RegExp(`"${field}"\\s*:\\s*(\\d+)`));
  return match ? Number(match[1]) : undefined;
}

function extractStringField(raw: string, field: string): string | undefined {
  const match = raw.match(new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`));
  return match ? match[1] : undefined;
}

export async function parseJsonWithFallback(
  response: APIResponse
): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    const raw = await response.text();
    return {
      id: extractNumberField(raw, "id"),
      name: extractStringField(raw, "name"),
      location: extractStringField(raw, "location"),
      harvestDate: extractStringField(raw, "harvestDate")
    };
  }
}
