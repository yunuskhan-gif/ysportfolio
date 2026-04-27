// ─── API response types ───────────────────────────────────────────────────────

/**
 * Per-day trade counts keyed by segment.
 * "TOTAL" is always present; segment keys are optional.
 *
 * Example:
 *   "2025-01-15T00:00:00.000Z": { "TOTAL": 2, "EQUITY": 1, "OPTION": 1 }
 */
export interface HeatmapDayData {
  TOTAL: number;
  EQUITY?: number;
  OPTION?: number;
  FUTURES?: number;
  FOREX?: number;
  CRYPTO?: number;
}

/** keys = ISO date strings e.g. "2025-01-15T00:00:00.000Z" */
export type HeatmapResponseData = Record<string, HeatmapDayData>;

export interface HeatmapApiResponse {
  success: boolean;
  message: string;
  data: HeatmapResponseData;
  error: Record<string, unknown>;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface HeatmapParams {
  userId: string;
  year: number;
}

// ─── Transformed shape (what react-github-calendar expects) ──────────────────

export interface HeatmapEntry {
  date: string;          // "YYYY-MM-DD"
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// ─── Segment key type ─────────────────────────────────────────────────────────

export type HeatmapSegmentKey = keyof Omit<HeatmapDayData, "TOTAL">;