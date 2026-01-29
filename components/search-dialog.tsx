'use client';

import { useDocsSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

/**
 * Custom SearchDialog component for static search
 *
 * This component uses client-side static search where the entire search index
 * is downloaded once and searches are performed in the browser using Orama.
 *
 * Benefits:
 * - Zero serverless function invocations for search
 * - Faster search responses (no network round-trip)
 * - Reduced Vercel costs
 *
 * Trade-offs:
 * - Initial download of search index (~50-100KB for 19 pages)
 * - Search index updates only on new deployments
 */
export default function DefaultSearchDialog(props: SharedProps) {
  const basePath = process.env.NODE_ENV === 'production' ? '/beetroot' : '';

  // Use static search type - downloads index at build time
  // Search runs entirely in the browser using Orama
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    from: `${basePath}/api/search`,
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== 'empty' ? query.data : null}
        />
      </SearchDialogContent>
    </SearchDialog>
  );
}
