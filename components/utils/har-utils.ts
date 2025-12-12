export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: {
    url: string;
    method: string;
    httpVersion?: string;
    headers: { name: string; value: string }[];
    postData?: {
      mimeType: string;
      text: string;
    };
  };
  serverIPAddress?: string;
  response: {
    status: number;
    statusText: string;
    headers: { name: string; value: string }[];
    content: {
      size: number;
      mimeType: string;
      text?: string;
    };
  };
  timings: {
    blocked?: number;
    dns?: number;
    connect?: number;
    send?: number;
    wait: number;
    receive: number;
    ssl?: number;
  };
}

export interface HarData {
  log: {
    entries: HarEntry[];
  };
}

export interface HarTableProps {
  entries: HarEntry[];
}

export type FilterType =
  | "All"
  | "XHR"
  | "JS"
  | "CSS"
  | "Img"
  | "Media"
  | "Other"
  | "Errors";

export function getColorForTime(time: number): string {
  if (time <= 200) {
    return "bg-green-500";
  }
  if (time <= 400) {
    return "bg-orange-500";
  }
  if (time <= 500) {
    return "bg-red-500";
  }
  return "bg-red-700";
}

export function getFilterType(entry: HarEntry): FilterType {
  if (entry.response.status >= 400) {
    return "Errors";
  }

  const { mimeType } = entry.response.content;

  if (
    entry.request.url.includes("xhr") ||
    entry.request.url.includes("fetch") ||
    mimeType?.includes("json") ||
    mimeType?.includes("xml")
  ) {
    return "XHR";
  }
  if (mimeType?.includes("javascript")) {
    return "JS";
  }
  if (mimeType?.includes("css")) {
    return "CSS";
  }
  if (mimeType?.includes("image")) {
    return "Img";
  }
  if (mimeType?.includes("audio") || mimeType?.includes("video")) {
    return "Media";
  }

  return "Other";
}

export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

export function tryParseJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

// Search match categories for visual indicators
export type MatchCategory = "url" | "headers" | "request" | "response";

export interface MatchInfo {
  categories: MatchCategory[];
  hasMatch: boolean;
}

/**
 * Determines which categories of content match the search query for a given entry.
 * Used to display colored indicators showing where matches were found.
 */
export function getMatchCategories(
  entry: HarEntry,
  searchQuery: string
): MatchInfo {
  if (!searchQuery) {
    return { categories: [], hasMatch: false };
  }

  const query = searchQuery.toLowerCase();
  const categories: MatchCategory[] = [];

  // Check URL
  if (entry.request.url.toLowerCase().includes(query)) {
    categories.push("url");
  }

  // Check request and response headers
  const hasHeaderMatch =
    entry.request.headers.some(
      (header) =>
        header.name.toLowerCase().includes(query) ||
        header.value.toLowerCase().includes(query)
    ) ||
    entry.response.headers.some(
      (header) =>
        header.name.toLowerCase().includes(query) ||
        header.value.toLowerCase().includes(query)
    );

  if (hasHeaderMatch) {
    categories.push("headers");
  }

  // Check request payload
  if (entry.request.postData?.text) {
    if (entry.request.postData.text.toLowerCase().includes(query)) {
      categories.push("request");
    }
  }

  // Check response content
  if (entry.response.content.text) {
    let contentToSearch = entry.response.content.text;
    if (isBase64(contentToSearch)) {
      try {
        contentToSearch = atob(contentToSearch);
      } catch (e) {
        // If decode fails, search in original
      }
    }
    if (contentToSearch.toLowerCase().includes(query)) {
      categories.push("response");
    }
  }

  return {
    categories,
    hasMatch: categories.length > 0,
  };
}
