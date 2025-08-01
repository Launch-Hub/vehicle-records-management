const fs = require("fs");
const path = require("path");
const { BUCKET_CONFIG } = require("../constants");

class BucketManager {
  constructor() {
    this.config = BUCKET_CONFIG;
  }

  /**
   * Get the bucket name
   */
  getBucketName() {
    return this.config.name;
  }

  /**
   * Get the bucket path
   */
  getBucketPath() {
    return this.config.path;
  }

  /**
   * Get the initialization path
   */
  getInitPath() {
    return this.config.initPath;
  }

  /**
   * Ensure bucket directory exists
   */
  ensureBucketExists() {
    if (!fs.existsSync(this.config.path)) {
      fs.mkdirSync(this.config.path, { recursive: true });
      console.log(`Created bucket directory: ${this.config.path}`);
    }
  }

  /**
   * Get file path within bucket
   */
  getFilePath(filename) {
    return path.join(this.config.path, filename);
  }

  /**
   * Check if file exists in bucket
   */
  fileExists(filename) {
    return fs.existsSync(this.getFilePath(filename));
  }

  /**
   * Get bucket info for debugging
   */
  getBucketInfo() {
    return {
      name: this.config.name,
      path: this.config.path,
      exists: fs.existsSync(this.config.path),
      size: this.getBucketSize(),
    };
  }

  /**
   * Get bucket size (recursive)
   */
  getBucketSize() {
    if (!fs.existsSync(this.config.path)) return 0;
    
    let totalSize = 0;
    const calculateSize = (dirPath) => {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          calculateSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    };
    
    calculateSize(this.config.path);
    return totalSize;
  }
}

module.exports = new BucketManager(); 