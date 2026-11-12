import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Search Tours",
  description: "Search and find desert safari, city tour, dhow cruise, water sports, theme park, and yacht tours in Dubai, Abu Dhabi, and Ras Al Khaimah.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}