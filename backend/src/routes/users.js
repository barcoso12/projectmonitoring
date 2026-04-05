const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;
    
    // Check if user is editing their own profile or is an admin
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role: req.user.role === 'ADMIN' ? role : undefined // Only admin can update roles
      },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
