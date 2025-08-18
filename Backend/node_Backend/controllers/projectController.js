const CollaborativeProject = require('../models/CollaborativeProject');

// Create Collaborative Project
exports.createProject = async (req, res) => {
  const project = new CollaborativeProject(req.body);
  try {
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  const projects = await CollaborativeProject.find();
  res.json(projects);
};

// Update Project
exports.updateProject = async (req, res) => {
  const project = await CollaborativeProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(project);
};

// Delete Project
exports.deleteProject = async (req, res) => {
  await CollaborativeProject.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
};
