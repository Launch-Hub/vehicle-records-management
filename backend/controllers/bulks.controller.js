const { Bulk } = require("../models/bulk");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const view = {
    initSize: 1,
    currentSize: 1,
    note: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  try {
    const { pageIndex, pageSize, search } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
        { serviceNumber: regex },
      ];
    }

    const total = await Bulk.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await Bulk.find(filter, projection)
      // .populate("registryCategory")
      .sort({ createdAt: -1 }) // ✅ Default sort by newest first
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
    const result = await Bulk.findById(req.params.id).populate("registryCategory");
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Bulk.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Bulk.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: true, message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Bulk.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: true, message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
