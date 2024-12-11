'use client';

import Link from 'next/link';
import { Button } from '@radix-ui/themes';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error',
};
export default function Error() {
  return (
    <div className="flex h-[80vh] flex-col justify-between">
      <div className="flex flex-grow flex-col items-center justify-center gap-4 px-4">
        <h4 className="scroll-m-20 text-[16px] font-bold tracking-normal">
          Sorry, something went wrong!
        </h4>
        <Button
          asChild
          className="px-4 hover:bg-transparent active:scale-95"
          variant={'outline'}
          size="1"
        >
          <Link href={'/'}>Back</Link>
        </Button>
      </div>
    </div>
  );
}
