import mongoose from 'mongoose';


const skillItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    source: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    skills: [skillItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


// Multikey index on skills.name for fast candidate lookup during matching
skillSchema.index({ 'skills.name': 1 });


export const Skill = mongoose.model('Skill', skillSchema);
