const express = require("express");
const router = express.Router();
const { directUpload, minioUpload } = require("../middleware/multer");
const dController = require("../controllers/upload.controller");
const mController = require("../controllers/third-party/minio.controller");

// direct upload (du)
const directPath = "/du";
router.get(`${directPath}/:filename`, dController.getFile);
router.post(`${directPath}/single/image`, directUpload.image, dController.handleUpload);
router.post(`${directPath}/single/document`, directUpload.document, dController.handleUpload);

// List files endpoint
router.get("/list", dController.listFiles);

// minio
const minioPath = "/min";
// mf = minio file - use a simpler route pattern
router.get("/mf/:bucket/:objectName", mController.serveFile);
router.post(`${minioPath}/single/image`, minioUpload.image, mController.uploadToMinio);
router.post(`${minioPath}/single/document`, minioUpload.document, mController.uploadToMinio);

module.exports = router;
