import type { RecordPerformance, SaleRecord, InventoryItem } from '@/types'

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
    const value = item.record.costPrice * item.quantity
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
