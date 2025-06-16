const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    // "x-forwarded-for" may contain multiple IPs: "client, proxy1, proxy2"
    return xForwardedFor.split(",")[0].trim();
  }
  return req.connection.remoteAddress;
};

const parsePagination = (pageSize, pageIndex) => {
  if (pageIndex === undefined && pageSize === undefined) return { skip: 0, limit: 50 };

  const page = parseInt(pageIndex) || 0;
  const size = parseInt(pageSize);
  const limit = size === 0 ? 50 : size || 50;
  const skip = page * limit;
  return { skip, limit };
};

module.exports = {
  getClientIp,
  parsePagination,
};
