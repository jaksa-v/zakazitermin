"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;

    // Use resolvedTheme which gives us the actual theme (light/dark) even when set to system
    if (resolvedTheme === "dark") {
      meta.setAttribute(
        "content",
        meta.getAttribute("data-dark-theme") || "hsl(229 41% 4%)"
      );
    } else {
      meta.setAttribute("content", "#ffffff");
    }
  }, [resolvedTheme]); // Watch resolvedTheme instead of theme

  return null;
}
