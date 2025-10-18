import {
  HarEntry,
  getMatchCategories,
  MatchCategory,
} from "@/components/utils/har-utils";

interface MatchSummaryPillsProps {
  entries: HarEntry[];
  searchQuery: string;
  className?: string;
}

interface CategoryCount {
  category: MatchCategory;
  count: number;
  label: string;
  color: string;
}

/**
 * Displays pill-shaped badges showing the count of matches by category.
 * Helps users understand where their search matches are located.
 */
export default function MatchSummaryPills({
  entries,
  searchQuery,
  className = "",
}: MatchSummaryPillsProps) {
  if (!searchQuery) {
    return null;
  }

  // Count matches by category
  const categoryCounts: Record<MatchCategory, number> = {
    url: 0,
    headers: 0,
    request: 0,
    response: 0,
  };

  entries.forEach((entry) => {
    const matchInfo = getMatchCategories(entry, searchQuery);
    matchInfo.categories.forEach((category) => {
      categoryCounts[category]++;
    });
  });

  // Build display data
  const categoryData: CategoryCount[] = [
    {
      category: "url",
      count: categoryCounts.url,
      label: "URLs",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
    {
      category: "headers",
      count: categoryCounts.headers,
      label: "Headers",
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    },
    {
      category: "request",
      count: categoryCounts.request,
      label: "Requests",
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    },
    {
      category: "response",
      count: categoryCounts.response,
      label: "Responses",
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    },
  ];

  // Filter out categories with no matches
  const activeCategories = categoryData.filter((cat) => cat.count > 0);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeCategories.map((cat) => (
        <div
          key={cat.category}
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cat.color}`}
        >
          {cat.label}: {cat.count}
        </div>
      ))}
    </div>
  );
}
