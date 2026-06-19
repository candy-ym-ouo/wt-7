import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GamePhase, Record, InventoryItem, DisplaySlot,
  Customer, SaleRecord, DailyStats, CollectionItem,
  MemberProfile, MemberLevel, MemberStats, LevelReward,
  LevelEvaluation
} from '@/types'
import { getLevelById, getNextLevel, getUnlockedGenres, getScaledLevelConfig } from '@/data/levels'
import { allRecords, getRandomRecords, getRecordById } from '@/data/records'
import { generateDailyCustomers, calculateMatchScore, createMemberProfile } from '@/data/customers'
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

  const baseLevelConfig = computed(() => getLevelById(currentLevel.value))
  const currentLevelConfig = computed(() => getScaledLevelConfig(currentLevel.value, shopReputation.value))
  const wordOfMouthConfig = computed(() => getWordOfMouthTier(shopReputation.value))
  const difficultyScale = computed(() => wordOfMouthConfig.value.difficultyScale)
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
  const shopRecordsForPurchase = computed(() => {
    return getRandomRecords(8, inventory.value.map(i => i.record.id))
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
  }

  const purchaseRecord = (record: Record, quantity: number = 1) => {
    const totalCost = record.costPrice * quantity
    if (budget.value < totalCost) return false

    const existing = inventory.value.find(i => i.record.id === record.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      inventory.value.push({
        record,
        quantity,
        purchaseDate: Date.now(),
        conditionScore: getConditionScoreFromLabel(record.condition)
      })
    }

    budget.value -= totalCost
    dailyCost.value += totalCost
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
    const customerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    const inventoryGenres = [...new Set(inventory.value.map(i => i.record.genre))]
    const result = generateDailyCustomers(
      customerCount,
      currentDay.value,
      members.value,
      shopReputation.value,
      inventoryGenres
    )
    customers.value = result.customers

    dailyReturningCustomers.value = customers.value.filter(c => c.isReturningCustomer).length
    currentLevelReturningVisits.value += dailyReturningCustomers.value

    currentCustomerIndex.value = 0
    phase.value = 'business'
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
    type ScoredRecord = { slot: DisplaySlot; item: InventoryItem; conditionScore: number; score: number }
    const scored = displayed.map(d => {
      const score = calculateMatchScore(customer, d.item.record, shopReputation.value)
      let finalScore = score
      if (currentPlayingRecord.value?.id === d.item.record.id) {
        finalScore += 15
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

  const trySellToCustomer = (inventoryId: string, customPrice?: number) => {
    const customer = currentCustomer.value
    if (!customer) return { success: false, message: '没有顾客' }

    const slot = displaySlots.value.find(s => s.inventoryId === inventoryId)
    const invItem = inventory.value.find(i => i.record.id === inventoryId)
    if (!slot || !invItem) return { success: false, message: '唱片不存在' }

    const record = invItem.record
    const slotConditionScore = slot.conditionScore!
    const conditionImpact = getConditionImpactOnSales(slotConditionScore)
    let salePrice = customPrice || record.marketPrice

    salePrice = Math.floor(salePrice * conditionImpact.priceModifier)

    if (customer.memberDiscount > 0) {
      salePrice = Math.floor(salePrice * (1 - customer.memberDiscount))
    }

    const score = calculateMatchScore(customer, record, shopReputation.value)
    const finalScore = currentPlayingRecord.value?.id === record.id ? score + 15 : score

    let buyChance = finalScore / 100
    buyChance += conditionImpact.buyChanceModifier
    buyChance += getBuyChanceBonus(shopReputation.value)
    if (salePrice > customer.budget) {
      buyChance *= 0.3
    }
    if (salePrice > record.marketPrice * 1.3) {
      buyChance *= 0.5
    }
    if (salePrice < record.marketPrice * 0.7) {
      buyChance *= 1.2
    }
    if (customer.isReturningCustomer) {
      buyChance *= 1.15
    }

    const success = Math.random() < buyChance

    if (success) {
      const profit = salePrice - record.costPrice
      const baseSatisfaction = 50 + finalScore * 0.5 - (salePrice > record.marketPrice ? 20 : 0)
      const memberBonus = customer.isReturningCustomer ? 5 : 0
      const satisfaction = Math.max(30, Math.min(100, baseSatisfaction + memberBonus + conditionImpact.satisfactionModifier))

      budget.value += salePrice
      dailyRevenue.value += salePrice
      dailySalesCount.value += 1
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += satisfaction
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

      salesHistory.value.push({
        recordId: record.id,
        customerId: customer.id,
        salePrice,
        profit,
        timestamp: Date.now(),
        customerSatisfaction: satisfaction,
        memberId: memberProfile?.id || null,
        memberLevel: memberProfile?.level || null,
        growthPointsEarned,
        isMemberPurchase
      })

      slot.inventoryId = null
      slot.conditionScore = null

      if (satisfaction >= 80 && Math.random() < 0.3) {
        addToCollection(record, salePrice, slotConditionScore)
      }

      shopReputation.value = Math.min(100, shopReputation.value + (satisfaction > 60 ? 1 : -1))

      const conditionLabel = getConditionLabel(slotConditionScore)

      return {
        success: true,
        message: `${customer.name} 以 ¥${salePrice} 购买了《${record.title}》！${customer.memberDiscount > 0 ? `（会员折扣${Math.round(customer.memberDiscount * 100)}%）` : ''}${growthPointsEarned > 0 ? ` 获得 ${growthPointsEarned} 成长值` : ''}${conditionImpact.priceModifier !== 1 ? ` 品相${conditionLabel}影响售价` : ''}`,
        satisfaction,
        profit,
        growthPoints: growthPointsEarned,
        isMemberPurchase,
        memberLevel: memberProfile?.level || null
      }
    } else {
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += 30
      shopReputation.value = Math.max(0, shopReputation.value - 1)
      return {
        success: false,
        message: `${customer.name} 考虑了一下，还是没有买...`
      }
    }
  }

  const skipCustomer = () => {
    if (currentCustomer.value) {
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += 20
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
      conditionDegraded: dailyConditionDegraded.value
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
        endDay()
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
    levelProgress,
    isLevelComplete,
    memberStats,
    memberLevelProgress,
    isMemberTargetsComplete,
    startLevel,
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
