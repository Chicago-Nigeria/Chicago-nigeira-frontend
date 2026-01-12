"use client";
import { notFound, useParams } from "next/navigation";
import Head from "next/head";
import { motion, Variants } from "framer-motion";

const pagesUnderConstruction: string[] = ["about", "contact", "marketplace", "events", "news", "ticket", "privacy-policy", "vendors", "terms-of-service", "cookies"];
const floatingVariants: Variants = {
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const slideUpVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
        },
    },
};

const scaleInVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            delay: 0.5,
        },
    },
};
export default function PageUnderConstruction() {
    const { route }: { route: string } = useParams();
    const page = route.charAt(0).toUpperCase() + route.slice(1);

    if (!pagesUnderConstruction.includes(route)) {
        notFound();
    }
    return (
    <div className="min-h-screen bg-gradient-to-br from-[#037244] via-[#049f6b] to-[#04c07e] flex items-center justify-center p-4">
        <Head>
            <title>Coming Soon</title>
            <meta name="description" content="Page is under construction" />
        </Head>
    
        <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            
            {/* Floating Elements */}
            <motion.div variants={scaleInVariants} className="relative mb-8">
                <motion.div variants={floatingVariants} animate="float" className="relative w-32 h-32 mx-auto">
                    {/* Main Gear */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0">
                        <svg className="w-full h-full text-[#d3f2e2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                        </svg>
                    </motion.div>
    
                    {/* Small Gear */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-2 -right-2 w-12 h-12">
                        <svg className="w-full h-full text-[#a7e7c9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>
    
            {/* Title */}
            <motion.h1 variants={slideUpVariants} className="text-4xl font-bold text-white mb-4">
                {page} page is currently under construction
            </motion.h1>
    
            {/* Description */}
            <motion.p variants={slideUpVariants} className="text-white/80 mb-8 text-lg leading-relaxed">
                We&apos;re crafting something extraordinary for you. Stay tuned for the big reveal!
            </motion.p>
        </motion.div>
    </div>

    );
}
