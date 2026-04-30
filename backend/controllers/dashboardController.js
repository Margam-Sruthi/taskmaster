const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    let taskQuery = {};
    if (req.user.role === 'Member') {
      taskQuery.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'In Progress' });
    const overdueTasks = await Task.countDocuments({ ...taskQuery, status: 'Overdue' });
    const highPriorityTasks = await Task.countDocuments({ ...taskQuery, priority: 'High', status: { $ne: 'Completed' } });
    
    // In addition, total projects count for Admin
    let projectsCount = 0;
    let usersCount = 0;
    if (req.user.role === 'Admin') {
      projectsCount = await Project.countDocuments();
      usersCount = await User.countDocuments();
    }

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      highPriorityTasks,
      projectsCount,
      usersCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
