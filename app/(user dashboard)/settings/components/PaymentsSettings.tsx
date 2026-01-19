"use client";

import { useState, useEffect } from "react";
import {
	CreditCard,
	ExternalLink,
	CheckCircle,
	XCircle,
	Loader2,
	DollarSign,
	Clock,
	TrendingUp,
	AlertCircle,
	RefreshCw,
} from "lucide-react";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { toast } from "sonner";

interface StripeAccountStatus {
	hasAccount: boolean;
	accountId?: string;
	isOnboardingComplete: boolean;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	businessName?: string;
}

interface PayoutHistoryItem {
	id: string;
	eventId: string;
	amount: number;
	status: string;
	payoutMethod: "stripe" | "manual";
	scheduledFor: string;
	processedAt?: string;
}

interface EarningsSummary {
	totalEarnings: number;
	pendingPayouts: number;
	completedPayouts: number;
	payoutHistory: PayoutHistoryItem[];
}

export default function PaymentsSettings() {
	const [isLoading, setIsLoading] = useState(true);
	const [isConnecting, setIsConnecting] = useState(false);
	const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
	const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
	const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

	useEffect(() => {
		fetchAccountStatus();
	}, []);

	useEffect(() => {
		// Check for success/refresh query params (after Stripe onboarding redirect)
		const params = new URLSearchParams(window.location.search);
		if (params.get("success") === "true") {
			toast.success("Stripe account connected successfully!");
			fetchAccountStatus();
			// Clean up URL
			window.history.replaceState({}, "", window.location.pathname);
		} else if (params.get("refresh") === "true") {
			toast.info("Please complete your Stripe onboarding");
			handleRefreshOnboarding();
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, []);

	const fetchAccountStatus = async () => {
		setIsLoading(true);
		try {
			const response = await callApi<ApiResponse<StripeAccountStatus>>(
				"/payments/connect/status",
				"GET"
			);

			if (response.data?.data) {
				setAccountStatus(response.data.data);

				// Fetch earnings if account is set up
				if (response.data.data.hasAccount && response.data.data.chargesEnabled) {
					fetchEarnings();
				}
			}
		} catch (error) {
			console.error("Error fetching account status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchEarnings = async () => {
		setIsLoadingEarnings(true);
		try {
			const response = await callApi<ApiResponse<EarningsSummary>>(
				"/payments/earnings",
				"GET"
			);

			if (response.data?.data) {
				setEarnings(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching earnings:", error);
		} finally {
			setIsLoadingEarnings(false);
		}
	};

	const handleConnectStripe = async () => {
		setIsConnecting(true);
		try {
			const response = await callApi<ApiResponse<{ onboardingUrl: string; accountId: string }>>(
				"/payments/connect/create",
				"POST"
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data?.data?.onboardingUrl) {
				// Redirect to Stripe onboarding
				window.location.href = response.data.data.onboardingUrl;
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to connect Stripe account");
		} finally {
			setIsConnecting(false);
		}
	};

	const handleRefreshOnboarding = async () => {
		setIsConnecting(true);
		try {
			const response = await callApi<ApiResponse<{ onboardingUrl: string }>>(
				"/payments/connect/refresh-link",
				"POST"
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data?.data?.onboardingUrl) {
				window.location.href = response.data.data.onboardingUrl;
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to refresh onboarding link");
		} finally {
			setIsConnecting(false);
		}
	};

	const handleOpenDashboard = async () => {
		try {
			const response = await callApi<ApiResponse<{ dashboardUrl: string }>>(
				"/payments/connect/dashboard",
				"GET"
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data?.data?.dashboardUrl) {
				window.open(response.data.data.dashboardUrl, "_blank");
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to open Stripe dashboard");
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
						<CheckCircle className="w-3 h-3" />
						Paid
					</span>
				);
			case "pending":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
						<Clock className="w-3 h-3" />
						Pending
					</span>
				);
			case "failed":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
						<XCircle className="w-3 h-3" />
						Failed
					</span>
				);
			case "cancelled":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
						<XCircle className="w-3 h-3" />
						Cancelled
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
						{status}
					</span>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
				<p className="text-sm text-gray-600 mt-1">
					Connect your Stripe account to receive payouts from ticket sales
				</p>
			</div>

			{/* Stripe Connect Status */}
			<div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
				<div className="flex items-start gap-4">
					<div className="w-12 h-12 rounded-xl bg-[#635BFF] flex items-center justify-center flex-shrink-0">
						<CreditCard className="w-6 h-6 text-white" />
					</div>

					<div className="flex-1">
						<h3 className="font-semibold text-gray-900">Stripe Connect</h3>

						{!accountStatus?.hasAccount ? (
							<>
								<p className="text-sm text-gray-600 mt-1 mb-4">
									Connect your Stripe account to receive payments from your event ticket sales.
									Payouts are processed automatically after your events end.
								</p>
								<button
									onClick={handleConnectStripe}
									disabled={isConnecting}
									className="inline-flex items-center gap-2 px-4 py-2 bg-[#635BFF] text-white text-sm font-medium rounded-lg hover:bg-[#635BFF]/90 transition-colors disabled:opacity-50"
								>
									{isConnecting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Connecting...
										</>
									) : (
										<>
											<CreditCard className="w-4 h-4" />
											Connect with Stripe
										</>
									)}
								</button>
							</>
						) : !accountStatus.isOnboardingComplete ? (
							<>
								<div className="flex items-center gap-2 mt-2 mb-4">
									<AlertCircle className="w-4 h-4 text-yellow-500" />
									<span className="text-sm text-yellow-700">
										Onboarding incomplete - please complete your Stripe setup
									</span>
								</div>
								<button
									onClick={handleRefreshOnboarding}
									disabled={isConnecting}
									className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
								>
									{isConnecting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Loading...
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4" />
											Complete Onboarding
										</>
									)}
								</button>
							</>
						) : (
							<>
								<div className="flex flex-wrap items-center gap-3 mt-2">
									{accountStatus.chargesEnabled && (
										<span className="inline-flex items-center gap-1 text-sm text-green-600">
											<CheckCircle className="w-4 h-4" />
											Charges enabled
										</span>
									)}
									{accountStatus.payoutsEnabled && (
										<span className="inline-flex items-center gap-1 text-sm text-green-600">
											<CheckCircle className="w-4 h-4" />
											Payouts enabled
										</span>
									)}
								</div>
								{accountStatus.businessName && (
									<p className="text-sm text-gray-600 mt-2">
										Business: {accountStatus.businessName}
									</p>
								)}
								<button
									onClick={handleOpenDashboard}
									className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
								>
									<ExternalLink className="w-4 h-4" />
									Open Stripe Dashboard
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Earnings Summary - Only show if account is connected and enabled */}
			{accountStatus?.hasAccount && accountStatus?.chargesEnabled && (
				<>
					{/* Earnings Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-xl p-5 border border-gray-200">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
									<DollarSign className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">Total Earnings</p>
									<p className="text-xl font-bold text-gray-900">
										{isLoadingEarnings ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											`$${(earnings?.totalEarnings || 0).toFixed(2)}`
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-5 border border-gray-200">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
									<Clock className="w-5 h-5 text-yellow-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">Pending Payouts</p>
									<p className="text-xl font-bold text-gray-900">
										{isLoadingEarnings ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											`$${(earnings?.pendingPayouts || 0).toFixed(2)}`
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-5 border border-gray-200">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
									<TrendingUp className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">Paid Out</p>
									<p className="text-xl font-bold text-gray-900">
										{isLoadingEarnings ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											`$${(earnings?.completedPayouts || 0).toFixed(2)}`
										)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payout History */}
					<div className="bg-white rounded-xl border border-gray-200">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">Payout History</h3>
						</div>

						{isLoadingEarnings ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="w-6 h-6 animate-spin text-gray-400" />
							</div>
						) : earnings?.payoutHistory && earnings.payoutHistory.length > 0 ? (
							<div className="divide-y divide-gray-200">
								{earnings.payoutHistory.map((payout) => (
									<div key={payout.id} className="px-6 py-4 flex items-center justify-between">
										<div>
											<div className="flex items-center gap-2">
												<p className="font-medium text-gray-900">
													${payout.amount.toFixed(2)}
												</p>
												{payout.payoutMethod === "manual" && (
													<span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">
														Manual
													</span>
												)}
											</div>
											<p className="text-sm text-gray-500">
												{payout.status === "pending"
													? `Scheduled for ${formatDate(payout.scheduledFor)}`
													: payout.processedAt
														? `Paid on ${formatDate(payout.processedAt)}`
														: formatDate(payout.scheduledFor)}
											</p>
											{payout.payoutMethod === "manual" && payout.status === "pending" && (
												<p className="text-xs text-orange-600 mt-1">
													Contact support for payout - Stripe not connected
												</p>
											)}
										</div>
										{getStatusBadge(payout.status)}
									</div>
								))}
							</div>
						) : (
							<div className="py-12 text-center">
								<DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
								<p className="text-gray-500 text-sm">No payouts yet</p>
								<p className="text-gray-400 text-xs mt-1">
									Payouts will appear here after your events end
								</p>
							</div>
						)}
					</div>

					{/* Info Box */}
					<div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
						<div className="flex gap-3">
							<AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
							<div className="text-sm text-blue-800">
								<p className="font-medium">How payouts work</p>
								<ul className="mt-1 space-y-1 text-blue-700">
									<li>• Payouts are automatically scheduled after your event ends</li>
									<li>• A $5 platform fee is deducted from each ticket sale</li>
									<li>• Funds are transferred directly to your connected bank account</li>
									<li>• Processing typically takes 2-3 business days</li>
									{!accountStatus?.chargesEnabled && (
										<li className="text-orange-600">• Connect Stripe above to enable automatic payouts</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
