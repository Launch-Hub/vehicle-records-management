const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRY = "1d"; // access token
const JWT_REFRESH_EXPIRY = "7d"; // refresh token
const SALT_OR_ROUND = 10; // salt for encrypt

const DEFAULT_PERMISSIONS = {
  general: {
    read: true,
    write: true,
    delete: true,
  },
  users: {
    read: true,
    write: false,
    delete: false,
  },
  settings: {
    read: true,
    write: true,
    delete: true,
  },
  records: {
    read: true,
    write: true,
    delete: true,
  },
  reports: {
    read: true,
    write: true,
    delete: true,
  },
};

const BUCKET_NAME = "uploads";

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
  SALT_OR_ROUND,
  DEFAULT_PERMISSIONS,
  BUCKET_NAME,
};
