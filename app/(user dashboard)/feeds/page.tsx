import type { Metadata } from "next";
import FeedClient from "./FeedClient";

export const metadata: Metadata = {
  title: "Chicago Nigerian Community Feed | News, Stories & Updates",
  description:
    "Stay updated with the latest news, stories, and community updates for Nigerians in Chicago. Connect, share, and engage with the Chicago Nigerian diaspora.",
};

export default function FeedPage() {
  return <FeedClient />;
}
