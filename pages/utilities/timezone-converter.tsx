import { useCallback, useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import TimezoneConverterSEO from "@/components/seo/TimezoneConverterSEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import {
  commonTimezones,
  convertTime,
  formatTimeForInput,
  formatDateForInput,
} from "@/components/utils/timezone-converter.utils";

export default function TimezoneConverter() {
  const [sourceTimezone, setSourceTimezone] = useState("America/New_York");
  const [sourceTime, setSourceTime] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(
    commonTimezones.map((tz) => tz.id)
  );
  const [convertedTimes, setConvertedTimes] = useState<
    { timezone: string; label: string; time: string; date: string }[]
  >([]);
  const { buttonText, handleCopy } = useCopyToClipboard();

  useEffect(() => {
    const now = new Date();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchingTz = commonTimezones.find((tz) => tz.id === userTimezone);
    if (matchingTz) {
      setSourceTimezone(userTimezone);
    }
    setSourceTime(formatTimeForInput(now, userTimezone));
    setSourceDate(formatDateForInput(now, userTimezone));
  }, []);

  useEffect(() => {
    if (sourceTime && sourceDate) {
      const results = convertTime(
        sourceTime,
        sourceDate,
        sourceTimezone,
        selectedTimezones
      );
      setConvertedTimes(results);
    }
  }, [sourceTime, sourceDate, sourceTimezone, selectedTimezones]);

  const handleTimezoneToggle = useCallback((timezoneId: string) => {
    setSelectedTimezones((prev) =>
      prev.includes(timezoneId)
        ? prev.filter((tz) => tz !== timezoneId)
        : [...prev, timezoneId]
    );
  }, []);

  const handleCopyAll = useCallback(() => {
    const text = convertedTimes
      .map((ct) => `${ct.label}: ${ct.time} (${ct.date})`)
      .join("\n");
    handleCopy(text);
  }, [convertedTimes, handleCopy]);

  const getSourceTimezoneLabel = () => {
    const tz = commonTimezones.find((t) => t.id === sourceTimezone);
    return tz?.label || sourceTimezone;
  };

  return (
    <main>
      <Meta
        title="Timezone Converter | Free, Open Source & Ad-free"
        description="Convert times between timezones for remote team scheduling. Perfect for distributed software teams coordinating across multiple timezones. Free, open source, and ad-free."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Timezone Converter"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="mb-6">
            <Label className="mb-2 block">Source Timezone</Label>
            <select
              value={sourceTimezone}
              onChange={(e) => setSourceTimezone(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {commonTimezones.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="mb-2 block">Time</Label>
              <Input
                type="time"
                value={sourceTime}
                onChange={(e) => setSourceTime(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Date</Label>
              <Input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <Label className="mb-2 block">Show Timezones</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonTimezones.map((tz) => (
                <div key={tz.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tz.id}
                    checked={selectedTimezones.includes(tz.id)}
                    onCheckedChange={() => handleTimezoneToggle(tz.id)}
                  />
                  <label
                    htmlFor={tz.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {tz.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {convertedTimes.length > 0 && (
            <div className="mb-4">
              <Label className="mb-2 block">
                Converted Times ({getSourceTimezoneLabel()} {sourceTime})
              </Label>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                {convertedTimes.map((ct) => (
                  <div
                    key={ct.timezone}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="font-medium text-sm">{ct.label}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm">{ct.time}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {ct.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleCopyAll}>
            {buttonText}
          </Button>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <TimezoneConverterSEO />
      </section>
    </main>
  );
}
