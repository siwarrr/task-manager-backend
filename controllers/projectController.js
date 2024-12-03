const Project = require('../models/project');
const Task = require('../models/task'); 
const mongoose = require('mongoose');
const User = require('../models/user');

exports.createProject = async (req, res) => {
    const { name, description, members } = req.body;

    try {
        const memberIds = [];
        if (members && Array.isArray(members)) {
            for (const emailOrId of members) {
                if (mongoose.isValidObjectId(emailOrId)) {
                    memberIds.push(emailOrId);
                } else {
                    const user = await User.findOne({ email: emailOrId });
                    if (user) {
                        memberIds.push(user._id);
                    } else {
                        return res.status(400).json({ error: `User not found for email: ${emailOrId}` });
                    }
                }
            }
        }

        memberIds.push(req.user._id);

        const uniqueMemberIds = [...new Set(memberIds.map(String))];

        const project = new Project({
            name,
            description,
            owner: req.user._id,
            members: uniqueMemberIds,
        });

        const savedProject = await project.save();
        res.status(201).json({ project: savedProject });
    } catch (error) {
        console.error('Error creating project:', error);
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

        const updatedMembers = [];
        if (members && Array.isArray(members)) {
            for (const emailOrId of members) {
                if (mongoose.isValidObjectId(emailOrId)) {
                    updatedMembers.push(emailOrId);
                } else {
                    const user = await User.findOne({ email: emailOrId });
                    if (user) {
                        updatedMembers.push(user._id);
                    } else {
                        return res.status(400).json({ message: `User not found for email: ${emailOrId}` });
                    }
                }
            }
        }

        // Conserver les membres existants
        const uniqueMembers = [
            ...new Set([...project.members.map(String), ...updatedMembers]),
        ];

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { ...rest, members: uniqueMembers },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
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