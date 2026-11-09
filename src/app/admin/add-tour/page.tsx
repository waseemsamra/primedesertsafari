'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminStyles from '../AdminStyles';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';

type Category = { id: number; name: string };
type Location = { id: number; name: string };
type ItineraryStep = { title: string; description: string; duration: string };
type FeatureItem = { icon: string; label: string };
type GalleryItem = { url: string; cover?: boolean };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const defaultFeatures: FeatureItem[] = [
  { icon: 'fas fa-car', label: 'Shared or Private Transfer' },
  { icon: 'fas fa-mountain', label: 'Dune Drive' },
  { icon: 'fas fa-dove', label: 'Falcon Show' },
  { icon: 'fas fa-horse', label: 'Camel Ride' },
];

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function uploadToImageKit(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: dataUrl, fileName: file.name }),
  });
  const json = await res.json();
  if (!res.ok || !json.url) throw new Error(json.error || 'Image upload failed');
  return json.url as string;
}

async function callAI(prompt: string): Promise<string> {
  const res = await fetch('/api/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const json = await res.json();
  if (!res.ok || !json.content) throw new Error(json.error || 'AI generation failed');
  return json.content;
}

function AddTourInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const cloneId = searchParams.get('clone');
  const isEdit = !!editId;
  const isClone = !!cloneId && !editId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiGenerating, setAiGenerating] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(!!editId || !!cloneId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('Active');
  const [badge, setBadge] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [pickupInfo, setPickupInfo] = useState('Hotel or residence pick-up included from anywhere in Dubai');
  const [priceNote, setPriceNote] = useState('Price varies by vehicle, group size and other selections');

  // SEO fields
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoMetaKeywords, setSeoMetaKeywords] = useState('');
  const [seoOgTitle, setSeoOgTitle] = useState('');
  const [seoOgDescription, setSeoOgDescription] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState('');
  const [seoFocusKeyword, setSeoFocusKeyword] = useState('');

  // Gallery with cover support
  const [gallery, setGallery] = useState<GalleryItem[]>([{ url: '' }]);

  const [features, setFeatures] = useState<FeatureItem[]>(defaultFeatures);
  const [newFeature, setNewFeature] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryStep[]>([{ title: '', description: '', duration: '' }]);
  const [highlightsText, setHighlightsText] = useState('');
  const [knowBefore, setKnowBefore] = useState('');
  const [agePolicy, setAgePolicy] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState<string[]>(['Shared 4x4', 'Private 4x4']);
  const [packageOptions, setPackageOptions] = useState<string[]>(['Standard Package', 'VIP Package']);
  const [vehicleInput, setVehicleInput] = useState('');
  const [packageInput, setPackageInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    (async () => {
      const [cRes, lRes] = await Promise.all([
        supabase.from('categories').select('id,name').order('name'),
        supabase.from('locations').select('id,name').order('name'),
      ]);
      if (cRes.error) {
        const { data: t } = await supabase.from('tours').select('category');
        const names = Array.from(new Set((t || []).map((x: any) => x.category).filter(Boolean))) as string[];
        const fallback = (names.length ? names : ['Desert Safaris','City Tours','Water Parks']).sort().map((name, i) => ({ id: i + 1, name }));
        setCategories(fallback);
        setCategory((c) => c || fallback[0]?.name || '');
      } else if (cRes.data?.length) {
        setCategories(cRes.data);
        setCategory((c) => c || cRes.data[0].name);
      }
      if (lRes.error) {
        const { data: t } = await supabase.from('tours').select('location');
        const names = Array.from(new Set((t || []).map((x: any) => x.location).filter(Boolean))) as string[];
        const fallback = (names.length ? names : ['Dubai','Abu Dhabi','Ras Al Khaimah']).sort().map((name, i) => ({ id: i + 1, name }));
        setLocations(fallback);
        setLocation((l) => l || fallback[0]?.name || '');
      } else if (lRes.data?.length) {
        setLocations(lRes.data);
        setLocation((l) => l || lRes.data[0].name);
      } else {
        const fallback = ['Dubai','Abu Dhabi','Ras Al Khaimah'].map((name, i) => ({ id: i + 1, name }));
        setLocations(fallback);
        setLocation((l) => l || fallback[0].name);
      }
    })();
  }, []);

  useEffect(() => {
    const loadId = editId || cloneId;
    if (!loadId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tours').select('*').eq('id', loadId).single();
      setLoading(false);
      if (error || !data) { setMsg(`Error: ${error?.message || 'Tour not found'}`); return; }
      setTitle(isClone ? (data.title || '') + ' (Copy)' : data.title || '');
      const existingSlug = data.slug || '';
      setSlug(existingSlug || slugify(data.title || ''));
      setSlugTouched(!!existingSlug && !isClone);
      setCategory(data.category || '');
      setLocation(data.location || '');
      setLocationId(data.location_id || null);
      setPrice(data.price != null ? String(data.price) : '');
      setDiscount(data.discount || '');
      setDuration(data.duration || '');
      setLanguage(data.language || '');
      setRating(data.rating || '');
      setStatus(data.status || 'Active');
      setBadge(data.badge || '');
      setShortDescription(data.short_description || '');
      setFullDescription(data.full_description || '');
      setPickupInfo(data.pickup_info || 'Hotel or residence pick-up included from anywhere in Dubai');
      setPriceNote(data.price_note || 'Price varies by vehicle, group size and other selections');
      const g = asArray<string>(data.gallery);
      const urls = g.length ? g : (data.image_url ? [data.image_url] : []);
      setGallery(urls.length ? urls.map((url, i) => ({ url, cover: i === 0 })) : [{ url: '' }]);
      const f = asArray<FeatureItem>(data.features);
      setFeatures(f.length ? f.map((x) => ({ icon: x.icon || 'fas fa-check-circle', label: x.label || '' })) : defaultFeatures);
      const it = asArray<ItineraryStep>(data.itinerary);
      setItinerary(it.length ? it.map((s) => ({ title: s.title || '', description: s.description || '', duration: s.duration || '' })) : [{ title: '', description: '', duration: '' }]);
      setHighlightsText(asArray<string>(data.highlights).join('\n'));
      setKnowBefore(data.know_before_you_go || '');
      setAgePolicy(data.age_policy || '');
      setCancellationPolicy(data.cancellation_policy || '');
      const vo = asArray<string>(data.vehicle_options);
      const po = asArray<string>(data.package_options);
      if (vo.length) setVehicleOptions(vo);
      if (po.length) setPackageOptions(po);
      setVideoUrl(data.video_url || '');
      setSeoMetaTitle(data.meta_title || '');
      setSeoMetaDescription(data.meta_description || '');
      setSeoMetaKeywords(data.meta_keywords || '');
      setSeoOgTitle(data.og_title || '');
      setSeoOgDescription(data.og_description || '');
      setSeoOgImage(data.og_image || '');
      setSeoCanonicalUrl(data.canonical_url || '');
      setSeoFocusKeyword(data.focus_keyword || '');
    })();
  }, [editId, cloneId, isClone]);

  useEffect(() => { if (!slugTouched) setSlug(slugify(title)); }, [title, slugTouched]);

  const setCover = (idx: number) => {
    setGallery((g) => g.map((item, i) => ({ ...item, cover: i === idx })));
  };
  const updateGalleryUrl = (idx: number, url: string) => {
    setGallery((g) => g.map((item, i) => (i === idx ? { ...item, url } : item)));
  };
  const removeGalleryItem = (idx: number) => {
    setGallery((g) => {
      const next = g.filter((_, i) => i !== idx);
      if (!next.length) return [{ url: '', cover: true }];
      if (!next.some((x) => x.cover)) next[0].cover = true;
      return next;
    });
  };
  const addGalleryItem = () => setGallery((g) => [...g, { url: '' }]);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setMsg('');
    try {
      const uploaded: GalleryItem[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToImageKit(file);
        uploaded.push({ url });
      }
      setGallery((g) => {
        const base = g.length === 1 && !g[0].url ? [] : g;
        const next = [...base, ...uploaded];
        if (!next.some((x) => x.cover) && next.length) next[0].cover = true;
        return next;
      });
    } catch (e: any) {
      setMsg(`Error: ${e?.message || 'Upload failed'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addFeature = () => {
    const v = newFeature.trim();
    if (!v) return;
    setFeatures([...features, { icon: 'fas fa-check-circle', label: v }]);
    setNewFeature('');
  };
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const addItinerary = () => setItinerary([...itinerary, { title: '', description: '', duration: '' }]);
  const updateItinerary = (i: number, patch: Partial<ItineraryStep>) =>
    setItinerary(itinerary.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const removeItinerary = (i: number) => setItinerary(itinerary.filter((_, idx) => idx !== i));

  const highlights = useMemo(
    () => highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
    [highlightsText]
  );

  const normalizedGallery = useMemo(() => {
    const items = gallery.filter((g) => g.url.trim());
    if (!items.length) return { urls: [] as string[], cover: '' };
    const coverItem = items.find((g) => g.cover) || items[0];
    const rest = items.filter((g) => g !== coverItem);
    return { urls: [coverItem.url.trim(), ...rest.map((g) => g.url.trim())], cover: coverItem.url.trim() };
  }, [gallery]);

  const generateAllContent = async () => {
    if (!title.trim()) {
      setMsg('Error: Please enter a tour title first.');
      return;
    }
    setAiGenerating(true);
    setMsg('Generating Google Ads-optimized content...');
    try {
      const productName = title.trim();
      const loc = location || 'Dubai, UAE';
      const cat = category || 'Tour';
      const dur = duration || 'Full day';
      const prc = price || 'TBA';

      const basePrompt = `Product/Tour Name: "${productName}". Location: ${loc}. Category: ${cat}. Duration: ${dur}. Price: AED ${prc}.`;

      // Short description (Google Ads headline friendly)
      const shortDesc = await callAI(`${basePrompt}\n\nWrite a punchy short description (2-3 sentences) for this ${productName} tour listing. Include the exact product name and location. Make it conversion-focused for Google Ads. Return only the description text.`);
      setShortDescription(shortDesc);

      // Full description (SEO + Google Ads landing page)
      const fullDesc = await callAI(`${basePrompt}\n\nWrite a comprehensive SEO-optimized full description (500-700 words) for "${productName}" in ${loc}. Include the exact product name naturally 3-5 times. Cover: what to expect, itinerary highlights, inclusions, best time to visit, why book, and a strong call-to-action. Use H2 headings and bullet points. Optimize for Google search ranking and Google Ads landing page quality score. Return only the description text.`);
      setFullDescription(fullDesc);

      // Features
      const featuresText = await callAI(`${basePrompt}\n\nList 6 key features/inclusions of this "${productName}" tour as a simple comma-separated list. Return only the comma-separated list, no numbering.`);
      const featureItems = featuresText.split(',').map((f) => f.trim()).filter(Boolean).map((label) => ({ icon: 'fas fa-check-circle', label }));
      setFeatures(featureItems);

      // Itinerary
      const itineraryText = await callAI(`${basePrompt}\n\nCreate a day itinerary with 4-6 steps for "${productName}". Each step: title, short description, duration. Format as: Title | Description | Duration. One per line. Return only the itinerary lines.`);
      const itinerarySteps = itineraryText.split('\n').map((line) => {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
        return parts.length >= 2 ? { title: parts[0], description: parts[1] || '', duration: parts[2] || '' } : null;
      }).filter(Boolean) as ItineraryStep[];
      if (itinerarySteps.length) setItinerary(itinerarySteps);

      // Highlights
      const highlightsText = await callAI(`${basePrompt}\n\nList 6 highlights of this "${productName}" tour as a simple comma-separated list. Return only the comma-separated list.`);
      setHighlightsText(highlightsText.split(',').map((h) => h.trim()).filter(Boolean).join('\n'));

      // Know before
      const knowBeforeText = await callAI(`${basePrompt}\n\nWrite "Know Before You Go" advice (3-5 bullet points) for "${productName}" covering what to bring, dress code, timing, restrictions. Return only the bullet points.`);
      setKnowBefore(knowBeforeText);

      // Age policy
      const agePolicyText = await callAI(`${basePrompt}\n\nWrite an age policy (2-3 sentences) for "${productName}". Return only the policy text.`);
      setAgePolicy(agePolicyText);

      // Cancellation policy
      const cancelPolicyText = await callAI(`${basePrompt}\n\nWrite a cancellation policy (2-3 sentences) for "${productName}". Return only the policy text.`);
      setCancellationPolicy(cancelPolicyText);

      // Vehicle options
      const vehicleText = await callAI(`${basePrompt}\n\nSuggest 3-4 vehicle/transport options for "${productName}" as a comma-separated list. Return only the list.`);
      setVehicleOptions(vehicleText.split(',').map((v) => v.trim()).filter(Boolean));

      // Package options
      const packageText = await callAI(`${basePrompt}\n\nSuggest 3 package tiers (Standard, VIP, Premium) for "${productName}" as a comma-separated list. Return only the list.`);
      setPackageOptions(packageText.split(',').map((p) => p.trim()).filter(Boolean));

      // === GOOGLE ADS SEO FIELDS ===
      // Focus keyword = product name + location (exact match for Google Ads)
      const seoFocusKw = await callAI(`Suggest the PRIMARY focus keyword (single exact phrase) for the Google Ads campaign of "${productName}" in ${loc}. Format: "[Product Name] [Location]" e.g. "Desert Safari Dubai". Return only the keyword phrase.`);
      setSeoFocusKeyword(seoFocusKw);

      // SEO meta title optimized for Google Ads / organic
      const seoTitle = await callAI(`Write an SEO meta title (under 60 chars) for "${productName}" tour in ${loc}. Lead with the exact product name. Include location and a booking intent word (Book, Price, Deals). Return only the title.`);
      setSeoMetaTitle(seoTitle);

      // SEO meta description (Google Ads headline + description style)
      const seoDesc = await callAI(`Write an SEO meta description (under 160 chars) for "${productName}" tour in ${loc}. Include exact product name, location, price if known, and strong CTA ("Book now", "Best price", "Free cancellation"). Optimize for Google Ads quality score. Return only the description.`);
      setSeoMetaDescription(seoDesc);

      // Meta keywords (Google Ads keyword groups)
      const seoKw = await callAI(`Suggest 12-15 Google Ads keywords (comma-separated) for "${productName}" tour in ${loc}. Include: exact match product name, phrase match variations, broad match location keywords, and high-intent booking terms (cheap, best, price, booking, deals, online). Return only the comma-separated keywords.`);
      setSeoMetaKeywords(seoKw);

      // OG Title (social + ads)
      const seoOgTitle = await callAI(`Write an Open Graph / social title (under 70 chars) for "${productName}" tour in ${loc}. Lead with product name. Return only the title.`);
      setSeoOgTitle(seoOgTitle);

      // OG Description
      const seoOgDesc = await callAI(`Write an Open Graph / social description (under 160 chars) for "${productName}" tour in ${loc}. Include CTA. Return only the description.`);
      setSeoOgDescription(seoOgDesc);

      // Canonical URL
      if (!seoCanonicalUrl) {
        const tourSlug = slug || slugify(title);
        setSeoCanonicalUrl(`https://primedesertsafari.com/tour/${tourSlug}`);
      }

      setMsg('Google Ads-optimized content generated! Review and adjust, then Publish.');
    } catch (err: any) {
      setMsg(`Error: ${err?.message || 'AI generation failed'}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const fillCompetitiveData = async () => {
    if (!title.trim()) {
      setMsg('Error: Please enter a tour title first.');
      return;
    }
    setAiGenerating(true);
    setMsg('Researching competitive data for this tour...');
    try {
      const productName = title.trim();
      const loc = location || 'Dubai, UAE';
      const cat = category || 'Tour';
      const dur = duration || 'Full day';
      const prc = price || 'TBA';

      const basePrompt = `Competitive market research for: "${productName}" in ${loc}. Category: ${cat}. Duration: ${dur}. Current listed price: AED ${prc}.`;

      // Short description with competitive angle
      const shortDesc = await callAI(`${basePrompt}\n\nWrite a short description (2-3 sentences) that positions this tour competitively against other ${cat.toLowerCase()} operators in ${loc}. Mention unique advantages. Return only the text.`);
      setShortDescription(shortDesc);

      // Full description with market positioning
      const fullDesc = await callAI(`${basePrompt}\n\nWrite a comprehensive description (600-800 words) for "${productName}" that covers: market positioning vs competitors in ${loc}, detailed itinerary, inclusions vs competitors, pricing justification vs market rates, best time to book, target audience, and strong competitive advantages. Use H2 headings and bullet points. Optimize for Google Ads landing page quality. Return only the text.`);
      setFullDescription(fullDesc);

      // Competitive features
      const featuresText = await callAI(`${basePrompt}\n\nList 8 competitive features/inclusions that would make this "${productName}" tour stand out against other operators in ${loc}. Include premium differentiators. Comma-separated list only.`);
      const featureItems = featuresText.split(',').map((f) => f.trim()).filter(Boolean).map((label) => ({ icon: 'fas fa-check-circle', label }));
      setFeatures(featureItems);

      // Competitive itinerary
      const itineraryText = await callAI(`${basePrompt}\n\nCreate a competitive day itinerary with 5-7 steps for "${productName}". Each step should include a premium element that competitors may not offer. Format: Title | Description | Duration. One per line.`);
      const itinerarySteps = itineraryText.split('\n').map((line) => {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
        return parts.length >= 2 ? { title: parts[0], description: parts[1] || '', duration: parts[2] || '' } : null;
      }).filter(Boolean) as ItineraryStep[];
      if (itinerarySteps.length) setItinerary(itinerarySteps);

      // Highlights
      const highlightsText = await callAI(`${basePrompt}\n\nList 8 competitive highlights/selling points for this "${productName}" tour vs market alternatives in ${loc}. Comma-separated list only.`);
      setHighlightsText(highlightsText.split(',').map((h) => h.trim()).filter(Boolean).join('\n'));

      // Know before with competitive prep
      const knowBeforeText = await callAI(`${basePrompt}\n\nWrite "Know Before You Go" (4-6 bullet points) for "${productName}" including what competitors don't tell customers, hidden costs to watch for, and preparation tips. Return only bullet points.`);
      setKnowBefore(knowBeforeText);

      // Age policy
      const agePolicyText = await callAI(`${basePrompt}\n\nWrite a competitive age policy (2-3 sentences) for "${productName}". Return only the text.`);
      setAgePolicy(agePolicyText);

      // Cancellation policy
      const cancelPolicyText = await callAI(`${basePrompt}\n\nWrite a competitive cancellation policy (2-3 sentences) for "${productName}" that beats market standard. Return only the text.`);
      setCancellationPolicy(cancelPolicyText);

      // Vehicle options (competitive tiers)
      const vehicleText = await callAI(`${basePrompt}\n\nSuggest 4 vehicle/transport options for "${productName}" ranging from budget to premium, competitive with market in ${loc}. Comma-separated list only.`);
      setVehicleOptions(vehicleText.split(',').map((v) => v.trim()).filter(Boolean));

      // Package options (competitive pricing tiers)
      const packageText = await callAI(`${basePrompt}\n\nSuggest 3 competitive package tiers (Budget, Standard, Premium/VIP) for "${productName}" with market-justified positioning in ${loc}. Comma-separated list only.`);
      setPackageOptions(packageText.split(',').map((p) => p.trim()).filter(Boolean));

      // === COMPETITIVE SEO ===
      const focusKw = await callAI(`Primary exact-match keyword for "${productName}" in ${loc} for Google Ads Search campaigns. Format: "[Product] [Location]". Return only the keyword.`);
      setSeoFocusKeyword(focusKw);

      const seoTitle = await callAI(`SEO meta title (under 60 chars) for "${productName}" in ${loc} that beats competitors in search results. Include product name, location, and "Best Price" or "Book Now". Return only the title.`);
      setSeoMetaTitle(seoTitle);

      const seoDesc = await callAI(`SEO meta description (under 160 chars) for "${productName}" in ${loc}. Include price positioning vs competitors, free cancellation, and "Book Now" CTA. Google Ads quality score optimized. Return only the description.`);
      setSeoMetaDescription(seoDesc);

      const seoKw = await callAI(`15-18 Google Ads keywords for "${productName}" in ${loc}. Include exact match, phrase match, broad match, competitor comparison keywords (vs, alternative, better than), and booking intent (cheap, deals, price, online booking). Comma-separated only.`);
      setSeoMetaKeywords(seoKw);

      const ogTitle = await callAI(`Open Graph title (under 70 chars) for "${productName}" tour ad creative.`);
      setSeoOgTitle(ogTitle);

      const ogDesc = await callAI(`Open Graph description (under 160 chars) for "${productName}" in ${loc} - social ad copy. Include CTA.`);
      setSeoOgDescription(ogDesc);

      if (!seoCanonicalUrl) {
        const tourSlug = slug || slugify(title);
        setSeoCanonicalUrl(`https://primedesertsafari.com/tour/${tourSlug}`);
      }

      setMsg('Competitive data filled! All fields populated with market-researched content. Review and Publish.');
    } catch (err: any) {
      setMsg(`Error: ${err?.message || 'Competitive data fill failed'}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const cleanItinerary = itinerary.filter((s) => s.title.trim() || s.description.trim());
    let savedId = editId;
    let savedSlug = slugify(slug || title).trim() || null;

    // Auto-resolve duplicate slug conflicts so saving never fails on slug uniqueness
    if (savedSlug) {
      let attempt = savedSlug;
      let counter = 1;
      while (true) {
        const { data: existing, error: dupError } = await supabase
          .from("tours")
          .select("id,title,slug")
          .eq("slug", attempt);
        if (dupError) break;
        const conflict = existing && existing.find((t) => String(t.id) !== String(editId || ''));
        if (!conflict) { savedSlug = attempt; break; }
        attempt = `${savedSlug}-${counter}`;
        counter++;
        if (counter > 20) break;
      }
    }

    const payload = {
      title: title.trim(),
      slug: savedSlug || null,
      category: category || null,
      location: location || null,
      location_id: locationId || (locations.find((l)=>l.name===location)?.id ?? null),
      price: price ? Number(price) : null,
      discount: discount.trim() || null,
      duration: duration.trim() || null,
      language: language.trim() || null,
      rating: rating.trim() || null,
      status,
      badge: badge.trim() || null,
      is_trending: isTrending,
      image_url: normalizedGallery.cover || null,
      short_description: shortDescription.trim() || null,
      full_description: fullDescription.trim() || null,
      pickup_info: pickupInfo.trim() || null,
      price_note: priceNote.trim() || null,
      gallery: normalizedGallery.urls,
      features,
      itinerary: cleanItinerary,
      highlights,
      know_before_you_go: knowBefore.trim() || null,
      age_policy: agePolicy.trim() || null,
      cancellation_policy: cancellationPolicy.trim() || null,
      vehicle_options: vehicleOptions,
      package_options: packageOptions,
      video_url: videoUrl.trim() || null,
      meta_title: seoMetaTitle.trim() || null,
      meta_description: seoMetaDescription.trim() || null,
      meta_keywords: seoMetaKeywords.trim() || null,
      og_title: seoOgTitle.trim() || null,
      og_description: seoOgDescription.trim() || null,
      og_image: seoOgImage.trim() || null,
      canonical_url: seoCanonicalUrl.trim() || null,
      focus_keyword: seoFocusKeyword.trim() || null,
    };

    let error;

    // Auto-resolve duplicate slug conflicts so saving never fails on slug uniqueness
    if (savedSlug) {
      let attempt = savedSlug;
      let counter = 1;
      while (true) {
        const { data: existing, error: dupError } = await supabase
          .from("tours")
          .select("id,title,slug")
          .eq("slug", attempt);
        if (dupError) break;
        const conflict = existing && existing.find((t) => String(t.id) !== String(editId || ''));
        if (!conflict) { savedSlug = attempt; break; }
        attempt = `${savedSlug}-${counter}`;
        counter++;
        if (counter > 20) break;
      }
    }

    if (isClone) {
      const res = await supabase.from('tours').insert(payload).select('id,slug').single();
      error = res.error;
      savedId = res.data?.id ? String(res.data.id) : null;
      savedSlug = res.data?.slug || savedSlug;
    } else if (isEdit && editId) {
      ({ error } = await supabase.from('tours').update(payload).eq('id', editId));
    } else {
      const res = await supabase.from('tours').insert(payload).select('id,slug').single();
      error = res.error;
      savedId = res.data?.id ? String(res.data.id) : null;
      savedSlug = res.data?.slug || savedSlug;
    }
    setSaving(false);
    if (error) { setMsg(`Error: ${error.message}`); return; }
    router.push(savedSlug || savedId ? `/tour/${savedSlug || savedId}` : '/admin');
  };

  if (loading) {
    return <><AdminStyles /><div className="admin-wrapper"><Sidebar /><main className="main-content"><Topbar title="Edit Tour" /><div className="page-container">Loading...</div></main></div></>;
  }

  const categoryOptions = categories.length ? categories : [{ id: 0, name: 'General' }];

  return (
    <>
      <AdminStyles />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="admin-wrapper">
        <Sidebar />
        <main className="main-content">
          <Topbar title={isClone ? 'Clone Tour' : isEdit ? 'Edit Tour' : 'Add New Tour'} />
          <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-info-circle"></i> Basic Information</h3>
                <div className="form-row">
                  <div className="form-group"><label>Tour Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Evening Desert Safari in Dubai" required /></div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                    <input type="text" value={slug} onChange={(e) => { const v = e.target.value; setSlug(v); setSlugTouched(!!v.trim()); }} placeholder="overnight-desert-safari-ras-al-khaimah" style={{ flex: 1 }} /><span className="help-text">Auto-generates from title.</span>
                    <button type="button" className="btn-sm btn-add" onClick={generateAllContent} disabled={aiGenerating} style={{ marginLeft: 6 }}>
                      <i className={`fas ${aiGenerating ? 'fa-circle-notch fa-spin' : 'fa-magic'}`}></i> {aiGenerating ? 'AI...' : 'AI Fill All'}
                    </button>
                    <button type="button" className="btn-sm btn-add" onClick={fillCompetitiveData} disabled={aiGenerating} style={{ marginLeft: 6 }}>
                      <i className={`fas ${aiGenerating ? 'fa-circle-notch fa-spin' : 'fa-chart-line'}`}></i> {aiGenerating ? '...' : 'Fill Competitive Data'}
                    </button>
                  </div>
                </div>
                <div className="form-row three-col">
                  <div className="form-group"><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select Category...</option>{categoryOptions.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}{category && !categoryOptions.some((c)=>c.name===category) ? <option value={category}>{category}</option> : null}</select></div>
                  <div className="form-group"><label>Location</label><select value={location} onChange={(e) => { const v=e.target.value; setLocation(v); setLocationId(locations.find((l)=>l.name===v)?.id ?? null); }}><option value="">Select Location...</option>{locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}{location && !locations.some((l)=>l.name===location) ? <option value={location}>{location}</option> : null}</select></div>
                  <div className="form-group"><label>Price (AED)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="649" /></div>
                </div>
                <div className="form-row three-col">
                  <div className="form-group"><label>Discount</label><input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10% OFF" /></div>
                  <div className="form-group"><label>Duration</label><input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6 hours" /></div>
                  <div className="form-group"><label>Language</label><input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="English, Arabic" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Rating</label><input type="text" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.8 (200+ Reviews)" /></div>
                  <div className="form-group"></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Status</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="Active">Active (Available)</option><option value="Inactive">Inactive (Sold Out)</option></select></div>
                  <div className="form-group"><label>Badge (optional)</label><input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New / Popular" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} /> Show in Trending Attractions (homepage)</label><span className="help-text">Marked tours appear in the Trending Attractions section.</span></div>
                  <div className="form-group" />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}><label>Short Description (About)</label><textarea rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} /></div>
                <div className="form-group"><label>Full Description</label><textarea rows={4} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} /></div>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-search"></i> SEO Settings (Google Ranking)</h3>
                <div className="form-row three-col">
                  <div className="form-group"><label>Meta Title</label><input type="text" value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} placeholder="e.g. Evening Desert Safari Dubai - Book Now" /></div>
                  <div className="form-group"><label>Focus Keyword</label><input type="text" value={seoFocusKeyword} onChange={(e) => setSeoFocusKeyword(e.target.value)} placeholder="e.g. desert safari dubai" /></div>
                  <div className="form-group"><label>Meta Keywords</label><input type="text" value={seoMetaKeywords} onChange={(e) => setSeoMetaKeywords(e.target.value)} placeholder="e.g. desert safari, dubai tours, adventure" /></div>
                </div>
                <div className="form-row three-col">
                  <div className="form-group"><label>OG Title</label><input type="text" value={seoOgTitle} onChange={(e) => setSeoOgTitle(e.target.value)} placeholder="e.g. Evening Desert Safari Dubai" /></div>
                  <div className="form-group"><label>OG Description</label><input type="text" value={seoOgDescription} onChange={(e) => setSeoOgDescription(e.target.value)} placeholder="e.g. Experience the best desert safari in Dubai" /></div>
                  <div className="form-group"><label>Canonical URL</label><input type="text" value={seoCanonicalUrl} onChange={(e) => setSeoCanonicalUrl(e.target.value)} placeholder="https://primedesertsafari.com/tour/..." /></div>
                </div>
                <div className="form-group"><label>Meta Description</label><textarea rows={2} value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} placeholder="SEO description for search results" /></div>
                <div className="form-group"><label>OG Image</label><input type="text" value={seoOgImage} onChange={(e) => setSeoOgImage(e.target.value)} placeholder="https://...og-image.jpg" /></div>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-images"></i> Hero Gallery Images</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Upload from local drive</label>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e.target.files)} />
                    <span className="help-text">{uploading ? 'Uploading to ImageKit...' : 'Select one or more images. They upload to ImageKit and appear below.'}</span>
                  </div>
                  <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Or add image URL</label>
                    <button type="button" className="btn-sm btn-add" onClick={addGalleryItem} style={{ alignSelf: 'flex-start' }}><i className="fas fa-plus"></i> Add Image URL Row</button>
                    <span className="help-text">Paste any image URL in a row. You can mix uploaded images and URLs.</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {gallery.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto auto', gap: 10, alignItems: 'center', background: '#fafafa', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                      <div style={{ width: 120, height: 72, borderRadius: 8, overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.url ? <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-image" style={{ color: '#94a3b8' }}></i>}
                      </div>
                      <input type="text" value={item.url} onChange={(e) => updateGalleryUrl(i, e.target.value)} placeholder="Paste image URL (https://...) or upload from device above" style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8 }} />
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' }}>
                        <input type="radio" name="cover" checked={!!item.cover} onChange={() => setCover(i)} /> Cover
                      </label>
                      <button type="button" className="btn-remove" onClick={() => removeGalleryItem(i)} title="Remove"><i className="fas fa-trash"></i></button>
                    </div>
                  ))}
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group"><label>Pickup Info (banner)</label><input type="text" value={pickupInfo} onChange={(e) => setPickupInfo(e.target.value)} /></div>
                  <div className="form-group"><label>Price Note (banner)</label><input type="text" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} /></div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-star"></i> Included Features</h3>
                <div className="features-list">
                  {features.map((f, i) => (<div className="feature-item" key={i}>{f.label} <i className="fas fa-times" onClick={() => removeFeature(i)}></i></div>))}
                </div>
                <div className="add-feature-input">
                  <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Falcon Show" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, width: '100%', outline: 'none' }} />
                  <button type="button" className="btn-sm btn-add" onClick={addFeature}>Add</button>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-route"></i> Experience Itinerary</h3>
                <div className="itinerary-builder">
                  {itinerary.map((step, i) => (
                    <div className="itinerary-row" key={i}>
                      <div className="number">{i + 1}</div>
                      <div className="fields">
                        <input type="text" value={step.title} onChange={(e) => updateItinerary(i, { title: e.target.value })} placeholder="Step Title" />
                        <textarea rows={2} value={step.description} onChange={(e) => updateItinerary(i, { description: e.target.value })} placeholder="Short description..." />
                        <input type="text" value={step.duration} onChange={(e) => updateItinerary(i, { duration: e.target.value })} placeholder="Duration" style={{ width: '50%' }} />
                      </div>
                      <button type="button" className="btn-remove" onClick={() => removeItinerary(i)}><i className="fas fa-trash"></i></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-sm btn-add" style={{ marginTop: 15 }} onClick={addItinerary}><i className="fas fa-plus"></i> Add Step</button>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-list-alt"></i> Additional Details (Accordions)</h3>
                <div className="form-row">
                  <div className="form-group"><label>Highlights (one per line)</label><textarea rows={3} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} /></div>
                  <div className="form-group"><label>Know Before You Go</label><textarea rows={3} value={knowBefore} onChange={(e) => setKnowBefore(e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Age Policy</label><textarea rows={2} value={agePolicy} onChange={(e) => setAgePolicy(e.target.value)} /></div>
                  <div className="form-group"><label>Cancellation Policy</label><textarea rows={2} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} /></div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title"><i className="fas fa-sliders-h"></i> Booking Sidebar Options</h3>
                <div className="form-row three-col">
                  <div className="form-group">
                    <label>Vehicle Options</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="text" value={vehicleInput} onChange={(e) => setVehicleInput(e.target.value)} placeholder="Add option" />
                      <button type="button" className="btn-sm btn-add" onClick={() => { if (vehicleInput.trim()) { setVehicleOptions([...vehicleOptions, vehicleInput.trim()]); setVehicleInput(''); } }}>+</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{vehicleOptions.map((v) => (<span key={v} className="feature-item">{v} <i className="fas fa-times" onClick={() => setVehicleOptions(vehicleOptions.filter((x) => x !== v))}></i></span>))}</div>
                  </div>
                  <div className="form-group">
                    <label>Package Options</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="text" value={packageInput} onChange={(e) => setPackageInput(e.target.value)} placeholder="Add option" />
                      <button type="button" className="btn-sm btn-add" onClick={() => { if (packageInput.trim()) { setPackageOptions([...packageOptions, packageInput.trim()]); setPackageInput(''); } }}>+</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{packageOptions.map((v) => (<span key={v} className="feature-item">{v} <i className="fas fa-times" onClick={() => setPackageOptions(packageOptions.filter((x) => x !== v))}></i></span>))}</div>
                  </div>
                  <div className="form-group"><label>Video URL (optional)</label><input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." /></div>
                </div>
              </div>

              {msg && <p style={{ marginBottom: 12, color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>{msg}</p>}
              <div className="submit-bar">
                <Link href="/admin" className="btn-cancel">Cancel</Link>
                <button type="submit" className="btn-save" disabled={saving || uploading}>
                  <i className="fas fa-save"></i> {uploading ? 'Uploading...' : saving ? 'Saving...' : (isEdit ? 'Update Tour' : 'Publish Tour')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default function AddTourPage() {
  return <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}><AddTourInner /></Suspense>;
}
