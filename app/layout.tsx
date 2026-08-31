import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import { copy } from "@/i18n/en";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.appName,
  description: "Discover Canadian small businesses and verify Canadian product claims."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="topbar">
            <a className="brand" href="/">
              <span className="brand__mark" aria-hidden="true">M</span>
              <span>{copy.appName}</span>
            </a>
            <a className="topbar__method" href="/methodology">
              Methodology
            </a>
          </header>
          <main>{children}</main>
          <AppNav />
        </div>
      </body>
    </html>
  );
}
