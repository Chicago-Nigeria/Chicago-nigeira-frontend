"use client";
import { motion } from "framer-motion";
import Head from "next/head";

export default function PageInConstruction() {
	return (
		<div
			className="min-h-[100dvh] md:min-h-160 flex items-center justify-center bg-white text-center p-6"
			style={{ "--primary-color": "#037244" } as React.CSSProperties}
		>
			<Head>
				<title>Coming Soon</title>
				<meta
					name="description"
					content="Something amazing is on the way!"
				/>
			</Head>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="space-y-4"
			>
				<h1
					className="text-4xl md:text-6xl font-bold"
					style={{ color: "var(--primary-color)" }}
				>
				  Coming Soon
				</h1>
				<p className="text-gray-600 max-w-md mx-auto">
					We’re working hard to bring something great. Stay tuned!
				</p>
				<div className="w-16 h-1 bg-[var(--primary-color)] mx-auto rounded-full"></div>
			</motion.div>
		</div>
	);
}
