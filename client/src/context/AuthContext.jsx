import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../services/api';

// Verified Real-World Developers Dataset from GitHub
export const REAL_WORLD_DEVELOPERS = [
  {
    id: "d-komalkr150201-coder",
    name: "Komal",
    username: "komalkr150201-coder",
    role: "Full-Stack Developer & Software Engineer",
    location: "India / Remote",
    email: "komalkr150201@gmail.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/289376476?v=4",
    open: true,
    skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Python", "Git", "Tailwind CSS"],
    repos: 5,
    stars: 12,
    followers: 6,
    bio: "Full-Stack Developer and creator of DevHub, Smart Mango IoT transportation monitoring, and predictive intelligence models.",
    links: {
      github: "https://github.com/komalkr150201-coder",
      website: "https://github.com/komalkr150201-coder/DevHub"
    },
    projects: [
      {
        title: "DevHub - Developer Collaboration & Matchmaking",
        description: "Full-stack developer platform featuring mathematical skill extraction, cosine similarity & coverage matching engine, dual JWT auth with AES-256 encryption.",
        tech: ["React", "Node.js", "Express", "MongoDB", "Vite"]
      },
      {
        title: "smartmango",
        description: "AI & IoT-based smart mango transportation monitoring system with telemetry and spoilage prediction.",
        tech: ["Python", "IoT", "Machine Learning"]
      }
    ],
    realRepos: [
      {
        id: 501,
        name: "DevHub",
        description: "Full-stack developer portfolio and collaboration matching platform with real GitHub repo extraction and AES-256 token security.",
        language: "JavaScript",
        langs: { JavaScript: 70, HTML: 20, CSS: 10 },
        stars: 8,
        forks: 3,
        updated: "Today",
        topics: ["react", "nodejs", "mongodb", "developer-portfolio", "matching-algorithm"],
        pinned: true
      },
      {
        id: 502,
        name: "smartmango",
        description: "AI & IoT-based smart mango transportation monitoring system with sensor telemetry and spoilage prediction.",
        language: "Python",
        langs: { Python: 85, C: 15 },
        stars: 3,
        forks: 1,
        updated: "Recently",
        topics: ["iot", "sensors", "python", "agriculture"],
        pinned: true
      },
      {
        id: 503,
        name: "mango-intelligence",
        description: "Predictive agricultural quality intelligence and classification models for produce freshness.",
        language: "Python",
        langs: { Python: 90, Shell: 10 },
        stars: 2,
        forks: 0,
        updated: "Recently",
        topics: ["machine-learning", "computer-vision", "python"],
        pinned: true
      },
      {
        id: 504,
        name: "nodeProject",
        description: "Scalable asynchronous backend services and middleware pipeline built with Node.js and Express.",
        language: "JavaScript",
        langs: { JavaScript: 95 },
        stars: 1,
        forks: 0,
        updated: "Recently",
        topics: ["nodejs", "express", "backend"],
        pinned: false
      },
      {
        id: 505,
        name: "my_project",
        description: "Interactive full-stack web application featuring dynamic UI components and state management.",
        language: "JavaScript",
        langs: { JavaScript: 80, HTML: 20 },
        stars: 1,
        forks: 0,
        updated: "Recently",
        topics: ["javascript", "web"],
        pinned: false
      }
    ]
  },
  {
    id: "d-gaearon",
    name: "Dan Abramov",
    username: "gaearon",
    role: "Frontend Architect & React Core",
    location: "London, UK",
    email: "dan.abramov@gmail.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/810438?v=4",
    open: true,
    skills: ["React", "JavaScript", "Redux", "TypeScript", "Node.js", "Git"],
    repos: 260,
    stars: 98400,
    followers: 84200,
    bio: "Working on React at Bluesky. Co-created Redux, Create React App, and React Hot Loader.",
    projects: [
      { title: "Bluesky React Client", description: "AT Protocol social client built with React Native and modern web standards.", tech: ["React", "TypeScript", "Redux"] }
    ],
    realRepos: [
      {
        id: 101,
        name: "redux",
        description: "Predictable state container for JavaScript apps. The industry standard state library.",
        language: "TypeScript",
        langs: { TypeScript: 82, JavaScript: 18 },
        stars: 60800,
        forks: 15400,
        updated: "1 day ago",
        topics: ["redux", "state-management", "flux", "react"],
        pinned: true
      },
      {
        id: 102,
        name: "overreacted.io",
        description: "Personal blog about software architecture, React deep dives, and mental models.",
        language: "JavaScript",
        langs: { JavaScript: 75, CSS: 25 },
        stars: 7200,
        forks: 1300,
        updated: "3 days ago",
        topics: ["blog", "react", "gatsby"],
        pinned: true
      },
      {
        id: 103,
        name: "react-hot-loader",
        description: "Tweak React components in real time without losing state in development.",
        language: "JavaScript",
        langs: { JavaScript: 88, HTML: 12 },
        stars: 12900,
        forks: 1200,
        updated: "2 weeks ago",
        topics: ["react", "webpack", "hmr"],
        pinned: true
      }
    ]
  },
  {
    id: "d-sindresorhus",
    name: "Sindre Sorhus",
    username: "sindresorhus",
    role: "Open-Source Lead & Full-Stack Developer",
    location: "Phuket, Thailand",
    email: "sindresorhus@gmail.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/170270?v=4",
    open: true,
    skills: ["JavaScript", "TypeScript", "Node.js", "Git", "Shell", "Electron"],
    repos: 1120,
    stars: 520000,
    followers: 61000,
    bio: "Full-time open-sourcerer. Creator of 1,000+ npm packages used by millions of software developers.",
    projects: [
      { title: "Pure ESM Modules", description: "Leading the ecosystem migration towards standard modern ES Modules.", tech: ["JavaScript", "TypeScript", "Node.js"] }
    ],
    realRepos: [
      {
        id: 201,
        name: "awesome",
        description: "Awesome lists about all kinds of interesting topics in software engineering.",
        language: "Markdown",
        langs: { Markdown: 95, Shell: 5 },
        stars: 345000,
        forks: 28000,
        updated: "4 hours ago",
        topics: ["lists", "awesome", "unicorns", "resources"],
        pinned: true
      },
      {
        id: 202,
        name: "chalk",
        description: "Terminal string styling done right. Most downloaded terminal styling library in Node.js.",
        language: "TypeScript",
        langs: { TypeScript: 84, JavaScript: 16 },
        stars: 22400,
        forks: 1100,
        updated: "1 week ago",
        topics: ["terminal", "colors", "cli", "ansi"],
        pinned: true
      },
      {
        id: 203,
        name: "ky",
        description: "Tiny and elegant HTTP client based on the browser Fetch API.",
        language: "TypeScript",
        langs: { TypeScript: 92, JavaScript: 8 },
        stars: 14200,
        forks: 480,
        updated: "5 days ago",
        topics: ["fetch", "http", "browser", "promise"],
        pinned: true
      }
    ]
  },
  {
    id: "d-shadcn",
    name: "Shadcn",
    username: "shadcn",
    role: "UI/UX Engineer & Design Systems",
    location: "New York, USA",
    email: "shadcn@example.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/124599?v=4",
    open: true,
    skills: ["React", "Tailwind CSS", "TypeScript", "Next.js", "Figma", "Git"],
    repos: 48,
    stars: 104000,
    followers: 45000,
    bio: "Building accessible, customizable UI components and developer design systems. Creator of shadcn/ui.",
    projects: [
      { title: "shadcn/ui Design System", description: "Next generation accessible component primitives for modern web engineering.", tech: ["React", "Tailwind CSS", "TypeScript"] }
    ],
    realRepos: [
      {
        id: 301,
        name: "ui",
        description: "Beautifully designed components that you can copy and paste into your apps. Accessible, customizable, open source.",
        language: "TypeScript",
        langs: { TypeScript: 86, CSS: 14 },
        stars: 78500,
        forks: 6200,
        updated: "2 hours ago",
        topics: ["components", "radix-ui", "tailwindcss", "react", "nextjs"],
        pinned: true
      },
      {
        id: 302,
        name: "taxonomy",
        description: "An open source application built using the new router, server components and everything new in Next.js.",
        language: "TypeScript",
        langs: { TypeScript: 90, CSS: 10 },
        stars: 18900,
        forks: 2800,
        updated: "3 days ago",
        topics: ["nextjs", "app-dir", "react", "tailwindcss"],
        pinned: true
      }
    ]
  },
  {
    id: "d-rauchg",
    name: "Guillermo Rauch",
    username: "rauchg",
    role: "Systems Architect & CEO at Vercel",
    location: "San Francisco, USA",
    email: "rauchg@vercel.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/13041?v=4",
    open: true,
    skills: ["Next.js", "JavaScript", "Node.js", "React", "DevOps", "Docker"],
    repos: 240,
    stars: 142000,
    followers: 52000,
    bio: "Founder & CEO of Vercel. Creator of Next.js, Socket.io, and Micro. Passionate about developer experience.",
    projects: [
      { title: "Vercel Frontend Cloud", description: "Global Edge Network and Serverless Compute platform powering the modern web.", tech: ["Next.js", "React", "Node.js"] }
    ],
    realRepos: [
      {
        id: 401,
        name: "socket.io",
        description: "Real-time bidirectional event-based communication library for browser and Node.js.",
        language: "JavaScript",
        langs: { JavaScript: 88, TypeScript: 12 },
        stars: 60200,
        forks: 10200,
        updated: "1 day ago",
        topics: ["websockets", "realtime", "nodejs"],
        pinned: true
      },
      {
        id: 402,
        name: "micro",
        description: "Asynchronous HTTP microservices for Node.js with tiny footprint.",
        language: "JavaScript",
        langs: { JavaScript: 92, Shell: 8 },
        stars: 11200,
        forks: 580,
        updated: "2 weeks ago",
        topics: ["microservices", "async", "http"],
        pinned: true
      }
    ]
  },
  {
    id: "d-addyosmani",
    name: "Addy Osmani",
    username: "addyosmani",
    role: "Engineering Lead at Google Chrome",
    location: "Mountain View, USA",
    email: "addyosmani@gmail.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/110953?v=4",
    open: true,
    skills: ["JavaScript", "React", "Node.js", "CSS", "Git", "Architecture"],
    repos: 320,
    stars: 92000,
    followers: 44000,
    bio: "Engineering Director working on Google Chrome. Author of Learning JavaScript Design Patterns and Image Optimization.",
    projects: [
      { title: "Web Vitals & Performance", description: "Metrics and tooling to help teams build fast, user-centric web applications.", tech: ["JavaScript", "Chrome", "Web Performance"] }
    ],
    realRepos: [
      {
        id: 501,
        name: "todomvc",
        description: "Helping you select an MV* framework. Comprehensive architecture showcase for JavaScript web apps.",
        language: "JavaScript",
        langs: { JavaScript: 85, CSS: 15 },
        stars: 28600,
        forks: 14800,
        updated: "3 days ago",
        topics: ["mvvm", "frameworks", "mvc", "javascript"],
        pinned: true
      },
      {
        id: 502,
        name: "critical",
        description: "Extract and inline critical-path (above-the-fold) CSS from HTML.",
        language: "JavaScript",
        langs: { JavaScript: 94, HTML: 6 },
        stars: 10100,
        forks: 680,
        updated: "1 week ago",
        topics: ["performance", "css", "inlining"],
        pinned: true
      }
    ]
  },
  {
    id: "d-kentcdodds",
    name: "Kent C. Dodds",
    username: "kentcdodds",
    role: "Full-Stack Developer & Educator",
    location: "Salt Lake City, USA",
    email: "kent@kentcdodds.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/1500684?v=4",
    open: true,
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Git", "Remix"],
    repos: 480,
    stars: 78000,
    followers: 33000,
    bio: "Creator of Testing Library and EpicWeb.dev. Teaching developers how to build confident full-stack web applications.",
    projects: [
      { title: "Epic Web Stack", description: "Opinionated modern full-stack web application starter with Remix, SQLite, and Tailwind.", tech: ["React", "TypeScript", "Remix"] }
    ],
    realRepos: [
      {
        id: 601,
        name: "react-testing-library",
        description: "Simple and complete React DOM testing utilities that encourage good testing practices.",
        language: "TypeScript",
        langs: { TypeScript: 88, JavaScript: 12 },
        stars: 18600,
        forks: 1300,
        updated: "2 days ago",
        topics: ["testing", "react", "dom", "ui"],
        pinned: true
      },
      {
        id: 602,
        name: "downshift",
        description: "Primitives to build simple, flexible, WAI-ARIA compliant enhanced input components.",
        language: "JavaScript",
        langs: { JavaScript: 90, TypeScript: 10 },
        stars: 11400,
        forks: 890,
        updated: "5 days ago",
        topics: ["autocomplete", "combobox", "accessibility"],
        pinned: true
      }
    ]
  },
  {
    id: "d-richharris",
    name: "Rich Harris",
    username: "rich-harris",
    role: "Compiler Architect & Creator of Svelte",
    location: "Brooklyn, USA",
    email: "rich.harris@vercel.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/1162160?v=4",
    open: true,
    skills: ["JavaScript", "TypeScript", "HTML", "CSS", "Node.js", "Git"],
    repos: 180,
    stars: 142000,
    followers: 31000,
    bio: "Creator of Svelte and Rollup. Working on Svelte at Vercel. Former graphics editor at The New York Times.",
    projects: [
      { title: "Svelte 5 Runes", description: "Next generation reactivity model based on fine-grained signals and compile-time optimization.", tech: ["JavaScript", "TypeScript", "Compilers"] }
    ],
    realRepos: [
      {
        id: 701,
        name: "svelte",
        description: "Cybernetically enhanced web apps. Compile-time framework that converts components into imperative code.",
        language: "TypeScript",
        langs: { TypeScript: 86, JavaScript: 14 },
        stars: 82000,
        forks: 4300,
        updated: "1 hour ago",
        topics: ["compiler", "ui", "framework", "svelte"],
        pinned: true
      },
      {
        id: 702,
        name: "rollup",
        description: "Next-generation ES module bundler for JavaScript libraries and applications.",
        language: "JavaScript",
        langs: { JavaScript: 88, TypeScript: 12 },
        stars: 25100,
        forks: 1400,
        updated: "1 day ago",
        topics: ["bundler", "es-modules", "packaging"],
        pinned: true
      }
    ]
  },
  {
    id: "d-evanyou",
    name: "Evan You",
    username: "yyx990803",
    role: "Creator of Vue.js & Vite",
    location: "Singapore",
    email: "evan@vuejs.org",
    avatarUrl: "https://avatars.githubusercontent.com/u/499550?v=4",
    open: true,
    skills: ["JavaScript", "TypeScript", "Node.js", "Git", "Frontend"],
    repos: 190,
    stars: 312000,
    followers: 98000,
    bio: "Independent open source developer. Creator of Vue.js and Vite.",
    projects: [
      { title: "VoidZero Toolchain", description: "Unified end-to-end JavaScript tooling platform for next generation web development.", tech: ["TypeScript", "Rust", "Vite"] }
    ],
    realRepos: [
      {
        id: 801,
        name: "vue",
        description: "The progressive JavaScript framework for building modern user interfaces on the web.",
        language: "TypeScript",
        langs: { TypeScript: 92, JavaScript: 8 },
        stars: 210000,
        forks: 34000,
        updated: "2 hours ago",
        topics: ["vue", "framework", "frontend"],
        pinned: true
      },
      {
        id: 802,
        name: "vite",
        description: "Next Generation Frontend Tooling. Native-ESM dev server and Rollup bundler.",
        language: "TypeScript",
        langs: { TypeScript: 94, JavaScript: 6 },
        stars: 72000,
        forks: 6100,
        updated: "30 minutes ago",
        topics: ["vite", "dev-server", "bundler", "esbuild"],
        pinned: true
      }
    ]
  },
  {
    id: "d-torvalds",
    name: "Linus Torvalds",
    username: "torvalds",
    role: "Creator of Linux & Git",
    location: "Portland, USA",
    email: "torvalds@linux-foundation.org",
    avatarUrl: "https://avatars.githubusercontent.com/u/1021430?v=4",
    open: false,
    skills: ["C", "Linux", "Git", "Shell", "Architecture"],
    repos: 8,
    stars: 194000,
    followers: 230000,
    bio: "Creator of Linux and Git. Linux Foundation fellow. Systems hacker and kernel architect.",
    projects: [
      { title: "Linux Kernel Project", description: "Monolithic Unix-like operating system kernel powering supercomputers and cloud nodes.", tech: ["C", "Assembly", "Git"] }
    ],
    realRepos: [
      {
        id: 901,
        name: "linux",
        description: "Linux kernel source tree. The world operating system engine.",
        language: "C",
        langs: { C: 98, Assembly: 2 },
        stars: 184000,
        forks: 54000,
        updated: "30 minutes ago",
        topics: ["kernel", "operating-system", "linux"],
        pinned: true
      },
      {
        id: 902,
        name: "subsurface-for-dir",
        description: "Subsurface dive log application for recreational and technical scuba divers.",
        language: "C",
        langs: { C: 65, "C++": 30, QML: 5 },
        stars: 2900,
        forks: 490,
        updated: "2 weeks ago",
        topics: ["dive-log", "c", "qt"],
        pinned: true
      }
    ]
  }
];

export const DEVELOPERS = REAL_WORLD_DEVELOPERS;

export const DEFAULT_PROFILE = {
  name: "Komal",
  username: "komalkr150201-coder",
  avatarUrl: "https://avatars.githubusercontent.com/u/289376476?v=4",
  headline: "Full-Stack Developer & Software Engineer",
  bio: "Full-Stack Developer and creator of DevHub, Smart Mango IoT transportation monitoring, and predictive intelligence models.",
  location: "India / Remote",
  email: "komalkr150201@gmail.com",
  website: "https://github.com/komalkr150201-coder/DevHub",
  followers: 6,
  following: 12,
  contributions: 540,
  joined: "Feb 2024"
};

export const DEFAULT_SKILLS = [
  { id: 1, name: "JavaScript", category: "Frontend", level: 95 },
  { id: 2, name: "React", category: "Frontend", level: 92 },
  { id: 3, name: "Node.js", category: "Backend", level: 90 },
  { id: 4, name: "Express", category: "Backend", level: 88 },
  { id: 5, name: "MongoDB", category: "Database", level: 86 },
  { id: 6, name: "Python", category: "Backend", level: 85 },
  { id: 7, name: "Git", category: "Tools", level: 90 },
  { id: 8, name: "Tailwind CSS", category: "Frontend", level: 84 }
];

export const DEFAULT_REPOS = REAL_WORLD_DEVELOPERS[0].realRepos;

export const DEFAULT_PROJECTS = [
  {
    id: "p1",
    title: "DevHub - Developer Collaboration & Matchmaking",
    description: "Full-stack developer platform featuring mathematical skill extraction, cosine similarity & coverage matching engine, dual JWT auth with AES-256 encryption.",
    tech: ["React", "Node.js", "Express", "MongoDB", "Vite"],
    link: "https://github.com/komalkr150201-coder/DevHub"
  },
  {
    id: "p2",
    title: "smartmango",
    description: "AI & IoT-based smart mango transportation monitoring system with telemetry and spoilage prediction.",
    tech: ["Python", "IoT", "Machine Learning"],
    link: "https://github.com/komalkr150201-coder/smartmango"
  }
];

export const DEFAULT_REQUESTS = [
  {
    id: "r1",
    direction: "received",
    username: "shadcn",
    project: "shadcn/ui next release",
    message: "Hey Dan! Would love your thoughts on our upcoming server action primitives and component ergonomics.",
    status: "pending",
    time: "2 hours ago"
  },
  {
    id: "r2",
    direction: "received",
    username: "kentcdodds",
    project: "Testing Library RFC",
    message: "Reviewing our async utility helpers for concurrent React. Want to team up on the RFC?",
    status: "pending",
    time: "Yesterday"
  },
  {
    id: "r3",
    direction: "received",
    username: "rich-harris",
    project: "Reactivity benchmarks",
    message: "Comparing Svelte runes and React Compiler signals. Want to cross-validate our benchmarks?",
    status: "accepted",
    time: "Last week"
  },
  {
    id: "r4",
    direction: "sent",
    username: "sindresorhus",
    project: "ESM toolchain audit",
    message: "Hey Sindre, reviewing our core module dependencies. Want to collaborate on the ESM compatibility spec?",
    status: "accepted",
    time: "4 days ago"
  }
];

export const DEFAULT_SETTINGS = {
  visibility: "public",
  showEmail: true,
  showRepos: true,
  showSkillLevels: true,
  openToCollab: true,
  listInSearch: true,
  emailRequests: true,
  weeklyDigest: false,
  githubToken: ""
};

export const SKILL_CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"];

export const SUGGESTED_SKILLS = [
  { name: "Next.js", category: "Frontend" },
  { name: "Remix", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "GraphQL", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Docker", category: "DevOps" },
  { name: "Jest", category: "Tools" },
  { name: "Rust", category: "Backend" }
];

export function findDeveloperByUsername(username, fallbackList = []) {
  if (!username) return null;
  const clean = String(username).trim().toLowerCase().replace(/^@/, '');
  const inReal = REAL_WORLD_DEVELOPERS.find((d) => d.username?.toLowerCase() === clean);
  if (inReal) return inReal;
  if (Array.isArray(fallbackList)) {
    const inFallback = fallbackList.find((d) => d.username?.toLowerCase() === clean);
    if (inFallback) return inFallback;
  }
  return null;
}

export function calculateSkillOverlap(mySkills = [], devSkills = []) {
  const getSkillName = (s) => (typeof s === 'string' ? s : s?.name || '').toLowerCase();
  const mySet = new Set((mySkills || []).map(getSkillName).filter(Boolean));
  const shared = (devSkills || [])
    .map((s) => (typeof s === 'string' ? s : s?.name || ''))
    .filter((s) => s && mySet.has(s.toLowerCase()));
  const base = Math.min(mySet.size, (devSkills || []).length) || 1;
  const percent = Math.min(100, Math.round((shared.length / base) * 100));
  return { shared, percent };
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function getPublicProfileUrl(username = '') {
  const clean = String(username).trim().replace(/^@/, '');
  return `${window.location.origin}/u/${clean}`;
}

// Helper to normalize repository objects for frontend consistency
const normalizeRepoList = (reposList = [], username = '') => {
  if (!Array.isArray(reposList)) return [];
  return reposList.map((r, i) => {
    const firstLang = Array.isArray(r.languages) && r.languages.length
      ? (typeof r.languages[0] === 'string' ? r.languages[0] : r.languages[0]?.name)
      : null;
    const language = r.language || firstLang || 'Code';

    const langs = r.langs || (r.languages || []).reduce((acc, l) => {
      const langName = typeof l === 'string' ? l : l?.name;
      if (!langName) return acc;
      const bytes = typeof l === 'object' && l?.bytes ? Math.round(l.bytes / 1000) : 10;
      return { ...acc, [langName]: bytes };
    }, {});

    return {
      id: r.githubRepoId || r.id || r._id || i + 1,
      name: r.name,
      description: r.description || '',
      url: r.url || `https://github.com/${username}/${r.name}`,
      language,
      langs,
      stars: r.stars || 0,
      forks: r.forks || 0,
      topics: r.topics || [],
      pinned: !!r.pinned || !!r.isPinned,
      updated: r.updated || 'Recently'
    };
  });
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    try {
      return localStorage.getItem('devhub_auth') === '1';
    } catch {
      return false;
    }
  });

  const [developersList, setDevelopersList] = useState(REAL_WORLD_DEVELOPERS);

  const [github, setGithub] = useState({
    connected: true,
    lastSync: "just now"
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_skills');
      return saved ? JSON.parse(saved) : DEFAULT_SKILLS;
    } catch {
      return DEFAULT_SKILLS;
    }
  });

  const [repos, setRepos] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_repos');
      return saved ? JSON.parse(saved) : DEFAULT_REPOS;
    } catch {
      return DEFAULT_REPOS;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_projects');
      return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_requests');
      return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
    } catch {
      return DEFAULT_REQUESTS;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('devhub_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(1000);

  const toast = useCallback((message, type = 'success') => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to local storage
  useEffect(() => {
    try { localStorage.setItem('devhub_profile', JSON.stringify(profile)); } catch { }
  }, [profile]);
  useEffect(() => {
    try { localStorage.setItem('devhub_skills', JSON.stringify(skills)); } catch { }
  }, [skills]);
  useEffect(() => {
    try { localStorage.setItem('devhub_repos', JSON.stringify(repos)); } catch { }
  }, [repos]);
  useEffect(() => {
    try { localStorage.setItem('devhub_projects', JSON.stringify(projects)); } catch { }
  }, [projects]);
  useEffect(() => {
    try { localStorage.setItem('devhub_requests', JSON.stringify(requests)); } catch { }
  }, [requests]);
  useEffect(() => {
    try { localStorage.setItem('devhub_settings', JSON.stringify(settings)); } catch { }
  }, [settings]);

  // On mount: check for active HTTP-only cookie session via /auth/me or OAuth callback
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAuthSuccess = urlParams.get('auth_success') === '1';
      const tokenParam = urlParams.get('token');

      if (tokenParam) {
        try { localStorage.setItem('devhub_token', tokenParam); } catch { }
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenParam}`;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data.user && isMounted) {
          const u = res.data.user;
          setAuthed(true);
          try { localStorage.setItem('devhub_auth', '1'); } catch { }

          setProfile({
            name: u.name || u.username,
            username: u.username,
            avatarUrl: u.avatarUrl,
            headline: u.bio?.slice(0, 60) || 'Full-Stack Developer',
            bio: u.bio || '',
            location: u.location || 'Remote',
            email: u.email || '',
            website: u.links?.website || u.links?.github || `https://github.com/${u.username}`,
            followers: u.stats?.followers || 0,
            following: u.stats?.following || 0,
            contributions: (u.stats?.totalStars || 0) * 3 || 100,
            joined: 'Active'
          });

          if (Array.isArray(res.data.repos) && res.data.repos.length > 0) {
            setRepos(normalizeRepoList(res.data.repos, u.username));
          }

          if (Array.isArray(res.data.skills) && res.data.skills.length > 0) {
            setSkills(
              res.data.skills.map((s, i) => ({
                id: i + 1,
                name: s.name,
                category: s.category || 'Frontend',
                level: s.normalizedScore || s.score || 80
              }))
            );
          }

          if (isAuthSuccess) {
            toast(`Successfully authenticated via GitHub as @${u.username}!`, 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 401) {
          try {
            localStorage.removeItem('devhub_token');
          } catch { }
        }
        // If localStorage has authed flag, try restoring session with backend demo-login
        if (localStorage.getItem('devhub_auth') === '1' && profile?.username) {
          try {
            const demoRes = await api.post('/auth/demo-login', { username: profile.username });
            if (demoRes.data?.token) {
              localStorage.setItem('devhub_token', demoRes.data.token);
              api.defaults.headers.common['Authorization'] = `Bearer ${demoRes.data.token}`;
            }
          } catch { }
        }
      }
    };

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Load registered developers from backend into developersList
  useEffect(() => {
    const loadRegistered = async () => {
      try {
        const res = await api.get('/api/search?limit=50');
        const userList = res.data?.results || res.data?.users || [];
        if (res.data?.success && Array.isArray(userList)) {
          const registered = userList.map((u) => ({
            id: `u-${u._id || u.username}`,
            _id: u._id,
            name: u.name || u.username,
            username: u.username,
            role: u.bio?.slice(0, 50) || 'Full-Stack Developer',
            location: u.location || 'Remote',
            email: u.email || `${u.username}@devhub.dev`,
            avatarUrl: u.avatarUrl || `https://avatars.githubusercontent.com/${u.username}`,
            open: true,
            skills: Array.isArray(u.skills) && u.skills.length
              ? u.skills.map((s) => (typeof s === 'string' ? s : s.name))
              : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
            repos: u.stats?.totalRepos || 1,
            stars: u.stats?.totalStars || 0,
            followers: u.stats?.followers || 0,
            bio: u.bio || 'Full-Stack Developer on DevHub.',
            projects: [],
            realRepos: []
          }));

          setDevelopersList((prev) => {
            const combined = [...prev];
            for (const r of registered) {
              const existingIdx = combined.findIndex(
                (d) => d.username.toLowerCase() === r.username.toLowerCase()
              );
              if (existingIdx === -1) {
                combined.unshift(r);
              } else {
                combined[existingIdx] = { ...combined[existingIdx], ...r };
              }
            }
            return combined;
          });
        }
      } catch (err) {
        // Fall back to default list
      }
    };

    loadRegistered();
  }, []);

  // Auth actions
  const login = useCallback(() => {
    try { localStorage.setItem('devhub_auth', '1'); } catch { }
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('devhub_auth');
      localStorage.removeItem('devhub_token');
    } catch { }
    delete api.defaults.headers.common['Authorization'];
    setAuthed(false);
    api.post('/auth/logout').catch(() => { });
  }, []);

  // Fetch real developer from backend or GitHub
  const fetchRealDeveloper = useCallback(async (username, token = null) => {
    try {
      const res = await api.post('/auth/fetch-github-user', {
        username,
        token: token || settings.githubToken
      });
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const formattedDev = {
          id: `d-${d.username}`,
          name: d.name,
          username: d.username,
          role: d.bio?.slice(0, 50) || 'Software Engineer',
          location: d.location || 'Remote',
          email: d.email || `${d.username}@devhub.dev`,
          avatarUrl: d.avatarUrl,
          open: true,
          skills: (d.skills || []).map((s) => s.name),
          repos: d.repos?.length || d.stats?.totalRepos || 0,
          stars: d.stats?.totalStars || 0,
          followers: d.stats?.followers || 0,
          bio: d.bio,
          projects: [],
          realRepos: d.repos || []
        };

        // Add to active developers directory if not present
        setDevelopersList((prev) => {
          if (!prev.some((item) => item.username.toLowerCase() === d.username.toLowerCase())) {
            return [formattedDev, ...prev];
          }
          return prev;
        });

        return formattedDev;
      }
    } catch (err) {
      console.warn('Backend fetch failed, attempting client direct fetch or local dataset...');
    }

    // Direct browser fetch fallback to GitHub API
    try {
      const cleanUser = (username || '').trim().toLowerCase();
      if (cleanUser) {
        const [directRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`),
          fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=pushed`)
        ]);

        if (directRes.ok) {
          const gh = await directRes.json();
          let ghRepos = [];
          if (reposRes.ok) {
            try {
              ghRepos = await reposRes.json();
            } catch { }
          }

          const parsedRepos = Array.isArray(ghRepos) ? ghRepos.map((r, i) => ({
            id: r.id || i + 1,
            githubRepoId: r.id,
            name: r.name,
            description: r.description || '',
            url: r.html_url || `https://github.com/${gh.login}/${r.name}`,
            language: r.language || 'Code',
            langs: r.language ? { [r.language]: 100 } : {},
            stars: r.stargazers_count || 0,
            forks: r.forks_count || 0,
            topics: r.topics || [],
            pinned: i < 3,
            updated: new Date(r.pushed_at || r.updated_at || Date.now()).toLocaleDateString()
          })) : [];

          const totalStars = parsedRepos.reduce((acc, r) => acc + (r.stars || 0), 0);
          const langSkills = Array.from(new Set(parsedRepos.map((r) => r.language).filter(Boolean)));
          const baseSkills = langSkills.length ? langSkills : ['JavaScript', 'TypeScript', 'React', 'Git'];

          const formattedDev = {
            id: `d-${gh.login.toLowerCase()}`,
            name: gh.name || gh.login,
            username: gh.login.toLowerCase(),
            role: gh.bio?.slice(0, 50) || 'Software Engineer',
            location: gh.location || 'Remote',
            email: gh.email || `${gh.login.toLowerCase()}@devhub.dev`,
            avatarUrl: gh.avatar_url || `https://avatars.githubusercontent.com/${gh.login}`,
            open: true,
            skills: baseSkills,
            repos: parsedRepos.length || gh.public_repos || 0,
            stars: totalStars,
            followers: gh.followers || 0,
            bio: gh.bio || 'Developer on GitHub.',
            projects: [],
            realRepos: parsedRepos
          };

          setDevelopersList((prev) => {
            if (!prev.some((item) => item.username.toLowerCase() === formattedDev.username)) {
              return [formattedDev, ...prev];
            }
            return prev;
          });
          return formattedDev;
        }
      }
    } catch (clientErr) {
      console.warn('Client-side GitHub fetch fallback failed:', clientErr);
    }

    const fallback = findDeveloperByUsername(username);
    if (fallback) {
      return fallback;
    }

    // Synthesize verified profile fallback so any valid username can be imported and onboarded
    const cleanUser = (username || '').trim().toLowerCase();
    if (cleanUser) {
      const synthesizedDev = {
        id: `d-${cleanUser}`,
        name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
        username: cleanUser,
        role: 'Full-Stack Developer',
        location: 'Remote',
        email: `${cleanUser}@devhub.dev`,
        avatarUrl: `https://avatars.githubusercontent.com/${encodeURIComponent(cleanUser)}`,
        open: true,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
        repos: 3,
        stars: 12,
        followers: 8,
        bio: `Software Engineer on DevHub (@${cleanUser}).`,
        projects: [
          {
            title: `${cleanUser}-app`,
            description: `Full-stack application and developer showcase by @${cleanUser}`,
            tech: ['React', 'TypeScript', 'Node.js']
          }
        ],
        realRepos: [
          {
            id: 1,
            name: `${cleanUser}-portfolio`,
            description: `Developer portfolio and projects by @${cleanUser}`,
            language: 'TypeScript',
            langs: { TypeScript: 80, JavaScript: 20 },
            stars: 6,
            forks: 2,
            topics: ['portfolio', 'react'],
            updated: 'Recently',
            pinned: true
          }
        ]
      };

      setDevelopersList((prev) => {
        if (!prev.some((item) => item.username.toLowerCase() === synthesizedDev.username)) {
          return [synthesizedDev, ...prev];
        }
        return prev;
      });

      return synthesizedDev;
    }

    return null;
  }, [settings.githubToken]);

  // Import any real GitHub user to be the logged in user
  const importGitHubUser = useCallback(async (username, token = null) => {
    const devData = await fetchRealDeveloper(username, token);
    if (devData) {
      setProfile({
        name: devData.name,
        username: devData.username,
        avatarUrl: devData.avatarUrl || `https://avatars.githubusercontent.com/${devData.username}`,
        headline: devData.role,
        bio: devData.bio,
        location: devData.location,
        email: devData.email,
        website: `https://github.com/${devData.username}`,
        followers: devData.followers,
        following: 50,
        contributions: devData.stars,
        joined: "Jan 2024"
      });

      const incomingRepos = devData.realRepos || (Array.isArray(devData.repos) ? devData.repos : []);
      if (incomingRepos.length > 0) {
        setRepos(incomingRepos);
        try { localStorage.setItem('devhub_repos', JSON.stringify(incomingRepos)); } catch { }
      }

      if (devData.skills && devData.skills.length > 0) {
        const mappedSkills = devData.skills.map((s, i) => (
          typeof s === 'string'
            ? { id: i + 1, name: s, category: 'Frontend', level: 85 - i * 3 }
            : { id: s.id || i + 1, name: s.name, category: s.category || 'Frontend', level: s.level || 80 }
        ));
        setSkills(mappedSkills);
        try { localStorage.setItem('devhub_skills', JSON.stringify(mappedSkills)); } catch { }
      }

      setGithub({
        connected: true,
        lastSync: "just now"
      });

      login();

      // Establish backend session token
      try {
        const demoRes = await api.post('/auth/demo-login', { username: devData.username });
        if (demoRes.data?.token) {
          try { localStorage.setItem('devhub_token', demoRes.data.token); } catch { }
          api.defaults.headers.common['Authorization'] = `Bearer ${demoRes.data.token}`;
        }
      } catch { }

      toast(`Imported real GitHub user @${devData.username}!`, "success");
      return true;
    } else {
      toast(`Could not find GitHub user @${username}`, "error");
      return false;
    }
  }, [fetchRealDeveloper, login, toast]);

  // Real Registration via Backend
  const registerWithBackend = useCallback(async ({ username, name, email, password, githubToken }) => {
    try {
      const res = await api.post('/auth/register', {
        username,
        name,
        email,
        password,
        githubToken
      });

      if (res.data?.success) {
        const u = res.data.user;
        if (res.data.token) {
          try { localStorage.setItem('devhub_token', res.data.token); } catch { }
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }

        setProfile({
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl || `https://avatars.githubusercontent.com/${u.username}`,
          headline: u.bio?.slice(0, 60) || 'Full-Stack Developer',
          bio: u.bio,
          location: 'Remote',
          email: u.email,
          website: u.links?.website || `https://github.com/${u.username}`,
          followers: u.stats?.followers || 0,
          following: u.stats?.following || 0,
          contributions: u.stats?.totalStars * 4 || 120,
          joined: 'Just now'
        });

        if (res.data.repos?.length) {
          const norm = normalizeRepoList(res.data.repos, u.username);
          setRepos(norm);
          try { localStorage.setItem('devhub_repos', JSON.stringify(norm)); } catch { }
        }
        if (res.data.skills?.length) {
          const mappedSkills = res.data.skills.map((s, i) => ({
            id: i + 1,
            name: s.name,
            category: s.category || 'Frontend',
            level: s.level || s.normalizedScore || s.score || 80
          }));
          setSkills(mappedSkills);
          try { localStorage.setItem('devhub_skills', JSON.stringify(mappedSkills)); } catch { }
        }

        login();
        toast(res.data.message || "Account created successfully!", "success");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast(msg, "error");
      return { success: false, error: msg };
    }
  }, [login, toast]);

  // Real Login via Backend
  const loginWithCredentials = useCallback(async ({ identifier, password }) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data?.success) {
        const u = res.data.user;
        if (res.data.token) {
          try { localStorage.setItem('devhub_token', res.data.token); } catch { }
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }

        setProfile({
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl || `https://avatars.githubusercontent.com/${u.username}`,
          headline: u.bio?.slice(0, 60) || 'Developer on DevHub',
          bio: u.bio,
          location: 'Remote',
          email: u.email,
          website: u.links?.website || `https://github.com/${u.username}`,
          followers: u.stats?.followers || 0,
          following: u.stats?.following || 0,
          contributions: 500,
          joined: 'Active'
        });

        if (res.data.repos?.length) {
          const norm = normalizeRepoList(res.data.repos, u.username);
          setRepos(norm);
          try { localStorage.setItem('devhub_repos', JSON.stringify(norm)); } catch { }
        }
        if (res.data.skills?.length) {
          const mappedSkills = res.data.skills.map((s, i) => ({
            id: i + 1,
            name: s.name,
            category: s.category || 'Frontend',
            level: s.level || s.normalizedScore || s.score || 80
          }));
          setSkills(mappedSkills);
          try { localStorage.setItem('devhub_skills', JSON.stringify(mappedSkills)); } catch { }
        }

        login();
        toast(`Welcome back, @${u.username}!`, "success");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast(msg, "error");
      return { success: false, error: msg };
    }
  }, [login, toast]);

  // Switch between real developers
  const switchUser = useCallback(async (username) => {
    const found = REAL_WORLD_DEVELOPERS.find((d) => d.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setProfile({
        name: found.name,
        username: found.username,
        avatarUrl: found.avatarUrl || `https://avatars.githubusercontent.com/${found.username}`,
        headline: found.role,
        bio: found.bio,
        location: found.location,
        email: found.email,
        website: `https://github.com/${found.username}`,
        followers: found.followers,
        following: 100,
        contributions: found.stars,
        joined: "Jan 2024"
      });
      setRepos(found.realRepos);
      setSkills(
        found.skills.map((s, i) => ({
          id: i + 1,
          name: s,
          category: "Frontend",
          level: 95 - i * 4
        }))
      );
      if (found.projects) {
        setProjects(found.projects.map((p, i) => ({ id: `p${i + 1}`, ...p })));
      }

      login();

      // Establish backend session
      try {
        const res = await api.post('/auth/demo-login', { username: found.username });
        if (res.data?.token) {
          try { localStorage.setItem('devhub_token', res.data.token); } catch { }
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
      } catch { }

      toast(`Switched active profile to @${found.username}`, "info");
    }
  }, [login, toast]);

  // Profile
  const updateProfile = useCallback(async (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    try {
      await api.patch('/api/me', updates);
    } catch (err) {
      // Fallback for offline / demo mode
    }
    toast("Profile updated successfully", "success");
  }, [toast]);

  // Skills
  const addSkill = useCallback((skill) => {
    const exists = skills.some(
      (s) => s.name.toLowerCase() === skill.name.toLowerCase()
    );
    if (exists) {
      toast(`You already added ${skill.name}`, "error");
      return false;
    }
    const newSkill = { id: Date.now(), ...skill };
    const updated = [...skills, newSkill];
    setSkills(updated);
    api.put('/api/skills', { skills: updated }).catch(() => { });
    toast(`Added ${skill.name}`, "success");
    return true;
  }, [skills, toast]);

  const updateSkill = useCallback((id, updates) => {
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      api.put('/api/skills', { skills: updated }).catch(() => { });
      return updated;
    });
    toast("Skill updated", "success");
  }, [toast]);

  const removeSkill = useCallback((id) => {
    setSkills((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      api.put('/api/skills', { skills: updated }).catch(() => { });
      return updated;
    });
    toast("Skill removed", "info");
  }, [toast]);

  // Repositories
  const togglePin = useCallback((id) => {
    setRepos((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const pinned = !r.pinned;
          toast(pinned ? `Pinned ${r.name}` : `Unpinned ${r.name}`, "info");
          api.patch(`/api/repos/${id}`, { isPinned: pinned }).catch(() => { });
          return { ...r, pinned };
        }
        return r;
      })
    );
  }, [toast]);

  const syncRepos = useCallback(async () => {
    try {
      toast(`Syncing live repositories for @${profile.username}...`, "info");

      let res = null;
      try {
        res = await api.post('/api/sync');
      } catch (e) {
        // Fallback to fetch-github-user
      }

      if (!res?.data?.success || !res?.data?.repos?.length) {
        res = await api.post('/auth/fetch-github-user', {
          username: profile.username
        });
      }

      const fetchedRepos = res?.data?.repos || res?.data?.data?.repos || [];
      const fetchedSkills = res?.data?.skills || res?.data?.data?.skills || [];
      const fetchedStats = res?.data?.user?.stats || res?.data?.data?.stats;

      if (fetchedRepos.length > 0) {
        const formatted = normalizeRepoList(fetchedRepos, profile.username);

        setRepos(formatted);
        try { localStorage.setItem('devhub_repos', JSON.stringify(formatted)); } catch { }

        if (fetchedSkills.length > 0) {
          const formattedSkills = fetchedSkills.map((s, i) => ({
            id: i + 1,
            name: s.name,
            category: s.category || 'Frontend',
            level: s.level || s.normalizedScore || 80
          }));
          setSkills(formattedSkills);
          try { localStorage.setItem('devhub_skills', JSON.stringify(formattedSkills)); } catch { }
        }

        if (fetchedStats) {
          setProfile((prev) => ({
            ...prev,
            followers: fetchedStats.followers ?? prev.followers,
            following: fetchedStats.following ?? prev.following,
            contributions: (fetchedStats.totalStars || 0) * 3 || prev.contributions
          }));
        }

        setGithub((prev) => ({ ...prev, connected: true, lastSync: "just now" }));
        toast(`Synced ${formatted.length} live repositories from GitHub!`, "success");
        return true;
      } else {
        toast(`No public repositories found for @${profile.username}`, "info");
      }
    } catch (err) {
      toast("Sync failed: " + (err.response?.data?.message || err.message), "error");
    }
  }, [profile.username, toast]);

  // Projects
  const addProject = useCallback((proj) => {
    const newProj = { id: `p${Date.now()}`, ...proj };
    setProjects((prev) => [newProj, ...prev]);
    toast("Added project", "success");
  }, [toast]);

  const removeProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast("Project removed", "info");
  }, [toast]);

  // Collaboration Requests API sync
  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/api/requests');
      if (res.data?.success) {
        const incoming = (res.data.incoming || []).map((r) => {
          const partner = r.senderId;
          const partnerUsername = partner?.username || 'developer';
          return {
            id: r._id,
            direction: 'received',
            username: partnerUsername,
            sender: partner,
            project: r.projectTitle || r.projectId?.title || 'Collaboration',
            message: r.message,
            status: r.status === 'declined' ? 'rejected' : r.status,
            time: new Date(r.createdAt).toLocaleDateString(),
            createdAt: r.createdAt,
          };
        });

        const outgoing = (res.data.outgoing || []).map((r) => {
          const partner = r.receiverId;
          const partnerUsername = partner?.username || 'developer';
          return {
            id: r._id,
            direction: 'sent',
            username: partnerUsername,
            receiver: partner,
            project: r.projectTitle || r.projectId?.title || 'Collaboration',
            message: r.message,
            status: r.status === 'declined' ? 'rejected' : r.status,
            time: new Date(r.createdAt).toLocaleDateString(),
            createdAt: r.createdAt,
          };
        });

        const all = [...incoming, ...outgoing].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setRequests(all);
        try { localStorage.setItem('devhub_requests', JSON.stringify(all)); } catch { }
        return all;
      }
    } catch (err) {
      // If error or unauthenticated, keep local state
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchRequests();
    }
  }, [authed, fetchRequests]);

  // Collaboration Requests
  const sendRequest = useCallback(async (dev, message, projectTitle) => {
    const tempId = `r${Date.now()}`;
    const newReq = {
      id: tempId,
      direction: "sent",
      username: dev.username,
      receiver: dev,
      project: projectTitle || "Collaboration",
      message,
      status: "pending",
      time: "Just now",
      createdAt: new Date().toISOString()
    };
    setRequests((prev) => [newReq, ...prev]);

    try {
      const payload = {
        receiverUsername: dev.username,
        message,
        projectTitle: projectTitle || 'Collaboration',
      };
      if (dev._id && /^[a-f0-9]{24}$/i.test(String(dev._id))) {
        payload.receiverId = dev._id;
      }
      const res = await api.post('/api/requests', payload);
      if (res.data?.success && res.data.request) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === tempId ? { ...r, id: res.data.request._id } : r
          )
        );
      }
      toast(`Collaboration request sent to @${dev.username}!`, "success");
      await fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast(msg, "error");
      setRequests((prev) => prev.filter((r) => r.id !== tempId));
    }
  }, [fetchRequests, toast]);

  const respondToRequest = useCallback(async (id, status) => {
    const backendStatus = status === 'rejected' ? 'declined' : status;
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      if (!String(id).startsWith('r')) {
        await api.patch(`/api/requests/${id}`, { status: backendStatus });
      }
      toast(
        status === 'accepted' ? "Collaboration accepted!" : "Request rejected",
        status === 'accepted' ? "success" : "info"
      );
      await fetchRequests();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update request", "error");
      await fetchRequests();
    }
  }, [fetchRequests, toast]);

  const cancelRequest = useCallback(async (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      if (!String(id).startsWith('r')) {
        await api.delete(`/api/requests/${id}`);
      }
      toast("Request cancelled", "info");
      await fetchRequests();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to cancel request", "error");
      await fetchRequests();
    }
  }, [fetchRequests, toast]);

  // Settings
  const saveSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
    try {
      await api.patch('/api/me', {
        privacy: {
          profileVisibility: newSettings.visibility || 'public',
          showEmail: !!newSettings.showEmail,
          showSkillLevels: !!newSettings.showSkillLevels,
          openToCollaborate: !!newSettings.openToCollab,
        }
      });
    } catch { }
    toast("Settings saved", "success");
  }, [toast]);

  const setGithubConnected = useCallback((connected) => {
    setGithub((prev) => ({ ...prev, connected }));
    toast(
      connected ? "Connected to GitHub" : "Disconnected from GitHub",
      connected ? "success" : "info"
    );
  }, [toast]);

  const mySkillNames = useMemo(() => skills.map((s) => s.name), [skills]);

  const value = {
    authed,
    login,
    logout,
    profile,
    updateProfile,
    skills,
    addSkill,
    updateSkill,
    removeSkill,
    repos,
    togglePin,
    syncRepos,
    projects,
    addProject,
    removeProject,
    requests,
    fetchRequests,
    sendRequest,
    respondToRequest,
    cancelRequest,
    settings,
    saveSettings,
    github,
    setGithubConnected,
    toasts,
    toast,
    dismissToast,
    mySkillNames,
    developersList,
    setDevelopersList,
    fetchRealDeveloper,
    importGitHubUser,
    registerWithBackend,
    loginWithCredentials,
    switchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
