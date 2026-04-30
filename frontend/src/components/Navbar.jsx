import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { LogOut, Bell, Search, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Task assigned', time: '10m ago', read: false },
    { id: 2, text: 'Comment added', time: '1h ago', read: false },
    { id: 3, text: 'Deadline tomorrow', time: '5h ago', read: false },
  ])
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
      
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks, projects..." 
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-white/10 text-slate-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500/50"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl w-80 max-h-96 overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 z-50">
              <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
                <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 transition-colors hover:bg-white/5 ${n.read ? 'opacity-60' : ''}`}>
                    <p className="text-sm text-slate-300 font-medium">{n.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-white/10 sticky bottom-0 bg-slate-900/95 backdrop-blur-xl">
                <button 
                  onClick={markAllAsRead}
                  className="w-full flex justify-center items-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/5"
                >
                  <CheckCircle size={14} />
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-slate-700/50 hidden sm:block"></div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
