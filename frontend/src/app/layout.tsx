import type { Metadata } from "next";
import "@fontsource/syncopate/400.css";
import "@fontsource/syncopate/700.css";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialPulse — Social Media Topic & Community Clustering",
  description:
    "Advanced unsupervised machine learning platform for semantic topic discovery and social community graph intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white font-sans antialiased selection:bg-[#FF2E93] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
