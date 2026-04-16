const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

exports.getTasksByProject = catchAsync(async (req, res) => {
  const tasks = await taskService.getTasksByProject(req.params.projectId, req.user);
  res.json(tasks);
});

exports.getMyTasks = catchAsync(async (req, res) => {
  const tasks = await taskService.getMyTasks(req.user.id);
  res.json(tasks);
});

exports.createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json(task);
});

exports.updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
});

exports.deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ message: 'Task deleted' });
});
