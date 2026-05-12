import { useMemo } from "react"
import type { Store } from "../lib/supabase"
import { CATEGORY_ICONS } from "../lib/supabase"

interface FairMapProps {
  stores: Store[]
  selectedStore?: Store | null
  onSelectStore?: (store: Store | null) => void
  editable?: boolean
  editingPosition?: { x: number; y: number } | null
  onSelectPosition?: (x: number, y: number) => void
  occupiedPositions?: { x: number; y: number; storeId: string }[]
  currentStoreId?: string
}

const GRID_COLS = 12
const GRID_ROWS = 8

// Aisle positions (cannot be occupied)
const AISLES_X = [3, 7] // vertical aisles
const AISLES_Y = [3] // horizontal aisles

function isAisle(x: number, y: number) {
  return AISLES_X.includes(x) || AISLES_Y.includes(y)
}

export default function FairMap({
  stores,
  selectedStore,
  onSelectStore,
  editable = false,
  editingPosition,
  onSelectPosition,
  currentStoreId,
}: FairMapProps) {
  const storeMap = useMemo(() => {
    const map: Record<string, Store> = {}
    stores.forEach((s) => {
      map[`${s.booth_x},${s.booth_y}`] = s
    })
    return map
  }, [stores])

  const cells = useMemo(() => {
    const result = []
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        result.push({ x, y })
      }
    }
    return result
  }, [])

  function getCellState(x: number, y: number) {
    if (isAisle(x, y)) return "aisle"
    const store = storeMap[`${x},${y}`]
    if (store) {
      if (store.id === currentStoreId) return "mine"
      if (store.id === selectedStore?.id) return "selected"
      return "occupied"
    }
    if (editable && editingPosition?.x === x && editingPosition?.y === y)
      return "editing"
    return "empty"
  }

  function getCellStyle(state: string) {
    switch (state) {
      case "aisle":
        return "bg-earth-950/80 cursor-default"
      case "mine":
        return "bg-sage-500/40 border-sage-400 cursor-pointer hover:bg-sage-500/60"
      case "selected":
        return "bg-feira-400/60 border-feira-300 scale-105 shadow-lg shadow-feira-500/30"
      case "occupied":
        return "bg-feira-500/25 border-feira-600/50 cursor-pointer hover:bg-feira-500/40 hover:scale-105"
      case "editing":
        return "bg-feira-400/60 border-feira-300 animate-pulse"
      default:
        return editable
          ? "bg-earth-800/30 border-earth-700/30 hover:bg-feira-500/20 hover:border-feira-500/50 cursor-pointer"
          : "bg-earth-800/20 border-earth-700/20 cursor-default"
    }
  }

  function handleCellClick(x: number, y: number) {
    if (isAisle(x, y)) return
    const store = storeMap[`${x},${y}`]
    if (store && onSelectStore) {
      onSelectStore(selectedStore?.id === store.id ? null : store)
    } else if (editable && onSelectPosition) {
      onSelectPosition(x, y)
    }
  }

  return (
    <div className="select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-earth-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-feira-500/25 border border-feira-600/50" />
          <span>Loja ativa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-sage-500/40 border border-sage-400" />
          <span>Minha loja</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-earth-800/30 border border-earth-700/30" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-earth-950/80" />
          <span>Corredor</span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-1 p-3 bg-earth-900/50 rounded-2xl border border-earth-800"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
      >
        {cells.map(({ x, y }) => {
          const state = getCellState(x, y)
          const store = storeMap[`${x},${y}`]
          const icon = store
            ? CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS]
            : ""

          return (
            <div
              key={`${x},${y}`}
              onClick={() => handleCellClick(x, y)}
              title={store?.name ?? (isAisle(x, y) ? "Corredor" : "Disponível")}
              className={`
                relative aspect-square rounded border transition-all duration-150
                flex items-center justify-center text-[9px] sm:text-xs
                ${getCellStyle(state)}
              `}
            >
              {state !== "aisle" && (
                <span className="text-center leading-tight font-mono">
                  {store ? (
                    <span className="text-base sm:text-lg">{icon}</span>
                  ) : (
                    <span className="text-earth-600 text-[8px]">{`${x},${y}`}</span>
                  )}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Row/Col labels */}
      <div className="flex justify-between mt-2 px-3">
        {Array.from({ length: GRID_COLS }, (_, i) => (
          <span
            key={i}
            className="text-earth-600 text-[9px] font-mono w-0 text-center"
            style={{ flex: 1 }}
          >
            {i}
          </span>
        ))}
      </div>

      {/* Selected store info */}
      {selectedStore && !editable && (
        <div className="mt-4 p-4 bg-feira-500/10 border border-feira-500/30 rounded-xl animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {
                CATEGORY_ICONS[
                  selectedStore.category as keyof typeof CATEGORY_ICONS
                ]
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-earth-100 truncate">
                {selectedStore.name}
              </div>
              <div className="text-xs text-feira-400 mt-0.5">
                Banca {selectedStore.booth_label}
              </div>
              {selectedStore.description && (
                <div className="text-sm text-earth-300 mt-1 line-clamp-2">
                  {selectedStore.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
