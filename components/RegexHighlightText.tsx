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

  props.matches.forEach((match, index) => {
    const offset = props.text.indexOf(match, lastIndex);

    if (offset > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}-${offset}`}>
          {props.text.slice(lastIndex, offset)}
        </span>
      );
    }

    parts.push(
      <span key={`match-${offset}-${index}`} className="bg-blue-200/80">
        {match === "\n" ? newLine : match}
      </span>
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
