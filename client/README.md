# TrackMe Client - React + TypeScript + Vite

Modern frontend for the TrackMe DSA problem tracking platform with AI-powered code analysis and real-time markdown preview.

## 🚀 Features

### Authentication
- 🔐 **Google OAuth Integration** - Seamless single sign-on
- 👤 **User Profiles** - Secure user session management
- 🔒 **Protected Routes** - Role-based access control

### Problem Management
- ✅ **Add Problems** - Support for LeetCode and GeeksforGeeks URLs
- 📋 **Problem List** - View all tracked problems with filtering
- 🔍 **Problem Details** - Comprehensive problem view with notes and implementation
- 📊 **Status Tracking** - Mark problems as Todo or Completed
- 📅 **Date Tracking** - Record when problems were solved

### 🤖 AI-Powered Code Analysis
- **Implementation Code Editor** - Multi-line textarea with indentation preservation
- **Generate AI Summaries** - One-click code analysis using Gemini API
- **Structured Analysis** with 6 sections:
  - 🎯 **Approach** - Algorithm strategy and design patterns
  - ⏱️ **Complexity** - Time and space complexity breakdown
  - 🔧 **Algorithm** - Step-by-step implementation walkthrough
  - ⚠️ **Mistakes (if any)** - Potential issues and edge cases
  - ✨ **Optimisation** - Performance improvement suggestions
  - 💡 **Key Insights** - Learning points and takeaways
- **Smart Formatting** - Bullet points with bold-highlighted terms
- **Code Preservation** - Implementation code appended with preserved indentation

### Code Editor & Notes
- **Tab-Based Interface**:
  - Implementation Tab - Paste full code with formatting preserved
  - Notes Tab - Edit and enhance AI-generated summaries
- **Live Preview** - Real-time Markdown rendering on the right
- **Markdown Toolbar** - Quick formatting buttons:
  - **B**old, *I*talic, `code`, Code Blocks, Lists, Headings
- **Auto-Tab Switch** - Switches to Notes tab after AI generation
- **Large Editor** - Up to 10,000 character notes support

### Dashboard & Analytics
- 📊 **Statistics Dashboard** - Overview of problem-solving progress
- 📈 **Progress Charts** - Visual representation of completion rates
- 🎯 **Difficulty Breakdown** - Easy, Medium, Hard problem distribution
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### User Interface
- 🎨 **Tailwind CSS Styling** - Clean, modern design
- ⚡ **Vite HMR** - Instant hot module reloading during development
- 🔄 **React Router Navigation** - Smooth page transitions
- 📱 **Mobile Responsive** - Optimized for all screen sizes

## Tech Stack

- **React 19.1.1** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool with HMR
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Marked** - Markdown parsing and rendering

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (optional):
```bash
# Copy .env.development if you want to customize API URL
# Default: http://localhost:3000/api
```

### Development Server

Start the development server with hot reload:
```bash
npm run dev
```

Browser will open at `http://localhost:5173`

### Build for Production

Build optimized bundle:
```bash
npm run build
```

Output: `dist/` directory (ready for deployment)

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── main.tsx               # Entry point
├── index.css             # Global styles
├── App.tsx               # Main app component
├── assets/               # Static assets
├── components/
│   ├── LoginPage.tsx     # OAuth login
│   ├── Navbar.tsx        # Navigation bar
│   ├── DSADashboard.tsx  # Main dashboard
│   ├── ProblemsList.tsx  # Problems list view
│   ├── ProblemDetail.tsx # Single problem detail
│   ├── AddProblem.tsx    # Add problem form
│   ├── ProfilePage.tsx   # User profile
│   ├── ErrorBoundary.tsx # Error handling
│   └── ui/               # UI components (button, card, etc)
├── services/
│   └── dsaApi.ts         # API client
├── config/
│   └── api.ts            # API configuration
├── lib/
│   └── utils.ts          # Utility functions
└── types/
    └── (implicit)        # TypeScript types
```

## Components

### LoginPage
Entry point with Google OAuth sign-in button

### Navbar
Navigation bar with user profile and menu options

### DSADashboard
Main dashboard showing:
- Problem statistics
- Progress charts
- Recent activity
- Quick links to features

### ProblemsList
Display all tracked problems with:
- Filtering and sorting
- Status badges
- Quick actions

### ProblemDetail
Comprehensive problem view with:
- Problem description
- Implementation editor (tab-based)
- Markdown notes editor
- Live preview
- AI analysis button

### AddProblem
Form to add new problems with:
- URL input with auto-detection
- Status and date selection
- Implementation code input
- AI summary generation
- Notes editor

### ProfilePage
User profile management and settings

## API Integration

All API calls through `DSAApiService` in `src/services/dsaApi.ts`:

```typescript
// Examples
await DSAApiService.getProblems()
await DSAApiService.addProblem({...})
await DSAApiService.generateAiSummary(code, notes)
await DSAApiService.updateUserProblem(id, {...})
```

## Environment Configuration

`.env.development` example:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development Tips

### Hot Module Replacement
Changes to files automatically reflect in browser without page refresh

### TypeScript Support
Full type checking during development - catch errors early

### Vite Plugins
Currently uses:
- `@vitejs/plugin-react` - Fast Refresh with Babel

### Debug Mode
Use browser DevTools for React debugging:
```javascript
// In console
__REACT_DEVTOOLS_EXTENSION__
```

## Performance Optimizations

- Code splitting with React Router lazy loading
- Image optimization with Vite
- CSS purging with Tailwind
- Build optimization with Vite rollup config

## ESLint Configuration

Current setup provides basic rules. For production, extend with:
- Type-aware rules (enable tseslint strict checking)
- React best practices (eslint-plugin-react-x)
- Accessibility rules (eslint-plugin-jsx-a11y)

See `eslint.config.js` for current configuration.

## Deployment

### Vercel (Recommended)
```bash
# Build output goes to dist/
npm run build

# Deploy with Vercel CLI
vercel
```

### Other Platforms (Netlify, GitHub Pages, etc.)
```bash
npm run build
# Upload dist/ folder to your hosting
```

## Troubleshooting

### Hot Reload Not Working
Clear `.vite` cache and restart dev server

### API Connection Issues
Check if server is running on `http://localhost:3000`
Verify `VITE_API_BASE_URL` environment variable

### Build Errors
Clear `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
npm run build
```

## Contributing

Follow these patterns when adding features:
- Use TypeScript for all new files
- Keep components in `src/components/`
- Use `src/services/dsaApi.ts` for all API calls
- Style with Tailwind classes
- Add error boundaries for new features

## License

MIT License - See main project README for details
