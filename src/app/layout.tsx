import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "InterviewOS - AI-Powered Interview Agents",
  description: "Voice-native interview agents that conduct structured, evidence-based technical interviews using RAG and specialized AI. From job specs to scored evaluations.",
  authors: [{ name: "InterviewOS" }],
  openGraph: {
    title: "InterviewOS - AI-Powered Interview Agents",
    description: "Voice-native interview agents that conduct structured, evidence-based technical interviews using RAG and specialized AI.",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lovable",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

