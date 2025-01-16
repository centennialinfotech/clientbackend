import mongoose from "mongoose";

const sheetData = new mongoose.Schema({
  fullName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  address: {
    type: String,
  },
  dateApplied: {
    type: String,
  },
  jobBoard: {
    type: String,
  },
  hiringCompany: {
    type: String,
  },
  jobTitle: {
    type: String,
  },
  jobPostingLink: {
    type: String,
  },
  jobPostingScreenshot: {
    type: String,
  },
  reviewedBy: {
    type: String,
  },
  isDuplicate: Boolean,
});

export default mongoose.model("Data", sheetData);
