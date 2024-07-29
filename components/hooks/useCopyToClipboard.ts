import { useState, useCallback, useEffect } from "react";

export const useCopyToClipboard = (initialText = "Copy") => {
  const [buttonText, setButtonText] = useState(initialText);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setButtonText("Copied!");
        const id = setTimeout(() => setButtonText(initialText), 1200);
        setTimeoutId(id);
      });
    },
    [initialText]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { buttonText, handleCopy };
};
