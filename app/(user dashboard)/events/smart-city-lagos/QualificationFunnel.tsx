"use client";

import { useState } from "react";
import { callApi } from "@/app/libs/helper/callApi";
import { toast } from "sonner";

const ROLES = [
  "Real Estate Investor",
  "Private Equity / Venture Capital",
  "Business Owner / CEO",
  "Developer / Contractor",
  "High-Income Professional (Doctor, Lawyer, Executive)",
  "Other",
];

const INCOME_RANGES = [
  "Under $100,000",
  "$100,000 – $250,000",
  "$250,000 – $500,000",
  "$500,000 – $1,000,000",
  "$1,000,000+",
];

const INVESTMENT_INTERESTS = [
  "Residential property",
  "Commercial property",
  "Industrial / logistics",
  "Mixed-use development",
  "Land banking",
  "Not sure yet — want to learn more",
];

const REFERRAL_SOURCES = [
  "LinkedIn Ad",
  "Referral from a friend",
  "WhatsApp",
  "Instagram / Facebook",
  "Chicago Nigerians community",
  "Google Search",
  "Other",
];

type Step = "role" | "income" | "interest" | "registration" | "disqualified" | "confirmation";

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  linkedIn: string;
  referralSource: string;
}

export default function QualificationFunnel() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [investmentInterest, setInvestmentInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    linkedIn: "",
    referralSource: "",
  });

  const currentStepNumber =
    step === "role" ? 1 : step === "income" ? 2 : step === "interest" ? 3 : step === "registration" ? 4 : 0;

  const handleRoleSelect = (selected: string) => {
    setRole(selected);
    setStep("income");
  };

  const handleIncomeSelect = (selected: string) => {
    setIncomeRange(selected);
    if (selected === "Under $100,000") {
      setStep("disqualified");
    } else {
      setStep("interest");
    }
  };

  const handleInterestSelect = (selected: string) => {
    setInvestmentInterest(selected);
    setStep("registration");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await callApi("/investor-registration/register", "POST", {
      role,
      incomeRange,
      investmentInterest,
      ...form,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      return;
    }

    setStep("confirmation");
  };

  // Disqualification screen
  if (step === "disqualified") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-8 bg-white border border-gray-200 rounded-3xl shadow-lg">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 7.636z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Interest</h3>
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          This is a private event tailored specifically for accredited investors. We appreciate your interest and will notify you about
          upcoming public events in the community.
        </p>
        <a
          href="/events"
          className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-300 shadow-sm"
        >
          Browse Other Events
        </a>
      </div>
    );
  }

  // Confirmation screen
  if (step === "confirmation") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-8 bg-white border border-gray-200 rounded-3xl shadow-lg">
        <div className="relative w-24 h-24 mx-auto mb-8 rounded-full bg-[var(--primary-color-light)] border-2 border-[var(--primary-color)]/20 flex items-center justify-center shadow-sm">
          <svg className="w-12 h-12 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">You&apos;re on the Guest List!</h3>
        <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
          We&apos;ve sent a confirmation to your email. The event is on{" "}
          <span className="text-gray-900 font-medium border-b border-[var(--primary-color)]/30 pb-0.5">Saturday, March 15th at 6:00 PM</span> in Chicago.
        </p>

        {/* Add to Google Calendar */}
        <a
          href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=SMART+City+Lagos+Property+Show+%E2%80%94+Private+Investor+Briefing&dates=20260315T180000/20260315T210000&details=Private+investor+networking+cocktail+featuring+Alaro+City+%E2%80%94+a+2%2C000-hectare+master-planned+development+in+Lagos%27s+Lekki+Free+Zone.%0A%0AMore+info%3A+chicagonigerians.com/events/smart-city-lagos&location=Chicago%2C+IL&ctz=America/Chicago"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:bg-[var(--primary-color)]/90 transition-colors duration-300 mb-10 shadow-md"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add to Google Calendar
        </a>

        {/* Referral CTA */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h4 className="text-[var(--primary-color)] font-semibold text-lg mb-3">Know Other Investors?</h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
            The value of this event comes from the people in the room. If you know investors, developers, or business
            leaders in Chicago who&apos;d benefit, share the invitation.
          </p>
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.success("Link copied to clipboard!");
            }}
            className="w-full px-6 py-4 bg-white border border-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-300 shadow-sm"
          >
            Copy Invitation Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-2 sm:px-6">
      {/* Progress indicator */}
      {currentStepNumber > 0 && (
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">Step {currentStepNumber} of 4</span>
            <span className="text-sm font-medium text-[var(--primary-color)]">{Math.round((currentStepNumber / 4) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-[var(--primary-color)] rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${(currentStepNumber / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary-color)] opacity-80"></div>

        {/* Step 1: Role */}
        {step === "role" && (
          <div className="animate-slide-in-right">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">What best describes you?</h3>
            <p className="text-gray-600 text-lg mb-10 font-light">Select the option that best fits your professional background.</p>
            <div className="space-y-4">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className="w-full text-left px-4 py-5 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:border-[var(--primary-color)] hover:bg-[var(--primary-color-light)] transition-all duration-300 shadow-sm hover:shadow-md group flex items-center justify-between"
                >
                  <span className="text-lg font-light group-hover:text-gray-900">{r}</span>
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Income */}
        {step === "income" && (
          <div className="animate-slide-in-right">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">What is your annual income range?</h3>
            <p className="text-gray-600 text-lg mb-10 font-light">This helps us ensure the event is tailored to the right audience.</p>
            <div className="space-y-4">
              {INCOME_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => handleIncomeSelect(range)}
                  className="w-full text-left px-6 py-5 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:border-[var(--primary-color)] hover:bg-[var(--primary-color-light)] transition-all duration-300 shadow-sm hover:shadow-md group flex items-center justify-between"
                >
                  <span className="text-lg font-light group-hover:text-gray-900">{range}</span>
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("role")}
              className="mt-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        )}

        {/* Step 3: Investment Interest */}
        {step === "interest" && (
          <div className="animate-slide-in-right">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">What type of investment interests you most?</h3>
            <p className="text-gray-600 text-lg mb-10 font-light">Select your primary area of investment interest.</p>
            <div className="space-y-4">
              {INVESTMENT_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestSelect(interest)}
                  className="w-full text-left px-6 py-5 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:border-[var(--primary-color)] hover:bg-[var(--primary-color-light)] transition-all duration-300 shadow-sm hover:shadow-md group flex items-center justify-between"
                >
                  <span className="text-lg font-light group-hover:text-gray-900">{interest}</span>
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("income")}
              className="mt-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        )}

        {/* Step 4: Registration Form */}
        {step === "registration" && (
          <div className="animate-slide-in-right">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Complete Your Request</h3>
            <p className="text-gray-600 text-lg mb-10 font-light">Fill in your details to secure your spot.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                  placeholder="+1 (312) 555-0100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                    placeholder="Executive"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={form.linkedIn}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">How did you hear about us?</label>
                <select
                  name="referralSource"
                  value={form.referralSource}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all shadow-inner"
                >
                  <option value="">Select...</option>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4.5 bg-[var(--primary-color)] text-white font-bold rounded-xl hover:bg-[var(--primary-color)]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Application"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("interest")}
                className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
