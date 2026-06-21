import type {
  Genre,
  GenreMarketHeat,
  Record,
  SupplierInventoryItem,
  RecordPerformance,
  GenrePriceIndex,
  RareRecordFluctuation,
  PurchaseRecommendation,
  MarketInsight,
  MarketCenterSummary,
  PriceIndexTrend,
  InventoryItem
} from '@/types'
import { getHeatLevelInfo, getTrendLabel, getTrendIcon, formatHeatValue } from './marketHeat'
import { getRarityColor as getRarityColorFromEvents } from './events'

const allGenres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']

const getRarityColor = (rarity: number): string => {
  return getRarityColorFromEvents(rarity.toString() as any) || '#a0aec0'
}

const getRarityLabel = (rarity: number): string => {
  const labels: { [key: number]: string } = {
    1: '普通',
    2: '良好',
    3: '稀有',
    4: '珍稀',
    5: '传奇'
  }
  return labels[rarity] || `${rarity}星`
}

const calculatePriceTrend = (
  currentValue: number,
  previousValue: number
): { trend: PriceIndexTrend; strength: number; changePercent: number } => {
  if (previousValue === 0) {
    return { trend: 'stable', strength: 0, changePercent: 0 }
  }
  const changePercent = ((currentValue - previousValue) / previousValue) * 100
  const absChange = Math.abs(changePercent)

  let trend: PriceIndexTrend = 'stable'
  let strength = 0

  if (absChange < 1) {
    trend = 'stable'
    strength = absChange
  } else if (changePercent > 0) {
    trend = 'rising'
    strength = Math.min(1, absChange / 15)
  } else {
    trend = 'falling'
    strength = Math.min(1, absChange / 15)
  }

  return { trend, strength, changePercent }
}

export const calculateGenrePriceIndex = (
  genre: Genre,
  records: Record[],
  marketHeats: Map<Genre, GenreMarketHeat>,
  previousIndex?: number,
  weeklyHistory: number[] = []
): GenrePriceIndex => {
  const genreRecords = records.filter(r => r.genre === genre)
  const marketHeat = marketHeats.get(genre)

  if (genreRecords.length === 0) {
    return {
      genre,
      currentIndex: 100,
      previousIndex: previousIndex || 100,
      changePercent: 0,
      trend: 'stable',
      trendStrength: 0,
      avgMarketPrice: 0,
      avgCostPrice: 0,
      profitMargin: 0,
      volatility: 0.1,
      weeklyHistory: [...weeklyHistory, 100].slice(-7)
    }
  }

  const avgMarketPrice = genreRecords.reduce((sum, r) => sum + r.marketPrice, 0) / genreRecords.length
  const avgCostPrice = genreRecords.reduce((sum, r) => sum + r.costPrice, 0) / genreRecords.length
  const profitMargin = avgMarketPrice > 0 ? ((avgMarketPrice - avgCostPrice) / avgMarketPrice) * 100 : 0

  let baseIndex = 100
  if (marketHeat) {
    baseIndex = 100 * marketHeat.priceModifier
  }

  const heatBonus = marketHeat ? (marketHeat.heatValue - 0.5) * 20 : 0
  const currentIndex = Math.round(baseIndex + heatBonus)

  const previousIndexValue = previousIndex || currentIndex
  const { trend, strength, changePercent } = calculatePriceTrend(currentIndex, previousIndexValue)

  const volatility = weeklyHistory.length > 1
    ? weeklyHistory.reduce((sum, val, i) => {
        if (i === 0) return 0
        return sum + Math.abs(val - weeklyHistory[i - 1])
      }, 0) / (weeklyHistory.length - 1) / 100
    : 0.1

  return {
    genre,
    currentIndex,
    previousIndex: previousIndexValue,
    changePercent: Math.round(changePercent * 10) / 10,
    trend,
    trendStrength: strength,
    avgMarketPrice: Math.round(avgMarketPrice),
    avgCostPrice: Math.round(avgCostPrice),
    profitMargin: Math.round(profitMargin * 10) / 10,
    volatility: Math.round(volatility * 100) / 100,
    weeklyHistory: [...weeklyHistory, currentIndex].slice(-7)
  }
}

export const calculateAllGenrePriceIndices = (
  records: Record[],
  marketHeats: Map<Genre, GenreMarketHeat>,
  previousIndices: Map<Genre, GenrePriceIndex> = new Map()
): Map<Genre, GenrePriceIndex> => {
  const result = new Map<Genre, GenrePriceIndex>()

  for (const genre of allGenres) {
    const prev = previousIndices.get(genre)
    const index = calculateGenrePriceIndex(
      genre,
      records,
      marketHeats,
      prev?.currentIndex,
      prev?.weeklyHistory
    )
    result.set(genre, index)
  }

  return result
}

export const calculateRareRecordFluctuation = (
  record: Record,
  performance: RecordPerformance | undefined,
  marketHeats: Map<Genre, GenreMarketHeat>,
  day: number,
  previousPrice?: number
): RareRecordFluctuation => {
  const marketHeat = marketHeats.get(record.genre)
  const heatModifier = marketHeat?.priceModifier || 1

  const rarityMultiplier = 1 + (record.rarity - 3) * 0.15
  const currentPrice = Math.round(record.marketPrice * heatModifier * rarityMultiplier)
  const prevPrice = previousPrice || record.marketPrice

  const { trend, strength, changePercent } = calculatePriceTrend(currentPrice, prevPrice)

  const baseSalesCount = performance?.totalSold || 0
  const recentSales = baseSalesCount > 0 && performance?.lastSaleDate
    ? (day - performance.lastSaleDate <= 7 ? baseSalesCount : baseSalesCount * 0.5)
    : baseSalesCount

  let demandLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (record.rarity >= 4 && recentSales >= 3) demandLevel = 'critical'
  else if (record.rarity >= 3 && recentSales >= 2) demandLevel = 'high'
  else if (recentSales >= 1) demandLevel = 'medium'

  const volatility = 0.1 + (record.rarity - 1) * 0.08 + (marketHeat?.trendStrength || 0) * 0.1

  const predictedChange = marketHeat?.trend === 'rising' ? 1.05 : marketHeat?.trend === 'falling' ? 0.95 : 1
  const predictedNextPrice = Math.round(currentPrice * predictedChange)

  const collectorInterest = Math.min(100,
    (record.rarity * 15) +
    (recentSales * 10) +
    ((marketHeat?.heatValue || 0.5) * 30)
  )

  const priceHistory = [
    { day: day - 6, price: Math.round(prevPrice * 0.95) },
    { day: day - 5, price: Math.round(prevPrice * 0.97) },
    { day: day - 4, price: Math.round(prevPrice * 0.98) },
    { day: day - 3, price: Math.round(prevPrice * 0.99) },
    { day: day - 2, price: prevPrice },
    { day: day - 1, price: Math.round((prevPrice + currentPrice) / 2) },
    { day, price: currentPrice }
  ]

  return {
    recordId: record.id,
    record,
    currentPrice,
    previousPrice: prevPrice,
    priceChange: currentPrice - prevPrice,
    changePercent: Math.round(changePercent * 10) / 10,
    trend,
    trendStrength: strength,
    rarity: record.rarity,
    demandLevel,
    volatility: Math.round(volatility * 100) / 100,
    lastSaleDate: performance?.lastSaleDate || null,
    totalSalesCount: performance?.totalSold || 0,
    priceHistory,
    collectorInterest: Math.round(collectorInterest),
    predictedNextPrice
  }
}

export const getTopRareFluctuations = (
  records: Record[],
  performances: RecordPerformance[],
  marketHeats: Map<Genre, GenreMarketHeat>,
  day: number,
  previousPrices: Map<string, number> = new Map(),
  limit: number = 5
): RareRecordFluctuation[] => {
  const rareRecords = records.filter(r => r.rarity >= 3)

  return rareRecords
    .map(record => {
      const perf = performances.find(p => p.recordId === record.id)
      const prevPrice = previousPrices.get(record.id)
      return calculateRareRecordFluctuation(record, perf, marketHeats, day, prevPrice)
    })
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, limit)
}

export const generatePurchaseRecommendations = (
  supplierInventory: SupplierInventoryItem[],
  marketHeats: Map<Genre, GenreMarketHeat>,
  currentInventory: InventoryItem[],
  budget: number,
  performances: RecordPerformance[],
  limit: number = 8
): PurchaseRecommendation[] => {
  const inventoryRecordIds = new Set(currentInventory.map(i => i.record.id))

  const recommendations = supplierInventory.map(item => {
    const marketHeat = marketHeats.get(item.record.genre)
    const heatValue = marketHeat?.heatValue || 0.5
    const heatBonus = (heatValue - 0.5) * 20

    const itemMarketPrice = item.record.marketPrice * (item.marketPriceModifier || 1)
    const expectedProfit = itemMarketPrice * (marketHeat?.profitMarginModifier || 1) - item.adjustedCostPrice
    const profitMargin = itemMarketPrice > 0
      ? ((itemMarketPrice - item.adjustedCostPrice) / itemMarketPrice) * 100
      : 0

    const perf = performances.find(p => p.recordId === item.record.id)
    const salesHistory = perf?.totalSold || 0
    const turnoverEstimate = salesHistory > 0 ? Math.max(1, 7 - Math.min(7, perf!.avgDaysInStock)) : 5

    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (profitMargin > 35 && heatValue > 0.6 && item.riskFactor < 0.4) riskLevel = 'low'
    else if (profitMargin < 15 || heatValue < 0.35 || item.riskFactor > 0.7) riskLevel = 'high'

    const rarityBonus = (item.record.rarity - 1) * 10
    const genreHeatBonus = heatBonus
    const isHotPick = heatValue >= 0.75 && profitMargin >= 25
    const isUndervalued = item.adjustedCostPrice < item.record.costPrice * 0.9 ||
      itemMarketPrice > item.record.marketPrice * 1.15

    const priorityScore =
      (profitMargin * 2) +
      genreHeatBonus +
      rarityBonus +
      (turnoverEstimate * 3) -
      (item.riskFactor * 30)

    let reason = ''
    if (isHotPick) reason = '🔥 热门风格 + 高利润空间'
    else if (isUndervalued) reason = '💎 估值偏低，存在套利空间'
    else if (heatValue >= 0.7) reason = '📈 市场热度上升，需求旺盛'
    else if (profitMargin >= 30) reason = '💰 利润空间丰厚'
    else if (item.record.rarity >= 4) reason = '⭐ 稀有度高，收藏价值大'
    else if (turnoverEstimate >= 5) reason = '⚡ 周转快，变现能力强'
    else reason = '📊 综合评分良好'

    return {
      id: `rec-${item.record.id}-${item.supplierId}`,
      record: item.record,
      supplierId: item.supplierId,
      supplierName: item.supplierId,
      adjustedCostPrice: item.adjustedCostPrice,
      marketPrice: Math.round(itemMarketPrice),
      expectedProfit: Math.round(expectedProfit),
      profitMargin: Math.round(profitMargin * 10) / 10,
      riskLevel,
      priorityScore: Math.round(priorityScore),
      demandModifier: marketHeat?.demandModifier || 1,
      marketHeatValue: heatValue,
      marketTrend: marketHeat?.trend || 'stable',
      reason,
      matchWithInventory: inventoryRecordIds.has(item.record.id),
      rarityBonus,
      genreHeatBonus: Math.round(genreHeatBonus * 10) / 10,
      isHotPick,
      isUndervalued,
      turnoverEstimate
    }
  })

  return recommendations
    .filter(r => r.adjustedCostPrice <= budget)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit)
}

export const generateMarketInsights = (
  marketHeats: Map<Genre, GenreMarketHeat>,
  _priceIndices: Map<Genre, GenrePriceIndex>,
  rareFluctuations: RareRecordFluctuation[],
  recommendations: PurchaseRecommendation[],
  day: number
): MarketInsight[] => {
  const insights: MarketInsight[] = []
  const hottestGenres = Array.from(marketHeats.values())
    .sort((a, b) => b.heatValue - a.heatValue)
    .slice(0, 3)
  const coldestGenres = Array.from(marketHeats.values())
    .sort((a, b) => a.heatValue - b.heatValue)
    .slice(0, 2)

  const risingGenres = Array.from(marketHeats.values())
    .filter(h => h.trend === 'rising' && h.trendStrength >= 0.3)
    .sort((a, b) => b.trendStrength - a.trendStrength)

  const fallingGenres = Array.from(marketHeats.values())
    .filter(h => h.trend === 'falling' && h.trendStrength >= 0.3)
    .sort((a, b) => b.trendStrength - a.trendStrength)

  if (risingGenres.length > 0) {
    risingGenres.slice(0, 2).forEach(genre => {
      insights.push({
        id: `insight-rise-${genre.genre}-${day}`,
        category: 'opportunity',
        priority: genre.trendStrength > 0.6 ? 'high' : 'medium',
        title: `${genre.genre} 热度上升中`,
        description: `${genre.genre}风格热度持续上升，当前热度${formatHeatValue(genre.heatValue)}，价格可能继续上涨。`,
        icon: '📈',
        genre: genre.genre,
        action: '建议优先采购该风格唱片',
        impactDescription: `需求×${genre.demandModifier.toFixed(2)}，售价×${genre.priceModifier.toFixed(2)}`
      })
    })
  }

  if (fallingGenres.length > 0) {
    fallingGenres.slice(0, 1).forEach(genre => {
      insights.push({
        id: `insight-fall-${genre.genre}-${day}`,
        category: 'warning',
        priority: genre.trendStrength > 0.6 ? 'high' : 'medium',
        title: `${genre.genre} 热度下降`,
        description: `${genre.genre}风格热度正在下降，当前热度${formatHeatValue(genre.heatValue)}，需谨慎进货。`,
        icon: '📉',
        genre: genre.genre,
        action: '减少采购，优先清理库存',
        impactDescription: `需求×${genre.demandModifier.toFixed(2)}，售价×${genre.priceModifier.toFixed(2)}`
      })
    })
  }

  const hotPicks = recommendations.filter(r => r.isHotPick)
  if (hotPicks.length > 0) {
    insights.push({
      id: `insight-hotpick-${day}`,
      category: 'opportunity',
      priority: 'high',
      title: `${hotPicks.length}个热门采购机会`,
      description: `发现${hotPicks.length}个高热度、高利润的采购机会，建议优先考虑。`,
      icon: '🔥',
      action: '查看采购推荐详情',
      impactDescription: `平均利润率 ${(hotPicks.reduce((s, r) => s + r.profitMargin, 0) / hotPicks.length).toFixed(1)}%`
    })
  }

  const undervalued = recommendations.filter(r => r.isUndervalued)
  if (undervalued.length > 0) {
    insights.push({
      id: `insight-undervalued-${day}`,
      category: 'opportunity',
      priority: 'medium',
      title: '发现低估唱片',
      description: `${undervalued.length}张唱片当前价格低于估值，存在套利空间。`,
      icon: '💎',
      action: '抓住低价买入机会',
      impactDescription: '适合长期持有或快速转手'
    })
  }

  const volatileRares = rareFluctuations.filter(r => r.volatility > 0.3)
  if (volatileRares.length > 0) {
    insights.push({
      id: `insight-volatile-${day}`,
      category: 'warning',
      priority: 'medium',
      title: '稀有唱片价格波动剧烈',
      description: `${volatileRares.length}张稀有唱片价格波动较大，交易需谨慎。`,
      icon: '⚠️',
      action: '关注价格走势，把握交易时机',
      impactDescription: `波动率最高 ${(Math.max(...volatileRares.map(r => r.volatility)) * 100).toFixed(0)}%`
    })
  }

  const highDemandRares = rareFluctuations.filter(r => r.demandLevel === 'critical' || r.demandLevel === 'high')
  if (highDemandRares.length > 0) {
    insights.push({
      id: `insight-demand-${day}`,
      category: 'trend',
      priority: 'medium',
      title: '稀有唱片需求旺盛',
      description: `${highDemandRares.length}张高稀有度唱片当前市场需求极高。`,
      icon: '⭐',
      action: '如有库存可考虑适时出手',
      impactDescription: `收藏家兴趣度 ${Math.round(highDemandRares.reduce((s, r) => s + r.collectorInterest, 0) / highDemandRares.length)}%`
    })
  }

  if (hottestGenres.length >= 3) {
    insights.push({
      id: `insight-top3-${day}`,
      category: 'trend',
      priority: 'low',
      title: '今日热门风格',
      description: `当前最热门的三种风格是 ${hottestGenres[0].genre}、${hottestGenres[1].genre}、${hottestGenres[2].genre}。`,
      icon: '🏆',
      impactDescription: `建议重点关注这些风格的采购和陈列`
    })
  }

  if (coldestGenres.length > 0) {
    insights.push({
      id: `insight-cold-${day}`,
      category: 'tip',
      priority: 'low',
      title: '冷门风格提示',
      description: `${coldestGenres.map(g => g.genre).join('、')} 当前热度较低，可考虑低价抄底。`,
      icon: '🧊',
      action: '长期投资者可考虑逢低吸入',
      impactDescription: '反周期操作可能带来超额收益'
    })
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export const calculateMarketCenterSummary = (
  marketHeats: Map<Genre, GenreMarketHeat>,
  priceIndices: Map<Genre, GenrePriceIndex>,
  rareFluctuations: RareRecordFluctuation[],
  recommendations: PurchaseRecommendation[],
  insights: MarketInsight[],
  performances: RecordPerformance[]
): MarketCenterSummary => {
  const heatArray = Array.from(marketHeats.values())
  const hottest = heatArray.sort((a, b) => b.heatValue - a.heatValue)[0]
  const coldest = heatArray.sort((a, b) => a.heatValue - b.heatValue)[0]

  const priceIndexArray = Array.from(priceIndices.values())
  const overallMarketIndex = priceIndexArray.length > 0
    ? Math.round(priceIndexArray.reduce((s, p) => s + p.currentIndex, 0) / priceIndexArray.length)
    : 100
  const overallPriceChange = priceIndexArray.length > 0
    ? Math.round(priceIndexArray.reduce((s, p) => s + p.changePercent, 0) / priceIndexArray.length * 10) / 10
    : 0

  const rareRecords = rareFluctuations.filter(r => r.rarity >= 4)
  const rareRecordIndex = rareRecords.length > 0
    ? Math.round(rareRecords.reduce((s, r) => s + r.currentPrice, 0) / rareRecords.length)
    : 0
  const rareRecordPriceChange = rareRecords.length > 0
    ? Math.round(rareRecords.reduce((s, r) => s + r.changePercent, 0) / rareRecords.length * 10) / 10
    : 0

  const salesByRarity: { [key: number]: number } = {}
  performances.forEach(p => {
    const rarity = 1
    salesByRarity[rarity] = (salesByRarity[rarity] || 0) + p.totalSold
  })
  const sortedSales = Object.entries(salesByRarity).sort((a, b) => b[1] - a[1])
  const bestSellingRarity = sortedSales.length > 0 ? parseInt(sortedSales[0][0]) : 3

  const avgProfitMargin = recommendations.length > 0
    ? Math.round(recommendations.reduce((s, r) => s + r.profitMargin, 0) / recommendations.length * 10) / 10
    : 0

  const topOpportunities = recommendations
    .filter(r => r.riskLevel === 'low' || r.isHotPick)
    .slice(0, 3)

  return {
    hottestGenre: hottest?.genre || 'Jazz',
    coldestGenre: coldest?.genre || 'Classical',
    overallMarketIndex,
    overallPriceChange,
    rareRecordIndex,
    rareRecordPriceChange,
    bestSellingRarity,
    avgProfitMargin,
    topOpportunities,
    marketInsights: insights.slice(0, 4)
  }
}

export const getTrendColor = (trend: PriceIndexTrend): string => {
  const colors = {
    rising: '#48bb78',
    stable: '#a0aec0',
    falling: '#fc8181'
  }
  return colors[trend]
}

export const getTrendArrow = (trend: PriceIndexTrend): string => {
  const arrows = {
    rising: '↑',
    stable: '→',
    falling: '↓'
  }
  return arrows[trend]
}

export const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: '#48bb78',
    medium: '#f6ad55',
    high: '#fc8181'
  }
  return colors[risk]
}

export const getRiskLabel = (risk: 'low' | 'medium' | 'high'): string => {
  const labels = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return labels[risk]
}

export const getDemandLabel = (demand: 'low' | 'medium' | 'high' | 'critical'): string => {
  const labels = {
    low: '需求低迷',
    medium: '需求平稳',
    high: '需求旺盛',
    critical: '极度稀缺'
  }
  return labels[demand]
}

export const getDemandColor = (demand: 'low' | 'medium' | 'high' | 'critical'): string => {
  const colors = {
    low: '#a0aec0',
    medium: '#f6ad55',
    high: '#f687b3',
    critical: '#fc8181'
  }
  return colors[demand]
}

export const getInsightCategoryColor = (category: 'opportunity' | 'warning' | 'trend' | 'tip'): string => {
  const colors = {
    opportunity: '#48bb78',
    warning: '#fc8181',
    trend: '#667eea',
    tip: '#f6ad55'
  }
  return colors[category]
}

export const getInsightCategoryLabel = (category: 'opportunity' | 'warning' | 'trend' | 'tip'): string => {
  const labels = {
    opportunity: '机会',
    warning: '警示',
    trend: '趋势',
    tip: '小贴士'
  }
  return labels[category]
}

export {
  getRarityColor,
  getRarityLabel,
  getTrendLabel,
  getTrendIcon,
  formatHeatValue,
  getHeatLevelInfo
}
