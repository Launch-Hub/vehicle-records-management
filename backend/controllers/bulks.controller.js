const { Bulk } = require("../models/bulk");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    code: 1,
    name: 1,
    size: 1,
    note: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  try {
    const { pageIndex, pageSize, search } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [{ code: regex }, { name: regex }];
    }

    const total = await Bulk.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    // const items = await Bulk.find(filter, projection)
    const items = await Bulk.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 }) // ✅ Default sort by latest first
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
    const result = await Bulk.findById(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, name } = req.body;

    const existingItem = await Bulk.findOne({
      $or: [{ name }, { code }],
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Lô có tên này đã tồn tại.",
      });
    }

    const result = await Bulk.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await Bulk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Bulk.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get procedures by bulk ID
exports.getProceduresByBulk = async (req, res) => {
  try {
    const { bulkId } = req.params;
    const { Procedure } = require("../models/procedure");

    const procedures = await Procedure.find({ bulkId })
      .populate("recordId", "plateNumber registrant")
      .sort({ createdAt: -1 });

    res.json(procedures);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getTodaysCount = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    const count = await Bulk.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
