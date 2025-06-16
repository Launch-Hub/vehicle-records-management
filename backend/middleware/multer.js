const multer = require("multer");
const path = require("path");

const DEFAULT_LIMIT_SIZE = 2 * 1024 * 1024;

// Factory function
const createMulterMiddleware = ({
  destination = "uploads/",
  limits = { fileSize: DEFAULT_LIMIT_SIZE },
  fileFilter,
}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: (_, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      cb(null, `${base}-${timestamp}${ext}`);
    },
  });

  return multer({
    storage,
    limits,
    fileFilter,
  });
};

module.exports = { DEFAULT_LIMIT_SIZE, createMulterMiddleware };
