export interface TimezoneInfo {
  id: string;
  label: string;
  offset: string;
}

export const commonTimezones: TimezoneInfo[] = [
  { id: "America/Los_Angeles", label: "Los Angeles (PT)", offset: "" },
  { id: "America/Denver", label: "Denver (MT)", offset: "" },
  { id: "America/Chicago", label: "Chicago (CT)", offset: "" },
  { id: "America/New_York", label: "New York (ET)", offset: "" },
  { id: "America/Sao_Paulo", label: "Sao Paulo (BRT)", offset: "" },
  { id: "Europe/London", label: "London (GMT/BST)", offset: "" },
  { id: "Europe/Paris", label: "Paris (CET)", offset: "" },
  { id: "Europe/Berlin", label: "Berlin (CET)", offset: "" },
  { id: "Asia/Dubai", label: "Dubai (GST)", offset: "" },
  { id: "Asia/Kolkata", label: "India (IST)", offset: "" },
  { id: "Asia/Singapore", label: "Singapore (SGT)", offset: "" },
  { id: "Asia/Tokyo", label: "Tokyo (JST)", offset: "" },
  { id: "Australia/Sydney", label: "Sydney (AEST)", offset: "" },
];

export function getTimezoneOffset(timezone: string, date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");
  return offsetPart?.value || "";
}

export function convertTime(
  sourceTime: string,
  sourceDate: string,
  sourceTimezone: string,
  targetTimezones: string[]
): { timezone: string; label: string; time: string; date: string }[] {
  if (!sourceTime || !sourceDate) {
    return [];
  }

  const [hours, minutes] = sourceTime.split(":").map(Number);
  const [year, month, day] = sourceDate.split("-").map(Number);

  const sourceFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: sourceTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const tempDate = new Date(year, month - 1, day, hours, minutes);
  const sourceParts = sourceFormatter.formatToParts(tempDate);

  const getPartValue = (
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes
  ) => parts.find((p) => p.type === type)?.value || "";

  const sourceYear = parseInt(getPartValue(sourceParts, "year"));
  const sourceMonth = parseInt(getPartValue(sourceParts, "month"));
  const sourceDay = parseInt(getPartValue(sourceParts, "day"));
  const sourceHour = parseInt(getPartValue(sourceParts, "hour"));
  const sourceMinute = parseInt(getPartValue(sourceParts, "minute"));

  const utcDate = new Date(
    Date.UTC(sourceYear, sourceMonth - 1, sourceDay, sourceHour, sourceMinute)
  );

  const sourceOffset = getTimezoneOffsetMinutes(sourceTimezone, utcDate);
  utcDate.setMinutes(utcDate.getMinutes() - sourceOffset);

  return targetTimezones.map((tz) => {
    const tzInfo = commonTimezones.find((t) => t.id === tz);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const formatted = formatter.format(utcDate);
    const parts = formatted.split(", ");
    const weekday = parts[0];
    const datePart = parts[1];
    const timePart = parts[2];

    return {
      timezone: tz,
      label: tzInfo?.label || tz,
      time: timePart,
      date: `${weekday}, ${datePart}`,
    };
  });
}

function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

export function getCurrentTimeInTimezone(timezone: string): {
  time: string;
  date: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formatted = formatter.format(now);
  const parts = formatted.split(", ");
  const weekday = parts[0];
  const datePart = parts[1];
  const timePart = parts[2];

  return {
    time: timePart,
    date: `${weekday}, ${datePart}`,
  };
}

export function formatTimeForInput(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
}

export function formatDateForInput(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}
