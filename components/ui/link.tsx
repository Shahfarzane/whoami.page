import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Text } from '@radix-ui/themes';

interface GlobalLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  externalIcon?: boolean;
  underline?: boolean;
  className?: string;
}

const Link = (props: GlobalLinkProps) => {
  return (
    <NextLink
      href={props.href}
      className={cn(props.underline && 'hover:underline', props.className)}
    >
      {props.children}
    </NextLink>
  );
};

const ExternalLink = (props: GlobalLinkProps) => {
  return (
    <a
      href={props.href}
      rel="noreferrer"
      target="_blank"
      className={cn(
        props.underline && 'underline',
        'hover:underline',
        props.className,
      )}
    >
      <Text as="div" className="ml-1 flex items-center">
        {props.children}
        {props.externalIcon && (
          <ArrowTopRightIcon
            className="ml-1 transition-transform hover:translate-x-0.5"
            height={15}
            width={15}
            strokeWidth={2}
          />
        )}
      </Text>
    </a>
  );
};

export { Link, ExternalLink };
