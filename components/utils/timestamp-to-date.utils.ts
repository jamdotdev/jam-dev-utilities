export function formatOutput(input: string): string {
  const trimmedInput = input.trim();
  
  // Try to detect the input format and convert accordingly
  if (isTimestamp(trimmedInput)) {
    return convertTimestampToDate(trimmedInput);
  } else if (isDateString(trimmedInput)) {
    return convertDateToTimestamp(trimmedInput);
  } else {
    throw new Error("Invalid input format. Please enter a Unix timestamp (seconds/milliseconds) or ISO date string.");
  }
}

function isTimestamp(input: string): boolean {
  return /^\d{1,13}$/.test(input);
}

function isDateString(input: string): boolean {
  // Check for various date formats (ISO, human readable, etc.)
  const date = new Date(input);
  return !isNaN(date.getTime()) && input.length > 4 && !/^\d+$/.test(input);
}

function convertTimestampToDate(timestamp: string): string {
  let date: Date;
  let formatDetected: string;

  if (/^\d{11,13}$/.test(timestamp)) {
    date = new Date(parseInt(timestamp, 10));
    formatDetected = "milliseconds";
  } else if (/^\d{1,10}$/.test(timestamp)) {
    date = new Date(parseInt(timestamp, 10) * 1000);
    formatDetected = "seconds";
  } else {
    throw new Error("Invalid timestamp format");
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const gmtDate = formatDate(date, "UTC");
  const localDate = formatDate(date);
  const isoString = date.toISOString();
  const labelWidth = 22;

  return (
    `Input detected: Unix timestamp (${formatDetected})\n` +
    "---\n" +
    "Greenwich Mean Time:".padEnd(labelWidth) +
    `${gmtDate}\n` +
    "Your time zone:".padEnd(labelWidth) +
    `${localDate}\n` +
    "ISO 8601:".padEnd(labelWidth) +
    `${isoString}`
  );
}

function convertDateToTimestamp(dateInput: string): string {
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const timestampSeconds = Math.floor(date.getTime() / 1000);
  const timestampMilliseconds = date.getTime();
  const gmtDate = formatDate(date, "UTC");
  const localDate = formatDate(date);
  const labelWidth = 22;

  return (
    `Input detected: Date string\n` +
    "---\n" +
    "Unix timestamp (seconds):".padEnd(labelWidth) +
    `${timestampSeconds}\n` +
    "Unix timestamp (ms):".padEnd(labelWidth) +
    `${timestampMilliseconds}\n` +
    "Greenwich Mean Time:".padEnd(labelWidth) +
    `${gmtDate}\n` +
    "Your time zone:".padEnd(labelWidth) +
    `${localDate}`
  );
}

function formatDate(date: Date, timeZone: string = "local") {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timeZone === "local" ? undefined : timeZone,
    timeZoneName: "short",
  };

  let formatted = date.toLocaleString("en-US", options);
  // Fix the 24:00:00 issue by replacing with 00:00:00
  formatted = formatted.replace(/(\d{4}), 24:00:00/, "$1, 00:00:00");
  
  return formatted;
}
