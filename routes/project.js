const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const protect = require('../middleware/auth');

// Create a project
router.post('/', protect, projectController.createProject);

// Retrieve a user's projects
router.get('/', protect, projectController.getUserProjects);

// Retrieve a specific project by ID
router.get('/:id', protect, projectController.getProjectById);

// Update a project
router.put('/:id', protect, projectController.updateProject);

// Delete a project
router.delete('/:id', protect, projectController.deleteProject);

module.exports = router;
