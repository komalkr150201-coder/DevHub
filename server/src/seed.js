import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Repo } from './models/Repo.js';
import { Skill } from './models/Skill.js';
import { Project } from './models/Project.js';
import { Request } from './models/Request.js';
import { encryptToken } from './config/github.js';
import { connectDB, closeDB } from './config/db.js';

export const seedDatabase = async () => {
  try {
    console.log('🧹 Clearing old DevHub seed data...');
    await User.deleteMany({});
    await Repo.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Request.deleteMany({});

    // 1. Create Asha (Full-Stack MERN & TypeScript Specialist - matches Section 11.3!)
    const asha = await User.create({
      githubId: 1001,
      username: 'asha',
      name: 'Asha Sharma',
      email: 'asha.sharma@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Full-stack MERN & TypeScript engineer. Building developer productivity tools and scalable real-time web applications.',
      accessToken: encryptToken('demo_token_asha'),
      links: {
        github: 'https://github.com/asha',
        linkedin: 'https://linkedin.com/in/ashasharma',
        website: 'https://asha.dev',
      },
      availability: ['hackathon', 'open-source', 'freelance'],
      stats: {
        totalRepos: 14,
        totalStars: 320,
        totalForks: 64,
        followers: 142,
        following: 58,
        contributionStreak: 21,
        recentCommits: 84,
      },
      privacy: {
        isPublic: true,
        showPrivateRepos: false,
        showEmail: true,
      },
      theme: 'dark',
      lastSyncedAt: new Date(),
    });

    // 2. Create Ravi (Frontend Specialist - matches Section 11.3: missing MongoDB!)
    const ravi = await User.create({
      githubId: 1002,
      username: 'ravi',
      name: 'Ravi Patel',
      email: 'ravi.patel@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Frontend architecture enthusiast. Obsessed with React performance, Tailwind CSS design systems, and delightful UX.',
      accessToken: encryptToken('demo_token_ravi'),
      links: {
        github: 'https://github.com/ravi',
        linkedin: 'https://linkedin.com/in/ravipatel',
        website: 'https://ravi.design',
      },
      availability: ['hackathon', 'full-time'],
      stats: {
        totalRepos: 9,
        totalStars: 195,
        totalForks: 42,
        followers: 98,
        following: 34,
        contributionStreak: 12,
        recentCommits: 52,
      },
      privacy: {
        isPublic: true,
        showPrivateRepos: false,
        showEmail: false,
      },
      theme: 'dark',
      lastSyncedAt: new Date(),
    });

    // 3. Create Elena (AI/ML & Python Specialist)
    const elena = await User.create({
      githubId: 1003,
      username: 'elena',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Machine Learning Researcher & Backend Engineer. Working on LLM evaluation pipelines, PyTorch, and FastAPI microservices.',
      accessToken: encryptToken('demo_token_elena'),
      links: {
        github: 'https://github.com/elena',
        linkedin: 'https://linkedin.com/in/elenarostova',
        website: 'https://elena-ai.io',
      },
      availability: ['hackathon', 'open-source'],
      stats: {
        totalRepos: 11,
        totalStars: 410,
        totalForks: 95,
        followers: 220,
        following: 64,
        contributionStreak: 28,
        recentCommits: 96,
      },
      privacy: {
        isPublic: true,
        showPrivateRepos: false,
        showEmail: true,
      },
      theme: 'dark',
      lastSyncedAt: new Date(),
    });

    // 4. Create Carlos (DevOps & Cloud Systems Architect)
    const carlos = await User.create({
      githubId: 1004,
      username: 'carlos',
      name: 'Carlos Mendoza',
      email: 'carlos.m@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Cloud Native Architect. Kubernetes, Docker, Go, Terraform, and CI/CD automation pipelines.',
      accessToken: encryptToken('demo_token_carlos'),
      links: {
        github: 'https://github.com/carlos',
        linkedin: 'https://linkedin.com/in/carlosmendoza',
      },
      availability: ['freelance', 'open-source'],
      stats: {
        totalRepos: 16,
        totalStars: 280,
        totalForks: 78,
        followers: 115,
        following: 49,
        contributionStreak: 18,
        recentCommits: 60,
      },
      privacy: {
        isPublic: true,
        showPrivateRepos: false,
        showEmail: true,
      },
      theme: 'dark',
      lastSyncedAt: new Date(),
    });

    // ----------------------------------------------------
    // Create Repositories for Asha
    // ----------------------------------------------------
    await Repo.create([
      {
        userId: asha._id,
        githubRepoId: 501,
        name: 'devhub-core',
        description: 'Developer portfolio & collaboration network built with React, Node.js, and MongoDB.',
        url: 'https://github.com/asha/devhub-core',
        languages: [
          { name: 'JavaScript', bytes: 140000 },
          { name: 'TypeScript', bytes: 85000 },
          { name: 'CSS', bytes: 25000 },
        ],
        topics: ['react', 'nodejs', 'mongodb', 'developer-tools'],
        frameworks: ['React', 'Express.js', 'MongoDB', 'Tailwind CSS'],
        stars: 184,
        forks: 36,
        pushedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isPinned: true,
      },
      {
        userId: asha._id,
        githubRepoId: 502,
        name: 'pulse-realtime-chat',
        description: 'High-throughput collaborative workspace with WebSockets and MongoDB change streams.',
        url: 'https://github.com/asha/pulse-realtime-chat',
        languages: [
          { name: 'TypeScript', bytes: 90000 },
          { name: 'JavaScript', bytes: 40000 },
        ],
        topics: ['websockets', 'nodejs', 'react', 'mongodb'],
        frameworks: ['Node.js', 'React', 'MongoDB', 'Express.js'],
        stars: 92,
        forks: 18,
        pushedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
      {
        userId: asha._id,
        githubRepoId: 503,
        name: 'ui-primitives',
        description: 'Accessible and composable Tailwind CSS component library.',
        url: 'https://github.com/asha/ui-primitives',
        languages: [
          { name: 'TypeScript', bytes: 60000 },
          { name: 'CSS', bytes: 30000 },
        ],
        topics: ['tailwind', 'react', 'design-system'],
        frameworks: ['React', 'Tailwind CSS'],
        stars: 44,
        forks: 10,
        pushedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        isPinned: false,
      },
    ]);

    // ----------------------------------------------------
    // Create Repositories for Ravi (No MongoDB!)
    // ----------------------------------------------------
    await Repo.create([
      {
        userId: ravi._id,
        githubRepoId: 504,
        name: 'canvas-flow-editor',
        description: 'Interactive node-based graph editor in React and Canvas API.',
        url: 'https://github.com/ravi/canvas-flow-editor',
        languages: [
          { name: 'TypeScript', bytes: 160000 },
          { name: 'JavaScript', bytes: 40000 },
          { name: 'CSS', bytes: 30000 },
        ],
        topics: ['react', 'canvas', 'ui', 'frontend'],
        frameworks: ['React', 'Tailwind CSS'],
        stars: 128,
        forks: 24,
        pushedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
      {
        userId: ravi._id,
        githubRepoId: 505,
        name: 'micro-node-bff',
        description: 'Lightweight Backend-for-Frontend API in Node.js for client rendering.',
        url: 'https://github.com/ravi/micro-node-bff',
        languages: [{ name: 'JavaScript', bytes: 75000 }],
        topics: ['nodejs', 'express', 'bff'],
        frameworks: ['Node.js', 'Express.js'],
        stars: 67,
        forks: 18,
        pushedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
    ]);

    // ----------------------------------------------------
    // Create Repositories for Elena (AI/ML Python)
    // ----------------------------------------------------
    await Repo.create([
      {
        userId: elena._id,
        githubRepoId: 506,
        name: 'neural-rag-bench',
        description: 'Benchmarking retrieval-augmented generation models with PyTorch and FastAPI.',
        url: 'https://github.com/elena/neural-rag-bench',
        languages: [{ name: 'Python', bytes: 190000 }],
        topics: ['machine-learning', 'pytorch', 'fastapi', 'llm'],
        frameworks: ['PyTorch', 'FastAPI', 'Docker'],
        stars: 285,
        forks: 64,
        pushedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
      {
        userId: elena._id,
        githubRepoId: 507,
        name: 'embeddings-service',
        description: 'Scalable vector indexing pipeline with Python and PostgreSQL.',
        url: 'https://github.com/elena/embeddings-service',
        languages: [
          { name: 'Python', bytes: 110000 },
          { name: 'SQL', bytes: 20000 },
        ],
        topics: ['embeddings', 'python', 'postgresql'],
        frameworks: ['FastAPI', 'PostgreSQL'],
        stars: 125,
        forks: 31,
        pushedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
    ]);

    // ----------------------------------------------------
    // Create Repositories for Carlos (DevOps Go)
    // ----------------------------------------------------
    await Repo.create([
      {
        userId: carlos._id,
        githubRepoId: 508,
        name: 'k8s-autoscaler-operator',
        description: 'Kubernetes custom controller in Go for dynamic cluster scaling.',
        url: 'https://github.com/carlos/k8s-autoscaler-operator',
        languages: [{ name: 'Go', bytes: 180000 }],
        topics: ['kubernetes', 'docker', 'golang', 'devops'],
        frameworks: ['Docker', 'Kubernetes'],
        stars: 198,
        forks: 52,
        pushedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
      {
        userId: carlos._id,
        githubRepoId: 509,
        name: 'devops-infra-bootstrap',
        description: 'Terraform and Docker automation blueprints for cloud deployment.',
        url: 'https://github.com/carlos/devops-infra-bootstrap',
        languages: [
          { name: 'HCL', bytes: 60000 },
          { name: 'Shell', bytes: 40000 },
        ],
        topics: ['docker', 'terraform', 'aws', 'ci-cd'],
        frameworks: ['Docker', 'AWS'],
        stars: 82,
        forks: 26,
        pushedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isPinned: true,
      },
    ]);

    // ----------------------------------------------------
    // Create Verified Skills (Exact weights from Section 11.3)
    // ----------------------------------------------------
    // Asha: React 0.95, Node.js 0.80, MongoDB 0.75, TypeScript 0.70
    await Skill.create({
      userId: asha._id,
      skills: [
        { name: 'React', weight: 0.95, source: 'auto' },
        { name: 'Node.js', weight: 0.80, source: 'auto' },
        { name: 'MongoDB', weight: 0.75, source: 'auto' },
        { name: 'TypeScript', weight: 0.70, source: 'auto' },
        { name: 'Express.js', weight: 0.68, source: 'auto' },
        { name: 'Tailwind CSS', weight: 0.62, source: 'auto' },
      ],
      updatedAt: new Date(),
    });

    // Ravi: React 0.90, Node.js 0.70, TypeScript 0.80, Tailwind CSS 0.75 (0 MongoDB!)
    await Skill.create({
      userId: ravi._id,
      skills: [
        { name: 'React', weight: 0.90, source: 'auto' },
        { name: 'TypeScript', weight: 0.80, source: 'auto' },
        { name: 'Tailwind CSS', weight: 0.75, source: 'auto' },
        { name: 'Node.js', weight: 0.70, source: 'auto' },
        { name: 'Express.js', weight: 0.55, source: 'auto' },
      ],
      updatedAt: new Date(),
    });

    // Elena: Python 0.98, PyTorch 0.92, FastAPI 0.84, Docker 0.65, PostgreSQL 0.60
    await Skill.create({
      userId: elena._id,
      skills: [
        { name: 'Python', weight: 0.98, source: 'auto' },
        { name: 'PyTorch', weight: 0.92, source: 'auto' },
        { name: 'FastAPI', weight: 0.84, source: 'auto' },
        { name: 'Docker', weight: 0.65, source: 'auto' },
        { name: 'PostgreSQL', weight: 0.60, source: 'auto' },
      ],
      updatedAt: new Date(),
    });

    // Carlos: Go 0.95, Docker 0.90, Kubernetes 0.88, AWS 0.75
    await Skill.create({
      userId: carlos._id,
      skills: [
        { name: 'Go', weight: 0.95, source: 'auto' },
        { name: 'Docker', weight: 0.90, source: 'auto' },
        { name: 'Kubernetes', weight: 0.88, source: 'auto' },
        { name: 'AWS', weight: 0.75, source: 'auto' },
      ],
      updatedAt: new Date(),
    });

    // ----------------------------------------------------
    // Create Sample Projects
    // ----------------------------------------------------
    const project1 = await Project.create({
      ownerId: asha._id,
      title: 'Hackathon 2026: AI Code Collaboration Agent',
      description: 'Building an automated agent that analyzes GitHub PRs and generates architectural summaries. Need strong Python / AI teammates to integrate the LLM backend.',
      requiredSkills: [
        { name: 'Python', importance: 5 },
        { name: 'FastAPI', importance: 4 },
        { name: 'PyTorch', importance: 3 },
      ],
      niceToHave: ['Docker', 'TypeScript'],
      status: 'open',
    });

    const project2 = await Project.create({
      ownerId: elena._id,
      title: 'DevHub MERN Architecture Sprint',
      description: 'Looking for a senior MERN full-stack engineer to build out real-time portfolio updates and match caching.',
      requiredSkills: [
        { name: 'React', importance: 3 },
        { name: 'Node.js', importance: 2 },
        { name: 'MongoDB', importance: 2 },
      ],
      niceToHave: ['TypeScript'],
      status: 'open',
    });

    // ----------------------------------------------------
    // Create Sample Collaboration Request
    // ----------------------------------------------------
    await Request.create({
      senderId: ravi._id,
      receiverId: asha._id,
      projectId: project1._id,
      message: 'Hey Asha! Loved your devhub-core repo. Would love to partner on the frontend UI & design system for your AI Hackathon project!',
      status: 'pending',
    });

    console.log('✅ DevHub database seeded successfully with Asha, Ravi, Elena, Carlos, projects, and skills.');
  } catch (err) {
    console.error('Error during database seeding:', err);
    throw err;
  }
};

// If run directly: node src/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
