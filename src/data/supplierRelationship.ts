import type {
  SupplierContractTier,
  SupplierContractConfig,
  SupplierGrowthMilestone,
  SupplierExclusiveSupply,
  SupplierBreachRecord,
  SupplierRelationship,
  SupplierRelationshipBonusSummary,
  Supplier,
  SupplierType
} from '@/types'

export const contractTiers: SupplierContractConfig[] = [
  {
    tier: 'none',
    tierName: '未签约',
    icon: '🤝',
    minTrustPoints: 0,
    discountRate: 0,
    exclusiveSlotCount: 0,
    minOrderDiscount: 0,
    deliveryBonus: 0,
    rareItemBonus: 0,
    breachForgiveness: 0,
    dailyTrustGainCap: 5,
    description: '尚未建立正式合作关系，按常规价格采购'
  },
  {
    tier: 'trial',
    tierName: '试用合约',
    icon: '📋',
    minTrustPoints: 20,
    discountRate: 0.03,
    exclusiveSlotCount: 0,
    minOrderDiscount: 0,
    deliveryBonus: 0,
    rareItemBonus: 0,
    breachForgiveness: 0,
    dailyTrustGainCap: 8,
    description: '初步合作，享受3%采购折扣'
  },
  {
    tier: 'standard',
    tierName: '标准合约',
    icon: '📄',
    minTrustPoints: 80,
    discountRate: 0.06,
    exclusiveSlotCount: 1,
    minOrderDiscount: 0.02,
    deliveryBonus: 0,
    rareItemBonus: 0.05,
    breachForgiveness: 1,
    dailyTrustGainCap: 12,
    description: '稳定合作，6%折扣，开放1个专属货源位'
  },
  {
    tier: 'preferred',
    tierName: '优先合约',
    icon: '🌟',
    minTrustPoints: 200,
    discountRate: 0.10,
    exclusiveSlotCount: 2,
    minOrderDiscount: 0.05,
    deliveryBonus: 1,
    rareItemBonus: 0.10,
    breachForgiveness: 2,
    dailyTrustGainCap: 16,
    description: '优先合作，10%折扣，2个专属货源位，配送加速'
  },
  {
    tier: 'strategic',
    tierName: '战略合作',
    icon: '⭐',
    minTrustPoints: 450,
    discountRate: 0.15,
    exclusiveSlotCount: 3,
    minOrderDiscount: 0.08,
    deliveryBonus: 1,
    rareItemBonus: 0.18,
    breachForgiveness: 3,
    dailyTrustGainCap: 20,
    description: '战略伙伴，15%折扣，3个专属货源位，稀有品大量加成'
  },
  {
    tier: 'exclusive',
    tierName: '独家签约',
    icon: '👑',
    minTrustPoints: 800,
    discountRate: 0.22,
    exclusiveSlotCount: 5,
    minOrderDiscount: 0.12,
    deliveryBonus: 2,
    rareItemBonus: 0.30,
    breachForgiveness: 5,
    dailyTrustGainCap: 25,
    description: '最高等级，22%折扣，5个专属货源位，极致稀有品加成'
  }
]

export const growthMilestones: SupplierGrowthMilestone[] = [
  {
    id: 'ms-first-deal',
    name: '初次成交',
    icon: '🤝',
    requiredTrustPoints: 10,
    requiredContractTier: 'none',
    rewardType: 'discount_boost',
    rewardValue: 0.01,
    rewardDescription: '额外1%采购折扣',
    isUnlocked: false
  },
  {
    id: 'ms-regular-buyer',
    name: '稳定客户',
    icon: '📦',
    requiredTrustPoints: 30,
    requiredContractTier: 'trial',
    rewardType: 'special_offer_boost',
    rewardValue: 0.10,
    rewardDescription: '特惠出现率+10%',
    isUnlocked: false
  },
  {
    id: 'ms-genre-access',
    name: '品类通行',
    icon: '🎵',
    requiredTrustPoints: 60,
    requiredContractTier: 'trial',
    rewardType: 'exclusive_genre',
    rewardValue: 1,
    rewardDescription: '解锁1个专属风格货源',
    isUnlocked: false
  },
  {
    id: 'ms-rare-channel',
    name: '稀有渠道',
    icon: '💎',
    requiredTrustPoints: 120,
    requiredContractTier: 'standard',
    rewardType: 'rare_slot',
    rewardValue: 1,
    rewardDescription: '额外1个稀有品货位',
    isUnlocked: false
  },
  {
    id: 'ms-fast-lane',
    name: '快速通道',
    icon: '⚡',
    requiredTrustPoints: 200,
    requiredContractTier: 'standard',
    rewardType: 'delivery_speed',
    rewardValue: 1,
    rewardDescription: '配送时间减少1天',
    isUnlocked: false
  },
  {
    id: 'ms-breach-shield',
    name: '违约豁免',
    icon: '🛡️',
    requiredTrustPoints: 300,
    requiredContractTier: 'preferred',
    rewardType: 'breach_shield',
    rewardValue: 1,
    rewardDescription: '每关可豁免1次轻微违约',
    isUnlocked: false
  },
  {
    id: 'ms-deep-discount',
    name: '深度折扣',
    icon: '💰',
    requiredTrustPoints: 400,
    requiredContractTier: 'preferred',
    rewardType: 'discount_boost',
    rewardValue: 0.03,
    rewardDescription: '额外3%采购折扣',
    isUnlocked: false
  },
  {
    id: 'ms-elite-supply',
    name: '精英供应',
    icon: '🏆',
    requiredTrustPoints: 600,
    requiredContractTier: 'strategic',
    rewardType: 'rare_slot',
    rewardValue: 2,
    rewardDescription: '额外2个稀有品货位',
    isUnlocked: false
  },
  {
    id: 'ms-exclusive-deal',
    name: '独家协议',
    icon: '👑',
    requiredTrustPoints: 800,
    requiredContractTier: 'exclusive',
    rewardType: 'discount_boost',
    rewardValue: 0.05,
    rewardDescription: '额外5%采购折扣',
    isUnlocked: false
  }
]

export const exclusiveSupplies: Record<SupplierType, SupplierExclusiveSupply[]> = {
  wholesaler: [
    { genre: 'Jazz', minRarity: 3, bonusStockCount: 2, priceCap: 400, requiredContractTier: 'standard' },
    { genre: 'Rock', minRarity: 4, bonusStockCount: 1, priceCap: 600, requiredContractTier: 'preferred' },
    { genre: 'Pop', minRarity: 2, bonusStockCount: 3, priceCap: 250, requiredContractTier: 'trial' }
  ],
  specialist: [
    { genre: 'Jazz', minRarity: 4, bonusStockCount: 2, priceCap: 800, requiredContractTier: 'standard' },
    { genre: 'Blues', minRarity: 3, bonusStockCount: 2, priceCap: 500, requiredContractTier: 'preferred' },
    { genre: 'Classical', minRarity: 4, bonusStockCount: 1, priceCap: 900, requiredContractTier: 'strategic' }
  ],
  collector: [
    { genre: 'Jazz', minRarity: 5, bonusStockCount: 1, priceCap: 1500, requiredContractTier: 'preferred' },
    { genre: 'Rock', minRarity: 5, bonusStockCount: 1, priceCap: 1200, requiredContractTier: 'strategic' },
    { genre: 'Folk', minRarity: 4, bonusStockCount: 2, priceCap: 700, requiredContractTier: 'standard' }
  ],
  importer: [
    { genre: 'Electronic', minRarity: 4, bonusStockCount: 2, priceCap: 700, requiredContractTier: 'standard' },
    { genre: 'Disco', minRarity: 3, bonusStockCount: 2, priceCap: 450, requiredContractTier: 'trial' },
    { genre: 'Funk', minRarity: 4, bonusStockCount: 1, priceCap: 600, requiredContractTier: 'preferred' }
  ],
  discount: [
    { genre: 'Pop', minRarity: 2, bonusStockCount: 4, priceCap: 150, requiredContractTier: 'trial' },
    { genre: 'Rock', minRarity: 3, bonusStockCount: 3, priceCap: 300, requiredContractTier: 'standard' },
    { genre: 'Disco', minRarity: 3, bonusStockCount: 2, priceCap: 350, requiredContractTier: 'preferred' }
  ]
}

export const breachPenaltyConfig = {
  min_order_missed: {
    trustPenalty: 15,
    reputationPenalty: 2,
    fineRate: 0.05,
    label: '未达最低订货量',
    description: '单次采购未达到供应商最低订货要求'
  },
  contract_cancelled: {
    trustPenalty: 50,
    reputationPenalty: 5,
    fineRate: 0.15,
    label: '违约解约',
    description: '在合约期内主动解除合作关系'
  },
  payment_delayed: {
    trustPenalty: 10,
    reputationPenalty: 1,
    fineRate: 0.03,
    label: '付款延迟',
    description: '未按时完成货款结算'
  },
  exclusive_violation: {
    trustPenalty: 30,
    reputationPenalty: 3,
    fineRate: 0.10,
    label: '专属渠道违规',
    description: '违反独家供应协议条款'
  }
}

export const getContractTierConfig = (tier: SupplierContractTier): SupplierContractConfig => {
  return contractTiers.find(t => t.tier === tier) || contractTiers[0]
}

export const getContractTierByTrust = (trustPoints: number): SupplierContractTier => {
  let result: SupplierContractTier = 'none'
  for (const config of contractTiers) {
    if (trustPoints >= config.minTrustPoints) {
      result = config.tier
    }
  }
  return result
}

export const getNextContractTier = (currentTier: SupplierContractTier): SupplierContractConfig | null => {
  const currentIndex = contractTiers.findIndex(t => t.tier === currentTier)
  if (currentIndex < contractTiers.length - 1) {
    return contractTiers[currentIndex + 1]
  }
  return null
}

export const getTierColor = (tier: SupplierContractTier): string => {
  const colors: Record<SupplierContractTier, string> = {
    none: '#a0aec0',
    trial: '#90cdf4',
    standard: '#68d391',
    preferred: '#f6ad55',
    strategic: '#fc8181',
    exclusive: '#d69e2e'
  }
  return colors[tier]
}

export const getTierBgColor = (tier: SupplierContractTier): string => {
  const colors: Record<SupplierContractTier, string> = {
    none: 'rgba(160,174,192,0.12)',
    trial: 'rgba(144,205,244,0.12)',
    standard: 'rgba(104,211,145,0.12)',
    preferred: 'rgba(246,173,85,0.12)',
    strategic: 'rgba(252,129,129,0.12)',
    exclusive: 'rgba(214,158,46,0.12)'
  }
  return colors[tier]
}

export const createInitialRelationship = (supplierId: string): SupplierRelationship => ({
  supplierId,
  contractTier: 'none',
  trustPoints: 0,
  totalSpent: 0,
  totalPurchased: 0,
  consecutivePurchaseDays: 0,
  breachCount: 0,
  breachRecords: [],
  unlockedMilestones: [],
  isActive: false,
  contractStartDate: null,
  lastPurchaseDay: 0,
  dailyTrustGained: 0,
  cumulativeDiscount: 0
})

export const calculateTrustGain = (
  relationship: SupplierRelationship,
  purchaseAmount: number,
  itemCount: number
): number => {
  const config = getContractTierConfig(relationship.contractTier)
  const baseGain = Math.floor(purchaseAmount / 50) + itemCount
  const consecutiveBonus = relationship.consecutivePurchaseDays >= 3 ? 0.3 : 0
  const noBreachBonus = relationship.breachCount === 0 ? 0.15 : 0
  const multiplier = 1 + consecutiveBonus + noBreachBonus
  const gain = Math.floor(baseGain * multiplier)
  return Math.min(gain, config.dailyTrustGainCap)
}

export const applyBreachPenalty = (
  relationship: SupplierRelationship,
  type: SupplierBreachRecord['type'],
  orderAmount: number,
  currentDay: number
): { updatedRelationship: SupplierRelationship; breachRecord: SupplierBreachRecord } => {
  const penaltyConfig = breachPenaltyConfig[type]
  const tierConfig = getContractTierConfig(relationship.contractTier)
  const forgiven = relationship.breachCount < tierConfig.breachForgiveness

  const trustPenalty = forgiven ? 0 : penaltyConfig.trustPenalty
  const reputationPenalty = forgiven ? 0 : penaltyConfig.reputationPenalty
  const fineAmount = Math.floor(orderAmount * penaltyConfig.fineRate)

  const breachRecord: SupplierBreachRecord = {
    id: `breach-${currentDay}-${relationship.supplierId}-${Date.now()}`,
    supplierId: relationship.supplierId,
    day: currentDay,
    type,
    description: forgiven
      ? `${penaltyConfig.label}（已豁免）`
      : penaltyConfig.description,
    trustPenalty,
    reputationPenalty,
    fineAmount
  }

  const newTrust = Math.max(0, relationship.trustPoints - trustPenalty)
  const newTier = getContractTierByTrust(newTrust)

  return {
    updatedRelationship: {
      ...relationship,
      trustPoints: newTrust,
      contractTier: newTier,
      breachCount: relationship.breachCount + (forgiven ? 0 : 1),
      breachRecords: [...relationship.breachRecords, breachRecord]
    },
    breachRecord
  }
}

export const calculateTotalDiscount = (relationship: SupplierRelationship): number => {
  const tierConfig = getContractTierConfig(relationship.contractTier)
  let discount = tierConfig.discountRate

  const milestoneDiscounts = relationship.unlockedMilestones
    .map(id => growthMilestones.find(m => m.id === id))
    .filter((m): m is SupplierGrowthMilestone => m !== undefined && m.rewardType === 'discount_boost')
    .reduce((sum, m) => sum + m.rewardValue, 0)

  discount += milestoneDiscounts
  return Math.min(discount, 0.35)
}

export const getExclusiveSuppliesForSupplier = (
  supplier: Supplier,
  relationship: SupplierRelationship
): SupplierExclusiveSupply[] => {
  const supplies = exclusiveSupplies[supplier.type] || []
  return supplies.filter(s => {
    const tierIndex = contractTiers.findIndex(t => t.tier === s.requiredContractTier)
    const currentTierIndex = contractTiers.findIndex(t => t.tier === relationship.contractTier)
    return currentTierIndex >= tierIndex
  })
}

export const getMilestonesForRelationship = (relationship: SupplierRelationship): SupplierGrowthMilestone[] => {
  const currentTierIndex = contractTiers.findIndex(t => t.tier === relationship.contractTier)

  return growthMilestones.map(milestone => {
    const requiredTierIndex = contractTiers.findIndex(t => t.tier === milestone.requiredContractTier)
    const trustMet = relationship.trustPoints >= milestone.requiredTrustPoints
    const tierMet = currentTierIndex >= requiredTierIndex
    const isUnlocked = relationship.unlockedMilestones.includes(milestone.id)

    return {
      ...milestone,
      isUnlocked: isUnlocked || (trustMet && tierMet)
    }
  })
}

export const checkAndUnlockMilestones = (relationship: SupplierRelationship): string[] => {
  const newlyUnlocked: string[] = []
  const currentTierIndex = contractTiers.findIndex(t => t.tier === relationship.contractTier)

  for (const milestone of growthMilestones) {
    if (relationship.unlockedMilestones.includes(milestone.id)) continue

    const requiredTierIndex = contractTiers.findIndex(t => t.tier === milestone.requiredContractTier)
    const trustMet = relationship.trustPoints >= milestone.requiredTrustPoints
    const tierMet = currentTierIndex >= requiredTierIndex

    if (trustMet && tierMet) {
      newlyUnlocked.push(milestone.id)
    }
  }

  return newlyUnlocked
}

export const calculateRelationshipBonusSummary = (
  relationship: SupplierRelationship
): SupplierRelationshipBonusSummary => {
  const tierConfig = getContractTierConfig(relationship.contractTier)
  const totalDiscount = calculateTotalDiscount(relationship)

  const activeMilestoneBonuses = relationship.unlockedMilestones
    .map(id => growthMilestones.find(m => m.id === id))
    .filter((m): m is SupplierGrowthMilestone => m !== undefined)
    .map(m => ({ type: m.rewardType, value: m.rewardValue, description: m.rewardDescription }))

  const rareItemBonus = tierConfig.rareItemBonus + activeMilestoneBonuses
    .filter(b => b.type === 'rare_slot')
    .reduce((sum, b) => sum + b.value * 0.05, 0)

  const deliverySpeedBonus = tierConfig.deliveryBonus + activeMilestoneBonuses
    .filter(b => b.type === 'delivery_speed')
    .reduce((sum, b) => sum + b.value, 0)

  const breachShieldCount = activeMilestoneBonuses
    .filter(b => b.type === 'breach_shield')
    .reduce((sum, b) => sum + b.value, 0)

  const nextMilestone = growthMilestones
    .filter(m => !relationship.unlockedMilestones.includes(m.id))
    .sort((a, b) => a.requiredTrustPoints - b.requiredTrustPoints)[0] || null

  const nextContractTier = getNextContractTier(relationship.contractTier)

  const nextTierThreshold = nextContractTier ? nextContractTier.minTrustPoints : tierConfig.minTrustPoints
  const currentTierThreshold = tierConfig.minTrustPoints
  const trustProgressPercent = nextContractTier
    ? Math.min(100, ((relationship.trustPoints - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100)
    : 100

  return {
    totalDiscountRate: totalDiscount,
    exclusiveSlots: tierConfig.exclusiveSlotCount,
    deliverySpeedBonus,
    rareItemBonus,
    breachForgiveness: tierConfig.breachForgiveness + breachShieldCount,
    activeMilestoneBonuses,
    nextMilestone,
    nextContractTier,
    trustProgressPercent
  }
}

export const canSignContract = (
  relationship: SupplierRelationship,
  targetTier: SupplierContractTier
): { canSign: boolean; reason: string } => {
  if (!relationship.isActive && targetTier !== 'trial') {
    return { canSign: false, 'reason': '需要先签订试用合约' }
  }

  const targetConfig = getContractTierConfig(targetTier)
  if (relationship.trustPoints < targetConfig.minTrustPoints) {
    return { canSign: false, reason: `信任度不足，需要 ${targetConfig.minTrustPoints} 点` }
  }

  const currentIndex = contractTiers.findIndex(t => t.tier === relationship.contractTier)
  const targetIndex = contractTiers.findIndex(t => t.tier === targetTier)

  if (targetIndex <= currentIndex) {
    return { canSign: false, reason: '只能升级合约等级' }
  }

  if (targetIndex > currentIndex + 1) {
    return { canSign: false, reason: '需要逐级升级合约' }
  }

  return { canSign: true, reason: '' }
}

export const signContract = (
  relationship: SupplierRelationship,
  targetTier: SupplierContractTier,
  currentDay: number
): SupplierRelationship => {
  return {
    ...relationship,
    contractTier: targetTier,
    isActive: true,
    contractStartDate: currentDay,
    breachCount: 0
  }
}

export const cancelContract = (
  relationship: SupplierRelationship,
  currentDay: number
): { updatedRelationship: SupplierRelationship; breachRecord: SupplierBreachRecord } => {
  return applyBreachPenalty(relationship, 'contract_cancelled', relationship.totalSpent * 0.1, currentDay)
}

export const updateRelationshipOnPurchase = (
  relationship: SupplierRelationship,
  purchaseAmount: number,
  itemCount: number,
  currentDay: number
): SupplierRelationship => {
  const trustGain = calculateTrustGain(relationship, purchaseAmount, itemCount)
  const newTrust = relationship.trustPoints + trustGain
  const newTier = getContractTierByTrust(newTrust)
  const discount = calculateTotalDiscount({ ...relationship, trustPoints: newTrust, contractTier: newTier })
  const savedAmount = Math.floor(purchaseAmount * discount)

  const isConsecutive = currentDay === relationship.lastPurchaseDay + 1
  const consecutiveDays = isConsecutive
    ? relationship.consecutivePurchaseDays + 1
    : (currentDay === relationship.lastPurchaseDay ? relationship.consecutivePurchaseDays : 1)

  return {
    ...relationship,
    trustPoints: newTrust,
    contractTier: newTier,
    totalSpent: relationship.totalSpent + purchaseAmount,
    totalPurchased: relationship.totalPurchased + itemCount,
    consecutivePurchaseDays: consecutiveDays,
    lastPurchaseDay: currentDay,
    dailyTrustGained: relationship.dailyTrustGained + trustGain,
    cumulativeDiscount: relationship.cumulativeDiscount + savedAmount,
    isActive: true
  }
}

export const resetDailyTrustGain = (relationship: SupplierRelationship): SupplierRelationship => {
  return {
    ...relationship,
    dailyTrustGained: 0
  }
}

export const getBreachTypeLabel = (type: SupplierBreachRecord['type']): string => {
  return breachPenaltyConfig[type]?.label || type
}

export const getBreachTypeIcon = (type: SupplierBreachRecord['type']): string => {
  const icons: Record<SupplierBreachRecord['type'], string> = {
    min_order_missed: '📦',
    contract_cancelled: '❌',
    payment_delayed: '⏰',
    exclusive_violation: '🔒'
  }
  return icons[type]
}
