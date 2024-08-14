export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: {
    url: string;
    method: string;
    headers: { name: string; value: string }[];
    postData?: {
      mimeType: string;
      text: string;
    };
  };
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
    wait: number;
    receive: number;
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
    mimeType.includes("json") ||
    mimeType.includes("xml")
  ) {
    return "XHR";
  }
  if (mimeType.includes("javascript")) {
    return "JS";
  }
  if (mimeType.includes("css")) {
    return "CSS";
  }
  if (mimeType.includes("image")) {
    return "Img";
  }
  if (mimeType.includes("audio") || mimeType.includes("video")) {
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
