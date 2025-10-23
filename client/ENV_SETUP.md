# Environment Configuration

This project uses environment variables to configure API endpoints and other settings.

## Setup Instructions

### Client (Frontend)

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Development vs Production

- **Development**: Uses `.env.development` (committed to repo)
- **Production**: Uses `.env.production` (not committed, create manually)

### Available Environment Files

- `.env.example` - Template with all required variables
- `.env.development` - Development configuration (committed)
- `.env.production` - Production configuration (create manually, not committed)
- `.env` - Local overrides (not committed)

## Environment Variables

### Client Variables

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |

## Usage in Code

Import the config object:

```typescript
import { config } from "./config/api";

// Use predefined endpoints
const url = `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.GOOGLE}`;
```

## Deployment

For production deployment:

1. Create `.env.production` with your production API URL
2. The build process will automatically use the production environment variables

Example production configuration:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```
