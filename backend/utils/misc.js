const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    // "x-forwarded-for" may contain multiple IPs: "client, proxy1, proxy2"
    return xForwardedFor.split(",")[0].trim();
  }
  return req.connection.remoteAddress;
};

module.exports = {
  getClientIp,
};
