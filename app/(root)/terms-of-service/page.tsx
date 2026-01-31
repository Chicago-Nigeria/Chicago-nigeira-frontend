import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Chicago Nigerians",
  description: "Terms of Service for the Chicago Nigerians platform",
};

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500">Effective Date: January 30th, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">
            Welcome to Chicago Nigerians (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms govern your access to and use of the Chicago Nigerians platform (the &quot;Platform&quot;), a community networking space enabling users to connect, share content, network professionally, and engage with the Nigerian community in Chicago and beyond through peer-to-peer marketplace features.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using the Platform, you agree to be bound by these Terms. Disagreement with any provision means you cannot use the Platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed">
            Users must be at least 13 years old. By using the Platform, you represent that you meet this requirement and possess legal capacity to enter these Terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Account Registration and Security</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide accurate, complete, and current information when creating an account</li>
            <li>Maintain login credential confidentiality</li>
            <li>Accept responsibility for all account activities</li>
            <li>We reserve the right to suspend or terminate accounts violating these Terms or applicable laws</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Content</h2>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.1 Ownership</h3>
          <p className="text-gray-700 leading-relaxed">
            You retain ownership of content you post, upload, or share (&quot;User Content&quot;).
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.2 License to Us</h3>
          <p className="text-gray-700 leading-relaxed">
            By posting User Content, you grant Chicago Nigerians a non-exclusive, worldwide, royalty-free, transferable, and sublicensable license to use, host, store, reproduce, modify, display, distribute, and create derivative works for operating, improving, and promoting the Platform.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">3.3 Responsibility for Content</h3>
          <p className="text-gray-700 leading-relaxed">
            You are solely responsible for your User Content and represent that you have all necessary rights to share it.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Acceptable Use Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Post unlawful, fraudulent, misleading, or deceptive content</li>
            <li>Harass, threaten, defame, or abuse others</li>
            <li>Post hate speech, discrimination, or incitement to violence</li>
            <li>Share content infringing intellectual property or privacy rights</li>
            <li>Upload malware, spam, or malicious code</li>
            <li>Use the Platform for unauthorized commercial solicitation</li>
            <li>Attempt unauthorized account or system access</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            We reserve the right to remove content or restrict access violating these rules.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Your Platform use is subject to our{" "}
            <Link href="/privacy-policy" className="text-[var(--primary-color)] hover:underline">
              Privacy Policy
            </Link>
            , which explains our data collection, use, and protection practices. By using the Platform, you consent to our data practices.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Marketplace, Ticket Sales, and Transactions</h2>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">6.1 Marketplace Listings (Peer-to-Peer Sales)</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The Platform includes a Marketplace for listing, discovering, and communicating about goods and services</li>
            <li>Chicago Nigerians does not process payments, guarantee listings, verify items, or mediate disputes</li>
            <li>All Marketplace transactions occur strictly between buyer and seller</li>
            <li>Users are solely responsible for negotiating terms, verifying condition, arranging payment/delivery, and ensuring legal compliance</li>
            <li>Chicago Nigerians is not responsible or liable for any loss, fraud, misrepresentation, injury, or dispute arising from Marketplace transactions</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">6.2 Ticket Sales</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The Platform may facilitate event ticket sales</li>
            <li>Chicago Nigerians charges a non-refundable $5 absorption fee per ticket sold</li>
            <li>Except for this fee, Chicago Nigerians assumes no responsibility for events, quality, changes, cancellations, or refunds unless explicitly stated otherwise</li>
            <li>Event organizers are responsible for fulfilling ticketed events and legal compliance</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">6.3 User Responsibility for Transactions</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            By using the Marketplace or purchasing tickets, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>You transact at your own risk</li>
            <li>Chicago Nigerians is not a Marketplace transaction party</li>
            <li>Any disputes must be resolved directly between involved parties</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property and Copyright</h2>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">7.1 Platform Intellectual Property</h3>
          <p className="text-gray-700 leading-relaxed">
            The Platform, including design, features, logos, trademarks, and software, is owned by or licensed to Chicago Nigerians and protected by applicable intellectual property laws. You cannot copy, modify, distribute, or create derivative works without prior written consent.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">7.2 User-Generated Content and Copyright Responsibility</h3>
          <p className="text-gray-700 leading-relaxed">
            Users may upload videos, reels, audio, music, images, and other content. Users are solely responsible for ensuring that they own or have obtained all necessary rights, licenses, permissions, and consents to use any copyrighted materials. Chicago Nigerians does not verify music licenses or copyright permissions.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">7.3 Copyright Liability Disclaimer</h3>
          <p className="text-gray-700 leading-relaxed">
            Chicago Nigerians shall not be responsible or liable for any copyright infringement, intellectual property claims, or legal disputes arising from unauthorized use of copyrighted materials. Copyright claims and legal actions are the sole responsibility of the user who uploaded the content.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">7.4 Content Removal</h3>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to remove or restrict access to content alleged or determined to infringe copyright or intellectual property rights. Repeated infringement may result in account suspension or termination.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may suspend or terminate your account at any time, with or without notice, if:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>You violate these Terms</li>
            <li>Your conduct harms the Platform or other users</li>
            <li>Required by law or legal process</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            You may terminate your account at any time through account settings.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not guarantee uninterrupted, secure, or error-free operation.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            To the maximum extent permitted by law, Chicago Nigerians shall not be liable for indirect, incidental, consequential, or punitive damages arising from Platform use.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree to indemnify and hold harmless Chicago Nigerians, its affiliates, officers, and partners from any claims, damages, or expenses arising out of your Platform use or Terms violation.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the State of Illinois, without regard to conflict of law principles.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to These Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update these Terms from time to time. Continued Platform use after changes become effective constitutes acceptance of the revised Terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions about these Terms, contact:
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
                href="/privacy-policy"
                className="text-[var(--primary-color)] hover:underline"
              >
                Privacy Policy
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
