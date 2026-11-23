import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { Repo } from '../models/Repo.js';
import { User } from '../models/User.js';
import { Portfolio } from '../models/Portfolio.js';
import { decryptToken } from '../config/github.js';
import { config } from '../config/env.js';

const README_LIMIT = 4000;

const octokitFor = async (userId) => {
  const u = await User.findById(userId).select('+accessToken');
  const token = u?.accessToken ? decryptToken(u.accessToken) : null;
  return new Octokit(token ? { auth: token } : {});
};

/**
 * Fetch profile README from username/username repository or raw GitHub
 */
const fetchProfileReadme = async (octokit, username) => {
  if (!username) return '';
  const clean = username.trim().toLowerCase();

  // Try Octokit API
  try {
    const res = await octokit.repos.getReadme({
      owner: clean,
      repo: clean,
      mediaType: { format: 'raw' },
    });
    if (res?.data) return String(res.data).slice(0, README_LIMIT);
  } catch {}

  // Fallback to raw public GitHub
  const branches = ['main', 'master'];
  for (const branch of branches) {
    try {
      const rawRes = await axios.get(`https://raw.githubusercontent.com/${clean}/${clean}/${branch}/README.md`, {
        timeout: 4000,
      });
      if (rawRes?.data) return String(rawRes.data).slice(0, README_LIMIT);
    } catch {}
  }

  return '';
};

/**
 * Deterministic / heuristic parser for GitHub profile, README, and repos
 */
const heuristicBackgroundExtraction = (user, profileReadme, repos, existingPortfolio) => {
  // If user already had education or experience in their saved portfolio, prioritize it
  if (existingPortfolio?.education?.length > 0 || existingPortfolio?.experience?.length > 0) {
    return {
      education: existingPortfolio.education || [],
      experience: existingPortfolio.experience || [],
      skills: existingPortfolio.skills || [],
      source: 'saved_portfolio',
    };
  }

  const bio = user.bio || '';
  const reposList = Array.isArray(repos) ? repos : [];
  const topLangs = [
    ...new Set(
      reposList.flatMap((r) =>
        (r.languages || []).map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean)
      )
    ),
  ].slice(0, 5);

  const education = [];
  const experience = [];

  // 1. Try parsing Education from profile README
  if (profileReadme) {
    const eduMatch = profileReadme.match(/(?:#+|\*\*)\s*(?:🎓\s*)?(?:Education|Academic|Qualification)[\s\S]*?(?=(?:#+|\*\*|\n\n##|$))/i);
    if (eduMatch) {
      const lines = eduMatch[0].split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().startsWith('•'));
      for (const line of lines.slice(0, 2)) {
        const cleaned = line.replace(/^[-*•]\s*/, '').trim();
        const parts = cleaned.split(/\||–|-|,/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          education.push({
            degree: parts[0] || 'Bachelor of Technology',
            school: parts[1] || 'University Institute of Technology',
            period: parts[2] || '2021 - 2025',
            details: 'Coursework in software engineering, algorithms, and full-stack development.',
          });
        }
      }
    }

    // Try parsing Experience from profile README
    const expMatch = profileReadme.match(/(?:#+|\*\*)\s*(?:💼\s*|💻\s*)?(?:Experience|Work|Career|Employment)[\s\S]*?(?=(?:#+|\*\*|\n\n##|$))/i);
    if (expMatch) {
      const lines = expMatch[0].split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().startsWith('•'));
      for (const line of lines.slice(0, 2)) {
        const cleaned = line.replace(/^[-*•]\s*/, '').trim();
        const parts = cleaned.split(/\||–|-|at\s+/i).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          experience.push({
            role: parts[0] || 'Software Engineer',
            company: parts[1] || 'Technology Solutions',
            period: parts[2] || '2023 - Present',
            summary: 'Engineered web applications and collaborated on modern software architectures.',
          });
        }
      }
    }
  }

  // 2. Synthesize Education if not found
  if (education.length === 0) {
    let degree = 'Bachelor of Technology in Computer Science';
    let school = 'University Institute of Engineering & Technology';
    let period = '2021 - 2025';

    // Check if bio mentions college or student status
    const studentMatch = bio.match(/(?:student|undergrad|pursuing|b\.?tech|b\.?s\.?|m\.?s\.?|cs|computer science)(?:\s+(?:at|in|from)\s+([A-Z][A-Za-z\s]+))?/i);
    if (studentMatch && studentMatch[1]) {
      school = studentMatch[1].trim();
    }

    education.push({
      school,
      degree,
      period,
      details: 'Specialization in software engineering, data structures, and web development.',
    });
  }

  // 3. Synthesize Experience if not found
  if (experience.length === 0) {
    const featuredRepos = reposList.slice(0, 2).map((r) => r.name).join(' & ');
    const langNames = topLangs.join(', ') || 'JavaScript, React, and Node.js';

    experience.push({
      role: 'Full-Stack Developer & Open Source Contributor',
      company: 'GitHub Software Projects',
      period: '2023 - Present',
      summary: `Developed and maintained open-source developer applications (${featuredRepos || 'DevHub ecosystem'}) utilizing ${langNames}. Built responsive frontend UIs and scalable backend APIs.`,
    });

    if (reposList.length >= 3) {
      experience.push({
        role: 'Software Engineering Project Lead',
        company: 'Independent Engineering Initiatives',
        period: '2023 - 2024',
        summary: `Spearheaded architecture design, git branch management, and unit testing for projects like ${reposList[2]?.name || 'web services'}.`,
      });
    }
  }

  return {
    education,
    experience,
    skills: topLangs,
    source: 'github_profile_heuristic',
  };
};

/**
 * Extracts education and experience from GitHub profile and repositories
 * Uses Gemini AI if available; falls back smoothly to heuristic extraction.
 */
export const extractGitHubBackground = async (user, repoIds = []) => {
  if (!user) throw new Error('User is required');

  const octokit = await octokitFor(user._id);
  const profileReadme = await fetchProfileReadme(octokit, user.username);

  // Fetch repos from DB
  let repos = [];
  if (repoIds.length) {
    repos = await Repo.find({ _id: { $in: repoIds }, userId: user._id });
  }
  if (!repos.length) {
    repos = await Repo.find({ userId: user._id }).sort({ isPinned: -1, stars: -1 }).limit(8);
  }

  // Check existing portfolio for user
  const existingPortfolio = await Portfolio.findOne({ owner: user._id }).select('education experience skills');

  const heuristic = heuristicBackgroundExtraction(user, profileReadme, repos, existingPortfolio);

  // If Gemini API Key is not configured, return heuristic result directly
  if (!config.gemini?.apiKey) {
    return heuristic;
  }

  // Use Gemini to intelligently extract and polish education and experience
  try {
    const repoSummary = repos.map((r) => {
      const langs = (r.languages || []).map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean).join(', ');
      return `- ${r.name}: ${r.description || 'Developer project'} (${langs || 'Code'})`;
    }).join('\n');

    const prompt = `You are an elite developer career and resume parsing assistant.
Analyze this developer's GitHub information, profile README, bio, and repositories to extract factual or realistically grounded Education and Experience entries.
Do NOT leave education or experience empty. If specific universities or companies are not mentioned in the README, synthesize realistic, modern, impressive education (e.g. Computer Science degree) and engineering experience (e.g. Full-Stack Developer, Open-Source Contributor) aligned with their GitHub projects and tech stack.

Developer GitHub Info:
- Username: ${user.username}
- Name: ${user.name || user.username}
- Bio: ${user.bio || 'Developer on GitHub'}
- Profile README:
${profileReadme || 'No profile README found'}
- Repositories:
${repoSummary || 'Various web applications'}

Return ONLY a valid JSON object (no markdown, no backticks, no preamble) strictly adhering to this format:
{
  "education": [
    {
      "school": "University or Institute name",
      "degree": "Degree and Major",
      "period": "e.g. 2021 - 2025",
      "details": "1 sentence on relevant coursework or academic focus"
    }
  ],
  "experience": [
    {
      "company": "Company or Open Source Organization",
      "role": "Software Engineer / Full-Stack Developer / etc.",
      "period": "e.g. 2023 - Present",
      "summary": "1-2 impactful sentences detailing technical achievements and tech stack"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model || 'gemini-2.5-flash'}:generateContent?key=${config.gemini.apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
      },
      { timeout: 10000 }
    );

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      let cleaned = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      const parsed = JSON.parse(cleaned);

      return {
        education: Array.isArray(parsed.education) && parsed.education.length ? parsed.education : heuristic.education,
        experience: Array.isArray(parsed.experience) && parsed.experience.length ? parsed.experience : heuristic.experience,
        skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : heuristic.skills,
        source: 'gemini_ai_extracted',
      };
    }

    return heuristic;
  } catch (err) {
    console.warn('[GitHubBackground] Gemini extraction fallback used:', err.message);
    return heuristic;
  }
};
