"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "chicago-nigeria-cookie-consent";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4 text-center sm:text-left">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-[var(--primary-color)]/10 items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-[var(--primary-color)]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Cookie className="w-5 h-5 text-[var(--primary-color)] sm:hidden" />
                    <h3 className="font-semibold text-gray-900">We use cookies</h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our{" "}
                    <Link
                      href="/cookie-policy"
                      target="_blank"
                      className="text-[var(--primary-color)] hover:underline font-medium"
                    >
                      Cookie Policy
                    </Link>{" "}
                    to learn more.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleAccept}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleDecline}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Decline
                    </button>
                    <Link
                      href="/cookie-policy"
                      target="_blank"
                      className="w-full sm:w-auto px-6 py-2.5 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDecline}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close cookie banner"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
