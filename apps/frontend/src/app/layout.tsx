"use client";
import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { Header } from "./components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4 py-4">
          <Header />
          <main className="py-8">{children}</main>
          <footer className="text-center leading-[3rem] opacity-70">
            © {new Date().getFullYear()} WokiLite
          </footer>
        </body>
      </SessionProvider>
    </html>
  );
}
