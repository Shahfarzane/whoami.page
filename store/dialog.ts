// store/dialog.ts

import { create } from 'zustand';
import { ThreadInfo } from '@/types/posts';
import type { PostComponentProps } from '@/types';

interface DialogState {
  openDialog: boolean;
  replyPostInfo:
    | (ThreadInfo & { onReply?: (text: string) => Promise<void> })
    | null;
  quoteInfo: Pick<
    PostComponentProps,
    'id' | 'text' | 'author' | 'createdAt'
  > | null;
  setOpenDialog: (open: boolean) => void;
  setReplyPostInfo: (
    info: ThreadInfo & { onReply?: (text: string) => Promise<void> },
  ) => void;
  setQuoteInfo: (
    info: Pick<
      PostComponentProps,
      'id' | 'text' | 'author' | 'createdAt'
    > | null,
  ) => void;
  resetDialogState: () => void;
}

const useDialog = create<DialogState>((set) => ({
  openDialog: false,
  replyPostInfo: null,
  quoteInfo: null,
  setOpenDialog: (open) => set({ openDialog: open }),
  setReplyPostInfo: (info) => set({ replyPostInfo: info }),
  setQuoteInfo: (info) => set({ quoteInfo: info }),
  resetDialogState: () =>
    set({ openDialog: false, replyPostInfo: null, quoteInfo: null }),
}));

export default useDialog;
