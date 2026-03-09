import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
    title: "About Us | Chicago Nigerians",
    description:
        "Learn about the 7 F's of the Chicago Nigerian Community: Family, Friendship, Fashion, Faith, Food, Finance, and Fun. Discover the core principles that unite the Nigerian diaspora in Chicago.",
};

export default function AboutPage() {
    return <AboutClient />;
}
