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
