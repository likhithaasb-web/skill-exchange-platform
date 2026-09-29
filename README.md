# SkillX — Premium Skill Exchange Platform

> **Exchange Skills. Share Knowledge. Build Together.**

SkillX is a production-quality, peer-to-peer web application where people exchange skills directly with each other. A user can teach a skill they know while learning a skill they want from another person.

**Zero AI Dependencies**: The intelligence of SkillX comes strictly from its human-to-human skill exchange model, transparent rule-based compatibility engine, collaborative Skill Studio, Black + Gold Skill Passport, and conversational peer verification.

---

## 🌟 The Core Principle

```
FIND → CONNECT → EXCHANGE → LEARN → BUILD → VERIFY
```

- **User A** (e.g. `@python_master`): Teaches Python & Flask ↔ Wants Cybersecurity
- **User B** (e.g. `@cyber_nova`): Teaches Cybersecurity & Linux ↔ Wants Python
- **Rule-Based Engine**: Matches them based on complementary skills, experience level compatibility, format preferences, and language overlap. No black boxes. No AI.
- **Skill Studio**: A private collaborative environment with shared Whiteboard, Code Space, Voice/Optional Camera, and attributed Resources.
- **Verification**: Completed exchanges and projects earn **Peer-Verified** and **Project-Demonstrated** credentials on the official digital Skill Passport.

---

## 🏆 Signature Features

### 1. The Black + Gold Skill Passport
- Deep obsidian card styling with metallic gold borders, gold typography accents, and soft shimmer.
- Clearly distinguishes between:
  - **Self-Declared** (initial declared skill level)
  - **Peer-Verified** (confirmed through completed Skill Studio exchanges)
  - **Project-Demonstrated** (proven through working collaborative code)
- Verified exchange metrics: Skills taught, skills learned, exchanges completed, projects completed, and confirmed hours.
- Export, print, and public link sharing.

### 2. The Interactive Skill Studio
- Dedicated real-time collaborative workspace (`/studio/:studioId`).
- **Collaborative Whiteboard**: Full canvas with Pen, Pencil, Highlighter, Eraser, Shapes (Rect, Circle, Triangle), Lines, Arrows, Text, Sticky Notes, Color Palette, Undo/Redo, Clear, Live peer cursors, and PNG export.
- **Collaborative Code Space**: Syntax-highlighted editor with multi-language selector (Python, JavaScript, TypeScript, HTML, CSS, SQL, C++, Java), live sync, copy, and export.
- **Voice Learning & Optional Camera**: Camera is strictly optional (starts OFF by default). Voice participation with Push-to-Talk (Hold Space), mute/unmute, volume control, and speaking activity indicators.
- **Attributed Resource Sharing**: Share PDFs, code files, and documents with clear uploader attribution (avatar, @username, upload date, file type, file size, download button).
- **Studio Chat**: Real-time messaging with participant timestamps.
- **Host Session Settings**: Live controls to manage whiteboard, code, upload, and screen-sharing permissions.

### 3. Personalized 5-Question Onboarding
Smooth, single-question card transitions capturing learning identity and goals before entering the platform:
1. *What is one skill you wish you had learned before?*
2. *What was your biggest learning challenge?*
3. *What project taught you the most?*
4. *What kind of person helps you learn best?*
5. *What would you love to build or accomplish with your skills?*

### 4. Conversational Peer Reviews
- No generic 1–10 survey forms.
- Lightweight appreciation chips: `✨ Explained clearly`, `🤝 Easy to collaborate with`, `💡 Shared useful knowledge`, `🧠 Made difficult concepts easier`, `💬 Communicated well`, `⏱ Respectful of time`, `🚀 Helped me build something`.
- Public vs. Private feedback toggle.
- Automatically records peer verification onto the recipient's Skill Passport.

### 5. Privacy & Security Centers
- Granular visibility settings: Profile visibility (Public, Members only, Private), Contact preferences, and Review visibility.
- Active device sessions audit with remote sign-out.
- Strict username validation (4–20 characters, alphanumeric + underscore, reserved word filter, case-insensitive uniqueness).
- Password entropy meter (Weak, Fair, Strong, Very Strong) with bcrypt hashing.
- One-click account blocking and safety reporting.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or remote URI)

### 1. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Seed Database
```bash
cd server
node src/seed.js
```

### 3. Start Backend & Real-Time Socket Server
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

### 4. Start Frontend Client
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 👥 Pre-Seeded Test Accounts

Password for all pre-seeded accounts: `Password123!`

| Username | Name | Teaches | Wants | Role / Identity |
| :--- | :--- | :--- | :--- | :--- |
| `@alex_codes` | Alex Rivers | React, JavaScript, Node.js | UI/UX, Figma | Frontend Architect |
| `@cyber_nova` | Nova Chen | Cybersecurity, Linux, Networking | Python, Automation | Security Researcher |
| `@designfox` | Elena Rostova | Figma, UI/UX, Design Systems | React, CSS | Principal Product Designer |
| `@python_master` | Harsha Vardhan | Python, Flask, Git | Cybersecurity, Cloud | Python & Backend Specialist |
| `@cloud_sarah` | Sarah Miller | Docker, Kubernetes, CI/CD | Python, Linux | DevOps & Cloud Architect |
