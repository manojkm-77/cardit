import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

// Inter is the single typeface for the platform; it also backs the `font-sans`
// utility so every surface resolves to the same family.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "CardIT.io — Student Verification Workspace",
  description: "Enterprise student ID card verification and approval workspace designed for high-volume school dataset review, bulk verification, live card preview, and commercial print sheet generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
