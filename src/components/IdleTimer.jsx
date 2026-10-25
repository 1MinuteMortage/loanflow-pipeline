import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export default function IdleTimer() {
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        base44.auth.logout(window.location.origin + "/login");
      }, IDLE_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
}