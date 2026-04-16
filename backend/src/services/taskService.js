const prisma = require('../prisma');
const AppError = require('../utils/AppError');

exports.getTasksByProject = async (projectId, user) => {
  const { role, id } = user;

  if (role !== 'ADMIN') {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { managerId: id },
          { members: { some: { id } } },
          { tasks: { some: { assigneeId: id } } }
        ]
      }
    });

    if (!project) {
      throw new AppError('Access denied to this project', 403);
    }
  }

  return prisma.task.findMany({
    where: { projectId },
    include: { assignee: true, project: true }
  });
};

exports.getMyTasks = async (userId) => {
  return prisma.task.findMany({
    where: { assigneeId: userId },
    include: { project: true, assignee: true },
    orderBy: { deadline: 'asc' }
  });
};

exports.createTask = async (data) => {
  const { name, description, status, priority, deadline, projectId, assigneeId } = data;
  
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

  await this.updateProjectProgress(projectId);

  if (assigneeId) {
    await prisma.notification.create({
      data: {
        message: `You have been assigned to a new task: ${name}`,
        type: 'TASK_ASSIGNED',
        userId: assigneeId
      }
    });
  }

  return task;
};

exports.updateTask = async (id, data) => {
  const { name, description, status, priority, deadline, assigneeId, progress } = data;
  
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

  await this.updateProjectProgress(task.projectId);

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

  return task;
};

exports.deleteTask = async (id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  const projectId = task.projectId;
  await prisma.task.delete({ where: { id } });
  
  await this.updateProjectProgress(projectId);
};

exports.updateProjectProgress = async (projectId) => {
  const tasks = await prisma.task.findMany({
    where: { projectId }
  });

  if (tasks.length === 0) return;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  if (progressPercentage === 100) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' }
    });
  } else {
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
};
