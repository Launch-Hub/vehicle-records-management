const { ActionType } = require("../models/action_type");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    order: 1,
    name: 1,
    step: 1,
    toStep: 1,
  };
  try {
    const { pageIndex, pageSize, search, step } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [{ name: regex }];
    }
    if (!!step) {
      // is a number
      filter.step = parseInt(step);
    }

    const total = await ActionType.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    // const items = await ActionType.find(filter, projection)
    const items = await ActionType.find(filter)
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
    const result = await ActionType.findById(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, step } = req.body;

    const existingItem = await ActionType.findOne({
      $and: [{ name }, { step }],
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Tạo mục đã tồn tại.",
      });
    }

    const result = await ActionType.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.createBulk = async (req, res) => {
  try {
    const { actionTypes } = req.body;

    if (!Array.isArray(actionTypes) || actionTypes.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Danh sách hạng mục không hợp lệ.",
      });
    }

    // Validate each action type
    for (const actionType of actionTypes) {
      if (!actionType.name || !actionType.step || !actionType.toStep || !actionType.order) {
        return res.status(400).json({
          error: true,
          message: "Thiếu thông tin bắt buộc cho hạng mục.",
        });
      }
    }

    // Check for duplicates by name and step
    const existingItems = await ActionType.find({
      $or: [...actionTypes.map(({ name }) => ({ name }))],
    });

    // Filter out duplicates and prepare for creation
    const duplicates = [];
    const itemsToCreate = actionTypes.filter((actionType, index) => {
      // Check against existing items in database
      const isDuplicateName = existingItems.some((existing) => existing.name === actionType.name);

      // Check against other items in the input array
      const isDuplicateNameInInput = actionTypes.some(
        (item, i) => i !== index && item.name === actionType.name
      );

      if (isDuplicateName || isDuplicateNameInInput) {
        if (isDuplicateName || isDuplicateNameInInput) {
          duplicates.push(`${actionType.name} - tên đã tồn tại`);
        }
        return false;
      }
      return true;
    });

    // Create non-duplicate action types
    let results = [];
    if (itemsToCreate.length > 0) {
      results = await ActionType.insertMany(itemsToCreate);
    }

    // Prepare response message
    let message = `Đã tạo thành công ${results.length} hạng mục.`;
    if (duplicates.length > 0) {
      message += ` Bỏ qua ${duplicates.length} hạng mục đã tồn tại: ${duplicates.join(", ")}.`;
    }

    res.status(201).json({
      message,
      items: results,
      skipped: duplicates,
    });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await ActionType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await ActionType.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
