const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;
    
    // If Member, they can see all tasks for now, or we can restrict. We'll allow seeing all tasks within a project.
    
    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate, priority } = req.body;
    const task = new Task({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admins can update everything. Members can only update status if assigned to them.
    if (req.user.role === 'Admin') {
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
    } else {
      if (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) {
        task.status = req.body.status || task.status;
      } else {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
