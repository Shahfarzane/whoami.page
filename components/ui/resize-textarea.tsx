import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ResizeTextarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = '0';
    textArea.style.height = `${textArea.scrollHeight}px`;
  }

  const textAreaRef = React.useRef<HTMLTextAreaElement>();

  const inputRef = React.useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  React.useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [props.value]);

  return (
    <textarea
      style={{ height: 0 }}
      className={cn(
        'w-full flex-grow resize-none overflow-hidden break-words bg-transparent text-[15px] tracking-normal text-accent-foreground outline-none placeholder:text-[#777777]',

        className,
      )}
      ref={inputRef}
      {...props}
    />
  );
};

ResizeTextarea.displayName = 'ResizeTextarea';

export { ResizeTextarea };
