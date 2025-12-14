# Bell Streaming Platform - UI Applications

This directory contains the React-based user interface applications for the Bell Streaming platform.

## 📁 Structure

```
packages/
├── shared-ui/          # Shared UI library (components, hooks, utilities)
├── admin-ui/           # Admin dashboard for video management
└── frontend-ui/        # Public-facing video streaming platform
```

## 🎯 Applications

### Shared UI Library (`@bell-streaming/shared-ui`)

Reusable components, hooks, and utilities shared between admin and frontend applications.

**Features:**
- 🎨 UI Components (Button, Input, Card, Modal, VideoPlayer, Spinner)
- 🔧 Custom Hooks (useAuth, useApi, useDebounce)
- 🛠️ Utilities (API client, formatters, validators)
- 📦 State Management (Zustand auth store)
- 📘 TypeScript type definitions

### Admin UI (`@bell-streaming/admin-ui`)

Dashboard for administrators to manage videos, users, and view analytics.

**Features:**
- 📊 Dashboard with statistics
- 🎥 Video management (view, search, delete)
- ⬆️ Video upload with drag-and-drop
- 👥 User management
- 📈 Analytics and insights
- 🔐 Admin-only authentication

**Port:** 5173

### Frontend UI (`@bell-streaming/frontend-ui`)

Public-facing platform for users to discover and watch videos.

**Features:**
- 🏠 Home page with trending videos
- 🎥 Video player with full controls
- 🔍 Search functionality
- 👤 User authentication (login/register)
- 📱 Responsive dark theme
- 🎯 Category browsing

**Port:** 5174

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend services running (auth, video-metadata, streaming)

### Installation

```bash
# From the root directory
npm install

# Or install all workspaces
npm run install:all
```

### Development

```bash
# Run both UI applications
npm run dev:ui

# Run admin dashboard only
npm run dev:admin

# Run frontend only
npm run dev:frontend

# Run shared-ui in watch mode (for development)
cd packages/shared-ui && npm run dev
```

### Environment Variables

Create `.env` files in each UI package:

**admin-ui/.env:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**frontend-ui/.env:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Build for Production

```bash
# Build all UI packages
npm run build:all

# Build individual packages
npm run build --workspace=@bell-streaming/shared-ui
npm run build --workspace=@bell-streaming/admin-ui
npm run build --workspace=@bell-streaming/frontend-ui
```

## 🏗️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

## 📚 Architecture

### Shared Code Pattern

Both applications import from the shared-ui library:

```typescript
import { Button, Input, useAuth, formatDuration } from '@bell-streaming/shared-ui';
```

### API Client

The shared API client automatically:
- Adds authentication tokens to requests
- Handles 401 redirects
- Provides upload progress tracking
- Centralizes error handling

### State Management

- **Auth State**: Managed globally via Zustand store
- **Server State**: Managed via TanStack Query (caching, refetching)
- **Local State**: React hooks for component-specific state

## 🎨 Styling

Both applications use TailwindCSS with:
- Dark theme by default (frontend)
- Light theme (admin)
- Responsive breakpoints
- Custom utility classes
- Shared component styles

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Token stored in localStorage
3. API client adds token to all requests
4. Auth store maintains user state
5. Protected routes check authentication

## 📝 Code Organization

```
src/
├── components/        # React components
│   └── layout/       # Layout components
├── pages/            # Route pages
├── hooks/            # Custom hooks (in shared-ui)
├── utils/            # Utilities (in shared-ui)
├── types/            # TypeScript types (in shared-ui)
└── stores/           # Zustand stores (in shared-ui)
```

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📦 Deployment

Build the applications and serve the `dist` folder:

```bash
npm run build

# Serve with any static file server
npx serve packages/admin-ui/dist
npx serve packages/frontend-ui/dist
```

## 🔧 Development Tips

1. **Hot Module Replacement (HMR)**: Changes auto-reload in development
2. **Shared UI Changes**: Run `npm run dev` in shared-ui for auto-rebuild
3. **API Proxy**: Vite proxies `/api` requests to backend
4. **Type Safety**: All shared code is fully typed
5. **Component Reuse**: Build in shared-ui, use in both apps

## 🤝 Contributing

1. Make changes in appropriate package
2. Update shared-ui for reusable code
3. Test in both applications
4. Build before committing

## 📄 License

MIT
