import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "./components/provider/authProvider";
import QueryProvider from "./components/provider/queryProvider";
import AuthModal from "./components/modals/AuthModal";
import CookieConsent from "./components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chicago Nigeria",
  description:
    "Chicago Nigeria is a web platform to connect Nigerians who reside in Chicago together",
  icons: {
    icon: "/favicon_io/favicon.ico",
    shortcut: "/favicon_io/favicon-32x32.png",
    apple: "/favicon_io/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${inter.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors={true} />
            <AuthModal />
            <CookieConsent />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
