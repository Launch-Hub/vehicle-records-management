const fs = require("fs");
const path = require("path");
const { INIT_BUCKET, UPLOAD_BUCKET } = require("../constants");

function copyDefaultUploads() {
  const sourceDir = INIT_BUCKET;
  const targetDir = UPLOAD_BUCKET;

  // Ensure target root exists
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy each subdirectory and its contents
  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isDirectory()) {
      const srcSubdir = path.join(sourceDir, entry.name);
      const destSubdir = path.join(targetDir, entry.name);

      if (!fs.existsSync(destSubdir)) {
        copyRecursive(srcSubdir, destSubdir);
        console.log(`Copied default upload folder: ${entry.name}`);
      }
    }
  });
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

module.exports = copyDefaultUploads;
