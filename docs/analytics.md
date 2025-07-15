# CarFolio Analytics Implementation

This document describes the analytics implementation in CarFolio, which includes both Google Analytics 4 (GA4) for admin-level insights and user-facing analytics powered by Convex.

## Analytics Architecture

### 1. Google Analytics (GA4)
- Located in `src/lib/analytics.ts`
- Uses `react-ga4` for implementation
- Tracks page views and custom events
- Configuration via `VITE_GA_MEASUREMENT_ID` environment variable

### 2. User-Facing Analytics
Located in the following files:
- `convex/analytics.ts`: Backend mutations and queries
- `convex/schema.ts`: Analytics table schema
- `src/pages/AnalyticsPage.tsx`: Analytics dashboard UI

## Tracked Events

### Profile Views
```typescript
type: "profile_view"
// Tracked when a user's public profile is viewed
```

### Car Views
```typescript
type: "car_view"
carId: Id<"cars">
// Tracked when a car's details page is viewed
```

### Product Clicks
```typescript
type: "product_click"
carId: Id<"cars">
partId: Id<"parts">
// Tracked when a product link is clicked
```

## Analytics Data Structure

```typescript
analytics: {
  userId: string;        // Owner of the content being viewed
  type: string;          // Event type (profile_view, car_view, product_click)
  carId?: Id<"cars">;   // Referenced car (if applicable)
  partId?: Id<"parts">; // Referenced product (if applicable)
  
  // Visitor information
  visitorId?: string;
  visitorDevice?: string; // mobile, desktop, tablet
  
  // Traffic source
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Location (Pro plan feature)
  country?: string;
  city?: string;
  
  createdAt: number;    // Timestamp
}
```

## Available Metrics

### Basic Analytics (Starter Plan)
- Total profile views
- Total car views
- Total product clicks
- Unique visitors count
- Device type breakdown
- Last 30 days of activity

### Advanced Analytics (Pro Plan) - TODO
- Time-series data
- Click-through rates
- Traffic sources
- Geographic breakdown
- Real-time viewers
- Export capabilities
- Campaign tracking

## Implementation Notes

1. **Event Tracking**
   - Profile views: Tracked in `PublicProfilePage.tsx`
   - Car views: Tracked in `CarDetailsPage.tsx`
   - Product clicks: Tracked in product link click handlers

2. **Data Aggregation**
   - Uses Convex queries to aggregate data
   - Default time range is 30 days
   - Data is aggregated by user ID

3. **Device Detection**
   - Uses `getDeviceType()` utility in `src/lib/utils.ts`
   - Detects mobile, tablet, and desktop based on user agent

4. **Performance Considerations**
   - Analytics events are non-blocking
   - Queries are optimized with appropriate indexes
   - Device detection runs client-side

## Future Enhancements

1. **Analytics Features**
   - [ ] Implement time-series charts
   - [ ] Add geographic data collection
   - [ ] Add export functionality
   - [ ] Implement real-time viewer count

2. **Plan-Based Features**
   - [ ] Implement feature gating based on user plan
   - [ ] Add advanced analytics for Pro users
   - [ ] Add data retention policies

3. **Admin Dashboard**
   - [ ] Create admin-only analytics dashboard
   - [ ] Add platform-wide metrics
   - [ ] Implement conversion funnel tracking
