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
        return "bg-palmas-bg cursor-default"
      case "mine":
        return "bg-green-600 border-green-500 cursor-pointer hover:bg-green-600"
      case "selected":
        return "bg-palmas-yellow border-palmas-blue scale-105 shadow-lg shadow-md"
      case "occupied":
        return "bg-palmas-blue border-palmas-dark cursor-pointer hover:bg-palmas-blue hover:scale-105"
      case "editing":
        return "bg-palmas-yellow border-palmas-blue animate-pulse"
      default:
        return editable
          ? "bg-gray-100 border-gray-300 hover:bg-palmas-blue hover:border-palmas-blue cursor-pointer"
          : "bg-gray-100 border-gray-300 cursor-default"
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
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-palmas-blue border border-palmas-dark" />
          <span>Loja ativa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-600 border border-green-500" />
          <span>Minha loja</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-palmas-bg" />
          <span>Corredor</span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-1 p-3 bg-white rounded-md border border-gray-200"
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
                    <span className="text-gray-500 text-[8px]">{`${x},${y}`}</span>
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
            className="text-gray-500 text-[9px] font-mono w-0 text-center"
            style={{ flex: 1 }}
          >
            {i}
          </span>
        ))}
      </div>

      {/* Selected store info */}
      {selectedStore && !editable && (
        <div className="mt-4 p-4 bg-palmas-blue border border-palmas-blue rounded-md animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {
                CATEGORY_ICONS[
                  selectedStore.category as keyof typeof CATEGORY_ICONS
                ]
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-palmas-text truncate">
                {selectedStore.name}
              </div>
              <div className="text-xs text-palmas-blue mt-0.5">
                Banca {selectedStore.booth_label}
              </div>
              {selectedStore.description && (
                <div className="text-sm text-gray-700 mt-1 line-clamp-2">
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
