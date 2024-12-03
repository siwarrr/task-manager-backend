const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose'); 

exports.createTask = async (req, res) => {
    const { title, description, assignedTo, dueDate, priority, project } = req.body;

    try {
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (priority && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid priority value' });
        }        

        const assignedToIds = [];
        if (assignedTo && Array.isArray(assignedTo)) {
            for (const emailOrId of assignedTo) {
                if (mongoose.isValidObjectId(emailOrId)) {
                    assignedToIds.push(emailOrId);
                } else {
                    const user = await User.findOne({ email: emailOrId });
                    if (user) {
                        assignedToIds.push(user._id);
                    } else {
                        return res.status(400).json({ message: `User not found for email: ${emailOrId}` });
                    }
                }
            }
        }

        const task = new Task({
            title,
            description,
            assignedTo: assignedToIds,
            user: req.user._id, 
            project,
            dueDate,
            priority,
        });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if(!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'name email')
            .populate('user', 'name email');

        res.status(200).json(tasks);
    }catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('user', 'name email');
    
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
    
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo, ...updates } = req.body;

        if (assignedTo && Array.isArray(assignedTo)) {
            const assignedToIds = [];
            for (const emailOrId of assignedTo) {
                if (mongoose.isValidObjectId(emailOrId)) {
                    assignedToIds.push(emailOrId);
                } else {
                    const user = await User.findOne({ email: emailOrId });
                    if (user) {
                        assignedToIds.push(user._id);
                    } else {
                        return res.status(400).json({ message: `User not found for email: ${emailOrId}` });
                    }
                }
            }
            updates.assignedTo = assignedToIds;
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};

exports.toggleTaskCompletion = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.completed = !task.completed;
        await task.save();
        
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling task completion', error });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
};

exports.getTasksAssignedToUser = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('project', 'name description')
            .populate('user', 'name email');

            res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks' , error });
    }
};

exports.filterTasksByPriority = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { priority } = req.query;
    
        const project = await Project.findById(projectId);
    
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
    
        const tasks = await Task.find({ project: projectId, priority })
            .populate('assignedTo', 'name email')
            .populate('user', 'name email');
    
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering tasks', error });
    }
};