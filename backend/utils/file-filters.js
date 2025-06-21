const path = require("path");

const unsupportedString = (ext, allowed) =>
  `Unsupported file type : ${ext}. Allowed types: ${allowed.join(", ")}.`;

/**
 * Multer fileFilter function to allow only document files.
 *
 * Supported types: .pdf, .doc, .docx, .xls, .xlsx, .txt
 */
const docFileFilter = (_, file, cb) => {
  const allowedExts = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", // .txt
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExts.includes(ext)) {
    return cb(new Error(unsupportedString(file.mimetype, allowedExts)), false);
  }

  return cb(null, true);
};

/**
 * Multer fileFilter function to allow only image files.
 *
 * Supported types: .jpg, .jpeg, .png, .webp
 */
const imageFileFilter = (_, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(file.mimetype) || !allowedExts.includes(ext)) {
    return cb(new Error(unsupportedString(file.mimetype, allowedExts)), false);
  }

  return cb(null, true);
};

/**
 * Multer fileFilter function to allow only image files.
 *
 * Supported types: .jpg, .jpeg, .png, .webp
 */
// const compressedFileFilter = (_, file, cb) => {
//   const allowedExts = [".zip", ".rar", ".7z"];
//   const allowedTypes = ["application/zip", "application/rar", "application/x-7z-compressed"];

//   const ext = path.extname(file.originalname).toLowerCase();
//   if (!allowedTypes.includes(file.mimetype) || !allowedExts.includes(ext)) {
//     return cb(new Error(unsupportedString(file.mimetype, allowedExts)), false);
//   }

//   return cb(null, true);
// };

module.exports = {
  docFileFilter,
  imageFileFilter,
  // compressedFileFilter,
};
