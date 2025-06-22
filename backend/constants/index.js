const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const DEFAULT_BUCKET_NAME = process.env.BUCKET_NAME || "vrm-bucket";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
const JWT_EXPIRY = "1d"; // access token
const JWT_REFRESH_EXPIRY = "7d"; // refresh token
const SALT_OR_ROUND = 10; // salt for encrypt

const LIST_FEATURES = [
  "general",
  "users",
  "settings",
  "records",
  "bulks",
  "procedures",
  "action_types",
  "activity_logs",
  "reports",
];

const DEFAULT_PERMISSIONS = LIST_FEATURES.map((feature) => ({
  [feature]: {
    read: true,
    write: true,
    delete: true,
  },
}));

const DEFAULT_LIMIT_SIZE = 2 * 1024 * 1024;
const INIT_BUCKET = path.join(__dirname, "uploads");
const UPLOAD_BUCKET = path.join(__dirname, "..", "..", "public", DEFAULT_BUCKET_NAME);

const DEFAULT_DUE_DATE = 2 * 24 * 60 * 60 * 1000; // 2 days

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
  SALT_OR_ROUND,
  DEFAULT_PERMISSIONS,
  DEFAULT_BUCKET_NAME,
  DEFAULT_LIMIT_SIZE,
  INIT_BUCKET,
  UPLOAD_BUCKET,
  DEFAULT_DUE_DATE,
};
