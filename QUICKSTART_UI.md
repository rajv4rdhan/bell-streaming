# 🚀 Quick Start Guide - Bell Streaming UI

## Step 1: Install Dependencies

```bash
# From the root directory
npm install
```

## Step 2: Set Up Environment Variables

```bash
# Admin UI
cd packages/admin-ui
cp .env.example .env

# Frontend UI
cd ../frontend-ui
cp .env.example .env

# Return to root
cd ../..
```

## Step 3: Start the Applications

### Option A: Run Everything Together

```bash
# Start both UI applications
npm run dev:ui
```

- Admin UI: http://localhost:5173
- Frontend UI: http://localhost:5174

### Option B: Run Individually

```bash
# Admin Dashboard
npm run dev:admin

# Public Frontend
npm run dev:frontend
```

### Option C: Run with Backend Services

```bash
# Terminal 1: Backend services
npm run dev:services

# Terminal 2: UI applications
npm run dev:ui
```

## 📱 Access the Applications

### Admin Dashboard
- **URL**: http://localhost:5173
- **Purpose**: Upload and manage videos, view analytics
- **Features**: 
  - Dashboard overview
  - Video management
  - Upload videos
  - User management
  - Analytics

### Public Frontend
- **URL**: http://localhost:5174
- **Purpose**: Watch and discover videos
- **Features**:
  - Browse videos
  - Search
  - Video player
  - User authentication
  - Categories

## 🔑 Default Login Credentials

You'll need to create users via the backend API or use test credentials:

```
Admin User:
Email: admin@bellstreaming.com
Password: Admin@123

Regular User:
Email: user@bellstreaming.com
Password: User@123
```

## 🛠️ Development Workflow

### Making Changes to Shared UI

```bash
# Terminal 1: Watch mode for shared-ui
cd packages/shared-ui
npm run dev

# Terminal 2: Run UI apps
npm run dev:ui
```

### Building for Production

```bash
# Build all packages
npm run build:all

# Or build individually
npm run build --workspace=@bell-streaming/shared-ui
npm run build --workspace=@bell-streaming/admin-ui
npm run build --workspace=@bell-streaming/frontend-ui
```

## 📁 Project Structure

```
packages/
├── shared-ui/          # 📦 Shared components & utilities
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utilities & helpers
│   │   ├── stores/       # State management
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── admin-ui/           # 👨‍💼 Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── frontend-ui/        # 🌐 Public Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.tsx
    ├── vite.config.ts
    └── package.json
```

## 🎨 Tech Stack

- React 18 + TypeScript
- Vite (dev server & bundler)
- TailwindCSS (styling)
- React Router (navigation)
- TanStack Query (data fetching)
- Zustand (state management)
- Axios (HTTP client)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.ts
server: {
  port: 5175, // or any available port
}
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Shared UI Changes Not Reflecting

```bash
# Rebuild shared-ui
cd packages/shared-ui
npm run build

# Restart the UI apps
npm run dev:ui
```

### API Connection Issues

Make sure backend services are running:
```bash
npm run dev:services
```

Check environment variables in `.env` files.

## 📚 Additional Resources

- [Admin UI README](packages/admin-ui/README.md)
- [Frontend UI README](packages/frontend-ui/README.md)
- [Shared UI README](packages/shared-ui/README.md)
- [Main UI Documentation](UI_README.md)

## 🎯 Next Steps

1. ✅ Start the applications
2. 📝 Create test users via backend
3. 🎥 Upload sample videos (admin)
4. 👀 View videos (frontend)
5. 🚀 Start building features!

---

**Happy Coding! 🎉**
