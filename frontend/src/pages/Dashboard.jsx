import { useState, useEffect, useContext, useRef } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, MoreVertical, Edit, Trash2, CheckSquare, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { DndContext, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

// --- Task Card (Sortable) ---
const TaskCard = ({ task, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task._id, 
    data: task 
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`relative backdrop-blur-xl bg-slate-800/80 border border-white/10 rounded-xl p-4 transition-all duration-300 group ${isDragging ? 'rotate-2 scale-105 shadow-2xl opacity-70 cursor-grabbing z-50 ring-1 ring-white/20' : 'cursor-grab hover:shadow-lg hover:border-white/20'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-slate-200 font-medium">{task.title}</h4>
        
        {/* 3-Dot Menu */}
        <div className="relative z-10" ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 backdrop-blur-xl bg-slate-900/95 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={() => { setShowMenu(false); onEdit(task); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => { setShowMenu(false); onDelete(task._id); }}
                className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/5"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
          <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} shadow-sm`}></span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
            {task.priority || 'Medium'}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  )
}

// --- Kanban Column ---
const KanbanColumn = ({ id, title, tasks, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const taskIds = tasks.map(t => t._id);
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl p-3 border transition-all duration-300 ${isOver ? 'bg-blue-500/10 border-2 border-dashed border-blue-500/30' : 'bg-slate-900/50 border-white/5'}`}
    >
      <div className="flex justify-between items-center mb-4 px-3 pt-2">
        <h3 className="text-sm font-bold text-slate-300">{title}</h3>
        <span className="bg-slate-800 border border-white/5 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full shadow-inner">{tasks.length}</span>
      </div>
      
      <div className="flex-1 space-y-3 min-h-[400px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />)}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-6 text-center space-y-3">
            <ListTodo size={28} className="opacity-40" />
            <p className="text-sm font-medium">No tasks in {title}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Main Dashboard ---
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', projectId: '', assignedTo: '', status: 'Pending', priority: 'Medium', dueDate: '' });

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, projRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/tasks'),
        api.get('/api/projects')
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
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
    fetchData();
  }, [user]);

  // --- Drag and Drop Logic ---
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    // Determine the new status. If dropped over a task, find that task's status. If dropped over a column, use the column id.
    const overId = over.id;
    const overTask = tasks.find(t => t._id === overId);
    const newStatus = overTask ? overTask.status : overId; 

    const task = tasks.find(t => t._id === taskId);
    
    if (task && task.status !== newStatus) {
      // 1. Optimistic UI update - move card instantly
      const oldTasks = [...tasks];
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      try {
        // 2. PATCH request
        await api.put(`/api/tasks/${taskId}`, { status: newStatus });
        // 4. On success: toast.success
        toast.success("Task moved");
        const statsRes = await api.get('/api/dashboard/stats');
        setStats(statsRes.data);
      } catch (error) {
        console.error(error);
        // 3. On error: revert + toast.error
        setTasks(oldTasks);
        toast.error("Failed to move task");
      }
    }
  };

  // --- CRUD Operations ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTask) {
        await api.put(`/api/tasks/${currentTask._id}`, formData);
        toast.success("Task updated");
      } else {
        await api.post('/api/tasks', formData);
        toast.success("Task created");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task");
    }
  };

  const confirmDelete = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
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
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  if (!stats) {
    return (
      <div className="flex space-x-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 w-full bg-slate-800/50 rounded-2xl border border-white/10"></div>
        ))}
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* Header & Stats */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Dashboard Overview</h1>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus size={18} strokeWidth={2.5} /> Create Task
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Tasks</p>
            <h3 className="text-3xl font-display font-bold text-white flex items-center justify-between">
              {stats.totalTasks} <CheckSquare size={24} className="text-blue-500/50 group-hover:text-blue-400 transition-colors" />
            </h3>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">In Progress</p>
            <h3 className="text-3xl font-display font-bold text-white flex items-center justify-between">
              {stats.inProgressTasks} <Clock size={24} className="text-amber-500/50 group-hover:text-amber-400 transition-colors" />
            </h3>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Completed</p>
            <h3 className="text-3xl font-display font-bold text-white flex items-center justify-between">
              {stats.completedTasks} <CheckSquare size={24} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
            </h3>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overdue</p>
            <h3 className="text-3xl font-display font-bold text-white flex items-center justify-between">
              {stats.overdueTasks} <AlertCircle size={24} className="text-rose-500/50 group-hover:text-rose-400 transition-colors" />
            </h3>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="backdrop-blur-xl bg-slate-900/30 border border-white/5 rounded-3xl p-4">
        <DndContext 
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn id="Pending" title="TO DO" tasks={pendingTasks} onEdit={openModal} onDelete={confirmDelete} />
            <KanbanColumn id="In Progress" title="IN PROGRESS" tasks={inProgressTasks} onEdit={openModal} onDelete={confirmDelete} />
            <KanbanColumn id="Completed" title="DONE" tasks={completedTasks} onEdit={openModal} onDelete={confirmDelete} />
          </div>
        </DndContext>
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
                Delete
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
                  placeholder="What needs to be done?"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Description</label>
                <textarea
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] placeholder:text-slate-600"
                  value={formData.description}
                  placeholder="Add details..."
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
                
                {user?.role === 'Admin' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Assignee</label>
                    <select
                      className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                      <option value="" className="bg-slate-900">Unassigned</option>
                      {users.map(u => <option key={u._id} value={u._id} className="bg-slate-900">{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-white/5 pt-5 mt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Status</label>
                  <select
                    className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Pending" className="bg-slate-900">To Do</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Completed" className="bg-slate-900">Done</option>
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
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
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

export default Dashboard;
