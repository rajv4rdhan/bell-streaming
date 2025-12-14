# @bell-streaming/shared-ui

Shared UI components, hooks, utilities, and types for Bell Streaming applications.

## Features

- **Components**: Reusable React components (Button, Input, Card, Modal, VideoPlayer, Spinner)
- **Hooks**: Custom React hooks (useAuth, useApi, useDebounce)
- **Utils**: Common utilities (API client, formatters, validators)
- **Stores**: Zustand state management (auth store)
- **Types**: Shared TypeScript types and interfaces

## Usage

```typescript
import { Button, Input, Card, useAuth, formatDuration } from '@bell-streaming/shared-ui';

// Use components
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>

// Use hooks
const { user, isAuthenticated } = useAuth();

// Use utilities
const formattedTime = formatDuration(320); // "5:20"
```

## Development

```bash
# Build the library
npm run build

# Watch mode for development
npm run dev
```
