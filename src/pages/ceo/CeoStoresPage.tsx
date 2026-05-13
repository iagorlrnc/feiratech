import { useEffect, useState } from 'react'
import { Search, CheckCircle, Clock, Trash2, Eye } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import StoreModal from '../../components/StoreModal'
import type { Store } from '../../lib/supabase'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../lib/supabase'

type StatusFilter = 'all' | 'pending' | 'active' | 'suspended'

export default function CeoStoresPage() {
  const { stores, loading, fetchAllStores, updateStoreStatus, deleteStore } = useStoreStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewStore, setViewStore] = useState<Store | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { fetchAllStores() }, [fetchAllStores])

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleStatus(id: string, status: Store['status']) {
    await updateStoreStatus(id, status)
    fetchAllStores()
  }

  async function handleDelete(id: string) {
    await deleteStore(id)
    setConfirmDelete(null)
    fetchAllStores()
  }

  const counts = {
    all: stores.length,
    pending: stores.filter(s => s.status === 'pending').length,
    active: stores.filter(s => s.status === 'active').length,
    suspended: stores.filter(s => s.status === 'suspended').length,
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-palmas-text">Lojas</h1>
        <p className="text-gray-600 mt-1 text-sm">Gerencie todas as lojas da feira</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar loja..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white rounded-md border border-gray-200">
          {(['all', 'pending', 'active', 'suspended'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-palmas-blue text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendentes' : s === 'active' ? 'Ativas' : 'Suspensas'}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusFilter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🏪</div>
            <p>Nenhuma loja encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Banca</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filtered.map(store => (
                  <tr key={store.id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          {CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS]}
                        </div>
                        <div>
                          <div className="font-medium text-palmas-text text-sm">{store.name}</div>
                          <div className="text-xs text-gray-500">{store.profiles?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs text-gray-600">
                        {CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-600">{store.booth_label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${
                        store.status === 'active' ? 'bg-green-600 text-green-500 border border-green-600' :
                        store.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {store.status === 'active' ? '● Ativa' : store.status === 'pending' ? '○ Pendente' : '✕ Suspensa'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewStore(store)}
                          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all"
                          title="Ver detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        {store.status !== 'active' && (
                          <button
                            onClick={() => handleStatus(store.id, 'active')}
                            className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-600 rounded-lg transition-all"
                            title="Aprovar"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {store.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatus(store.id, 'suspended')}
                            className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                            title="Suspender"
                          >
                            <Clock size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(store.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      <StoreModal store={viewStore} onClose={() => setViewStore(null)} />

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative card p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-md flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-palmas-text mb-2">Confirmar exclusão</h3>
              <p className="text-gray-600 text-sm mb-6">Esta ação é irreversível. A loja será removida permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-3 rounded-md transition-all">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
