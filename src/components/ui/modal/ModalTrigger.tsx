import { ButtonHTMLAttributes } from "react";

import { fixHTMLSelector } from "@/lib/utils/html";
import { mergeClsx } from "@/lib/utils/styles";

type OverlayTriggerOptions = {
  isClosePrev?: boolean;
};

interface ModalTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  modalId: string;
  className?: string;
  options?: OverlayTriggerOptions;
}

export default function ModalTrigger({
  modalId,
  className,
  children,
  options,
  ...props
}: ModalTriggerProps) {
  const modalSelector = fixHTMLSelector(modalId);

  return (
    <button
      {...props}
      className={mergeClsx(
        {
          hidden: !children,
        },
        className
      )}
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-controls={modalId}
      data-hs-overlay={modalSelector}
      data-hs-overlay-options={
        options && Object.keys(options).length > 0
          ? JSON.stringify(options)
          : undefined
      }
    >
      {children}
    </button>
  );
}
