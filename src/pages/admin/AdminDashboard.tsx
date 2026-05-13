import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, MapPin, AlertCircle, CheckCircle, Clock, ArrowRight, Phone, Instagram } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useStoreStore } from '../../store/storeStore'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../lib/supabase'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { myStore, fetchMyStore } = useStoreStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return }
    fetchMyStore(user.id)
  }, [user, fetchMyStore, navigate])

  const statusConfig = {
    pending: { label: 'Aguardando aprovação', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    active: { label: 'Loja ativa', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-600 border-green-600' },
    suspended: { label: 'Loja suspensa', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  }

  const status = myStore ? statusConfig[myStore.status] : null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">
          Olá, {user?.full_name?.split(' ')[0] ?? 'Lojista'} 👋
        </h1>
        <p className="text-gray-600 mt-1">Gerencie sua presença na feira digital</p>
      </div>

      {!myStore ? (
        /* No store yet */
        <div className="card p-8 text-center border-dashed">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-gray-500" />
          </div>
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">
            Nenhuma loja cadastrada
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Configure os detalhes da sua loja e escolha sua posição no mapa da feira.
          </p>
          <Link to="/admin/store" className="btn-primary inline-flex items-center gap-2">
            <Store size={16} />
            Configurar minha loja
          </Link>
        </div>
      ) : (
        <>
          {/* Status card */}
          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-md border mb-6 ${status.bg}`}>
              <status.icon size={18} className={status.color} />
              <div>
                <div className={`font-medium text-sm ${status.color}`}>{status.label}</div>
                {myStore.status === 'pending' && (
                  <div className="text-xs text-gray-500 mt-0.5">A administração irá revisar sua loja em breve</div>
                )}
              </div>
            </div>
          )}

          {/* Store preview card */}
          <div className="card overflow-hidden mb-6">
            <div className="h-28 bg-gradient-to-br from-gray-200 to-gray-200 relative">
              {myStore.banner_url && (
                <img src={myStore.banner_url} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                {CATEGORY_ICONS[myStore.category as keyof typeof CATEGORY_ICONS]}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center text-2xl -mt-8 border-2 border-gray-200 flex-shrink-0">
                  {CATEGORY_ICONS[myStore.category as keyof typeof CATEGORY_ICONS]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-palmas-text">{myStore.name}</h3>
                  <p className="text-sm text-gray-600">
                    {CATEGORY_LABELS[myStore.category as keyof typeof CATEGORY_LABELS]}
                  </p>
                </div>
              </div>
              {myStore.description && (
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{myStore.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={12} />
                  Banca {myStore.booth_label} (pos. {myStore.booth_x},{myStore.booth_y})
                </div>
                {myStore.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone size={12} /> {myStore.phone}
                  </div>
                )}
                {myStore.instagram && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Instagram size={12} /> @{myStore.instagram}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <Link
            to="/admin/store"
            className="flex items-center justify-between p-4 card hover:bg-gray-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-palmas-blue rounded-md flex items-center justify-center">
                <Store size={18} className="text-palmas-blue" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Editar loja</div>
                <div className="text-xs text-gray-500">Atualize nome, descrição, posição no mapa</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-500 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
          </Link>
        </>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">📋 Como funciona</h3>
        <ol className="text-xs text-gray-500 space-y-1.5 list-none">
          {[
            'Configure os dados da sua loja e escolha sua posição no mapa',
            'Aguarde a aprovação do administrador da feira',
            'Após aprovação, sua loja aparece no mapa público',
            'Clientes podem te encontrar e entrar em contato',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
