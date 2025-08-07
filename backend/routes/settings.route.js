const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logActivityMiddleware } = require('../utils/activity-logger');
const resource = 'settings';

// Get all settings
router.get('/', authenticateToken, requirePermission(resource, 'read'), controller.getList);

// Get settings by category
router.get('/category/:category', authenticateToken, requirePermission(resource, 'read'), controller.getByCategory);

// Get setting by key
router.get('/key/:key', authenticateToken, requirePermission(resource, 'read'), controller.getByKey);

// Create or update setting
router.post('/', authenticateToken, requirePermission(resource, 'write'), logActivityMiddleware('create', resource), controller.upsert);

// Update setting
router.put('/:key', authenticateToken, requirePermission(resource, 'write'), logActivityMiddleware('update', resource), controller.upsert);

// Delete setting
router.delete('/:key', authenticateToken, requirePermission(resource, 'delete'), logActivityMiddleware('delete', resource), controller.delete);

// Export with template
router.post('/export', authenticateToken, requirePermission(resource, 'read'), controller.exportWithTemplate);

// Get available export templates
router.get('/export/templates', authenticateToken, requirePermission(resource, 'read'), controller.getExportTemplates);

module.exports = router;
