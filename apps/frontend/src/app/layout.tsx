import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WokiLite - Best option",
  description: "The app to get reservations in the world",
  keywords: ["restaurant", "food", "eat", "dinner", "lunch"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4 py-4">
        <div className="flex flex-dir-row justify-between content-center">
          <header className="self-center text-xl font-bold leading-[3rem]">
            <Link prefetch={false} href={"/"}>
              WokiLite
            </Link>
          </header>
          <button className="self-center">
            {" "}
            <Link prefetch={false} href={"/reservations"}>
              Ver reservas
            </Link>
          </button>
        </div>
        <main className="py-8">{children}</main>
        <footer className="text-center leading-[3rem] opacity-70">
          © {new Date().getFullYear()} WokiLite
        </footer>
      </body>
    </html>
  );
}
