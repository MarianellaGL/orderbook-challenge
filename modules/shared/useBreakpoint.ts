"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("md");
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      setBreakpoint(getBreakpoint(newWidth));
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: breakpoint === "xs",
    isTablet: breakpoint === "sm" || breakpoint === "md",
    isDesktop: breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
    isAtLeast: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
    isAtMost: (bp: Breakpoint) => width < BREAKPOINTS[bp],
  };
}
