import { forwardRef, memo } from 'react';
import { IconButton, Tooltip } from '@radix-ui/themes';

type ColorType =
  | 'gray'
  | 'ruby'
  | 'gold'
  | 'bronze'
  | 'brown'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'tomato'
  | 'red'
  | 'crimson'
  | 'pink'
  | 'plum'
  | 'purple'
  | 'violet'
  | 'iris'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'mint'
  | 'green'
  | 'grass'
  | 'lime';

interface BaseIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  count?: number;
  ariaLabel: string;
  tooltipContent?: string;
  color?: string;
  textColor?: string;
}

interface BaseButtonProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
  tooltipContent?: string;
  color: ColorType;
  className?: string;
  textColor?: string;
  ariaLabel: string;
}

const BaseIconButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      icon,
      count,
      onClick,
      tooltipContent,
      color = 'gray',
      textColor,
      className,
      ...props
    },
    ref,
  ) => {
    const button = (
      <span
        className={`flex h-6 w-6 items-center justify-center gap-1 rounded-full ${className}`}
      >
        <IconButton
          ref={ref}
          highContrast
          color={color}
          className="gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          variant="ghost"
          onClick={onClick}
        >
          {icon}
        </IconButton>
      </span>
    );

    if (tooltipContent) {
      return <Tooltip content={tooltipContent}>{button}</Tooltip>;
    }

    return button;
  },
);

BaseIconButton.displayName = 'BaseIconButton';

export default BaseIconButton;
