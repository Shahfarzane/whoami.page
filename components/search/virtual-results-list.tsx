import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Command } from 'cmdk';
import SearchResultItem from '@/components/search/result-item';
import { FilterType, SearchItem } from '@/types/search';

interface VirtualizedListProps {
  items: SearchItem[];
  type: FilterType;
  onItemClick: () => void;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => void;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  type,
  onItemClick,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
}) => {
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  const itemSize = 60;

  const isItemLoaded = useCallback(
    (index: number) => !hasNextPage || index < items.length,
    [hasNextPage, items.length],
  );

  const loadMoreItems = useCallback(
    () => (isNextPageLoading ? Promise.resolve() : loadNextPage()),
    [isNextPageLoading, loadNextPage],
  );

  const Item = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (!isItemLoaded(index)) {
        return (
          <div style={style} cmdk-loading="">
            <Command.Loading>Loading more...</Command.Loading>
          </div>
        );
      }

      const item = items[index];
      if (!item) return null;

      return (
        <div
          style={{
            ...style,
            height: `${itemSize}px`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SearchResultItem item={item} onItemClick={onItemClick} />
        </div>
      );
    },
    [items, onItemClick, isItemLoaded],
  );

  return (
    <Command.Group heading="">
      <AutoSizer disableHeight>
        {({ width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                height={300}
                itemCount={itemCount}
                itemSize={itemSize}
                width={width}
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {Item}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </Command.Group>
  );
};

export default React.memo(VirtualizedList);
