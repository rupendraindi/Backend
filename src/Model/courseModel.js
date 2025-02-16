import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dec: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  lang: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  introVideo: {
    thub: { type: String, required: true },
    video: { type: String, required: true }
  },
  chapters: [
    {
      title: { type: String, required: true },
      dec: { type: String, required: true },
      pdf: { type: String, required: false },
      videos: [
        {
          video: { type: String, required: true },
          title: { type: String, required: true },
          thub: { type: String, required: false },
          duration: { type: String, required: false }
        }
      ]
    }
  ]
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
 
