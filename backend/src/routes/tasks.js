const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Get all tasks for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignee: true, project: true }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task
router.post('/', authenticate, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { name, description, status, priority, deadline, projectId, assigneeId } = req.body;
    const task = await prisma.task.create({
      data: {
        name,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        projectId,
        assigneeId
      },
      include: { assignee: true, project: true }
    });

    // Update project progress
    await updateProjectProgress(projectId);

    // Create notification for assignee
    if (assigneeId) {
      await prisma.notification.create({
        data: {
          message: `You have been assigned to a new task: ${name}`,
          type: 'TASK_ASSIGNED',
          userId: assigneeId
        }
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, deadline, assigneeId, progress } = req.body;
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        name,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        assigneeId,
        progress: progress ? parseInt(progress) : undefined
      },
      include: { assignee: true, project: true }
    });

    // Update project progress
    await updateProjectProgress(task.projectId);

    // Create notification if status is completed
    if (status === 'COMPLETED') {
      const project = await prisma.project.findUnique({ 
        where: { id: task.projectId },
        select: { managerId: true, name: true }
      });
      await prisma.notification.create({
        data: {
          message: `Task "${task.name}" in project "${project.name}" has been completed.`,
          type: 'STATUS_CHANGE',
          userId: project.managerId
        }
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const projectId = task.projectId;
    await prisma.task.delete({ where: { id } });
    
    // Update project progress
    await updateProjectProgress(projectId);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper to update project status based on tasks
async function updateProjectProgress(projectId) {
  const tasks = await prisma.task.findMany({
    where: { projectId }
  });

  if (tasks.length === 0) return;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  // If all tasks are completed, mark project as completed
  if (progressPercentage === 100) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' }
    });
  } else {
    // Check if any task is overdue and update project status to DELAYED if needed
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now).length;
    if (overdueTasks > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'DELAYED' }
      });
    } else {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'ONGOING' }
      });
    }
  }
}

module.exports = router;
