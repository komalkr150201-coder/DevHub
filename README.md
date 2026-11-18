# DevHub — Developer Portfolio & Collaboration Network

> **"Your GitHub is your résumé. DevHub makes it look like one, keeps it updated automatically, and connects you with people whose skills complement yours."**

DevHub is a full-stack web platform built on the **MERN** stack (MongoDB, Express.js, React, Node.js, Tailwind CSS) that turns a developer's real GitHub activity into a living, auto-updating portfolio and uses an intelligent matching algorithm to connect developers with the right project teammates.

---

## 🌟 Key Highlights

- **Passwordless GitHub OAuth 2.0**: Secure authentication with state parameter CSRF protection and AES-256 encrypted GitHub access tokens stored at rest.
- **Instant Demo Mode**: Includes pre-seeded verified developers (Asha, Ravi, Elena, Carlos) with live portfolios, allowing immediate evaluation without configuring GitHub OAuth credentials.
- **Automated Living Portfolio**: Ingests repositories, languages, stars, forks, and contribution streaks via the GitHub API. No manual updates required.
- **Mathematical Skill-Extraction Algorithm**: Computes normalized skill weights (0.0 – 1.0) directly from code bytes, dependency manifests, repo stars, and commit recency.
- **Intelligent Teammate Matching Engine**: Ranks candidate developers against requirements using coverage, cosine similarity, commit activity, and nice-to-have bonuses.
- **Shareable Public Profile URLs**: SEO-friendly links (`devhub.app/:username`) with server-rendered Open Graph meta tags and social preview cards.
- **Project Boards & Collaboration Invitations**: Post team requirements, discover recommended teammates, send collaboration requests, and unlock direct contact info upon acceptance.

---

## 📐 Mathematical Formulas

### 1. Skill Extraction (Section 11.1)

For each skill $k$, raw code evidence across all repositories $r$:

$$\text{raw}(k) = \sum_{r \in \text{repos}} \Big[ \text{usage}(k, r) \times \text{recency}(r) \times \big(1 + \ln(1 + \text{stars}(r))\big) \Big]$$

- $\text{usage}(k, r)$: Language byte share $\frac{\text{bytes}(k, r)}{\text{totalBytes}(r)}$, or $1.0$ if detected in dependency files (`package.json`, `requirements.txt`, `pom.xml`, `Dockerfile`) or repository topics.
- $\text{recency}(r)$:
  - $1.0$ if pushed in the last 6 months
  - $0.7$ if pushed within 1 year
  - $0.4$ otherwise
- Normalized skill weight:

$$\text{weight}(k) = \frac{\text{raw}(k)}{\max_{s} \text{raw}(s)} \in [0.0, 1.0]$$

*(Manually confirmed skills receive a $+10\%$ boost; self-declared skills without code evidence are weighted with a conservative baseline).*

---

### 2. Match Score Algorithm (Section 11.2 & 11.3)

Given required skills $r$ with importance weights $\text{imp}(r) \in [1, 5]$, and optional nice-to-have skills:

$$\text{Coverage}(d) = \frac{\sum_{r \in \text{required}} \big( \text{imp}(r) \times \text{weight}_d(r) \big)}{\sum_{r \in \text{required}} \text{imp}(r)}$$

$$\text{Cosine}(d) = \frac{\vec{v}_d \cdot \vec{v}_{\text{req}}}{\|\vec{v}_d\| \|\vec{v}_{\text{req}}\|}$$

$$\text{Bonus}(d) = \frac{|\text{matched nice-to-have}|}{|\text{nice-to-have}|} \times 0.10$$

$$\text{Activity}(d) = \min\left(1.0, \max\left(\frac{\text{commits}_{90d}}{100}, \frac{\text{streak}}{30}\right)\right)$$

$$\text{Score}(d) = 100 \times \Big( 0.60 \times \text{Coverage} + 0.20 \times \text{Cosine} + 0.10 \times \text{Activity} \Big) + 100 \times 0.10 \times \text{Bonus}$$

#### Worked Example Validation (Section 11.3)
Requirement: React (imp 3), Node.js (imp 2), MongoDB (imp 2).
- **Asha**: React 0.95, Node.js 0.80, MongoDB 0.75 $\rightarrow \text{Coverage} = \frac{3(0.95) + 2(0.80) + 2(0.75)}{7} = 0.85 \rightarrow \mathbf{87\%\text{ Match}}$ (Missing: None)
- **Ravi**: React 0.90, Node.js 0.70, MongoDB 0.00 $\rightarrow \text{Coverage} = \frac{3(0.90) + 2(0.70) + 0}{7} = 0.59 \rightarrow \mathbf{71\%\text{ Match}}$ (Missing: MongoDB)

---

## 🗂️ Project Folder Structure

```
devhub/
|-- client/                      (React 18 + Vite + Tailwind CSS)
|   |-- src/
|   |   |-- components/          (Navbar, Footer, ProjectCard, SkillBadge, MatchCard, LanguageChart, ContributionHeatmap, SearchBar, CollaborateModal, ProtectedRoute)
|   |   |-- pages/               (Landing, Dashboard, EditPortfolio, Discover, ProjectsList, PostProject, ProjectMatches, Requests, PublicProfile, NotFound)
|   |   |-- context/             (AuthContext)
|   |   |-- hooks/               (useAuth, useMatch)
|   |   |-- services/            (api.js - configured Axios client)
|   |   |-- App.jsx, main.jsx, index.css
|   |-- vite.config.js
|   |-- tailwind.config.js
|   `-- package.json
|
|-- server/                      (Node.js + Express.js + Mongoose)
|   |-- src/
|   |   |-- config/              (db.js, env.js, github.js)
|   |   |-- models/              (User, Repo, Skill, Project, Request)
|   |   |-- controllers/         (authController, userController, matchController, projectController, requestController)
|   |   |-- routes/              (auth, users, match, projects, requests)
|   |   |-- services/            (skillExtractor, matcher, githubSync)
|   |   |-- middleware/          (auth, rateLimit, validate, error)
|   |   |-- jobs/                (syncJob.js - node-cron scheduled refresh)
|   |   |-- app.js, server.js, seed.js
|   |-- test/                    (matcher.test.js, api.test.js)
|   `-- package.json
|
|-- .env.example
|-- package.json                 (Root concurrency scripts)
`-- README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Optional: MongoDB running locally or MongoDB Atlas connection URI (if absent, DevHub automatically connects via an embedded in-memory database).

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

To enable live GitHub OAuth login, obtain credentials at [GitHub Developer Settings](https://github.com/settings/developers):
- **Authorization callback URL**: `http://localhost:5001/auth/github/callback`
- Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `server/.env`.

*(Note: You can skip GitHub credentials and test immediately using the built-in **Try Demo Account** button!)*

### 3. Seed Database
Pre-populate realistic developers (Asha, Ravi, Elena, Carlos), projects, and verified skills:
```bash
npm run seed
```

### 4. Run Development Servers
Start both the client (Vite on port 5173) and backend (Express on port 5001):
```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Testing

Run the test suite (unit tests and API integration tests):
```bash
npm test --prefix server
```
Expected output:
```
✔ GET /health returns status ok
✔ POST /api/match returns Section 11.3 ranked results
✔ GET /api/users/asha returns public profile data
✔ GET /:username returns Open Graph HTML for SEO sharing
✔ POST /auth/demo-login logs in user and returns session
✔ Recency Multiplier
✔ Worked Example Matching from Section 11.3
✔ Skill Extractor correctly computes weights from repos
ℹ tests 8 | pass 8 | fail 0
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/auth/github` | No | Initiates GitHub OAuth 2.0 flow with state CSRF protection |
| `GET` | `/auth/github/callback` | No | Exchanges OAuth code, issues signed HTTP-only JWT cookie |
| `POST` | `/auth/demo-login` | No | Instant passwordless demo sign-in for testing |
| `POST` | `/auth/logout` | Yes | Clears session cookie |
| `GET` | `/api/me` | Yes | Retrieves current user profile, repos, and skills |
| `PATCH` | `/api/me` | Yes | Updates bio, links, availability, and privacy settings |
| `POST` | `/api/sync` | Yes | Manually forces GitHub repository and skill recalculation |
| `PATCH` | `/api/repos/:id` | Yes | Toggles repo pinned or hidden status |
| `PUT` | `/api/skills` | Yes | Adds, removes, or modifies skills |
| `GET` | `/api/users/:username` | No | Public profile data for live portfolio page |
| `POST` | `/api/match` | Optional | Ranks developers against required & nice-to-have skills |
| `GET` | `/api/search` | Optional | Searches developers by keyword, skill, or availability |
| `GET` | `/api/projects` | Optional | Lists open team requirements |
| `POST` | `/api/projects` | Yes | Posts new project requirement with weighted skills |
| `GET` | `/api/projects/:id/matches`| Yes | Ranked recommended teammates for specific project |
| `GET` | `/api/requests` | Yes | Incoming & outgoing collaboration requests |
| `POST` | `/api/requests` | Yes | Sends a collaboration invitation |
| `PATCH` | `/api/requests/:id` | Yes | Accepts or declines invitation (reveals contact links) |
| `GET` | `/:username` | No | Open Graph HTML preview for link sharing |

---

## 🛡️ Security & Privacy (Section 13)

- **Token Encryption**: GitHub access tokens are encrypted with AES-256-CBC with an initialization vector before being saved to MongoDB.
- **Session Security**: JWTs are stored in HTTP-only, SameSite cookies with strict expiration.
- **Rate Limiting**: `express-rate-limit` protects authentication and search endpoints.
- **Privacy Controls**: Users can toggle public profile visibility and email disclosure at any time.

---

## 🚢 Production Deployment Guide

DevHub supports both **Unified Full-Stack Deployment** (single service on Render/Railway/Fly.io) and **Split Deployment** (Vercel frontend + Render backend).

---

### Step 1: Set Up MongoDB Atlas (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new free cluster (**M0 Free Tier**).
3. Under **Database Access**, create a database user (e.g., username `devhub_admin`, choose a secure password).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so your cloud host can connect.
5. Click **Connect** → **Drivers** (Node.js) and copy your connection string:
   ```
   mongodb+srv://devhub_admin:<password>@cluster0.abcde.mongodb.net/devhub?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password).*

---

### Step 2: Configure GitHub OAuth App for Production

1. Visit [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps**.
2. Select your DevHub OAuth app (or create a new production one):
   - **Application name**: `DevHub Production`
   - **Homepage URL**: `https://<your-deployed-app-domain>` (e.g. `https://devhub-app.onrender.com` or `https://devhub.vercel.app`)
   - **Authorization callback URL**: `https://<your-backend-domain>/auth/github/callback` (e.g. `https://devhub-app.onrender.com/auth/github/callback`)
3. Copy your **Client ID** and generate a new **Client Secret**.

---

### Step 3: Deploy Option A — Unified Full-Stack on Render (Recommended)

This deploys both the React Vite frontend and the Express backend as a single service on [Render](https://render.com), eliminating cross-origin cookie issues.

1. Push your repository to GitHub.
2. Sign in to [Render](https://dashboard.render.com).
3. Click **New +** → **Web Service** → Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `devhub-app`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables under **Environment**:
   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Generate random 32+ char secret string |
   | `ENCRYPTION_KEY` | 32-character AES secret key |
   | `GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID |
   | `GITHUB_CLIENT_SECRET`| Your GitHub OAuth Client Secret |
   | `GITHUB_CALLBACK_URL` | `https://<your-render-subdomain>.onrender.com/auth/github/callback` |
   | `CLIENT_URL` | `https://<your-render-subdomain>.onrender.com` |
6. Click **Deploy Web Service**.
7. Once deployed, visit `https://<your-render-subdomain>.onrender.com` — your app is live in the real world!

---

### Step 4: Deploy Option B — Split Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the client on Vercel and API on Render:

#### 1. Deploy Backend to Render:
- Follow Step 3, but set **Root Directory** to `server`.
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`
- Set `CLIENT_URL` to your Vercel URL (e.g. `https://devhub.vercel.app`).
- Set `GITHUB_CALLBACK_URL` to `https://devhub-api.onrender.com/auth/github/callback`.

#### 2. Deploy Frontend to Vercel:
1. Go to [Vercel](https://vercel.com) → **Add New Project** → Import your GitHub repository.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://devhub-api.onrender.com`
5. Click **Deploy**. Vercel will automatically build using `client/vercel.json` for SPA routing.
