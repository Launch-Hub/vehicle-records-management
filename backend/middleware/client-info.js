const { getClientIp } = require("../utils/misc");

exports.keepClientInfo = (req, _, next) => {
  const ip = getClientIp(req);
  console.log("Client IP:", ip);
  next();
};
