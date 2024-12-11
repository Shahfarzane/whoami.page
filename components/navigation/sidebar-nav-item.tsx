import Link from 'next/link';
import { Button, Tooltip } from '@radix-ui/themes';

interface SidebarNavItemProps {
  icon: React.ReactNode;
  href?: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  href,
  label,
  onClick,
}: SidebarNavItemProps) {
  return (
    <div className="flex h-10 w-10 items-center justify-center">
      <Tooltip content={label}>
        {href ? (
          <Button
            highContrast
            variant="ghost"
            className="flex h-8 w-8 items-center justify-center"
            asChild
          >
            <Link href={href}>
              {Icon}
              <span className="sr-only">{label}</span>
            </Link>
          </Button>
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center"
            onClick={onClick}
          >
            {Icon}
            <span className="sr-only">{label}</span>
          </div>
        )}
      </Tooltip>
    </div>
  );
}
