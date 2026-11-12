import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Trending Attractions in Dubai & UAE",
  description: "Discover the most popular and trending tours and attractions in Dubai, Abu Dhabi, and Ras Al Khaimah. Book the best-selling desert safaris, city tours, yacht cruises, theme park tickets, and water sports experiences with free cancellation and instant confirmation.",
  alternates: { canonical: "/trending-attractions" },
  openGraph: {
    title: "Trending Attractions in Dubai & UAE",
    description: "Discover the most popular and trending tours and attractions in Dubai, Abu Dhabi, and Ras Al Khaimah.",
    type: "website",
    url: "/trending-attractions",
  },
};

export default function TrendingAttractionsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}