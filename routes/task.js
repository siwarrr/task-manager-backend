const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const protect = require('../middleware/auth');

//Create a task
router.post('/', protect, taskController.createTask);

//Retrieve all tasks in a project
router.get('/project/:projectId', protect, taskController.getTasksByProject);

//Retrieve a task by ID
router.get('/:id', protect, taskController.getTaskById);

//Update a task
router.put('/:id', protect, taskController.updateTask);

//Toggle the status of a task (completed / not completed)
router.patch('/:id/toggle', protect, taskController.toggleTaskCompletion);

//Delete a task
router.delete('/:id', protect, taskController.deleteTask);

//Retrieve all tasks assigned to the current user
router.get('/assigned-to/me', protect, taskController.getTasksAssignedToUser);

//Filter tasks by priority
router.get('/project/:projectId/filter', protect, taskController.filterTasksByPriority);

module.exports = router;