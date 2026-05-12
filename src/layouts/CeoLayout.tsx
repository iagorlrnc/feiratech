import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Map, Users, LogOut, Menu, Crown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function CeoLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = location.pathname.includes('/login')

  const handleSignOut = async () => {
    await signOut()
    navigate('/ceo/login')
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-earth-950">
        <Outlet />
      </div>
    )
  }

  const navItems = [
    { to: '/ceo/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ceo/stores', icon: Store, label: 'Lojas' },
    { to: '/ceo/map', icon: Map, label: 'Mapa da Feira' },
    { to: '/ceo/accounts', icon: Users, label: 'Contas Admin' },
  ]

  return (
    <div className="min-h-screen bg-earth-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-earth-900 to-earth-950 border-r border-earth-800
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-earth-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-feira-400 to-feira-600 rounded-xl flex items-center justify-center shadow-lg shadow-feira-500/30">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-earth-50">FeiraTech</div>
              <div className="text-xs text-feira-400 font-medium">CEO Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-feira-500/20 text-feira-300 border border-feira-500/30'
                    : 'text-earth-400 hover:text-earth-100 hover:bg-earth-800/60'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-earth-800">
          {user && (
            <div className="mb-3 px-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-feira-500/20 text-feira-300 border border-feira-500/30">CEO</span>
              </div>
              <div className="text-sm font-medium text-earth-200 truncate">{user.full_name || user.email}</div>
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

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-earth-800 bg-earth-900">
          <button onClick={() => setMobileOpen(true)} className="text-earth-400 hover:text-earth-100">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-earth-100">CEO Panel</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
