const { Settings } = require('../models/settings');
const { parsePagination } = require('../utils/helper');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;
const { UPLOAD_BUCKET } = require('../constants');

// Get all settings
exports.getList = async (req, res) => {
  try {
    const { pageIndex, pageSize, search, category } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ key: regex }, { description: regex }];
    }
    if (category) {
      filter.category = category;
    }

    const total = await Settings.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await Settings.find(filter)
      .sort({ category: 1, key: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get setting by key
exports.getByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ error: true, message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Create or update setting
exports.upsert = async (req, res) => {
  try {
    const { key, value, description, category } = req.body;
    const updatedBy = req.user?.username || 'system';

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value,
        description,
        category,
        updatedBy,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

// Delete setting
exports.delete = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOneAndDelete({ key });
    
    if (!setting) {
      return res.status(404).json({ error: true, message: 'Setting not found' });
    }
    
    res.json({ message: 'Setting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get settings by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Settings.find({ category }).sort({ key: 1 });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// Export data using template
exports.exportWithTemplate = async (req, res) => {
  try {
    const { resource, data, filename } = req.body;

    // Get template path from settings
    const templateKey = `export_template_${resource}`;
    const templateSetting = await Settings.findOne({ key: templateKey });
    
    if (!templateSetting || !templateSetting.value) {
      return res.status(404).json({ 
        error: true, 
        message: `No template found for resource: ${resource}. Please upload a template in settings.` 
      });
    }

    const templatePath = path.join(UPLOAD_BUCKET, templateSetting.value.replace('/uploads/', ''));
    
    try {
      await fs.access(templatePath);
    } catch (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'Template file not found. Please re-upload the template.' 
      });
    }

    // Load workbook from template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res.status(400).json({ error: true, message: 'Template has no worksheets' });
    }

    // Find data insertion point (look for a row with placeholder or start from row 2)
    let dataStartRow = 2; // Default to row 2 (after header)
    
    // Look for placeholder row (you can customize this logic)
    for (let row = 1; row <= worksheet.rowCount; row++) {
      const currentRow = worksheet.getRow(row);
      const firstCell = currentRow.getCell(1);
      if (firstCell.value && firstCell.value.toString().includes('{{DATA}}')) {
        dataStartRow = row;
        // Remove the placeholder row
        worksheet.spliceRows(row, 1);
        break;
      }
    }

    // Insert data
    if (data && Array.isArray(data)) {
      data.forEach((item, index) => {
        const row = worksheet.getRow(dataStartRow + index);
        
        // Map data to columns (you can customize this mapping)
        let colIndex = 1;
        Object.keys(item).forEach(key => {
          const cell = row.getCell(colIndex);
          cell.value = item[key] || '';
          colIndex++;
        });
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'export.xlsx'}"`);
    
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: true, message: err.message });
  }
};

// Get available export templates
exports.getExportTemplates = async (req, res) => {
  try {
    const templates = await Settings.find({ 
      key: { $regex: /^export_template_/ },
      category: 'export'
    }).sort({ key: 1 });

    const templateList = templates.map(template => ({
      key: template.key,
      resource: template.key.replace('export_template_', ''),
      description: template.description,
      hasFile: !!template.value,
    }));

    res.json(templateList);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
