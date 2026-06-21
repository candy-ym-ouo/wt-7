import type {
  BusinessAchievementConfig,
  BusinessTitleConfig,
  BusinessAchievementCategory,
  BusinessAchievementRarity,
  AchievementProgressUpdateType,
  BusinessAchievementState
} from '@/types'

export const achievementCategories: { id: BusinessAchievementCategory; name: string; icon: string; description: string }[] = [
  { id: 'sales', name: '销售达人', icon: '📦', description: '与唱片销售数量相关的成就' },
  { id: 'profit', name: '利润之王', icon: '💰', description: '与经营利润相关的成就' },
  { id: 'collection', name: '收藏大师', icon: '📚', description: '与唱片收藏相关的成就' },
  { id: 'satisfaction', name: '服务之星', icon: '😊', description: '与顾客满意度相关的成就' },
  { id: 'level', name: '关卡挑战', icon: '🏆', description: '与关卡通关相关的成就' },
  { id: 'special', name: '特殊成就', icon: '✨', description: '稀有且独特的成就' }
]

export const businessAchievements: BusinessAchievementConfig[] = [
  {
    id: 'first_sale',
    name: '初次开张',
    icon: '🎯',
    description: '完成第一笔唱片销售',
    category: 'sales',
    rarity: 'common',
    target: 1,
    progressType: 'count',
    reward: { budget: 100, reputation: 5 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'sales_10',
    name: '小有起色',
    icon: '📈',
    description: '累计销售10张唱片',
    category: 'sales',
    rarity: 'common',
    target: 10,
    progressType: 'count',
    reward: { budget: 200, reputation: 10 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'sales_50',
    name: '销售能手',
    icon: '🏪',
    description: '累计销售50张唱片',
    category: 'sales',
    rarity: 'rare',
    target: 50,
    progressType: 'count',
    reward: { budget: 500, reputation: 20, growthPoints: 50 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'sales_100',
    name: '百张达人',
    icon: '💯',
    description: '累计销售100张唱片',
    category: 'sales',
    rarity: 'epic',
    target: 100,
    progressType: 'count',
    reward: { budget: 1000, reputation: 35, growthPoints: 100 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'sales_500',
    name: '唱片大亨',
    icon: '👑',
    description: '累计销售500张唱片',
    category: 'sales',
    rarity: 'legendary',
    target: 500,
    progressType: 'count',
    reward: { budget: 3000, reputation: 50, growthPoints: 200 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'first_profit',
    name: '初尝盈利',
    icon: '🪙',
    description: '单日利润达到100元',
    category: 'profit',
    rarity: 'common',
    target: 100,
    progressType: 'value',
    reward: { budget: 50, reputation: 3 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'daily_profit_500',
    name: '日进斗金',
    icon: '💎',
    description: '单日利润达到500元',
    category: 'profit',
    rarity: 'rare',
    target: 500,
    progressType: 'value',
    reward: { budget: 300, reputation: 15 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'total_profit_1000',
    name: '千元俱乐部',
    icon: '🏦',
    description: '累计利润达到1000元',
    category: 'profit',
    rarity: 'rare',
    target: 1000,
    progressType: 'value',
    reward: { budget: 500, reputation: 20, growthPoints: 80 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'total_profit_5000',
    name: '财富积累',
    icon: '💰',
    description: '累计利润达到5000元',
    category: 'profit',
    rarity: 'epic',
    target: 5000,
    progressType: 'value',
    reward: { budget: 1500, reputation: 40, growthPoints: 150 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'total_profit_10000',
    name: '商业巨擘',
    icon: '🏛️',
    description: '累计利润达到10000元',
    category: 'profit',
    rarity: 'legendary',
    target: 10000,
    progressType: 'value',
    reward: { budget: 3000, reputation: 60, growthPoints: 300 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'first_collection',
    name: '收藏入门',
    icon: '📖',
    description: '收藏第一张唱片',
    category: 'collection',
    rarity: 'common',
    target: 1,
    progressType: 'count',
    reward: { budget: 30, reputation: 2 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'collection_10',
    name: '初级收藏家',
    icon: '📚',
    description: '收藏10张唱片',
    category: 'collection',
    rarity: 'common',
    target: 10,
    progressType: 'count',
    reward: { budget: 100, reputation: 8 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'collection_30',
    name: '中级收藏家',
    icon: '📜',
    description: '收藏30张唱片',
    category: 'collection',
    rarity: 'rare',
    target: 30,
    progressType: 'count',
    reward: { budget: 300, reputation: 18, growthPoints: 60 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'collection_50',
    name: '高级收藏家',
    icon: '🏺',
    description: '收藏50张唱片',
    category: 'collection',
    rarity: 'epic',
    target: 50,
    progressType: 'count',
    reward: { budget: 800, reputation: 30, growthPoints: 120 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'rare_records_5',
    name: '稀世珍藏',
    icon: '💠',
    description: '收藏5张4星及以上稀有度唱片',
    category: 'collection',
    rarity: 'rare',
    target: 5,
    progressType: 'count',
    reward: { budget: 400, reputation: 25 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'perfect_records_3',
    name: '完美品相',
    icon: '✨',
    description: '收藏3张完美品相（90分以上）的唱片',
    category: 'collection',
    rarity: 'epic',
    target: 3,
    progressType: 'count',
    reward: { budget: 600, reputation: 35, growthPoints: 100 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'first_satisfied',
    name: '满意服务',
    icon: '😊',
    description: '第一位顾客满意度达到80%以上',
    category: 'satisfaction',
    rarity: 'common',
    target: 1,
    progressType: 'count',
    reward: { budget: 30, reputation: 5 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'avg_satisfaction_70',
    name: '服务优良',
    icon: '👍',
    description: '平均顾客满意度达到70%',
    category: 'satisfaction',
    rarity: 'common',
    target: 70,
    progressType: 'percent',
    reward: { budget: 100, reputation: 10 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'avg_satisfaction_85',
    name: '备受好评',
    icon: '🌟',
    description: '平均顾客满意度达到85%',
    category: 'satisfaction',
    rarity: 'rare',
    target: 85,
    progressType: 'percent',
    reward: { budget: 300, reputation: 20, growthPoints: 50 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'avg_satisfaction_95',
    name: '零差评店铺',
    icon: '💫',
    description: '平均顾客满意度达到95%',
    category: 'satisfaction',
    rarity: 'epic',
    target: 95,
    progressType: 'percent',
    reward: { budget: 800, reputation: 40, growthPoints: 150 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'satisfied_20_customers',
    name: '顾客之友',
    icon: '🤝',
    description: '让20位顾客满意而归（满意度≥80%）',
    category: 'satisfaction',
    rarity: 'rare',
    target: 20,
    progressType: 'count',
    reward: { budget: 250, reputation: 15, growthPoints: 40 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'first_level_clear',
    name: '初出茅庐',
    icon: '🎓',
    description: '通关第一个关卡',
    category: 'level',
    rarity: 'common',
    target: 1,
    progressType: 'count',
    reward: { budget: 200, reputation: 10 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'levels_cleared_3',
    name: '渐入佳境',
    icon: '📈',
    description: '通关3个关卡',
    category: 'level',
    rarity: 'rare',
    target: 3,
    progressType: 'count',
    reward: { budget: 500, reputation: 20, growthPoints: 60 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 's_grade_first',
    name: '首次S级',
    icon: '🏆',
    description: '首次在关卡中获得S级评价',
    category: 'level',
    rarity: 'epic',
    target: 1,
    progressType: 'count',
    reward: { budget: 800, reputation: 30, growthPoints: 100 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 's_grade_3',
    name: 'S级达人',
    icon: '👑',
    description: '在3个关卡中获得S级评价',
    category: 'level',
    rarity: 'legendary',
    target: 3,
    progressType: 'count',
    reward: { budget: 2000, reputation: 50, growthPoints: 200 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'high_value_sale',
    name: '高价成交',
    icon: '💎',
    description: '单笔交易金额超过500元',
    category: 'special',
    rarity: 'rare',
    target: 500,
    progressType: 'value',
    reward: { budget: 200, reputation: 15 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'bargain_master',
    name: '砍价高手',
    icon: '🤝',
    description: '成功完成10次砍价交易',
    category: 'special',
    rarity: 'rare',
    target: 10,
    progressType: 'count',
    reward: { budget: 300, reputation: 12, growthPoints: 50 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'member_10',
    name: '会员俱乐部',
    icon: '🎖️',
    description: '拥有10名会员',
    category: 'special',
    rarity: 'epic',
    target: 10,
    progressType: 'count',
    reward: { budget: 500, reputation: 25, growthPoints: 80 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'consecutive_7_days',
    name: '一周坚持',
    icon: '📅',
    description: '连续经营7天',
    category: 'special',
    rarity: 'common',
    target: 7,
    progressType: 'count',
    reward: { budget: 150, reputation: 10 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  },
  {
    id: 'consecutive_30_days',
    name: '月度坚守',
    icon: '🗓️',
    description: '连续经营30天',
    category: 'special',
    rarity: 'epic',
    target: 30,
    progressType: 'count',
    reward: { budget: 1000, reputation: 40, growthPoints: 150 },
    isUnlocked: false,
    unlockedDate: null,
    progress: 0,
    rewardClaimed: false,
    rewardClaimedDate: null
  }
]

export const businessTitles: BusinessTitleConfig[] = [
  {
    id: 'novice_merchant_1',
    name: '新手店主',
    icon: '🏪',
    description: '刚开始经营唱片店的新人',
    type: 'novice_merchant',
    tier: 1,
    requiredAchievementIds: ['first_sale'],
    bonusEffect: '初始资金加成',
    bonusValue: 5,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'novice_merchant_2',
    name: '学徒商人',
    icon: '📚',
    description: '正在学习经营之道的店主',
    type: 'novice_merchant',
    tier: 2,
    requiredAchievementIds: ['first_sale', 'sales_10', 'first_profit'],
    bonusEffect: '初始资金加成',
    bonusValue: 10,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'shrewd_businessman_1',
    name: '精明商贩',
    icon: '💼',
    description: '懂得如何赚取利润的商人',
    type: 'shrewd_businessman',
    tier: 1,
    requiredAchievementIds: ['daily_profit_500', 'total_profit_1000'],
    bonusEffect: '售价加成',
    bonusValue: 2,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'shrewd_businessman_2',
    name: '商业精英',
    icon: '🏦',
    description: '商界的后起之秀',
    type: 'shrewd_businessman',
    tier: 2,
    requiredAchievementIds: ['total_profit_5000', 'sales_100', 'bargain_master'],
    bonusEffect: '售价加成',
    bonusValue: 5,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'music_connoisseur_1',
    name: '音乐爱好者',
    icon: '🎵',
    description: '对音乐有独到见解的人',
    type: 'music_connoisseur',
    tier: 1,
    requiredAchievementIds: ['first_collection', 'collection_10'],
    bonusEffect: '收藏价值加成',
    bonusValue: 5,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'music_connoisseur_2',
    name: '音乐鉴赏家',
    icon: '🎼',
    description: '品味高雅的音乐收藏家',
    type: 'music_connoisseur',
    tier: 2,
    requiredAchievementIds: ['collection_30', 'rare_records_5', 'perfect_records_3'],
    bonusEffect: '收藏价值加成',
    bonusValue: 10,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'collection_master_1',
    name: '收藏新手',
    icon: '📖',
    description: '开始自己的收藏之旅',
    type: 'collection_master',
    tier: 1,
    requiredAchievementIds: ['collection_10', 'first_collection'],
    bonusEffect: '稀有唱片出现率',
    bonusValue: 3,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'collection_master_2',
    name: '收藏达人',
    icon: '🏺',
    description: '小有名气的收藏家',
    type: 'collection_master',
    tier: 2,
    requiredAchievementIds: ['collection_50', 'rare_records_5', 'perfect_records_3'],
    bonusEffect: '稀有唱片出现率',
    bonusValue: 8,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'customer_favorite_1',
    name: '人气店主',
    icon: '😊',
    description: '受顾客欢迎的店主',
    type: 'customer_favorite',
    tier: 1,
    requiredAchievementIds: ['avg_satisfaction_70', 'first_satisfied'],
    bonusEffect: '顾客满意度加成',
    bonusValue: 5,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'customer_favorite_2',
    name: '服务大师',
    icon: '🌟',
    description: '以卓越服务闻名的店主',
    type: 'customer_favorite',
    tier: 2,
    requiredAchievementIds: ['avg_satisfaction_85', 'satisfied_20_customers', 'member_10'],
    bonusEffect: '顾客满意度加成',
    bonusValue: 10,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'industry_legend_1',
    name: '业界新星',
    icon: '⭐',
    description: '唱片业界的后起之秀',
    type: 'industry_legend',
    tier: 1,
    requiredAchievementIds: ['first_level_clear', 'levels_cleared_3', 's_grade_first'],
    bonusEffect: '全属性小幅提升',
    bonusValue: 3,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  },
  {
    id: 'industry_legend_2',
    name: '传奇店主',
    icon: '👑',
    description: '传说中的唱片店主人',
    type: 'industry_legend',
    tier: 2,
    requiredAchievementIds: ['s_grade_3', 'sales_500', 'total_profit_10000', 'consecutive_30_days'],
    bonusEffect: '全属性大幅提升',
    bonusValue: 8,
    isUnlocked: false,
    unlockedDate: null,
    isEquipped: false
  }
]

export const getRarityLabel = (rarity: BusinessAchievementRarity): string => {
  const labels: Record<BusinessAchievementRarity, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity]
}

export const getRarityColor = (rarity: BusinessAchievementRarity): string => {
  const colors: Record<BusinessAchievementRarity, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  }
  return colors[rarity]
}

export const getRarityBgColor = (rarity: BusinessAchievementRarity): string => {
  const colors: Record<BusinessAchievementRarity, string> = {
    common: 'rgba(156, 163, 175, 0.15)',
    rare: 'rgba(59, 130, 246, 0.15)',
    epic: 'rgba(168, 85, 247, 0.15)',
    legendary: 'rgba(245, 158, 11, 0.15)'
  }
  return colors[rarity]
}

export const getAchievementById = (id: string): BusinessAchievementConfig | undefined => {
  return businessAchievements.find(a => a.id === id)
}

export const getTitleById = (id: string): BusinessTitleConfig | undefined => {
  return businessTitles.find(t => t.id === id)
}

export const getAchievementsByCategory = (category: BusinessAchievementCategory): BusinessAchievementConfig[] => {
  return businessAchievements.filter(a => a.category === category)
}

export const createInitialAchievementState = (): BusinessAchievementState => {
  return {
    achievements: JSON.parse(JSON.stringify(businessAchievements)),
    titles: JSON.parse(JSON.stringify(businessTitles)),
    stats: {
      totalAchievements: businessAchievements.length,
      unlockedAchievements: 0,
      totalTitles: businessTitles.length,
      unlockedTitles: 0,
      achievementPoints: 0,
      currentTitleId: null,
      newlyUnlocked: [],
      newlyClaimableRewards: []
    },
    lastCheckDay: 0
  }
}

export const calculateAchievementPoints = (achievements: BusinessAchievementConfig[]): number => {
  const pointsByRarity: Record<BusinessAchievementRarity, number> = {
    common: 10,
    rare: 25,
    epic: 50,
    legendary: 100
  }
  return achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + pointsByRarity[a.rarity], 0)
}

export const checkAchievementUnlock = (
  achievement: BusinessAchievementConfig,
  updateType: AchievementProgressUpdateType,
  value: number
): { shouldUnlock: boolean; newProgress: number } => {
  if (achievement.isUnlocked) {
    return { shouldUnlock: false, newProgress: achievement.progress }
  }

  let newProgress = achievement.progress

  const relevantTypes: Record<string, string[]> = {
    total_sales: ['first_sale', 'sales_10', 'sales_50', 'sales_100', 'sales_500'],
    total_profit: ['total_profit_1000', 'total_profit_5000', 'total_profit_10000'],
    daily_profit: ['first_profit', 'daily_profit_500'],
    collection_count: ['first_collection', 'collection_10', 'collection_30', 'collection_50'],
    rare_records: ['rare_records_5'],
    perfect_records: ['perfect_records_3'],
    avg_satisfaction: ['avg_satisfaction_70', 'avg_satisfaction_85', 'avg_satisfaction_95'],
    customer_satisfaction: ['first_satisfied', 'satisfied_20_customers'],
    levels_cleared: ['first_level_clear', 'levels_cleared_3'],
    s_grade_levels: ['s_grade_first', 's_grade_3'],
    single_sale_price: ['high_value_sale'],
    bargain_success: ['bargain_master'],
    member_count: ['member_10'],
    consecutive_days: ['consecutive_7_days', 'consecutive_30_days']
  }

  const achievementIds = relevantTypes[updateType] || []
  if (!achievementIds.includes(achievement.id)) {
    return { shouldUnlock: false, newProgress: achievement.progress }
  }

  if (achievement.progressType === 'count' || achievement.progressType === 'value') {
    newProgress = Math.max(achievement.progress, value)
  } else if (achievement.progressType === 'percent') {
    newProgress = Math.max(achievement.progress, value)
  } else if (achievement.progressType === 'boolean') {
    newProgress = value > 0 ? 1 : 0
  }

  const shouldUnlock = newProgress >= achievement.target

  return { shouldUnlock, newProgress }
}

export const updateAchievementProgress = (
  state: BusinessAchievementState,
  updateType: AchievementProgressUpdateType,
  value: number
): { state: BusinessAchievementState; newlyUnlocked: string[] } => {
  const newlyUnlocked: string[] = []
  const newState = { ...state }
  newState.achievements = state.achievements.map(achievement => {
    const { shouldUnlock, newProgress } = checkAchievementUnlock(achievement, updateType, value)
    if (shouldUnlock && !achievement.isUnlocked) {
      newlyUnlocked.push(achievement.id)
      return {
        ...achievement,
        isUnlocked: true,
        unlockedDate: Date.now(),
        progress: newProgress,
        rewardClaimed: false
      }
    }
    return { ...achievement, progress: newProgress }
  })

  newState.stats = {
    ...newState.stats,
    unlockedAchievements: newState.achievements.filter(a => a.isUnlocked).length,
    achievementPoints: calculateAchievementPoints(newState.achievements),
    newlyUnlocked: [...newState.stats.newlyUnlocked, ...newlyUnlocked],
    newlyClaimableRewards: [
      ...newState.stats.newlyClaimableRewards,
      ...newlyUnlocked.filter(id => {
        const ach = newState.achievements.find(a => a.id === id)
        return ach && !ach.rewardClaimed
      })
    ]
  }

  newState.titles = checkTitleUnlocks(newState)

  return { state: newState, newlyUnlocked }
}

export const checkTitleUnlocks = (state: BusinessAchievementState): BusinessTitleConfig[] => {
  const unlockedAchievementIds = state.achievements
    .filter(a => a.isUnlocked)
    .map(a => a.id)

  return state.titles.map(title => {
    if (title.isUnlocked) return title

    const allRequirementsMet = title.requiredAchievementIds.every(
      reqId => unlockedAchievementIds.includes(reqId)
    )

    if (allRequirementsMet) {
      return {
        ...title,
        isUnlocked: true,
        unlockedDate: Date.now()
      }
    }
    return title
  })
}

export const claimAchievementReward = (
  state: BusinessAchievementState,
  achievementId: string
): { state: BusinessAchievementState; success: boolean; reward: { budget?: number; reputation?: number; growthPoints?: number } } => {
  const achievement = state.achievements.find(a => a.id === achievementId)
  
  if (!achievement || !achievement.isUnlocked || achievement.rewardClaimed) {
    return { state, success: false, reward: {} }
  }

  const newAchievements = state.achievements.map(a => {
    if (a.id === achievementId) {
      return { ...a, rewardClaimed: true, rewardClaimedDate: Date.now() }
    }
    return a
  })

  const newStats = {
    ...state.stats,
    newlyClaimableRewards: state.stats.newlyClaimableRewards.filter(id => id !== achievementId)
  }

  return {
    state: { ...state, achievements: newAchievements, stats: newStats },
    success: true,
    reward: achievement.reward
  }
}

export const equipTitle = (
  state: BusinessAchievementState,
  titleId: string
): { state: BusinessAchievementState; success: boolean } => {
  const title = state.titles.find(t => t.id === titleId)
  
  if (!title || !title.isUnlocked) {
    return { state, success: false }
  }

  const newTitles = state.titles.map(t => ({
    ...t,
    isEquipped: t.id === titleId
  }))

  return {
    state: {
      ...state,
      titles: newTitles,
      stats: {
        ...state.stats,
        currentTitleId: titleId
      }
    },
    success: true
  }
}

export const getCurrentEquippedTitle = (state: BusinessAchievementState): BusinessTitleConfig | null => {
  return state.titles.find(t => t.isEquipped) || null
}

export const getUnclaimedRewardCount = (state: BusinessAchievementState): number => {
  return state.achievements.filter(a => a.isUnlocked && !a.rewardClaimed).length
}

export const clearNewAchievementNotifications = (state: BusinessAchievementState): BusinessAchievementState => {
  return {
    ...state,
    stats: {
      ...state.stats,
      newlyUnlocked: [],
      newlyClaimableRewards: []
    }
  }
}
