import type {
  RepairMaterial,
  RepairMaterialType,
  RepairQuality,
  RepairQualityConfig,
  RepairWorkshopState,
  RepairWorkshopStats,
  InventoryItem
} from '@/types'
import { calculateRenovationCost, getConditionLabel, calculateCollectionValue } from './condition'

export const repairMaterials: RepairMaterial[] = [
  {
    type: 'cleaner',
    name: '唱片清洁剂',
    icon: '🧴',
    description: '基础清洁，去除灰尘和指纹',
    unitCost: 15,
    conditionBoost: 5,
    priceBoostPercent: 0.02,
    rarityBoostChance: 0
  },
  {
    type: 'scratch_remover',
    name: '划痕修复液',
    icon: '💧',
    description: '修复轻微划痕，改善音质',
    unitCost: 35,
    conditionBoost: 12,
    priceBoostPercent: 0.05,
    rarityBoostChance: 0.02
  },
  {
    type: 'sleeve',
    name: '原装内袋',
    icon: '📄',
    description: '防静电内袋，保护唱片表面',
    unitCost: 25,
    conditionBoost: 3,
    priceBoostPercent: 0.03,
    rarityBoostChance: 0.01
  },
  {
    type: 'stabilizer',
    name: '唱片镇稳器',
    icon: '⚖️',
    description: '矫正翘曲，提升播放稳定性',
    unitCost: 50,
    conditionBoost: 8,
    priceBoostPercent: 0.04,
    rarityBoostChance: 0.03
  },
  {
    type: 'polish',
    name: '专业抛光膏',
    icon: '✨',
    description: '精细抛光，恢复光泽如新',
    unitCost: 60,
    conditionBoost: 15,
    priceBoostPercent: 0.08,
    rarityBoostChance: 0.05
  }
]

export const getRepairMaterial = (type: RepairMaterialType): RepairMaterial => {
  return repairMaterials.find(m => m.type === type) || repairMaterials[0]
}

export const repairQualityConfigs: RepairQualityConfig[] = [
  {
    quality: 'basic',
    qualityName: '基础修复',
    icon: '🔧',
    conditionMultiplier: 0.7,
    priceMultiplier: 0.8,
    successRate: 0.9,
    rarityUpChance: 0,
    costMultiplier: 0.6,
    description: '快速修复，成本低廉，效果一般'
  },
  {
    quality: 'professional',
    qualityName: '专业修复',
    icon: '🛠️',
    conditionMultiplier: 1.0,
    priceMultiplier: 1.0,
    successRate: 0.95,
    rarityUpChance: 0.05,
    costMultiplier: 1.0,
    description: '标准工艺，效果稳定，性价比高'
  },
  {
    quality: 'master',
    qualityName: '大师修复',
    icon: '🏆',
    conditionMultiplier: 1.3,
    priceMultiplier: 1.25,
    successRate: 0.99,
    rarityUpChance: 0.15,
    costMultiplier: 1.8,
    description: '匠心工艺，极致效果，稀有度有机会提升'
  }
]

export const getRepairQualityConfig = (quality: RepairQuality): RepairQualityConfig => {
  return repairQualityConfigs.find(q => q.quality === quality) || repairQualityConfigs[0]
}

export const getRecommendedMaterials = (
  currentCondition: number,
  targetCondition: number
): RepairMaterialType[] => {
  const materials: RepairMaterialType[] = []
  const diff = targetCondition - currentCondition

  materials.push('cleaner')

  if (diff >= 10) {
    materials.push('sleeve')
  }
  if (diff >= 15) {
    materials.push('scratch_remover')
  }
  if (diff >= 25) {
    materials.push('stabilizer')
  }
  if (diff >= 35 || currentCondition < 40) {
    materials.push('polish')
  }

  return materials
}

export const calculateMaterialCost = (materials: RepairMaterialType[]): number => {
  return materials.reduce((sum, type) => {
    const mat = getRepairMaterial(type)
    return sum + mat.unitCost
  }, 0)
}

export const calculateTotalConditionBoost = (
  materials: RepairMaterialType[],
  quality: RepairQuality
): number => {
  const config = getRepairQualityConfig(quality)
  const baseBoost = materials.reduce((sum, type) => {
    const mat = getRepairMaterial(type)
    return sum + mat.conditionBoost
  }, 0)
  return Math.floor(baseBoost * config.conditionMultiplier)
}

export const calculateTotalPriceBoost = (
  materials: RepairMaterialType[],
  quality: RepairQuality
): number => {
  const config = getRepairQualityConfig(quality)
  const baseBoost = materials.reduce((sum, type) => {
    const mat = getRepairMaterial(type)
    return sum + mat.priceBoostPercent
  }, 0)
  return baseBoost * config.priceMultiplier
}

export const calculateRarityUpChance = (
  materials: RepairMaterialType[],
  quality: RepairQuality
): number => {
  const config = getRepairQualityConfig(quality)
  const baseChance = materials.reduce((sum, type) => {
    const mat = getRepairMaterial(type)
    return sum + mat.rarityBoostChance
  }, 0)
  return Math.min(0.3, baseChance + config.rarityUpChance)
}

export const calculateRepairLaborCost = (
  currentCondition: number,
  targetCondition: number,
  rarity: number,
  quality: RepairQuality
): number => {
  const config = getRepairQualityConfig(quality)
  const baseRenovationCost = calculateRenovationCost(currentCondition, targetCondition, rarity)
  return Math.floor(baseRenovationCost * config.costMultiplier)
}

export const calculateRepairDuration = (
  quality: RepairQuality,
  materialCount: number
): number => {
  const baseDuration: { [key in RepairQuality]: number } = {
    basic: 5,
    professional: 10,
    master: 20
  }
  return baseDuration[quality] + materialCount * 2
}

export const simulateRepairResult = (
  initialCondition: number,
  _targetCondition: number,
  materials: RepairMaterialType[],
  quality: RepairQuality,
  originalMarketPrice: number,
  originalRarity: number
): {
  success: boolean
  finalCondition: number
  finalMarketPrice: number
  priceIncrease: number
  collectionValueChange: number
  rarityUpgraded: boolean
  notes: string
} => {
  const config = getRepairQualityConfig(quality)
  const success = Math.random() < config.successRate

  if (!success) {
    const damage = 3 + Math.floor(Math.random() * 8)
    const finalCondition = Math.max(0, initialCondition - damage)
    const finalMarketPrice = Math.floor(originalMarketPrice * (0.9 + Math.random() * 0.05))
    return {
      success: false,
      finalCondition,
      finalMarketPrice,
      priceIncrease: finalMarketPrice - originalMarketPrice,
      collectionValueChange: calculateCollectionValue(originalRarity, finalCondition, finalMarketPrice) - calculateCollectionValue(originalRarity, initialCondition, originalMarketPrice),
      rarityUpgraded: false,
      notes: `修复失败！品相下降 ${initialCondition - finalCondition} 点，建议使用更高品质的修复工艺`
    }
  }

  const conditionBoost = calculateTotalConditionBoost(materials, quality)
  const randomFactor = 0.85 + Math.random() * 0.3
  const finalCondition = Math.min(100, Math.floor(initialCondition + conditionBoost * randomFactor))

  const priceBoostPercent = calculateTotalPriceBoost(materials, quality)
  const conditionPriceFactor = (finalCondition - initialCondition) / 100 * 0.5
  const totalPriceFactor = 1 + priceBoostPercent + conditionPriceFactor
  const finalMarketPrice = Math.floor(originalMarketPrice * totalPriceFactor)

  const rarityUpChance = calculateRarityUpChance(materials, quality)
  const rarityUpgraded = originalRarity < 5 && Math.random() < rarityUpChance

  const finalRarity = rarityUpgraded ? Math.min(5, originalRarity + 1) : originalRarity
  const collectionValueChange = calculateCollectionValue(finalRarity, finalCondition, finalMarketPrice) - calculateCollectionValue(originalRarity, initialCondition, originalMarketPrice)

  const notes = rarityUpgraded
    ? `完美修复！品相提升至 ${getConditionLabel(finalCondition)}，稀有度也提升了一级！`
    : finalCondition >= 90
    ? `完美修复！品相达到 ${getConditionLabel(finalCondition)}，收藏价值大幅提升`
    : finalCondition >= 75
    ? `修复成功！品相提升至 ${getConditionLabel(finalCondition)}，售价有所上涨`
    : `修复完成，品相提升至 ${getConditionLabel(finalCondition)}`

  return {
    success: true,
    finalCondition,
    finalMarketPrice,
    priceIncrease: finalMarketPrice - originalMarketPrice,
    collectionValueChange,
    rarityUpgraded,
    notes
  }
}

export const createInitialRepairWorkshopState = (): RepairWorkshopState => ({
  materials: [
    { type: 'cleaner', quantity: 10 },
    { type: 'scratch_remover', quantity: 5 },
    { type: 'sleeve', quantity: 8 },
    { type: 'stabilizer', quantity: 3 },
    { type: 'polish', quantity: 2 }
  ],
  activeTasks: [],
  completedTasks: [],
  history: [],
  stats: createEmptyRepairStats(),
  maxActiveTasks: 3,
  unlockedQualities: ['basic', 'professional']
})

export const createEmptyRepairStats = (): RepairWorkshopStats => ({
  totalRepairsCompleted: 0,
  totalRepairsFailed: 0,
  totalMaterialCost: 0,
  totalLaborCost: 0,
  totalPriceIncrease: 0,
  totalCollectionValueGain: 0,
  rarityUpgrades: 0,
  successRate: 0
})

export const getRepairableInventory = (inventory: InventoryItem[]): InventoryItem[] => {
  return inventory.filter(item => item.conditionScore < 85)
}

export const generateRepairTaskId = (): string => {
  return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const canAffordMaterials = (
  workshopMaterials: RepairWorkshopState['materials'],
  requiredMaterials: RepairMaterialType[]
): boolean => {
  for (const matType of requiredMaterials) {
    const inv = workshopMaterials.find(m => m.type === matType)
    if (!inv || inv.quantity <= 0) return false
  }
  return true
}

export const getRepairProfitEstimate = (
  initialCondition: number,
  finalCondition: number,
  initialPrice: number,
  totalCost: number
): { estimatedPrice: number; estimatedProfit: number; roi: number } => {
  const conditionFactor = (finalCondition - initialCondition) / 100 * 0.6
  const estimatedPrice = Math.floor(initialPrice * (1 + conditionFactor))
  const estimatedProfit = estimatedPrice - initialPrice - totalCost
  const roi = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : 0
  return { estimatedPrice, estimatedProfit, roi }
}
