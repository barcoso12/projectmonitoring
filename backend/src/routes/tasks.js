const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all tasks for a project
router.get('/project/:projectId', authenticate, taskController.getTasksByProject);

// Get all tasks assigned to the current user
router.get('/my-tasks', authenticate, taskController.getMyTasks);

// Create task
router.post('/', authenticate, authorize(['ADMIN', 'MANAGER']), taskController.createTask);

// Update task
router.put('/:id', authenticate, taskController.updateTask);

// Delete task
router.delete('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), taskController.deleteTask);

module.exports = router;
