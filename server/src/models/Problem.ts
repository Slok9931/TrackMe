import mongoose, { Document, Schema } from "mongoose";

// Topic tag interface
interface ITopicTag {
  name: string;
  slug: string;
}

// Problem interface
export interface IProblem extends Document {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: ITopicTag[];
  problemUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Topic tag schema
const TopicTagSchema = new Schema<ITopicTag>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

// Problem schema - shared across all users
const ProblemSchema = new Schema<IProblem>(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    topicTags: [TopicTagSchema],
    problemUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searches
ProblemSchema.index({ title: "text", titleSlug: 1 });
ProblemSchema.index({ difficulty: 1, "topicTags.slug": 1 });

export default mongoose.model<IProblem>("Problem", ProblemSchema);
