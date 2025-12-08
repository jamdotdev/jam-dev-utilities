import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ds/ButtonComponent";
import {
  HistoryEntry,
  updateHistoryEntry,
  removeFromHistory,
  clearHistory,
  truncateString,
  formatTimestamp,
} from "@/components/utils/regex-history.utils";

interface RegexHistoryProps {
  history: HistoryEntry[];
  onHistoryChange: (history: HistoryEntry[]) => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function RegexHistory({
  history,
  onHistoryChange,
  onRestore,
}: RegexHistoryProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleToggleFavorite = useCallback(
    (id: string, currentFavorite: boolean) => {
      const updated = updateHistoryEntry(id, { favorite: !currentFavorite });
      onHistoryChange(updated);
    },
    [onHistoryChange]
  );

  const handleStartEditNote = useCallback((entry: HistoryEntry) => {
    setEditingNoteId(entry.id);
    setNoteValue(entry.note || "");
  }, []);

  const handleSaveNote = useCallback(
    (id: string) => {
      const updated = updateHistoryEntry(id, {
        note: noteValue.trim() || undefined,
      });
      onHistoryChange(updated);
      setEditingNoteId(null);
      setNoteValue("");
    },
    [noteValue, onHistoryChange]
  );

  const handleCancelNote = useCallback(() => {
    setEditingNoteId(null);
    setNoteValue("");
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      const updated = removeFromHistory(id);
      onHistoryChange(updated);
    },
    [onHistoryChange]
  );

  const handleClearAll = useCallback(() => {
    const updated = clearHistory();
    onHistoryChange(updated);
  }, [onHistoryChange]);

  const favorites = history.filter((h) => h.favorite);
  const regular = history.filter((h) => !h.favorite);

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground italic text-center py-8">
          No history yet. Your regex patterns will appear here as you use them.
        </div>
        <div className="text-xs text-muted-foreground text-center">
          History is saved to your browser&apos;s local storage.
        </div>
      </div>
    );
  }

  const renderEntry = (entry: HistoryEntry) => (
    <div
      key={entry.id}
      className={cn(
        "p-3 rounded-lg border transition-all",
        entry.favorite
          ? "border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20"
          : "border-border bg-muted/30 hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button
                onClick={() => onRestore(entry)}
                className="text-left w-full group"
              >
                <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {truncateString(entry.pattern, 40)}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {truncateString(entry.testString.replace(/\n/g, " "), 50)}
                </div>
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="left" className="w-80 p-3">
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Pattern
                  </div>
                  <div className="text-sm bg-muted px-2 py-1 rounded break-all">
                    {entry.pattern}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Test String
                  </div>
                  <div className="text-sm bg-muted px-2 py-1 rounded break-all max-h-20 overflow-auto">
                    {entry.testString || "(empty)"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Click to restore this pattern
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          {entry.note && editingNoteId !== entry.id && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
              {entry.note}
            </div>
          )}

          {editingNoteId === entry.id && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 text-xs px-2 py-1 rounded border border-input bg-background"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveNote(entry.id);
                  if (e.key === "Escape") handleCancelNote();
                }}
              />
              <button
                onClick={() => handleSaveNote(entry.id)}
                className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={handleCancelNote}
                className="text-xs px-2 py-1 rounded border border-input hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {entry.matchCount !== undefined && (
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                entry.matchCount > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              )}
            >
              {entry.matchCount} {entry.matchCount === 1 ? "match" : "matches"}
            </span>
          )}

          {entry.execTimeMs !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {entry.execTimeMs < 1
                ? "<1ms"
                : `${entry.execTimeMs.toFixed(1)}ms`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(entry.createdAt)}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleFavorite(entry.id, entry.favorite)}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              entry.favorite ? "text-yellow-500" : "text-muted-foreground"
            )}
            title={
              entry.favorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={entry.favorite ? "currentColor" : "none"}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={() => handleStartEditNote(entry)}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Add/edit note"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
          </button>

          <button
            onClick={() => handleRemove(entry.id)}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
            title="Remove from history"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
            Favorites
          </div>
          <div className="space-y-2">{favorites.map(renderEntry)}</div>
        </div>
      )}

      {regular.length > 0 && (
        <div className="space-y-2">
          {favorites.length > 0 && (
            <div className="text-xs font-medium text-muted-foreground">
              Recent
            </div>
          )}
          <div className="space-y-2">{regular.map(renderEntry)}</div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          History saved to local storage
        </div>
        {regular.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs h-7 text-muted-foreground hover:text-destructive"
          >
            Clear History
          </Button>
        )}
      </div>
    </div>
  );
}
