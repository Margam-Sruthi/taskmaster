import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit, FolderKanban } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { user } = useContext(AuthContext);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProject) {
        await api.put(`/api/projects/${currentProject._id}`, formData);
      } else {
        await api.post('/api/projects', formData);
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setCurrentProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (project = null) => {
    setCurrentProject(project);
    setFormData(project ? { name: project.name, description: project.description } : { name: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Projects</h1>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <h3 className="text-xl font-display font-bold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h3>
            <p className="text-slate-400 text-sm flex-1 mb-6 leading-relaxed">{project.description}</p>
            <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/10">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                By {project.createdBy?.name || 'Unknown'}
              </span>
              {user?.role === 'Admin' && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(project)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" aria-label="Edit Project">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors" aria-label="Delete Project">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex flex-col items-center justify-center space-y-3">
              <FolderKanban size={32} className="opacity-20" />
              <p>No projects found.</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-display font-bold text-white mb-6">{currentProject ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Project Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  value={formData.name}
                  placeholder="Project title..."
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                <textarea
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px]"
                  rows="3"
                  value={formData.description}
                  placeholder="Project details..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
                  {currentProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
