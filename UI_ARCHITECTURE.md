# 🎬 Bell Streaming - UI Applications Architecture

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Shared UI Library](#shared-ui-library)
4. [Admin Dashboard](#admin-dashboard)
5. [Public Frontend](#public-frontend)
6. [Best Practices](#best-practices)
7. [API Integration](#api-integration)

## Overview

Bell Streaming UI consists of three packages:

1. **shared-ui**: Shared components, hooks, and utilities
2. **admin-ui**: Admin dashboard for content management
3. **frontend-ui**: Public-facing video streaming platform

### Design Principles

✅ **DRY (Don't Repeat Yourself)**: Shared code in `shared-ui`  
✅ **Component Reusability**: Build once, use everywhere  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Separation of Concerns**: Clear boundaries between packages  
✅ **Industry Standards**: Following React and Vite best practices

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Bell Streaming Platform               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐        ┌──────────────┐      │
│  │  Admin UI   │        │ Frontend UI  │      │
│  │  (Port 5173)│        │ (Port 5174)  │      │
│  └──────┬──────┘        └──────┬───────┘      │
│         │                      │               │
│         └──────────┬───────────┘               │
│                    ▼                           │
│         ┌──────────────────────┐               │
│         │    Shared UI Lib     │               │
│         │  Components, Hooks,  │               │
│         │  Utils, Stores       │               │
│         └──────────┬───────────┘               │
│                    │                           │
│                    ▼                           │
│         ┌──────────────────────┐               │
│         │   Backend Services   │               │
│         │  Auth, Video, etc.   │               │
│         └──────────────────────┘               │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Shared UI Library

### Purpose
Centralize common code to eliminate duplication and maintain consistency.

### What's Included

#### 🎨 Components
- `Button` - Versatile button with variants
- `Input` - Form input with validation
- `Card` - Container component
- `Modal` - Popup dialog
- `VideoPlayer` - Custom video player
- `Spinner` - Loading indicator

#### 🔧 Hooks
- `useAuth` - Authentication state
- `useApi` - API call management
- `useDebounce` - Debounced values

#### 🛠️ Utilities
- `apiClient` - Axios instance with interceptors
- `formatDuration` - Format seconds to HH:MM:SS
- `formatFileSize` - Convert bytes to readable format
- `validateEmail` - Email validation
- `validatePassword` - Password strength check

#### 📦 Stores
- `authStore` - Zustand store for auth state

#### 📘 Types
- `User`, `Video`, `AuthResponse`, etc.

### Usage Example

```typescript
import { 
  Button, 
  Input, 
  useAuth, 
  formatDuration,
  validateEmail 
} from '@bell-streaming/shared-ui';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const duration = formatDuration(320); // "5:20"
  const isValid = validateEmail('test@example.com'); // true

  return (
    <div>
      <Input label="Email" type="email" />
      <Button variant="primary">Submit</Button>
    </div>
  );
}
```

## Admin Dashboard

### Purpose
Content management system for administrators.

### Key Features

#### 📊 Dashboard
- Overview statistics
- Recent activity feed
- Popular videos list
- Storage usage metrics

#### 🎥 Video Management
- Grid view of all videos
- Search and filter
- View video details
- Delete videos
- Status indicators (processing/ready/failed)

#### ⬆️ Upload
- Drag & drop interface
- File validation
- Progress tracking
- Metadata input (title, description)

#### 👥 User Management
- User list with roles
- Edit/delete users
- Role assignment

#### 📈 Analytics
- Views over time (line chart)
- Upload trends (bar chart)
- Top performing videos
- User activity metrics

### Pages

```
/                 → Dashboard
/videos           → Video Management
/upload           → Upload New Video
/users            → User Management
/analytics        → Analytics & Insights
/login            → Admin Login
```

### Tech Highlights

- **React Query**: Server state caching and synchronization
- **React Dropzone**: Drag-and-drop file upload
- **Recharts**: Data visualization
- **React Table**: Advanced table features

## Public Frontend

### Purpose
Consumer-facing platform for watching videos.

### Key Features

#### 🏠 Home Page
- Hero section
- Trending videos grid
- Recent uploads
- Category browsing

#### 🎥 Video Player
- Full-screen playback
- Custom controls
- Related videos sidebar
- Like/Save/Share buttons
- View tracking

#### 🔍 Search
- Real-time search
- Results grid
- No results state

#### 👤 Authentication
- Login page
- Registration with validation
- Protected routes

### Pages

```
/                    → Home
/watch/:videoId      → Video Player
/search?q=query      → Search Results
/login               → User Login
/register            → User Registration
```

### Design Philosophy

- **Dark Theme**: YouTube-inspired dark mode
- **Responsive**: Mobile-first design
- **Performance**: Lazy loading, code splitting
- **Accessibility**: Semantic HTML, ARIA labels

## Best Practices

### 1. Component Organization

```typescript
// ✅ Good - Clean, focused component
export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <Link to={`/watch/${video.id}`}>
      <img src={video.thumbnailUrl} alt={video.title} />
      <h3>{video.title}</h3>
    </Link>
  );
};

// ❌ Bad - Too much logic in component
export const VideoCard = ({ video }) => {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('/api/video').then(/*...*/);
  }, []);
  // ... lots of logic
};
```

### 2. API Calls

```typescript
// ✅ Good - Use React Query
const { data, isLoading } = useQuery({
  queryKey: ['videos'],
  queryFn: async () => {
    const response = await apiClient.get('/videos');
    return response.data;
  },
});

// ❌ Bad - Manual state management
const [data, setData] = useState();
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/videos')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    });
}, []);
```

### 3. Shared Code

```typescript
// ✅ Good - Use shared utilities
import { formatDuration } from '@bell-streaming/shared-ui';
const time = formatDuration(seconds);

// ❌ Bad - Duplicate logic
const formatDuration = (seconds) => {
  // Same logic duplicated across files
};
```

### 4. Type Safety

```typescript
// ✅ Good - Use shared types
import type { Video } from '@bell-streaming/shared-ui';
const video: Video = { /*...*/ };

// ❌ Bad - No types or duplicated types
const video = { /*...*/ };
```

### 5. State Management

```typescript
// ✅ Good - Auth in shared store
import { useAuth } from '@bell-streaming/shared-ui';
const { user, logout } = useAuth();

// ❌ Bad - Duplicate auth logic
const [user, setUser] = useState();
// ... auth logic duplicated
```

## API Integration

### API Client Configuration

The shared API client handles:

1. **Base URL**: From environment variables
2. **Authentication**: Automatic token injection
3. **Error Handling**: 401 redirect to login
4. **Type Safety**: TypeScript response types

```typescript
// Automatic token addition
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Making API Calls

#### Simple GET
```typescript
const { data } = useQuery({
  queryKey: ['videos'],
  queryFn: async () => {
    const response = await apiClient.get('/videos');
    return response.data;
  },
});
```

#### POST with Mutation
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return await apiClient.post('/videos', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  },
});
```

#### File Upload
```typescript
import { uploadFile } from '@bell-streaming/shared-ui';

const upload = async (file: File) => {
  await uploadFile('/videos/upload', file, (progress) => {
    console.log(`Upload progress: ${progress}%`);
  });
};
```

## Development Workflow

### Adding a New Feature

1. **Plan**: Determine if it's shared, admin-only, or frontend-only
2. **Shared Code First**: Create reusable components in `shared-ui`
3. **Implement**: Use shared code in the specific app
4. **Test**: Verify in both apps if shared
5. **Document**: Update relevant README

### Adding a Shared Component

```bash
# 1. Create component in shared-ui
cd packages/shared-ui/src/components
touch NewComponent.tsx

# 2. Export from index
# Add to src/index.ts

# 3. Rebuild
npm run build

# 4. Use in apps
import { NewComponent } from '@bell-streaming/shared-ui';
```

### Debugging Tips

1. **Network Tab**: Check API calls and responses
2. **React DevTools**: Inspect component state
3. **Redux DevTools**: View Zustand store (with devtools middleware)
4. **Console Logs**: Use `console.log` strategically
5. **Error Boundaries**: Catch and display errors gracefully

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
```

### Memoization
```typescript
const MemoizedComponent = React.memo(ExpensiveComponent);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### Query Optimization
```typescript
// Cache data for 5 minutes
useQuery({
  queryKey: ['videos'],
  queryFn: fetchVideos,
  staleTime: 5 * 60 * 1000,
});
```

## Conclusion

This architecture provides:

✅ Code reusability through shared-ui  
✅ Clear separation between admin and public apps  
✅ Type safety across all packages  
✅ Efficient development workflow  
✅ Industry-standard practices  

For questions or contributions, see individual package READMEs.

---

**Built with ❤️ using React, Vite, and TypeScript**
