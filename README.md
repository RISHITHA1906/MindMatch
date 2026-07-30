# 🧠 MindMatch — AI-Driven Peer Learning Platform

> Built by P.Hruthika, G.Deekshitha, B.Rishitha · RGUKT R.K. Valley, Kadapa

---

## 🐛 Bugs Fixed in This Version

### 1. Steps 2 & 3 Skipping Immediately (CRITICAL FIX)
**Root Cause:** Steps 2, 3, and 4 were wrapped in `<form onSubmit={goNext}>`.  
Any `<button>` without `type="button"` inside a `<form>` defaults to `type="submit"` and triggers the form's `onSubmit`.  
The EduSelector's category/subcategory toggle buttons had no `type` attribute → clicking them submitted the form → jumped to next step.

**Fix Applied:**
- Steps 2, 3, 4 are now **NOT wrapped in `<form>`** — they use plain `<div>` containers.
- All navigation uses `onClick` buttons with explicit `type="button"`.
- Every interactive element in `EduSelector.js` and `SubjectSearch.js` has `type="button"`.
- Only Step 1 uses `<form onSubmit>` (for Enter-key support on text fields).

### 2. No Specific Subjects in Steps 2 & 3
**Root Cause:** The `SubjectSearch` showed only generic suggestions, not context-aware ones tied to selected exams.

**Fix Applied:**
- `educationData.js` now contains `SUBJECT_SUGGESTIONS_BY_CONTEXT` — a map from 30+ specific exams/skills to their relevant chapter/topic lists.
- `SubjectSearch` now accepts a `context` prop (array of selected EduSelector items) and shows relevant suggestions.
- E.g., selecting "JEE Main" → SubjectSearch shows "Mechanics, Organic Chemistry, Calculus..." automatically.

### 3. EduSelector — Vast India Education Data
- 9 major categories, 80+ subcategories, 700+ specific items.
- Covers all SSC, UPSC, State PSC, Banking, Railway, Defence, Medical, Engineering, CA/CS/CMA, MBA, BA, Arts, Languages, IT Skills, Olympiads, and more.

### 4. AI Matching Improvements
- Now uses `teachSubjectDetails` + `learnSubjectDetails` + `subjectDetails` (chapter-level data) in scoring.
- Partial string matching catches "JEE Main" matching "JEE".
- `recommend_skills_for_user()` now integrated into `/api/matching/skill-recommendations`.
- Matching page shows specific topic tags (Teaches / Learning sections) pulled from new fields.

---

## 🚀 How to Run (Local Setup)

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB running on localhost:27017

### Step 1 — Start MongoDB
```bash
# Windows
net start MongoDB
# OR (if using Compass, just open it)

# Mac/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### Step 2 — Backend Setup
```bash
cd mindmatch/backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Start the backend
python app.py
```
Backend runs at: http://localhost:5000

### Step 3 — Frontend Setup
```bash
cd mindmatch/frontend

# Install dependencies
npm install

# Start the frontend
npm start
```
Frontend runs at: http://localhost:3000

### Step 4 — Open in Browser
Go to: **http://localhost:3000**

---

## 📂 Project Structure
```
mindmatch/
├── backend/
│   ├── ai/
│   │   └── matching_engine.py     ← AI scoring + recommendations (UPDATED)
│   ├── routes/
│   │   ├── auth.py
│   │   ├── matching.py            ← Uses new AI engine (UPDATED)
│   │   ├── match_requests.py      ← Mutual match system
│   │   ├── notifications.py
│   │   └── ...
│   ├── app.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── EduSelector.js     ← FIXED (type="button" on all elements)
        │   └── SubjectSearch.js   ← FIXED (context-aware suggestions)
        ├── pages/
        │   ├── Register.js        ← FIXED (steps 2/3/4 no longer skip)
        │   ├── Matching.js        ← UPDATED (shows specific topics, match status)
        │   └── Profile.js         ← UPDATED (SubjectSearch in edit mode)
        └── utils/
            └── educationData.js   ← EXPANDED (700+ India education items)
```

---

## 🔑 Key Features
- **Mutual Match System** — both users must accept to become study partners
- **AI Matching** — weighted scoring: subject overlap (35%), skill barter (25%), topic-level match (15%), availability (15%), level compatibility (5%), reputation (5%)
- **Real-time Chat** — WebSocket-based with image/file support
- **Video Calls** — WebRTC peer-to-peer with screen sharing
- **Skill Barter** — teach to earn credits, spend to learn
- **OTP Verification** — phone number verification at signup (dev: OTP printed to console)
- **Mentor Tags** — automatic award for high-rated teachers
- **Notifications** — real-time alerts for match requests, messages, calls

---

## ⚠️ Dev Notes
- **OTP in dev mode:** The OTP is printed to the **backend terminal** (not SMS). Check `python app.py` output.
- **MongoDB:** Must be running before starting backend.
- **First run:** Register at least 2 users with overlapping subjects to see AI matching work.
