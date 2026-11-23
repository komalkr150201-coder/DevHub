# DevHub — Developer Portfolio & Collaboration Network

> **"Your GitHub is your résumé. DevHub makes it look like one, keeps it updated automatically, and connects you with people whose skills complement yours."**

DevHub is a full-stack platform built on the **MERN** stack (MongoDB, Express.js, React, Node.js, Tailwind CSS) and **Flutter** cross-platform client (Android, iOS, Web) that turns a developer's real GitHub activity into a living, auto-updating portfolio and uses an intelligent matching algorithm to connect developers with the right project teammates.

---

## 🌟 Key Highlights

- **Cross-Platform Mobile & Web Client**: Full-featured Flutter mobile and web application.
- **Passwordless GitHub OAuth 2.0**: Secure authentication with state parameter CSRF protection and AES-256 encrypted GitHub access tokens stored at rest.
- **Instant Demo Mode**: Includes pre-seeded verified developers (Asha, Ravi, Elena, Carlos) with live portfolios, allowing immediate evaluation without configuring GitHub OAuth credentials.
- **Automated Living Portfolio**: Ingests repositories, languages, stars, forks, and contribution streaks via the GitHub API. No manual updates required.
- **Mathematical Skill-Extraction Algorithm**: Computes normalized skill weights (0.0 – 1.0) directly from code bytes, dependency manifests, repo stars, and commit recency.
- **Intelligent Teammate Matching Engine**: Ranks candidate developers against requirements using coverage, cosine similarity, commit activity, and nice-to-have bonuses.
- **Shareable Public Profile URLs**: SEO-friendly links (`devhub.app/:username`) with server-rendered Open Graph meta tags and social preview cards.
- **Project Boards & Collaboration Invitations**: Post team requirements, discover recommended teammates, send collaboration requests, and unlock direct contact info upon acceptance.

---

## 🗂️ Project Folder Structure

```
devhub/
|-- lib/                         (Flutter Mobile & Web client)
|   |-- core/                    (Theme, App Router)
|   |-- models/                  (DevUser, RepoItem, SkillItem)
|   |-- screens/                 (Dashboard, Developers, Projects, Repos, Requests, Settings, Auth)
|   |-- services/                (DevHubApi client)
|   |-- state/                   (AuthState provider)
|   `-- main.dart
|
|-- client/                      (React 18 + Vite + Tailwind CSS)
|-- server/                      (Node.js + Express.js + Mongoose)
`-- README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- Flutter SDK >= 3.x
- Optional: MongoDB running locally or MongoDB Atlas URI.

### Run Flutter Client
```bash
flutter run -d chrome  # For web
flutter run            # For mobile / emulator
```
