export interface JamBannerCopy {
  title: string;
  description: string;
}

export const JAM_URL = "https://jam.dev?ref=utils-banner";
export const SKILLS_URL =
  "https://github.com/jamdotdev/skills?ref=utils-banner";

export const defaultBannerCopy: JamBannerCopy = {
  title: "Fix your next bug faster",
  description: "Jam captures logs, network, and repro steps in one click.",
};

const imageBannerCopy: JamBannerCopy = {
  title: "Prepping images for production?",
  description: "Jam captures screenshots with device and browser info.",
};

// Per-tool banner copy, keyed by the page slug under /utilities.
export const bannerCopyByTool: Record<string, JamBannerCopy> = {
  "json-formatter": {
    title: "Debugging an API?",
    description: "Jam captures network and console logs automatically!",
  },
  "csv-to-json": {
    title: "Converting data to debug a pipeline?",
    description:
      "Jam captures the exact payload and console logs automatically!",
  },
  "base-64-encoder": {
    title: "Decoding Base64 to inspect a payload?",
    description:
      "Jam captures raw network requests and console logs automatically!",
  },
  "url-encoder": {
    title: "Untangling URLs to debug a request?",
    description: "Jam records the failing request with params and headers.",
  },
  "timestamp-to-date": {
    title: "Chasing a timezone bug?",
    description: "Jam captures device, locale, and console logs automatically.",
  },
  "har-file-viewer": {
    title: "Reading HAR files to find a bug?",
    description:
      "No more HAR exports. Jam captures network logs automatically!",
  },
  "svg-viewer": {
    title: "Polishing the UI?",
    description: "Jam captures pixel-perfect replays with browser and OS info.",
  },
  "image-resizer": imageBannerCopy,
  "image-to-base64": imageBannerCopy,
  "webp-converter": imageBannerCopy,
};

export function getBannerCopy(tool?: string): JamBannerCopy {
  return (tool && bannerCopyByTool[tool]) || defaultBannerCopy;
}
