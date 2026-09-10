# ICT Service Request Management System

## Project Overview

A web-based system for recording and managing ICT technical support requests. Built with HTML, CSS, and JavaScript on the front end, powered by Supabase (PostgreSQL + Authentication) on the backend, and deployed via GitHub Pages.

---

## Problem Statement

The university ICT office currently receives technical concerns through verbal requests, text messages, and social media. Because requests come from different channels, some concerns are forgotten, duplicated, or not properly monitored. This system centralizes request management by providing a single platform where authorized users can submit, track, update, and manage ICT service requests.

---

## System Features

- **User Authentication** — Login / Logout via Supabase Auth
- **Dashboard** — Real-time summary of Total, Pending, In Progress, and Completed requests
- **Create Request** — Submit new ICT service requests with validated fields
- **View Requests** — Display all requests in a sortable table
- **Update Request** — Edit requester details, category, priority, and status
- **Delete Request** — Remove requests with confirmation dialog
- **Search** — Find requests by requester name or description
- **Filter** — Filter by status (Pending / In Progress / Completed) and priority (Low / Medium / High)
- **Analytics** — View request counts by category and priority (bonus feature)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Front End | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | GitHub Pages |
| Version Control | Git / GitHub |

---

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL commands from [`documentation/system-analysis.md`](documentation/system-analysis.md) in the SQL Editor
3. Create a test user in **Authentication > Users**
4. Copy your **Project URL** and **anon/public key** from **Settings > API**

### 2. Configure the Application

Open `js/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_KEY = "your-anon-key";
```

### 3. Deploy to GitHub Pages

1. Push all files to your GitHub repository
2. Go to **Settings → Pages → Build and Deployment**
3. Select **Branch: main**, **Folder: / (root)**
4. Your site will be available at: `https://username.github.io/SAD-ServiceRequest-Lastname/`

---

## Project Structure

```
├── index.html                    # Main application (dashboard + CRUD)
├── login.html                    # Login page
├── css/
│   └── style.css                 # Stylesheet
├── js/
│   ├── supabase.js               # Supabase client initialization
│   ├── auth.js                   # Authentication logic
│   └── app.js                    # CRUD, search, filter, analytics
├── README.md                     # This file
└── documentation/
    └── system-analysis.md        # SAD artifacts and SQL setup
```

---

## Documentation

See [`documentation/system-analysis.md`](documentation/system-analysis.md) for:
- Problem Statement
- Use Case Diagram
- Entity-Relationship Diagram (ERD)
- Requirements Traceability Matrix
- Business Rules
- Functional Test Cases
- Database SQL Setup

---

## Screenshots

*(Add screenshots of the running system here)*

---

## Test Account

> **Note:** Test credentials should be submitted separately through the LMS. Do not include passwords in a public repository.

---

## Commit History

| Commit | Description |
|--------|-------------|
| 1 | Initial project structure |
| 2 | Add Supabase database integration |
| 3 | Implement CRUD operations |
| 4 | Add search, filtering, and deployment |
