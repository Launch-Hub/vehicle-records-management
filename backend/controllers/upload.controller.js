const { UPLOAD_BUCKET } = require("../constants");

const getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_BUCKET, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("File serve error:", err);
    res.status(500).json({ message: "Failed to retrieve file", error: err.message });
  }
};

const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "No file uploaded" });
  }

  res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype,
    },
  });
};

module.exports = {
  // GET /uploads/:filename
  getFile,
  handleUpload,
};
