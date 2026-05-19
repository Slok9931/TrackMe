# TrackMe - DSA Problem Tracking Platform

A comprehensive platform for tracking Data Structures and Algorithms (DSA) problem-solving progress with AI-powered code analysis.

## 🎯 Key Features

### Problem Management
- ✅ **Add Problems** from LeetCode and GeeksforGeeks URLs
- 📋 **Track Status** - Mark problems as Todo or Completed with solved dates
- 📝 **Rich Notes Editor** - Markdown support with live preview
- 🔍 **Problem Details View** - Comprehensive problem tracking interface

### 🤖 AI-Powered Code Analysis
- **Generate AI Summaries** from implementation code using Google Gemini API
- **Structured Analysis** with:
  - 🎯 Approach - Algorithm strategy and design patterns
  - ⏱️ Complexity - Time and space complexity analysis
  - 🔧 Algorithm - Step-by-step breakdown
  - ⚠️ Mistakes (if any) - Potential issues in the code
  - ✨ Optimisation - Improvement suggestions
  - 💡 Key Insights - Learning points and takeaways
- **Formatted Output** - Bullet points with bold-highlighted important terms
- **Code Block Preservation** - Implementation code appended to notes with preserved indentation

### Code Editor Features
- **Tab-Based UI**:
  - Implementation tab - Paste full code with preserved indentation
  - Notes tab - Edit and format generated summaries
- **Markdown Formatting** - Bold, italic, code blocks, lists, and headings
- **Live Preview** - Real-time markdown rendering on right side
- **Integration** - Auto-switch to Notes tab after AI generation

### Analytics & Dashboard
- 📊 **Interactive Dashboard** with problem statistics
- 📈 **Progress Visualization** with charts
- 🎯 **Difficulty-based Tracking** - Easy, Medium, Hard categorization
- 📱 **Responsive Design** - Works on all devices

### Authentication & Security
- 🔐 **Google OAuth 2.0** - Secure single sign-on
- 🔒 **Session Management** - Persistent user sessions

## Tech Stack

### Frontend
- **React 19.1.1** with TypeScript - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side navigation
- **Axios** - HTTP client for API calls
- **Marked** - Markdown parsing and rendering

### Backend
- **Node.js** with **Express** - REST API server
- **MongoDB** with Mongoose - Database and ODM
- **Google Generative AI (Gemini)** - AI code analysis
- **Passport.js** - OAuth authentication
- **Express Session** - Session management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Google Developer account for OAuth and Gemini API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TrackMe
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Environment Setup
- **Client**: Copy `.env.development` and update API base URL if needed
- **Server**: Create `.env` file with:
  ```
  GEMINI_API_KEY=<your-gemini-api-key>
  GEMINI_MODEL=gemini-2.5-flash
  GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
  CLIENT_URL=http://localhost:5173
  MONGODB_URI=<your-mongodb-connection-string>
  ```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## API Features

### Authentication Endpoints
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/logout` - User logout

### Problem Management Endpoints
- `POST /api/problems` - Add new problem
- `GET /api/problems` - Fetch all problems
- `GET /api/problems/:id` - Get problem details
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem

### AI Analysis Endpoint
- `POST /api/ai/summarize` - Generate AI code analysis summary

## Workflow

### Adding a Problem
1. Click "Add Problem" button
2. Enter LeetCode or GeeksforGeeks URL
3. Optionally mark as completed and set date
4. Click "Add Problem"

### Using AI Code Analysis
1. Navigate to problem details or add problem page
2. Switch to **Implementation** tab
3. Paste your implementation code
4. Click **✨ Generate** button
5. AI generates structured analysis automatically
6. Tab switches to **Notes** showing formatted output
7. Edit notes as needed and save

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
