import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Deterministic AI heuristic synthesis fallback used when GEMINI_API_KEY is not configured
 * or when Gemini API call encounters a rate limit / network error.
 */
function heuristicGenerate({ section, evidence, instruction }) {
  const { github = {}, repos = [], knownSkills = [], userProvided = {} } = evidence;
  const username = github.name || github.username || 'Developer';
  const topLangs = [...new Set(repos.flatMap((r) => r.languages || []))].slice(0, 4);
  const langSummary = topLangs.join(', ') || 'Modern Web Technologies';
  const repoCount = repos.length;

  const headline = topLangs.length > 0
    ? `Software Engineer specializing in ${langSummary}`
    : `Full-Stack Developer & Open Source Contributor`;

  const bioParts = [
    `I am ${username}, a software developer focused on building scalable, user-centric applications and modern software architectures.`,
    topLangs.length > 0
      ? `My core technical stack centers around ${langSummary}, with experience designing full-stack systems, clean APIs, and responsive interfaces.`
      : `Experienced in modern software engineering practices, agile collaboration, and developer tools.`,
    repoCount > 0
      ? `Featured repositories include ${repos.slice(0, 3).map((r) => r.name).join(', ')}, demonstrating hands-on expertise in production-grade code.`
      : `Passionate about continuous learning, code quality, and open-source collaboration.`,
  ];
  const bio = bioParts.join(' ');

  const rawSkills = [
    ...new Set([
      ...(userProvided.skills || []),
      ...knownSkills,
      ...topLangs,
    ]),
  ].filter(Boolean).slice(0, 18);
  const skills = rawSkills.length ? rawSkills : ['JavaScript', 'HTML5', 'CSS3', 'Git', 'React', 'Node.js'];

  const projects = repos.map((r) => {
    let desc = r.description || '';
    if (!desc || desc.length < 25) {
      const tech = (r.languages || []).concat(r.topics || []).slice(0, 3).join(', ');
      desc = `Engineered ${r.name} using ${tech || 'modern developer tools'} with focus on performance, clean architecture, and responsive user experience.`;
    }
    return {
      name: r.name,
      description: desc.slice(0, 500),
    };
  });

  return {
    headline,
    bio,
    skills,
    projects,
  };
}

/**
 * Generate portfolio copy and structured project highlights using Gemini API or heuristic fallback.
 */
export async function generateWithGemini({ section = 'all', evidence = {}, instruction = '' }) {
  const fallback = heuristicGenerate({ section, evidence, instruction });

  if (!config.gemini.apiKey) {
    return fallback;
  }

  try {
    const prompt = `You are an elite developer portfolio copywriter.
Analyze the provided developer GitHub evidence and produce a factual, modern, high-impact developer portfolio.
Do not invent fictional degrees, companies, or technologies that are not grounded in the evidence.

Evidence:
${JSON.stringify(evidence, null, 2)}

User Instruction / Tone:
${instruction || 'Professional, modern developer-focused, concise, impactful.'}

Requested Section: ${section}

Respond with ONLY a valid, raw JSON object (no markdown code blocks, no explanation) matching this schema:
{
  "headline": "Punchy professional headline under 100 characters",
  "bio": "Engaging, professional 2-3 paragraph biography under 800 characters summarizing their expertise and technical focus",
  "skills": ["Array", "Of", "Technical", "Skills"],
  "projects": [
    {
      "name": "exact-repo-name-from-evidence",
      "description": "2-3 sentence impactful technical description highlighting purpose, architecture, and technology"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model || 'gemini-2.5-flash'}:generateContent?key=${config.gemini.apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
        },
      },
      { timeout: 15000 }
    );

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      let cleaned = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      const parsed = JSON.parse(cleaned);
      return {
        headline: parsed.headline || fallback.headline,
        bio: parsed.bio || fallback.bio,
        skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : fallback.skills,
        projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : fallback.projects,
      };
    }
    return fallback;
  } catch (err) {
    console.warn('[Gemini AI] Portfolio generation fallback used:', err.message);
    return fallback;
  }
}
