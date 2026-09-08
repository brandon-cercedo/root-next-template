"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";

const math = createMathPlugin({ singleDollarTextMath: true });

type MessageMarkdownProps = {
  children: string;
  isAnimating: boolean;
};

export default function MessageMarkdown({
  children,
  isAnimating,
}: MessageMarkdownProps) {
  return (
    <Streamdown
      plugins={{ code, mermaid, math, cjk }}
      controls={{
        table: false,
        code: {
          download: false,
        },
        mermaid: {
          download: false,
          fullscreen: false,
        },
      }}
      isAnimating={isAnimating}
    >
      {children}
    </Streamdown>
  );
}
