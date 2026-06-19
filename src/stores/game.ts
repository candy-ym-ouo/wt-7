import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GamePhase, Record, InventoryItem, DisplaySlot,
  Customer, SaleRecord, DailyStats, CollectionItem,
  MemberProfile, MemberLevel, MemberStats, LevelReward,
  LevelEvaluation, Supplier, SupplierInventoryItem, RecordPerformance,
  TimeSlot, TimeSlotStats, BargainState, BargainRound
} from '@/types'
import { getLevelById, getNextLevel, getUnlockedGenres, getScaledLevelConfig } from '@/data/levels'
import { allRecords, getRandomRecords, getRecordById } from '@/data/records'
import {
  generateDailyCustomers,
  calculateMatchScore,
  createMemberProfile,
  generateCustomerBargainOffer,
  generateCustomerCounterOffer,
  calculateBargainSatisfactionBonus
} from '@/data/customers'
import {
  updateMemberAfterPurchase,
  calculateGrowthPoints,
  calculateMemberDiscount,
  getMemberBenefit,
  getNextLevelInfo,
  shouldCustomerBecomeMember,
  generateMemberNoteIdeas
} from '@/data/members'
import {
  getConditionScoreFromLabel,
  degradeCondition,
  calculateCollectionValue,
  getConditionImpactOnSales,
  getConditionLabel,
  calculateRenovationCost
} from '@/data/condition'
import {
  getWordOfMouthTier,
  getCustomerCountWithReputation,
  getBuyChanceBonus,
  calculateLevelEvaluation
} from '@/data/wordOfMouth'
import {
  getAvailableSuppliersForLevel,
  generateSupplierInventory,
  getSupplierById
} from '@/data/suppliers'
import {
  updatePerformanceAfterSale,
  updateSellThroughRates,
  createEmptyPerformance,
  calculateInventoryRiskScore,
  generatePurchaseRecommendation
} from '@/data/performance'
import {
  getTimeSlotConfig,
  getCustomerCountForSlot,
  getPlayBoostForSlot,
  getImpulseBuyChance,
  adjustPriceSensitivity
} from '@/data/timeSlots'

export const useGameStore = defineStore('game', () => {
  const currentLevel = ref(1)
  const currentDay = ref(1)
  const budget = ref(2000)
  const totalProfit = ref(0)
  const phase = ref<GamePhase>('purchase')
  const inventory = ref<InventoryItem[]>([])
  const displaySlots = ref<DisplaySlot[]>([])
  const customers = ref<Customer[]>([])
  const dailyStats = ref<DailyStats[]>([])
  const collection = ref<CollectionItem[]>([])
  const salesHistory = ref<SaleRecord[]>([])
  const shopReputation = ref(50)
  const isPlaying = ref(false)
  const currentPlayingRecord = ref<Record | null>(null)
  const currentLevelProfit = ref(0)
  const currentLevelSales = ref(0)
  const completedLevels = ref<number[]>([])
  const dailyRevenue = ref(0)
  const dailyCost = ref(0)
  const dailySalesCount = ref(0)
  const dailyServedCustomers = ref(0)
  const dailySatisfactionSum = ref(0)
  const currentCustomerIndex = ref(0)

  const members = ref<MemberProfile[]>([])
  const currentLevelNewMembers = ref(0)
  const currentLevelReturningVisits = ref(0)
  const currentLevelMemberSales = ref(0)

  const dailyNewMembers = ref(0)
  const dailyReturningCustomers = ref(0)
  const dailyMemberSalesCount = ref(0)
  const dailyMemberRevenue = ref(0)
  const dailyGrowthPointsEarned = ref(0)
  const lastLevelReward = ref<LevelReward | null>(null)
  const dailyRenovationCost = ref(0)
  const dailyConditionDegraded = ref(0)
  const levelStartReputation = ref(50)

  const availableSuppliers = ref<Supplier[]>([])
  const currentSupplierId = ref<string | null>(null)
  const supplierInventory = ref<SupplierInventoryItem[]>([])
  const recordPerformances = ref<RecordPerformance[]>([])
  const totalInventoryPurchased = ref<Map<string, number>>(new Map())
  const supplierPurchaseHistory = ref<Map<string, { totalSpent: number; totalItems: number }>>(new Map())

  const currentTimeSlot = ref<TimeSlot>('afternoon')
  const afternoonCompleted = ref(false)
  const afternoonStats = ref<TimeSlotStats>({
    slot: 'afternoon',
    revenue: 0,
    cost: 0,
    salesCount: 0,
    customersServed: 0,
    avgSatisfaction: 0
  })
  const nightStats = ref<TimeSlotStats>({
    slot: 'night',
    revenue: 0,
    cost: 0,
    salesCount: 0,
    customersServed: 0,
    avgSatisfaction: 0
  })
  const slotSatisfactionSum = ref(0)
  const currentBargain = ref<BargainState | null>(null)

  const baseLevelConfig = computed(() => getLevelById(currentLevel.value))
  const currentLevelConfig = computed(() => getScaledLevelConfig(currentLevel.value, shopReputation.value))
  const wordOfMouthConfig = computed(() => getWordOfMouthTier(shopReputation.value))
  const difficultyScale = computed(() => wordOfMouthConfig.value.difficultyScale)
  const currentTimeSlotConfig = computed(() => getTimeSlotConfig(currentTimeSlot.value))
  const levelEvaluation = computed<LevelEvaluation | null>(() => {
    const config = currentLevelConfig.value
    if (!config) return null
    return calculateLevelEvaluation(
      currentLevelProfit.value,
      config.targetProfit,
      currentLevelSales.value,
      config.targetSales,
      shopReputation.value,
      config.targetSatisfaction,
      levelStartReputation.value
    )
  })
  const availableRecords = computed(() => {
    const unlocked = getUnlockedGenres(currentLevel.value)
    return allRecords.filter(r => unlocked.includes(r.genre))
  })
  const currentSupplier = computed<Supplier | null>(() => {
    if (!currentSupplierId.value) return null
    return getSupplierById(currentSupplierId.value) || null
  })

  const currentSupplierInventory = computed(() => {
    return supplierInventory.value
  })

  const shopRecordsForPurchase = computed(() => {
    if (supplierInventory.value.length > 0) {
      return supplierInventory.value.map(item => item.record)
    }
    return getRandomRecords(8, inventory.value.map(i => i.record.id))
  })

  const inventoryRiskScore = computed(() => {
    return calculateInventoryRiskScore(inventory.value, recordPerformances.value, currentDay.value)
  })

  const purchaseRecommendations = computed(() => {
    return generatePurchaseRecommendation(recordPerformances.value, inventory.value, budget.value)
  })

  const supplierStats = computed(() => {
    return (supplierId: string) => {
      return supplierPurchaseHistory.value.get(supplierId) || { totalSpent: 0, totalItems: 0 }
    }
  })
  const displayedRecords = computed(() => {
    return displaySlots.value
      .filter(s => s.inventoryId && s.conditionScore !== null)
      .map(s => {
        const invItem = inventory.value.find(i => i.record.id === s.inventoryId)
        return invItem ? { slot: s, item: invItem, conditionScore: s.conditionScore as number } : null
      })
      .filter((item): item is { slot: DisplaySlot; item: InventoryItem; conditionScore: number } => item !== null)
  })
  const currentCustomer = computed(() => customers.value[currentCustomerIndex.value] || null)
  const isLastDay = computed(() => baseLevelConfig.value ? currentDay.value >= baseLevelConfig.value.days : false)
  const canAdvancePhase = computed(() => {
    switch (phase.value) {
      case 'purchase':
        return inventory.value.length > 0
      case 'display':
        return displaySlots.value.some(s => s.inventoryId)
      case 'business':
        return currentCustomerIndex.value >= customers.value.length
      case 'settlement':
        return true
      default:
        return false
    }
  })

  const canSwitchToNight = computed(() => {
    return phase.value === 'business' &&
           currentTimeSlot.value === 'afternoon' &&
           !afternoonCompleted.value &&
           currentCustomerIndex.value >= customers.value.length
  })

  const memberStats = computed<MemberStats>(() => {
    const byLevel: { [key in MemberLevel]: number } = {
      Bronze: 0, Silver: 0, Gold: 0, Platinum: 0, Diamond: 0
    }
    let totalMemberSpent = 0
    let totalSatisfaction = 0
    let memberSaleCount = 0

    members.value.forEach(m => {
      byLevel[m.level]++
      totalMemberSpent += m.totalSpent
    })

    salesHistory.value.forEach(s => {
      if (s.isMemberPurchase) {
        totalSatisfaction += s.customerSatisfaction
        memberSaleCount++
      }
    })

    return {
      totalMembers: members.value.length,
      byLevel,
      newMembersToday: dailyNewMembers.value,
      returningCustomersToday: dailyReturningCustomers.value,
      totalMemberSpent,
      avgMemberSatisfaction: memberSaleCount > 0 ? totalSatisfaction / memberSaleCount : 0
    }
  })

  const memberLevelProgress = computed(() => {
    const config = currentLevelConfig.value
    if (!config) return { newMembers: 0, returningVisits: 0, memberSalesRatio: 0 }

    const memberSalesRatio = currentLevelSales.value > 0
      ? currentLevelMemberSales.value / currentLevelSales.value
      : 0

    return {
      newMembers: Math.min(100, (currentLevelNewMembers.value / config.memberTargets.targetNewMembers) * 100),
      returningVisits: Math.min(100, (currentLevelReturningVisits.value / Math.max(1, config.memberTargets.targetReturningVisits)) * 100),
      memberSalesRatio: Math.min(100, (memberSalesRatio / config.memberTargets.targetMemberSalesRatio) * 100)
    }
  })

  const isMemberTargetsComplete = computed(() => {
    const progress = memberLevelProgress.value
    return progress.newMembers >= 100 &&
           progress.returningVisits >= 100 &&
           progress.memberSalesRatio >= 100
  })

  const levelProgress = computed(() => {
    const config = currentLevelConfig.value
    if (!config) return { profit: 0, sales: 0, satisfaction: 0 }
    return {
      profit: Math.min(100, (currentLevelProfit.value / config.targetProfit) * 100),
      sales: Math.min(100, (currentLevelSales.value / config.targetSales) * 100),
      satisfaction: Math.min(100, (shopReputation.value / config.targetSatisfaction) * 100)
    }
  })
  const isLevelComplete = computed(() => {
    const config = currentLevelConfig.value
    if (!config) return false

    const baseComplete = currentLevelProfit.value >= config.targetProfit &&
           currentLevelSales.value >= config.targetSales &&
           shopReputation.value >= config.targetSatisfaction

    return baseComplete && isMemberTargetsComplete.value
  })

  const calculateLevelReward = (): LevelReward => {
    const config = currentLevelConfig.value
    const reward: LevelReward = {
      baseReward: 0,
      newMembersReward: 0,
      returningVisitsReward: 0,
      memberRatioReward: 0,
      memberTargetsCompletedBonus: 0,
      totalReward: 0,
      reputationBonus: 0,
      unlockedBonus: [],
      wordOfMouthBonus: 0,
      evaluation: null
    }

    if (!config) return reward

    reward.baseReward = Math.floor(currentLevelProfit.value * 0.2) + config.id * 200

    const memberTargetRatio = currentLevelNewMembers.value / config.memberTargets.targetNewMembers
    reward.newMembersReward = Math.floor(
      Math.min(1, memberTargetRatio) * config.memberTargets.targetNewMembers * 50
    )

    const returningRatio = currentLevelReturningVisits.value / Math.max(1, config.memberTargets.targetReturningVisits)
    reward.returningVisitsReward = Math.floor(
      Math.min(1, returningRatio) * Math.max(1, config.memberTargets.targetReturningVisits) * 40
    )

    const actualMemberSalesRatio = currentLevelSales.value > 0
      ? currentLevelMemberSales.value / currentLevelSales.value
      : 0
    const ratioProgress = Math.min(1, actualMemberSalesRatio / config.memberTargets.targetMemberSalesRatio)
    reward.memberRatioReward = Math.floor(ratioProgress * 300)

    if (isMemberTargetsComplete.value) {
      reward.memberTargetsCompletedBonus = config.id * 500
      reward.reputationBonus = 10 + config.id * 2
      reward.unlockedBonus.push('会员专属成就')
    }

    if (members.value.some(m => m.level === 'Gold' || m.level === 'Platinum' || m.level === 'Diamond')) {
      reward.unlockedBonus.push('黄金及以上会员达成')
      reward.reputationBonus += 5
    }
    if (members.value.some(m => m.level === 'Platinum' || m.level === 'Diamond')) {
      reward.unlockedBonus.push('铂金及以上会员达成')
      reward.reputationBonus += 5
    }
    if (members.value.some(m => m.level === 'Diamond')) {
      reward.unlockedBonus.push('传奇钻石会员')
      reward.reputationBonus += 10
    }

    const evaluation = calculateLevelEvaluation(
      currentLevelProfit.value,
      config.targetProfit,
      currentLevelSales.value,
      config.targetSales,
      shopReputation.value,
      config.targetSatisfaction,
      levelStartReputation.value
    )
    reward.evaluation = evaluation
    reward.wordOfMouthBonus = evaluation.wordOfMouthBonus

    if (evaluation.grade === 'S') {
      reward.unlockedBonus.push('完美通关！S级评价')
      reward.reputationBonus += 8
    } else if (evaluation.grade === 'A') {
      reward.reputationBonus += 3
    }

    reward.totalReward = reward.baseReward +
      reward.newMembersReward +
      reward.returningVisitsReward +
      reward.memberRatioReward +
      reward.memberTargetsCompletedBonus +
      reward.wordOfMouthBonus

    return reward
  }

  const grantLevelReward = () => {
    const reward = calculateLevelReward()
    lastLevelReward.value = reward

    budget.value += reward.totalReward
    shopReputation.value = Math.min(100, shopReputation.value + reward.reputationBonus)

    return reward
  }

  const initializeDisplaySlots = (count: number) => {
    const slots: DisplaySlot[] = []
    const cols = Math.ceil(Math.sqrt(count))
    for (let i = 0; i < count; i++) {
      slots.push({
        id: i,
        inventoryId: null,
        position: { x: i % cols, y: Math.floor(i / cols) },
        conditionScore: null
      })
    }
    displaySlots.value = slots
  }

  const startLevel = (levelId: number) => {
    const config = getLevelById(levelId)
    const scaled = getScaledLevelConfig(levelId, shopReputation.value)
    if (!config || !scaled) return

    currentLevel.value = levelId
    currentDay.value = 1
    budget.value = config.initialBudget
    totalProfit.value = 0
    phase.value = 'purchase'
    inventory.value = []
    customers.value = []
    salesHistory.value = []
    currentLevelProfit.value = 0
    currentLevelSales.value = 0
    currentCustomerIndex.value = 0
    currentLevelNewMembers.value = 0
    currentLevelReturningVisits.value = 0
    currentLevelMemberSales.value = 0
    members.value = []
    lastLevelReward.value = null
    levelStartReputation.value = shopReputation.value
    initializeDisplaySlots(config.displaySlots)
    resetDailyStats()
    
    availableSuppliers.value = getAvailableSuppliersForLevel(levelId, shopReputation.value)
    currentSupplierId.value = availableSuppliers.value.length > 0 ? availableSuppliers.value[0].id : null
    recordPerformances.value = []
    totalInventoryPurchased.value = new Map()
    supplierPurchaseHistory.value = new Map()
    
    if (currentSupplierId.value) {
      refreshSupplierInventory()
    }
  }

  const resetDailyStats = () => {
    dailyRevenue.value = 0
    dailyCost.value = 0
    dailySalesCount.value = 0
    dailyServedCustomers.value = 0
    dailySatisfactionSum.value = 0
    dailyNewMembers.value = 0
    dailyReturningCustomers.value = 0
    dailyMemberSalesCount.value = 0
    dailyMemberRevenue.value = 0
    dailyGrowthPointsEarned.value = 0
    dailyRenovationCost.value = 0
    dailyConditionDegraded.value = 0
    currentTimeSlot.value = 'afternoon'
    afternoonCompleted.value = false
    afternoonStats.value = { slot: 'afternoon', revenue: 0, cost: 0, salesCount: 0, customersServed: 0, avgSatisfaction: 0 }
    nightStats.value = { slot: 'night', revenue: 0, cost: 0, salesCount: 0, customersServed: 0, avgSatisfaction: 0 }
    slotSatisfactionSum.value = 0
    currentBargain.value = null
  }

  const selectSupplier = (supplierId: string) => {
    const supplier = getSupplierById(supplierId)
    if (!supplier) return false
    
    currentSupplierId.value = supplierId
    refreshSupplierInventory()
    return true
  }

  const refreshSupplierInventory = () => {
    if (!currentSupplierId.value) return
    
    const supplier = getSupplierById(currentSupplierId.value)
    if (!supplier) return
    
    const unlockedGenres = getUnlockedGenres(currentLevel.value)
    const excludeIds = inventory.value.map(i => i.record.id)
    
    supplierInventory.value = generateSupplierInventory(
      supplier,
      unlockedGenres,
      recordPerformances.value,
      excludeIds,
      8
    )
  }

  const getSupplierInventoryItem = (recordId: string): SupplierInventoryItem | undefined => {
    return supplierInventory.value.find(item => item.record.id === recordId)
  }

  const purchaseFromSupplier = (supplierItem: SupplierInventoryItem, quantity: number = 1) => {
    const actualQty = Math.min(quantity, supplierItem.quantityAvailable)
    const totalCost = supplierItem.adjustedCostPrice * actualQty
    
    if (budget.value < totalCost) return { success: false, message: '预算不足！' }
    
    const supplier = getSupplierById(supplierItem.supplierId)
    if (supplier && totalCost < supplier.minOrderAmount) {
      return { success: false, message: `未达到最低订货金额 ¥${supplier.minOrderAmount}！` }
    }
    
    const existing = inventory.value.find(i => i.record.id === supplierItem.record.id)
    if (existing) {
      const totalQtyBefore = existing.quantity
      const totalScoreBefore = existing.conditionScore * totalQtyBefore
      const totalCostBefore = existing.actualCostPrice * totalQtyBefore
      const newScore = getConditionScoreFromLabel(supplierItem.record.condition)
      existing.quantity += actualQty
      existing.conditionScore = Math.round((totalScoreBefore + newScore * actualQty) / existing.quantity)
      existing.actualCostPrice = Math.round((totalCostBefore + supplierItem.adjustedCostPrice * actualQty) / existing.quantity)
    } else {
      inventory.value.push({
        record: supplierItem.record,
        quantity: actualQty,
        purchaseDate: currentDay.value,
        conditionScore: getConditionScoreFromLabel(supplierItem.record.condition),
        actualCostPrice: supplierItem.adjustedCostPrice
      })
    }
    
    const currentTotal = totalInventoryPurchased.value.get(supplierItem.record.id) || 0
    totalInventoryPurchased.value.set(supplierItem.record.id, currentTotal + actualQty)
    
    const supplierHistory = supplierPurchaseHistory.value.get(supplierItem.supplierId) || { totalSpent: 0, totalItems: 0 }
    supplierPurchaseHistory.value.set(supplierItem.supplierId, {
      totalSpent: supplierHistory.totalSpent + totalCost,
      totalItems: supplierHistory.totalItems + actualQty
    })
    
    const invItemIndex = supplierInventory.value.findIndex(i => i.record.id === supplierItem.record.id)
    if (invItemIndex >= 0) {
      supplierInventory.value[invItemIndex].quantityAvailable -= actualQty
      if (supplierInventory.value[invItemIndex].quantityAvailable <= 0) {
        supplierInventory.value.splice(invItemIndex, 1)
      }
    }
    
    budget.value -= totalCost
    dailyCost.value += totalCost
    
    const perfIndex = recordPerformances.value.findIndex(p => p.recordId === supplierItem.record.id)
    if (perfIndex < 0) {
      recordPerformances.value.push(createEmptyPerformance(supplierItem.record.id))
    }
    
    recordPerformances.value = updateSellThroughRates(
      recordPerformances.value,
      inventory.value,
      totalInventoryPurchased.value
    )
    
    const riskApplied = Math.random() < supplierItem.riskFactor * 0.3
    let finalMessage = `成功购入 ${actualQty} 张《${supplierItem.record.title}》！`
    if (riskApplied) {
      const invItem = inventory.value.find(i => i.record.id === supplierItem.record.id)
      if (invItem) {
        const damage = Math.floor(5 + Math.random() * 15)
        invItem.conditionScore = Math.max(10, invItem.conditionScore - damage)
        finalMessage += ` 注意：运输中品相下降了 ${damage} 分！`
      }
    }
    
    return { 
      success: true, 
      message: finalMessage,
      totalCost,
      quantity: actualQty
    }
  }

  const purchaseRecord = (record: Record, quantity: number = 1) => {
    const supplierItem = getSupplierInventoryItem(record.id)
    if (supplierItem) {
      const result = purchaseFromSupplier(supplierItem, quantity)
      return result.success
    }
    
    const totalCost = record.costPrice * quantity
    if (budget.value < totalCost) return false

    const existing = inventory.value.find(i => i.record.id === record.id)
    if (existing) {
      const totalQtyBefore = existing.quantity
      const totalCostBefore = existing.actualCostPrice * totalQtyBefore
      existing.quantity += quantity
      existing.actualCostPrice = Math.round((totalCostBefore + record.costPrice * quantity) / existing.quantity)
    } else {
      inventory.value.push({
        record,
        quantity,
        purchaseDate: currentDay.value,
        conditionScore: getConditionScoreFromLabel(record.condition),
        actualCostPrice: record.costPrice
      })
    }

    const currentTotal = totalInventoryPurchased.value.get(record.id) || 0
    totalInventoryPurchased.value.set(record.id, currentTotal + quantity)
    
    budget.value -= totalCost
    dailyCost.value += totalCost
    
    const perfIndex = recordPerformances.value.findIndex(p => p.recordId === record.id)
    if (perfIndex < 0) {
      recordPerformances.value.push(createEmptyPerformance(record.id))
    }
    
    recordPerformances.value = updateSellThroughRates(
      recordPerformances.value,
      inventory.value,
      totalInventoryPurchased.value
    )
    
    return true
  }

  const placeToDisplay = (inventoryId: string, slotId: number) => {
    const slot = displaySlots.value.find(s => s.id === slotId)
    const invItem = inventory.value.find(i => i.record.id === inventoryId)

    if (!slot || !invItem || invItem.quantity <= 0) return false
    if (slot.inventoryId) {
      removeFromDisplay(slotId)
    }

    slot.inventoryId = inventoryId
    slot.conditionScore = invItem.conditionScore
    invItem.quantity -= 1

    recalcInventoryCondition(invItem.record.id)
    return true
  }

  const removeFromDisplay = (slotId: number) => {
    const slot = displaySlots.value.find(s => s.id === slotId)
    if (!slot || !slot.inventoryId) return false

    const invItem = inventory.value.find(i => i.record.id === slot.inventoryId)
    if (invItem) {
      const returningScore = slot.conditionScore!
      const displayScores = displaySlots.value
        .filter(s => s.id !== slot.id && s.inventoryId === invItem.record.id && s.conditionScore !== null)
        .map(s => s.conditionScore as number)

      const qtyBeforeAdd = invItem.quantity
      const totalPieces = qtyBeforeAdd + displayScores.length + 1
      const totalScore = invItem.conditionScore * qtyBeforeAdd +
                         displayScores.reduce((a, b) => a + b, 0) +
                         returningScore
      invItem.quantity += 1
      invItem.conditionScore = Math.round(totalScore / totalPieces)
    }
    slot.inventoryId = null
    slot.conditionScore = null
    return true
  }

  const recalcInventoryCondition = (recordId: string) => {
    const invItem = inventory.value.find(i => i.record.id === recordId)
    if (!invItem) return

    const displayScores = displaySlots.value
      .filter(s => s.inventoryId === recordId && s.conditionScore !== null)
      .map(s => s.conditionScore as number)

    const totalPieces = invItem.quantity + displayScores.length
    if (totalPieces <= 0) return

    const totalScore = invItem.conditionScore * invItem.quantity +
                       displayScores.reduce((a, b) => a + b, 0)
    invItem.conditionScore = Math.round(totalScore / totalPieces)
  }

  const startBusinessPhase = () => {
    if (!baseLevelConfig.value) return
    const baseCount = Math.min(
      baseLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    const totalCustomerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    const slotCount = getCustomerCountForSlot(totalCustomerCount, currentTimeSlot.value)
    const inventoryGenres = [...new Set(inventory.value.map(i => i.record.genre))]
    const result = generateDailyCustomers(
      slotCount,
      currentDay.value,
      members.value,
      shopReputation.value,
      inventoryGenres,
      currentTimeSlot.value
    )
    customers.value = result.customers

    dailyReturningCustomers.value = customers.value.filter(c => c.isReturningCustomer).length
    currentLevelReturningVisits.value += dailyReturningCustomers.value

    currentCustomerIndex.value = 0
    phase.value = 'business'
  }

  const switchToNightSlot = () => {
    const stats = getCurrentSlotStats()
    stats.revenue = dailyRevenue.value - (afternoonCompleted.value ? afternoonStats.value.revenue : 0)
    stats.salesCount = dailySalesCount.value - (afternoonCompleted.value ? afternoonStats.value.salesCount : 0)
    stats.customersServed = dailyServedCustomers.value - (afternoonCompleted.value ? afternoonStats.value.customersServed : 0)
    if (stats.customersServed > 0) {
      stats.avgSatisfaction = slotSatisfactionSum.value / stats.customersServed
    }

    afternoonStats.value = { ...stats, slot: 'afternoon' }
    afternoonCompleted.value = true
    currentTimeSlot.value = 'night'
    slotSatisfactionSum.value = 0

    stopPlaying()

    if (!baseLevelConfig.value) return
    const baseCount = Math.min(
      baseLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    const totalCustomerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    const nightCount = getCustomerCountForSlot(totalCustomerCount, 'night')
    const inventoryGenres = [...new Set(inventory.value.map(i => i.record.genre))]
    const result = generateDailyCustomers(
      nightCount,
      currentDay.value,
      members.value,
      shopReputation.value,
      inventoryGenres,
      'night'
    )
    customers.value = result.customers
    dailyReturningCustomers.value += customers.value.filter(c => c.isReturningCustomer).length
    currentLevelReturningVisits.value += customers.value.filter(c => c.isReturningCustomer).length
    currentCustomerIndex.value = 0
  }

  const getCurrentSlotStats = (): TimeSlotStats => {
    if (currentTimeSlot.value === 'afternoon') return afternoonStats.value
    return nightStats.value
  }

  const playRecord = (record: Record) => {
    isPlaying.value = true
    currentPlayingRecord.value = record
  }

  const stopPlaying = () => {
    isPlaying.value = false
    currentPlayingRecord.value = null
  }

  const getCustomerRecommendations = (customer: Customer) => {
    const displayed = displayedRecords.value
    const playBoost = getPlayBoostForSlot(currentTimeSlot.value)
    type ScoredRecord = { slot: DisplaySlot; item: InventoryItem; conditionScore: number; score: number }
    const scored = displayed.map(d => {
      const score = calculateMatchScore(customer, d.item.record, shopReputation.value)
      let finalScore = score
      if (currentPlayingRecord.value?.id === d.item.record.id) {
        finalScore += playBoost
      }
      const conditionImpact = getConditionImpactOnSales(d.conditionScore)
      finalScore += conditionImpact.buyChanceModifier * 100
      return { slot: d.slot, item: d.item, conditionScore: d.conditionScore, score: finalScore } as ScoredRecord
    }).sort((a, b) => b.score - a.score)
    return scored
  }

  const findOrCreateMember = (customer: Customer, salePrice: number, satisfaction: number): MemberProfile | null => {
    if (customer.memberProfile) {
      return customer.memberProfile
    }

    const existingMember = members.value.find(m => m.name === customer.name && m.avatar === customer.avatar)
    if (existingMember) {
      return existingMember
    }

    const memberVisits = salesHistory.value.filter(s => {
      const cust = customers.value.find(c => c.id === s.customerId)
      return cust && cust.name === customer.name
    }).length

    if (shouldCustomerBecomeMember(satisfaction, memberVisits)) {
      const newMember = createMemberProfile(customer, salePrice)
      newMember.notes = generateMemberNoteIdeas(newMember.level, customer.preference.favoriteGenres)
      newMember.purchaseCount = 1
      return newMember
    }

    return null
  }

  const startBargain = (recordId: string, askPrice: number, costPrice: number, marketPrice: number) => {
    const customer = currentCustomer.value
    if (!customer) return { success: false, message: '没有顾客' }

    if (!customer.willBargain) {
      return { success: false, message: '这位顾客对价格没什么意见，直接按出价试试吧' }
    }

    const bargainResult = generateCustomerBargainOffer(customer, askPrice, costPrice, marketPrice)

    const initialRound: BargainRound = {
      round: 1,
      side: 'seller',
      price: askPrice,
      timestamp: Date.now()
    }

    const customerRound: BargainRound = {
      round: 2,
      side: 'customer',
      price: bargainResult.offerPrice,
      timestamp: Date.now(),
      reaction: bargainResult.reaction
    }

    currentBargain.value = {
      active: true,
      phase: 'customer_offer',
      initialAskPrice: askPrice,
      currentSellerPrice: askPrice,
      currentCustomerOffer: bargainResult.offerPrice,
      customerMinPrice: bargainResult.minAcceptable,
      customerMaxPrice: askPrice,
      rounds: [initialRound, customerRound],
      maxRounds: 5,
      patienceLeft: customer.patience,
      recordId
    }

    return {
      success: true,
      message: bargainResult.reaction,
      offerPrice: bargainResult.offerPrice,
      minAcceptable: bargainResult.minAcceptable
    }
  }

  const makeCounterOffer = (counterPrice: number, costPrice: number, marketPrice: number) => {
    const bargain = currentBargain.value
    const customer = currentCustomer.value
    if (!bargain || !customer) return { success: false, message: '没有进行中的砍价' }

    if (counterPrice < costPrice) {
      return { success: false, message: '不能低于进价！' }
    }

    const sellerRound: BargainRound = {
      round: bargain.rounds.length + 1,
      side: 'seller',
      price: counterPrice,
      timestamp: Date.now()
    }
    bargain.rounds.push(sellerRound)
    bargain.currentSellerPrice = counterPrice
    bargain.patienceLeft = Math.max(0, bargain.patienceLeft - 10)

    const lastCustomerOffer = bargain.currentCustomerOffer || bargain.customerMinPrice
    const counterResult = generateCustomerCounterOffer(
      customer,
      lastCustomerOffer,
      counterPrice,
      costPrice,
      marketPrice,
      Math.floor(bargain.rounds.length / 2)
    )

    if (counterResult.accepted && counterResult.offerPrice !== null) {
      const customerRound: BargainRound = {
        round: bargain.rounds.length + 1,
        side: 'customer',
        price: counterResult.offerPrice,
        timestamp: Date.now(),
        reaction: counterResult.reaction
      }
      bargain.rounds.push(customerRound)
      bargain.phase = 'agreed'
      bargain.currentCustomerOffer = counterResult.offerPrice
      bargain.active = false

      return {
        success: true,
        accepted: true,
        finalPrice: counterResult.offerPrice,
        message: counterResult.reaction
      }
    }

    if (counterResult.offerPrice === null) {
      bargain.phase = 'failed'
      bargain.active = false

      if (customer) {
        const finalDissatisfaction = Math.max(15, 25)
        dailyServedCustomers.value += 1
        dailySatisfactionSum.value += finalDissatisfaction
        slotSatisfactionSum.value += finalDissatisfaction
        shopReputation.value = Math.max(0, shopReputation.value - 2)
      }

      currentBargain.value = null

      return {
        success: true,
        accepted: false,
        message: counterResult.reaction,
        failed: true
      }
    }

    const customerRound: BargainRound = {
      round: bargain.rounds.length + 1,
      side: 'customer',
      price: counterResult.offerPrice,
      timestamp: Date.now(),
      reaction: counterResult.reaction
    }
    bargain.rounds.push(customerRound)
    bargain.currentCustomerOffer = counterResult.offerPrice
    bargain.phase = 'customer_offer'

    return {
      success: true,
      accepted: false,
      offerPrice: counterResult.offerPrice,
      message: counterResult.reaction
    }
  }

  const acceptCustomerOffer = () => {
    const bargain = currentBargain.value
    if (!bargain || bargain.currentCustomerOffer === null) {
      return { success: false, message: '没有可接受的报价' }
    }

    bargain.phase = 'agreed'
    bargain.active = false

    return {
      success: true,
      finalPrice: bargain.currentCustomerOffer,
      message: '好的，就按这个价成交！'
    }
  }

  const rejectBargain = () => {
    const bargain = currentBargain.value
    const customer = currentCustomer.value
    if (!bargain) return { success: false, message: '没有进行中的砍价' }

    bargain.phase = 'failed'
    bargain.active = false

    if (customer) {
      const finalDissatisfaction = Math.max(15, 25)
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += finalDissatisfaction
      slotSatisfactionSum.value += finalDissatisfaction
      shopReputation.value = Math.max(0, shopReputation.value - 2)
    }

    currentBargain.value = null

    return {
      success: true,
      message: '交易谈崩了，顾客有些不满...'
    }
  }

  const cancelBargain = () => {
    currentBargain.value = null
  }

  const trySellToCustomer = (inventoryId: string, customPrice?: number, bargainFinalPrice?: number) => {
    const customer = currentCustomer.value
    if (!customer) return { success: false, message: '没有顾客' }

    const slot = displaySlots.value.find(s => s.inventoryId === inventoryId)
    const invItem = inventory.value.find(i => i.record.id === inventoryId)
    if (!slot || !invItem) return { success: false, message: '唱片不存在' }

    const record = invItem.record
    const slotConditionScore = slot.conditionScore!
    const conditionImpact = getConditionImpactOnSales(slotConditionScore)
    
    const wasBargained = currentBargain.value !== null && bargainFinalPrice !== undefined
    let salePrice = bargainFinalPrice || customPrice || record.marketPrice
    const initialAskPrice = currentBargain.value?.initialAskPrice || (customPrice || record.marketPrice)

    salePrice = Math.floor(salePrice * conditionImpact.priceModifier)

    if (customer.memberDiscount > 0) {
      salePrice = Math.floor(salePrice * (1 - customer.memberDiscount))
    }

    const score = calculateMatchScore(customer, record, shopReputation.value)
    const playBoost = getPlayBoostForSlot(currentTimeSlot.value)
    const finalScore = currentPlayingRecord.value?.id === record.id ? score + playBoost : score

    let buyChance = finalScore / 100
    buyChance += conditionImpact.buyChanceModifier
    buyChance += getBuyChanceBonus(shopReputation.value)

    const priceSensitivity = adjustPriceSensitivity(currentTimeSlot.value)
    if (salePrice > customer.budget) {
      buyChance *= Math.max(0.1, 0.3 / priceSensitivity)
    }
    if (salePrice > record.marketPrice * 1.3) {
      buyChance *= Math.max(0.1, 0.5 / priceSensitivity)
    }
    if (salePrice < record.marketPrice * 0.7) {
      buyChance *= Math.min(2.0, 1.2 * priceSensitivity)
    }
    if (customer.isReturningCustomer) {
      buyChance *= 1.15
    }

    const impulseChance = getImpulseBuyChance(currentTimeSlot.value)
    if (Math.random() < impulseChance) {
      buyChance = Math.min(1.0, buyChance * 1.3)
    }

    if (wasBargained) {
      buyChance = Math.min(1.0, buyChance * 2.2)
    }

    const bargainAgreed = currentBargain.value?.phase === 'agreed'
    const success = wasBargained && bargainAgreed
      ? (Math.random() < Math.min(1.0, buyChance * 0.95 + 0.05))
      : (Math.random() < buyChance)

    if (success) {
      const profit = salePrice - invItem.actualCostPrice
      const baseSatisfaction = 50 + finalScore * 0.5 - (salePrice > record.marketPrice ? 20 : 0)
      const memberBonus = customer.isReturningCustomer ? 5 : 0
      const bargainSatisfactionBonus = calculateBargainSatisfactionBonus(
        wasBargained,
        true,
        salePrice,
        initialAskPrice,
        customer
      )
      const satisfaction = Math.max(30, Math.min(100, baseSatisfaction + memberBonus + conditionImpact.satisfactionModifier + bargainSatisfactionBonus))

      budget.value += salePrice
      dailyRevenue.value += salePrice
      dailySalesCount.value += 1
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += satisfaction
      slotSatisfactionSum.value += satisfaction
      currentLevelProfit.value += profit
      currentLevelSales.value += 1
      totalProfit.value += profit

      const memberProfile = customer.memberProfile || findOrCreateMember(customer, salePrice, satisfaction)
      let growthPointsEarned = 0
      let isMemberPurchase = false

      if (memberProfile) {
        const updatedMember = updateMemberAfterPurchase(memberProfile, salePrice, satisfaction)
        const memberIndex = members.value.findIndex(m => m.id === updatedMember.id)
        if (memberIndex >= 0) {
          const wasNewLevel = members.value[memberIndex].level !== updatedMember.level
          members.value[memberIndex] = updatedMember
          if (wasNewLevel) {
            shopReputation.value = Math.min(100, shopReputation.value + 2)
          }
        } else {
          members.value.push(updatedMember)
          dailyNewMembers.value += 1
          currentLevelNewMembers.value += 1
          shopReputation.value = Math.min(100, shopReputation.value + 3)
        }

        growthPointsEarned = calculateGrowthPoints(
          salePrice,
          satisfaction,
          memberProfile.level,
          customer.isReturningCustomer
        )
        isMemberPurchase = true
        dailyMemberSalesCount.value += 1
        dailyMemberRevenue.value += salePrice
        dailyGrowthPointsEarned.value += growthPointsEarned
        currentLevelMemberSales.value += 1
      }

      const saleRecord: SaleRecord = {
        recordId: record.id,
        customerId: customer.id,
        salePrice,
        profit,
        timestamp: Date.now(),
        customerSatisfaction: satisfaction,
        memberId: memberProfile?.id || null,
        memberLevel: memberProfile?.level || null,
        growthPointsEarned,
        isMemberPurchase,
        timeSlot: currentTimeSlot.value,
        bargainHistory: currentBargain.value?.rounds,
        initialAskPrice,
        wasBargained
      }
      
      salesHistory.value.push(saleRecord)
      
      const daysInStock = invItem ? currentDay.value - invItem.purchaseDate : 1
      recordPerformances.value = updatePerformanceAfterSale(
        recordPerformances.value,
        saleRecord,
        daysInStock,
        currentDay.value
      )
      
      recordPerformances.value = updateSellThroughRates(
        recordPerformances.value,
        inventory.value,
        totalInventoryPurchased.value
      )

      slot.inventoryId = null
      slot.conditionScore = null

      if (satisfaction >= 80 && Math.random() < 0.3) {
        addToCollection(record, invItem.actualCostPrice, slotConditionScore)
      }

      shopReputation.value = Math.min(100, shopReputation.value + (satisfaction > 60 ? 1 : -1))

      const conditionLabel = getConditionLabel(slotConditionScore)
      const slotLabel = currentTimeSlot.value === 'afternoon' ? '午后' : '夜场'
      const bargainNote = wasBargained ? `（砍价成交，初始报价¥${initialAskPrice}）` : ''

      currentBargain.value = null

      return {
        success: true,
        message: `${customer.name} 以 ¥${salePrice} 购买了《${record.title}》！${customer.memberDiscount > 0 ? `（会员折扣${Math.round(customer.memberDiscount * 100)}%）` : ''}${growthPointsEarned > 0 ? ` 获得 ${growthPointsEarned} 成长值` : ''}${conditionImpact.priceModifier !== 1 ? ` 品相${conditionLabel}影响售价` : ''}${bargainNote}【${slotLabel}】`,
        satisfaction,
        profit,
        growthPoints: growthPointsEarned,
        isMemberPurchase,
        memberLevel: memberProfile?.level || null
      }
    } else {
      dailyServedCustomers.value += 1
      const bargainFailurePenalty = wasBargained ? -10 : 0
      const finalDissatisfaction = Math.max(20, 30 + bargainFailurePenalty)
      dailySatisfactionSum.value += finalDissatisfaction
      slotSatisfactionSum.value += finalDissatisfaction
      shopReputation.value = Math.max(0, shopReputation.value - (wasBargained ? 2 : 1))
      
      const bargainMsg = wasBargained ? '砍价没谈拢，' : ''
      currentBargain.value = null
      return {
        success: false,
        message: `${bargainMsg}${customer.name} 考虑了一下，还是没有买...`
      }
    }
  }

  const skipCustomer = () => {
    if (currentCustomer.value) {
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += 20
      slotSatisfactionSum.value += 20
      shopReputation.value = Math.max(0, shopReputation.value - 2)
    }
    currentCustomerIndex.value++
  }

  const nextCustomer = () => {
    currentCustomerIndex.value++
  }

  const degradeAllRecords = () => {
    let totalDegraded = 0

    const affectedRecordIds = new Set<string>()

    for (const slot of displaySlots.value) {
      if (!slot.inventoryId || slot.conditionScore === null) continue
      const oldScore = slot.conditionScore
      slot.conditionScore = degradeCondition(oldScore, true)
      totalDegraded += oldScore - slot.conditionScore
      affectedRecordIds.add(slot.inventoryId)
    }

    for (const item of inventory.value) {
      if (item.quantity > 0) {
        const oldScore = item.conditionScore
        item.conditionScore = degradeCondition(oldScore, false)
        totalDegraded += oldScore - item.conditionScore
        affectedRecordIds.add(item.record.id)
      }
    }

    for (const recordId of affectedRecordIds) {
      recalcInventoryCondition(recordId)
    }

    for (const item of collection.value) {
      const oldScore = item.conditionScore
      item.conditionScore = degradeCondition(oldScore, false)
      item.collectionValue = calculateCollectionValue(
        item.record.rarity,
        item.conditionScore,
        item.record.marketPrice
      )
      totalDegraded += oldScore - item.conditionScore
    }

    dailyConditionDegraded.value = totalDegraded
  }

  const renovateInventoryRecord = (inventoryId: string, targetScore: number): { success: boolean; cost: number; message: string } => {
    const invItem = inventory.value.find(i => i.record.id === inventoryId)
    if (!invItem) return { success: false, cost: 0, message: '唱片不存在' }

    const relatedSlots = displaySlots.value.filter(s => s.inventoryId === invItem.record.id && s.conditionScore !== null)
    const allPieces: number[] = []
    for (let i = 0; i < invItem.quantity; i++) {
      allPieces.push(invItem.conditionScore)
    }
    relatedSlots.forEach(s => allPieces.push(s.conditionScore!))
    if (allPieces.length === 0) {
      return { success: false, cost: 0, message: '没有可翻新的副本' }
    }
    const minCurrent = Math.min(...allPieces)
    if (targetScore <= minCurrent) {
      return { success: false, cost: 0, message: '所有副本品相已达到目标' }
    }

    let totalCost = 0
    for (const pieceScore of allPieces) {
      if (pieceScore < targetScore) {
        totalCost += calculateRenovationCostFromOptions(pieceScore, targetScore, invItem.record.rarity)
      }
    }
    if (budget.value < totalCost) {
      return { success: false, cost: totalCost, message: `预算不足！需要 ¥${totalCost}` }
    }

    invItem.conditionScore = targetScore
    relatedSlots.forEach(s => { s.conditionScore = targetScore })

    budget.value -= totalCost
    dailyRenovationCost.value += totalCost
    dailyCost.value += totalCost

    const avgBefore = Math.round(allPieces.reduce((a, b) => a + b, 0) / allPieces.length)
    return {
      success: true,
      cost: totalCost,
      message: `翻新成功！${allPieces.length}张《${invItem.record.title}》品相从${avgBefore}均提升至 ${getConditionLabel(targetScore)}（共${targetScore}分）`
    }
  }

  const renovateCollectionItem = (recordId: string, targetScore: number): { success: boolean; cost: number; message: string } => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (!item) return { success: false, cost: 0, message: '收藏品不存在' }

    if (targetScore <= item.conditionScore) {
      return { success: false, cost: 0, message: '目标品相不高于当前品相' }
    }

    const cost = calculateRenovationCostFromOptions(item.conditionScore, targetScore, item.record.rarity)
    if (budget.value < cost) {
      return { success: false, cost, message: `预算不足！需要 ¥${cost}` }
    }

    item.conditionScore = targetScore
    item.collectionValue = calculateCollectionValue(item.record.rarity, targetScore, item.record.marketPrice)
    budget.value -= cost
    dailyRenovationCost.value += cost
    dailyCost.value += cost

    return {
      success: true,
      cost,
      message: `翻新成功！《${item.record.title}》品相提升至 ${getConditionLabel(targetScore)}，收藏价值 ¥${item.collectionValue}`
    }
  }

  const calculateRenovationCostFromOptions = (currentScore: number, targetScore: number, rarity: number): number => {
    return calculateRenovationCost(currentScore, targetScore, rarity)
  }

  const endDay = () => {
    degradeAllRecords()

    const currentSlotStats = getCurrentSlotStats()
    if (currentTimeSlot.value === 'afternoon') {
      currentSlotStats.revenue = dailyRevenue.value
      currentSlotStats.salesCount = dailySalesCount.value
      currentSlotStats.customersServed = dailyServedCustomers.value
      if (currentSlotStats.customersServed > 0) {
        currentSlotStats.avgSatisfaction = slotSatisfactionSum.value / currentSlotStats.customersServed
      }
      afternoonStats.value = { ...currentSlotStats, slot: 'afternoon' }
    } else {
      currentSlotStats.revenue = dailyRevenue.value - afternoonStats.value.revenue
      currentSlotStats.salesCount = dailySalesCount.value - afternoonStats.value.salesCount
      currentSlotStats.customersServed = dailyServedCustomers.value - afternoonStats.value.customersServed
      if (currentSlotStats.customersServed > 0) {
        currentSlotStats.avgSatisfaction = slotSatisfactionSum.value / currentSlotStats.customersServed
      }
      nightStats.value = { ...currentSlotStats, slot: 'night' }
    }

    const avgSatisfaction = dailyServedCustomers.value > 0
      ? dailySatisfactionSum.value / dailyServedCustomers.value
      : 50

    const stats: DailyStats = {
      day: currentDay.value,
      revenue: dailyRevenue.value,
      cost: dailyCost.value,
      profit: dailyRevenue.value - dailyCost.value,
      salesCount: dailySalesCount.value,
      customersServed: dailyServedCustomers.value,
      avgSatisfaction,
      newMembers: dailyNewMembers.value,
      returningCustomers: dailyReturningCustomers.value,
      memberSalesCount: dailyMemberSalesCount.value,
      memberRevenue: dailyMemberRevenue.value,
      totalGrowthPointsEarned: dailyGrowthPointsEarned.value,
      renovationCost: dailyRenovationCost.value,
      conditionDegraded: dailyConditionDegraded.value,
      timeSlotStats: [
        { ...afternoonStats.value },
        { ...nightStats.value }
      ]
    }
    dailyStats.value.push(stats)

    phase.value = 'settlement'
  }

  const advancePhase = () => {
    switch (phase.value) {
      case 'purchase':
        phase.value = 'display'
        break
      case 'display':
        startBusinessPhase()
        break
      case 'business':
        if (canSwitchToNight.value) {
          switchToNightSlot()
        } else {
          endDay()
        }
        break
      case 'settlement':
        if (isLastDay.value) {
          if (isLevelComplete.value) {
            if (!completedLevels.value.includes(currentLevel.value)) {
              completedLevels.value.push(currentLevel.value)
              grantLevelReward()
            }
          } else {
            lastLevelReward.value = null
          }
        } else {
          currentDay.value++
          resetDailyStats()
          phase.value = 'purchase'
          stopPlaying()
          
          availableSuppliers.value = getAvailableSuppliersForLevel(currentLevel.value, shopReputation.value)
          if (currentSupplierId.value && !availableSuppliers.value.some(s => s.id === currentSupplierId.value)) {
            currentSupplierId.value = availableSuppliers.value.length > 0 ? availableSuppliers.value[0].id : null
          }
          if (currentSupplierId.value) {
            refreshSupplierInventory()
          }
        }
        break
    }
  }

  const addToCollection = (record: Record, purchasePrice: number, conditionScore: number = 100) => {
    if (collection.value.some(c => c.record.id === record.id)) return

    const collValue = calculateCollectionValue(record.rarity, conditionScore, record.marketPrice)

    collection.value.push({
      record,
      acquiredDate: Date.now(),
      purchasePrice,
      isFavorite: false,
      notes: '',
      conditionScore,
      collectionValue: collValue
    })
  }

  const toggleFavorite = (recordId: string) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (item) {
      item.isFavorite = !item.isFavorite
    }
  }

  const updateCollectionNotes = (recordId: string, notes: string) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (item) {
      item.notes = notes
    }
  }

  const updateMemberNotes = (memberId: string, notes: string) => {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.notes = notes
    }
  }

  const goToNextLevel = () => {
    const next = getNextLevel(currentLevel.value)
    if (next) {
      startLevel(next.id)
    }
  }

  const restartLevel = () => {
    startLevel(currentLevel.value)
  }

  return {
    currentLevel,
    currentDay,
    budget,
    totalProfit,
    phase,
    inventory,
    displaySlots,
    customers,
    dailyStats,
    collection,
    salesHistory,
    shopReputation,
    isPlaying,
    currentPlayingRecord,
    currentLevelProfit,
    currentLevelSales,
    completedLevels,
    currentCustomerIndex,
    dailyRevenue,
    dailyCost,
    dailySalesCount,
    dailyServedCustomers,
    members,
    currentLevelNewMembers,
    currentLevelReturningVisits,
    currentLevelMemberSales,
    dailyNewMembers,
    dailyReturningCustomers,
    dailyMemberSalesCount,
    dailyMemberRevenue,
    dailyGrowthPointsEarned,
    lastLevelReward,
    dailyRenovationCost,
    dailyConditionDegraded,
    levelStartReputation,
    availableSuppliers,
    currentSupplierId,
    currentSupplier,
    supplierInventory,
    currentSupplierInventory,
    recordPerformances,
    inventoryRiskScore,
    purchaseRecommendations,
    baseLevelConfig,
    currentLevelConfig,
    wordOfMouthConfig,
    difficultyScale,
    levelEvaluation,
    availableRecords,
    shopRecordsForPurchase,
    displayedRecords,
    currentCustomer,
    isLastDay,
    canAdvancePhase,
    canSwitchToNight,
    levelProgress,
    isLevelComplete,
    memberStats,
    memberLevelProgress,
    isMemberTargetsComplete,
    supplierStats,
    currentTimeSlot,
    afternoonCompleted,
    afternoonStats,
    nightStats,
    currentTimeSlotConfig,
    currentBargain,
    startBargain,
    makeCounterOffer,
    acceptCustomerOffer,
    rejectBargain,
    cancelBargain,
    startLevel,
    selectSupplier,
    refreshSupplierInventory,
    getSupplierInventoryItem,
    purchaseFromSupplier,
    purchaseRecord,
    placeToDisplay,
    removeFromDisplay,
    trySellToCustomer,
    skipCustomer,
    nextCustomer,
    playRecord,
    stopPlaying,
    getCustomerRecommendations,
    advancePhase,
    switchToNightSlot,
    addToCollection,
    toggleFavorite,
    updateCollectionNotes,
    updateMemberNotes,
    goToNextLevel,
    restartLevel,
    getRecordById,
    getMemberBenefit,
    getNextLevelInfo,
    calculateMemberDiscount,
    calculateLevelReward,
    degradeAllRecords,
    renovateInventoryRecord,
    renovateCollectionItem
  }
})
