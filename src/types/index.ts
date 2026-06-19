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
}

export type Genre = 'Jazz' | 'Rock' | 'Soul' | 'Funk' | 'Disco' | 'Classical' | 'Blues' | 'Pop' | 'Electronic' | 'Folk'

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

export interface Customer {
  id: string
  name: string
  avatar: string
  preference: CustomerPreference
  budget: number
  patience: number
  satisfaction: number
  memberProfile: MemberProfile | null
  isReturningCustomer: boolean
  memberDiscount: number
  bargainAggressiveness: number
  bargainToughness: number
  willBargain: boolean
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
  totalReward: number
  reputationBonus: number
  unlockedBonus: string[]
  wordOfMouthBonus: number
  evaluation: LevelEvaluation | null
}

export type SupplierType = 'wholesaler' | 'specialist' | 'collector' | 'importer' | 'discount'

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
}
