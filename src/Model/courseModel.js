import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      actualPrice: {
        type: Number,
        required: true,
      },
      discountPrice: {
        type: Number,
        required: false,
      },
    },
    description: {
      type: String,
      required: true,
    },
    pdf: {
      type: String,
      required: false,
    },
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          required: false,
        },
        pdf: {
          type: String,
          required: false,
        },
      },
    ],
    demoVideo: {
      type: String, // URL of the demo video
      required: false,
    },
    duration: {
      type: String,
      required: false,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;