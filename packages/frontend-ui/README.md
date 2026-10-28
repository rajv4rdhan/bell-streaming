# Bell Streaming - Frontend

Public-facing video streaming platform for watching and discovering content.

## Features

- 🏠 **Home Page**: Browse trending and recent videos
- 🎥 **Video Player**: Watch videos with full playback controls
- 🔍 **Search**: Find videos by title, description, or category
- 👤 **User Authentication**: Login and registration
- 📱 **Responsive Design**: Optimized for all devices
- 🎨 **Dark Theme**: Modern YouTube-inspired interface

## Tech Stack

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router
- TanStack Query
- Shared UI Library

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_CLOUDFRONT_URL=https://your-cloudfront-distribution.cloudfront.net
```
