import type { Genre, DisplaySlot, Record, InventoryItem } from '@/types'

export interface ThemeConfig {
  id: string
  name: string
  icon: string
  description: string
  coreGenres: Genre[]
  bonusGenres: Genre[]
  matchScoreBonus: number
  buyChanceBonus: number
  layoutBonus: number
}

export interface ThemeMatchResult {
  theme: ThemeConfig
  matchCount: number
  totalSlots: number
  matchRatio: number
  matchScoreBonus: number
  buyChanceBonus: number
  layoutBonus: number
  isActive: boolean
}

export const themes: ThemeConfig[] = [
  {
    id: 'jazz-blues-night',
    name: '爵士布鲁斯夜',
    icon: '🎷',
    description: '爵士乐与布鲁斯的完美融合，慵懒的夜晚',
    coreGenres: ['Jazz', 'Blues'],
    bonusGenres: ['Soul'],
    matchScoreBonus: 8,
    buyChanceBonus: 0.08,
    layoutBonus: 2
  },
  {
    id: 'rock-funk-party',
    name: '摇滚放克派对',
    icon: '🎸',
    description: '摇滚与放克的碰撞，热血沸腾',
    coreGenres: ['Rock', 'Funk'],
    bonusGenres: ['Pop'],
    matchScoreBonus: 8,
    buyChanceBonus: 0.08,
    layoutBonus: 2
  },
  {
    id: 'soul-pop-groove',
    name: '灵魂流行律动',
    icon: '🎤',
    description: '灵魂乐与流行的悦耳旋律',
    coreGenres: ['Soul', 'Pop'],
    bonusGenres: ['Funk'],
    matchScoreBonus: 7,
    buyChanceBonus: 0.07,
    layoutBonus: 2
  },
  {
    id: 'disco-electronic-dance',
    name: '迪斯科电子舞池',
    icon: '🪩',
    description: '迪斯科与电子的动感节拍',
    coreGenres: ['Disco', 'Electronic'],
    bonusGenres: ['Pop'],
    matchScoreBonus: 8,
    buyChanceBonus: 0.08,
    layoutBonus: 2
  },
  {
    id: 'classical-folk-echo',
    name: '古典民谣回响',
    icon: '🎻',
    description: '古典与民谣的优雅共鸣',
    coreGenres: ['Classical', 'Folk'],
    bonusGenres: ['Jazz'],
    matchScoreBonus: 7,
    buyChanceBonus: 0.07,
    layoutBonus: 2
  },
  {
    id: 'black-music-tribute',
    name: '黑人音乐致敬',
    icon: '🎵',
    description: '灵魂、放克、迪斯科的黑人音乐盛宴',
    coreGenres: ['Soul', 'Funk', 'Disco'],
    bonusGenres: ['Blues', 'Jazz'],
    matchScoreBonus: 12,
    buyChanceBonus: 0.12,
    layoutBonus: 3
  },
  {
    id: 'rock-pop-anthem',
    name: '流行摇滚圣歌',
    icon: '🎶',
    description: '摇滚与流行的经典金曲',
    coreGenres: ['Rock', 'Pop'],
    bonusGenres: ['Folk'],
    matchScoreBonus: 7,
    buyChanceBonus: 0.07,
    layoutBonus: 2
  },
  {
    id: 'electronic-pop-fusion',
    name: '电子流行融合',
    icon: '⚡',
    description: '电子与流行的现代融合',
    coreGenres: ['Electronic', 'Pop'],
    bonusGenres: ['Disco'],
    matchScoreBonus: 7,
    buyChanceBonus: 0.07,
    layoutBonus: 2
  },
  {
    id: 'roots-music-journey',
    name: '根源音乐之旅',
    icon: '🌿',
    description: '布鲁斯、摇滚、民谣的根源探索',
    coreGenres: ['Blues', 'Rock', 'Folk'],
    bonusGenres: ['Jazz', 'Soul'],
    matchScoreBonus: 10,
    buyChanceBonus: 0.10,
    layoutBonus: 3
  },
  {
    id: 'elegant-jazz-classical',
    name: '高雅爵士古典',
    icon: '🎼',
    description: '爵士乐与古典乐的高雅品味',
    coreGenres: ['Jazz', 'Classical'],
    bonusGenres: ['Folk'],
    matchScoreBonus: 8,
    buyChanceBonus: 0.08,
    layoutBonus: 2
  }
]

export const calculateThemeMatches = (
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[]
): ThemeMatchResult[] => {
  const displayedRecords: Record[] = displaySlots
    .filter(s => s.inventoryId)
    .map(s => {
      const invItem = inventory.find(i => i.record.id === s.inventoryId)
      return invItem?.record
    })
    .filter((r): r is Record => r !== undefined)

  const totalSlots = displaySlots.filter(s => s.inventoryId).length

  if (totalSlots === 0) {
    return themes.map(theme => ({
      theme,
      matchCount: 0,
      totalSlots: 0,
      matchRatio: 0,
      matchScoreBonus: 0,
      buyChanceBonus: 0,
      layoutBonus: 0,
      isActive: false
    }))
  }

  const displayedGenres = displayedRecords.map(r => r.genre)

  const results = themes.map(theme => {
    const coreMatches = displayedGenres.filter(g => theme.coreGenres.includes(g)).length
    const bonusMatches = displayedGenres.filter(g => theme.bonusGenres.includes(g)).length

    const coreRatio = coreMatches / theme.coreGenres.length
    const hasAllCore = coreMatches >= theme.coreGenres.length

    const matchCount = coreMatches + bonusMatches
    const matchRatio = matchCount / totalSlots

    const layoutBonus = calculateLayoutBonus(displaySlots, inventory, theme)

    let matchScoreBonus = 0
    let buyChanceBonus = 0
    let finalLayoutBonus = 0

    if (hasAllCore) {
      const intensity = Math.min(1, matchRatio * 1.5)
      matchScoreBonus = theme.matchScoreBonus * intensity
      buyChanceBonus = theme.buyChanceBonus * intensity
      finalLayoutBonus = layoutBonus
    } else if (coreMatches > 0) {
      const partialRatio = coreRatio * 0.5
      matchScoreBonus = theme.matchScoreBonus * partialRatio
      buyChanceBonus = theme.buyChanceBonus * partialRatio
    }

    return {
      theme,
      matchCount,
      totalSlots,
      matchRatio,
      matchScoreBonus: Math.round(matchScoreBonus * 10) / 10,
      buyChanceBonus: Math.round(buyChanceBonus * 1000) / 1000,
      layoutBonus: finalLayoutBonus,
      isActive: hasAllCore
    }
  })

  return results.sort((a, b) => b.matchScoreBonus - a.matchScoreBonus)
}

export const calculateLayoutBonus = (
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[],
  theme: ThemeConfig
): number => {
  const filledSlots = displaySlots.filter(s => s.inventoryId)
  if (filledSlots.length < 2) return 0

  const slotGenreMap = new Map<number, Genre>()
  for (const slot of filledSlots) {
    const invItem = inventory.find(i => i.record.id === slot.inventoryId)
    if (invItem) {
      slotGenreMap.set(slot.id, invItem.record.genre)
    }
  }

  let adjacentPairs = 0
  let themedAdjacentPairs = 0

  for (const slot of filledSlots) {
    const { x, y } = slot.position
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ]

    for (const neighbor of neighbors) {
      const neighborSlot = displaySlots.find(
        s => s.position.x === neighbor.x && s.position.y === neighbor.y && s.inventoryId
      )
      if (neighborSlot && slot.id < neighborSlot.id) {
        adjacentPairs++

        const genre1 = slotGenreMap.get(slot.id)
        const genre2 = slotGenreMap.get(neighborSlot.id)

        if (genre1 && genre2) {
          const bothInTheme =
            (theme.coreGenres.includes(genre1) || theme.bonusGenres.includes(genre1)) &&
            (theme.coreGenres.includes(genre2) || theme.bonusGenres.includes(genre2))

          if (bothInTheme) {
            themedAdjacentPairs++
          }
        }
      }
    }
  }

  if (adjacentPairs === 0) return 0

  const themeAdjRatio = themedAdjacentPairs / adjacentPairs
  return Math.round(theme.layoutBonus * themeAdjRatio * 10) / 10
}

export const getActiveThemes = (
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[]
): ThemeMatchResult[] => {
  const allThemes = calculateThemeMatches(displaySlots, inventory)
  return allThemes.filter(t => t.isActive)
}

export const getTotalThemeMatchScoreBonus = (
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[]
): number => {
  const activeThemes = getActiveThemes(displaySlots, inventory)
  const totalBonus = activeThemes.reduce((sum, t) => sum + t.matchScoreBonus + t.layoutBonus, 0)
  return Math.round(totalBonus * 10) / 10
}

export const getTotalThemeBuyChanceBonus = (
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[]
): number => {
  const activeThemes = getActiveThemes(displaySlots, inventory)
  const totalBonus = activeThemes.reduce((sum, t) => sum + t.buyChanceBonus, 0)
  return Math.round(totalBonus * 1000) / 1000
}

export const getPlaybackThemeBonus = (
  playingRecord: Record | null,
  displaySlots: DisplaySlot[],
  inventory: InventoryItem[]
): number => {
  if (!playingRecord) return 0

  const activeThemes = getActiveThemes(displaySlots, inventory)
  let totalBonus = 0

  for (const themeResult of activeThemes) {
    const isCoreGenre = themeResult.theme.coreGenres.includes(playingRecord.genre)
    const isBonusGenre = themeResult.theme.bonusGenres.includes(playingRecord.genre)

    if (isCoreGenre) {
      totalBonus += 5
    } else if (isBonusGenre) {
      totalBonus += 2
    }
  }

  return totalBonus
}

export const getThemeByName = (name: string): ThemeConfig | undefined => {
  return themes.find(t => t.name === name)
}
