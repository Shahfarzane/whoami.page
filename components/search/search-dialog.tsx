import React, { useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { Dialog, Flex, VisuallyHidden } from '@radix-ui/themes';
import VirtualizedList from './virtual-results-list';
import { SearchProps } from '@/types/search';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const SearchDialog: React.FC<SearchProps> = ({
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
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <VisuallyHidden>
        <Dialog.Title></Dialog.Title>
      </VisuallyHidden>
      <Dialog.Content className="p-0" aria-describedby="search-dialog">
        <Command shouldFilter={false} className="w-full" cmdk-root>
          <div cmdk-header="">
            <MagnifyingGlassIcon />
            <Command.Input
              autoFocus
              ref={inputRef}
              value={searchTerm}
              onValueChange={handleSearchChange}
              placeholder="Search for people posts or projects"
            />
          </div>

          <Command.List>
            <Flex>
              {(
                ['all', 'users', 'posts', 'projects', 'experiences'] as const
              ).map((filterItem) => (
                <Command.Item
                  key={filterItem}
                  value={filterItem}
                  onSelect={() => handleFilterChange(filterItem)}
                  className={
                    activeFilter === filterItem
                      ? 'selected text-xs font-semibold'
                      : 'text-xs'
                  }
                >
                  {filterItem.charAt(0).toUpperCase() + filterItem.slice(1)}
                </Command.Item>
              ))}
            </Flex>

            <VirtualizedList
              items={searchResults}
              type={activeFilter}
              onItemClick={handleCloseModal}
              hasNextPage={!!hasNextPage}
              isNextPageLoading={isFetchingNextPage}
              loadNextPage={loadNextPage}
            />
          </Command.List>
        </Command>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SearchDialog;
