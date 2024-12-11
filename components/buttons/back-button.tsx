import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button, Tooltip } from '@radix-ui/themes';

interface BackButtonProps {
  onBack: () => void;
  show: boolean;
}

export function BackButton({ onBack, show }: BackButtonProps) {
  if (!show) return <div className="h-[36px] w-[36px]" />;

  return (
    <Tooltip content="Back">
      <Button
        highContrast
        size="2"
        variant="ghost"
        onClick={onBack}
        className="flex items-center justify-center transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </Button>
    </Tooltip>
  );
}
