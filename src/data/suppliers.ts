import type { Supplier, SupplierType, Genre, Record, RecordPerformance, SupplierInventoryItem } from '@/types'
import { allRecords } from './records'
import { getConditionScoreFromLabel } from './condition'

export const suppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: '太平洋唱片批发',
    type: 'wholesaler',
    icon: '📦',
    description: '大型批发商，货源充足价格实惠，但稀有唱片较少。适合走量销售。',
    reputation: 75,
    priceModifier: 0.85,
    rarityDistribution: [35, 35, 20, 8, 2],
    genreFocus: ['Jazz', 'Rock', 'Pop', 'Soul'],
    stockRiskModifier: 0.7,
    deliveryDays: 1,
    minOrderAmount: 200,
    specialOfferChance: 0.1
  },
  {
    id: 'sup-002',
    name: '爵士殿堂',
    type: 'specialist',
    icon: '🎷',
    description: '爵士音乐专家店，拥有丰富的爵士和蓝调唱片，品质有保障。',
    reputation: 88,
    priceModifier: 1.0,
    rarityDistribution: [15, 25, 30, 20, 10],
    genreFocus: ['Jazz', 'Blues', 'Classical'],
    stockRiskModifier: 0.85,
    deliveryDays: 2,
    minOrderAmount: 300,
    specialOfferChance: 0.15
  },
  {
    id: 'sup-003',
    name: '老唱片收藏家',
    type: 'collector',
    icon: '🏛️',
    description: '资深收藏家出让私人珍藏，稀有极品层出不穷，但价格不菲。',
    reputation: 92,
    priceModifier: 1.3,
    rarityDistribution: [5, 10, 25, 30, 30],
    genreFocus: ['Jazz', 'Rock', 'Folk', 'Classical'],
    stockRiskModifier: 1.2,
    deliveryDays: 3,
    minOrderAmount: 500,
    specialOfferChance: 0.2
  },
  {
    id: 'sup-004',
    name: '环球进口唱片行',
    type: 'importer',
    icon: '🌍',
    description: '专营海外进口唱片，电子、迪斯科、放克等品类丰富。',
    reputation: 82,
    priceModifier: 1.15,
    rarityDistribution: [10, 20, 30, 25, 15],
    genreFocus: ['Electronic', 'Disco', 'Funk', 'Soul', 'Rock'],
    stockRiskModifier: 1.0,
    deliveryDays: 3,
    minOrderAmount: 400,
    specialOfferChance: 0.12
  },
  {
    id: 'sup-005',
    name: '折扣唱片仓',
    type: 'discount',
    icon: '💰',
    description: '清仓折扣店，价格极其优惠，但品相参差不齐，需谨慎挑选。',
    reputation: 60,
    priceModifier: 0.7,
    rarityDistribution: [40, 30, 15, 10, 5],
    genreFocus: ['Pop', 'Rock', 'Disco', 'Funk'],
    stockRiskModifier: 1.4,
    deliveryDays: 1,
    minOrderAmount: 150,
    specialOfferChance: 0.25
  }
]

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(s => s.id === id)
}

export const getSuppliersByType = (type: SupplierType): Supplier[] => {
  return suppliers.filter(s => s.type === type)
}

export const getSupplierName = (type: SupplierType): string => {
  const names: { [key in SupplierType]: string } = {
    wholesaler: '大型批发商',
    specialist: '专营店',
    collector: '收藏家',
    importer: '进口商',
    discount: '折扣店'
  }
  return names[type]
}

export const getSupplierTypeColor = (type: SupplierType): string => {
  const colors: { [key in SupplierType]: string } = {
    wholesaler: '#3182ce',
    specialist: '#805ad5',
    collector: '#d69e2e',
    importer: '#38b2ac',
    discount: '#e53e3e'
  }
  return colors[type]
}

const calculateStockRisk = (
  record: Record,
  supplier: Supplier,
  performances: RecordPerformance[]
): { risk: 'low' | 'medium' | 'high'; factor: number } => {
  const performance = performances.find(p => p.recordId === record.id)
  
  let baseRisk = 0.3
  const rarityRisk = (record.rarity - 1) * 0.12
  const conditionScore = getConditionScoreFromLabel(record.condition)
  const conditionRisk = (100 - conditionScore) / 200
  
  let performanceRisk = 0
  if (performance) {
    if (performance.sellThroughRate < 0.3) {
      performanceRisk = 0.25
    } else if (performance.sellThroughRate < 0.6) {
      performanceRisk = 0.1
    } else {
      performanceRisk = -0.1
    }
  }
  
  const genreRisk = supplier.genreFocus.includes(record.genre) ? -0.1 : 0.15
  
  const totalRisk = Math.max(0, Math.min(1, 
    (baseRisk + rarityRisk + conditionRisk + performanceRisk + genreRisk) * supplier.stockRiskModifier
  ))
  
  if (totalRisk < 0.4) return { risk: 'low', factor: totalRisk }
  if (totalRisk < 0.7) return { risk: 'medium', factor: totalRisk }
  return { risk: 'high', factor: totalRisk }
}

const calculateExpectedTurnoverRate = (
  record: Record,
  performances: RecordPerformance[]
): number => {
  const performance = performances.find(p => p.recordId === record.id)
  
  if (performance && performance.totalSold > 0) {
    return Math.min(1, performance.sellThroughRate)
  }
  
  const baseRate = 0.4
  const rarityModifier = (6 - record.rarity) * 0.1
  const conditionScore = getConditionScoreFromLabel(record.condition)
  const conditionModifier = (conditionScore - 50) / 200
  
  return Math.max(0.1, Math.min(0.95, baseRate + rarityModifier + conditionModifier))
}

const calculateHistoricalProfitMargin = (
  record: Record,
  performances: RecordPerformance[]
): number => {
  const performance = performances.find(p => p.recordId === record.id)
  
  if (performance && performance.totalSold > 0) {
    return performance.totalProfit / performance.totalRevenue
  }
  
  return (record.marketPrice - record.costPrice) / record.marketPrice
}

const calculateSalePerformanceScore = (
  record: Record,
  performances: RecordPerformance[]
): number => {
  const performance = performances.find(p => p.recordId === record.id)
  
  if (!performance || performance.totalSold === 0) {
    const margin = (record.marketPrice - record.costPrice) / record.costPrice
    const rarityScore = record.rarity * 10
    const conditionScore = getConditionScoreFromLabel(record.condition)
    return Math.round((margin * 50 + rarityScore + conditionScore / 2) / 3)
  }
  
  const sellThroughScore = performance.sellThroughRate * 40
  const profitScore = Math.min(40, (performance.totalProfit / performance.totalSold) / 5)
  const satisfactionScore = performance.customerSatisfaction * 0.2
  
  return Math.round(sellThroughScore + profitScore + satisfactionScore)
}

export const generateSupplierInventory = (
  supplier: Supplier,
  unlockedGenres: Genre[],
  performances: RecordPerformance[],
  excludeRecordIds: string[] = [],
  count: number = 8
): SupplierInventoryItem[] => {
  const availableRecords = allRecords.filter(r => 
    unlockedGenres.includes(r.genre) && 
    !excludeRecordIds.includes(r.id)
  )
  
  const weightedRecords = availableRecords.map(record => {
    const rarityIndex = record.rarity - 1
    const weight = supplier.rarityDistribution[rarityIndex] || 5
    const genreBoost = supplier.genreFocus.includes(record.genre) ? 1.5 : 1
    return { record, weight: weight * genreBoost }
  })
  
  const totalWeight = weightedRecords.reduce((sum, item) => sum + item.weight, 0)
  const selected: Record[] = []
  
  while (selected.length < count && weightedRecords.length > 0) {
    let random = Math.random() * totalWeight
    let found = false
    
    for (let i = 0; i < weightedRecords.length; i++) {
      random -= weightedRecords[i].weight
      if (random <= 0) {
        selected.push(weightedRecords[i].record)
        weightedRecords.splice(i, 1)
        found = true
        break
      }
    }
    
    if (!found && weightedRecords.length > 0) {
      selected.push(weightedRecords[0].record)
      weightedRecords.splice(0, 1)
    }
  }
  
  return selected.map(record => {
    const basePrice = record.costPrice * supplier.priceModifier
    const isSpecialOffer = Math.random() < supplier.specialOfferChance
    const discountPercent = isSpecialOffer ? Math.floor(10 + Math.random() * 20) : 0
    const adjustedCostPrice = Math.round(isSpecialOffer ? basePrice * (1 - discountPercent / 100) : basePrice)
    
    const stockRisk = calculateStockRisk(record, supplier, performances)
    const expectedTurnoverRate = calculateExpectedTurnoverRate(record, performances)
    const historicalProfitMargin = calculateHistoricalProfitMargin(record, performances)
    const salePerformanceScore = calculateSalePerformanceScore(record, performances)
    
    return {
      record,
      supplierId: supplier.id,
      adjustedCostPrice,
      stockRisk: stockRisk.risk,
      riskFactor: stockRisk.factor,
      expectedTurnoverRate,
      historicalProfitMargin,
      salePerformanceScore,
      quantityAvailable: Math.floor(1 + Math.random() * 5),
      isSpecialOffer,
      discountPercent
    }
  })
}

export const getAvailableSuppliersForLevel = (level: number, reputation: number): Supplier[] => {
  if (level >= 4) {
    return suppliers.filter(s => s.reputation <= reputation + 20)
  }
  if (level >= 2) {
    return suppliers.filter(s => 
      s.type === 'wholesaler' || 
      s.type === 'discount' || 
      (s.type === 'specialist' && s.reputation <= reputation + 10)
    )
  }
  return suppliers.filter(s => s.type === 'wholesaler' || s.type === 'discount')
}

export const getRiskLabel = (risk: 'low' | 'medium' | 'high'): string => {
  const labels = { low: '低风险', medium: '中等风险', high: '高风险' }
  return labels[risk]
}

export const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  const colors = { low: '#48bb78', medium: '#ed8936', high: '#f56565' }
  return colors[risk]
}

export const getPerformanceLabel = (score: number): string => {
  if (score >= 80) return '极佳'
  if (score >= 60) return '良好'
  if (score >= 40) return '一般'
  if (score >= 20) return '较差'
  return '滞销'
}

export const getPerformanceColor = (score: number): string => {
  if (score >= 80) return '#48bb78'
  if (score >= 60) return '#38b2ac'
  if (score >= 40) return '#ed8936'
  if (score >= 20) return '#e53e3e'
  return '#c53030'
}
