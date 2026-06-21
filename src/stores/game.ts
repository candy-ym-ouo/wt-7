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
  AuctionHouseStats, CollectionSourceType, CollectionSource,
  ShopRenovationState, ShopRenovationBonusSummary,
  SupplierRelationship, SupplierContractTier, SupplierBreachRecord,
  SupplierRelationshipBonusSummary,
  EncyclopediaState, EncyclopediaSeries,
  EncyclopediaRewardClaimResult,
  EncyclopediaFilterOptions,
  EncyclopediaEntry,
  AlbumBonus,
  FestivalState, FestivalTheme, FestivalSettlement, FestivalTaskConfig, FestivalCustomerConfig,
  SecondHandGameState,
  MusicFestivalCollabState, MusicFestivalCollabSettlement, MusicFestivalCollabTaskType,
  MusicFestivalCollabCustomer,
  MusicFestivalCollabStartResult, MusicFestivalCollabPurchaseResult,
  MusicFestivalCollabRefreshCustomerResult
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
  createInitialShopRenovationState,
  calculateRenovationBonusSummary,
  canUpgradeStyle,
  canUpgradeArea,
  canUpgradeCustomerAttraction,
  canUpgradeRevenueBonus,
  canUpgradeDisplaySlot,
  upgradeStyle as upgradeStyleData,
  upgradeArea as upgradeAreaData,
  upgradeCustomerAttraction as upgradeCustomerAttractionData,
  upgradeRevenueBonus as upgradeRevenueBonusData,
  upgradeDisplaySlot as upgradeDisplaySlotData,
  getShopStyleConfig,
  getShopAreaConfig,
  getCustomerAttractionConfig,
  getRevenueBonusConfig
} from '@/data/shopRenovation'
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
import {
  refreshPresaleData,
  createPresaleOrder,
  confirmPresaleOrder,
  payPresaleOrder,
  deliverPresaleOrder,
  cancelPresaleOrder,
  calculatePresaleStats,
  createInitialPresaleStats,
  generatePresaleRecommendation,
  getItemStatusInfo,
  getPresaleStatusLabel
} from '@/data/presale'
import type {
  PresaleItem, PresaleOrder, PresaleSettlement, PresaleEventPage, PresaleStats
} from '@/types'
import {
  createInitialRelationship,
  applyBreachPenalty,
  calculateTotalDiscount,
  getExclusiveSuppliesForSupplier,
  getMilestonesForRelationship,
  checkAndUnlockMilestones,
  calculateRelationshipBonusSummary,
  canSignContract,
  signContract,
  cancelContract,
  updateRelationshipOnPurchase,
  resetDailyTrustGain,
  getContractTierConfig,
  getNextContractTier,
  getTierColor,
  getTierBgColor,
  getBreachTypeLabel,
  getBreachTypeIcon,
  generateExclusiveSupplierInventory
} from '@/data/supplierRelationship'
import {
  createInitialMarketTourState,
  getCitiesForLevel,
  getCityById,
  getRandomMarketEvent,
  generateCustomerFlow,
  generateDailyMarketCustomers,
  createMarketInventoryFromStore
} from '@/data/marketTour'
import type {
  MarketTourState,
  MarketCity,
  MarketInventoryItem,
  MarketCustomer,
  MarketSettlement,
  CustomerFlowWave
} from '@/types'
import {
  createInitialRepairWorkshopState,
  getRepairMaterial,
  getRepairQualityConfig,
  getRecommendedMaterials,
  calculateMaterialCost,
  calculateTotalConditionBoost,
  calculateRepairLaborCost,
  calculateRepairDuration,
  simulateRepairResult,
  getRepairableInventory,
  generateRepairTaskId,
  canAffordMaterials,
  getRepairProfitEstimate,
  calculateTotalPriceBoost,
  calculateRarityUpChance
} from '@/data/repairWorkshop'
import type {
  RepairWorkshopState,
  RepairTask,
  RepairMaterialType,
  RepairQuality,
  RepairHistoryEntry
} from '@/types'
import {
  createInitialEncyclopediaState,
  updateEncyclopediaOnCollectionAdd,
  claimSeriesReward,
  claimAchievementReward,
  claimMilestoneReward,
  getSeriesProgress,
  rarityConfigs,
  getRarityColor,
  getRarityConfig
} from '@/data/encyclopedia'
import {
  createInitialFestivalState,
  getFestivalThemeConfig,
  generateFestivalMenu,
  generateFestivalTasks,
  getFestivalCustomersForTheme,
  getFestivalAtmosphereOverride,
  getRewardTier,
  calculateFestivalScore,
  shouldFestivalAppear
} from '@/data/festival'
import {
  createInitialMusicFestivalCollabState,
  generateCollabTasks,
  getThemeConfig,
  getRarityLabel as getCollabRarityLabelData,
  getRarityColor as getCollabRarityColorData,
  getTaskTypeLabel,
  getTaskStatusLabel,
  getTaskStatusColor,
  getRewardTierByScore,
  calculateCollabScore,
  getCustomerRefreshCost,
  canRefreshCustomers
} from '@/data/musicFestivalCollab'
import {
  createInitialSecondHandState,
  generateDailyAppraisals,
  performAppraisal as performAppraisalData,
  acceptAppraisal as acceptAppraisalData,
  rejectAppraisal as rejectAppraisalData,
  updateSecondHandStats,
  getOrCreateSellerProfile,
  updateSellerProfileOnAccept,
  addNotification as addSecondHandNotification,
  markNotificationsRead as markSecondHandNotificationsReadData,
  getUnreadNotificationCount,
  getAppraisalQualityLabel,
  getAppraisalQualityColor,
  getSourceLabel,
  getSourceIcon,
  getStatusLabel,
  getStatusColor
} from '@/data/secondHand'
import {
  createInitialQuestBoard,
  generateDailyQuests,
  acceptQuest,
  claimQuestReward,
  checkQuestExpiry,
  updateQuestProgress,
  getOverallProgress as questGetOverallProgress,
  getDaysRemaining as questGetDaysRemaining,
  formatDeadlineText as questFormatDeadlineText,
  getQuestRarityColor as questGetQuestRarityColor,
  getQuestRarityLabel as questGetQuestRarityLabel,
  getQuestTypeLabel as questGetQuestTypeLabel
} from '@/data/quests'
import type {
  DailyQuestBoard, Quest, QuestProgressUpdate, QuestAcceptResult, QuestClaimResult, QuestRarity, QuestType
} from '@/types'
import {
  createInitialCommunityState,
  likePost as likePostData,
  sharePost as sharePostData,
  createPost as createPostData,
  checkin as checkinData,
  signupForEvent as signupForEventData,
  claimReward as claimRewardData,
  updateChannelsByReputation,
  getTotalReach as getTotalReachData,
  getActiveSpreadNodes as getActiveSpreadNodesData,
  getUpcomingEvents as getUpcomingEventsData,
  getClaimableRewardsCount as getClaimableRewardsCountData,
  formatTimeAgo as formatTimeAgoData,
  getTrendColor as getTrendColorData,
  getTrendIcon as getTrendIconData,
  getHeatLevelLabel as getHeatLevelLabelData,
  getGenreIcon as getGenreIconData,
  refreshCommunityDaily
} from '@/data/community'
import type {
  CommunityState, CommunityPost, CommunityPostType,
  PostRewardResult, EventSignupResult, RewardClaimResult,
  Genre,
  BusinessAchievementState,
  AchievementProgressUpdateType,
  BusinessTitleConfig
} from '@/types'
import {
  createInitialAchievementState,
  updateAchievementProgress,
  claimAchievementReward as claimAchievementRewardData,
  equipTitle as equipTitleData,
  getCurrentEquippedTitle,
  getUnclaimedRewardCount,
  clearNewAchievementNotifications,
  getRarityLabel as getAchievementRarityLabel,
  getRarityColor as getAchievementRarityColor,
  getRarityBgColor as getAchievementRarityBgColor,
  achievementCategories
} from '@/data/achievements'

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

  const supplierRelationships = ref<Map<string, SupplierRelationship>>(new Map())
  const dailyBreachRecords = ref<SupplierBreachRecord[]>([])
  const newlyUnlockedMilestones = ref<string[]>([])
  const dailyPurchaseAmountPerSupplier = ref<Map<string, number>>(new Map())

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

  const shopRenovation = ref<ShopRenovationState>(createInitialShopRenovationState())

  const specialCustomersState = ref<SpecialCustomerConfig[]>(JSON.parse(JSON.stringify(specialCustomers)))
  const collectionBonuses = ref<CollectionBonus[]>([])
  const encyclopediaBonuses = ref<CollectionBonus[]>([])
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

  const presaleItems = ref<PresaleItem[]>([])
  const presaleOrders = ref<PresaleOrder[]>([])
  const presaleSettlements = ref<PresaleSettlement[]>([])
  const presaleEventPages = ref<PresaleEventPage[]>([])
  const presaleStats = ref<PresaleStats>(createInitialPresaleStats())
  const nextPresaleRefresh = ref(1)
  const selectedPresaleEventId = ref<string | null>(null)

  const marketTour = ref<MarketTourState>(createInitialMarketTourState())
  const marketCustomers = ref<MarketCustomer[]>([])
  const currentMarketCustomerIndex = ref(0)
  const currentMarketBargain = ref<{
    active: boolean
    recordId: string | null
    initialPrice: number
    customerOffer: number | null
    sellerCounter: number | null
    round: number
    maxRounds: number
  } | null>(null)

  const repairWorkshop = ref<RepairWorkshopState>(createInitialRepairWorkshopState())

  const encyclopedia = ref<EncyclopediaState>(createInitialEncyclopediaState())
  const encyclopediaNotification = ref<{
    show: boolean
    type: 'series' | 'achievement' | 'milestone'
    name: string
    message: string
  } | null>(null)

  const festival = ref<FestivalState>(createInitialFestivalState())

  const musicFestivalCollab = ref<MusicFestivalCollabState>(createInitialMusicFestivalCollabState())

  const secondHand = ref<SecondHandGameState>(createInitialSecondHandState())

  const questBoard = ref<DailyQuestBoard>(createInitialQuestBoard())
  const maxActiveQuests = 3
  const questNotification = ref<{ show: boolean; type: 'success' | 'info' | 'warning' | 'error'; message: string } | null>(null)

  const community = ref<CommunityState>(createInitialCommunityState())
  const communityNotification = ref<{ show: boolean; type: 'success' | 'info' | 'warning' | 'error'; message: string } | null>(null)

  const achievements = ref<BusinessAchievementState>(createInitialAchievementState())
  const achievementNotification = ref<{ show: boolean; type: 'unlock' | 'reward' | 'title'; name: string; icon: string } | null>(null)

  const secondHandPendingAppraisals = computed(() =>
    secondHand.value.appraisals.filter(a => a.status === 'pending_appraisal')
  )

  const secondHandInStockItems = computed(() =>
    secondHand.value.inventory.filter(i => i.status === 'in_stock')
  )

  const secondHandSoldItems = computed(() =>
    secondHand.value.sales.slice(-20).reverse()
  )

  const secondHandConsignmentItems = computed(() =>
    secondHand.value.inventory.filter(i => i.isConsignment && i.status === 'in_stock')
  )

  const secondHandRecycleItems = computed(() =>
    secondHand.value.inventory.filter(i => !i.isConsignment && i.status === 'in_stock')
  )

  const secondHandUnreadNotificationCount = computed(() =>
    getUnreadNotificationCount(secondHand.value)
  )

  const refreshSecondHandAppraisals = () => {
    if (currentDay.value < secondHand.value.nextAppraisalRefresh) return
    if (!baseLevelConfig.value) return

    const excludeIds = [
      ...inventory.value.map(i => i.record.id),
      ...secondHand.value.appraisals.map(a => a.record.id),
      ...secondHand.value.inventory.map(i => i.record.id),
      ...collection.value.map(c => c.record.id)
    ]
    const unlockedGenres = getUnlockedGenres(currentLevel.value)
    const memberProfileLevels = members.value.map(m => ({ level: m.level }))
    const count = 2 + Math.floor(shopReputation.value / 30)

    const newAppraisals = generateDailyAppraisals(
      currentDay.value,
      currentLevel.value,
      unlockedGenres,
      excludeIds,
      genreMarketHeat.value,
      count,
      memberProfileLevels
    )

    if (newAppraisals.length > 0) {
      secondHand.value.appraisals = [
        ...secondHand.value.appraisals.filter(a => a.status !== 'rejected' || currentDay.value - a.appraisedAt! < 3),
        ...newAppraisals
      ]
      secondHand.value.nextAppraisalRefresh = currentDay.value + 1
      secondHand.value = addSecondHandNotification(
        secondHand.value,
        `有${newAppraisals.length}个新的二手估价申请`,
        'info'
      )
    }

    updateSecondHandStatsState()
  }

  const performSecondHandAppraisal = (appraisalId: string, conditionScore: number) => {
    const appraisal = secondHand.value.appraisals.find(a => a.id === appraisalId)
    if (!appraisal || appraisal.status !== 'pending_appraisal') {
      return { success: false, message: '估价申请不存在或已处理' }
    }

    const result = performAppraisalData(appraisal, conditionScore, shopReputation.value)

    appraisal.finalAppraisalValue = result.finalValue
    appraisal.appraisalQuality = result.quality
    appraisal.appraisalNote = result.note
    appraisal.status = 'appraised'
    appraisal.appraisedAt = Date.now()
    appraisal.reputationImpact = result.reputationImpact

    return {
      success: true,
      message: `估价完成：${getAppraisalQualityLabel(result.quality)}，估价¥${result.finalValue}`,
      quality: result.quality,
      finalValue: result.finalValue,
      note: result.note,
      suggestedRecyclePrice: result.suggestedRecyclePrice,
      suggestedConsignmentPrice: result.suggestedConsignmentPrice,
      reputationImpact: result.reputationImpact
    }
  }

  const acceptSecondHandAppraisal = (appraisalId: string, negotiatedPrice: number) => {
    const appraisal = secondHand.value.appraisals.find(a => a.id === appraisalId)
    if (!appraisal) return { success: false, message: '估价申请不存在' }
    if (appraisal.status !== 'appraised') return { success: false, message: '请先完成估价' }
    if (!appraisal.finalAppraisalValue || !appraisal.appraisalQuality) {
      return { success: false, message: '估价信息不完整' }
    }

    if (appraisal.source === 'recycle') {
      if (budget.value < negotiatedPrice) {
        return { success: false, message: `预算不足！需要¥${negotiatedPrice}` }
      }
      budget.value -= negotiatedPrice
    }

    const conditionScore = 35 + (appraisal.appraisalQuality === 'perfect' ? 55 :
      appraisal.appraisalQuality === 'excellent' ? 40 :
      appraisal.appraisalQuality === 'good' ? 25 :
      appraisal.appraisalQuality === 'fair' ? 10 : 0) + Math.floor(Math.random() * 10)

    const { inventoryItem, updatedAppraisal, reputationChange } = acceptAppraisalData(
      appraisal,
      appraisal.finalAppraisalValue,
      appraisal.appraisalQuality,
      appraisal.appraisalNote!,
      negotiatedPrice,
      currentDay.value,
      secondHand.value.defaultConsignmentRate,
      conditionScore
    )

    const idx = secondHand.value.appraisals.findIndex(a => a.id === appraisalId)
    if (idx >= 0) secondHand.value.appraisals[idx] = updatedAppraisal

    secondHand.value.inventory.push(inventoryItem)

    if (reputationChange) {
      secondHand.value.reputationChanges.unshift(reputationChange)
      shopReputation.value = Math.max(0, Math.min(100, shopReputation.value + reputationChange.changeAmount))
      secondHand.value.stats.totalReputationImpact += reputationChange.changeAmount
      if (reputationChange.changeAmount > 0) {
        secondHand.value.stats.positiveReputationChanges++
      } else {
        secondHand.value.stats.negativeReputationChanges++
      }
    }

    const { profile, isNew } = getOrCreateSellerProfile(
      secondHand.value.sellerProfiles,
      appraisal.sellerName,
      appraisal.sellerAvatar,
      appraisal.isMember,
      appraisal.memberLevel
    )
    const updatedProfile = updateSellerProfileOnAccept(
      profile, true, appraisal.record.genre, appraisal.hasProvenance, Date.now()
    )
    if (isNew) {
      secondHand.value.sellerProfiles.push(updatedProfile)
    } else {
      const pIdx = secondHand.value.sellerProfiles.findIndex(p => p.id === profile.id)
      if (pIdx >= 0) secondHand.value.sellerProfiles[pIdx] = updatedProfile
    }

    secondHand.value = addSecondHandNotification(
      secondHand.value,
      `成功${appraisal.source === 'recycle' ? '回收' : '接收寄售'}《${appraisal.record.title}》`,
      'success'
    )

    updateSecondHandStatsState()
    return { success: true, message: '已成功接收！', inventoryItem }
  }

  const rejectSecondHandAppraisal = (appraisalId: string, reason: string) => {
    const appraisal = secondHand.value.appraisals.find(a => a.id === appraisalId)
    if (!appraisal) return { success: false, message: '估价申请不存在' }
    if (appraisal.status === 'rejected' || appraisal.status === 'accepted' ||
        appraisal.status === 'in_stock' || appraisal.status === 'sold') {
      return { success: false, message: '该申请已处理' }
    }

    const { updatedAppraisal, reputationChange } = rejectAppraisalData(
      appraisal, reason, currentDay.value
    )

    const idx = secondHand.value.appraisals.findIndex(a => a.id === appraisalId)
    if (idx >= 0) secondHand.value.appraisals[idx] = updatedAppraisal

    if (reputationChange) {
      secondHand.value.reputationChanges.unshift(reputationChange)
      shopReputation.value = Math.max(0, Math.min(100, shopReputation.value + reputationChange.changeAmount))
      secondHand.value.stats.totalReputationImpact += reputationChange.changeAmount
      if (reputationChange.changeAmount > 0) {
        secondHand.value.stats.positiveReputationChanges++
      } else {
        secondHand.value.stats.negativeReputationChanges++
      }
    }

    const { profile, isNew } = getOrCreateSellerProfile(
      secondHand.value.sellerProfiles,
      appraisal.sellerName,
      appraisal.sellerAvatar,
      appraisal.isMember,
      appraisal.memberLevel
    )
    const updatedProfile = updateSellerProfileOnAccept(
      profile, false, appraisal.record.genre, appraisal.hasProvenance, Date.now()
    )
    if (isNew) {
      secondHand.value.sellerProfiles.push(updatedProfile)
    } else {
      const pIdx = secondHand.value.sellerProfiles.findIndex(p => p.id === profile.id)
      if (pIdx >= 0) secondHand.value.sellerProfiles[pIdx] = updatedProfile
    }

    secondHand.value = addSecondHandNotification(
      secondHand.value,
      `已拒绝《${appraisal.record.title}》的${appraisal.sourceName}申请`,
      'warning'
    )

    updateSecondHandStatsState()
    return { success: true, message: '已拒绝申请' }
  }

  const adjustSecondHandPrice = (inventoryId: string, newPrice: number) => {
    const item = secondHand.value.inventory.find(i => i.id === inventoryId)
    if (!item) return { success: false, message: '商品不存在' }
    if (item.status !== 'in_stock') return { success: false, message: '商品不在销售中' }
    if (item.consignmentTerms && newPrice < item.consignmentTerms.minPrice) {
      return { success: false, message: `寄售商品最低价不能低于¥${item.consignmentTerms.minPrice}` }
    }
    if (newPrice < item.actualCostPrice && !item.isConsignment) {
      return { success: false, message: '不能低于回收成本价' }
    }
    item.currentPrice = newPrice
    return { success: true, message: '售价已调整' }
  }

  const markSecondHandNotificationsRead = () => {
    secondHand.value = markSecondHandNotificationsReadData(secondHand.value)
  }

  const setSecondHandFilter = (filter: SecondHandGameState['selectedFilter']) => {
    secondHand.value.selectedFilter = filter
  }

  const getSecondHandFiltered = () => {
    const filter = secondHand.value.selectedFilter
    switch (filter) {
      case 'pending': return secondHandPendingAppraisals.value
      case 'in_stock': return secondHandInStockItems.value
      case 'sold': return secondHandSoldItems.value
      case 'consignment': return secondHandConsignmentItems.value
      case 'recycle': return secondHandRecycleItems.value
      default: return secondHandInStockItems.value
    }
  }

  const updateSecondHandStatsState = () => {
    secondHand.value.stats = updateSecondHandStats(
      secondHand.value.stats,
      secondHand.value.appraisals,
      secondHand.value.inventory,
      secondHand.value.sales
    )
    secondHand.value.stats.trustedSellers = secondHand.value.sellerProfiles.filter(p => p.isTrustedSeller).length
    secondHand.value.stats.activeSellers = secondHand.value.sellerProfiles.filter(
      p => p.totalItemsSold > 0 || p.totalItemsSubmitted > 0
    ).length
  }

  const repairableInventory = computed(() => {
    const repairingIds = repairWorkshop.value.activeTasks.map(t => t.inventoryId)
    return getRepairableInventory(inventory.value).filter(
      item => !repairingIds.includes(inventory.value.indexOf(item).toString())
    )
  })

  const activeRepairTasks = computed(() => repairWorkshop.value.activeTasks)
  const completedRepairTasks = computed(() => repairWorkshop.value.completedTasks.slice(-10).reverse())
  const repairHistory = computed(() => repairWorkshop.value.history.slice(-20).reverse())
  const repairStats = computed(() => repairWorkshop.value.stats)
  const repairMaterials = computed(() => repairWorkshop.value.materials)
  const canStartNewRepair = computed(() => {
    return repairWorkshop.value.activeTasks.length < repairWorkshop.value.maxActiveTasks
  })

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
    const encyclopediaValue = encyclopediaBonuses.value
      .filter(b => b.bonusType === bonusType)
      .reduce((sum, b) => sum + b.value, 0)
    return albumValue + collectionValue + encyclopediaValue
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

  const getSupplierRelationship = (supplierId: string): SupplierRelationship => {
    return supplierRelationships.value.get(supplierId) || createInitialRelationship(supplierId)
  }

  const currentSupplierRelationship = computed<SupplierRelationship>(() => {
    if (!currentSupplierId.value) return createInitialRelationship('')
    return getSupplierRelationship(currentSupplierId.value)
  })

  const currentSupplierBonusSummary = computed<SupplierRelationshipBonusSummary>(() => {
    return calculateRelationshipBonusSummary(currentSupplierRelationship.value)
  })

  const allSupplierRelationships = computed<SupplierRelationship[]>(() => {
    return availableSuppliers.value.map(s => getSupplierRelationship(s.id))
  })

  const supplierDiscountForCurrent = computed(() => {
    return calculateTotalDiscount(currentSupplierRelationship.value)
  })

  const signSupplierContract = (supplierId: string, targetTier: SupplierContractTier): { success: boolean; message: string } => {
    const relationship = getSupplierRelationship(supplierId)
    const check = canSignContract(relationship, targetTier)
    if (!check.canSign) {
      return { success: false, message: check.reason }
    }
    const updated = signContract(relationship, targetTier, currentDay.value)
    supplierRelationships.value.set(supplierId, updated)
    const config = getContractTierConfig(targetTier)
    return { success: true, message: `成功签订${config.tierName}！${config.description}` }
  }

  const cancelSupplierContract = (supplierId: string): { success: boolean; message: string; breachRecord?: SupplierBreachRecord } => {
    const relationship = getSupplierRelationship(supplierId)
    if (!relationship.isActive) {
      return { success: false, message: '当前没有合约' }
    }
    const { updatedRelationship, breachRecord } = cancelContract(relationship, currentDay.value)
    supplierRelationships.value.set(supplierId, updatedRelationship)
    dailyBreachRecords.value.push(breachRecord)
    shopReputation.value = Math.max(0, shopReputation.value - breachRecord.reputationPenalty)
    if (breachRecord.fineAmount > 0) {
      budget.value = Math.max(0, budget.value - breachRecord.fineAmount)
    }
    return {
      success: true,
      message: `已解除合约，扣除信任 ${breachRecord.trustPenalty} 点，声望 -${breachRecord.reputationPenalty}，罚款 ¥${breachRecord.fineAmount}`,
      breachRecord
    }
  }

  const triggerBreach = (
    supplierId: string,
    type: SupplierBreachRecord['type'],
    orderAmount: number = 0
  ): SupplierBreachRecord | null => {
    const relationship = getSupplierRelationship(supplierId)
    const { updatedRelationship, breachRecord } = applyBreachPenalty(relationship, type, orderAmount, currentDay.value)
    supplierRelationships.value.set(supplierId, updatedRelationship)
    dailyBreachRecords.value.push(breachRecord)
    if (breachRecord.reputationPenalty > 0) {
      shopReputation.value = Math.max(0, shopReputation.value - breachRecord.reputationPenalty)
    }
    if (breachRecord.fineAmount > 0) {
      budget.value = Math.max(0, budget.value - breachRecord.fineAmount)
    }
    return breachRecord
  }

  const getSupplierExclusiveSupplies = (supplierId: string) => {
    const supplier = getSupplierById(supplierId)
    if (!supplier) return []
    const relationship = getSupplierRelationship(supplierId)
    return getExclusiveSuppliesForSupplier(supplier, relationship)
  }

  const getSupplierMilestones = (supplierId: string) => {
    const relationship = getSupplierRelationship(supplierId)
    return getMilestonesForRelationship(relationship)
  }

  const getSupplierBonusSummaryFor = (supplierId: string): SupplierRelationshipBonusSummary => {
    const relationship = getSupplierRelationship(supplierId)
    return calculateRelationshipBonusSummary(relationship)
  }

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
      
      for (const auction of currentAuctionItems.value) {
        if (auction.status === 'upcoming' && auction.startTime <= currentDay.value) {
          auction.status = 'active'
        }
      }
      
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

  const activePresaleItems = computed(() => {
    return presaleItems.value.filter(i => i.status === 'preselling')
  })

  const presaleToFulfillCount = computed(() => {
    return presaleOrders.value.filter(o =>
      o.status === 'confirmed' || o.status === 'paid' || o.status === 'locked'
    ).length
  })

  const presaleTotalDeposits = computed(() => {
    return presaleOrders.value
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + o.depositAmount, 0)
  })

  const presaleTotalRevenue = computed(() => {
    return presaleSettlements.value.reduce((sum, s) => sum + s.netRevenue, 0)
  })

  const selectedPresaleEvent = computed(() => {
    if (!selectedPresaleEventId.value) return null
    return presaleEventPages.value.find(p => p.id === selectedPresaleEventId.value) || null
  })

  const refreshPresaleItems = () => {
    const unlockedGenres = getUnlockedGenres(currentLevel.value)
    const result = refreshPresaleData(
      currentDay.value,
      currentLevel.value,
      unlockedGenres,
      presaleItems.value,
      presaleOrders.value,
      nextPresaleRefresh.value
    )
    presaleItems.value = result.items
    presaleOrders.value = result.orders
    if (result.eventPages.length > 0) {
      presaleEventPages.value = [
        ...presaleEventPages.value.filter(p => p.isActive && currentDay.value <= p.endDate),
        ...result.eventPages
      ]
    }
    nextPresaleRefresh.value = result.nextRefreshDay
    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)
  }

  const placePresaleOrder = (
    itemId: string,
    customerId: string,
    customerName: string,
    customerAvatar: string,
    memberProfile: MemberProfile | null,
    quantity: number,
    matchScore: number,
    recommendedReason: string
  ): { success: boolean; message: string; order?: PresaleOrder } => {
    const item = presaleItems.value.find(i => i.id === itemId)
    if (!item) return { success: false, message: '预售商品不存在' }

    const result = createPresaleOrder(
      item, customerId, customerName, customerAvatar, memberProfile,
      quantity, currentDay.value, matchScore, recommendedReason
    )
    if (!result) return { success: false, message: '无法创建预售订单' }

    const idx = presaleItems.value.findIndex(i => i.id === itemId)
    if (idx >= 0) presaleItems.value[idx] = result.updatedItem
    presaleOrders.value.push(result.order)
    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)

    return { success: true, message: `成功预订《${item.record.title}》×${quantity}`, order: result.order }
  }

  const confirmPresaleOrderAction = (orderId: string) => {
    const idx = presaleOrders.value.findIndex(o => o.id === orderId)
    if (idx < 0) return { success: false, message: '订单不存在' }
    presaleOrders.value[idx] = confirmPresaleOrder(presaleOrders.value[idx], currentDay.value)
    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)
    return { success: true, message: '订单已确认' }
  }

  const payPresaleOrderAction = (orderId: string) => {
    const order = presaleOrders.value.find(o => o.id === orderId)
    if (!order) return { success: false, message: '订单不存在' }
    if (budget.value < order.depositAmount) return { success: false, message: `预算不足！需要 ¥${order.depositAmount}` }

    budget.value -= order.depositAmount
    const idx = presaleOrders.value.findIndex(o => o.id === orderId)
    presaleOrders.value[idx] = payPresaleOrder(order, currentDay.value)
    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)
    return { success: true, message: `已支付定金 ¥${order.depositAmount}` }
  }

  const settlePresaleDeliveries = () => {
    for (let i = 0; i < presaleOrders.value.length; i++) {
      const order = presaleOrders.value[i]
      if (order.status !== 'locked' && order.status !== 'shipped') continue

      const item = presaleItems.value.find(it => it.id === order.presaleItemId)
      if (!item || (item.status !== 'shipped' && item.status !== 'delivered')) continue

      if (budget.value < order.remainingAmount) continue
      budget.value -= order.remainingAmount

      const result = deliverPresaleOrder(order, currentDay.value)
      if (!result) continue

      presaleOrders.value[i] = result.updatedOrder
      presaleSettlements.value.push(result.settlement)

      const invItem = inventory.value.find(inv => inv.record.id === order.recordId)
      if (invItem) {
        invItem.quantity += order.quantity
      } else {
        const record = getRecordById(order.recordId)
        if (record) {
          inventory.value.push({
            record,
            quantity: order.quantity,
            purchaseDate: currentDay.value,
            conditionScore: 85,
            actualCostPrice: order.unitPrice
          })
        }
      }

      shopReputation.value = Math.min(100, shopReputation.value + result.settlement.reputationImpact)
    }

    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)
  }

  const cancelPresaleOrderAction = (orderId: string) => {
    const idx = presaleOrders.value.findIndex(o => o.id === orderId)
    if (idx < 0) return { success: false, message: '订单不存在' }

    const order = presaleOrders.value[idx]
    if (order.status === 'paid' || order.status === 'confirmed') {
      budget.value += order.depositAmount
    }

    presaleOrders.value[idx] = cancelPresaleOrder(order, currentDay.value)

    const item = presaleItems.value.find(it => it.id === order.presaleItemId)
    if (item) {
      const itemIdx = presaleItems.value.indexOf(item)
      presaleItems.value[itemIdx] = {
        ...item,
        soldCount: Math.max(0, item.soldCount - order.quantity),
        availableStock: item.availableStock + order.quantity
      }
    }

    presaleStats.value = calculatePresaleStats(presaleOrders.value, presaleSettlements.value, presaleItems.value)
    return { success: true, message: '订单已取消，定金已退还' }
  }

  const getPresaleRecommendations = (customer: { favoriteGenres: Genre[]; preferredRarity: number[]; priceRange: [number, number] }) => {
    return generatePresaleRecommendation(customer, presaleItems.value, shopReputation.value)
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

    updateAchievementProgressAction('levels_cleared', completedLevels.value.length)
    
    if (grade === 'S') {
      const sGradeCount = collection.value.filter(c => 
        c.extended.clearHistory.some(h => h.grade === 'S')
      ).length
      updateAchievementProgressAction('s_grade_levels', sGradeCount + 1)
    }

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
    const totalSlots = Math.max(config.displaySlots, shopRenovationBonus.value.totalDisplaySlots)
    initializeDisplaySlots(totalSlots)
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
    supplierRelationships.value = new Map()
    dailyBreachRecords.value = []
    newlyUnlockedMilestones.value = []
    dailyPurchaseAmountPerSupplier.value = new Map()
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

    presaleItems.value = []
    presaleOrders.value = []
    presaleSettlements.value = []
    presaleEventPages.value = []
    presaleStats.value = createInitialPresaleStats()
    nextPresaleRefresh.value = 1
    selectedPresaleEventId.value = null
    
    checkAndActivateAlbums()
    updateCollectionBonuses()
    
    if (currentSupplierId.value) {
      refreshSupplierInventory()
    }
    
    refreshActivePromotions()
    refreshDailyAuctions()
    refreshPresaleItems()
    
    questBoard.value = createInitialQuestBoard()
    refreshDailyQuests()
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
    dailyBreachRecords.value = []
    newlyUnlockedMilestones.value = []

    for (const [supplierId, rel] of supplierRelationships.value.entries()) {
      supplierRelationships.value.set(supplierId, resetDailyTrustGain(rel))
    }
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
    
    const regularInventory = generateSupplierInventory(
      supplier,
      unlockedGenres,
      recordPerformances.value,
      genreMarketHeat.value,
      excludeIds,
      8,
      recordUnlockBonus.value
    )
    
    const relationship = getSupplierRelationship(supplier.id)
    const exclusiveInventory = generateExclusiveSupplierInventory(
      supplier,
      relationship,
      recordPerformances.value,
      genreMarketHeat.value,
      [...excludeIds, ...regularInventory.map(i => i.record.id)]
    )
    
    supplierInventory.value = [...exclusiveInventory, ...regularInventory]
  }

  const getSupplierInventoryItem = (recordId: string): SupplierInventoryItem | undefined => {
    return supplierInventory.value.find(item => item.record.id === recordId)
  }

  const purchaseFromSupplier = (supplierItem: SupplierInventoryItem, quantity: number = 1) => {
    const actualQty = Math.min(quantity, supplierItem.quantityAvailable)
    let totalCost = supplierItem.adjustedCostPrice * actualQty
    
    if (budget.value < totalCost) return { success: false, message: '预算不足！' }
    
    const supplier = getSupplierById(supplierItem.supplierId)
    const relationship = getSupplierRelationship(supplierItem.supplierId)
    
    for (const [otherSupplierId, otherRel] of supplierRelationships.value.entries()) {
      if (otherSupplierId === supplierItem.supplierId) continue
      if (otherRel.contractTier !== 'exclusive') continue
      
      const otherSupplier = getSupplierById(otherSupplierId)
      if (otherSupplier && supplier && otherSupplier.type === supplier.type) {
        triggerBreach(supplierItem.supplierId, 'exclusive_violation', totalCost)
        return { 
          success: false, 
          message: `违规！您与${otherSupplier.name}签有独家协议，不得从同类型其他供应商采购。已触发违约惩罚。` 
        }
      }
    }
    
    if (supplier && relationship.isActive && totalCost < supplier.minOrderAmount) {
      const currentDailyTotal = dailyPurchaseAmountPerSupplier.value.get(supplierItem.supplierId) || 0
      if (currentDailyTotal + totalCost < supplier.minOrderAmount) {
        return { 
          success: false, 
          message: `本次采购后当日累计 ¥${currentDailyTotal + totalCost} 仍未达最低订货金额 ¥${supplier.minOrderAmount}！继续采购或解约将触发违约惩罚。` 
        }
      }
    }

    const discountRate = calculateTotalDiscount(relationship)
    if (discountRate > 0) {
      const discountAmount = Math.floor(totalCost * discountRate)
      totalCost = totalCost - discountAmount
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

    const currentDailyTotal = dailyPurchaseAmountPerSupplier.value.get(supplierItem.supplierId) || 0
    dailyPurchaseAmountPerSupplier.value.set(supplierItem.supplierId, currentDailyTotal + totalCost)

    const updatedRelationship = updateRelationshipOnPurchase(
      relationship,
      totalCost,
      actualQty,
      currentDay.value
    )
    supplierRelationships.value.set(supplierItem.supplierId, updatedRelationship)

    const newMilestones = checkAndUnlockMilestones(updatedRelationship)
    if (newMilestones.length > 0) {
      updatedRelationship.unlockedMilestones = [...updatedRelationship.unlockedMilestones, ...newMilestones]
      supplierRelationships.value.set(supplierItem.supplierId, updatedRelationship)
      newlyUnlockedMilestones.value = [...newlyUnlockedMilestones.value, ...newMilestones]
    }
    
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
    if (supplierItem.isExclusiveSupply) {
      finalMessage = `【专属货源】${finalMessage}`
    }
    if (discountRate > 0) {
      finalMessage += ` 合约折扣 -${Math.round(discountRate * 100)}%，省 ¥${Math.floor(supplierItem.adjustedCostPrice * actualQty * discountRate)}！`
    }
    if (newMilestones.length > 0) {
      finalMessage += ` 解锁新里程碑！`
    }
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
    const budgetMultiplier = 1 + customerBudgetBonus.value + eventBudgetModifier.value + (shopRenovationBonus.value.budgetModifier - 1)
    const highBudgetChance = shopRenovationBonus.value.highBudgetCustomerChance
    const memberChanceBonus = shopRenovationBonus.value.memberChanceBonus
    
    return customerList.map(c => {
      let newBudget = Math.floor(c.budget * budgetMultiplier)
      
      if (Math.random() < highBudgetChance) {
        newBudget = Math.floor(newBudget * 1.5)
      }
      
      let newCustomer = {
        ...c,
        budget: newBudget
      }
      
      if (!newCustomer.memberProfile && Math.random() < memberChanceBonus) {
        newCustomer.memberProfile = createMemberProfile({
          id: newCustomer.id,
          name: newCustomer.name,
          avatar: newCustomer.avatar,
          preference: newCustomer.preference
        })
        newCustomer.memberDiscount = calculateMemberDiscount(newCustomer.memberProfile.level)
        newCustomer.isReturningCustomer = true
      }
      
      return newCustomer
    })
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
          genreMarketHeat.value,
          shopRenovationBonus.value.specialCustomerWeightBoost
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

    if (festival.value.isFestivalActive && festival.value.customers.length > 0) {
      const unlockedCustomers = festival.value.customers.filter(c => c.isUnlocked)
      const festivalCustomersToAdd: Customer[] = []

      for (const fc of unlockedCustomers) {
        if (Math.random() < fc.appearanceChance) {
          const festivalCust = generateFestivalCustomer(
            fc.id,
            fc,
            shopReputation.value,
            timeSlot
          )
          festivalCust.priorityScore = 93
          festivalCustomersToAdd.push(festivalCust)
        }
      }

      if (festivalCustomersToAdd.length > 0) {
        const slotsToReplace = Math.min(festivalCustomersToAdd.length, Math.max(1, Math.floor(customers.length * 0.15)))
        for (let i = 0; i < slotsToReplace && i < festivalCustomersToAdd.length; i++) {
          const replaceIndex = Math.min(
            customers.length - 1,
            reservationCustomers.length + Math.floor(Math.random() * Math.max(1, customers.length - reservationCustomers.length))
          )
          if (replaceIndex >= 0 && replaceIndex < customers.length) {
            const fc = festivalCustomersToAdd[i]
            fc.arrivalOrder = customers[replaceIndex]?.arrivalOrder || count + i + 100
            customers[replaceIndex] = fc
          }
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

    for (const [supplierId, relationship] of supplierRelationships.value.entries()) {
      if (!relationship.isActive) continue
      
      const supplier = getSupplierById(supplierId)
      if (!supplier) continue
      
      const dailyTotal = dailyPurchaseAmountPerSupplier.value.get(supplierId) || 0
      if (dailyTotal < supplier.minOrderAmount) {
        const tierConfig = getContractTierConfig(relationship.contractTier)
        const minOrderRequired = tierConfig.minOrderDiscount > 0 ? supplier.minOrderAmount : 0
        if (minOrderRequired > 0 && dailyTotal < minOrderRequired) {
          triggerBreach(supplierId, 'min_order_missed', supplier.minOrderAmount)
        }
      }
    }

    triggerDailyEvent()

    const baseCount = Math.min(
      baseLevelConfig.value.maxCustomers,
      5 + Math.floor(Math.random() * 4)
    )
    let totalCustomerCount = getCustomerCountWithReputation(baseCount, shopReputation.value)
    totalCustomerCount = Math.max(1, Math.floor(totalCustomerCount * (1 + eventCustomerCountModifier.value)))
    totalCustomerCount = Math.floor(totalCustomerCount * (1 + staff.value.dailyCapacityBonus))
    totalCustomerCount = Math.floor(totalCustomerCount * (1 + shopRenovationBonus.value.customerCountModifier))
    const slotCount = getCustomerCountForSlot(totalCustomerCount, currentTimeSlot.value)

    customers.value = generateCustomersWithSpecial(
      slotCount,
      currentDay.value,
      currentTimeSlot.value
    )

    if (festival.value.isFestivalActive) {
      const maxAtmosphere = Math.max(0, ...allGenreAtmospheres.value.map(a => a.value))
      if (maxAtmosphere > 0) {
        updateFestivalTaskProgress('atmosphere', Math.round(maxAtmosphere), { absoluteValue: true })
      }
      updateFestivalTaskProgress('collection', Math.round(totalCollectionValue.value))
    }

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
    totalCustomerCount = Math.floor(totalCustomerCount * (1 + shopRenovationBonus.value.customerCountModifier))
    const nightCount = getCustomerCountForSlot(totalCustomerCount, 'night')

    customers.value = generateCustomersWithSpecial(
      nightCount,
      currentDay.value,
      'night'
    )

    if (festival.value.isFestivalActive) {
      const maxAtmosphere = Math.max(0, ...allGenreAtmospheres.value.map(a => a.value))
      if (maxAtmosphere > 0) {
        updateFestivalTaskProgress('atmosphere', Math.round(maxAtmosphere), { absoluteValue: true })
      }
    }

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

    if (festival.value.isFestivalActive) {
      const atm = getAtmosphereForGenre(record.genre)
      updateFestivalTaskProgress('atmosphere', Math.round(atm.value))
    }
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

    if (shopRenovationBonus.value.salePriceBonus > 0) {
      baseSalePrice = Math.floor(baseSalePrice * (1 + shopRenovationBonus.value.salePriceBonus))
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

    let baseScore = score + collectionMatchBonus + themeBonus + shopRenovationBonus.value.matchScoreBonus
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
    buyChance += shopRenovationBonus.value.buyChanceBonus

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
      const baseProfit = salePrice - invItem.actualCostPrice
      const profit = Math.floor(baseProfit * (1 + shopRenovationBonus.value.profitMarginBonus))
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
          promotionSatisfactionBonus + shopRenovationBonus.value.satisfactionBonus
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

      updateQuestProgressAction({ type: 'sell_quantity', value: 1 })
      updateQuestProgressAction({ type: 'sell_record', value: 1, genre: record.genre, recordId: record.id, rarity: record.rarity, condition: slotConditionScore })
      updateQuestProgressAction({ type: 'sell_genre', value: 1, genre: record.genre })
      updateQuestProgressAction({ type: 'reach_profit', value: profit, genre: record.genre })
      updateQuestProgressAction({ type: 'customer_satisfaction', value: satisfaction, customerId: customer.id })

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

      if (festival.value.isFestivalActive) {
        updateFestivalTaskProgress('sales', 1)
        updateFestivalTaskProgress('genre', 1, { genre: record.genre as Genre })
        if (customer.isFestivalCustomer && customer.festivalCustomerId) {
          recordFestivalCustomerEncounter(
            customer.festivalCustomerId,
            satisfaction,
            record.id
          )
        }
        updateFestivalTaskProgress('collection', Math.round(totalCollectionValue.value))
      }

      if (musicFestivalCollab.value.isCollabActive) {
        updateCollabTaskProgress('sales', 1)
        updateCollabTaskProgress('genre', 1, { genre: record.genre as Genre })
        updateCollabTaskProgress('special', 1, { rarity: record.rarity })
        if (customer.isFestivalCustomer && customer.festivalCustomerId) {
          const isCollabCustomer = musicFestivalCollab.value.activeCollabCustomerIds.includes(customer.id)
          if (isCollabCustomer) {
            recordCollabCustomerEncounter(
              customer.festivalCustomerId,
              satisfaction,
              record.id
            )
          }
        }
        updateCollabTaskProgress('collection', Math.round(totalCollectionValue.value))
      }

      updateAchievementProgressAction('total_sales', salesHistory.value.length)
      updateAchievementProgressAction('single_sale_price', salePrice)
      
      if (wasBargained) {
        const bargainCount = salesHistory.value.filter(s => s.wasBargained).length + 1
        updateAchievementProgressAction('bargain_success', bargainCount)
      }
      
      if (satisfaction >= 80) {
        const satisfiedCount = salesHistory.value.filter(s => s.customerSatisfaction >= 80).length + 1
        updateAchievementProgressAction('customer_satisfaction', satisfiedCount)
      }

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

      if (festival.value.isFestivalActive && customer.isFestivalCustomer && customer.festivalCustomerId) {
        recordFestivalCustomerEncounter(
          customer.festivalCustomerId,
          finalDissatisfaction,
          null
        )
      }

      if (musicFestivalCollab.value.isCollabActive && customer.isFestivalCustomer && customer.festivalCustomerId) {
        const isCollabCustomer = musicFestivalCollab.value.activeCollabCustomerIds.includes(customer.id)
        if (isCollabCustomer) {
          recordCollabCustomerEncounter(
            customer.festivalCustomerId,
            finalDissatisfaction,
            null
          )
        }
      }

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

      if (festival.value.isFestivalActive && customer.isFestivalCustomer && customer.festivalCustomerId) {
        const patienceRatio = customer.patience / customer.maxPatience
        const encounterSatisfaction = Math.max(10, 30 + (patienceRatio < 0.3 ? -5 : 0))
        recordFestivalCustomerEncounter(
          customer.festivalCustomerId,
          encounterSatisfaction,
          null
        )
      }

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

    const dailyProfit = dailyRevenue.value - dailyCost.value
    updateAchievementProgressAction('daily_profit', dailyProfit)
    updateAchievementProgressAction('total_profit', totalProfit.value)
    updateAchievementProgressAction('avg_satisfaction', Math.round(avgSatisfaction))
    updateAchievementProgressAction('consecutive_days', currentDay.value)
    updateAchievementProgressAction('member_count', members.value.length)

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
          advanceFestivalDay()
          advanceMusicFestivalCollabDay()
          resetDailyStats()
          refreshCommunityDailyState()
          dailyPurchaseAmountPerSupplier.value.clear()
          phase.value = 'purchase'
          stopPlaying()
          incrementCollectionDaysOwned()
          
          checkAllQuestsExpiry()
          refreshDailyQuests()
          
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
          refreshPresaleItems()
          settlePresaleDeliveries()
        }
        break
    }
  }

  const showQuestNotification = (type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    questNotification.value = { show: true, type, message }
    setTimeout(() => {
      questNotification.value = null
    }, 3000)
  }

  const refreshDailyQuests = () => {
    const lastRefresh = questBoard.value.lastRefreshDay
    if (lastRefresh >= currentDay.value) return

    const newQuests = generateDailyQuests(currentLevel.value, 4)
    questBoard.value.availableQuests = [
      ...questBoard.value.availableQuests.filter(q => {
        if (q.config.isRepeatable) return true
        return true
      }),
      ...newQuests
    ].slice(0, 8)

    questBoard.value.lastRefreshDay = currentDay.value
    questBoard.value.day = currentDay.value
  }

  const checkAllQuestsExpiry = () => {
    const expiredQuests: Quest[] = []
    questBoard.value.activeQuests = questBoard.value.activeQuests.filter(quest => {
      const { quest: updatedQuest, expired } = checkQuestExpiry(quest, currentDay.value)
      if (expired) {
        expiredQuests.push(updatedQuest)
        return false
      }
      Object.assign(quest, updatedQuest)
      return true
    })
    questBoard.value.failedQuests.push(...expiredQuests)
    
    const completedButNotClaimed = questBoard.value.activeQuests.filter(q => q.status === 'completed')
    questBoard.value.completedQuests.push(...completedButNotClaimed)
    questBoard.value.activeQuests = questBoard.value.activeQuests.filter(q => q.status !== 'completed')
  }

  const acceptQuestAction = (questId: string): QuestAcceptResult => {
    const availableIndex = questBoard.value.availableQuests.findIndex(q => q.config.id === questId)
    if (availableIndex < 0) {
      return { success: false, message: '任务不存在' }
    }
    const quest = questBoard.value.availableQuests[availableIndex]
    const result = acceptQuest(quest, currentDay.value, questBoard.value.activeQuests.length, maxActiveQuests)
    
    if (result.success && result.quest) {
      questBoard.value.availableQuests.splice(availableIndex, 1)
      questBoard.value.activeQuests.push(result.quest)
      showQuestNotification('info', result.message)
    } else if (!result.success) {
      showQuestNotification('warning', result.message)
    }
    return result
  }

  const claimQuestRewardAction = (questId: string): QuestClaimResult => {
    const activeIndex = questBoard.value.activeQuests.findIndex(q => q.config.id === questId)
    const completedIndex = questBoard.value.completedQuests.findIndex(q => q.config.id === questId)
    let quest: Quest | undefined
    let sourceArray: Quest[] | null = null
    let sourceIndex = -1

    if (activeIndex >= 0) {
      quest = questBoard.value.activeQuests[activeIndex]
      sourceArray = questBoard.value.activeQuests
      sourceIndex = activeIndex
    } else if (completedIndex >= 0) {
      quest = questBoard.value.completedQuests[completedIndex]
      sourceArray = questBoard.value.completedQuests
      sourceIndex = completedIndex
    }

    if (!quest || !sourceArray) {
      return { success: false, message: '任务不存在' }
    }

    const result = claimQuestReward(quest, currentDay.value)
    if (result.success && result.reward) {
      sourceArray.splice(sourceIndex, 1)
      questBoard.value.claimedQuests.push({
        ...quest,
        status: 'claimed',
        claimedDay: currentDay.value
      })

      budget.value += result.reward.budget
      shopReputation.value = Math.min(100, shopReputation.value + result.reward.reputation)
      if (result.reward.growthPoints) {
        dailyGrowthPointsEarned.value += result.reward.growthPoints
      }
      if (result.reward.bonusRecordId) {
        const bonusRecord = getRecordById(result.reward.bonusRecordId)
        if (bonusRecord) {
          const invItem: InventoryItem = {
            record: bonusRecord,
            quantity: 1,
            purchaseDate: currentDay.value,
            conditionScore: 85,
            actualCostPrice: 0
          }
          inventory.value.push(invItem)
        }
      }

      questBoard.value.totalQuestsCompleted++
      questBoard.value.totalRewardsEarned.budget += result.reward.budget
      questBoard.value.totalRewardsEarned.reputation += result.reward.reputation
      if (result.reward.growthPoints) {
        questBoard.value.totalRewardsEarned.growthPoints += result.reward.growthPoints
      }

      showQuestNotification('success', result.message)
    } else if (!result.success) {
      showQuestNotification('warning', result.message)
    }
    return result
  }

  const updateQuestProgressAction = (update: QuestProgressUpdate) => {
    let newlyCompletedCount = 0
    questBoard.value.activeQuests = questBoard.value.activeQuests.map(quest => {
      const { quest: updatedQuest, justCompleted } = updateQuestProgress(quest, update)
      if (justCompleted) {
        newlyCompletedCount++
        showQuestNotification('success', `🎉 任务「${quest.config.title}」已完成！点击领取奖励`)
      }
      return updatedQuest
    })
    return newlyCompletedCount
  }

  const getCompletedActiveQuests = computed(() => {
    return questBoard.value.activeQuests.filter(q => q.status === 'completed')
  })

  const getClaimableQuestCount = computed(() => {
    return questBoard.value.activeQuests.filter(q => q.status === 'completed').length +
           questBoard.value.completedQuests.length
  })

  const getQuestById = (questId: string): Quest | undefined => {
    return [
      ...questBoard.value.availableQuests,
      ...questBoard.value.activeQuests,
      ...questBoard.value.completedQuests,
      ...questBoard.value.claimedQuests,
      ...questBoard.value.failedQuests
    ].find(q => q.config.id === questId)
  }

  const getOverallProgress = (quest: Quest): number => {
    return questGetOverallProgress(quest)
  }

  const getDaysRemaining = (quest: Quest, currentDayVal: number): number => {
    return questGetDaysRemaining(quest, currentDayVal)
  }

  const formatDeadlineText = (quest: Quest, currentDayVal: number): string => {
    return questFormatDeadlineText(quest, currentDayVal)
  }

  const getQuestRarityColor = (rarity: QuestRarity): string => {
    return questGetQuestRarityColor(rarity)
  }

  const getQuestRarityLabel = (rarity: QuestRarity): string => {
    return questGetQuestRarityLabel(rarity)
  }

  const getQuestTypeLabel = (type: QuestType): string => {
    return questGetQuestTypeLabel(type)
  }

  const communityPosts = computed(() => community.value.posts)
  const communityTrends = computed(() => community.value.trends)
  const communitySpreadNodes = computed(() => community.value.spreadNodes)
  const communityChannels = computed(() => community.value.channels)
  const communityEvents = computed(() => community.value.events)
  const communityRewards = computed(() => community.value.rewards)
  const communityStats = computed(() => community.value.stats)
  const communitySelectedTab = computed(() => community.value.selectedTab)
  const communityTodayCheckedIn = computed(() => community.value.todayCheckedIn)
  const communityUnreadNotifications = computed(() => community.value.unreadNotifications)
  const communityTotalReach = computed(() => getTotalReachData(community.value))
  const communityActiveSpreadNodes = computed(() => getActiveSpreadNodesData(community.value))
  const communityUpcomingEvents = computed(() => getUpcomingEventsData(community.value))
  const communityClaimableRewardsCount = computed(() => getClaimableRewardsCountData(community.value))

  const setCommunityTab = (tab: 'posts' | 'trends' | 'spread' | 'events' | 'rewards') => {
    community.value.selectedTab = tab
  }

  const likeCommunityPost = (postId: string): { post: CommunityPost | undefined; reputationGain: number; growthPoints: number } => {
    const result = likePostData(postId, community.value)
    if (result.reputationGain > 0) {
      shopReputation.value = Math.min(100, shopReputation.value + result.reputationGain)
    }
    if (result.growthPoints > 0) {
      dailyGrowthPointsEarned.value += result.growthPoints
    }
    return result
  }

  const shareCommunityPost = (postId: string): { post: CommunityPost | undefined; reputationGain: number; growthPoints: number } => {
    const result = sharePostData(postId, community.value)
    if (result.reputationGain > 0) {
      shopReputation.value = Math.min(100, shopReputation.value + result.reputationGain)
    }
    if (result.growthPoints > 0) {
      dailyGrowthPointsEarned.value += result.growthPoints
    }
    return result
  }

  const createCommunityPost = (
    type: CommunityPostType,
    content: string,
    recordTitle?: string,
    recordArtist?: string,
    recordGenre?: Genre,
    recordCoverColor?: string,
    tags: string[] = []
  ): PostRewardResult => {
    const post = createPostData(type, content, recordTitle, recordArtist, recordGenre, recordCoverColor, tags)
    community.value.posts.unshift(post)
    community.value.stats.totalPosts += 1
    community.value.stats.dailyPosts += 1

    const reputationGain = post.reputationImpact
    shopReputation.value = Math.min(100, shopReputation.value + reputationGain)

    const postReward = community.value.rewards.find(r => r.type === 'post_reward' && r.requirement.type === 'posts' && r.requirement.target === 1)
    if (postReward) {
      postReward.requirement.current = Math.min(postReward.requirement.current + 1, postReward.requirement.target)
      if (postReward.requirement.current >= postReward.requirement.target) {
        postReward.isClaimable = true
      }
    }

    const postReward5 = community.value.rewards.find(r => r.type === 'post_reward' && r.requirement.type === 'posts' && r.requirement.target === 5)
    if (postReward5) {
      postReward5.requirement.current = Math.min(postReward5.requirement.current + 1, postReward5.requirement.target)
      if (postReward5.requirement.current >= postReward5.requirement.target) {
        postReward5.isClaimable = true
      }
    }

    return {
      success: true,
      message: '发布成功！',
      rewards: { reputation: reputationGain },
      post
    }
  }

  const communityCheckin = (): { success: boolean; message: string; budgetReward: number; reputationReward: number } => {
    const result = checkinData(community.value)
    if (result.success) {
      budget.value += result.budgetReward
      shopReputation.value = Math.min(100, shopReputation.value + result.reputationReward)

      const dailyReward = community.value.rewards.find(r => r.type === 'daily_checkin')
      if (dailyReward && dailyReward.requirement.current >= dailyReward.requirement.target) {
        dailyReward.isClaimable = true
      }
    }
    return result
  }

  const signupForCommunityEvent = (eventId: string): EventSignupResult => {
    const result = signupForEventData(eventId, community.value, shopReputation.value, budget.value)
    if (result.success && result.cost !== undefined) {
      budget.value -= result.cost
    }
    return result
  }

  const claimCommunityReward = (rewardId: string): RewardClaimResult => {
    const result = claimRewardData(rewardId, community.value)
    if (result.success) {
      if (result.budgetGained) budget.value += result.budgetGained
      if (result.reputationGained) shopReputation.value = Math.min(100, shopReputation.value + result.reputationGained)
      if (result.growthPointsGained) dailyGrowthPointsEarned.value += result.growthPointsGained
    }
    return result
  }

  const getCommunityGenreIcon = (genre: Genre): string => {
    return getGenreIconData(genre)
  }

  const getCommunityTrendColor = (heatLevel: string): string => {
    return getTrendColorData(heatLevel)
  }

  const getCommunityTrendIcon = (trend: 'rising' | 'stable' | 'falling'): string => {
    return getTrendIconData(trend)
  }

  const getCommunityHeatLevelLabel = (heatLevel: string): string => {
    return getHeatLevelLabelData(heatLevel)
  }

  const formatCommunityTimeAgo = (timestamp: number): string => {
    return formatTimeAgoData(timestamp)
  }

  const communityCheckinStatus = computed(() => {
    const dayNames = ['一', '二', '三', '四', '五', '六', '日']
    const streak = community.value.stats.consecutiveCheckinDays
    const todayIdx = (community.value.lastRefreshDay - 1) % 7
    
    const weeklyCheckin = dayNames.map((name, idx) => {
      const dayNum = idx + 1
      const isToday = idx === todayIdx
      const checked = idx < todayIdx || (isToday && community.value.todayCheckedIn)
      const isRewardDay = dayNum % 3 === 0 || dayNum === 7
      const rewardType = isRewardDay ? (dayNum === 7 ? 'bonus' : 'reputation') : 'coins'
      
      return {
        dayName: `周${name}`,
        dayNum,
        checked,
        isToday,
        isRewardDay,
        rewardType
      }
    })
    
    return {
      streakDays: streak,
      weeklyCheckin,
      todayCheckedIn: community.value.todayCheckedIn
    }
  })

  const signupCommunityEvent = signupForCommunityEvent

  const refreshCommunityChannels = () => {
    updateChannelsByReputation(community.value, shopReputation.value)
  }

  const refreshCommunityDailyState = () => {
    refreshCommunityDaily(community.value, currentDay.value)
    updateChannelsByReputation(community.value, shopReputation.value)
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

    updateAchievementProgressAction('collection_count', collection.value.length)
    updateAchievementProgressAction('collection_value', totalCollectionValue.value)
    
    if (record.rarity >= 4) {
      const rareCount = collection.value.filter(c => 
        c.record.rarity >= 4
      ).length
      updateAchievementProgressAction('rare_records', rareCount)
    }

    updateQuestProgressAction({
      type: 'collect_record',
      value: 1,
      genre: record.genre,
      recordId: record.id,
      rarity: record.rarity,
      condition: conditionScore
    })

    const newlyActivated = checkAndActivateAlbums()
    updateCollectionBonuses()
    updateCollectionStoryProgress(record.id)

    const { updatedState, newUnlocks } = updateEncyclopediaOnCollectionAdd(
      encyclopedia.value,
      collectionItem,
      currentLevel.value
    )
    encyclopedia.value = updatedState
    rebuildEncyclopediaBonuses()

    if (newUnlocks.series.length > 0) {
      const seriesId = newUnlocks.series[0]
      const series = encyclopedia.value.categories
        .flatMap(c => c.series)
        .find(s => s.id === seriesId)
      if (series) {
        showEncyclopediaNotification('series', series.name, '套系完成！可领取奖励')
      }
    }
    if (newUnlocks.achievements.length > 0) {
      const achId = newUnlocks.achievements[0]
      const ach = encyclopedia.value.achievements.find(a => a.id === achId)
      if (ach) {
        showEncyclopediaNotification('achievement', ach.name, '成就解锁！可领取奖励')
      }
    }

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
    rebuildEncyclopediaBonuses()
  }

  const rebuildEncyclopediaBonuses = () => {
    const bonuses: CollectionBonus[] = []

    for (const category of encyclopedia.value.categories) {
      for (const series of category.series) {
        if (series.rewardClaimed) {
          for (const reward of series.rewards) {
            if (reward.type === 'reputation') continue
            bonuses.push({
              source: 'encyclopedia',
              sourceId: `encyclopedia-series-${series.id}`,
              bonusType: reward.type,
              value: reward.value,
              description: reward.description
            })
          }
        }
      }
    }

    for (const achievement of encyclopedia.value.achievements) {
      if (achievement.rewardClaimed) {
        for (const reward of achievement.rewards) {
          if (reward.type === 'reputation') continue
          bonuses.push({
            source: 'encyclopedia',
            sourceId: `encyclopedia-achievement-${achievement.id}`,
            bonusType: reward.type,
            value: reward.value,
            description: reward.description
          })
        }
      }
    }

    for (const milestone of encyclopedia.value.milestones) {
      if (milestone.isClaimed) {
        for (const reward of milestone.rewards) {
          if (reward.type === 'reputation') continue
          bonuses.push({
            source: 'encyclopedia',
            sourceId: `encyclopedia-milestone-${milestone.id}`,
            bonusType: reward.type,
            value: reward.value,
            description: reward.description
          })
        }
      }
    }

    encyclopediaBonuses.value = bonuses
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

  const generateFestivalCustomer = (
    baseId: string,
    fc: FestivalCustomerConfig,
    reputation: number,
    timeSlot: TimeSlot
  ): Customer => {
    const prefGenres = fc.favoriteGenres.length >= 3
      ? [...fc.favoriteGenres]
      : [...fc.favoriteGenres, 'Jazz', 'Rock', 'Soul'].slice(0, 3)

    const preference = {
      favoriteGenres: prefGenres as Genre[],
      priceRange: [
        Math.round(300 * fc.budgetMultiplier),
        Math.round(1200 * fc.budgetMultiplier)
      ] as [number, number],
      preferredRarity: fc.rarity === 'legendary' ? [3, 4, 5] : fc.rarity === 'epic' ? [3, 4] : [2, 3, 4],
      preferenceStrength: 0.7 + Math.random() * 0.25
    }

    const slotConfig = getTimeSlotConfig(timeSlot)
    const baseBudget = preference.priceRange[1] * (1.8 + Math.random() * 1.2)
    const budget = Math.floor(getBudgetWithReputation(baseBudget, reputation) * slotConfig.budgetModifier * fc.budgetMultiplier)
    const basePatience = 80 + Math.floor(Math.random() * 40)

    const identityTag = fc.rarity === 'legendary' ? 'collector' : fc.rarity === 'epic' ? 'connoisseur' : 'enthusiast'

    return {
      id: `cust-festival-${baseId}-${Date.now()}`,
      name: fc.name,
      avatar: fc.avatar,
      preference,
      budget,
      patience: basePatience,
      maxPatience: basePatience,
      patienceDecayRate: defaultPatienceConfig.decayBaseRate * 0.8,
      arrivalOrder: 999,
      priorityScore: 92,
      satisfaction: 65 + fc.satisfactionBonus,
      memberProfile: null,
      isReturningCustomer: false,
      memberDiscount: 0,
      bargainAggressiveness: 0.05 + Math.random() * 0.2,
      bargainToughness: 0.15 + Math.random() * 0.25,
      willBargain: fc.rarity === 'legendary' ? Math.random() < 0.1 : Math.random() < 0.2,
      isImpatient: false,
      hasLeftAngrily: false,
      identityTag: identityTag as any,
      reservationId: null,
      reservedRecordIds: [],
      isFestivalCustomer: true,
      festivalCustomerId: fc.id,
      festivalCustomerRarity: fc.rarity
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

  const shopRenovationBonus = computed<ShopRenovationBonusSummary>(() => {
    return calculateRenovationBonusSummary(shopRenovation.value)
  })

  const currentShopStyleConfig = computed(() => getShopStyleConfig(shopRenovation.value.currentStyle))
  const currentShopAreaConfig = computed(() => getShopAreaConfig(shopRenovation.value.currentArea))
  const currentCustomerAttractionConfig = computed(() => getCustomerAttractionConfig(shopRenovation.value.customerAttraction))
  const currentRevenueBonusConfig = computed(() => getRevenueBonusConfig(shopRenovation.value.revenueBonus))

  const canUpgradeShopStyle = computed(() => canUpgradeStyle(shopRenovation.value, budget.value, shopReputation.value, currentLevel.value))
  const canUpgradeShopArea = computed(() => canUpgradeArea(shopRenovation.value, budget.value, currentLevel.value))
  const canUpgradeShopAttraction = computed(() => canUpgradeCustomerAttraction(shopRenovation.value, budget.value, shopReputation.value, currentLevel.value))
  const canUpgradeShopRevenue = computed(() => canUpgradeRevenueBonus(shopRenovation.value, budget.value, currentLevel.value))

  const getCanUpgradeDisplaySlot = (slotId: number) => {
    return canUpgradeDisplaySlot(slotId, shopRenovation.value, budget.value, currentLevel.value)
  }

  const upgradeShopStyle = (): { success: boolean; message: string } => {
    const check = canUpgradeStyle(shopRenovation.value, budget.value, shopReputation.value, currentLevel.value)
    if (!check.canUpgrade || !check.nextConfig) {
      return { success: false, message: check.reason }
    }
    budget.value -= check.nextConfig.cost
    const result = upgradeStyleData(shopRenovation.value, currentDay.value)
    if (result.success) {
      shopRenovation.value = result.newState
    }
    return { success: result.success, message: result.message }
  }

  const upgradeShopArea = (): { success: boolean; message: string } => {
    const check = canUpgradeArea(shopRenovation.value, budget.value, currentLevel.value)
    if (!check.canUpgrade || !check.nextConfig) {
      return { success: false, message: check.reason }
    }
    budget.value -= check.nextConfig.cost
    const result = upgradeAreaData(shopRenovation.value, currentDay.value)
    if (result.success) {
      shopRenovation.value = result.newState
    }
    return { success: result.success, message: result.message }
  }

  const upgradeShopAttraction = (): { success: boolean; message: string } => {
    const check = canUpgradeCustomerAttraction(shopRenovation.value, budget.value, shopReputation.value, currentLevel.value)
    if (!check.canUpgrade || !check.nextConfig) {
      return { success: false, message: check.reason }
    }
    budget.value -= check.nextConfig.cost
    const result = upgradeCustomerAttractionData(shopRenovation.value, currentDay.value)
    if (result.success) {
      shopRenovation.value = result.newState
    }
    return { success: result.success, message: result.message }
  }

  const upgradeShopRevenue = (): { success: boolean; message: string } => {
    const check = canUpgradeRevenueBonus(shopRenovation.value, budget.value, currentLevel.value)
    if (!check.canUpgrade || !check.nextConfig) {
      return { success: false, message: check.reason }
    }
    budget.value -= check.nextConfig.cost
    const result = upgradeRevenueBonusData(shopRenovation.value, currentDay.value)
    if (result.success) {
      shopRenovation.value = result.newState
    }
    return { success: result.success, message: result.message }
  }

  const upgradeDisplaySlotType = (slotId: number): { success: boolean; message: string } => {
    const check = canUpgradeDisplaySlot(slotId, shopRenovation.value, budget.value, currentLevel.value)
    if (!check.canUpgrade || !check.nextConfig) {
      return { success: false, message: check.reason }
    }
    budget.value -= check.nextConfig.cost
    const result = upgradeDisplaySlotData(slotId, shopRenovation.value, currentDay.value)
    if (result.success) {
      shopRenovation.value = result.newState
    }
    return { success: result.success, message: result.message }
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

  const availableMarketCities = computed((): MarketCity[] => {
    const levelCities = getCitiesForLevel(currentLevel.value)
    return levelCities.map(c => ({
      ...c,
      isUnlocked: marketTour.value.unlockedCityIds.includes(c.id)
    }))
  })

  const currentMarketCity = computed((): MarketCity | null => {
    if (!marketTour.value.currentCityId) return null
    return getCityById(marketTour.value.currentCityId)
  })

  const getCurrentMarketCustomer = (): MarketCustomer | null => {
    if (marketCustomers.value.length === 0) return null
    return marketCustomers.value[currentMarketCustomerIndex.value] || null
  }

  const getMarketInventoryValue = (): number => {
    return marketTour.value.temporaryInventory.reduce((sum, item) => {
      const remaining = item.quantity - item.soldQuantity
      return sum + remaining * item.actualCostPrice
    }, 0)
  }

  const getMarketSalesStats = () => {
    const totalRevenue = marketTour.value.marketSales.reduce((s, r) => s + r.salePrice, 0)
    const totalCost = marketTour.value.marketSales.reduce((s, r) => s + r.costPrice, 0)
    const avgSatisfaction = marketTour.value.marketSales.length > 0
      ? marketTour.value.marketSales.reduce((s, r) => s + r.satisfaction, 0) / marketTour.value.marketSales.length
      : 0
    const waveCounts: { [key in CustomerFlowWave]: number } = { low: 0, normal: 0, peak: 0, surge: 0 }
    for (const s of marketTour.value.marketSales) {
      waveCounts[s.wave] = (waveCounts[s.wave] || 0) + 1
    }
    let peakWave: CustomerFlowWave = 'normal'
    let peakCount = 0
    for (const [w, c] of Object.entries(waveCounts) as [CustomerFlowWave, number][]) {
      if (c > peakCount) {
        peakCount = c
        peakWave = w
      }
    }
    return {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      salesCount: marketTour.value.marketSales.length,
      avgSatisfaction,
      peakSalesWave: peakWave
    }
  }

  const startMarketPlanning = () => {
    marketTour.value = {
      ...createInitialMarketTourState(),
      settlementHistory: marketTour.value.settlementHistory,
      unlockedCityIds: marketTour.value.unlockedCityIds,
      totalMarketProfit: marketTour.value.totalMarketProfit,
      totalMarketSales: marketTour.value.totalMarketSales,
      reputationFromMarkets: marketTour.value.reputationFromMarkets,
      preferredCityIds: marketTour.value.preferredCityIds,
      isActive: true,
      phase: 'planning'
    }
    marketCustomers.value = []
    currentMarketCustomerIndex.value = 0
    currentMarketBargain.value = null
  }

  const selectMarketCity = (cityId: string): { success: boolean; message: string } => {
    const city = getCityById(cityId)
    if (!city) return { success: false, message: '城市不存在' }
    if (!marketTour.value.unlockedCityIds.includes(cityId)) {
      return { success: false, message: '该城市尚未解锁' }
    }
    if (city.minLevel > currentLevel.value) {
      return { success: false, message: `需要达到第${city.minLevel}关才能前往` }
    }
    marketTour.value.selectedCityId = cityId
    return { success: true, message: `已选择${city.name}` }
  }

  const unlockMarketCity = (cityId: string): { success: boolean; message: string } => {
    const city = getCityById(cityId)
    if (!city) return { success: false, message: '城市不存在' }
    if (marketTour.value.unlockedCityIds.includes(cityId)) {
      return { success: false, message: '该城市已解锁' }
    }
    const cost = city.unlockCost || 0
    if (budget.value < cost) {
      return { success: false, message: `资金不足！需要¥${cost}` }
    }
    budget.value -= cost
    marketTour.value.unlockedCityIds.push(cityId)
    return { success: true, message: `成功解锁${city.name}！` }
  }

  const setMarketInventory = (
    selectedRecordIds: string[],
    quantities: Map<string, number>
  ): { success: boolean; message: string } => {
    if (!marketTour.value.selectedCityId) {
      return { success: false, message: '请先选择目的地城市' }
    }
    
    const tempInv = createMarketInventoryFromStore(inventory.value, selectedRecordIds, quantities)
    
    if (tempInv.length === 0) {
      return { success: false, message: '请选择至少一张唱片' }
    }
    
    for (const item of tempInv) {
      const storeItem = inventory.value.find(i => i.record.id === item.record.id)
      if (storeItem) {
        if (storeItem.quantity < item.quantity) {
          return { success: false, message: `《${item.record.title}》库存不足` }
        }
      }
    }
    
    for (const item of tempInv) {
      const storeItem = inventory.value.find(i => i.record.id === item.record.id)
      if (storeItem) {
        storeItem.quantity -= item.quantity
      }
    }
    
    inventory.value = inventory.value.filter(i => i.quantity > 0)
    
    marketTour.value.temporaryInventory = tempInv
    marketTour.value.marketInventoryValue = getMarketInventoryValue()
    
    return { success: true, message: `已选${tempInv.length}种唱片，准备出发！` }
  }

  const adjustMarketSalePrice = (recordId: string, newPrice: number): { success: boolean; message: string } => {
    const item = marketTour.value.temporaryInventory.find(i => i.record.id === recordId)
    if (!item) return { success: false, message: '商品不存在' }
    if (newPrice < item.actualCostPrice) {
      return { success: false, message: '售价不能低于进价' }
    }
    item.salePrice = newPrice
    return { success: true, message: '售价已调整' }
  }

  const startMarketTrip = (): { success: boolean; message: string } => {
    if (!marketTour.value.selectedCityId) {
      return { success: false, message: '请先选择目的地' }
    }
    const city = getCityById(marketTour.value.selectedCityId)
    if (!city) return { success: false, message: '城市不存在' }
    
    if (marketTour.value.temporaryInventory.length === 0) {
      return { success: false, message: '请先准备临时库存' }
    }
    
    if (budget.value < city.travelCost) {
      return { success: false, message: `旅费不足！需要¥${city.travelCost}` }
    }
    
    budget.value -= city.travelCost
    marketTour.value.currentMarketDayCost += city.travelCost
    
    marketTour.value.currentCityId = marketTour.value.selectedCityId
    marketTour.value.travelDaysRemaining = city.travelDays
    marketTour.value.daysAtMarket = 0
    marketTour.value.phase = 'traveling'
    
    return { success: true, message: `出发前往${city.name}！` }
  }

  const advanceMarketDay = (): { success: boolean; message: string; phase?: string } => {
    if (!marketTour.value.isActive) {
      return { success: false, message: '没有进行中的市集' }
    }
    
    const city = currentMarketCity.value
    if (!city) return { success: false, message: '城市信息错误' }
    
    if (marketTour.value.phase === 'traveling') {
      marketTour.value.travelDaysRemaining--
      if (marketTour.value.travelDaysRemaining <= 0) {
        marketTour.value.phase = 'setup'
        marketTour.value.daysAtMarket = 0
        marketTour.value.customerFlow = generateCustomerFlow(city.tier, 0)
        return { success: true, message: `已抵达${city.name}！准备布置摊位`, phase: 'setup' }
      }
      return { success: true, message: `旅途中...还剩${marketTour.value.travelDaysRemaining}天`, phase: 'traveling' }
    }
    
    if (marketTour.value.phase === 'setup') {
      marketTour.value.phase = 'selling'
      marketTour.value.daysAtMarket = 1
      
      if (budget.value < city.rentCost) {
        return { success: false, message: `摊位租金不足！需要¥${city.rentCost}` }
      }
      budget.value -= city.rentCost
      marketTour.value.currentMarketDayCost += city.rentCost
      
      marketTour.value.customerFlow = generateCustomerFlow(city.tier, 0)
      adjustMarketCustomerFlow()
      
      let eventTriggered = false
      if (Math.random() < city.eventDensity * 0.5) {
        eventTriggered = triggerMarketEvent()
      }
      
      if (!eventTriggered) {
        regenerateTodayMarketCustomers()
        return { success: true, message: `市集第1天开始！今日${marketCustomers.value.length}位顾客`, phase: 'selling' }
      }
      
      return { success: true, message: `市集第1天开始！发生了一个事件，请选择应对方式`, phase: 'event' }
    }
    
    if (marketTour.value.phase === 'selling') {
      marketTour.value.dailyMarketRevenue.push(marketTour.value.currentMarketDayRevenue)
      marketTour.value.dailyMarketCost.push(marketTour.value.currentMarketDayCost)
      marketTour.value.dailyMarketSalesCount.push(marketTour.value.currentMarketDaySalesCount)
      
      if (marketTour.value.daysAtMarket >= marketTour.value.maxDaysAtMarket) {
        marketTour.value.phase = 'settlement'
        return { success: true, message: '市集结束，准备结算', phase: 'settlement' }
      }
      
      marketTour.value.daysAtMarket++
      resetMarketDayStats()
      advanceDayEventEffects()
      
      if (budget.value < city.rentCost) {
        marketTour.value.phase = 'settlement'
        return { success: false, message: `租金不足，提前结束市集`, phase: 'settlement' }
      }
      budget.value -= city.rentCost
      marketTour.value.currentMarketDayCost += city.rentCost
      
      adjustMarketCustomerFlow()
      
      let eventTriggered = false
      if (Math.random() < city.eventDensity) {
        eventTriggered = triggerMarketEvent()
      }
      
      if (!eventTriggered) {
        regenerateTodayMarketCustomers()
        return { success: true, message: `市集第${marketTour.value.daysAtMarket}天开始！今日${marketCustomers.value.length}位顾客`, phase: 'selling' }
      }
      
      return { success: true, message: `市集第${marketTour.value.daysAtMarket}天开始！发生了一个事件，请选择应对方式`, phase: 'event' }
    }
    
    return { success: false, message: '当前阶段无法推进' }
  }

  const resetMarketDayStats = () => {
    marketTour.value.currentMarketDayRevenue = 0
    marketTour.value.currentMarketDayCost = 0
    marketTour.value.currentMarketDaySalesCount = 0
    marketTour.value.currentMarketDaySatisfactionSum = 0
    marketTour.value.currentMarketDayCustomersServed = 0
  }

  const adjustMarketCustomerFlow = () => {
    const city = currentMarketCity.value
    if (!city) return
    
    marketTour.value.customerFlow.nextWaveIn--
    if (marketTour.value.customerFlow.nextWaveIn <= 0) {
      marketTour.value.customerFlow = generateCustomerFlow(city.tier, marketTour.value.daysAtMarket)
    }
    
    for (const entry of marketTour.value.activeEventEffects) {
      const eff = entry.effects
      marketTour.value.customerFlow.customerMultiplier = Math.max(0.2, 
        marketTour.value.customerFlow.customerMultiplier * (1 + eff.customerCountModifier)
      )
      marketTour.value.customerFlow.budgetMultiplier = Math.max(0.5,
        marketTour.value.customerFlow.budgetMultiplier * (1 + eff.budgetModifier)
      )
      marketTour.value.customerFlow.buyChanceBonus += eff.buyChanceModifier
    }
  }

  const regenerateTodayMarketCustomers = () => {
    const city = currentMarketCity.value
    if (!city) return
    
    const repModifier = 1 + (shopReputation.value - 50) / 100
    marketCustomers.value = generateDailyMarketCustomers(
      city,
      marketTour.value.customerFlow,
      repModifier,
      getUnlockedGenres(currentLevel.value)
    )
    currentMarketCustomerIndex.value = 0
  }

  const advanceDayEventEffects = () => {
    const remaining: typeof marketTour.value.activeEventEffects = []
    for (const entry of marketTour.value.activeEventEffects) {
      if (entry.remainingDays > 1) {
        remaining.push({
          ...entry,
          remainingDays: entry.remainingDays - 1
        })
      }
    }
    marketTour.value.activeEventEffects = remaining
  }

  const getMarketRecommendations = (customer: MarketCustomer | null): {
    item: MarketInventoryItem
    score: number
    matchReasons: string[]
  }[] => {
    if (!customer) return []
    
    const results: { item: MarketInventoryItem; score: number; matchReasons: string[] }[] = []
    
    for (const item of marketTour.value.temporaryInventory) {
      if (item.quantity - item.soldQuantity <= 0) continue
      
      let score = 50
      const reasons: string[] = []
      
      const genreMatch = customer.favoriteGenres.includes(item.record.genre)
      if (genreMatch) {
        score += 25
        reasons.push('风格匹配')
      }
      
      const rarityMatch = customer.preferredRarity.includes(item.record.rarity)
      if (rarityMatch) {
        score += 15
        reasons.push('稀有度偏好')
      }
      
      const priceInRange = item.salePrice >= customer.priceRange[0] && item.salePrice <= customer.priceRange[1]
      if (priceInRange) {
        score += 15
        reasons.push('价格合适')
      } else if (item.salePrice < customer.priceRange[0]) {
        score += 5
      } else {
        score -= 10
      }
      
      const conditionBonus = (item.conditionScore - 50) / 10
      score += conditionBonus
      
      score += marketTour.value.customerFlow.buyChanceBonus * 20
      
      if (customer.isLocalCollector && item.record.rarity >= 3) {
        score += 20
        reasons.push('本地藏家偏好')
      }
      
      if (customer.isTourist && genreMatch) {
        score += 10
        reasons.push('游客纪念')
      }
      
      score = Math.max(0, Math.min(100, score))
      
      results.push({ item, score, matchReasons: reasons })
    }
    
    return results.sort((a, b) => b.score - a.score)
  }

  const tryMarketSale = (
    recordId: string,
    askPrice: number
  ): { success: boolean; message: string; profit?: number } => {
    const customer = getCurrentMarketCustomer()
    if (!customer) return { success: false, message: '没有顾客' }
    
    const item = marketTour.value.temporaryInventory.find(i => i.record.id === recordId)
    if (!item) return { success: false, message: '商品不存在' }
    if (item.quantity - item.soldQuantity <= 0) {
      return { success: false, message: '已售罄' }
    }
    
    const finalPrice = askPrice
    if (finalPrice < item.actualCostPrice) {
      return { success: false, message: '售价低于进价' }
    }
    
    const recs = getMarketRecommendations(customer)
    const rec = recs.find(r => r.item.record.id === recordId)
    const matchScore = rec?.score || 30
    
    const priceModifier = marketTour.value.activeEvent?.activeEffects.priceModifier || 0
    const effectivePrice = finalPrice * (1 + priceModifier)
    
    if (customer.budget < effectivePrice) {
      return { success: false, message: '顾客预算不足' }
    }
    
    let buyChance = 0.3 + (matchScore - 50) / 100
    buyChance += marketTour.value.customerFlow.buyChanceBonus
    
    if (finalPrice > customer.priceRange[1]) {
      buyChance -= 0.3
    }
    
    buyChance = Math.max(0.05, Math.min(0.95, buyChance))
    
    if (customer.willBargain && matchScore > 50 && finalPrice > customer.priceRange[0] * 1.2) {
      return { success: false, message: '顾客想议价，试试议价模式' }
    }
    
    if (Math.random() > buyChance) {
      customer.patience -= 15
      customer.satisfaction = Math.max(0, customer.satisfaction - 10)
      return { success: false, message: '顾客不太满意，离开了' }
    }
    
    const profit = finalPrice - item.actualCostPrice
    const satisfaction = 50 + matchScore / 2
    
    item.soldQuantity++
    budget.value += Math.floor(finalPrice * customer.tipMultiplier)
    marketTour.value.currentMarketDayRevenue += Math.floor(finalPrice * customer.tipMultiplier)
    marketTour.value.currentMarketDaySalesCount++
    marketTour.value.currentMarketDaySatisfactionSum += satisfaction
    marketTour.value.currentMarketDayCustomersServed++
    
    customer.satisfaction = satisfaction
    
    marketTour.value.marketSales.push({
      id: `ms-${Date.now()}-${Math.random()}`,
      recordId: item.record.id,
      recordTitle: item.record.title,
      salePrice: Math.floor(finalPrice * customer.tipMultiplier),
      costPrice: item.actualCostPrice,
      profit,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      satisfaction,
      wasBargained: false,
      wave: marketTour.value.customerFlow.currentWave,
      timestamp: Date.now()
    })
    
    return {
      success: true,
      message: `成交！《${item.record.title}》售出，利润+¥${profit}${customer.tipMultiplier > 1 ? '（含小费）' : ''}`,
      profit
    }
  }

  const startMarketBargain = (
    recordId: string,
    askPrice: number
  ): { success: boolean; message: string; offerPrice?: number } => {
    const customer = getCurrentMarketCustomer()
    if (!customer) return { success: false, message: '没有顾客' }
    if (!customer.willBargain) return { success: false, message: '这位顾客不想议价' }
    
    const item = marketTour.value.temporaryInventory.find(i => i.record.id === recordId)
    if (!item) return { success: false, message: '商品不存在' }
    
    currentMarketBargain.value = {
      active: true,
      recordId,
      initialPrice: askPrice,
      customerOffer: null,
      sellerCounter: null,
      round: 0,
      maxRounds: 3
    }
    
    const minAccept = Math.max(item.actualCostPrice * 1.1, customer.priceRange[0] * 0.9)
    const offerVariance = 0.85 + Math.random() * 0.2
    const customerOffer = Math.floor(Math.min(askPrice, Math.max(minAccept, askPrice * offerVariance)))
    
    currentMarketBargain.value.customerOffer = customerOffer
    currentMarketBargain.value.round = 1
    
    return {
      success: true,
      message: `${customer.name}报价¥${customerOffer}，要还价吗？`,
      offerPrice: customerOffer
    }
  }

  const makeMarketCounterOffer = (
    counterPrice: number
  ): { success: boolean; message: string; accepted?: boolean; finalPrice?: number; failed?: boolean; nextOffer?: number } => {
    const bargain = currentMarketBargain.value
    const customer = getCurrentMarketCustomer()
    const item = bargain?.recordId ? marketTour.value.temporaryInventory.find(i => i.record.id === bargain.recordId) : null
    
    if (!bargain || !customer || !item) {
      return { success: false, message: '议价状态错误' }
    }
    if (counterPrice < item.actualCostPrice) {
      return { success: false, message: '不能低于进价！' }
    }
    
    bargain.sellerCounter = counterPrice
    bargain.round++
    
    const offer = bargain.customerOffer || 0
    const customerMax = Math.max(customer.priceRange[1], item.record.marketPrice * 1.2)
    
    if (counterPrice <= offer * 1.05) {
      return acceptMarketBargainResult(counterPrice, item, customer)
    }
    
    if (counterPrice > customerMax * 1.1 || bargain.round > bargain.maxRounds) {
      currentMarketBargain.value = null
      customer.patience -= 20
      customer.satisfaction = Math.max(0, customer.satisfaction - 15)
      return { success: true, message: '顾客不接受报价，生气地走了', failed: true }
    }
    
    const nextOffer = Math.floor(offer + (counterPrice - offer) * (0.3 + Math.random() * 0.4))
    bargain.customerOffer = nextOffer
    
    return {
      success: true,
      message: `${customer.name}加价到¥${nextOffer}`,
      nextOffer
    }
  }

  const acceptMarketOffer = (): { success: boolean; message: string; finalPrice?: number } => {
    const bargain = currentMarketBargain.value
    const customer = getCurrentMarketCustomer()
    const item = bargain?.recordId ? marketTour.value.temporaryInventory.find(i => i.record.id === bargain.recordId) : null
    
    if (!bargain || !customer || !item || !bargain.customerOffer) {
      return { success: false, message: '没有可接受的报价' }
    }
    
    return acceptMarketBargainResult(bargain.customerOffer, item, customer)
  }

  const acceptMarketBargainResult = (
    finalPrice: number,
    item: MarketInventoryItem,
    customer: MarketCustomer
  ): { success: boolean; message: string; accepted: boolean; finalPrice: number } => {
    const profit = finalPrice - item.actualCostPrice
    const satisfaction = 60 + (profit / Math.max(1, item.actualCostPrice)) * 50
    
    item.soldQuantity++
    budget.value += Math.floor(finalPrice * customer.tipMultiplier)
    marketTour.value.currentMarketDayRevenue += Math.floor(finalPrice * customer.tipMultiplier)
    marketTour.value.currentMarketDaySalesCount++
    marketTour.value.currentMarketDaySatisfactionSum += satisfaction
    marketTour.value.currentMarketDayCustomersServed++
    
    customer.satisfaction = Math.min(100, satisfaction)
    
    marketTour.value.marketSales.push({
      id: `ms-${Date.now()}-${Math.random()}`,
      recordId: item.record.id,
      recordTitle: item.record.title,
      salePrice: Math.floor(finalPrice * customer.tipMultiplier),
      costPrice: item.actualCostPrice,
      profit,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      satisfaction,
      wasBargained: true,
      wave: marketTour.value.customerFlow.currentWave,
      timestamp: Date.now()
    })
    
    currentMarketBargain.value = null
    
    return {
      success: true,
      message: `议价成交！《${item.record.title}》¥${finalPrice}，利润¥${profit}`,
      accepted: true,
      finalPrice
    }
  }

  const rejectMarketBargain = () => {
    currentMarketBargain.value = null
    const customer = getCurrentMarketCustomer()
    if (customer) {
      customer.patience -= 25
      customer.satisfaction = Math.max(0, customer.satisfaction - 20)
    }
  }

  const cancelMarketBargain = () => {
    currentMarketBargain.value = null
  }

  const advanceMarketCustomer = (): { hasMore: boolean; message: string } => {
    currentMarketCustomerIndex.value++
    if (currentMarketCustomerIndex.value >= marketCustomers.value.length) {
      return { hasMore: false, message: '今日顾客已全部接待完毕' }
    }
    const next = getCurrentMarketCustomer()
    return { hasMore: true, message: `下一位：${next?.name || '顾客'}` }
  }

  const triggerMarketEvent = (): boolean => {
    const city = currentMarketCity.value
    if (!city) return false
    
    const event = getRandomMarketEvent(city.tier)
    if (!event) return false
    
    marketTour.value.activeEvent = {
      config: event,
      selectedChoice: null,
      triggeredAt: Date.now(),
      resolved: false,
      activeEffects: {
        customerCountModifier: 0,
        budgetModifier: 0,
        buyChanceModifier: 0,
        priceModifier: 0,
        reputationChange: 0,
        budgetChange: 0,
        duration: 1
      }
    }
    
    marketTour.value.phase = 'event'
    return true
  }

  const resolveMarketEvent = (
    choiceId: string
  ): { success: boolean; message: string; effects?: string[] } => {
    const activeEvent = marketTour.value.activeEvent
    if (!activeEvent) return { success: false, message: '没有进行中的事件' }
    
    const choice = activeEvent.config.choices.find(c => c.id === choiceId)
    if (!choice) return { success: false, message: '选项不存在' }
    
    if (choice.cost && choice.cost > 0) {
      if (budget.value < choice.cost) {
        return { success: false, message: `资金不足！需要¥${choice.cost}` }
      }
      budget.value -= choice.cost
      marketTour.value.currentMarketDayCost += choice.cost
    }
    
    activeEvent.selectedChoice = choice
    activeEvent.resolved = true
    activeEvent.activeEffects = choice.effects
    
    marketTour.value.activeEventEffects.push({
      effects: choice.effects,
      remainingDays: choice.effects.duration,
      triggeredAtDay: marketTour.value.daysAtMarket,
      eventName: activeEvent.config.name,
      choiceLabel: choice.label
    })
    
    adjustMarketCustomerFlow()
    regenerateTodayMarketCustomers()
    
    if (choice.effects.budgetChange !== 0) {
      budget.value += choice.effects.budgetChange
      if (choice.effects.budgetChange > 0) {
        marketTour.value.currentMarketDayRevenue += choice.effects.budgetChange
      } else {
        marketTour.value.currentMarketDayCost += Math.abs(choice.effects.budgetChange)
      }
    }
    
    if (choice.effects.reputationChange !== 0) {
      shopReputation.value = Math.max(0, Math.min(100, shopReputation.value + choice.effects.reputationChange))
      marketTour.value.reputationFromMarkets += choice.effects.reputationChange
    }
    
    const effectDescs: string[] = []
    const eff = choice.effects
    if (eff.customerCountModifier !== 0) effectDescs.push(`客流${eff.customerCountModifier > 0 ? '+' : ''}${Math.round(eff.customerCountModifier * 100)}%`)
    if (eff.budgetModifier !== 0) effectDescs.push(`顾客预算${eff.budgetModifier > 0 ? '+' : ''}${Math.round(eff.budgetModifier * 100)}%`)
    if (eff.buyChanceModifier !== 0) effectDescs.push(`购买意愿${eff.buyChanceModifier > 0 ? '+' : ''}${Math.round(eff.buyChanceModifier * 100)}%`)
    if (eff.priceModifier !== 0) effectDescs.push(`售价影响${eff.priceModifier > 0 ? '+' : ''}${Math.round(eff.priceModifier * 100)}%`)
    if (eff.reputationChange !== 0) effectDescs.push(`声望${eff.reputationChange > 0 ? '+' : ''}${eff.reputationChange}`)
    if (eff.budgetChange !== 0) effectDescs.push(`资金${eff.budgetChange > 0 ? '+' : ''}¥${eff.budgetChange}`)
    
    marketTour.value.eventHistory.push({ ...activeEvent })
    
    marketTour.value.phase = 'selling'
    
    return {
      success: true,
      message: `已选择：${choice.label}`,
      effects: effectDescs
    }
  }

  const settleMarketTour = (): { success: boolean; message: string; settlement?: MarketSettlement } => {
    const city = currentMarketCity.value
    if (!city) return { success: false, message: '城市信息错误' }
    
    if (marketTour.value.phase === 'selling' || marketTour.value.currentMarketDayRevenue > 0 || marketTour.value.currentMarketDayCost > 0 || marketTour.value.currentMarketDaySalesCount > 0) {
      marketTour.value.dailyMarketRevenue.push(marketTour.value.currentMarketDayRevenue)
      marketTour.value.dailyMarketCost.push(marketTour.value.currentMarketDayCost)
      marketTour.value.dailyMarketSalesCount.push(marketTour.value.currentMarketDaySalesCount)
      resetMarketDayStats()
    }
    
    const stats = getMarketSalesStats()
    const totalRevenue = marketTour.value.dailyMarketRevenue.reduce((a, b) => a + b, 0)
    const totalCost = marketTour.value.dailyMarketCost.reduce((a, b) => a + b, 0) + stats.totalCost
    const totalProfit = totalRevenue - totalCost
    
    const unsoldItems = marketTour.value.temporaryInventory
      .filter(i => i.quantity - i.soldQuantity > 0)
      .map(i => ({
        recordId: i.record.id,
        title: i.record.title,
        quantity: i.quantity - i.soldQuantity
      }))
    
    const repGain = city.reputationReward + (stats.avgSatisfaction >= 70 ? 3 : 0)
    
    const bonuses: string[] = []
    if (stats.salesCount >= 15) bonuses.push('销售之星（15+单）')
    if (stats.avgSatisfaction >= 80) bonuses.push('好评如潮')
    if (totalProfit >= city.rentCost * 5) bonuses.push('高额利润')
    if (unsoldItems.length === 0) bonuses.push('售罄完美！')
    
    const settlement: MarketSettlement = {
      cityId: city.id,
      cityName: city.name,
      startDay: currentDay.value,
      endDay: currentDay.value + marketTour.value.daysAtMarket + city.travelDays * 2,
      totalDays: marketTour.value.daysAtMarket,
      totalRevenue,
      totalCost,
      totalProfit,
      salesCount: stats.salesCount,
      avgSatisfaction: stats.avgSatisfaction,
      peakSalesWave: stats.peakSalesWave,
      eventsEncountered: marketTour.value.eventHistory.length,
      travelCost: city.travelCost,
      rentCost: city.rentCost * marketTour.value.daysAtMarket,
      otherCosts: totalCost - city.travelCost - city.rentCost * marketTour.value.daysAtMarket,
      reputationGained: repGain,
      unsoldItems,
      bonusRewards: bonuses
    }
    
    shopReputation.value = Math.min(100, shopReputation.value + repGain)
    marketTour.value.reputationFromMarkets += repGain
    marketTour.value.totalMarketProfit += totalProfit
    marketTour.value.totalMarketSales += stats.salesCount
    
    for (const item of marketTour.value.temporaryInventory) {
      const remaining = item.quantity - item.soldQuantity
      if (remaining <= 0) continue
      
      const existing = inventory.value.find(i => i.record.id === item.record.id)
      if (existing) {
        const totalQtyBefore = existing.quantity
        const totalScoreBefore = existing.conditionScore * totalQtyBefore
        const totalCostBefore = existing.actualCostPrice * totalQtyBefore
        existing.quantity += remaining
        existing.conditionScore = Math.round((totalScoreBefore + item.conditionScore * remaining) / existing.quantity)
        existing.actualCostPrice = Math.round((totalCostBefore + item.actualCostPrice * remaining) / existing.quantity)
      } else {
        inventory.value.push({
          record: item.record,
          quantity: remaining,
          purchaseDate: item.sourceInventoryId ? currentDay.value : item.record.id ? currentDay.value : currentDay.value,
          conditionScore: item.conditionScore,
          actualCostPrice: item.actualCostPrice
        })
      }
    }
    
    marketTour.value.pendingSettlement = settlement
    marketTour.value.settlementHistory.push(settlement)
    marketTour.value.phase = 'return'
    
    return {
      success: true,
      message: `${city.name}市集结算完成！利润¥${totalProfit}`,
      settlement
    }
  }

  const returnFromMarket = (): { success: boolean; message: string } => {
    const city = currentMarketCity.value
    if (!city) return { success: false, message: '城市信息错误' }
    
    currentDay.value = Math.min(
      currentDay.value + city.travelDays + marketTour.value.daysAtMarket,
      (baseLevelConfig.value?.days || currentDay.value)
    )
    
    marketTour.value.isActive = false
    marketTour.value.phase = 'planning'
    marketTour.value.currentCityId = null
    marketTour.value.pendingSettlement = null
    marketTour.value.activeEvent = null
    marketTour.value.activeEventEffects = []
    marketTour.value.temporaryInventory = []
    marketCustomers.value = []
    currentMarketCustomerIndex.value = 0
    
    return {
      success: true,
      message: `已返回本店，可继续正常经营`
    }
  }

  const buyRepairMaterial = (type: RepairMaterialType, quantity: number = 1): { success: boolean; message: string } => {
    const mat = getRepairMaterial(type)
    const totalCost = mat.unitCost * quantity
    if (budget.value < totalCost) {
      return { success: false, message: '预算不足' }
    }
    budget.value -= totalCost
    const inv = repairWorkshop.value.materials.find(m => m.type === type)
    if (inv) {
      inv.quantity += quantity
    }
    return { success: true, message: `成功购买 ${quantity} 个${mat.name}，花费 ¥${totalCost}` }
  }

  const startRepairTask = (
    inventoryItem: InventoryItem,
    targetCondition: number,
    quality: RepairQuality,
    customMaterials?: RepairMaterialType[]
  ): { success: boolean; message: string; taskId?: string } => {
    if (!canStartNewRepair.value) {
      return { success: false, message: '修复工坊已满，请等待现有任务完成' }
    }
    if (!repairWorkshop.value.unlockedQualities.includes(quality)) {
      return { success: false, message: '该修复品质尚未解锁' }
    }

    const materials = customMaterials || getRecommendedMaterials(inventoryItem.conditionScore, targetCondition)
    if (!canAffordMaterials(repairWorkshop.value.materials, materials)) {
      return { success: false, message: '修复耗材不足，请先购买' }
    }

    const materialCost = calculateMaterialCost(materials)
    const laborCost = calculateRepairLaborCost(
      inventoryItem.conditionScore,
      targetCondition,
      inventoryItem.record.rarity,
      quality
    )
    const totalCost = materialCost + laborCost

    if (budget.value < totalCost) {
      return { success: false, message: `预算不足，需要 ¥${totalCost}` }
    }

    budget.value -= totalCost
    for (const matType of materials) {
      const inv = repairWorkshop.value.materials.find(m => m.type === matType)
      if (inv) inv.quantity -= 1
    }

    const task: RepairTask = {
      id: generateRepairTaskId(),
      inventoryId: inventory.value.indexOf(inventoryItem).toString(),
      record: inventoryItem.record,
      initialConditionScore: inventoryItem.conditionScore,
      targetConditionScore: targetCondition,
      materials,
      quality,
      status: 'in_progress',
      totalCost,
      materialCost,
      laborCost,
      startTime: Date.now(),
      endTime: null,
      durationMinutes: calculateRepairDuration(quality, materials.length),
      progress: 0,
      finalConditionScore: null,
      finalMarketPrice: null,
      collectionValueChange: null,
      priceIncrease: null,
      rarityUpgraded: false,
      notes: ''
    }

    repairWorkshop.value.activeTasks.push(task)

    setTimeout(() => {
      completeRepairTask(task.id)
    }, 2000)

    return { success: true, message: `开始修复「${inventoryItem.record.title}」`, taskId: task.id }
  }

  const completeRepairTask = (taskId: string) => {
    const taskIndex = repairWorkshop.value.activeTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = repairWorkshop.value.activeTasks[taskIndex]
    const result = simulateRepairResult(
      task.initialConditionScore,
      task.targetConditionScore,
      task.materials,
      task.quality,
      task.record.marketPrice,
      task.record.rarity
    )

    task.status = result.success ? 'completed' : 'failed'
    task.progress = 100
    task.endTime = Date.now()
    task.finalConditionScore = result.finalCondition
    task.finalMarketPrice = result.finalMarketPrice
    task.collectionValueChange = result.collectionValueChange
    task.priceIncrease = result.priceIncrease
    task.rarityUpgraded = result.rarityUpgraded
    task.notes = result.notes

    const invItem = inventory.value[parseInt(task.inventoryId)]
    if (invItem && result.success) {
      invItem.conditionScore = result.finalCondition
      invItem.record.marketPrice = result.finalMarketPrice
      if (result.rarityUpgraded && invItem.record.rarity < 5) {
        invItem.record.rarity = (invItem.record.rarity + 1) as 1 | 2 | 3 | 4 | 5
      }
    } else if (invItem && !result.success) {
      invItem.conditionScore = result.finalCondition
      invItem.record.marketPrice = result.finalMarketPrice
    }

    repairWorkshop.value.activeTasks.splice(taskIndex, 1)
    repairWorkshop.value.completedTasks.push(task)

    const historyEntry: RepairHistoryEntry = {
      id: task.id,
      recordId: task.record.id,
      recordTitle: task.record.title,
      day: currentDay.value,
      initialCondition: task.initialConditionScore,
      finalCondition: result.finalCondition,
      priceIncrease: result.priceIncrease,
      rarityUpgraded: result.rarityUpgraded,
      totalCost: task.totalCost,
      quality: task.quality,
      materialsUsed: task.materials,
      success: result.success
    }
    repairWorkshop.value.history.push(historyEntry)

    const stats = repairWorkshop.value.stats
    if (result.success) {
      stats.totalRepairsCompleted += 1
      stats.totalPriceIncrease += result.priceIncrease
      stats.totalCollectionValueGain += result.collectionValueChange
      if (result.rarityUpgraded) stats.rarityUpgrades += 1
    } else {
      stats.totalRepairsFailed += 1
    }
    stats.totalMaterialCost += task.materialCost
    stats.totalLaborCost += task.laborCost
    const total = stats.totalRepairsCompleted + stats.totalRepairsFailed
    stats.successRate = total > 0 ? Math.round((stats.totalRepairsCompleted / total) * 100) : 0

    const collectionItem = collection.value.find(c => c.record.id === task.record.id)
    if (collectionItem) {
      collectionItem.conditionScore = result.finalCondition
      collectionItem.collectionValue += result.collectionValueChange
      if (result.rarityUpgraded && collectionItem.record.rarity < 5) {
        collectionItem.record.rarity = (collectionItem.record.rarity + 1) as 1 | 2 | 3 | 4 | 5
      }
    }
  }

  const getRepairTaskEstimate = (
    inventoryItem: InventoryItem,
    targetCondition: number,
    quality: RepairQuality
  ) => {
    const materials = getRecommendedMaterials(inventoryItem.conditionScore, targetCondition)
    const materialCost = calculateMaterialCost(materials)
    const laborCost = calculateRepairLaborCost(
      inventoryItem.conditionScore,
      targetCondition,
      inventoryItem.record.rarity,
      quality
    )
    const totalCost = materialCost + laborCost
    const conditionBoost = calculateTotalConditionBoost(materials, quality)
    const estimatedFinalCondition = Math.min(100, inventoryItem.conditionScore + Math.floor(conditionBoost * 0.9))
    const profitEstimate = getRepairProfitEstimate(
      inventoryItem.conditionScore,
      estimatedFinalCondition,
      inventoryItem.record.marketPrice,
      totalCost
    )
    const qualityConfig = getRepairQualityConfig(quality)
    const rarityUpChance = calculateRarityUpChance(materials, quality)
    const priceBoostPercent = calculateTotalPriceBoost(materials, quality)

    return {
      materials,
      materialCost,
      laborCost,
      totalCost,
      estimatedFinalCondition,
      estimatedPrice: profitEstimate.estimatedPrice,
      estimatedProfit: profitEstimate.estimatedProfit,
      roi: profitEstimate.roi,
      successRate: Math.round(qualityConfig.successRate * 100),
      rarityUpChance: Math.round(rarityUpChance * 100),
      priceBoostPercent: Math.round(priceBoostPercent * 100),
      duration: calculateRepairDuration(quality, materials.length)
    }
  }

  const unlockMasterQuality = (): { success: boolean; message: string } => {
    if (repairWorkshop.value.unlockedQualities.includes('master')) {
      return { success: false, message: '大师修复已解锁' }
    }
    const cost = 2000
    if (budget.value < cost) {
      return { success: false, message: `预算不足，需要 ¥${cost}` }
    }
    if (repairWorkshop.value.stats.totalRepairsCompleted < 10) {
      return { success: false, message: '需要完成至少10次修复才能解锁' }
    }
    budget.value -= cost
    repairWorkshop.value.unlockedQualities.push('master')
    return { success: true, message: '成功解锁大师修复！' }
  }

  const expandRepairCapacity = (): { success: boolean; message: string } => {
    const cost = repairWorkshop.value.maxActiveTasks * 1500
    if (budget.value < cost) {
      return { success: false, message: `预算不足，需要 ¥${cost}` }
    }
    if (repairWorkshop.value.maxActiveTasks >= 6) {
      return { success: false, message: '修复工坊已达最大容量' }
    }
    budget.value -= cost
    repairWorkshop.value.maxActiveTasks += 1
    return { success: true, message: `修复容量已提升至 ${repairWorkshop.value.maxActiveTasks} 个任务` }
  }

  const showEncyclopediaNotification = (
    type: 'series' | 'achievement' | 'milestone',
    name: string,
    message: string
  ) => {
    encyclopediaNotification.value = {
      show: true,
      type,
      name,
      message
    }
    setTimeout(() => {
      encyclopediaNotification.value = null
    }, 3000)
  }

  const claimEncyclopediaSeriesReward = (seriesId: string): EncyclopediaRewardClaimResult => {
    const result = claimSeriesReward(encyclopedia.value, seriesId)
    if (result.success) {
      for (const bonus of result.rewards) {
        applyEncyclopediaBonus(bonus)
      }
      showEncyclopediaNotification('series', result.message, '奖励已发放')
    }
    return result
  }

  const claimEncyclopediaAchievementReward = (achievementId: string): EncyclopediaRewardClaimResult => {
    const result = claimAchievementReward(encyclopedia.value, achievementId)
    if (result.success) {
      for (const bonus of result.rewards) {
        applyEncyclopediaBonus(bonus)
      }
      showEncyclopediaNotification('achievement', result.message, '奖励已发放')
    }
    return result
  }

  const claimEncyclopediaMilestoneReward = (milestoneId: string): EncyclopediaRewardClaimResult => {
    const result = claimMilestoneReward(encyclopedia.value, milestoneId)
    if (result.success) {
      for (const bonus of result.rewards) {
        applyEncyclopediaBonus(bonus)
      }
      showEncyclopediaNotification('milestone', result.message, '奖励已发放')
    }
    return result
  }

  const applyEncyclopediaBonus = (bonus: AlbumBonus) => {
    switch (bonus.type) {
      case 'reputation':
        shopReputation.value = Math.min(100, shopReputation.value + bonus.value)
        break
    }
    rebuildEncyclopediaBonuses()
  }

  const getEncyclopediaSeriesProgress = (series: EncyclopediaSeries): number => {
    return getSeriesProgress(series, collection.value)
  }

  const getFilteredEncyclopediaEntries = (
    filters: EncyclopediaFilterOptions
  ): EncyclopediaEntry[] => {
    let entries = [...encyclopedia.value.entries]

    if (filters.category !== 'all') {
      const category = encyclopedia.value.categories.find(c => c.id === filters.category)
      if (category) {
        const seriesRecordIds = new Set(
          category.series.flatMap(s => s.requiredRecordIds)
        )
        entries = entries.filter(e => seriesRecordIds.has(e.record.id))
      }
    }

    if (filters.rarity !== 'all') {
      const config = rarityConfigs.find(r => r.tier === filters.rarity)
      if (config) {
        entries = entries.filter(e => 
          e.record.rarity >= config.minRarity && e.record.rarity <= config.maxRarity
        )
      }
    }

    if (filters.collected === 'collected') {
      entries = entries.filter(e => e.isCollected)
    } else if (filters.collected === 'uncollected') {
      entries = entries.filter(e => !e.isCollected)
    }

    switch (filters.sortBy) {
      case 'rarity':
        entries.sort((a, b) => b.record.rarity - a.record.rarity)
        break
      case 'name':
        entries.sort((a, b) => a.record.title.localeCompare(b.record.title))
        break
      case 'date':
        entries.sort((a, b) => {
          if (!a.firstCollectedDate) return 1
          if (!b.firstCollectedDate) return -1
          return b.firstCollectedDate - a.firstCollectedDate
        })
        break
      case 'value':
        entries.sort((a, b) => b.record.marketPrice - a.record.marketPrice)
        break
    }

    return entries
  }

  const getClaimableRewardsCount = computed(() => {
    let count = 0
    for (const category of encyclopedia.value.categories) {
      for (const series of category.series) {
        if (series.isCompleted && !series.rewardClaimed) count++
      }
    }
    for (const ach of encyclopedia.value.achievements) {
      if (ach.isUnlocked && !ach.rewardClaimed) count++
    }
    for (const mile of encyclopedia.value.milestones) {
      if (mile.isCompleted && !mile.isClaimed) count++
    }
    return count
  })

  const clearNewEncyclopediaNotifications = () => {
    encyclopedia.value.newlyUnlockedSeries = []
    encyclopedia.value.newlyUnlockedAchievements = []
    encyclopedia.value.newlyClaimableRewards = []
  }

  const festivalThemeConfig = computed(() => {
    if (!festival.value.activeFestival) return null
    return getFestivalThemeConfig(festival.value.activeFestival)
  })

  const festivalScore = computed(() => calculateFestivalScore(festival.value))

  const festivalRewardTier = computed(() => getRewardTier(festivalScore.value))

  const festivalActiveTasks = computed(() => festival.value.tasks.filter(t => t.status === 'active'))

  const festivalCompletedTasks = computed(() => festival.value.tasks.filter(t => t.status === 'completed'))

  const festivalClaimableTasks = computed(() => festival.value.tasks.filter(t => t.status === 'completed'))

  const festivalUnlockedCustomers = computed(() => {
    if (!festival.value.activeFestival) return []
    return festival.value.customers.filter(c => c.isUnlocked)
  })

  const startFestival = (theme: FestivalTheme): { success: boolean; message: string } => {
    if (festival.value.isFestivalActive) {
      return { success: false, message: '已有节日活动进行中' }
    }

    const themeConfig = getFestivalThemeConfig(theme)
    const availableIds = allRecords.map(r => r.id)
    const simplifiedRecords = allRecords.map(r => ({
      id: r.id,
      genre: r.genre as Genre,
      marketPrice: r.marketPrice,
      rarity: r.rarity
    }))

    const menu = generateFestivalMenu(theme, availableIds, simplifiedRecords, currentDay.value)
    const tasks = generateFestivalTasks(theme, currentLevel.value)
    const customers = getFestivalCustomersForTheme(theme).map(c => ({
      ...c,
      isUnlocked: shopReputation.value >= c.requiredReputation,
      unlockDay: c.unlockDay
    }))

    festival.value = {
      activeFestival: theme,
      festivalDay: 1,
      maxFestivalDays: 5,
      menus: [menu],
      customers,
      encounteredCustomers: [],
      tasks,
      settlements: [],
      atmosphereOverride: getFestivalAtmosphereOverride(theme),
      totalFestivalScore: 0,
      menuItemsSold: 0,
      customersServed: 0,
      tasksCompleted: 0,
      isFestivalActive: true,
      hasUnclaimedRewards: false
    }

    return { success: true, message: `${themeConfig.icon}${themeConfig.name}活动开始！` }
  }

  const checkFestivalTrigger = (): { triggered: boolean; theme: FestivalTheme | null; message: string } => {
    if (festival.value.isFestivalActive) {
      return { triggered: false, theme: null, message: '' }
    }

    const result = shouldFestivalAppear(currentDay.value, currentLevel.value, shopReputation.value)
    if (!result.shouldAppear) {
      return { triggered: false, theme: null, message: '' }
    }

    return {
      triggered: true,
      theme: result.theme,
      message: `🎉 节日活动即将开启！${getFestivalThemeConfig(result.theme).icon}${getFestivalThemeConfig(result.theme).name}来啦！`
    }
  }

  const advanceFestivalDay = () => {
    if (!festival.value.isFestivalActive) return

    festival.value.festivalDay++

    for (const task of festival.value.tasks) {
      if (task.status === 'locked') {
        const dayMet = festival.value.festivalDay >= task.requiredDay
        const depsMet = task.requiredTaskIds.every(id => {
          const dep = festival.value.tasks.find(t => t.id === id)
          return dep && (dep.status === 'completed' || dep.status === 'claimed')
        })
        if (dayMet && depsMet) {
          task.status = 'active'
        }
      }
    }

    for (const customer of festival.value.customers) {
      if (!customer.isUnlocked && shopReputation.value >= customer.requiredReputation) {
        customer.isUnlocked = true
        customer.unlockDay = currentDay.value
      }
    }

    if (festival.value.festivalDay > festival.value.maxFestivalDays) {
      endFestival()
    }
  }

  const endFestival = () => {
    if (!festival.value.isFestivalActive) return

    const score = calculateFestivalScore(festival.value)
    const tier = getRewardTier(score)
    const theme = festival.value.activeFestival!

    const settlement: FestivalSettlement = {
      festivalTheme: theme,
      totalScore: score,
      rewardTier: tier,
      tasksCompleted: festival.value.tasksCompleted,
      totalTasks: festival.value.tasks.length,
      customersServed: festival.value.customersServed,
      menuItemsSold: festival.value.menuItemsSold,
      bonusRewards: tier.rewards.bonusItems,
      settledDay: currentDay.value
    }

    festival.value.settlements.push(settlement)
    festival.value.isFestivalActive = false
    festival.value.atmosphereOverride = null
    festival.value.hasUnclaimedRewards = true
    festival.value.totalFestivalScore = score
  }

  const claimFestivalReward = (): { success: boolean; message: string; rewards: FestivalSettlement | null } => {
    if (festival.value.settlements.length === 0) {
      return { success: false, message: '没有可领取的奖励', rewards: null }
    }

    const lastSettlement = festival.value.settlements[festival.value.settlements.length - 1]
    if (!lastSettlement) {
      return { success: false, message: '没有可领取的奖励', rewards: null }
    }

    budget.value += lastSettlement.rewardTier.rewards.budget
    shopReputation.value = Math.min(100, shopReputation.value + lastSettlement.rewardTier.rewards.reputation)

    festival.value.hasUnclaimedRewards = false

    return {
      success: true,
      message: `领取${lastSettlement.rewardTier.tierName}奖励！资金 +¥${lastSettlement.rewardTier.rewards.budget}，声望 +${lastSettlement.rewardTier.rewards.reputation}`,
      rewards: lastSettlement
    }
  }

  const claimFestivalTaskReward = (taskId: string): { success: boolean; message: string } => {
    const task = festival.value.tasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.status !== 'completed') return { success: false, message: '任务未完成' }

    budget.value += task.reward.budget
    shopReputation.value = Math.min(100, shopReputation.value + task.reward.reputation)
    task.status = 'claimed'

    return { success: true, message: `领取任务奖励！资金 +¥${task.reward.budget}，声望 +${task.reward.reputation}` }
  }

  const purchaseFestivalMenuItem = (menuId: string, recordId: string): { success: boolean; message: string } => {
    const menu = festival.value.menus.find(m => m.id === menuId)
    if (!menu) return { success: false, message: '专题货单不存在' }

    const item = menu.items.find(i => i.recordId === recordId)
    if (!item) return { success: false, message: '商品不存在' }
    if (item.status === 'sold_out') return { success: false, message: '已售罄' }
    if (item.stock <= 0) return { success: false, message: '库存不足' }
    if (budget.value < item.festivalPrice) return { success: false, message: '资金不足' }

    budget.value -= item.festivalPrice
    item.stock--
    if (item.stock <= 0) {
      item.status = 'sold_out'
    } else if (item.stock <= 1 && item.isExclusive) {
      item.status = 'limited'
    }

    menu.totalPurchased++
    festival.value.menuItemsSold++

    const record = getRecordById(recordId)
    if (record) {
      const invItem: InventoryItem = {
        record,
        quantity: 1,
        purchaseDate: currentDay.value,
        conditionScore: 80 + Math.floor(Math.random() * 20),
        actualCostPrice: item.festivalPrice
      }
      inventory.value.push(invItem)
    }

    updateFestivalTaskProgress('special', 1)

    return { success: true, message: `成功购买${item.isFeatured ? '热门' : ''}节日商品！` }
  }

  const updateFestivalTaskProgress = (
    type: FestivalTaskConfig['type'],
    amount: number,
    context?: {
      genre?: Genre
      absoluteValue?: boolean
      festivalTheme?: FestivalTheme | null
    }
  ) => {
    if (!festival.value.isFestivalActive) return

    const theme = context?.festivalTheme || festival.value.activeFestival
    const themeConfig = theme ? getFestivalThemeConfig(theme) : null

    for (const task of festival.value.tasks) {
      if (task.status !== 'active') continue
      if (task.type !== type) continue

      if (type === 'genre' && themeConfig && context?.genre) {
        if (!themeConfig.genreAffinity.includes(context.genre)) {
          continue
        }
      }

      if (type === 'atmosphere') {
        if (context?.absoluteValue) {
          task.current = Math.min(task.target, Math.max(task.current, amount))
        } else {
          task.current = Math.min(task.target, Math.max(task.current, amount))
        }
      } else if (type === 'collection') {
        task.current = Math.min(task.target, Math.max(task.current, amount))
      } else {
        task.current = Math.min(task.target, task.current + amount)
      }

      if (task.current >= task.target) {
        task.status = 'completed'
        festival.value.tasksCompleted++
        festival.value.hasUnclaimedRewards = true
      }
    }

    for (const task of festival.value.tasks) {
      if (task.status !== 'locked') continue
      const dayMet = festival.value.festivalDay >= task.requiredDay
      const depsMet = task.requiredTaskIds.every(id => {
        const dep = festival.value.tasks.find(t => t.id === id)
        return dep && (dep.status === 'completed' || dep.status === 'claimed')
      })
      if (dayMet && depsMet) {
        task.status = 'active'
      }
    }

    const specialTask = festival.value.tasks.find(
      t => t.type === 'special' && t.id.includes('_special_1') && t.status !== 'completed' && t.status !== 'claimed'
    )
    if (specialTask) {
      const allDepsComplete = specialTask.requiredTaskIds.every(id => {
        const dep = festival.value.tasks.find(t => t.id === id)
        return dep && (dep.status === 'completed' || dep.status === 'claimed')
      })
      if (allDepsComplete) {
        specialTask.current = 1
        if (specialTask.requiredDay > festival.value.festivalDay) {
          // not day requirement yet
        } else {
          specialTask.status = 'completed'
          festival.value.tasksCompleted++
          festival.value.hasUnclaimedRewards = true
        }
      }
    }
  }

  const recordFestivalCustomerEncounter = (customerId: string, satisfaction: number, purchasedRecordId: string | null) => {
    const config = festival.value.customers.find(c => c.id === customerId)
    if (!config) return

    const existing = festival.value.encounteredCustomers.find(e => e.config.id === customerId)
    if (existing) {
      existing.satisfaction = Math.max(existing.satisfaction, satisfaction)
      if (purchasedRecordId) {
        existing.purchasedRecordIds.push(purchasedRecordId)
      }
    } else {
      festival.value.encounteredCustomers.push({
        config,
        day: currentDay.value,
        satisfaction,
        purchasedRecordIds: purchasedRecordId ? [purchasedRecordId] : [],
        giftGiven: false
      })
      festival.value.customersServed++
    }

    updateFestivalTaskProgress('customer', 1)
  }

  const getFestivalBonuses = () => {
    if (!festival.value.isFestivalActive || !festival.value.activeFestival) {
      return { budgetBonus: 0, buyChanceBonus: 0, reputationBonus: 0, satisfactionBonus: 0 }
    }
    const config = getFestivalThemeConfig(festival.value.activeFestival)
    return {
      budgetBonus: config.customerBudgetBonus,
      buyChanceBonus: config.buyChanceBonus,
      reputationBonus: config.reputationBonus,
      satisfactionBonus: config.satisfactionBonus
    }
  }

  const switchFestivalAtmosphere = (theme: FestivalTheme | null) => {
    if (theme === null) {
      festival.value.atmosphereOverride = null
      return
    }
    if (!festival.value.isFestivalActive) return
    festival.value.atmosphereOverride = getFestivalAtmosphereOverride(theme)
  }

  const activeCollabTheme = computed(() => musicFestivalCollab.value.activeTheme)

  const collabScore = computed(() => calculateCollabScore(
    musicFestivalCollab.value.limitedRecordsSold,
    musicFestivalCollab.value.collabCustomersServed,
    musicFestivalCollab.value.tasksCompleted,
    musicFestivalCollab.value.tasks.length
  ))

  const collabRewardTier = computed(() => getRewardTierByScore(collabScore.value))

  const collabActiveTasks = computed(() => musicFestivalCollab.value.tasks.filter(t => t.status === 'active'))

  const collabCompletedTasks = computed(() => musicFestivalCollab.value.tasks.filter(t => t.status === 'completed'))

  const collabClaimableTasks = computed(() => musicFestivalCollab.value.tasks.filter(t => t.status === 'completed'))

  const collabUnlockedCustomers = computed(() => {
    if (!musicFestivalCollab.value.activeTheme) return []
    return musicFestivalCollab.value.collabCustomers.filter(c => 
      c.isUnlocked && c.collabThemeId === musicFestivalCollab.value.activeTheme!.id
    )
  })

  const collabLimitedRecords = computed(() => {
    if (!musicFestivalCollab.value.activeTheme) return []
    return musicFestivalCollab.value.limitedRecords.filter(r => 
      r.collabThemeId === musicFestivalCollab.value.activeTheme!.id
    )
  })

  const collabUnlockedBadges = computed(() => musicFestivalCollab.value.badges.filter(b => b.isUnlocked))

  const collabAvailableThemes = computed(() => musicFestivalCollab.value.themes.filter(t => {
    const levelOk = currentLevel.value >= t.requiredLevel
    const repOk = shopReputation.value >= t.requiredReputation
    return levelOk && repOk
  }))

  const canRefreshCollabCustomers = computed(() => canRefreshCustomers(
    musicFestivalCollab.value.lastRefreshDay,
    currentDay.value,
    musicFestivalCollab.value.customerRefreshCooldown
  ))

  const collabCustomerRefreshCost = computed(() => getCustomerRefreshCost(musicFestivalCollab.value.collabDay))

  const startMusicFestivalCollab = (themeId: string): MusicFestivalCollabStartResult => {
    if (musicFestivalCollab.value.isCollabActive) {
      return { success: false, message: '已有音乐节联名活动进行中' }
    }

    const theme = musicFestivalCollab.value.themes.find(t => t.id === themeId)
    if (!theme) {
      return { success: false, message: '主题不存在' }
    }

    if (currentLevel.value < theme.requiredLevel) {
      return { success: false, message: `需要达到第${theme.requiredLevel}关才能开启` }
    }

    if (shopReputation.value < theme.requiredReputation) {
      return { success: false, message: `需要声望达到${theme.requiredReputation}才能开启` }
    }

    const startCost = 500
    if (budget.value < startCost) {
      return { success: false, message: `资金不足！需要¥${startCost}作为活动启动资金` }
    }

    budget.value -= startCost

    const tasks = generateCollabTasks(themeId)
    
    musicFestivalCollab.value.activeTheme = theme
    musicFestivalCollab.value.collabDay = 1
    musicFestivalCollab.value.isCollabActive = true
    musicFestivalCollab.value.tasks = tasks
    musicFestivalCollab.value.totalCollabScore = 0
    musicFestivalCollab.value.limitedRecordsSold = 0
    musicFestivalCollab.value.collabCustomersServed = 0
    musicFestivalCollab.value.tasksCompleted = 0
    musicFestivalCollab.value.hasUnclaimedRewards = false
    musicFestivalCollab.value.lastRefreshDay = -2
    musicFestivalCollab.value.activeCollabCustomerIds = []

    for (const t of musicFestivalCollab.value.themes) {
      t.isActive = t.id === themeId
    }

    for (const c of musicFestivalCollab.value.collabCustomers) {
      if (c.collabThemeId === themeId) {
        c.encounterCount = 0
        c.isUnlocked = shopReputation.value >= c.requiredReputation
      }
    }

    for (const r of musicFestivalCollab.value.limitedRecords) {
      if (r.collabThemeId === themeId) {
        r.remainingStock = r.limitedStock
        r.soldCount = 0
      }
    }

    return { 
      success: true, 
      message: `${theme.icon}${theme.name}联名活动开始！`, 
      theme,
      cost: startCost
    }
  }

  const advanceMusicFestivalCollabDay = () => {
    if (!musicFestivalCollab.value.isCollabActive) return

    musicFestivalCollab.value.collabDay++

    for (const task of musicFestivalCollab.value.tasks) {
      if (task.status === 'locked') {
        const dayMet = musicFestivalCollab.value.collabDay >= task.requiredDay
        const depsMet = task.requiredTaskIds.every(id => {
          const dep = musicFestivalCollab.value.tasks.find(t => t.id === id)
          return dep && (dep.status === 'completed' || dep.status === 'claimed')
        })
        if (dayMet && depsMet) {
          task.status = 'active'
        }
      }
    }

    for (const customer of musicFestivalCollab.value.collabCustomers) {
      if (!customer.isUnlocked && shopReputation.value >= customer.requiredReputation) {
        customer.isUnlocked = true
      }
    }

    if (musicFestivalCollab.value.collabDay > musicFestivalCollab.value.maxCollabDays) {
      endMusicFestivalCollab()
    }
  }

  const endMusicFestivalCollab = () => {
    if (!musicFestivalCollab.value.isCollabActive) return

    const theme = musicFestivalCollab.value.activeTheme
    if (!theme) return

    const score = collabScore.value
    const tier = collabRewardTier.value

    const badgesCollected: string[] = []
    for (const badge of musicFestivalCollab.value.badges) {
      if (badge.collabThemeId === theme.id && badge.isUnlocked) {
        badgesCollected.push(badge.id)
      }
    }

    const settlement: MusicFestivalCollabSettlement = {
      collabThemeId: theme.id,
      totalScore: score,
      rewardTier: tier,
      tasksCompleted: musicFestivalCollab.value.tasksCompleted,
      totalTasks: musicFestivalCollab.value.tasks.length,
      customersServed: musicFestivalCollab.value.collabCustomersServed,
      limitedRecordsSold: musicFestivalCollab.value.limitedRecordsSold,
      bonusRewards: tier.rewards.bonusItems,
      settledDay: currentDay.value,
      badgesCollected
    }

    musicFestivalCollab.value.settlements.push(settlement)
    musicFestivalCollab.value.isCollabActive = false
    musicFestivalCollab.value.hasUnclaimedRewards = true
    musicFestivalCollab.value.totalCollabScore = score

    for (const t of musicFestivalCollab.value.themes) {
      t.isActive = false
    }
  }

  const claimMusicFestivalCollabReward = (): { success: boolean; message: string; settlement: MusicFestivalCollabSettlement | null } => {
    if (musicFestivalCollab.value.settlements.length === 0) {
      return { success: false, message: '没有可领取的奖励', settlement: null }
    }

    const lastSettlement = musicFestivalCollab.value.settlements[musicFestivalCollab.value.settlements.length - 1]
    if (!lastSettlement) {
      return { success: false, message: '没有可领取的奖励', settlement: null }
    }

    budget.value += lastSettlement.rewardTier.rewards.budget
    shopReputation.value = Math.min(100, shopReputation.value + lastSettlement.rewardTier.rewards.reputation)
    dailyGrowthPointsEarned.value += lastSettlement.rewardTier.rewards.growthPoints

    if (lastSettlement.rewardTier.rewards.collectionBadgeId) {
      const badge = musicFestivalCollab.value.badges.find(b => b.id === lastSettlement.rewardTier.rewards.collectionBadgeId)
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true
        badge.unlockedDate = Date.now()
      }
    }

    musicFestivalCollab.value.hasUnclaimedRewards = false

    return {
      success: true,
      message: `领取${lastSettlement.rewardTier.tierName}奖励！资金 +¥${lastSettlement.rewardTier.rewards.budget}，声望 +${lastSettlement.rewardTier.rewards.reputation}`,
      settlement: lastSettlement
    }
  }

  const claimCollabTaskReward = (taskId: string): { success: boolean; message: string } => {
    const task = musicFestivalCollab.value.tasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.status !== 'completed') return { success: false, message: '任务未完成' }

    budget.value += task.reward.budget
    shopReputation.value = Math.min(100, shopReputation.value + task.reward.reputation)
    dailyGrowthPointsEarned.value += task.reward.growthPoints
    task.status = 'claimed'

    if (task.reward.collectionBadgeId) {
      const badge = musicFestivalCollab.value.badges.find(b => b.id === task.reward.collectionBadgeId)
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true
        badge.unlockedDate = Date.now()
      }
    }

    return { success: true, message: `领取任务奖励！资金 +¥${task.reward.budget}，声望 +${task.reward.reputation}` }
  }

  const purchaseLimitedRecord = (recordId: string): MusicFestivalCollabPurchaseResult => {
    const record = musicFestivalCollab.value.limitedRecords.find(r => r.id === recordId)
    if (!record) return { success: false, message: '唱片不存在' }
    if (!record.isUnlocked) return { success: false, message: '该唱片尚未解锁' }
    if (record.remainingStock <= 0) return { success: false, message: '已售罄' }
    if (budget.value < record.collabPrice) return { success: false, message: `资金不足！需要¥${record.collabPrice}` }

    budget.value -= record.collabPrice
    record.remainingStock--
    record.soldCount++
    musicFestivalCollab.value.limitedRecordsSold++

    const invItem: InventoryItem = {
      record: record.record,
      quantity: 1,
      purchaseDate: currentDay.value,
      conditionScore: 85 + Math.floor(Math.random() * 15),
      actualCostPrice: record.collabPrice
    }
    inventory.value.push(invItem)

    updateCollabTaskProgress('sales', 1)
    if (record.rarity === 'rare' || record.rarity === 'epic' || record.rarity === 'legendary') {
      updateCollabTaskProgress('special', 1)
    }

    return { 
      success: true, 
      message: `成功购入《${record.record.title}》！`, 
      record,
      cost: record.collabPrice
    }
  }

  const generateCollabCustomer = (
    fc: MusicFestivalCollabCustomer,
    timeSlot: TimeSlot
  ): Customer => {
    const prefGenres = fc.favoriteGenres.length >= 3
      ? [...fc.favoriteGenres]
      : [...fc.favoriteGenres, 'Jazz', 'Rock', 'Soul'].slice(0, 3)

    const preference = {
      favoriteGenres: prefGenres as Genre[],
      priceRange: [
        Math.round(400 * fc.budgetMultiplier),
        Math.round(1500 * fc.budgetMultiplier)
      ] as [number, number],
      preferredRarity: fc.rarity === 'legendary' ? [4, 5] : fc.rarity === 'epic' ? [3, 4, 5] : [2, 3, 4],
      preferenceStrength: 0.75 + Math.random() * 0.2
    }

    const slotConfig = getTimeSlotConfig(timeSlot)
    const baseBudget = preference.priceRange[1] * (2.0 + Math.random() * 1.5)
    const budget = Math.floor(getBudgetWithReputation(baseBudget, shopReputation.value) * slotConfig.budgetModifier * fc.budgetMultiplier)
    const basePatience = 85 + Math.floor(Math.random() * 35)

    const identityTag = fc.rarity === 'legendary' ? 'collector' : fc.rarity === 'epic' ? 'connoisseur' : 'enthusiast'

    return {
      id: `cust-collab-${fc.id}-${Date.now()}`,
      name: fc.name,
      avatar: fc.avatar,
      preference,
      budget,
      patience: basePatience,
      maxPatience: basePatience,
      patienceDecayRate: defaultPatienceConfig.decayBaseRate * 0.75,
      arrivalOrder: 998,
      priorityScore: 95,
      satisfaction: 70 + fc.satisfactionBonus,
      memberProfile: null,
      isReturningCustomer: false,
      memberDiscount: 0,
      bargainAggressiveness: 0.05 + Math.random() * 0.15,
      bargainToughness: 0.1 + Math.random() * 0.2,
      willBargain: fc.rarity === 'legendary' ? Math.random() < 0.08 : Math.random() < 0.15,
      isImpatient: false,
      hasLeftAngrily: false,
      identityTag: identityTag as any,
      reservationId: null,
      reservedRecordIds: [],
      isFestivalCustomer: true,
      festivalCustomerId: fc.id,
      festivalCustomerRarity: fc.rarity as any
    }
  }

  const refreshCollabCustomers = (): MusicFestivalCollabRefreshCustomerResult => {
    if (!musicFestivalCollab.value.isCollabActive || !musicFestivalCollab.value.activeTheme) {
      return { success: false, message: '没有进行中的联名活动', newCustomers: [], collabCustomers: [], cost: 0 }
    }

    if (!canRefreshCollabCustomers.value) {
      return { success: false, message: `冷却中，请等待${musicFestivalCollab.value.customerRefreshCooldown - (currentDay.value - musicFestivalCollab.value.lastRefreshDay)}天`, newCustomers: [], collabCustomers: [], cost: 0 }
    }

    const cost = collabCustomerRefreshCost.value
    if (budget.value < cost) {
      return { success: false, message: `资金不足！需要¥${cost}`, newCustomers: [], collabCustomers: [], cost: 0 }
    }

    budget.value -= cost
    musicFestivalCollab.value.lastRefreshDay = currentDay.value

    const themeId = musicFestivalCollab.value.activeTheme.id
    const availableCustomers = musicFestivalCollab.value.collabCustomers.filter(c => 
      c.isUnlocked && c.collabThemeId === themeId
    )

    const newCustomers: Customer[] = []
    const selectedCollabCustomers: MusicFestivalCollabCustomer[] = []

    for (const fc of availableCustomers) {
      if (Math.random() < fc.appearanceChance * 1.5) {
        const customer = generateCollabCustomer(fc, currentTimeSlot.value)
        newCustomers.push(customer)
        selectedCollabCustomers.push(fc)
        fc.encounterCount++
      }
    }

    if (newCustomers.length > 0) {
      const existingIds = new Set(customers.value.map(c => c.id))
      for (const nc of newCustomers) {
        if (!existingIds.has(nc.id)) {
          customers.value.push(nc)
        }
      }
      customers.value = sortCustomerQueue(customers.value, {
        prioritizeImpatient: true,
        prioritizeMembers: true,
        prioritizeHighBudget: false,
        prioritizeSpecial: true
      })
      musicFestivalCollab.value.activeCollabCustomerIds = newCustomers.map(c => c.id)
    }

    return {
      success: true,
      message: newCustomers.length > 0 
        ? `成功刷新！出现了${newCustomers.length}位联名顾客` 
        : '刷新完成，但没有联名顾客出现，请再试一次',
      newCustomers,
      collabCustomers: selectedCollabCustomers,
      cost
    }
  }

  const updateCollabTaskProgress = (
    type: MusicFestivalCollabTaskType,
    amount: number,
    context?: {
      genre?: Genre
      rarity?: number
    }
  ) => {
    if (!musicFestivalCollab.value.isCollabActive) return

    const theme = musicFestivalCollab.value.activeTheme
    if (!theme) return

    for (const task of musicFestivalCollab.value.tasks) {
      if (task.status !== 'active') continue
      if (task.type !== type) continue

      if (type === 'genre' && task.genre && context?.genre) {
        if (task.genre !== context.genre) continue
      }

      if (type === 'special' && task.minRarity !== undefined && context?.rarity !== undefined) {
        if (context.rarity < task.minRarity) continue
      }

      if (type === 'collection') {
        task.current = Math.min(task.target, Math.max(task.current, amount))
      } else {
        task.current = Math.min(task.target, task.current + amount)
      }

      if (task.current >= task.target) {
        task.status = 'completed'
        musicFestivalCollab.value.tasksCompleted++
        musicFestivalCollab.value.hasUnclaimedRewards = true
      }
    }

    for (const task of musicFestivalCollab.value.tasks) {
      if (task.status !== 'locked') continue
      const dayMet = musicFestivalCollab.value.collabDay >= task.requiredDay
      const depsMet = task.requiredTaskIds.every(id => {
        const dep = musicFestivalCollab.value.tasks.find(t => t.id === id)
        return dep && (dep.status === 'completed' || dep.status === 'claimed')
      })
      if (dayMet && depsMet) {
        task.status = 'active'
      }
    }
  }

  const recordCollabCustomerEncounter = (customerId: string, _satisfaction: number, purchasedRecordId: string | null) => {
    const config = musicFestivalCollab.value.collabCustomers.find(c => c.id === customerId)
    if (!config) return

    const existing = musicFestivalCollab.value.collabCustomers.find(c => c.id === customerId)
    if (existing) {
      existing.encounterCount++
    }

    updateCollabTaskProgress('customer', 1)

    if (config.specialRewardId && purchasedRecordId) {
      const badge = musicFestivalCollab.value.badges.find(b => b.id === config.specialRewardId)
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true
        badge.unlockedDate = Date.now()
      }
    }

    musicFestivalCollab.value.collabCustomersServed++
  }

  const getCollabRarityLabel = getCollabRarityLabelData
  const getCollabRarityColor = getCollabRarityColorData
  const getCollabTaskTypeLabel = getTaskTypeLabel
  const getCollabTaskStatusLabel = getTaskStatusLabel
  const getCollabTaskStatusColor = getTaskStatusColor
  const getCollabThemeConfig = getThemeConfig

  const getUnclaimedAchievementRewardCount = computed(() => {
    return getUnclaimedRewardCount(achievements.value)
  })

  const getCurrentTitle = computed((): BusinessTitleConfig | null => {
    return getCurrentEquippedTitle(achievements.value)
  })

  const updateAchievementProgressAction = (type: AchievementProgressUpdateType, value: number) => {
    const result = updateAchievementProgress(achievements.value, type, value)
    achievements.value = result.state

    if (result.newlyUnlocked.length > 0) {
      const firstUnlocked = result.newlyUnlocked[0]
      const ach = achievements.value.achievements.find(a => a.id === firstUnlocked)
      if (ach) {
        showAchievementNotification('unlock', ach.name, ach.icon)
      }
    }
  }

  const showAchievementNotification = (type: 'unlock' | 'reward' | 'title', name: string, icon: string) => {
    achievementNotification.value = { show: true, type, name, icon }
    setTimeout(() => {
      achievementNotification.value = null
    }, 3000)
  }

  const claimAchievementRewardAction = (achievementId: string): { success: boolean; message: string } => {
    const result = claimAchievementRewardData(achievements.value, achievementId)
    
    if (!result.success) {
      return { success: false, message: '无法领取奖励' }
    }

    achievements.value = result.state

    if (result.reward.budget) {
      budget.value += result.reward.budget
    }
    if (result.reward.reputation) {
      shopReputation.value = Math.min(100, shopReputation.value + result.reward.reputation)
    }

    const ach = achievements.value.achievements.find(a => a.id === achievementId)
    if (ach) {
      showAchievementNotification('reward', ach.name, ach.icon)
    }

    return {
      success: true,
      message: `成功领取奖励！${result.reward.budget ? `资金 +¥${result.reward.budget}` : ''} ${result.reward.reputation ? `声望 +${result.reward.reputation}` : ''}`
    }
  }

  const equipTitleAction = (titleId: string): { success: boolean; message: string } => {
    const result = equipTitleData(achievements.value, titleId)
    
    if (!result.success) {
      return { success: false, message: '无法装备该称号' }
    }

    achievements.value = result.state
    const title = achievements.value.titles.find(t => t.id === titleId)
    if (title) {
      showAchievementNotification('title', title.name, title.icon)
    }

    return { success: true, message: `已装备称号：${title?.name || ''}` }
  }

  const clearAchievementNotifications = () => {
    achievements.value = clearNewAchievementNotifications(achievements.value)
  }

  const checkDailyAchievements = () => {
    updateAchievementProgressAction('total_sales', salesHistory.value.length)
    updateAchievementProgressAction('total_profit', totalProfit.value)
    updateAchievementProgressAction('collection_count', collection.value.length)
    
    const rareRecords = collection.value.filter(c => c.record.rarity >= 4).length
    updateAchievementProgressAction('rare_records', rareRecords)
    
    const perfectRecords = collection.value.filter(c => c.conditionScore >= 90).length
    updateAchievementProgressAction('perfect_records', perfectRecords)
    
    updateAchievementProgressAction('levels_cleared', completedLevels.value.length)
    updateAchievementProgressAction('member_count', members.value.length)
    updateAchievementProgressAction('consecutive_days', currentDay.value)

    if (currentLevelSatisfactionCount.value > 0) {
      const avgSatisfaction = currentLevelSatisfactionSum.value / currentLevelSatisfactionCount.value
      updateAchievementProgressAction('avg_satisfaction', Math.round(avgSatisfaction))
    }
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
    supplierRelationships,
    dailyBreachRecords,
    newlyUnlockedMilestones,
    dailyPurchaseAmountPerSupplier,
    getSupplierRelationship,
    currentSupplierRelationship,
    currentSupplierBonusSummary,
    allSupplierRelationships,
    supplierDiscountForCurrent,
    signSupplierContract,
    cancelSupplierContract,
    triggerBreach,
    getSupplierExclusiveSupplies,
    getSupplierMilestones,
    getSupplierBonusSummaryFor,
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
    shopRenovation,
    shopRenovationBonus,
    currentShopStyleConfig,
    currentShopAreaConfig,
    currentCustomerAttractionConfig,
    currentRevenueBonusConfig,
    canUpgradeShopStyle,
    canUpgradeShopArea,
    canUpgradeShopAttraction,
    canUpgradeShopRevenue,
    getCanUpgradeDisplaySlot,
    upgradeShopStyle,
    upgradeShopArea,
    upgradeShopAttraction,
    upgradeShopRevenue,
    upgradeDisplaySlotType,
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
    getMinNextBid,
    presaleItems,
    presaleOrders,
    presaleSettlements,
    presaleEventPages,
    presaleStats,
    nextPresaleRefresh,
    selectedPresaleEventId,
    activePresaleItems,
    presaleToFulfillCount,
    presaleTotalDeposits,
    presaleTotalRevenue,
    selectedPresaleEvent,
    refreshPresaleItems,
    placePresaleOrder,
    confirmPresaleOrderAction,
    payPresaleOrderAction,
    settlePresaleDeliveries,
    cancelPresaleOrderAction,
    getPresaleRecommendations,
    getItemStatusInfo,
    getPresaleStatusLabel,
    getContractTierConfig,
    getNextContractTier,
    getTierColor,
    getTierBgColor,
    getBreachTypeLabel,
    getBreachTypeIcon,
    calculateTotalDiscount,
    marketTour,
    marketCustomers,
    currentMarketCustomerIndex,
    currentMarketBargain,
    availableMarketCities,
    currentMarketCity,
    startMarketPlanning,
    selectMarketCity,
    unlockMarketCity,
    setMarketInventory,
    adjustMarketSalePrice,
    startMarketTrip,
    advanceMarketDay,
    getCurrentMarketCustomer,
    getMarketRecommendations,
    tryMarketSale,
    startMarketBargain,
    makeMarketCounterOffer,
    acceptMarketOffer,
    rejectMarketBargain,
    cancelMarketBargain,
    advanceMarketCustomer,
    triggerMarketEvent,
    resolveMarketEvent,
    settleMarketTour,
    returnFromMarket,
    adjustMarketCustomerFlow,
    resetMarketDayStats,
    getMarketInventoryValue,
    getMarketSalesStats,
    repairWorkshop,
    repairableInventory,
    activeRepairTasks,
    completedRepairTasks,
    repairHistory,
    repairStats,
    repairMaterials,
    canStartNewRepair,
    buyRepairMaterial,
    startRepairTask,
    completeRepairTask,
    getRepairTaskEstimate,
    unlockMasterQuality,
    expandRepairCapacity,
    encyclopedia,
    encyclopediaNotification,
    getClaimableRewardsCount,
    claimEncyclopediaSeriesReward,
    claimEncyclopediaAchievementReward,
    claimEncyclopediaMilestoneReward,
    getEncyclopediaSeriesProgress,
    getFilteredEncyclopediaEntries,
    clearNewEncyclopediaNotifications,
    rarityConfigs,
    getRarityColor,
    getRarityConfig,
    festival,
    festivalThemeConfig,
    festivalScore,
    festivalRewardTier,
    festivalActiveTasks,
    festivalCompletedTasks,
    festivalClaimableTasks,
    festivalUnlockedCustomers,
    startFestival,
    checkFestivalTrigger,
    advanceFestivalDay,
    endFestival,
    claimFestivalReward,
    claimFestivalTaskReward,
    purchaseFestivalMenuItem,
    updateFestivalTaskProgress,
    recordFestivalCustomerEncounter,
    getFestivalBonuses,
    switchFestivalAtmosphere,
    secondHand,
    secondHandPendingAppraisals,
    secondHandInStockItems,
    secondHandSoldItems,
    secondHandConsignmentItems,
    secondHandRecycleItems,
    secondHandUnreadNotificationCount,
    refreshSecondHandAppraisals,
    performSecondHandAppraisal,
    acceptSecondHandAppraisal,
    rejectSecondHandAppraisal,
    adjustSecondHandPrice,
    markSecondHandNotificationsRead,
    setSecondHandFilter,
    getSecondHandFiltered,
    getAppraisalQualityLabel,
    getAppraisalQualityColor,
    getSourceLabel,
    getSourceIcon,
    getStatusLabel,
    getStatusColor,
    questBoard,
    questNotification,
    maxActiveQuests,
    getCompletedActiveQuests,
    getClaimableQuestCount,
    refreshDailyQuests,
    checkAllQuestsExpiry,
    acceptQuestAction,
    claimQuestRewardAction,
    updateQuestProgressAction,
    getQuestById,
    getOverallProgress,
    getDaysRemaining,
    formatDeadlineText,
    getQuestRarityColor,
    getQuestRarityLabel,
    getQuestTypeLabel,
    community,
    communityNotification,
    communityPosts,
    communityTrends,
    communitySpreadNodes,
    communityChannels,
    communityEvents,
    communityRewards,
    communityStats,
    communitySelectedTab,
    communityTodayCheckedIn,
    communityUnreadNotifications,
    communityTotalReach,
    communityActiveSpreadNodes,
    communityUpcomingEvents,
    communityClaimableRewardsCount,
    communityCheckinStatus,
    setCommunityTab,
    likeCommunityPost,
    shareCommunityPost,
    createCommunityPost,
    communityCheckin,
    signupForCommunityEvent,
    signupCommunityEvent,
    claimCommunityReward,
    getCommunityGenreIcon,
    getCommunityTrendColor,
    getCommunityTrendIcon,
    getCommunityHeatLevelLabel,
    formatCommunityTimeAgo,
    refreshCommunityChannels,
    refreshCommunityDailyState,
    musicFestivalCollab,
    activeCollabTheme,
    collabScore,
    collabRewardTier,
    collabActiveTasks,
    collabCompletedTasks,
    collabClaimableTasks,
    collabUnlockedCustomers,
    collabLimitedRecords,
    collabUnlockedBadges,
    collabAvailableThemes,
    canRefreshCollabCustomers,
    collabCustomerRefreshCost,
    startMusicFestivalCollab,
    advanceMusicFestivalCollabDay,
    endMusicFestivalCollab,
    claimMusicFestivalCollabReward,
    claimCollabTaskReward,
    purchaseLimitedRecord,
    refreshCollabCustomers,
    updateCollabTaskProgress,
    recordCollabCustomerEncounter,
    getCollabRarityLabel,
    getCollabRarityColor,
    getCollabTaskTypeLabel,
    getCollabTaskStatusLabel,
    getCollabTaskStatusColor,
    getCollabThemeConfig,
    achievements,
    achievementNotification,
    getUnclaimedAchievementRewardCount,
    getCurrentTitle,
    updateAchievementProgressAction,
    claimAchievementRewardAction,
    equipTitleAction,
    clearAchievementNotifications,
    checkDailyAchievements,
    achievementCategories,
    getAchievementRarityLabel,
    getAchievementRarityColor,
    getAchievementRarityBgColor
  }
})
