import React from "react";

// Regex patterns
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
const HASHTAG_REGEX = /#(\w+)/g;

interface ParsedContent {
  type: "text" | "link" | "hashtag";
  content: string;
  href?: string;
}

// Parse content and return array of parsed segments
function parseContent(text: string): ParsedContent[] {
  const result: ParsedContent[] = [];
  let lastIndex = 0;

  // Combined regex to match both URLs and hashtags
  const combinedRegex = new RegExp(
    `(${URL_REGEX.source})|(${HASHTAG_REGEX.source})`,
    "g"
  );

  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      // URL match
      result.push({
        type: "link",
        content: match[1],
        href: match[1],
      });
    } else if (match[3]) {
      // Hashtag match (match[3] is the hashtag without #)
      result.push({
        type: "hashtag",
        content: match[2], // Full hashtag with #
        href: `/feeds?hashtag=${match[3]}`,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return result;
}

// Render parsed content as React elements
export function renderPostContent(
  text: string,
  className?: string
): React.ReactNode {
  const parsed = parseContent(text);

  return (
    <span className={className}>
      {parsed.map((segment, index) => {
        if (segment.type === "link") {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-color)] hover:underline break-all"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(segment.href, "_blank", "noopener,noreferrer");
              }}
            >
              {segment.content}
            </a>
          );
        }

        if (segment.type === "hashtag") {
          return (
            <span
              key={index}
              className="text-[var(--primary-color)] hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.location.href = segment.href!;
              }}
            >
              {segment.content}
            </span>
          );
        }

        return <span key={index}>{segment.content}</span>;
      })}
    </span>
  );
}

// Check if post is within edit timeframe (1 hour)
export function isWithinEditTimeframe(createdAt: string | Date): boolean {
  const postDate = new Date(createdAt);
  const now = new Date();
  const oneHourInMs = 60 * 60 * 1000;
  return now.getTime() - postDate.getTime() < oneHourInMs;
}

// Get remaining edit time in minutes
export function getRemainingEditTime(createdAt: string | Date): number {
  const postDate = new Date(createdAt);
  const now = new Date();
  const oneHourInMs = 60 * 60 * 1000;
  const elapsed = now.getTime() - postDate.getTime();
  const remaining = oneHourInMs - elapsed;
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
}
