"use strict";
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Instagram, Facebook, Linkedin, CheckCircle2, Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { callApi } from "@/app/libs/helper/callApi";
import {
    SOCIAL_PACKAGES,
    SOCIAL_ADDONS,
    formatCents,
    type SocialPackage,
} from "@/app/constants/socialPackages";

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

type AddonState = {
    additional_reel: number;
    ad_campaign_setup: boolean;
    event_promotion: boolean;
    seo: boolean;
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
    const [selectedPlanId, setSelectedPlanId] = useState<SocialPackage["id"]>("silver");
    const [addons, setAddons] = useState<AddonState>({
        additional_reel: 0,
        ad_campaign_setup: false,
        event_promotion: false,
        seo: false,
    });

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

    const selectedPackage = useMemo(
        () => SOCIAL_PACKAGES.find((p) => p.id === selectedPlanId) ?? SOCIAL_PACKAGES[0],
        [selectedPlanId]
    );

    const reelAddon = SOCIAL_ADDONS.find((a) => a.id === "additional_reel")!;

    // Build the trusted list of selected add-ons (id + quantity).
    const selectedAddons = useMemo(() => {
        const list: { id: string; quantity: number; name: string; amount: number }[] = [];
        SOCIAL_ADDONS.forEach((addon) => {
            if (addon.id === "additional_reel") {
                if (addons.additional_reel > 0) {
                    list.push({
                        id: addon.id,
                        quantity: addons.additional_reel,
                        name: addon.name,
                        amount: addon.amount * addons.additional_reel,
                    });
                }
            } else if (addons[addon.id as keyof AddonState]) {
                list.push({ id: addon.id, quantity: 1, name: addon.name, amount: addon.amount });
            }
        });
        return list;
    }, [addons]);

    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.amount, 0);
    const total = selectedPackage.amount + addonsTotal;

    const toggleAddon = (id: keyof AddonState) => {
        setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const changeReelQty = (delta: number) => {
        setAddons((prev) => {
            const next = Math.max(0, Math.min(reelAddon.maxQuantity ?? 20, prev.additional_reel + delta));
            return { ...prev, additional_reel: next };
        });
    };

    const onSubmit = async (data: SubscriptionFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                planId: selectedPlanId,
                addons: selectedAddons.map((a) => ({ id: a.id, quantity: a.quantity })),
            };

            const { data: responseData, error } = await callApi<CreateSubscriptionSessionResponse>(
                '/subscriptions/create-session',
                'POST',
                payload
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
                            Choose a package to help your business grow online.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Package Selection */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Choose Your Package *</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {SOCIAL_PACKAGES.map((pkg) => {
                                const isSelected = selectedPlanId === pkg.id;
                                return (
                                    <button
                                        key={pkg.id}
                                        type="button"
                                        onClick={() => setSelectedPlanId(pkg.id)}
                                        className={`relative text-left rounded-xl border-2 p-5 transition-all bg-white ${isSelected
                                            ? "border-[#00A651] shadow-lg shadow-green-100 ring-1 ring-[#00A651]"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        {pkg.highlight && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#00A651] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
                                                Most Popular
                                            </span>
                                        )}
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                                            <span
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#00A651] bg-[#00A651]" : "border-gray-300"
                                                    }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline mb-3">
                                            <span className="text-2xl font-bold text-gray-900">{formatCents(pkg.amount)}</span>
                                            <span className="text-xs text-gray-500 ml-1">/month</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{pkg.tagline}</p>
                                        <ul className="space-y-1.5">
                                            {pkg.features.map((f) => (
                                                <li key={f} className="flex items-start gap-1.5 text-xs text-gray-700">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0 mt-0.5" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optional Add-Ons */}
                    <div className="border border-gray-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Optional Add-Ons</h2>
                        <p className="text-xs text-gray-500 mb-6">Enhance your plan with extra services (billed monthly).</p>

                        <div className="space-y-3">
                            {SOCIAL_ADDONS.map((addon) => {
                                if (addon.id === "additional_reel") {
                                    const qty = addons.additional_reel;
                                    return (
                                        <div
                                            key={addon.id}
                                            className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${qty > 0 ? "border-[#00A651] bg-green-50/40" : "border-gray-200"
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                                                <p className="text-xs text-gray-500">{formatCents(addon.amount)} {addon.unitLabel}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => changeReelQty(-1)}
                                                    disabled={qty === 0}
                                                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-bold text-gray-900">{qty}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => changeReelQty(1)}
                                                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                const checked = addons[addon.id as keyof AddonState] as boolean;
                                return (
                                    <label
                                        key={addon.id}
                                        className={`flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${checked ? "border-[#00A651] bg-green-50/40" : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleAddon(addon.id as keyof AddonState)}
                                                className="w-4 h-4 rounded text-[#00A651] border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {formatCents(addon.amount)}{addon.unitLabel === "/month" ? "/mo" : ""}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

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
                                        <option value="">Select business type</option>
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

                    {/* Order Summary / Pricing Card */}
                    <div className="bg-[#00A651] rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                        <div className="relative z-10">
                            <p className="text-xs font-medium text-green-100 mb-4 uppercase tracking-wide">Order Summary</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{selectedPackage.name}</span>
                                    <span className="font-medium">{formatCents(selectedPackage.amount)}/mo</span>
                                </div>
                                {selectedAddons.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between text-sm text-green-100">
                                        <span>
                                            {a.name}
                                            {a.quantity > 1 ? ` × ${a.quantity}` : ""}
                                        </span>
                                        <span>{formatCents(a.amount)}/mo</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/20 pt-4 flex items-baseline justify-between">
                                <span className="text-sm font-medium text-green-100">Total billed monthly</span>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold">{formatCents(total)}</span>
                                    <span className="text-lg opacity-90">/month</span>
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
                        {isSubmitting ? "Processing..." : `Subscribe Now — ${formatCents(total)}/mo`}
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
