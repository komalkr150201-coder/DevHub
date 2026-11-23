import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    repoId: { type: Number },
    name: { type: String, trim: true, maxlength: 100, default: '' },
    description: { type: String, maxlength: 600, default: '' },
    repoUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    languages: { type: [String], default: [] },
    stars: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: true }
);

const portfolioSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    slug: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    template: { type: String, enum: ['aurora', 'minimal', 'terminal', 'cyberpunk'], default: 'aurora' },
    theme: {
      accent: { type: String, default: '#6366f1' },
      accent2: { type: String, default: '#22d3ee' },
    },
    sections: {
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
    profile: {
      name: { type: String, maxlength: 100, default: '' },
      headline: { type: String, maxlength: 160, default: '' },
      bio: { type: String, maxlength: 1200, default: '' },
      email: { type: String, maxlength: 160, default: '' },
      location: { type: String, maxlength: 100, default: '' },
      avatarUrl: { type: String, default: '' },
      links: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' },
      },
    },
    skills: { type: [String], default: [] },
    projects: { type: [projectSchema], default: [] },
    education: [
      { school: String, degree: String, period: String, details: String },
    ],
    experience: [
      { company: String, role: String, period: String, summary: String },
    ],
    // Evidence the AI was allowed to use; kept for transparency & section regeneration
    generatedFrom: {
      repoIds: { type: [Number], default: [] },
      at: { type: Date },
    },
    versions: [
      {
        at: { type: Date, default: Date.now },
        reason: { type: String, default: 'edit' },
        snapshot: { type: Schema.Types.Mixed },
      },
    ],
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
