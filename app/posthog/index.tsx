"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import PostHogPageView from "./page-view";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (process.env.NODE_ENV !== "production") {
      console.log("PostHog is disabled in non-production environments");
      return;
    }

    if (!apiKey || !apiHost) {
      console.warn("PostHog environment variables are not set");
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
