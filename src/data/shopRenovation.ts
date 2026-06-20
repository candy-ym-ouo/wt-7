import type {
  ShopStyleTier,
  ShopStyleConfig,
  ShopAreaTier,
  ShopAreaConfig,
  DisplaySlotType,
  DisplaySlotUpgradeConfig,
  ShopDisplaySlotState,
  CustomerAttractionTier,
  CustomerAttractionConfig,
  RevenueBonusTier,
  RevenueBonusConfig,
  ShopRenovationState,
  ShopRenovationBonusSummary,
  Genre
} from '@/types'

export const shopStyleConfigs: ShopStyleConfig[] = [
  {
    tier: 'shabby',
    tierName: '简陋小店',
    icon: '🏚️',
    minReputation: 0,
    cost: 0,
    description: '最基础的店铺状态，勉强可以营业',
    customerCountModifier: 0,
    budgetModifier: 1,
    satisfactionBonus: 0,
    buyChanceBonus: 0,
    reputationDailyBonus: 0,
    attractGenres: [],
    unlockGenresBonus: 0,
    unlockLevel: 1
  },
  {
    tier: 'simple',
    tierName: '简约装潢',
    icon: '🏠',
    minReputation: 20,
    cost: 800,
    description: '简单整洁的装修，让顾客感觉舒适',
    customerCountModifier: 0.05,
    budgetModifier: 1.05,
    satisfactionBonus: 2,
    buyChanceBonus: 0.02,
    reputationDailyBonus: 0.3,
    attractGenres: ['Pop', 'Folk'],
    unlockGenresBonus: 0,
    unlockLevel: 1
  },
  {
    tier: 'refined',
    tierName: '精致装修',
    icon: '🏪',
    minReputation: 40,
    cost: 2500,
    description: '精致的装潢，展现店主的品味',
    customerCountModifier: 0.12,
    budgetModifier: 1.12,
    satisfactionBonus: 5,
    buyChanceBonus: 0.05,
    reputationDailyBonus: 0.8,
    attractGenres: ['Jazz', 'Soul', 'Blues'],
    unlockGenresBonus: 1,
    unlockLevel: 3
  },
  {
    tier: 'elegant',
    tierName: '典雅格调',
    icon: '🏛️',
    minReputation: 65,
    cost: 6000,
    description: '典雅的氛围，吸引有品位的顾客',
    customerCountModifier: 0.22,
    budgetModifier: 1.22,
    satisfactionBonus: 9,
    buyChanceBonus: 0.09,
    reputationDailyBonus: 1.5,
    attractGenres: ['Classical', 'Jazz', 'Blues'],
    unlockGenresBonus: 2,
    unlockLevel: 5
  },
  {
    tier: 'luxurious',
    tierName: '奢华殿堂',
    icon: '🏰',
    minReputation: 85,
    cost: 15000,
    description: '极致奢华的唱片殿堂，吸引高端藏家',
    customerCountModifier: 0.35,
    budgetModifier: 1.4,
    satisfactionBonus: 15,
    buyChanceBonus: 0.15,
    reputationDailyBonus: 2.5,
    attractGenres: ['Jazz', 'Classical', 'Soul', 'Rock'],
    unlockGenresBonus: 3,
    unlockLevel: 7
  }
]

export const shopAreaConfigs: ShopAreaConfig[] = [
  {
    tier: 'tiny',
    tierName: '迷你摊位',
    icon: '📦',
    areaLevel: 1,
    cost: 0,
    description: '仅有少量空间，基本的唱片展示',
    baseDisplaySlots: 4,
    maxCustomersBonus: 0,
    customerCountModifier: 0,
    unlockLevel: 1
  },
  {
    tier: 'small',
    tierName: '小型店铺',
    icon: '🛒',
    areaLevel: 2,
    cost: 1200,
    description: '小型唱片店，有更多陈列空间',
    baseDisplaySlots: 6,
    maxCustomersBonus: 2,
    customerCountModifier: 0.05,
    unlockLevel: 2
  },
  {
    tier: 'medium',
    tierName: '中型门店',
    icon: '🏬',
    areaLevel: 3,
    cost: 3500,
    description: '中等规模的唱片店，宽敞舒适',
    baseDisplaySlots: 9,
    maxCustomersBonus: 5,
    customerCountModifier: 0.12,
    unlockLevel: 3
  },
  {
    tier: 'large',
    tierName: '大型卖场',
    icon: '🏢',
    areaLevel: 4,
    cost: 8000,
    description: '大型唱片卖场，品类丰富',
    baseDisplaySlots: 12,
    maxCustomersBonus: 10,
    customerCountModifier: 0.2,
    unlockLevel: 5
  },
  {
    tier: 'grand',
    tierName: '旗舰总店',
    icon: '🌆',
    areaLevel: 5,
    cost: 20000,
    description: '地标级唱片旗舰店，行业标杆',
    baseDisplaySlots: 16,
    maxCustomersBonus: 18,
    customerCountModifier: 0.3,
    unlockLevel: 7
  }
]

export const displaySlotUpgradeConfigs: DisplaySlotUpgradeConfig[] = [
  {
    type: 'standard',
    typeName: '标准陈列',
    icon: '📚',
    cost: 0,
    description: '基础的唱片陈列架',
    matchScoreBonus: 0,
    buyChanceBonus: 0,
    conditionPreservationBonus: 0,
    unlockLevel: 1
  },
  {
    type: 'premium',
    typeName: '精品展柜',
    icon: '🗄️',
    cost: 600,
    description: '优质展柜，提升唱片吸引力',
    matchScoreBonus: 3,
    buyChanceBonus: 0.03,
    conditionPreservationBonus: 0.1,
    unlockLevel: 2
  },
  {
    type: 'featured',
    typeName: '推荐专区',
    icon: '🎯',
    cost: 1500,
    description: '重点推荐区域，吸引顾客注意',
    matchScoreBonus: 7,
    buyChanceBonus: 0.07,
    conditionPreservationBonus: 0.2,
    unlockLevel: 4
  },
  {
    type: 'vip',
    typeName: 'VIP珍藏',
    icon: '💎',
    cost: 4000,
    description: 'VIP珍藏展示位，适合稀有精品',
    matchScoreBonus: 12,
    buyChanceBonus: 0.12,
    conditionPreservationBonus: 0.35,
    unlockLevel: 6
  }
]

export const customerAttractionConfigs: CustomerAttractionConfig[] = [
  {
    tier: 'casual',
    tierName: '随缘客流',
    icon: '🚶',
    cost: 0,
    description: '自然吸引路过的顾客',
    specialCustomerWeightBoost: 0,
    memberChanceBonus: 0,
    highBudgetCustomerChance: 0,
    rareCollectorChance: 0,
    minReputation: 0,
    unlockLevel: 1
  },
  {
    tier: 'regular',
    tierName: '熟客营销',
    icon: '📋',
    cost: 500,
    description: '基础的熟客维护，提升回头率',
    specialCustomerWeightBoost: 0.1,
    memberChanceBonus: 0.05,
    highBudgetCustomerChance: 0.02,
    rareCollectorChance: 0,
    minReputation: 15,
    unlockLevel: 2
  },
  {
    tier: 'premium',
    tierName: '精准推广',
    icon: '📢',
    cost: 1800,
    description: '精准的营销推广，吸引优质客源',
    specialCustomerWeightBoost: 0.25,
    memberChanceBonus: 0.12,
    highBudgetCustomerChance: 0.06,
    rareCollectorChance: 0.02,
    minReputation: 35,
    unlockLevel: 3
  },
  {
    tier: 'elite',
    tierName: '高端圈层',
    icon: '🎩',
    cost: 5000,
    description: '打入高端音乐爱好者圈层',
    specialCustomerWeightBoost: 0.45,
    memberChanceBonus: 0.22,
    highBudgetCustomerChance: 0.12,
    rareCollectorChance: 0.06,
    minReputation: 60,
    unlockLevel: 5
  },
  {
    tier: 'celebrity',
    tierName: '名人效应',
    icon: '⭐',
    cost: 12000,
    description: '邀请名人背书，吸引顶级藏家',
    specialCustomerWeightBoost: 0.7,
    memberChanceBonus: 0.35,
    highBudgetCustomerChance: 0.2,
    rareCollectorChance: 0.15,
    minReputation: 80,
    unlockLevel: 7
  }
]

export const revenueBonusConfigs: RevenueBonusConfig[] = [
  {
    tier: 'none',
    tierName: '无加成',
    icon: '💰',
    cost: 0,
    description: '基础收益模式',
    salePriceBonus: 0,
    profitMarginBonus: 0,
    memberSpendBonus: 0,
    minShopStyleTier: 'shabby',
    unlockLevel: 1
  },
  {
    tier: 'minor',
    tierName: '小幅提价',
    icon: '💵',
    cost: 700,
    description: '通过品牌塑造小幅提升售价',
    salePriceBonus: 0.03,
    profitMarginBonus: 0.02,
    memberSpendBonus: 0.05,
    minShopStyleTier: 'simple',
    unlockLevel: 2
  },
  {
    tier: 'moderate',
    tierName: '品牌溢价',
    icon: '💴',
    cost: 2200,
    description: '建立品牌形象，获得明显溢价',
    salePriceBonus: 0.07,
    profitMarginBonus: 0.05,
    memberSpendBonus: 0.12,
    minShopStyleTier: 'refined',
    unlockLevel: 4
  },
  {
    tier: 'major',
    tierName: '品质标杆',
    icon: '🏆',
    cost: 5500,
    description: '成为品质标杆，大幅提升收益',
    salePriceBonus: 0.12,
    profitMarginBonus: 0.09,
    memberSpendBonus: 0.22,
    minShopStyleTier: 'elegant',
    unlockLevel: 6
  },
  {
    tier: 'exclusive',
    tierName: '独家尊享',
    icon: '👑',
    cost: 14000,
    description: '独家尊享的定位，极致收益加成',
    salePriceBonus: 0.2,
    profitMarginBonus: 0.15,
    memberSpendBonus: 0.35,
    minShopStyleTier: 'luxurious',
    unlockLevel: 8
  }
]

export const getShopStyleConfig = (tier: ShopStyleTier): ShopStyleConfig => {
  return shopStyleConfigs.find(s => s.tier === tier) || shopStyleConfigs[0]
}

export const getShopAreaConfig = (tier: ShopAreaTier): ShopAreaConfig => {
  return shopAreaConfigs.find(s => s.tier === tier) || shopAreaConfigs[0]
}

export const getDisplaySlotUpgradeConfig = (type: DisplaySlotType): DisplaySlotUpgradeConfig => {
  return displaySlotUpgradeConfigs.find(s => s.type === type) || displaySlotUpgradeConfigs[0]
}

export const getCustomerAttractionConfig = (tier: CustomerAttractionTier): CustomerAttractionConfig => {
  return customerAttractionConfigs.find(s => s.tier === tier) || customerAttractionConfigs[0]
}

export const getRevenueBonusConfig = (tier: RevenueBonusTier): RevenueBonusConfig => {
  return revenueBonusConfigs.find(s => s.tier === tier) || revenueBonusConfigs[0]
}

export const getNextStyleTier = (current: ShopStyleTier): ShopStyleConfig | null => {
  const currentIndex = shopStyleConfigs.findIndex(s => s.tier === current)
  if (currentIndex < 0 || currentIndex >= shopStyleConfigs.length - 1) return null
  return shopStyleConfigs[currentIndex + 1]
}

export const getNextAreaTier = (current: ShopAreaTier): ShopAreaConfig | null => {
  const currentIndex = shopAreaConfigs.findIndex(s => s.tier === current)
  if (currentIndex < 0 || currentIndex >= shopAreaConfigs.length - 1) return null
  return shopAreaConfigs[currentIndex + 1]
}

export const getNextCustomerAttractionTier = (current: CustomerAttractionTier): CustomerAttractionConfig | null => {
  const currentIndex = customerAttractionConfigs.findIndex(s => s.tier === current)
  if (currentIndex < 0 || currentIndex >= customerAttractionConfigs.length - 1) return null
  return customerAttractionConfigs[currentIndex + 1]
}

export const getNextRevenueBonusTier = (current: RevenueBonusTier): RevenueBonusConfig | null => {
  const currentIndex = revenueBonusConfigs.findIndex(s => s.tier === current)
  if (currentIndex < 0 || currentIndex >= revenueBonusConfigs.length - 1) return null
  return revenueBonusConfigs[currentIndex + 1]
}

export const getNextDisplaySlotType = (current: DisplaySlotType): DisplaySlotUpgradeConfig | null => {
  const currentIndex = displaySlotUpgradeConfigs.findIndex(s => s.type === current)
  if (currentIndex < 0 || currentIndex >= displaySlotUpgradeConfigs.length - 1) return null
  return displaySlotUpgradeConfigs[currentIndex + 1]
}

export const createInitialShopRenovationState = (): ShopRenovationState => {
  const baseAreaConfig = shopAreaConfigs[0]
  const initialDisplaySlots: ShopDisplaySlotState[] = []
  for (let i = 0; i < baseAreaConfig.baseDisplaySlots; i++) {
    initialDisplaySlots.push({
      id: i,
      type: 'standard',
      unlocked: true,
      upgradeDate: null
    })
  }

  return {
    currentStyle: 'shabby',
    currentArea: 'tiny',
    displaySlots: initialDisplaySlots,
    customerAttraction: 'casual',
    revenueBonus: 'none',
    totalRenovationSpent: 0,
    renovationCount: 0,
    lastRenovationDay: 0,
    upgradeHistory: []
  }
}

export const calculateRenovationBonusSummary = (
  state: ShopRenovationState
): ShopRenovationBonusSummary => {
  const styleConfig = getShopStyleConfig(state.currentStyle)
  const areaConfig = getShopAreaConfig(state.currentArea)
  const attractionConfig = getCustomerAttractionConfig(state.customerAttraction)
  const revenueConfig = getRevenueBonusConfig(state.revenueBonus)

  let totalMatchScoreBonus = 0
  let totalBuyChanceBonus = 0
  let totalConditionPreservationBonus = 0

  for (const slot of state.displaySlots) {
    if (slot.unlocked) {
      const slotConfig = getDisplaySlotUpgradeConfig(slot.type)
      totalMatchScoreBonus += slotConfig.matchScoreBonus
      totalBuyChanceBonus += slotConfig.buyChanceBonus
      totalConditionPreservationBonus += slotConfig.conditionPreservationBonus
    }
  }

  const unlockedSlots = state.displaySlots.filter(s => s.unlocked).length
  const avgMatchScoreBonus = unlockedSlots > 0 ? totalMatchScoreBonus / unlockedSlots : 0
  const avgBuyChanceBonus = unlockedSlots > 0 ? totalBuyChanceBonus / unlockedSlots : 0
  const avgConditionPreservationBonus = unlockedSlots > 0 ? totalConditionPreservationBonus / unlockedSlots : 0

  const attractGenresSet = new Set<Genre>(styleConfig.attractGenres)
  const attractGenres: Genre[] = Array.from(attractGenresSet)

  return {
    customerCountModifier: styleConfig.customerCountModifier + areaConfig.customerCountModifier,
    budgetModifier: styleConfig.budgetModifier,
    satisfactionBonus: styleConfig.satisfactionBonus,
    buyChanceBonus: styleConfig.buyChanceBonus + avgBuyChanceBonus,
    reputationDailyBonus: styleConfig.reputationDailyBonus,
    matchScoreBonus: avgMatchScoreBonus,
    conditionPreservationBonus: avgConditionPreservationBonus,
    specialCustomerWeightBoost: attractionConfig.specialCustomerWeightBoost,
    memberChanceBonus: attractionConfig.memberChanceBonus,
    highBudgetCustomerChance: attractionConfig.highBudgetCustomerChance,
    rareCollectorChance: attractionConfig.rareCollectorChance,
    salePriceBonus: revenueConfig.salePriceBonus,
    profitMarginBonus: revenueConfig.profitMarginBonus,
    memberSpendBonus: revenueConfig.memberSpendBonus,
    attractGenres,
    maxCustomersBonus: areaConfig.maxCustomersBonus,
    totalDisplaySlots: unlockedSlots,
    unlockedGenresBonus: styleConfig.unlockGenresBonus
  }
}

export const canUpgradeStyle = (
  state: ShopRenovationState,
  budget: number,
  reputation: number,
  currentLevel: number
): { canUpgrade: boolean; reason: string; nextConfig: ShopStyleConfig | null } => {
  const nextConfig = getNextStyleTier(state.currentStyle)
  if (!nextConfig) {
    return { canUpgrade: false, reason: '已达到最高风格等级', nextConfig: null }
  }
  if (budget < nextConfig.cost) {
    return { canUpgrade: false, reason: `资金不足，需要 ¥${nextConfig.cost}`, nextConfig }
  }
  if (reputation < nextConfig.minReputation) {
    return { canUpgrade: false, reason: `声望不足，需要 ${nextConfig.minReputation}`, nextConfig }
  }
  if (currentLevel < nextConfig.unlockLevel) {
    return { canUpgrade: false, reason: `需要通关至第 ${nextConfig.unlockLevel} 关`, nextConfig }
  }
  return { canUpgrade: true, reason: '', nextConfig }
}

export const canUpgradeArea = (
  state: ShopRenovationState,
  budget: number,
  currentLevel: number
): { canUpgrade: boolean; reason: string; nextConfig: ShopAreaConfig | null } => {
  const nextConfig = getNextAreaTier(state.currentArea)
  if (!nextConfig) {
    return { canUpgrade: false, reason: '已达到最高区域等级', nextConfig: null }
  }
  if (budget < nextConfig.cost) {
    return { canUpgrade: false, reason: `资金不足，需要 ¥${nextConfig.cost}`, nextConfig }
  }
  if (currentLevel < nextConfig.unlockLevel) {
    return { canUpgrade: false, reason: `需要通关至第 ${nextConfig.unlockLevel} 关`, nextConfig }
  }
  return { canUpgrade: true, reason: '', nextConfig }
}

export const canUpgradeCustomerAttraction = (
  state: ShopRenovationState,
  budget: number,
  reputation: number,
  currentLevel: number
): { canUpgrade: boolean; reason: string; nextConfig: CustomerAttractionConfig | null } => {
  const nextConfig = getNextCustomerAttractionTier(state.customerAttraction)
  if (!nextConfig) {
    return { canUpgrade: false, reason: '已达到最高客群吸引等级', nextConfig: null }
  }
  if (budget < nextConfig.cost) {
    return { canUpgrade: false, reason: `资金不足，需要 ¥${nextConfig.cost}`, nextConfig }
  }
  if (reputation < nextConfig.minReputation) {
    return { canUpgrade: false, reason: `声望不足，需要 ${nextConfig.minReputation}`, nextConfig }
  }
  if (currentLevel < nextConfig.unlockLevel) {
    return { canUpgrade: false, reason: `需要通关至第 ${nextConfig.unlockLevel} 关`, nextConfig }
  }
  return { canUpgrade: true, reason: '', nextConfig }
}

export const canUpgradeRevenueBonus = (
  state: ShopRenovationState,
  budget: number,
  currentLevel: number
): { canUpgrade: boolean; reason: string; nextConfig: RevenueBonusConfig | null } => {
  const nextConfig = getNextRevenueBonusTier(state.revenueBonus)
  if (!nextConfig) {
    return { canUpgrade: false, reason: '已达到最高收益加成等级', nextConfig: null }
  }
  const currentStyleIndex = shopStyleConfigs.findIndex(s => s.tier === state.currentStyle)
  const requiredStyleIndex = shopStyleConfigs.findIndex(s => s.tier === nextConfig.minShopStyleTier)
  if (currentStyleIndex < requiredStyleIndex) {
    const requiredStyle = shopStyleConfigs[requiredStyleIndex]
    return { canUpgrade: false, reason: `需要店铺风格达到「${requiredStyle.tierName}」`, nextConfig }
  }
  if (budget < nextConfig.cost) {
    return { canUpgrade: false, reason: `资金不足，需要 ¥${nextConfig.cost}`, nextConfig }
  }
  if (currentLevel < nextConfig.unlockLevel) {
    return { canUpgrade: false, reason: `需要通关至第 ${nextConfig.unlockLevel} 关`, nextConfig }
  }
  return { canUpgrade: true, reason: '', nextConfig }
}

export const canUpgradeDisplaySlot = (
  slotId: number,
  state: ShopRenovationState,
  budget: number,
  currentLevel: number
): { canUpgrade: boolean; reason: string; nextConfig: DisplaySlotUpgradeConfig | null } => {
  const slot = state.displaySlots.find(s => s.id === slotId)
  if (!slot || !slot.unlocked) {
    return { canUpgrade: false, reason: '该展示位不存在或未解锁', nextConfig: null }
  }
  const nextConfig = getNextDisplaySlotType(slot.type)
  if (!nextConfig) {
    return { canUpgrade: false, reason: '该展示位已达到最高等级', nextConfig: null }
  }
  if (budget < nextConfig.cost) {
    return { canUpgrade: false, reason: `资金不足，需要 ¥${nextConfig.cost}`, nextConfig }
  }
  if (currentLevel < nextConfig.unlockLevel) {
    return { canUpgrade: false, reason: `需要通关至第 ${nextConfig.unlockLevel} 关`, nextConfig }
  }
  return { canUpgrade: true, reason: '', nextConfig }
}

export const upgradeStyle = (
  state: ShopRenovationState,
  currentDay: number
): { success: boolean; message: string; newState: ShopRenovationState } => {
  const nextConfig = getNextStyleTier(state.currentStyle)
  if (!nextConfig) {
    return { success: false, message: '已达到最高风格等级', newState: state }
  }

  const newHistory = [...state.upgradeHistory, {
    type: 'style' as const,
    fromTier: state.currentStyle,
    toTier: nextConfig.tier,
    cost: nextConfig.cost,
    day: currentDay
  }]

  const newState: ShopRenovationState = {
    ...state,
    currentStyle: nextConfig.tier,
    totalRenovationSpent: state.totalRenovationSpent + nextConfig.cost,
    renovationCount: state.renovationCount + 1,
    lastRenovationDay: currentDay,
    upgradeHistory: newHistory
  }

  return {
    success: true,
    message: `店铺风格已升级为「${nextConfig.tierName}」！`,
    newState
  }
}

export const upgradeArea = (
  state: ShopRenovationState,
  currentDay: number
): { success: boolean; message: string; newState: ShopRenovationState } => {
  const nextConfig = getNextAreaTier(state.currentArea)
  if (!nextConfig) {
    return { success: false, message: '已达到最高区域等级', newState: state }
  }

  const currentConfig = getShopAreaConfig(state.currentArea)
  const newSlots: ShopDisplaySlotState[] = []
  for (let i = currentConfig.baseDisplaySlots; i < nextConfig.baseDisplaySlots; i++) {
    newSlots.push({
      id: i,
      type: 'standard',
      unlocked: true,
      upgradeDate: currentDay
    })
  }

  const newHistory = [...state.upgradeHistory, {
    type: 'area' as const,
    fromTier: state.currentArea,
    toTier: nextConfig.tier,
    cost: nextConfig.cost,
    day: currentDay
  }]

  const newState: ShopRenovationState = {
    ...state,
    currentArea: nextConfig.tier,
    displaySlots: [...state.displaySlots, ...newSlots],
    totalRenovationSpent: state.totalRenovationSpent + nextConfig.cost,
    renovationCount: state.renovationCount + 1,
    lastRenovationDay: currentDay,
    upgradeHistory: newHistory
  }

  return {
    success: true,
    message: `店铺区域已扩容至「${nextConfig.tierName}」！新增 ${newSlots.length} 个展示位`,
    newState
  }
}

export const upgradeCustomerAttraction = (
  state: ShopRenovationState,
  currentDay: number
): { success: boolean; message: string; newState: ShopRenovationState } => {
  const nextConfig = getNextCustomerAttractionTier(state.customerAttraction)
  if (!nextConfig) {
    return { success: false, message: '已达到最高客群吸引等级', newState: state }
  }

  const newHistory = [...state.upgradeHistory, {
    type: 'attraction' as const,
    fromTier: state.customerAttraction,
    toTier: nextConfig.tier,
    cost: nextConfig.cost,
    day: currentDay
  }]

  const newState: ShopRenovationState = {
    ...state,
    customerAttraction: nextConfig.tier,
    totalRenovationSpent: state.totalRenovationSpent + nextConfig.cost,
    renovationCount: state.renovationCount + 1,
    lastRenovationDay: currentDay,
    upgradeHistory: newHistory
  }

  return {
    success: true,
    message: `客群吸引已升级为「${nextConfig.tierName}」！`,
    newState
  }
}

export const upgradeRevenueBonus = (
  state: ShopRenovationState,
  currentDay: number
): { success: boolean; message: string; newState: ShopRenovationState } => {
  const nextConfig = getNextRevenueBonusTier(state.revenueBonus)
  if (!nextConfig) {
    return { success: false, message: '已达到最高收益加成等级', newState: state }
  }

  const newHistory = [...state.upgradeHistory, {
    type: 'revenue' as const,
    fromTier: state.revenueBonus,
    toTier: nextConfig.tier,
    cost: nextConfig.cost,
    day: currentDay
  }]

  const newState: ShopRenovationState = {
    ...state,
    revenueBonus: nextConfig.tier,
    totalRenovationSpent: state.totalRenovationSpent + nextConfig.cost,
    renovationCount: state.renovationCount + 1,
    lastRenovationDay: currentDay,
    upgradeHistory: newHistory
  }

  return {
    success: true,
    message: `收益加成已升级为「${nextConfig.tierName}」！`,
    newState
  }
}

export const upgradeDisplaySlot = (
  slotId: number,
  state: ShopRenovationState,
  currentDay: number
): { success: boolean; message: string; newState: ShopRenovationState } => {
  const slot = state.displaySlots.find(s => s.id === slotId)
  if (!slot || !slot.unlocked) {
    return { success: false, message: '该展示位不存在或未解锁', newState: state }
  }

  const nextConfig = getNextDisplaySlotType(slot.type)
  if (!nextConfig) {
    return { success: false, message: '该展示位已达到最高等级', newState: state }
  }

  const newDisplaySlots = state.displaySlots.map(s => {
    if (s.id === slotId) {
      return {
        ...s,
        type: nextConfig.type,
        upgradeDate: currentDay
      }
    }
    return s
  })

  const newHistory = [...state.upgradeHistory, {
    type: 'display' as const,
    fromTier: slot.type,
    toTier: nextConfig.type,
    cost: nextConfig.cost,
    day: currentDay
  }]

  const newState: ShopRenovationState = {
    ...state,
    displaySlots: newDisplaySlots,
    totalRenovationSpent: state.totalRenovationSpent + nextConfig.cost,
    renovationCount: state.renovationCount + 1,
    lastRenovationDay: currentDay,
    upgradeHistory: newHistory
  }

  return {
    success: true,
    message: `展示位已升级为「${nextConfig.typeName}」！`,
    newState
  }
}

export const getStyleTierLabel = (tier: ShopStyleTier): string => {
  return getShopStyleConfig(tier).tierName
}

export const getAreaTierLabel = (tier: ShopAreaTier): string => {
  return getShopAreaConfig(tier).tierName
}

export const getDisplaySlotTypeLabel = (type: DisplaySlotType): string => {
  return getDisplaySlotUpgradeConfig(type).typeName
}

export const getCustomerAttractionTierLabel = (tier: CustomerAttractionTier): string => {
  return getCustomerAttractionConfig(tier).tierName
}

export const getRevenueBonusTierLabel = (tier: RevenueBonusTier): string => {
  return getRevenueBonusConfig(tier).tierName
}
