import type { TimeSlot, TimeSlotConfig, Genre } from '@/types'

export const timeSlotConfigs: TimeSlotConfig[] = [
  {
    slot: 'afternoon',
    name: '午后时光',
    icon: '☀️',
    description: '悠闲的午后，品味客群偏爱爵士、古典与民谣，注重品质与收藏价值',
    genreAffinity: ['Jazz', 'Classical', 'Folk', 'Blues'],
    budgetModifier: 1.2,
    customerCountRatio: 0.4,
    priceSensitivity: 0.7,
    playBoost: 20,
    impulseBuyChance: 0.05,
    rarityPreferenceBonus: [4, 5]
  },
  {
    slot: 'night',
    name: '夜场狂欢',
    icon: '🌙',
    description: '夜幕降临，潮流客群涌入，热衷摇滚、放克与电子，追求氛围与冲动消费',
    genreAffinity: ['Rock', 'Funk', 'Disco', 'Electronic', 'Soul'],
    budgetModifier: 1.0,
    customerCountRatio: 0.6,
    priceSensitivity: 1.3,
    playBoost: 10,
    impulseBuyChance: 0.2,
    rarityPreferenceBonus: [2, 3]
  }
]

export const getTimeSlotConfig = (slot: TimeSlot): TimeSlotConfig => {
  return timeSlotConfigs.find(c => c.slot === slot) || timeSlotConfigs[0]
}

export const adjustGenrePreferences = (
  originalGenres: Genre[],
  slot: TimeSlot
): Genre[] => {
  const config = getTimeSlotConfig(slot)
  const affinitySet = new Set(config.genreAffinity)

  const matched = originalGenres.filter(g => affinitySet.has(g))
  if (matched.length > 0) return matched

  const slotGenres = [...config.genreAffinity]
  const count = Math.min(originalGenres.length, slotGenres.length)
  return slotGenres.slice(0, count)
}

export const adjustPriceRange = (
  priceRange: [number, number],
  slot: TimeSlot
): [number, number] => {
  const config = getTimeSlotConfig(slot)
  return [
    Math.floor(priceRange[0] * config.budgetModifier),
    Math.floor(priceRange[1] * config.budgetModifier)
  ]
}

export const adjustPriceSensitivity = (slot: TimeSlot): number => {
  return getTimeSlotConfig(slot).priceSensitivity
}

export const getPlayBoostForSlot = (slot: TimeSlot): number => {
  return getTimeSlotConfig(slot).playBoost
}

export const getImpulseBuyChance = (slot: TimeSlot): number => {
  return getTimeSlotConfig(slot).impulseBuyChance
}

export const getCustomerCountForSlot = (
  totalCustomers: number,
  slot: TimeSlot
): number => {
  const config = getTimeSlotConfig(slot)
  return Math.max(1, Math.round(totalCustomers * config.customerCountRatio))
}
