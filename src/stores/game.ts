import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  GamePhase, Record, InventoryItem, DisplaySlot, 
  Customer, SaleRecord, DailyStats, CollectionItem 
} from '@/types'
import { getLevelById, getNextLevel, getUnlockedGenres } from '@/data/levels'
import { allRecords, getRandomRecords, getRecordById } from '@/data/records'
import { generateDailyCustomers, calculateMatchScore } from '@/data/customers'

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

  const currentLevelConfig = computed(() => getLevelById(currentLevel.value))
  const availableRecords = computed(() => {
    const unlocked = getUnlockedGenres(currentLevel.value)
    return allRecords.filter(r => unlocked.includes(r.genre))
  })
  const shopRecordsForPurchase = computed(() => {
    return getRandomRecords(8, inventory.value.map(i => i.record.id))
  })
  const displayedRecords = computed(() => {
    return displaySlots.value
      .filter(s => s.inventoryId)
      .map(s => {
        const invItem = inventory.value.find(i => i.record.id === s.inventoryId)
        return invItem ? { slot: s, item: invItem } : null
      })
      .filter((item): item is { slot: DisplaySlot; item: InventoryItem } => item !== null)
  })
  const currentCustomer = computed(() => customers.value[currentCustomerIndex.value] || null)
  const isLastDay = computed(() => currentLevelConfig.value ? currentDay.value >= currentLevelConfig.value.days : false)
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
    return currentLevelProfit.value >= config.targetProfit &&
           currentLevelSales.value >= config.targetSales &&
           shopReputation.value >= config.targetSatisfaction
  })

  const initializeDisplaySlots = (count: number) => {
    const slots: DisplaySlot[] = []
    const cols = Math.ceil(Math.sqrt(count))
    for (let i = 0; i < count; i++) {
      slots.push({
        id: i,
        inventoryId: null,
        position: { x: i % cols, y: Math.floor(i / cols) }
      })
    }
    displaySlots.value = slots
  }

  const startLevel = (levelId: number) => {
    const config = getLevelById(levelId)
    if (!config) return

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
    initializeDisplaySlots(config.displaySlots)
    resetDailyStats()
  }

  const resetDailyStats = () => {
    dailyRevenue.value = 0
    dailyCost.value = 0
    dailySalesCount.value = 0
    dailyServedCustomers.value = 0
    dailySatisfactionSum.value = 0
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
        purchaseDate: Date.now()
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
    invItem.quantity -= 1
    return true
  }

  const removeFromDisplay = (slotId: number) => {
    const slot = displaySlots.value.find(s => s.id === slotId)
    if (!slot || !slot.inventoryId) return false

    const invItem = inventory.value.find(i => i.record.id === slot.inventoryId)
    if (invItem) {
      invItem.quantity += 1
    }
    slot.inventoryId = null
    return true
  }

  const startBusinessPhase = () => {
    if (!currentLevelConfig.value) return
    const customerCount = Math.min(
      currentLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    customers.value = generateDailyCustomers(customerCount, currentDay.value)
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
    type ScoredRecord = { slot: DisplaySlot; item: InventoryItem; score: number }
    const scored = displayed.map(d => {
      const score = calculateMatchScore(customer, d.item.record)
      let finalScore = score
      if (currentPlayingRecord.value?.id === d.item.record.id) {
        finalScore += 15
      }
      return { ...d, score: finalScore } as ScoredRecord
    }).sort((a, b) => b.score - a.score)
    return scored
  }

  const trySellToCustomer = (inventoryId: string, customPrice?: number) => {
    const customer = currentCustomer.value
    if (!customer) return { success: false, message: '没有顾客' }

    const slot = displaySlots.value.find(s => s.inventoryId === inventoryId)
    const invItem = inventory.value.find(i => i.record.id === inventoryId)
    if (!slot || !invItem) return { success: false, message: '唱片不存在' }

    const record = invItem.record
    const salePrice = customPrice || record.marketPrice
    const score = calculateMatchScore(customer, record)
    const finalScore = currentPlayingRecord.value?.id === record.id ? score + 15 : score

    let buyChance = finalScore / 100
    if (salePrice > customer.budget) {
      buyChance *= 0.3
    }
    if (salePrice > record.marketPrice * 1.3) {
      buyChance *= 0.5
    }
    if (salePrice < record.marketPrice * 0.7) {
      buyChance *= 1.2
    }

    const success = Math.random() < buyChance

    if (success) {
      const profit = salePrice - record.costPrice
      const satisfaction = Math.max(30, Math.min(100, 
        50 + finalScore * 0.5 - (salePrice > record.marketPrice ? 20 : 0)
      ))

      budget.value += salePrice
      dailyRevenue.value += salePrice
      dailySalesCount.value += 1
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += satisfaction
      currentLevelProfit.value += profit
      currentLevelSales.value += 1
      totalProfit.value += profit

      salesHistory.value.push({
        recordId: record.id,
        customerId: customer.id,
        salePrice,
        profit,
        timestamp: Date.now(),
        customerSatisfaction: satisfaction
      })

      slot.inventoryId = null

      if (satisfaction >= 80 && Math.random() < 0.3) {
        addToCollection(record, salePrice)
      }

      shopReputation.value = Math.min(100, shopReputation.value + (satisfaction > 60 ? 1 : -1))

      return { 
        success: true, 
        message: `${customer.name} 以 ¥${salePrice} 购买了《${record.title}》！`,
        satisfaction,
        profit
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

  const endDay = () => {
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
      avgSatisfaction
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
            }
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

  const addToCollection = (record: Record, purchasePrice: number) => {
    if (collection.value.some(c => c.record.id === record.id)) return
    
    collection.value.push({
      record,
      acquiredDate: Date.now(),
      purchasePrice,
      isFavorite: false,
      notes: ''
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
    currentLevelConfig,
    availableRecords,
    shopRecordsForPurchase,
    displayedRecords,
    currentCustomer,
    isLastDay,
    canAdvancePhase,
    levelProgress,
    isLevelComplete,
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
    goToNextLevel,
    restartLevel,
    getRecordById
  }
})
