/**
 * Multer fileFilter function to allow only document files.
 *
 * Supported types: .pdf, .doc, .docx, .xls, .xlsx, .txt
 */
function docFileFilter(_, file, cb) {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", // .txt
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.originalname}. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT.`
      ),
      false
    );
  }
}

/**
 * Multer fileFilter function to allow only document files.
 *
 * Supported types: .pdf, .doc, .docx, .xls, .xlsx, .txt
 */
function imageFileFilter(_, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg and .png files are allowed"));
  }
}

module.exports = {
  docFileFilter,
  imageFileFilter,
};
