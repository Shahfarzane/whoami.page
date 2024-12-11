'use client';
import Link from 'next/link';
import { Button } from '@radix-ui/themes';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not Found - 404',
};
export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col justify-between">
      <div className="flex flex-grow flex-col items-center justify-center gap-4 px-4">
        <h4 className="scroll-m-20 text-[16px] font-bold tracking-normal">
          Sorry, this page isn&#39;t available
        </h4>
        <span className="w-full max-w-[350px] text-center text-sm text-[#777777]">
          The link you followed may be broken, or the page may have been
          removed.
        </span>
        <Button
          asChild
          className="rounded-xl px-4 hover:bg-transparent active:scale-90"
          variant="outline"
        >
          <Link href={'/'}>Back</Link>
        </Button>
      </div>
    </div>
  );
}
