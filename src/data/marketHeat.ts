import type { Genre, GenreMarketHeat, MarketHeatLevel, MarketHeatTrend, HotGenre } from '@/types'

const allGenres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']

const heatLevelRanges: { level: MarketHeatLevel; min: number; max: number }[] = [
  { level: 'ice_cold', min: 0, max: 0.15 },
  { level: 'cold', min: 0.15, max: 0.35 },
  { level: 'cool', min: 0.35, max: 0.48 },
  { level: 'normal', min: 0.48, max: 0.62 },
  { level: 'warm', min: 0.62, max: 0.75 },
  { level: 'hot', min: 0.75, max: 0.9 },
  { level: 'scorching', min: 0.9, max: 1.01 }
]

const heatLevelConfig: Record<MarketHeatLevel, {
  label: string
  icon: string
  color: string
  priceModifier: [number, number]
  demandModifier: [number, number]
  profitMarginModifier: [number, number]
}> = {
  ice_cold: {
    label: '极冷',
    icon: '🧊',
    color: '#63b3ed',
    priceModifier: [0.65, 0.8],
    demandModifier: [0.3, 0.5],
    profitMarginModifier: [0.5, 0.7]
  },
  cold: {
    label: '冷门',
    icon: '❄️',
    color: '#90cdf4',
    priceModifier: [0.8, 0.9],
    demandModifier: [0.5, 0.75],
    profitMarginModifier: [0.7, 0.85]
  },
  cool: {
    label: '偏冷',
    icon: '🌬️',
    color: '#bee3f8',
    priceModifier: [0.9, 0.97],
    demandModifier: [0.85, 0.95],
    profitMarginModifier: [0.9, 0.98]
  },
  normal: {
    label: '正常',
    icon: '➖',
    color: '#a0aec0',
    priceModifier: [0.97, 1.03],
    demandModifier: [0.95, 1.05],
    profitMarginModifier: [0.98, 1.02]
  },
  warm: {
    label: '偏热',
    icon: '☀️',
    color: '#fbd38d',
    priceModifier: [1.03, 1.12],
    demandModifier: [1.1, 1.25],
    profitMarginModifier: [1.05, 1.15]
  },
  hot: {
    label: '热门',
    icon: '🔥',
    color: '#f6ad55',
    priceModifier: [1.12, 1.3],
    demandModifier: [1.3, 1.6],
    profitMarginModifier: [1.2, 1.45]
  },
  scorching: {
    label: '爆火',
    icon: '🌋',
    color: '#fc8181',
    priceModifier: [1.3, 1.6],
    demandModifier: [1.6, 2.2],
    profitMarginModifier: [1.5, 2.0]
  }
}

const getHeatLevel = (heatValue: number): MarketHeatLevel => {
  for (const range of heatLevelRanges) {
    if (heatValue >= range.min && heatValue < range.max) {
      return range.level
    }
  }
  return 'normal'
}

const randomInRange = (range: [number, number]): number => {
  return range[0] + Math.random() * (range[1] - range[0])
}

const generateGenreHeatValue = (
  genre: Genre,
  day: number,
  previousHeats: Map<Genre, number> = new Map(),
  hotGenresFromSales: HotGenre[] = []
): number => {
  const prevHeat = previousHeats.get(genre)
  let baseHeat = prevHeat !== undefined ? prevHeat : 0.5

  const dayCycle = Math.sin((day / 7) * Math.PI * 2) * 0.08
  baseHeat += dayCycle

  const salesBoost = hotGenresFromSales.find(h => h.genre === genre)
  if (salesBoost) {
    const salesFactor = Math.min(1, salesBoost.salesCount / 10)
    baseHeat += salesFactor * 0.15
  }

  const randomShock = (Math.random() - 0.5) * 0.18

  let heat = baseHeat + randomShock

  if (prevHeat !== undefined) {
    const pullToCenter = (0.5 - prevHeat) * 0.15
    heat += pullToCenter
  }

  return Math.max(0.02, Math.min(0.98, heat))
}

const calculateTrend = (
  currentHeat: number,
  previousHeat: number | undefined
): { trend: MarketHeatTrend; strength: number } => {
  if (previousHeat === undefined) {
    return { trend: 'stable', strength: 0 }
  }
  const diff = currentHeat - previousHeat
  const absDiff = Math.abs(diff)

  if (absDiff < 0.03) {
    return { trend: 'stable', strength: absDiff }
  }
  return {
    trend: diff > 0 ? 'rising' : 'falling',
    strength: Math.min(1, absDiff * 5)
  }
}

export const generateDailyMarketHeat = (
  day: number,
  previousHeatMap: Map<Genre, GenreMarketHeat> = new Map(),
  hotGenresFromSales: HotGenre[] = []
): Map<Genre, GenreMarketHeat> => {
  const result = new Map<Genre, GenreMarketHeat>()
  const previousHeatValues = new Map<Genre, number>()

  for (const [genre, heat] of previousHeatMap.entries()) {
    previousHeatValues.set(genre, heat.heatValue)
  }

  for (const genre of allGenres) {
    const heatValue = generateGenreHeatValue(genre, day, previousHeatValues, hotGenresFromSales)
    const heatLevel = getHeatLevel(heatValue)
    const config = heatLevelConfig[heatLevel]
    const prevHeat = previousHeatMap.get(genre)
    const { trend, strength } = calculateTrend(heatValue, prevHeat?.heatValue)

    result.set(genre, {
      genre,
      heatLevel,
      heatValue,
      priceModifier: randomInRange(config.priceModifier),
      demandModifier: randomInRange(config.demandModifier),
      profitMarginModifier: randomInRange(config.profitMarginModifier),
      trend,
      trendStrength: strength
    })
  }

  return result
}

export const getGenreMarketHeat = (
  heatMap: Map<Genre, GenreMarketHeat>,
  genre: Genre
): GenreMarketHeat => {
  return heatMap.get(genre) || {
    genre,
    heatLevel: 'normal',
    heatValue: 0.5,
    priceModifier: 1,
    demandModifier: 1,
    profitMarginModifier: 1,
    trend: 'stable',
    trendStrength: 0
  }
}

export const getHeatLevelInfo = (level: MarketHeatLevel) => heatLevelConfig[level]

export const getHeatLabel = (level: MarketHeatLevel): string => heatLevelConfig[level].label
export const getHeatIcon = (level: MarketHeatLevel): string => heatLevelConfig[level].icon
export const getHeatColor = (level: MarketHeatLevel): string => heatLevelConfig[level].color

export const getTrendIcon = (trend: MarketHeatTrend): string => {
  const icons = { rising: '📈', falling: '📉', stable: '➡️' }
  return icons[trend]
}

export const getTrendLabel = (trend: MarketHeatTrend): string => {
  const labels = { rising: '上升中', falling: '下降中', stable: '平稳' }
  return labels[trend]
}

export const getHottestGenres = (
  heatMap: Map<Genre, GenreMarketHeat>,
  limit: number = 3
): GenreMarketHeat[] => {
  return Array.from(heatMap.values())
    .sort((a, b) => b.heatValue - a.heatValue)
    .slice(0, limit)
}

export const getColdestGenres = (
  heatMap: Map<Genre, GenreMarketHeat>,
  limit: number = 3
): GenreMarketHeat[] => {
  return Array.from(heatMap.values())
    .sort((a, b) => a.heatValue - b.heatValue)
    .slice(0, limit)
}

export const formatHeatValue = (value: number): string => {
  return Math.round(value * 100) + '%'
}
