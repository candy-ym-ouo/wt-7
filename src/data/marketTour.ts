import type {
  MarketCity,
  CityTier,
  MarketEventConfig,
  CustomerFlowState,
  CustomerFlowWave,
  MarketEventEffect,
  MarketInventoryItem,
  MarketCustomer,
  InventoryItem,
  Genre
} from '@/types'
import { allRecords } from './records'

export const cities: MarketCity[] = [
  {
    id: 'town_qinghe',
    name: '清河镇',
    tier: 'small',
    icon: '🏘️',
    description: '江南水乡小镇，居民对爵士乐和民谣情有独钟，生活节奏悠闲。',
    travelCost: 200,
    travelDays: 1,
    minLevel: 1,
    baseCustomerCount: 12,
    baseBudgetMultiplier: 0.9,
    preferredGenres: ['Jazz', 'Folk', 'Blues'],
    rentCost: 100,
    eventDensity: 0.3,
    reputationReward: 3,
    isUnlocked: true
  },
  {
    id: 'city_linhai',
    name: '临海市',
    tier: 'medium',
    icon: '🌆',
    description: '沿海开放城市，年轻人聚集，流行和电子乐非常受欢迎。',
    travelCost: 500,
    travelDays: 2,
    minLevel: 2,
    baseCustomerCount: 20,
    baseBudgetMultiplier: 1.1,
    preferredGenres: ['Pop', 'Electronic', 'Disco'],
    rentCost: 300,
    eventDensity: 0.5,
    reputationReward: 5,
    isUnlocked: true
  },
  {
    id: 'city_yunshan',
    name: '云山市',
    tier: 'medium',
    icon: '🏙️',
    description: '山城文化中心，古典乐和灵魂乐爱好者众多，艺术氛围浓厚。',
    travelCost: 600,
    travelDays: 2,
    minLevel: 2,
    baseCustomerCount: 18,
    baseBudgetMultiplier: 1.15,
    preferredGenres: ['Classical', 'Soul', 'Jazz'],
    rentCost: 350,
    eventDensity: 0.55,
    reputationReward: 6,
    isUnlocked: true
  },
  {
    id: 'metro_jincheng',
    name: '金城都会',
    tier: 'large',
    icon: '🌃',
    description: '繁华大都市，各种音乐风格百花齐放，高预算藏家云集。',
    travelCost: 1200,
    travelDays: 3,
    minLevel: 3,
    baseCustomerCount: 30,
    baseBudgetMultiplier: 1.4,
    preferredGenres: ['Rock', 'Jazz', 'Soul', 'Funk'],
    rentCost: 800,
    eventDensity: 0.7,
    reputationReward: 10,
    isUnlocked: false,
    unlockCost: 3000
  },
  {
    id: 'super_xinghai',
    name: '星海特区',
    tier: 'metropolis',
    icon: '🏙️✨',
    description: '国际化超级都市，稀有唱片的交易圣地，顶级收藏家的乐园。',
    travelCost: 2500,
    travelDays: 4,
    minLevel: 5,
    baseCustomerCount: 45,
    baseBudgetMultiplier: 1.8,
    preferredGenres: ['Jazz', 'Classical', 'Rock', 'Soul'],
    rentCost: 2000,
    eventDensity: 0.85,
    reputationReward: 18,
    isUnlocked: false,
    unlockCost: 10000
  }
]

export const getCitiesForLevel = (level: number): MarketCity[] => {
  return cities.filter(c => c.minLevel <= level)
}

export const getCityById = (id: string): MarketCity | null => {
  return cities.find(c => c.id === id) || null
}

export const getTierLabel = (tier: CityTier): string => {
  const labels: Record<CityTier, string> = {
    small: '小镇市集',
    medium: '城市市集',
    large: '大都会市集',
    metropolis: '国际市集'
  }
  return labels[tier]
}

export const getTierColor = (tier: CityTier): string => {
  const colors: Record<CityTier, string> = {
    small: '#48bb78',
    medium: '#4299e1',
    large: '#9f7aea',
    metropolis: '#ed8936'
  }
  return colors[tier]
}

const createNeutralEffect = (): MarketEventEffect => ({
  customerCountModifier: 0,
  budgetModifier: 0,
  buyChanceModifier: 0,
  priceModifier: 0,
  reputationChange: 0,
  budgetChange: 0,
  duration: 1
})

export const marketEvents: MarketEventConfig[] = [
  {
    id: 'event_sunny_day',
    name: '阳光明媚',
    icon: '☀️',
    description: '今天天气特别好，出来逛街的人比平时多了不少。',
    category: 'weather',
    rarity: 'common',
    minCityTier: 'small',
    triggerMessage: '天空放晴，阳光洒在市集上，吸引了更多游客！',
    choices: [
      {
        id: 'embrace',
        label: '顺势而为',
        description: '趁着好天气正常经营',
        icon: '😊',
        effects: { ...createNeutralEffect(), customerCountModifier: 0.2, duration: 1 }
      },
      {
        id: 'outdoor_display',
        label: '增设户外展摊',
        description: '花费¥150在摊位外增设展示区',
        icon: '🎪',
        cost: 150,
        effects: { ...createNeutralEffect(), customerCountModifier: 0.4, buyChanceModifier: 0.1, duration: 1 }
      }
    ]
  },
  {
    id: 'event_rain',
    name: '突降暴雨',
    icon: '🌧️',
    description: '天空突然下起了大雨，逛街的人们纷纷寻找避雨处。',
    category: 'weather',
    rarity: 'common',
    minCityTier: 'small',
    triggerMessage: '乌云密布，暴雨袭来！客流受到严重影响...',
    choices: [
      {
        id: 'weather_it',
        label: '坚守摊位',
        description: '等待雨过天晴',
        icon: '☂️',
        effects: { ...createNeutralEffect(), customerCountModifier: -0.4, duration: 1 }
      },
      {
        id: 'offer_shelter',
        label: '提供避雨服务',
        description: '免费提供热茶和避雨处',
        icon: '🍵',
        cost: 80,
        effects: { ...createNeutralEffect(), customerCountModifier: -0.1, reputationChange: 2, buyChanceModifier: 0.15, duration: 1 }
      }
    ]
  },
  {
    id: 'event_festival',
    name: '城市音乐节',
    icon: '🎵',
    description: '本市正在举办盛大的音乐节，大量音乐爱好者涌入！',
    category: 'crowd',
    rarity: 'uncommon',
    minCityTier: 'medium',
    triggerMessage: '城市音乐节开幕！人潮涌动，气氛热烈！',
    choices: [
      {
        id: 'join_crowd',
        label: '正常营业',
        description: '接待前来的音乐爱好者',
        icon: '🎉',
        effects: { ...createNeutralEffect(), customerCountModifier: 0.5, budgetModifier: 0.1, duration: 1 }
      },
      {
        id: 'sponsor_booth',
        label: '赞助主题展位',
        description: '花费¥500打造音乐节主题展位',
        icon: '🎸',
        cost: 500,
        effects: { ...createNeutralEffect(), customerCountModifier: 0.8, buyChanceModifier: 0.2, priceModifier: 0.1, reputationChange: 5, duration: 1 }
      }
    ]
  },
  {
    id: 'event_influencer',
    name: '网红到访',
    icon: '📸',
    description: '一位本地知名的生活方式博主来到了市集。',
    category: 'media',
    rarity: 'rare',
    minCityTier: 'medium',
    triggerMessage: '一位本地网红正在寻找有趣的摊位打卡！',
    choices: [
      {
        id: 'ignore',
        label: '顺其自然',
        description: '如果货品好自然会被关注',
        icon: '🤷',
        effects: { ...createNeutralEffect(), duration: 1 }
      },
      {
        id: 'gift_record',
        label: '赠送特色唱片',
        description: '赠送一张价值¥200的特色唱片求推荐',
        icon: '🎁',
        cost: 200,
        effects: { ...createNeutralEffect(), customerCountModifier: 0.6, reputationChange: 8, duration: 2 }
      },
      {
        id: 'premium_package',
        label: 'VIP专属体验',
        description: '提供价值¥600的稀有唱片品鉴服务',
        icon: '✨',
        cost: 600,
        effects: { ...createNeutralEffect(), customerCountModifier: 1.0, budgetModifier: 0.2, buyChanceModifier: 0.25, reputationChange: 12, duration: 3 }
      }
    ]
  },
  {
    id: 'event_collector_arrival',
    name: '神秘藏家',
    icon: '🎩',
    description: '一位传闻中的稀有唱片收藏家出现在了市集上！',
    category: 'special_guest',
    rarity: 'legendary',
    minCityTier: 'large',
    triggerMessage: '一位神秘的藏家出现在市集，正在寻找珍稀藏品！',
    choices: [
      {
        id: 'wait',
        label: '静候光临',
        description: '如果有缘他自然会来',
        icon: '🤞',
        effects: { ...createNeutralEffect(), budgetModifier: 0.1, duration: 1 }
      },
      {
        id: 'curate_selection',
        label: '精选珍稀藏品',
        description: '花费¥300准备专属展示',
        icon: '💎',
        cost: 300,
        effects: { ...createNeutralEffect(), budgetModifier: 0.5, priceModifier: 0.2, buyChanceModifier: 0.3, duration: 1 }
      },
      {
        id: 'private_viewing',
        label: '预约私藏鉴赏会',
        description: '花费¥1000筹办私人鉴赏会',
        icon: '🏛️',
        cost: 1000,
        effects: { ...createNeutralEffect(), budgetModifier: 1.0, priceModifier: 0.4, buyChanceModifier: 0.5, reputationChange: 15, duration: 2 }
      }
    ]
  },
  {
    id: 'event_competitor',
    name: '同行竞争',
    icon: '⚔️',
    description: '隔壁摊位也是一家唱片店，正在用低价吸引顾客。',
    category: 'competition',
    rarity: 'uncommon',
    minCityTier: 'small',
    triggerMessage: '隔壁摊位打出了超低价，顾客开始犹豫了...',
    choices: [
      {
        id: 'hold_price',
        label: '坚持品质',
        description: '用品质和服务取胜',
        icon: '💪',
        effects: { ...createNeutralEffect(), customerCountModifier: -0.2, reputationChange: 1, buyChanceModifier: -0.1, duration: 1 }
      },
      {
        id: 'match_price',
        label: '价格比拼',
        description: '降价应对竞争（售价-10%）',
        icon: '💰',
        effects: { ...createNeutralEffect(), priceModifier: -0.1, customerCountModifier: 0.1, duration: 1 }
      },
      {
        id: 'bundle_deal',
        label: '推出组合优惠',
        description: '花费¥100设计组合套餐',
        icon: '🎁',
        cost: 100,
        effects: { ...createNeutralEffect(), buyChanceModifier: 0.2, customerCountModifier: 0.1, duration: 1 }
      }
    ]
  },
  {
    id: 'event_damage',
    name: '意外损坏',
    icon: '💥',
    description: '搬运时不小心碰倒了货架，一些唱片品相受损。',
    category: 'accident',
    rarity: 'common',
    minCityTier: 'small',
    triggerMessage: '糟糕！货架被碰倒，部分唱片品相受损！',
    choices: [
      {
        id: 'accept_loss',
        label: '接受损失',
        description: '整理好摊位继续营业',
        icon: '😔',
        effects: { ...createNeutralEffect(), reputationChange: -2, duration: 1 }
      },
      {
        id: 'repair',
        label: '紧急修复',
        description: '花费¥200进行品相修复',
        icon: '🔧',
        cost: 200,
        effects: { ...createNeutralEffect(), duration: 1 }
      }
    ]
  },
  {
    id: 'event_special_order',
    name: '大宗订单',
    icon: '📦',
    description: '一位本地咖啡馆老板想要采购一批唱片作为背景音乐。',
    category: 'opportunity',
    rarity: 'rare',
    minCityTier: 'medium',
    triggerMessage: '本地咖啡馆老板来寻求合作，想批量采购唱片！',
    choices: [
      {
        id: 'negotiate',
        label: '协商定价',
        description: '根据对方需求报价',
        icon: '🤝',
        effects: { ...createNeutralEffect(), budgetChange: 500, duration: 1 }
      },
      {
        id: 'premium_offer',
        label: '推荐精品套餐',
        description: '搭配多张风格匹配的精品唱片',
        icon: '✨',
        effects: { ...createNeutralEffect(), budgetChange: 1200, reputationChange: 5, duration: 1 }
      },
      {
        id: 'long_term',
        label: '建立长期合作',
        description: '牺牲部分利润换取长期合作',
        icon: '🤝',
        effects: { ...createNeutralEffect(), budgetChange: 800, reputationChange: 10, buyChanceModifier: 0.1, duration: 3 }
      }
    ]
  }
]

export const getRandomMarketEvent = (cityTier: CityTier): MarketEventConfig | null => {
  const tierRank: Record<CityTier, number> = {
    small: 0,
    medium: 1,
    large: 2,
    metropolis: 3
  }
  
  const eligible = marketEvents.filter(e => tierRank[cityTier] >= tierRank[e.minCityTier])
  if (eligible.length === 0) return null
  
  const weightedEvents: MarketEventConfig[] = []
  for (const e of eligible) {
    const weight = e.rarity === 'common' ? 50 : e.rarity === 'uncommon' ? 25 : e.rarity === 'rare' ? 10 : 3
    for (let i = 0; i < weight; i++) weightedEvents.push(e)
  }
  
  return weightedEvents[Math.floor(Math.random() * weightedEvents.length)] || null
}

export const getEventRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    common: '普通',
    uncommon: '不凡',
    rare: '稀有',
    legendary: '传说'
  }
  return labels[rarity] || rarity
}

export const getEventRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: '#a0aec0',
    uncommon: '#48bb78',
    rare: '#4299e1',
    legendary: '#ed8936'
  }
  return colors[rarity] || '#a0aec0'
}

export const getEventCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    weather: '天气',
    crowd: '人潮',
    media: '媒体',
    special_guest: '贵宾',
    competition: '竞争',
    accident: '意外',
    opportunity: '机遇'
  }
  return labels[category] || category
}

export const customerFlowWaveConfigs: Record<CustomerFlowWave, {
  label: string
  icon: string
  color: string
  customerMultiplier: number
  budgetMultiplier: number
  buyChanceBonus: number
}> = {
  low: {
    label: '冷清时段',
    icon: '🕯️',
    color: '#94a3b8',
    customerMultiplier: 0.5,
    budgetMultiplier: 0.8,
    buyChanceBonus: -0.1
  },
  normal: {
    label: '正常营业',
    icon: '🏪',
    color: '#3b82f6',
    customerMultiplier: 1.0,
    budgetMultiplier: 1.0,
    buyChanceBonus: 0
  },
  peak: {
    label: '高峰时段',
    icon: '🔥',
    color: '#f59e0b',
    customerMultiplier: 1.5,
    budgetMultiplier: 1.1,
    buyChanceBonus: 0.1
  },
  surge: {
    label: '客流暴增',
    icon: '🌊',
    color: '#ef4444',
    customerMultiplier: 2.2,
    budgetMultiplier: 1.25,
    buyChanceBonus: 0.2
  }
}

export const getWaveLabel = (wave: CustomerFlowWave): string => customerFlowWaveConfigs[wave].label
export const getWaveColor = (wave: CustomerFlowWave): string => customerFlowWaveConfigs[wave].color
export const getWaveIcon = (wave: CustomerFlowWave): string => customerFlowWaveConfigs[wave].icon
export const getCityTierLabel = getTierLabel
export const getCityTierColor = getTierColor

export const generateCustomerFlow = (cityTier: CityTier, _dayAtMarket: number): CustomerFlowState => {
  const baseWave: CustomerFlowWave[] = ['normal', 'normal', 'peak', 'low', 'surge']
  const tierBonus: Record<CityTier, number> = {
    small: 0,
    medium: 1,
    large: 2,
    metropolis: 3
  }
  
  const weights = [30, 40, 20, 5 + tierBonus[cityTier] * 2, 5 + tierBonus[cityTier]]
  const weightedWaves: CustomerFlowWave[] = []
  
  baseWave.forEach((wave, i) => {
    for (let j = 0; j < weights[i]; j++) weightedWaves.push(wave)
  })
  
  const wave = weightedWaves[Math.floor(Math.random() * weightedWaves.length)] || 'normal'
  const config = customerFlowWaveConfigs[wave]
  
  return {
    currentWave: wave,
    waveLabel: config.label,
    waveIcon: config.icon,
    customerMultiplier: config.customerMultiplier,
    budgetMultiplier: config.budgetMultiplier,
    buyChanceBonus: config.buyChanceBonus,
    nextWaveIn: 2 + Math.floor(Math.random() * 3),
    waveProgress: 0
  }
}

export const createMarketInventoryFromStore = (
  inventory: InventoryItem[],
  selectedRecordIds: string[],
  quantities: Map<string, number>
): MarketInventoryItem[] => {
  const result: MarketInventoryItem[] = []
  
  for (const item of inventory) {
    if (selectedRecordIds.includes(item.record.id)) {
      const qty = quantities.get(item.record.id) || 1
      const actualQty = Math.min(qty, item.quantity)
      
      if (actualQty > 0) {
        result.push({
          record: item.record,
          quantity: actualQty,
          conditionScore: item.conditionScore,
          actualCostPrice: item.actualCostPrice,
          sourceInventoryId: item.record.id,
          soldQuantity: 0,
          salePrice: Math.round(item.record.marketPrice * 1.15)
        })
      }
    }
  }
  
  return result
}

const marketCustomerNames = [
  '小林', '阿梅', '张哥', '阿强', '陈姐', '老王', '小李', '阿华',
  '周周', '小蔡', '刘叔', '阿芳', '小赵', '大伟', '林姐', '老孙',
  '小杨', '阿珍', '黄哥', '小明', '阿龙', '素素', '老铁', '小秦',
  '阿凯', '静静', '老周', '小苏', '阿鹏', '莹莹', '阿杰', '小婷'
]

const marketCustomerAvatars = [
  '👤', '👩', '👨', '🧑', '👴', '👵', '🧔', '👨‍🦰',
  '👩‍🦱', '👨‍🦳', '👩‍🦰', '🧑‍🦲', '👨‍🦱', '👩‍🦳', '🧑‍🦱', '🧔‍♂️'
]

export const generateMarketCustomer = (
  id: string,
  arrivalOrder: number,
  city: MarketCity,
  flowState: CustomerFlowState,
  unlockedGenres: Genre[]
): MarketCustomer => {
  const baseBudget = 300 + Math.random() * 500
  const budgetModifier = city.baseBudgetMultiplier * flowState.budgetMultiplier
  
  const cityGenreBias = city.preferredGenres
  const allGenres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']
  const availableGenres = allGenres.filter(g => unlockedGenres.includes(g))
  
  const favoriteGenres: Genre[] = []
  const genreCount = 1 + Math.floor(Math.random() * 2)
  
  for (let i = 0; i < genreCount; i++) {
    const useBias = Math.random() < 0.6 && cityGenreBias.length > 0
    const pool = useBias ? cityGenreBias.filter(g => availableGenres.includes(g)) : availableGenres
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!favoriteGenres.includes(pick)) {
        favoriteGenres.push(pick)
      }
    }
  }
  
  if (favoriteGenres.length === 0 && availableGenres.length > 0) {
    favoriteGenres.push(availableGenres[Math.floor(Math.random() * availableGenres.length)])
  }
  
  const rarityPref: number[] = []
  const baseRarity = 1 + Math.floor(Math.random() * 3)
  rarityPref.push(baseRarity)
  if (Math.random() < 0.4) rarityPref.push(Math.min(5, baseRarity + 1))
  if (city.tier === 'metropolis' || city.tier === 'large') {
    if (Math.random() < 0.3) rarityPref.push(4 + Math.floor(Math.random() * 2))
  }
  
  const isLocalCollector = Math.random() < (0.05 + (city.tier === 'large' ? 0.1 : 0) + (city.tier === 'metropolis' ? 0.15 : 0))
  const isTourist = !isLocalCollector && Math.random() < 0.3
  
  return {
    id,
    name: marketCustomerNames[Math.floor(Math.random() * marketCustomerNames.length)] + (Math.random() < 0.3 ? (isLocalCollector ? '（藏家）' : isTourist ? '（游客）' : '') : ''),
    avatar: marketCustomerAvatars[Math.floor(Math.random() * marketCustomerAvatars.length)],
    budget: Math.floor(baseBudget * budgetModifier * (isLocalCollector ? 1.8 : isTourist ? 1.3 : 1)),
    favoriteGenres,
    priceRange: [Math.floor(150 * budgetModifier), Math.floor(600 * budgetModifier * (isLocalCollector ? 1.5 : 1))],
    preferredRarity: rarityPref,
    patience: 80 + Math.floor(Math.random() * 40),
    maxPatience: 120,
    satisfaction: 50,
    willBargain: Math.random() < 0.5,
    arrivalOrder,
    isLocalCollector,
    isTourist,
    tipMultiplier: isLocalCollector ? 1.2 : isTourist ? 1.1 : 1.0,
    quote: isLocalCollector 
      ? marketCollectorQuotes[Math.floor(Math.random() * marketCollectorQuotes.length)]
      : isTourist
        ? marketTouristQuotes[Math.floor(Math.random() * marketTouristQuotes.length)]
        : marketCustomerQuotes[Math.floor(Math.random() * marketCustomerQuotes.length)]
  }
}

const marketCustomerQuotes = [
  '今天想淘点好唱片回去~',
  '听说这个市集有不少好货！',
  '最近在收集这个风格的黑胶',
  '家里唱片机正好缺一张',
  '老板推荐点能打动人的曲子吧',
  '想找一张能静下心来听的专辑',
  '朋友推荐过来逛逛~',
  '周末出来转一转，随缘看看',
  '希望能找到一张送给朋友的礼物',
  '我就随便看看，说不定有惊喜'
]

const marketCollectorQuotes = [
  '我找这张专辑找了很久了...',
  '只要品相好，价格都好商量',
  '我主要收藏头版和限量版',
  '有没有压箱底的好货？',
  '类似风格的稀有盘我都要',
  '我是专程过来淘宝的！'
]

const marketTouristQuotes = [
  '来旅游想带点有纪念意义的东西',
  '这张唱片当伴手礼挺合适的',
  '第一次逛黑胶市集，好新鲜啊！',
  '想带点本地特色回去',
  '哇！这个城市的文化氛围真好'
]

export const generateDailyMarketCustomers = (
  city: MarketCity,
  flowState: CustomerFlowState,
  reputationModifier: number,
  unlockedGenres: Genre[]
): MarketCustomer[] => {
  const baseCount = city.baseCustomerCount
  const customerCount = Math.max(3, Math.floor(baseCount * flowState.customerMultiplier * reputationModifier))
  
  const result: MarketCustomer[] = []
  for (let i = 0; i < customerCount; i++) {
    result.push(generateMarketCustomer(`mc-${Date.now()}-${i}`, i, city, flowState, unlockedGenres))
  }
  
  return result
}

export const createInitialMarketTourState = () => ({
  isActive: false,
  phase: 'planning' as const,
  currentCityId: null,
  selectedCityId: null,
  travelDaysRemaining: 0,
  daysAtMarket: 0,
  maxDaysAtMarket: 3,
  temporaryInventory: [],
  marketInventoryValue: 0,
  activeEvent: null,
  eventHistory: [],
  customerFlow: {
    currentWave: 'normal' as const,
    waveLabel: '正常营业',
    waveIcon: '🏪',
    customerMultiplier: 1.0,
    budgetMultiplier: 1.0,
    buyChanceBonus: 0,
    nextWaveIn: 3,
    waveProgress: 0
  },
  marketSales: [],
  dailyMarketRevenue: [],
  dailyMarketCost: [],
  dailyMarketSalesCount: [],
  currentMarketDayRevenue: 0,
  currentMarketDayCost: 0,
  currentMarketDaySalesCount: 0,
  currentMarketDaySatisfactionSum: 0,
  currentMarketDayCustomersServed: 0,
  pendingSettlement: null,
  settlementHistory: [],
  unlockedCityIds: cities.filter(c => c.isUnlocked).map(c => c.id),
  totalMarketProfit: 0,
  totalMarketSales: 0,
  reputationFromMarkets: 0,
  preferredCityIds: []
})

export const generateRecommendedRecords = (
  city: MarketCity,
  unlockedGenres: Genre[],
  excludeIds: string[],
  count: number = 10
) => {
  const preferredPool = allRecords.filter(r => 
    city.preferredGenres.includes(r.genre) && 
    unlockedGenres.includes(r.genre) &&
    !excludeIds.includes(r.id)
  )
  
  const othersPool = allRecords.filter(r => 
    unlockedGenres.includes(r.genre) &&
    !excludeIds.includes(r.id) &&
    !city.preferredGenres.includes(r.genre)
  )
  
  const preferredCount = Math.min(Math.ceil(count * 0.6), preferredPool.length)
  const othersCount = count - preferredCount
  
  const shuffledPref = [...preferredPool].sort(() => Math.random() - 0.5).slice(0, preferredCount)
  const shuffledOthers = [...othersPool].sort(() => Math.random() - 0.5).slice(0, othersCount)
  
  return [...shuffledPref, ...shuffledOthers]
}
