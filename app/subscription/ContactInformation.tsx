"use client";

import { useFormContext } from "react-hook-form";
import { SubscriptionSchema } from "../libs/types/zodSchemas";
import FormFieldErrorMessage from "../components/fieldError";

export default function ContactInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SubscriptionSchema>();
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Email*
          </label>
          <input
            {...register("businessEmail")}
            type="email"
            placeholder="example@email.com"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
          <FormFieldErrorMessage error={errors.businessEmail} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Phone Number*
          </label>
          <input
            {...register("businessPhone")}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
          <FormFieldErrorMessage error={errors.businessPhone} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Brief Description of Business*
          </label>
          <textarea
            {...register("businessBio")}
            placeholder="Tell us about your business, products, and audience..."
            rows={3}
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
          <FormFieldErrorMessage error={errors.businessBio} />
        </div>
      </div>
    </section>
  );
}
