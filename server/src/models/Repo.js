import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    githubRepoId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    languages: [
      {
        name: { type: String, required: true },
        bytes: { type: Number, default: 0 },
      },
    ],
    topics: {
      type: [String],
      default: [],
    },
    frameworks: {
      type: [String],
      default: [],
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    pushedAt: {
      type: Date,
      default: Date.now,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

repoSchema.index({ userId: 1, isHidden: 1, isPinned: -1, stars: -1 });

export const Repo = mongoose.model('Repo', repoSchema);
