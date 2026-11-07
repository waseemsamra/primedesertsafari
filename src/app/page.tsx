import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/Hero";
import ToursSlider from "@/components/ToursSlider";
import OurExperiences from "@/components/OurExperiences";
import TrendingAttractions from "@/components/TrendingAttractions";

export default function Home() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "public", "primedesertsafari.html"),
    "utf8"
  );
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const style = (styleMatch?.[1] ?? "")
    .replace(/\.arrows\s*\{[\s\S]*?\}/g, ".arrows{display:flex;gap:8px;align-items:center;}")
    .replace(/\.arrow-btn\s*\{[\s\S]*?\}/g, ".arrow-btn,button.arrow-btn,div.arrow-btn,.slider-section-actions button,.arrows>div,.arrows>button{box-sizing:border-box!important;appearance:none!important;-webkit-appearance:none!important;width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;min-height:30px!important;max-height:30px!important;border-radius:50%!important;border:0!important;background:#2563eb!important;background-color:#2563eb!important;color:#fff!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;padding:0!important;margin:0!important;flex:0 0 30px!important;overflow:hidden!important;font-size:11px!important;}")
    .replace(/\.arrow-btn:hover\s*\{[\s\S]*?\}/g, ".arrow-btn:hover,.slider-section-actions button:hover{background:#1d4ed8!important;color:#fff!important;}")
    .replace(/\.arrow-btn\s+i[^{]*\{[\s\S]*?\}/g, ".arrow-btn i,.arrow-btn svg,.slider-section-actions button i{color:#fff!important;font-size:11px!important;}")
    + `@media (max-width:768px){.arrows,.section-header .arrows,.slider-section-actions .arrow-btn,.slider-section-actions button,.section-header>a,.slider-view-all{display:none!important}.section-header h2,.slider-section-title{font-size:18px!important;line-height:1.25!important}.view-all-container{display:flex!important;justify-content:center;margin-top:14px!important}}`;
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
      <TrendingAttractions />
      <div
        dangerouslySetInnerHTML={{
          __html: main
            .replace(/<!-- Hero Section -->[\s\S]*?<!-- Desert Safaris Section -->/, "<!-- Desert Safaris Section -->")
            .replace(/<!-- Desert Safaris Section -->[\s\S]*?<!-- Circular Experiences Section -->/, "<!-- Circular Experiences Section -->")
            .replace(/<!-- Circular Experiences Section -->[\s\S]*?<!-- Split Banners Section -->/, "<!-- Split Banners Section -->"),
        }}
      />
    </>
  );
}
