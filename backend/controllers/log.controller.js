const { ActivityLog } = require("../models/activity_log");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    action: 1,
    resource: 1,
    documentId: 1,
    description: 1,
    userId: 1,
    createdAt: 1,
  };
  try {
    const { pageIndex, pageSize, search, resource = "procedures" } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = { resource };
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [
        { description: regex },
      ];
    }

    const total = await ActivityLog.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await ActivityLog.find(filter, projection)
      .populate("userId", "username fullName")
      .sort({ createdAt: -1 }) // ✅ Default sort by latest first
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await ActivityLog.findById(req.params.id).populate("registrationType");
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
