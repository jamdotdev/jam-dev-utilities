/**
 * Script to generate HAR file fixtures for performance testing
 */

import { HarEntry, HarData } from "../../components/utils/har-utils";

function generateLargeResponse(sizeInKB: number): string {
  const targetLength = sizeInKB * 1024;
  const baseObject = {
    id: 1,
    name: "Test Item",
    description: "This is a test description with some searchable content",
    timestamp: new Date().toISOString(),
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test", "fixture", "performance", "benchmark"],
  };

  // Create an array of objects to reach the target size
  const items = [];
  const singleItemSize = JSON.stringify(baseObject).length;
  const numItems = Math.ceil(targetLength / singleItemSize);

  for (let i = 0; i < numItems; i++) {
    items.push({
      ...baseObject,
      id: i + 1,
      name: `Test Item ${i + 1}`,
      description: `Description for item ${i + 1}. This item contains searchable text including keywords like "performance", "search", and "test".`,
    });
  }

  return JSON.stringify({ items, totalCount: numItems });
}

function createHarEntry(
  index: number,
  responseSize: number = 10
): HarEntry {
  const url = `https://api.example.com/v1/resource/${index}`;
  const responseText = generateLargeResponse(responseSize);

  return {
    startedDateTime: new Date(Date.now() - Math.random() * 10000).toISOString(),
    time: Math.floor(Math.random() * 500) + 50,
    request: {
      url,
      method: index % 3 === 0 ? "POST" : "GET",
      headers: [
        { name: "Accept", value: "application/json" },
        { name: "User-Agent", value: "Mozilla/5.0" },
        { name: "Authorization", value: `Bearer token_${index}` },
      ],
      ...(index % 3 === 0 && {
        postData: {
          mimeType: "application/json",
          text: JSON.stringify({ query: `search term ${index}`, page: 1 }),
        },
      }),
    },
    response: {
      status: index % 10 === 0 ? 404 : 200,
      statusText: index % 10 === 0 ? "Not Found" : "OK",
      headers: [
        { name: "Content-Type", value: "application/json" },
        { name: "Cache-Control", value: "no-cache" },
      ],
      content: {
        size: responseText.length,
        mimeType: "application/json",
        text: responseText,
      },
    },
    timings: {
      blocked: Math.random() * 10,
      dns: Math.random() * 50,
      connect: Math.random() * 100,
      send: Math.random() * 10,
      wait: Math.random() * 200,
      receive: Math.random() * 100,
    },
  };
}

export function generateHarFile(
  numEntries: number,
  responseSizeKB: number = 10
): HarData {
  const entries: HarEntry[] = [];

  for (let i = 0; i < numEntries; i++) {
    entries.push(createHarEntry(i, responseSizeKB));
  }

  return {
    log: {
      entries,
    },
  };
}

// Generate fixtures for testing
export const smallHar = generateHarFile(10, 5); // 10 entries, 5KB each (~50KB total)
export const mediumHar = generateHarFile(50, 20); // 50 entries, 20KB each (~1MB total)
export const largeHar = generateHarFile(100, 50); // 100 entries, 50KB each (~5MB total)
export const hugeHar = generateHarFile(200, 100); // 200 entries, 100KB each (~20MB total)
