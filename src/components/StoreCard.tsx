import { MapPin, Phone, Instagram, MessageCircle } from 'lucide-react'
import type { Store } from '../lib/supabase'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../lib/supabase'

interface StoreCardProps {
  store: Store
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}

export default function StoreCard({ store, onClick, selected, compact }: StoreCardProps) {
  const categoryIcon = CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] ?? '📦'
  const categoryLabel = CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS] ?? store.category

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all
          ${selected
            ? 'bg-palmas-blue border border-palmas-blue shadow-md shadow-md'
            : 'bg-gray-100 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'}
        `}
      >
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            categoryIcon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-palmas-text text-sm truncate">{store.name}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <MapPin size={10} />
            Banca {store.booth_label}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`
        card overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group
        ${selected ? 'ring-2 ring-palmas-blue shadow-md' : ''}
      `}
    >
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-gray-200 to-gray-200 relative overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20 group-hover:opacity-30 transition-opacity">
            {categoryIcon}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="badge bg-palmas-bg text-gray-700 text-[10px]">
            <MapPin size={9} /> Banca {store.booth_label}
          </span>
        </div>
      </div>

      {/* Logo + info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-2xl flex-shrink-0 -mt-7 border-2 border-gray-200 shadow-lg">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-md" />
            ) : (
              categoryIcon
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-semibold text-palmas-text truncate">{store.name}</h3>
            <span className="text-xs text-gray-600">{categoryLabel}</span>
          </div>
        </div>

        {store.description && (
          <p className="text-sm text-gray-700 mt-3 line-clamp-2 leading-relaxed">{store.description}</p>
        )}

        {/* Contact icons */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
          {store.phone && (
            <a href={`tel:${store.phone}`} onClick={e => e.stopPropagation()}
              className="text-gray-600 hover:text-palmas-blue transition-colors">
              <Phone size={15} />
            </a>
          )}
          {store.whatsapp && (
            <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              className="text-gray-600 hover:text-green-500 transition-colors">
              <MessageCircle size={15} />
            </a>
          )}
          {store.instagram && (
            <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              className="text-gray-600 hover:text-pink-400 transition-colors">
              <Instagram size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
