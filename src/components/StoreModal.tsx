import { X, MapPin, Phone, Instagram, MessageCircle, Tag, ExternalLink } from 'lucide-react'
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-palmas-dark/40 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/20 shadow-2xl animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-48 bg-gray-100 relative">
          {store.banner_url ? (
            <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-palmas-blue/20 to-palmas-dark/20 flex items-center justify-center text-8xl opacity-30">
              {categoryIcon}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/30"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-palmas-blue text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={10} /> {categoryLabel}
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold text-white drop-shadow-md truncate">{store.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl flex-shrink-0 -mt-16 border-4 border-white shadow-2xl z-10 relative overflow-hidden">
              {store.logo_url ? (
                <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                categoryIcon
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <MapPin size={12} className="text-palmas-blue" />
                Localização: Banca {store.booth_label}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sobre a Loja</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {store.description || 'Esta loja ainda não adicionou uma descrição detalhada. Mas você pode entrar em contato através dos botões abaixo para saber mais sobre seus produtos e serviços.'}
            </p>
          </div>

          {/* Contacts Grid */}
          <div className="mt-10 grid grid-cols-1 gap-3">
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-all group border border-green-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-green-700 uppercase tracking-wider">WhatsApp</div>
                    <div className="text-sm font-bold text-green-900">Conversar agora</div>
                  </div>
                </div>
                <ExternalLink size={16} className="text-green-300" />
              </a>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {store.instagram && (
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-2xl transition-all group border border-pink-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-pink-700 uppercase tracking-wider">Instagram</div>
                    <div className="text-xs font-bold text-pink-900 truncate">@{store.instagram}</div>
                  </div>
                </a>
              )}
              
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-3 p-4 bg-palmas-blue/5 hover:bg-palmas-blue/10 rounded-2xl transition-all group border border-palmas-blue/10"
                >
                  <div className="w-10 h-10 bg-palmas-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-palmas-blue/20 group-hover:scale-110 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-palmas-blue uppercase tracking-wider">Telefone</div>
                    <div className="text-xs font-bold text-palmas-text truncate">{store.phone}</div>
                  </div>
                </a>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  )
}

