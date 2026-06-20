import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GamePhase, Record, InventoryItem, DisplaySlot,
  Customer, SaleRecord, DailyStats, CollectionItem,
  MemberProfile, MemberLevel, MemberStats, LevelReward,
  LevelEvaluation, Supplier, SupplierInventoryItem, RecordPerformance,
  TimeSlot, TimeSlotStats, BargainState, BargainRound,
  ActiveBusinessEvent, LostSaleReason, HotGenre,
  CustomerProfileSnapshot, CustomerProfileShift, DailySuggestion, DailyBusinessReview,
  OverstockInfo, OverstockStatus, DailyOverstockPenalty,
  ActivePromotion, PromotionApplicationResult,
  Reservation, ReservationItem, ReservationSummary,
  AuctionItem, BidRecord, FrozenFund, AuctionSettlement,
  RareCollectorConfig, ActiveRareCollector, PendingCollectorOffer,
  AuctionHouseStats, CollectionSourceType, CollectionSource
} from '@/types'
import { getLevelById, getNextLevel, getUnlockedGenres, getScaledLevelConfig } from '@/data/levels'
import { allRecords, getRandomRecords, getRecordById } from '@/data/records'
import {
  generateDailyCustomers,
  calculateMatchScore,
  createMemberProfile,
  generateCustomerBargainOffer,
  generateCustomerCounterOffer,
  calculateBargainSatisfactionBonus,
  defaultPatienceConfig,
  getPatienceLevel,
  getPatienceLevelLabel,
  getPatienceLevelColor,
  calculatePatienceDecay,
  applyPatienceDecay,
  sortCustomerQueue,
  calculateIdentitySatisfactionModifier,
  getIdentityCollectionChanceBonus,
  getIdentityTagInfo
} from '@/data/customers'
import type { Genre } from '@/types'
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
  calculateLevelEvaluation,
  getBudgetWithReputation
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
  generatePurchaseRecommendation,
  calculateOverstockInfo,
  calculateTotalDailyPenalty,
  generateOverstockWarnings,
  generatePurchaseRiskWarning,
  calculateDisplayPriorityBoost,
  getOverstockStatus
} from '@/data/performance'
import {
  getTimeSlotConfig,
  getCustomerCountForSlot,
  getPlayBoostForSlot,
  getImpulseBuyChance,
  adjustPriceSensitivity
} from '@/data/timeSlots'
import {
  albumCategories,
  specialCustomers,
  checkAlbumActivation,
  activateAlbum,
  getActivatedBonuses,
  getTotalAlbumStats,
  calculateTotalAlbumBonus,
  getCollectionValueBonus,
  getFavoriteBonuses
} from '@/data/album'
import { rollDailyEvent, getEventEffectSummary } from '@/data/events'
import {
  calculateThemeMatches,
  getActiveThemes,
  getTotalThemeMatchScoreBonus,
  getTotalThemeBuyChanceBonus,
  getPlaybackThemeBonus,
  themes
} from '@/data/themeDisplay'
import {
  createEmptyAtmosphereMap,
  applyPlaybackAtmosphere,
  decayAtmosphere,
  getGenrePatienceSlowdown,
  getGenreRecommendationBoost,
  getGenreBuyChanceBoost,
  calculateDailyAtmosphereReputationBonus,
  getAverageAtmosphereValue,
  getTopAtmosphereGenres,
  getAllGenreAtmospheres,
  getGenreAtmosphere
} from '@/data/atmosphere'
import type {
  AlbumState,
  SpecialCustomerConfig,
  CollectionBonus,
  AlbumBonusType,
  ThemeMatchResult,
  ThemeConfig,
  GenreAtmosphere
} from '@/types'
import {
  getPromotionsForDay,
  isRecordEligibleForPromotion,
  findBestPromotionForRecord,
  applyPromotionToPrice,
  getPromotionReputationImpact,
  getPromotionSatisfactionBonus,
  getPromotionBuyChanceBoost,
  getAvailablePromotionsForLevel
} from '@/data/promotions'
import {
  generateDailyMarketHeat,
  getGenreMarketHeat,
  getHottestGenres,
  getColdestGenres
} from '@/data/marketHeat'
import type { GenreMarketHeat, StaffState, StaffSkillType } from '@/types'
import {
  createInitialStaffState,
  upgradeStaffSkill as upgradeStaffSkillData,
  addStaffPoints as addStaffPointsData
} from '@/data/staff'
import {
  generateRecordStory,
  generateRecordAchievements,
  generateDisplayCopy
} from '@/data/stories'
import {
  generateDailyAuctions,
  createBidRecord,
  getMinNextBid,
  canPlaceBid,
  checkAuctionEnding,
  createInitialAuctionStats,
  rareCollectorConfigs,
  checkCollectorUnlock,
  generateCollectorBid,
  generateCollectorOffer,
  sourceConfigs
} from '@/data/auctions'

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
  const genreAtmosphere = ref<Map<Genre, number>>(createEmptyAtmosphereMap())
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
  const currentLevelGenreSales = ref<Map<Genre, number>>(new Map())
  const currentLevelSatisfactionSum = ref(0)
  const currentLevelSatisfactionCount = ref(0)

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

  const patienceTickTimer = ref<number | null>(null)
  const consecutiveSkips = ref(0)
  const customersLeftAngrily = ref(0)
  const dailyLostSales = ref<Map<LostSaleReason, number>>(new Map())

  const overstockPenalties = ref<Map<string, number>>(new Map())
  const dailyOverstockPenalty = ref<DailyOverstockPenalty | null>(null)
  const totalOverstockPenaltyAccumulated = ref(0)

  const dailyEvent = ref<ActiveBusinessEvent | null>(null)
  const levelEvents = ref<ActiveBusinessEvent[]>([])
  const eventCustomerCountModifier = ref(0)
  const eventBudgetModifier = ref(0)
  const eventBuyChanceModifier = ref(0)
  const eventSatisfactionModifier = ref(0)
  const eventConditionPenalty = ref(0)

  const albumState = ref<AlbumState>({
    categories: JSON.parse(JSON.stringify(albumCategories)),
    activatedBonuses: [],
    totalActivated: 0,
    totalAvailable: getTotalAlbumStats(albumCategories).totalAvailable
  })

  const staff = ref<StaffState>(createInitialStaffState())

  const specialCustomersState = ref<SpecialCustomerConfig[]>(JSON.parse(JSON.stringify(specialCustomers)))
  const collectionBonuses = ref<CollectionBonus[]>([])
  const recentlyActivatedAlbums = ref<string[]>([])

  const activePromotions = ref<ActivePromotion[]>([])
  const dailyPromotionSales = ref(0)
  const dailyPromotionGiftsGiven = ref(0)
  const dailyPromotionDiscountGiven = ref(0)
  const promotionHistory = ref<Map<string, ActivePromotion>>(new Map())
  const pendingBuyGiftPurchases = ref<Map<string, number>>(new Map())

  const genreMarketHeat = ref<Map<Genre, GenreMarketHeat>>(new Map())
  const previousDayHotGenres = ref<HotGenre[]>([])

  const reservations = ref<Reservation[]>([])
  const dailyReservationFulfilledCount = ref(0)
  const dailyReservationMissedCount = ref(0)
  const reservationNotes = ref<Map<string, string>>(new Map())

  const currentAuctionItems = ref<AuctionItem[]>([])
  const auctionHistory = ref<AuctionItem[]>([])
  const frozenFunds = ref<FrozenFund[]>([])
  const settlements = ref<AuctionSettlement[]>([])
  const rareCollectors = ref<RareCollectorConfig[]>(JSON.parse(JSON.stringify(rareCollectorConfigs)))
  const activeRareCollectors = ref<ActiveRareCollector[]>([])
  const pendingCollectorOffers = ref<PendingCollectorOffer[]>([])
  const auctionHouseStats = ref<AuctionHouseStats>(createInitialAuctionStats())
  const nextAuctionRefresh = ref(1)
  const isAuctionHouseOpen = ref(true)
  const selectedAuctionFilter = ref('all')
  const selectedAuctionId = ref<string | null>(null)

  const totalFrozenFunds = computed(() => {
    return frozenFunds.value
      .filter(f => f.status === 'frozen')
      .reduce((sum, f) => sum + f.amount, 0)
  })

  const availableBudgetForAuctions = computed(() => {
    return budget.value - totalFrozenFunds.value
  })

  const activeAuctions = computed(() => {
    return currentAuctionItems.value.filter(a => a.status === 'active')
  })

  const upcomingAuctions = computed(() => {
    return currentAuctionItems.value.filter(a => a.status === 'upcoming')
  })

  const endedAuctions = computed(() => {
    return currentAuctionItems.value.filter(a => a.status === 'ended' || a.status === 'settled' || a.status === 'cancelled')
  })

  const unlockedRareCollectors = computed(() => {
    const activatedIds = getActivatedAlbumIds()
    return rareCollectors.value.filter(c => {
      const result = checkCollectorUnlock(c, activatedIds, shopReputation.value, collection.value.length)
      return result.unlocked
    })
  })

  const rareCollectorAuctions = computed(() => {
    return currentAuctionItems.value.filter(a => a.linkedRareCustomerId !== null)
  })

  const totalCollectionValue = computed(() => {
    return collection.value.reduce((sum, item) => sum + item.collectionValue, 0)
  })

  const favoriteCount = computed(() => {
    return collection.value.filter(c => c.isFavorite).length
  })

  const activatedAlbumBonuses = computed(() => {
    return getActivatedBonuses(albumState.value.categories)
  })

  const getAlbumBonus = (bonusType: AlbumBonusType): number => {
    const albumValue = calculateTotalAlbumBonus(activatedAlbumBonuses.value, bonusType)
    const collectionValue = collectionBonuses.value
      .filter(b => b.bonusType === bonusType)
      .reduce((sum, b) => sum + b.value, 0)
    return albumValue + collectionValue
  }

  const reputationBonusFromCollection = computed(() => getAlbumBonus('reputation'))
  const customerBudgetBonus = computed(() => getAlbumBonus('customer_budget'))
  const matchScoreBonusFromCollection = computed(() => getAlbumBonus('match_score'))
  const buyChanceBonusFromCollection = computed(() => getAlbumBonus('buy_chance'))
  const levelRewardBonus = computed(() => getAlbumBonus('level_reward'))
  const specialCustomerBonus = computed(() => getAlbumBonus('special_customer'))
  const priceBonusFromCollection = computed(() => getAlbumBonus('price_bonus'))
  const recordUnlockBonus = computed(() => getAlbumBonus('record_unlock'))

  const reservationSummary = computed<ReservationSummary>(() => {
    const pendingList = reservations.value.filter(r =>
      r.targetDay === currentDay.value && (r.status === 'pending' || r.status === 'confirmed')
    )
    const fulfilledList = reservations.value.filter(r =>
      r.targetDay === currentDay.value && r.status === 'fulfilled'
    )
    const requiredRecordIds: string[] = []
    const genreCountMap = new Map<Genre, number>()
    let estimatedRevenue = 0

    for (const r of pendingList) {
      for (const item of r.items) {
        if (!item.isFulfilled) {
          requiredRecordIds.push(item.recordId)
          const count = genreCountMap.get(item.genre) || 0
          genreCountMap.set(item.genre, count + 1)
          const rec = getRecordById(item.recordId)
          if (rec) {
            estimatedRevenue += rec.marketPrice * item.quantity
          }
        }
      }
    }

    const requiredGenres: { genre: Genre; count: number }[] = []
    for (const [genre, count] of genreCountMap.entries()) {
      requiredGenres.push({ genre, count })
    }

    return {
      totalReservations: pendingList.length + fulfilledList.length,
      pendingCount: pendingList.length,
      fulfilledCount: fulfilledList.length,
      totalDeposit: pendingList.reduce((sum, r) => sum + r.deposit, 0),
      estimatedRevenue,
      requiredRecordIds: [...new Set(requiredRecordIds)],
      requiredGenres: requiredGenres.sort((a, b) => b.count - a.count)
    }
  })

  const baseLevelConfig = computed(() => getLevelById(currentLevel.value))
  const currentLevelConfig = computed(() => getScaledLevelConfig(currentLevel.value, shopReputation.value))
  const wordOfMouthConfig = computed(() => getWordOfMouthTier(shopReputation.value))
  const difficultyScale = computed(() => wordOfMouthConfig.value.difficultyScale)
  const currentTimeSlotConfig = computed(() => getTimeSlotConfig(currentTimeSlot.value))
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
    return getRandomRecords(8, inventory.value.map(i => i.record.id), recordUnlockBonus.value)
  })

  const inventoryRiskScore = computed(() => {
    return calculateInventoryRiskScore(inventory.value, recordPerformances.value, currentDay.value)
  })

  const overstockConfig = computed(() => {
    return currentLevelConfig.value?.overstockConfig || null
  })

  const overstockInfos = computed<OverstockInfo[]>(() => {
    if (!overstockConfig.value) return []
    const displayedRecordIds = new Set(
      displaySlots.value.filter(s => s.inventoryId).map(s => s.inventoryId!)
    )
    return inventory.value
      .filter(item => item.quantity > 0)
      .map(item => calculateOverstockInfo(
        item,
        recordPerformances.value,
        currentDay.value,
        displayedRecordIds,
        overstockConfig.value!,
        overstockPenalties.value
      ))
  })

  const overstockWarnings = computed(() => {
    return generateOverstockWarnings(overstockInfos.value)
  })

  const problemInventoryCount = computed(() => {
    return overstockInfos.value.filter(i => i.status !== 'normal').length
  })

  const totalDailyOverstockPenalty = computed(() => {
    return overstockInfos.value.reduce((sum, i) => sum + i.dailyPenalty, 0)
  })

  const effectiveProfit = computed(() => {
    return currentLevelProfit.value - totalOverstockPenaltyAccumulated.value
  })

  const levelEvaluation = computed<LevelEvaluation | null>(() => {
    const config = currentLevelConfig.value
    if (!config) return null
    const genreSalesMap = new Map<string, number>()
    for (const [genre, data] of genreSalesProgress.value.entries()) {
      genreSalesMap.set(genre, data.progress)
    }
    return calculateLevelEvaluation(
      effectiveProfit.value,
      config.targetProfit,
      currentLevelSales.value,
      config.targetSales,
      shopReputation.value,
      config.targetSatisfaction,
      levelStartReputation.value,
      genreSalesMap,
      collectionProgress.value.overall,
      avgSatisfactionProgress.value.progress
    )
  })

  const purchaseRecommendations = computed(() => {
    const simplifiedRecords = allRecords.map(r => ({ id: r.id, genre: r.genre as Genre }))
    return generatePurchaseRecommendation(
      recordPerformances.value,
      inventory.value,
      budget.value,
      genreMarketHeat.value,
      simplifiedRecords
    )
  })

  const supplierStats = computed(() => {
    return (supplierId: string) => {
      return supplierPurchaseHistory.value.get(supplierId) || { totalSpent: 0, totalItems: 0 }
    }
  })

  const hottestGenresToday = computed(() => getHottestGenres(genreMarketHeat.value, 3))
  const coldestGenresToday = computed(() => getColdestGenres(genreMarketHeat.value, 3))

  const getGenreHeat = (genre: Genre): GenreMarketHeat => {
    return getGenreMarketHeat(genreMarketHeat.value, genre)
  }
  const displayedRecords = computed(() => {
    return displaySlots.value
      .filter(s => s.inventoryId && s.conditionScore !== null)
      .map(s => {
        const invItem = inventory.value.find(i => i.record.id === s.inventoryId)
        return invItem ? { slot: s, item: invItem, conditionScore: s.conditionScore as number } : null
      })
      .filter((item): item is { slot: DisplaySlot; item: InventoryItem; conditionScore: number } => item !== null)
  })

  const themeMatches = computed<ThemeMatchResult[]>(() => {
    return calculateThemeMatches(displaySlots.value, inventory.value)
  })

  const activeThemes = computed<ThemeMatchResult[]>(() => {
    return getActiveThemes(displaySlots.value, inventory.value)
  })

  const themeMatchScoreBonus = computed(() => {
    return getTotalThemeMatchScoreBonus(displaySlots.value, inventory.value)
  })

  const themeBuyChanceBonus = computed(() => {
    return getTotalThemeBuyChanceBonus(displaySlots.value, inventory.value)
  })

  const playbackThemeBonus = computed(() => {
    return getPlaybackThemeBonus(currentPlayingRecord.value, displaySlots.value, inventory.value)
  })

  const allThemes = computed<ThemeConfig[]>(() => themes)

  const activeEventSummary = computed<string[]>(() => {
    if (!dailyEvent.value) return []
    return getEventEffectSummary(dailyEvent.value)
  })

  const hasActiveEvent = computed(() => dailyEvent.value !== null)

  const availablePromotionsForCurrentLevel = computed(() => {
    return getAvailablePromotionsForLevel(currentLevel.value)
  })

  const todayPromotions = computed(() => {
    return getPromotionsForDay(currentLevel.value, currentDay.value)
  })

  const hasActivePromotions = computed(() => activePromotions.value.length > 0)

  const totalPromotionDiscountToday = computed(() => dailyPromotionDiscountGiven.value)

  const getActivePromotionForRecord = (record: Record): ActivePromotion | null => {
    return findBestPromotionForRecord(record, activePromotions.value)
  }

  const isRecordOnPromotion = (record: Record): boolean => {
    return findBestPromotionForRecord(record, activePromotions.value) !== null
  }

  const getRecordPromotionPrice = (basePrice: number, record: Record): PromotionApplicationResult => {
    return applyPromotionToPrice(basePrice, record, activePromotions.value)
  }

  const getPromotionBuyChanceForRecord = (record: Record): number => {
    return getPromotionBuyChanceBoost(activePromotions.value, record)
  }

  const getPromotionSatisfactionForRecord = (record: Record): number => {
    return getPromotionSatisfactionBonus(activePromotions.value, record)
  }

  const refreshActivePromotions = () => {
    const todayConfigs = getPromotionsForDay(currentLevel.value, currentDay.value)
    const existingIds = new Set(activePromotions.value.map(ap => ap.config.id))

    for (const config of todayConfigs) {
      if (!existingIds.has(config.id)) {
        const newPromotion: ActivePromotion = {
          config,
          activationDay: currentDay.value,
          totalSalesCount: 0,
          totalRevenue: 0,
          giftGivenCount: 0
        }
        activePromotions.value.push(newPromotion)
        promotionHistory.value.set(config.id, newPromotion)
      }
    }

    activePromotions.value = activePromotions.value.filter(ap =>
      currentDay.value >= ap.config.startDay && currentDay.value <= ap.config.endDay
    )
  }

  const recordPromotionSale = (promotionId: string, revenue: number, isGift: boolean = false) => {
    const promotion = activePromotions.value.find(ap => ap.config.id === promotionId)
    if (!promotion) return

    if (isGift) {
      promotion.giftGivenCount += 1
      dailyPromotionGiftsGiven.value += 1
    } else {
      promotion.totalSalesCount += 1
      promotion.totalRevenue += revenue
      dailyPromotionSales.value += 1
    }

    const historyEntry = promotionHistory.value.get(promotionId)
    if (historyEntry) {
      if (isGift) {
        historyEntry.giftGivenCount += 1
      } else {
        historyEntry.totalSalesCount += 1
        historyEntry.totalRevenue += revenue
      }
    }
  }

  const resetDailyPromotionStats = () => {
    dailyPromotionSales.value = 0
    dailyPromotionGiftsGiven.value = 0
    dailyPromotionDiscountGiven.value = 0
    pendingBuyGiftPurchases.value.clear()
  }

  const trackBuyGiftPurchase = (record: Record) => {
    for (const ap of activePromotions.value) {
      if (ap.config.type !== 'buy_gift' || !ap.config.buyGiftConfig) continue
      if (!isRecordEligibleForPromotion(record, ap.config)) continue

      const currentCount = pendingBuyGiftPurchases.value.get(ap.config.id) || 0
      pendingBuyGiftPurchases.value.set(ap.config.id, currentCount + 1)
    }
  }

  const checkAndConsumeBuyGift = (record: Record): { eligible: boolean; promotionId: string | null } => {
    for (const ap of activePromotions.value) {
      if (ap.config.type !== 'buy_gift' || !ap.config.buyGiftConfig) continue
      if (!isRecordEligibleForPromotion(record, ap.config)) continue

      const { buyQuantity, giftQuantity } = ap.config.buyGiftConfig
      const currentCount = pendingBuyGiftPurchases.value.get(ap.config.id) || 0

      if (currentCount >= buyQuantity) {
        pendingBuyGiftPurchases.value.set(ap.config.id, currentCount - buyQuantity + giftQuantity)
        return { eligible: true, promotionId: ap.config.id }
      }
    }
    return { eligible: false, promotionId: null }
  }

  const getPromotionReputationBonus = (): number => {
    return getPromotionReputationImpact(activePromotions.value, dailyPromotionSales.value)
  }

  const generateReservationNote = (member: MemberProfile | null, preferredGenres: Genre[]): string => {
    const genreStr = preferredGenres.length > 0 ? preferredGenres.slice(0, 2).join('、') : ''
    const notes = [
      '上次在店里淘到的那张唱片太喜欢了，这次想再找找类似的！',
      '朋友推荐我来预约，听说你们的选品很有品味~',
      '一直关注你们店的更新，特地提前来留个位子！',
      '上次和老板聊得很投机，这次提前约好再来逛逛！',
      '家里的收藏柜还缺一张这个风格的精品！',
      '听说最近到了一批好货，先预约确保能抢到！',
      '是老顾客推荐我来预约的，据说品质有保障！',
      '最近在研究这个流派，想找一些经典专辑收藏！',
      genreStr ? `特别喜欢${genreStr}这类风格，希望能找到惊喜！` : '想多探索一些不同风格的好唱片！'
    ]
    if (member) {
      const levelNotes = [
        `作为${member.level}会员，希望有惊喜！`,
        '会员专享预约，期待专属服务~',
        `来给我的${member.level}会员等级再添点收藏！`
      ]
      return levelNotes[Math.floor(Math.random() * levelNotes.length)] + ' ' + notes[Math.floor(Math.random() * notes.length)]
    }
    return notes[Math.floor(Math.random() * notes.length)]
  }

  const generateReservationsForNextDay = () => {
    if (!baseLevelConfig.value) return
    const nextDay = currentDay.value + 1
    if (nextDay > baseLevelConfig.value.days) return

    const eligibleMembers: MemberProfile[] = []
    for (const m of members.value) {
      const recentVisit = currentDay.value - m.lastVisitDate <= 3
      const highActivity = m.visitCount >= 2 || m.totalSpent >= 500
      const goodStanding = m.level !== 'Bronze' || m.visitCount >= 3
      if ((recentVisit || highActivity) && goodStanding) {
        eligibleMembers.push(m)
      }
    }

    const highSatisfactionToday = customers.value.filter(c =>
      c.isReturningCustomer && !c.memberProfile && c.satisfaction >= 70
    )

    const baseCount = Math.max(0, Math.min(
      3 + Math.floor(shopReputation.value / 25),
      eligibleMembers.length + Math.floor(highSatisfactionToday.length / 2)
    ))

    const levelModifier = Math.min(1, 0.4 + currentLevel.value * 0.1)
    const finalCount = Math.floor(baseCount * levelModifier)

    if (finalCount <= 0) return

    const shuffledMembers = [...eligibleMembers].sort(() => Math.random() - 0.5)
    const unlockedGenres = getUnlockedGenres(currentLevel.value)
    let arrivalCounter = 0

    for (let i = 0; i < Math.min(finalCount, shuffledMembers.length); i++) {
      const member = shuffledMembers[i]
      const timeSlot: TimeSlot = Math.random() < 0.5 ? 'afternoon' : 'night'
      const itemCount = 1 + (member.level === 'Diamond' || member.level === 'Platinum' ? Math.floor(Math.random() * 2) : 0)

      const items: ReservationItem[] = []
      for (let j = 0; j < itemCount; j++) {
        const preferredGenre = member.favoriteGenres[Math.floor(Math.random() * member.favoriteGenres.length)] || unlockedGenres[0]
        const genreRecords = allRecords.filter(r =>
          r.genre === preferredGenre &&
          unlockedGenres.includes(r.genre) &&
          member.preferredRarity.some(pr => Math.abs(pr - r.rarity) <= 1)
        )
        const candidateRecords = genreRecords.length > 0
          ? genreRecords
          : allRecords.filter(r => unlockedGenres.includes(r.genre))
        const selectedRecord = candidateRecords[Math.floor(Math.random() * candidateRecords.length)]

        if (selectedRecord) {
          items.push({
            recordId: selectedRecord.id,
            recordTitle: selectedRecord.title,
            genre: selectedRecord.genre,
            targetRarity: member.preferredRarity,
            minCondition: 60,
            quantity: 1,
            isFulfilled: false,
            reservedInventoryId: null
          })
        }
      }

      if (items.length === 0) continue

      const levelDepositMap: { [key: string]: number } = {
        Diamond: 200,
        Platinum: 150,
        Gold: 100,
        Silver: 60,
        Bronze: 30
      }
      const estimatedTotal = items.reduce((sum, it) => {
        const rec = getRecordById(it.recordId)
        return sum + (rec ? rec.marketPrice : 300)
      }, 0)

      const reservation: Reservation = {
        id: `res-${nextDay}-${i}-${Date.now()}`,
        customerName: member.name,
        customerAvatar: member.avatar,
        memberProfile: member,
        isReturningCustomer: true,
        memberLevel: member.level,
        dayCreated: currentDay.value,
        targetDay: nextDay,
        timeSlot,
        status: 'confirmed',
        items,
        deposit: levelDepositMap[member.level] || 50,
        totalBudget: Math.floor(estimatedTotal * (1.3 + Math.random() * 0.7)),
        note: generateReservationNote(member, member.favoriteGenres),
        priorityScore: 80 + (member.level === 'Diamond' ? 30 : member.level === 'Platinum' ? 20 : member.level === 'Gold' ? 10 : 0),
        satisfactionBonus: 10,
        customerId: null,
        arrivalOrder: arrivalCounter++
      }

      reservations.value.push(reservation)
    }

    const nonMemberSlots = finalCount - reservations.value.filter(r => r.targetDay === nextDay).length
    if (nonMemberSlots > 0 && highSatisfactionToday.length > 0) {
      const shuffledReturning = [...highSatisfactionToday].sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(nonMemberSlots, shuffledReturning.length); i++) {
        const cust = shuffledReturning[i]
        const timeSlot: TimeSlot = Math.random() < 0.5 ? 'afternoon' : 'night'
        const preferredGenre = cust.preference.favoriteGenres[Math.floor(Math.random() * cust.preference.favoriteGenres.length)] || unlockedGenres[0]
        const genreRecords = allRecords.filter(r =>
          r.genre === preferredGenre &&
          unlockedGenres.includes(r.genre)
        )
        const candidateRecords = genreRecords.length > 0
          ? genreRecords
          : allRecords.filter(r => unlockedGenres.includes(r.genre))
        const selectedRecord = candidateRecords[Math.floor(Math.random() * candidateRecords.length)]

        if (!selectedRecord) continue

        const item: ReservationItem = {
          recordId: selectedRecord.id,
          recordTitle: selectedRecord.title,
          genre: selectedRecord.genre,
          targetRarity: cust.preference.preferredRarity,
          minCondition: 50,
          quantity: 1,
          isFulfilled: false,
          reservedInventoryId: null
        }

        const reservation: Reservation = {
          id: `res-${nextDay}-ret-${i}-${Date.now()}`,
          customerName: cust.name,
          customerAvatar: cust.avatar,
          memberProfile: null,
          isReturningCustomer: true,
          memberLevel: null,
          dayCreated: currentDay.value,
          targetDay: nextDay,
          timeSlot,
          status: 'pending',
          items: [item],
          deposit: 20,
          totalBudget: Math.floor(cust.budget * (1.2 + Math.random() * 0.5)),
          note: generateReservationNote(null, cust.preference.favoriteGenres),
          priorityScore: 55,
          satisfactionBonus: 5,
          customerId: null,
          arrivalOrder: arrivalCounter++
        }

        reservations.value.push(reservation)
      }
    }
  }

  const updateReservationOnSale = (recordId: string, customer: Customer) => {
    if (!customer.reservationId) return

    const reservation = reservations.value.find(r => r.id === customer.reservationId)
    if (!reservation) return

    for (const item of reservation.items) {
      if (item.recordId === recordId && !item.isFulfilled) {
        item.isFulfilled = true
        item.reservedInventoryId = recordId
      }
    }

    const allFulfilled = reservation.items.every(item => item.isFulfilled)
    if (allFulfilled) {
      reservation.status = 'fulfilled'
      dailyReservationFulfilledCount.value++
    }
  }

  const finalizeMissedReservations = () => {
    const missedList = reservations.value.filter(r =>
      r.targetDay === currentDay.value &&
      (r.status === 'pending' || r.status === 'confirmed')
    )
    for (const r of missedList) {
      r.status = 'no_show'
      dailyReservationMissedCount.value++
    }
  }

  const refreshDailyAuctions = () => {
    if (!baseLevelConfig.value) return
    
    const activatedIds = getActivatedAlbumIds()
    for (let i = 0; i < rareCollectors.value.length; i++) {
      const result = checkCollectorUnlock(rareCollectors.value[i], activatedIds, shopReputation.value, collection.value.length)
      rareCollectors.value[i].isUnlocked = result.unlocked
    }
    
    currentAuctionItems.value = currentAuctionItems.value.filter(a => {
      if (a.status === 'settled' || a.status === 'cancelled') {
        auctionHistory.value.push(a)
        return false
      }
      return true
    })
    
    for (let i = 0; i < currentAuctionItems.value.length; i++) {
      currentAuctionItems.value[i] = checkAuctionEnding(currentAuctionItems.value[i], currentDay.value)
    }
    
    for (const auction of currentAuctionItems.value) {
      if (auction.status === 'upcoming' && auction.startTime <= currentDay.value) {
        auction.status = 'active'
      }
    }
    
    if (currentDay.value >= nextAuctionRefresh.value) {
      const excludeIds = [
        ...inventory.value.map(i => i.record.id),
        ...currentAuctionItems.value.map(a => a.record.id),
        ...collection.value.map(c => c.record.id)
      ]
      const unlockedGenres = getUnlockedGenres(currentLevel.value)
      const newAuctions = generateDailyAuctions(
        currentDay.value,
        currentLevel.value,
        excludeIds,
        unlockedGenres,
        recordUnlockBonus.value,
        specialCustomerBonus.value
      )
      
      const unlockedCollectors = rareCollectors.value.filter(c => c.isUnlocked)
      for (const collector of unlockedCollectors) {
        if (Math.random() < 0.3 + collector.relationshipLevel * 0.05) {
          const preferredRecords = allRecords.filter(r =>
            !excludeIds.includes(r.id) &&
            unlockedGenres.includes(r.genre) &&
            collector.favoriteGenres.includes(r.genre) &&
            collector.preferredRarity.includes(r.rarity)
          )
          if (preferredRecords.length > 0) {
            const target = preferredRecords[Math.floor(Math.random() * preferredRecords.length)]
            const specialAuction = generateDailyAuctions(
              currentDay.value,
              currentLevel.value,
              [...excludeIds, target.id],
              unlockedGenres,
              recordUnlockBonus.value + 0.3,
              specialCustomerBonus.value
            )[0]
            if (specialAuction) {
              specialAuction.record = target
              specialAuction.linkedRareCustomerId = collector.id
              specialAuction.isRareItem = true
              specialAuction.provenance = `${collector.title}${collector.name}特别推荐：${specialAuction.provenance}`
              newAuctions.push(specialAuction)
              auctionHouseStats.value.rareCollectorEncounters++
            }
          }
        }
      }
      
      currentAuctionItems.value = [...currentAuctionItems.value, ...newAuctions]
      nextAuctionRefresh.value = currentDay.value + 2
      
      for (const collector of unlockedCollectors) {
        const offer = generateCollectorOffer(collector, availableRecords.value, currentDay.value)
        if (offer) {
          pendingCollectorOffers.value = pendingCollectorOffers.value.filter(o => o.collectorId !== collector.id)
          pendingCollectorOffers.value.push(offer)
        }
      }
    }
    
    processRareCollectorBids()
  }

  const processRareCollectorBids = () => {
    const unlockedCollectors = rareCollectors.value.filter(c => c.isUnlocked)
    
    for (const auction of currentAuctionItems.value) {
      if (auction.status !== 'active') continue
      
      for (const collector of unlockedCollectors) {
        const isLastDay = currentDay.value >= auction.endTime
        const snipeTrigger = isLastDay && Math.random() < collector.snipeChance
        const normalChance = collector.bidAggressiveness * 0.4
        
        if (!snipeTrigger && !(Math.random() < normalChance)) continue
        
        const collectorBudget = collector.budgetRange[0] + Math.random() * (collector.budgetRange[1] - collector.budgetRange[0])
        const bidResult = generateCollectorBid(collector, auction, auction.currentBid, collectorBudget)
        
        if (bidResult) {
          const bid = createBidRecord(
            auction.id,
            collector.id,
            collector.name,
            collector.avatar,
            bidResult.bidAmount,
            null,
            true,
            snipeTrigger,
            bidResult.maxBid
          )
          
          applyBidToAuction(auction.id, bid, false)
        }
      }
    }
  }

  const applyBidToAuction = (auctionId: string, bid: BidRecord, isPlayerBid: boolean) => {
    const auction = currentAuctionItems.value.find(a => a.id === auctionId)
    if (!auction || auction.status !== 'active') return { success: false, message: '拍卖不存在或已结束' }
    
    const validation = canPlaceBid(auction, bid.bidAmount, Number.MAX_SAFE_INTEGER, 0)
    if (!validation.valid) return { success: false, message: validation.reason }
    
    if (auction.bidHistory.length > 0) {
      auction.bidHistory[auction.bidHistory.length - 1].isWinningBid = false
    }
    
    if (isPlayerBid) {
      const previousBid = auction.bidHistory.find(b => b.bidderId === 'player')
      if (previousBid) {
        releaseFrozenFundsForBid(auctionId, 'player')
      }
      freezeFunds('player', auctionId, bid.bidAmount, '拍卖出价冻结')
    }
    
    auction.bidHistory.push(bid)
    auction.currentBid = bid.bidAmount
    auction.bidCount = auction.bidHistory.length
    
    return { success: true, message: '出价成功' }
  }

  const placeAuctionBid = (auctionId: string, bidAmount: number, maxBid: number = bidAmount): { success: boolean; message: string } => {
    const auction = currentAuctionItems.value.find(a => a.id === auctionId)
    if (!auction) return { success: false, message: '拍卖不存在' }
    
    const validation = canPlaceBid(auction, bidAmount, budget.value, totalFrozenFunds.value)
    if (!validation.valid) return { success: false, message: validation.reason }
    
    const bid = createBidRecord(
      auctionId,
      'player',
      '我',
      '🧑',
      bidAmount,
      members.value.length > 0 ? (members.value.sort((a, b) => b.totalSpent - a.totalSpent)[0].level) : null,
      false,
      false,
      maxBid
    )
    
    return applyBidToAuction(auctionId, bid, true)
  }

  const freezeFunds = (bidderId: string, auctionItemId: string, amount: number, reason: string) => {
    const frozen: FrozenFund = {
      id: `frozen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bidderId,
      auctionItemId,
      amount,
      frozenAt: Date.now(),
      releasedAt: null,
      status: 'frozen',
      reason
    }
    frozenFunds.value.push(frozen)
    return frozen
  }

  const releaseFrozenFundsForBid = (auctionItemId: string, bidderId: string) => {
    const funds = frozenFunds.value.filter(f => 
      f.auctionItemId === auctionItemId && 
      f.bidderId === bidderId && 
      f.status === 'frozen'
    )
    for (const f of funds) {
      f.status = 'released'
      f.releasedAt = Date.now()
    }
  }

  const settleAuction = (auctionId: string, shouldAddToCollection: boolean = true): { success: boolean; message: string; settlement?: AuctionSettlement } => {
    const auction = currentAuctionItems.value.find(a => a.id === auctionId)
    if (!auction) return { success: false, message: '拍卖不存在' }
    if (auction.status !== 'ended') return { success: false, message: '拍卖尚未结束' }
    
    const isWinner = auction.winnerId === 'player'
    
    let settlement: AuctionSettlement | null = null
    
    if (isWinner && auction.finalSalePrice) {
      const fee = Math.round(auction.finalSalePrice * 0.08)
      const buyerTotal = auction.finalSalePrice + fee
      
      const playerFrozen = frozenFunds.value.find(f => 
        f.auctionItemId === auctionId && 
        f.bidderId === 'player' && 
        f.status === 'frozen'
      )
      
      if (playerFrozen) {
        if (playerFrozen.amount < auction.finalSalePrice) {
          const additional = auction.finalSalePrice - playerFrozen.amount + fee
          if (budget.value < additional) {
            return { success: false, message: `资金不足！还需要 ¥${additional}` }
          }
          budget.value -= additional
          playerFrozen.status = 'deducted'
          playerFrozen.releasedAt = Date.now()
        } else {
          const refund = playerFrozen.amount - auction.finalSalePrice
          playerFrozen.status = 'deducted'
          playerFrozen.releasedAt = Date.now()
          if (refund > 0) {
            budget.value += refund
          }
          if (budget.value < fee) {
            return { success: false, message: `余额不足以支付手续费，还需 ¥${fee - budget.value}` }
          }
          budget.value -= fee
        }
      } else {
        if (budget.value < buyerTotal) {
          return { success: false, message: `资金不足！需要 ¥${buyerTotal}` }
        }
        budget.value -= buyerTotal
      }
      
      let conditionScore = auction.conditionScoreAtStart
      const conditionBoostAbility = rareCollectors.value
        .filter(c => c.isUnlocked)
        .flatMap(c => c.specialAbilities)
        .find(a => a.effectType === 'condition_boost' && a.isActive)
      if (conditionBoostAbility && auction.linkedRareCustomerId) {
        conditionScore = Math.min(100, conditionScore + conditionBoostAbility.effectValue)
      }
      
      if (shouldAddToCollection) {
        const newlyActivated = addToCollection(auction.record, auction.finalSalePrice, conditionScore, {
          type: 'special_customer' as CollectionSourceType,
          sourceId: auction.id,
          sourceName: '拍卖会',
          customerName: auction.winnerName,
          description: auction.provenance
        })
        auctionHouseStats.value.collectionAdditions++
        if (newlyActivated && newlyActivated.length > 0) {
          shopReputation.value = Math.min(100, shopReputation.value + newlyActivated.length * 2)
        }
      } else {
        const existing = inventory.value.find(i => i.record.id === auction.record.id)
        if (existing) {
          const totalQtyBefore = existing.quantity
          const totalScoreBefore = existing.conditionScore * totalQtyBefore
          existing.quantity += 1
          existing.conditionScore = Math.round((totalScoreBefore + conditionScore) / existing.quantity)
          existing.actualCostPrice = Math.round((existing.actualCostPrice * totalQtyBefore + auction.finalSalePrice) / existing.quantity)
        } else {
          inventory.value.push({
            record: auction.record,
            quantity: 1,
            purchaseDate: currentDay.value,
            conditionScore,
            actualCostPrice: auction.finalSalePrice
          })
        }
      }
      
      settlement = {
        id: `settle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        auctionItemId: auction.id,
        recordId: auction.record.id,
        recordTitle: auction.record.title,
        buyerId: auction.winnerId,
        buyerName: auction.winnerName,
        buyerAvatar: '🧑',
        finalPrice: auction.finalSalePrice,
        auctionHouseFee: fee,
        sellerPayout: auction.finalSalePrice - Math.round(auction.finalSalePrice * sourceConfigs[auction.source].feeRate),
        buyerTotalCost: buyerTotal,
        conditionScore,
        addedToCollection: shouldAddToCollection,
        addedToInventory: !shouldAddToCollection,
        settlementTime: Date.now(),
        notes: auction.provenance
      }
      settlements.value.push(settlement!)
      
      auctionHouseStats.value.totalAuctionsSold++
      auctionHouseStats.value.totalRevenue += auction.finalSalePrice
      auctionHouseStats.value.totalFeesCollected += fee
      if (auction.isRareItem) {
        auctionHouseStats.value.rareItemsSold++
      }
      if (auction.finalSalePrice > auctionHouseStats.value.highestSalePrice) {
        auctionHouseStats.value.highestSalePrice = auction.finalSalePrice
        auctionHouseStats.value.highestSaleRecordTitle = auction.record.title
      }
      
      if (auction.linkedRareCustomerId) {
        const collector = rareCollectors.value.find(c => c.id === auction.linkedRareCustomerId)
        if (collector) {
          collector.relationshipLevel = Math.min(10, collector.relationshipLevel + 1)
          auctionHouseStats.value.rareCollectorEncounters++
          shopReputation.value = Math.min(100, shopReputation.value + 3)
        }
      }
    } else {
      releaseFrozenFundsForBid(auctionId, 'player')
      
      settlement = {
        id: `settle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        auctionItemId: auction.id,
        recordId: auction.record.id,
        recordTitle: auction.record.title,
        buyerId: auction.winnerId,
        buyerName: auction.winnerName,
        buyerAvatar: null,
        finalPrice: auction.finalSalePrice || 0,
        auctionHouseFee: auction.finalSalePrice ? Math.round(auction.finalSalePrice * 0.08) : 0,
        sellerPayout: 0,
        buyerTotalCost: 0,
        conditionScore: auction.conditionScoreAtStart,
        addedToCollection: false,
        addedToInventory: false,
        settlementTime: Date.now(),
        notes: `未中标`
      }
      settlements.value.push(settlement!)
    }
    
    auctionHouseStats.value.totalAuctionsHeld++
    auction.status = 'settled'
    auction.finalSalePrice = auction.finalSalePrice
    
    const message = isWinner 
      ? `🎉 恭喜！以 ¥${auction.finalSalePrice} 拍得《${auction.record.title}》！${shouldAddToCollection ? '已加入收藏' : '已加入库存'}`
      : `拍卖结束，${auction.winnerName ? `${auction.winnerName} 赢得了本次拍卖` : '本次拍卖流拍'}`
    
    return { success: true, message, settlement }
  }

  const settleAllEndedAuctions = (addWinnersToCollection: boolean = true) => {
    const results: { id: string; message: string }[] = []
    for (const auction of currentAuctionItems.value) {
      if (auction.status === 'ended') {
        const result = settleAuction(auction.id, addWinnersToCollection)
        results.push({ id: auction.id, message: result.message })
      }
    }
    return results
  }

  const cancelAuction = (auctionId: string): { success: boolean; message: string } => {
    const auction = currentAuctionItems.value.find(a => a.id === auctionId)
    if (!auction) return { success: false, message: '拍卖不存在' }
    if (auction.status === 'settled') return { success: false, message: '拍卖已结算' }
    
    releaseFrozenFundsForBid(auctionId, 'player')
    auction.status = 'cancelled'
    auction.actualEndTime = Date.now()
    
    return { success: true, message: `已取消拍卖：${auction.record.title}` }
  }

  const getCollectorInfo = (collectorId: string) => {
    return rareCollectors.value.find(c => c.id === collectorId) || null
  }

  const acceptCollectorOffer = (offerId: string): { success: boolean; message: string } => {
    const offer = pendingCollectorOffers.value.find(o => 
      `${o.collectorId}-${o.recordId}` === offerId || o.collectorId === offerId
    )
    if (!offer) return { success: false, message: '优惠不存在' }
    if (offer.expirationTime < currentDay.value) return { success: false, message: '优惠已过期' }
    if (offer.isAccepted) return { success: false, message: '优惠已接受' }
    
    const collector = rareCollectors.value.find(c => c.id === offer.collectorId)
    if (!collector) return { success: false, message: '收藏家不存在' }
    
    if (offer.offerType === 'private_sale' || offer.offerType === 'commission') {
      if (budget.value < offer.offerPrice) {
        return { success: false, message: `预算不足！需要 ¥${offer.offerPrice}` }
      }
      
      if (offer.recordId) {
        const record = getRecordById(offer.recordId)
        if (record) {
          if (!collection.value.some(c => c.record.id === record.id)) {
            budget.value -= offer.offerPrice
            addToCollection(record, offer.offerPrice, 85, {
              type: 'special_customer' as CollectionSourceType,
              sourceId: collector.id,
              sourceName: collector.title,
              customerName: collector.name,
              description: offer.description
            })
          }
        }
      }
    }
    
    collector.relationshipLevel = Math.min(10, collector.relationshipLevel + 1)
    shopReputation.value = Math.min(100, shopReputation.value + 2)
    offer.isAccepted = true
    
    pendingCollectorOffers.value = pendingCollectorOffers.value.filter(o => 
      !(`${o.collectorId}-${o.recordId}` === offerId || o.collectorId === offerId)
    )
    
    return { 
      success: true, 
      message: `成功达成交易！${offer.bonusRewards.join('，')}` 
    }
  }

  const setAuctionFilter = (filter: string) => {
    selectedAuctionFilter.value = filter
  }

  const selectAuction = (auctionId: string | null) => {
    selectedAuctionId.value = auctionId
  }

  const getSelectedAuction = computed(() => {
    if (!selectedAuctionId.value) return null
    return currentAuctionItems.value.find(a => a.id === selectedAuctionId.value) || null
  })

  const getAuctionById = (auctionId: string): AuctionItem | undefined => {
    return currentAuctionItems.value.find(a => a.id === auctionId) || 
           auctionHistory.value.find(a => a.id === auctionId)
  }

  const getBidHistory = (auctionId: string): BidRecord[] => {
    const auction = getAuctionById(auctionId)
    return auction?.bidHistory || []
  }

  const getFilteredAuctions = computed(() => {
    const filter = selectedAuctionFilter.value
    switch (filter) {
      case 'active': return activeAuctions.value
      case 'upcoming': return upcomingAuctions.value
      case 'ended': return endedAuctions.value
      case 'rare': return currentAuctionItems.value.filter(a => a.isRareItem)
      case 'collector': return rareCollectorAuctions.value
      default: return currentAuctionItems.value
    }
  })

  const getAuctionProgress = (auction: AuctionItem): number => {
    if (auction.status === 'settled' || auction.status === 'cancelled') return 100
    if (auction.status === 'upcoming') return 0
    const total = auction.endTime - auction.startTime
    const elapsed = currentDay.value - auction.startTime
    return Math.min(100, Math.max(0, (elapsed / Math.max(1, total)) * 100))
  }

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
    if (!config) return { profit: 0, sales: 0, satisfaction: 0, genreSales: new Map(), collection: 0, avgSatisfaction: 0, challengeOverall: 0 }
    const genreSalesMap = new Map<Genre, number>()
    for (const [genre, data] of genreSalesProgress.value.entries()) {
      genreSalesMap.set(genre, data.progress)
    }
    const challengeOverall = (
      (isGenreSalesComplete.value ? 100 : Array.from(genreSalesMap.values()).reduce((a, b) => a + b, 0) / Math.max(1, genreSalesMap.size)) +
      collectionProgress.value.overall +
      avgSatisfactionProgress.value.progress
    ) / 3
    return {
      profit: Math.min(100, (effectiveProfit.value / config.targetProfit) * 100),
      sales: Math.min(100, (currentLevelSales.value / config.targetSales) * 100),
      satisfaction: Math.min(100, (shopReputation.value / config.targetSatisfaction) * 100),
      genreSales: genreSalesMap,
      collection: collectionProgress.value.overall,
      collectionActivated: collectionProgress.value.activatedAlbums.progress,
      collectionValue: collectionProgress.value.totalValue.progress,
      avgSatisfaction: avgSatisfactionProgress.value.progress,
      challengeOverall
    }
  })
  const isLevelComplete = computed(() => {
    const config = currentLevelConfig.value
    if (!config) return false

    const baseComplete = effectiveProfit.value >= config.targetProfit &&
           currentLevelSales.value >= config.targetSales &&
           shopReputation.value >= config.targetSatisfaction

    return baseComplete && isMemberTargetsComplete.value && isChallengeTargetsComplete.value
  })

  const calculateLevelReward = (): LevelReward => {
    const config = currentLevelConfig.value
    const reward: LevelReward = {
      baseReward: 0,
      newMembersReward: 0,
      returningVisitsReward: 0,
      memberRatioReward: 0,
      memberTargetsCompletedBonus: 0,
      genreSalesReward: 0,
      collectionReward: 0,
      avgSatisfactionReward: 0,
      challengeTargetsCompletedBonus: 0,
      totalReward: 0,
      reputationBonus: 0,
      unlockedBonus: [],
      wordOfMouthBonus: 0,
      evaluation: null
    }

    if (!config) return reward

    const levelRewardMultiplier = 1 + levelRewardBonus.value

    reward.baseReward = Math.floor((currentLevelProfit.value * 0.2 + config.id * 200) * levelRewardMultiplier)

    const memberTargetRatio = currentLevelNewMembers.value / config.memberTargets.targetNewMembers
    reward.newMembersReward = Math.floor(
      Math.min(1, memberTargetRatio) * config.memberTargets.targetNewMembers * 50 * levelRewardMultiplier
    )

    const returningRatio = currentLevelReturningVisits.value / Math.max(1, config.memberTargets.targetReturningVisits)
    reward.returningVisitsReward = Math.floor(
      Math.min(1, returningRatio) * Math.max(1, config.memberTargets.targetReturningVisits) * 40 * levelRewardMultiplier
    )

    const actualMemberSalesRatio = currentLevelSales.value > 0
      ? currentLevelMemberSales.value / currentLevelSales.value
      : 0
    const ratioProgress = Math.min(1, actualMemberSalesRatio / config.memberTargets.targetMemberSalesRatio)
    reward.memberRatioReward = Math.floor(ratioProgress * 300 * levelRewardMultiplier)

    if (isMemberTargetsComplete.value) {
      reward.memberTargetsCompletedBonus = Math.floor(config.id * 500 * levelRewardMultiplier)
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

    const collectionRepBonus = reputationBonusFromCollection.value
    if (collectionRepBonus > 0) {
      reward.reputationBonus += collectionRepBonus
      reward.unlockedBonus.push(`收藏图鉴声望 +${collectionRepBonus}`)
    }

    const challengeTargets = config.challengeTargets
    let totalGenreTarget = 0
    let totalGenreCurrent = 0
    for (const target of challengeTargets.genreSales) {
      totalGenreTarget += target.targetCount
      totalGenreCurrent += currentLevelGenreSales.value.get(target.genre) || 0
    }
    const genreSalesRatio = totalGenreTarget > 0 ? Math.min(1, totalGenreCurrent / totalGenreTarget) : 1
    reward.genreSalesReward = Math.floor(genreSalesRatio * totalGenreTarget * 80 * levelRewardMultiplier)

    const activatedRatio = challengeTargets.collection.targetActivatedAlbums > 0
      ? Math.min(1, albumState.value.totalActivated / challengeTargets.collection.targetActivatedAlbums)
      : 1
    const valueRatio = challengeTargets.collection.targetTotalCollectionValue > 0
      ? Math.min(1, totalCollectionValue.value / challengeTargets.collection.targetTotalCollectionValue)
      : 1
    const collectionRewardRatio = (activatedRatio + valueRatio) / 2
    reward.collectionReward = Math.floor(collectionRewardRatio * challengeTargets.collection.targetTotalCollectionValue * 0.1 * levelRewardMultiplier)

    const avgSatRatio = challengeTargets.avgSatisfaction.minAvgSatisfaction > 0
      ? Math.min(1, currentLevelAvgSatisfaction.value / challengeTargets.avgSatisfaction.minAvgSatisfaction)
      : 1
    reward.avgSatisfactionReward = Math.floor(avgSatRatio * 500 * config.id * levelRewardMultiplier)

    if (isChallengeTargetsComplete.value) {
      reward.challengeTargetsCompletedBonus = Math.floor(config.id * 800 * levelRewardMultiplier)
      reward.reputationBonus += 15 + config.id * 3
      reward.unlockedBonus.push('多条件挑战达成！')
    }

    if (activatedRatio >= 1 && challengeTargets.collection.targetActivatedAlbums > 0) {
      reward.unlockedBonus.push(`激活 ${challengeTargets.collection.targetActivatedAlbums} 个图鉴达成`)
      reward.reputationBonus += 5
    }
    if (avgSatRatio >= 1 && currentLevelAvgSatisfaction.value >= 85) {
      reward.unlockedBonus.push('极高顾客满意度！')
      reward.reputationBonus += 8
    }

    const genreSalesMap = new Map<string, number>()
    for (const [genre, data] of genreSalesProgress.value.entries()) {
      genreSalesMap.set(genre, data.progress)
    }

    const evaluation = calculateLevelEvaluation(
      currentLevelProfit.value,
      config.targetProfit,
      currentLevelSales.value,
      config.targetSales,
      shopReputation.value,
      config.targetSatisfaction,
      levelStartReputation.value,
      genreSalesMap,
      collectionProgress.value.overall,
      avgSatisfactionProgress.value.progress
    )
    reward.evaluation = evaluation
    reward.wordOfMouthBonus = Math.floor(evaluation.wordOfMouthBonus * levelRewardMultiplier)

    if (evaluation.grade === 'S') {
      reward.unlockedBonus.push('完美通关！S级评价')
      reward.reputationBonus += 8
    } else if (evaluation.grade === 'A') {
      reward.reputationBonus += 3
    }

    if (levelRewardBonus.value > 0) {
      reward.unlockedBonus.push(`图鉴关卡奖励 +${Math.floor(levelRewardBonus.value * 100)}%`)
    }

    reward.totalReward = reward.baseReward +
      reward.newMembersReward +
      reward.returningVisitsReward +
      reward.memberRatioReward +
      reward.memberTargetsCompletedBonus +
      reward.genreSalesReward +
      reward.collectionReward +
      reward.avgSatisfactionReward +
      reward.challengeTargetsCompletedBonus +
      reward.wordOfMouthBonus

    return reward
  }

  const grantLevelReward = () => {
    const reward = calculateLevelReward()
    lastLevelReward.value = reward

    budget.value += reward.totalReward
    shopReputation.value = Math.min(100, shopReputation.value + reward.reputationBonus)

    const staffPointsEarned = currentLevel.value + Math.floor(reputationBonusFromCollection.value / 10)
    if (staffPointsEarned > 0) {
      addStaffPoints(staffPointsEarned)
    }
    
    const levelConfig = getLevelById(currentLevel.value)
    const grade = reward.evaluation?.grade || 'B'
    const totalScore = reward.evaluation?.totalScore || 0
    addLevelClearToCollectionHistory(
      currentLevel.value,
      levelConfig?.name || `第${currentLevel.value}关`,
      grade,
      totalScore
    )
    updateAllCollectionStoryProgress()

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
    currentLevelGenreSales.value = new Map()
    currentLevelSatisfactionSum.value = 0
    currentLevelSatisfactionCount.value = 0
    members.value = []
    lastLevelReward.value = null
    levelStartReputation.value = shopReputation.value
    initializeDisplaySlots(config.displaySlots)
    resetDailyStats()
    dailyEvent.value = null
    levelEvents.value = []
    eventCustomerCountModifier.value = 0
    eventBudgetModifier.value = 0
    eventBuyChanceModifier.value = 0
    eventSatisfactionModifier.value = 0
    eventConditionPenalty.value = 0
    
    activePromotions.value = []
    promotionHistory.value.clear()
    
    genreMarketHeat.value = generateDailyMarketHeat(1, new Map(), [])
    previousDayHotGenres.value = []
    
    availableSuppliers.value = getAvailableSuppliersForLevel(levelId, shopReputation.value)
    currentSupplierId.value = availableSuppliers.value.length > 0 ? availableSuppliers.value[0].id : null
    recordPerformances.value = []
    totalInventoryPurchased.value = new Map()
    supplierPurchaseHistory.value = new Map()
    overstockPenalties.value = new Map()
    dailyOverstockPenalty.value = null
    totalOverstockPenaltyAccumulated.value = 0
    genreAtmosphere.value = createEmptyAtmosphereMap()
    reservations.value = []
    dailyReservationFulfilledCount.value = 0
    dailyReservationMissedCount.value = 0
    reservationNotes.value = new Map()
    
    currentAuctionItems.value = []
    auctionHistory.value = []
    frozenFunds.value = []
    settlements.value = []
    rareCollectors.value = JSON.parse(JSON.stringify(rareCollectorConfigs))
    activeRareCollectors.value = []
    pendingCollectorOffers.value = []
    auctionHouseStats.value = createInitialAuctionStats()
    nextAuctionRefresh.value = 1
    isAuctionHouseOpen.value = true
    selectedAuctionFilter.value = 'all'
    selectedAuctionId.value = null
    
    checkAndActivateAlbums()
    updateCollectionBonuses()
    
    if (currentSupplierId.value) {
      refreshSupplierInventory()
    }
    
    refreshActivePromotions()
    refreshDailyAuctions()
  }

  const resetDailyStats = () => {
    stopPatienceTick()
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
    eventCustomerCountModifier.value = 0
    eventBudgetModifier.value = 0
    eventBuyChanceModifier.value = 0
    eventSatisfactionModifier.value = 0
    eventConditionPenalty.value = 0
    consecutiveSkips.value = 0
    customersLeftAngrily.value = 0
    dailyLostSales.value = new Map()
    dailyOverstockPenalty.value = null
    genreAtmosphere.value = createEmptyAtmosphereMap()
    resetDailyPromotionStats()
    dailyReservationFulfilledCount.value = 0
    dailyReservationMissedCount.value = 0
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
      genreMarketHeat.value,
      excludeIds,
      8,
      recordUnlockBonus.value
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

  const applyCustomerBonuses = (customerList: Customer[]): Customer[] => {
    const budgetMultiplier = 1 + customerBudgetBonus.value + eventBudgetModifier.value
    return customerList.map(c => ({
      ...c,
      budget: Math.floor(c.budget * budgetMultiplier)
    }))
  }

  const getActivatedAlbumIds = (): string[] => {
    const ids: string[] = []
    for (const category of albumState.value.categories) {
      for (const entry of category.entries) {
        if (entry.isActivated) {
          ids.push(entry.id)
        }
      }
    }
    return ids
  }

  const generateCustomersWithSpecial = (
    count: number,
    day: number,
    timeSlot: TimeSlot
  ): Customer[] => {
    const inventoryGenres = [...new Set(inventory.value.map(i => i.record.genre))]
    const activatedAlbumIds = getActivatedAlbumIds()
    const slotReservations = reservations.value.filter(r =>
      r.targetDay === day &&
      r.timeSlot === timeSlot &&
      (r.status === 'pending' || r.status === 'confirmed')
    ).sort((a, b) => b.priorityScore - a.priorityScore)

    const reservationCustomers: Customer[] = []
    const reservationsToInject = Math.min(slotReservations.length, Math.max(1, Math.floor(count * 0.3)))

    for (let i = 0; i < reservationsToInject; i++) {
      const res = slotReservations[i]
      const reservedRecordIds = res.items.map(item => item.recordId)
      const reservedGenres = [...new Set(res.items.map(item => item.genre))]
      const prefGenres = res.memberProfile
        ? [...new Set([...reservedGenres, ...res.memberProfile.favoriteGenres])]
        : reservedGenres

      const cust: Customer = {
        id: `cust-res-${res.id}-${Date.now()}`,
        name: res.customerName,
        avatar: res.customerAvatar,
        preference: {
          favoriteGenres: prefGenres.slice(0, 5),
          priceRange: res.memberProfile
            ? res.memberProfile.priceRange
            : [200, 500],
          preferredRarity: res.memberProfile
            ? res.memberProfile.preferredRarity
            : [2, 3, 4],
          preferenceStrength: res.memberProfile
            ? res.memberProfile.preferenceStrength
            : 0.7
        },
        budget: res.totalBudget,
        patience: 60 + Math.floor(Math.random() * 40) + (res.memberLevel === 'Diamond' ? 30 : res.memberLevel === 'Platinum' ? 20 : res.memberLevel === 'Gold' ? 10 : 0),
        maxPatience: 60 + Math.floor(Math.random() * 40) + (res.memberLevel === 'Diamond' ? 30 : res.memberLevel === 'Platinum' ? 20 : res.memberLevel === 'Gold' ? 10 : 0),
        patienceDecayRate: defaultPatienceConfig.decayBaseRate * (res.memberProfile ? 0.85 : 0.95),
        arrivalOrder: i,
        priorityScore: res.priorityScore,
        satisfaction: 55 + res.satisfactionBonus,
        memberProfile: res.memberProfile,
        isReturningCustomer: res.isReturningCustomer,
        memberDiscount: res.memberProfile ? calculateMemberDiscount(res.memberProfile.level) : 0,
        bargainAggressiveness: res.memberProfile
          ? Math.max(0.1, 0.25 + Math.random() * 0.3)
          : Math.max(0.1, 0.35 + Math.random() * 0.35),
        bargainToughness: res.memberProfile
          ? Math.max(0.2, 0.35 + Math.random() * 0.3)
          : Math.max(0.2, 0.45 + Math.random() * 0.35),
        willBargain: Math.random() < (res.memberProfile ? 0.25 : 0.4),
        isImpatient: false,
        hasLeftAngrily: false,
        identityTag: res.memberProfile
          ? (res.memberLevel === 'Diamond' || res.memberLevel === 'Platinum' ? 'collector' as const : 'connoisseur' as const)
          : 'enthusiast' as const,
        reservationId: res.id,
        reservedRecordIds
      }
      res.customerId = cust.id
      reservationCustomers.push(cust)
    }

    const remainingCount = count - reservationCustomers.length
    const result = remainingCount > 0
      ? generateDailyCustomers(
          remainingCount,
          day,
          members.value,
          shopReputation.value,
          inventoryGenres,
          timeSlot,
          activatedAlbumIds,
          genreMarketHeat.value
        )
      : { customers: [] as Customer[], newMembers: [] as MemberProfile[] }

    let customers = [
      ...reservationCustomers,
      ...applyCustomerBonuses(result.customers)
    ]

    const unlockedSpecialCustomers = specialCustomersState.value.filter(sc => sc.isUnlocked)
    const specialCustomersToAdd: Customer[] = []

    for (const sc of unlockedSpecialCustomers) {
      const chance = getSpecialCustomerAppearanceChance(sc)
      if (Math.random() < chance) {
        const specialCustomer = generateSpecialCustomer(
          sc.id,
          sc,
          shopReputation.value,
          inventoryGenres,
          timeSlot
        )
        specialCustomer.priorityScore = 95
        specialCustomersToAdd.push(specialCustomer)
      }
    }

    if (specialCustomersToAdd.length > 0) {
      const slotsToReplace = Math.min(specialCustomersToAdd.length, Math.floor(customers.length * 0.2))
      for (let i = 0; i < slotsToReplace && i < specialCustomersToAdd.length; i++) {
        const replaceIndex = reservationCustomers.length + Math.floor(Math.random() * Math.max(1, customers.length - reservationCustomers.length))
        if (replaceIndex < customers.length) {
          const sp = specialCustomersToAdd[i]
          sp.arrivalOrder = customers[replaceIndex]?.arrivalOrder || count + i
          customers[replaceIndex] = sp
        }
      }
    }

    return sortCustomerQueue(customers)
  }

  const triggerDailyEvent = () => {
    const event = rollDailyEvent(currentLevel.value, currentDay.value, shopReputation.value)
    if (!event) {
      dailyEvent.value = null
      return
    }

    dailyEvent.value = event
    levelEvents.value.push(event)

    const e = event.appliedEffects
    if (e.budgetChange !== 0) {
      budget.value += e.budgetChange
      if (e.budgetChange < 0) {
        dailyCost.value += Math.abs(e.budgetChange)
      }
    }
    if (e.reputationChange !== 0) {
      shopReputation.value = Math.max(0, Math.min(100, shopReputation.value + e.reputationChange))
    }
    if (e.conditionPenalty > 0) {
      for (const slot of displaySlots.value) {
        if (slot.conditionScore !== null) {
          slot.conditionScore = Math.max(10, slot.conditionScore - e.conditionPenalty)
        }
      }
      for (const item of inventory.value) {
        if (item.quantity > 0) {
          item.conditionScore = Math.max(10, item.conditionScore - Math.floor(e.conditionPenalty * 0.5))
        }
      }
    }

    eventCustomerCountModifier.value = e.customerCountModifier
    eventBudgetModifier.value = e.budgetModifier
    eventBuyChanceModifier.value = e.buyChanceModifier
    eventSatisfactionModifier.value = e.satisfactionModifier
    eventConditionPenalty.value = e.conditionPenalty
  }

  const startBusinessPhase = () => {
    if (!baseLevelConfig.value) return

    triggerDailyEvent()

    const baseCount = Math.min(
      baseLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    let totalCustomerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    totalCustomerCount = Math.max(1, Math.floor(totalCustomerCount * (1 + eventCustomerCountModifier.value)))
    totalCustomerCount = Math.floor(totalCustomerCount * (1 + staff.value.dailyCapacityBonus))
    const slotCount = getCustomerCountForSlot(totalCustomerCount, currentTimeSlot.value)

    customers.value = generateCustomersWithSpecial(
      slotCount,
      currentDay.value,
      currentTimeSlot.value
    )

    dailyReturningCustomers.value = customers.value.filter(c => c.isReturningCustomer).length
    currentLevelReturningVisits.value += dailyReturningCustomers.value
    customersLeftAngrily.value = 0
    consecutiveSkips.value = 0

    currentCustomerIndex.value = 0
    phase.value = 'business'
    checkCurrentCustomerValid()
    startPatienceTick()
  }

  const switchToNightSlot = () => {
    stopPatienceTick()

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
    consecutiveSkips.value = 0
    customersLeftAngrily.value = 0

    if (!baseLevelConfig.value) return
    const baseCount = Math.min(
      baseLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    let totalCustomerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    totalCustomerCount = Math.max(1, Math.floor(totalCustomerCount * (1 + eventCustomerCountModifier.value)))
    totalCustomerCount = Math.floor(totalCustomerCount * (1 + staff.value.dailyCapacityBonus))
    const nightCount = getCustomerCountForSlot(totalCustomerCount, 'night')

    customers.value = generateCustomersWithSpecial(
      nightCount,
      currentDay.value,
      'night'
    )

    dailyReturningCustomers.value += customers.value.filter(c => c.isReturningCustomer).length
    currentLevelReturningVisits.value += customers.value.filter(c => c.isReturningCustomer).length
    currentCustomerIndex.value = 0
    checkCurrentCustomerValid()
    startPatienceTick()
  }

  const getCurrentSlotStats = (): TimeSlotStats => {
    if (currentTimeSlot.value === 'afternoon') return afternoonStats.value
    return nightStats.value
  }

  const playRecord = (record: Record) => {
    isPlaying.value = true
    currentPlayingRecord.value = record
    genreAtmosphere.value = applyPlaybackAtmosphere(genreAtmosphere.value, record)
  }

  const stopPlaying = () => {
    isPlaying.value = false
    currentPlayingRecord.value = null
  }

  const getAtmosphereForGenre = (genre: Genre): GenreAtmosphere => {
    return getGenreAtmosphere(genreAtmosphere.value, genre)
  }

  const allGenreAtmospheres = computed<GenreAtmosphere[]>(() => {
    return getAllGenreAtmospheres(genreAtmosphere.value)
  })

  const topAtmosphereGenres = computed<GenreAtmosphere[]>(() => {
    return getTopAtmosphereGenres(genreAtmosphere.value, 3)
  })

  const averageAtmosphere = computed<number>(() => {
    return getAverageAtmosphereValue(genreAtmosphere.value)
  })

  const currentLevelAvgSatisfaction = computed<number>(() => {
    if (currentLevelSatisfactionCount.value === 0) return 0
    return currentLevelSatisfactionSum.value / currentLevelSatisfactionCount.value
  })

  const genreSalesProgress = computed<Map<Genre, { current: number; target: number; progress: number }>>(() => {
    const result = new Map()
    const config = currentLevelConfig.value
    if (!config) return result

    for (const target of config.challengeTargets.genreSales) {
      const current = currentLevelGenreSales.value.get(target.genre) || 0
      const progress = Math.min(100, (current / Math.max(1, target.targetCount)) * 100)
      result.set(target.genre, { current, target: target.targetCount, progress })
    }
    return result
  })

  const isGenreSalesComplete = computed<boolean>(() => {
    const progress = genreSalesProgress.value
    if (progress.size === 0) return true
    for (const data of progress.values()) {
      if (data.progress < 100) return false
    }
    return true
  })

  const collectionProgress = computed<{ activatedAlbums: { current: number; target: number; progress: number }; totalValue: { current: number; target: number; progress: number }; overall: number }>(() => {
    const config = currentLevelConfig.value
    if (!config) return { activatedAlbums: { current: 0, target: 0, progress: 0 }, totalValue: { current: 0, target: 0, progress: 0 }, overall: 0 }

    const targets = config.challengeTargets.collection
    const currentActivated = albumState.value.totalActivated
    const currentValue = totalCollectionValue.value

    const activatedProgress = targets.targetActivatedAlbums > 0
      ? Math.min(100, (currentActivated / targets.targetActivatedAlbums) * 100)
      : 100
    const valueProgress = targets.targetTotalCollectionValue > 0
      ? Math.min(100, (currentValue / targets.targetTotalCollectionValue) * 100)
      : 100

    return {
      activatedAlbums: { current: currentActivated, target: targets.targetActivatedAlbums, progress: activatedProgress },
      totalValue: { current: currentValue, target: targets.targetTotalCollectionValue, progress: valueProgress },
      overall: (activatedProgress + valueProgress) / 2
    }
  })

  const isCollectionComplete = computed<boolean>(() => {
    const progress = collectionProgress.value
    return progress.activatedAlbums.progress >= 100 && progress.totalValue.progress >= 100
  })

  const avgSatisfactionProgress = computed<{ current: number; target: number; progress: number }>(() => {
    const config = currentLevelConfig.value
    if (!config) return { current: 0, target: 0, progress: 0 }

    const target = config.challengeTargets.avgSatisfaction.minAvgSatisfaction
    const current = currentLevelAvgSatisfaction.value
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 100

    return { current, target, progress }
  })

  const isAvgSatisfactionComplete = computed<boolean>(() => {
    return avgSatisfactionProgress.value.progress >= 100
  })

  const isChallengeTargetsComplete = computed<boolean>(() => {
    return isGenreSalesComplete.value && isCollectionComplete.value && isAvgSatisfactionComplete.value
  })

  const getAtmospherePatienceSlowdown = (genres: Genre[]): number => {
    let maxSlowdown = 0
    for (const genre of genres) {
      const slowdown = getGenrePatienceSlowdown(genreAtmosphere.value, genre)
      if (slowdown > maxSlowdown) {
        maxSlowdown = slowdown
      }
    }
    return maxSlowdown
  }

  const getAtmosphereRecommendationBoost = (genre: Genre): number => {
    return getGenreRecommendationBoost(genreAtmosphere.value, genre)
  }

  const getAtmosphereBuyChanceBoost = (genre: Genre): number => {
    return getGenreBuyChanceBoost(genreAtmosphere.value, genre)
  }

  const getPlayingGenres = (): Genre[] => {
    if (!currentPlayingRecord.value) return []
    return [currentPlayingRecord.value.genre]
  }

  const tickAllCustomerPatience = () => {
    if (phase.value !== 'business') return

    const playingGenres = getPlayingGenres()
    let leftAngrilyCount = 0

    customers.value = customers.value.map((cust, idx) => {
      if (cust.hasLeftAngrily) return cust

      let decay = calculatePatienceDecay(
        cust,
        isPlaying.value,
        playingGenres,
        defaultPatienceConfig
      )

      const atmosphereSlowdown = getAtmospherePatienceSlowdown(cust.preference.favoriteGenres)
      if (atmosphereSlowdown > 0) {
        decay *= (1 - atmosphereSlowdown)
      }

      if (idx === currentCustomerIndex.value) {
        decay *= 0.3
      }

      decay *= (1 + consecutiveSkips.value * 0.1)

      const serviceEfficiencyBonus = staff.value.serviceEfficiencyBonus
      if (serviceEfficiencyBonus > 0) {
        decay *= (1 - serviceEfficiencyBonus)
      }

      const updated = applyPatienceDecay(cust, decay)

      if (updated.hasLeftAngrily && !cust.hasLeftAngrily) {
        leftAngrilyCount++
        recordLostSale('patience_exhausted')
      }

      return updated
    })

    if (leftAngrilyCount > 0) {
      customersLeftAngrily.value += leftAngrilyCount
      shopReputation.value = Math.max(0, shopReputation.value - leftAngrilyCount * 3)
    }

    genreAtmosphere.value = decayAtmosphere(genreAtmosphere.value, 1.5)

    resortCustomerQueueIfNeeded()
  }

  const recordLostSale = (reason: LostSaleReason) => {
    const current = dailyLostSales.value.get(reason) || 0
    dailyLostSales.value.set(reason, current + 1)
  }

  const resortCustomerQueueIfNeeded = () => {
    const remaining = customers.value.slice(currentCustomerIndex.value + 1)
    const sortedRemaining = sortCustomerQueue(remaining, {
      prioritizeImpatient: true,
      prioritizeMembers: true,
      prioritizeHighBudget: true,
      prioritizeSpecial: true
    })

    customers.value = [
      ...customers.value.slice(0, currentCustomerIndex.value + 1),
      ...sortedRemaining
    ]
  }

  const getCustomerPatienceInfo = (customer: Customer) => {
    const level = getPatienceLevel(customer.patience, customer.maxPatience)
    return {
      level,
      label: getPatienceLevelLabel(level),
      color: getPatienceLevelColor(level),
      ratio: customer.patience / customer.maxPatience,
      current: customer.patience,
      max: customer.maxPatience,
      isImpatient: customer.isImpatient,
      hasLeftAngrily: customer.hasLeftAngrily
    }
  }

  const getQueueCustomers = () => {
    return customers.value
      .slice(currentCustomerIndex.value + 1)
      .filter(c => !c.hasLeftAngrily)
      .slice(0, 5)
  }

  const startPatienceTick = () => {
    if (patienceTickTimer.value !== null) {
      clearInterval(patienceTickTimer.value)
    }
    patienceTickTimer.value = window.setInterval(() => {
      tickAllCustomerPatience()
    }, 2000)
  }

  const stopPatienceTick = () => {
    if (patienceTickTimer.value !== null) {
      clearInterval(patienceTickTimer.value)
      patienceTickTimer.value = null
    }
  }

  const checkCurrentCustomerValid = () => {
    while (currentCustomer.value && currentCustomer.value.hasLeftAngrily) {
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += 10
      slotSatisfactionSum.value += 10
      currentLevelSatisfactionSum.value += 10
      currentLevelSatisfactionCount.value += 1
      currentCustomerIndex.value++
    }
  }

  const getCustomerRecommendations = (customer: Customer) => {
    const displayed = displayedRecords.value
    const playBoost = getPlayBoostForSlot(currentTimeSlot.value)
    const collectionMatchBonus = matchScoreBonusFromCollection.value
    const themeBonus = themeMatchScoreBonus.value
    const playbackBonus = playbackThemeBonus.value
    const staffRecommendationBonus = staff.value.recommendationAccuracyBonus

    const patienceRatio = customer.patience / customer.maxPatience
    const urgencyMultiplier = customer.isImpatient ? 1.8 : (patienceRatio < 0.5 ? 1.0 + (0.5 - patienceRatio) : 1.0)
    const genreWeightBoost = patienceRatio < 0.5 ? (1 - patienceRatio) * 15 : 0

    const isReservationCustomer = customer.reservationId !== null
    const reservedRecordSet = new Set(customer.reservedRecordIds || [])

    type ScoredRecord = { slot: DisplaySlot; item: InventoryItem; conditionScore: number; score: number; themeBonus: number; atmosphereBoost: number; urgencyHint: string | null; overstockStatus: OverstockStatus | null; isReservationTarget: boolean }
    const overstockMap = new Map(overstockInfos.value.map(i => [i.recordId, i]))
    const scored = displayed.map(d => {
      const score = calculateMatchScore(customer, d.item.record, shopReputation.value, genreMarketHeat.value)
      let finalScore = score + collectionMatchBonus + themeBonus + staffRecommendationBonus

      const isGenreMatch = customer.preference.favoriteGenres.includes(d.item.record.genre)
      if (customer.isImpatient && isGenreMatch) {
        finalScore += genreWeightBoost
      } else if (isGenreMatch) {
        finalScore += genreWeightBoost * 0.5
      }

      const atmosphereBoost = getAtmosphereRecommendationBoost(d.item.record.genre)
      if (isGenreMatch) {
        finalScore += atmosphereBoost
      } else {
        finalScore += atmosphereBoost * 0.3
      }

      finalScore *= urgencyMultiplier

      if (currentPlayingRecord.value?.id === d.item.record.id) {
        finalScore += playBoost + playbackBonus
        if (customer.isImpatient && isGenreMatch) {
          finalScore += 8
        }
      }
      const conditionImpact = getConditionImpactOnSales(d.conditionScore)
      finalScore += conditionImpact.buyChanceModifier * 100

      const overstockInfo = overstockMap.get(d.item.record.id)
      const overstockStatus: OverstockStatus | null = overstockInfo?.status || null
      if (overstockInfo && overstockInfo.status !== 'normal') {
        finalScore += calculateDisplayPriorityBoost(overstockInfo.status)
      }

      const isReservationTarget = isReservationCustomer && reservedRecordSet.has(d.item.record.id)
      if (isReservationTarget) {
        finalScore = Math.min(100, finalScore + 30)
      }

      let urgencyHint: string | null = null
      if (isReservationTarget) {
        urgencyHint = '📋 预约目标！'
      } else if (overstockStatus === 'deadstock') {
        urgencyHint = '🔥 严重积压！'
      } else if (overstockStatus === 'overstocked') {
        urgencyHint = '⚠️ 积压品'
      } else if (customer.isImpatient && isGenreMatch) {
        urgencyHint = '急需匹配！'
      } else if (overstockStatus === 'slow') {
        urgencyHint = '📦 周转慢'
      } else if (patienceRatio < 0.4 && isGenreMatch) {
        urgencyHint = '建议优先'
      }

      return { 
        slot: d.slot, 
        item: d.item, 
        conditionScore: d.conditionScore, 
        score: Math.min(100, finalScore),
        themeBonus,
        atmosphereBoost,
        urgencyHint,
        overstockStatus,
        isReservationTarget
      } as ScoredRecord
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
      recordLostSale('bargain_failed')

      currentLevelSatisfactionSum.value += finalDissatisfaction
      currentLevelSatisfactionCount.value += 1
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
    let baseSalePrice = bargainFinalPrice || customPrice || record.marketPrice
    const initialAskPrice = currentBargain.value?.initialAskPrice || (customPrice || record.marketPrice)

    baseSalePrice = Math.floor(baseSalePrice * conditionImpact.priceModifier)

    if (customer.memberDiscount > 0) {
      baseSalePrice = Math.floor(baseSalePrice * (1 - customer.memberDiscount))
    }

    if (priceBonusFromCollection.value > 0) {
      baseSalePrice = Math.floor(baseSalePrice * (1 + priceBonusFromCollection.value))
    }

    const promotionResult = getRecordPromotionPrice(baseSalePrice, record)
    let salePrice = promotionResult.finalPrice
    const wasPromotionApplied = promotionResult.appliedPromotionId !== null
    const promotionDiscountAmount = promotionResult.discountApplied

    if (wasPromotionApplied) {
      dailyPromotionDiscountGiven.value += promotionDiscountAmount
    }

    const buyGiftResult = checkAndConsumeBuyGift(record)
    const isGiftItem = buyGiftResult.eligible
    if (isGiftItem) {
      salePrice = 0
    }

    const score = calculateMatchScore(customer, record, shopReputation.value, genreMarketHeat.value)
    const playBoost = getPlayBoostForSlot(currentTimeSlot.value)
    const collectionMatchBonus = matchScoreBonusFromCollection.value
    const themeBonus = themeMatchScoreBonus.value
    const playbackThemeBonusVal = playbackThemeBonus.value
    const themeBuyBonus = themeBuyChanceBonus.value

    let baseScore = score + collectionMatchBonus + themeBonus
    if (currentPlayingRecord.value?.id === record.id) {
      baseScore += playBoost + playbackThemeBonusVal
    }
    const finalScore = Math.min(100, baseScore)

    let buyChance = finalScore / 100
    buyChance += conditionImpact.buyChanceModifier
    buyChance += getBuyChanceBonus(shopReputation.value)
    buyChance += buyChanceBonusFromCollection.value
    buyChance += themeBuyBonus
    buyChance += eventBuyChanceModifier.value
    buyChance += getAtmosphereBuyChanceBoost(record.genre)
    buyChance += getPromotionBuyChanceForRecord(record)

    const priceSensitivity = adjustPriceSensitivity(currentTimeSlot.value)
    if (!isGiftItem && salePrice > customer.budget) {
      buyChance *= Math.max(0.1, 0.3 / priceSensitivity)
    }
    if (!isGiftItem && salePrice > record.marketPrice * 1.3) {
      buyChance *= Math.max(0.1, 0.5 / priceSensitivity)
    }
    if (!isGiftItem && salePrice < record.marketPrice * 0.7) {
      buyChance *= Math.min(2.0, 1.2 * priceSensitivity)
    }
    if (isGiftItem) {
      buyChance = Math.min(1.0, buyChance + 0.5)
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

    const isReservationTarget = customer.reservationId !== null &&
      (customer.reservedRecordIds || []).includes(record.id)
    if (isReservationTarget) {
      buyChance = Math.min(1.0, buyChance * 1.8 + 0.15)
    }

    const bargainAgreed = currentBargain.value?.phase === 'agreed'
    const success = wasBargained && bargainAgreed
      ? (Math.random() < Math.min(1.0, buyChance * 0.95 + 0.05))
      : (Math.random() < buyChance)

    if (success) {
      const profit = salePrice - invItem.actualCostPrice
      const reservationSatisfactionBonus = isReservationTarget ? 15 : 0
      const baseSatisfaction = 50 + finalScore * 0.5 - (!isGiftItem && salePrice > record.marketPrice ? 20 : 0) + reservationSatisfactionBonus
      const memberBonus = customer.isReturningCustomer ? 5 : 0
      const bargainSatisfactionBonus = calculateBargainSatisfactionBonus(
        wasBargained,
        true,
        salePrice,
        initialAskPrice,
        customer
      )
      const promotionSatisfactionBonus = isGiftItem ? 15 : getPromotionSatisfactionForRecord(record)

      const patienceRatio = customer.patience / customer.maxPatience
      let patienceSatisfactionMod = 0
      if (patienceRatio >= 0.7) {
        patienceSatisfactionMod = 8
      } else if (patienceRatio >= 0.4) {
        patienceSatisfactionMod = 0
      } else if (patienceRatio >= 0.2) {
        patienceSatisfactionMod = -8
      } else {
        patienceSatisfactionMod = -15
      }

      const fastServiceBonus = customer.patience >= customer.maxPatience * 0.8 ? 5 : 0

      const isGenreMatch = customer.preference.favoriteGenres.includes(record.genre)
      const isRarityMatch = customer.preference.preferredRarity.includes(record.rarity)
      const identitySatisfactionMod = calculateIdentitySatisfactionModifier(
        customer,
        isGenreMatch,
        isRarityMatch,
        slotConditionScore
      )

      const satisfaction = Math.max(
        20,
        Math.min(
          100,
          baseSatisfaction + memberBonus + conditionImpact.satisfactionModifier +
          bargainSatisfactionBonus + eventSatisfactionModifier.value +
          patienceSatisfactionMod + fastServiceBonus + identitySatisfactionMod +
          promotionSatisfactionBonus
        )
      )

      if (!isGiftItem) {
        budget.value += salePrice
        dailyRevenue.value += salePrice
      }
      dailySalesCount.value += 1
      dailyServedCustomers.value += 1
      dailySatisfactionSum.value += satisfaction
      slotSatisfactionSum.value += satisfaction
      currentLevelProfit.value += profit
      currentLevelSales.value += 1
      totalProfit.value += profit

      if (wasPromotionApplied && promotionResult.appliedPromotionId) {
        recordPromotionSale(promotionResult.appliedPromotionId, salePrice, isGiftItem)
      }
      if (isGiftItem && buyGiftResult.promotionId) {
        recordPromotionSale(buyGiftResult.promotionId, 0, true)
      }
      if (!isGiftItem) {
        trackBuyGiftPurchase(record)
      }

      const currentGenreCount = currentLevelGenreSales.value.get(record.genre) || 0
      currentLevelGenreSales.value.set(record.genre, currentGenreCount + 1)
      currentLevelSatisfactionSum.value += satisfaction
      currentLevelSatisfactionCount.value += 1

      const memberProfile = customer.memberProfile || findOrCreateMember(customer, Math.max(salePrice, record.marketPrice * 0.5), satisfaction)
      let growthPointsEarned = 0
      let isMemberPurchase = false

      if (memberProfile) {
        const updatedMember = updateMemberAfterPurchase(memberProfile, Math.max(salePrice, record.marketPrice * 0.5), satisfaction)
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
          Math.max(salePrice, record.marketPrice * 0.5),
          satisfaction,
          memberProfile.level,
          customer.isReturningCustomer
        )
        isMemberPurchase = true
        dailyMemberSalesCount.value += 1
        dailyMemberRevenue.value += Math.max(salePrice, record.marketPrice * 0.5)
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
      
      addSaleToCollectionHistory(record.id, saleRecord)
      
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

      if (isReservationTarget) {
        updateReservationOnSale(record.id, customer)
      }

      const identityCollectionBonus = getIdentityCollectionChanceBonus(customer)
      const baseCollectionChance = 0.3
      const finalCollectionChance = Math.max(0, Math.min(1, baseCollectionChance + identityCollectionBonus))

      if (satisfaction >= 80 && Math.random() < finalCollectionChance) {
        const sourceType = isMemberPurchase ? 'member_reward' : (customer.identityTag === 'collector' || customer.identityTag === 'connoisseur' ? 'special_customer' : 'customer_gift')
        addToCollection(record, invItem.actualCostPrice, slotConditionScore, {
          type: sourceType,
          customerId: customer.id,
          customerName: customer.name,
          sourceId: customer.id
        })
      }

      let reputationDelta = satisfaction > 60 ? 1 : -1
      if (wasPromotionApplied) {
        reputationDelta += 1
      }
      if (isGiftItem) {
        reputationDelta += 2
      }
      shopReputation.value = Math.min(100, Math.max(0, shopReputation.value + reputationDelta))

      const conditionLabel = getConditionLabel(slotConditionScore)
      const slotLabel = currentTimeSlot.value === 'afternoon' ? '午后' : '夜场'
      const bargainNote = wasBargained ? `（砍价成交，初始报价¥${initialAskPrice}）` : ''
      const promotionNote = wasPromotionApplied ? `【促销立减¥${promotionDiscountAmount}】` : ''
      const giftNote = isGiftItem ? `🎁【赠品】` : ''
      const reservationNote = isReservationTarget ? `📋【预约订单】` : ''

      currentBargain.value = null

      return {
        success: true,
        message: `${giftNote}${customer.name} ${isGiftItem ? '获赠' : `以 ¥${salePrice} 购买了`}《${record.title}》！${customer.memberDiscount > 0 ? `（会员折扣${Math.round(customer.memberDiscount * 100)}%）` : ''}${growthPointsEarned > 0 ? ` 获得 ${growthPointsEarned} 成长值` : ''}${conditionImpact.priceModifier !== 1 ? ` 品相${conditionLabel}影响售价` : ''}${bargainNote}${promotionNote}${reservationNote}【${slotLabel}】`,
        satisfaction,
        profit,
        growthPoints: growthPointsEarned,
        isMemberPurchase,
        memberLevel: memberProfile?.level || null,
        wasPromotion: wasPromotionApplied || isGiftItem,
        promotionDiscount: promotionDiscountAmount,
        isGift: isGiftItem,
        isReservationFulfillment: isReservationTarget
      }
    } else {
      dailyServedCustomers.value += 1
      const bargainFailurePenalty = wasBargained ? -10 : 0
      const patienceRatio = customer.patience / customer.maxPatience
      const patienceFailureBonus = patienceRatio < 0.3 ? -10 : (patienceRatio < 0.5 ? -5 : 0)
      const finalDissatisfaction = Math.max(15, 30 + bargainFailurePenalty + patienceFailureBonus)
      dailySatisfactionSum.value += finalDissatisfaction
      slotSatisfactionSum.value += finalDissatisfaction
      shopReputation.value = Math.max(0, shopReputation.value - (wasBargained ? 2 : 1) - (patienceRatio < 0.3 ? 1 : 0))

      currentLevelSatisfactionSum.value += finalDissatisfaction
      currentLevelSatisfactionCount.value += 1

      consecutiveSkips.value = 0

      if (wasBargained) {
        recordLostSale('bargain_failed')
      } else if (!isGiftItem && (salePrice > customer.budget || salePrice > record.marketPrice * 1.3)) {
        recordLostSale('price_too_high')
      } else if (slotConditionScore < 50) {
        recordLostSale('poor_condition')
      } else {
        const isGenreMatch = customer.preference.favoriteGenres.includes(record.genre)
        if (!isGenreMatch) {
          recordLostSale('no_matching_genre')
        } else {
          recordLostSale('other')
        }
      }
      
      const bargainMsg = wasBargained ? '砍价没谈拢，' : ''
      const patienceMsg = patienceRatio < 0.3 ? '（顾客已有些不耐烦）' : ''
      currentBargain.value = null
      return {
        success: false,
        message: `${bargainMsg}${customer.name} 考虑了一下，还是没有买...${patienceMsg}`
      }
    }
  }

  const skipCustomer = () => {
    if (currentCustomer.value) {
      consecutiveSkips.value++
      const customer = currentCustomer.value
      dailyServedCustomers.value += 1
      recordLostSale('customer_skipped')

      const skipLossReduction = staff.value.skipLossReduction
      const patienceRatio = customer.patience / customer.maxPatience
      const skipPenalty = Math.min(5, Math.floor(consecutiveSkips.value * 0.8))
      const reducedSkipPenalty = Math.floor(skipPenalty * (1 - skipLossReduction))
      const patienceBasedDissatisfaction = patienceRatio < 0.3 ? 10 : (patienceRatio < 0.5 ? 5 : 0)
      const baseSatisfaction = 20 - reducedSkipPenalty + patienceBasedDissatisfaction
      const finalDissatisfaction = Math.max(10, Math.min(35, baseSatisfaction))
      const reducedDissatisfaction = Math.floor(finalDissatisfaction * (1 - skipLossReduction))

      dailySatisfactionSum.value += reducedDissatisfaction
      slotSatisfactionSum.value += reducedDissatisfaction
      const reputationLoss = Math.floor((2 + reducedSkipPenalty) * (1 - skipLossReduction))
      shopReputation.value = Math.max(0, shopReputation.value - reputationLoss)

      currentLevelSatisfactionSum.value += reducedDissatisfaction
      currentLevelSatisfactionCount.value += 1

      const remaining = customers.value.slice(currentCustomerIndex.value + 1)
      customers.value = [
        ...customers.value.slice(0, currentCustomerIndex.value + 1),
        ...sortCustomerQueue(remaining)
      ]
    }
    currentCustomerIndex.value++
    checkCurrentCustomerValid()
  }

  const nextCustomer = () => {
    consecutiveSkips.value = 0
    currentCustomerIndex.value++
    checkCurrentCustomerValid()
    resortCustomerQueueIfNeeded()
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

  const renovateCollectionItem = (recordId: string, targetScore: number): { success: boolean; cost: number; message: string; newlyActivated?: string[] } => {
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
    item.extended.timesRenovated++
    budget.value -= cost
    dailyRenovationCost.value += cost
    dailyCost.value += cost

    const newlyActivated = checkAndActivateAlbums()
    updateCollectionBonuses()
    updateCollectionStoryProgress(recordId)
    checkAndUpdateAchievements(recordId)

    let message = `翻新成功！《${item.record.title}》品相提升至 ${getConditionLabel(targetScore)}，收藏价值 ¥${item.collectionValue}`
    if (newlyActivated.length > 0) {
      message += ` 🎉 激活 ${newlyActivated.length} 个新图鉴！`
    }

    return {
      success: true,
      cost,
      message,
      newlyActivated
    }
  }

  const calculateRenovationCostFromOptions = (currentScore: number, targetScore: number, rarity: number): number => {
    return calculateRenovationCost(currentScore, targetScore, rarity)
  }

  const getLostSaleReasonLabel = (reason: LostSaleReason): { label: string; description: string } => {
    const labels: { [key in LostSaleReason]: { label: string; description: string } } = {
      price_too_high: { label: '定价过高', description: '售价超出顾客预算或市场均价过多' },
      no_matching_genre: { label: '品类不匹配', description: '陈列的唱片不符合顾客偏好品类' },
      poor_condition: { label: '品相不佳', description: '唱片品相评分过低影响购买意愿' },
      patience_exhausted: { label: '等待过久', description: '顾客等待时间过长，耐心耗尽离开' },
      bargain_failed: { label: '砍价失败', description: '价格谈判未能达成一致' },
      customer_skipped: { label: '跳过服务', description: '主动跳过接待该顾客' },
      overstock_penalty: { label: '库存积压', description: '滞销唱片产生每日库存积压惩罚扣款' },
      other: { label: '其他原因', description: '未能成交的其他综合因素' }
    }
    return labels[reason]
  }

  const calculateHotGenres = (daySales: SaleRecord[]): HotGenre[] => {
    const genreMap = new Map<Genre, { sales: number; revenue: number; profit: number; satisfaction: number[] }>()

    for (const sale of daySales) {
      const record = getRecordById(sale.recordId)
      if (!record) continue
      const existing = genreMap.get(record.genre) || { sales: 0, revenue: 0, profit: 0, satisfaction: [] }
      existing.sales += 1
      existing.revenue += sale.salePrice
      existing.profit += sale.profit
      existing.satisfaction.push(sale.customerSatisfaction)
      genreMap.set(record.genre, existing)
    }

    const result: HotGenre[] = []
    for (const [genre, data] of genreMap.entries()) {
      result.push({
        genre,
        salesCount: data.sales,
        revenue: data.revenue,
        profit: data.profit,
        avgSatisfaction: data.satisfaction.length > 0 ? data.satisfaction.reduce((a, b) => a + b, 0) / data.satisfaction.length : 0
      })
    }

    return result.sort((a, b) => b.salesCount - a.salesCount || b.revenue - a.revenue)
  }

  const calculateLostSalesStats = () => {
    const result = []
    let total = 0
    for (const [reason, count] of dailyLostSales.value.entries()) {
      const { label, description } = getLostSaleReasonLabel(reason)
      result.push({ reason, count, label, description })
      total += count
    }
    return {
      stats: result.sort((a, b) => b.count - a.count),
      total
    }
  }

  const buildCustomerProfileSnapshot = (dayCustomers: Customer[], _daySales: SaleRecord[]): CustomerProfileSnapshot => {
    const genreCount = new Map<Genre, number>()
    let totalBudget = 0
    let totalPriceMin = 0
    let totalPriceMax = 0
    let memberCount = 0
    let returningCount = 0
    let totalRarityPref = 0
    let rarityCount = 0

    for (const c of dayCustomers) {
      totalBudget += c.budget
      totalPriceMin += c.preference.priceRange[0]
      totalPriceMax += c.preference.priceRange[1]
      if (c.memberProfile) memberCount++
      if (c.isReturningCustomer) returningCount++
      for (const g of c.preference.favoriteGenres) {
        genreCount.set(g, (genreCount.get(g) || 0) + 1)
      }
      for (const r of c.preference.preferredRarity) {
        totalRarityPref += r
        rarityCount++
      }
    }

    const sortedGenres = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])

    return {
      topGenres: sortedGenres,
      avgBudget: dayCustomers.length > 0 ? Math.round(totalBudget / dayCustomers.length) : 0,
      avgPriceRange: dayCustomers.length > 0
        ? [Math.round(totalPriceMin / dayCustomers.length), Math.round(totalPriceMax / dayCustomers.length)] as [number, number]
        : [0, 0],
      memberRatio: dayCustomers.length > 0 ? memberCount / dayCustomers.length : 0,
      returningRatio: dayCustomers.length > 0 ? returningCount / dayCustomers.length : 0,
      avgRarityPreference: rarityCount > 0 ? Math.round((totalRarityPref / rarityCount) * 10) / 10 : 3
    }
  }

  const getPreviousDayProfile = (): CustomerProfileSnapshot | null => {
    if (dailyStats.value.length < 2) return null
    const prevStats = dailyStats.value[dailyStats.value.length - 2]
    if (!prevStats.review) return null
    return prevStats.review.customerProfileShift.current
  }

  const calculateCustomerProfileShift = (
    current: CustomerProfileSnapshot,
    previous: CustomerProfileSnapshot | null
  ): CustomerProfileShift => {
    const allGenres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']
    const genreChanges = allGenres.map(genre => {
      const inCurrent = current.topGenres.includes(genre) ? 1 : 0
      const inPrev = previous?.topGenres.includes(genre) ? 1 : 0
      const change = inCurrent - inPrev
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (change > 0) trend = 'up'
      else if (change < 0) trend = 'down'
      return { genre, change, trend }
    })

    const budgetChange = previous ? current.avgBudget - previous.avgBudget : 0
    let budgetTrend: 'up' | 'down' | 'stable' = 'stable'
    if (budgetChange > 20) budgetTrend = 'up'
    else if (budgetChange < -20) budgetTrend = 'down'

    const memberRatioChange = previous ? current.memberRatio - previous.memberRatio : 0

    return {
      current,
      previous,
      genreChanges,
      budgetChange,
      budgetTrend,
      memberRatioChange
    }
  }

  const generateDailySuggestions = (
    hotGenres: HotGenre[],
    lostSales: { stats: { reason: LostSaleReason; count: number }[]; total: number },
    profileShift: CustomerProfileShift,
    todayStats: { salesCount: number; avgSatisfaction: number; profit: number }
  ): DailySuggestion[] => {
    const suggestions: DailySuggestion[] = []

    if (lostSales.total > 0) {
      const topLost = lostSales.stats[0]
      if (topLost) {
        switch (topLost.reason) {
          case 'price_too_high':
            suggestions.push({
              id: 'sug-price',
              category: 'pricing',
              priority: 'high',
              title: '优化定价策略',
              description: `今日有 ${topLost.count} 单因价格过高流失，建议适当降低热门唱片报价或多进货性价比高的品种`,
              action: '下次进货时关注成本控制'
            })
            break
          case 'no_matching_genre':
            suggestions.push({
              id: 'sug-genre',
              category: 'inventory',
              priority: 'high',
              title: '补充顾客偏好品类',
              description: `${topLost.count} 位顾客没找到心仪的品类，建议根据顾客画像补充对应风格的唱片`,
              action: profileShift.current.topGenres.length > 0 ? `重点关注: ${profileShift.current.topGenres.join('、')}` : undefined
            })
            break
          case 'poor_condition':
            suggestions.push({
              id: 'sug-condition',
              category: 'inventory',
              priority: 'high',
              title: '翻新维护唱片品相',
              description: `${topLost.count} 单因品相不佳流失，陈列前请注意检查并及时翻新品相较低的唱片`,
              action: '购买翻新维护服务'
            })
            break
          case 'patience_exhausted':
            suggestions.push({
              id: 'sug-patience',
              category: 'service',
              priority: 'high',
              title: '提升服务效率',
              description: `${topLost.count} 位顾客因等待过久离开，建议优先接待不耐烦的顾客或播放匹配的音乐舒缓情绪`,
              action: '使用耐心排序策略'
            })
            break
          case 'bargain_failed':
            suggestions.push({
              id: 'sug-bargain',
              category: 'pricing',
              priority: 'medium',
              title: '优化砍价策略',
              description: `${topLost.count} 次砍价未能成交，建议在顾客可接受范围内灵活让步`,
              action: '了解顾客底价，适当让步'
            })
            break
          case 'customer_skipped':
            suggestions.push({
              id: 'sug-skip',
              category: 'service',
              priority: 'medium',
              title: '减少跳过顾客',
              description: `今日跳过了 ${topLost.count} 位顾客，尽量接待每一位顾客以提升销售机会和店铺声望`,
              action: '耐心接待每位顾客'
            })
            break
        }
      }
    }

    if (hotGenres.length > 0) {
      const topGenre = hotGenres[0]
      suggestions.push({
        id: 'sug-hot',
        category: 'inventory',
        priority: topGenre.salesCount >= 3 ? 'high' : 'medium',
        title: `热销品类：${topGenre.genre}`,
        description: `${topGenre.genre} 今日售出 ${topGenre.salesCount} 张，营收 ¥${topGenre.revenue}，建议持续补充该品类库存`,
        action: '下次进货重点考虑'
      })
    }

    if (profileShift.budgetTrend === 'up') {
      suggestions.push({
        id: 'sug-budget-up',
        category: 'inventory',
        priority: 'medium',
        title: '顾客购买力提升',
        description: `顾客平均预算较昨日上升 ¥${profileShift.budgetChange}，可考虑引入一些高品质、高价位的珍稀唱片`,
        action: '探索稀有高价值品类'
      })
    } else if (profileShift.budgetTrend === 'down') {
      suggestions.push({
        id: 'sug-budget-down',
        category: 'pricing',
        priority: 'medium',
        title: '顾客购买力下降',
        description: `顾客平均预算较昨日下降 ¥${Math.abs(profileShift.budgetChange)}，建议多准备性价比高的平价唱片`,
        action: '增加平价唱片库存'
      })
    }

    if (todayStats.avgSatisfaction < 60 && todayStats.salesCount > 0) {
      suggestions.push({
        id: 'sug-satisfaction',
        category: 'service',
        priority: 'high',
        title: '提升顾客满意度',
        description: `今日平均满意度仅 ${Math.round(todayStats.avgSatisfaction)}%，请注意品相维护、合理定价和快速服务`,
        action: '从多个维度改善顾客体验'
      })
    }

    if (profileShift.current.returningRatio < 0.2 && todayStats.salesCount > 3) {
      suggestions.push({
        id: 'sug-returning',
        category: 'member',
        priority: 'medium',
        title: '培养回头客',
        description: '今日回头客比例较低，建议提升服务品质，鼓励顾客成为会员',
        action: '提供优质服务，发展会员'
      })
    }

    const overstockProblemItems = overstockInfos.value.filter(i => i.status !== 'normal')
    if (overstockProblemItems.length > 0) {
      const deadstockCount = overstockProblemItems.filter(i => i.status === 'deadstock').length
      const overstockedCount = overstockProblemItems.filter(i => i.status === 'overstocked').length
      const slowCount = overstockProblemItems.filter(i => i.status === 'slow').length
      const totalPenalty = totalDailyOverstockPenalty.value

      if (deadstockCount > 0) {
        suggestions.push({
          id: 'sug-overstock-deadstock',
          category: 'inventory',
          priority: 'high',
          title: '严重库存积压！',
          description: `${deadstockCount} 张唱片严重积压，每日扣罚 ¥${totalPenalty}，建议立即折价清仓！`,
          action: '使用折价出售功能快速清仓'
        })
      } else if (overstockedCount > 0) {
        suggestions.push({
          id: 'sug-overstock',
          category: 'inventory',
          priority: 'high',
          title: '库存积压警告',
          description: `${overstockedCount} 张积压 + ${slowCount} 张周转缓慢，每日扣罚 ¥${totalPenalty}`,
          action: '优先陈列或折价出售滞销品'
        })
      } else if (slowCount > 0) {
        suggestions.push({
          id: 'sug-overstock-slow',
          category: 'inventory',
          priority: 'medium',
          title: '周转缓慢提醒',
          description: `${slowCount} 张唱片周转缓慢，建议优先陈列以增加曝光`,
          action: '将滞销品放到陈列架'
        })
      }
    }

    if (suggestions.length === 0) {
      suggestions.push({
        id: 'sug-default',
        category: 'inventory',
        priority: 'low',
        title: '保持良好运营',
        description: '今日整体经营状况良好，继续保持！',
        action: '稳步推进每日经营'
      })
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }).slice(0, 4)
  }

  const calculateDailyBusinessReview = (): DailyBusinessReview => {
    const todaySalesStartIdx = salesHistory.value.length - dailySalesCount.value
    const todaySales = todaySalesStartIdx >= 0 ? salesHistory.value.slice(todaySalesStartIdx) : []

    const hotGenres = calculateHotGenres(todaySales)
    const lostSalesResult = calculateLostSalesStats()
    const currentProfile = buildCustomerProfileSnapshot(customers.value, todaySales)
    const previousProfile = getPreviousDayProfile()
    const profileShift = calculateCustomerProfileShift(currentProfile, previousProfile)

    const avgSatisfaction = dailyServedCustomers.value > 0 ? dailySatisfactionSum.value / dailyServedCustomers.value : 50
    const suggestions = generateDailySuggestions(
      hotGenres,
      lostSalesResult,
      profileShift,
      { salesCount: dailySalesCount.value, avgSatisfaction, profit: dailyRevenue.value - dailyCost.value }
    )

    return {
      day: currentDay.value,
      hotGenres,
      lostSales: lostSalesResult.stats,
      totalLostSales: lostSalesResult.total,
      customerProfileShift: profileShift,
      suggestions
    }
  }

  const applyDailyOverstockPenalty = () => {
    if (!overstockConfig.value) return

    const penaltyResult = calculateTotalDailyPenalty(
      inventory.value,
      recordPerformances.value,
      currentDay.value,
      overstockConfig.value
    )

    if (penaltyResult.totalPenalty > 0) {
      budget.value -= penaltyResult.totalPenalty
      dailyCost.value += penaltyResult.totalPenalty
      currentLevelProfit.value -= penaltyResult.totalPenalty
      totalOverstockPenaltyAccumulated.value += penaltyResult.totalPenalty

      for (const item of penaltyResult.items) {
        const currentAccumulated = overstockPenalties.value.get(item.recordId) || 0
        overstockPenalties.value.set(item.recordId, currentAccumulated + item.penalty)
      }

      const penaltyItems = penaltyResult.items.map(i => {
        const invItem = inventory.value.find(inv => inv.record.id === i.recordId)
        return {
          recordId: i.recordId,
          recordTitle: invItem?.record.title || i.recordId,
          status: i.status,
          penalty: i.penalty
        }
      })

      dailyOverstockPenalty.value = {
        day: currentDay.value,
        totalPenalty: penaltyResult.totalPenalty,
        items: penaltyItems
      }

      recordLostSale('overstock_penalty')
    } else {
      dailyOverstockPenalty.value = null
    }
  }

  const sellAtDiscount = (recordId: string): { success: boolean; message: string; salePrice: number; profit: number } => {
    const invItem = inventory.value.find(i => i.record.id === recordId)
    if (!invItem || invItem.quantity <= 0) {
      return { success: false, message: '该唱片库存不存在', salePrice: 0, profit: 0 }
    }

    const info = overstockInfos.value.find(i => i.recordId === recordId)
    if (!info || info.status === 'normal') {
      return { success: false, message: '该唱片非滞销品，无需折价出售', salePrice: 0, profit: 0 }
    }

    if (info.suggestedDiscount <= 0) {
      return { success: false, message: '无法折价出售', salePrice: 0, profit: 0 }
    }

    const salePrice = info.discountedSellPrice
    const profit = salePrice - invItem.actualCostPrice

    budget.value += salePrice
    dailyRevenue.value += salePrice
    currentLevelProfit.value += profit
    currentLevelSales.value += 1
    totalProfit.value += profit

    invItem.quantity -= 1
    if (invItem.quantity <= 0) {
      inventory.value = inventory.value.filter(i => i.record.id !== recordId)
      const slotIndex = displaySlots.value.findIndex(s => s.inventoryId === recordId)
      if (slotIndex >= 0) {
        displaySlots.value[slotIndex].inventoryId = null
        displaySlots.value[slotIndex].conditionScore = null
      }
    }

    const discountPercent = Math.round(info.suggestedDiscount * 100)
    const statusLabel = info.status === 'deadstock' ? '死库存' : info.status === 'overstocked' ? '积压品' : '滞销品'

    return {
      success: true,
      message: `折价出售《${invItem.record.title}》！${statusLabel}以${discountPercent}%折扣价 ¥${salePrice} 清仓（原价 ¥${invItem.record.marketPrice}，利润 ¥${profit}）`,
      salePrice,
      profit
    }
  }

  const checkPurchaseOverstockRisk = (recordId: string): { shouldWarn: boolean; message: string } => {
    const existingItem = inventory.value.find(i => i.record.id === recordId)
    const currentStock = existingItem ? existingItem.quantity : 0

    let existingStatus: OverstockStatus | null = null
    if (existingItem && overstockConfig.value) {
      const daysInStock = currentDay.value - existingItem.purchaseDate
      const perf = recordPerformances.value.find(p => p.recordId === recordId)
      existingStatus = getOverstockStatus(daysInStock, perf?.sellThroughRate ?? 0, overstockConfig.value)
    }

    const perf = recordPerformances.value.find(p => p.recordId === recordId)
    const sellThroughRate = perf?.sellThroughRate ?? 0

    return generatePurchaseRiskWarning(recordId, currentStock, sellThroughRate, existingStatus)
  }

  const endDay = () => {
    stopPatienceTick()
    stopPlaying()
    degradeAllRecords()

    const atmosphereRepBonus = calculateDailyAtmosphereReputationBonus(genreAtmosphere.value)
    if (atmosphereRepBonus > 0) {
      shopReputation.value = Math.min(100, shopReputation.value + atmosphereRepBonus)
    }

    const promotionRepBonus = getPromotionReputationBonus()
    if (promotionRepBonus > 0) {
      shopReputation.value = Math.min(100, shopReputation.value + promotionRepBonus)
    }

    applyDailyOverstockPenalty()
    finalizeMissedReservations()

    const missedRepPenalty = dailyReservationMissedCount.value * 2
    if (missedRepPenalty > 0) {
      shopReputation.value = Math.max(0, shopReputation.value - missedRepPenalty)
    }
    const fulfilledRepBonus = dailyReservationFulfilledCount.value
    if (fulfilledRepBonus > 0) {
      shopReputation.value = Math.min(100, shopReputation.value + fulfilledRepBonus)
    }

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

    const review = calculateDailyBusinessReview()
    previousDayHotGenres.value = review.hotGenres

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
      ],
      events: dailyEvent.value ? [{ ...dailyEvent.value }] : [],
      review
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
        settleAllEndedAuctions(true)
        
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
          generateReservationsForNextDay()
          currentDay.value++
          resetDailyStats()
          phase.value = 'purchase'
          stopPlaying()
          incrementCollectionDaysOwned()
          
          genreMarketHeat.value = generateDailyMarketHeat(
            currentDay.value,
            genreMarketHeat.value,
            previousDayHotGenres.value
          )
          
          availableSuppliers.value = getAvailableSuppliersForLevel(currentLevel.value, shopReputation.value)
          if (currentSupplierId.value && !availableSuppliers.value.some(s => s.id === currentSupplierId.value)) {
            currentSupplierId.value = availableSuppliers.value.length > 0 ? availableSuppliers.value[0].id : null
          }
          if (currentSupplierId.value) {
            refreshSupplierInventory()
          }
          
          refreshActivePromotions()
          refreshDailyAuctions()
        }
        break
    }
  }

  const createEmptyExtended = (record: Record): CollectionItem['extended'] => {
    const story = generateRecordStory({
      id: record.id,
      title: record.title,
      artist: record.artist,
      genre: record.genre,
      rarity: record.rarity
    })
    story.chapters[0].isUnlocked = true
    story.chapters[0].unlockedDate = Date.now()
    story.unlockedChapters = 1
    
    const achievements = generateRecordAchievements(record.id, record.rarity)
    
    const achFirstPurchase = achievements.find(a => a.type === 'first_purchase')
    if (achFirstPurchase) {
      achFirstPurchase.isUnlocked = true
      achFirstPurchase.unlockedDate = Date.now()
      achFirstPurchase.progress = 1
    }
    
    if (record.rarity >= 4) {
      const achLegendary = achievements.find(a => a.type === 'legendary_find')
      if (achLegendary) {
        achLegendary.isUnlocked = true
        achLegendary.unlockedDate = Date.now()
        achLegendary.progress = 1
      }
    }
    
    const displayCopy = generateDisplayCopy({
      id: record.id,
      title: record.title,
      artist: record.artist,
      genre: record.genre,
      year: record.year,
      rarity: record.rarity
    })
    
    return {
      story,
      achievements,
      source: null,
      displayCopy,
      saleHistory: [],
      clearHistory: [],
      daysOwned: 1,
      timesRenovated: 0,
      totalSaleRevenue: 0,
      totalSalesCount: 0,
      isStoryUnlocked: true,
      unlockedAchievementCount: achievements.filter(a => a.isUnlocked).length
    }
  }

  const setCollectionSource = (recordId: string, source: CollectionSource) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (item) {
      item.extended.source = source
    }
  }

  const createCollectionSource = (
    type: CollectionSourceType,
    options: {
      sourceId?: string | null
      sourceName?: string
      customerId?: string | null
      customerName?: string | null
      levelId?: number | null
      eventId?: string | null
      description?: string
    } = {}
  ): CollectionSource => {
    const sourceLabels: { [key in CollectionSourceType]: { name: string; icon: string; desc: string } } = {
      'customer_gift': { name: '顾客赠送', icon: '🎁', desc: '高满意度顾客赠予的珍贵礼物' },
      'purchase': { name: '进货收藏', icon: '🛒', desc: '在供应商处购得后入藏' },
      'member_reward': { name: '会员回馈', icon: '👑', desc: '忠实会员赠送的特别礼物' },
      'event_reward': { name: '活动奖励', icon: '🎉', desc: '通过特殊事件获得' },
      'level_clear': { name: '通关奖励', icon: '🏆', desc: '完成关卡目标的奖励' },
      'special_customer': { name: '特殊顾客', icon: '⭐', desc: '来自特殊顾客的馈赠' },
      'album_bonus': { name: '图鉴奖励', icon: '📖', desc: '激活图鉴后的额外奖励' },
      'staff_reward': { name: '员工推荐', icon: '👨‍💼', desc: '员工协助发现的珍品' }
    }
    const label = sourceLabels[type]
    return {
      type,
      sourceId: options.sourceId || null,
      sourceName: options.sourceName || label.name,
      sourceIcon: label.icon,
      description: options.description || label.desc,
      timestamp: Date.now(),
      customerId: options.customerId || null,
      customerName: options.customerName || null,
      levelId: options.levelId || null,
      eventId: options.eventId || null
    }
  }

  const addToCollection = (
    record: Record, 
    purchasePrice: number, 
    conditionScore: number = 100,
    sourceOptions?: {
      type?: CollectionSourceType
      sourceId?: string | null
      sourceName?: string
      customerId?: string | null
      customerName?: string | null
      levelId?: number | null
      eventId?: string | null
      description?: string
    }
  ) => {
    if (collection.value.some(c => c.record.id === record.id)) return

    const collValue = calculateCollectionValue(record.rarity, conditionScore, record.marketPrice)
    
    const sourceType: CollectionSourceType = sourceOptions?.type || 'customer_gift'
    
    const collectionItem: CollectionItem = {
      record,
      acquiredDate: Date.now(),
      purchasePrice,
      isFavorite: false,
      notes: '',
      conditionScore,
      collectionValue: collValue,
      extended: createEmptyExtended(record)
    }
    
    const source = createCollectionSource(sourceType, sourceOptions)
    collectionItem.extended.source = source
    
    collection.value.push(collectionItem)

    const newlyActivated = checkAndActivateAlbums()
    updateCollectionBonuses()
    updateCollectionStoryProgress(record.id)

    return newlyActivated
  }

  const checkAndUpdateAchievements = (recordId: string) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (!item) return
    
    const ext = item.extended
    
    for (const ach of ext.achievements) {
      if (ach.isUnlocked) continue
      
      let shouldUnlock = false
      let progress = ach.progress
      
      switch (ach.type) {
        case 'perfect_condition':
          progress = item.conditionScore
          shouldUnlock = item.conditionScore >= ach.target
          break
        case 'repeat_sales':
          progress = ext.totalSalesCount
          shouldUnlock = ext.totalSalesCount >= ach.target
          break
        case 'renovated':
          progress = ext.timesRenovated
          shouldUnlock = ext.timesRenovated >= ach.target
          break
        case 'favorite_pick':
          progress = item.isFavorite ? 1 : 0
          shouldUnlock = item.isFavorite
          break
        case 'album_centerpiece':
          const isInAlbum = albumState.value.categories.some(cat =>
            cat.entries.some(entry =>
              entry.isActivated && entry.requiredRecordIds.includes(recordId)
            )
          )
          progress = isInAlbum ? 1 : 0
          shouldUnlock = isInAlbum
          break
      }
      
      ach.progress = progress
      if (shouldUnlock) {
        ach.isUnlocked = true
        ach.unlockedDate = Date.now()
      }
    }
    
    ext.unlockedAchievementCount = ext.achievements.filter(a => a.isUnlocked).length
  }

  const updateCollectionStoryProgress = (recordId: string) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (!item || !item.extended.story) return
    
    const story = item.extended.story
    const ext = item.extended
    
    for (let i = 0; i < story.chapters.length; i++) {
      const chapter = story.chapters[i]
      if (chapter.isUnlocked) continue
      
      let canUnlock = true
      
      if (chapter.requiredDaysOwned && ext.daysOwned < chapter.requiredDaysOwned) {
        canUnlock = false
      }
      if (chapter.requiredSalesCount && ext.totalSalesCount < chapter.requiredSalesCount) {
        canUnlock = false
      }
      if (chapter.requiredConditionScore && item.conditionScore < chapter.requiredConditionScore) {
        canUnlock = false
      }
      if (chapter.requiredRenovationCount && ext.timesRenovated < chapter.requiredRenovationCount) {
        canUnlock = false
      }
      if (chapter.requiredFavorite && !item.isFavorite) {
        canUnlock = false
      }
      if (chapter.requiredCompletedLevels) {
        const allLevelsCleared = chapter.requiredCompletedLevels.every(lvl => 
          completedLevels.value.includes(lvl)
        )
        if (!allLevelsCleared) canUnlock = false
      }
      
      if (canUnlock) {
        chapter.isUnlocked = true
        chapter.unlockedDate = Date.now()
        story.unlockedChapters++
      }
    }
    
    story.isStoryComplete = story.unlockedChapters >= story.totalChapters
  }

  const updateAllCollectionStoryProgress = () => {
    for (const item of collection.value) {
      updateCollectionStoryProgress(item.record.id)
      checkAndUpdateAchievements(item.record.id)
    }
  }

  const addSaleToCollectionHistory = (
    recordId: string,
    saleRecord: SaleRecord
  ) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (!item) return
    
    const ext = item.extended
    const customerName = saleRecord.memberId 
      ? (members.value.find(m => m.id === saleRecord.memberId)?.name || '顾客')
      : '顾客'
    
    ext.saleHistory.push({
      saleRecordId: saleRecord.recordId,
      salePrice: saleRecord.salePrice,
      customerName,
      timestamp: saleRecord.timestamp,
      satisfaction: saleRecord.customerSatisfaction,
      wasMember: !!saleRecord.memberId,
      memberLevel: saleRecord.memberLevel,
      wasBargained: saleRecord.wasBargained
    })
    
    ext.totalSalesCount++
    ext.totalSaleRevenue += saleRecord.salePrice
    
    const achFirstSale = ext.achievements.find(a => a.type === 'first_sale')
    if (achFirstSale && !achFirstSale.isUnlocked) {
      achFirstSale.isUnlocked = true
      achFirstSale.unlockedDate = Date.now()
      achFirstSale.progress = 1
    }
    
    const achHighValue = ext.achievements.find(a => a.type === 'high_value_sale')
    if (achHighValue && !achHighValue.isUnlocked) {
      const marketPrice = item.record.marketPrice
      if (saleRecord.salePrice >= marketPrice * 1.2) {
        achHighValue.isUnlocked = true
        achHighValue.unlockedDate = Date.now()
        achHighValue.progress = 1
      }
    }
    
    updateCollectionStoryProgress(recordId)
    checkAndUpdateAchievements(recordId)
  }

  const addLevelClearToCollectionHistory = (
    levelId: number,
    levelName: string,
    grade: string,
    totalScore: number
  ) => {
    for (const item of collection.value) {
      item.extended.clearHistory.push({
        levelId,
        levelName,
        clearedDate: Date.now(),
        grade,
        totalScore
      })
      updateCollectionStoryProgress(item.record.id)
      checkAndUpdateAchievements(item.record.id)
    }
  }

  const incrementCollectionDaysOwned = () => {
    for (const item of collection.value) {
      item.extended.daysOwned++
    }
    updateAllCollectionStoryProgress()
  }

  const toggleFavorite = (recordId: string) => {
    const item = collection.value.find(c => c.record.id === recordId)
    if (item) {
      item.isFavorite = !item.isFavorite
      updateCollectionBonuses()
      updateCollectionStoryProgress(recordId)
      checkAndUpdateAchievements(recordId)
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

  const checkAndActivateAlbums = () => {
    const newlyActivated: string[] = []
    const reputationGains: number[] = []

    for (let i = 0; i < albumState.value.categories.length; i++) {
      const category = albumState.value.categories[i]
      for (let j = 0; j < category.entries.length; j++) {
        const entry = category.entries[j]
        if (!entry.isActivated && checkAlbumActivation(entry, collection.value)) {
          albumState.value.categories[i].entries[j] = activateAlbum(entry)
          newlyActivated.push(entry.id)
          recentlyActivatedAlbums.value.push(entry.id)

          const repBonus = entry.bonuses.find(b => b.type === 'reputation')
          if (repBonus) {
            reputationGains.push(repBonus.value)
          }
        }
      }
    }

    if (newlyActivated.length > 0) {
      const stats = getTotalAlbumStats(albumState.value.categories)
      albumState.value.totalActivated = stats.totalActivated
      albumState.value.activatedBonuses = getActivatedBonuses(albumState.value.categories)

      const totalRepGain = reputationGains.reduce((sum, val) => sum + val, 0)
      if (totalRepGain > 0) {
        shopReputation.value = Math.min(100, shopReputation.value + totalRepGain)
      }

      updateSpecialCustomersUnlock()
      updateCollectionBonuses()
    }

    return newlyActivated
  }

  const updateSpecialCustomersUnlock = () => {
    const activatedAlbumIds = new Set<string>()
    for (const category of albumState.value.categories) {
      for (const entry of category.entries) {
        if (entry.isActivated) {
          activatedAlbumIds.add(entry.id)
        }
      }
    }

    for (let i = 0; i < specialCustomersState.value.length; i++) {
      const sc = specialCustomersState.value[i]
      if (!sc.isUnlocked) {
        const allRequired = sc.requiredAlbumIds.every(id => activatedAlbumIds.has(id))
        if (allRequired) {
          specialCustomersState.value[i].isUnlocked = true
        }
      }
    }
  }

  const updateCollectionBonuses = () => {
    const valueBonuses = getCollectionValueBonus(totalCollectionValue.value)
    const favBonuses = getFavoriteBonuses(favoriteCount.value)
    collectionBonuses.value = [...valueBonuses, ...favBonuses]
  }

  const generateSpecialCustomer = (baseId: string, config: SpecialCustomerConfig, reputation: number, _inventoryGenres: Genre[], timeSlot: TimeSlot): Customer => {
    const preference = {
      favoriteGenres: (['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk'] as Genre[]).sort(() => Math.random() - 0.5).slice(0, 3),
      priceRange: [300, 800] as [number, number],
      preferredRarity: [4, 5],
      preferenceStrength: 0.8 + Math.random() * 0.2
    }

    const slotConfig = getTimeSlotConfig(timeSlot)
    const baseBudget = preference.priceRange[1] * (2.5 + Math.random() * 1.5)
    const budget = Math.floor(getBudgetWithReputation(baseBudget, reputation) * slotConfig.budgetModifier * config.budgetMultiplier)
    const basePatience = 70 + Math.floor(Math.random() * 40)

    return {
      id: `cust-special-${baseId}-${Date.now()}`,
      name: config.name,
      avatar: config.avatar,
      preference,
      budget,
      patience: basePatience,
      maxPatience: basePatience,
      patienceDecayRate: defaultPatienceConfig.decayBaseRate * 0.75,
      arrivalOrder: 999,
      priorityScore: 90,
      satisfaction: 70 + config.satisfactionBonus,
      memberProfile: null,
      isReturningCustomer: false,
      memberDiscount: 0,
      bargainAggressiveness: 0.1 + Math.random() * 0.3,
      bargainToughness: 0.2 + Math.random() * 0.3,
      willBargain: Math.random() < 0.2,
      isImpatient: false,
      hasLeftAngrily: false,
      identityTag: 'collector' as const,
      reservationId: null,
      reservedRecordIds: []
    }
  }

  const getSpecialCustomerAppearanceChance = (config: SpecialCustomerConfig): number => {
    if (!config.isUnlocked) return 0
    const baseChance = config.baseAppearanceChance
    const albumMultiplier = 1 + specialCustomerBonus.value
    return baseChance * config.albumBonusMultiplier * albumMultiplier
  }

  const upgradeStaffSkill = (skillType: StaffSkillType): { success: boolean; message: string } => {
    const result = upgradeStaffSkillData(staff.value, skillType)
    if (result.success) {
      staff.value = result.state
    }
    return { success: result.success, message: result.message }
  }

  const addStaffPoints = (points: number) => {
    staff.value = addStaffPointsData(staff.value, points)
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
    themeMatches,
    activeThemes,
    themeMatchScoreBonus,
    themeBuyChanceBonus,
    playbackThemeBonus,
    allThemes,
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
    genreMarketHeat,
    hottestGenresToday,
    coldestGenresToday,
    getGenreHeat,
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
    genreAtmosphere,
    allGenreAtmospheres,
    topAtmosphereGenres,
    averageAtmosphere,
    getAtmosphereForGenre,
    getAtmospherePatienceSlowdown,
    getAtmosphereRecommendationBoost,
    getAtmosphereBuyChanceBoost,
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
    renovateCollectionItem,
    albumState,
    specialCustomersState,
    collectionBonuses,
    totalCollectionValue,
    favoriteCount,
    activatedAlbumBonuses,
    reputationBonusFromCollection,
    customerBudgetBonus,
    matchScoreBonusFromCollection,
    buyChanceBonusFromCollection,
    levelRewardBonus,
    specialCustomerBonus,
    priceBonusFromCollection,
    recordUnlockBonus,
    checkAndActivateAlbums,
    updateSpecialCustomersUnlock,
    updateCollectionBonuses,
    generateSpecialCustomer,
    getSpecialCustomerAppearanceChance,
    getAlbumBonus,
    dailyEvent,
    levelEvents,
    activeEventSummary,
    hasActiveEvent,
    eventCustomerCountModifier,
    eventBudgetModifier,
    eventBuyChanceModifier,
    eventSatisfactionModifier,
    consecutiveSkips,
    customersLeftAngrily,
    getCustomerPatienceInfo,
    getQueueCustomers,
    tickAllCustomerPatience,
    resortCustomerQueueIfNeeded,
    checkCurrentCustomerValid,
    overstockPenalties,
    dailyOverstockPenalty,
    totalOverstockPenaltyAccumulated,
    overstockConfig,
    overstockInfos,
    overstockWarnings,
    problemInventoryCount,
    totalDailyOverstockPenalty,
    effectiveProfit,
    applyDailyOverstockPenalty,
    sellAtDiscount,
    checkPurchaseOverstockRisk,
    getIdentityTagInfo,
    activePromotions,
    availablePromotionsForCurrentLevel,
    todayPromotions,
    hasActivePromotions,
    totalPromotionDiscountToday,
    dailyPromotionSales,
    dailyPromotionGiftsGiven,
    promotionHistory,
    getActivePromotionForRecord,
    isRecordOnPromotion,
    getRecordPromotionPrice,
    getPromotionBuyChanceForRecord,
    getPromotionSatisfactionForRecord,
    refreshActivePromotions,
    recordPromotionSale,
    resetDailyPromotionStats,
    trackBuyGiftPurchase,
    checkAndConsumeBuyGift,
    getPromotionReputationBonus,
    staff,
    upgradeStaffSkill,
    addStaffPoints,
    setCollectionSource,
    checkAndUpdateAchievements,
    updateCollectionStoryProgress,
    updateAllCollectionStoryProgress,
    addSaleToCollectionHistory,
    addLevelClearToCollectionHistory,
    incrementCollectionDaysOwned,
    reservations,
    reservationSummary,
    dailyReservationFulfilledCount,
    dailyReservationMissedCount,
    generateReservationsForNextDay,
    finalizeMissedReservations,
    updateReservationOnSale,
    currentAuctionItems,
    auctionHistory,
    frozenFunds,
    settlements,
    rareCollectors,
    activeRareCollectors,
    pendingCollectorOffers,
    auctionHouseStats,
    nextAuctionRefresh,
    isAuctionHouseOpen,
    selectedAuctionFilter,
    selectedAuctionId,
    totalFrozenFunds,
    availableBudgetForAuctions,
    activeAuctions,
    upcomingAuctions,
    endedAuctions,
    unlockedRareCollectors,
    rareCollectorAuctions,
    refreshDailyAuctions,
    placeAuctionBid,
    settleAuction,
    settleAllEndedAuctions,
    cancelAuction,
    getCollectorInfo,
    acceptCollectorOffer,
    setAuctionFilter,
    selectAuction,
    getSelectedAuction,
    getAuctionById,
    getBidHistory,
    getFilteredAuctions,
    getAuctionProgress,
    getMinNextBid
  }
})
