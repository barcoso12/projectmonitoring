const projectService = require('../services/projectService');
const catchAsync = require('../utils/catchAsync');

exports.getAllProjects = catchAsync(async (req, res) => {
  const projects = await projectService.getAllProjects(req.user);
  res.json(projects);
});

exports.createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json(project);
});

exports.updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json(project);
});

exports.deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.json({ message: 'Project deleted' });
});
