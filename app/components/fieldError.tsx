"use client";
import { Loader2 } from "lucide-react";

export default function FormFieldErrorMessage({
  error,
}: {
  error?: { message?: string };
}) {
  if (!error || !error.message) return null;
  return <p className="text-red-500 text-xs my-1">{error.message}</p>;
}

export const Loader = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
};
