const bcrypt = require("bcrypt");
const { SALT_OR_ROUND } = require("../constants");

const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    // "x-forwarded-for" may contain multiple IPs: "client, proxy1, proxy2"
    return xForwardedFor.split(",")[0].trim();
  }
  return req.connection.remoteAddress;
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_OR_ROUND);
};

const parsePagination = (pageIndex, pageSize) => {
  if (pageIndex === undefined && pageSize === undefined) return { skip: 0, limit: 50 };

  const page = parseInt(pageIndex) || 0;
  const size = parseInt(pageSize);
  const limit = size === 0 ? 50 : size || 50;
  const skip = page * limit;

  return { skip, limit };
};

const nomalizeText = (text) => {
  return text
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
    .replace(/đ/g, "d") // Replace Vietnamese-specific 'đ'
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove punctuation/special chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim(); // Remove leading/trailing spaces
};

const fillNumber = (number, totalLength = 7, fillChar = "0") => {
  return number.toString().padStart(totalLength, fillChar);
};

module.exports = {
  getClientIp,
  hashPassword,
  parsePagination,
  //
  nomalizeText,
  fillNumber,
};
