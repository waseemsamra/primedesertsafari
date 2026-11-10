# Tour Data Completeness Test Cases

## Objective
Verify that every tour record has all required fields properly filled after using **AI Fill All** and manual entry.

## Fields That Should Be Populated

### Group A: Basic Tour Info (Manual Entry — Required Before AI)
| Field | Required | Notes |
|-------|----------|-------|
| Tour Title | Yes | Enter first before clicking AI Fill All |
| Category | Yes | Select from dropdown |
| Location | Yes | Select from dropdown |
| Price (AED) | Yes | Manual numeric entry |
| Duration | Yes | e.g. "6 hours" |

### Group B: Content Fields (Auto-filled by AI Fill All)
| Field | Auto-filled | Notes |
|-------|-------------|-------|
| Short Description | Yes | 2-3 sentences, conversion-focused |
| Full Description | Yes | 500-700 words with H2 headings and bullets |
| Features | Yes | 6 items with icons |
| Itinerary | Yes | 4-6 steps with title/duration/description |
| Highlights | Yes | 6 bullet points |
| Know Before You Go | Yes | 3-5 bullet points |
| Age Policy | Yes | 2-3 sentences |
| Cancellation Policy | Yes | 2-3 sentences |
| Vehicle Options | Yes | 3-4 options |
| Package Options | Yes | 3 tiers |

### Group C: SEO Fields (Auto-filled by AI Fill All)
| Field | Auto-filled | Notes |
|-------|-------------|-------|
| Focus Keyword | Yes | e.g. "Desert Safari Dubai" |
| Meta Title | Yes | Under 60 chars |
| Meta Description | Yes | Under 160 chars |
| Meta Keywords | Yes | 12-15 comma-separated |
| OG Title | Yes | Under 70 chars |
| OG Description | Yes | Under 160 chars |
| Canonical URL | Yes | `https://primedesertsafari.com/tour/<slug>` |

### Group D: Manual / Optional Fields (NOT Auto-filled)
| Field | Required | Notes |
|-------|----------|-------|
| Slug | Yes | Auto-generates from title; verify it's set |
| Discount | No | Optional |
| Language | No | Optional |
| Rating | No | Optional |
| Badge | No | Optional |
| Pickup Info | No | Has default; customize if needed |
| Price Note | No | Has default; customize if needed |
| Gallery Images | Yes | Upload via ImageKit; at least 1 cover image |
| OG Image | No | Manual URL |
| Video URL | No | Optional |
| is_trending | No | Toggle in admin table |

---

## Test Case TC-01: AI Fill All Completeness

**Steps:**
1. Navigate to `/admin/add-tour`
2. Enter Tour Title, Category, Location, Price, Duration
3. Click **AI Fill All**
4. Verify all Group B and Group C fields are populated (not empty)
5. Verify Slug field is auto-generated from title
6. Save the tour

**Expected Result:**
- No field in Group B or C is empty after AI generation
- Slug is non-empty and URL-friendly
- Tour saves successfully to Supabase
- No 500 error from `/api/generate-ai`

**Pass/Fail:** ☐ Pass ☐ Fail  
**Notes:** _________________________________

---

## Test Case TC-02: All Tours in Admin Table Are Complete

**Steps:**
1. Navigate to `/admin` (Tours tab)
2. For each tour row, verify:
   - Tour Name is not empty
   - Category is not empty / "—"
   - Location is not empty / "—"
   - Price (AED) shows a number or "—"
   - Status badge shows Active/Inactive
3. Click **Edit** on each tour
4. Verify Short Description, Full Description, SEO Meta Title are not empty

**Expected Result:**
- Every tour has a name, category, location
- Edit view shows content fields populated
- No tour has empty critical fields

**Pass/Fail:** ☐ Pass ☐ Fail  
**Tours checked:** ______ / ______  
**Notes:** _________________________________

---

## Test Case TC-03: Tour Detail Page Renders Correctly

**Steps:**
1. Navigate to `/tour/[id]` for each published tour
2. Verify:
   - Page title matches tour name
   - About section shows short/full description
   - Features grid displays items with icons
   - Itinerary accordion expands and shows steps
   - Highlights accordion shows bullet points
   - Know Before You Go accordion shows content
   - Age Policy and Cancellation Policy show content
   - No raw Markdown (`##`, `**`) visible — rendered as formatted text

**Expected Result:**
- All content sections render with proper formatting
- No literal Markdown syntax visible
- Images load from ImageKit

**Pass/Fail:** ☐ Pass ☐ Fail  
**Tours checked:** ______ / ______  
**Notes:** _________________________________

---

## Test Case TC-04: SEO Meta Tags Present

**Steps:**
1. View page source of `/tour/[id]`
2. Verify `<title>` tag contains Meta Title
3. Verify `meta[name="description"]` contains Meta Description
4. Verify `meta[property="og:title"]` contains OG Title
5. Verify `meta[property="og:description"]` contains OG Description
6. Verify `link[rel="canonical"]` href matches Canonical URL

**Expected Result:**
- All SEO tags present and non-empty
- Canonical URL is valid

**Pass/Fail:** ☐ Pass ☐ Fail  
**Notes:** _________________________________

---

## Quick Validation Script

Run this in the browser console on `http://localhost:3000/admin` to check which tours have empty critical fields:

```javascript
// Paste this into browser DevTools Console on /admin
async function checkTours() {
  const { data: tours, error } = await supabase
    .from('tours')
    .select('id, title, category, location, price, short_description, full_description, meta_title, focus_keyword, slug, image_url')
    .order('id', { ascending: false });

  if (error) { console.error('Error:', error); return; }

  console.log(`\n=== TOUR COMPLETENESS CHECK ===`);
  console.log(`Total tours: ${tours.length}\n`);

  tours.forEach(t => {
    const issues = [];
    if (!t.title) issues.push('MISSING TITLE');
    if (!t.category) issues.push('MISSING CATEGORY');
    if (!t.location) issues.push('MISSING LOCATION');
    if (!t.short_description) issues.push('MISSING SHORT DESC');
    if (!t.full_description) issues.push('MISSING FULL DESC');
    if (!t.meta_title) issues.push('MISSING META TITLE');
    if (!t.focus_keyword) issues.push('MISSING FOCUS KEYWORD');
    if (!t.slug) issues.push('MISSING SLUG');
    if (!t.image_url) issues.push('MISSING IMAGE');

    if (issues.length > 0) {
      console.log(`❌ ID ${t.id}: "${t.title || 'NO TITLE'}" — ${issues.join(', ')}`);
    } else {
      console.log(`✅ ID ${t.id}: "${t.title}" — COMPLETE`);
    }
  });

  const incomplete = tours.filter(t => !t.title || !t.category || !t.location || !t.short_description || !t.full_description || !t.meta_title || !t.focus_keyword || !t.slug || !t.image_url);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Complete: ${tours.length - incomplete.length} / ${tours.length}`);
  console.log(`Incomplete: ${incomplete.length}`);
}

checkTours();
```

---

## How to Fix Incomplete Tours

1. Open `/admin/add-tour?id=<tour_id>`
2. Enter Title, Category, Location, Price, Duration (if missing)
3. Click **AI Fill All**
4. Upload at least one gallery image (cover)
5. Click **Publish / Save**

---

## Rotation Reminder

The OpenAI API key in `.env.local` was exposed in chat. Rotate it at platform.openai.com after testing.