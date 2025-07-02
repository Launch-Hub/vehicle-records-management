const { Procedure } = require("../models/procedure");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    recordId: 1,
    bulkId: 1,
    status: 1,
    registrationType: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  try {
    const { pageIndex, pageSize, search, step } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [{ registrationType: regex }];
    }
    if (step) {
      filter.currentStep = Number(step);
    }

    const total = await Procedure.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await Procedure.find(filter, projection)
      .populate("recordId", "plateNumber registrant")
      .populate("bulkId", "name")
      .sort({ updatedAt: -1 }) // ✅ Default sort by latest first
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
    const result = await Procedure.findById(req.params.id)
      .populate("recordId", "plateNumber registrant")
      .populate("bulkId", "name");
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { recordId, bulkId, registrationType } = req.body;

    // Check if a procedure already exists for this record and bulk combination
    const existingItem = await Procedure.findOne({
      recordId,
      bulkId,
      registrationType,
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Đăng ký này đã tồn tại cho hồ sơ và lô này.",
      });
    }

    const result = await Procedure.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await Procedure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Procedure.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
