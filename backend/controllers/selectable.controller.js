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

// Validation schemas for each selectable type
const VALIDATION_SCHEMAS = {
  plate_colors: {
    required: ["dictionary", "name"],
    unique: ["dictionary"],
  },
  paid_amounts: {
    required: ["name", "value"],
    unique: ["value"],
  },
  vehicle_types: {
    required: ["name", "value"],
    unique: ["value"],
  },
  return_types: {
    required: ["dictionary", "name"],
    unique: ["dictionary"],
  },
};

// Helper function to get model by type
const getModelByType = (type) => {
  const model = SELECTABLE_MODELS[type];
  if (!model) {
    throw new Error(`Invalid selectable type: ${type}`);
  }
  return model;
};

// Helper function to validate data
const validateData = (type, data) => {
  const schema = VALIDATION_SCHEMAS[type];
  if (!schema) {
    throw new Error(`Invalid selectable type: ${type}`);
  }

  const errors = [];
  
  // Check required fields
  schema.required.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  return errors;
};

// Get all selectable types
exports.getSelectableTypes = async (req, res) => {
  try {
    const types = Object.keys(SELECTABLE_MODELS).map(type => ({
      type,
      displayName: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
      return res.status(404).json({ error: true, message: "Not found" });
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
        return res.status(409).json({
          error: true,
          message: `${field} already exists`,
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
        return res.status(409).json({
          error: true,
          message: `${field} already exists`,
        });
      }
    }

    const result = await model.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ error: true, message: "Not found" });
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
      return res.status(404).json({ error: true, message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
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
        message: "Items array is required and cannot be empty",
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
          errors.push(`Item ${i + 1}: ${field} already exists`);
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
        message: "Some items failed to create",
        errors,
        created: results,
      });
    }

    res.status(201).json({
      message: "All items created successfully",
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