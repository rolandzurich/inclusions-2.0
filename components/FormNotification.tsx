"use client";

import { useEffect, useRef } from "react";

type NotificationType = "success" | "error" | "info";

interface FormNotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function FormNotification({
  type,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 8000, // Standard: 8 Sekunden (länger als vorher)
}: FormNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Die Notification ist fixed positioniert, also immer sichtbar
    // Auto-close nach delay
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  if (!message) return null;

  /* Neuro-inclusive: weichere Feedback-Farben, weniger alarmierend */
  const styles = {
    success: "bg-green-500/20 text-green-300 border-green-500/25",
    error: "bg-amber-500/15 text-amber-200 border-amber-500/25",
    info: "bg-blue-500/15 text-blue-200 border-blue-500/25",
  };

  const icons = {
    success: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      ref={notificationRef}
      className={`fixed left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md px-4 animate-slide-down
        top-20 md:top-24`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-start gap-3 p-4 md:p-5 rounded-xl border ${styles[type]} shadow-lg backdrop-blur-sm`}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base font-medium leading-relaxed">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current/70 hover:text-current transition-colors duration-200 ease-in-out p-1 -mr-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Nachricht schließen"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}


