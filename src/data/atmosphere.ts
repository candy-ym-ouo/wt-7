import type { Genre, AtmosphereConfig, AtmosphereTier, GenreAtmosphere, Record } from '@/types'

export const atmosphereTiers: AtmosphereConfig[] = [
  {
    tier: 'faint',
    tierName: '微弱',
    minValue: 0,
    maxValue: 25,
    patienceSlowdown: 0,
    recommendationBoost: 0,
    buyChanceBoost: 0,
    reputationBonus: 0,
    icon: '🌫️'
  },
  {
    tier: 'mild',
    tierName: '一般',
    minValue: 26,
    maxValue: 50,
    patienceSlowdown: 0.1,
    recommendationBoost: 5,
    buyChanceBoost: 0.03,
    reputationBonus: 0.5,
    icon: '🎵'
  },
  {
    tier: 'strong',
    tierName: '浓厚',
    minValue: 51,
    maxValue: 75,
    patienceSlowdown: 0.2,
    recommendationBoost: 12,
    buyChanceBoost: 0.06,
    reputationBonus: 1.5,
    icon: '🎶'
  },
  {
    tier: 'intense',
    tierName: '狂热',
    minValue: 76,
    maxValue: 100,
    patienceSlowdown: 0.35,
    recommendationBoost: 20,
    buyChanceBoost: 0.1,
    reputationBonus: 3,
    icon: '🔥'
  }
]

export const getAtmosphereTier = (value: number): AtmosphereConfig => {
  for (let i = atmosphereTiers.length - 1; i >= 0; i--) {
    if (value >= atmosphereTiers[i].minValue) {
      return atmosphereTiers[i]
    }
  }
  return atmosphereTiers[0]
}

export const getAtmosphereTierByEnum = (tier: AtmosphereTier): AtmosphereConfig => {
  return atmosphereTiers.find(t => t.tier === tier) || atmosphereTiers[0]
}

export const createEmptyAtmosphereMap = (): Map<Genre, number> => {
  const genres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']
  const map = new Map<Genre, number>()
  genres.forEach(g => map.set(g, 0))
  return map
}

export const getGenreAtmosphere = (
  atmosphereMap: Map<Genre, number>,
  genre: Genre
): GenreAtmosphere => {
  const value = atmosphereMap.get(genre) || 0
  const tier = getAtmosphereTier(value)
  return {
    genre,
    value,
    tier: tier.tier
  }
}

export const getAllGenreAtmospheres = (
  atmosphereMap: Map<Genre, number>
): GenreAtmosphere[] => {
  const genres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']
  return genres.map(g => getGenreAtmosphere(atmosphereMap, g))
    .sort((a, b) => b.value - a.value)
}

export const getPlaybackAtmosphereGain = (record: Record): number => {
  const rarityBonus: { [key: number]: number } = {
    1: 8,
    2: 12,
    3: 16,
    4: 20,
    5: 25
  }
  return rarityBonus[record.rarity] || 15
}

export const applyPlaybackAtmosphere = (
  atmosphereMap: Map<Genre, number>,
  record: Record
): Map<Genre, number> => {
  const newMap = new Map(atmosphereMap)
  const gain = getPlaybackAtmosphereGain(record)
  const currentValue = newMap.get(record.genre) || 0
  const newValue = Math.min(100, currentValue + gain)
  newMap.set(record.genre, newValue)
  return newMap
}

export const decayAtmosphere = (
  atmosphereMap: Map<Genre, number>,
  decayRate: number = 2
): Map<Genre, number> => {
  const newMap = new Map<Genre, number>()
  atmosphereMap.forEach((value, genre) => {
    const newValue = Math.max(0, value - decayRate)
    newMap.set(genre, newValue)
  })
  return newMap
}

export const getGenrePatienceSlowdown = (
  atmosphereMap: Map<Genre, number>,
  genre: Genre
): number => {
  const value = atmosphereMap.get(genre) || 0
  const tier = getAtmosphereTier(value)
  return tier.patienceSlowdown
}

export const getGenreRecommendationBoost = (
  atmosphereMap: Map<Genre, number>,
  genre: Genre
): number => {
  const value = atmosphereMap.get(genre) || 0
  const tier = getAtmosphereTier(value)
  return tier.recommendationBoost
}

export const getGenreBuyChanceBoost = (
  atmosphereMap: Map<Genre, number>,
  genre: Genre
): number => {
  const value = atmosphereMap.get(genre) || 0
  const tier = getAtmosphereTier(value)
  return tier.buyChanceBoost
}

export const calculateDailyAtmosphereReputationBonus = (
  atmosphereMap: Map<Genre, number>
): number => {
  let totalBonus = 0
  atmosphereMap.forEach((value) => {
    const tier = getAtmosphereTier(value)
    totalBonus += tier.reputationBonus
  })
  return Math.floor(totalBonus * 0.3)
}

export const getAverageAtmosphereValue = (
  atmosphereMap: Map<Genre, number>
): number => {
  let total = 0
  let count = 0
  atmosphereMap.forEach((value) => {
    total += value
    count++
  })
  return count > 0 ? total / count : 0
}

export const getTopAtmosphereGenres = (
  atmosphereMap: Map<Genre, number>,
  count: number = 3
): GenreAtmosphere[] => {
  return getAllGenreAtmospheres(atmosphereMap).slice(0, count)
}
