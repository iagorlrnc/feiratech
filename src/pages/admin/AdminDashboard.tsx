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
    active: { label: 'Loja ativa', icon: CheckCircle, color: 'text-sage-400', bg: 'bg-sage-500/10 border-sage-500/30' },
    suspended: { label: 'Loja suspensa', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  }

  const status = myStore ? statusConfig[myStore.status] : null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-earth-50">
          Olá, {user?.full_name?.split(' ')[0] ?? 'Lojista'} 👋
        </h1>
        <p className="text-earth-400 mt-1">Gerencie sua presença na feira digital</p>
      </div>

      {!myStore ? (
        /* No store yet */
        <div className="card p-8 text-center border-dashed">
          <div className="w-16 h-16 bg-earth-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-earth-500" />
          </div>
          <h2 className="font-display text-xl font-semibold text-earth-200 mb-2">
            Nenhuma loja cadastrada
          </h2>
          <p className="text-earth-500 text-sm mb-6 max-w-xs mx-auto">
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
            <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${status.bg}`}>
              <status.icon size={18} className={status.color} />
              <div>
                <div className={`font-medium text-sm ${status.color}`}>{status.label}</div>
                {myStore.status === 'pending' && (
                  <div className="text-xs text-earth-500 mt-0.5">A administração irá revisar sua loja em breve</div>
                )}
              </div>
            </div>
          )}

          {/* Store preview card */}
          <div className="card overflow-hidden mb-6">
            <div className="h-28 bg-gradient-to-br from-earth-800 to-earth-700 relative">
              {myStore.banner_url && (
                <img src={myStore.banner_url} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                {CATEGORY_ICONS[myStore.category as keyof typeof CATEGORY_ICONS]}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-earth-700 rounded-xl flex items-center justify-center text-2xl -mt-8 border-2 border-earth-900 flex-shrink-0">
                  {CATEGORY_ICONS[myStore.category as keyof typeof CATEGORY_ICONS]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-earth-50">{myStore.name}</h3>
                  <p className="text-sm text-earth-400">
                    {CATEGORY_LABELS[myStore.category as keyof typeof CATEGORY_LABELS]}
                  </p>
                </div>
              </div>
              {myStore.description && (
                <p className="text-sm text-earth-300 mt-3 leading-relaxed">{myStore.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-earth-800">
                <div className="flex items-center gap-2 text-xs text-earth-400">
                  <MapPin size={12} />
                  Banca {myStore.booth_label} (pos. {myStore.booth_x},{myStore.booth_y})
                </div>
                {myStore.phone && (
                  <div className="flex items-center gap-2 text-xs text-earth-400">
                    <Phone size={12} /> {myStore.phone}
                  </div>
                )}
                {myStore.instagram && (
                  <div className="flex items-center gap-2 text-xs text-earth-400">
                    <Instagram size={12} /> @{myStore.instagram}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <Link
            to="/admin/store"
            className="flex items-center justify-between p-4 card hover:bg-earth-800 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-feira-500/20 rounded-xl flex items-center justify-center">
                <Store size={18} className="text-feira-400" />
              </div>
              <div>
                <div className="font-medium text-earth-200 text-sm">Editar loja</div>
                <div className="text-xs text-earth-500">Atualize nome, descrição, posição no mapa</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-earth-500 group-hover:text-earth-300 group-hover:translate-x-1 transition-all" />
          </Link>
        </>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-earth-900/50 border border-earth-800 rounded-xl">
        <h3 className="text-sm font-medium text-earth-300 mb-2">📋 Como funciona</h3>
        <ol className="text-xs text-earth-500 space-y-1.5 list-none">
          {[
            'Configure os dados da sua loja e escolha sua posição no mapa',
            'Aguarde a aprovação do administrador da feira',
            'Após aprovação, sua loja aparece no mapa público',
            'Clientes podem te encontrar e entrar em contato',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 bg-earth-800 rounded-full flex items-center justify-center text-[10px] text-earth-400 flex-shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
