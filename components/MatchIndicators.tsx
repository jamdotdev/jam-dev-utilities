import { MatchCategory } from "@/components/utils/har-utils";

interface MatchIndicatorsProps {
  categories: MatchCategory[];
  className?: string;
}

/**
 * Displays colored dots to indicate which parts of an entry matched the search.
 * Similar to iOS notification indicators.
 * 
 * Color scheme:
 * - Blue: URL match
 * - Purple: Headers match
 * - Orange: Request payload match
 * - Green: Response content match
 */
export default function MatchIndicators({
  categories,
  className = "",
}: MatchIndicatorsProps) {
  if (categories.length === 0) {
    return null;
  }

  const getCategoryColor = (category: MatchCategory): string => {
    switch (category) {
      case "url":
        return "bg-blue-500";
      case "headers":
        return "bg-purple-500";
      case "request":
        return "bg-orange-500";
      case "response":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryTitle = (category: MatchCategory): string => {
    switch (category) {
      case "url":
        return "Match in URL";
      case "headers":
        return "Match in headers";
      case "request":
        return "Match in request payload";
      case "response":
        return "Match in response content";
      default:
        return "Match found";
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {categories.map((category) => (
        <div
          key={category}
          className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`}
          title={getCategoryTitle(category)}
        />
      ))}
    </div>
  );
}
