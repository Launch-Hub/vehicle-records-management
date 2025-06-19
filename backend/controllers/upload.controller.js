const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// minio
const minioClient = require("../utils/minio-client");

const storage = multer.memoryStorage();
const minUploader = multer({ storage }).single("file");
const uploadToMinio = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Ensure bucket exists
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }

    const extension = path.extname(file.originalname);
    const objectName = crypto.randomUUID() + extension;

    await minioClient.putObject(BUCKET_NAME, objectName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });

    const fileUrl = `http://${minioClient.host}:${minioClient.port}/${BUCKET_NAME}/${objectName}`;

    return res.status(200).json({
      message: "Upload successful",
      fileUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//
// for direct upload
//
const single = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
};

module.exports = {
  minUploader,
  uploadToMinio,
  //
  single,
};
