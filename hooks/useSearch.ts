import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { searchAll } from '@/app/_actions/search';
import {
  SearchResult,
  SearchCursor,
  FilterType,
  SearchProps,
  SearchItem,
  SearchUser,
} from '@/types/search';

type SearchQueryKey = readonly ['search', string, FilterType];
type InfiniteSearchResult = {
  pages: SearchResult[];
  pageParams: (SearchCursor | undefined)[];
};

const useSearch = (): SearchProps => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const queryClient = useQueryClient();

  const queryOptions: UseInfiniteQueryOptions<
    SearchResult,
    Error,
    InfiniteSearchResult,
    SearchResult,
    SearchQueryKey,
    SearchCursor | undefined
  > = {
    queryKey: ['search', debouncedSearchTerm, activeFilter] as const,
    queryFn: async ({ pageParam }) => {
      return searchAll(debouncedSearchTerm, activeFilter, pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage): SearchCursor | undefined => {
      const hasMore = Object.values(lastPage.nextCursor).some(
        (cursor) => cursor !== null,
      );
      return hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    select: (data: InfiniteSearchResult) => {
      console.log('✅ Search query success:', {
        pageCount: data.pages.length,
        totalResults: data.pages.reduce(
          (acc, page) =>
            acc +
            page.users.length +
            page.posts.length +
            page.projects.length +
            page.experiences.length,
          0,
        ),
      });
      return data;
    },
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteQuery(queryOptions);

  useEffect(() => {
    if (isOpen && debouncedSearchTerm.length > 0) {
      queryClient.removeQueries({ queryKey: ['search'] });
      refetch();
    }
  }, [debouncedSearchTerm, activeFilter, isOpen, queryClient, refetch]);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setActiveFilter('all');
    queryClient.removeQueries({ queryKey: ['search'] });
  }, [queryClient]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleFilterChange = useCallback(
    (value: FilterType) => {
      setActiveFilter(value);
      queryClient.removeQueries({ queryKey: ['search'] });
    },
    [queryClient],
  );

  const searchResults = useMemo(() => {
    if (!data?.pages) return [];

    const results = data.pages.flatMap((page: SearchResult): SearchItem[] => {
      const items: SearchItem[] = [];

      if (activeFilter === 'all' || activeFilter === 'users') {
        items.push(...page.users);
      }
      if (activeFilter === 'all' || activeFilter === 'posts') {
        items.push(...page.posts);
      }
      if (activeFilter === 'all' || activeFilter === 'projects') {
        items.push(...page.projects);
      }
      if (activeFilter === 'all' || activeFilter === 'experiences') {
        items.push(...page.experiences);
      }

      return items;
    });

    return results;
  }, [data?.pages, activeFilter]);

  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    handleSearchChange,
    activeFilter,
    handleFilterChange,
    searchResults,
    handleCloseModal,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    loadNextPage,
  };
};

export default useSearch;
