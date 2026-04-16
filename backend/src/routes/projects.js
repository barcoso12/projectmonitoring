const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all projects
router.get('/', authenticate, projectController.getAllProjects);

// Create project
router.post('/', authenticate, authorize(['ADMIN', 'MANAGER']), projectController.createProject);

// Update project
router.put('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), projectController.updateProject);

// Delete project
router.delete('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), projectController.deleteProject);

module.exports = router;
