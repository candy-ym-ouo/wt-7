import type { AlbumCategory, AlbumEntry, SpecialCustomerConfig, AlbumBonus, CollectionBonus, AlbumBonusType } from '@/types'

const createBonus = (type: AlbumBonusType, value: number, description: string): AlbumBonus => ({
  type,
  value,
  description
})

const jazzClassics: AlbumEntry[] = [
  {
    id: 'album-jazz-1',
    name: '爵士启蒙',
    description: '收藏3张经典爵士唱片，开启你的爵士之旅',
    icon: '🎷',
    requiredRecordIds: ['rec-001', 'rec-002', 'rec-021'],
    requiredMinCondition: 60,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 5, '店铺声望 +5'),
      createBonus('match_score', 3, '顾客匹配度 +3')
    ],
    isActivated: false,
    activatedDate: null
  },
  {
    id: 'album-jazz-2',
    name: '爵士大师',
    description: '集齐Miles Davis和John Coltrane的经典专辑',
    icon: '🎺',
    requiredRecordIds: ['rec-001', 'rec-002', 'rec-021'],
    requiredMinCondition: 85,
    requiredMinRarity: 4,
    bonuses: [
      createBonus('special_customer', 0.1, '爵士收藏家出现概率 +10%'),
      createBonus('customer_budget', 0.1, '顾客预算 +10%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const rockLegends: AlbumEntry[] = [
  {
    id: 'album-rock-1',
    name: '摇滚入门',
    description: '收藏3张标志性摇滚唱片',
    icon: '🎸',
    requiredRecordIds: ['rec-003', 'rec-004', 'rec-022'],
    requiredMinCondition: 60,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 5, '店铺声望 +5'),
      createBonus('buy_chance', 0.05, '购买概率 +5%')
    ],
    isActivated: false,
    activatedDate: null
  },
  {
    id: 'album-rock-2',
    name: '摇滚传奇',
    description: '集齐Pink Floyd、Led Zeppelin和Nirvana的经典',
    icon: '🤘',
    requiredRecordIds: ['rec-003', 'rec-004', 'rec-022', 'rec-023'],
    requiredMinCondition: 85,
    requiredMinRarity: 4,
    bonuses: [
      createBonus('special_customer', 0.1, '摇滚收藏家出现概率 +10%'),
      createBonus('level_reward', 0.1, '关卡奖励 +10%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const soulFunk: AlbumEntry[] = [
  {
    id: 'album-soul-1',
    name: '灵魂律动',
    description: '收藏灵魂乐和放克的经典之作',
    icon: '💃',
    requiredRecordIds: ['rec-005', 'rec-006', 'rec-007', 'rec-008'],
    requiredMinCondition: 60,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 5, '店铺声望 +5'),
      createBonus('customer_budget', 0.08, '顾客预算 +8%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const popIcons: AlbumEntry[] = [
  {
    id: 'album-pop-1',
    name: '流行天王',
    description: '收藏Michael Jackson和Prince的经典专辑',
    icon: '👑',
    requiredRecordIds: ['rec-015', 'rec-016', 'rec-024'],
    requiredMinCondition: 70,
    requiredMinRarity: 4,
    bonuses: [
      createBonus('reputation', 8, '店铺声望 +8'),
      createBonus('level_reward', 0.12, '关卡奖励 +12%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const classicalMasters: AlbumEntry[] = [
  {
    id: 'album-classical-1',
    name: '古典入门',
    description: '收藏贝多芬和维瓦尔第的经典作品',
    icon: '🎻',
    requiredRecordIds: ['rec-011', 'rec-012'],
    requiredMinCondition: 70,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 6, '店铺声望 +6'),
      createBonus('match_score', 5, '顾客匹配度 +5')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const rareTreasures: AlbumEntry[] = [
  {
    id: 'album-rare-1',
    name: '稀世珍宝',
    description: '收藏3张5星稀有唱片，品相均在90以上',
    icon: '💎',
    requiredRecordIds: ['rec-001', 'rec-003', 'rec-013', 'rec-016', 'rec-018', 'rec-019', 'rec-021', 'rec-022'],
    requiredMinCondition: 90,
    requiredMinRarity: 5,
    bonuses: [
      createBonus('reputation', 15, '店铺声望 +15'),
      createBonus('special_customer', 0.2, '顶级收藏家出现概率 +20%'),
      createBonus('level_reward', 0.2, '关卡奖励 +20%'),
      createBonus('record_unlock', 0.1, '稀有唱片出现概率 +10%')
    ],
    isActivated: false,
    activatedDate: null
  },
  {
    id: 'album-rare-2',
    name: '完美品相',
    description: '收藏5张Mint品相（95分以上）的唱片',
    icon: '✨',
    requiredRecordIds: ['rec-005', 'rec-012', 'rec-016', 'rec-017', 'rec-021'],
    requiredMinCondition: 95,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 10, '店铺声望 +10'),
      createBonus('price_bonus', 0.1, '售价加成 +10%'),
      createBonus('buy_chance', 0.08, '购买概率 +8%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

const genreComplete: AlbumEntry[] = [
  {
    id: 'album-genre-1',
    name: '风格大全',
    description: '每个音乐风格至少收藏1张唱片',
    icon: '🌈',
    requiredRecordIds: ['rec-001', 'rec-003', 'rec-005', 'rec-007', 'rec-009', 'rec-011', 'rec-013', 'rec-015', 'rec-017', 'rec-019'],
    requiredMinCondition: 60,
    requiredMinRarity: 3,
    bonuses: [
      createBonus('reputation', 20, '店铺声望 +20'),
      createBonus('customer_budget', 0.15, '顾客预算 +15%'),
      createBonus('match_score', 8, '顾客匹配度 +8'),
      createBonus('special_customer', 0.15, '特殊顾客出现概率 +15%')
    ],
    isActivated: false,
    activatedDate: null
  }
]

export const albumCategories: AlbumCategory[] = [
  {
    id: 'cat-jazz',
    name: '爵士经典',
    description: '爵士乐史上最伟大的专辑',
    icon: '🎷',
    entries: jazzClassics
  },
  {
    id: 'cat-rock',
    name: '摇滚传奇',
    description: '改变音乐史的摇滚专辑',
    icon: '🎸',
    entries: rockLegends
  },
  {
    id: 'cat-soul',
    name: '灵魂放克',
    description: '最具律动的黑人音乐',
    icon: '💃',
    entries: soulFunk
  },
  {
    id: 'cat-pop',
    name: '流行巨星',
    description: '流行音乐史上的标志性专辑',
    icon: '👑',
    entries: popIcons
  },
  {
    id: 'cat-classical',
    name: '古典大师',
    description: '古典音乐的永恒之作',
    icon: '🎻',
    entries: classicalMasters
  },
  {
    id: 'cat-rare',
    name: '珍稀收藏',
    description: '专为收藏家准备的稀有图鉴',
    icon: '💎',
    entries: rareTreasures
  },
  {
    id: 'cat-complete',
    name: '收藏大师',
    description: '终极收藏成就',
    icon: '🏆',
    entries: genreComplete
  }
]

export const specialCustomers: SpecialCustomerConfig[] = [
  {
    id: 'sc-jazz-collector',
    name: '爵士老饕',
    avatar: '🎩',
    description: '一位资深爵士收藏家，预算充足，只收精品',
    baseAppearanceChance: 0.05,
    albumBonusMultiplier: 2.0,
    budgetMultiplier: 2.5,
    satisfactionBonus: 15,
    requiredAlbumIds: ['album-jazz-1', 'album-jazz-2'],
    isUnlocked: false
  },
  {
    id: 'sc-rock-fanatic',
    name: '摇滚狂人',
    avatar: '🤘',
    description: '疯狂的摇滚爱好者，专门收集稀有摇滚唱片',
    baseAppearanceChance: 0.05,
    albumBonusMultiplier: 2.0,
    budgetMultiplier: 2.2,
    satisfactionBonus: 12,
    requiredAlbumIds: ['album-rock-1', 'album-rock-2'],
    isUnlocked: false
  },
  {
    id: 'sc-pop-diva',
    name: '流行天后',
    avatar: '👸',
    description: '一位富有的流行音乐收藏家，追求完美品相',
    baseAppearanceChance: 0.03,
    albumBonusMultiplier: 2.5,
    budgetMultiplier: 3.0,
    satisfactionBonus: 20,
    requiredAlbumIds: ['album-pop-1', 'album-rare-2'],
    isUnlocked: false
  },
  {
    id: 'sc-rare-hunter',
    name: '珍品猎人',
    avatar: '🔍',
    description: '专门寻找稀有唱片的神秘收藏家，出手阔绰',
    baseAppearanceChance: 0.02,
    albumBonusMultiplier: 3.0,
    budgetMultiplier: 3.5,
    satisfactionBonus: 25,
    requiredAlbumIds: ['album-rare-1', 'album-genre-1'],
    isUnlocked: false
  },
  {
    id: 'sc-music-professor',
    name: '音乐教授',
    avatar: '🎓',
    description: '一位音乐学院的教授，知识面广，收藏品味独特',
    baseAppearanceChance: 0.04,
    albumBonusMultiplier: 1.8,
    budgetMultiplier: 2.0,
    satisfactionBonus: 18,
    requiredAlbumIds: ['album-classical-1', 'album-jazz-1'],
    isUnlocked: false
  }
]

export const checkAlbumActivation = (entry: AlbumEntry, collection: { record: { id: string; rarity: number }, conditionScore: number }[]): boolean => {
  if (entry.isActivated) return true

  const meetsRequirements = entry.requiredRecordIds.every(recordId => {
    const item = collection.find(c => c.record.id === recordId)
    if (!item) return false
    return item.conditionScore >= entry.requiredMinCondition &&
           item.record.rarity >= entry.requiredMinRarity
  })

  return meetsRequirements
}

export const activateAlbum = (entry: AlbumEntry): AlbumEntry => {
  return {
    ...entry,
    isActivated: true,
    activatedDate: Date.now()
  }
}

export const calculateTotalAlbumBonus = (
  activatedBonuses: AlbumBonus[],
  bonusType: AlbumBonusType
): number => {
  return activatedBonuses
    .filter(b => b.type === bonusType)
    .reduce((sum, b) => sum + b.value, 0)
}

export const getActivatedBonuses = (categories: AlbumCategory[]): AlbumBonus[] => {
  const bonuses: AlbumBonus[] = []
  for (const category of categories) {
    for (const entry of category.entries) {
      if (entry.isActivated) {
        bonuses.push(...entry.bonuses)
      }
    }
  }
  return bonuses
}

export const getTotalAlbumStats = (categories: AlbumCategory[]) => {
  let totalActivated = 0
  let totalAvailable = 0

  for (const category of categories) {
    for (const entry of category.entries) {
      totalAvailable++
      if (entry.isActivated) {
        totalActivated++
      }
    }
  }

  return { totalActivated, totalAvailable }
}

export const getCollectionValueBonus = (totalValue: number): CollectionBonus[] => {
  const bonuses: CollectionBonus[] = []

  if (totalValue >= 5000) {
    bonuses.push({
      source: 'high_value',
      sourceId: 'value-5000',
      bonusType: 'reputation',
      value: 3,
      description: '收藏价值 ¥5,000 达成：声望 +3'
    })
  }
  if (totalValue >= 10000) {
    bonuses.push({
      source: 'high_value',
      sourceId: 'value-10000',
      bonusType: 'customer_budget',
      value: 0.05,
      description: '收藏价值 ¥10,000 达成：顾客预算 +5%'
    })
  }
  if (totalValue >= 25000) {
    bonuses.push({
      source: 'high_value',
      sourceId: 'value-25000',
      bonusType: 'level_reward',
      value: 0.08,
      description: '收藏价值 ¥25,000 达成：关卡奖励 +8%'
    })
  }
  if (totalValue >= 50000) {
    bonuses.push({
      source: 'high_value',
      sourceId: 'value-50000',
      bonusType: 'special_customer',
      value: 0.1,
      description: '收藏价值 ¥50,000 达成：特殊顾客 +10%'
    })
  }

  return bonuses
}

export const getFavoriteBonuses = (favoriteCount: number): CollectionBonus[] => {
  const bonuses: CollectionBonus[] = []

  if (favoriteCount >= 5) {
    bonuses.push({
      source: 'favorite',
      sourceId: 'fav-5',
      bonusType: 'reputation',
      value: 2,
      description: '5张心爱收藏：声望 +2'
    })
  }
  if (favoriteCount >= 10) {
    bonuses.push({
      source: 'favorite',
      sourceId: 'fav-10',
      bonusType: 'buy_chance',
      value: 0.03,
      description: '10张心爱收藏：购买概率 +3%'
    })
  }
  if (favoriteCount >= 20) {
    bonuses.push({
      source: 'favorite',
      sourceId: 'fav-20',
      bonusType: 'match_score',
      value: 5,
      description: '20张心爱收藏：匹配度 +5'
    })
  }

  return bonuses
}
