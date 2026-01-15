"use client";

import { useEffect } from "react";
import { usePause, useResume } from "../state/store";

export function useVisibilityPause() {
  const pause = usePause();
  const resume = useResume();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pause, resume]);
}
