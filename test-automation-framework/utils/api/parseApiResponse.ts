import { APIResponse } from "@playwright/test";

export async function parseJsonWithFallback(
  response: APIResponse
): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Expected valid JSON response body, but parsing failed: ${String(error)}`);
  }
}
