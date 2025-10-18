interface SearchHighlightTextProps {
  text: string;
  searchQuery: string;
  className?: string;
}

/**
 * Component to highlight search matches in text, similar to Chrome's Cmd+F functionality.
 * Matches are highlighted with a yellow background.
 */
export default function SearchHighlightText({
  text,
  searchQuery,
  className = "",
}: SearchHighlightTextProps) {
  if (!searchQuery || !text) {
    return <span className={className}>{text}</span>;
  }

  const parts: JSX.Element[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = searchQuery.toLowerCase();
  
  let lastIndex = 0;
  let currentIndex = 0;

  while ((currentIndex = lowerText.indexOf(lowerQuery, lastIndex)) !== -1) {
    // Add text before match
    if (currentIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, currentIndex)}
        </span>
      );
    }

    // Add highlighted match
    parts.push(
      <mark
        key={`match-${currentIndex}`}
        className="bg-yellow-300 dark:bg-yellow-600 dark:text-black rounded px-0.5"
      >
        {text.slice(currentIndex, currentIndex + lowerQuery.length)}
      </mark>
    );

    lastIndex = currentIndex + lowerQuery.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>
    );
  }

  return <span className={className}>{parts}</span>;
}
