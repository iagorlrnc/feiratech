import { useMemo, useState, useRef, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
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

const GRID_COLS = 30
const GRID_ROWS = 30

// Sector Definition mapping to the architectural blueprint
interface Sector {
  id: string;
  name: string;
  color: string;
  activeColor: string;
  bounds: { minX: number, maxX: number, minY: number, maxY: number }[];
}

const SECTORS: Sector[] = [
  {
    id: 'FOOD',
    name: 'Praças de Alimentação',
    color: 'bg-pink-400',
    activeColor: 'bg-pink-600',
    bounds: [
      { minX: 2, maxX: 7, minY: 6, maxY: 11 }, // Left curve
      { minX: 12, maxX: 17, minY: 6, maxY: 7 }, // Middle top
      { minX: 4, maxX: 10, minY: 20, maxY: 21 }, // Below snack 1
      { minX: 12, maxX: 18, minY: 20, maxY: 21 }, // Below snack 2
      { minX: 20, maxX: 21, minY: 11, maxY: 19 }, // Vertical strip right center
    ]
  },
  {
    id: 'SNACK',
    name: 'Ilhas de Lanchonetes',
    color: 'bg-[#d0ce67]', // Olive/Yellowish
    activeColor: 'bg-[#9c9930]',
    bounds: [
      { minX: 4, maxX: 10, minY: 13, maxY: 18 }, // Center left
      { minX: 12, maxX: 18, minY: 13, maxY: 18 }, // Center right
    ]
  },
  {
    id: 'SPICE',
    name: 'Temperos',
    color: 'bg-blue-500',
    activeColor: 'bg-blue-700',
    bounds: [
      { minX: 19, maxX: 23, minY: 4, maxY: 9 }, // Top right center
    ]
  },
  {
    id: 'FLOUR',
    name: 'Farinha e Frutas',
    color: 'bg-cyan-400',
    activeColor: 'bg-cyan-600',
    bounds: [
      { minX: 25, maxX: 29, minY: 4, maxY: 10 }, // Top right
    ]
  },
  {
    id: 'VEG',
    name: 'Verduras e Frutas',
    color: 'bg-green-500',
    activeColor: 'bg-green-700',
    bounds: [
      { minX: 25, maxX: 29, minY: 12, maxY: 27 }, // Bottom right big vertical block
      { minX: 23, maxX: 24, minY: 21, maxY: 27 }, // Bottom right inner
    ]
  },
  {
    id: 'PLANT',
    name: 'Mudas / Plantas',
    color: 'bg-[#228b22]', // Dark Green
    activeColor: 'bg-[#155e15]',
    bounds: [
      { minX: 8, maxX: 11, minY: 24, maxY: 29 }, // Bottom left near entrance
    ]
  },
  {
    id: 'STAGE',
    name: 'Palco',
    color: 'bg-purple-400',
    activeColor: 'bg-purple-600',
    bounds: [
      { minX: 14, maxX: 22, minY: 24, maxY: 26 }, // Bottom stage
    ]
  },
  {
    id: 'SUPPORT',
    name: 'Apoio',
    color: 'bg-[#8b5a2b]', // Brown/Purple mix
    activeColor: 'bg-[#5c3c1d]',
    bounds: [
      { minX: 1, maxX: 3, minY: 18, maxY: 21 }, // Bottom far left
      { minX: 16, maxX: 20, minY: 1, maxY: 3 }, // Top side of top entrance
    ]
  }
];

function getSectorForCell(x: number, y: number): Sector | null {
  for (const sector of SECTORS) {
    for (const bound of sector.bounds) {
      if (x >= bound.minX && x <= bound.maxX && y >= bound.minY && y <= bound.maxY) {
        return sector;
      }
    }
  }
  return null;
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
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const dragDistance = useRef(0)

  // Auto-fit zoom on mount
  useEffect(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    // Base width and height: 30 cols/rows * 24px + 29 gaps + 96px white padding (p-12) + 64px gray padding (p-8) = 909px
    const mapBaseSize = 909
    // Target zoom leaves a tiny bit of space
    const targetZoom = (containerWidth * 0.98) / mapBaseSize
    
    // Clamp initial zoom to reasonable boundaries
    const initialZoom = Math.min(Math.max(targetZoom, 0.4), 2.5)
    setZoom(initialZoom)
  }, [])

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
        result.push({ x, y, sector: getSectorForCell(x, y) })
      }
    }
    return result
  }, [])

  function getCellState(x: number, y: number, sector: Sector | null) {
    if (!sector) return "corridor"
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

  function handleCellClick(x: number, y: number, sector: Sector | null) {
    if (dragDistance.current > 5) return // Prevent click if dragging
    if (!sector) return // Não permitir clique em corredores
    const store = storeMap[`${x},${y}`]
    if (store && onSelectStore) {
      onSelectStore(selectedStore?.id === store.id ? null : store)
    } else if (editable && onSelectPosition) {
      onSelectPosition(x, y)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragDistance.current = 0
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
    setScrollTop(containerRef.current?.scrollTop || 0)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    
    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const y = e.pageY - (containerRef.current.offsetTop || 0)
    const walkX = (x - startX) * 1.5
    const walkY = (y - startY) * 1.5
    
    // Accumulate drag distance to prevent accidental clicks
    dragDistance.current += Math.abs(x - startX) + Math.abs(y - startY)

    containerRef.current.scrollLeft = scrollLeft - walkX
    containerRef.current.scrollTop = scrollTop - walkY
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  function handleResetZoom() {
    setZoom(1)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white p-2 rounded-md shadow-md border border-gray-200">
        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" title="Aumentar Zoom">
          <ZoomIn size={20} />
        </button>
        <div className="w-full h-px bg-gray-200"></div>
        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" title="Diminuir Zoom">
          <ZoomOut size={20} />
        </button>
        <div className="w-full h-px bg-gray-200"></div>
        <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" title="Resetar Mapa">
          <Maximize size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {SECTORS.map(s => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${s.color} border border-black/10`} />
            <span className="text-gray-700 font-medium">{s.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-3 h-3 rounded bg-black border border-black/20" />
          <span className="text-gray-700 font-medium">Banca Ocupada</span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#f0f0f0] relative select-none"
        style={{ cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default') }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Wrapper to center the map when zoomed out smaller than container */}
        <div className="min-w-full min-h-full flex items-center justify-center w-max h-max">
          {/* Dynamic wrapper to prevent unused scrollbars when zooming out */}
          <div style={{ width: 909 * zoom, height: 909 * zoom, transition: 'width 0.3s, height 0.3s', flexShrink: 0 }}>
            <div 
              className="p-8 transition-transform duration-300 origin-top-left"
              style={{ transform: `scale(${zoom})`, width: 909, height: 909 }}
            >
          <div
            className="grid gap-px bg-white p-12 shadow-sm border border-gray-300 rounded-md"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_COLS}, 24px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 24px)`
            }}
          >
            {cells.map(({ x, y, sector }) => {
              const state = getCellState(x, y, sector)
              const store = storeMap[`${x},${y}`]
              const icon = store ? CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] : ""

              // Determine cell styling based on state and sector
              let cellClass = "relative rounded-sm border border-transparent transition-all duration-150 flex items-center justify-center "
              
              if (state === "corridor") {
                cellClass += "bg-transparent"
              } else if (state === "mine") {
                cellClass += "bg-black text-white border-black z-10 scale-110 shadow-md ring-2 ring-green-500 cursor-pointer"
              } else if (state === "selected") {
                cellClass += "bg-black text-white border-black z-10 scale-110 shadow-md ring-2 ring-palmas-blue cursor-pointer"
              } else if (state === "occupied") {
                cellClass += "bg-black/80 hover:bg-black text-white border-black/90 cursor-pointer shadow-sm hover:scale-105 z-10"
              } else if (state === "editing") {
                cellClass += "bg-black text-white animate-pulse border-black ring-2 ring-palmas-blue cursor-pointer"
              } else {
                // Empty but assignable booth
                cellClass += `${sector?.color} border-black/10 cursor-pointer hover:opacity-80 hover:scale-105 hover:shadow-sm`
              }

              return (
                <div
                  key={`${x},${y}`}
                  onClick={() => handleCellClick(x, y, sector)}
                  title={store?.name ?? (sector ? `${sector.name} - Livre` : "Corredor")}
                  className={cellClass}
                >
                  {state !== "corridor" && (
                    <span className="text-[10px] leading-none">
                      {store ? icon : null}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Selected store info at the bottom overlay */}
      {selectedStore && !editable && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 p-4 bg-white border border-gray-200 shadow-xl rounded-md animate-slide-up z-20">
          <div className="flex items-start gap-3">
            <div className="text-3xl text-palmas-blue">
              {CATEGORY_ICONS[selectedStore.category as keyof typeof CATEGORY_ICONS]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-lg truncate">
                {selectedStore.name}
              </div>
              <div className="text-sm font-medium text-palmas-blue mt-0.5">
                Banca {selectedStore.booth_label}
              </div>
              {selectedStore.description && (
                <div className="text-sm text-gray-600 mt-2 line-clamp-2">
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
