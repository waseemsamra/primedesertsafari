import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/Hero";
import ToursSlider from "@/components/ToursSlider";
import OurExperiences from "@/components/OurExperiences";

export default function Home() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "public", "primedesertsafari.html"),
    "utf8"
  );
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const style = styleMatch?.[1] ?? "";
  const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
  const hEnd = body.indexOf("</header>") + 9;
  const fStart = body.indexOf("<!-- Footer -->");
  const main = body.slice(hEnd, fStart);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <Hero />
      <ToursSlider title="Top Desert safari in UAE" />
      <ToursSlider title="Top Desert safari in Dubai" location="Dubai" viewAllHref="/category/Desert%20Safaris?location=Dubai" />
      <ToursSlider title="Top Desert safari in Abu Dhabi" location="Abu Dhabi" viewAllHref="/category/Desert%20Safaris?location=Abu%20Dhabi" />
      <ToursSlider title="Top Desert safari in Ras Al Khaimah" location="Ras Al Khaimah" viewAllHref="/category/Desert%20Safaris?location=Ras%20Al%20Khaimah" />
      <OurExperiences />
      <div
        dangerouslySetInnerHTML={{
          __html: main
            .replace(/<!-- Hero Section -->[\s\S]*?<!-- Desert Safaris Section -->/, "<!-- Desert Safaris Section -->")
            .replace(/<!-- Desert Safaris Section -->[\s\S]*?<!-- Circular Experiences Section -->/, "<!-- Circular Experiences Section -->"),
        }}
      />
    </>
  );
}
