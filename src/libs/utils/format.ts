const numberFormatter = new Intl.NumberFormat("en-US");
const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `1234` → `"1,234"`; missing → `"0"`. */
export function formatNumber(value?: number | null) {
  return numberFormatter.format(value ?? 0);
}

/** `"1234.5"` → `"Tk 1,234.50"`; missing / invalid → `"Tk 0.00"`. */
export function formatMoney(value?: string | number | null) {
  const numericValue = Number(value ?? 0);
  return `Tk ${moneyFormatter.format(Number.isNaN(numericValue) ? 0 : numericValue)}`;
}

/* ------------------------------------------------------------------ */
/* Dates & times — one app-wide style: `7 July 2026`, `03:52 AM`,      */
/* `7 July 2026 03:52 AM`. Built by hand so it never varies by browser. */
/* ------------------------------------------------------------------ */

type DateInput = string | number | Date | null | undefined;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Parse API values into a local `Date`:
 * - ISO timestamps (`2026-07-07T03:52:00Z`) → converted to the viewer's time zone
 * - date-only (`2026-07-07`) → that calendar day (no UTC shift)
 * - time-only (`14:30` / `14:30:00`) → today's date at that time
 * Returns `null` for empty or unparseable values.
 */
export function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = value.trim();
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const timeOnly = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (timeOnly) {
    const date = new Date();
    date.setHours(Number(timeOnly[1]), Number(timeOnly[2]), Number(timeOnly[3] ?? 0), 0);
    return date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function datePart(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function timePart(date: Date) {
  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

/** Local calendar date for `<input type="date">` values, e.g. `"2026-07-07"`. */
export function formatDateForInput(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

/** Date only → `"7 July 2026"`. Empty → `fallback`; unparseable → the original text. */
export function formatDate(value?: DateInput, fallback = "N/A") {
  const date = parseDate(value);
  return date ? datePart(date) : value ? String(value) : fallback;
}

/** Time only → `"03:52 AM"` (also accepts `"14:30:00"` class times). Empty → `fallback`. */
export function formatTime(value?: DateInput, fallback = "N/A") {
  const date = parseDate(value);
  return date ? timePart(date) : value ? String(value) : fallback;
}

/** Date + time → `"7 July 2026 03:52 AM"`. Empty → `fallback`. */
export function formatDateTime(value?: DateInput, fallback = "N/A") {
  const date = parseDate(value);
  return date ? `${datePart(date)} ${timePart(date)}` : value ? String(value) : fallback;
}

/** `"ONGOING"` / `"in_progress"` → `"Ongoing"` / `"In Progress"`. */
export function formatStatus(value?: string | null, fallback = "N/A") {
  if (!value) {
    return fallback;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** `"bkash"` → `"Bkash"`. */
export function capitalize(value?: string | null, fallback = "N/A") {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : fallback;
}

/** `about_course` / `working_summary` may be a string or JSON object. */
export function formatRichValue(value?: string | Record<string, unknown> | null) {
  if (typeof value === "string") {
    return value;
  }

  if (!value) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

/** First letter for avatar placeholders. */
export function initialOf(value?: string | null, fallback = "U") {
  return value?.trim().charAt(0).toUpperCase() || fallback;
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
] as const;

export const BATCH_STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
] as const;
