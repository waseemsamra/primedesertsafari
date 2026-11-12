import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/Hero";
import ToursSlider from "@/components/ToursSlider";
import MomentsGallery from "@/components/MomentsGallery";
import OurExperiences from "@/components/OurExperiences";
import TrendingAttractions from "@/components/TrendingAttractions";
import PrimeMomentsGallery from "@/components/PrimeMomentsGallery";
import CityTours from "@/components/CityTours";
import HomeFaq from "@/components/HomeFaq";

const html = fs.readFileSync(path.join(process.cwd(), "public", "primedesertsafari.html"), "utf8");
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const inlineStyle = (styleMatch?.[1] ?? "")
  .replace(/\.arrows\s*\{[\s\S]*?\}/g, ".arrows{display:flex;gap:8px;align-items:center;}")
  .replace(/\.arrow-btn\s*\{[\s\S]*?\}/g, ".arrow-btn,button.arrow-btn,div.arrow-btn,.slider-section-actions button,.arrows>div,.arrows>button{box-sizing:border-box!important;appearance:none!important;-webkit-appearance:none!important;width:30px!important;min-width:30px!important;max-width:30px!important;height:30px!important;min-height:30px!important;max-height:30px!important;border-radius:50%!important;border:0!important;background:#2563eb!important;background-color:#2563eb!important;color:#fff!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;padding:0!important;margin:0!important;flex:0 0 30px!important;overflow:hidden!important;font-size:11px!important;}")
  .replace(/\.arrow-btn:hover\s*\{[\s\S]*?\}/g, ".arrow-btn:hover,.slider-section-actions button:hover{background:#1d4ed8!important;color:#fff!important;}")
  .replace(/\.arrow-btn\s+i[^{]*\{[\s\S]*?\}/g, ".arrow-btn i,.arrow-btn svg,.slider-section-actions button i{color:#fff!important;font-size:11px!important;}")
  + `@media (max-width:768px){.arrow-btn,.arrow-btn.section-arrow,button.arrow-btn,button.section-arrow,.arrows,.arrows .arrow-btn,.arrows>div,.arrows>button,.section-header .arrows,.section-header .arrows .arrow-btn,.slider-section-actions .arrow-btn,.slider-section-actions button,.section-head-actions .arrow-btn,.section-head-actions button,.section-arrow{display:none!important;visibility:hidden!important;width:0!important;min-width:0!important;height:0!important;overflow:hidden!important}.section-header>a,.slider-view-all,.section-view-all-top{display:none!important}.section-header h2,.slider-section-title{font-size:18px!important;line-height:1.25!important}.view-all-container,.section-view-all-bottom{display:flex!important;justify-content:center;margin-top:14px!important;padding:0 16px!important}.view-all-container .btn-view-all,.view-all-container button.btn-view-all,.section-view-all-bottom .btn-view-all,.section-view-all-bottom a.btn-view-all{display:block!important;width:100%!important;max-width:100%!important;text-align:center!important;box-sizing:border-box!important}}`;
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
const hEnd = body.indexOf("</header>") + 9;
const fStart = body.indexOf("<!-- Footer -->");
const main = body.slice(hEnd, fStart);
const processedMain = main
  .replace(/<!-- Hero Section -->[\s\S]*?<!-- Desert Safaris Section -->/, "<!-- Desert Safaris Section -->")
  .replace(/<!-- Desert Safaris Section -->[\s\S]*?<!-- Circular Experiences Section -->/, "<!-- Circular Experiences Section -->")
  .replace(/<!-- Circular Experiences Section -->[\s\S]*?<!-- Split Banners Section -->/, "<!-- Split Banners Section -->")
  .replace(/<!-- Top City Tours Section -->[\s\S]*?<!-- Desert Safari Experiences Banner -->/, "<!-- Desert Safari Experiences Banner -->")
  .replace(/<!-- Your Prime Desert Safari Moments \(Gallery\) -->[\s\S]*$/, "");

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prime Desert Safari",
    description: "Desert safari Dubai, Abu Dhabi, and Ras Al Khaimah tour operator. Book morning and evening desert safari, dune buggy, quad bike, and private desert safari camps with hotel pickup, BBQ dinner, and live entertainment.",
    url: "https://primedesertsafari.com",
    logo: "https://primedesertsafari.com/Prime-Desert-Logo.png",
    telephone: "+971 50 133 2442",
    email: "bookings@primedesertsafari.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE"
    },
    sameAs: ["https://primedesertsafari.com"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style dangerouslySetInnerHTML={{ __html: inlineStyle }} />
      <Hero />
      <section className="container" style={{ marginTop: 18 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: '#1e293b' }}>Desert Safari Dubai & UAE Tours | Prime Desert Safari</h1>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '15px' }}>
          Book the best desert safari Dubai, desert safari Abu Dhabi, and desert safari Ras Al Khaimah tours with Prime Desert Safari. Compare morning and evening desert safari, dune buggy rides, quad bike adventures, and private desert safari camps with clear inclusions, pricing, and hotel pickup. Free cancellation, best price guarantee, and instant confirmation.
        </p>
      </section>
      <MomentsGallery title="Top Desert Safari Experiences in UAE" />
      <ToursSlider title="Best Desert Safari Dubai Tours" location="Dubai" category="desert" viewAllHref="/category/desert-adventures?location=Dubai" />
      <ToursSlider title="Desert Safari Abu Dhabi Tours" location="Abu Dhabi" category="desert" viewAllHref="/category/desert-adventures?location=Abu%20Dhabi" />
      <ToursSlider title="Desert Safari Ras Al Khaimah Tours" location="Ras Al Khaimah" category="desert" viewAllHref="/category/desert-adventures?location=Ras%20Al%20Khaimah" />
      <OurExperiences />
      <TrendingAttractions />
      <CityTours />
      <div dangerouslySetInnerHTML={{ __html: processedMain }} />
      <PrimeMomentsGallery />
      <HomeFaq />
    </>
  );
}
