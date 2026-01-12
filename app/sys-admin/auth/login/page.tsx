'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { useAdminSession } from '@/app/store/useAdminSession';

interface AdminLoginForm {
  email: string;
  otp?: string;
}

export default function AdminLoginPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { updateAdmin } = useAdminSession((state) => state.actions);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<AdminLoginForm>();

  const email = watch('email');

  // Step 1: Send OTP
  const sendOTP = async (data: AdminLoginForm) => {
    const { error } = await callApi<ApiResponse<void>>(
      '/admin/auth/send-otp',
      'POST',
      { email: data.email }
    );

    if (error) {
      toast.error(error.message || 'Failed to send OTP');
      return;
    }

    toast.success('OTP sent to your email');
    setValue('otp', ''); // Clear OTP field
    setStep(2);
  };

  // Step 2: Verify OTP
  const verifyOTP = async (data: AdminLoginForm) => {
    const { data: response, error } = await callApi<ApiResponse<any>>(
      '/admin/auth/verify-otp',
      'POST',
      { email, otp: data.otp }
    );

    if (error) {
      toast.error(error.message || 'Invalid OTP');
      return;
    }

    updateAdmin(response?.data);
    toast.success('Admin login successful');
    router.push('/sys-admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Admin Portal
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {step === 1
            ? 'Enter your admin email to continue'
            : 'Enter the verification code sent to your email'}
        </p>

        <form
          onSubmit={handleSubmit(step === 1 ? sendOTP : verifyOTP)}
          className="space-y-4"
        >
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="admin@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest font-medium"
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.otp.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 text-center">
                Code sent to {email}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === 1 ? (
              'Send Verification Code'
            ) : (
              'Verify & Login'
            )}
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-600 text-sm hover:text-gray-900 flex items-center justify-center gap-2 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to email
            </button>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a secure admin area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
