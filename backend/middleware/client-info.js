const { getClientIp } = require("../utils/helper");

exports.keepClientInfo = (req, _, next) => {
  const ip = getClientIp(req);
  console.log("Client IP:", ip);
  next();
};
