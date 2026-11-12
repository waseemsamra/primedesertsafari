import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tour Categories — Desert Safari, City Tours, Cruises & More",
  description: "Browse tours by category: desert adventures, city tours, cruise and boat tours, waterparks and theme parks, attractions, and transport. Find the best deals in Dubai, Abu Dhabi, and Ras Al Khaimah.",
  alternates: { canonical: "/category" },
  openGraph: {
    title: "Tour Categories — Desert Safari, City Tours, Cruises & More",
    description: "Browse tours by category: desert adventures, city tours, cruise and boat tours, waterparks, attractions, and transport.",
    type: "website",
    url: "/category",
  },
};

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}