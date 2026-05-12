import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, LayoutDashboard, Store, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register')

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-earth-950">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earth-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-earth-900 border-r border-earth-800 flex flex-col
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-earth-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-feira-500 rounded-xl flex items-center justify-center shadow-lg shadow-feira-500/30">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-earth-50">FeiraTech</div>
              <div className="text-xs text-earth-400">Painel do Lojista</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-feira-500/20 text-feira-400 border border-feira-500/30'
                  : 'text-earth-400 hover:text-earth-100 hover:bg-earth-800'
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/store"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-feira-500/20 text-feira-400 border border-feira-500/30'
                  : 'text-earth-400 hover:text-earth-100 hover:bg-earth-800'
              }`
            }
          >
            <Store size={18} />
            Minha Loja
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-earth-800">
          {user && (
            <div className="mb-3 px-2">
              <div className="text-sm font-medium text-earth-200 truncate">{user.full_name || user.email}</div>
              <div className="text-xs text-earth-500 truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-earth-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-earth-800 bg-earth-900">
          <button onClick={() => setMobileOpen(true)} className="text-earth-400 hover:text-earth-100">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-earth-100">FeiraTech Admin</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
