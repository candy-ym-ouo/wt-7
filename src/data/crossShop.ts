import type {
  CrossShopShop,
  CrossShopShopType,
  CrossShopValuation,
  CrossShopValuationResult,
  CrossShopTrade,
  CrossShopTradeItem,
  CrossShopNegotiationRound,
  CrossShopInventoryItem,
  CrossShopStats,
  CrossShopGameState,
  CrossShopTradeCreateResult,
  CrossShopNegotiationResult,
  CrossShopTradeCompleteResult,
  CrossShopTradeType,
  Genre,
  Record,
  InventoryItem,
  CollectionItem,
  EncyclopediaState
} from '@/types'
import { allRecords } from './records'
import { getRarityConfig } from './encyclopedia'

const shopTypeLabels: { [key in CrossShopShopType]: string } = {
  antique: '古董唱片店',
  modern: '现代音像店',
  specialist: '流派专营店',
  chain: '连锁唱片行',
  boutique: '精品收藏店'
}

const tradeStyleMessages = {
  generous: [
    '好东西一起分享！',
    '这个价格我很满意。',
    '交个朋友，这点不算什么。',
    '以后常来啊！'
  ],
  fair: [
    '公平交易，童叟无欺。',
    '这个价格还算合理。',
    '我们各让一步如何？',
    '做生意讲究诚信。'
  ],
  tough: [
    '这个价格我不能接受。',
    '我的货值这个价。',
    '再低就亏本了。',
    '你还是再考虑考虑吧。'
  ],
  shrewd: [
    '让我算算…这个搭配挺有意思。',
    '你很有眼光，但我也不傻。',
    '这个品相…嗯，得打个折。',
    '这笔交易我要好好想想。'
  ]
}

export const crossShopShops: CrossShopShop[] = [
  {
    id: 'shop-001',
    name: '老陈的黑胶阁',
    type: 'antique',
    typeName: shopTypeLabels.antique,
    icon: '🏛️',
    avatar: '👴',
    description: '一家开了三十年的老唱片店，老板对爵士乐情有独钟，收藏了大量罕见的首版唱片。',
    reputation: 85,
    preferredGenres: ['Jazz', 'Blues', 'Classical'],
    preferredRarities: [4, 5],
    tradeStyle: 'generous',
    trustLevel: 3,
    minLevel: 1,
    isUnlocked: true,
    lastTradeDay: null,
    totalTradesCompleted: 0,
    address: '老街127号',
    ownerName: '陈老爷子',
    ownerQuote: '音乐是时间的艺术，好唱片值得被珍藏。'
  },
  {
    id: 'shop-002',
    name: 'SoundWave 旗舰店',
    type: 'chain',
    typeName: shopTypeLabels.chain,
    icon: '🏪',
    avatar: '👨‍💼',
    description: '大型连锁唱片店，库存充足，价格公道，但对品相要求严格。',
    reputation: 75,
    preferredGenres: ['Rock', 'Pop', 'Electronic'],
    preferredRarities: [2, 3, 4],
    tradeStyle: 'fair',
    trustLevel: 2,
    minLevel: 1,
    isUnlocked: true,
    lastTradeDay: null,
    totalTradesCompleted: 0,
    address: '市中心商业广场B1层',
    ownerName: '张经理',
    ownerQuote: '标准化经营，给顾客最稳定的体验。'
  },
  {
    id: 'shop-003',
    name: 'Soul Kitchen',
    type: 'specialist',
    typeName: shopTypeLabels.specialist,
    icon: '🎵',
    avatar: '🧑‍🎤',
    description: '灵魂乐和放克音乐的天堂，老板本身就是音乐人，对稀有版本了如指掌。',
    reputation: 90,
    preferredGenres: ['Soul', 'Funk', 'Disco'],
    preferredRarities: [3, 4, 5],
    tradeStyle: 'shrewd',
    trustLevel: 4,
    minLevel: 2,
    isUnlocked: false,
    lastTradeDay: null,
    totalTradesCompleted: 0,
    address: '艺术区西区88号',
    ownerName: 'Maya姐',
    ownerQuote: '好的节奏会说话，你得学会聆听。'
  },
  {
    id: 'shop-004',
    name: 'Vinyl Vogue',
    type: 'boutique',
    typeName: shopTypeLabels.boutique,
    icon: '✨',
    avatar: '👩‍🎨',
    description: '精品收藏店，只接受高品相的稀有唱片，交换条件苛刻但回报丰厚。',
    reputation: 95,
    preferredGenres: ['Jazz', 'Rock', 'Classical', 'Folk'],
    preferredRarities: [4, 5],
    tradeStyle: 'tough',
    trustLevel: 5,
    minLevel: 3,
    isUnlocked: false,
    lastTradeDay: null,
    totalTradesCompleted: 0,
    address: '富豪区南山路56号',
    ownerName: '林女士',
    ownerQuote: '宁缺毋滥，每一张唱片都是艺术品。'
  },
  {
    id: 'shop-005',
    name: 'Neo Discs',
    type: 'modern',
    typeName: shopTypeLabels.modern,
    icon: '🎧',
    avatar: '🧑‍💻',
    description: '年轻派的现代唱片店，对电子音乐和新派摇滚接受度高，交易方式灵活。',
    reputation: 70,
    preferredGenres: ['Electronic', 'Rock', 'Pop', 'Folk'],
    preferredRarities: [1, 2, 3],
    tradeStyle: 'generous',
    trustLevel: 2,
    minLevel: 2,
    isUnlocked: false,
    lastTradeDay: null,
    totalTradesCompleted: 0,
    address: '大学城创业街12号',
    ownerName: '小宇',
    ownerQuote: '音乐在进化，收藏的方式也该变变了！'
  }
]

export const getShopsForLevel = (currentLevel: number, shopReputation: number): CrossShopShop[] => {
  return crossShopShops.map(shop => ({
    ...shop,
    isUnlocked: shop.minLevel <= currentLevel && shopReputation >= (shop.minLevel * 15)
  }))
}

export const getShopById = (shopId: string): CrossShopShop | undefined => {
  return crossShopShops.find(s => s.id === shopId)
}

export const calculateRecordValuation = (
  record: Record,
  conditionScore: number,
  shop: CrossShopShop,
  genreMarketHeatMap: Map<Genre, { heatValue: number; priceModifier: number }> = new Map()
): CrossShopValuation => {
  const baseMarketValue = record.marketPrice
  const rarityConfig = getRarityConfig(record.rarity)

  const rarityMultiplier = 0.6 + (record.rarity * 0.15)

  const conditionMultiplier = conditionScore >= 90 ? 1.4
    : conditionScore >= 75 ? 1.2
    : conditionScore >= 60 ? 1.0
    : conditionScore >= 40 ? 0.8
    : 0.6

  const genreHeat = genreMarketHeatMap.get(record.genre)
  const genreHeatMultiplier = genreHeat ? genreHeat.priceModifier : 1.0

  const genrePreferenceMatch = shop.preferredGenres.includes(record.genre)
  const rarityPreferenceMatch = shop.preferredRarities.includes(record.rarity)
  let shopPreferenceMultiplier = 1.0
  if (genrePreferenceMatch && rarityPreferenceMatch) {
    shopPreferenceMultiplier = 1.35
  } else if (genrePreferenceMatch || rarityPreferenceMatch) {
    shopPreferenceMultiplier = 1.15
  } else {
    shopPreferenceMultiplier = 0.9
  }

  const tradeStyleAdjustment = shop.tradeStyle === 'generous' ? 1.1
    : shop.tradeStyle === 'fair' ? 1.0
    : shop.tradeStyle === 'tough' ? 0.85
    : 0.92

  const finalEstimatedValue = Math.round(
    baseMarketValue * rarityMultiplier * conditionMultiplier *
    genreHeatMultiplier * shopPreferenceMultiplier * tradeStyleAdjustment
  )

  const breakdown = [
    { label: '基础市场价', value: baseMarketValue, percent: Math.round((baseMarketValue / finalEstimatedValue) * 100) },
    { label: `稀有度加成 (${rarityConfig.tierName})`, value: Math.round(baseMarketValue * (rarityMultiplier - 1)), percent: Math.round((rarityMultiplier - 1) * 100) },
    { label: `品相加成 (${conditionScore}分)`, value: Math.round(baseMarketValue * rarityMultiplier * (conditionMultiplier - 1)), percent: Math.round((conditionMultiplier - 1) * 100) },
    { label: genreHeat ? `市场热度 ${genreHeat.heatValue > 1 ? '🔥' : '❄️'}` : '市场热度', value: Math.round(baseMarketValue * rarityMultiplier * conditionMultiplier * (genreHeatMultiplier - 1)), percent: Math.round((genreHeatMultiplier - 1) * 100) },
    { label: genrePreferenceMatch || rarityPreferenceMatch ? '店家偏好 ⭐' : '店家偏好', value: Math.round(baseMarketValue * rarityMultiplier * conditionMultiplier * genreHeatMultiplier * (shopPreferenceMultiplier - 1)), percent: Math.round((shopPreferenceMultiplier - 1) * 100) }
  ].filter(b => Math.abs(b.value) > 0 || b.label === '基础市场价')

  const confidence = (shop.trustLevel >= 4 && conditionScore >= 70) ? 'high'
    : (shop.trustLevel >= 2 && conditionScore >= 50) ? 'medium'
    : 'low'

  const counterRangeMin = Math.round(finalEstimatedValue * (shop.tradeStyle === 'generous' ? 0.85 : shop.tradeStyle === 'fair' ? 0.75 : 0.6))
  const counterRangeMax = Math.round(finalEstimatedValue * (shop.tradeStyle === 'generous' ? 1.1 : shop.tradeStyle === 'fair' ? 1.0 : 0.9))

  return {
    recordId: record.id,
    record,
    conditionScore,
    baseMarketValue,
    rarityMultiplier,
    conditionMultiplier,
    genreHeatMultiplier,
    shopPreferenceMultiplier,
    finalEstimatedValue,
    valuationBreakdown: breakdown,
    confidence,
    shopCounterRange: [counterRangeMin, counterRangeMax]
  }
}

export const calculateBatchValuation = (
  items: { record: Record; conditionScore: number }[],
  shop: CrossShopShop,
  genreMarketHeatMap: Map<Genre, { heatValue: number; priceModifier: number }> = new Map()
): CrossShopValuationResult => {
  const valuations = items.map(item =>
    calculateRecordValuation(item.record, item.conditionScore, shop, genreMarketHeatMap)
  )

  const totalEstimatedValue = valuations.reduce((sum, v) => sum + v.finalEstimatedValue, 0)
  const totalBaseValue = valuations.reduce((sum, v) => sum + v.baseMarketValue, 0)

  const avgConfidenceScore = valuations.reduce((sum, v) => {
    return sum + (v.confidence === 'high' ? 3 : v.confidence === 'medium' ? 2 : 1)
  }, 0) / Math.max(valuations.length, 1)

  const averageConfidence = avgConfidenceScore >= 2.5 ? 'high'
    : avgConfidenceScore >= 1.5 ? 'medium'
    : 'low'

  return { valuations, totalEstimatedValue, totalBaseValue, averageConfidence }
}

export const generateShopInventory = (
  shop: CrossShopShop,
  excludeRecordIds: string[],
  currentLevel: number
): CrossShopInventoryItem[] => {
  const availableRecords = allRecords.filter(r =>
    shop.preferredGenres.includes(r.genre) &&
    !excludeRecordIds.includes(r.id)
  )

  const shuffled = [...availableRecords].sort(() => Math.random() - 0.5)
  const count = 3 + Math.floor(shop.trustLevel / 2) + Math.floor(currentLevel / 3)

  return shuffled.slice(0, Math.min(count, shuffled.length)).map(record => {
    const preferredRarityWeight = shop.preferredRarities.includes(record.rarity) ? 0.7 : 0.3
    const conditionBase = 50 + (preferredRarityWeight * 40) + Math.random() * 20
    const conditionScore = Math.min(100, Math.round(conditionBase))

    const minAcceptMultiplier = shop.tradeStyle === 'generous' ? 0.6
      : shop.tradeStyle === 'fair' ? 0.7
      : shop.tradeStyle === 'tough' ? 0.85
      : 0.75

    const valuation = calculateRecordValuation(record, conditionScore, shop)

    return {
      record,
      quantity: 1 + (Math.random() < 0.15 ? 1 : 0),
      conditionScore,
      minimumAcceptValue: Math.round(valuation.finalEstimatedValue * minAcceptMultiplier),
      isWillingToTrade: true,
      tradePriority: Math.round(valuation.finalEstimatedValue / 10),
      shopPreferenceNote: shop.preferredGenres.includes(record.genre) && shop.preferredRarities.includes(record.rarity)
        ? '这是本店的心头好'
        : shop.preferredGenres.includes(record.genre)
          ? '本店偏好此流派'
          : '可以考虑交换'
    }
  })
}

export const getPlayerTradeableInventory = (
  inventory: InventoryItem[],
  collection: CollectionItem[]
): { type: 'inventory' | 'collection'; item: InventoryItem | CollectionItem; record: Record; conditionScore: number; quantity: number }[] => {
  const result: { type: 'inventory' | 'collection'; item: InventoryItem | CollectionItem; record: Record; conditionScore: number; quantity: number }[] = []

  for (const invItem of inventory) {
    if (invItem.quantity > 0) {
      result.push({
        type: 'inventory',
        item: invItem,
        record: invItem.record,
        conditionScore: invItem.conditionScore,
        quantity: invItem.quantity
      })
    }
  }

  for (const colItem of collection) {
    result.push({
      type: 'collection',
      item: colItem,
      record: colItem.record,
      conditionScore: colItem.conditionScore,
      quantity: 1
    })
  }

  return result
}

const generateTradeId = (): string => {
  return `trade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const getRandomMessage = (style: CrossShopShop['tradeStyle']): string => {
  const messages = tradeStyleMessages[style]
  return messages[Math.floor(Math.random() * messages.length)]
}

export const createTrade = (
  shop: CrossShopShop,
  playerItems: CrossShopTradeItem[],
  shopItems: CrossShopTradeItem[],
  cashFromPlayer: number,
  cashFromShop: number,
  currentDay: number
): CrossShopTradeCreateResult => {
  if (playerItems.length === 0 && cashFromPlayer <= 0) {
    return { success: false, message: '你需要提供至少一件物品或现金' }
  }
  if (shopItems.length === 0 && cashFromShop <= 0) {
    return { success: false, message: '对方需要提供至少一件物品或现金' }
  }

  let type: CrossShopTradeType
  if (playerItems.length > 0 && shopItems.length > 0) {
    type = cashFromPlayer > 0 || cashFromShop > 0 ? 'mixed' : 'record_for_record'
  } else {
    type = 'record_for_cash'
  }

  const firstRound: CrossShopNegotiationRound = {
    round: 1,
    side: 'player',
    proposedItems: [...playerItems],
    proposedCash: cashFromPlayer - cashFromShop,
    message: '发起交易',
    timestamp: Date.now()
  }

  const maxRounds = shop.tradeStyle === 'generous' ? 4
    : shop.tradeStyle === 'fair' ? 5
    : shop.tradeStyle === 'tough' ? 7
    : 6

  const trade: CrossShopTrade = {
    id: generateTradeId(),
    shopId: shop.id,
    shop,
    type,
    status: 'negotiating',
    playerItems,
    shopItems,
    cashFromPlayer,
    cashFromShop,
    currentRound: 1,
    maxRounds,
    rounds: [firstRound],
    createdAt: Date.now(),
    createdDay: currentDay,
    expiresInDays: 3,
    expiryDay: currentDay + 3,
    completedAt: null,
    completedDay: null,
    playerSatisfaction: null,
    reputationChange: 0,
    encyclopediaProgressGained: [],
    notes: ''
  }

  return { success: true, message: '交易已创建，等待对方回应', trade }
}

export const evaluatePlayerOffer = (
  trade: CrossShopTrade,
  shop: CrossShopShop
): { accept: boolean; counterItems: CrossShopTradeItem[]; counterCashFromShop: number; counterCashFromPlayer: number; message: string; reaction: CrossShopNegotiationRound['reaction'] } => {
  const currentPlayerValue = trade.playerItems.reduce((sum, i) => sum + i.agreedValue * i.quantity, 0) + trade.cashFromPlayer
  const currentShopValue = trade.shopItems.reduce((sum, i) => sum + i.agreedValue * i.quantity, 0) + trade.cashFromShop

  const valueRatio = currentPlayerValue / Math.max(currentShopValue, 1)

  const acceptThreshold = shop.tradeStyle === 'generous' ? 0.85
    : shop.tradeStyle === 'fair' ? 0.95
    : shop.tradeStyle === 'tough' ? 1.1
    : 1.0

  if (valueRatio >= acceptThreshold) {
    return {
      accept: true,
      counterItems: trade.shopItems,
      counterCashFromShop: trade.cashFromShop,
      counterCashFromPlayer: trade.cashFromPlayer,
      message: getRandomMessage(shop.tradeStyle),
      reaction: valueRatio >= acceptThreshold + 0.15 ? 'excited' : 'happy'
    }
  }

  const deficit = currentShopValue - currentPlayerValue
  let reaction: CrossShopNegotiationRound['reaction']
  let message: string

  if (valueRatio >= acceptThreshold - 0.1) {
    reaction = 'hesitant'
    message = '差不多，但还差一点…'
  } else if (valueRatio >= acceptThreshold - 0.25) {
    reaction = 'neutral'
    message = '我得再想想这个报价。'
  } else {
    reaction = 'unhappy'
    message = '这个差距太大了，我没法接受。'
  }

  const adjustmentRatio = shop.tradeStyle === 'generous' ? 0.6
    : shop.tradeStyle === 'fair' ? 0.75
    : shop.tradeStyle === 'tough' ? 0.9
    : 0.8

  const neededIncrease = Math.round(deficit * adjustmentRatio)

  let newCashFromPlayer = trade.cashFromPlayer
  let newCashFromShop = trade.cashFromShop
  const newShopItems = [...trade.shopItems]

  if (deficit > 0) {
    if (trade.cashFromShop > neededIncrease * 0.5) {
      newCashFromShop = Math.max(0, trade.cashFromShop - Math.round(neededIncrease * 0.4))
    }
    newCashFromPlayer = trade.cashFromPlayer + Math.round(neededIncrease * 0.6)
  }

  return {
    accept: false,
    counterItems: newShopItems,
    counterCashFromShop: newCashFromShop,
    counterCashFromPlayer: newCashFromPlayer,
    message,
    reaction
  }
}

export const processShopCounterOffer = (
  trade: CrossShopTrade,
  newPlayerItems: CrossShopTradeItem[],
  newShopItems: CrossShopTradeItem[],
  newCashFromPlayer: number,
  newCashFromShop: number,
  currentDay: number
): CrossShopNegotiationResult => {
  if (trade.currentRound >= trade.maxRounds) {
    trade.status = 'expired'
    return { success: false, message: '谈判轮次已用尽，交易失败', trade, isRejected: true }
  }

  if (currentDay > trade.expiryDay) {
    trade.status = 'expired'
    return { success: false, message: '交易已过期', trade, isRejected: true }
  }

  const updatedTrade: CrossShopTrade = {
    ...trade,
    playerItems: newPlayerItems,
    shopItems: newShopItems,
    cashFromPlayer: newCashFromPlayer,
    cashFromShop: newCashFromShop,
    currentRound: trade.currentRound + 1
  }

  const playerRound: CrossShopNegotiationRound = {
    round: updatedTrade.currentRound,
    side: 'player',
    proposedItems: [...newPlayerItems],
    proposedCash: newCashFromPlayer - newCashFromShop,
    message: '调整了报价',
    timestamp: Date.now()
  }
  updatedTrade.rounds = [...trade.rounds, playerRound]

  const evaluation = evaluatePlayerOffer(updatedTrade, trade.shop)

  if (evaluation.accept) {
    updatedTrade.status = 'accepted'
    const shopRound: CrossShopNegotiationRound = {
      round: updatedTrade.currentRound + 1,
      side: 'shop',
      proposedItems: evaluation.counterItems,
      proposedCash: evaluation.counterCashFromShop - evaluation.counterCashFromPlayer,
      message: evaluation.message,
      reaction: evaluation.reaction,
      timestamp: Date.now()
    }
    updatedTrade.rounds.push(shopRound)
    updatedTrade.currentRound = shopRound.round

    return {
      success: true,
      message: '对方接受了你的报价！',
      trade: updatedTrade,
      isAccepted: true
    }
  }

  const shopRound: CrossShopNegotiationRound = {
    round: updatedTrade.currentRound + 1,
    side: 'shop',
    proposedItems: evaluation.counterItems,
    proposedCash: evaluation.counterCashFromShop - evaluation.counterCashFromPlayer,
    message: evaluation.message,
    reaction: evaluation.reaction,
    timestamp: Date.now()
  }
  updatedTrade.rounds.push(shopRound)
  updatedTrade.currentRound = shopRound.round
  updatedTrade.shopItems = evaluation.counterItems
  updatedTrade.cashFromShop = evaluation.counterCashFromShop
  updatedTrade.cashFromPlayer = evaluation.counterCashFromPlayer

  return {
    success: true,
    message: '对方提出了还价',
    trade: updatedTrade,
    shopCounterOffer: shopRound
  }
}

export const calculateTradeCompletion = (
  trade: CrossShopTrade,
  currentDay: number,
  playerBudget: number,
  encyclopedia: EncyclopediaState
): CrossShopTradeCompleteResult => {
  if (trade.status !== 'accepted') {
    return { success: false, message: '交易尚未达成一致' }
  }

  if (playerBudget + trade.cashFromShop < trade.cashFromPlayer) {
    return { success: false, message: `预算不足！需要 ¥${trade.cashFromPlayer}，你有 ¥${playerBudget + trade.cashFromShop}` }
  }

  const encyclopediaUpdates: { recordId: string; wasNew: boolean; bestCondition: number }[] = []
  for (const item of trade.shopItems) {
    const existingEntry = encyclopedia.entries.find(e => e.record.id === item.recordId)
    if (!existingEntry) {
      encyclopediaUpdates.push({ recordId: item.recordId, wasNew: true, bestCondition: item.conditionScore })
    } else {
      const bestCondition = Math.max(existingEntry.bestConditionScore, item.conditionScore)
      encyclopediaUpdates.push({ recordId: item.recordId, wasNew: false, bestCondition })
    }
  }

  const seriesProgress: { seriesId: string; progress: number; target: number; isCompleted: boolean }[] = []
  for (const category of encyclopedia.categories) {
    for (const series of category.series) {
      const allSeriesRecordIds = new Set([...series.requiredRecordIds, ...encyclopediaUpdates.map(u => u.recordId)])
      const collectedInSeries = encyclopedia.entries.filter(e =>
        allSeriesRecordIds.has(e.record.id) && e.isCollected
      ).length + encyclopediaUpdates.filter(u => series.requiredRecordIds.includes(u.recordId)).length

      const isCompleted = collectedInSeries >= series.requiredRecordIds.length
      if (series.requiredRecordIds.some(id => encyclopediaUpdates.some(u => u.recordId === id))) {
        seriesProgress.push({
          seriesId: series.id,
          progress: collectedInSeries,
          target: series.requiredRecordIds.length,
          isCompleted
        })
      }
    }
  }

  const reputationChange = Math.round(
    (trade.shopItems.reduce((s, i) => s + i.agreedValue * i.quantity, 0) > 0 ? 2 : 0) +
    (trade.type === 'record_for_record' ? 1 : 0) +
    (trade.shop.trustLevel >= 4 ? 1 : 0)
  )

  return {
    success: true,
    message: '交易成功完成！',
    trade: {
      ...trade,
      status: 'completed',
      completedAt: Date.now(),
      completedDay: currentDay,
      reputationChange,
      encyclopediaProgressGained: encyclopediaUpdates.map(u => u.recordId)
    },
    itemsReceived: trade.shopItems,
    cashReceived: trade.cashFromShop,
    itemsGiven: trade.playerItems,
    cashGiven: trade.cashFromPlayer,
    reputationChange,
    encyclopediaUpdates,
    seriesProgress
  }
}

export const cancelTrade = (trade: CrossShopTrade): CrossShopTrade => {
  return {
    ...trade,
    status: 'cancelled',
    notes: trade.notes ? trade.notes + ' | 玩家取消' : '玩家取消交易'
  }
}

export const createInitialCrossShopStats = (): CrossShopStats => ({
  totalTradesProposed: 0,
  totalTradesAccepted: 0,
  totalTradesRejected: 0,
  totalTradesCompleted: 0,
  totalRecordsReceived: 0,
  totalRecordsGiven: 0,
  totalCashEarned: 0,
  totalCashSpent: 0,
  totalReputationGained: 0,
  totalReputationLost: 0,
  successfulTradeRate: 0,
  avgNegotiationRounds: 0,
  favoriteTradingPartner: null,
  mostTradedGenre: null,
  newEncyclopediaEntriesFromTrading: 0,
  seriesUnlockedViaTrading: 0
})

export const createInitialCrossShopState = (): CrossShopGameState => ({
  shops: JSON.parse(JSON.stringify(crossShopShops)),
  activeTrades: [],
  completedTrades: [],
  stats: createInitialCrossShopStats(),
  nextShopRefresh: 1,
  selectedShopId: null,
  selectedTradeId: null,
  tradeFilter: 'all',
  notifications: []
})

export const updateCrossShopStats = (
  stats: CrossShopStats,
  trade: CrossShopTrade,
  completed: boolean
): CrossShopStats => {
  const newStats = { ...stats }

  if (completed) {
    newStats.totalTradesCompleted += 1
    newStats.totalRecordsReceived += trade.shopItems.reduce((s, i) => s + i.quantity, 0)
    newStats.totalRecordsGiven += trade.playerItems.reduce((s, i) => s + i.quantity, 0)
    newStats.totalCashEarned += trade.cashFromShop
    newStats.totalCashSpent += trade.cashFromPlayer
    if (trade.reputationChange > 0) {
      newStats.totalReputationGained += trade.reputationChange
    } else {
      newStats.totalReputationLost += Math.abs(trade.reputationChange)
    }
  } else {
    newStats.totalTradesProposed += 1
  }

  const allCompleted = newStats.totalTradesCompleted
  const allProposed = newStats.totalTradesProposed
  newStats.successfulTradeRate = allProposed > 0 ? Math.round((allCompleted / allProposed) * 100) : 0

  return newStats
}

export const addCrossShopNotification = (
  state: CrossShopGameState,
  message: string,
  type: 'success' | 'warning' | 'error' | 'info'
): CrossShopGameState => {
  return {
    ...state,
    notifications: [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message,
        type,
        read: false,
        createdAt: Date.now()
      },
      ...state.notifications.slice(0, 49)
    ]
  }
}

export const getCrossShopUnreadCount = (state: CrossShopGameState): number => {
  return state.notifications.filter(n => !n.read).length
}

export const markCrossShopNotificationsRead = (state: CrossShopGameState): CrossShopGameState => {
  return {
    ...state,
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  }
}

export const getTradeStatusLabel = (status: CrossShopTrade['status']): string => {
  const labels: { [key in CrossShopTrade['status']]: string } = {
    proposed: '待处理',
    negotiating: '谈判中',
    accepted: '已接受',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }
  return labels[status]
}

export const getTradeStatusColor = (status: CrossShopTrade['status']): string => {
  const colors: { [key in CrossShopTrade['status']]: string } = {
    proposed: '#F59E0B',
    negotiating: '#3B82F6',
    accepted: '#10B981',
    rejected: '#EF4444',
    completed: '#059669',
    cancelled: '#6B7280',
    expired: '#9CA3AF'
  }
  return colors[status]
}

export const getReactionEmoji = (reaction: CrossShopNegotiationRound['reaction']): string => {
  const emojis: { [key in NonNullable<CrossShopNegotiationRound['reaction']>]: string } = {
    excited: '🤩',
    happy: '😊',
    neutral: '😐',
    hesitant: '🤔',
    unhappy: '😟'
  }
  return reaction ? emojis[reaction] : ''
}
