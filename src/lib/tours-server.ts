const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type TourFeature = { icon?: string; label?: string };
export type TourItinerary = { title?: string; description?: string; duration?: string };

export type TourRecord = {
  id: number;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  location?: string | null;
  price?: number | null;
  discount?: string | null;
  duration?: string | null;
  language?: string | null;
  rating?: string | null;
  status?: string | null;
  badge?: string | null;
  image_url?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  pickup_info?: string | null;
  price_note?: string | null;
  gallery?: string[] | null;
  features?: TourFeature[] | null;
  itinerary?: TourItinerary[] | null;
  highlights?: string[] | null;
  know_before_you_go?: string | null;
  age_policy?: string | null;
  cancellation_policy?: string | null;
  vehicle_options?: string[] | null;
  package_options?: string[] | null;
  video_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  focus_keyword?: string | null;
};

async function rest(pathAndQuery: string): Promise<unknown> {
  if (!SUPA_URL || !SUPA_KEY) return null;
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/${pathAndQuery}`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getTour(idOrSlug: string): Promise<TourRecord | null> {
  const isNum = /^\d+$/.test(idOrSlug);
  const filter = isNum ? `id=eq.${idOrSlug}` : `slug=eq.${encodeURIComponent(idOrSlug)}`;
  const rows = (await rest(`tours?${filter}&select=*&limit=1`)) as TourRecord[] | null;
  return rows?.[0] ?? null;
}

export async function getRelatedTours(excludeId: number, limit = 4): Promise<TourRecord[]> {
  const rows = (await rest(`tours?id=neq.${excludeId}&select=*&limit=${limit}`)) as TourRecord[] | null;
  return rows ?? [];
}

export async function getAllTours(limit = 200): Promise<TourRecord[]> {
  const rows = (await rest(`tours?select=*&order=id.desc&limit=${limit}`)) as TourRecord[] | null;
  return rows ?? [];
}