const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');

// Global search across projects, tasks, and users
router.get('/', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    const { role, id } = req.user;

    if (!q) {
      return res.json({ projects: [], tasks: [], users: [] });
    }

    const query = q; // Use raw query, Prisma SQLite contains is case-insensitive by default

    // 1. Search Projects (with role-based access)
    let projects;
    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } }
              ]
            },
            {
              OR: [
                { managerId: id },
                { members: { some: { id } } },
                { tasks: { some: { assigneeId: id } } }
              ]
            }
          ]
        },
        take: 5
      });
    }

    // 2. Search Tasks (related to projects user has access to)
    let tasks;
    if (role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: { project: true },
        take: 5
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } }
              ]
            },
            {
              project: {
                OR: [
                  { managerId: id },
                  { members: { some: { id } } },
                  { tasks: { some: { assigneeId: id } } }
                ]
              }
            }
          ]
        },
        include: { project: true },
        take: 5
      });
    }

    // 3. Search Users (Admin/Manager can see everyone, Team Member can see only project colleagues?)
    // For simplicity, let's allow searching all users but only name/email
    let users = [];
    if (role === 'ADMIN' || role === 'MANAGER') {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        },
        select: { id: true, name: true, email: true, role: true },
        take: 5
      });
    }

    res.json({ projects, tasks, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
