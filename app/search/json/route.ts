import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const { GET } = createFromSource(source, {
  language: 'english',
});

// Generate static search index at build time
// This eliminates serverless function invocations for search
export const dynamic = 'force-static';
