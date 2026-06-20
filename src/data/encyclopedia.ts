import type {
  EncyclopediaRarityConfig,
  EncyclopediaRarityTier,
  EncyclopediaCategory,
  EncyclopediaSeries,
  EncyclopediaAchievement,
  EncyclopediaMilestone,
  EncyclopediaEntry,
  EncyclopediaStats,
  EncyclopediaState,
  CollectionItem,
  Record,
  AlbumBonus,
  AlbumBonusType,
  Genre
} from '@/types'
import { allRecords } from './records'


const createBonus = (type: AlbumBonusType, value: number, description: string): AlbumBonus => ({
  type,
  value,
  description
})

export const rarityConfigs: EncyclopediaRarityConfig[] = [
  {
    tier: 'common',
    tierName: '普通',
    icon: '⚪',
    color: '#9CA3AF',
    minRarity: 1,
    maxRarity: 1,
    glowIntensity: 0,
    description: '随处可见的普通唱片'
  },
  {
    tier: 'uncommon',
    tierName: '优质',
    icon: '🟢',
    color: '#10B981',
    minRarity: 2,
    maxRarity: 2,
    glowIntensity: 2,
    description: '略有收藏价值的唱片'
  },
  {
    tier: 'rare',
    tierName: '稀有',
    icon: '🔵',
    color: '#3B82F6',
    minRarity: 3,
    maxRarity: 3,
    glowIntensity: 4,
    description: '较为稀有的唱片，值得收藏'
  },
  {
    tier: 'epic',
    tierName: '史诗',
    icon: '🟣',
    color: '#8B5CF6',
    minRarity: 4,
    maxRarity: 4,
    glowIntensity: 6,
    description: '非常稀有的唱片，收藏家的追求'
  },
  {
    tier: 'legendary',
    tierName: '传说',
    icon: '🟡',
    color: '#F59E0B',
    minRarity: 5,
    maxRarity: 5,
    glowIntensity: 10,
    description: '传说级的稀世珍品，无价之宝'
  }
]

export const getRarityConfig = (rarity: number): EncyclopediaRarityConfig => {
  return rarityConfigs.find(r => rarity >= r.minRarity && rarity <= r.maxRarity) || rarityConfigs[0]
}

export const getRarityTier = (rarity: number): EncyclopediaRarityTier => {
  return getRarityConfig(rarity).tier
}

export const getRarityColor = (rarity: number): string => {
  return getRarityConfig(rarity).color
}

const jazzSeries: EncyclopediaSeries[] = [
  {
    id: 'series-jazz-miles',
    name: 'Miles Davis 全集',
    description: '收藏 Miles Davis 的所有经典专辑',
    icon: '🎺',
    type: 'artist',
    coverColor: '#1a365d',
    requiredRecordIds: ['rec-001', 'rec-021'],
    requiredMinCondition: 80,
    requiredMinRarity: 4,
    unlockLevel: 1,
    rewards: [
      createBonus('reputation', 10, '声望 +10'),
      createBonus('special_customer', 0.15, '爵士收藏家出现 +15%')
    ],
    isUnlocked: true,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'series-jazz-coltrane',
    name: 'Coltrane 传奇',
    description: '收集 John Coltrane 的杰作',
    icon: '🎷',
    type: 'artist',
    coverColor: '#2d3748',
    requiredRecordIds: ['rec-002', 'rec-021'],
    requiredMinCondition: 85,
    requiredMinRarity: 4,
    unlockLevel: 2,
    rewards: [
      createBonus('match_score', 8, '匹配度 +8'),
      createBonus('customer_budget', 0.12, '顾客预算 +12%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

const rockSeries: EncyclopediaSeries[] = [
  {
    id: 'series-rock-classic',
    name: '摇滚经典三部曲',
    description: '集齐 Pink Floyd、Led Zeppelin、The Beatles 的代表作',
    icon: '🎸',
    type: 'theme',
    coverColor: '#000000',
    requiredRecordIds: ['rec-003', 'rec-004', 'rec-022'],
    requiredMinCondition: 75,
    requiredMinRarity: 4,
    unlockLevel: 1,
    rewards: [
      createBonus('reputation', 12, '声望 +12'),
      createBonus('buy_chance', 0.08, '购买概率 +8%')
    ],
    isUnlocked: true,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'series-rock-grunge',
    name: 'Grunge 时代',
    description: '收藏 Nirvana 等 Grunge 代表专辑',
    icon: '🤘',
    type: 'theme',
    coverColor: '#3182ce',
    requiredRecordIds: ['rec-023'],
    requiredMinCondition: 70,
    requiredMinRarity: 3,
    unlockLevel: 3,
    rewards: [
      createBonus('level_reward', 0.1, '关卡奖励 +10%'),
      createBonus('record_unlock', 0.05, '稀有唱片 +5%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

const soulSeries: EncyclopediaSeries[] = [
  {
    id: 'series-soul-legends',
    name: '灵魂乐传奇',
    description: '收集 Marvin Gaye 和 Stevie Wonder 的经典',
    icon: '🎤',
    type: 'artist',
    coverColor: '#2c5282',
    requiredRecordIds: ['rec-005', 'rec-006'],
    requiredMinCondition: 80,
    requiredMinRarity: 4,
    unlockLevel: 2,
    rewards: [
      createBonus('customer_budget', 0.15, '顾客预算 +15%'),
      createBonus('reputation', 8, '声望 +8')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

const popSeries: EncyclopediaSeries[] = [
  {
    id: 'series-pop-kings',
    name: '流行天王',
    description: 'Michael Jackson 和 Prince 的完美收藏',
    icon: '👑',
    type: 'artist',
    coverColor: '#553c9a',
    requiredRecordIds: ['rec-015', 'rec-016', 'rec-024'],
    requiredMinCondition: 85,
    requiredMinRarity: 4,
    unlockLevel: 2,
    rewards: [
      createBonus('price_bonus', 0.15, '售价加成 +15%'),
      createBonus('level_reward', 0.15, '关卡奖励 +15%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

const decadeSeries: EncyclopediaSeries[] = [
  {
    id: 'series-60s',
    name: '60年代黄金期',
    description: '收藏1960年代的经典专辑',
    icon: '🕐',
    type: 'decade',
    coverColor: '#4a5568',
    requiredRecordIds: ['rec-002', 'rec-011', 'rec-013', 'rec-019', 'rec-021'],
    requiredMinCondition: 70,
    requiredMinRarity: 3,
    unlockLevel: 3,
    rewards: [
      createBonus('reputation', 15, '声望 +15'),
      createBonus('match_score', 10, '匹配度 +10')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'series-70s',
    name: '70年代璀璨',
    description: '1970年代的音乐瑰宝',
    icon: '🕑',
    type: 'decade',
    coverColor: '#744210',
    requiredRecordIds: ['rec-001', 'rec-003', 'rec-004', 'rec-005', 'rec-006', 'rec-007', 'rec-008', 'rec-009', 'rec-010', 'rec-014', 'rec-020', 'rec-022'],
    requiredMinCondition: 70,
    requiredMinRarity: 3,
    unlockLevel: 4,
    rewards: [
      createBonus('customer_budget', 0.2, '顾客预算 +20%'),
      createBonus('buy_chance', 0.1, '购买概率 +10%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

const rareSeries: EncyclopediaSeries[] = [
  {
    id: 'series-legendary',
    name: '传说级收藏',
    description: '收集所有5星传说级唱片',
    icon: '💎',
    type: 'special',
    coverColor: '#f6e05e',
    requiredRecordIds: ['rec-001', 'rec-003', 'rec-005', 'rec-013', 'rec-016', 'rec-018', 'rec-019', 'rec-021', 'rec-022'],
    requiredMinCondition: 90,
    requiredMinRarity: 5,
    unlockLevel: 5,
    rewards: [
      createBonus('reputation', 30, '声望 +30'),
      createBonus('special_customer', 0.3, '特殊顾客 +30%'),
      createBonus('price_bonus', 0.25, '售价加成 +25%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'series-perfect',
    name: '完美品相',
    description: '收集品相95分以上的完美唱片',
    icon: '✨',
    type: 'special',
    coverColor: '#e53e3e',
    requiredRecordIds: ['rec-005', 'rec-012', 'rec-016', 'rec-017', 'rec-021'],
    requiredMinCondition: 95,
    requiredMinRarity: 3,
    unlockLevel: 3,
    rewards: [
      createBonus('reputation', 20, '声望 +20'),
      createBonus('price_bonus', 0.15, '售价加成 +15%')
    ],
    isUnlocked: false,
    isCompleted: false,
    completedDate: null,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

export const encyclopediaCategories: EncyclopediaCategory[] = [
  {
    id: 'cat-jazz',
    name: '爵士乐馆',
    description: '爵士乐的历史长河与大师作品',
    icon: '🎷',
    coverColor: '#1a365d',
    genre: 'Jazz',
    series: jazzSeries,
    unlockLevel: 1,
    isUnlocked: true
  },
  {
    id: 'cat-rock',
    name: '摇滚殿堂',
    description: '摇滚音乐的革命与传奇',
    icon: '🎸',
    coverColor: '#000000',
    genre: 'Rock',
    series: rockSeries,
    unlockLevel: 1,
    isUnlocked: true
  },
  {
    id: 'cat-soul',
    name: '灵魂工坊',
    description: '灵魂乐与放克的律动世界',
    icon: '💃',
    coverColor: '#2c5282',
    genre: 'Soul',
    series: soulSeries,
    unlockLevel: 2,
    isUnlocked: false
  },
  {
    id: 'cat-pop',
    name: '流行之星',
    description: '流行音乐的璀璨明星',
    icon: '👑',
    coverColor: '#553c9a',
    genre: 'Pop',
    series: popSeries,
    unlockLevel: 2,
    isUnlocked: false
  },
  {
    id: 'cat-decade',
    name: '年代回廊',
    description: '按年代探索音乐史',
    icon: '📅',
    coverColor: '#4a5568',
    genre: 'all',
    series: decadeSeries,
    unlockLevel: 3,
    isUnlocked: false
  },
  {
    id: 'cat-rare',
    name: '珍稀典藏',
    description: '稀世珍品与完美收藏',
    icon: '💎',
    coverColor: '#f6e05e',
    genre: 'all',
    series: rareSeries,
    unlockLevel: 3,
    isUnlocked: false
  }
]

export const encyclopediaAchievements: EncyclopediaAchievement[] = [
  {
    id: 'ach-first-collection',
    name: '初入收藏',
    description: '获得第一张收藏唱片',
    icon: '💿',
    category: 'collection',
    progressType: 'count',
    target: 1,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [createBonus('reputation', 3, '声望 +3')],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-collector-10',
    name: '初级收藏家',
    description: '收集10张唱片',
    icon: '📚',
    category: 'collection',
    progressType: 'count',
    target: 10,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [createBonus('reputation', 8, '声望 +8')],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-collector-25',
    name: '资深收藏家',
    description: '收集25张唱片',
    icon: '🏛️',
    category: 'collection',
    progressType: 'count',
    target: 25,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('reputation', 15, '声望 +15'),
      createBonus('customer_budget', 0.05, '顾客预算 +5%')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-rare-hunter',
    name: '稀有猎人',
    description: '收集5张4星以上稀有唱片',
    icon: '🔍',
    category: 'rarity',
    progressType: 'count',
    target: 5,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('record_unlock', 0.08, '稀有唱片 +8%'),
      createBonus('reputation', 10, '声望 +10')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-legendary-finder',
    name: '传说发现者',
    description: '收集第一张传说级唱片',
    icon: '🌟',
    category: 'rarity',
    progressType: 'count',
    target: 1,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('reputation', 12, '声望 +12'),
      createBonus('special_customer', 0.1, '特殊顾客 +10%')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-perfectionist',
    name: '完美主义者',
    description: '获得一张品相95分以上的唱片',
    icon: '✨',
    category: 'condition',
    progressType: 'count',
    target: 1,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('price_bonus', 0.08, '售价加成 +8%'),
      createBonus('reputation', 8, '声望 +8')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-series-master',
    name: '套系大师',
    description: '完成3个套系收集',
    icon: '🏆',
    category: 'series',
    progressType: 'count',
    target: 3,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('level_reward', 0.15, '关卡奖励 +15%'),
      createBonus('reputation', 20, '声望 +20')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'ach-value-5000',
    name: '价值连城',
    description: '收藏总价值达到¥5000',
    icon: '💰',
    category: 'special',
    progressType: 'count',
    target: 5000,
    current: 0,
    isUnlocked: false,
    unlockedDate: null,
    rewards: [
      createBonus('customer_budget', 0.1, '顾客预算 +10%'),
      createBonus('reputation', 10, '声望 +10')
    ],
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

export const encyclopediaMilestones: EncyclopediaMilestone[] = [
  {
    id: 'mile-collect-5',
    name: '收藏起步',
    description: '收集5张唱片',
    icon: '📀',
    target: 5,
    metric: 'total_collected',
    rewards: [createBonus('reputation', 5, '声望 +5')],
    isCompleted: false,
    isClaimed: false,
    claimedDate: null
  },
  {
    id: 'mile-collect-15',
    name: '小有收藏',
    description: '收集15张唱片',
    icon: '💿',
    target: 15,
    metric: 'total_collected',
    rewards: [
      createBonus('reputation', 10, '声望 +10'),
      createBonus('match_score', 3, '匹配度 +3')
    ],
    isCompleted: false,
    isClaimed: false,
    claimedDate: null
  },
  {
    id: 'mile-value-10000',
    name: '万金收藏',
    description: '收藏总价值达到¥10,000',
    icon: '💎',
    target: 10000,
    metric: 'total_value',
    rewards: [
      createBonus('customer_budget', 0.1, '顾客预算 +10%'),
      createBonus('reputation', 12, '声望 +12')
    ],
    isCompleted: false,
    isClaimed: false,
    claimedDate: null
  },
  {
    id: 'mile-rare-3',
    name: '稀有三星',
    description: '收集3张4星以上稀有唱片',
    icon: '⭐',
    target: 3,
    metric: 'rare_count',
    rewards: [
      createBonus('record_unlock', 0.05, '稀有唱片 +5%'),
      createBonus('reputation', 8, '声望 +8')
    ],
    isCompleted: false,
    isClaimed: false,
    claimedDate: null
  },
  {
    id: 'mile-series-2',
    name: '双套达人',
    description: '完成2个套系',
    icon: '🎯',
    target: 2,
    metric: 'series_completed',
    rewards: [
      createBonus('level_reward', 0.08, '关卡奖励 +8%'),
      createBonus('reputation', 10, '声望 +10')
    ],
    isCompleted: false,
    isClaimed: false,
    claimedDate: null
  }
]

export const createInitialEncyclopediaEntries = (): EncyclopediaEntry[] => {
  return allRecords.map(record => ({
    record,
    isCollected: false,
    firstCollectedDate: null,
    collectedCount: 0,
    bestConditionScore: 0,
    totalSaleRevenue: 0,
    totalSalesCount: 0,
    isFavorite: false,
    seriesMemberships: getRecordSeriesMemberships(record.id),
    rarityTier: getRarityTier(record.rarity)
  }))
}

const getRecordSeriesMemberships = (recordId: string): string[] => {
  const memberships: string[] = []
  for (const category of encyclopediaCategories) {
    for (const series of category.series) {
      if (series.requiredRecordIds.includes(recordId)) {
        memberships.push(series.id)
      }
    }
  }
  return memberships
}

export const createInitialEncyclopediaStats = (): EncyclopediaStats => ({
  totalRecords: allRecords.length,
  collectedRecords: 0,
  totalSeries: encyclopediaCategories.reduce((sum, cat) => sum + cat.series.length, 0),
  completedSeries: 0,
  totalAchievements: encyclopediaAchievements.length,
  unlockedAchievements: 0,
  totalRarityScore: 0,
  avgConditionScore: 0,
  totalCollectionValue: 0,
  rareRecordsCount: 0,
  perfectRecordsCount: 0,
  collectionProgress: 0
})

export const createInitialEncyclopediaState = (): EncyclopediaState => ({
  categories: JSON.parse(JSON.stringify(encyclopediaCategories)),
  achievements: JSON.parse(JSON.stringify(encyclopediaAchievements)),
  milestones: JSON.parse(JSON.stringify(encyclopediaMilestones)),
  rewards: [],
  entries: createInitialEncyclopediaEntries(),
  stats: createInitialEncyclopediaStats(),
  unlockedCategories: ['cat-jazz', 'cat-rock'],
  newlyUnlockedSeries: [],
  newlyUnlockedAchievements: [],
  newlyClaimableRewards: []
})

export const checkSeriesCompletion = (
  series: EncyclopediaSeries,
  collection: CollectionItem[]
): boolean => {
  if (series.isCompleted) return true
  
  return series.requiredRecordIds.every(recordId => {
    const item = collection.find(c => c.record.id === recordId)
    if (!item) return false
    
    const meetsCondition = series.requiredMinCondition 
      ? item.conditionScore >= series.requiredMinCondition 
      : true
    const meetsRarity = series.requiredMinRarity
      ? item.record.rarity >= series.requiredMinRarity
      : true
    
    return meetsCondition && meetsRarity
  })
}

export const getSeriesProgress = (
  series: EncyclopediaSeries,
  collection: CollectionItem[]
): number => {
  const total = series.requiredRecordIds.length
  const collected = series.requiredRecordIds.filter(recordId => {
    const item = collection.find(c => c.record.id === recordId)
    if (!item) return false
    
    const meetsCondition = series.requiredMinCondition 
      ? item.conditionScore >= series.requiredMinCondition 
      : true
    const meetsRarity = series.requiredMinRarity
      ? item.record.rarity >= series.requiredMinRarity
      : true
    
    return meetsCondition && meetsRarity
  }).length
  
  return Math.round((collected / total) * 100)
}

export const checkAchievementProgress = (
  achievement: EncyclopediaAchievement,
  state: EncyclopediaState,
  collection: CollectionItem[]
): number => {
  switch (achievement.category) {
    case 'collection':
      return collection.length
    case 'rarity':
      return collection.filter(c => c.record.rarity >= 4).length
    case 'condition':
      return collection.filter(c => c.conditionScore >= 95).length
    case 'series':
      return state.categories.reduce((sum, cat) => 
        sum + cat.series.filter(s => s.isCompleted).length, 0
      )
    case 'special':
      if (achievement.id === 'ach-value-5000') {
        return Math.round(collection.reduce((sum, c) => sum + c.collectionValue, 0))
      }
      return 0
    default:
      return 0
  }
}

export const checkMilestoneProgress = (
  milestone: EncyclopediaMilestone,
  state: EncyclopediaState,
  collection: CollectionItem[]
): number => {
  switch (milestone.metric) {
    case 'total_collected':
      return collection.length
    case 'total_value':
      return Math.round(collection.reduce((sum, c) => sum + c.collectionValue, 0))
    case 'rare_count':
      return collection.filter(c => c.record.rarity >= 4).length
    case 'perfect_count':
      return collection.filter(c => c.conditionScore >= 95).length
    case 'series_completed':
      return state.categories.reduce((sum, cat) => 
        sum + cat.series.filter(s => s.isCompleted).length, 0
      )
    default:
      return 0
  }
}

export const updateEncyclopediaOnCollectionAdd = (
  state: EncyclopediaState,
  item: CollectionItem,
  currentLevel: number
): { 
  updatedState: EncyclopediaState
  newUnlocks: { series: string[], achievements: string[] }
} => {
  const newState = JSON.parse(JSON.stringify(state)) as EncyclopediaState
  const newUnlocks: { series: string[], achievements: string[] } = { series: [], achievements: [] }
  
  const entryIndex = newState.entries.findIndex(e => e.record.id === item.record.id)
  if (entryIndex !== -1) {
    const entry = newState.entries[entryIndex]
    if (!entry.isCollected) {
      entry.isCollected = true
      entry.firstCollectedDate = Date.now()
    }
    entry.collectedCount++
    entry.bestConditionScore = Math.max(entry.bestConditionScore, item.conditionScore)
    entry.isFavorite = item.isFavorite || entry.isFavorite
  }
  
  for (const category of newState.categories) {
    if (!category.isUnlocked && category.unlockLevel <= currentLevel) {
      category.isUnlocked = true
      if (!newState.unlockedCategories.includes(category.id)) {
        newState.unlockedCategories.push(category.id)
      }
    }
    
    for (const series of category.series) {
      if (!series.isUnlocked && series.unlockLevel && series.unlockLevel <= currentLevel) {
        series.isUnlocked = true
      }
      
      if (series.isUnlocked && !series.isCompleted) {
        const isComplete = checkSeriesCompletion(series, [item, ...getCurrentCollection(newState)])
        if (isComplete) {
          series.isCompleted = true
          series.completedDate = Date.now()
          newUnlocks.series.push(series.id)
          newState.newlyUnlockedSeries.push(series.id)
        }
      }
    }
  }
  
  const currentCollection = getCurrentCollection(newState)
  for (const achievement of newState.achievements) {
    if (!achievement.isUnlocked) {
      const progress = checkAchievementProgress(achievement, newState, currentCollection)
      achievement.current = progress
      if (progress >= achievement.target) {
        achievement.isUnlocked = true
        achievement.unlockedDate = Date.now()
        newUnlocks.achievements.push(achievement.id)
        newState.newlyUnlockedAchievements.push(achievement.id)
      }
    }
  }
  
  for (const milestone of newState.milestones) {
    if (!milestone.isCompleted) {
      const progress = checkMilestoneProgress(milestone, newState, currentCollection)
      if (progress >= milestone.target) {
        milestone.isCompleted = true
      }
    }
  }
  
  newState.stats = recalculateStats(newState)
  
  return { updatedState: newState, newUnlocks }
}

const getCurrentCollection = (state: EncyclopediaState): CollectionItem[] => {
  return state.entries
    .filter(e => e.isCollected)
    .map(e => ({
      record: e.record,
      acquiredDate: e.firstCollectedDate || Date.now(),
      purchasePrice: e.record.costPrice,
      isFavorite: e.isFavorite,
      notes: '',
      conditionScore: e.bestConditionScore,
      collectionValue: e.record.marketPrice,
      extended: {
        story: null,
        achievements: [],
        source: null,
        displayCopy: null,
        saleHistory: [],
        clearHistory: [],
        daysOwned: 0,
        timesRenovated: 0,
        totalSaleRevenue: e.totalSaleRevenue,
        totalSalesCount: e.totalSalesCount,
        isStoryUnlocked: false,
        unlockedAchievementCount: 0
      }
    }))
}

const recalculateStats = (state: EncyclopediaState): EncyclopediaStats => {
  const collected = state.entries.filter(e => e.isCollected)
  const totalValue = collected.reduce((sum, e) => sum + e.record.marketPrice, 0)
  const rareCount = collected.filter(e => e.record.rarity >= 4).length
  const perfectCount = collected.filter(e => e.bestConditionScore >= 95).length
  const totalRarityScore = collected.reduce((sum, e) => sum + e.record.rarity, 0)
  const avgCondition = collected.length > 0 
    ? Math.round(collected.reduce((sum, e) => sum + e.bestConditionScore, 0) / collected.length)
    : 0
  const completedSeries = state.categories.reduce((sum, cat) => 
    sum + cat.series.filter(s => s.isCompleted).length, 0
  )
  const unlockedAchievements = state.achievements.filter(a => a.isUnlocked).length
  
  return {
    totalRecords: state.entries.length,
    collectedRecords: collected.length,
    totalSeries: state.categories.reduce((sum, cat) => sum + cat.series.length, 0),
    completedSeries,
    totalAchievements: state.achievements.length,
    unlockedAchievements,
    totalRarityScore,
    avgConditionScore: avgCondition,
    totalCollectionValue: totalValue,
    rareRecordsCount: rareCount,
    perfectRecordsCount: perfectCount,
    collectionProgress: Math.round((collected.length / state.entries.length) * 100)
  }
}

export const claimSeriesReward = (
  state: EncyclopediaState,
  seriesId: string
): { success: boolean; message: string; rewards: AlbumBonus[] } => {
  for (const category of state.categories) {
    const series = category.series.find(s => s.id === seriesId)
    if (series) {
      if (!series.isCompleted) {
        return { success: false, message: '套系尚未完成', rewards: [] }
      }
      if (series.rewardClaimed) {
        return { success: false, message: '奖励已领取', rewards: [] }
      }
      
      series.rewardClaimed = true
      series.rewardClaimedDate = Date.now()
      
      return { 
        success: true, 
        message: `成功领取「${series.name}」奖励！`, 
        rewards: series.rewards 
      }
    }
  }
  
  return { success: false, message: '套系不存在', rewards: [] }
}

export const claimAchievementReward = (
  state: EncyclopediaState,
  achievementId: string
): { success: boolean; message: string; rewards: AlbumBonus[] } => {
  const achievement = state.achievements.find(a => a.id === achievementId)
  if (!achievement) {
    return { success: false, message: '成就不存在', rewards: [] }
  }
  if (!achievement.isUnlocked) {
    return { success: false, message: '成就尚未解锁', rewards: [] }
  }
  if (achievement.rewardClaimed) {
    return { success: false, message: '奖励已领取', rewards: [] }
  }
  
  achievement.rewardClaimed = true
  achievement.rewardClaimedDate = Date.now()
  
  return { 
    success: true, 
    message: `成功领取「${achievement.name}」奖励！`, 
    rewards: achievement.rewards 
  }
}

export const claimMilestoneReward = (
  state: EncyclopediaState,
  milestoneId: string
): { success: boolean; message: string; rewards: AlbumBonus[] } => {
  const milestone = state.milestones.find(m => m.id === milestoneId)
  if (!milestone) {
    return { success: false, message: '里程碑不存在', rewards: [] }
  }
  if (!milestone.isCompleted) {
    return { success: false, message: '里程碑尚未完成', rewards: [] }
  }
  if (milestone.isClaimed) {
    return { success: false, message: '奖励已领取', rewards: [] }
  }
  
  milestone.isClaimed = true
  milestone.claimedDate = Date.now()
  
  return { 
    success: true, 
    message: `成功领取「${milestone.name}」奖励！`, 
    rewards: milestone.rewards 
  }
}

export const getRecordsByGenre = (genre: Genre | 'all'): Record[] => {
  if (genre === 'all') return allRecords
  return allRecords.filter(r => r.genre === genre)
}
