import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Save,
  MapPin,
  Store,
  AlertCircle,
  CheckCircle,
  Phone,
  Instagram,
  MessageCircle,
  Info,
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useStoreStore } from "../../store/storeStore"
import FairMap from "../../components/FairMap"
import { CATEGORY_LABELS } from "../../lib/supabase"

const AISLES_X = [3, 7]
const AISLES_Y = [3]

function isAisle(x: number, y: number) {
  return AISLES_X.includes(x) || AISLES_Y.includes(y)
}

function posToLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + y)}${x + 1}`
}

export default function AdminStorePage() {
  const { user } = useAuthStore()
  const {
    myStore,
    stores,
    fetchMyStore,
    fetchActiveStores,
    createStore,
    updateStore,
  } = useStoreStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "outros",
    phone: "",
    instagram: "",
    whatsapp: "",
    logo_url: "",
    banner_url: "",
    booth_x: 0,
    booth_y: 0,
    booth_label: "A1",
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"info" | "map">("info")
  const [editingPos, setEditingPos] = useState<{ x: number; y: number } | null>(
    null,
  )

  useEffect(() => {
    if (!user) {
      navigate("/admin/login")
      return
    }
    fetchMyStore(user.id)
    fetchActiveStores()
  }, [user])

  useEffect(() => {
    if (myStore) {
      setForm({
        name: myStore.name,
        description: myStore.description ?? "",
        category: myStore.category,
        phone: myStore.phone ?? "",
        instagram: myStore.instagram ?? "",
        whatsapp: myStore.whatsapp ?? "",
        logo_url: myStore.logo_url ?? "",
        banner_url: myStore.banner_url ?? "",
        booth_x: myStore.booth_x,
        booth_y: myStore.booth_y,
        booth_label: myStore.booth_label,
      })
      setEditingPos({ x: myStore.booth_x, y: myStore.booth_y })
    }
  }, [myStore])

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess(false)
  }

  function handleSelectPosition(x: number, y: number) {
    if (isAisle(x, y)) return
    // Check if occupied by another store
    const occupied = stores.find(
      (s) => s.booth_x === x && s.booth_y === y && s.id !== myStore?.id,
    )
    if (occupied) {
      setError("Esta posição já está ocupada por outra loja")
      return
    }
    setEditingPos({ x, y })
    setForm((prev) => ({
      ...prev,
      booth_x: x,
      booth_y: y,
      booth_label: posToLabel(x, y),
    }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      setError("Você precisa estar autenticado para cadastrar a loja")
      return
    }
    if (!form.name.trim()) {
      setError("Nome da loja é obrigatório")
      return
    }
    if (!editingPos) {
      setError("Selecione uma posição no mapa")
      return
    }

    setSaving(true)
    setError("")

    try {
      const storeData = {
        name: form.name.trim(),
        description: form.description,
        category: form.category,
        phone: form.phone,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        owner_id: user.id,
        booth_x: editingPos.x,
        booth_y: editingPos.y,
        booth_label: posToLabel(editingPos.x, editingPos.y),
      }

      const result = myStore
        ? await updateStore(myStore.id, storeData)
        : await createStore({ ...storeData, status: "pending" })

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      await Promise.all([fetchMyStore(user.id), fetchActiveStores()])
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao salvar a loja",
      )
    } finally {
      setSaving(false)
    }
  }

  const otherStores = stores.filter((s) => s.id !== myStore?.id)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-earth-50">
          {myStore ? "Editar loja" : "Configurar loja"}
        </h1>
        <p className="text-earth-400 mt-1 text-sm">
          {myStore
            ? "Atualize as informações da sua banca"
            : "Configure sua presença na feira digital"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-earth-900 rounded-xl border border-earth-800 mb-6">
        {(["info", "map"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-feira-500 text-white shadow-md"
                : "text-earth-400 hover:text-earth-200"
            }`}
          >
            {tab === "info" ? (
              <>
                <Store size={15} /> Informações
              </>
            ) : (
              <>
                <MapPin size={15} /> Posição no Mapa
              </>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4 animate-scale-in">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-sage-500/10 border border-sage-500/30 rounded-xl text-sage-400 text-sm mb-4 animate-scale-in">
          <CheckCircle size={16} /> Loja salva com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === "info" && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Nome da loja *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input-field"
                placeholder="Ex: Barraca da Dona Maria"
                required
              />
            </div>

            <div>
              <label className="label">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="input-field"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Descreva sua loja, produtos e diferenciais..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Phone size={12} className="inline mr-1" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input-field"
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div>
                <label className="label">
                  <MessageCircle size={12} className="inline mr-1" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="input-field"
                  placeholder="5500000000000"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <Instagram size={12} className="inline mr-1" />
                Instagram (sem @)
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                className="input-field"
                placeholder="minha_loja"
              />
            </div>

            <div>
              <label className="label">URL da logo</label>
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) => update("logo_url", e.target.value)}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="label">URL do banner</label>
              <input
                type="url"
                value={form.banner_url}
                onChange={(e) => update("banner_url", e.target.value)}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="card p-6">
            <div className="flex items-start gap-3 p-3 bg-feira-500/10 border border-feira-500/30 rounded-xl mb-5 text-sm">
              <Info size={15} className="text-feira-400 flex-shrink-0 mt-0.5" />
              <div className="text-earth-300">
                Clique em uma célula{" "}
                <strong className="text-earth-200">disponível</strong> no mapa
                para escolher a posição da sua banca.
                {editingPos && (
                  <span className="block mt-1 text-feira-300 font-medium">
                    Posição selecionada:{" "}
                    {posToLabel(editingPos.x, editingPos.y)} ({editingPos.x},{" "}
                    {editingPos.y})
                  </span>
                )}
              </div>
            </div>

            <FairMap
              stores={otherStores}
              editable
              editingPosition={editingPos}
              onSelectPosition={handleSelectPosition}
              currentStoreId={myStore?.id}
            />
          </div>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />{" "}
                {myStore ? "Salvar alterações" : "Cadastrar loja"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
