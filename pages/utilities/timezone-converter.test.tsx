// Minimal test runner for convertTime

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TimezoneComparer from "./timezone-converter";

// Updated convertTime for new input format and output
function convertTime(inputTime: string, fromTz: string, toTz: string): string {
  if (!inputTime) return "";
  const match = inputTime.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return "Invalid time format";
  const [, year, month, day, hours, minutes] = match.map(Number);
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  )
    return "Invalid time format";
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  const utcMillis = Date.parse(
    new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: fromTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .formatToParts(new Date(dateStr))
        .map((p) => p.value)
        .join("")
    ).toISOString()
  );
  const dateInFromTz = new Date(utcMillis);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: toTz,
  });
  const parts = formatter.formatToParts(dateInFromTz);
  const yearPart = parts.find((p) => p.type === "year");
  const monthPart = parts.find((p) => p.type === "month");
  const dayPart = parts.find((p) => p.type === "day");
  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");
  if (!yearPart || !monthPart || !dayPart || !hourPart || !minutePart) return "Conversion error";
  let hourStr = hourPart.value;
  if (hourStr === "24") hourStr = "00";
  return `${yearPart.value}:${monthPart.value}:${dayPart.value} ${hourStr}:${minutePart.value}`;
}

describe("convertTime", () => {
  test("UTC to UTC, same time and date", () => {
    expect(convertTime("2024:06:01 12:00", "UTC", "UTC")).toBe("2024:06:01 12:00");
  });

  test("UTC to New York, date and time format", () => {
    const nyTime = convertTime("2024:06:01 12:00", "UTC", "America/New_York");
    expect(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}$/.test(nyTime)).toBe(true);
  });

  test("New York to Tokyo, date and time format", () => {
    const tokyoTime = convertTime("2024:06:01 08:00", "America/New_York", "Asia/Tokyo");
    expect(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}$/.test(tokyoTime)).toBe(true);
  });

  test("Invalid hour", () => {
    expect(convertTime("2024:06:01 25:00", "UTC", "UTC")).toBe("Invalid time format");
  });

  test("Invalid minute", () => {
    expect(convertTime("2024:06:01 12:60", "UTC", "UTC")).toBe("Invalid time format");
  });

  test("Invalid date", () => {
    expect(convertTime("2024:13:01 12:00", "UTC", "UTC")).toBe("Invalid time format");
    expect(convertTime("2024:06:32 12:00", "UTC", "UTC")).toBe("Invalid time format");
  });

  test("Empty input", () => {
    expect(convertTime("", "UTC", "UTC")).toBe("");
  });

  test("UTC midnight to Tokyo, date and time format", () => {
    const tokyoTime = convertTime("2024:06:01 00:00", "UTC", "Asia/Tokyo");
    expect(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}$/.test(tokyoTime)).toBe(true);
  });

  test("Handles leap year", () => {
    expect(convertTime("2024:02:29 12:00", "UTC", "UTC")).toBe("2024:02:29 12:00");
  });

  test("Handles single digit months and days", () => {
    expect(convertTime("2024:01:09 09:05", "UTC", "UTC")).toBe("2024:01:09 09:05");
  });

  test("Invalid format", () => {
    expect(convertTime("2024-06-01 12:00", "UTC", "UTC")).toBe("Invalid time format");
    expect(convertTime("12:00", "UTC", "UTC")).toBe("Invalid time format");
  });
});