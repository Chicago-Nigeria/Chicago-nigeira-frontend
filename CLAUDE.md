# CLAUDE.md - Frontend

This file provides guidance to Claude Code when working with the **Chicago Nigeria frontend** codebase.

## Project Overview

Chicago Nigeria frontend is a Next.js 15 web application that connects Nigerians residing in Chicago. It features user authentication, a marketplace for listings, events management, messaging, and community features (groups, feeds).

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

### Environment Variables
Required environment variables (set in `.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5002)
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL (default: http://localhost:3000)

## Architecture Overview

### Route Structure
The app uses Next.js 15 App Router with route groups:

- **(root)** - Public landing pages, marketing site
  - `/` - Landing page
  - `/upcoming-events` - Public events listing
  - `/[route]` - Dynamic catch-all route

- **(auth)** - Authentication flows (accessible to non-authenticated users)
  - `/signin`, `/signup` - User authentication
  - `/verify-email`, `/forgot-password`, `/reset-password` - Account management
  - `/preferences` - User preferences during onboarding

- **(user dashboard)** - Public user area (authentication on interaction)
  - `/events` - Event management
  - `/marketplace` - Marketplace listings
  - `/feeds` - Community feeds
  - `/groups` - Community groups
  - `/messages` - User messaging
  - `/notifications` - User notifications
  - `/settings` - User settings (protected - requires auth to view)

- **/subscription** - Open subscription/signup flow (no auth required)

### State Management

**Zustand** is used for global state:

1. **`app/store/useSession.ts`** - User session management
   - Handles user authentication state
   - Provides `getSession()`, `updateUser()`, `clearSession()` actions
   - No auto-redirect on session clear (supports public browsing)
   - Uses shallow selectors via `useShallow` for performance

2. **`app/store/useAuthModal.ts`** - Authentication modal state
   - Controls signin/signup modal visibility
   - Manages modal mode (signin vs signup)
   - Tracks context for "why" auth is needed
   - Handles post-auth redirects

### Authentication Flow (Twitter-like Public Browsing)

1. **AuthProvider** (`app/components/provider/authProvider.tsx`)
   - Wraps entire app, fetches session on mount (non-blocking)
   - NO route protection - all routes publicly accessible
   - Session loads in background for logged-in users

2. **Auth Guard Hook** (`app/hooks/useAuthGuard.ts`)
   - Used to protect individual interactions (not routes)
   - Opens auth modal when unauthenticated user attempts action
   - Example: liking a post, creating a listing, sending a message

3. **Protected Route Hook** (`app/components/protect.tsx`)
   - Converted from component to `useProtectedRoute()` hook
   - ONLY used for truly sensitive pages (Settings)
   - Redirects to marketplace and opens signin modal

4. **Auth Modal** (`app/components/modals/AuthModal.tsx`)
   - Framer Motion animated modal
   - Renders `SignInModalContent` or `SignUpModalContent`
   - Auto-closes on successful authentication

5. **Session Management**
   - Backend uses HTTP-only cookies (`accessToken`, `refreshToken`)
   - Session endpoint: `GET /auth/session`
   - No forced redirects on session expiry (supports guest browsing)

### OTP Authentication System

**Passwordless authentication** using email OTP codes:

#### Signup Flow
1. User enters: first name, last name, phone, email
2. Frontend calls: `POST /auth/send-otp`
3. User receives 6-digit OTP via email
4. User enters OTP
5. Frontend calls: `POST /auth/signup-simple` with OTP
6. Backend verifies OTP and creates account
7. JWT tokens set in HTTP-only cookies
8. Modal closes, user authenticated

#### Signin Flow
1. User enters: email
2. Frontend calls: `POST /auth/send-signin-otp`
3. User receives 6-digit OTP via email
4. User enters OTP
5. Frontend calls: `POST /auth/signin-with-otp`
6. Backend verifies OTP
7. JWT tokens set in HTTP-only cookies
8. Modal closes, user authenticated

### API Layer

**Primary API Client**: `app/libs/helper/callApi.ts`
- Axios-based wrapper with error handling
- Automatically includes credentials (cookies)
- Handles FormData uploads (sets timeout to 30s, doesn't set Content-Type)
- Returns `{ data?, error? }` pattern
- Built-in toast notifications for 429, 500 errors
- Auto-redirects to `/verify-email` on 423 status
- On 401: clears session but doesn't redirect (allows guest browsing)

**Service Namespaces**: `app/services/index.ts`
- Organized by feature (e.g., `Listing.getAllListing()`, `Listing.getListingById()`)
- Uses namespace pattern for grouping related API calls

**Data Access Layer (DAL)**: `app/libs/dals/`
- `users.ts` - User creation/signin using raw axios (legacy pattern)
- `utils.ts` - DAL utilities

### Type System

**Core Types** (`app/types.ts`):
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedData<T>` - Paginated list responses with meta
- `IUser` - User model
- `IListing` - Marketplace listing model
- Event-related types: `Event`, `EventStatus`, `EventCardData`, etc.

**Zod Schemas** (`app/libs/types/zodSchemas.ts`):
- Form validation schemas using Zod v4
- `simplifiedSignupSchema` - For OTP-based signup (firstName, lastName, phone, email, otp)
- Other schemas for listings, events, etc.

### Key Libraries

- **React Query** (`@tanstack/react-query`) - Server state management, wrapped in `QueryProvider`
- **React Hook Form** + **Zod** - Form handling and validation
- **Axios** - HTTP client
- **SWR** - Lightweight data fetching (used in DAL layer)
- **Framer Motion** - Animations (landing page, modals)
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **Tailwind CSS v4** - Styling with PostCSS
- **Zustand** - Global state management

### Important Patterns

1. **API Error Handling**
   - All `callApi` calls return `{ data?, error? }`
   - Check for `error` before accessing `data`
   - Session auto-clears on 401 (but doesn't redirect)

2. **Auth Guard Pattern**
   ```tsx
   const { requireAuth } = useAuthGuard();

   const handleLike = () => {
     requireAuth(() => {
       // Action only runs if authenticated
       likePost();
     }, 'like this post'); // Context message
   };
   ```

3. **FormData Uploads**
   - Do NOT manually set `Content-Type` for FormData
   - Let axios/browser set it with boundary
   - Example in `callApi.ts:164-200`

4. **Component Organization**
   - Shared components: `app/components/`
   - Route-specific components: `app/(route-group)/components/`
   - Provider components: `app/components/provider/`
   - Modal components: `app/components/modals/`

5. **Server vs Client Components**
   - Use `"use client"` directive for interactive components
   - AuthProvider and state management require client-side rendering
   - Modal components are client-side
   - Most page components can be server components (no auth blocking)

6. **Build Configuration**
   - TypeScript errors ignored during build (`ignoreBuildErrors: true`)
   - ESLint ignored during build (`ignoreDuringBuilds: true`)
   - This is temporary - fix errors when adding new features

### Development Notes

- The app uses Next.js 15 with React 19 (latest versions)
- Tailwind CSS v4 uses PostCSS-based configuration
- Path alias: `@/*` maps to project root
- TypeScript strict mode enabled
- Font: Inter (Google Fonts) with CSS variable `--font-inter`

### Constants and Configuration

**`app/constants/index.ts`**:
- `authOnlyPages` - Pages that require authentication to view (only `/settings/*`)
- `restrictedRoutes` - Auth pages that redirect if already logged in

### Modal System

**Auth Modal Infrastructure**:
1. `app/store/useAuthModal.ts` - Zustand store for modal state
2. `app/components/modals/AuthModal.tsx` - Container with Framer Motion
3. `app/components/modals/SignInModalContent.tsx` - 2-step OTP signin
4. `app/components/modals/SignUpModalContent.tsx` - 2-step OTP signup

**Modal Features**:
- Backdrop blur with click-to-close
- Escape key handling
- Body scroll locking
- Smooth animations (slide up from bottom)
- Mobile-responsive (full screen on small devices)
- Context-aware messaging ("Sign in to like this post")

### UI Components

**Key Components**:
- `app/(user dashboard)/components/topnavigation.tsx` - Fixed top nav with auth buttons
- `app/(user dashboard)/components/navigation.tsx` - Sidebar navigation
- `app/(user dashboard)/components/mobilenav.tsx` - Mobile bottom nav
- `app/(user dashboard)/components/likePost.tsx` - Like button with auth guard
- `app/(user dashboard)/components/saveButton.tsx` - Save button with auth guard
- `app/components/ui/GuestBanner.tsx` - Dismissible banner for guests (currently unused)

### Create Pages Pattern

**Placeholder for Unauthenticated Users**:

Create listing and create event pages show a placeholder when user is not authenticated:

```tsx
if (!user) {
  return (
    <div className="placeholder">
      <Icon />
      <h2>Create Your Listing</h2>
      <p>Sign in to create and manage your listings</p>
      <button onClick={() => openSignIn('create a listing')}>
        Sign In to Create Listing
      </button>
    </div>
  );
}

// Show form only if authenticated
return <CreateForm />;
```

### Interaction Points with Auth Guards

**Where `useAuthGuard` is used**:
- Like buttons (posts, listings, events)
- Save buttons (posts, listings, events)
- Comment forms
- Message seller buttons
- Create listing/event pages
- Report buttons

### Navigation Structure

**Top Navigation**:
- Logo (left)
- Search bar (center, desktop only)
- Auth buttons OR profile/notifications (right)
- Fixed at top with `z-50`
- Reduced height (`py-2`)

**Side Navigation** (desktop):
- Links to: Feeds, Events, Marketplace, Messages, Groups, Notifications, Settings
- Active state highlighting
- Trending section
- Sticky positioning

**Mobile Navigation**:
- Bottom fixed bar
- Icon-only links
- Active state highlighting

## Common Development Tasks

### Adding a New Protected Interaction

1. Import `useAuthGuard` hook
2. Wrap action in `requireAuth()`:
```tsx
const { requireAuth } = useAuthGuard();

const handleAction = () => {
  requireAuth(() => {
    // Your action here
  }, 'perform this action');
};
```

### Adding a New Page

1. Create page in appropriate route group
2. If needs auth to VIEW: use `useProtectedRoute()` hook
3. If public but actions need auth: use `useAuthGuard()` on buttons
4. Most pages should be public by default

### Calling Backend API

```tsx
import { callApi } from '@/app/libs/helper/callApi';

const { data, error } = await callApi<ApiResponse<IListing>>(
  '/listings',
  'GET'
);

if (error) {
  toast.error(error.message);
  return;
}

// Use data
console.log(data?.data);
```

### Managing User Session

```tsx
import { useSession } from '@/app/store/useSession';

// In component
const { user, loading } = useSession((state) => state);
const { updateUser, clearSession } = useSession((state) => state.actions);

// Check auth
if (!user) {
  // Show guest UI
}
```

### Opening Auth Modal

```tsx
import { useAuthModal } from '@/app/store/useAuthModal';

const { openSignIn, openSignUp } = useAuthModal((state) => state.actions);

// Open signin
openSignIn('access this feature', '/redirect-after-auth');

// Open signup
openSignUp();
```

## Performance Considerations

- Use `useShallow` with Zustand to prevent unnecessary re-renders
- Server components by default (no auth blocking needed)
- Code splitting with dynamic imports for heavy components
- Image optimization with Next.js Image component
- Font optimization with next/font

## Testing Strategy

- Unit tests: Component behavior
- Integration tests: API integration
- E2E tests: Critical flows (signup, listing creation, event purchase)
- Manual testing: Guest browsing → interaction → auth → action completion
