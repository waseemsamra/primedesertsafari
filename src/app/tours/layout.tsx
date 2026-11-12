import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tours & Activities in Dubai, Abu Dhabi & UAE",
  description: "Browse all desert safari, city tour, dhow cruise, water sports, theme park, and yacht tours in Dubai, Abu Dhabi, and Ras Al Khaimah. Filter by category, location, and price. Book with best price guarantee and free cancellation.",
  alternates: { canonical: "/tours" },
  openGraph: {
    title: "Tours & Activities in Dubai, Abu Dhabi & UAE",
    description: "Browse all desert safari, city tour, dhow cruise, water sports, theme park, and yacht tours. Filter by category, location, and price.",
    type: "website",
    url: "/tours",
  },
};

export default function ToursLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}