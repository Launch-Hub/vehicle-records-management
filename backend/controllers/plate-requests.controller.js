const { PlateRequest } = require("../models/plate_request");
const { parsePagination } = require("../utils/helper");

exports.getList = async (req, res) => {
  // Define the view: fields to include
  const projection = {
    bulk: 1,
    color: 1,
    vehicleType: 1,
    letter: 1,
    suffixNumber: 1,
    createdBy: 1,
    updatedBy: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  try {
    const {
      pageIndex,
      pageSize,
      search,
      noPagination,
      bulk,
      color,
      vehicleType,
      letter,
      suffixNumber,
      createdBy,
      updatedBy,
    } = req.query;
    let skip = 0, limit = 50;
    if (!noPagination || noPagination === 'false') {
      const parsed = parsePagination(pageIndex, pageSize);
      skip = parsed.skip;
      limit = parsed.limit;
    } else {
      skip = 0;
      limit = 0; // 0 means no limit in mongoose
    }

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [
        { bulk: regex },
        { letter: regex },
        { suffixNumber: regex },
        { createdBy: regex },
        { updatedBy: regex },
      ];
    }
    if (bulk) filter.bulk = new RegExp(bulk, "i"); // case-insensitive partial match
    if (color) filter.color = new RegExp(color, "i");
    if (vehicleType) filter.vehicleType = new RegExp(vehicleType, "i");
    if (letter) filter.letter = new RegExp(letter, "i");
    if (suffixNumber) filter.suffixNumber = new RegExp(suffixNumber, "i");
    if (createdBy) filter.createdBy = new RegExp(createdBy, "i");
    if (updatedBy) filter.updatedBy = new RegExp(updatedBy, "i");

    const total = await PlateRequest.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    let query = PlateRequest.find(filter, projection)
      .sort({ updatedAt: -1 }); // ✅ Default sort by latest first
    if (!noPagination || noPagination === 'false') {
      query = query.skip(skip).limit(limit);
    }
    const items = await query.exec();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await PlateRequest.findById(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { bulk, color, vehicleType, letter, suffixNumber, createdBy } = req.body;

    // Check if a plate request with the same combination already exists
    const existingItem = await PlateRequest.findOne({
      $and: [{ bulk }, { letter }, { suffixNumber }],
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Yêu cầu dập biển số đã tồn tại.",
      });
    }

    const result = await PlateRequest.create(req.body);

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await PlateRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await PlateRequest.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// -----------

// Mock data generation for testing
const generatePlateRequest = (index) => {
  const colors = ["Xanh", "Trắng", "Vàng", "Đỏ"];
  const vehicleTypes = ["Ô tô", "Xe máy", "Xe tải"];
  const letters = ["A", "B", "C", "D", "E", "F"];
  
  return {
    bulk: `Lô-${(1000 + index).toString().padStart(4, "0")}`,
    color: colors[Math.floor(Math.random() * colors.length)],
    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    letter: letters[Math.floor(Math.random() * letters.length)],
    suffixNumber: (1000 + Math.floor(Math.random() * 9000)).toString(),
    createdBy: `User-${Math.floor(Math.random() * 100)}`,
    updatedBy: `User-${Math.floor(Math.random() * 100)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

exports.mockCreate = async (req, res) => {
  const count = parseInt(req.query.count || "10");
  const bulk = [];

  try {
    for (let i = 0; i < count; i++) {
      const plateRequestData = generatePlateRequest(i);

      const exists = await PlateRequest.findOne({
        $and: [{ bulk: plateRequestData.bulk }, { letter: plateRequestData.letter }, { suffixNumber: plateRequestData.suffixNumber }],
      });

      if (exists) {
        console.log(`🔁 Skipped: ${plateRequestData.bulk} (${plateRequestData.letter} - ${plateRequestData.suffixNumber})`);
        continue;
      }

      const record = await PlateRequest.create(plateRequestData);
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

// Bulk create plate requests with range
exports.bulkCreate = async (req, res) => {
  try {
    const { 
      bulk, 
      color, 
      vehicleType, 
      letter, 
      rangeFrom, 
      rangeTo, 
      excludedNumbers, 
      createdBy,
      updatedBy 
    } = req.body;

    // Validate required fields
    if (!bulk || !color || !vehicleType || !letter || !rangeFrom || !rangeTo || !createdBy) {
      return res.status(400).json({
        error: true,
        message: "Tất cả các trường bắt buộc phải được điền đầy đủ.",
      });
    }

    // Validate range
    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);
    
    if (isNaN(from) || isNaN(to) || from < 0 || to < 0) {
      return res.status(400).json({
        error: true,
        message: "Khoảng số phải là số nguyên dương.",
      });
    }

    if (from > to) {
      return res.status(400).json({
        error: true,
        message: "Số bắt đầu phải nhỏ hơn hoặc bằng số kết thúc.",
      });
    }

    // Parse excluded numbers
    const excludedSet = new Set();
    if (excludedNumbers && excludedNumbers.trim()) {
      const excludedParts = excludedNumbers.split(',').map(part => part.trim());
      
      for (const part of excludedParts) {
        if (part.includes('-')) {
          // Handle range like "100-150"
          const [start, end] = part.split('-').map(num => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) {
              excludedSet.add(i);
            }
          }
        } else {
          // Handle single number
          const num = parseInt(part);
          if (!isNaN(num)) {
            excludedSet.add(num);
          }
        }
      }
    }

    const createdItems = [];
    const skippedItems = [];
    const errors = [];

    // Generate all numbers in range
    for (let i = from; i <= to; i++) {
      // Skip excluded numbers
      if (excludedSet.has(i)) {
        skippedItems.push(i);
        continue;
      }

      // Format suffix number to 5 digits with leading zeros
      const suffixNumber = i.toString().padStart(5, '0');

      // Check if plate request already exists
      const existingItem = await PlateRequest.findOne({
        $and: [{ bulk }, { letter }, { suffixNumber }],
      });

      if (existingItem) {
        skippedItems.push(i);
        continue;
      }

      try {
        const plateRequestData = {
          bulk,
          color,
          vehicleType,
          letter,
          suffixNumber,
          createdBy,
          updatedBy: updatedBy || '',
        };

        const result = await PlateRequest.create(plateRequestData);
        createdItems.push(result);
      } catch (err) {
        errors.push(`Số ${i}: ${err.message}`);
      }
    }

    res.status(201).json({
      message: "Tạo yêu cầu dập biển số hàng loạt thành công.",
      created: createdItems.length,
      skipped: skippedItems.length,
      excluded: Array.from(excludedSet).length,
      items: createdItems,
      skippedNumbers: skippedItems,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
}; 