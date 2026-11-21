import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialPulse — Social Media Topic & Community Clustering",
  description: "Advanced unsupervised machine learning platform for semantic topic discovery and social community graph intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-midnight-950 text-slate-100 antialiased selection:bg-violet-glow selection:text-white">
        {children}
      </body>
    </html>
  );
}
