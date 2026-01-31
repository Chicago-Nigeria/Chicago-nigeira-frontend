import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Chicago Nigerians",
  description: "Cookie Policy for the Chicago Nigerians platform",
};

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-gray-500">Effective Date: January 30th, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            This Cookie Policy explains how Chicago Nigerians uses cookies when you access our community networking platform, which facilitates connecting, sharing content, and professional networking within the Nigerian community in Chicago and beyond, including peer-to-peer marketplace features.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files stored on your device (computer, tablet, or mobile phone) when visiting websites or apps. They help websites remember information about your visit, which can make it easier to visit the site again and make the site more useful to you.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700 mb-2"><strong>Session Cookies:</strong> Temporary cookies that are removed when you close your browser.</p>
            <p className="text-gray-700"><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them.</p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Types of Cookies We Use</h2>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">2.1 Strictly Necessary Cookies</h3>
          <p className="text-gray-700 leading-relaxed">
            These cookies are essential for the Platform to function properly and cannot be disabled. They are used for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
            <li>Authenticating users and keeping you logged in</li>
            <li>Enabling core features such as login, navigation, and account access</li>
            <li>Preventing fraud and ensuring security</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">2.2 Performance and Analytics Cookies</h3>
          <p className="text-gray-700 leading-relaxed">
            These cookies collect data on how users interact with the Platform to help us improve functionality and reliability. They track:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
            <li>Pages visited and features used</li>
            <li>Time spent on the Platform</li>
            <li>Error reports and performance issues</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">2.3 Functionality Cookies</h3>
          <p className="text-gray-700 leading-relaxed">
            These cookies remember your preferences to enhance your experience:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
            <li>Language and location settings</li>
            <li>Display preferences</li>
            <li>Previously entered information</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">2.4 Advertising and Third-Party Cookies</h3>
          <p className="text-gray-700 leading-relaxed">
            Third-party providers may place cookies for analytics, content delivery, and limited promotional purposes. Chicago Nigerians does not control these cookies, and their use is governed by the respective third-party privacy policies.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Similar Technologies</h2>
          <p className="text-gray-700 leading-relaxed">
            In addition to cookies, we may use similar technologies such as:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
            <li><strong>Web Beacons:</strong> Small graphic images used to track user activity</li>
            <li><strong>Pixels:</strong> Code snippets that help measure engagement</li>
            <li><strong>Local Storage:</strong> Browser storage used for preferences and session data</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            These technologies serve analytics, security, and personalization purposes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Your Cookie Choices</h2>
          <p className="text-gray-700 leading-relaxed">
            You have several options for managing cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
            <li><strong>Browser Settings:</strong> Adjust your browser settings to block or delete cookies</li>
            <li><strong>Mobile Device Settings:</strong> Configure device settings for mobile apps</li>
            <li><strong>Opt-Out Options:</strong> Opt out of certain analytics or marketing cookies where applicable</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800">
              <strong>Note:</strong> Disabling cookies may affect Platform functionality. Some features may not work properly if you disable strictly necessary cookies.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Updates to This Cookie Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. Updates will be posted with a revised effective date.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions about this Cookie Policy, contact:
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
                href="/privacy-policy"
                className="text-[var(--primary-color)] hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
