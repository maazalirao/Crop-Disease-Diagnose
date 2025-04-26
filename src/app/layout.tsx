"use client";

import "./globals.css";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker for offline capabilities
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(function(error) {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Crop Disease Diagnosis</title>
        <meta name="description" content="AI-powered plant disease detection and treatment recommendations" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
