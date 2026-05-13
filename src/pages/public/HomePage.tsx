import { useState, useEffect } from 'react'
import { Search, MapPin, Grid3X3, List, X } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import StoreCard from '../../components/StoreCard'
import StoreModal from '../../components/StoreModal'
import FairMap from '../../components/FairMap'
import type { Store } from '../../lib/supabase'
import { CATEGORY_LABELS } from '../../lib/supabase'

type ViewMode = 'grid' | 'list' | 'map'

export default function HomePage() {
  const { stores, loading, fetchActiveStores } = useStoreStore()
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [modalStore, setModalStore] = useState<Store | null>(null)

  useEffect(() => {
    fetchActiveStores()
  }, [fetchActiveStores])

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || s.category === categoryFilter
    return matchSearch && matchCat
  })

  const categories = [...new Set(stores.map(s => s.category))]

  function handleMapSelect(store: Store | null) {
    setSelectedStore(store)
    if (store) setModalStore(store)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 badge bg-palmas-blue text-palmas-dark border border-palmas-blue mb-4 text-xs px-3 py-1.5">
          <MapPin size={11} />
          Feira Virtual — Explore as lojas
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-palmas-text leading-tight">
          Bem-vindo à{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-palmas-blue to-palmas-dark">
            Feira Digital
          </span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
          Encontre lojas, produtos e serviços. Clique em uma banca no mapa para descobrir mais.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-8 mb-10">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-palmas-blue">{stores.length}</div>
          <div className="text-xs text-gray-500">Lojas ativas</div>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-palmas-blue">{categories.length}</div>
          <div className="text-xs text-gray-500">Categorias</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar lojas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11 pr-4"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex rounded-md border border-gray-300 overflow-hidden flex-shrink-0">
          {(['grid', 'list', 'map'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-all ${
                view === v ? 'bg-palmas-blue text-white' : 'bg-gray-100 text-gray-600 hover:text-palmas-text'
              }`}
            >
              {v === 'grid' && <Grid3X3 size={15} />}
              {v === 'list' && <List size={15} />}
              {v === 'map' && <MapPin size={15} />}
              <span className="hidden sm:inline capitalize">{v === 'map' ? 'Mapa' : v === 'grid' ? 'Grade' : 'Lista'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-52 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-lg font-medium text-gray-600">Nenhuma loja encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de busca</p>
        </div>
      ) : view === 'map' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-4">
              <h2 className="font-display text-xl font-semibold text-palmas-text mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-palmas-blue" />
                Mapa da Feira
              </h2>
              <FairMap
                stores={filtered}
                selectedStore={selectedStore}
                onSelectStore={handleMapSelect}
              />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 text-sm">
              {selectedStore ? 'Loja selecionada' : `${filtered.length} lojas`}
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  compact
                  selected={selectedStore?.id === store.id}
                  onClick={() => handleMapSelect(selectedStore?.id === store.id ? null : store)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              onClick={() => setModalStore(store)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              compact
              onClick={() => setModalStore(store)}
            />
          ))}
        </div>
      )}

      {/* Store Modal */}
      <StoreModal store={modalStore} onClose={() => setModalStore(null)} />
    </div>
  )
}
