import React from "react";

const URL_REGEX = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
const PHONE_REGEX = /(\+?\d[\d\s\-().]{7,}\d)/g;
const COMBINED = /(https?:\/\/[^\s)]+|www\.[^\s)]+)|(\+?\d[\d\s\-().]{7,}\d)/g;

const linkClass =
  "text-[var(--primary-color)] underline hover:no-underline font-medium break-all";

export const autolinkText = (text: string): React.ReactNode => {
  if (!text) return text;

  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(COMBINED);
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }
    const url = match[1];
    const phone = match[2];

    if (url) {
      const href = url.startsWith("http") ? url : `https://${url}`;
      out.push(
        <a
          key={`u-${key++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {url}
        </a>
      );
    } else if (phone) {
      // Phone must contain enough digits to be real
      const digits = phone.replace(/[^\d]/g, "");
      if (digits.length < 7) {
        out.push(phone);
      } else {
        const cleanNumber = phone.replace(/[\s\-().]/g, "");
        out.push(
          <a
            key={`p-${key++}`}
            href={`tel:${cleanNumber}`}
            className={linkClass}
          >
            {phone}
          </a>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }
  return out;
};
