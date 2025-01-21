import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import XLSX from "xlsx";
import cors from "cors";
import bodyParser from "body-parser";
import fs, { unlinkSync } from "fs";
import Data from "./models/DataModel.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());
const upload = multer({ dest: "uploads/" });

mongoose
  .connect(`${process.env.MONGO_URL}/dataFiles`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const mapData = data.map((d) => {
      return {
        fullName: d["Full name"],
        email: d["Email"],
        phone: d["Phone"],
        address: d["Address"],
        dateApplied: d["Date Applied"] ? new Date(d["Date Applied"]) : null,
        jobBoard: d["Job Board"],
        hiringCompany: d["Hiring Company"],
        jobTitle: d["Job title"],
        jobPostingLink: d["Job posting Link"],
        jobPostingScreenshot: d["Job Posting Screenshot"],
        reviewedBy: d["Reviewed by"],
      };
    });
    const resrr = await Data.insertMany(mapData);
    // console.log(resrr);
    // console.log(mapData);
    fs, unlinkSync(filePath);
    res.status(200).json({
      message: "File uploaded and data saved in MongoDB successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fialed to upload the file." });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch data", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
