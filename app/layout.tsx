import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import PWAProvider from "@/components/PWAProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClimaGuard — Protecting Children from Climate Hazards",
  description: "AI-powered real-time climate risk alerts and health guidance for children across UNICEF high-risk countries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col bg-gray-50" style={{ background: "#f9fafb", color: "#111827" }}>
        <PWAProvider />
        {children}
      </body>
    </html>
  );
}
