import { NavLink } from 'react-router-dom'
import { FolderKanban, CheckSquare, BarChart2, Users } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const Sidebar = () => {
  const { user } = useContext(AuthContext)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <BarChart2 size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 w-64 backdrop-blur-xl bg-slate-900/80 border-r border-white/10 hidden md:flex flex-col z-40">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-display font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <FolderKanban size={20} strokeWidth={2.5} />
          </div>
          TaskMaster
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Logged in as</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0) || <Users size={16} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-blue-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
