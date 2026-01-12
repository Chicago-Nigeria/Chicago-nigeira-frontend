"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface EventSubmittedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventSubmittedModal({ isOpen, onClose }: EventSubmittedModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Event Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-1">
            Your event has been submitted and is awaiting admin approval.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll be notified once your event is reviewed. This usually takes 24-48 hours.
          </p>

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Admin reviews your event details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You'll receive an email notification about the status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Once approved, your event will appear on the events page</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
