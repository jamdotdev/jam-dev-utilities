import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceBadgeProps {
  passed: boolean;
  level: string;
}

export function ComplianceBadge({ passed, level }: ComplianceBadgeProps) {
  const Icon = passed ? CheckCircle2 : XCircle;
  const statusClasses = passed
    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
        statusClasses
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{level}</span>
    </div>
  );
}
