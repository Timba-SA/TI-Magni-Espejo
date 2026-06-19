import { useEffect, useRef } from "react";
import { getSessionRemainingMs, refreshSession } from "@/features/auth/services/authService";

// Refresh the token when less than this much time remains
const REFRESH_THRESHOLD_MS = 10 * 60 * 1000;
// Consider the user "active" if they interacted within this window
const ACTIVITY_WINDOW_MS = 2 * 60 * 1000;
// How often to check whether a refresh is needed
const CHECK_INTERVAL_MS = 60_000;

const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;

export function useSessionRefresh() {
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, updateActivity, { passive: true })
    );

    const interval = setInterval(async () => {
      const remaining = getSessionRemainingMs();
      const recentlyActive = Date.now() - lastActivityRef.current < ACTIVITY_WINDOW_MS;

      if (
        remaining > 0 &&
        remaining < REFRESH_THRESHOLD_MS &&
        recentlyActive &&
        !isRefreshingRef.current
      ) {
        isRefreshingRef.current = true;
        try {
          await refreshSession();
        } finally {
          isRefreshingRef.current = false;
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, []);
}
