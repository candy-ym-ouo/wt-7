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
}
