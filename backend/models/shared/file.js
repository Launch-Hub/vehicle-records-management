const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true }, // Direct access URL or file path
    mimeType: String, // e.g., 'application/pdf', 'image/png'
    size: { type: Number, min: 0 }, // Size in bytes
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String,
  },
  {
    _id: false, // Optional: set to false if embedded and you don't want auto-generated _id
  }
);
