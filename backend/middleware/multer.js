const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { UPLOAD_BUCKET, DEFAULT_LIMIT_SIZE } = require("../constants");
const { imageFileFilter, docFileFilter } = require("../utils/file-filters");

// multer storages

// Factory function
function createMulterMiddleware({ subdirectory = "", fileFilter, limits }, storageType = "disk") {
  const destination = path.join(UPLOAD_BUCKET, subdirectory);

  const storage =
    storageType === "disk"
      ? multer.diskStorage({
          //(req, file, cb) => ...
          destination: (_, __, cb) => cb(null, destination),
          filename: (_, file, cb) => {
            const timestamp = Date.now();
            const uniqueName = `${timestamp}-${file.originalname}`;
            cb(null, uniqueName);
          },
        })
      : multer.memoryStorage();
  // Ensure the subdirectory exists
  fs.mkdirSync(destination, { recursive: true });

  return multer({ storage, fileFilter, limits });
}

// middleware
const directUpload = {
  image: createMulterMiddleware({
    subdirectory: "images",
    fileFilter: imageFileFilter,
    limits: { fileSize: DEFAULT_LIMIT_SIZE },
  }).single("file"),
  document: createMulterMiddleware({
    subdirectory: "documents",
    fileFilter: docFileFilter,
    limits: { fileSize: DEFAULT_LIMIT_SIZE },
  }).single("file"),
};
const minioUpload = {
  image: createMulterMiddleware(
    {
      subdirectory: "images",
      fileFilter: imageFileFilter,
      limits: { fileSize: DEFAULT_LIMIT_SIZE },
    },
    "memory"
  ).single("file"),
  document: createMulterMiddleware(
    {
      subdirectory: "documents",
      fileFilter: docFileFilter,
      limits: { fileSize: DEFAULT_LIMIT_SIZE },
    },
    "memory"
  ).single("file"),
};

module.exports = { createMulterMiddleware, directUpload, minioUpload };
