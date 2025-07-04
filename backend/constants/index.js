const path = require("path");

const PORT = process.env.API_PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vehicle_records_db";
const BASE_API_URL = process.env.BASE_API_URL || "/api";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const DEFAULT_BUCKET_NAME = process.env.BUCKET_NAME || "vrm-bucket";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
const JWT_EXPIRY = "1d"; // access token
const JWT_REFRESH_EXPIRY = "7d"; // refresh token
const SALT_OR_ROUND = 10; // salt for encrypt

const LIST_FEATURES = [
  "users",
  "general",
  "settings",
  "records",
  "bulks",
  "action_types",
  "activites",
  "procedures",
  //
  "procedures_1",
  "procedures_2",
  "procedures_3",
  "procedures_4",
  "procedures_5",
];

const DEFAULT_PERMISSIONS = LIST_FEATURES.reduce((acc, feature) => {
  if (feature === "users") {
    acc[feature] = {
      read: false,
      write: false,
      delete: false,
    };
  } else {
    acc[feature] = {
      read: true,
      write: true,
      delete: true,
    };
  }
  return acc;
}, {});

const ADMIN_PERMISSIONS = LIST_FEATURES.reduce((acc, feature) => {
  acc[feature] = {
    read: true,
    write: true,
    delete: true,
  };
  return acc;
}, {});

const DEFAULT_LIMIT_SIZE = 2 * 1024 * 1024;
const INIT_BUCKET = path.join(__dirname, "uploads");
const UPLOAD_BUCKET = path.join(__dirname, "..", "..", "public", DEFAULT_BUCKET_NAME);

const DEFAULT_DUE_DATE = 2 * 24 * 60 * 60 * 1000; // 2 days

module.exports = {
  MONGO_URI,
  PORT,
  BASE_API_URL,
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
