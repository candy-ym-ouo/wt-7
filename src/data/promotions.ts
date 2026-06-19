import type { PromotionConfig, Record, ActivePromotion, PromotionApplicationResult } from '@/types'

export const promotionConfigs: PromotionConfig[] = [
  {
    id: 'grand-opening-discount',
    type: 'discount',
    name: '开业特惠',
    icon: '🎉',
    description: '开业前3天全场9折，吸引第一批顾客！',
    scope: 'all',
    startDay: 1,
    endDay: 3,
    minLevel: 1,
    discountConfig: { discountRate: 0.1 },
    customerReactionBonus: 8,
    reputationBonus: 1,
    buyChanceBoost: 0.1
  },
  {
    id: 'weekend-jazz-sale',
    type: 'discount',
    name: '周末爵士夜',
    icon: '🎷',
    description: '周末爵士乐唱片享85折优惠',
    scope: 'genre',
    targetGenres: ['Jazz', 'Blues'],
    startDay: 5,
    endDay: 7,
    minLevel: 1,
    discountConfig: { discountRate: 0.15 },
    customerReactionBonus: 6,
    reputationBonus: 1,
    buyChanceBoost: 0.08
  },
  {
    id: 'rock-mania',
    type: 'discount',
    name: '摇滚狂热',
    icon: '🎸',
    description: '摇滚乐全场8折，点燃摇滚之魂！',
    scope: 'genre',
    targetGenres: ['Rock', 'Funk'],
    startDay: 8,
    endDay: 10,
    minLevel: 2,
    discountConfig: { discountRate: 0.2 },
    customerReactionBonus: 10,
    reputationBonus: 2,
    buyChanceBoost: 0.12
  },
  {
    id: 'rare-collection',
    type: 'discount',
    name: '珍品特卖',
    icon: '💎',
    description: '稀有度4-5星唱片享88折',
    scope: 'rarity',
    targetRarities: [4, 5],
    startDay: 4,
    endDay: 6,
    minLevel: 2,
    discountConfig: { discountRate: 0.12 },
    customerReactionBonus: 7,
    reputationBonus: 2,
    buyChanceBoost: 0.06
  },
  {
    id: 'buy2-get1',
    type: 'buy_gift',
    name: '买二赠一',
    icon: '🎁',
    description: '任意购买2张唱片，赠送1张同类型唱片',
    scope: 'all',
    startDay: 3,
    endDay: 5,
    minLevel: 2,
    buyGiftConfig: { buyQuantity: 2, giftQuantity: 1 },
    customerReactionBonus: 12,
    reputationBonus: 2,
    buyChanceBoost: 0.15
  },
  {
    id: 'classical-bundle',
    type: 'buy_gift',
    name: '古典套装',
    icon: '🎻',
    description: '购买古典唱片2张，赠送1张古典入门碟',
    scope: 'genre',
    targetGenres: ['Classical'],
    startDay: 6,
    endDay: 9,
    minLevel: 3,
    buyGiftConfig: { buyQuantity: 2, giftQuantity: 1, giftGenre: 'Classical' },
    customerReactionBonus: 9,
    reputationBonus: 2,
    buyChanceBoost: 0.1
  },
  {
    id: 'soul-discount',
    type: 'discount',
    name: '灵魂之声',
    icon: '🎤',
    description: 'Soul与Disco唱片享受85折',
    scope: 'genre',
    targetGenres: ['Soul', 'Disco'],
    startDay: 2,
    endDay: 4,
    minLevel: 2,
    discountConfig: { discountRate: 0.15 },
    customerReactionBonus: 6,
    reputationBonus: 1,
    buyChanceBoost: 0.07
  },
  {
    id: 'electronic-festival',
    type: 'discount',
    name: '电音节',
    icon: '🎛️',
    description: '电子音乐全场78折，一起律动！',
    scope: 'genre',
    targetGenres: ['Electronic'],
    startDay: 9,
    endDay: 12,
    minLevel: 3,
    discountConfig: { discountRate: 0.22 },
    customerReactionBonus: 11,
    reputationBonus: 2,
    buyChanceBoost: 0.13
  },
  {
    id: 'pop-bonanza',
    type: 'discount',
    name: '流行狂欢',
    icon: '🎵',
    description: '流行唱片全场88折优惠',
    scope: 'genre',
    targetGenres: ['Pop', 'Folk'],
    startDay: 7,
    endDay: 9,
    minLevel: 2,
    discountConfig: { discountRate: 0.12 },
    customerReactionBonus: 7,
    reputationBonus: 1,
    buyChanceBoost: 0.08
  },
  {
    id: 'buy3-get1-rare',
    type: 'buy_gift',
    name: '珍品买三赠一',
    icon: '🏆',
    description: '购买3张3星以上唱片，赠送1张同稀有度唱片',
    scope: 'rarity',
    targetRarities: [3, 4, 5],
    startDay: 10,
    endDay: 13,
    minLevel: 3,
    buyGiftConfig: { buyQuantity: 3, giftQuantity: 1, giftRarity: 3 },
    customerReactionBonus: 14,
    reputationBonus: 3,
    buyChanceBoost: 0.16
  }
]

export const getAvailablePromotionsForLevel = (level: number): PromotionConfig[] => {
  return promotionConfigs.filter(p => p.minLevel <= level)
}

export const getPromotionsForDay = (level: number, day: number): PromotionConfig[] => {
  return promotionConfigs.filter(p =>
    p.minLevel <= level && day >= p.startDay && day <= p.endDay
  )
}

export const getPromotionById = (id: string): PromotionConfig | undefined => {
  return promotionConfigs.find(p => p.id === id)
}

export const isRecordEligibleForPromotion = (
  record: Record,
  promotion: PromotionConfig
): boolean => {
  switch (promotion.scope) {
    case 'all':
      return true
    case 'genre':
      return promotion.targetGenres?.includes(record.genre) ?? false
    case 'rarity':
      return promotion.targetRarities?.includes(record.rarity) ?? false
    case 'specific':
      return promotion.targetRecordIds?.includes(record.id) ?? false
    default:
      return false
  }
}

export const findBestPromotionForRecord = (
  record: Record,
  activePromotions: ActivePromotion[]
): ActivePromotion | null => {
  const eligible = activePromotions.filter(ap => isRecordEligibleForPromotion(record, ap.config))
  if (eligible.length === 0) return null

  eligible.sort((a, b) => {
    const aDiscount = a.config.discountConfig?.discountRate ?? 0
    const bDiscount = b.config.discountConfig?.discountRate ?? 0
    return bDiscount - aDiscount
  })
  return eligible[0]
}

export const applyPromotionToPrice = (
  basePrice: number,
  record: Record,
  activePromotions: ActivePromotion[]
): PromotionApplicationResult => {
  const bestPromotion = findBestPromotionForRecord(record, activePromotions)

  if (!bestPromotion || bestPromotion.config.type !== 'discount') {
    return {
      finalPrice: basePrice,
      originalPrice: basePrice,
      discountApplied: 0,
      isGiftItem: false,
      giftsEligible: 0,
      appliedPromotionId: null
    }
  }

  const discountRate = bestPromotion.config.discountConfig!.discountRate
  const discountAmount = Math.floor(basePrice * discountRate)
  const finalPrice = basePrice - discountAmount

  return {
    finalPrice,
    originalPrice: basePrice,
    discountApplied: discountAmount,
    isGiftItem: false,
    giftsEligible: 0,
    appliedPromotionId: bestPromotion.config.id
  }
}

export const calculateBuyGiftEligibility = (
  itemsPurchased: { record: Record; quantity: number }[],
  activePromotions: ActivePromotion[]
): Map<string, { promotion: ActivePromotion; eligibleGifts: number; buyGiftConfig: NonNullable<PromotionConfig['buyGiftConfig']> }> => {
  const result = new Map()

  for (const ap of activePromotions) {
    if (ap.config.type !== 'buy_gift' || !ap.config.buyGiftConfig) continue

    const eligibleItems = itemsPurchased.filter(item =>
      isRecordEligibleForPromotion(item.record, ap.config)
    )
    const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
    const { buyQuantity, giftQuantity } = ap.config.buyGiftConfig
    const eligibleGifts = Math.floor(totalQty / buyQuantity) * giftQuantity

    if (eligibleGifts > 0) {
      result.set(ap.config.id, {
        promotion: ap,
        eligibleGifts,
        buyGiftConfig: ap.config.buyGiftConfig
      })
    }
  }

  return result
}

export const getPromotionReputationImpact = (
  activePromotions: ActivePromotion[],
  salesWithPromotion: number
): number => {
  if (salesWithPromotion <= 0) return 0
  let totalBonus = 0
  for (const ap of activePromotions) {
    totalBonus += ap.config.reputationBonus
  }
  return Math.min(3, totalBonus)
}

export const getPromotionSatisfactionBonus = (
  activePromotions: ActivePromotion[],
  record: Record
): number => {
  let bonus = 0
  for (const ap of activePromotions) {
    if (isRecordEligibleForPromotion(record, ap.config)) {
      bonus += ap.config.customerReactionBonus
    }
  }
  return Math.min(20, bonus)
}

export const getPromotionBuyChanceBoost = (
  activePromotions: ActivePromotion[],
  record: Record
): number => {
  let boost = 0
  for (const ap of activePromotions) {
    if (isRecordEligibleForPromotion(record, ap.config)) {
      boost += ap.config.buyChanceBoost
    }
  }
  return Math.min(0.3, boost)
}
