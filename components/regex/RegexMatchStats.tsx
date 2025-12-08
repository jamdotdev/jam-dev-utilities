import { useMemo } from "react";
import {
  getMatchStats,
  MatchStats,
} from "@/components/utils/regex-tester.utils";

interface RegexMatchStatsProps {
  pattern: string;
  testString: string;
}

export default function RegexMatchStats({
  pattern,
  testString,
}: RegexMatchStatsProps) {
  const stats: MatchStats | null = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      return getMatchStats(pattern, testString);
    } catch {
      return null;
    }
  }, [pattern, testString]);

  if (!stats) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Enter pattern and test string to see statistics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        label="Total Matches"
        value={stats.totalMatches.toString()}
        highlight={stats.totalMatches > 0}
      />
      <StatCard label="Unique Matches" value={stats.uniqueMatches.toString()} />
      <StatCard
        label="Avg. Length"
        value={stats.averageMatchLength.toFixed(1)}
      />
      <StatCard
        label="Exec Time"
        value={`${stats.executionTime.toFixed(2)}ms`}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted border border-border">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-green-600 dark:text-green-400" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
