"use client";

import { useTransition } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import Modal from "@/components/ui/modal/Modal";
import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { mergeClsx } from "@/lib/utils/styles";

export default function ConfirmationModal() {
  const { options, handleConfirm, handleCancel } = useConfirmationModal();
  const [isLoading, startTransition] = useTransition();

  if (!options) {
    return null;
  }

  const closeButton = options.closeButton;
  const confirmButton = options.confirmButton;

  const onCancel = () => {
    startTransition(handleCancel);
  };

  const onConfirm = () => {
    startTransition(handleConfirm);
  };

  return (
    <Modal
      id={OVERLAY_IDS.CONFIRMATION}
      className="gap-4 p-4"
      isVerticallyCentered={true}
      showCloseButton={true}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-neutral-200">
          {options.title}
        </h3>
      </div>
      <div className="text-sm text-gray-600 dark:text-neutral-400">
        {options.message}
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className={mergeClsx(
            "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs leading-5 font-medium text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            closeButton?.className
          )}
          onClick={onCancel}
          disabled={isLoading}
        >
          {closeButton?.label ?? "Close"}
        </button>
        <button
          type="button"
          className={mergeClsx(
            "inline-flex items-center gap-2 rounded-lg border border-transparent bg-red-500 px-2 py-1 text-xs leading-5 font-medium text-white hover:bg-red-600 focus:bg-red-600 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            confirmButton?.className
          )}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && (
            <SpinnerIcon
              size="xs"
              className="size-3.5 flex-none text-white dark:text-white"
            />
          )}
          <span>{confirmButton?.label ?? "Confirm"}</span>
        </button>
      </div>
    </Modal>
  );
}
