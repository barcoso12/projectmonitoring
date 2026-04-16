const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
});
