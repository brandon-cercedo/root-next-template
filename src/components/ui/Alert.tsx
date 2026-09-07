import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideInfo,
  LucideTriangleAlert,
  LucideX,
} from "lucide-react";
import { useId, type ReactNode } from "react";

import { fixHTMLSelector } from "@/lib/utils/html";
import { mergeClsx } from "@/lib/utils/styles";

export type AlertType =
  | "dark"
  | "secondary"
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "light";

export type AlertVariant = "solid" | "soft";

type AlertStyle = {
  container: string;
  message?: string;
  dismiss: string;
};

const ALERT_STYLES: Record<AlertVariant, Record<AlertType, AlertStyle>> = {
  solid: {
    dark: {
      container: "bg-gray-900 text-white dark:bg-white dark:text-neutral-800",
      dismiss:
        "bg-gray-900 text-white/80 hover:bg-gray-800 focus:bg-gray-800 dark:bg-white dark:text-neutral-500 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100",
    },
    secondary: {
      container: "bg-gray-500 text-white dark:bg-neutral-500",
      dismiss:
        "bg-gray-500 text-white/80 hover:bg-gray-400 focus:bg-gray-400 dark:bg-neutral-500 dark:hover:bg-neutral-400 dark:focus:bg-neutral-400",
    },
    info: {
      container: "bg-blue-600 text-white dark:bg-blue-500",
      dismiss:
        "bg-blue-600 text-white/80 hover:bg-blue-500 focus:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:bg-blue-400",
    },
    success: {
      container: "bg-teal-500 text-white",
      dismiss: "bg-teal-500 text-white/80 hover:bg-teal-400 focus:bg-teal-400",
    },
    danger: {
      container: "bg-red-500 text-white",
      dismiss: "bg-red-500 text-white/80 hover:bg-red-400 focus:bg-red-400",
    },
    warning: {
      container: "bg-yellow-500 text-white",
      dismiss:
        "bg-yellow-500 text-white/80 hover:bg-yellow-400 focus:bg-yellow-400",
    },
    light: {
      container: "bg-white text-gray-800 dark:bg-white dark:text-neutral-950",
      dismiss:
        "bg-white text-gray-500 hover:bg-gray-100 focus:bg-gray-100 dark:bg-white dark:text-neutral-500 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100",
    },
  },
  soft: {
    dark: {
      container:
        "border border-gray-200 bg-gray-100 text-gray-800 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
      message: "text-gray-800 dark:text-neutral-300",
      dismiss:
        "border border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-50 focus:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600",
    },
    secondary: {
      container:
        "border border-gray-200 bg-gray-50 text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
      message: "text-gray-800 dark:text-neutral-300",
      dismiss:
        "border border-gray-200 bg-gray-50 text-gray-500 hover:bg-white focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
    },
    info: {
      container:
        "border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-500/20 dark:text-blue-400",
      message: "text-blue-800 dark:text-blue-300",
      dismiss:
        "border border-blue-200 bg-blue-100 text-blue-500 hover:bg-blue-50 focus:bg-blue-50 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-600 dark:hover:bg-blue-900 dark:focus:bg-blue-900",
    },
    success: {
      container:
        "border border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-900 dark:bg-teal-500/20 dark:text-teal-400",
      message: "text-teal-800 dark:text-teal-300",
      dismiss:
        "border border-teal-200 bg-teal-100 text-teal-500 hover:bg-teal-50 focus:bg-teal-50 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-600 dark:hover:bg-teal-900 dark:focus:bg-teal-900",
    },
    danger: {
      container:
        "border border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-500/20 dark:text-red-400",
      message: "text-red-800 dark:text-red-300",
      dismiss:
        "border border-red-200 bg-red-100 text-red-500 hover:bg-red-50 focus:bg-red-50 dark:border-red-900 dark:bg-red-950 dark:text-red-600 dark:hover:bg-red-900 dark:focus:bg-red-900",
    },
    warning: {
      container:
        "border border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-400",
      message: "text-yellow-800 dark:text-yellow-300",
      dismiss:
        "border border-yellow-200 bg-yellow-100 text-yellow-500 hover:bg-yellow-50 focus:bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-600 dark:hover:bg-yellow-900 dark:focus:bg-yellow-900",
    },
    light: {
      container: "border border-white/10 bg-white/10 text-white",
      message: "text-white",
      dismiss:
        "border border-white/10 bg-white/10 text-white hover:bg-white/50 focus:bg-white/10 dark:border-white/10 dark:bg-neutral-800 dark:text-white/80 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
    },
  },
};

function DefaultAlertIcon({ type }: { type: AlertType }) {
  switch (type) {
    case "success":
      return <LucideCircleCheck className="mt-0.5 size-4 flex-none" />;
    case "danger":
      return <LucideCircleAlert className="mt-0.5 size-4 flex-none" />;
    case "warning":
      return <LucideTriangleAlert className="mt-0.5 size-4 flex-none" />;
    default:
      return <LucideInfo className="mt-0.5 size-4 flex-none" />;
  }
}

type AlertIconProps = {
  type: AlertType;
  icon?: ReactNode | null;
};

function AlertIcon({ type, icon }: AlertIconProps) {
  if (icon === null) {
    return null;
  }

  const renderedIcon =
    icon === undefined ? <DefaultAlertIcon type={type} /> : icon;

  return <div className="flex-none">{renderedIcon}</div>;
}

type AlertProps = {
  type?: AlertType;
  variant?: AlertVariant;
  icon?: ReactNode | null;
  title?: string;
  className?: string;
  message: ReactNode;
  dismissible?: boolean;
};

export default function Alert({
  type = "dark",
  variant = "solid",
  icon,
  title,
  className,
  message,
  dismissible = false,
}: AlertProps) {
  const reactId = useId();
  const alertId = `alert-${reactId.replaceAll(":", "")}`;
  const styles = ALERT_STYLES[variant][type];

  return (
    <div
      id={alertId}
      role="alert"
      tabIndex={-1}
      className={mergeClsx(
        "rounded-xl p-4 text-[13px]",
        styles.container,
        {
          "relative transition duration-300 hs-removing:translate-x-5 hs-removing:opacity-0":
            dismissible,
        },
        className
      )}
    >
      <div className="flex gap-2">
        <AlertIcon type={type} icon={icon} />
        <div className="flex flex-col gap-1">
          {title && <h3 className="text-[13px] font-semibold">{title}</h3>}
          <div className={mergeClsx("text-[13px]", styles.message)}>
            {message}
          </div>
        </div>
      </div>
      {dismissible && (
        <button
          type="button"
          className={mergeClsx(
            "absolute -top-2.5 -right-2.5 inline-flex size-5 items-center justify-center rounded-full focus:outline-hidden",
            styles.dismiss
          )}
          data-hs-remove-element={fixHTMLSelector(alertId)}
        >
          <span className="sr-only">Dismiss</span>
          <LucideX className="size-3 flex-none" />
        </button>
      )}
    </div>
  );
}
