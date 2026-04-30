import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Mail, Lock, User, Shield } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member' })
  const [error, setError] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(formData.name, formData.email, formData.password, formData.role)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 font-display">Create Account</h1>
        <p className="text-slate-400 mb-8">Join Team Task Manager</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input 
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Role</label>
            <div className="relative">
              <Shield className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              >
                <option value="Member" className="bg-slate-900">Member</option>
                <option value="Admin" className="bg-slate-900">Admin</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl py-3.5 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 mt-2"
          >
            Create Account
          </button>
        </form>

        <p className="text-slate-400 text-center mt-8">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
