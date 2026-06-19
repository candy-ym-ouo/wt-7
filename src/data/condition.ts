export type ConditionLabel = 'Mint' | 'Near Mint' | 'Very Good' | 'Good' | 'Poor'

export interface RenovationOption {
  targetLabel: ConditionLabel
  targetScore: number
  cost: number
  description: string
}

const conditionRanges: { label: ConditionLabel; min: number; max: number }[] = [
  { label: 'Mint', min: 90, max: 100 },
  { label: 'Near Mint', min: 75, max: 89 },
  { label: 'Very Good', min: 55, max: 74 },
  { label: 'Good', min: 35, max: 54 },
  { label: 'Poor', min: 0, max: 34 }
]

export const getConditionLabel = (score: number): ConditionLabel => {
  for (const range of conditionRanges) {
    if (score >= range.min && score <= range.max) return range.label
  }
  return 'Poor'
}

export const getConditionScoreFromLabel = (label: string): number => {
  const range = conditionRanges.find(r => r.label === label)
  return range ? Math.floor((range.min + range.max) / 2) : 50
}

export const getConditionColor = (score: number): string => {
  if (score >= 90) return '#48bb78'
  if (score >= 75) return '#38b2ac'
  if (score >= 55) return '#ed8936'
  if (score >= 35) return '#e53e3e'
  return '#718096'
}

export const getConditionColorByLabel = (label: string): string => {
  const colors: Record<string, string> = {
    'Mint': '#48bb78',
    'Near Mint': '#38b2ac',
    'Very Good': '#ed8936',
    'Good': '#e53e3e',
    'Poor': '#718096'
  }
  return colors[label] || '#718096'
}

export const degradeCondition = (score: number, isDisplayed: boolean): number => {
  const baseLoss = 1 + Math.random() * 2
  const displayMultiplier = isDisplayed ? 1.5 : 0.6
  const loss = baseLoss * displayMultiplier
  return Math.max(0, Math.round(score - loss))
}

export const calculateRenovationCost = (
  currentScore: number,
  targetScore: number,
  rarity: number
): number => {
  if (targetScore <= currentScore) return 0
  const scoreDiff = targetScore - currentScore
  const rarityMultiplier = 0.8 + rarity * 0.3
  const baseCostPerPoint = 5
  const diminishingFactor = 1 + (currentScore / 100) * 0.5
  return Math.floor(scoreDiff * baseCostPerPoint * rarityMultiplier * diminishingFactor)
}

export const getRenovationOptions = (
  currentScore: number,
  rarity: number
): RenovationOption[] => {
  const options: RenovationOption[] = []

  for (const range of conditionRanges) {
    if (range.min > currentScore) {
      const targetScore = range.min
      const cost = calculateRenovationCost(currentScore, targetScore, rarity)
      const descriptions: Record<ConditionLabel, string> = {
        'Poor': '基础修复，清除明显损伤',
        'Good': '深度清洁，修复划痕',
        'Very Good': '专业翻新，恢复光泽',
        'Near Mint': '精细打磨，近乎全新',
        'Mint': '完美修复，如刚出厂'
      }
      options.push({
        targetLabel: range.label,
        targetScore,
        cost,
        description: descriptions[range.label]
      })
    }
  }

  return options
}

export const calculateCollectionValue = (
  rarity: number,
  conditionScore: number,
  marketPrice: number
): number => {
  const conditionMultiplier = 0.3 + (conditionScore / 100) * 1.7
  const rarityMultiplier = 1 + (rarity - 1) * 0.25
  return Math.floor(marketPrice * conditionMultiplier * rarityMultiplier)
}

export const getConditionDescription = (label: ConditionLabel): string => {
  const descriptions: Record<ConditionLabel, string> = {
    'Mint': '完美品相，如刚出厂',
    'Near Mint': '近乎全新，轻微使用痕迹',
    'Very Good': '良好品相，有明显使用痕迹',
    'Good': '一般品相，划痕和磨损明显',
    'Poor': '较差品相，严重影响播放'
  }
  return descriptions[label]
}

export const getConditionImpactOnSales = (score: number): {
  priceModifier: number
  satisfactionModifier: number
  buyChanceModifier: number
} => {
  if (score >= 90) return { priceModifier: 1.15, satisfactionModifier: 10, buyChanceModifier: 0.1 }
  if (score >= 75) return { priceModifier: 1.0, satisfactionModifier: 0, buyChanceModifier: 0 }
  if (score >= 55) return { priceModifier: 0.85, satisfactionModifier: -10, buyChanceModifier: -0.1 }
  if (score >= 35) return { priceModifier: 0.7, satisfactionModifier: -20, buyChanceModifier: -0.2 }
  return { priceModifier: 0.5, satisfactionModifier: -30, buyChanceModifier: -0.35 }
}
