import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Chicago Nigerians",
  description: "Privacy Policy for the Chicago Nigerians platform",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500">Effective Date: January 30th, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Chicago Nigerians (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a community networking platform enabling users to connect, share content, network professionally, and engage with the Nigerian community in Chicago and beyond, including peer-to-peer marketplace functionality.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Account Information:</strong> Name, username, email address, password, phone number (optional), profile photo, and bio</li>
            <li><strong>Profile & Professional Information:</strong> Education, employment history, skills, interests, location, and networking preferences</li>
            <li><strong>User Content:</strong> Posts, comments, messages, photos, videos, reactions, and other shared content</li>
            <li><strong>Communications:</strong> Support requests, feedback, and survey responses</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">1.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Usage Data:</strong> Pages viewed, features used, interactions, timestamps, and referral URLs</li>
            <li><strong>Device & Technical Data:</strong> IP address, browser type, operating system, device identifiers, and language preferences</li>
            <li><strong>Cookies & Similar Technologies:</strong> For authentication, preferences, and usage analysis</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">1.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Social Logins:</strong> Basic profile information from third-party services</li>
            <li><strong>Partners & Analytics Providers:</strong> Aggregated or de-identified data</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide and maintain the Platform</li>
            <li>Create and manage user accounts</li>
            <li>Enable social networking and professional connections</li>
            <li>Personalize content and recommendations</li>
            <li>Communicate about updates, security alerts, and support</li>
            <li>Monitor and improve Platform performance</li>
            <li>Enforce Terms of Service and community guidelines</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Share Your Information</h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="text-emerald-800 font-medium">We do not sell your personal information.</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Information is shared with other users (based on privacy settings), service providers, in legal compliance situations, and potentially during business transfers.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Your Privacy Choices & Rights</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Update, correct, or delete profile information</li>
            <li>Control who views or interacts with posts</li>
            <li>Opt out of non-essential emails</li>
            <li>Request account deletion (subject to legal retention requirements)</li>
            <li>Additional rights may apply depending on location and applicable data protection laws</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            Information is retained while accounts are active or as necessary to provide services, with potential retention after deletion where legally required or for legitimate purposes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement reasonable administrative, technical, and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is completely secure.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform is not intended for individuals under 13. Chicago Nigerians does not knowingly collect information from children and will delete such data if discovered.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. International Users</h2>
          <p className="text-gray-700 leading-relaxed">
            Information may be transferred to and processed in the United States or other jurisdictions where our servers or service providers are located.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            Updates will be posted on the Platform with updated effective dates notifying users of material changes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions about this Privacy Policy, contact:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4 break-words">
            <p className="text-gray-700 font-medium">Chicago Nigerians</p>
            <p className="text-gray-600 break-all">Email: support@chicagonigerians.com</p>
            <p className="text-gray-600 break-all">Website: https://www.chicagonigerians.com/contact</p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/terms-of-service"
                className="text-[var(--primary-color)] hover:underline"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie-policy"
                className="text-[var(--primary-color)] hover:underline"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
