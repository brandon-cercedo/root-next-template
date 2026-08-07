"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/hooks/use-theme";

import "./index.css";
import CheckCircleFillIcon from "../icons/CheckCircleFillIcon";
import ExclamationCircleFillIcon from "../icons/ExclamationCircleFillIcon";
import InfoCircleFillIcon from "../icons/InfoCircleFillIcon";
import XCircleFillIcon from "../icons/XCircleFillIcon";

export default function Toasts() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      richColors={true}
      expand={true}
      visibleToasts={5}
      position="top-right"
      closeButton={true}
      offset={"24px"}
      mobileOffset={"12px"}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "!rounded-xl !shadow-lg",
        },
      }}
      icons={{
        success: <CheckCircleFillIcon className="size-4 flex-none" />,
        error: <XCircleFillIcon className="size-4 flex-none" />,
        warning: <ExclamationCircleFillIcon className="size-4 flex-none" />,
        info: <InfoCircleFillIcon className="size-4 flex-none" />,
      }}
    />
  );
}
