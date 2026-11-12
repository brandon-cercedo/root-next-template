"use client";

import { useEffect, useEffectEvent } from "react";

import { useOverlay } from "@/hooks/use-overlay";

type OverlayEventsProps = {
  id: string;
  isMounted: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Attach `onOpen` / `onClose` callbacks to Preline overlay events.
 *
 * @note Use it only once per overlay id. Preline saves a single callback for
 * each event.
 */
export function useOverlayEvents({
  id,
  isMounted,
  onOpen,
  onClose,
}: OverlayEventsProps) {
  const { getInstance, isOpen: isOverlayOpen } = useOverlay();
  const handleOpen = useEffectEvent(() => onOpen?.());
  const handleClose = useEffectEvent(() => onClose?.());

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let cancelled = false;

    function handleEvent(isOpen: boolean) {
      if (cancelled) {
        return;
      }

      if (isOpen) {
        handleOpen();
        return;
      }

      handleClose();
    }

    async function run() {
      const instance = await getInstance(id);
      if (!instance || cancelled) {
        return;
      }

      instance.on("open", () => handleEvent(true));
      instance.on("close", () => handleEvent(false));

      const open = await isOverlayOpen(instance);
      handleEvent(open);
    }
    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isMounted]);
}
