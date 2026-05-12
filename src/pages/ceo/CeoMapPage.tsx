import { useEffect, useState } from 'react'
import { MapPin, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import FairMap from '../../components/FairMap'
import StoreModal from '../../components/StoreModal'
import type { Store } from '../../lib/supabase'

export default function CeoMapPage() {
  const { stores, loading, fetchAllStores } = useStoreStore()
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all')

  useEffect(() => { fetchAllStores() }, [fetchAllStores])

  const filtered = stores.filter(s =>
    statusFilter === 'all' ? true :
    statusFilter === 'active' ? s.status === 'active' :
    s.status === 'pending'
  )

  const occupiedCount = stores.length
  const TOTAL_CELLS = 12 * 8 - (2 * 8) - (1 * 12) // minus aisles
  const occupancyPct = Math.round((occupiedCount / TOTAL_CELLS) * 100)

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-earth-50">Mapa da Feira</h1>
          <p className="text-earth-400 mt-1 text-sm">Visualização completa da ocupação das bancas</p>
        </div>
        <button onClick={fetchAllStores} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* Occupancy stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-feira-400">{stores.filter(s => s.status === 'active').length}</div>
          <div className="text-xs text-earth-500 mt-1 flex items-center justify-center gap-1">
            <CheckCircle size={11} className="text-sage-400" /> Ativas
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-yellow-400">{stores.filter(s => s.status === 'pending').length}</div>
          <div className="text-xs text-earth-500 mt-1 flex items-center justify-center gap-1">
            <Clock size={11} className="text-yellow-400" /> Pendentes
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-earth-300">{occupancyPct}%</div>
          <div className="text-xs text-earth-500 mt-1 flex items-center justify-center gap-1">
            <MapPin size={11} /> Ocupação
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-earth-900 rounded-xl border border-earth-800 mb-6 w-fit">
        {(['all', 'active', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === f ? 'bg-feira-500 text-white' : 'text-earth-400 hover:text-earth-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Pendentes'}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="card p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-earth-500">Carregando mapa...</div>
        ) : (
          <FairMap
            stores={filtered}
            selectedStore={selectedStore}
            onSelectStore={store => {
              setSelectedStore(store)
            }}
          />
        )}
      </div>

      {/* Store list beside map */}
      {filtered.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-earth-200 mb-3">
            Bancas ocupadas ({filtered.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(store => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedStore?.id === store.id
                    ? 'bg-feira-500/20 border border-feira-500/40'
                    : 'bg-earth-900 border border-earth-800 hover:border-earth-700'
                }`}
              >
                <div className="w-9 h-9 bg-earth-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {store.category === 'alimentacao' ? '🍽️' :
                   store.category === 'moda' ? '👗' :
                   store.category === 'artesanato' ? '🎨' :
                   store.category === 'eletronicos' ? '📱' :
                   store.category === 'beleza' ? '💄' :
                   store.category === 'servicos' ? '🔧' : '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-earth-100 text-sm truncate">{store.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-earth-500 font-mono">Banca {store.booth_label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      store.status === 'active' ? 'bg-sage-400' :
                      store.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StoreModal store={selectedStore} onClose={() => setSelectedStore(null)} />
    </div>
  )
}
