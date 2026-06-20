import type {
  SecondHandAppraisal,
  SecondHandInventoryItem,
  SecondHandSaleRecord,
  ReputationChangeLog,
  SecondHandSellerProfile,
  SecondHandStats,
  SecondHandGameState,
  SecondHandSource,
  SecondHandStatus,
  AppraisalQuality,
  ConsignmentTerms,
  Genre,
  MemberLevel
} from '@/types'
import { allRecords, getRecordById } from '@/data/records'
import { getGenreMarketHeat } from '@/data/marketHeat'
import type { GenreMarketHeat } from '@/types'

const sellerAvatars = ['👨', '👩', '🧔', '👴', '👵', '🧑', '👱', '👨‍🎤', '👩‍🎨', '🧑‍💼', '👨‍🔬', '👩‍🍳']
const sellerNames = ['老张', '小李', '王阿姨', '陈先生', '刘姐', '赵师傅', '孙小姐', '周哥', '吴老师', '郑老板', '冯女士', '老杨']

const conditionDescriptions = [
  '外封有轻微磨损，唱片无划痕，播放流畅',
  '保存完好，仅拆封听过一两次',
  '成色较新，偶尔使用，音质无影响',
  '外封有折痕，唱片有轻微划痕但不影响播放',
  '经典老唱片，外封泛黄但内片状态极佳',
  '私人珍藏，精心保存，品相一流',
  '有使用痕迹，但整体状态不错',
  '全新未拆封，完美品相',
  '老唱片，有使用痕迹，但播放正常',
  '外封有破损，内片有轻微划痕'
]

const provenanceNotes = [
  '1980年代从东京Tower Records亲自购买',
  '家族传下来的收藏，保存超过40年',
  '参加乐队巡演时在伦敦HMV购入',
  '从音乐杂志主编的私人收藏中转让',
  '知名收藏家专场拍卖所得',
  '唱片店老板友情转让',
  '音乐人签名版，本人亲自购买'
]

const appraisalNotes = {
  poor: ['品相较差，划痕较多，建议低价处理或拒收', '磨损严重，市场价值较低，需谨慎收购', '唱片状态不佳，仅适合收藏情怀'],
  fair: ['整体尚可，有明显使用痕迹，价格需压低', '品相一般，需修复后才能卖出好价', '中等品相，适合平价出售'],
  good: ['品相不错，符合二手市场标准，可以正常定价', '保存良好，市场接受度高，有一定利润空间', '标准二手品相，稳定收益'],
  excellent: ['品相优秀，接近新品，可以溢价出售', '保存极佳，收藏价值高，建议重点推广', '精品二手，吸引收藏家关注'],
  perfect: ['完美品相，近乎全新，可作为镇店之宝', '顶级品相，极具收藏价值，价格可大幅上调', '稀有品相，值得重点营销']
}

export const getAppraisalQualityLabel = (quality: AppraisalQuality): string => {
  const labels: { [key in AppraisalQuality]: string } = {
    poor: '较差',
    fair: '一般',
    good: '良好',
    excellent: '优秀',
    perfect: '完美'
  }
  return labels[quality]
}

export const getAppraisalQualityColor = (quality: AppraisalQuality): string => {
  const colors: { [key in AppraisalQuality]: string } = {
    poor: '#f56565',
    fair: '#ed8936',
    good: '#4299e1',
    excellent: '#48bb78',
    perfect: '#ffd700'
  }
  return colors[quality]
}

export const getSourceLabel = (source: SecondHandSource): string => {
  return source === 'recycle' ? '回收' : '寄售'
}

export const getSourceIcon = (source: SecondHandSource): string => {
  return source === 'recycle' ? '♻️' : '📦'
}

export const getStatusLabel = (status: SecondHandStatus): string => {
  const labels: { [key in SecondHandStatus]: string } = {
    pending_appraisal: '待估价',
    appraised: '已估价',
    accepted: '已收购',
    rejected: '已拒绝',
    in_stock: '在售中',
    sold: '已售出',
    settled: '已结算',
    cancelled: '已取消'
  }
  return labels[status]
}

export const getStatusColor = (status: SecondHandStatus): string => {
  const colors: { [key in SecondHandStatus]: string } = {
    pending_appraisal: '#ed8936',
    appraised: '#4299e1',
    accepted: '#38b2ac',
    rejected: '#f56565',
    in_stock: '#48bb78',
    sold: '#667eea',
    settled: '#805ad5',
    cancelled: '#a0aec0'
  }
  return colors[status]
}

export const getReputationChangeTypeName = (type: ReputationChangeLog['changeType']): string => {
  const names: { [key in ReputationChangeLog['changeType']]: string } = {
    secondhand_sale: '二手成交',
    appraisal_rejection: '拒绝估价',
    seller_complaint: '卖家投诉',
    buyer_complaint: '买家投诉',
    authenticity_issue: '真伪纠纷',
    fast_settlement: '快速结算',
    positive_review: '好评',
    negative_review: '差评',
    fair_price: '定价公道',
    overpriced: '定价过高',
    consignment_success: '寄售成功'
  }
  return names[type]
}

export const createInitialSecondHandStats = (): SecondHandStats => ({
  totalAppraisals: 0,
  pendingAppraisals: 0,
  acceptedAppraisals: 0,
  rejectedAppraisals: 0,
  totalInventoryItems: 0,
  consignmentItems: 0,
  recycleItems: 0,
  totalSales: 0,
  totalRevenue: 0,
  totalShopProfit: 0,
  totalSellerPayouts: 0,
  avgSaleToAppraisalRatio: 0,
  avgDaysToSell: 0,
  totalReputationImpact: 0,
  positiveReputationChanges: 0,
  negativeReputationChanges: 0,
  trustedSellers: 0,
  activeSellers: 0,
  topSoldGenre: null,
  avgBuyerSatisfaction: 0,
  avgSellerSatisfaction: 0,
  disputeRate: 0
})

export const createInitialSecondHandState = (): SecondHandGameState => ({
  appraisals: [],
  inventory: [],
  sales: [],
  sellerProfiles: [],
  reputationChanges: [],
  stats: createInitialSecondHandStats(),
  appraisalQueueSize: 5,
  nextAppraisalRefresh: 1,
  autoAcceptLowValue: false,
  autoAcceptThreshold: 50,
  defaultConsignmentRate: 0.3,
  defaultRecycleMarkup: 0.5,
  selectedFilter: 'all',
  notifications: []
})

const getRandomSeller = (_day: number, memberProfiles: { level: MemberLevel }[] = []) => {
  const isMember = memberProfiles.length > 0 && Math.random() < 0.3
  const member = isMember ? memberProfiles[Math.floor(Math.random() * memberProfiles.length)] : null
  return {
    name: sellerNames[Math.floor(Math.random() * sellerNames.length)],
    avatar: sellerAvatars[Math.floor(Math.random() * sellerAvatars.length)],
    isMember,
    memberLevel: member?.level || null
  }
}

export const generateAppraisal = (
  day: number,
  _currentLevel: number,
  unlockedGenres: Genre[],
  excludeIds: string[],
  genreMarketHeatMap: Map<Genre, GenreMarketHeat>,
  memberProfiles: { level: MemberLevel }[] = []
): SecondHandAppraisal | null => {
  const candidates = allRecords.filter(r => unlockedGenres.includes(r.genre) && !excludeIds.includes(r.id))
  if (candidates.length === 0) return null

  const record = candidates[Math.floor(Math.random() * candidates.length)]
  const source: SecondHandSource = Math.random() < 0.4 ? 'recycle' : 'consignment'
  const seller = getRandomSeller(day, memberProfiles)
  const heat = getGenreMarketHeat(genreMarketHeatMap, record.genre)

  const conditionVariance = 0.6 + Math.random() * 0.5
  const baseEstimate = record.marketPrice * conditionVariance
  const range = baseEstimate * 0.2

  const hasProvenance = Math.random() < 0.25
  const urgency = Math.random() < 0.15 ? 'high' : (Math.random() < 0.5 ? 'normal' : 'low')
  const authenticityRisk = Math.random() < 0.1 ? 'high' : (Math.random() < 0.3 ? 'medium' : 'low')

  return {
    id: `appr-${day}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recordId: record.id,
    record: JSON.parse(JSON.stringify(record)),
    source,
    sourceName: getSourceLabel(source),
    sellerName: seller.name,
    sellerAvatar: seller.avatar,
    submittedAt: Date.now(),
    conditionDescription: conditionDescriptions[Math.floor(Math.random() * conditionDescriptions.length)],
    photosCount: 2 + Math.floor(Math.random() * 5),
    hasProvenance,
    provenanceNote: hasProvenance ? provenanceNotes[Math.floor(Math.random() * provenanceNotes.length)] : undefined,
    estimatedMinPrice: Math.max(30, Math.floor(baseEstimate - range)),
    estimatedMaxPrice: Math.floor(baseEstimate + range),
    finalAppraisalValue: null,
    appraisalQuality: null,
    appraisalNote: null,
    appraisedAt: null,
    status: 'pending_appraisal',
    isMember: seller.isMember,
    memberLevel: seller.memberLevel,
    urgency,
    authenticityRisk,
    marketHeatBonus: heat.priceModifier - 1,
    reputationImpact: null
  }
}

export const generateDailyAppraisals = (
  day: number,
  currentLevel: number,
  unlockedGenres: Genre[],
  excludeIds: string[],
  genreMarketHeatMap: Map<Genre, GenreMarketHeat>,
  count: number = 3,
  memberProfiles: { level: MemberLevel }[] = []
): SecondHandAppraisal[] => {
  const results: SecondHandAppraisal[] = []
  const usedIds = [...excludeIds]

  for (let i = 0; i < count; i++) {
    const appraisal = generateAppraisal(day, currentLevel, unlockedGenres, usedIds, genreMarketHeatMap, memberProfiles)
    if (appraisal) {
      results.push(appraisal)
      usedIds.push(appraisal.recordId)
    }
  }

  return results
}

export const calculateAppraisalQuality = (conditionScore: number): AppraisalQuality => {
  if (conditionScore >= 90) return 'perfect'
  if (conditionScore >= 75) return 'excellent'
  if (conditionScore >= 55) return 'good'
  if (conditionScore >= 35) return 'fair'
  return 'poor'
}

export const getAppraisalNote = (quality: AppraisalQuality): string => {
  const notes = appraisalNotes[quality]
  return notes[Math.floor(Math.random() * notes.length)]
}

export const performAppraisal = (
  appraisal: SecondHandAppraisal,
  conditionScore: number,
  shopReputation: number
): {
  quality: AppraisalQuality
  finalValue: number
  note: string
  suggestedRecyclePrice: number
  suggestedConsignmentPrice: number
  reputationImpact: number
} => {
  const quality = calculateAppraisalQuality(conditionScore)
  const note = getAppraisalNote(quality)

  const qualityMultiplier = {
    poor: 0.35,
    fair: 0.55,
    good: 0.75,
    excellent: 0.9,
    perfect: 1.05
  }[quality]

  const reputationAdjustment = 1 + (shopReputation / 200)
  const baseValue = appraisal.record.marketPrice * qualityMultiplier * reputationAdjustment
  const heatAdjustment = 1 + appraisal.marketHeatBonus
  const finalValue = Math.floor(baseValue * heatAdjustment)

  const suggestedRecyclePrice = Math.floor(finalValue * 0.6)
  const suggestedConsignmentPrice = finalValue

  let reputationImpact = 0
  if (quality === 'perfect') reputationImpact = 2
  else if (quality === 'excellent') reputationImpact = 1
  else if (quality === 'poor') reputationImpact = -1

  return {
    quality,
    finalValue,
    note,
    suggestedRecyclePrice,
    suggestedConsignmentPrice,
    reputationImpact
  }
}

export const acceptAppraisal = (
  appraisal: SecondHandAppraisal,
  finalAppraisalValue: number,
  quality: AppraisalQuality,
  appraisalNote: string,
  negotiatedPrice: number,
  currentDay: number,
  defaultConsignmentRate: number,
  conditionScore: number
): {
  inventoryItem: SecondHandInventoryItem
  updatedAppraisal: SecondHandAppraisal
  reputationChange: ReputationChangeLog | null
} => {
  const updatedAppraisal: SecondHandAppraisal = {
    ...appraisal,
    status: appraisal.source === 'recycle' ? 'accepted' : 'accepted',
    finalAppraisalValue,
    appraisalQuality: quality,
    appraisalNote,
    appraisedAt: Date.now(),
    reputationImpact: appraisal.reputationImpact || 0
  }

  const isConsignment = appraisal.source === 'consignment'
  const actualCostPrice = isConsignment ? 0 : negotiatedPrice

  let consignmentTerms: ConsignmentTerms | null = null
  let listedPrice: number

  if (isConsignment) {
    const commissionRate = appraisal.memberLevel === 'Diamond' ? 0.2 :
                            appraisal.memberLevel === 'Platinum' ? 0.22 :
                            appraisal.memberLevel === 'Gold' ? 0.25 :
                            appraisal.memberLevel === 'Silver' ? 0.27 : defaultConsignmentRate
    const sellerPayoutRate = 1 - commissionRate
    listedPrice = Math.floor(finalAppraisalValue * (1 + commissionRate * 0.3))
    consignmentTerms = {
      shopCommissionRate: commissionRate,
      sellerPayoutRate,
      basePrice: listedPrice,
      minPrice: Math.floor(finalAppraisalValue * 0.7),
      maxPrice: Math.floor(finalAppraisalValue * 1.3),
      durationDays: 30,
      startDay: currentDay,
      endDay: currentDay + 30,
      priceReductionSchedule: [
        { day: currentDay + 10, discountRate: 0.1 },
        { day: currentDay + 20, discountRate: 0.2 }
      ],
      settlementMethod: appraisal.memberLevel === 'Gold' || appraisal.memberLevel === 'Platinum' || appraisal.memberLevel === 'Diamond' ? 'immediate' : 'weekly',
      autoPriceAdjust: true
    }
  } else {
    listedPrice = Math.floor(negotiatedPrice * 1.4)
  }

  const inventoryItem: SecondHandInventoryItem = {
    id: `sh-inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appraisalId: appraisal.id,
    record: appraisal.record,
    source: appraisal.source,
    sourceName: appraisal.sourceName,
    sellerName: appraisal.sellerName,
    sellerAvatar: appraisal.sellerAvatar,
    acquiredAt: Date.now(),
    actualCostPrice,
    conditionScore,
    listedPrice,
    currentPrice: listedPrice,
    consignmentTerms,
    isConsignment,
    daysInStock: 0,
    viewCount: 0,
    inquiryCount: 0,
    isPromoted: false,
    status: 'in_stock',
    qualityTag: quality,
    authenticityGuaranteed: appraisal.authenticityRisk === 'low' || appraisal.hasProvenance,
    hasRepairHistory: false,
    repairNotes: null,
    genreMarketHeatBonus: appraisal.marketHeatBonus
  }

  let reputationChange: ReputationChangeLog | null = null
  if (appraisal.reputationImpact && appraisal.reputationImpact !== 0) {
    reputationChange = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      day: currentDay,
      changeAmount: appraisal.reputationImpact,
      changeType: appraisal.reputationImpact > 0 ? 'positive_review' : 'appraisal_rejection',
      changeTypeName: getReputationChangeTypeName(appraisal.reputationImpact > 0 ? 'positive_review' : 'appraisal_rejection'),
      description: appraisal.reputationImpact > 0
        ? `收购优质唱片《${appraisal.record.title}》，口碑提升`
        : `拒绝了《${appraisal.record.title}》的${appraisal.sourceName}申请`,
      relatedRecordId: appraisal.recordId,
      relatedSaleId: null,
      relatedAppraisalId: appraisal.id,
      sellerName: appraisal.sellerName,
      buyerName: null
    }
  }

  return { inventoryItem, updatedAppraisal, reputationChange }
}

export const rejectAppraisal = (
  appraisal: SecondHandAppraisal,
  reason: string,
  currentDay: number
): {
  updatedAppraisal: SecondHandAppraisal
  reputationChange: ReputationChangeLog | null
} => {
  const updatedAppraisal: SecondHandAppraisal = {
    ...appraisal,
    status: 'rejected',
    appraisalNote: reason,
    appraisedAt: Date.now(),
    reputationImpact: -1
  }

  const reputationChange: ReputationChangeLog = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    day: currentDay,
    changeAmount: appraisal.urgency === 'high' ? -2 : -1,
    changeType: 'appraisal_rejection',
    changeTypeName: getReputationChangeTypeName('appraisal_rejection'),
    description: `拒绝${appraisal.sellerName}的《${appraisal.record.title}》${appraisal.sourceName}申请：${reason}`,
    relatedRecordId: appraisal.recordId,
    relatedSaleId: null,
    relatedAppraisalId: appraisal.id,
    sellerName: appraisal.sellerName,
    buyerName: null
  }

  return { updatedAppraisal, reputationChange }
}

export const createSecondHandSale = (
  inventoryItem: SecondHandInventoryItem,
  finalPrice: number,
  buyerName: string,
  buyerAvatar: string,
  isBuyerMember: boolean,
  buyerMemberLevel: MemberLevel | null,
  currentDay: number,
  wasBargained: boolean,
  bargainingRounds: number,
  _shopReputation: number
): {
  sale: SecondHandSaleRecord
  updatedInventory: SecondHandInventoryItem
  reputationChange: ReputationChangeLog
  sellerPayout: number
  shopProfit: number
} => {
  const discount = inventoryItem.listedPrice - finalPrice
  let shopCommission = 0
  let sellerPayout = 0
  let shopProfit = 0

  if (inventoryItem.isConsignment && inventoryItem.consignmentTerms) {
    shopCommission = Math.floor(finalPrice * inventoryItem.consignmentTerms.shopCommissionRate)
    sellerPayout = finalPrice - shopCommission
    shopProfit = shopCommission
  } else {
    shopProfit = finalPrice - inventoryItem.actualCostPrice
    sellerPayout = 0
  }

  const priceRatio = finalPrice / inventoryItem.listedPrice
  let reputationImpact = 0
  let changeType: ReputationChangeLog['changeType']

  if (wasBargained && bargainingRounds > 3) {
    reputationImpact = -1
    changeType = 'overpriced'
  } else if (priceRatio > 0.95 && priceRatio <= 1.1) {
    reputationImpact = 2
    changeType = 'fair_price'
  } else if (priceRatio > 1.1) {
    reputationImpact = -1
    changeType = 'overpriced'
  } else {
    reputationImpact = 1
    changeType = 'secondhand_sale'
  }

  if (inventoryItem.isConsignment) {
    reputationImpact += 1
    changeType = 'consignment_success'
  }

  const buyerSatisfaction = 60 + Math.floor(Math.random() * 30) + (isBuyerMember ? 5 : 0)
  const sellerSatisfaction = inventoryItem.isConsignment
    ? 55 + Math.floor(Math.random() * 30) + (inventoryItem.daysInStock < 7 ? 10 : 0)
    : 70 + Math.floor(Math.random() * 25)

  const sale: SecondHandSaleRecord = {
    id: `sh-sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inventoryId: inventoryItem.id,
    appraisalId: inventoryItem.appraisalId,
    recordId: inventoryItem.record.id,
    recordTitle: inventoryItem.record.title,
    recordArtist: inventoryItem.record.artist,
    source: inventoryItem.source,
    sourceName: inventoryItem.sourceName,
    sellerName: inventoryItem.sellerName,
    sellerAvatar: inventoryItem.sellerAvatar,
    buyerName,
    buyerAvatar,
    buyerMemberLevel,
    isBuyerMember,
    finalSalePrice: finalPrice,
    originalListedPrice: inventoryItem.listedPrice,
    discountApplied: discount,
    shopCommission,
    sellerPayout,
    shopProfit,
    soldAt: Date.now(),
    soldDay: currentDay,
    buyerSatisfaction,
    sellerSatisfaction,
    bargainingRounds,
    wasBargained,
    paymentMethod: isBuyerMember ? 'member_credit' : (Math.random() < 0.5 ? 'cash' : 'card'),
    settlementStatus: inventoryItem.consignmentTerms?.settlementMethod === 'immediate' ? 'completed' : 'pending',
    settlementDate: inventoryItem.consignmentTerms?.settlementMethod === 'immediate' ? Date.now() : null,
    reputationImpact,
    reviewFromBuyer: null,
    reviewFromSeller: null,
    ratingFromBuyer: null,
    ratingFromSeller: null
  }

  const updatedInventory: SecondHandInventoryItem = {
    ...inventoryItem,
    status: 'sold'
  }

  const reputationChange: ReputationChangeLog = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    day: currentDay,
    changeAmount: reputationImpact,
    changeType,
    changeTypeName: getReputationChangeTypeName(changeType),
    description: `售出二手唱片《${inventoryItem.record.title}》，${inventoryItem.sourceName}方式，成交价¥${finalPrice}`,
    relatedRecordId: inventoryItem.record.id,
    relatedSaleId: sale.id,
    relatedAppraisalId: inventoryItem.appraisalId,
    sellerName: inventoryItem.sellerName,
    buyerName
  }

  return { sale, updatedInventory, reputationChange, sellerPayout, shopProfit }
}

export const updateSecondHandStats = (
  stats: SecondHandStats,
  appraisals: SecondHandAppraisal[],
  inventory: SecondHandInventoryItem[],
  sales: SecondHandSaleRecord[]
): SecondHandStats => {
  const pending = appraisals.filter(a => a.status === 'pending_appraisal').length
  const accepted = appraisals.filter(a => a.status === 'accepted' || a.status === 'in_stock' || a.status === 'sold' || a.status === 'settled').length
  const rejected = appraisals.filter(a => a.status === 'rejected').length

  const consignmentItems = inventory.filter(i => i.isConsignment && i.status === 'in_stock').length
  const recycleItems = inventory.filter(i => !i.isConsignment && i.status === 'in_stock').length

  const totalRevenue = sales.reduce((sum, s) => sum + s.finalSalePrice, 0)
  const totalShopProfit = sales.reduce((sum, s) => sum + s.shopProfit, 0)
  const totalSellerPayouts = sales.reduce((sum, s) => sum + s.sellerPayout, 0)

  const saleToAppraisalRatios = sales.map(s => {
    const appr = appraisals.find(a => a.id === s.appraisalId)
    return appr && appr.finalAppraisalValue ? s.finalSalePrice / appr.finalAppraisalValue : 1
  })
  const avgSaleToAppraisalRatio = saleToAppraisalRatios.length > 0
    ? saleToAppraisalRatios.reduce((a, b) => a + b, 0) / saleToAppraisalRatios.length
    : 0

  const avgDaysToSell = sales.length > 0
    ? sales.reduce((sum) => sum + 7, 0) / sales.length
    : 0

  const positiveChanges = stats.positiveReputationChanges
  const negativeChanges = stats.negativeReputationChanges

  const avgBuyerSatisfaction = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.buyerSatisfaction, 0) / sales.length
    : 0

  const avgSellerSatisfaction = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.sellerSatisfaction, 0) / sales.length
    : 0

  const genreSalesCount = new Map<Genre, number>()
  for (const s of sales) {
    const rec = getRecordById(s.recordId)
    if (rec) {
      genreSalesCount.set(rec.genre, (genreSalesCount.get(rec.genre) || 0) + 1)
    }
  }
  let topSoldGenre: Genre | null = null
  let maxCount = 0
  for (const [genre, count] of genreSalesCount.entries()) {
    if (count > maxCount) {
      maxCount = count
      topSoldGenre = genre
    }
  }

  const disputedCount = sales.filter(s => s.settlementStatus === 'disputed').length
  const disputeRate = sales.length > 0 ? disputedCount / sales.length : 0

  return {
    ...stats,
    totalAppraisals: appraisals.length,
    pendingAppraisals: pending,
    acceptedAppraisals: accepted,
    rejectedAppraisals: rejected,
    totalInventoryItems: inventory.filter(i => i.status === 'in_stock').length,
    consignmentItems,
    recycleItems,
    totalSales: sales.length,
    totalRevenue,
    totalShopProfit,
    totalSellerPayouts,
    avgSaleToAppraisalRatio,
    avgDaysToSell,
    totalReputationImpact: stats.totalReputationImpact,
    positiveReputationChanges: positiveChanges,
    negativeReputationChanges: negativeChanges,
    trustedSellers: stats.trustedSellers,
    activeSellers: stats.activeSellers,
    topSoldGenre,
    avgBuyerSatisfaction,
    avgSellerSatisfaction,
    disputeRate
  }
}

export const getOrCreateSellerProfile = (
  profiles: SecondHandSellerProfile[],
  name: string,
  avatar: string,
  isMember: boolean,
  memberLevel: MemberLevel | null
): { profile: SecondHandSellerProfile; isNew: boolean } => {
  const existing = profiles.find(p => p.name === name)
  if (existing) {
    return { profile: existing, isNew: false }
  }

  const profile: SecondHandSellerProfile = {
    id: `seller-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    avatar,
    totalItemsSubmitted: 0,
    totalItemsAccepted: 0,
    totalItemsSold: 0,
    totalEarnings: 0,
    acceptanceRate: 0,
    avgRating: 0,
    ratingCount: 0,
    isTrustedSeller: false,
    isMember,
    memberLevel,
    firstTransactionDate: null,
    lastTransactionDate: null,
    notes: '',
    preferredGenres: [],
    trustScore: 50,
    disputeCount: 0,
    authenticItemsCount: 0
  }

  return { profile, isNew: true }
}

export const updateSellerProfileOnAccept = (
  profile: SecondHandSellerProfile,
  isAccepted: boolean,
  genre: Genre,
  hasProvenance: boolean,
  timestamp: number
): SecondHandSellerProfile => {
  const updated = { ...profile }
  updated.totalItemsSubmitted += 1
  if (isAccepted) {
    updated.totalItemsAccepted += 1
    updated.trustScore = Math.min(100, updated.trustScore + 2)
    if (!updated.preferredGenres.includes(genre)) {
      updated.preferredGenres.push(genre)
    }
    if (hasProvenance) {
      updated.authenticItemsCount += 1
    }
    if (updated.firstTransactionDate === null) {
      updated.firstTransactionDate = timestamp
    }
    updated.lastTransactionDate = timestamp
  } else {
    updated.trustScore = Math.max(0, updated.trustScore - 1)
  }
  updated.acceptanceRate = updated.totalItemsSubmitted > 0
    ? updated.totalItemsAccepted / updated.totalItemsSubmitted
    : 0
  updated.isTrustedSeller = updated.acceptanceRate >= 0.8 && updated.totalItemsAccepted >= 5
  return updated
}

export const updateSellerProfileOnSale = (
  profile: SecondHandSellerProfile,
  earnings: number,
  rating: number,
  timestamp: number
): SecondHandSellerProfile => {
  const updated = { ...profile }
  updated.totalItemsSold += 1
  updated.totalEarnings += earnings
  updated.ratingCount += 1
  updated.avgRating = ((updated.avgRating * (updated.ratingCount - 1)) + rating) / updated.ratingCount
  updated.trustScore = Math.min(100, updated.trustScore + 3)
  updated.lastTransactionDate = timestamp
  updated.isTrustedSeller = updated.acceptanceRate >= 0.8 && updated.totalItemsAccepted >= 5
  return updated
}

export const addNotification = (
  state: SecondHandGameState,
  message: string,
  type: 'success' | 'warning' | 'error' | 'info'
): SecondHandGameState => {
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
      ...state.notifications
    ].slice(0, 50)
  }
}

export const markNotificationsRead = (state: SecondHandGameState): SecondHandGameState => {
  return {
    ...state,
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  }
}

export const getUnreadNotificationCount = (state: SecondHandGameState): number => {
  return state.notifications.filter(n => !n.read).length
}
