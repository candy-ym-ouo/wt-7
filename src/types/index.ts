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

export interface CollectionItem {
  record: Record
  acquiredDate: number
  purchasePrice: number
  isFavorite: boolean
  notes: string
  conditionScore: number
  collectionValue: number
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

export type CollectionBonusSource = 'album' | 'favorite' | 'high_value'

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
}
