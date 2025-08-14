# Car Data Flow Analysis - Carfolio Codebase

## Overview
This document traces the complete data flow for cars in the Carfolio application, from creation through display and editing.

## 1. Car Creation Flow

### Entry Point: AddCarPage (`/add-car`)
**File**: `src/pages/AddCarPage.tsx`

#### Data Structure Created:
```typescript
const initialCarData = {
  make: "",
  model: "",
  year: "",
  package: "",
  engine: "",
  transmission: "",
  drivetrain: "",
  bodyStyle: "",
  exteriorColor: "",
  interiorColor: "",
  generation: "",
  powerHp: "",
  torqueLbFt: "",
  description: "",
};
```

#### Process:
1. **Form Input**: User fills out car details and uploads images (up to 8)
2. **Image Upload**: Images uploaded to Backblaze B2 via `uploadToBackblaze()`
3. **Car Creation**: Calls `createCar` mutation in Convex
4. **Parts Creation**: Creates associated parts/products for affiliate links
5. **Analytics**: Tracks car addition event
6. **Navigation**: Redirects to `/car/{carId}` (CarDetailsPage)

#### Key Functions:
- `handleSubmit()`: Main form submission logic
- `uploadToBackblaze()`: Image upload to Backblaze B2
- `createCar()`: Convex mutation to create car record
- `createPart()`: Convex mutation to create parts

## 2. Data Storage

### Database Schema (Convex)
**File**: `convex/schema.ts`

#### Cars Table:
```typescript
cars: defineTable({
  userId: v.string(),
  make: v.string(),
  model: v.string(),
  year: v.number(),
  // Detailed specs
  package: v.optional(v.string()),
  engine: v.optional(v.string()),
  transmission: v.optional(v.string()),
  drivetrain: v.optional(v.string()),
  bodyStyle: v.optional(v.string()),
  exteriorColor: v.optional(v.string()),
  interiorColor: v.optional(v.string()),
  generation: v.optional(v.string()),
  powerHp: v.optional(v.string()),
  torqueLbFt: v.optional(v.string()),
  // Legacy fields (for backward compatibility)
  power: v.optional(v.string()),
  torque: v.optional(v.number()),
  description: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  isPublished: v.boolean(),
  isFeatured: v.optional(v.boolean()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
  order: v.optional(v.number()),
})
```

#### Parts Table:
```typescript
parts: defineTable({
  carId: v.id("cars"),
  userId: v.string(),
  name: v.string(),
  category: v.string(),
  price: v.optional(v.number()),
  purchaseUrl: v.optional(v.string()),
  affiliateCode: v.optional(v.string()),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  isPublished: v.optional(v.boolean()),
  isFeatured: v.optional(v.boolean()),
})
```

### Backend Operations
**File**: `convex/cars.ts`

#### Key Mutations:
- `createCar()`: Creates new car record
- `getUserCars()`: Fetches all cars for current user
- `getCarById()`: Fetches specific car by ID
- `updateCar()`: Updates car details
- `deleteCar()`: Deletes car record

## 3. Data Display Flow

### 3.1 User Profile Display
**File**: `src/pages/ProfilePage.tsx`

#### Data Fetching:
- Uses `api.cars.getUserCars` to fetch user's cars
- Displays cars in Instagram-style grid using `DraggableCarGrid`

#### Display Components:
- `DraggableCarGrid`: Main grid component with drag-and-drop reordering
- `CarImageWithUrl`: Handles image display from Backblaze URLs

### 3.2 Public Profile Display
**File**: `src/pages/PublicProfilePage.tsx`

#### Data Fetching:
- Uses `api.users.getProfileByUsername` to fetch public profile
- Only shows published cars (`isPublished: true`)

#### Display Components:
- `CarGrid`: Simplified grid for public viewing
- `SocialLinks`: Social media integration

### 3.3 Individual Car Details
**File**: `src/pages/CarDetailsPage.tsx`

#### Data Fetching:
- Uses `api.cars.getCarById` to fetch specific car
- Uses `api.parts.getCarParts` to fetch associated parts
- Tracks analytics with `api.analytics.logEvent`

#### Features:
- Image gallery with swipe navigation
- Car specifications display
- Parts/product links
- Edit and delete buttons

## 4. Data Editing Flow

### Entry Point: EditCarPage (`/edit-car/{id}`)
**File**: `src/pages/EditCarPage.tsx`

#### Data Loading:
1. Fetches existing car data via `api.cars.getCarById`
2. Fetches existing parts via `api.parts.getCarParts`
3. Populates form with current values

#### Editing Process:
1. **Image Management**: Can add/remove images (max 8 total)
2. **Car Details**: Edit all car specifications
3. **Parts Management**: Add/remove product links
4. **Save**: Updates car and recreates parts

#### Key Functions:
- `handleSubmit()`: Form submission and data update
- `updateCar()`: Updates car record
- `deletePart()` + `createPart()`: Recreates parts list

## 5. Data Flow Diagram

```
AddCarPage → createCar() → Convex DB → getUserCars() → ProfilePage
     ↓
CarDetailsPage ← getCarById() ← Convex DB
     ↓
EditCarPage → updateCar() → Convex DB → CarDetailsPage
     ↓
PublicProfilePage ← getProfileByUsername() ← Convex DB
```

## 6. Key Components Analysis

### 6.1 DraggableCarGrid
**File**: `src/components/cars/DraggableCarGrid.tsx`

#### Features:
- Drag-and-drop reordering using @dnd-kit
- Instagram-style layout
- Edit mode toggle
- Automatic order saving

#### Data Flow:
- Fetches cars via `api.carOrder.getUserCarsSorted`
- Updates order via `api.carOrder.updateCarOrder`

### 6.2 CarGrid
**File**: `src/components/cars/CarGrid.tsx`

#### Features:
- Simplified grid for public viewing
- Read-only mode
- Responsive design

### 6.3 CarImageWithUrl
**File**: `src/components/cars/CarImageWithUrl.tsx`

#### Features:
- Handles Backblaze B2 image URLs
- Fallback for missing images
- Loading states

## 7. Analytics Integration

### Event Tracking
**File**: `convex/analytics.ts`

#### Tracked Events:
- `car_view`: When car details page is viewed
- `product_click`: When product links are clicked
- `profile_view`: When public profile is viewed

#### Analytics Data:
- Visitor device type
- Traffic sources (UTM parameters)
- Geographic data (Pro plan)
- Referrer information

## 8. Image Management

### Storage System
**File**: `src/utils/storageService.ts`

#### Process:
1. Images uploaded to Backblaze B2
2. Storage IDs returned and stored in car record
3. Images displayed via `CarImageWithUrl` component

#### Limits:
- Maximum 8 images per car
- Supported formats: JPG, PNG
- Automatic compression and optimization

## 9. Parts/Products Management

### Affiliate Integration
- Product links stored in parts table
- Purchase URLs for affiliate marketing
- Category-based organization
- Image support for products

### Display:
- "Shop the Build" button on car details
- Product list with purchase links
- Analytics tracking for clicks

## 10. Data Relationships

### One-to-Many Relationships:
- User → Cars (one user can have many cars)
- Car → Parts (one car can have many parts)
- Car → Images (one car can have many images)

### Foreign Keys:
- `cars.userId` → `users._id`
- `parts.carId` → `cars._id`
- `analytics.carId` → `cars._id`

## 11. Performance Considerations

### Optimizations:
- Lazy loading of images
- Efficient queries with proper indexing
- Real-time updates via Convex subscriptions
- Image compression and optimization

### Caching:
- Convex handles caching automatically
- Image caching via Backblaze CDN
- Client-side caching for frequently accessed data

## 12. Security & Permissions

### Access Control:
- Users can only edit their own cars
- Public profiles show only published cars
- Admin role for platform management
- Proper authentication via Clerk

### Data Validation:
- Input validation in Convex schema
- File type validation for images
- URL validation for product links

## 13. Future Improvements

### Identified Issues:
1. **Legacy Fields**: `power`/`torque` vs `powerHp`/`torqueLbFt` duplication
2. **Edit Page**: Uses old field names (`brand` instead of `make`)
3. **Image Management**: Could be more efficient
4. **Parts Management**: Could have better UX

### Recommendations:
1. Clean up legacy field usage
2. Standardize field names across components
3. Improve image upload UX
4. Add bulk operations for parts
5. Implement better error handling 