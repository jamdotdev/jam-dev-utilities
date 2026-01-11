/**
 * Performance benchmarks for HAR file search with and without chunking
 */

import {
  searchInTextChunked,
  searchInTextSimple,
  searchInHarEntryChunked,
  searchInHarEntrySimple,
  batchSearchHarEntries,
  DEFAULT_CHUNKED_SEARCH_CONFIG,
} from "../../components/utils/har-search";
import {
  smallHar,
  mediumHar,
  largeHar,
  hugeHar,
} from "../fixtures/generate-har-fixtures";
import { HarData } from "../../components/utils/har-utils";

/**
 * Measure execution time of a function
 */
async function measureTime<T>(
  fn: () => Promise<T> | T,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
  return { result, duration };
}

/**
 * Generate a large text for testing
 */
function generateLargeText(sizeInKB: number): string {
  const targetLength = sizeInKB * 1024;
  const baseText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. ";
  let text = "";
  while (text.length < targetLength) {
    text += baseText;
  }
  return text.slice(0, targetLength);
}

describe("HAR Search Performance Benchmarks", () => {
  describe("Text Search Performance", () => {
    test("should search in small text (5KB) - comparing chunked vs simple", async () => {
      const text = generateLargeText(5);
      const query = "nostrud";

      const simpleResult = await measureTime(
        () => searchInTextSimple(text, query),
        "Simple search (5KB)"
      );

      const chunkedResult = await measureTime(
        () => searchInTextChunked(text, query),
        "Chunked search (5KB)"
      );

      // Both should find the text
      expect(simpleResult.result).toBe(true);
      expect(chunkedResult.result).toBe(true);

      // For small text, chunked should use simple search (below threshold)
      console.log(
        `Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);

    test("should search in medium text (50KB) - comparing chunked vs simple", async () => {
      const text = generateLargeText(50);
      const query = "nostrud";

      const simpleResult = await measureTime(
        () => searchInTextSimple(text, query),
        "Simple search (50KB)"
      );

      const chunkedResult = await measureTime(
        () => searchInTextChunked(text, query),
        "Chunked search (50KB)"
      );

      // Both should find the text
      expect(simpleResult.result).toBe(true);
      expect(chunkedResult.result).toBe(true);

      console.log(
        `Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);

    test("should search in large text (500KB) - comparing chunked vs simple", async () => {
      const text = generateLargeText(500);
      const query = "nostrud";

      const simpleResult = await measureTime(
        () => searchInTextSimple(text, query),
        "Simple search (500KB)"
      );

      const chunkedResult = await measureTime(
        () => searchInTextChunked(text, query),
        "Chunked search (500KB)"
      );

      // Both should find the text
      expect(simpleResult.result).toBe(true);
      expect(chunkedResult.result).toBe(true);

      console.log(
        `Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);

    test("should handle text not found efficiently", async () => {
      const text = generateLargeText(100);
      const query = "NOTFOUNDTEXT12345";

      const simpleResult = await measureTime(
        () => searchInTextSimple(text, query),
        "Simple search - not found (100KB)"
      );

      const chunkedResult = await measureTime(
        () => searchInTextChunked(text, query),
        "Chunked search - not found (100KB)"
      );

      // Both should not find the text
      expect(simpleResult.result).toBe(false);
      expect(chunkedResult.result).toBe(false);

      console.log(
        `Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);
  });

  describe("HAR Entry Search Performance", () => {
    test("should search in small HAR file (10 entries, ~50KB)", async () => {
      const entry = smallHar.log.entries[0];
      const query = "performance";

      const simpleResult = await measureTime(
        () => searchInHarEntrySimple(entry, query),
        "Simple entry search (small)"
      );

      const chunkedResult = await measureTime(
        () => searchInHarEntryChunked(entry, query),
        "Chunked entry search (small)"
      );

      // Both should work
      expect(typeof simpleResult.result).toBe("boolean");
      expect(typeof chunkedResult.result).toBe("boolean");

      console.log(
        `Small HAR - Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);

    test("should search in medium HAR file (50 entries, ~1MB)", async () => {
      const entry = mediumHar.log.entries[0];
      const query = "performance";

      const simpleResult = await measureTime(
        () => searchInHarEntrySimple(entry, query),
        "Simple entry search (medium)"
      );

      const chunkedResult = await measureTime(
        () => searchInHarEntryChunked(entry, query),
        "Chunked entry search (medium)"
      );

      // Both should work
      expect(typeof simpleResult.result).toBe("boolean");
      expect(typeof chunkedResult.result).toBe("boolean");

      console.log(
        `Medium HAR - Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);

    test("should search in large HAR file (100 entries, ~5MB)", async () => {
      const entry = largeHar.log.entries[0];
      const query = "performance";

      const simpleResult = await measureTime(
        () => searchInHarEntrySimple(entry, query),
        "Simple entry search (large)"
      );

      const chunkedResult = await measureTime(
        () => searchInHarEntryChunked(entry, query),
        "Chunked entry search (large)"
      );

      // Both should work
      expect(typeof simpleResult.result).toBe("boolean");
      expect(typeof chunkedResult.result).toBe("boolean");

      console.log(
        `Large HAR - Simple vs Chunked ratio: ${(chunkedResult.duration / simpleResult.duration).toFixed(2)}x`
      );
    }, 30000);
  });

  describe("Batch Search Performance", () => {
    test("should batch search in small HAR file", async () => {
      const query = "test";

      const batchResult = await measureTime(
        () => batchSearchHarEntries(smallHar.log.entries, query),
        "Batch search (small HAR)"
      );

      expect(Array.isArray(batchResult.result)).toBe(true);
      console.log(`Found ${batchResult.result.length} matching entries`);
    }, 30000);

    test("should batch search in medium HAR file", async () => {
      const query = "performance";

      const batchResult = await measureTime(
        () => batchSearchHarEntries(mediumHar.log.entries, query),
        "Batch search (medium HAR)"
      );

      expect(Array.isArray(batchResult.result)).toBe(true);
      console.log(`Found ${batchResult.result.length} matching entries`);
    }, 30000);

    test("should batch search in large HAR file", async () => {
      const query = "search";

      const batchResult = await measureTime(
        () => batchSearchHarEntries(largeHar.log.entries, query),
        "Batch search (large HAR)"
      );

      expect(Array.isArray(batchResult.result)).toBe(true);
      console.log(`Found ${batchResult.result.length} matching entries`);
    }, 60000);
  });

  describe("Search Correctness", () => {
    test("should correctly identify matches in URLs", async () => {
      const entry = smallHar.log.entries[0];
      const urlQuery = "example.com";

      const simpleResult = searchInHarEntrySimple(entry, urlQuery);
      const chunkedResult = await searchInHarEntryChunked(entry, urlQuery);

      expect(simpleResult).toBe(true);
      expect(chunkedResult).toBe(true);
    });

    test("should correctly identify matches in response content", async () => {
      const entry = mediumHar.log.entries[0];
      const contentQuery = "Test Item";

      const simpleResult = searchInHarEntrySimple(entry, contentQuery);
      const chunkedResult = await searchInHarEntryChunked(entry, contentQuery);

      expect(simpleResult).toBe(true);
      expect(chunkedResult).toBe(true);
    });

    test("should correctly identify no matches", async () => {
      const entry = smallHar.log.entries[0];
      const noMatchQuery = "DEFINITELYNOTFOUND12345";

      const simpleResult = searchInHarEntrySimple(entry, noMatchQuery);
      const chunkedResult = await searchInHarEntryChunked(entry, noMatchQuery);

      expect(simpleResult).toBe(false);
      expect(chunkedResult).toBe(false);
    });

    test("should be case-insensitive", async () => {
      const entry = smallHar.log.entries[0];
      const query = "EXAMPLE.COM"; // uppercase

      const simpleResult = searchInHarEntrySimple(entry, query);
      const chunkedResult = await searchInHarEntryChunked(entry, query);

      expect(simpleResult).toBe(true);
      expect(chunkedResult).toBe(true);
    });
  });

  describe("Configuration Tests", () => {
    test("should respect custom chunk threshold", async () => {
      const text = generateLargeText(5); // 5KB text
      const query = "ipsum";

      // With high threshold, should use simple search
      const result = await searchInTextChunked(text, query, {
        chunkThreshold: 100000, // 100KB threshold
        chunkSize: 512,
        chunkOverlap: 50,
      });

      expect(result).toBe(true);
    });

    test("should work with different chunk sizes", async () => {
      const text = generateLargeText(50); // 50KB text
      const query = "ipsum";

      // Small chunks
      const smallChunkResult = await searchInTextChunked(text, query, {
        chunkThreshold: 1000,
        chunkSize: 128,
        chunkOverlap: 20,
      });

      // Large chunks
      const largeChunkResult = await searchInTextChunked(text, query, {
        chunkThreshold: 1000,
        chunkSize: 1024,
        chunkOverlap: 100,
      });

      expect(smallChunkResult).toBe(true);
      expect(largeChunkResult).toBe(true);
    }, 30000);
  });

  describe("Edge Cases", () => {
    test("should handle empty text", async () => {
      const result = await searchInTextChunked("", "query");
      expect(result).toBe(false);
    });

    test("should handle empty query", async () => {
      const text = generateLargeText(10);
      const result = await searchInTextChunked(text, "");
      expect(result).toBe(true); // Empty string is found in any text
    });

    test("should handle special characters in query", async () => {
      const text = "Hello [world] (test)";
      const result = await searchInTextChunked(text, "[world]");
      expect(result).toBe(true);
    });

    test("should handle very long single words", async () => {
      const longWord = "a".repeat(10000);
      const text = `Start ${longWord} End`;
      const result = await searchInTextChunked(text, longWord);
      expect(result).toBe(true);
    }, 30000);
  });

  describe("Performance Summary", () => {
    test("should generate performance comparison report", async () => {
      console.log("\n=== PERFORMANCE SUMMARY ===\n");

      const testCases = [
        { name: "Small (5KB)", size: 5 },
        { name: "Medium (50KB)", size: 50 },
        { name: "Large (500KB)", size: 500 },
      ];

      const results: any[] = [];

      for (const testCase of testCases) {
        const text = generateLargeText(testCase.size);
        const query = "nostrud";

        const simple = await measureTime(
          () => searchInTextSimple(text, query),
          `${testCase.name} - Simple`
        );

        const chunked = await measureTime(
          () => searchInTextChunked(text, query),
          `${testCase.name} - Chunked`
        );

        const ratio = chunked.duration / simple.duration;
        results.push({
          name: testCase.name,
          simpleMs: simple.duration.toFixed(2),
          chunkedMs: chunked.duration.toFixed(2),
          ratio: ratio.toFixed(2),
          improvement:
            ratio < 1
              ? `${((1 - ratio) * 100).toFixed(1)}% faster`
              : `${((ratio - 1) * 100).toFixed(1)}% slower`,
        });
      }

      console.log("\nResults:");
      console.table(results);
      console.log("\n=== END SUMMARY ===\n");

      expect(results.length).toBe(testCases.length);
    }, 60000);
  });
});
