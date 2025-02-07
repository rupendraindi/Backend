import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String], 
      required: false, 
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);

export default mongoose.model("Blog", blogSchema);
