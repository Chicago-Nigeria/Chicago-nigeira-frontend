"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { Loader2, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Subscription {
    id: string;
    planName: string;
    amount: number;
    status: string;
    uiStatus?: "active" | "cancels_soon" | "cancelled" | "expired" | "past_due" | string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    businessName: string;
    stripeSubscriptionId: string;
}

interface RenewResponse extends ApiResponse<Subscription> {
    url?: string;
    sessionId?: string;
}

const formatStatusLabel = (status: string) => {
    if (status === "past_due") return "Past Due";
    if (status === "cancels_soon") return "Cancels Soon";
    if (status === "cancelled") return "Cancelled";
    if (status === "expired") return "Expired";
    if (status === "active") return "Active";
    return status;
};

export default function SubscriptionSettings() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [renewing, setRenewing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        setLoading(true);
        const { data, error } = await callApi<ApiResponse<Subscription>>(
            "/subscriptions/my-subscription",
            "GET"
        );

        if (error) {
            console.error("Error fetching subscription:", error);
        } else {
            setSubscription(data?.data || null);
        }
        setLoading(false);
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? You will lose access at the end of the billing period.")) {
            return;
        }

        setCancelling(true);
        const { data, error } = await callApi<ApiResponse<any>>(
            "/subscriptions/cancel",
            "POST"
        );

        if (error) {
            toast.error(error.message || "Failed to cancel subscription");
        } else {
            toast.success("Subscription cancelled successfully");
            fetchSubscription();
        }
        setCancelling(false);
    };

    const handleRenewSubscription = async () => {
        setRenewing(true);
        const { data, error } = await callApi<RenewResponse>(
            "/subscriptions/renew",
            "POST"
        );

        if (error) {
            toast.error(error.message || "Failed to renew subscription");
        } else if (data?.url) {
            window.location.href = data.url;
        } else {
            toast.success("Subscription renewed successfully");
            fetchSubscription();
        }

        setRenewing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    You don't have an active social media management subscription. Get professional management for your business today.
                </p>
                <button
                    onClick={() => router.push("/social-media-subscription")}
                    className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
                >
                    View Plans
                </button>
            </div>
        );
    }

    const uiStatus = subscription.uiStatus || subscription.status;
    const isCancelling = uiStatus === "cancels_soon";
    const isActive = uiStatus === "active";
    const canRenew = uiStatus === "cancelled" || uiStatus === "expired" || uiStatus === "past_due" || uiStatus === "cancels_soon";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Manage your social media service subscription
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{subscription.planName}</h3>
                        <p className="text-sm text-gray-500">For {subscription.businessName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isActive && !isCancelling ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Active
                            </span>
                        ) : isCancelling ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Cancels Soon
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> {formatStatusLabel(uiStatus)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Billing Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${(subscription.amount / 100).toFixed(2)}<span className="text-sm font-normal text-gray-500">/month</span></p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Next Billing / Expiry Date</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {isCancelling && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Subscription Cancelled</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Your subscription has been cancelled and will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You will not be charged again.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {isActive && !isCancelling && (
                        <div className="pt-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Subscription"
                                )}
                            </button>
                        </div>
                    )}

                    {canRenew && (
                        <div className="pt-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleRenewSubscription}
                                disabled={renewing}
                                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {renewing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : uiStatus === "cancels_soon" ? (
                                    "Resume Auto-Renew"
                                ) : (
                                    "Renew Subscription"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
