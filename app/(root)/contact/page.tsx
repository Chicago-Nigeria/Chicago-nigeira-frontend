"use strict";
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    ChevronDown,
    ChevronUp,
    Send,
    AlertCircle
} from "lucide-react";
import {
    FacebookIcon,
    InstagramIcon,
    LinkedInIcon,
    XIcon
} from "../../components/icons";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { callApi } from "@/app/libs/helper/callApi";

type ContactFormValues = {
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    customSubject?: string;
    inquiryType: string;
    message: string;
    agreeToTerms: boolean;
};

const FAQ_ITEMS = [
    {
        question: "How do I post an event?",
        answer: "You can post an event by navigating to the Events page and clicking on the 'Create Event' button. You'll need to be signed in to create listings."
    },
    {
        question: "How do ticket sales work?",
        answer: "When you sell tickets on Chicago Nigerians, we handle the payment processing securely. Payouts are processed to your connected stripe account after the event."
    },
    {
        question: "How do I list my business in the marketplace?",
        answer: "Visit the Marketplace section and click 'Create Listing'. Choose the 'Business' category to get started with your business profile."
    },
    {
        question: "How do I report a user or content?",
        answer: "If you encounter content that violates our community guidelines, please use the 'Report' button on the specific post or contact us directly via this form."
    }
];

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ContactFormValues>({
        defaultValues: {
            subject: "",
            inquiryType: ""
        }
    });

    const selectedSubject = watch("subject");

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true);
        try {
            // Use custom subject if "other" is selected
            const payload = {
                ...data,
                subject: data.subject === "other" ? (data.customSubject || "Other") : data.subject
            };

            // Remove customSubject from payload to keep it clean
            if ('customSubject' in payload) {
                delete (payload as any).customSubject;
            }

            const { error } = await callApi('/contact', 'POST', payload);

            if (error) {
                console.error(error);
                toast.error(error.message || "Failed to send message. Please try again.");
                return;
            }

            toast.success("Message sent successfully! We'll get back to you soon.");
            reset();
        } catch (error: any) {
            console.error(error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-16 pt-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Contact <span className="text-[var(--primary-color)]">ChicagoNigerians</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Have a question, partnership idea, or need support? Send us a message
                        and our team will respond within 24–48 hours.
                    </p>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Link
                            href="/events/create"
                            className="px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors shadow-sm"
                        >
                            Post an Event
                        </Link>
                        <Link
                            href="/events"
                            className="px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors shadow-sm"
                        >
                            Sell Tickets
                        </Link>
                        <Link
                            href="/marketplace/create-listing"
                            className="px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors shadow-sm"
                        >
                            List Your Business
                        </Link>
                        <button
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Report an Issue
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
                    {/* Left Column: Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Get in Touch
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="sr-only">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20'} outline-none focus:ring-2 transition-all`}
                                    {...register("fullName", { required: "Full name is required" })}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="sr-only">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20'} outline-none focus:ring-2 transition-all`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone (Optional) */}
                            <div>
                                <label htmlFor="phone" className="sr-only">Phone (optional)</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Phone (optional)"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all"
                                    {...register("phone")}
                                />
                            </div>

                            {/* Subject Dropdown */}
                            <div className="relative">
                                <select
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.subject ? 'border-red-300' : 'border-gray-200'} outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all appearance-none cursor-pointer text-gray-600`}
                                    {...register("subject", { required: "Please select a subject" })}
                                >
                                    <option value="">Subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="advertising">Advertising</option>
                                    <option value="other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                {errors.subject && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.subject.message}</p>
                                )}
                            </div>

                            {/* Custom Subject Input (Conditional) */}
                            {selectedSubject === "other" && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <label htmlFor="customSubject" className="sr-only">Specify Subject</label>
                                    <input
                                        id="customSubject"
                                        type="text"
                                        placeholder="Please specify subject"
                                        className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.customSubject ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20'} outline-none focus:ring-2 transition-all`}
                                        {...register("customSubject", {
                                            required: selectedSubject === "other" ? "Please specify the subject" : false
                                        })}
                                    />
                                    {errors.customSubject && (
                                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.customSubject.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Inquiry Dropdown */}
                            <div className="relative">
                                <select
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.inquiryType ? 'border-red-300' : 'border-gray-200'} outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all appearance-none cursor-pointer text-gray-600`}
                                    {...register("inquiryType", { required: "Please select an inquiry type" })}
                                >
                                    <option value="">Inquiry Type</option>
                                    <option value="question">Question</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="issue">Report Issue</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                {errors.inquiryType && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.inquiryType.message}</p>
                                )}
                            </div>


                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="sr-only">Tell us how we can help...</label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    placeholder="Tell us how we can help..."
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.message ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20'} outline-none focus:ring-2 transition-all resize-none`}
                                    {...register("message", { required: "Message is required", minLength: { value: 20, message: "Message must be at least 20 characters" } })}
                                ></textarea>
                                {errors.message && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.message.message}</p>
                                )}
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="flex items-start gap-3">
                                <div className="flex items-center h-5">
                                    <input
                                        id="agreeToTerms"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                        {...register("agreeToTerms", { required: "You must agree to the terms" })}
                                    />
                                </div>
                                <label htmlFor="agreeToTerms" className="text-sm text-gray-500 transform -translate-y-0.5">
                                    I agree to the <Link href="/terms" className="text-[var(--primary-color)] underline hover:text-[var(--primary-color)]/80">Terms & Privacy Policy</Link>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="text-red-500 text-xs ml-1">{errors.agreeToTerms.message}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-[var(--primary-color)] text-white font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Sending...</>
                                ) : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400">For urgent concerns, please email us directly.</p>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Info & Sidebar */}
                    <div className="space-y-6">

                        {/* Reach Us Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="border-b border-gray-100 pb-4 mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Reach Us</h2>
                            </div>

                            <div className="space-y-4">
                                <a href="mailto:support@chicagonigerians.com" className="flex items-center gap-3 text-gray-600 hover:text-[var(--primary-color)] transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-[var(--primary-color)] transition-colors">
                                        <Mail className="w-4 h-4 text-[var(--primary-color)] group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-sm">support@chicagonigerians.com</span>
                                </a>

                                <a href="tel:+12242456588" className="flex items-center gap-3 text-gray-600 hover:text-[var(--primary-color)] transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-[var(--primary-color)] transition-colors">
                                        <Phone className="w-4 h-4 text-[var(--primary-color)] group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-sm">+1 (224) 245-6588</span>
                                </a>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                                    </div>
                                    <span className="text-sm">Chicago, IL</span>
                                </div>

                                {/* Social Media Icons */}
                                <div className="flex gap-3 pt-2">
                                    <a href="https://www.instagram.com/chicago9ja/?igsh=MWsxempzZ3d0YWR3bA%3D%3D" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors"><InstagramIcon size={30} /></a>
                                    <a href="https://www.facebook.com/people/Chicago9ja/61579806144918/?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors"><FacebookIcon size={30} /></a>
                                    <a href="https://www.linkedin.com/company/chicago-nigerians/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><LinkedInIcon size={32} /></a>
                                    <a href="https://x.com/chicagoNGNS?t=7BkmctvF3G2FJc1_sDyOGA&s=09" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors"><XIcon size={28} /></a>
                                </div>
                            </div>
                        </div>

                        {/* Support Hours Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Support Hours</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="flex justify-between">
                                    <span>Mon - Fri:</span>
                                    <span className="font-medium text-gray-900">9am - 5pm (CT)</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Email response:</span>
                                    <span className="font-medium text-gray-900">24-48 hrs</span>
                                </p>
                            </div>
                        </div>

                        {/* Community Guidelines Card */}
                        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-2 text-sm">Community Guidelines</h3>
                            <p className="text-sm text-gray-600">
                                Read our <Link href="/guidelines" className="text-[var(--primary-color)] underline decoration-dotted hover:decoration-solid">guidelines</Link> before posting to ensure a safe community for everyone.
                            </p>
                        </div> */}

                        {/* Map Placeholder */}
                        {/* <div className="rounded-2xl overflow-hidden h-48 bg-gray-200 relative group border border-gray-200 shadow-sm">
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                <MapPin className="w-10 h-10 text-gray-400" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 text-center text-xs text-gray-600 font-medium">
                                Serving Nigerians across Chicago & Chicagoland
                            </div>
                        </div> */}

                        {/* FAQ Accordion */}
                        <div className="space-y-2">
                            {FAQ_ITEMS.map((item, index) => (
                                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-[var(--primary-color)]" />
                                            {item.question}
                                        </span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {openFaqIndex === index && (
                                        <div className="px-4 pb-4 pt-1 bg-gray-50 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
