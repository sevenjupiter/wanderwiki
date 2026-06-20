# WanderWiki - Project TODO

## Core Infrastructure
- [x] Database schema (users, itineraries, stops, tips, shares)
- [x] Server API routes (tRPC routers for all features)
- [x] Design system (color palette, typography, global styles)

## Feature 1: User Authentication & Profile
- [x] OAuth login/logout flow
- [x] User profile page with avatar and trip stats
- [x] Profile editing

## Feature 2: Itinerary Builder Canvas
- [x] Create new itinerary (title, destination, dates, duration)
- [x] Add/edit/delete stops with drag-and-drop reordering
- [x] Day assignment for stops
- [x] Timeline visual interface

## Feature 3: Category Tagging
- [x] Must-See, Must-Do, Must-Try, Must-Eat tags with icons
- [x] Filter stops by category
- [x] Visual category badges on stops

## Feature 4: AI Route Optimizer
- [x] Google Maps integration for geocoding
- [x] Route optimization to eliminate backtracking
- [x] Calculate real travel distances and durations
- [x] One-click optimize button

## Feature 5: Google Maps Integration
- [x] Interactive map with all stops plotted
- [x] Route polyline display
- [x] Nearby points of interest suggestions

## Feature 6: Interactive Map View
- [x] Live map with numbered stops in order
- [x] Route visualization between stops
- [x] Click stop markers for details

## Feature 7: Day-by-Day Itinerary View
- [x] Structured daily view with time slots
- [x] Estimated travel time between stops
- [x] Daily summary cards

## Feature 8: AI Content Aggregator
- [x] AI-generated tips and recommendations
- [x] Must-see/do/try/eat suggestions per destination
- [x] Travel tips from community sources

## Feature 9: Budget Tracker
- [x] Budget categories (accommodation, transport, food, activities)
- [x] Currency support
- [x] Budget summary per trip

## Feature 10: Itinerary Sharing
- [x] Public/private toggle
- [x] Shareable link generation
- [x] Community discovery feed
- [x] Browse and filter shared itineraries

## Feature 11: Booking Aggregator
- [x] Accommodation links (Agoda, Booking.com, Hotels.com, Trip.com)
- [x] Car rental links
- [x] Link-out to third-party booking sites

## Feature 12: AI Chat Assistant
- [x] Conversational travel assistant
- [x] Hidden gem suggestions
- [x] Itinerary refinement through dialogue
- [x] Context-aware responses based on current itinerary

## Enhancements & Gap Fixes
- [x] Add start/end date fields to itinerary creation
- [x] Implement stop editing dialog
- [x] Add category filter UI in itinerary builder
- [x] Surface nearby POI suggestions in map view (Places API)
- [x] Add clickable map markers with info windows
- [x] Add daily summary stats per day (stop count, activity time, travel time)
- [x] Add discovery filters (destination, style, duration)
- [x] Add community tips section to shared itinerary page
