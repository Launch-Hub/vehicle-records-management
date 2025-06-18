const { VehicleRecord } = require("../models/vehicle_record");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    plateNumber: 1,
    color: 1,
    identificationNumber: 1,
    engineNumber: 1,
    registrant: 1,
    phone: 1,
    email: 1,
    address: 1,
    archiveAt: 1,
    note: 1,
    status: 1,
    createdAt: 1,
  };
  try {
    const { pageIndex, pageSize, search } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [
        { plateNumber: regex },
        { identificationNumber: regex },
        { engineNumber: regex },
        { registrant: regex },
      ];
    }

    const total = await VehicleRecord.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await VehicleRecord.find(filter, projection)
      // .populate("registryCategory")
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
    const result = await VehicleRecord.findById(req.params.id).populate("registryCategory");
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await VehicleRecord.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await VehicleRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await VehicleRecord.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
