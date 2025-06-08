const { LegalRecord } = require("../models/legal-record");
require("dotenv").config();

exports.getList = async (req, res) => {
  try {
    // Define the view: fields to include
    const view = {
      licensePlate: 1,
      issuer: 1,
      phone: 1,
      email: 1,
      registryCategory: 1,
      status: 1,
      createdAt: 1,
    };

    const { pageIndex, pageSize } = req.query;

    const query = LegalRecord.find({}, view).populate("registryCategory");

    // Apply pagination only if pageIndex or pageSize is present
    if (pageIndex !== undefined || pageSize !== undefined) {
      const page = parseInt(pageIndex) || 0;
      const size = parseInt(pageSize);
      const limit = size === 0 ? 50 : size || 50;
      const skip = page * limit;

      query.skip(skip).limit(limit);
    }

    const records = await query.exec();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const record = await LegalRecord.findById(req.params.id).populate("registryCategory");
    if (!record) return res.status(404).json({ error: true, message: "Not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const record = await LegalRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await LegalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: true, message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await LegalRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: true, message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
