"use client";

import Link from "next/link";
import { Bookmark, Compass, Menu, ScanLine, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { copy } from "@/i18n/en";

const navItems = [
  { href: "/", label: copy.nav.discover, icon: Compass },
  { href: "/search", label: copy.nav.search, icon: Search },
  { href: "/scan", label: copy.nav.scan, icon: ScanLine, primary: true },
  { href: "/saved", label: copy.nav.saved, icon: Bookmark },
  { href: "/more", label: copy.nav.more, icon: Menu }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav__item ${active ? "is-active" : ""} ${
              item.primary ? "app-nav__item--primary" : ""
            }`}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
