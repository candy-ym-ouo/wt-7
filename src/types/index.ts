export type WordOfMouthTier = 'unknown' | 'known' | 'spread' | 'famous' | 'legendary'

export interface WordOfMouthConfig {
  tier: WordOfMouthTier
  tierName: string
  icon: string
  minReputation: number
  maxReputation: number
  customerCountModifier: number
  budgetModifier: number
  matchScoreBonus: number
  buyChanceBonus: number
  preferenceAlignmentBonus: number
  difficultyScale: number
  description: string
}

export interface LevelEvaluation {
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  gradeLabel: string
  wordOfMouthBonus: number
  reputationTrend: 'rising' | 'stable' | 'declining'
  customerFlowBonus: number
  totalScore: number
  genreSalesScore: number
  collectionScore: number
  avgSatisfactionScore: number
}

export type Genre = 'Jazz' | 'Rock' | 'Soul' | 'Funk' | 'Disco' | 'Classical' | 'Blues' | 'Pop' | 'Electronic' | 'Folk'

export type AtmosphereTier = 'faint' | 'mild' | 'strong' | 'intense'

export interface AtmosphereConfig {
  tier: AtmosphereTier
  tierName: string
  minValue: number
  maxValue: number
  patienceSlowdown: number
  recommendationBoost: number
  buyChanceBoost: number
  reputationBonus: number
  icon: string
}

export interface GenreAtmosphere {
  genre: Genre
  value: number
  tier: AtmosphereTier
}

export type MemberLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

export interface MemberProfile {
  id: string
  name: string
  avatar: string
  level: MemberLevel
  growthPoints: number
  totalSpent: number
  visitCount: number
  purchaseCount: number
  lastVisitDate: number
  joinDate: number
  favoriteGenres: Genre[]
  priceRange: [number, number]
  preferredRarity: number[]
  preferenceStrength: number
  isReturning: boolean
  notes: string
}

export interface MemberBenefit {
  level: MemberLevel
  levelName: string
  minGrowthPoints: number
  discountRate: number
  bonusGrowthRate: number
  priorityBoost: number
  priceRangeExpand: number
  description: string
}

export interface MemberStats {
  totalMembers: number
  byLevel: { [key in MemberLevel]: number }
  newMembersToday: number
  returningCustomersToday: number
  totalMemberSpent: number
  avgMemberSatisfaction: number
}

export interface LevelMemberTarget {
  targetNewMembers: number
  targetReturningVisits: number
  targetMemberSalesRatio: number
}

export interface GenreSalesTarget {
  genre: Genre
  targetCount: number
}

export interface CollectionTarget {
  targetActivatedAlbums: number
  targetTotalCollectionValue: number
}

export interface AvgSatisfactionTarget {
  minAvgSatisfaction: number
}

export interface LevelChallengeTargets {
  genreSales: GenreSalesTarget[]
  collection: CollectionTarget
  avgSatisfaction: AvgSatisfactionTarget
}

export interface Record {
  id: string
  title: string
  artist: string
  genre: Genre
  year: number
  coverColor: string
  condition: 'Mint' | 'Near Mint' | 'Very Good' | 'Good'
  rarity: 1 | 2 | 3 | 4 | 5
  costPrice: number
  marketPrice: number
  description: string
  trackCount: number
}

export interface InventoryItem {
  record: Record
  quantity: number
  purchaseDate: number
  conditionScore: number
  actualCostPrice: number
}

export interface DisplaySlot {
  id: number
  inventoryId: string | null
  position: { x: number; y: number }
  conditionScore: number | null
}

export interface CustomerPreference {
  favoriteGenres: Genre[]
  priceRange: [number, number]
  preferredRarity: number[]
  preferenceStrength: number
}

export type CustomerIdentityTag = 'newbie' | 'collector' | 'connoisseur' | 'enthusiast' | 'pragmatist' | 'adventurer'

export interface CustomerIdentityConfig {
  tag: CustomerIdentityTag
  name: string
  icon: string
  description: string
  baseWeight: number
  preferenceStrength: [number, number]
  priceRangeMultiplier: [number, number]
  budgetMultiplier: [number, number]
  rarityBias: number[]
  genreFocusCount: [number, number]
  satisfactionOnMatch: number
  satisfactionOnMismatch: number
  collectionChanceBonus: number
  bargainModifier: number
  patienceModifier: number
  unlockedByAlbumIds?: string[]
}

export interface Customer {
  id: string
  name: string
  avatar: string
  preference: CustomerPreference
  budget: number
  patience: number
  maxPatience: number
  patienceDecayRate: number
  arrivalOrder: number
  priorityScore: number
  satisfaction: number
  memberProfile: MemberProfile | null
  isReturningCustomer: boolean
  memberDiscount: number
  bargainAggressiveness: number
  bargainToughness: number
  willBargain: boolean
  isImpatient: boolean
  hasLeftAngrily: boolean
  identityTag: CustomerIdentityTag | null
  reservationId: string | null
  reservedRecordIds: string[]
  isFestivalCustomer?: boolean
  festivalCustomerId?: string
  festivalCustomerRarity?: 'rare' | 'epic' | 'legendary'
}

export type PatienceLevel = 'calm' | 'waiting' | 'restless' | 'impatient' | 'furious'

export interface PatienceConfig {
  decayBaseRate: number
  playbackSlowdownFactor: number
  genreMatchSlowdownFactor: number
  skipChainPenaltyFactor: number
  lowPatienceUrgencyBoost: number
  maxPriorityBonus: number
}

export interface CustomerQueueSortStrategy {
  prioritizeImpatient: boolean
  prioritizeMembers: boolean
  prioritizeHighBudget: boolean
  prioritizeSpecial: boolean
}

export type BargainPhase = 'initial' | 'customer_offer' | 'seller_counter' | 'agreed' | 'failed'

export interface BargainRound {
  round: number
  side: 'seller' | 'customer'
  price: number
  timestamp: number
  reaction?: string
}

export interface BargainState {
  active: boolean
  phase: BargainPhase
  initialAskPrice: number
  currentSellerPrice: number
  currentCustomerOffer: number | null
  customerMinPrice: number
  customerMaxPrice: number
  rounds: BargainRound[]
  maxRounds: number
  patienceLeft: number
  recordId: string | null
}

export interface SaleRecord {
  recordId: string
  customerId: string
  salePrice: number
  profit: number
  timestamp: number
  customerSatisfaction: number
  memberId: string | null
  memberLevel: MemberLevel | null
  growthPointsEarned: number
  isMemberPurchase: boolean
  timeSlot: TimeSlot
  bargainHistory?: BargainRound[]
  initialAskPrice?: number
  wasBargained: boolean
}

export type OverstockStatus = 'normal' | 'slow' | 'overstocked' | 'deadstock'

export interface OverstockConfig {
  slowThresholdDays: number
  overstockedThresholdDays: number
  deadstockThresholdDays: number
  slowDailyPenaltyRate: number
  overstockedDailyPenaltyRate: number
  deadstockDailyPenaltyRate: number
  slowSellThroughThreshold: number
  overstockedSellThroughThreshold: number
  maxDiscountRate: number
  discountStep: number
}

export interface OverstockInfo {
  recordId: string
  status: OverstockStatus
  daysInStock: number
  sellThroughRate: number
  dailyPenalty: number
  totalPenaltyAccumulated: number
  suggestedDiscount: number
  discountedSellPrice: number
  isInDisplay: boolean
  displayPriorityBoost: number
}

export interface DailyOverstockPenalty {
  day: number
  totalPenalty: number
  items: { recordId: string; recordTitle: string; status: OverstockStatus; penalty: number }[]
}

export interface LevelConfig {
  id: number
  name: string
  description: string
  targetProfit: number
  targetSales: number
  targetSatisfaction: number
  maxCustomers: number
  unlockGenres: Genre[]
  displaySlots: number
  initialBudget: number
  days: number
  memberTargets: LevelMemberTarget
  challengeTargets: LevelChallengeTargets
  overstockConfig: OverstockConfig
}

export type CollectionSourceType = 
  | 'customer_gift' 
  | 'purchase' 
  | 'member_reward' 
  | 'event_reward' 
  | 'level_clear' 
  | 'special_customer' 
  | 'album_bonus'
  | 'staff_reward'

export interface CollectionSource {
  type: CollectionSourceType
  sourceId: string | null
  sourceName: string
  sourceIcon: string
  description: string
  timestamp: number
  customerId?: string | null
  customerName?: string | null
  levelId?: number | null
  eventId?: string | null
}

export interface StoryChapter {
  id: string
  chapterIndex: number
  title: string
  content: string
  unlockCondition: string
  isUnlocked: boolean
  unlockedDate: number | null
  requiredConditionScore?: number
  requiredDaysOwned?: number
  requiredSalesCount?: number
  requiredCompletedLevels?: number[]
  requiredRarity?: number
  requiredFavorite?: boolean
  requiredRenovationCount?: number
}

export interface RecordStory {
  recordId: string
  storyTitle: string
  storyIcon: string
  chapters: StoryChapter[]
  totalChapters: number
  unlockedChapters: number
  isStoryComplete: boolean
}

export type RecordAchievementType = 
  | 'first_purchase' 
  | 'first_sale' 
  | 'high_value_sale' 
  | 'repeat_sales' 
  | 'perfect_condition' 
  | 'renovated' 
  | 'album_centerpiece'
  | 'favorite_pick'
  | 'customer_favorite'
  | 'legendary_find'

export interface RecordAchievement {
  id: string
  type: RecordAchievementType
  name: string
  icon: string
  description: string
  isUnlocked: boolean
  unlockedDate: number | null
  progress: number
  target: number
  rewardBonus?: number
}

export interface DisplayCopy {
  headline: string
  tagline: string
  history: string
  trivia: string
  quote: string
  recommendedPairing: string
  moodDescription: string
}

export interface SaleTransactionLink {
  saleRecordId: string
  salePrice: number
  customerName: string
  timestamp: number
  satisfaction: number
  wasMember: boolean
  memberLevel?: MemberLevel | null
  wasBargained: boolean
}

export interface LevelClearLink {
  levelId: number
  levelName: string
  clearedDate: number
  grade: string
  totalScore: number
}

export interface CollectionItemExtended {
  story: RecordStory | null
  achievements: RecordAchievement[]
  source: CollectionSource | null
  displayCopy: DisplayCopy | null
  saleHistory: SaleTransactionLink[]
  clearHistory: LevelClearLink[]
  daysOwned: number
  timesRenovated: number
  totalSaleRevenue: number
  totalSalesCount: number
  isStoryUnlocked: boolean
  unlockedAchievementCount: number
}

export interface CollectionItem {
  record: Record
  acquiredDate: number
  purchasePrice: number
  isFavorite: boolean
  notes: string
  conditionScore: number
  collectionValue: number
  extended: CollectionItemExtended
}

export type AlbumBonusType = 'record_unlock' | 'reputation' | 'special_customer' | 'level_reward' | 'price_bonus' | 'customer_budget' | 'match_score' | 'buy_chance'

export interface AlbumBonus {
  type: AlbumBonusType
  value: number
  description: string
}

export interface AlbumEntry {
  id: string
  name: string
  description: string
  icon: string
  requiredRecordIds: string[]
  requiredMinCondition: number
  requiredMinRarity: number
  bonuses: AlbumBonus[]
  isActivated: boolean
  activatedDate: number | null
}

export interface AlbumCategory {
  id: string
  name: string
  description: string
  icon: string
  entries: AlbumEntry[]
}

export interface AlbumState {
  categories: AlbumCategory[]
  activatedBonuses: AlbumBonus[]
  totalActivated: number
  totalAvailable: number
}

export interface SpecialCustomerConfig {
  id: string
  name: string
  avatar: string
  description: string
  baseAppearanceChance: number
  albumBonusMultiplier: number
  budgetMultiplier: number
  satisfactionBonus: number
  requiredAlbumIds: string[]
  isUnlocked: boolean
}

export type CollectionBonusSource = 'album' | 'favorite' | 'high_value' | 'encyclopedia'

export interface CollectionBonus {
  source: CollectionBonusSource
  sourceId: string
  bonusType: AlbumBonusType
  value: number
  description: string
}

export type TimeSlot = 'afternoon' | 'night'

export interface TimeSlotConfig {
  slot: TimeSlot
  name: string
  icon: string
  description: string
  genreAffinity: Genre[]
  budgetModifier: number
  customerCountRatio: number
  priceSensitivity: number
  playBoost: number
  impulseBuyChance: number
  rarityPreferenceBonus: number[]
}

export interface TimeSlotStats {
  slot: TimeSlot
  revenue: number
  cost: number
  salesCount: number
  customersServed: number
  avgSatisfaction: number
}

export type GamePhase = 'purchase' | 'display' | 'business' | 'settlement'

export interface LevelReward {
  baseReward: number
  newMembersReward: number
  returningVisitsReward: number
  memberRatioReward: number
  memberTargetsCompletedBonus: number
  genreSalesReward: number
  collectionReward: number
  avgSatisfactionReward: number
  challengeTargetsCompletedBonus: number
  totalReward: number
  reputationBonus: number
  unlockedBonus: string[]
  wordOfMouthBonus: number
  evaluation: LevelEvaluation | null
}

export type SupplierType = 'wholesaler' | 'specialist' | 'collector' | 'importer' | 'discount'

export type MarketHeatLevel = 'ice_cold' | 'cold' | 'cool' | 'normal' | 'warm' | 'hot' | 'scorching'
export type MarketHeatTrend = 'rising' | 'falling' | 'stable'

export interface GenreMarketHeat {
  genre: Genre
  heatLevel: MarketHeatLevel
  heatValue: number
  priceModifier: number
  demandModifier: number
  profitMarginModifier: number
  trend: MarketHeatTrend
  trendStrength: number
}

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  icon: string
  description: string
  reputation: number
  priceModifier: number
  rarityDistribution: number[]
  genreFocus: Genre[]
  stockRiskModifier: number
  deliveryDays: number
  minOrderAmount: number
  specialOfferChance: number
}

export interface SupplierInventoryItem {
  record: Record
  supplierId: string
  adjustedCostPrice: number
  stockRisk: 'low' | 'medium' | 'high'
  riskFactor: number
  expectedTurnoverRate: number
  historicalProfitMargin: number
  salePerformanceScore: number
  quantityAvailable: number
  isSpecialOffer: boolean
  discountPercent: number
  marketHeat: MarketHeatLevel
  marketHeatValue: number
  marketPriceModifier: number
  marketTrend: MarketHeatTrend
  isExclusiveSupply?: boolean
  exclusiveSupplyId?: string
}

export interface RecordPerformance {
  recordId: string
  totalSold: number
  totalRevenue: number
  totalProfit: number
  avgDaysInStock: number
  sellThroughRate: number
  customerSatisfaction: number
  lastSaleDate: number | null
}

export interface ThemeConfig {
  id: string
  name: string
  icon: string
  description: string
  coreGenres: Genre[]
  bonusGenres: Genre[]
  matchScoreBonus: number
  buyChanceBonus: number
  layoutBonus: number
}

export interface ThemeMatchResult {
  theme: ThemeConfig
  matchCount: number
  totalSlots: number
  matchRatio: number
  matchScoreBonus: number
  buyChanceBonus: number
  layoutBonus: number
  isActive: boolean
}

export type BusinessEventCategory = 'equipment' | 'weather' | 'market' | 'celebrity' | 'supply' | 'festival'

export type BusinessEventRarity = 'common' | 'uncommon' | 'rare'

export interface BusinessEventEffect {
  budgetChange: number
  customerCountModifier: number
  reputationChange: number
  satisfactionModifier: number
  buyChanceModifier: number
  budgetModifier: number
  conditionPenalty: number
}

export interface BusinessEventConfig {
  id: string
  name: string
  icon: string
  description: string
  category: BusinessEventCategory
  rarity: BusinessEventRarity
  isPositive: boolean
  baseChance: number
  minLevel: number
  effects: BusinessEventEffect
}

export interface ActiveBusinessEvent {
  config: BusinessEventConfig
  day: number
  appliedEffects: BusinessEventEffect
}

export type LostSaleReason =
  | 'price_too_high'
  | 'no_matching_genre'
  | 'poor_condition'
  | 'patience_exhausted'
  | 'bargain_failed'
  | 'customer_skipped'
  | 'overstock_penalty'
  | 'other'

export interface LostSaleStat {
  reason: LostSaleReason
  count: number
  label: string
  description: string
}

export interface HotGenre {
  genre: Genre
  salesCount: number
  revenue: number
  profit: number
  avgSatisfaction: number
}

export interface CustomerProfileSnapshot {
  topGenres: Genre[]
  avgBudget: number
  avgPriceRange: [number, number]
  memberRatio: number
  returningRatio: number
  avgRarityPreference: number
}

export interface CustomerProfileShift {
  current: CustomerProfileSnapshot
  previous: CustomerProfileSnapshot | null
  genreChanges: { genre: Genre; change: number; trend: 'up' | 'down' | 'stable' }[]
  budgetChange: number
  budgetTrend: 'up' | 'down' | 'stable'
  memberRatioChange: number
}

export interface DailySuggestion {
  id: string
  category: 'inventory' | 'pricing' | 'display' | 'service' | 'member'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
}

export interface DailyBusinessReview {
  day: number
  hotGenres: HotGenre[]
  lostSales: LostSaleStat[]
  totalLostSales: number
  customerProfileShift: CustomerProfileShift
  suggestions: DailySuggestion[]
}

export interface DailyStats {
  day: number
  revenue: number
  cost: number
  profit: number
  salesCount: number
  customersServed: number
  avgSatisfaction: number
  newMembers: number
  returningCustomers: number
  memberSalesCount: number
  memberRevenue: number
  totalGrowthPointsEarned: number
  renovationCost: number
  conditionDegraded: number
  timeSlotStats: TimeSlotStats[]
  events: ActiveBusinessEvent[]
  review?: DailyBusinessReview
}

export type PromotionType = 'discount' | 'buy_gift'
export type PromotionScope = 'all' | 'genre' | 'rarity' | 'specific'

export interface PromotionDiscountConfig {
  discountRate: number
}

export interface PromotionBuyGiftConfig {
  buyQuantity: number
  giftQuantity: number
  giftRecordIds?: string[]
  giftGenre?: Genre
  giftRarity?: number
}

export interface PromotionConfig {
  id: string
  type: PromotionType
  name: string
  icon: string
  description: string
  scope: PromotionScope
  targetGenres?: Genre[]
  targetRarities?: number[]
  targetRecordIds?: string[]
  startDay: number
  endDay: number
  minLevel: number
  discountConfig?: PromotionDiscountConfig
  buyGiftConfig?: PromotionBuyGiftConfig
  customerReactionBonus: number
  reputationBonus: number
  buyChanceBoost: number
}

export interface ActivePromotion {
  config: PromotionConfig
  activationDay: number
  totalSalesCount: number
  totalRevenue: number
  giftGivenCount: number
}

export interface PromotionApplicationResult {
  finalPrice: number
  originalPrice: number
  discountApplied: number
  isGiftItem: boolean
  giftsEligible: number
  appliedPromotionId: string | null
}

export type StaffSkillType = 'service' | 'recommendation' | 'skip_recovery' | 'capacity'

export interface StaffSkill {
  type: StaffSkillType
  name: string
  icon: string
  level: number
  maxLevel: number
  description: string
  effectPerLevel: number
  currentEffect: number
}

export interface StaffState {
  skills: StaffSkill[]
  totalStaffPoints: number
  availablePoints: number
  serviceEfficiencyBonus: number
  recommendationAccuracyBonus: number
  skipLossReduction: number
  dailyCapacityBonus: number
}

export type ReservationStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'no_show'

export interface ReservationItem {
  recordId: string
  recordTitle: string
  genre: Genre
  targetRarity: number[]
  minCondition: number
  quantity: number
  isFulfilled: boolean
  reservedInventoryId: string | null
}

export interface Reservation {
  id: string
  customerName: string
  customerAvatar: string
  memberProfile: MemberProfile | null
  isReturningCustomer: boolean
  memberLevel: MemberLevel | null
  dayCreated: number
  targetDay: number
  timeSlot: TimeSlot
  status: ReservationStatus
  items: ReservationItem[]
  deposit: number
  totalBudget: number
  note: string
  priorityScore: number
  satisfactionBonus: number
  customerId: string | null
  arrivalOrder: number
}

export interface ReservationSummary {
  totalReservations: number
  pendingCount: number
  fulfilledCount: number
  totalDeposit: number
  estimatedRevenue: number
  requiredRecordIds: string[]
  requiredGenres: { genre: Genre; count: number }[]
}

export interface GameState {
  currentLevel: number
  currentDay: number
  budget: number
  totalProfit: number
  phase: GamePhase
  inventory: InventoryItem[]
  displaySlots: DisplaySlot[]
  customers: Customer[]
  dailyStats: DailyStats[]
  collection: CollectionItem[]
  salesHistory: SaleRecord[]
  unlockedRecords: string[]
  shopReputation: number
  isPlaying: boolean
  currentPlayingRecord: Record | null
  members: MemberProfile[]
  currentLevelNewMembers: number
  currentLevelReturningVisits: number
  currentLevelMemberSales: number
  lastLevelReward: LevelReward | null
  dailyRenovationCost: number
  dailyConditionDegraded: number
  availableSuppliers: Supplier[]
  currentSupplierId: string | null
  supplierInventory: SupplierInventoryItem[]
  recordPerformances: RecordPerformance[]
  currentTimeSlot: TimeSlot
  afternoonCompleted: boolean
  afternoonStats: TimeSlotStats
  nightStats: TimeSlotStats
  currentBargain: BargainState | null
  albumState: AlbumState
  specialCustomers: SpecialCustomerConfig[]
  collectionBonuses: CollectionBonus[]
  levelStartReputation: number
  completedLevels: number[]
  staff: StaffState
  reservations: Reservation[]
  dailyReservationFulfilledCount: number
  dailyReservationMissedCount: number
  shopRenovation: ShopRenovationState
}

export type AuctionStatus = 'upcoming' | 'active' | 'ended' | 'settled' | 'cancelled'

export interface AuctionItem {
  id: string
  record: Record
  startingPrice: number
  reservePrice: number
  currentBid: number
  minBidIncrement: number
  startTime: number
  endTime: number
  actualEndTime: number | null
  status: AuctionStatus
  bidCount: number
  bidHistory: BidRecord[]
  winnerId: string | null
  winnerName: string | null
  isRareItem: boolean
  auctionHouseFee: number
  finalSalePrice: number | null
  sellerId: string
  sellerName: string
  conditionScoreAtStart: number
  source: 'consignment' | 'private_sale' | 'estate' | 'museum' | 'celebrity'
  sourceIcon: string
  sourceName: string
  linkedRareCustomerId: string | null
  provenance: string
}

export interface BidRecord {
  id: string
  auctionItemId: string
  bidderId: string
  bidderName: string
  bidderAvatar: string
  bidderLevel: MemberLevel | null
  isRareCollector: boolean
  bidAmount: number
  timestamp: number
  maxBid: number
  isAutoBid: boolean
  isWinningBid: boolean
  reaction?: string
}

export interface FrozenFund {
  id: string
  bidderId: string
  auctionItemId: string
  amount: number
  frozenAt: number
  releasedAt: number | null
  status: 'frozen' | 'released' | 'deducted'
  reason: string
}

export interface AuctionSettlement {
  id: string
  auctionItemId: string
  recordId: string
  recordTitle: string
  buyerId: string | null
  buyerName: string | null
  buyerAvatar: string | null
  finalPrice: number
  auctionHouseFee: number
  sellerPayout: number
  buyerTotalCost: number
  conditionScore: number
  addedToCollection: boolean
  addedToInventory: boolean
  settlementTime: number
  notes: string
}

export interface RareCollectorConfig {
  id: string
  name: string
  avatar: string
  title: string
  description: string
  personality: string
  favoriteGenres: Genre[]
  preferredRarity: number[]
  minConditionScore: number
  budgetRange: [number, number]
  bidAggressiveness: number
  snipeChance: number
  triggerAlbumIds: string[]
  isUnlocked: boolean
  baseAppearanceWeight: number
  specialAbilities: RareCollectorAbility[]
  relationshipLevel: number
  preferredSources: string[]
}

export interface RareCollectorAbility {
  id: string
  name: string
  icon: string
  description: string
  effectType: 'bid_bonus' | 'price_reduction' | 'condition_boost' | 'exclusive_access' | 'provenance_bonus'
  effectValue: number
  unlockCondition: string
  isActive: boolean
}

export interface ActiveRareCollector {
  config: RareCollectorConfig
  currentAuctionId: string | null
  activeBid: BidRecord | null
  currentBudget: number
  satisfaction: number
  interactionCount: number
  lastInteraction: number
  pendingOffer: PendingCollectorOffer | null
}

export interface PendingCollectorOffer {
  collectorId: string
  collectorName: string
  offerType: 'private_sale' | 'commission' | 'trade' | 'gifting'
  recordId: string | null
  recordTitle: string | null
  offerPrice: number
  expirationTime: number
  isAccepted: boolean
  description: string
  bonusRewards: string[]
}

export interface AuctionHouseStats {
  totalAuctionsHeld: number
  totalAuctionsSold: number
  totalRevenue: number
  totalFeesCollected: number
  rareItemsSold: number
  highestSalePrice: number
  highestSaleRecordTitle: string | null
  avgSaleToEstimateRatio: number
  uniqueBidders: number
  rareCollectorEncounters: number
  collectionAdditions: number
}

export interface AuctionGameState {
  currentAuctionItems: AuctionItem[]
  auctionHistory: AuctionItem[]
  activeBids: Map<string, BidRecord[]>
  frozenFunds: FrozenFund[]
  settlements: AuctionSettlement[]
  rareCollectors: RareCollectorConfig[]
  activeRareCollectors: ActiveRareCollector[]
  pendingOffers: PendingCollectorOffer[]
  auctionHouseStats: AuctionHouseStats
  nextAuctionRefresh: number
  isAuctionHouseOpen: boolean
  selectedAuctionFilter: string
}

export type PresaleItemStatus = 'upcoming' | 'preselling' | 'locked' | 'shipped' | 'delivered' | 'cancelled'
export type PresaleOrderStatus = 'pending' | 'confirmed' | 'paid' | 'locked' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface PresaleItemConfig {
  recordId: string
  presalePrice: number
  retailPrice: number
  earlyBirdDiscount: number
  depositRate: number
  totalStock: number
  reservedStock: number
  maxPerCustomer: number
  startDate: number
  endDate: number
  expectedShipDate: number
  bonusDescription: string
  isLimited: boolean
  isExclusive: boolean
}

export interface PresaleItem {
  id: string
  record: Record
  config: PresaleItemConfig
  status: PresaleItemStatus
  soldCount: number
  lockedCount: number
  availableStock: number
  dailySyncLog: PresaleSyncLog[]
  createdAt: number
}

export interface PresaleSyncLog {
  day: number
  syncType: 'stock_update' | 'price_adjust' | 'status_change'
  before: string
  after: string
  detail: string
}

export interface PresaleOrder {
  id: string
  customerId: string
  customerName: string
  customerAvatar: string
  memberProfile: MemberProfile | null
  memberLevel: MemberLevel | null
  presaleItemId: string
  recordId: string
  recordTitle: string
  quantity: number
  unitPrice: number
  totalPrice: number
  depositAmount: number
  remainingAmount: number
  status: PresaleOrderStatus
  isEarlyBird: boolean
  discountRate: number
  preferenceMatchScore: number
  recommendedReason: string
  orderDate: number
  confirmDate: number | null
  payDate: number | null
  lockDate: number | null
  shipDate: number | null
  deliverDate: number | null
  cancelDate: number | null
  refundDate: number | null
  note: string
  satisfactionBonus: number
}

export interface PresaleEventPage {
  id: string
  title: string
  subtitle: string
  bannerIcon: string
  theme: 'new_release' | 'limited' | 'seasonal' | 'exclusive' | 'anniversary'
  themeColor: string
  description: string
  startDate: number
  endDate: number
  itemIds: string[]
  isActive: boolean
  bonusTagline: string
}

export interface PresaleSettlement {
  id: string
  orderId: string
  recordId: string
  recordTitle: string
  customerName: string
  finalPrice: number
  depositUsed: number
  remainingPaid: number
  platformFee: number
  netRevenue: number
  settledDay: number
  satisfaction: number
  reputationImpact: number
}

export interface PresaleStats {
  totalOrders: number
  totalRevenue: number
  totalDeposits: number
  totalSettled: number
  avgMatchScore: number
  earlyBirdCount: number
  memberOrderCount: number
  cancellationCount: number
  topGenre: Genre | null
  presaleToFulfill: number
  eventPageViews: number
}

export interface PresaleGameState {
  presaleItems: PresaleItem[]
  presaleOrders: PresaleOrder[]
  presaleSettlements: PresaleSettlement[]
  eventPages: PresaleEventPage[]
  presaleStats: PresaleStats
  nextPresaleRefresh: number
  selectedEventPageId: string | null
}

export type ShopStyleTier = 'shabby' | 'simple' | 'refined' | 'elegant' | 'luxurious'

export interface ShopStyleConfig {
  tier: ShopStyleTier
  tierName: string
  icon: string
  minReputation: number
  cost: number
  description: string
  customerCountModifier: number
  budgetModifier: number
  satisfactionBonus: number
  buyChanceBonus: number
  reputationDailyBonus: number
  attractGenres: Genre[]
  unlockGenresBonus: number
  unlockLevel: number
}

export type ShopAreaTier = 'tiny' | 'small' | 'medium' | 'large' | 'grand'

export interface ShopAreaConfig {
  tier: ShopAreaTier
  tierName: string
  icon: string
  areaLevel: number
  cost: number
  description: string
  baseDisplaySlots: number
  maxCustomersBonus: number
  customerCountModifier: number
  unlockLevel: number
}

export type DisplaySlotType = 'standard' | 'premium' | 'featured' | 'vip'

export interface DisplaySlotUpgradeConfig {
  type: DisplaySlotType
  typeName: string
  icon: string
  cost: number
  description: string
  matchScoreBonus: number
  buyChanceBonus: number
  conditionPreservationBonus: number
  unlockLevel: number
}

export interface ShopDisplaySlotState {
  id: number
  type: DisplaySlotType
  unlocked: boolean
  upgradeDate: number | null
}

export type CustomerAttractionTier = 'casual' | 'regular' | 'premium' | 'elite' | 'celebrity'

export interface CustomerAttractionConfig {
  tier: CustomerAttractionTier
  tierName: string
  icon: string
  cost: number
  description: string
  specialCustomerWeightBoost: number
  memberChanceBonus: number
  highBudgetCustomerChance: number
  rareCollectorChance: number
  minReputation: number
  unlockLevel: number
}

export type RevenueBonusTier = 'none' | 'minor' | 'moderate' | 'major' | 'exclusive'

export interface RevenueBonusConfig {
  tier: RevenueBonusTier
  tierName: string
  icon: string
  cost: number
  description: string
  salePriceBonus: number
  profitMarginBonus: number
  memberSpendBonus: number
  minShopStyleTier: ShopStyleTier
  unlockLevel: number
}

export interface ShopRenovationState {
  currentStyle: ShopStyleTier
  currentArea: ShopAreaTier
  displaySlots: ShopDisplaySlotState[]
  customerAttraction: CustomerAttractionTier
  revenueBonus: RevenueBonusTier
  totalRenovationSpent: number
  renovationCount: number
  lastRenovationDay: number
  upgradeHistory: {
    type: 'style' | 'area' | 'display' | 'attraction' | 'revenue'
    fromTier: string
    toTier: string
    cost: number
    day: number
  }[]
}

export interface ShopRenovationBonusSummary {
  customerCountModifier: number
  budgetModifier: number
  satisfactionBonus: number
  buyChanceBonus: number
  reputationDailyBonus: number
  matchScoreBonus: number
  conditionPreservationBonus: number
  specialCustomerWeightBoost: number
  memberChanceBonus: number
  highBudgetCustomerChance: number
  rareCollectorChance: number
  salePriceBonus: number
  profitMarginBonus: number
  memberSpendBonus: number
  attractGenres: Genre[]
  maxCustomersBonus: number
  totalDisplaySlots: number
  unlockedGenresBonus: number
}

export type SupplierContractTier = 'none' | 'trial' | 'standard' | 'preferred' | 'strategic' | 'exclusive'

export interface SupplierContractConfig {
  tier: SupplierContractTier
  tierName: string
  icon: string
  minTrustPoints: number
  discountRate: number
  exclusiveSlotCount: number
  minOrderDiscount: number
  deliveryBonus: number
  rareItemBonus: number
  breachForgiveness: number
  dailyTrustGainCap: number
  description: string
}

export interface SupplierGrowthMilestone {
  id: string
  name: string
  icon: string
  requiredTrustPoints: number
  requiredContractTier: SupplierContractTier
  rewardType: 'discount_boost' | 'exclusive_genre' | 'rare_slot' | 'delivery_speed' | 'breach_shield' | 'special_offer_boost'
  rewardValue: number
  rewardDescription: string
  isUnlocked: boolean
}

export interface SupplierExclusiveSupply {
  id: string
  genre: Genre
  minRarity: number
  maxRarity: number
  priceBonus: number
  bonusStockCount: number
  priceCap: number
  requiredContractTier: SupplierContractTier
}

export interface SupplierBreachRecord {
  id: string
  supplierId: string
  day: number
  type: 'min_order_missed' | 'contract_cancelled' | 'payment_delayed' | 'exclusive_violation'
  description: string
  trustPenalty: number
  reputationPenalty: number
  fineAmount: number
}

export interface SupplierRelationship {
  supplierId: string
  contractTier: SupplierContractTier
  trustPoints: number
  totalSpent: number
  totalPurchased: number
  consecutivePurchaseDays: number
  breachCount: number
  breachRecords: SupplierBreachRecord[]
  unlockedMilestones: string[]
  isActive: boolean
  contractStartDate: number | null
  lastPurchaseDay: number
  dailyTrustGained: number
  cumulativeDiscount: number
}

export interface SupplierRelationshipBonusSummary {
  totalDiscountRate: number
  exclusiveSlots: number
  deliverySpeedBonus: number
  rareItemBonus: number
  breachForgiveness: number
  activeMilestoneBonuses: { type: string; value: number; description: string }[]
  nextMilestone: SupplierGrowthMilestone | null
  nextContractTier: SupplierContractConfig | null
  trustProgressPercent: number
}

export type MarketTourPhase = 'planning' | 'traveling' | 'setup' | 'selling' | 'event' | 'settlement' | 'return'

export type CityTier = 'small' | 'medium' | 'large' | 'metropolis'

export interface MarketCity {
  id: string
  name: string
  tier: CityTier
  icon: string
  description: string
  travelCost: number
  travelDays: number
  minLevel: number
  baseCustomerCount: number
  baseBudgetMultiplier: number
  preferredGenres: Genre[]
  rentCost: number
  eventDensity: number
  reputationReward: number
  unlockCost?: number
  isUnlocked: boolean
}

export interface MarketInventoryItem {
  record: Record
  quantity: number
  conditionScore: number
  actualCostPrice: number
  sourceInventoryId: string
  soldQuantity: number
  salePrice: number
}

export type MarketEventCategory = 'weather' | 'crowd' | 'media' | 'special_guest' | 'competition' | 'accident' | 'opportunity'

export type MarketEventRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface MarketEventEffect {
  customerCountModifier: number
  budgetModifier: number
  buyChanceModifier: number
  priceModifier: number
  reputationChange: number
  budgetChange: number
  duration: number
}

export interface MarketEventChoice {
  id: string
  label: string
  description: string
  icon: string
  effects: MarketEventEffect
  cost?: number
  probabilityModifier?: number
}

export interface MarketEventConfig {
  id: string
  name: string
  icon: string
  description: string
  category: MarketEventCategory
  rarity: MarketEventRarity
  minCityTier: CityTier
  choices: MarketEventChoice[]
  triggerMessage: string
}

export interface ActiveMarketEvent {
  config: MarketEventConfig
  selectedChoice: MarketEventChoice | null
  triggeredAt: number
  resolved: boolean
  activeEffects: MarketEventEffect
}

export interface ActiveEventEffectEntry {
  effects: MarketEventEffect
  remainingDays: number
  triggeredAtDay: number
  eventName: string
  choiceLabel: string
}

export type CustomerFlowWave = 'low' | 'normal' | 'peak' | 'surge'

export interface CustomerFlowState {
  currentWave: CustomerFlowWave
  waveLabel: string
  waveIcon: string
  customerMultiplier: number
  budgetMultiplier: number
  buyChanceBonus: number
  nextWaveIn: number
  waveProgress: number
}

export interface MarketSaleRecord {
  id: string
  recordId: string
  recordTitle: string
  salePrice: number
  costPrice: number
  profit: number
  customerName: string
  customerAvatar: string
  satisfaction: number
  wasBargained: boolean
  wave: CustomerFlowWave
  timestamp: number
}

export interface MarketSettlement {
  cityId: string
  cityName: string
  startDay: number
  endDay: number
  totalDays: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  salesCount: number
  avgSatisfaction: number
  peakSalesWave: CustomerFlowWave
  eventsEncountered: number
  travelCost: number
  rentCost: number
  otherCosts: number
  reputationGained: number
  unsoldItems: { recordId: string; title: string; quantity: number }[]
  bonusRewards: string[]
}

export interface MarketTourState {
  isActive: boolean
  phase: MarketTourPhase
  currentCityId: string | null
  selectedCityId: string | null
  travelDaysRemaining: number
  daysAtMarket: number
  maxDaysAtMarket: number
  temporaryInventory: MarketInventoryItem[]
  marketInventoryValue: number
  activeEvent: ActiveMarketEvent | null
  activeEventEffects: ActiveEventEffectEntry[]
  eventHistory: ActiveMarketEvent[]
  customerFlow: CustomerFlowState
  marketSales: MarketSaleRecord[]
  dailyMarketRevenue: number[]
  dailyMarketCost: number[]
  dailyMarketSalesCount: number[]
  currentMarketDayRevenue: number
  currentMarketDayCost: number
  currentMarketDaySalesCount: number
  currentMarketDaySatisfactionSum: number
  currentMarketDayCustomersServed: number
  pendingSettlement: MarketSettlement | null
  settlementHistory: MarketSettlement[]
  unlockedCityIds: string[]
  totalMarketProfit: number
  totalMarketSales: number
  reputationFromMarkets: number
  preferredCityIds: string[]
}

export interface MarketCityStats {
  totalVisits: number
  totalRevenue: number
  totalProfit: number
  avgSatisfaction: number
  bestEvent: string | null
  peakDay: number
}

export interface MarketCustomer {
  id: string
  name: string
  avatar: string
  budget: number
  favoriteGenres: Genre[]
  priceRange: [number, number]
  preferredRarity: number[]
  patience: number
  maxPatience: number
  satisfaction: number
  willBargain: boolean
  arrivalOrder: number
  isLocalCollector: boolean
  isTourist: boolean
  tipMultiplier: number
  quote: string
}

export type RepairMaterialType = 'cleaner' | 'scratch_remover' | 'sleeve' | 'stabilizer' | 'polish'

export interface RepairMaterial {
  type: RepairMaterialType
  name: string
  icon: string
  description: string
  unitCost: number
  conditionBoost: number
  priceBoostPercent: number
  rarityBoostChance: number
}

export interface RepairMaterialInventory {
  type: RepairMaterialType
  quantity: number
}

export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type RepairQuality = 'basic' | 'professional' | 'master'

export interface RepairQualityConfig {
  quality: RepairQuality
  qualityName: string
  icon: string
  conditionMultiplier: number
  priceMultiplier: number
  successRate: number
  rarityUpChance: number
  costMultiplier: number
  description: string
}

export interface RepairTask {
  id: string
  inventoryId: string
  record: Record
  initialConditionScore: number
  targetConditionScore: number
  materials: RepairMaterialType[]
  quality: RepairQuality
  status: RepairStatus
  totalCost: number
  materialCost: number
  laborCost: number
  startTime: number | null
  endTime: number | null
  durationMinutes: number
  progress: number
  finalConditionScore: number | null
  finalMarketPrice: number | null
  collectionValueChange: number | null
  priceIncrease: number | null
  rarityUpgraded: boolean
  notes: string
}

export interface RepairHistoryEntry {
  id: string
  recordId: string
  recordTitle: string
  day: number
  initialCondition: number
  finalCondition: number
  priceIncrease: number
  rarityUpgraded: boolean
  totalCost: number
  quality: RepairQuality
  materialsUsed: RepairMaterialType[]
  success: boolean
}

export interface RepairWorkshopStats {
  totalRepairsCompleted: number
  totalRepairsFailed: number
  totalMaterialCost: number
  totalLaborCost: number
  totalPriceIncrease: number
  totalCollectionValueGain: number
  rarityUpgrades: number
  successRate: number
}

export interface RepairWorkshopState {
  materials: RepairMaterialInventory[]
  activeTasks: RepairTask[]
  completedTasks: RepairTask[]
  history: RepairHistoryEntry[]
  stats: RepairWorkshopStats
  maxActiveTasks: number
  unlockedQualities: RepairQuality[]
}

export type EncyclopediaRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface EncyclopediaRarityConfig {
  tier: EncyclopediaRarityTier
  tierName: string
  icon: string
  color: string
  minRarity: number
  maxRarity: number
  glowIntensity: number
  description: string
}

export type EncyclopediaSeriesType = 
  | 'genre' 
  | 'artist' 
  | 'decade' 
  | 'theme' 
  | 'special'

export interface EncyclopediaSeries {
  id: string
  name: string
  description: string
  icon: string
  type: EncyclopediaSeriesType
  coverColor: string
  requiredRecordIds: string[]
  requiredMinCondition?: number
  requiredMinRarity?: number
  unlockLevel?: number
  rewards: AlbumBonus[]
  isUnlocked: boolean
  isCompleted: boolean
  completedDate: number | null
  rewardClaimed: boolean
  rewardClaimedDate: number | null
}

export interface EncyclopediaCategory {
  id: string
  name: string
  description: string
  icon: string
  coverColor: string
  genre: Genre | 'all'
  series: EncyclopediaSeries[]
  unlockLevel: number
  isUnlocked: boolean
}

export interface EncyclopediaAchievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'collection' | 'series' | 'rarity' | 'condition' | 'special'
  progressType: 'count' | 'percent' | 'boolean'
  target: number
  current: number
  isUnlocked: boolean
  unlockedDate: number | null
  rewards: AlbumBonus[]
  rewardClaimed: boolean
  rewardClaimedDate: number | null
}

export interface EncyclopediaReward {
  id: string
  name: string
  description: string
  icon: string
  bonuses: AlbumBonus[]
  sourceType: 'series' | 'achievement' | 'milestone'
  sourceId: string
  isClaimable: boolean
  isClaimed: boolean
  claimedDate: number | null
}

export interface EncyclopediaMilestone {
  id: string
  name: string
  description: string
  icon: string
  target: number
  metric: 'total_collected' | 'total_value' | 'rare_count' | 'perfect_count' | 'series_completed'
  rewards: AlbumBonus[]
  isCompleted: boolean
  isClaimed: boolean
  claimedDate: number | null
}

export interface EncyclopediaStats {
  totalRecords: number
  collectedRecords: number
  totalSeries: number
  completedSeries: number
  totalAchievements: number
  unlockedAchievements: number
  totalRarityScore: number
  avgConditionScore: number
  totalCollectionValue: number
  rareRecordsCount: number
  perfectRecordsCount: number
  collectionProgress: number
}

export interface EncyclopediaEntry {
  record: Record
  isCollected: boolean
  firstCollectedDate: number | null
  collectedCount: number
  bestConditionScore: number
  totalSaleRevenue: number
  totalSalesCount: number
  isFavorite: boolean
  seriesMemberships: string[]
  rarityTier: EncyclopediaRarityTier
}

export interface EncyclopediaState {
  categories: EncyclopediaCategory[]
  achievements: EncyclopediaAchievement[]
  milestones: EncyclopediaMilestone[]
  rewards: EncyclopediaReward[]
  entries: EncyclopediaEntry[]
  stats: EncyclopediaStats
  unlockedCategories: string[]
  newlyUnlockedSeries: string[]
  newlyUnlockedAchievements: string[]
  newlyClaimableRewards: string[]
}

export interface EncyclopediaFilterOptions {
  category: string
  rarity: EncyclopediaRarityTier | 'all'
  collected: 'all' | 'collected' | 'uncollected'
  sortBy: 'rarity' | 'name' | 'date' | 'value'
}

export interface EncyclopediaRewardClaimResult {
  success: boolean
  message: string
  rewards: AlbumBonus[]
}

export type FestivalTheme = 'spring' | 'summer' | 'autumn' | 'winter' | 'newyear' | 'midautumn' | 'christmas' | 'valentine'

export interface FestivalThemeConfig {
  theme: FestivalTheme
  name: string
  icon: string
  description: string
  bgGradient: string
  accentColor: string
  particleIcon: string
  genreAffinity: Genre[]
  customerBudgetBonus: number
  buyChanceBonus: number
  reputationBonus: number
  satisfactionBonus: number
}

export type FestivalMenuStatus = 'available' | 'sold_out' | 'limited'

export interface FestivalMenuItem {
  recordId: string
  festivalPrice: number
  originalPrice: number
  discountRate: number
  status: FestivalMenuStatus
  stock: number
  maxStock: number
  isFeatured: boolean
  isExclusive: boolean
  tagLabel: string
}

export interface FestivalMenu {
  id: string
  festivalTheme: FestivalTheme
  name: string
  icon: string
  description: string
  items: FestivalMenuItem[]
  bonusBuyThreshold: number
  bonusReward: string
  totalPurchased: number
}

export type FestivalCustomerRarity = 'rare' | 'epic' | 'legendary'

export interface FestivalCustomerConfig {
  id: string
  name: string
  avatar: string
  title: string
  description: string
  rarity: FestivalCustomerRarity
  favoriteGenres: Genre[]
  budgetMultiplier: number
  satisfactionBonus: number
  buyChanceBonus: number
  appearanceChance: number
  requiredReputation: number
  requiredFestivalTheme: FestivalTheme | null
  isUnlocked: boolean
  unlockDay: number | null
  quotes: string[]
  specialReward: string
}

export interface FestivalCustomerEncounter {
  config: FestivalCustomerConfig
  day: number
  satisfaction: number
  purchasedRecordIds: string[]
  giftGiven: boolean
}

export type FestivalTaskType = 'sales' | 'genre' | 'customer' | 'atmosphere' | 'collection' | 'special'
export type FestivalTaskStatus = 'locked' | 'active' | 'completed' | 'claimed'

export interface FestivalTaskConfig {
  id: string
  type: FestivalTaskType
  name: string
  icon: string
  description: string
  target: number
  current: number
  status: FestivalTaskStatus
  reward: FestivalTaskReward
  requiredTaskIds: string[]
  requiredDay: number
}

export interface FestivalTaskReward {
  budget: number
  reputation: number
  growthPoints: number
  bonusItems: string[]
}

export interface FestivalRewardTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierName: string
  icon: string
  minScore: number
  rewards: FestivalTaskReward
  description: string
}

export interface FestivalSettlement {
  festivalTheme: FestivalTheme
  totalScore: number
  rewardTier: FestivalRewardTier
  tasksCompleted: number
  totalTasks: number
  customersServed: number
  menuItemsSold: number
  bonusRewards: string[]
  settledDay: number
}

export interface FestivalAtmosphereOverride {
  theme: FestivalTheme
  bgGradient: string
  accentColor: string
  particleEffect: string
  headerStyle: string
  cardStyle: string
  isActive: boolean
}

export interface FestivalState {
  activeFestival: FestivalTheme | null
  festivalDay: number
  maxFestivalDays: number
  menus: FestivalMenu[]
  customers: FestivalCustomerConfig[]
  encounteredCustomers: FestivalCustomerEncounter[]
  tasks: FestivalTaskConfig[]
  settlements: FestivalSettlement[]
  atmosphereOverride: FestivalAtmosphereOverride | null
  totalFestivalScore: number
  menuItemsSold: number
  customersServed: number
  tasksCompleted: number
  isFestivalActive: boolean
  hasUnclaimedRewards: boolean
}

export type SecondHandSource = 'recycle' | 'consignment'
export type SecondHandStatus = 'pending_appraisal' | 'appraised' | 'accepted' | 'rejected' | 'in_stock' | 'sold' | 'settled' | 'cancelled'
export type AppraisalQuality = 'poor' | 'fair' | 'good' | 'excellent' | 'perfect'

export interface SecondHandAppraisal {
  id: string
  recordId: string
  record: Record
  source: SecondHandSource
  sourceName: string
  sellerName: string
  sellerAvatar: string
  submittedAt: number
  conditionDescription: string
  photosCount: number
  hasProvenance: boolean
  provenanceNote?: string
  estimatedMinPrice: number
  estimatedMaxPrice: number
  finalAppraisalValue: number | null
  appraisalQuality: AppraisalQuality | null
  appraisalNote: string | null
  appraisedAt: number | null
  status: SecondHandStatus
  isMember: boolean
  memberLevel: MemberLevel | null
  urgency: 'low' | 'normal' | 'high'
  authenticityRisk: 'low' | 'medium' | 'high'
  marketHeatBonus: number
  reputationImpact: number | null
}

export interface ConsignmentTerms {
  shopCommissionRate: number
  sellerPayoutRate: number
  basePrice: number
  minPrice: number
  maxPrice: number
  durationDays: number
  startDay: number
  endDay: number
  priceReductionSchedule: { day: number; discountRate: number }[]
  settlementMethod: 'immediate' | 'weekly' | 'monthly'
  autoPriceAdjust: boolean
}

export interface SecondHandInventoryItem {
  id: string
  appraisalId: string
  record: Record
  source: SecondHandSource
  sourceName: string
  sellerName: string
  sellerAvatar: string
  acquiredAt: number
  actualCostPrice: number
  conditionScore: number
  listedPrice: number
  currentPrice: number
  consignmentTerms: ConsignmentTerms | null
  isConsignment: boolean
  daysInStock: number
  viewCount: number
  inquiryCount: number
  isPromoted: boolean
  status: SecondHandStatus
  qualityTag: AppraisalQuality
  authenticityGuaranteed: boolean
  hasRepairHistory: boolean
  repairNotes: string | null
  genreMarketHeatBonus: number
}

export interface SecondHandSaleRecord {
  id: string
  inventoryId: string
  appraisalId: string
  recordId: string
  recordTitle: string
  recordArtist: string
  source: SecondHandSource
  sourceName: string
  sellerName: string
  sellerAvatar: string
  buyerName: string
  buyerAvatar: string
  buyerMemberLevel: MemberLevel | null
  isBuyerMember: boolean
  finalSalePrice: number
  originalListedPrice: number
  discountApplied: number
  shopCommission: number
  sellerPayout: number
  shopProfit: number
  soldAt: number
  soldDay: number
  buyerSatisfaction: number
  sellerSatisfaction: number
  bargainingRounds: number
  wasBargained: boolean
  paymentMethod: 'cash' | 'card' | 'member_credit' | 'trade'
  settlementStatus: 'pending' | 'completed' | 'disputed'
  settlementDate: number | null
  reputationImpact: number
  reviewFromBuyer: string | null
  reviewFromSeller: string | null
  ratingFromBuyer: number | null
  ratingFromSeller: number | null
}

export interface ReputationChangeLog {
  id: string
  timestamp: number
  day: number
  changeAmount: number
  changeType: 'secondhand_sale' | 'appraisal_rejection' | 'seller_complaint' | 'buyer_complaint' | 'authenticity_issue' | 'fast_settlement' | 'positive_review' | 'negative_review' | 'fair_price' | 'overpriced' | 'consignment_success'
  changeTypeName: string
  description: string
  relatedRecordId: string | null
  relatedSaleId: string | null
  relatedAppraisalId: string | null
  sellerName: string | null
  buyerName: string | null
}

export interface SecondHandSellerProfile {
  id: string
  name: string
  avatar: string
  totalItemsSubmitted: number
  totalItemsAccepted: number
  totalItemsSold: number
  totalEarnings: number
  acceptanceRate: number
  avgRating: number
  ratingCount: number
  isTrustedSeller: boolean
  isMember: boolean
  memberLevel: MemberLevel | null
  firstTransactionDate: number | null
  lastTransactionDate: number | null
  notes: string
  preferredGenres: Genre[]
  trustScore: number
  disputeCount: number
  authenticItemsCount: number
}

export interface SecondHandStats {
  totalAppraisals: number
  pendingAppraisals: number
  acceptedAppraisals: number
  rejectedAppraisals: number
  totalInventoryItems: number
  consignmentItems: number
  recycleItems: number
  totalSales: number
  totalRevenue: number
  totalShopProfit: number
  totalSellerPayouts: number
  avgSaleToAppraisalRatio: number
  avgDaysToSell: number
  totalReputationImpact: number
  positiveReputationChanges: number
  negativeReputationChanges: number
  trustedSellers: number
  activeSellers: number
  topSoldGenre: Genre | null
  avgBuyerSatisfaction: number
  avgSellerSatisfaction: number
  disputeRate: number
}

export interface SecondHandGameState {
  appraisals: SecondHandAppraisal[]
  inventory: SecondHandInventoryItem[]
  sales: SecondHandSaleRecord[]
  sellerProfiles: SecondHandSellerProfile[]
  reputationChanges: ReputationChangeLog[]
  stats: SecondHandStats
  appraisalQueueSize: number
  nextAppraisalRefresh: number
  autoAcceptLowValue: boolean
  autoAcceptThreshold: number
  defaultConsignmentRate: number
  defaultRecycleMarkup: number
  selectedFilter: 'all' | 'pending' | 'in_stock' | 'sold' | 'consignment' | 'recycle'
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'error' | 'info'; read: boolean; createdAt: number }[]
}

export type QuestType = 'daily_order' | 'collect_record' | 'time_limited' | 'genre_sales' | 'profit_target'
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'claimed' | 'expired'
export type QuestRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type QuestRequirementType = 'sell_record' | 'collect_record' | 'reach_profit' | 'sell_genre' | 'sell_quantity' | 'customer_satisfaction'

export interface QuestRequirement {
  type: QuestRequirementType
  target: number
  current: number
  genre?: Genre
  recordIds?: string[]
  minRarity?: number
  minCondition?: number
  description: string
}

export interface QuestReward {
  budget: number
  reputation: number
  growthPoints?: number
  bonusRecordId?: string
  unlockedAlbumId?: string
  description: string
}

export interface QuestConfig {
  id: string
  type: QuestType
  title: string
  icon: string
  description: string
  clientName: string
  clientAvatar: string
  rarity: QuestRarity
  requirements: QuestRequirement[]
  reward: QuestReward
  minLevel: number
  durationDays: number
  startTimeSlot?: TimeSlot
  isRepeatable: boolean
  cooldownDays: number
}

export interface Quest {
  config: QuestConfig
  status: QuestStatus
  acceptedDay: number | null
  deadlineDay: number | null
  completedDay: number | null
  claimedDay: number | null
  failedDay: number | null
  progress: QuestRequirement[]
  notifications: { day: number; message: string; type: 'info' | 'warning' | 'success' }[]
}

export interface DailyQuestBoard {
  day: number
  availableQuests: Quest[]
  activeQuests: Quest[]
  completedQuests: Quest[]
  claimedQuests: Quest[]
  failedQuests: Quest[]
  lastRefreshDay: number
  totalQuestsCompleted: number
  totalRewardsEarned: {
    budget: number
    reputation: number
    growthPoints: number
  }
  consecutiveDailyCompletion: number
}

export interface QuestProgressUpdate {
  type: QuestRequirementType
  value: number
  genre?: Genre
  recordId?: string
  rarity?: number
  condition?: number
  customerId?: string
  satisfaction?: number
}

export interface QuestAcceptResult {
  success: boolean
  message: string
  quest?: Quest
}

export interface QuestClaimResult {
  success: boolean
  message: string
  reward?: QuestReward
}

export type CommunityPostType = 'review' | 'recommendation' | 'discussion' | 'event_share' | 'collection_show'

export interface CommunityPost {
  id: string
  type: CommunityPostType
  typeName: string
  typeIcon: string
  authorName: string
  authorAvatar: string
  authorLevel: MemberLevel | null
  content: string
  recordTitle?: string
  recordArtist?: string
  recordGenre?: Genre
  recordCoverColor?: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  timestamp: number
  dayPosted: number
  tags: string[]
  reputationImpact: number
  isPinned?: boolean
}

export interface GenreTrend {
  genre: Genre
  rank: number
  previousRank: number
  trend: 'rising' | 'stable' | 'falling'
  heatValue: number
  heatLevel: 'cold' | 'cool' | 'warm' | 'hot' | 'scorching'
  postCount: number
  discussionCount: number
  salesGrowth: number
  icon: string
  description: string
}

export interface WordOfMouthSpreadNode {
  id: string
  name: string
  avatar: string
  level: MemberLevel | null
  influence: number
  reach: number
  spreadCount: number
  isActive: boolean
  lastSpreadDay: number
}

export interface WordOfMouthChannel {
  id: string
  name: string
  icon: string
  description: string
  reachMultiplier: number
  reputationGainMultiplier: number
  unlockReputation: number
  isUnlocked: boolean
  currentReach: number
  dailyGrowth: number
}

export type CommunityEventStatus = 'upcoming' | 'signup' | 'in_progress' | 'ended' | 'cancelled'
export type CommunityEventType = 'listening_party' | 'swap_meet' | 'genre_night' | 'workshop' | 'artist_visit' | 'anniversary'

export interface CommunityEvent {
  id: string
  type: CommunityEventType
  typeName: string
  typeIcon: string
  title: string
  description: string
  bannerIcon: string
  status: CommunityEventStatus
  signupStartDay: number
  signupEndDay: number
  eventDay: number
  maxParticipants: number
  currentParticipants: number
  minReputation: number
  entryFee: number
  rewards: {
    reputation: number
    budget: number
    growthPoints: number
    bonusRecordId?: string
  }
  genreFocus?: Genre[]
  isParticipating: boolean
  participantAvatars: string[]
  satisfaction?: number
}

export type RewardType = 'daily_checkin' | 'post_reward' | 'spread_reward' | 'event_reward' | 'milestone_reward' | 'referral_bonus'

export interface CommunityReward {
  id: string
  type: RewardType
  typeName: string
  typeIcon: string
  title: string
  description: string
  icon: string
  budgetReward: number
  reputationReward: number
  growthPointsReward: number
  requirement: {
    type: 'posts' | 'likes' | 'shares' | 'checkin_days' | 'referrals' | 'event_participation'
    target: number
    current: number
  }
  isClaimed: boolean
  isClaimable: boolean
  claimDay?: number
}

export interface CommunityStats {
  totalPosts: number
  totalLikes: number
  totalShares: number
  totalComments: number
  activeUsers: number
  dailyPosts: number
  weeklyPosts: number
  eventsParticipated: number
  totalRewardsClaimed: number
  totalBudgetRewarded: number
  totalReputationGained: number
  consecutiveCheckinDays: number
  longestCheckinStreak: number
  influenceScore: number
  communityLevel: number
}

export interface CommunityState {
  posts: CommunityPost[]
  trends: GenreTrend[]
  spreadNodes: WordOfMouthSpreadNode[]
  channels: WordOfMouthChannel[]
  events: CommunityEvent[]
  rewards: CommunityReward[]
  stats: CommunityStats
  lastRefreshDay: number
  selectedTab: 'posts' | 'trends' | 'spread' | 'events' | 'rewards'
  todayCheckedIn: boolean
  unreadNotifications: number
}

export interface PostRewardResult {
  success: boolean
  message: string
  rewards: {
    reputation: number
    budget?: number
  }
  post?: CommunityPost
}

export interface EventSignupResult {
  success: boolean
  message: string
  event?: CommunityEvent
  cost?: number
}

export interface RewardClaimResult {
  success: boolean
  message: string
  reward?: CommunityReward
  budgetGained?: number
  reputationGained?: number
  growthPointsGained?: number
}

export type MusicFestivalCollabRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface MusicFestivalCollabTheme {
  id: string
  name: string
  icon: string
  description: string
  bgGradient: string
  accentColor: string
  genreAffinity: Genre[]
  startDay: number
  endDay: number
  isActive: boolean
  isUnlocked: boolean
  requiredReputation: number
  requiredLevel: number
}

export interface MusicFestivalLimitedRecord {
  id: string
  record: Record
  collabThemeId: string
  limitedStock: number
  remainingStock: number
  collabPrice: number
  originalPrice: number
  isExclusive: boolean
  rarity: MusicFestivalCollabRarity
  releaseDate: number
  unlockCondition: string
  isUnlocked: boolean
  soldCount: number
  bonusDescription: string
}

export interface MusicFestivalCollabCustomer {
  id: string
  name: string
  avatar: string
  title: string
  description: string
  rarity: MusicFestivalCollabRarity
  favoriteGenres: Genre[]
  budgetMultiplier: number
  satisfactionBonus: number
  buyChanceBonus: number
  appearanceChance: number
  requiredReputation: number
  collabThemeId: string
  isUnlocked: boolean
  quotes: string[]
  specialRewardId: string
  encounterCount: number
}

export type MusicFestivalCollabTaskType = 'sales' | 'genre' | 'customer' | 'collection' | 'special' | 'atmosphere'
export type MusicFestivalCollabTaskStatus = 'locked' | 'active' | 'completed' | 'claimed'

export interface MusicFestivalCollabTask {
  id: string
  type: MusicFestivalCollabTaskType
  name: string
  icon: string
  description: string
  target: number
  current: number
  status: MusicFestivalCollabTaskStatus
  collabThemeId: string
  reward: MusicFestivalCollabReward
  requiredTaskIds: string[]
  requiredDay: number
  genre?: Genre
  minRarity?: number
}

export interface MusicFestivalCollabReward {
  budget: number
  reputation: number
  growthPoints: number
  limitedRecordId?: string
  bonusItems: string[]
  collectionBadgeId?: string
}

export interface MusicFestivalCollabCollectionBadge {
  id: string
  name: string
  icon: string
  description: string
  rarity: MusicFestivalCollabRarity
  collabThemeId: string
  isUnlocked: boolean
  unlockedDate: number | null
  unlockCondition: string
  bonusEffect: string
  bonusValue: number
}

export interface MusicFestivalCollabSettlement {
  collabThemeId: string
  totalScore: number
  rewardTier: MusicFestivalCollabRewardTier
  tasksCompleted: number
  totalTasks: number
  customersServed: number
  limitedRecordsSold: number
  bonusRewards: string[]
  settledDay: number
  badgesCollected: string[]
}

export interface MusicFestivalCollabRewardTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary'
  tierName: string
  icon: string
  minScore: number
  rewards: MusicFestivalCollabReward
  description: string
}

export interface MusicFestivalCollabRefreshCustomerResult {
  success: boolean
  message: string
  newCustomers: Customer[]
  collabCustomers: MusicFestivalCollabCustomer[]
  cost: number
}

export interface MusicFestivalCollabState {
  activeTheme: MusicFestivalCollabTheme | null
  collabDay: number
  maxCollabDays: number
  themes: MusicFestivalCollabTheme[]
  limitedRecords: MusicFestivalLimitedRecord[]
  collabCustomers: MusicFestivalCollabCustomer[]
  tasks: MusicFestivalCollabTask[]
  settlements: MusicFestivalCollabSettlement[]
  badges: MusicFestivalCollabCollectionBadge[]
  totalCollabScore: number
  limitedRecordsSold: number
  collabCustomersServed: number
  tasksCompleted: number
  isCollabActive: boolean
  hasUnclaimedRewards: boolean
  customerRefreshCooldown: number
  lastRefreshDay: number
  activeCollabCustomerIds: string[]
}

export interface MusicFestivalCollabStartResult {
  success: boolean
  message: string
  theme?: MusicFestivalCollabTheme
  cost?: number
}

export interface MusicFestivalCollabPurchaseResult {
  success: boolean
  message: string
  record?: MusicFestivalLimitedRecord
  cost?: number
}

export type BusinessAchievementCategory = 
  | 'sales' 
  | 'profit' 
  | 'collection' 
  | 'satisfaction' 
  | 'level' 
  | 'special'

export type BusinessAchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface BusinessAchievementConfig {
  id: string
  name: string
  icon: string
  description: string
  category: BusinessAchievementCategory
  rarity: BusinessAchievementRarity
  target: number
  progressType: 'count' | 'value' | 'percent' | 'boolean'
  reward: {
    budget?: number
    reputation?: number
    growthPoints?: number
    bonusRecordId?: string
  }
  unlockCondition?: string
  isUnlocked: boolean
  unlockedDate: number | null
  progress: number
  rewardClaimed: boolean
  rewardClaimedDate: number | null
}

export type BusinessTitleType = 
  | 'novice_merchant'
  | 'shrewd_businessman'
  | 'music_connoisseur'
  | 'collection_master'
  | 'customer_favorite'
  | 'industry_legend'

export interface BusinessTitleConfig {
  id: string
  name: string
  icon: string
  description: string
  type: BusinessTitleType
  tier: number
  requiredAchievementIds: string[]
  bonusEffect: string
  bonusValue: number
  isUnlocked: boolean
  unlockedDate: number | null
  isEquipped: boolean
}

export interface BusinessAchievementStats {
  totalAchievements: number
  unlockedAchievements: number
  totalTitles: number
  unlockedTitles: number
  achievementPoints: number
  currentTitleId: string | null
  newlyUnlocked: string[]
  newlyClaimableRewards: string[]
}

export interface BusinessAchievementState {
  achievements: BusinessAchievementConfig[]
  titles: BusinessTitleConfig[]
  stats: BusinessAchievementStats
  lastCheckDay: number
}

export type AchievementProgressUpdateType =
  | 'total_sales'
  | 'total_profit'
  | 'daily_profit'
  | 'collection_count'
  | 'collection_value'
  | 'avg_satisfaction'
  | 'customer_satisfaction'
  | 'levels_cleared'
  | 's_grade_levels'
  | 'genre_sales'
  | 'rare_records'
  | 'perfect_records'
  | 'member_count'
  | 'consecutive_days'
  | 'single_sale_price'
  | 'bargain_success'

export type StaffPosition = 'sales' | 'reception' | 'restoration' | 'purchasing' | 'management'

export interface StaffPositionConfig {
  id: StaffPosition
  name: string
  icon: string
  description: string
  baseSalary: number
  requiredSkills: StaffSkillType[]
  attributeBonus: {
    service?: number
    recommendation?: number
    skipRecovery?: number
    capacity?: number
  }
  unlockLevel: number
  maxCount: number
}

export type StaffAttributeType = 
  | 'professionalism' 
  | 'communication' 
  | 'patience' 
  | 'attention' 
  | 'creativity'

export interface StaffAttribute {
  type: StaffAttributeType
  name: string
  icon: string
  value: number
  maxValue: number
  description: string
}

export type StaffWorkShift = 'morning' | 'afternoon' | 'night' | 'full' | 'weekend'

export interface StaffShiftConfig {
  id: StaffWorkShift
  name: string
  icon: string
  timeSlots: TimeSlot[]
  salaryMultiplier: number
  description: string
  startHour: number
  endHour: number
}

export interface StaffSchedule {
  staffId: string
  dayOfWeek: number
  shiftId: StaffWorkShift
  isActive: boolean
}

export type StaffTrainingType = 
  | 'onboarding' 
  | 'service_etiquette' 
  | 'music_knowledge' 
  | 'sales_technique' 
  | 'repair_skill' 
  | 'management'

export interface StaffTrainingCourse {
  id: StaffTrainingType
  name: string
  icon: string
  description: string
  durationDays: number
  cost: number
  targetSkillType: StaffSkillType | null
  skillBonus: number
  attributeBoosts: { [K in StaffAttributeType]?: number }
  unlockLevel: number
  prerequisites: StaffTrainingType[]
}

export interface StaffTrainingProgress {
  courseId: StaffTrainingType
  progressDays: number
  totalDays: number
  isActive: boolean
  startDay: number | null
}

export type StaffRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface StaffRecruitCandidate {
  id: string
  name: string
  avatar: string
  position: StaffPosition
  rarity: StaffRarity
  baseAttributes: StaffAttribute[]
  potential: number
  interviewNote: string
  expectedSalary: number
  signingBonus: number
  skillBonuses: { [K in StaffSkillType]?: number }
  isLocked: boolean
  unlockReason?: string
}

export interface Employee {
  id: string
  name: string
  avatar: string
  position: StaffPosition
  rarity: StaffRarity
  hiredDay: number
  status: 'working' | 'training' | 'resting' | 'fired'
  attributes: StaffAttribute[]
  level: number
  experience: number
  nextLevelExp: number
  skills: StaffSkill[]
  currentTraining: StaffTrainingProgress | null
  completedTrainings: StaffTrainingType[]
  schedules: StaffSchedule[]
  performance: {
    totalSales: number
    customersServed: number
    avgSatisfaction: number
    daysWorked: number
  }
  satisfaction: number
  morale: number
  baseSalary: number
  lastRaiseDay: number | null
  notes: string
}

export interface StaffRevenueBonus {
  source: string
  description: string
  bonusType: 'revenue' | 'profit' | 'satisfaction' | 'reputation' | 'customer_count' | 'buy_chance'
  value: number
  percentage: number
  sourceId: string
}

export interface StaffBonusSummary {
  totalRevenueModifier: number
  totalProfitModifier: number
  totalSatisfactionBonus: number
  totalReputationBonus: number
  totalCustomerCountModifier: number
  totalBuyChanceBonus: number
  activeBonuses: StaffRevenueBonus[]
}

export interface SalaryComponent {
  type: 'base' | 'overtime' | 'performance' | 'bonus' | 'deduction'
  label: string
  amount: number
  description: string
}

export interface StaffSalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  periodStartDay: number
  periodEndDay: number
  settlementDay: number
  components: SalaryComponent[]
  totalAmount: number
  daysWorked: number
  performanceScore: number
  notes: string
}

export interface StaffSalarySummary {
  periodStartDay: number
  periodEndDay: number
  totalBaseSalary: number
  totalOvertimePay: number
  totalPerformancePay: number
  totalBonus: number
  totalDeduction: number
  totalPayout: number
  records: StaffSalaryRecord[]
}

export interface StaffManagementState {
  employees: Employee[]
  recruitPool: StaffRecruitCandidate[]
  lastRecruitRefreshDay: number
  recruitRefreshCooldown: number
  availableCourses: StaffTrainingCourse[]
  activeShifts: StaffShiftConfig[]
  positionConfigs: StaffPositionConfig[]
  bonusSummary: StaffBonusSummary
  salaryHistory: StaffSalaryRecord[]
  currentSalarySummary: StaffSalarySummary | null
  payrollDay: number
  maxEmployees: number
  totalHiringCost: number
  totalTrainingCost: number
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'error' | 'info'; read: boolean; createdAt: number }[]
}

export type SubscriptionBoxTier = 'basic' | 'standard' | 'premium' | 'elite'
export type SubscriptionBoxThemeType = 'genre_focus' | 'era_nostalgia' | 'artist_spotlight' | 'mood_vibe' | 'rare_treasure' | 'surprise_mystery'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'
export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'rejected'
export type ComplaintType = 'wrong_item' | 'damaged' | 'poor_quality' | 'bad_match' | 'late_delivery' | 'other'
export type BoxDeliveryStatus = 'preparing' | 'shipped' | 'delivered' | 'returned'

export interface SubscriptionBoxTheme {
  id: string
  type: SubscriptionBoxThemeType
  name: string
  icon: string
  description: string
  coreGenres: Genre[]
  bonusGenres: Genre[]
  rarityRange: [number, number]
  priceRange: [number, number]
  moodTagline: string
  color: string
  minLevel: number
  popularity: number
}

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionBoxTier
  name: string
  icon: string
  description: string
  monthlyPrice: number
  recordCount: number
  minRarity: number
  maxRarity: number
  priceDiscount: number
  satisfactionBonus: number
  reputationGain: number
  perks: string[]
  minLevel: number
  isPopular?: boolean
}

export interface SubscriberPreference {
  favoriteGenres: Genre[]
  preferredRarity: number[]
  priceRange: [number, number]
  preferredThemes: string[]
  dislikeGenres: Genre[]
  note: string
}

export interface Subscriber {
  id: string
  name: string
  avatar: string
  planId: string
  status: SubscriptionStatus
  preference: SubscriberPreference
  subscriptionStartDay: number
  subscriptionEndDay: number | null
  currentPeriodStart: number
  currentPeriodEnd: number
  boxesReceived: number
  totalSpent: number
  satisfaction: number
  memberLevel: MemberLevel | null
  isMember: boolean
  lastBoxRating: number | null
  consecutiveMonths: number
  autoRenew: boolean
  tier: SubscriptionBoxTier
}

export interface BoxRecordItem {
  record: Record
  conditionScore: number
  matchScore: number
  matchReason: string
  isSurprise: boolean
  estimatedValue: number
}

export interface MonthlyBox {
  id: string
  subscriberId: string
  subscriberName: string
  planId: string
  planTier: SubscriptionBoxTier
  theme: SubscriptionBoxTheme
  monthNumber: number
  deliveryDay: number
  status: BoxDeliveryStatus
  items: BoxRecordItem[]
  totalValue: number
  subscriberCost: number
  shopCost: number
  shopProfit: number
  rating: number | null
  feedback: string | null
  isAutoRenewed: boolean
  shippingDays: number
  trackingNumber: string
}

export interface Complaint {
  id: string
  subscriberId: string
  subscriberName: string
  subscriberAvatar: string
  boxId: string
  type: ComplaintType
  typeName: string
  typeIcon: string
  description: string
  status: ComplaintStatus
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt: number
  dayCreated: number
  resolvedAt: number | null
  dayResolved: number | null
  resolution: string | null
  refundAmount: number
  reputationLoss: number
  satisfactionLoss: number
  handledBy: string | null
  responseDeadline: number
}

export interface SubscriptionBoxStats {
  totalSubscribers: number
  activeSubscribers: number
  byTier: { [key in SubscriptionBoxTier]: number }
  totalRevenue: number
  totalProfit: number
  monthlyRevenue: number
  avgSatisfaction: number
  churnRate: number
  totalBoxesShipped: number
  avgMatchScore: number
  pendingComplaints: number
  resolvedComplaints: number
  complaintResolutionRate: number
  avgRating: number
  renewRate: number
  topTheme: string | null
}

export interface SubscriptionBoxGameState {
  themes: SubscriptionBoxTheme[]
  plans: SubscriptionPlan[]
  subscribers: Subscriber[]
  boxes: MonthlyBox[]
  complaints: Complaint[]
  stats: SubscriptionBoxStats
  isSubscriptionServiceActive: boolean
  nextShipmentDay: number
  selectedSubscriberId: string | null
  selectedTab: 'subscribers' | 'boxes' | 'themes' | 'complaints' | 'plans'
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'error' | 'info'; read: boolean; createdAt: number }[]
  lastProcessDay: number
  totalSubscriptionProfit: number
}

export interface BoxPreparationResult {
  success: boolean
  message: string
  box?: MonthlyBox
  cost?: number
}

export interface SubscriptionSignupResult {
  success: boolean
  message: string
  subscriber?: Subscriber
  cost?: number
}

export interface ComplaintHandleResult {
  success: boolean
  message: string
  complaint?: Complaint
  refundAmount?: number
  reputationChange?: number
}

export type PriceIndexTrend = 'rising' | 'stable' | 'falling'

export interface GenrePriceIndex {
  genre: Genre
  currentIndex: number
  previousIndex: number
  changePercent: number
  trend: PriceIndexTrend
  trendStrength: number
  avgMarketPrice: number
  avgCostPrice: number
  profitMargin: number
  volatility: number
  weeklyHistory: number[]
}

export interface RareRecordFluctuation {
  recordId: string
  record: Record
  currentPrice: number
  previousPrice: number
  priceChange: number
  changePercent: number
  trend: PriceIndexTrend
  trendStrength: number
  rarity: number
  demandLevel: 'low' | 'medium' | 'high' | 'critical'
  volatility: number
  lastSaleDate: number | null
  totalSalesCount: number
  priceHistory: { day: number; price: number }[]
  collectorInterest: number
  predictedNextPrice: number
}

export interface PurchaseRecommendation {
  id: string
  record: Record
  supplierId: string
  supplierName: string
  adjustedCostPrice: number
  marketPrice: number
  expectedProfit: number
  profitMargin: number
  riskLevel: 'low' | 'medium' | 'high'
  priorityScore: number
  demandModifier: number
  marketHeatValue: number
  marketTrend: MarketHeatTrend
  reason: string
  matchWithInventory: boolean
  rarityBonus: number
  genreHeatBonus: number
  isHotPick: boolean
  isUndervalued: boolean
  turnoverEstimate: number
}

export interface MarketInsight {
  id: string
  category: 'opportunity' | 'warning' | 'trend' | 'tip'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  icon: string
  genre?: Genre
  relatedRecordId?: string
  action?: string
  impactDescription: string
}

export interface MarketCenterSummary {
  hottestGenre: Genre
  coldestGenre: Genre
  overallMarketIndex: number
  overallPriceChange: number
  rareRecordIndex: number
  rareRecordPriceChange: number
  bestSellingRarity: number
  avgProfitMargin: number
  topOpportunities: PurchaseRecommendation[]
  marketInsights: MarketInsight[]
}

export interface PriceIndexHistoryPoint {
  day: number
  overallIndex: number
  genreIndices: Map<Genre, number>
}

export type CrossShopTradeStatus = 'proposed' | 'negotiating' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired'
export type CrossShopTradeType = 'record_for_record' | 'record_for_cash' | 'mixed'
export type CrossShopShopType = 'antique' | 'modern' | 'specialist' | 'chain' | 'boutique'

export interface CrossShopShop {
  id: string
  name: string
  type: CrossShopShopType
  typeName: string
  icon: string
  avatar: string
  description: string
  reputation: number
  preferredGenres: Genre[]
  preferredRarities: number[]
  tradeStyle: 'generous' | 'fair' | 'tough' | 'shrewd'
  trustLevel: number
  minLevel: number
  isUnlocked: boolean
  lastTradeDay: number | null
  totalTradesCompleted: number
  address: string
  ownerName: string
  ownerQuote: string
}

export interface CrossShopTradeItem {
  recordId: string
  record: Record
  quantity: number
  conditionScore: number
  agreedValue: number
  source: 'player' | 'shop'
}

export interface CrossShopValuation {
  recordId: string
  record: Record
  conditionScore: number
  baseMarketValue: number
  rarityMultiplier: number
  conditionMultiplier: number
  genreHeatMultiplier: number
  shopPreferenceMultiplier: number
  finalEstimatedValue: number
  valuationBreakdown: {
    label: string
    value: number
    percent: number
  }[]
  confidence: 'low' | 'medium' | 'high'
  shopCounterRange: [number, number]
}

export interface CrossShopNegotiationRound {
  round: number
  side: 'player' | 'shop'
  proposedItems: CrossShopTradeItem[]
  proposedCash: number
  message: string
  reaction?: 'excited' | 'happy' | 'neutral' | 'hesitant' | 'unhappy'
  timestamp: number
}

export interface CrossShopTrade {
  id: string
  shopId: string
  shop: CrossShopShop
  type: CrossShopTradeType
  status: CrossShopTradeStatus
  playerItems: CrossShopTradeItem[]
  shopItems: CrossShopTradeItem[]
  cashFromPlayer: number
  cashFromShop: number
  currentRound: number
  maxRounds: number
  rounds: CrossShopNegotiationRound[]
  createdAt: number
  createdDay: number
  expiresInDays: number
  expiryDay: number
  completedAt: number | null
  completedDay: number | null
  playerSatisfaction: number | null
  reputationChange: number
  encyclopediaProgressGained: string[]
  notes: string
}

export interface CrossShopInventoryItem {
  record: Record
  quantity: number
  conditionScore: number
  minimumAcceptValue: number
  isWillingToTrade: boolean
  tradePriority: number
  shopPreferenceNote: string
}

export interface CrossShopStats {
  totalTradesProposed: number
  totalTradesAccepted: number
  totalTradesRejected: number
  totalTradesCompleted: number
  totalRecordsReceived: number
  totalRecordsGiven: number
  totalCashEarned: number
  totalCashSpent: number
  totalReputationGained: number
  totalReputationLost: number
  successfulTradeRate: number
  avgNegotiationRounds: number
  favoriteTradingPartner: string | null
  mostTradedGenre: Genre | null
  newEncyclopediaEntriesFromTrading: number
  seriesUnlockedViaTrading: number
}

export interface CrossShopGameState {
  shops: CrossShopShop[]
  activeTrades: CrossShopTrade[]
  completedTrades: CrossShopTrade[]
  stats: CrossShopStats
  nextShopRefresh: number
  selectedShopId: string | null
  selectedTradeId: string | null
  tradeFilter: 'all' | 'active' | 'completed' | 'received' | 'proposed'
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'error' | 'info'; read: boolean; createdAt: number }[]
}

export interface CrossShopValuationResult {
  valuations: CrossShopValuation[]
  totalEstimatedValue: number
  totalBaseValue: number
  averageConfidence: 'low' | 'medium' | 'high'
}

export interface CrossShopTradeCreateResult {
  success: boolean
  message: string
  trade?: CrossShopTrade
}

export interface CrossShopNegotiationResult {
  success: boolean
  message: string
  trade?: CrossShopTrade
  shopCounterOffer?: CrossShopNegotiationRound
  isAccepted?: boolean
  isRejected?: boolean
}

export interface CrossShopTradeCompleteResult {
  success: boolean
  message: string
  trade?: CrossShopTrade
  itemsReceived?: CrossShopTradeItem[]
  cashReceived?: number
  itemsGiven?: CrossShopTradeItem[]
  cashGiven?: number
  reputationChange?: number
  encyclopediaUpdates?: { recordId: string; wasNew: boolean; bestCondition: number }[]
  seriesProgress?: { seriesId: string; progress: number; target: number; isCompleted: boolean }[]
}

