"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Users,
    Heart,
    Sparkles,
    BookHeart,
    Utensils,
    TrendingUp,
    PartyPopper,
} from "lucide-react";
import {
    FacebookIcon,
    InstagramIcon,
    LinkedInIcon,
    XIcon,
} from "../../components/icons";
import Footer from "../../components/Footer";

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const pillars = [
    {
        title: "Family",
        description:
            "Family is the foundation of Nigerian culture. We celebrate strong family bonds, respect for elders, and the importance of supporting one another across generations.",
        icon: <Users className="w-8 h-8 text-[var(--primary-color)]" />,
        color: "var(--primary-color)",
    },
    {
        title: "Friendship",
        description:
            "Community and relationships are central to Nigerian life. We believe in building meaningful friendships that create networks of support, collaboration, and belonging.",
        icon: <Heart className="w-8 h-8 text-pink-500" />,
        color: "#ec4899",
    },
    {
        title: "Fashion",
        description:
            "Nigerians are globally recognized for their vibrant fashion, creativity, and style. From traditional attire to modern trends, fashion is a proud expression of culture and identity.",
        icon: <Sparkles className="w-8 h-8 text-purple-500" />,
        color: "#a855f7",
    },
    {
        title: "Faith",
        description:
            "Faith plays a significant role in the lives of many Nigerians. Whether through church, mosque, or personal spirituality, faith provides guidance, hope, and unity.",
        icon: <BookHeart className="w-8 h-8 text-blue-500" />,
        color: "#3b82f6",
    },
    {
        title: "Food",
        description:
            "Nigerian cuisine is rich, diverse, and deeply cultural. Food brings people together and is often the centerpiece of celebration, hospitality, and community gatherings.",
        icon: <Utensils className="w-8 h-8 text-orange-500" />,
        color: "#f97316",
    },
    {
        title: "Finance",
        description:
            "Entrepreneurship, hard work, and economic progress are important values within the Nigerian community. We encourage financial empowerment, business growth, and shared opportunities.",
        icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
        color: "#10b981",
    },
    {
        title: "Fun",
        description:
            "Nigerians are known for their joyful spirit, music, celebrations, and love of life. From cultural festivals to social events, we believe in enjoying life and celebrating together.",
        icon: <PartyPopper className="w-8 h-8 text-yellow-500" />,
        color: "#eab308",
    },
];

export default function AboutClient() {
    return (
        <>
            <main className="min-h-screen bg-gray-50 pb-20">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#DCFFF0] to-[#FFF3F3] py-12 md:py-20 px-4 relative overflow-hidden">
                    <div className="container-custom mx-auto max-w-4xl text-center relative z-10">
                        <motion.h1
                            className="text-3xl md:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            The <span className="text-[var(--primary-color)]">7 F's</span> of the Chicago Nigerian Community
                        </motion.h1>
                        <motion.p
                            className="text-base md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            At <strong>Chicago Nigerians</strong>, our community is guided by seven core pillars that reflect the heart of the Nigerian identity and the values that unite us as a people. These principles represent the everyday lifestyle, priorities, and spirit of the average Nigerian.
                        </motion.p>
                    </div>
                </section>

                {/* Core Principles Grid */}
                <section className="container-custom mx-auto mt-[-20px] md:mt-[-40px] px-4 relative z-20">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        {pillars.map((pillar, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className={`bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col h-full`}
                                style={{ borderTopColor: pillar.color }}
                            >
                                <div className="bg-gray-50 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-sm">
                                    {pillar.icon}
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">{pillar.title}</h2>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">
                                    {pillar.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Conclusion & CTA */}
                <section className="container-custom mx-auto mt-12 md:mt-20 px-4">
                    <motion.div
                        className="bg-white rounded-3xl p-8 md:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-4xl mx-auto"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Built on Unity and Resilience</h2>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto">
                            Together, these seven pillars reflect the vibrant diversity, resilience, and unity of Nigerians living in Chicago and across the diaspora. Our platform operates around these wheels, bringing us closer to home while we build our future.
                        </p>
                        <Link
                            href="/feeds?action=signin"
                            className="inline-block bg-gradient-to-r from-[#037244] to-[#04C977] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
                        >
                            Join the Community Today
                        </Link>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </>
    );
}
