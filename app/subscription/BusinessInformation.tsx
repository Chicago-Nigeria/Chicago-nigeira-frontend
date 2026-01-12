"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { SubscriptionSchema } from "../libs/types/zodSchemas";
import FormFieldErrorMessage from "../components/fieldError";

interface Subscription {
  bussinessName: string;
  category: "retail" | "restaurant" | "tech" | "other";
  hasAccunt: boolean;
  socialHandles: [
    { social: "facebook"; handle: "" },
    { social: "x"; handle: "" },
    { social: "instagram"; handle: "" },
    { social: "linkedin"; handle: "" },
    { social: "whatsapp"; handle: "" },
    { social: "thread"; handle: "" },
    { social: "tiktok"; handle: "" }
  ];
}

export default function BusinessInformation() {
  const [hasAccounts, setHasAccounts] = useState<"yes" | "no" | "">("");
  const {
    register,
    formState: { errors },
  } = useFormContext<SubscriptionSchema>();

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Business Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Name*
          </label>
          <input
            {...register("businessName")}
            type="text"
            placeholder="Enter your business name"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
          <FormFieldErrorMessage error={errors.businessName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Type/Category*
          </label>
          <select className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500">
            <option>Select a category</option>
            <option>Retail</option>
            <option>Restaurant</option>
            <option>Tech</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Do you have existing social media accounts?*
          </label>
          <div className="flex-col sm:flex-row gap-12 sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hasAccounts"
                value="yes"
                checked={hasAccounts === "yes"}
                onChange={() => setHasAccounts("yes")}
              />
              <span>Yes, I have existing social media accounts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hasAccounts"
                value="no"
                checked={hasAccounts === "no"}
                onChange={() => setHasAccounts("no")}
              />
              <span>No, please create and manage accounts for me</span>
            </label>
          </div>
        </div>

        {hasAccounts === "yes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <input
              type="text"
              placeholder="Instagram handle"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Facebook page"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="TikTok handle"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="LinkedIn profile"
              className="border rounded-lg p-2"
            />
          </div>
        )}
      </div>
    </section>
  );
}
