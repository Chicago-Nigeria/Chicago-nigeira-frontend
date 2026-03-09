"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FacebookIcon,
    InstagramIcon,
    LinkedInIcon,
    XIcon,
} from "./icons";

export default function Footer() {
    return (
        <motion.footer
            className="container-custom py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <section className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
                <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    <Image
                        src={"/chicago-nigeria-logo-1.png"}
                        className="w-24"
                        alt="logo"
                        height={67}
                        width={163}
                    />

                    <p className="">
                        Connecting Nigerians in Chicago through culture, community, and
                        commerce. Building bridges between tradition and opportunity.
                    </p>
                    <div className="flex gap-8 max-w-80 items-center">
                        <Link
                            href={
                                "https://www.facebook.com/people/Chicago9ja/61579806144918/?mibextid=rS40aB7S9Ucbxw6v"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FacebookIcon />
                        </Link>
                        <Link
                            href={
                                "https://www.instagram.com/chicago9ja/?igsh=MWsxempzZ3d0YWR3bA%3D%3D"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <InstagramIcon />
                        </Link>
                        <Link
                            href={"https://www.linkedin.com/company/chicago-nigerians/"}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <LinkedInIcon />
                        </Link>
                        <Link
                            href={"https://x.com/chicagoNGNS?t=7BkmctvF3G2FJc1_sDyOGA&s=09"}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <XIcon />
                        </Link>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-bold text-2xl mb-2">Quick Links</h2>
                    <ul className="space-y-2 ">
                        <li>
                            <Link className="" href={"/"}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link className="" href={"/about"}>
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link className="" href={"/marketplace"}>
                                Marketplace
                            </Link>
                        </li>
                        <li>
                            <Link className="" href={"/events"}>
                                Event/Ticketing
                            </Link>
                        </li>
                        <li>
                            <Link className="" href={"/feeds"}>
                                News/Trending
                            </Link>
                        </li>
                        <li>
                            <Link className="" href={"/contact"}>
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-bold text-2xl mb-2">Get In Touch</h2>
                    <ul className="space-y-2">
                        <li className="">
                            <p className="font-semibold">Email:</p>
                            <Link
                                className="text-gray-400"
                                href={"mailto:support@chicagonigerians.com"}
                            >
                                support@chicagonigerians.com
                            </Link>
                        </li>
                        <li className="">
                            <p className="font-semibold">Phone:</p>
                            <Link className="text-gray-400" href={"tel:+1(224)245-6588"}>
                                +1 (224) 245-6588
                            </Link>
                        </li>
                        <li className="">
                            <p className="font-semibold">Address:</p>
                            <Link className="text-gray-400" href={"/"}>
                                Chicago IL
                            </Link>
                        </li>
                    </ul>
                </motion.div>
            </section>
            <hr className="my-8 block bg-gray-400 border border-gray-200" />
            <motion.section
                className="flex justify-between flex-wrap gap-8 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
            >
                <p>&copy; 2026 Chicago Nigeria, All Rights Reserved</p>
                <div className="space-x-4">
                    <Link href={"/privacy-policy"}>Privacy Policy</Link>
                    <Link href={"/terms-of-service"}>Terms of Service</Link>
                    <Link href={"/cookie-policy"}>Cookie Policy</Link>
                </div>
            </motion.section>
        </motion.footer>
    );
}
