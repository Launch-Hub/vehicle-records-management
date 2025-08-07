const { PlateColor } = require("../models/selectable/plate_color");
const { PaidAmount } = require("../models/selectable/paid_amount");
const { VehicleType } = require("../models/selectable/vehicle_type");
const { ReturnType } = require("../models/selectable/return_type");
const { parsePagination } = require("../utils/helper");

// Map of selectable models for dynamic access
const SELECTABLE_MODELS = {
  plate_colors: PlateColor,
  paid_amounts: PaidAmount,
  vehicle_types: VehicleType,
  return_types: ReturnType,
};

// Vietnamese labels for selectable types
const VIETNAMESE_LABELS = {
  plate_colors: 'Màu biển số',
  paid_amounts: 'Số tiền phải trả',
  vehicle_types: 'Loại xe',
  return_types: 'Hình thức trả kết quả',
};

// Validation schemas for each selectable type
const VALIDATION_SCHEMAS = {
  plate_colors: {
    required: ["dictionary", "name"],
    unique: ["dictionary"],
    fields: {
      dictionary: "Mã màu",
      name: "Tên màu",
    },
  },
  paid_amounts: {
    required: ["name", "value"],
    unique: ["value"],
    fields: {
      name: "Tên khoản phí",
      value: "Số tiền",
    },
  },
  vehicle_types: {
    required: ["name", "value"],
    unique: ["value"],
    fields: {
      name: "Tên loại xe",
      value: "Mã loại xe",
    },
  },
  return_types: {
    required: ["dictionary", "name"],
    unique: ["dictionary"],
    fields: {
      dictionary: "Mã Hình thức trả",
      name: "Tên Hình thức trả",
    },
  },
};

// Helper function to get model by type
const getModelByType = (type) => {
  const model = SELECTABLE_MODELS[type];
  if (!model) {
    throw new Error(`Loại tạo mục không hợp lệ: ${type}`);
  }
  return model;
};

// Helper function to validate data
const validateData = (type, data) => {
  const schema = VALIDATION_SCHEMAS[type];
  if (!schema) {
    throw new Error(`Loại tạo mục không hợp lệ: ${type}`);
  }

  const errors = [];
  
  // Check required fields
  schema.required.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      const fieldLabel = schema.fields[field] || field;
      errors.push(`${fieldLabel} là bắt buộc`);
    }
  });

  return errors;
};

// Get all selectable types
exports.getSelectableTypes = async (req, res) => {
  try {
    const types = Object.keys(SELECTABLE_MODELS).map(type => ({
      type,
      displayName: VIETNAMESE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
    
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get list of selectable values by type
exports.getList = async (req, res) => {
  try {
    const { type } = req.params;
    const { pageIndex, pageSize, search } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const model = getModelByType(type);
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      // Search in all string fields
      const stringFields = Object.keys(model.schema.paths).filter(
        path => model.schema.paths[path].instance === 'String'
      );
      filter.$or = stringFields.map(field => ({ [field]: regex }));
    }

    const total = await model.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await model.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get one selectable value
exports.getOne = async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = getModelByType(type);

    const result = await model.findById(id);
    if (!result) {
      return res.status(404).json({ error: true, message: "Không tìm thấy" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Create new selectable value
exports.create = async (req, res) => {
  try {
    const { type } = req.params;
    const model = getModelByType(type);

    // Validate data
    const validationErrors = validateData(type, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: true,
        message: validationErrors.join(", "),
      });
    }

    // Check for duplicates
    const schema = VALIDATION_SCHEMAS[type];
    const uniqueFields = schema.unique;
    
    for (const field of uniqueFields) {
      const existing = await model.findOne({ [field]: req.body[field] });
      if (existing) {
        const fieldLabel = schema.fields[field] || field;
        return res.status(409).json({
          error: true,
          message: `${fieldLabel} đã tồn tại`,
        });
      }
    }

    const result = await model.create(req.body);
    res.locals.documentId = result._id;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

// Update selectable value
exports.update = async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = getModelByType(type);

    // Validate data
    const validationErrors = validateData(type, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: true,
        message: validationErrors.join(", "),
      });
    }

    // Check for duplicates (excluding current item)
    const schema = VALIDATION_SCHEMAS[type];
    const uniqueFields = schema.unique;
    
    for (const field of uniqueFields) {
      const existing = await model.findOne({
        [field]: req.body[field],
        _id: { $ne: id }
      });
      if (existing) {
        const fieldLabel = schema.fields[field] || field;
        return res.status(409).json({
          error: true,
          message: `${fieldLabel} đã tồn tại`,
        });
      }
    }

    const result = await model.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ error: true, message: "Không tìm thấy" });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

// Delete selectable value
exports.delete = async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = getModelByType(type);

    const result = await model.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: true, message: "Không tìm thấy" });
    }

    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Bulk create selectable values
exports.createBulk = async (req, res) => {
  try {
    const { type } = req.params;
    const { items } = req.body;
    const model = getModelByType(type);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Danh sách items là bắt buộc và không được để trống",
      });
    }

    const schema = VALIDATION_SCHEMAS[type];
    const errors = [];
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Validate each item
      const validationErrors = validateData(type, item);
      if (validationErrors.length > 0) {
        errors.push(`Item ${i + 1}: ${validationErrors.join(", ")}`);
        continue;
      }

      // Check for duplicates
      const uniqueFields = schema.unique;
      let hasDuplicate = false;
      
      for (const field of uniqueFields) {
        const existing = await model.findOne({ [field]: item[field] });
        if (existing) {
          const fieldLabel = schema.fields[field] || field;
          errors.push(`Item ${i + 1}: ${fieldLabel} đã tồn tại`);
          hasDuplicate = true;
          break;
        }
      }

      if (!hasDuplicate) {
        try {
          const result = await model.create(item);
          results.push(result);
        } catch (err) {
          errors.push(`Item ${i + 1}: ${err.message}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: "Một số items không thể tạo",
        errors,
        created: results,
      });
    }

    res.status(201).json({
      message: "Tất cả items đã được tạo thành công",
      items: results,
    });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

// Get all values for a specific type (for dropdowns)
exports.getAllValues = async (req, res) => {
  try {
    const { type } = req.params;
    const model = getModelByType(type);

    const items = await model.find({}).sort({ createdAt: -1 }).exec();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}; 