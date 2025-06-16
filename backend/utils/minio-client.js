const Minio = require("minio");

const { MINIO_ENDPOINT, MINIO_API_PORT, MINIO_PROTOCOL, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD } =
  process.env;

const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT || "localhost", // e.g., '203.0.113.25' or 'minio.yourdomain.com'
  port: MINIO_API_PORT || 9000,
  useSSL: MINIO_PROTOCOL === 'https', // set to true if using https
  accessKey: MINIO_ROOT_USER,
  secretKey: MINIO_ROOT_PASSWORD,
});

module.exports = minioClient;
