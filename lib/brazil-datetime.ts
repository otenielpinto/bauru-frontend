/**
 * Brazil DateTime Utilities
 *
 * A collection of utilities for handling dates and times in Brazilian timezone (UTC-3)
 * and formatting them according to Brazilian standards.
 *
 * @author GitHub Copilot
 * @version 1.0.0
 */

// Constants
const BRAZIL_TIMEZONE_OFFSET = -3; // UTC-3 in hours
const BRAZIL_TIMEZONE_OFFSET_MINUTES = BRAZIL_TIMEZONE_OFFSET * 60; // Convert to minutes

// Types for better type safety
export type DateInput = string | Date | undefined;
export type DateFormat =
  | "DD/MM/YYYY"
  | "DD/MM/YYYY HH:mm:ss"
  | "YYYY-MM-DD"
  | "ISO";

/**
 * Get current date and time in Brazil timezone (UTC-3)
 *
 * Handles multiple input formats:
 * - YYYY-MM-DD (ISO date format)
 * - DD/MM/YYYY (Brazilian date format)
 * - ISO string or other parseable date formats
 * - Date objects
 *
 * @param inputDate Optional input date string or Date object
 * @returns Date object adjusted to Brazil timezone
 *
 * @example
 * ```typescript
 * const now = getBrazilDateTime(); // Current time in Brazil timezone
 * const specificDate = getBrazilDateTime('2025-05-27'); // Convert specific date
 * const fromBrazilFormat = getBrazilDateTime('27/05/2025'); // From Brazilian format
 * ```
 */
export function getBrazilDateTime(inputDate?: DateInput): Date {
  let targetDate: Date;

  if (inputDate) {
    if (typeof inputDate === "string") {
      targetDate = parseStringDate(inputDate);
    } else {
      targetDate = new Date(inputDate);
    }
  } else {
    targetDate = new Date();
  }

  // Validate the parsed date
  if (isNaN(targetDate.getTime())) {
    throw new Error(`Invalid date provided: ${inputDate}`);
  }

  // Adjust to Brazil timezone (UTC-3)
  const utc = targetDate.getTime() + targetDate.getTimezoneOffset() * 60000;
  const brazilTime = new Date(utc + BRAZIL_TIMEZONE_OFFSET_MINUTES * 60000);

  return brazilTime;
}

/**
 * Parse string dates in various formats
 * @param dateString String representation of a date
 * @returns Parsed Date object
 * @private
 */
function parseStringDate(dateString: string): Date {
  // Handle YYYY-MM-DD format
  if (dateString.includes("-") && dateString.length === 10) {
    const [year, month, day] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Handle DD/MM/YYYY format
  if (dateString.includes("/")) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  // Try to parse as ISO string or other formats
  return new Date(dateString);
}

/**
 * Format date to DD/MM/YYYY HH:mm:ss format (Brazilian standard)
 *
 * @param date Date object to format
 * @returns Formatted date string in Brazilian format
 *
 * @example
 * ```typescript
 * const date = new Date();
 * const formatted = formatDateTimeBrazil(date); // "27/05/2025 14:30:45"
 * ```
 */
export function formatDateTimeBrazil(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided for formatting");
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date to DD/MM/YYYY format (Brazilian date only)
 *
 * @param date Date object to format
 * @returns Formatted date string in Brazilian format without time
 *
 * @example
 * ```typescript
 * const date = new Date();
 * const formatted = formatDateBrazil(date); // "27/05/2025"
 * ```
 */
export function formatDateBrazil(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided for formatting");
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date according to specified format
 *
 * @param date Date object to format
 * @param format Format type to use
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * const date = new Date();
 * const brazilDateTime = formatDate(date, 'DD/MM/YYYY HH:mm:ss'); // "27/05/2025 14:30:45"
 * const brazilDate = formatDate(date, 'DD/MM/YYYY'); // "27/05/2025"
 * const isoDate = formatDate(date, 'YYYY-MM-DD'); // "2025-05-27"
 * const isoString = formatDate(date, 'ISO'); // "2025-05-27T14:30:45.123Z"
 * ```
 */
export function formatDate(date: Date, format: DateFormat): string {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided for formatting");
  }

  switch (format) {
    case "DD/MM/YYYY HH:mm:ss":
      return formatDateTimeBrazil(date);
    case "DD/MM/YYYY":
      return formatDateBrazil(date);
    case "YYYY-MM-DD":
      return formatDateISO(date);
    case "ISO":
      return date.toISOString();
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Format date to YYYY-MM-DD format (ISO date format)
 *
 * @param date Date object to format
 * @returns Formatted date string in ISO format
 *
 * @example
 * ```typescript
 * const date = new Date();
 * const formatted = formatDateISO(date); // "2025-05-27"
 * ```
 */
export function formatDateISO(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided for formatting");
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Get current Brazil date and time with formatted versions
 *
 * @returns Object with Date object and pre-formatted strings
 *
 * @example
 * ```typescript
 * const { date, formatted, dateOnly, isoDate } = getCurrentBrazilDateTime();
 * console.log(formatted); // "27/05/2025 14:30:45"
 * console.log(dateOnly); // "27/05/2025"
 * console.log(isoDate); // "2025-05-27"
 * ```
 */
export function getCurrentBrazilDateTime() {
  const date = getBrazilDateTime();

  return {
    date,
    formatted: formatDateTimeBrazil(date),
    dateOnly: formatDateBrazil(date),
    isoDate: formatDateISO(date),
    isoString: date.toISOString(),
  };
}

/**
 * Parse Brazilian date string (DD/MM/YYYY) to Date object
 *
 * @param dateString Brazilian date string
 * @returns Date object
 *
 * @example
 * ```typescript
 * const date = parseBrazilDate("27/05/2025"); // Date object for May 27, 2025
 * ```
 */
export function parseBrazilDate(dateString: string): Date {
  const parts = dateString.split("/");

  if (parts.length !== 3) {
    throw new Error(
      `Invalid Brazilian date format. Expected DD/MM/YYYY, got: ${dateString}`
    );
  }

  const [day, month, year] = parts.map(Number);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(`Invalid date values in: ${dateString}`);
  }

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000) {
    throw new Error(`Invalid date values in: ${dateString}`);
  }

  return new Date(year, month - 1, day);
}

/**
 * Convert ISO date string (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
 *
 * @param isoDate ISO date string
 * @returns Brazilian formatted date string
 *
 * @example
 * ```typescript
 * const brazilDate = convertISOToBrazilDate("2025-05-27"); // "27/05/2025"
 * ```
 */
export function convertISOToBrazilDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) {
    throw new Error(
      `Invalid ISO date format. Expected YYYY-MM-DD, got: ${isoDate}`
    );
  }

  return `${day}/${month}/${year}`;
}

/**
 * Convert Brazilian date string (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 *
 * @param brazilDate Brazilian date string
 * @returns ISO formatted date string
 *
 * @example
 * ```typescript
 * const isoDate = convertBrazilToISODate("27/05/2025"); // "2025-05-27"
 * ```
 */
export function convertBrazilToISODate(brazilDate: string): string {
  const [day, month, year] = brazilDate.split("/");

  if (!day || !month || !year) {
    throw new Error(
      `Invalid Brazilian date format. Expected DD/MM/YYYY, got: ${brazilDate}`
    );
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Check if a date string is in Brazilian format (DD/MM/YYYY)
 *
 * @param dateString Date string to check
 * @returns Boolean indicating if the string matches Brazilian format
 *
 * @example
 * ```typescript
 * const isBrazil = isBrazilDateFormat("27/05/2025"); // true
 * const isNotBrazil = isBrazilDateFormat("2025-05-27"); // false
 * ```
 */
export function isBrazilDateFormat(dateString: string): boolean {
  const brazilDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return brazilDateRegex.test(dateString);
}

/**
 * Check if a date string is in ISO format (YYYY-MM-DD)
 *
 * @param dateString Date string to check
 * @returns Boolean indicating if the string matches ISO format
 *
 * @example
 * ```typescript
 * const isISO = isISODateFormat("2025-05-27"); // true
 * const isNotISO = isISODateFormat("27/05/2025"); // false
 * ```
 */
export function isISODateFormat(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return isoDateRegex.test(dateString);
}

// Export constants for external use
export const BRAZIL_CONSTANTS = {
  TIMEZONE_OFFSET: BRAZIL_TIMEZONE_OFFSET,
  TIMEZONE_OFFSET_MINUTES: BRAZIL_TIMEZONE_OFFSET_MINUTES,
  DATE_FORMAT: "DD/MM/YYYY" as const,
  DATETIME_FORMAT: "DD/MM/YYYY HH:mm:ss" as const,
  ISO_DATE_FORMAT: "YYYY-MM-DD" as const,
} as const;
