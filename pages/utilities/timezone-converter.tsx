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

// Minimal timezone list for demo; replace with a full list or use a package for production
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

function convertTime(
  inputTime: string,
  fromTz: string,
  toTz: string
): string {
  if (!inputTime) return "";
  // Parse input as "HH:mm"
  const [hours, minutes] = inputTime.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  )
    return "Invalid time format";

  // Today's date in UTC
  const now = new Date();
  // Create a UTC date at the given time
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hours,
    minutes
  ));

  // Use Intl.DateTimeFormat to get the time in the target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: toTz,
  });
  const parts = formatter.formatToParts(utcDate);
  const hourPart = parts.find(p => p.type === "hour");
  const minutePart = parts.find(p => p.type === "minute");
  if (!hourPart || !minutePart) return "Conversion error";
  let hourStr = hourPart.value;
  // handle midnight (24:xx -> 00:xx)
  if (hourStr === "24") hourStr = "00";
  return `${hourStr}:${minutePart.value}`;
}

export default function TimezoneComparer() {
  const userTz =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";
  const [fromTz, setFromTz] = useState(userTz);
  const [toTz, setToTz] = useState("UTC");
  const [inputTime, setInputTime] = useState("");
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
            <Label>Time in From Timezone (24-hour format)</Label>
            <input
              className="mb-4 w-full border rounded p-2 font-mono"
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
            />
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
