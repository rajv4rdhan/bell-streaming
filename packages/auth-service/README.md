# Bell Streaming - Auth Service

Authentication microservice for Bell Streaming platform built with TypeScript, Node.js, Express, JWT, and MongoDB.

## Features

- 🔐 User registration and login
- 🎫 JWT-based authentication with access and refresh tokens
- 🔄 Token refresh mechanism
- 👤 User profile management
- 🛡️ Password hashing with bcrypt
- ✅ Input validation with Zod
- 🔑 Role-Based Access Control (RBAC) - User, Moderator, Admin
- 🚦 Rate limiting
- 🔒 Security headers with Helmet
- 🌐 CORS support

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Navigate to the auth-service directory:
```bash
cd packages/auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bell-streaming-auth
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Development Mode with Auto-Reload
```bash
npm run dev:watch
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Service health check

### Authentication

#### Register
- **POST** `/api/auth/register`
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```
Note: `role` is optional and defaults to `user`. Valid roles: `user`, `moderator`, `admin`

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
- **POST** `/api/auth/refresh`
- Body:
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
- **POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <access-token>`
- Body:
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile
- **GET** `/api/auth/profile`
- Headers: `Authorization: Bearer <access-token>`

#### Update Profile
- **PATCH** `/api/auth/profile`
- Headers: `Authorization: Bearer <access-token>`
- Body:
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Admin & Moderator Routes

#### Get All Users
- **GET** `/api/auth/users`
- Headers: `Authorization: Bearer <access-token>`
- Required Roles: `admin`, `moderator`

### Admin Only Routes

#### Update User Role
- **PATCH** `/api/auth/users/:userId/role`
- Headers: `Authorization: Bearer <access-token>`
- Required Role: `admin`
- Body:
```json
{
  "role": "moderator"
}
```

#### Delete User
- **DELETE** `/api/auth/users/:userId`
- Headers: `Authorization: Bearer <access-token>`
- Required Role: `admin`

## Project Structure

```
packages/auth-service/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── database/        # Database connection
│   ├── middleware/      # Auth, RBAC, validation, error handling
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── schemas/         # Zod validation schemas
│   ├── utils/           # Utility functions (JWT)
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication with role information
- Role-Based Access Control (RBAC) with three roles:
  - **User**: Basic access to own profile
  - **Moderator**: Can view all users
  - **Admin**: Full access including user management and role assignment
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS configuration
- Input validation with Zod schemas

## Development

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/bell-streaming-auth |
| JWT_SECRET | JWT secret key | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| JWT_EXPIRES_IN | Access token expiration | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## License

MIT
