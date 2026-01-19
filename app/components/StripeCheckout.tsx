"use client";

import { useState, useEffect } from "react";
import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface StripeCheckoutProps {
	onSuccess: () => void;
	onError: (error: string) => void;
	amount: number;
	isProcessing: boolean;
	setIsProcessing: (processing: boolean) => void;
}

export default function StripeCheckout({
	onSuccess,
	onError,
	amount,
	isProcessing,
	setIsProcessing,
}: StripeCheckoutProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsProcessing(true);
		setErrorMessage(null);

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/events?payment=success`,
			},
			redirect: "if_required",
		});

		if (error) {
			setErrorMessage(error.message || "Payment failed");
			onError(error.message || "Payment failed");
			setIsProcessing(false);
		} else if (paymentIntent && paymentIntent.status === "succeeded") {
			onSuccess();
		} else {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<PaymentElement
				options={{
					layout: "tabs",
				}}
			/>

			{errorMessage && (
				<div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
					{errorMessage}
				</div>
			)}

			<button
				type="submit"
				disabled={!stripe || isProcessing}
				className="w-full py-3 text-sm font-semibold rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
			>
				{isProcessing ? (
					<>
						<Loader2 className="w-4 h-4 animate-spin" />
						Processing...
					</>
				) : (
					`Pay $${amount.toFixed(2)}`
				)}
			</button>
		</form>
	);
}
