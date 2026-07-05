"use client";

import { useEffect } from "react";
import ErrorMessage from "@/components/ErrorMessage";

/**
 * App Router error boundary. Catches uncaught render/runtime errors anywhere in
 * the app that isn't covered by a more specific segment boundary, and offers a
 * retry (`reset`) instead of showing a blank screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for observability (kept out of the UI).
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center font-sans px-4">
      <ErrorMessage
        title="Something went wrong"
        message={error.message || "An unexpected error occurred. Please try again."}
        onRetry={reset}
      />
    </div>
  );
}
