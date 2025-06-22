const path = require("path");
const crypto = require("crypto");
const fs = require("fs").promises;
const {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); // need to install @aws-sdk/s3-request-presigner
const { DEFAULT_BUCKET_NAME, UPLOAD_BUCKET } = require("../../constants");

const { MINIO_URL, MINIO_API_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD } = process.env;
const REGION = "ap-southeast-1"; // Asia Pacific (Singapore)

// minio client
const s3 = new S3Client({
  endpoint: `${MINIO_URL}:${MINIO_API_PORT}`,
  region: REGION,
  credentials: {
    accessKeyId: MINIO_ROOT_USER,
    secretAccessKey: MINIO_ROOT_PASSWORD,
  },
  forcePathStyle: true, // Required for MinIO
});

async function ensureBucketExists(s3Client, bucketName) {
  const buckets = await s3Client.send(new ListBucketsCommand({}));
  const exists = buckets.Buckets.some((b) => b.Name === bucketName);
  if (!exists) {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
  }
}

// const getPresignedUrl = async (bucket, objectName, expiresIn = 3600) => {
//   const command = new GetObjectCommand({ Bucket: bucket, Key: objectName });
//   return await getSignedUrl(s3, command, { expiresIn });
// };

// ------------------------------------------------------------

// Health check route
const healthCheck = async (_, res) => {
  try {
    const result = await s3.send(new ListBucketsCommand({}));
    if (result.Buckets && result.Buckets.length >= 0) {
      res.status(200).json({ status: "connected", buckets: result.Buckets.length });
    } else {
      res.status(500).json({ status: "connected", detail: "No buckets found" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// handler
const serveFile = async (req, res) => {
  try {
    const { bucket = DEFAULT_BUCKET_NAME, objectName } = req.params;

    // Decode the object name in case it contains special characters
    const decodedObjectName = decodeURIComponent(objectName);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: decodedObjectName,
    });

    const response = await s3.send(command);

    res.setHeader("Content-Type", response.ContentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    response.Body.pipe(res);
  } catch (err) {
    console.error("Serve file error:", err);
    res.status(404).json({ message: "File not found" });
  }
};

const uploadToMinio = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // const bucket = req.body.bucket || DEFAULT_BUCKET_NAME;
    // const folder = req.body.folder || "misc";
    const bucket = req.body.bucket || "misc"; // simplify it to bucket only
    // Ensure bucket exists
    await ensureBucketExists(s3, bucket);

    const fileName = req.body.fileName || crypto.randomUUID();
    const extension = path.extname(file.originalname);
    const objectName = `${fileName}${extension}`;

    // Save to MinIO
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Also save to static directory for direct access
    const staticPath = path.join(UPLOAD_BUCKET, objectName);
    await fs.mkdir(path.dirname(staticPath), { recursive: true });
    await fs.writeFile(staticPath, file.buffer);

    // Use simple URL format
    const fileUrl = `/uploads/${objectName}`;

    return res.status(200).json({
      message: "Upload successful",
      fileUrl,
      objectName,
      bucket,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  // getPresignedUrl,
  healthCheck,
  serveFile,
  uploadToMinio,
};
