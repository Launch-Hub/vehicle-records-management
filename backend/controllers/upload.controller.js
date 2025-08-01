const { UPLOAD_BUCKET } = require("../constants");
const bucketManager = require("../utils/bucket-manager");
const fs = require("fs");
const path = require("path");

const getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = bucketManager.getFilePath(filename);

    if (!bucketManager.fileExists(filename)) {
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

const listFiles = async (req, res) => {
  try {
    const { directory = "" } = req.query;
    const fullPath = path.join(bucketManager.getBucketPath(), directory);
    
    // Security check: ensure the path is within the upload bucket
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(bucketManager.getBucketPath()))) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Directory not found" });
    }

    const items = [];
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const itemPath = path.join(fullPath, entry.name);
      const relativePath = path.join(directory, entry.name).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        items.push({
          name: entry.name,
          type: 'directory',
          path: relativePath,
          size: null,
          modified: fs.statSync(itemPath).mtime
        });
      } else {
        const stats = fs.statSync(itemPath);
        items.push({
          name: entry.name,
          type: 'file',
          path: relativePath,
          size: stats.size,
          modified: stats.mtime,
          url: `/uploads/${relativePath}`
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      currentPath: directory,
      parentPath: directory ? path.dirname(directory) : null,
      items
    });
  } catch (err) {
    console.error("List files error:", err);
    res.status(500).json({ message: "Failed to list files", error: err.message });
  }
};

module.exports = {
  // GET /uploads/:filename
  getFile,
  handleUpload,
  listFiles,
};
