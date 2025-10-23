# DSA Tracking API Documentation

## Overview

This API provides comprehensive DSA (Data Structures & Algorithms) problem tracking functionality integrated with LeetCode's GraphQL API.

## Database Design

### 1. Problem Collection (Shared)

Stores LeetCode problem details that are shared across all users to avoid duplication.

```typescript
{
  questionId: string; // LeetCode question ID
  title: string; // Problem title
  titleSlug: string; // URL slug (unique)
  content: string; // HTML content
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: [{ name: string, slug: string }];
  problemUrl: string; // Full LeetCode URL
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. UserProblem Collection (User-specific)

Tracks user-specific data for each problem.

```typescript
{
  userId: ObjectId         // Reference to User
  problemId: ObjectId      // Reference to Problem
  problem_link: string     // LeetCode problem URL
  status: 'Todo' | 'Completed'
  notes: string           // User notes
  date_solved: Date       // When problem was solved
  revision_history: [{
    revision_no: number
    revision_date: Date
    revision_notes: string
  }]
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

Base URL: `http://localhost:3000/api/problems`

All endpoints require authentication (user must be logged in).

### 1. Add/Fetch Problem Details

```http
POST /add-problem
Content-Type: application/json

{
  "titleSlug": "set-matrix-zeroes"
}
```

**Response:**

```json
{
  "message": "Problem fetched successfully",
  "problem": {
    "questionId": "73",
    "title": "Set Matrix Zeroes",
    "titleSlug": "set-matrix-zeroes",
    "content": "<p>Given an <code>m x n</code>...",
    "difficulty": "Medium",
    "topicTags": [
      { "name": "Array", "slug": "array" },
      { "name": "Hash Table", "slug": "hash-table" },
      { "name": "Matrix", "slug": "matrix" }
    ],
    "problemUrl": "https://leetcode.com/problems/set-matrix-zeroes/"
  }
}
```

### 2. Add Problem to User's Tracking List

```http
POST /user-problems
Content-Type: application/json

{
  "titleSlug": "set-matrix-zeroes",
  "status": "Todo",  // Optional: "Todo" | "Completed"
  "notes": "Need to practice matrix manipulation"  // Optional
}
```

### 3. Get User's Tracked Problems

```http
GET /user-problems?status=Todo&difficulty=Medium&page=1&limit=10
```

**Query Parameters:**

- `status`: Filter by status ("Todo" or "Completed")
- `difficulty`: Filter by difficulty ("Easy", "Medium", "Hard")
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 4. Update User Problem

```http
PUT /user-problems/:userProblemId
Content-Type: application/json

{
  "status": "Completed",
  "notes": "Solved using hashmap approach",
  "problem_link": "https://leetcode.com/problems/set-matrix-zeroes/"
}
```

### 5. Delete User Problem

```http
DELETE /user-problems/:userProblemId
```

### 6. Add Revision

```http
POST /user-problems/:userProblemId/revisions
Content-Type: application/json

{
  "revision_notes": "Revised via brute + hashmap approach. Time: O(mn), Space: O(m+n)"
}
```

### 7. Update Revision

```http
PUT /user-problems/:userProblemId/revisions/:revisionNo
Content-Type: application/json

{
  "revision_notes": "Updated approach: using first row/column as markers for O(1) space"
}
```

### 8. Delete Revision

```http
DELETE /user-problems/:userProblemId/revisions/:revisionNo
```

### 9. Get User Statistics

```http
GET /stats
```

**Response:**

```json
{
  "stats": {
    "totalProblems": 25,
    "completedProblems": 18,
    "todoProblems": 7,
    "easyProblems": 8,
    "mediumProblems": 12,
    "hardProblems": 5,
    "totalRevisions": 34
  }
}
```

## Features

1. **Automatic LeetCode Integration**: Fetches problem details from LeetCode's GraphQL API
2. **Optimized Database Design**: Shared problem collection prevents data duplication
3. **Comprehensive Tracking**: Status, notes, solve dates, and revision history
4. **Advanced Filtering**: Filter by status, difficulty, with pagination support
5. **Statistics Dashboard**: Complete overview of user's progress
6. **Data Validation**: URL validation, required field checks, and type safety
7. **Error Handling**: Comprehensive error messages and API rate limiting protection

## Usage Flow

1. **Add Problem**: User provides titleSlug → System fetches from LeetCode → Stores in database
2. **Track Progress**: User adds problem to tracking list with initial status and notes
3. **Update Status**: Mark as completed when solved, automatically sets solve date
4. **Add Revisions**: Track multiple revision attempts with notes and dates
5. **View Progress**: Get filtered list of problems and comprehensive statistics

## Example Complete Workflow

```javascript
// 1. Add a new problem to tracking
const response1 = await fetch("/api/problems/user-problems", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    titleSlug: "two-sum",
    status: "Todo",
    notes: "Classic array problem - need to master hashmap approach",
  }),
});

// 2. Mark as completed
const userProblemId = response1.data.userProblem._id;
await fetch(`/api/problems/user-problems/${userProblemId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "Completed",
    notes: "Solved using hashmap in O(n) time",
  }),
});

// 3. Add revision
await fetch(`/api/problems/user-problems/${userProblemId}/revisions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    revision_notes: "Revised again - now can solve in under 5 minutes",
  }),
});

// 4. Get statistics
const stats = await fetch("/api/problems/stats");
```

This comprehensive DSA tracking system provides everything needed to manage LeetCode problem-solving progress effectively!
