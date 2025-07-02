const { mock_records } = require("../constants/mock");
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
      // .populate("registrationType")
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
    const result = await VehicleRecord.findById(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { plateNumber, identificationNumber, engineNumber, registrant } = req.body;

    const existingItem = await VehicleRecord.findOne({
      $and: [{ plateNumber }, { identificationNumber }, { engineNumber }],
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Biển số đã được đăng ký.",
      });
    }

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

// -----------

// prettier-ignore
const generateRandomPhone = () => {
  return `09${Math.floor(100000000 + Math.random() * 900000000).toString().slice(0, 8)}`;
};
const generatePlateNumber = (index) => `30A-${(1000 + index).toString().padStart(4, "0")}`;
const generateEngineNumber = (index) => `ENG-${(100000 + index).toString()}`;
const generateIdentificationNumber = (index) => `ID-${(100000 + index).toString()}`;

exports.mockCreate = async (req, res) => {
  const count = parseInt(req.query.count || "10");
  const bulk = [];

  try {
    for (let i = 0; i < count; i++) {
      const plateNumber = generatePlateNumber(i);
      const engineNumber = generateEngineNumber(i);
      const identificationNumber = generateIdentificationNumber(i);

      const exists = await VehicleRecord.findOne({
        $and: [{ plateNumber }, { identificationNumber }, { engineNumber }],
      });

      if (exists) {
        console.log(`🔁 Skipped: ${plateNumber} (${identificationNumber} - ${engineNumber})`);
        continue;
      }

      const record = await VehicleRecord.create({
        plateNumber,
        engineNumber,
        identificationNumber,
        ownerName: vietnameseNames[Math.floor(Math.random() * vietnameseNames.length)],
        phone: generateRandomPhone(),
        vehicleType: "Ô tô",
        issuer: "Cục Đăng kiểm Việt Nam",
        // archiveLocation: {
        //   storage: "Kho A",
        //   room: "Phòng 1",
        //   row: "Dãy A",
        //   shelf: "Kệ 1",
        //   level: "Tầng 2",
        // },
        status: "idle",
      });

      bulk.push(record);
    }

    res.status(201).json({
      created: bulk.length,
      items: bulk,
    });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};
