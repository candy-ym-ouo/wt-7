import type {
  Genre,
  FestivalTheme,
  FestivalThemeConfig,
  FestivalMenu,
  FestivalMenuItem,
  FestivalCustomerConfig,
  FestivalTaskConfig,
  FestivalRewardTier,
  FestivalAtmosphereOverride,
  FestivalState
} from '@/types'

export const festivalThemeConfigs: FestivalThemeConfig[] = [
  {
    theme: 'spring',
    name: '春日物语',
    icon: '🌸',
    description: '春暖花开，乐声悠扬。在樱花纷飞中感受音乐新生的力量。',
    bgGradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 30%, #e8f5e9 70%, #c8e6c9 100%)',
    accentColor: '#e91e63',
    particleIcon: '🌸',
    genreAffinity: ['Folk', 'Jazz', 'Classical'],
    customerBudgetBonus: 0.1,
    buyChanceBonus: 0.05,
    reputationBonus: 3,
    satisfactionBonus: 8
  },
  {
    theme: 'summer',
    name: '盛夏狂欢',
    icon: '☀️',
    description: '骄阳似火，热情如歌。用最热辣的节拍点燃整个夏天！',
    bgGradient: 'linear-gradient(135deg, #fff9c4 0%, #ffeb3b 30%, #ff9800 70%, #f44336 100%)',
    accentColor: '#ff6d00',
    particleIcon: '☀️',
    genreAffinity: ['Disco', 'Funk', 'Electronic'],
    customerBudgetBonus: 0.15,
    buyChanceBonus: 0.08,
    reputationBonus: 4,
    satisfactionBonus: 10
  },
  {
    theme: 'autumn',
    name: '秋韵悠长',
    icon: '🍂',
    description: '金风送爽，叶落知秋。在醇厚的旋律中品味岁月沉淀。',
    bgGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 30%, #d7ccc8 70%, #a1887f 100%)',
    accentColor: '#e65100',
    particleIcon: '🍂',
    genreAffinity: ['Blues', 'Soul', 'Jazz'],
    customerBudgetBonus: 0.12,
    buyChanceBonus: 0.06,
    reputationBonus: 3,
    satisfactionBonus: 9
  },
  {
    theme: 'winter',
    name: '冬日暖阳',
    icon: '❄️',
    description: '银装素裹，音乐暖心。在冰雪世界中发现温暖的旋律。',
    bgGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 30%, #90caf9 70%, #64b5f6 100%)',
    accentColor: '#1565c0',
    particleIcon: '❄️',
    genreAffinity: ['Classical', 'Folk', 'Pop'],
    customerBudgetBonus: 0.08,
    buyChanceBonus: 0.04,
    reputationBonus: 2,
    satisfactionBonus: 7
  },
  {
    theme: 'newyear',
    name: '新春贺岁',
    icon: '🧧',
    description: '辞旧迎新，万象更新！用音乐开启崭新的一年！',
    bgGradient: 'linear-gradient(135deg, #ffebee 0%, #ef5350 30%, #ff8a80 70%, #ffcdd2 100%)',
    accentColor: '#d32f2f',
    particleIcon: '🧧',
    genreAffinity: ['Pop', 'Disco', 'Funk'],
    customerBudgetBonus: 0.2,
    buyChanceBonus: 0.1,
    reputationBonus: 5,
    satisfactionBonus: 12
  },
  {
    theme: 'midautumn',
    name: '月圆之约',
    icon: '🌕',
    description: '月明如水，琴声如梦。在团圆之夜共赏美好旋律。',
    bgGradient: 'linear-gradient(135deg, #1a237e 0%, #283593 30%, #5c6bc0 70%, #9fa8da 100%)',
    accentColor: '#ffc107',
    particleIcon: '🌕',
    genreAffinity: ['Classical', 'Jazz', 'Folk'],
    customerBudgetBonus: 0.1,
    buyChanceBonus: 0.06,
    reputationBonus: 3,
    satisfactionBonus: 9
  },
  {
    theme: 'christmas',
    name: '圣诞颂歌',
    icon: '🎄',
    description: '铃儿响叮当，音乐暖人心。在雪花中寻找最动人的旋律。',
    bgGradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 30%, #c62828 70%, #d32f2f 100%)',
    accentColor: '#ffd600',
    particleIcon: '🎄',
    genreAffinity: ['Classical', 'Pop', 'Folk'],
    customerBudgetBonus: 0.15,
    buyChanceBonus: 0.08,
    reputationBonus: 4,
    satisfactionBonus: 10
  },
  {
    theme: 'valentine',
    name: '爱的旋律',
    icon: '💕',
    description: '以歌传情，以曲达意。让音乐诉说心底最柔软的话语。',
    bgGradient: 'linear-gradient(135deg, #fce4ec 0%, #f48fb1 30%, #ec407a 70%, #e91e63 100%)',
    accentColor: '#c2185b',
    particleIcon: '💕',
    genreAffinity: ['Soul', 'Pop', 'Jazz'],
    customerBudgetBonus: 0.12,
    buyChanceBonus: 0.07,
    reputationBonus: 3,
    satisfactionBonus: 10
  }
]

export const getFestivalThemeConfig = (theme: FestivalTheme): FestivalThemeConfig => {
  return festivalThemeConfigs.find(c => c.theme === theme) || festivalThemeConfigs[0]
}

export const festivalCustomerConfigs: FestivalCustomerConfig[] = [
  {
    id: 'fc_spring_dancer',
    name: '花间舞者·小樱',
    avatar: '🩰',
    title: '春日限定',
    description: '一位痴迷于旋律与节拍的舞者，只在此刻绽放。',
    rarity: 'rare',
    favoriteGenres: ['Jazz', 'Folk'],
    budgetMultiplier: 1.3,
    satisfactionBonus: 15,
    buyChanceBonus: 0.1,
    appearanceChance: 0.15,
    requiredReputation: 40,
    requiredFestivalTheme: 'spring',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这旋律让我忍不住想旋转！', '春天的气息，全藏在这首歌里了~', '请问还有更轻快的曲子吗？'],
    specialReward: '春日舞者徽章'
  },
  {
    id: 'fc_summer_dj',
    name: '烈日DJ·阿亮',
    avatar: '🎧',
    title: '盛夏限定',
    description: '来自南方的电子音乐制作人，追寻最热辣的节拍。',
    rarity: 'epic',
    favoriteGenres: ['Electronic', 'Funk', 'Disco'],
    budgetMultiplier: 1.5,
    satisfactionBonus: 20,
    buyChanceBonus: 0.15,
    appearanceChance: 0.1,
    requiredReputation: 50,
    requiredFestivalTheme: 'summer',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这BPM太对味了！', '兄弟，有没有更炸的碟？', '夏天就该这么嗨！'],
    specialReward: '盛夏DJ徽章'
  },
  {
    id: 'fc_autumn_poet',
    name: '落叶诗人·若水',
    avatar: '📜',
    title: '秋韵限定',
    description: '以诗入乐、以乐和诗的文艺灵魂，只在秋风中现身。',
    rarity: 'rare',
    favoriteGenres: ['Blues', 'Soul', 'Folk'],
    budgetMultiplier: 1.3,
    satisfactionBonus: 15,
    buyChanceBonus: 0.1,
    appearanceChance: 0.15,
    requiredReputation: 40,
    requiredFestivalTheme: 'autumn',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这段旋律像一首未完的诗。', '秋风里总藏着说不完的故事。', '能再放一首Blues吗？'],
    specialReward: '秋韵诗人徽章'
  },
  {
    id: 'fc_winter_collector',
    name: '雪夜收藏家·寒霜',
    avatar: '🎩',
    title: '冬日限定',
    description: '只在世界银装素裹时出没的神秘收藏家，眼光独到。',
    rarity: 'epic',
    favoriteGenres: ['Classical', 'Jazz'],
    budgetMultiplier: 1.6,
    satisfactionBonus: 22,
    buyChanceBonus: 0.12,
    appearanceChance: 0.08,
    requiredReputation: 55,
    requiredFestivalTheme: 'winter',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这曲子有雪的温度。', '在安静中，才能听到真正的音乐。', '品相不错，我收了。'],
    specialReward: '雪夜收藏家徽章'
  },
  {
    id: 'fc_newyear_lion',
    name: '瑞狮贺岁·金宝',
    avatar: '🦁',
    title: '新春限定',
    description: '舞狮世家的传人，热爱一切喜庆热闹的音乐！',
    rarity: 'legendary',
    favoriteGenres: ['Pop', 'Disco', 'Funk'],
    budgetMultiplier: 2.0,
    satisfactionBonus: 30,
    buyChanceBonus: 0.2,
    appearanceChance: 0.06,
    requiredReputation: 60,
    requiredFestivalTheme: 'newyear',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这节奏够嗨够劲！', '新的一年要更旺！', '来来来，放首更带劲的！'],
    specialReward: '瑞狮金宝徽章'
  },
  {
    id: 'fc_midautumn_moon',
    name: '月下琴师·婉清',
    avatar: '🌙',
    title: '月圆限定',
    description: '传说中的月下琴师，只在满月之夜降临人间。',
    rarity: 'legendary',
    favoriteGenres: ['Classical', 'Jazz', 'Folk'],
    budgetMultiplier: 1.8,
    satisfactionBonus: 25,
    buyChanceBonus: 0.15,
    appearanceChance: 0.07,
    requiredReputation: 55,
    requiredFestivalTheme: 'midautumn',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['月圆之夜，琴声最动人。', '这曲子有月光的味道。', '你的店，值得在月光下驻足。'],
    specialReward: '月下琴师徽章'
  },
  {
    id: 'fc_christmas_santa',
    name: '圣诞老人·尼古拉',
    avatar: '🎅',
    title: '圣诞限定',
    description: '不是那个送礼物的圣诞老人，但他也带来了惊喜！',
    rarity: 'epic',
    favoriteGenres: ['Classical', 'Pop'],
    budgetMultiplier: 1.5,
    satisfactionBonus: 20,
    buyChanceBonus: 0.12,
    appearanceChance: 0.1,
    requiredReputation: 45,
    requiredFestivalTheme: 'christmas',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['Ho Ho Ho！好音乐就是最好的礼物！', '这张碟够温暖，打包带走！', '平安夜就该听这样的歌。'],
    specialReward: '圣诞老人徽章'
  },
  {
    id: 'fc_valentine_cupid',
    name: '恋曲使者·心语',
    avatar: '💘',
    title: '情人节限定',
    description: '爱情的音乐使者，能听到每首曲子里的心跳声。',
    rarity: 'rare',
    favoriteGenres: ['Soul', 'Pop', 'Jazz'],
    budgetMultiplier: 1.4,
    satisfactionBonus: 18,
    buyChanceBonus: 0.1,
    appearanceChance: 0.12,
    requiredReputation: 40,
    requiredFestivalTheme: 'valentine',
    isUnlocked: false,
    unlockDay: null,
    quotes: ['这首歌让我想起了某个人...', '音乐是爱情最美的语言。', '能不能再温柔一点？'],
    specialReward: '恋曲使者徽章'
  }
]

export const getFestivalCustomersForTheme = (theme: FestivalTheme): FestivalCustomerConfig[] => {
  return festivalCustomerConfigs.filter(c => c.requiredFestivalTheme === theme || c.requiredFestivalTheme === null)
}

export const generateFestivalTasks = (theme: FestivalTheme, level: number): FestivalTaskConfig[] => {
  const themeConfig = getFestivalThemeConfig(theme)
  const scale = 1 + (level - 1) * 0.3

  const baseTasks: FestivalTaskConfig[] = [
    {
      id: `ft_${theme}_sales_1`,
      type: 'sales',
      name: '节日热卖',
      icon: '💰',
      description: `节日期间累计销售 ${Math.round(5 * scale)} 张唱片`,
      target: Math.round(5 * scale),
      current: 0,
      status: 'active',
      reward: { budget: 300, reputation: 3, growthPoints: 20, bonusItems: [] },
      requiredTaskIds: [],
      requiredDay: 1
    },
    {
      id: `ft_${theme}_genre_1`,
      type: 'genre',
      name: `${themeConfig.icon}风格之选`,
      icon: '🎵',
      description: `售出 ${Math.round(3 * scale)} 张${themeConfig.genreAffinity[0]}类唱片`,
      target: Math.round(3 * scale),
      current: 0,
      status: 'active',
      reward: { budget: 200, reputation: 2, growthPoints: 15, bonusItems: [] },
      requiredTaskIds: [],
      requiredDay: 1
    },
    {
      id: `ft_${theme}_customer_1`,
      type: 'customer',
      name: '节日来客',
      icon: '🤝',
      description: `接待 ${Math.round(2 * scale)} 位节日限定顾客`,
      target: Math.round(2 * scale),
      current: 0,
      status: 'locked',
      reward: { budget: 400, reputation: 4, growthPoints: 25, bonusItems: [] },
      requiredTaskIds: [`ft_${theme}_sales_1`],
      requiredDay: 2
    },
    {
      id: `ft_${theme}_atmosphere_1`,
      type: 'atmosphere',
      name: '节日氛围',
      icon: '✨',
      description: `将任意流派氛围值提升至 60 以上`,
      target: 60,
      current: 0,
      status: 'active',
      reward: { budget: 150, reputation: 2, growthPoints: 10, bonusItems: [] },
      requiredTaskIds: [],
      requiredDay: 1
    },
    {
      id: `ft_${theme}_sales_2`,
      type: 'sales',
      name: '节日畅销',
      icon: '🔥',
      description: `节日期间累计销售 ${Math.round(12 * scale)} 张唱片`,
      target: Math.round(12 * scale),
      current: 0,
      status: 'locked',
      reward: { budget: 500, reputation: 5, growthPoints: 35, bonusItems: [] },
      requiredTaskIds: [`ft_${theme}_sales_1`],
      requiredDay: 2
    },
    {
      id: `ft_${theme}_menu_1`,
      type: 'special',
      name: '专题抢购',
      icon: '🎯',
      description: `购买 ${Math.round(3 * scale)} 个节日专题货单项`,
      target: Math.round(3 * scale),
      current: 0,
      status: 'active',
      reward: { budget: 250, reputation: 3, growthPoints: 15, bonusItems: [] },
      requiredTaskIds: [],
      requiredDay: 1
    },
    {
      id: `ft_${theme}_collection_1`,
      type: 'collection',
      name: '节日收藏',
      icon: '📀',
      description: `收藏总价值达到 ¥${(5000 * scale).toFixed(0)}`,
      target: Math.round(5000 * scale),
      current: 0,
      status: 'locked',
      reward: { budget: 350, reputation: 3, growthPoints: 20, bonusItems: [] },
      requiredTaskIds: [`ft_${theme}_sales_1`],
      requiredDay: 2
    },
    {
      id: `ft_${theme}_special_1`,
      type: 'special',
      name: '节日终章',
      icon: '🏆',
      description: `完成以上所有节日任务`,
      target: 1,
      current: 0,
      status: 'locked',
      reward: { budget: 800, reputation: 8, growthPoints: 50, bonusItems: [`${themeConfig.icon}节日纪念徽章`] },
      requiredTaskIds: [
        `ft_${theme}_sales_2`,
        `ft_${theme}_customer_1`,
        `ft_${theme}_atmosphere_1`,
        `ft_${theme}_menu_1`
      ],
      requiredDay: 3
    }
  ]

  return baseTasks
}

export const festivalRewardTiers: FestivalRewardTier[] = [
  {
    tier: 'bronze',
    tierName: '铜奖',
    icon: '🥉',
    minScore: 0,
    rewards: { budget: 200, reputation: 2, growthPoints: 10, bonusItems: [] },
    description: '节日参与奖，感谢你的加入！'
  },
  {
    tier: 'silver',
    tierName: '银奖',
    icon: '🥈',
    minScore: 30,
    rewards: { budget: 500, reputation: 5, growthPoints: 30, bonusItems: [] },
    description: '不错的表现，节日气氛因你而浓！'
  },
  {
    tier: 'gold',
    tierName: '金奖',
    icon: '🥇',
    minScore: 60,
    rewards: { budget: 1000, reputation: 10, growthPoints: 60, bonusItems: ['节日金质徽章'] },
    description: '出色的节日运营，你是活动之星！'
  },
  {
    tier: 'platinum',
    tierName: '铂金奖',
    icon: '💎',
    minScore: 90,
    rewards: { budget: 2000, reputation: 20, growthPoints: 100, bonusItems: ['节日铂金徽章', '限定唱片兑换券'] },
    description: '传奇级节日运营！你是真正的节日之王！'
  }
]

export const getRewardTier = (score: number): FestivalRewardTier => {
  for (let i = festivalRewardTiers.length - 1; i >= 0; i--) {
    if (score >= festivalRewardTiers[i].minScore) {
      return festivalRewardTiers[i]
    }
  }
  return festivalRewardTiers[0]
}

export const getFestivalAtmosphereOverride = (theme: FestivalTheme): FestivalAtmosphereOverride => {
  const config = getFestivalThemeConfig(theme)
  return {
    theme,
    bgGradient: config.bgGradient,
    accentColor: config.accentColor,
    particleEffect: config.particleIcon,
    headerStyle: `background: ${config.bgGradient};`,
    cardStyle: `border-color: ${config.accentColor}; box-shadow: 0 0 12px ${config.accentColor}33;`,
    isActive: true
  }
}

export const generateFestivalMenu = (
  theme: FestivalTheme,
  availableRecordIds: string[],
  allRecords: { id: string; genre: Genre; marketPrice: number; rarity: number }[],
  day: number
): FestivalMenu => {
  const themeConfig = getFestivalThemeConfig(theme)

  const eligible = allRecords.filter(r =>
    availableRecordIds.includes(r.id) &&
    (themeConfig.genreAffinity.includes(r.genre) || r.rarity >= 3)
  )

  const shuffled = [...eligible].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(8, shuffled.length))

  const items: FestivalMenuItem[] = selected.map((record, idx) => {
    const discountRate = record.rarity >= 4 ? 0.15 : record.genre === themeConfig.genreAffinity[0] ? 0.2 : 0.1
    const festivalPrice = Math.round(record.marketPrice * (1 - discountRate))
    const isFeatured = idx < 2
    const isExclusive = record.rarity >= 4 && Math.random() < 0.4
    const maxStock = isExclusive ? 1 : isFeatured ? 3 : 5

    return {
      recordId: record.id,
      festivalPrice,
      originalPrice: record.marketPrice,
      discountRate,
      status: 'available' as const,
      stock: maxStock,
      maxStock,
      isFeatured,
      isExclusive,
      tagLabel: isExclusive ? '限定' : isFeatured ? '热门' : discountRate >= 0.15 ? '特惠' : ''
    }
  })

  return {
    id: `fmenu_${theme}_${day}`,
    festivalTheme: theme,
    name: `${themeConfig.icon}${themeConfig.name}专题`,
    icon: themeConfig.icon,
    description: `${themeConfig.name}精选唱片，限时特惠！`,
    items,
    bonusBuyThreshold: 3,
    bonusReward: '节日选购礼包',
    totalPurchased: 0
  }
}

export const createInitialFestivalState = (): FestivalState => ({
  activeFestival: null,
  festivalDay: 0,
  maxFestivalDays: 5,
  menus: [],
  customers: [],
  encounteredCustomers: [],
  tasks: [],
  settlements: [],
  atmosphereOverride: null,
  totalFestivalScore: 0,
  menuItemsSold: 0,
  customersServed: 0,
  tasksCompleted: 0,
  isFestivalActive: false,
  hasUnclaimedRewards: false
})

export const calculateFestivalScore = (state: FestivalState): number => {
  let score = 0
  score += Math.min(30, state.menuItemsSold * 5)
  score += Math.min(30, state.customersServed * 10)
  score += Math.min(40, state.tasksCompleted * 10)
  return Math.min(100, score)
}

export const shouldFestivalAppear = (day: number, level: number, reputation: number): { shouldAppear: boolean; theme: FestivalTheme } => {
  if (level < 2) return { shouldAppear: false, theme: 'spring' }
  if (day < 3) return { shouldAppear: false, theme: 'spring' }

  const chance = 0.15 + (reputation / 500) + (level * 0.03)
  if (Math.random() > chance) return { shouldAppear: false, theme: 'spring' }

  const themes: FestivalTheme[] = ['spring', 'summer', 'autumn', 'winter', 'newyear', 'midautumn', 'christmas', 'valentine']
  const theme = themes[Math.floor(Math.random() * themes.length)]
  return { shouldAppear: true, theme }
}

export const getCustomerRarityLabel = (rarity: FestivalCustomerConfig['rarity']): string => {
  switch (rarity) {
    case 'rare': return '稀有'
    case 'epic': return '史诗'
    case 'legendary': return '传说'
  }
}

export const getCustomerRarityColor = (rarity: FestivalCustomerConfig['rarity']): string => {
  switch (rarity) {
    case 'rare': return '#4fc3f7'
    case 'epic': return '#ab47bc'
    case 'legendary': return '#ffd740'
  }
}

export const getTaskStatusLabel = (status: FestivalTaskConfig['status']): string => {
  switch (status) {
    case 'locked': return '未解锁'
    case 'active': return '进行中'
    case 'completed': return '已完成'
    case 'claimed': return '已领取'
  }
}

export const getTaskStatusColor = (status: FestivalTaskConfig['status']): string => {
  switch (status) {
    case 'locked': return '#718096'
    case 'active': return '#4fc3f7'
    case 'completed': return '#ffd740'
    case 'claimed': return '#48bb78'
  }
}

export const getRewardTierColor = (tier: FestivalRewardTier['tier']): string => {
  switch (tier) {
    case 'bronze': return '#cd7f32'
    case 'silver': return '#c0c0c0'
    case 'gold': return '#ffd700'
    case 'platinum': return '#e5e4e2'
  }
}

export const getThemeName = (theme: FestivalTheme): string => {
  return getFestivalThemeConfig(theme).name
}
