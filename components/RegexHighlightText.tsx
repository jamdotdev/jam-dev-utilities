import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RegexHighlightTextProps {
  text: string;
  matches: string[];
}

export default function RegexHighlightText(props: RegexHighlightTextProps) {
  if (!props.matches || props.matches.length === 0) {
    return <pre className="whitespace-pre-wrap break-words">{props.text}</pre>;
  }

  const parts: JSX.Element[] = [];
  const newLine = (
    <>
      ↵<br />
    </>
  );

  let lastIndex = 0;
  let matchNumber = 0;

  props.matches.forEach((match, index) => {
    const offset = props.text.indexOf(match, lastIndex);

    if (offset > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}-${offset}`}>
          {props.text.slice(lastIndex, offset)}
        </span>
      );
    }

    matchNumber++;
    const currentMatchNumber = matchNumber;
    const matchLength = match.length;
    const startPos = offset;
    const endPos = offset + matchLength;

    parts.push(
      <HoverCard
        key={`match-${offset}-${index}`}
        openDelay={100}
        closeDelay={100}
      >
        <HoverCardTrigger asChild>
          <span className="bg-blue-200/80 dark:bg-blue-700/60 hover:bg-blue-300 dark:hover:bg-blue-600 cursor-help transition-colors rounded-sm">
            {match === "\n" ? newLine : match}
          </span>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-auto max-w-xs p-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Match #{currentMatchNumber}</p>
            <p className="text-xs text-muted-foreground">
              Position: <span className="font-mono">{startPos}</span> -{" "}
              <span className="font-mono">{endPos}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Length: <span className="font-mono">{matchLength}</span> character
              {matchLength !== 1 ? "s" : ""}
            </p>
            {match.length <= 50 && (
              <p className="text-xs font-mono bg-muted px-1 py-0.5 rounded mt-1">
                &quot;{match === "\n" ? "\\n" : match}&quot;
              </p>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );

    lastIndex = offset + match.length;
  });

  if (lastIndex < props.text.length) {
    parts.push(
      <span key={`text-${lastIndex}-${props.text.length}`}>
        {props.text.slice(lastIndex)}
      </span>
    );
  }

  return <pre className="whitespace-pre-wrap break-words">{parts}</pre>;
}
