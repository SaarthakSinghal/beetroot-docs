import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static search: pre-generate index at build time
// This eliminates serverless function invocations for search
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
