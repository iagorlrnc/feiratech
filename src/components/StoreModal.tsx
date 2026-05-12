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
        className="relative w-full sm:max-w-md bg-earth-900 rounded-t-3xl sm:rounded-2xl border border-earth-800 shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-earth-800 to-earth-700 relative">
          {store.banner_url ? (
            <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-15">
              {categoryIcon}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-earth-950/60 hover:bg-earth-950/80 rounded-full flex items-center justify-center text-earth-300 hover:text-earth-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-earth-700 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 -mt-10 border-4 border-earth-900 shadow-xl">
              {store.logo_url ? (
                <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                categoryIcon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-earth-50 truncate">{store.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge bg-earth-800 text-earth-300 text-xs">
                  <Tag size={10} /> {categoryLabel}
                </span>
                <span className="badge bg-feira-500/20 text-feira-300 text-xs border border-feira-500/30">
                  <MapPin size={10} /> Banca {store.booth_label}
                </span>
              </div>
            </div>
          </div>

          {store.description && (
            <p className="mt-4 text-earth-300 text-sm leading-relaxed">{store.description}</p>
          )}

          {/* Contacts */}
          <div className="mt-5 space-y-2">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-3 p-3 bg-earth-800/50 hover:bg-earth-800 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 bg-earth-700 group-hover:bg-feira-500/20 rounded-lg flex items-center justify-center transition-all">
                  <Phone size={15} className="text-earth-300 group-hover:text-feira-400" />
                </div>
                <span className="text-sm text-earth-300 group-hover:text-earth-100 transition-colors">{store.phone}</span>
              </a>
            )}
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-earth-800/50 hover:bg-earth-800 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 bg-earth-700 group-hover:bg-sage-500/20 rounded-lg flex items-center justify-center transition-all">
                  <MessageCircle size={15} className="text-earth-300 group-hover:text-sage-400" />
                </div>
                <span className="text-sm text-earth-300 group-hover:text-earth-100 transition-colors">WhatsApp</span>
              </a>
            )}
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-earth-800/50 hover:bg-earth-800 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 bg-earth-700 group-hover:bg-pink-500/20 rounded-lg flex items-center justify-center transition-all">
                  <Instagram size={15} className="text-earth-300 group-hover:text-pink-400" />
                </div>
                <span className="text-sm text-earth-300 group-hover:text-earth-100 transition-colors">@{store.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
