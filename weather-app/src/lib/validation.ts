// ─────────────────────────────────────────────
// Input validation utilities
// ─────────────────────────────────────────────

/**
 * Validate and sanitize a location string.
 * Returns an error message if invalid, null if valid.
 */
export function validateLocation(location: unknown): string | null {
  if (!location || typeof location !== "string") {
    return "Location is required";
  }

  const trimmed = location.trim();

  if (trimmed.length === 0) {
    return "Location cannot be empty";
  }

  if (trimmed.length > 200) {
    return "Location is too long (max 200 characters)";
  }

  // Block obviously malicious input
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    return "Invalid location input";
  }

  return null;
}

/**
 * Validate a date range.
 * Returns an error message if invalid, null if valid.
 */
export function validateDateRange(
  startDate: unknown,
  endDate: unknown
): string | null {
  if (!startDate || !endDate) {
    return "Both start date and end date are required";
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (isNaN(start.getTime())) {
    return "Invalid start date";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end date";
  }

  if (start > end) {
    return "Start date must be before end date";
  }

  // Max range: 30 days (to avoid burning API quota)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 30) {
    return "Date range cannot exceed 30 days";
  }

  // Historical limit: OpenWeatherMap free tier goes back ~5 days
  // One Call 3.0 goes back further but requires paid plan
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  // Future limit: forecast only goes 5 days ahead
  const fiveDaysAhead = new Date();
  fiveDaysAhead.setDate(fiveDaysAhead.getDate() + 5);

  return null;
}

/**
 * Sanitize a string for safe use in queries / display
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate a database record ID (cuid format)
 */
export function validateId(id: unknown): string | null {
  if (!id || typeof id !== "string") {
    return "Invalid ID";
  }
  // cuid starts with 'c' and is ~25 chars, or standard alphanumeric
  if (!/^[a-z0-9_-]{1,50}$/i.test(id)) {
    return "Invalid ID format";
  }
  return null;
}
