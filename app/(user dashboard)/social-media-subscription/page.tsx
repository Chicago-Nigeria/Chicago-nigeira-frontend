"use strict";
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Instagram, Facebook, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { callApi } from "@/app/libs/helper/callApi";

type SubscriptionFormValues = {
    businessName: string;
    businessType: string;
    hasExistingAccounts: "yes" | "no";
    instagramHandle?: string;
    facebookHandle?: string;
    tiktokHandle?: string;
    twitterHandle?: string;
    linkedinHandle?: string;
    email: string;
    phone: string;
    description: string;
};

type CreateSubscriptionSessionResponse = {
    success: boolean;
    sessionId?: string;
    url?: string;
    message?: string;
};

const BUSINESS_TYPES = [
    "Retail",
    "Food & Beverage",
    "Health & Wellness",
    "Service",
    "Technology",
    "Entertainment",
    "Other"
];

export default function SocialMediaSubscriptionPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SubscriptionFormValues>({
        defaultValues: {
            hasExistingAccounts: "yes"
        }
    });

    const hasExistingAccounts = watch("hasExistingAccounts");

    const onSubmit = async (data: SubscriptionFormValues) => {
        setIsSubmitting(true);
        try {
            const { data: responseData, error } = await callApi<CreateSubscriptionSessionResponse>(
                '/subscriptions/create-session',
                'POST',
                data
            );

            if (error) {
                toast.error(error.message || "Something went wrong. Please try again.");
                return;
            }

            if (responseData?.url) {
                toast.success("Redirecting to checkout...");
                window.location.href = responseData.url;
            } else {
                toast.error("Failed to initiate checkout. Please try again.");
            }

        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container max-md:mx-auto md:px-4 md:py-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/feeds"
                        className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Homepage
                    </Link>

                    <div className="flex justify-center mb-6">
                        <Image
                            src="/chicago-nigeria-logo-1.png"
                            alt="Chicago Nigerians"
                            width={120}
                            height={60}
                            className="h-12 w-auto object-contain"
                        />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Social Media Management Subscription
                        </h1>
                        <p className="text-sm text-gray-600">
                            Let's Help Your Business Grow Online — For Just <span className="text-green-600 font-bold">$65/Month!</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Business Information Section */}
                    <div className="border border-gray-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
                            Business Information
                        </h2>

                        <div className="space-y-6">
                            {/* Business Name */}
                            <div>
                                <label htmlFor="businessName" className="block text-xs font-bold text-gray-700 mb-2">
                                    Business Name *
                                </label>
                                <input
                                    id="businessName"
                                    type="text"
                                    placeholder="Enter your business name"
                                    className={`w-full px-4 py-3 rounded-md bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 transition-all ${errors.businessName ? 'ring-2 ring-red-500' : ''}`}
                                    {...register("businessName", { required: "Business name is required" })}
                                />
                                {errors.businessName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>
                                )}
                            </div>

                            {/* Business Type */}
                            <div>
                                <label htmlFor="businessType" className="block text-xs font-bold text-gray-700 mb-2">
                                    Business Type/Category *
                                </label>
                                <div className="relative">
                                    <select
                                        id="businessType"
                                        className={`w-full px-4 py-3 rounded-md bg-gray-100 border-none text-sm text-gray-900 focus:ring-2 focus:ring-green-500 transition-all appearance-none cursor-pointer ${errors.businessType ? 'ring-2 ring-red-500' : ''}`}
                                        {...register("businessType", { required: "Please select a business type" })}
                                    >
                                        <option value="">Select event type</option>
                                        {BUSINESS_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.businessType && (
                                    <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>
                                )}
                            </div>

                            {/* Existing Accounts Question */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-3">
                                    Do you have existing social media accounts? *
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="yes"
                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                                            {...register("hasExistingAccounts")}
                                        />
                                        <span className="text-xs text-gray-700">Yes, I have existing social media accounts</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="no"
                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                                            {...register("hasExistingAccounts")}
                                        />
                                        <span className="text-xs text-gray-700">No, please create and optimize accounts for me</span>
                                    </label>
                                </div>
                            </div>

                            {/* Green Check Section (Conditional) */}
                            {hasExistingAccounts === "no" && (
                                <div className="bg-green-100/50 border border-green-200 rounded-lg p-4  flex items-start justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="rounded-full p-0.5">
                                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                                    </div>
                                    <p className="text-xs text-green-800 leading-relaxed font-medium">
                                        <span className="font-bold text-green-700">Great!</span> We&apos;ll create and optimize professional social media pages for your business across all major platforms.
                                    </p>
                                </div>
                            )}

                            {/* Handles Input (Conditional) */}
                            {hasExistingAccounts === "yes" && (
                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <p className="text-xs font-bold text-gray-700 mb-4">
                                        Please provide your existing account handles (optional):
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Instagram */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Instagram className="w-3 h-3 text-pink-600" />
                                                <span className="text-xs font-bold text-gray-700">Instagram</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="@yourbusiness"
                                                className="w-full px-4 py-2.5 rounded-md bg-gray-200/50 border-none text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                                                {...register("instagramHandle")}
                                            />
                                        </div>

                                        {/* Facebook */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Facebook className="w-3 h-3 text-blue-600" />
                                                <span className="text-xs font-bold text-gray-700">Facebook</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Page name or URL"
                                                className="w-full px-4 py-2.5 rounded-md bg-gray-200/50 border-none text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                                                {...register("facebookHandle")}
                                            />
                                        </div>

                                        {/* TikTok */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                                </svg>
                                                <span className="text-xs font-bold text-gray-700">TikTok</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="@yourbusiness"
                                                className="w-full px-4 py-2.5 rounded-md bg-gray-200/50 border-none text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                                                {...register("tiktokHandle")}
                                            />
                                        </div>

                                        {/* X / Twitter */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                                <span className="text-xs font-bold text-gray-700">X (Twitter)</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="@yourbusiness"
                                                className="w-full px-4 py-2.5 rounded-md bg-gray-200/50 border-none text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                                                {...register("twitterHandle")}
                                            />
                                        </div>

                                        {/* LinkedIn */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Linkedin className="w-3 h-3 text-blue-700" />
                                                <span className="text-xs font-bold text-gray-700">LinkedIn</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Company page URL"
                                                className="w-full px-4 py-2.5 rounded-md bg-gray-200/50 border-none text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                                                {...register("linkedinHandle")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="border border-gray-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
                            Contact Information
                        </h2>

                        <div className="space-y-6">
                            {/* Business Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-2">
                                    Business Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="business@example.com"
                                    className={`w-full px-4 py-3 rounded-md bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 transition-all ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Business Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-2">
                                    Business Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="(312) 555-0123"
                                    className={`w-full px-4 py-3 rounded-md bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 transition-all ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                                    {...register("phone", { required: "Phone number is required" })}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-gray-700 mb-2">
                                    Brief Description of Business *
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Tell us about your business, target audience, and what makes you unique..."
                                    className={`w-full px-4 py-3 rounded-md bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 transition-all resize-none ${errors.description ? 'ring-2 ring-red-500' : ''}`}
                                    {...register("description", { required: "Description is required" })}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    This helps us create content that resonates with your audience
                                </p>
                                {errors.description && (
                                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-[#00A651] rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                        <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                            <div>
                                <p className="text-xs font-medium text-green-100 mb-1">Monthly Service Fee</p>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-4xl font-bold">$65</span>
                                    <span className="text-lg opacity-90">/month</span>
                                </div>
                                <p className="text-sm text-green-100">
                                    Professional social media management
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium">Daily content posting</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium">Community Engagement</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium">Monthly analytics report</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium">Strategy Consultation</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#00A651] text-white font-bold py-4 rounded-lg hover:bg-[#008f45] transition-colors shadow-lg shadow-green-200 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Processing..." : "Subscribe Now"}
                    </button>

                    {/* Footer */}
                    <div className="text-center space-y-4 pt-4">
                        <p className="text-xs text-gray-500">
                            Questions? Contact us at <a href="mailto:support@chicagonigerians.com" className="text-green-600 hover:underline">support@chicagonigerians.com</a>
                        </p>
                        <p className="text-xs text-gray-400">
                            © 2025 Chicago Nigerians. All rights reserved.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
