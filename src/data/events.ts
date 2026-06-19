import type { BusinessEventConfig, BusinessEventEffect, ActiveBusinessEvent } from '@/types'

const noEffect: BusinessEventEffect = {
  budgetChange: 0,
  customerCountModifier: 0,
  reputationChange: 0,
  satisfactionModifier: 0,
  buyChanceModifier: 0,
  budgetModifier: 0,
  conditionPenalty: 0
}

export const businessEvents: BusinessEventConfig[] = [
  {
    id: 'equipment_breakdown',
    name: '设备故障',
    icon: '🔧',
    description: '店内唱机突然故障，维修费用从预算中扣除，顾客体验也受影响。',
    category: 'equipment',
    rarity: 'common',
    isPositive: false,
    baseChance: 0.18,
    minLevel: 1,
    effects: {
      ...noEffect,
      budgetChange: -200,
      satisfactionModifier: -8,
      buyChanceModifier: -0.05
    }
  },
  {
    id: 'leaky_roof',
    name: '屋顶漏水',
    icon: '💧',
    description: '一场突如其来的暴雨让屋顶渗水，部分唱片品相受损！',
    category: 'weather',
    rarity: 'uncommon',
    isPositive: false,
    baseChance: 0.10,
    minLevel: 2,
    effects: {
      ...noEffect,
      budgetChange: -350,
      conditionPenalty: 8,
      customerCountModifier: -0.15
    }
  },
  {
    id: 'competitor_sale',
    name: '竞争对手促销',
    icon: '🏷️',
    description: '隔壁唱片店大促销，部分顾客被分流了...',
    category: 'market',
    rarity: 'common',
    isPositive: false,
    baseChance: 0.15,
    minLevel: 2,
    effects: {
      ...noEffect,
      customerCountModifier: -0.25,
      budgetModifier: -0.1
    }
  },
  {
    id: 'supply_delay',
    name: '供货延迟',
    icon: '🚚',
    description: '供应商物流延误，进货运费上涨，商品成本增加。',
    category: 'supply',
    rarity: 'common',
    isPositive: false,
    baseChance: 0.12,
    minLevel: 1,
    effects: {
      ...noEffect,
      budgetChange: -150,
      buyChanceModifier: -0.03
    }
  },
  {
    id: 'bad_review',
    name: '差评风波',
    icon: '💢',
    description: '一位不满的顾客在网上发布了差评，店铺声望略有下降。',
    category: 'market',
    rarity: 'uncommon',
    isPositive: false,
    baseChance: 0.08,
    minLevel: 2,
    effects: {
      ...noEffect,
      reputationChange: -5,
      customerCountModifier: -0.1
    }
  },
  {
    id: 'power_outage',
    name: '突发停电',
    icon: '⚡',
    description: '街区突然停电，试听设备无法使用，顾客购买意愿大降！',
    category: 'equipment',
    rarity: 'rare',
    isPositive: false,
    baseChance: 0.05,
    minLevel: 3,
    effects: {
      ...noEffect,
      budgetChange: -100,
      buyChanceModifier: -0.12,
      satisfactionModifier: -12,
      customerCountModifier: -0.2
    }
  },
  {
    id: 'hot_album_arrival',
    name: '热门专辑到货',
    icon: '🔥',
    description: '一批热门专辑到货！消息传开后，乐迷们蜂拥而至。',
    category: 'market',
    rarity: 'uncommon',
    isPositive: true,
    baseChance: 0.14,
    minLevel: 1,
    effects: {
      ...noEffect,
      customerCountModifier: 0.3,
      buyChanceModifier: 0.08,
      reputationChange: 3
    }
  },
  {
    id: 'music_festival',
    name: '音乐节举办',
    icon: '🎵',
    description: '本地音乐节开幕！乐迷们涌入店铺寻找珍稀唱片。',
    category: 'festival',
    rarity: 'uncommon',
    isPositive: true,
    baseChance: 0.10,
    minLevel: 2,
    effects: {
      ...noEffect,
      customerCountModifier: 0.4,
      budgetModifier: 0.15,
      buyChanceModifier: 0.06
    }
  },
  {
    id: 'celebrity_visit',
    name: '名人推荐',
    icon: '⭐',
    description: '一位知名音乐人在社交媒体上推荐了你的店铺！',
    category: 'celebrity',
    rarity: 'rare',
    isPositive: true,
    baseChance: 0.06,
    minLevel: 3,
    effects: {
      ...noEffect,
      reputationChange: 8,
      customerCountModifier: 0.35,
      budgetModifier: 0.2,
      buyChanceModifier: 0.1
    }
  },
  {
    id: 'collector_visit',
    name: '收藏家到访',
    icon: '💎',
    description: '一位唱片收藏家专程到访，对高稀有度唱片格外青睐！',
    category: 'celebrity',
    rarity: 'rare',
    isPositive: true,
    baseChance: 0.05,
    minLevel: 3,
    effects: {
      ...noEffect,
      budgetModifier: 0.3,
      buyChanceModifier: 0.12,
      reputationChange: 4
    }
  },
  {
    id: 'viral_post',
    name: '网红打卡',
    icon: '📱',
    description: '你的店铺在社交平台上火了，大量新顾客慕名而来！',
    category: 'market',
    rarity: 'uncommon',
    isPositive: true,
    baseChance: 0.09,
    minLevel: 2,
    effects: {
      ...noEffect,
      customerCountModifier: 0.5,
      reputationChange: 5
    }
  },
  {
    id: 'community_event',
    name: '社区音乐活动',
    icon: '🎤',
    description: '社区举办黑胶文化交流活动，街坊邻里纷纷来店逛逛。',
    category: 'festival',
    rarity: 'common',
    isPositive: true,
    baseChance: 0.12,
    minLevel: 1,
    effects: {
      ...noEffect,
      customerCountModifier: 0.2,
      satisfactionModifier: 5,
      reputationChange: 2
    }
  }
]

export const getEventById = (id: string): BusinessEventConfig | undefined => {
  return businessEvents.find(e => e.id === id)
}

export const getEventsForLevel = (level: number): BusinessEventConfig[] => {
  return businessEvents.filter(e => e.minLevel <= level)
}

export const rollDailyEvent = (
  level: number,
  day: number,
  reputation: number
): ActiveBusinessEvent | null => {
  const available = getEventsForLevel(level)
  if (available.length === 0) return null

  const reputationBonus = reputation > 60 ? 0.05 : 0
  const dayBonus = day > 2 ? 0.03 : 0
  const positiveChanceBonus = reputation > 50 ? 0.15 : 0

  const positiveEvents = available.filter(e => e.isPositive)
  const negativeEvents = available.filter(e => !e.isPositive)

  const targetPool = Math.random() < (0.5 + positiveChanceBonus) ? positiveEvents : negativeEvents
  const pool = targetPool.length > 0 ? targetPool : available

  const candidates: { event: BusinessEventConfig; weight: number }[] = pool.map(event => {
    let chance = event.baseChance + reputationBonus + dayBonus
    if (event.rarity === 'rare') chance *= 0.5
    else if (event.rarity === 'uncommon') chance *= 0.8
    return { event, weight: chance }
  })

  for (const candidate of candidates) {
    if (Math.random() < candidate.weight) {
      const scaledEffects = scaleEventEffects(candidate.event.effects, level)
      return {
        config: candidate.event,
        day,
        appliedEffects: scaledEffects
      }
    }
  }

  return null
}

const scaleEventEffects = (base: BusinessEventEffect, level: number): BusinessEventEffect => {
  const scale = 1 + (level - 1) * 0.15
  return {
    budgetChange: Math.round(base.budgetChange * scale),
    customerCountModifier: base.customerCountModifier,
    reputationChange: Math.round(base.reputationChange * (1 + (level - 1) * 0.1)),
    satisfactionModifier: Math.round(base.satisfactionModifier),
    buyChanceModifier: base.buyChanceModifier,
    budgetModifier: Math.round(base.budgetModifier * 100) / 100,
    conditionPenalty: base.conditionPenalty
  }
}

export const getEventEffectSummary = (event: ActiveBusinessEvent): string[] => {
  const effects: string[] = []
  const e = event.appliedEffects

  if (e.budgetChange > 0) effects.push(`资金 +¥${e.budgetChange}`)
  else if (e.budgetChange < 0) effects.push(`资金 -¥${Math.abs(e.budgetChange)}`)

  if (e.customerCountModifier > 0) effects.push(`客流 +${Math.round(e.customerCountModifier * 100)}%`)
  else if (e.customerCountModifier < 0) effects.push(`客流 ${Math.round(e.customerCountModifier * 100)}%`)

  if (e.reputationChange > 0) effects.push(`声望 +${e.reputationChange}`)
  else if (e.reputationChange < 0) effects.push(`声望 ${e.reputationChange}`)

  if (e.satisfactionModifier > 0) effects.push(`满意度 +${e.satisfactionModifier}`)
  else if (e.satisfactionModifier < 0) effects.push(`满意度 ${e.satisfactionModifier}`)

  if (e.buyChanceModifier > 0) effects.push(`成交率 +${Math.round(e.buyChanceModifier * 100)}%`)
  else if (e.buyChanceModifier < 0) effects.push(`成交率 ${Math.round(e.buyChanceModifier * 100)}%`)

  if (e.budgetModifier > 0) effects.push(`顾客预算 +${Math.round(e.budgetModifier * 100)}%`)
  else if (e.budgetModifier < 0) effects.push(`顾客预算 ${Math.round(e.budgetModifier * 100)}%`)

  if (e.conditionPenalty > 0) effects.push(`品相 -${e.conditionPenalty}`)

  return effects
}

export const getRarityLabel = (rarity: BusinessEventConfig['rarity']): string => {
  switch (rarity) {
    case 'common': return '常见'
    case 'uncommon': return '不常见'
    case 'rare': return '稀有'
  }
}

export const getRarityColor = (rarity: BusinessEventConfig['rarity']): string => {
  switch (rarity) {
    case 'common': return '#a0aec0'
    case 'uncommon': return '#48bb78'
    case 'rare': return '#ffd700'
  }
}

export const getCategoryLabel = (category: BusinessEventConfig['category']): string => {
  switch (category) {
    case 'equipment': return '设备'
    case 'weather': return '天气'
    case 'market': return '市场'
    case 'celebrity': return '名人'
    case 'supply': return '供货'
    case 'festival': return '活动'
  }
}
