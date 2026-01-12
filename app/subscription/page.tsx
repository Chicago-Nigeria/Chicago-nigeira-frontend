"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import BusinessInformation from "./BusinessInformation";
import ContactInformation from "./ContactInformation";
import {
  subscriptionSchema,
  SubscriptionSchema,
} from "../libs/types/zodSchemas";
import Link from "next/link";

export default function SocialSubscriptionPage() {
  const method = useForm<SubscriptionSchema>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      businessName: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = method;
  const onSubmit = () => {};
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full md:max-w-2xl bg-white shadow-md rounded-2xl p-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          ← Back to Homepage
        </Link>

        <div className="text-center mb-8">
          <Image
            src="/chicago-nigeria-logo-1.png"
            alt="Company Logo"
            className="w-20 mx-auto mb-3 h-12"
            width={159}
            height={82}
          />
          <h1 className="text-2xl font-semibold">
            Social Media Management Subscription
          </h1>
          <p className="text-gray-500 mt-1">
            Let’s Help Your Business Grow Online — Our plan:{" "}
            <span className="font-semibold text-green-600">$65/month</span>
          </p>
        </div>
        <FormProvider {...method}>
          <form id="subscriptionForm" onSubmit={method.handleSubmit(onSubmit)}>
            {/* Business Information */}
            <BusinessInformation />
            {/* Contact Information */}
            <ContactInformation />
          </form>
        </FormProvider>

        {/* Subscription Summary */}
        <div className="bg-green-600 text-white rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="text-xl font-semibold">Monthly Service Fee</h3>
            <p className="text-2xl font-bold">
              $65
              <span className="text-base font-normal">/month</span>
            </p>
            <p className="text-sm opacity-90">
              Includes social media account management
            </p>
          </div>
          <ul className="text-sm mt-4 sm:mt-0 space-y-1">
            <li>✓ Daily content posting</li>
            <li>✓ Community engagement</li>
            <li>✓ Monthly analytics report</li>
            <li>✓ Strategy consultation</li>
          </ul>
        </div>

        <button
          type="submit"
          form="subscriptionForm"
          disabled={isSubmitting}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition hover:cursor-pointer`}
        >
          Subscribe Now
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact us at{" "}
          <a
            href="mailto:support@chicago9ja.com"
            className="text-green-600 underline"
          >
            support@chicago9ja.com
          </a>
        </p>

        <p className="text-center text-xs text-gray-400 mt-2">
          © 2025 Chicago9ja. All rights reserved.
        </p>
      </div>
    </main>
  );
}
