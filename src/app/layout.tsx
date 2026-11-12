import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageProtection from "@/components/ImageProtection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primedesertsafari.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Desert Safari Dubai & UAE Tours | Prime Desert Safari",
    template: "%s | Prime Desert Safari",
  },
  description:
    "Book desert safari Dubai, Abu Dhabi, and Ras Al Khaimah tours. Compare morning desert safari, evening desert safari, dune buggy, quad bike, and private desert safari experiences with clear inclusions and pricing.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Prime Desert Safari",
    title: "Desert Safari Dubai & UAE Tours | Prime Desert Safari",
    description:
      "Find desert safari Dubai, Abu Dhabi desert safari, and Ras Al Khaimah desert safari tours. Check inclusions, prices, pickup details, and availability before booking.",
    images: [{ url: "/Prime-Desert-Logo.png", alt: "Prime Desert Safari" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desert Safari Dubai & UAE Tours | Prime Desert Safari",
    description:
      "Book Dubai desert safari, Abu Dhabi desert safari, dune buggy, quad bike, and private desert safari tours in the UAE.",
    images: ["/Prime-Desert-Logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <ImageProtection />
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
