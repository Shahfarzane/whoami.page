import React, { forwardRef } from 'react';
import { Button } from '@radix-ui/themes';
import SearchDialog from './search-dialog';
import useSearch from '@/hooks/useSearch';
import { Icons } from '@/components/ui/icons';

const SearchTrigger = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const searchProps = useSearch();

  return (
    <div
      ref={ref}
      {...props}
      className="flex h-9 w-9 items-center justify-center"
    >
      <Button variant="ghost" highContrast>
        <Icons.search2
          onClick={() => searchProps.setIsOpen(true)}
          className="h-7 w-7"
        />
      </Button>

      <SearchDialog {...searchProps} />
    </div>
  );
});

SearchTrigger.displayName = 'SearchTrigger';

export default SearchTrigger;
