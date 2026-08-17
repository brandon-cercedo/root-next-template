"use client";

import { forwardRef, useEffect, useRef } from "react";

function updateTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export type TextareaAutoHeightProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaAutoHeight = forwardRef<
  HTMLTextAreaElement,
  TextareaAutoHeightProps
>((props, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = ref || internalRef;

  useEffect(() => {
    if (typeof textareaRef === "object" && textareaRef?.current) {
      updateTextareaHeight(textareaRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
    updateTextareaHeight(e.currentTarget);
    props.onInput?.(e);
  };

  return <textarea {...props} ref={textareaRef} onInput={handleInput} />;
});

TextareaAutoHeight.displayName = "TextareaAutoHeight";

export default TextareaAutoHeight;
