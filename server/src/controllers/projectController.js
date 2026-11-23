import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { rankCandidates, normalizeSkillName } from '../services/matcher.js';

/**
 * GET /api/projects
 * List all projects or filter by status/user
 */
export const getProjects = async (req, res) => {
  try {
    const { status, myProjects } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (myProjects && req.user) filter.ownerId = req.user._id;

    const projects = await Project.find(filter)
      .populate('ownerId', 'username name avatarUrl bio stats')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/projects
 * Create a new team requirement / project post
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, niceToHave } = req.body;

    if (!title || !description || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and at least one required skill are required',
      });
    }

    const sanitizedRequired = requiredSkills.map((s) => ({
      name: normalizeSkillName(s.name),
      importance: Math.min(5, Math.max(1, Number(s.importance) || 3)),
    }));

    const sanitizedNiceToHave = (niceToHave || []).map((s) => normalizeSkillName(s));

    const project = new Project({
      ownerId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      requiredSkills: sanitizedRequired,
      niceToHave: sanitizedNiceToHave,
      status: 'open',
    });

    await project.save();
    await project.populate('ownerId', 'username name avatarUrl bio');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/projects/:id
 * Get single project details
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'ownerId',
      'username name avatarUrl bio links stats'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      project,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/projects/:id/matches
 * Rank developers for a specific project's skill requirements
 */
export const getProjectMatches = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const requiredNames = project.requiredSkills.map((r) => normalizeSkillName(r.name));
    const regexList = requiredNames.map((name) => new RegExp(`^${name}$`, 'i'));

    // Candidate lookup using multikey index
    const matchingSkillDocs = await Skill.find({
      'skills.name': { $in: regexList },
    }).populate({
      path: 'userId',
      match: {
        'privacy.isPublic': true,
        _id: { $ne: project.ownerId }, // Exclude project owner
      },
      select: 'username name avatarUrl bio availability stats links createdAt',
    });

    const candidates = [];
    for (const doc of matchingSkillDocs) {
      if (!doc.userId) continue;
      candidates.push({
        user: doc.userId,
        skills: doc.skills,
      });
    }

    const ranked = rankCandidates(candidates, project.requiredSkills, project.niceToHave, 20);

    const matches = ranked.map((item) => ({
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
      project,
      matches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/projects/:id
 * Update project
 */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    const { title, description, status, requiredSkills, niceToHave } = req.body;
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (status) project.status = status;
    if (requiredSkills) {
      project.requiredSkills = requiredSkills.map((s) => ({
        name: normalizeSkillName(s.name),
        importance: Math.min(5, Math.max(1, Number(s.importance) || 3)),
      }));
    }
    if (niceToHave) {
      project.niceToHave = niceToHave.map((s) => normalizeSkillName(s));
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project updated',
      project,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete project
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
