const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Get all projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id } = req.user;
    let projects;

    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: { manager: true, members: true, tasks: true }
      });
    } else {
      // For both MANAGER and TEAM_MEMBER
      // They should see projects where they are:
      // 1. The project manager
      // 2. A project member
      // 3. Assigned to at least one task in the project
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: id },
            { members: { some: { id } } },
            { tasks: { some: { assigneeId: id } } }
          ]
        },
        include: { manager: true, members: true, tasks: true }
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project
router.post('/', authenticate, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { name, description, status, priority, deadline, memberIds } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        managerId: req.user.id,
        members: {
          connect: memberIds ? memberIds.map(id => ({ id })) : []
        }
      },
      include: { manager: true, members: true }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, deadline, memberIds } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        members: memberIds ? {
          set: memberIds.map(id => ({ id }))
        } : undefined
      },
      include: { manager: true, members: true }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
