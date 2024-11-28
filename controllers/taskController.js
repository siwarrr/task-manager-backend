const Task = require('../models/task');
const Project = require('../models/project');

exports.createTask = async (req, res) => {
    const { title, description, assignedTo, dueDate, priority, project } = req.body;

    try {
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const task = new Task({
            title,
            description,
            assignedTo,
            user: req.user._id,
            project,
            dueDate,
            priority
        });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
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

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ messgae: 'Error updatinf task', error });
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