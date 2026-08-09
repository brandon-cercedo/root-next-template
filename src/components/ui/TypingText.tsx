"use client";

import GraphemeSplitter from "grapheme-splitter";
import { ComponentProps } from "react";
import TypewriterComponent from "typewriter-effect";

const splitter = new GraphemeSplitter();
const stringSplitter = (string: string) => splitter.splitGraphemes(string);

type TypingTextProps = ComponentProps<typeof TypewriterComponent>;

/**
 * Reusable component to animate text with emoji support using a typewriter effect.
 */
export default function TypingText({ options, ...props }: TypingTextProps) {
  const mergedOptions = {
    ...options,
    stringSplitter,
  };
  return <TypewriterComponent {...props} options={mergedOptions} />;
}
