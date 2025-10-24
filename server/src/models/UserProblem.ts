import mongoose, { Document, Schema } from "mongoose";

// Revision history interface
interface IRevision {
  revision_no: number;
  revision_date: Date;
  revision_notes: string;
}

// User problem tracking interface
export interface IUserProblem extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  problem_link: string;
  status: "Todo" | "Completed";
  notes: string;
  date_solved?: Date;
  revision_history: IRevision[];
  createdAt: Date;
  updatedAt: Date;
}

// Revision schema
const RevisionSchema = new Schema<IRevision>(
  {
    revision_no: {
      type: Number,
      required: true,
      min: 1,
    },
    revision_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    revision_notes: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { _id: false }
);

// User problem schema - user-specific tracking data
const UserProblemSchema = new Schema<IUserProblem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    problem_link: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          // Validate for both LeetCode and GeeksforGeeks URL formats
          const leetcodePattern =
            /^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/?$/;
          const gfgPattern =
            /^https:\/\/www\.geeksforgeeks\.org\/problems\/[a-z0-9-]+(?:\/\d+)?$/;
          return leetcodePattern.test(v) || gfgPattern.test(v);
        },
        message:
          "Invalid problem URL format. Must be a valid LeetCode or GeeksforGeeks URL",
      },
    },
    status: {
      type: String,
      enum: ["Todo", "Completed"],
      default: "Todo",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    date_solved: {
      type: Date,
      validate: {
        validator: function (this: IUserProblem, v: Date) {
          // date_solved is required only when status is 'Completed'
          return (
            this.status === "Todo" || (this.status === "Completed" && v != null)
          );
        },
        message: "Date solved is required when status is Completed",
      },
    },
    revision_history: [RevisionSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one entry per user per problem
UserProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// Index for efficient queries
UserProblemSchema.index({ userId: 1, status: 1 });
UserProblemSchema.index({ userId: 1, date_solved: -1 });
UserProblemSchema.index({ userId: 1, "revision_history.revision_date": -1 });

// Middleware to automatically update date_solved when status changes to 'Completed'
UserProblemSchema.pre("save", function (next) {
  if (this.status === "Completed" && !this.date_solved) {
    this.date_solved = new Date();
  }
  if (this.status === "Todo") {
    this.date_solved = undefined;
  }
  next();
});

// Method to add revision
UserProblemSchema.methods.addRevision = function (notes: string) {
  const nextRevisionNo =
    this.revision_history.length > 0
      ? Math.max(
          ...this.revision_history.map((r: IRevision) => r.revision_no)
        ) + 1
      : 1;

  this.revision_history.push({
    revision_no: nextRevisionNo,
    revision_date: new Date(),
    revision_notes: notes,
  });

  return this.save();
};

// Method to update revision
UserProblemSchema.methods.updateRevision = function (
  revisionNo: number,
  notes: string
) {
  const revision = this.revision_history.find(
    (r: IRevision) => r.revision_no === revisionNo
  );
  if (revision) {
    revision.revision_notes = notes;
    revision.revision_date = new Date();
    return this.save();
  }
  throw new Error(`Revision ${revisionNo} not found`);
};

// Method to delete revision
UserProblemSchema.methods.deleteRevision = function (revisionNo: number) {
  this.revision_history = this.revision_history.filter(
    (r: IRevision) => r.revision_no !== revisionNo
  );
  return this.save();
};

export default mongoose.model<IUserProblem>("UserProblem", UserProblemSchema);
