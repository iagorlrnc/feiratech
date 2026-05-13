import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Store,
  Users,
  Map,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { useStoreStore } from "../../store/storeStore"

export default function CeoDashboard() {
  const { stores, loading, fetchAllStores } = useStoreStore()

  useEffect(() => {
    fetchAllStores()
  }, [fetchAllStores])

  const total = stores.length
  const active = stores.filter((s) => s.status === "active").length
  const pending = stores.filter((s) => s.status === "pending").length
  const suspended = stores.filter((s) => s.status === "suspended").length

  const stats = [
    {
      label: "Total de lojas",
      value: total,
      icon: Store,
      color: "text-palmas-blue",
      bg: "bg-palmas-blue",
    },
    {
      label: "Lojas ativas",
      value: active,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-600",
    },
    {
      label: "Aguardando",
      value: pending,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Suspensas",
      value: suspended,
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ]

  const recentStores = [...stores]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-2">{label}</p>
                <p className={`font-display text-3xl font-bold ${color}`}>
                  {loading ? "—" : value}
                </p>
              </div>
              <div
                className={`w-9 h-9 ${bg} rounded-md flex items-center justify-center`}
              >
                <Icon size={17} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            to: "/ceo/stores",
            icon: Store,
            label: "Gerenciar lojas",
            desc: "Aprovar, suspender, editar",
            color: "feira",
          },
          {
            to: "/ceo/map",
            icon: Map,
            label: "Mapa da feira",
            desc: "Visualizar ocupação",
            color: "sage",
          },
          {
            to: "/ceo/accounts",
            icon: Users,
            label: "Contas admin",
            desc: "Controlar acessos",
            color: "earth",
          },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="card p-5 hover:bg-gray-100 transition-all group flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 bg-${color}-500/15 rounded-md flex items-center justify-center flex-shrink-0`}
            >
              <Icon size={20} className={`text-${color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
            <ArrowRight
              size={15}
              className="text-gray-500 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
            />
          </Link>
        ))}
      </div>

      {/* Pending approval highlight */}
      {pending > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-yellow-400" />
            <div>
              <div className="font-medium text-yellow-300 text-sm">
                {pending} loja{pending > 1 ? "s" : ""} aguardando aprovação
              </div>
              <div className="text-xs text-gray-500">
                Revise e aprove para torná-las visíveis ao público
              </div>
            </div>
          </div>
          <Link
            to="/ceo/stores"
            className="text-xs text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-1"
          >
            Ver <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Recent stores */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-display text-lg font-semibold text-palmas-text">
            Lojas recentes
          </h2>
          <Link
            to="/ceo/stores"
            className="text-xs text-palmas-blue hover:text-palmas-dark flex items-center gap-1"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-200/50">
          {recentStores.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Nenhuma loja cadastrada
            </div>
          ) : (
            recentStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {store.category === "alimentacao"
                    ? "🍽️"
                    : store.category === "moda"
                      ? "👗"
                      : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">
                    {store.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(store.created_at).toLocaleDateString("pt-BR")} ·
                    Banca {store.booth_label}
                  </div>
                </div>
                <span
                  className={`badge text-xs ${
                    store.status === "active"
                      ? "bg-green-600 text-green-500 border border-green-600"
                      : store.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {store.status === "active"
                    ? "Ativa"
                    : store.status === "pending"
                      ? "Pendente"
                      : "Suspensa"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
