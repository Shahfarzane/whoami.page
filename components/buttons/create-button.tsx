import React, { forwardRef } from 'react';
import useDialog from '@/store/dialog';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/store/auth';
import { Button } from '@radix-ui/themes';

interface CreateButtonProps {
  onClick?: () => void;
  styles?: string;
  disabled?: boolean;
}

const CreateButton = forwardRef<HTMLButtonElement, CreateButtonProps>(
  ({ styles, onClick, disabled, ...props }, ref) => {
    const { setOpenDialog, resetDialogState } = useDialog();
    const { isSignedIn, isLoaded } = useUser();
    const openSignInModal = useAuthStore((state) => state.openSignInModal);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (isLoaded && isSignedIn) {
        resetDialogState();
        setOpenDialog(true);
      } else if (isLoaded) {
        openSignInModal();
      }
    };

    return (
      <Button
        ref={ref}
        highContrast
        variant="ghost"
        className={cn('h-9 w-9', styles)}
        onClick={handleClick}
        {...props}
      >
        <Icons.createPlus className="h-7 w-7" />
      </Button>
    );
  },
);

CreateButton.displayName = 'CreateButton';

export default CreateButton;
