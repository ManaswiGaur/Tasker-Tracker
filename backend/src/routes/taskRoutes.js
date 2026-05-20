const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1, 'Project ID is required'),
  assignedTo: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
});

// GET ALL TASKS
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// CREATE TASK
router.post('/', verifyToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const parsed = taskSchema.parse({
      ...req.body,
      projectId: String(req.body.projectId),
      assignedTo: req.body.assignedTo ? String(req.body.assignedTo) : null,
    });

    const project = await prisma.project.findUnique({ where: { id: parsed.projectId } });
    if (!project || project.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'Not allowed or project not found' });
    }

    if (parsed.assignedTo) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: parsed.projectId, userId: parsed.assignedTo } },
      });
      if (!member) return res.status(400).json({ error: 'User must be a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description || '',
        projectId: parsed.projectId,
        assignedTo: parsed.assignedTo || null,
        priority: parsed.priority || 'MEDIUM',
        dueDate: new Date(parsed.dueDate),
        status: parsed.status || 'TO_DO',
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: error.errors[0].message });
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// UPDATE TASK
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.project.createdById !== req.user.userId) return res.status(403).json({ error: 'Not allowed' });

    const parsed = taskSchema.parse({
      ...req.body,
      projectId: String(req.body.projectId),
      assignedTo: req.body.assignedTo ? String(req.body.assignedTo) : null,
    });

    if (parsed.assignedTo) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: parsed.projectId, userId: parsed.assignedTo } },
      });
      if (!member) return res.status(400).json({ error: 'User must be a project member' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: parsed.title,
        description: parsed.description || '',
        projectId: parsed.projectId,
        assignedTo: parsed.assignedTo || null,
        priority: parsed.priority || 'MEDIUM',
        dueDate: new Date(parsed.dueDate),
        status: parsed.status || task.status,
      },
    });
    res.json(updated);
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: error.errors[0].message });
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// UPDATE STATUS
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const allowed = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE TASK
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.project.createdById !== req.user.userId) return res.status(403).json({ error: 'Not allowed' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
