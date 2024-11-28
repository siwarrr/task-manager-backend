const Project = require('../models/project');
const Task = require('../models/task'); 

exports.createProject = async (req, res) => {
    const { name, description, members } = req.body;

    try {
        const project = new Project({
            name,
            description,
            owner: req.user._id,
            members: members ? [...members, req.user._id] : [req.user._id]
        });

        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        }).populate('members', 'name email');

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
              .populate('members', 'name email')
              .populate('owner', 'name email');

              if (!project) {
                return res.status(404).json({ message: 'Project not found' });
              }

              res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { members, ...rest } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updatedMembers = members
            ? Array.from(new Set([...project.members.map(String), ...members]))
            : project.members;

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { ...rest, members: updatedMembers },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        const tasksDeleted = await Task.deleteMany({ project: req.params.id });
        console.log(`Deleted ${tasksDeleted.deletedCount} tasks associated with the project.`);

        await Project.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Project and associated tasks deleted successfully' });
    } catch (error) {
        console.error('Error during project deletion:', error);
        res.status(500).json({ message: 'Error deleting project', error: error.message || error });
    }
};