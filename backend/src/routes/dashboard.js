const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');

// Get dashboard metrics
router.get('/metrics', authenticate, async (req, res) => {
  try {
    const { role, id } = req.user;
    let projects;

    if (role === 'ADMIN') {
      projects = await prisma.project.findMany();
    } else if (role === 'MANAGER') {
      projects = await prisma.project.findMany({ where: { managerId: id } });
    } else {
      projects = await prisma.project.findMany({ where: { members: { some: { id } } } });
    }

    const metrics = {
      totalProjects: projects.length,
      ongoing: projects.filter(p => p.status === 'ONGOING').length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      delayed: projects.filter(p => p.status === 'DELAYED').length,
      // Grouping for charts
      byStatus: [
        { name: 'Ongoing', value: projects.filter(p => p.status === 'ONGOING').length },
        { name: 'Completed', value: projects.filter(p => p.status === 'COMPLETED').length },
        { name: 'Delayed', value: projects.filter(p => p.status === 'DELAYED').length }
      ],
      byPriority: [
        { name: 'Low', value: projects.filter(p => p.priority === 'LOW').length },
        { name: 'Medium', value: projects.filter(p => p.priority === 'MEDIUM').length },
        { name: 'High', value: projects.filter(p => p.priority === 'HIGH').length }
      ]
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
