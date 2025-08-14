# 🚀 Premium Analytics Features

This document outlines the analytics modules available to premium users of Carfolio. Metrics cover profile performance, car-level views, affiliate link clicks, and traffic sources over customizable time windows.

---

## 1. Profile Views

**Metric**: Total profile page views

**Time Windows:**
- Today (per hour)
- Last 7 days (per day)
- Last 30 days (per day)
- Last 3 months (per week)
- Custom range

**Visualization:**
- Line chart trend
- Summary cards for each window

---

## 2. Car-level Views

**Metric**: Total views per car

**Time Windows:** Same as Profile Views

**Details:**
- “Top N” most-viewed cars in selected range
- Tabular list with per-car view counts

**Visualization:**
- Bar chart for “Top N”
- Table or list view for details

---

## 3. Affiliate Link Clicks

**Metric**: Total clicks on affiliate/product links embedded in each car’s details

**Time Windows:** Same as Profile Views

**Details:**
- Per-car, per-link breakdown of click counts
- “Top N” most-clicked products across all cars

**Visualization:**
- Bar chart for top links
- Detailed table showing link URLs, labels, and click counts

---

## 4. Traffic Sources

**Metrics:**
- QR code scans vs. direct link clicks
- Referral domain breakdown (e.g. Instagram, TikTok, YouTube, direct)

**Time Windows:** Same as Profile Views

**Visualization:**
- Donut or pie chart for referral share
- Trend line chart for source counts over time

---

## Implementation Outline

1. **Event Instrumentation (Frontend & Convex):**
   - `profile_view` (on profile load)
   - `car_view` (on car detail render)
   - `link_click` (on affiliate link click)
   - `qr_scan` (when scanning generated QR code)

2. **Backend Aggregation (Convex Functions):**
   - Group and count events by day/week/month
   - Support query params: `entity=profile|car|link`, `range`, `groupBy`

3. **API Endpoint:**
   - `GET /analytics/stats?entity=<>&range=<>&groupBy=<>`

4. **Frontend Dashboard Component:**
   - File: `AnalyticsDashboard.tsx` under `/src/components/admin/`
   - Uses TanStack Chart or Recharts for charts and shadcn/ui for cards

5. **Public Link Embedding:**
   - Mini “Views” badge or compact sparkline on public profile/car pages
   - Lazy-load stats via the analytics API

---

*End of document.*
