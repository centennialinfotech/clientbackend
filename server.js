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
app.use(cors());
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
        dateApplied: d["Date Applied"],
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
    // const seen = new Set();
    // const duplicates = [];

    // data.forEach((row) => {
    //   const key = `${row.name}-${row.email}-${row.phone}`.toLowerCase();
    //   if (seen.has(key)) {
    //     duplicates.push(row);
    //   } else {
    //     seen.add(key);
    //   }
    // });

    // console.log(duplicates);

    const seen = new Set();
    const duplicates = [];

    // Generate a key for each row to check for duplicates
    // const generateKey = (row) => {
    //   return Object.values(row)
    //     .map((value) => String(value).trim().toLowerCase())
    //     .join("  "); // Use '|' to separate fields
    // };
    const generateKey = (row) => {
      return `${String(row.Name).trim().toLowerCase()}|| ${String(row.Email)
        .trim()
        .toLowerCase()}|| ${String(row.PhoneNumber).trim()}`;
    };

    // Filter duplicate rows
    data.forEach((row) => {
      const key = generateKey(row);

      if (seen.has(key)) {
        duplicates.push(row); // Add duplicate row
      } else {
        seen.add(key); // Store unique row
      }
    });

    // Print duplicates if found
    if (duplicates.length > 0) {
      console.log(duplicates);
    } else {
      console.log("No duplicate entries found.");
    }
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

// import express from "express";
// import multer from "multer";
// import mongoose from "mongoose";
// import XLSX from "xlsx";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import Data from "./models/DataModel.js";
// import fs, { unlinkSync } from "fs";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const upload = multer({ dest: "uploads/" });
// Backend: Node.js + Express + MongoDB

// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/xlsUploads', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const dataSchema = new mongoose.Schema({
//   Name: String,
//   Email: String,
//   Phone: String,
//   isDuplicate: Boolean,
// });

// const DataModel = mongoose.model('Data', dataSchema);

// // Multer setup for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
// });

// const upload = multer({ storage });

// // API to upload XLS file
// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const duplicates = [];
//     const seen = new Map();

//     data.forEach((row) => {
//       const key = `${row.Name}-${row.Email}-${row.Phone}`;
//       if (seen.has(row.Name) || seen.has(row.Email) || seen.has(row.Phone)) {
//         duplicates.push({ ...row, isDuplicate: true });
//       } else {
//         seen.set(row.Name, true);
//         seen.set(row.Email, true);
//         seen.set(row.Phone, true);
//         duplicates.push({ ...row, isDuplicate: false });
//       }
//     });

//     await DataModel.insertMany(duplicates);
//     res.status(200).json({ message: 'File uploaded and data saved', data: duplicates });
//   } catch (err) {
//     res.status(500).json({ message: 'Error processing file', error: err.message });
//   }
// });

// // API to fetch data
// app.get('/data', async (req, res) => {
//   const data = await DataModel.find();
//   res.status(200).json(data);
// });

// app.listen(5000, () => console.log('Server running on port 5000'));
