import React from 'react';
import { DropdownMenu, Button, Tooltip } from '@radix-ui/themes';
import { Share1Icon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

interface ShareButtonProps {
  id: string;
  author: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ id, author }) => {
  const copyLinkToClipboard = async () => {
    const url = window.location.origin;
    const link = `${url}/${author}/posts/${id}`;
    await navigator.clipboard.writeText(link);
    toast('Post link copied to clipboard');
  };

  const copyEmbedCode = async () => {
    const url = window.location.origin;
    const embedCode = `<iframe src="${url}/${author}/posts/${id}/embed" width="550" height="300" style="border:none;"></iframe>`;
    await navigator.clipboard.writeText(embedCode);
    toast('Embed code copied to clipboard');
  };

  return (
    <DropdownMenu.Root>
      <Tooltip content="Share this post">
        <DropdownMenu.Trigger>
          <Button variant="ghost" size="2">
            <Share1Icon width="16" height="16" />
          </Button>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content
        align="start"
        className="w-[190px] rounded-2xl bg-background p-0 shadow-xl dark:bg-[#181818]"
      >
        <Tooltip content="Copy post link to clipboard">
          <DropdownMenu.Item
            onClick={copyLinkToClipboard}
            className="active:bg-primary-foreground cursor-pointer select-none rounded-none px-4 py-3 text-[15px] font-semibold tracking-normal focus:bg-transparent"
          >
            Copy link
          </DropdownMenu.Item>
        </Tooltip>
        <DropdownMenu.Separator className="my-0 h-[1.2px]" />
        <Tooltip content="Copy embed code for this post">
          <DropdownMenu.Item
            onClick={copyEmbedCode}
            className="active:bg-primary-foreground cursor-pointer select-none rounded-none px-4 py-3 text-[15px] font-semibold tracking-normal focus:bg-transparent"
          >
            Copy embed code
          </DropdownMenu.Item>
        </Tooltip>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ShareButton;
