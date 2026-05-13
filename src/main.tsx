import React from "react"
import ReactDOM from "react-dom/client"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom"
import "./index.css"
import { useEffect } from "react"

// Public pages
import PublicLayout from "./layouts/PublicLayout"
import HomePage from "./pages/public/HomePage"

// Admin pages
import AdminLayout from "./layouts/AdminLayout"
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import AdminRegisterPage from "./pages/admin/AdminRegisterPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminStorePage from "./pages/admin/AdminStorePage"

// CEO pages
import CeoLayout from "./layouts/CeoLayout"
import CeoLoginPage from "./pages/ceo/CeoLoginPage"
import CeoDashboard from "./pages/ceo/CeoDashboard"
import CeoStoresPage from "./pages/ceo/CeoStoresPage"
import CeoMapPage from "./pages/ceo/CeoMapPage"
import CeoAccountsPage from "./pages/ceo/CeoAccountsPage"
import CeoSettingsPage from "./pages/ceo/CeoSettingsPage"

// Admin extra
import AdminPlansPage from "./pages/admin/AdminPlansPage"

import { useAuthStore } from "./store/authStore"
import { getSubdomain, getSubdomainUrl } from "./lib/subdomain"

// Root page that redirects based on subdomain
function RootPage() {
  const currentSubdomain = getSubdomain()
  const { initialized } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized) return

    if (currentSubdomain === "admin") {
      // If we are fully on a subdomain, the path is already handled by routing.
      // But if we landed on root (/) on admin subdomain, we redirect to login
      navigate("/admin/login", { replace: true })
    } else if (currentSubdomain === "ceo") {
      navigate("/ceo/login", { replace: true })
    }
  }, [currentSubdomain, initialized, navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  // Only show HomePage for public subdomain
  if (currentSubdomain === "public") {
    return <HomePage />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      Carregando...
    </div>
  )
}

// Protected route component that validates subdomain access
function SubdomainGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  const currentSubdomain = getSubdomain()

  useEffect(() => {
    if (!initialized) return

    // If on admin subdomain, CEOs are allowed (superusers), no redirect needed.

    // If on CEO subdomain, only allow CEO role
    if (currentSubdomain === "ceo") {
      if (user && user.role !== "ceo") {
        window.location.href = getSubdomainUrl("admin", "/admin/dashboard")
        return
      }
    }
  }, [user, initialized, currentSubdomain])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  return <>{children}</>
}

function AppRoutes() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Root (redirects based on subdomain) ── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<RootPage />} />
        </Route>

        {/* ── Admin (admin. subdomain or /admin prefix in dev) ── */}
        <Route
          path="/admin/*"
          element={
            <SubdomainGuard>
              <AdminLayout />
            </SubdomainGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="register" element={<AdminRegisterPage />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="store" element={<AdminStorePage />} />
          <Route path="plans" element={<AdminPlansPage />} />
        </Route>

        {/* ── CEO (ceo. subdomain or /ceo prefix in dev) ── */}
        <Route
          path="/ceo/*"
          element={
            <SubdomainGuard>
              <CeoLayout />
            </SubdomainGuard>
          }
        >
          <Route index element={<Navigate to="/ceo/dashboard" replace />} />
          <Route path="login" element={<CeoLoginPage />} />
          <Route path="dashboard" element={<CeoDashboard />} />
          <Route path="stores" element={<CeoStoresPage />} />
          <Route path="map" element={<CeoMapPage />} />
          <Route path="accounts" element={<CeoAccountsPage />} />
          <Route path="settings" element={<CeoSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)
