# 10X Contest Arena Backend

This is the backend API server for the 10X Contest Arena application. It handles authentication with Circle.so and provides data to the frontend.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Circle.so API Configuration
CIRCLE_API_TOKEN=your_circle_api_token_here
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here
VITE_CIRCLE_API_URL=https://app.circle.so/api/v1/headless/auth_token
VITE_CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here

# Server Configuration
PORT=3001
NODE_ENV=development

# OAuth Configuration (to be provided)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CALLBACK_URL=http://localhost:3001/auth/callback

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

### 3. Get Circle.so API Credentials

You need to obtain the following from your Circle.so community:

1. **Circle API Token** - For member verification
2. **Circle Admin API Token** - For fetching member data and spaces

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Start the Frontend

In a separate terminal, from the project root:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/verify-member` - Verify if user is a Circle community member
  - Body: `{ "email": "user@example.com" }`
  - Returns: `{ "authorized": boolean, "message": string, "accessToken?": string }`

### Member Data
- `GET /api/member-data?email=user@example.com` - Get member data from Circle.so
- `GET /api/member-spaces?memberId=123` - Get member's course enrollments

## Authentication Flow

1. User enters email on frontend
2. Frontend calls `/api/verify-member` with email
3. Backend verifies with Circle.so API
4. If authorized, backend fetches member data
5. Frontend stores user data and redirects to dashboard

## Data Mapping

The backend maps Circle.so data to our dashboard format:

- **Level & XP**: Calculated from course progress and activity
- **Badges**: Generated from achievements and milestones
- **Streak**: Calculated from account activity
- **Stats**: Derived from course enrollments and completions

## Error Handling

The API includes comprehensive error handling for:
- Invalid email addresses
- Circle.so API errors
- Network connectivity issues
- Missing environment variables

## Development

- Uses TypeScript for type safety
- Express.js for the web server
- Axios for HTTP requests to Circle.so
- CORS enabled for frontend communication
- Environment-based configuration

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a secure `SESSION_SECRET`
3. Configure proper CORS origins
4. Use HTTPS for all API calls
5. Set up proper logging and monitoring
