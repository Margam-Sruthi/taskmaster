import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'backdrop-blur-xl bg-slate-900/90 border border-white/20 text-white shadow-2xl rounded-2xl',
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
