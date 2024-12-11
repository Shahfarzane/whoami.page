// components/buttons/quote-button.tsx
import React from 'react';
import { Icons } from '@/components/ui/icons';
import useDialog from '@/store/dialog';
import type { PostComponentProps } from '@/types';

interface QuoteButtonProps {
  quoteInfo: Pick<PostComponentProps, 'id' | 'text' | 'author' | 'createdAt'>;
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo }) => {
  const { setOpenDialog, setQuoteInfo } = useDialog();

  const handleQuote = () => {
    setOpenDialog(true);
    setQuoteInfo(quoteInfo);
  };

  return (
    <div
      className="flex w-full items-center justify-between"
      onClick={handleQuote}
    >
      Quote
      <Icons.quote className="h-5 w-5" />
    </div>
  );
};

export default QuoteButton;
