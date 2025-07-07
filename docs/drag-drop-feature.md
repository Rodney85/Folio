# Drag-and-Drop Feature for Car Grid

## Overview
This feature allows users to rearrange their car cards in the profile page by dragging and dropping them. The implementation maintains the current 3-column grid layout while adding the ability to reorder cars according to user preference.

## Implementation Details

### Components Created
1. **DraggableCarGrid.tsx**: A draggable version of the car grid that maintains the same visual appearance while allowing for drag-and-drop rearrangement.
2. **SortableItem.tsx**: A wrapper component that makes individual grid items draggable.

### Backend Changes
1. **Schema Update**: Added an `order` field to the car schema in `schema.ts` to store the user's custom order.
2. **New Convex File**: Created `carOrder.ts` with:
   - `updateCarOrder` mutation: Updates the order of a car
   - `getUserCarsSorted` query: Returns cars sorted by their order field

### Key Features
- Maintains the 3-column grid layout as specified
- Visual feedback during dragging (shadow, scaling, opacity changes)
- Grip handle icon for better user experience
- Smooth animations during rearrangement
- Automatic saving of the new order to the database
- Fallback implementation if libraries aren't available

## Required Dependencies
This feature requires the following npm packages to be installed:
```
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

## Installation
1. Install the required dependencies:
   ```
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. Ensure the Convex backend is updated with the schema changes
   - The `order` field is added to the cars table
   - The `carOrder.ts` file is deployed to Convex

## Usage
The drag-and-drop functionality is automatically enabled on the ProfilePage. Users can:
1. Hover over a car card to see the drag handle
2. Click and drag to reorder their car cards
3. Release to drop the card in the new position

## Error Handling
- The implementation includes a fallback to a standard grid if the drag-and-drop libraries aren't available
- Proper error handling ensures the application won't crash if there are issues with the feature

## Future Enhancements
- Add animation when cards are initially loaded
- Implement touch gesture improvements for mobile
- Add an explicit "reorder mode" toggle for more control
