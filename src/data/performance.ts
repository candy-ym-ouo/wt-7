import type { RecordPerformance, SaleRecord, InventoryItem, OverstockStatus, OverstockInfo, OverstockConfig } from '@/types'

export const createEmptyPerformance = (recordId: string): RecordPerformance => ({
  recordId,
  totalSold: 0,
  totalRevenue: 0,
  totalProfit: 0,
  avgDaysInStock: 0,
  sellThroughRate: 0,
  customerSatisfaction: 0,
  lastSaleDate: null
})

export const updatePerformanceAfterSale = (
  performances: RecordPerformance[],
  sale: SaleRecord,
  daysInStock: number,
  currentDay: number
): RecordPerformance[] => {
  const existingIndex = performances.findIndex(p => p.recordId === sale.recordId)
  let performance: RecordPerformance
  
  if (existingIndex >= 0) {
    performance = { ...performances[existingIndex] }
  } else {
    performance = createEmptyPerformance(sale.recordId)
  }
  
  const newTotalSold = performance.totalSold + 1
  const newTotalRevenue = performance.totalRevenue + sale.salePrice
  const newTotalProfit = performance.totalProfit + sale.profit
  
  const newAvgDaysInStock = 
    (performance.avgDaysInStock * performance.totalSold + daysInStock) / newTotalSold
  
  const newSatisfaction = 
    (performance.customerSatisfaction * performance.totalSold + sale.customerSatisfaction) / newTotalSold
  
  performance = {
    ...performance,
    totalSold: newTotalSold,
    totalRevenue: newTotalRevenue,
    totalProfit: newTotalProfit,
    avgDaysInStock: newAvgDaysInStock,
    customerSatisfaction: newSatisfaction,
    lastSaleDate: currentDay
  }
  
  const updated = [...performances]
  if (existingIndex >= 0) {
    updated[existingIndex] = performance
  } else {
    updated.push(performance)
  }
  
  return updated
}

export const updateSellThroughRates = (
  performances: RecordPerformance[],
  inventory: InventoryItem[],
  totalInventoryPurchased: Map<string, number>
): RecordPerformance[] => {
  return performances.map(perf => {
    const totalPurchased = totalInventoryPurchased.get(perf.recordId) || perf.totalSold
    const invItem = inventory.find(i => i.record.id === perf.recordId)
    const currentStock = invItem ? invItem.quantity : 0
    const totalEverStocked = totalPurchased + perf.totalSold - currentStock
    
    const sellThroughRate = totalEverStocked > 0 
      ? perf.totalSold / Math.max(1, totalEverStocked) 
      : 0
    
    return {
      ...perf,
      sellThroughRate: Math.min(1, sellThroughRate)
    }
  })
}

export const getRecordPerformance = (
  performances: RecordPerformance[],
  recordId: string
): RecordPerformance | undefined => {
  return performances.find(p => p.recordId === recordId)
}

export const getTopPerformingRecords = (
  performances: RecordPerformance[],
  limit: number = 5
): RecordPerformance[] => {
  return [...performances]
    .sort((a, b) => {
      const scoreA = a.totalProfit + a.sellThroughRate * 1000
      const scoreB = b.totalProfit + b.sellThroughRate * 1000
      return scoreB - scoreA
    })
    .slice(0, limit)
}

export const getWorstPerformingRecords = (
  performances: RecordPerformance[],
  limit: number = 5
): RecordPerformance[] => {
  return [...performances]
    .filter(p => p.totalSold > 0)
    .sort((a, b) => {
      const scoreA = a.totalProfit + a.sellThroughRate * 1000
      const scoreB = b.totalProfit + b.sellThroughRate * 1000
      return scoreA - scoreB
    })
    .slice(0, limit)
}

export const getGenrePerformanceSummary = (
  performances: RecordPerformance[],
  records: { id: string; genre: string }[]
): { genre: string; totalSold: number; totalProfit: number; avgSatisfaction: number }[] => {
  const genreMap = new Map<string, { totalSold: number; totalProfit: number; totalSatisfaction: number; count: number }>()
  
  performances.forEach(perf => {
    const record = records.find(r => r.id === perf.recordId)
    if (!record) return
    
    const existing = genreMap.get(record.genre) || { totalSold: 0, totalProfit: 0, totalSatisfaction: 0, count: 0 }
    genreMap.set(record.genre, {
      totalSold: existing.totalSold + perf.totalSold,
      totalProfit: existing.totalProfit + perf.totalProfit,
      totalSatisfaction: existing.totalSatisfaction + perf.customerSatisfaction,
      count: existing.count + 1
    })
  })
  
  return Array.from(genreMap.entries()).map(([genre, data]) => ({
    genre,
    totalSold: data.totalSold,
    totalProfit: data.totalProfit,
    avgSatisfaction: data.count > 0 ? data.totalSatisfaction / data.count : 0
  }))
}

export const calculateInventoryRiskScore = (
  inventory: InventoryItem[],
  performances: RecordPerformance[],
  currentDay: number
): number => {
  if (inventory.length === 0) return 0
  
  let totalRisk = 0
  let totalValue = 0
  
  inventory.forEach(item => {
    const perf = performances.find(p => p.recordId === item.record.id)
    const value = item.actualCostPrice * item.quantity
    totalValue += value
    
    let risk = 0.3
    
    if (perf) {
      if (perf.sellThroughRate < 0.2) {
        risk = 0.8
      } else if (perf.sellThroughRate < 0.4) {
        risk = 0.6
      } else if (perf.sellThroughRate < 0.6) {
        risk = 0.4
      } else {
        risk = 0.2
      }
      
      if (perf.lastSaleDate && currentDay - perf.lastSaleDate > 7) {
        risk += 0.2
      }
    }
    
    if (item.conditionScore < 60) {
      risk += 0.15
    }
    
    if (item.record.rarity >= 4) {
      risk += 0.1
    }
    
    totalRisk += Math.min(1, risk) * value
  })
  
  return totalValue > 0 ? totalRisk / totalValue : 0
}

export const getOverstockStatus = (
  daysInStock: number,
  sellThroughRate: number,
  config: OverstockConfig
): OverstockStatus => {
  if (daysInStock >= config.deadstockThresholdDays && sellThroughRate < config.overstockedSellThroughThreshold) {
    return 'deadstock'
  }
  if (daysInStock >= config.overstockedThresholdDays && sellThroughRate < config.slowSellThroughThreshold) {
    return 'overstocked'
  }
  if (daysInStock >= config.slowThresholdDays && sellThroughRate < config.slowSellThroughThreshold) {
    return 'slow'
  }
  return 'normal'
}

export const calculateOverstockDailyPenalty = (
  item: InventoryItem,
  daysInStock: number,
  sellThroughRate: number,
  config: OverstockConfig
): number => {
  const status = getOverstockStatus(daysInStock, sellThroughRate, config)
  const inventoryValue = item.actualCostPrice * item.quantity

  switch (status) {
    case 'deadstock':
      return Math.floor(inventoryValue * config.deadstockDailyPenaltyRate)
    case 'overstocked':
      return Math.floor(inventoryValue * config.overstockedDailyPenaltyRate)
    case 'slow':
      return Math.floor(inventoryValue * config.slowDailyPenaltyRate)
    default:
      return 0
  }
}

export const calculateSuggestedDiscount = (
  status: OverstockStatus,
  marketPrice: number,
  costPrice: number,
  config: OverstockConfig
): { discountRate: number; discountedPrice: number } => {
  if (status === 'normal') {
    return { discountRate: 0, discountedPrice: marketPrice }
  }

  let discountRate = 0
  switch (status) {
    case 'slow':
      discountRate = config.discountStep
      break
    case 'overstocked':
      discountRate = config.discountStep * 2
      break
    case 'deadstock':
      discountRate = config.discountStep * 3
      break
  }

  discountRate = Math.min(discountRate, config.maxDiscountRate)
  const discountedPrice = Math.max(costPrice, Math.floor(marketPrice * (1 - discountRate)))

  return { discountRate, discountedPrice }
}

export const calculateDisplayPriorityBoost = (status: OverstockStatus): number => {
  switch (status) {
    case 'deadstock':
      return 25
    case 'overstocked':
      return 15
    case 'slow':
      return 8
    default:
      return 0
  }
}

export const calculateOverstockInfo = (
  item: InventoryItem,
  performances: RecordPerformance[],
  currentDay: number,
  displayedRecordIds: Set<string>,
  config: OverstockConfig,
  accumulatedPenalties: Map<string, number>
): OverstockInfo => {
  const daysInStock = currentDay - item.purchaseDate
  const perf = performances.find(p => p.recordId === item.record.id)
  const sellThroughRate = perf?.sellThroughRate ?? 0

  const status = getOverstockStatus(daysInStock, sellThroughRate, config)
  const dailyPenalty = calculateOverstockDailyPenalty(item, daysInStock, sellThroughRate, config)
  const totalPenaltyAccumulated = accumulatedPenalties.get(item.record.id) || 0
  const { discountRate, discountedPrice } = calculateSuggestedDiscount(
    status,
    item.record.marketPrice,
    item.actualCostPrice,
    config
  )
  const isInDisplay = displayedRecordIds.has(item.record.id)
  const displayPriorityBoost = isInDisplay ? 0 : calculateDisplayPriorityBoost(status)

  return {
    recordId: item.record.id,
    status,
    daysInStock,
    sellThroughRate,
    dailyPenalty,
    totalPenaltyAccumulated,
    suggestedDiscount: discountRate,
    discountedSellPrice: discountedPrice,
    isInDisplay,
    displayPriorityBoost
  }
}

export const calculateTotalDailyPenalty = (
  inventory: InventoryItem[],
  performances: RecordPerformance[],
  currentDay: number,
  config: OverstockConfig
): { totalPenalty: number; items: { recordId: string; penalty: number; status: OverstockStatus }[] } => {
  let totalPenalty = 0
  const items: { recordId: string; penalty: number; status: OverstockStatus }[] = []

  for (const item of inventory) {
    if (item.quantity <= 0) continue

    const daysInStock = currentDay - item.purchaseDate
    const perf = performances.find(p => p.recordId === item.record.id)
    const sellThroughRate = perf?.sellThroughRate ?? 0
    const status = getOverstockStatus(daysInStock, sellThroughRate, config)

    if (status !== 'normal') {
      const penalty = calculateOverstockDailyPenalty(item, daysInStock, sellThroughRate, config)
      if (penalty > 0) {
        totalPenalty += penalty
        items.push({ recordId: item.record.id, penalty, status })
      }
    }
  }

  return { totalPenalty, items }
}

export const generateOverstockWarnings = (
  overstockInfos: OverstockInfo[]
): { recordId: string; message: string; priority: 'high' | 'medium' | 'low' }[] => {
  const warnings: { recordId: string; message: string; priority: 'high' | 'medium' | 'low' }[] = []

  for (const info of overstockInfos) {
    if (info.status === 'deadstock') {
      warnings.push({
        recordId: info.recordId,
        message: `严重积压！已滞销${info.daysInStock}天，每日扣罚¥${info.dailyPenalty}，建议立即折价出售（折扣${Math.round(info.suggestedDiscount * 100)}%）`,
        priority: 'high'
      })
    } else if (info.status === 'overstocked') {
      warnings.push({
        recordId: info.recordId,
        message: `库存积压，已滞销${info.daysInStock}天，每日扣罚¥${info.dailyPenalty}，建议折价清仓或优先陈列`,
        priority: 'high'
      })
    } else if (info.status === 'slow') {
      warnings.push({
        recordId: info.recordId,
        message: `周转缓慢，已入库${info.daysInStock}天，建议优先陈列提升曝光`,
        priority: 'medium'
      })
    }
  }

  return warnings.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

export const generatePurchaseRiskWarning = (
  _recordId: string,
  currentStock: number,
  sellThroughRate: number,
  existingOverstockStatus: OverstockStatus | null
): { shouldWarn: boolean; message: string } => {
  if (existingOverstockStatus === 'deadstock') {
    return {
      shouldWarn: true,
      message: '⚠️ 该唱片已严重积压，继续进货将加重每日惩罚！'
    }
  }
  if (existingOverstockStatus === 'overstocked') {
    return {
      shouldWarn: true,
      message: '⚠️ 该唱片库存积压中，继续进货可能增加滞销风险！'
    }
  }
  if (existingOverstockStatus === 'slow' && currentStock >= 3) {
    return {
      shouldWarn: true,
      message: '⚠️ 该唱片周转缓慢且库存充足，建议谨慎进货！'
    }
  }
  if (sellThroughRate > 0 && sellThroughRate < 0.3 && currentStock >= 2) {
    return {
      shouldWarn: true,
      message: '⚠️ 该唱片售罄率较低，库存已有一定积压风险！'
    }
  }
  return { shouldWarn: false, message: '' }
}

export const generatePurchaseRecommendation = (
  performances: RecordPerformance[],
  currentInventory: InventoryItem[],
  _budget: number
): { recordId: string; reason: string; priority: 'high' | 'medium' | 'low' }[] => {
  const recommendations: { recordId: string; reason: string; priority: 'high' | 'medium' | 'low' }[] = []
  
  performances.forEach(perf => {
    const inInventory = currentInventory.find(i => i.record.id === perf.recordId)
    const inStock = inInventory ? inInventory.quantity : 0
    
    if (perf.sellThroughRate > 0.7 && inStock < 2) {
      recommendations.push({
        recordId: perf.recordId,
        reason: `热销商品，售罄率${Math.round(perf.sellThroughRate * 100)}%，建议补货`,
        priority: 'high'
      })
    } else if (perf.totalProfit > 500 && perf.sellThroughRate > 0.5 && inStock < 3) {
      recommendations.push({
        recordId: perf.recordId,
        reason: `高利润商品，累计利润¥${perf.totalProfit}，建议增加库存`,
        priority: 'high'
      })
    } else if (perf.sellThroughRate > 0.4 && inStock < 1) {
      recommendations.push({
        recordId: perf.recordId,
        reason: `表现良好，售罄率${Math.round(perf.sellThroughRate * 100)}%，可考虑补货`,
        priority: 'medium'
      })
    } else if (perf.sellThroughRate < 0.2 && inStock > 2) {
      recommendations.push({
        recordId: perf.recordId,
        reason: `滞销商品，售罄率仅${Math.round(perf.sellThroughRate * 100)}%，建议暂停补货`,
        priority: 'low'
      })
    }
  })
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
