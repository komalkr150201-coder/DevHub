import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Repo } from './models/Repo.js';
import { Skill } from './models/Skill.js';
import { Project } from './models/Project.js';
import { Request } from './models/Request.js';
import { Portfolio } from './models/Portfolio.js';
import { encryptToken } from './config/github.js';
import { connectDB, closeDB } from './config/db.js';
import { REAL_WORLD_DEVELOPERS } from './services/githubService.js';

export const seedDatabase = async () => {
  try {
    console.log('🧹 Clearing old DevHub seed data...');
    await User.deleteMany({});
    await Repo.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Request.deleteMany({});
    await Portfolio.deleteMany({});

    // 1. Asha (Matches Section 11.3 worked example: React, Node.js, MongoDB, TypeScript)
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

    await Repo.create({
      userId: asha._id,
      githubRepoId: 501,
      name: 'mern-collab-platform',
      description: 'Real-time collaboration workspace with React, Node, Express, and MongoDB.',
      url: 'https://github.com/asha/mern-collab-platform',
      languages: [
        { name: 'JavaScript', bytes: 140000 },
        { name: 'TypeScript', bytes: 90000 },
        { name: 'CSS', bytes: 20000 },
      ],
      topics: ['mern', 'react', 'mongodb', 'socketio'],
      frameworks: ['React', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      stars: 120,
      forks: 34,
      pinned: true,
      pushedAt: new Date(),
    });

    await Skill.create({
      userId: asha._id,
      skills: [
        { name: 'React', weight: 0.88, source: 'auto' },
        { name: 'Node.js', weight: 0.85, source: 'auto' },
        { name: 'MongoDB', weight: 0.80, source: 'auto' },
        { name: 'TypeScript', weight: 0.82, source: 'auto' },
        { name: 'Express.js', weight: 0.84, source: 'auto' },
      ],
    });

    // 2. Ravi (Frontend Specialist - matches Section 11.3: missing MongoDB!)
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

    await Repo.create({
      userId: ravi._id,
      githubRepoId: 502,
      name: 'react-design-system',
      description: 'Modern component design system for high-scale enterprise frontends.',
      url: 'https://github.com/ravi/react-design-system',
      languages: [
        { name: 'TypeScript', bytes: 210000 },
        { name: 'CSS', bytes: 45000 },
      ],
      topics: ['react', 'design-system', 'storybook', 'tailwind'],
      frameworks: ['React', 'Tailwind CSS'],
      stars: 140,
      forks: 28,
      pinned: true,
      pushedAt: new Date(),
    });

    await Skill.create({
      userId: ravi._id,
      skills: [
        { name: 'React', weight: 0.85, source: 'auto' },
        { name: 'Node.js', weight: 0.70, source: 'auto' },
        { name: 'Tailwind CSS', weight: 0.90, source: 'auto' },
        { name: 'TypeScript', weight: 0.80, source: 'auto' },
        { name: 'Git', weight: 0.75, source: 'auto' },
      ],
    });

    // 3. Project for Section 11.3 Worked Example
    await Project.create({
      ownerId: asha._id,
      title: 'Real-Time Developer Portfolio Hub',
      description: 'Looking for a skilled frontend and backend teammate to build a collaborative developer networking platform.',
      requiredSkills: [
        { name: 'React', importance: 5 },
        { name: 'Node.js', importance: 4 },
        { name: 'MongoDB', importance: 4 },
      ],
      niceToHave: ['TypeScript', 'Tailwind CSS', 'Docker'],
      status: 'open',
    });

    // 4. Seed Verified Real-World Developers
    console.log('🌱 Seeding real-world developers (Dan Abramov, Sindre Sorhus, Shadcn, Guillermo Rauch, etc.)...');

    for (const dev of REAL_WORLD_DEVELOPERS) {
      const user = await User.create({
        githubId: dev.githubId,
        username: dev.username,
        name: dev.name,
        email: dev.email,
        avatarUrl: dev.avatarUrl,
        bio: dev.bio,
        accessToken: encryptToken(`token_${dev.username}`),
        links: dev.links,
        availability: ['hackathon', 'open-source', 'freelance'],
        stats: {
          totalRepos: dev.stats.totalRepos,
          totalStars: dev.stats.totalStars,
          totalForks: dev.stats.totalForks,
          followers: dev.stats.followers,
          following: dev.stats.following,
          contributionStreak: 28,
          recentCommits: 94,
        },
        privacy: {
          isPublic: true,
          showPrivateRepos: false,
          showEmail: dev.open,
        },
        theme: 'dark',
        lastSyncedAt: new Date(),
      });

      // Seed repos
      for (const r of dev.repos) {
        await Repo.create({
          userId: user._id,
          githubRepoId: r.id,
          name: r.name,
          description: r.description,
          url: `https://github.com/${dev.username}/${r.name}`,
          languages: Object.entries(r.langs || {}).map(([name, bytes]) => ({ name, bytes })),
          topics: r.topics || [],
          stars: r.stars,
          forks: r.forks,
          pinned: r.pinned || false,
          pushedAt: new Date(),
        });
      }

      // Seed skills
      await Skill.create({
        userId: user._id,
        skills: dev.skills.map((s) => ({
          name: s.name,
          weight: (s.level || 75) / 100,
          source: 'auto',
        })),
      });

      // Seed projects
      for (const p of dev.projects || []) {
        await Project.create({
          ownerId: user._id,
          title: p.title,
          description: p.description,
          requiredSkills: (p.tech || ['JavaScript']).map((t) => ({ name: t, importance: 3 })),
          status: 'open',
        });
      }
    }

    console.log(`✅ DevHub database seeded successfully with Asha, Ravi, and ${REAL_WORLD_DEVELOPERS.length} verified real-world developers.`);
  } catch (err) {
    console.error('❌ Database seeding error:', err);
    throw err;
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('Seeding completed.');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
