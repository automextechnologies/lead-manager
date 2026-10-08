"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes fresh
            gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration skipped:", err);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
