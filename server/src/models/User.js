import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      default: () => Math.floor(Math.random() * 90000000) + 10000000,
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
    password: {
      type: String,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    name: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
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
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);



userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validatePassword = function (password) {
  if (!this.password || !this.salt) return false;
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.password === hash;
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};


export const User = mongoose.model('User', userSchema);
