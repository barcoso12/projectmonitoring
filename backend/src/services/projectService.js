const prisma = require('../prisma');

exports.getAllProjects = async (user) => {
  const { role, id } = user;
  
  if (role === 'ADMIN') {
    return prisma.project.findMany({
      include: { manager: true, members: true, tasks: true }
    });
  }

  return prisma.project.findMany({
    where: {
      OR: [
        { managerId: id },
        { members: { some: { id } } },
        { tasks: { some: { assigneeId: id } } }
      ]
    },
    include: { manager: true, members: true, tasks: true }
  });
};

exports.createProject = async (data, managerId) => {
  const { name, description, status, priority, deadline, memberIds } = data;
  return prisma.project.create({
    data: {
      name,
      description,
      status,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      managerId,
      members: {
        connect: memberIds ? memberIds.map(id => ({ id })) : []
      }
    },
    include: { manager: true, members: true }
  });
};

exports.updateProject = async (id, data) => {
  const { name, description, status, priority, deadline, memberIds } = data;
  return prisma.project.update({
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
};

exports.deleteProject = async (id) => {
  return prisma.project.delete({ where: { id } });
};
