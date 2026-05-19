# Express Server - TrackMe DSA Platform

Backend REST API server for the TrackMe DSA problem tracking platform with Google OAuth authentication, MongoDB database, and AI-powered code analysis.

## 🎯 Features

### Authentication
- 🔐 **Google OAuth 2.0** - Secure authentication via Passport.js
- 🔒 **Session Management** - Express sessions with secure cookies
- 👤 **User Profile Management** - Store and retrieve user information

### Problem Management APIs
- ✅ **CRUD Operations** - Create, read, update, delete DSA problems
- 📑 **Problem Metadata** - Store problem links, status, solved dates
- 📝 **User Notes** - Store and retrieve detailed markdown notes (up to 10,000 characters)
- 🔗 **URL Validation** - Automatic validation of LeetCode and GeeksforGeeks URLs
- 📊 **User-Specific Tracking** - Track problems per user with progress status

### 🤖 AI Code Analysis
- **Gemini API Integration** - Uses Google's Generative AI for code analysis
- **Structured Code Review** with 6 sections:
  - Approach - Algorithm strategy explanation
  - Complexity - Time and space complexity analysis
  - Algorithm - Step-by-step implementation breakdown
  - Mistakes(if any) - Potential issues and edge cases
  - Optimisation - Performance improvement suggestions
  - Key insights - Learning points and key takeaways
- **Intelligent Parsing** - Robust JSON and Markdown parsing
- **Formatted Output** - Returns structured markdown with:
  - Bullet-point formatting
  - Bold-highlighted important terms (**term**)
  - Code block preservation
  - Implementation code appendix

### Data Models

#### User Model
- Email (unique)
- Google profile information
- Timestamp tracking (created/updated)

#### Problem Model
- Problem title and slug
- Platform (LeetCode/GeeksforGeeks)
- URL validation
- Difficulty level

#### UserProblem Model
- User-problem association
- Status tracking (Todo/Completed)
- Detailed notes (up to 10,000 characters)
- Date solved
- Revision history
- Timestamps

## API Endpoints

### Authentication Routes (`/api/auth`)
```
GET  /google              - Initiate Google OAuth flow
GET  /google/callback     - OAuth callback handler
GET  /logout              - Clear session and logout
```

### Problem Routes (`/api/problems`)
```
GET  /                    - Get all problems for current user
POST /                    - Add new problem
GET  /:id                 - Get problem details
PUT  /:id                 - Update problem
DELETE /:id               - Delete problem
```

### AI Analysis Routes (`/api/ai`)
```
POST /summarize           - Generate AI code analysis summary
```

## Request/Response Examples

### Generate AI Summary
**Request:**
```json
{
  "implementationCode": "class Solution { ... }",
  "notes": "existing notes (optional)"
}
```

**Response:**
```json
{
  "summary": "### Approach\n- Bullet 1\n- Bullet 2\n\n### Complexity\n- Time: O(n)\n...",
  "rawSummary": "raw Gemini response"
}
```

## Environment Variables

Create a `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/trackme
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see above)

3. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Build & Production

Build TypeScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
src/
├── app.ts                  # Express app setup
├── config/
│   ├── database.ts        # MongoDB connection
│   └── passport.ts        # Google OAuth strategy
├── controllers/
│   ├── auth.ts            # Auth logic
│   ├── problem.ts         # Problem CRUD
│   ├── user.ts            # User operations
│   └── ai.ts              # AI analysis
├── middleware/
│   ├── auth.ts            # Auth middleware
│   └── errorHandler.ts    # Error handling
├── models/
│   ├── User.ts
│   ├── Problem.ts
│   └── UserProblem.ts
├── routes/
│   ├── auth.ts
│   ├── problem.ts
│   ├── user.ts
│   └── ai.ts
├── services/
│   ├── gfgService.ts      # GeeksforGeeks API
│   └── leetcodeService.ts # LeetCode API
├── types/
│   └── index.ts           # TypeScript interfaces
└── utils/
    └── tokenStore.ts      # Token management
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  googleId: String,
  displayName: String,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### UserProblems Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  problemId: ObjectId (ref: Problem),
  problem_link: String (validated),
  status: "Todo" | "Completed",
  notes: String (max 10000 chars),
  date_solved: Date (optional),
  revision_history: [{...}],
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

- Comprehensive error responses with status codes
- Validation errors for URL formats
- MongoDB validation errors
- AI service fallback (Gemini → OpenAI)
- Detailed error logging for debugging

## Security Features

- Session-based authentication
- CORS middleware configuration
- MongoDB connection pooling
- Environment variable protection
- Input validation on all routes
- Secure OAuth token handling

## Testing

Run tests:
```bash
npm test
```

## Contributing

Please follow the existing code style and submit pull requests for improvements.

## License

MIT License