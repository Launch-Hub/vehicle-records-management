const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const { DEFAULT_LIMIT_SIZE, createMulterMiddleware } = require("../middleware/multer");
const { docFileFilter, imageFileFilter } = require("../utils/file-filters");
const { keepClientInfo } = require("../middleware/client-info");
const { BUCKET_NAME } = require("../constants");

const { minUpload, uploadToMinio } = require("../controllers/upload.controller");
router.post("/upload", minUpload, uploadToMinio);

// direct upload (du)
// single file upload

// const upload = createMulterMiddleware({
//   destination: `${BUCKET_NAME}/documents`,
//   limits: { fileSize: DEFAULT_LIMIT_SIZE }, // 2 MB
//   fileFilter: docFileFilter,
// });
router.post("/doc/dsingle", (req, res) => {
  createMulterMiddleware({
    destination: `${BUCKET_NAME}/documents`,
    limits: { fileSize: DEFAULT_LIMIT_SIZE }, // 2 MB
    fileFilter: docFileFilter,
  }).single("file")(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: "Upload failed",
        details: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        type: req.file.mimetype,
      },
    });
  });
});

// const uploadImage = createMulterMiddleware({
//   destination: `${BUCKET_NAME}/images`,
//   limits: { fileSize: DEFAULT_LIMIT_SIZE }, // 2 MB
//   fileFilter: imageFileFilter,
// });
router.post("/image", (req, res) => {
  createMulterMiddleware({
    destination: `${BUCKET_NAME}/images`,
    limits: { fileSize: DEFAULT_LIMIT_SIZE }, // 2 MB
    fileFilter: imageFileFilter,
  }).single("file")(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: "Upload failed",
        details: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        type: req.file.mimetype,
      },
    });
  });
});

// end direct upload

// health check
// curl -X GET http://localhost:5000/api/upload/
// router.get("/", keepClientInfo, (_, res) => {
//   res.send("File upload service running.");
// });

module.exports = router;
