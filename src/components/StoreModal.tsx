import { X, MapPin, Phone, Instagram, MessageCircle, Tag } from 'lucide-react'
import type { Store } from '../lib/supabase'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../lib/supabase'

interface StoreModalProps {
  store: Store | null
  onClose: () => void
}

export default function StoreModal({ store, onClose }: StoreModalProps) {
  if (!store) return null

  const categoryIcon = CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] ?? '📦'
  const categoryLabel = CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS] ?? store.category

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-md border border-gray-200 shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-gray-200 to-gray-200 relative">
          {store.banner_url ? (
            <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-15">
              {categoryIcon}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-palmas-bg hover:bg-palmas-bg rounded-lg flex items-center justify-center text-gray-700 hover:text-palmas-text transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-3xl flex-shrink-0 -mt-10 border-4 border-gray-200 shadow-xl">
              {store.logo_url ? (
                <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-md" />
              ) : (
                categoryIcon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-palmas-text truncate">{store.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge bg-gray-100 text-gray-700 text-xs">
                  <Tag size={10} /> {categoryLabel}
                </span>
                <span className="badge bg-palmas-blue text-palmas-dark text-xs border border-palmas-blue">
                  <MapPin size={10} /> Banca {store.booth_label}
                </span>
              </div>
            </div>
          </div>

          {store.description && (
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{store.description}</p>
          )}

          {/* Contacts */}
          <div className="mt-5 space-y-2">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-100 rounded-md transition-all group"
              >
                <div className="w-8 h-8 bg-gray-200 group-hover:bg-palmas-blue rounded-lg flex items-center justify-center transition-all">
                  <Phone size={15} className="text-gray-700 group-hover:text-palmas-blue" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-palmas-text transition-colors">{store.phone}</span>
              </a>
            )}
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-100 rounded-md transition-all group"
              >
                <div className="w-8 h-8 bg-gray-200 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-all">
                  <MessageCircle size={15} className="text-gray-700 group-hover:text-green-500" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-palmas-text transition-colors">WhatsApp</span>
              </a>
            )}
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-100 rounded-md transition-all group"
              >
                <div className="w-8 h-8 bg-gray-200 group-hover:bg-pink-500/20 rounded-lg flex items-center justify-center transition-all">
                  <Instagram size={15} className="text-gray-700 group-hover:text-pink-400" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-palmas-text transition-colors">@{store.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
