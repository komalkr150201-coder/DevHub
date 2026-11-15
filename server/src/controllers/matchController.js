import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { rankCandidates, normalizeSkillName, calculateTeamGap } from '../services/matcher.js';

/**
 * POST /api/match
 * Rank developers against a set of required and nice-to-have skills
 */
export const matchDevelopers = async (req, res) => {
  try {
    const { required = [], niceToHave = [], limit = 15, excludeSelf = true } = req.body;

    if (!Array.isArray(required) || required.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one required skill must be provided in required array: [{ name, importance }]',
      });
    }

    // Extract skill names for database pre-filter
    const requiredNames = required.map((r) => normalizeSkillName(r.name));
    const regexList = requiredNames.map((name) => new RegExp(`^${name}$`, 'i'));

    // Step 1: Pre-filter candidates with multikey index on skills.name (Section 11.5)
    const matchingSkillDocs = await Skill.find({
      'skills.name': { $in: regexList },
    }).populate({
      path: 'userId',
      match: { 'privacy.isPublic': true },
      select: 'username name avatarUrl bio availability stats links createdAt',
    });

    // Step 2: Assemble valid candidates (excluding requesting user if requested)
    const currentUserId = req.user?._id?.toString();
    const candidates = [];

    for (const doc of matchingSkillDocs) {
      if (!doc.userId) continue; // User was deleted or is private
      if (excludeSelf && currentUserId && doc.userId._id.toString() === currentUserId) {
        continue;
      }

      candidates.push({
        user: doc.userId,
        skills: doc.skills,
      });
    }

    // Step 3: Run the scoring algorithm (Coverage, Cosine, Bonus, Activity)
    const rankedResults = rankCandidates(candidates, required, niceToHave, limit);

    // Format response matching Section 10 specification
    const results = rankedResults.map((item) => ({
      user: item.user,
      username: item.user.username,
      name: item.user.name,
      avatarUrl: item.user.avatarUrl,
      bio: item.user.bio,
      availability: item.user.availability,
      stats: item.user.stats,
      score: item.score,
      coverage: item.coverage,
      cosine: item.cosine,
      activity: item.activity,
      bonus: item.bonus,
      matched: item.matched,
      missing: item.missing,
      matchedNiceToHave: item.matchedNiceToHave,
      skills: item.skills.slice(0, 8),
    }));

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/search
 * Search developers by keyword, skill query tags, or availability
 */
export const searchDevelopers = async (req, res) => {
  try {
    const { skills, availability, q, page = 1, limit = 12 } = req.query;
    const filter = { 'privacy.isPublic': true };

    if (q) {
      const qRegex = new RegExp(q.trim(), 'i');
      filter.$or = [{ username: qRegex }, { name: qRegex }, { bio: qRegex }];
    }

    if (availability) {
      filter.availability = { $in: availability.split(',').map((s) => s.trim()) };
    }

    const currentUserId = req.user?._id;
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    // If specific skills are provided, filter by skills
    let candidateUserIds = null;
    if (skills) {
      const skillArray = skills.split(',').map((s) => normalizeSkillName(s.trim()));
      const regexList = skillArray.map((name) => new RegExp(`^${name}$`, 'i'));
      const skillDocs = await Skill.find({ 'skills.name': { $in: regexList } }).select('userId');
      candidateUserIds = skillDocs.map((d) => d.userId);
      filter._id = { $in: candidateUserIds, ...(currentUserId ? { $ne: currentUserId } : {}) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('username name avatarUrl bio availability stats links createdAt')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ 'stats.totalStars': -1, createdAt: -1 });

    // Fetch skills for these users
    const userIds = users.map((u) => u._id);
    const skillsMap = new Map();
    const allSkills = await Skill.find({ userId: { $in: userIds } });
    for (const s of allSkills) {
      skillsMap.set(s.userId.toString(), s.skills);
    }

    const results = users.map((user) => ({
      ...user.toObject(),
      skills: skillsMap.get(user._id.toString()) || [],
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
