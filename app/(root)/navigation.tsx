"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  // { label: "Marketplace", href: "/marketplace" },
  // { label: "Event/Ticketing", href: "/events" },
  // { label: "News/Trending", href: "/feed" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleClose = () => setIsMobileOpen(false);

  return (
    <nav className="shadow-[0_4px_46px_-14px_#00000040] py-2 relative z-50 bg-white">
      <div className="container-custom mx-auto flex w-full justify-between items-center">
        {/* Logo */}
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/chicago-nigeria-logo-1.png"
            alt="Chicago Nigeria Logo"
            width={113}
            height={17}
            className="w-20"
            priority
          />
        </Link>

        <div className="flex space-x-5 items-center justify-between">
          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-2">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="px-4 py-8 inline-block hover:text-[#037244] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Button (Desktop) */}
          <Link
            href="/feeds"
            className="hidden md:inline-block bg-gradient-to-r from-[#037244] to-[#04C977] text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            Join Us +
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Open mobile navigation"
          className="md:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Image
            src="/chicago-nigeria-logo-1.png"
            alt="Logo"
            width={113}
            height={17}
          />
          <button aria-label="Close mobile navigation" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <ul className="flex flex-col">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={handleClose}
                className="px-6 py-3 block hover:bg-gray-100 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="p-6 border-t">
          <Link
            href="/feeds"
            onClick={handleClose}
            className="w-full text-center bg-gradient-to-r from-[#037244] to-[#04C977] text-white px-4 py-2 rounded-lg block font-medium shadow-md hover:shadow-lg transition-all"
          >
            Join Us +
          </Link>
        </div>
      </aside>
    </nav>
  );
}
