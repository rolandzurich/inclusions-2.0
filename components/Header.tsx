"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/rueckblick", label: "Rückblick" },
  { href: "/djs", label: "DJ's" },
  { href: "/dance-crew", label: "Dance Crew" },
  { href: "/medien", label: "Medien" },
];

const ueberUnsSubmenu = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/vision", label: "Unsere Vision" },
  { href: "/ki-innovator", label: "KI-First Social Innovator" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [ueberUnsOpen, setUeberUnsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUeberUnsOpen(false);
      }
    }

    if (ueberUnsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ueberUnsOpen]);

  return (
    <header className="bg-brand-dark sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/inclusions-logo.png"
            alt="Inclusions Logo"
            width={200}
            height={60}
            className="h-20 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-white lg:flex">
          <Link
            href="/anmeldung"
            className="rounded-full border border-brand-pink px-4 py-2 text-sm font-bold text-brand-pink hover:bg-brand-pink hover:text-brand-dark transition-colors"
          >
            Newsletter
          </Link>
          <Link
            href="/anmeldung/vip"
            className="rounded-full border border-brand-pink px-4 py-2 text-sm font-bold text-brand-pink hover:bg-brand-pink hover:text-brand-dark transition-colors"
          >
            VIP Anmeldung
          </Link>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-pink">
              {link.label}
            </Link>
          ))}
          {/* Über uns Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUeberUnsOpen(!ueberUnsOpen)}
              className="hover:text-brand-pink flex items-center gap-1"
            >
              Über uns
              <svg
                className={`w-4 h-4 transition-transform ${ueberUnsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {ueberUnsOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-brand-dark border border-white/10 rounded-lg shadow-lg overflow-hidden">
                {ueberUnsSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm hover:bg-white/10 hover:text-brand-pink transition-colors"
                    onClick={() => setUeberUnsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/spenden"
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-bold text-brand-dark"
          >
            Spenden
          </Link>
        </nav>
        <button
          className="lg:hidden"
          aria-label="Menü öffnen"
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="space-y-1">
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
          </div>
        </button>
      </div>
      {open && (
        <div className="bg-brand-dark lg:hidden">
          <div className="space-y-4 px-4 pb-6 pt-2 text-lg">
            <Link
              href="/anmeldung"
              className="block text-brand-pink font-bold"
              onClick={() => setOpen(false)}
            >
              Newsletter
            </Link>
            <Link
              href="/anmeldung/vip"
              className="block text-brand-pink font-bold"
              onClick={() => setOpen(false)}
            >
              VIP Anmeldung
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2">
              <div className="text-white font-semibold">Über uns</div>
              {ueberUnsSubmenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-white/70 pl-4"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              href="/spenden"
              className="block text-brand-pink font-bold"
              onClick={() => setOpen(false)}
            >
              Spenden
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

