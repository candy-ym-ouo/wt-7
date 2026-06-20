import type {
  AuctionItem,
  BidRecord,
  RareCollectorConfig,
  RareCollectorAbility,
  PendingCollectorOffer,
  AuctionHouseStats,
  Genre,
  MemberLevel,
  Record as VinylRecord
} from '@/types'
import { allRecords, getRandomRecords } from './records'
import { getConditionScoreFromLabel } from './condition'

export const sourceConfigs = {
  consignment: { name: '私人委托', icon: '📦', feeRate: 0.12 },
  private_sale: { name: '私下交易', icon: '🤝', feeRate: 0.08 },
  estate: { name: '遗产拍卖', icon: '🏛️', feeRate: 0.15 },
  museum: { name: '博物馆典藏', icon: '🎨', feeRate: 0.10 },
  celebrity: { name: '名人旧藏', icon: '⭐', feeRate: 0.18 }
} as const

export type AuctionSource = keyof typeof sourceConfigs

export const provenanceTexts: { [key: string]: string[] } = {
  Jazz: [
    '原藏家为爵士乐手私人收藏，跟随大师巡演多年',
    '来自Blue Note唱片公司档案室的珍贵样片',
    '纽约爵士俱乐部驻场DJ私藏数十年珍品',
    '新奥尔良爵士家族三代收藏传承'
  ],
  Rock: [
    '原版签名黑胶，来自乐队鼓手私人收藏',
    '伦敦摇滚乐迷协会典藏级藏品',
    '录音室母带工程师私藏首版',
    '摇滚名人堂借出展品，曾在巡展中展出'
  ],
  Soul: [
    'Motown唱片公司高管私人珍藏',
    '底特律灵魂乐电台DJ毕生收藏',
    '格莱美获奖制作人录音室藏品',
    '费城灵魂乐黄金时代录音师私藏'
  ],
  Funk: [
    '放克乐队贝斯手巡演纪念品',
    '纽约哈林区夜店DJ经典藏品',
    'Parliament-Funkadelic乐队周边收藏',
    '洛杉矶放克音乐节创始人私藏'
  ],
  Disco: [
    'Studio 54驻场DJ原版黑胶收藏',
    '70年代纽约迪斯科皇后私人珍藏',
    '伊维萨岛传奇俱乐部驻场DJ私货',
    '芝加哥House音乐先驱收藏品'
  ],
  Classical: [
    '柏林爱乐乐团指挥家私人图书馆藏品',
    '维也纳金色大厅百年庆典纪念版',
    '钢琴大师演奏会签名首版',
    '皇家音乐学院档案室流出珍品'
  ],
  Blues: [
    '芝加哥蓝调俱乐部老板私藏',
    '三角洲蓝调歌手家族收藏',
    '孟菲斯太阳录音室原始首版',
    '蓝调音乐节创始人毕生珍藏'
  ],
  Pop: [
    '流行天王签名限量版，全球仅100张',
    'MTV音乐录影带大奖展品',
    '格莱美获奖专辑制作人私藏样片',
    '好莱坞明星私人收藏品'
  ],
  Electronic: [
    '柏林Techno俱乐部创始人私藏',
    '电子音乐节发起人首版珍藏',
    '底特律Techno三巨头联名收藏',
    'Warp唱片公司20周年纪念版'
  ],
  Folk: [
    '格林威治村民谣复兴运动见证物',
    '伍德斯托克音乐节现场藏品',
    '民谣歌后巡演签名纪念版',
    '乡村音乐名人堂借出展品'
  ]
}

export const generateAuctionItem = (
  record: VinylRecord,
  day: number,
  isRare: boolean = false,
  source?: AuctionSource,
  linkedRareCustomerId?: string
): AuctionItem => {
  const sources = Object.keys(sourceConfigs) as AuctionSource[]
  const selectedSource = source || sources[Math.floor(Math.random() * sources.length)]
  const config = sourceConfigs[selectedSource]
  
  const conditionScore = getConditionScoreFromLabel(record.condition)
  const rarityMult = 1 + (record.rarity - 1) * 0.3
  const conditionMult = conditionScore / 100
  const sourceMult = selectedSource === 'museum' || selectedSource === 'celebrity' ? 1.3 : 
                     selectedSource === 'estate' ? 1.15 : 1.0
  const rareMult = isRare ? 1.5 : 1.0
  
  const basePrice = Math.round(record.marketPrice * rarityMult * conditionMult * sourceMult * rareMult)
  
  const startingPrice = Math.round(basePrice * (0.6 + Math.random() * 0.2))
  const reservePrice = Math.round(basePrice * (0.85 + Math.random() * 0.15))
  const minBidIncrement = Math.max(10, Math.round(startingPrice * 0.05))
  
  const startTime = day
  const duration = isRare ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2)
  const endTime = startTime + duration
  
  const genreTexts = provenanceTexts[record.genre] || provenanceTexts.Jazz
  const provenance = genreTexts[Math.floor(Math.random() * genreTexts.length)]
  
  return {
    id: `auc-${day}-${record.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    record,
    startingPrice,
    reservePrice,
    currentBid: startingPrice,
    minBidIncrement,
    startTime,
    endTime,
    actualEndTime: null,
    status: 'upcoming',
    bidCount: 0,
    bidHistory: [],
    winnerId: null,
    winnerName: null,
    isRareItem: isRare || record.rarity >= 4,
    auctionHouseFee: Math.round(basePrice * config.feeRate),
    finalSalePrice: null,
    sellerId: `seller-${selectedSource}-${Math.random().toString(36).slice(2, 8)}`,
    sellerName: `${config.name}卖家`,
    conditionScoreAtStart: conditionScore,
    source: selectedSource,
    sourceIcon: config.icon,
    sourceName: config.name,
    linkedRareCustomerId: linkedRareCustomerId || null,
    provenance
  }
}

export const generateDailyAuctions = (
  day: number,
  levelId: number,
  excludeRecordIds: string[] = [],
  unlockedGenres: Genre[],
  rarityBonus: number = 0,
  specialCustomerBonus: number = 0
): AuctionItem[] => {
  const items: AuctionItem[] = []
  const count = 4 + Math.floor(levelId / 2) + Math.floor(specialCustomerBonus * 2)
  
  const availableRecords = allRecords.filter(r => 
    !excludeRecordIds.includes(r.id) && unlockedGenres.includes(r.genre)
  )
  
  const rareCount = Math.floor(count * (0.15 + rarityBonus * 0.1))
  const selectedRare = getRandomRecords(
    rareCount,
    excludeRecordIds,
    rarityBonus + 0.5
  ).filter(r => unlockedGenres.includes(r.genre))
  
  const normalCount = count - selectedRare.length
  const selectedNormal: VinylRecord[] = []
  const usedIds = [...excludeRecordIds, ...selectedRare.map(r => r.id)]
  
  const shuffledAvailable = availableRecords
    .filter(r => !usedIds.includes(r.id))
    .sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < Math.min(normalCount, shuffledAvailable.length); i++) {
    selectedNormal.push(shuffledAvailable[i])
  }
  
  for (const rec of selectedRare) {
    items.push(generateAuctionItem(rec, day, true))
  }
  
  for (const rec of selectedNormal) {
    items.push(generateAuctionItem(rec, day, false))
  }
  
  return items.sort(() => Math.random() - 0.5)
}

export const createBidRecord = (
  auctionItemId: string,
  bidderId: string,
  bidderName: string,
  bidderAvatar: string,
  bidAmount: number,
  bidderLevel: MemberLevel | null = null,
  isRareCollector: boolean = false,
  isAutoBid: boolean = false,
  maxBid: number = bidAmount
): BidRecord => {
  const reactions = [
    '势在必得！',
    '加价！',
    '这个价格太值了',
    '不拿下不罢休',
    '再加点！',
    '我看谁还敢跟',
    '今天就决定是你了'
  ]
  
  return {
    id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    auctionItemId,
    bidderId,
    bidderName,
    bidderAvatar,
    bidderLevel,
    isRareCollector,
    bidAmount,
    timestamp: Date.now(),
    maxBid,
    isAutoBid,
    isWinningBid: true,
    reaction: isAutoBid ? undefined : reactions[Math.floor(Math.random() * reactions.length)]
  }
}

export const getMinNextBid = (auction: AuctionItem): number => {
  if (auction.bidCount === 0) {
    return auction.startingPrice
  }
  return auction.currentBid + auction.minBidIncrement
}

export const canPlaceBid = (
  auction: AuctionItem,
  bidAmount: number,
  userBudget: number,
  frozenAmount: number = 0
): { valid: boolean; reason: string } => {
  if (auction.status !== 'active') {
    return { valid: false, reason: '拍卖未开始或已结束' }
  }
  
  const minBid = getMinNextBid(auction)
  if (bidAmount < minBid) {
    return { valid: false, reason: `出价不能低于当前最低加价 ¥${minBid}` }
  }
  
  if (auction.bidCount > 0) {
    const increment = bidAmount - auction.currentBid
    if (increment % auction.minBidIncrement !== 0) {
      return { valid: false, reason: `加价幅度必须是 ¥${auction.minBidIncrement} 的整数倍` }
    }
  }
  
  const availableBudget = userBudget - frozenAmount
  if (bidAmount > availableBudget) {
    return { valid: false, reason: `可用预算不足（可用 ¥${availableBudget}）` }
  }
  
  return { valid: true, reason: '' }
}

export const checkAuctionEnding = (
  auction: AuctionItem,
  currentDay: number,
  currentTime: number = Date.now()
): AuctionItem => {
  if (auction.status !== 'active') return auction
  
  if (currentDay > auction.endTime) {
    const updated = { ...auction }
    const hasValidBid = auction.bidCount > 0 && auction.currentBid >= auction.reservePrice
    
    if (hasValidBid) {
      const winningBid = auction.bidHistory[auction.bidHistory.length - 1]
      updated.status = 'ended'
      updated.winnerId = winningBid.bidderId
      updated.winnerName = winningBid.bidderName
      updated.finalSalePrice = winningBid.bidAmount
      updated.actualEndTime = currentTime
    } else if (auction.bidCount > 0 && auction.currentBid < auction.reservePrice) {
      updated.status = 'cancelled'
      updated.actualEndTime = currentTime
    } else {
      updated.status = 'cancelled'
      updated.actualEndTime = currentTime
    }
    
    return updated
  }
  
  return auction
}

export const calculateSettlement = (
  auction: AuctionItem,
  buyerPrefersCollection: boolean = true
) => {
  if (!auction.finalSalePrice) return null
  
  const fee = Math.round(auction.finalSalePrice * 0.08)
  const sellerPayout = auction.finalSalePrice - Math.round(auction.finalSalePrice * sourceConfigs[auction.source].feeRate)
  const buyerTotal = auction.finalSalePrice + fee
  
  return {
    auctionItemId: auction.id,
    recordId: auction.record.id,
    recordTitle: auction.record.title,
    buyerId: auction.winnerId,
    buyerName: auction.winnerName,
    finalPrice: auction.finalSalePrice,
    auctionHouseFee: fee,
    sellerPayout,
    buyerTotalCost: buyerTotal,
    conditionScore: auction.conditionScoreAtStart,
    addedToCollection: buyerPrefersCollection,
    addedToInventory: !buyerPrefersCollection,
    settlementTime: Date.now(),
    notes: auction.provenance
  }
}

export const createInitialAuctionStats = (): AuctionHouseStats => ({
  totalAuctionsHeld: 0,
  totalAuctionsSold: 0,
  totalRevenue: 0,
  totalFeesCollected: 0,
  rareItemsSold: 0,
  highestSalePrice: 0,
  highestSaleRecordTitle: null,
  avgSaleToEstimateRatio: 1,
  uniqueBidders: 0,
  rareCollectorEncounters: 0,
  collectionAdditions: 0
})

const collectorAbilities: RareCollectorAbility[] = [
  {
    id: 'ability-bid-boost',
    name: '行尊眼光',
    icon: '👁️',
    description: '对珍品价值判断更准，竞价效率提升15%',
    effectType: 'bid_bonus',
    effectValue: 0.15,
    unlockCondition: '默认激活',
    isActive: true
  },
  {
    id: 'ability-price-reduction',
    name: '人脉议价',
    icon: '🤝',
    description: '拍卖手续费降低5%',
    effectType: 'price_reduction',
    effectValue: 0.05,
    unlockCondition: '完成3次以上交易',
    isActive: false
  },
  {
    id: 'ability-condition-boost',
    name: '养护秘方',
    icon: '✨',
    description: '拍得唱片品相额外+5分',
    effectType: 'condition_boost',
    effectValue: 5,
    unlockCondition: '激活完美品相图鉴',
    isActive: false
  },
  {
    id: 'ability-exclusive-access',
    name: 'VIP通道',
    icon: '🔑',
    description: '优先获取未公开拍品信息',
    effectType: 'exclusive_access',
    effectValue: 1,
    unlockCondition: '与稀有收藏家建立深度关系',
    isActive: false
  },
  {
    id: 'ability-provenance-bonus',
    name: '传奇背书',
    icon: '📜',
    description: '拍品收藏价值额外增加20%',
    effectType: 'provenance_bonus',
    effectValue: 0.20,
    unlockCondition: '完成10次以上稀有品交易',
    isActive: false
  }
]

export const rareCollectorConfigs: RareCollectorConfig[] = [
  {
    id: 'collector-jazz-001',
    name: '黄老',
    avatar: '🎷',
    title: '爵士泰斗级收藏家',
    description: '上海滩爵士乐俱乐部创始人，见证了中国爵士音乐的发展历程',
    personality: '和蔼可亲但对藏品极其挑剔，喜欢有故事的唱片',
    favoriteGenres: ['Jazz', 'Blues'],
    preferredRarity: [4, 5],
    minConditionScore: 75,
    budgetRange: [2000, 8000],
    bidAggressiveness: 0.7,
    snipeChance: 0.4,
    triggerAlbumIds: ['album-jazz-1', 'album-jazz-2'],
    isUnlocked: false,
    baseAppearanceWeight: 10,
    relationshipLevel: 0,
    preferredSources: ['consignment', 'private_sale', 'estate'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  },
  {
    id: 'collector-rock-001',
    name: '铁哥',
    avatar: '🎸',
    title: '摇滚活化石',
    description: '80年代就开始玩摇滚的老炮儿，收藏了无数珍贵的原版摇滚唱片',
    personality: '豪爽直率，为了心头好不惜一掷千金',
    favoriteGenres: ['Rock', 'Funk', 'Pop'],
    preferredRarity: [3, 4, 5],
    minConditionScore: 65,
    budgetRange: [1500, 6000],
    bidAggressiveness: 0.85,
    snipeChance: 0.6,
    triggerAlbumIds: ['album-rock-1', 'album-rock-2'],
    isUnlocked: false,
    baseAppearanceWeight: 12,
    relationshipLevel: 0,
    preferredSources: ['private_sale', 'celebrity', 'estate'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  },
  {
    id: 'collector-classical-001',
    name: '陈教授',
    avatar: '🎻',
    title: '古典音乐学者',
    description: '音乐学院退休教授，专攻古典黑胶版本学研究',
    personality: '温文尔雅，注重唱片的历史价值和录音质量',
    favoriteGenres: ['Classical', 'Folk'],
    preferredRarity: [3, 4, 5],
    minConditionScore: 80,
    budgetRange: [1800, 7000],
    bidAggressiveness: 0.55,
    snipeChance: 0.25,
    triggerAlbumIds: ['album-classical-1'],
    isUnlocked: false,
    baseAppearanceWeight: 8,
    relationshipLevel: 0,
    preferredSources: ['museum', 'estate', 'consignment'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  },
  {
    id: 'collector-soul-001',
    name: '薇薇姐',
    avatar: '💃',
    title: '灵魂乐女王',
    description: '70年代灵魂乐歌手转型收藏，迪斯科黄金时代的见证者',
    personality: '热情奔放，有品位，对黑人音乐情有独钟',
    favoriteGenres: ['Soul', 'Funk', 'Disco'],
    preferredRarity: [3, 4, 5],
    minConditionScore: 70,
    budgetRange: [1200, 5500],
    bidAggressiveness: 0.65,
    snipeChance: 0.35,
    triggerAlbumIds: ['album-soul-1'],
    isUnlocked: false,
    baseAppearanceWeight: 9,
    relationshipLevel: 0,
    preferredSources: ['consignment', 'private_sale', 'celebrity'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  },
  {
    id: 'collector-rare-001',
    name: '神秘藏家Z',
    avatar: '🃏',
    title: '神秘顶级藏家',
    description: '身份成谜的亿万富翁，只在最高级别的拍卖会上偶尔现身',
    personality: '低调神秘，只追求真正的稀世珍宝，出手极为惊人',
    favoriteGenres: ['Jazz', 'Rock', 'Classical', 'Electronic'],
    preferredRarity: [5],
    minConditionScore: 90,
    budgetRange: [5000, 20000],
    bidAggressiveness: 0.95,
    snipeChance: 0.8,
    triggerAlbumIds: ['album-rare-1', 'album-rare-2', 'album-genre-1'],
    isUnlocked: false,
    baseAppearanceWeight: 3,
    relationshipLevel: 0,
    preferredSources: ['museum', 'celebrity', 'estate'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  },
  {
    id: 'collector-pop-001',
    name: '琳达',
    avatar: '👑',
    title: '流行文化教母',
    description: 'MTV时代的VJ，收藏了大量80-90年代流行经典',
    personality: '时尚前卫，眼光独到，喜欢有时代印记的唱片',
    favoriteGenres: ['Pop', 'Electronic', 'Disco'],
    preferredRarity: [3, 4, 5],
    minConditionScore: 72,
    budgetRange: [1300, 5800],
    bidAggressiveness: 0.6,
    snipeChance: 0.3,
    triggerAlbumIds: ['album-pop-1'],
    isUnlocked: false,
    baseAppearanceWeight: 10,
    relationshipLevel: 0,
    preferredSources: ['celebrity', 'private_sale', 'consignment'],
    specialAbilities: JSON.parse(JSON.stringify(collectorAbilities))
  }
]

export const checkCollectorUnlock = (
  collector: RareCollectorConfig,
  activatedAlbumIds: string[],
  shopReputation: number,
  collectionCount: number
): { unlocked: boolean; reason?: string } => {
  if (collector.isUnlocked) return { unlocked: true }
  
  const hasRequiredAlbums = collector.triggerAlbumIds.every(id => 
    activatedAlbumIds.includes(id)
  )
  
  if (!hasRequiredAlbums) {
    return { unlocked: false, reason: '需要激活相关收藏图鉴' }
  }
  
  const minReputation = collector.id === 'collector-rare-001' ? 80 : 60
  if (shopReputation < minReputation) {
    return { unlocked: false, reason: `声望需要达到 ${minReputation}` }
  }
  
  const minCollection = collector.id === 'collector-rare-001' ? 15 : 8
  if (collectionCount < minCollection) {
    return { unlocked: false, reason: `收藏数量需要达到 ${minCollection}` }
  }
  
  return { unlocked: true }
}

export const generateCollectorBid = (
  collector: RareCollectorConfig,
  auction: AuctionItem,
  currentBid: number,
  currentBudget: number
): { bidAmount: number; maxBid: number } | null => {
  const isGenreMatch = collector.favoriteGenres.includes(auction.record.genre)
  const isRarityMatch = collector.preferredRarity.includes(auction.record.rarity)
  const conditionOk = auction.conditionScoreAtStart >= collector.minConditionScore
  
  if (!isGenreMatch || !isRarityMatch || !conditionOk) return null
  
  const minNext = getMinNextBid(auction)
  
  let bidPercentage = collector.bidAggressiveness
  if (isGenreMatch && isRarityMatch) bidPercentage += 0.1
  if (auction.isRareItem) bidPercentage += 0.15
  
  const budgetHeadroom = (currentBudget - minNext) / currentBudget
  bidPercentage = Math.min(bidPercentage, 0.5 + budgetHeadroom * 0.5)
  
  const aggressiveIncrease = minNext - currentBid + Math.round((auction.reservePrice * 0.3) * bidPercentage)
  let bidAmount = currentBid + aggressiveIncrease
  
  bidAmount = Math.max(minNext, bidAmount)
  bidAmount = Math.ceil(bidAmount / auction.minBidIncrement) * auction.minBidIncrement
  bidAmount = Math.min(bidAmount, currentBudget)
  
  const maxBid = Math.min(
    currentBudget,
    Math.round(Math.max(
      auction.reservePrice * 1.5,
      bidAmount * (1 + collector.bidAggressiveness * 0.5)
    ))
  )
  
  if (bidAmount < minNext || bidAmount <= currentBid) return null
  
  return { bidAmount, maxBid }
}

export const generateCollectorOffer = (
  collector: RareCollectorConfig,
  unlockedRecords: VinylRecord[],
  day: number
): PendingCollectorOffer | null => {
  if (Math.random() > 0.3 + collector.relationshipLevel * 0.05) return null
  
  const offerTypes: PendingCollectorOffer['offerType'][] = ['private_sale', 'commission', 'trade']
  const type = offerTypes[Math.floor(Math.random() * offerTypes.length)]
  
  const preferredRecords = unlockedRecords.filter(r => 
    collector.favoriteGenres.includes(r.genre) &&
    collector.preferredRarity.includes(r.rarity)
  )
  
  if (preferredRecords.length === 0) return null
  
  const target = preferredRecords[Math.floor(Math.random() * preferredRecords.length)]
  const basePrice = target.marketPrice * (1 + (target.rarity - 1) * 0.2)
  
  let offerPrice = 0
  let description = ''
  const bonusRewards: string[] = []
  
  switch (type) {
    case 'private_sale':
      offerPrice = Math.round(basePrice * (0.85 + Math.random() * 0.2))
      description = `${collector.title}有一张《${target.title}》想私下转让给你，品相优良`
      bonusRewards.push(`可获得${collector.name}好感度+5`)
      if (collector.relationshipLevel >= 3) {
        bonusRewards.push('可能附赠签名海报')
      }
      break
    case 'commission':
      offerPrice = Math.round(basePrice * (1.2 + Math.random() * 0.3))
      description = `${collector.title}委托你寻找一张《${target.title}》，找到后他愿意高价收购`
      bonusRewards.push(`可获得${collector.name}好感度+10`)
      bonusRewards.push(`额外奖励¥${Math.round(offerPrice * 0.1)}`)
      break
    case 'trade':
      offerPrice = Math.round(basePrice * (0.9 + Math.random() * 0.15))
      description = `${collector.title}想用《${target.title}》交换你收藏中的同等价值唱片`
      bonusRewards.push(`可获得${collector.name}好感度+8`)
      bonusRewards.push('双方品相都有小幅度提升')
      break
  }
  
  return {
    collectorId: collector.id,
    collectorName: collector.name,
    offerType: type,
    recordId: target.id,
    recordTitle: target.title,
    offerPrice,
    expirationTime: day + 3,
    isAccepted: false,
    description,
    bonusRewards
  }
}

export const getSourceLabel = (source: keyof typeof sourceConfigs) => sourceConfigs[source]
