import type { WordOfMouthTier, WordOfMouthConfig, LevelEvaluation, Genre } from '@/types'

export const wordOfMouthTiers: WordOfMouthConfig[] = [
  {
    tier: 'unknown',
    tierName: '默默无闻',
    icon: '🔇',
    minReputation: 0,
    maxReputation: 20,
    customerCountModifier: 0,
    budgetModifier: 1.0,
    matchScoreBonus: 0,
    buyChanceBonus: 0,
    preferenceAlignmentBonus: 0,
    difficultyScale: 0.85,
    description: '刚开业的小店，还没什么人知道...'
  },
  {
    tier: 'known',
    tierName: '小有名气',
    icon: '🔈',
    minReputation: 21,
    maxReputation: 40,
    customerCountModifier: 0.1,
    budgetModifier: 1.05,
    matchScoreBonus: 3,
    buyChanceBonus: 0.03,
    preferenceAlignmentBonus: 0.05,
    difficultyScale: 0.9,
    description: '附近开始有人谈论你的店了'
  },
  {
    tier: 'spread',
    tierName: '口碑相传',
    icon: '🔉',
    minReputation: 41,
    maxReputation: 60,
    customerCountModifier: 0.2,
    budgetModifier: 1.1,
    matchScoreBonus: 5,
    buyChanceBonus: 0.05,
    preferenceAlignmentBonus: 0.1,
    difficultyScale: 1.0,
    description: '老顾客会推荐朋友来你的店'
  },
  {
    tier: 'famous',
    tierName: '声名远播',
    icon: '🔊',
    minReputation: 61,
    maxReputation: 80,
    customerCountModifier: 0.35,
    budgetModifier: 1.2,
    matchScoreBonus: 8,
    buyChanceBonus: 0.08,
    preferenceAlignmentBonus: 0.15,
    difficultyScale: 1.1,
    description: '全城都知道这家唱片店的口碑'
  },
  {
    tier: 'legendary',
    tierName: '传奇名店',
    icon: '🎺',
    minReputation: 81,
    maxReputation: 100,
    customerCountModifier: 0.5,
    budgetModifier: 1.35,
    matchScoreBonus: 12,
    buyChanceBonus: 0.12,
    preferenceAlignmentBonus: 0.2,
    difficultyScale: 1.2,
    description: '音乐爱好者的朝圣之地，口耳相传的传奇'
  }
]

export const getWordOfMouthTier = (reputation: number): WordOfMouthConfig => {
  for (let i = wordOfMouthTiers.length - 1; i >= 0; i--) {
    if (reputation >= wordOfMouthTiers[i].minReputation) {
      return wordOfMouthTiers[i]
    }
  }
  return wordOfMouthTiers[0]
}

export const getTierByEnum = (tier: WordOfMouthTier): WordOfMouthConfig => {
  return wordOfMouthTiers.find(t => t.tier === tier) || wordOfMouthTiers[0]
}

export const getCustomerCountWithReputation = (
  baseCount: number,
  reputation: number
): number => {
  const config = getWordOfMouthTier(reputation)
  return Math.floor(baseCount * (1 + config.customerCountModifier))
}

export const getBudgetWithReputation = (
  baseBudget: number,
  reputation: number
): number => {
  const config = getWordOfMouthTier(reputation)
  return Math.floor(baseBudget * config.budgetModifier)
}

export const getMatchScoreBonus = (reputation: number): number => {
  return getWordOfMouthTier(reputation).matchScoreBonus
}

export const getBuyChanceBonus = (reputation: number): number => {
  return getWordOfMouthTier(reputation).buyChanceBonus
}

export const alignPreferencesWithInventory = (
  customerGenres: Genre[],
  inventoryGenres: Genre[],
  reputation: number
): Genre[] => {
  const config = getWordOfMouthTier(reputation)
  if (config.preferenceAlignmentBonus <= 0) return customerGenres

  const aligned = [...customerGenres]
  const available = inventoryGenres.filter(g => !aligned.includes(g))

  const extraCount = Math.floor(available.length * config.preferenceAlignmentBonus)
  const shuffled = available.sort(() => Math.random() - 0.5)

  for (let i = 0; i < extraCount && i < shuffled.length; i++) {
    aligned.push(shuffled[i])
  }

  return aligned
}

export const getDifficultyScale = (reputation: number): number => {
  return getWordOfMouthTier(reputation).difficultyScale
}

export const getScaledTargets = (
  baseProfit: number,
  baseSales: number,
  baseSatisfaction: number,
  reputation: number
) => {
  const scale = getDifficultyScale(reputation)
  return {
    targetProfit: Math.floor(baseProfit * scale),
    targetSales: Math.max(baseSales, Math.floor(baseSales * scale)),
    targetSatisfaction: Math.min(100, Math.floor(baseSatisfaction * scale))
  }
}

export const calculateLevelEvaluation = (
  profit: number,
  targetProfit: number,
  sales: number,
  targetSales: number,
  reputation: number,
  targetSatisfaction: number,
  startReputation: number
): LevelEvaluation => {
  const profitRatio = profit / targetProfit
  const salesRatio = sales / targetSales
  const satisfactionRatio = reputation / targetSatisfaction

  const rawScore = (profitRatio * 40 + salesRatio * 30 + satisfactionRatio * 30)

  const reputationGain = reputation - startReputation
  let reputationTrend: 'rising' | 'stable' | 'declining' = 'stable'
  if (reputationGain >= 5) reputationTrend = 'rising'
  else if (reputationGain <= -3) reputationTrend = 'declining'

  const trendBonus = reputationTrend === 'rising' ? 10 : reputationTrend === 'stable' ? 0 : -5
  const totalScore = Math.max(0, Math.min(100, rawScore + trendBonus))

  let grade: 'S' | 'A' | 'B' | 'C' | 'D'
  let gradeLabel: string

  if (totalScore >= 90) { grade = 'S'; gradeLabel = '完美通关' }
  else if (totalScore >= 75) { grade = 'A'; gradeLabel = '优秀表现' }
  else if (totalScore >= 60) { grade = 'B'; gradeLabel = '合格过关' }
  else if (totalScore >= 40) { grade = 'C'; gradeLabel = '勉强达标' }
  else { grade = 'D'; gradeLabel = '需要努力' }

  const tierConfig = getWordOfMouthTier(reputation)
  const wordOfMouthBonus = Math.floor(totalScore * tierConfig.customerCountModifier * 5)

  const customerFlowBonus = Math.floor(tierConfig.customerCountModifier * 100)

  return {
    grade,
    gradeLabel,
    wordOfMouthBonus,
    reputationTrend,
    customerFlowBonus,
    totalScore: Math.round(totalScore)
  }
}

export const getGradeColor = (grade: 'S' | 'A' | 'B' | 'C' | 'D'): string => {
  const colors: Record<string, string> = {
    S: '#ffd700',
    A: '#48bb78',
    B: '#4299e1',
    C: '#ed8936',
    D: '#f56565'
  }
  return colors[grade] || '#a0aec0'
}

export const getGradeIcon = (grade: 'S' | 'A' | 'B' | 'C' | 'D'): string => {
  const icons: Record<string, string> = {
    S: '🏆',
    A: '🌟',
    B: '✅',
    C: '⚠️',
    D: '💔'
  }
  return icons[grade] || '📋'
}

export const getTrendIcon = (trend: 'rising' | 'stable' | 'declining'): string => {
  const icons = { rising: '📈', stable: '➡️', declining: '📉' }
  return icons[trend]
}

export const getTrendLabel = (trend: 'rising' | 'stable' | 'declining'): string => {
  const labels = { rising: '上升', stable: '平稳', declining: '下滑' }
  return labels[trend]
}
