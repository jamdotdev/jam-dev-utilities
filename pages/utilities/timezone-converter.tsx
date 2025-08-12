import { useState } from "react";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import PageHeader from "@/components/PageHeader";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import CallToActionGrid from "@/components/CallToActionGrid";
import TimestampConverterSEO from "@/components/seo/TimestampConverterSEO";

const timezones = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "America/Los_Angeles",
];

function convertTime(inputTime: string, fromTz: string, toTz: string): string {
  if (!inputTime) return "";
  const match = inputTime.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return "Invalid time format";
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);
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

  let date: Date;
  if (fromTz === "UTC") {
    date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  } else {
    const inputIso = `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00`;
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
          .formatToParts(new Date(inputIso))
          .map((p) => p.value)
          .join("")
      ).toISOString()
    );
    date = new Date(utcMillis);
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: toTz,
  });
  const parts = formatter.formatToParts(date);
  const yearPart = parts.find((p) => p.type === "year");
  const monthPart = parts.find((p) => p.type === "month");
  const dayPart = parts.find((p) => p.type === "day");
  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");
  if (!yearPart || !monthPart || !dayPart || !hourPart || !minutePart)
    return "Conversion error";
  let hourOut = hourPart.value;
  if (hourOut === "24") hourOut = "00";
  return `${yearPart.value}:${monthPart.value}:${dayPart.value} ${hourOut}:${minutePart.value}`;
}

export default function TimezoneComparer() {
  const userTz =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const getDefaultInputTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}:${mm}:${dd} ${hh}:${min}`;
  };

  const [fromTz, setFromTz] = useState(userTz);
  const [toTz, setToTz] = useState("UTC");
  const [inputTime, setInputTime] = useState(getDefaultInputTime());
  const [outputTime, setOutputTime] = useState("");

  const handleConvert = () => {
    setOutputTime(convertTime(inputTime, fromTz, toTz));
  };

  return (
    <main>
      <Meta
        title="Timezone Comparer | Free, Open Source & Ad-free"
        description="Compare times between two timezones instantly. Enter a time in one timezone and see the equivalent in another."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Timezone Comparer"
          description="Select two timezones and compare times"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="mb-4">
            <Label>From Timezone</Label>
            <select
              className="mb-2 w-full border rounded p-2"
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <Label>To Timezone</Label>
            <select
              className="mb-2 w-full border rounded p-2"
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <Label>Time in From Timezone (YYYY:MM:DD HH:MM)</Label>
            <input
              className="mb-4 w-full border rounded p-2 font-mono"
              type="text"
              placeholder="YYYY:MM:DD HH:MM"
              pattern="^\d{4}:\d{2}:\d{2} \d{2}:\d{2}$"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              maxLength={16}
            />{" "}
            <Button variant="outline" onClick={handleConvert}>
              Convert
            </Button>
          </div>
          <div>
            <Label>Time in To Timezone</Label>
            <input
              className="w-full border rounded p-2 font-mono"
              type="text"
              value={outputTime}
              readOnly
            />
          </div>
        </Card>
      </section>
      <section className="container max-w-2xl">
        <TimestampConverterSEO />
      </section>
      <CallToActionGrid />
    </main>
  );
}
