import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    accessToken: {
      type: String,
      default: '',
      select: false, // Don't expose token by default in API queries
    },
    links: {
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    availability: {
      type: [String],
      enum: ['hackathon', 'open-source', 'freelance', 'full-time'],
      default: ['hackathon', 'open-source'],
    },
    stats: {
      totalRepos: { type: Number, default: 0 },
      totalStars: { type: Number, default: 0 },
      totalForks: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      contributionStreak: { type: Number, default: 0 },
      recentCommits: { type: Number, default: 0 },
    },
    privacy: {
      isPublic: { type: Boolean, default: true },
      showPrivateRepos: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
