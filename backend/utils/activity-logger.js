const { ActivityLog } = require("../models/activity_log");

// async function logActivity({ action, resource, documentId, userId, changes }) {
exports.logActivity = async (activity) => {
  try {
    await ActivityLog.create({ ...activity });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

exports.logActivityMiddleware = (action, resource) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // get from request param or set in controller
        const documentId = req.params.id || res.locals.documentId;
        if (!documentId) return;

        await ActivityLog.create({
          action,
          resource,
          documentId,
          userId: req.user?._id,
          changes: req.body,
          description: res.locals.activityDescription,
        });
      }
    });

    next();
  };
};
