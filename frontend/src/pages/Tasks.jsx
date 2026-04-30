import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', projectId: '', assignedTo: '', status: 'Pending', priority: 'Medium', dueDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useContext(AuthContext);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const projRes = await api.get('/api/projects');
      setProjects(projRes.data);
      if (user?.role === 'Admin') {
        const usersRes = await api.get('/api/auth/users');
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchDependencies();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTask) {
        await api.put(`/api/tasks/${currentTask._id}`, formData);
        toast.success('Task updated');
      } else {
        await api.post('/api/tasks', formData);
        toast.success('Task created');
      }
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save task');
    }
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/api/tasks/${taskToDelete._id}`);
      toast.success('Task deleted');
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', projectId: projects[0]?._id || '', assignedTo: '', status: 'Pending', priority: 'Medium', dueDate: '' });
    setCurrentTask(null);
  };

  const openModal = (task = null) => {
    setCurrentTask(task);
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId?._id,
        assignedTo: task.assignedTo?._id || '',
        status: task.status,
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const statusColors = {
    'Pending': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'Completed': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'Overdue': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };

  const priorityStyles = {
    'High': 'bg-red-500/20 text-red-400 border border-red-500/30',
    'Medium': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'Low': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed' || !dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const priorityValues = { 'High': 1, 'Medium': 2, 'Low': 3 };
    const pA = priorityValues[a.priority] || 2;
    const pB = priorityValues[b.priority] || 2;
    return pA - pB;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Tasks</h1>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus size={18} strokeWidth={2.5} /> New Task
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All" className="bg-slate-900">All Status</option>
          <option value="Pending" className="bg-slate-900">Pending</option>
          <option value="In Progress" className="bg-slate-900">In Progress</option>
          <option value="Completed" className="bg-slate-900">Completed</option>
        </select>
        {(searchTerm || statusFilter !== 'All') && (
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <X size={16} /> Clear
          </button>
        )}
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <th className="p-5 w-1/4">Task Name</th>
                <th className="p-5">Project</th>
                <th className="p-5">Assignee</th>
                <th className="p-5">Due Date</th>
                <th className="p-5">Status</th>
                <th className="p-5">Priority</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <tr key={task._id} className={`hover:bg-white/5 transition-colors duration-200 ${overdue ? 'bg-rose-500/5' : ''}`}>
                    <td className="p-5">
                      <p className="font-medium text-slate-200">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px] mt-1">{task.description}</p>
                    </td>
                    <td className="p-5 text-sm text-slate-400">{task.projectId?.name || 'N/A'}</td>
                    <td className="p-5 text-sm text-slate-400">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td className="p-5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                        {overdue && (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityStyles[task.priority || 'Medium']}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openModal(task)} 
                          title="Edit task"
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(task)} 
                          title="Delete task"
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Search size={32} className="opacity-20" />
                      <p>No tasks found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="backdrop-blur-2xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6">
              <Trash2 size={28} />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Delete this task?</h2>
            <p className="text-sm text-slate-400 mb-8 px-4">
              Are you sure you want to delete <span className="text-white font-medium">"{taskToDelete?.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => { setShowDeleteModal(false); setTaskToDelete(null); }} 
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 transition-all"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="backdrop-blur-2xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-display font-bold text-white mb-6">{currentTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Task Title</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                  value={formData.title}
                  placeholder="Task title..."
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Description</label>
                <textarea
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] placeholder:text-slate-600"
                  value={formData.description}
                  placeholder="Task details..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Project</label>
                  <select
                    required
                    className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  >
                    <option value="" className="bg-slate-900">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id} className="bg-slate-900">{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Assign To</label>
                  <select
                    className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="" className="bg-slate-900">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id} className="bg-slate-900">{u.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-white/5 pt-5 mt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Status</label>
                  <select
                    className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Pending" className="bg-slate-900">Pending</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Priority</label>
                  <select
                    className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="High" className="bg-slate-900">High</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="Low" className="bg-slate-900">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:dark]"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
                  {currentTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
