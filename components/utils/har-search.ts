/**
 * HAR Search Utilities with Chunking Support
 * Uses chonkie library for efficient chunking of large content
 */

import { TokenChunker } from "chonkie";
import { HarEntry } from "./har-utils";

/**
 * Configuration for chunked search
 */
export interface ChunkedSearchConfig {
  /** Maximum size in characters before chunking is applied */
  chunkThreshold: number;
  /** Size of each chunk in tokens */
  chunkSize: number;
  /** Overlap between chunks to avoid missing matches at boundaries */
  chunkOverlap: number;
}

/**
 * Default configuration for chunked search
 */
export const DEFAULT_CHUNKED_SEARCH_CONFIG: ChunkedSearchConfig = {
  chunkThreshold: 10000, // Start chunking for content larger than 10KB
  chunkSize: 512,
  chunkOverlap: 50,
};

/**
 * Cache for the TokenChunker instance
 */
let chunkerInstance: Awaited<ReturnType<typeof TokenChunker.create>> | null = null;

/**
 * Get or create a TokenChunker instance
 */
async function getChunker(config: ChunkedSearchConfig) {
  if (!chunkerInstance) {
    chunkerInstance = await TokenChunker.create({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      returnType: "chunks",
    });
  }
  return chunkerInstance;
}

/**
 * Search within a text using chunking for large content
 * @param text - The text to search in
 * @param query - The search query (case-insensitive)
 * @param config - Chunking configuration
 * @returns true if the query is found, false otherwise
 */
export async function searchInTextChunked(
  text: string,
  query: string,
  config: ChunkedSearchConfig = DEFAULT_CHUNKED_SEARCH_CONFIG
): Promise<boolean> {
  const lowerQuery = query.toLowerCase();

  // For small content, use simple string search
  if (text.length < config.chunkThreshold) {
    return text.toLowerCase().includes(lowerQuery);
  }

  // For large content, use chunking
  try {
    const chunker = await getChunker(config);
    const chunks = await chunker.chunk(text);

    // Search in each chunk
    for (const chunk of chunks) {
      if (chunk.text.toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    // Fallback to simple search if chunking fails
    console.warn("Chunking failed, falling back to simple search:", error);
    return text.toLowerCase().includes(lowerQuery);
  }
}

/**
 * Search within HAR entry content (optimized with chunking)
 * @param entry - HAR entry to search in
 * @param query - Search query
 * @param config - Chunking configuration
 * @returns true if the query is found anywhere in the entry
 */
export async function searchInHarEntryChunked(
  entry: HarEntry,
  query: string,
  config: ChunkedSearchConfig = DEFAULT_CHUNKED_SEARCH_CONFIG
): Promise<boolean> {
  const lowerQuery = query.toLowerCase();

  // Search in URL
  if (entry.request.url.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // Search in request headers
  const requestHeaderMatch = entry.request.headers.some(
    (header) =>
      header.name.toLowerCase().includes(lowerQuery) ||
      header.value.toLowerCase().includes(lowerQuery)
  );
  if (requestHeaderMatch) {
    return true;
  }

  // Search in response headers
  const responseHeaderMatch = entry.response.headers.some(
    (header) =>
      header.name.toLowerCase().includes(lowerQuery) ||
      header.value.toLowerCase().includes(lowerQuery)
  );
  if (responseHeaderMatch) {
    return true;
  }

  // Search in request payload
  if (entry.request.postData?.text) {
    const found = await searchInTextChunked(
      entry.request.postData.text,
      query,
      config
    );
    if (found) return true;
  }

  // Search in response content (this is often the largest part)
  if (entry.response.content.text) {
    let contentToSearch = entry.response.content.text;

    // Handle base64 encoded content
    if (isBase64(contentToSearch)) {
      try {
        contentToSearch = atob(contentToSearch);
      } catch (e) {
        // If decode fails, search in original
      }
    }

    const found = await searchInTextChunked(contentToSearch, query, config);
    if (found) return true;
  }

  return false;
}

/**
 * Check if a string is base64 encoded
 */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * Batch search across multiple HAR entries
 * @param entries - Array of HAR entries
 * @param query - Search query
 * @param config - Chunking configuration
 * @returns Array of indices of entries that match the query
 */
export async function batchSearchHarEntries(
  entries: HarEntry[],
  query: string,
  config: ChunkedSearchConfig = DEFAULT_CHUNKED_SEARCH_CONFIG
): Promise<number[]> {
  const matchingIndices: number[] = [];

  // Process entries in parallel for better performance
  const searchPromises = entries.map((entry, index) =>
    searchInHarEntryChunked(entry, query, config).then((found) => ({
      index,
      found,
    }))
  );

  const results = await Promise.all(searchPromises);

  for (const result of results) {
    if (result.found) {
      matchingIndices.push(result.index);
    }
  }

  return matchingIndices;
}

/**
 * Simple synchronous search (for comparison in benchmarks)
 * @param text - Text to search in
 * @param query - Search query
 * @returns true if query is found
 */
export function searchInTextSimple(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

/**
 * Simple synchronous HAR entry search (for comparison in benchmarks)
 * @param entry - HAR entry
 * @param query - Search query
 * @returns true if query is found
 */
export function searchInHarEntrySimple(
  entry: HarEntry,
  query: string
): boolean {
  const lowerQuery = query.toLowerCase();

  // Search in URL
  if (entry.request.url.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // Search in request headers
  const requestHeaderMatch = entry.request.headers.some(
    (header) =>
      header.name.toLowerCase().includes(lowerQuery) ||
      header.value.toLowerCase().includes(lowerQuery)
  );
  if (requestHeaderMatch) {
    return true;
  }

  // Search in response headers
  const responseHeaderMatch = entry.response.headers.some(
    (header) =>
      header.name.toLowerCase().includes(lowerQuery) ||
      header.value.toLowerCase().includes(lowerQuery)
  );
  if (responseHeaderMatch) {
    return true;
  }

  // Search in request payload
  if (entry.request.postData?.text) {
    if (entry.request.postData.text.toLowerCase().includes(lowerQuery)) {
      return true;
    }
  }

  // Search in response content
  if (entry.response.content.text) {
    let contentToSearch = entry.response.content.text;
    if (isBase64(contentToSearch)) {
      try {
        contentToSearch = atob(contentToSearch);
      } catch (e) {
        // If decode fails, search in original
      }
    }
    if (contentToSearch.toLowerCase().includes(lowerQuery)) {
      return true;
    }
  }

  return false;
}
