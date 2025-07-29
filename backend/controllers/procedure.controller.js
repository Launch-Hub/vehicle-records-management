const { Procedure, procedureStatuses } = require("../models/procedure");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    record: 1,
    bulk: 1,
    status: 1,
    registrationType: 1,
    createdAt: 1,
    updatedAt: 1,
    steps: 1, // include steps for population
  };
  try {
    const { pageIndex, pageSize, search, step, recordId } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [{ registrationType: regex }];
    }
    if (step) {
      filter.currentStep = Number(step);
    }
    if (recordId) {
      filter.recordId = recordId;
    }

    const total = await Procedure.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await Procedure.find(filter, projection)
      .populate({ path: "record", select: "plateNumber registrant" })
      .populate({ path: "bulk", select: "name" })
      .populate({ path: "steps.action", select: "name step" })
      .sort({ updatedAt: -1 })
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
      .populate({ path: "record", select: "plateNumber registrant" })
      .populate({ path: "bulk", select: "name" })
      .populate({ path: "steps.action", select: "name step" });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { record, bulk, registrationType } = req.body;

    // Check if a procedure already exists for this record and bulk combination
    const existingItem = await Procedure.findOne({
      record,
      bulk,
      registrationType,
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Đăng ký này đã tồn tại cho hồ sơ và Lần nhập này.",
      });
    }

    const result = await Procedure.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.locals.activityDescription = `Tạo hồ sơ ${result.registrationType} - trạng thái: ${
      procedureStatuses[result.status] || result.status
    }`;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    // Get the old document to compare status
    const oldDoc = await Procedure.findById(req.params.id);
    if (!oldDoc) return res.status(404).json({ error: true, message: "Not found" });

    const result = await Procedure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    // Create description with old and new status if status changed
    const oldStatus = procedureStatuses[oldDoc.status] || oldDoc.status;
    const newStatus = procedureStatuses[result.status] || result.status;
    const statusChange = oldDoc.status !== result.status ? ` từ ${oldStatus}` : "";
    res.locals.activityDescription = `Chỉnh sửa hồ sơ ${result.registrationType} - trạng thái: ${newStatus}${statusChange}`;
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
    res.locals.activityDescription = `Xoá hồ sơ ${result.registrationType} - trạng thái: ${
      procedureStatuses[result.status] || result.status
    }`;
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
