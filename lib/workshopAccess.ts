/**
 * Workshop access control configuration
 * Defines the order of docs and provides helper functions for checking access
 */

export interface WorkshopDoc {
  slug: string;
  title: string;
  index: number;
  fullPath: string; // Full path including /docs prefix
}

// Ordered list of all workshop chapters in sequence
// These correspond to the files in content/docs/workshop/
export const workshopDocs: WorkshopDoc[] = [
  {
    slug: "workshop/01-overview",
    title: "Project Overview",
    index: 0,
    fullPath: "/docs/workshop/01-overview",
  },
  {
    slug: "workshop/02-aws-resources",
    title: "AWS Resources",
    index: 1,
    fullPath: "/docs/workshop/02-aws-resources",
  },
  {
    slug: "workshop/03-iam",
    title: "IAM Setup",
    index: 2,
    fullPath: "/docs/workshop/03-iam",
  },
  {
    slug: "workshop/04-upload-flow-raw",
    title: "Upload Flow - Raw",
    index: 3,
    fullPath: "/docs/workshop/04-upload-flow-raw",
  },
  {
    slug: "workshop/05-s3-trigger",
    title: "S3 Trigger",
    index: 4,
    fullPath: "/docs/workshop/05-s3-trigger",
  },
  {
    slug: "workshop/06-ingest-lambda",
    title: "Ingest Lambda",
    index: 5,
    fullPath: "/docs/workshop/06-ingest-lambda",
  },
  {
    slug: "workshop/07-detect-faces",
    title: "Detect Faces",
    index: 6,
    fullPath: "/docs/workshop/07-detect-faces",
  },
  {
    slug: "workshop/08-lambda-layer",
    title: "Lambda Layer",
    index: 7,
    fullPath: "/docs/workshop/08-lambda-layer",
  },
  {
    slug: "workshop/09-crop-thumbnail",
    title: "Crop Thumbnail",
    index: 8,
    fullPath: "/docs/workshop/09-crop-thumbnail",
  },
  {
    slug: "workshop/10-search-faces",
    title: "Search Faces",
    index: 9,
    fullPath: "/docs/workshop/10-search-faces",
  },
  {
    slug: "workshop/11-index-faces",
    title: "Index Faces",
    index: 10,
    fullPath: "/docs/workshop/11-index-faces",
  },
  {
    slug: "workshop/12-occurrences",
    title: "Occurrences",
    index: 11,
    fullPath: "/docs/workshop/12-occurrences",
  },
  {
    slug: "workshop/13-api-lambda",
    title: "API Lambda",
    index: 12,
    fullPath: "/docs/workshop/13-api-lambda",
  },
  {
    slug: "workshop/14-api-gateway",
    title: "API Gateway",
    index: 13,
    fullPath: "/docs/workshop/14-api-gateway",
  },
];

// Build a map for quick lookup by slug
export const slugToIndexMap = new Map<string, number>();
export const slugToDocMap = new Map<string, WorkshopDoc>();

for (const doc of workshopDocs) {
  slugToIndexMap.set(doc.slug, doc.index);
  slugToDocMap.set(doc.slug, doc);
}

// Also map by path (without /docs prefix) for easier lookup
export const pathToIndexMap = new Map<string, number>();
export const pathToDocMap = new Map<string, WorkshopDoc>();

for (const doc of workshopDocs) {
  const pathWithoutPrefix = doc.slug; // Already without /docs prefix
  pathToIndexMap.set(pathWithoutPrefix, doc.index);
  pathToDocMap.set(pathWithoutPrefix, doc);
}

/**
 * Get the index of a doc by its slug
 * Returns -1 if the doc is not found or is not a workshop doc
 */
export function getDocIndex(slug: string): number {
  // Handle various path formats
  const normalizedSlug = slug
    .replace(/^\/docs\//, "") // Remove leading /docs/
    .replace(/^\/+/, "") // Remove leading slashes
    .replace(/\.mdx$/, ""); // Remove .mdx extension if present

  return slugToIndexMap.get(normalizedSlug) ?? -1;
}

/**
 * Get the doc info by its slug
 * Returns null if the doc is not found
 */
export function getDocInfo(slug: string): WorkshopDoc | null {
  const normalizedSlug = slug
    .replace(/^\/docs\//, "")
    .replace(/^\/+/, "")
    .replace(/\.mdx$/, "");

  return slugToDocMap.get(normalizedSlug) ?? null;
}

/**
 * Check if a doc is accessible given the max unlocked index
 * @param slug - The doc slug to check
 * @param maxUnlockedIndex - The maximum unlocked chapter index
 * @returns true if the doc is accessible
 */
export function isDocAccessible(
  slug: string,
  maxUnlockedIndex: number,
): boolean {
  const index = getDocIndex(slug);

  // If not a workshop doc (index === -1), allow access (non-workshop pages are public)
  if (index === -1) {
    return true;
  }

  // Otherwise, check if the index is <= maxUnlockedIndex
  return index <= maxUnlockedIndex;
}

/**
 * Get all docs with their lock status
 */
export function getDocsWithLockStatus(
  maxUnlockedIndex: number,
): Array<WorkshopDoc & { locked: boolean }> {
  return workshopDocs.map((doc) => ({
    ...doc,
    locked: doc.index > maxUnlockedIndex,
  }));
}

/**
 * Get the next doc after the current one
 */
export function getNextDoc(currentSlug: string): WorkshopDoc | null {
  const currentIndex = getDocIndex(currentSlug);
  if (currentIndex === -1) return null;

  const nextDoc = workshopDocs.find((doc) => doc.index === currentIndex + 1);
  return nextDoc ?? null;
}

/**
 * Get the previous doc before the current one
 */
export function getPrevDoc(currentSlug: string): WorkshopDoc | null {
  const currentIndex = getDocIndex(currentSlug);
  if (currentIndex <= 0) return null;

  const prevDoc = workshopDocs.find((doc) => doc.index === currentIndex - 1);
  return prevDoc ?? null;
}
