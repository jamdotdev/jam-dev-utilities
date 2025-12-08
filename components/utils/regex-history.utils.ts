export interface HistoryEntry {
  id: string;
  pattern: string;
  testString: string;
  flags: string;
  note?: string;
  favorite: boolean;
  createdAt: number;
  matchCount?: number;
  execTimeMs?: number;
}

const HISTORY_KEY = "regex-playground-history";
const MAX_HISTORY_ITEMS = 10;

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // localStorage might be full or disabled
  }
}

export function addToHistory(
  entry: Omit<HistoryEntry, "id" | "createdAt">
): HistoryEntry[] {
  const history = getHistory();

  const newEntry: HistoryEntry = {
    ...entry,
    id: generateId(),
    createdAt: Date.now(),
  };

  // Check for duplicates (same pattern and testString)
  const existingIndex = history.findIndex(
    (h) => h.pattern === entry.pattern && h.testString === entry.testString
  );

  if (existingIndex !== -1) {
    // Update existing entry instead of adding duplicate
    history[existingIndex] = {
      ...history[existingIndex],
      ...entry,
      createdAt: Date.now(),
    };
  } else {
    // Add new entry at the beginning
    history.unshift(newEntry);
  }

  // Keep favorites and limit non-favorites to MAX_HISTORY_ITEMS
  const favorites = history.filter((h) => h.favorite);
  const nonFavorites = history.filter((h) => !h.favorite);
  const trimmedNonFavorites = nonFavorites.slice(0, MAX_HISTORY_ITEMS);

  const finalHistory = [...favorites, ...trimmedNonFavorites].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  saveHistory(finalHistory);
  return finalHistory;
}

export function updateHistoryEntry(
  id: string,
  updates: Partial<Pick<HistoryEntry, "note" | "favorite">>
): HistoryEntry[] {
  const history = getHistory();
  const index = history.findIndex((h) => h.id === id);

  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    saveHistory(history);
  }

  return history;
}

export function removeFromHistory(id: string): HistoryEntry[] {
  const history = getHistory();
  const filtered = history.filter((h) => h.id !== id);
  saveHistory(filtered);
  return filtered;
}

export function clearHistory(): HistoryEntry[] {
  // Keep favorites when clearing
  const history = getHistory();
  const favorites = history.filter((h) => h.favorite);
  saveHistory(favorites);
  return favorites;
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
