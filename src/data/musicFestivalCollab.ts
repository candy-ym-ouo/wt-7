import type {
  MusicFestivalCollabTheme,
  MusicFestivalLimitedRecord,
  MusicFestivalCollabCustomer,
  MusicFestivalCollabTask,
  MusicFestivalCollabCollectionBadge,
  MusicFestivalCollabRewardTier,
  MusicFestivalCollabRarity,
  Record,
  MusicFestivalCollabState
} from '@/types'
import { allRecords } from './records'

export const collabThemes: MusicFestivalCollabTheme[] = [
  {
    id: 'mfc_rock_revival',
    name: '摇滚复兴音乐节',
    icon: '🎸',
    description: '与传奇摇滚音乐节联名，重现黄金年代的热血与激情。限量发行经典摇滚唱片，吸引狂热摇滚乐迷！',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #e94560 70%, #0f3460 100%)',
    accentColor: '#e94560',
    genreAffinity: ['Rock', 'Blues', 'Funk'],
    startDay: 0,
    endDay: 7,
    isActive: false,
    isUnlocked: true,
    requiredReputation: 30,
    requiredLevel: 2
  },
  {
    id: 'mfc_jazz_nights',
    name: '午夜爵士音乐节',
    icon: '🎷',
    description: '联合国际爵士音乐节，推出珍藏爵士唱片。在氤氲的夜色中，与爵士爱好者共赴一场听觉盛宴。',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #4a5568 70%, #2d3748 100%)',
    accentColor: '#f6ad55',
    genreAffinity: ['Jazz', 'Soul', 'Blues'],
    startDay: 0,
    endDay: 7,
    isActive: false,
    isUnlocked: true,
    requiredReputation: 40,
    requiredLevel: 3
  },
  {
    id: 'mfc_electric_dreams',
    name: '电音梦境音乐节',
    icon: '🎧',
    description: '与顶级电子音乐节跨界合作，发行限定电子唱片。霓虹闪烁中，感受未来之声的无限可能。',
    bgGradient: 'linear-gradient(135deg, #553c9a 0%, #6b46c1 30%, #b794f4 70%, #805ad5 100%)',
    accentColor: '#9f7aea',
    genreAffinity: ['Electronic', 'Disco', 'Funk'],
    startDay: 0,
    endDay: 7,
    isActive: false,
    isUnlocked: false,
    requiredReputation: 50,
    requiredLevel: 4
  },
  {
    id: 'mfc_folk_hearts',
    name: '民谣之心音乐节',
    icon: '🎤',
    description: '携手民谣音乐节，推出珍贵民谣合集。在木吉他的吟唱中，回归音乐最纯粹的感动。',
    bgGradient: 'linear-gradient(135deg, #276749 0%, #2f855a 30%, #68d391 70%, #38a169 100%)',
    accentColor: '#68d391',
    genreAffinity: ['Folk', 'Pop', 'Classical'],
    startDay: 0,
    endDay: 7,
    isActive: false,
    isUnlocked: false,
    requiredReputation: 60,
    requiredLevel: 5
  }
]

const createLimitedRecord = (
  baseRecord: Record,
  themeId: string,
  rarity: MusicFestivalCollabRarity,
  priceMultiplier: number,
  stock: number,
  isExclusive: boolean,
  bonusDescription: string
): MusicFestivalLimitedRecord => ({
  id: `mfc_rec_${baseRecord.id}_${themeId}`,
  record: {
    ...baseRecord,
    id: `mfc_${baseRecord.id}_${themeId}`,
    title: `【联名限定】${baseRecord.title}`,
    rarity: Math.min(5, baseRecord.rarity + (rarity === 'legendary' ? 1 : 0)) as 1 | 2 | 3 | 4 | 5,
    marketPrice: Math.floor(baseRecord.marketPrice * priceMultiplier)
  },
  collabThemeId: themeId,
  limitedStock: stock,
  remainingStock: stock,
  collabPrice: Math.floor(baseRecord.costPrice * priceMultiplier * 1.2),
  originalPrice: baseRecord.marketPrice,
  isExclusive,
  rarity,
  releaseDate: Date.now(),
  unlockCondition: isExclusive ? '完成3个联名任务解锁' : '活动期间可购买',
  isUnlocked: !isExclusive,
  soldCount: 0,
  bonusDescription
})

export const generateLimitedRecords = (): MusicFestivalLimitedRecord[] => {
  const records: MusicFestivalLimitedRecord[] = []
  
  const rockRecords = allRecords.filter(r => r.genre === 'Rock').slice(0, 4)
  if (rockRecords.length >= 4) {
    records.push(createLimitedRecord(rockRecords[0], 'mfc_rock_revival', 'legendary', 2.5, 10, true, '购买附赠音乐节纪念海报'))
    records.push(createLimitedRecord(rockRecords[1], 'mfc_rock_revival', 'epic', 2.0, 20, false, '限量编号版'))
    records.push(createLimitedRecord(rockRecords[2], 'mfc_rock_revival', 'rare', 1.5, 30, false, '附赠摇滚贴纸'))
    records.push(createLimitedRecord(rockRecords[3], 'mfc_rock_revival', 'common', 1.2, 50, false, '基础联名款'))
  }

  const jazzRecords = allRecords.filter(r => r.genre === 'Jazz').slice(0, 4)
  if (jazzRecords.length >= 4) {
    records.push(createLimitedRecord(jazzRecords[0], 'mfc_jazz_nights', 'legendary', 2.5, 10, true, '购买附赠爵士乐手签名照'))
    records.push(createLimitedRecord(jazzRecords[1], 'mfc_jazz_nights', 'epic', 2.0, 20, false, '限量编号版'))
    records.push(createLimitedRecord(jazzRecords[2], 'mfc_jazz_nights', 'rare', 1.5, 30, false, '附赠爵士明信片'))
    records.push(createLimitedRecord(jazzRecords[3], 'mfc_jazz_nights', 'common', 1.2, 50, false, '基础联名款'))
  }

  const electronicRecords = allRecords.filter(r => r.genre === 'Electronic' || r.genre === 'Disco').slice(0, 4)
  if (electronicRecords.length >= 4) {
    records.push(createLimitedRecord(electronicRecords[0], 'mfc_electric_dreams', 'legendary', 2.5, 10, true, '购买附赠电音混音带'))
    records.push(createLimitedRecord(electronicRecords[1], 'mfc_electric_dreams', 'epic', 2.0, 20, false, '限量编号版'))
    records.push(createLimitedRecord(electronicRecords[2], 'mfc_electric_dreams', 'rare', 1.5, 30, false, '附赠荧光手环'))
    records.push(createLimitedRecord(electronicRecords[3], 'mfc_electric_dreams', 'common', 1.2, 50, false, '基础联名款'))
  }

  const folkRecords = allRecords.filter(r => r.genre === 'Folk' || r.genre === 'Pop').slice(0, 4)
  if (folkRecords.length >= 4) {
    records.push(createLimitedRecord(folkRecords[0], 'mfc_folk_hearts', 'legendary', 2.5, 10, true, '购买附赠民谣吉他拨片套装'))
    records.push(createLimitedRecord(folkRecords[1], 'mfc_folk_hearts', 'epic', 2.0, 20, false, '限量编号版'))
    records.push(createLimitedRecord(folkRecords[2], 'mfc_folk_hearts', 'rare', 1.5, 30, false, '附赠民谣歌词本'))
    records.push(createLimitedRecord(folkRecords[3], 'mfc_folk_hearts', 'common', 1.2, 50, false, '基础联名款'))
  }

  return records
}

export const collabCustomers: MusicFestivalCollabCustomer[] = [
  {
    id: 'mfc_cust_rock_01',
    name: '摇滚老炮·阿烈',
    avatar: '🤘',
    title: '摇滚音乐节特邀嘉宾',
    description: '资深摇滚乐评人，收藏了上千张摇滚黑胶。只在摇滚复兴音乐节期间出没。',
    rarity: 'epic',
    favoriteGenres: ['Rock', 'Blues', 'Funk'],
    budgetMultiplier: 1.8,
    satisfactionBonus: 25,
    buyChanceBonus: 0.2,
    appearanceChance: 0.12,
    requiredReputation: 40,
    collabThemeId: 'mfc_rock_revival',
    isUnlocked: true,
    quotes: ['这才是真正的摇滚！', '我找这张专辑找了十年！', '价格不是问题，只要是好货。'],
    specialRewardId: 'mfc_badge_rock_legend',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_rock_02',
    name: '朋克少女·小爆',
    avatar: '💥',
    title: '摇滚音乐节新锐歌手',
    description: '新一代朋克乐队主唱，正在寻找创作灵感。',
    rarity: 'rare',
    favoriteGenres: ['Rock', 'Funk'],
    budgetMultiplier: 1.4,
    satisfactionBonus: 18,
    buyChanceBonus: 0.15,
    appearanceChance: 0.18,
    requiredReputation: 30,
    collabThemeId: 'mfc_rock_revival',
    isUnlocked: true,
    quotes: ['这和弦太对味了！', '能借我听一下吗？', '我要把它作为我新专辑的参考！'],
    specialRewardId: 'mfc_badge_rock_punk',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_jazz_01',
    name: '爵士绅士·老周',
    avatar: '🎩',
    title: '爵士音乐节艺术总监',
    description: '传奇爵士乐手，现在致力于推广爵士文化。',
    rarity: 'legendary',
    favoriteGenres: ['Jazz', 'Soul', 'Blues'],
    budgetMultiplier: 2.2,
    satisfactionBonus: 35,
    buyChanceBonus: 0.25,
    appearanceChance: 0.08,
    requiredReputation: 55,
    collabThemeId: 'mfc_jazz_nights',
    isUnlocked: true,
    quotes: ['这即兴演奏太精彩了！', '年轻人，你很有品味。', '这张唱片的音质堪称完美。'],
    specialRewardId: 'mfc_badge_jazz_maestro',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_jazz_02',
    name: '蓝调歌手·小岚',
    avatar: '🎙️',
    title: '爵士音乐节表演嘉宾',
    description: '冉冉升起的爵士新星，正在收集经典唱片学习。',
    rarity: 'epic',
    favoriteGenres: ['Jazz', 'Blues', 'Soul'],
    budgetMultiplier: 1.6,
    satisfactionBonus: 22,
    buyChanceBonus: 0.18,
    appearanceChance: 0.12,
    requiredReputation: 40,
    collabThemeId: 'mfc_jazz_nights',
    isUnlocked: true,
    quotes: ['这转音处理得太妙了！', '能学到太多东西了！', '请问还有同类型的推荐吗？'],
    specialRewardId: 'mfc_badge_jazz_vocal',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_electronic_01',
    name: 'DJ大神·电音王',
    avatar: '🎚️',
    title: '电音音乐节头牌DJ',
    description: '国际知名电子音乐制作人，寻找独特的采样素材。',
    rarity: 'legendary',
    favoriteGenres: ['Electronic', 'Disco', 'Funk'],
    budgetMultiplier: 2.0,
    satisfactionBonus: 30,
    buyChanceBonus: 0.22,
    appearanceChance: 0.08,
    requiredReputation: 60,
    collabThemeId: 'mfc_electric_dreams',
    isUnlocked: false,
    quotes: ['这个采样太绝了！', '我要把它remix成炸场神曲！', '还有更多这种风格的吗？'],
    specialRewardId: 'mfc_badge_electronic_legend',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_electronic_02',
    name: '派对女王·霓娜',
    avatar: '💃',
    title: '电音音乐节常客',
    description: '顶级夜店驻场DJ，收集各种舞曲唱片。',
    rarity: 'epic',
    favoriteGenres: ['Electronic', 'Disco'],
    budgetMultiplier: 1.5,
    satisfactionBonus: 20,
    buyChanceBonus: 0.15,
    appearanceChance: 0.15,
    requiredReputation: 45,
    collabThemeId: 'mfc_electric_dreams',
    isUnlocked: false,
    quotes: ['这BPM正好！', '今晚的派对就用它了！', '这节奏太上头了！'],
    specialRewardId: 'mfc_badge_electronic_party',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_folk_01',
    name: '民谣诗人·萧然',
    avatar: '🎸',
    title: '民谣音乐节压轴歌手',
    description: '知名民谣创作人，一直在寻找能打动人心的旋律。',
    rarity: 'legendary',
    favoriteGenres: ['Folk', 'Pop', 'Classical'],
    budgetMultiplier: 1.9,
    satisfactionBonus: 28,
    buyChanceBonus: 0.2,
    appearanceChance: 0.08,
    requiredReputation: 65,
    collabThemeId: 'mfc_folk_hearts',
    isUnlocked: false,
    quotes: ['这首歌让我想起了故乡...', '真正的音乐是有灵魂的。', '谢谢你让我听到这么美的旋律。'],
    specialRewardId: 'mfc_badge_folk_poet',
    encounterCount: 0
  },
  {
    id: 'mfc_cust_folk_02',
    name: '背包歌手·小鹿',
    avatar: '🦌',
    title: '民谣音乐节新锐',
    description: '流浪歌手，用音乐记录旅途中的故事。',
    rarity: 'epic',
    favoriteGenres: ['Folk', 'Pop'],
    budgetMultiplier: 1.3,
    satisfactionBonus: 18,
    buyChanceBonus: 0.15,
    appearanceChance: 0.15,
    requiredReputation: 50,
    collabThemeId: 'mfc_folk_hearts',
    isUnlocked: false,
    quotes: ['这歌词写得太好了！', '我要把它唱给路上的人们听。', '音乐就是最好的旅行。'],
    specialRewardId: 'mfc_badge_folk_travel',
    encounterCount: 0
  }
]

export const generateCollabTasks = (themeId: string): MusicFestivalCollabTask[] => {
  const theme = collabThemes.find(t => t.id === themeId)
  if (!theme) return []

  const tasks: MusicFestivalCollabTask[] = []

  tasks.push({
    id: `mfc_task_${themeId}_sales_1`,
    type: 'sales',
    name: '联名开门红',
    icon: '💰',
    description: '活动期间售出5张联名唱片',
    target: 5,
    current: 0,
    status: 'active',
    collabThemeId: themeId,
    reward: {
      budget: 500,
      reputation: 10,
      growthPoints: 50,
      bonusItems: ['音乐节周边礼包']
    },
    requiredTaskIds: [],
    requiredDay: 1
  })

  tasks.push({
    id: `mfc_task_${themeId}_sales_2`,
    type: 'sales',
    name: '销售达人',
    icon: '🏆',
    description: '活动期间售出15张联名唱片',
    target: 15,
    current: 0,
    status: 'locked',
    collabThemeId: themeId,
    reward: {
      budget: 1500,
      reputation: 25,
      growthPoints: 150,
      bonusItems: ['限定唱片解锁券']
    },
    requiredTaskIds: [`mfc_task_${themeId}_sales_1`],
    requiredDay: 2
  })

  tasks.push({
    id: `mfc_task_${themeId}_genre_1`,
    type: 'genre',
    name: `${theme.genreAffinity[0]}专场`,
    icon: '🎵',
    description: `售出8张${theme.genreAffinity[0]}风格唱片`,
    target: 8,
    current: 0,
    status: 'active',
    collabThemeId: themeId,
    reward: {
      budget: 800,
      reputation: 15,
      growthPoints: 80,
      bonusItems: ['风格主题海报']
    },
    requiredTaskIds: [],
    requiredDay: 1,
    genre: theme.genreAffinity[0]
  })

  if (theme.genreAffinity.length > 1) {
    tasks.push({
      id: `mfc_task_${themeId}_genre_2`,
      type: 'genre',
      name: `${theme.genreAffinity[1]}爱好者`,
      icon: '🎶',
      description: `售出6张${theme.genreAffinity[1]}风格唱片`,
      target: 6,
      current: 0,
      status: 'locked',
      collabThemeId: themeId,
      reward: {
        budget: 600,
        reputation: 12,
        growthPoints: 60,
        bonusItems: ['风格精选 mixtape']
      },
      requiredTaskIds: [`mfc_task_${themeId}_genre_1`],
      requiredDay: 3,
      genre: theme.genreAffinity[1]
    })
  }

  tasks.push({
    id: `mfc_task_${themeId}_customer_1`,
    type: 'customer',
    name: '贵客临门',
    icon: '👤',
    description: '接待3位音乐节联名顾客',
    target: 3,
    current: 0,
    status: 'active',
    collabThemeId: themeId,
    reward: {
      budget: 1000,
      reputation: 20,
      growthPoints: 100,
      bonusItems: ['VIP顾客专属名片']
    },
    requiredTaskIds: [],
    requiredDay: 1
  })

  tasks.push({
    id: `mfc_task_${themeId}_customer_2`,
    type: 'customer',
    name: '传奇邂逅',
    icon: '⭐',
    description: '接待1位传奇级联名顾客',
    target: 1,
    current: 0,
    status: 'locked',
    collabThemeId: themeId,
    reward: {
      budget: 2000,
      reputation: 40,
      growthPoints: 200,
      bonusItems: ['传奇顾客签名照'],
      collectionBadgeId: `mfc_badge_${themeId.split('_').slice(-1)[0]}_legend`
    },
    requiredTaskIds: [`mfc_task_${themeId}_customer_1`],
    requiredDay: 5
  })

  tasks.push({
    id: `mfc_task_${themeId}_special_1`,
    type: 'special',
    name: '稀有收藏家',
    icon: '💎',
    description: '售出3张稀有及以上等级的联名唱片',
    target: 3,
    current: 0,
    status: 'active',
    collabThemeId: themeId,
    reward: {
      budget: 1200,
      reputation: 25,
      growthPoints: 120,
      bonusItems: ['稀有唱片展示架']
    },
    requiredTaskIds: [],
    requiredDay: 2,
    minRarity: 3
  })

  tasks.push({
    id: `mfc_task_${themeId}_atmosphere_1`,
    type: 'atmosphere',
    name: '氛围营造者',
    icon: '✨',
    description: '活动期间播放20首联名主题风格唱片',
    target: 20,
    current: 0,
    status: 'active',
    collabThemeId: themeId,
    reward: {
      budget: 600,
      reputation: 15,
      growthPoints: 60,
      bonusItems: ['氛围灯光套装']
    },
    requiredTaskIds: [],
    requiredDay: 1
  })

  return tasks
}

export const collabBadges: MusicFestivalCollabCollectionBadge[] = [
  {
    id: 'mfc_badge_rock_legend',
    name: '摇滚传奇',
    icon: '🏅',
    description: '成功接待摇滚老炮·阿烈后解锁。摇滚唱片销售利润+5%。',
    rarity: 'epic',
    collabThemeId: 'mfc_rock_revival',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待摇滚老炮·阿烈',
    bonusEffect: '摇滚唱片销售利润加成',
    bonusValue: 0.05
  },
  {
    id: 'mfc_badge_rock_punk',
    name: '朋克先锋',
    icon: '🎖️',
    description: '成功接待朋克少女·小爆后解锁。新顾客到访率+3%。',
    rarity: 'rare',
    collabThemeId: 'mfc_rock_revival',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待朋克少女·小爆',
    bonusEffect: '新顾客到访率加成',
    bonusValue: 0.03
  },
  {
    id: 'mfc_badge_jazz_maestro',
    name: '爵士大师',
    icon: '🏆',
    description: '成功接待爵士绅士·老周后解锁。爵士唱片满意度+10%。',
    rarity: 'legendary',
    collabThemeId: 'mfc_jazz_nights',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待爵士绅士·老周',
    bonusEffect: '爵士唱片满意度加成',
    bonusValue: 0.1
  },
  {
    id: 'mfc_badge_jazz_vocal',
    name: '爵士名伶',
    icon: '🎗️',
    description: '成功接待蓝调歌手·小岚后解锁。Soul唱片售价+3%。',
    rarity: 'epic',
    collabThemeId: 'mfc_jazz_nights',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待蓝调歌手·小岚',
    bonusEffect: 'Soul唱片售价加成',
    bonusValue: 0.03
  },
  {
    id: 'mfc_badge_electronic_legend',
    name: '电音传奇',
    icon: '🎚️',
    description: '成功接待DJ大神·电音王后解锁。Electronic唱片利润+8%。',
    rarity: 'legendary',
    collabThemeId: 'mfc_electric_dreams',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待DJ大神·电音王',
    bonusEffect: 'Electronic唱片利润加成',
    bonusValue: 0.08
  },
  {
    id: 'mfc_badge_electronic_party',
    name: '派对达人',
    icon: '🎉',
    description: '成功接待派对女王·霓娜后解锁。夜场客流+5%。',
    rarity: 'epic',
    collabThemeId: 'mfc_electric_dreams',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待派对女王·霓娜',
    bonusEffect: '夜场客流加成',
    bonusValue: 0.05
  },
  {
    id: 'mfc_badge_folk_poet',
    name: '民谣诗人',
    icon: '📜',
    description: '成功接待民谣诗人·萧然后解锁。Folk唱片成交率+5%。',
    rarity: 'legendary',
    collabThemeId: 'mfc_folk_hearts',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待民谣诗人·萧然',
    bonusEffect: 'Folk唱片成交率加成',
    bonusValue: 0.05
  },
  {
    id: 'mfc_badge_folk_travel',
    name: '旅途歌者',
    icon: '🎒',
    description: '成功接待背包歌手·小鹿后解锁。会员转化率+3%。',
    rarity: 'epic',
    collabThemeId: 'mfc_folk_hearts',
    isUnlocked: false,
    unlockedDate: null,
    unlockCondition: '接待背包歌手·小鹿',
    bonusEffect: '会员转化率加成',
    bonusValue: 0.03
  }
]

export const collabRewardTiers: MusicFestivalCollabRewardTier[] = [
  {
    tier: 'bronze',
    tierName: '青铜参与奖',
    icon: '🥉',
    minScore: 100,
    rewards: {
      budget: 1000,
      reputation: 20,
      growthPoints: 100,
      bonusItems: ['音乐节纪念徽章']
    },
    description: '参与即是胜利！'
  },
  {
    tier: 'silver',
    tierName: '白银进取奖',
    icon: '🥈',
    minScore: 300,
    rewards: {
      budget: 2500,
      reputation: 50,
      growthPoints: 250,
      bonusItems: ['音乐节纪念T恤', '折扣券x1']
    },
    description: '努力付出，收获满满！'
  },
  {
    tier: 'gold',
    tierName: '黄金精英奖',
    icon: '🥇',
    minScore: 600,
    rewards: {
      budget: 5000,
      reputation: 100,
      growthPoints: 500,
      bonusItems: ['音乐节VIP门票', '限定唱片x1', '折扣券x2']
    },
    description: '精英中的佼佼者！'
  },
  {
    tier: 'platinum',
    tierName: '铂金传奇奖',
    icon: '💎',
    minScore: 1000,
    rewards: {
      budget: 10000,
      reputation: 200,
      growthPoints: 1000,
      bonusItems: ['音乐节终身VIP', '传奇限定唱片x1', '折扣券x3'],
      collectionBadgeId: 'mfc_badge_platinum_collaborator'
    },
    description: '你就是传奇！'
  },
  {
    tier: 'legendary',
    tierName: '传说联名奖',
    icon: '👑',
    minScore: 1500,
    rewards: {
      budget: 20000,
      reputation: 400,
      growthPoints: 2000,
      bonusItems: ['音乐节荣誉合伙人称号', '全系列限定唱片', '无限折扣券'],
      collectionBadgeId: 'mfc_badge_legendary_collaborator'
    },
    description: '载入史册的合作！'
  }
]

export const getRarityLabel = (rarity: MusicFestivalCollabRarity): string => {
  const labels: { [key in MusicFestivalCollabRarity]: string } = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity]
}

export const getRarityColor = (rarity: MusicFestivalCollabRarity): string => {
  const colors: { [key in MusicFestivalCollabRarity]: string } = {
    common: '#718096',
    rare: '#48bb78',
    epic: '#805ad5',
    legendary: '#d69e2e'
  }
  return colors[rarity]
}

export const getTaskTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    sales: '销售',
    genre: '风格',
    customer: '顾客',
    collection: '收藏',
    special: '特殊',
    atmosphere: '氛围'
  }
  return labels[type] || type
}

export const getTaskStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    locked: '未解锁',
    active: '进行中',
    completed: '已完成',
    claimed: '已领取'
  }
  return labels[status] || status
}

export const getTaskStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    locked: '#a0aec0',
    active: '#4299e1',
    completed: '#48bb78',
    claimed: '#718096'
  }
  return colors[status] || '#718096'
}

export const getRewardTierColor = (tier: string | number): string => {
  const tierNum = typeof tier === 'string' ? parseInt(tier) : tier
  const colors: { [key: number]: string } = {
    1: '#cd7f32',
    2: '#c0c0c0',
    3: '#ffd700',
    4: '#e5e4e2'
  }
  return colors[tierNum] || '#718096'
}

export const getThemeName = (themeId: string): string => {
  const theme = collabThemes.find(t => t.id === themeId)
  return theme ? theme.name : themeId
}

export const getRewardTierByScore = (score: number): MusicFestivalCollabRewardTier => {
  for (let i = collabRewardTiers.length - 1; i >= 0; i--) {
    if (score >= collabRewardTiers[i].minScore) {
      return collabRewardTiers[i]
    }
  }
  return collabRewardTiers[0]
}

export const getThemeConfig = (themeId: string): MusicFestivalCollabTheme | undefined => {
  return collabThemes.find(t => t.id === themeId)
}

export const calculateCollabScore = (
  limitedRecordsSold: number,
  collabCustomersServed: number,
  tasksCompleted: number,
  totalTasks: number
): number => {
  return (
    limitedRecordsSold * 10 +
    collabCustomersServed * 50 +
    tasksCompleted * 30 +
    Math.floor((tasksCompleted / Math.max(totalTasks, 1)) * 200)
  )
}

export const getCustomerRefreshCost = (collabDay: number): number => {
  return 200 + collabDay * 50
}

export const canRefreshCustomers = (lastRefreshDay: number, currentDay: number, cooldown: number): boolean => {
  return currentDay - lastRefreshDay >= cooldown
}

export const createInitialMusicFestivalCollabState = (): MusicFestivalCollabState => ({
  activeTheme: null,
  collabDay: 0,
  maxCollabDays: 7,
  themes: JSON.parse(JSON.stringify(collabThemes)),
  limitedRecords: generateLimitedRecords(),
  collabCustomers: JSON.parse(JSON.stringify(collabCustomers)),
  tasks: [],
  settlements: [],
  badges: JSON.parse(JSON.stringify(collabBadges)),
  totalCollabScore: 0,
  limitedRecordsSold: 0,
  collabCustomersServed: 0,
  tasksCompleted: 0,
  isCollabActive: false,
  hasUnclaimedRewards: false,
  customerRefreshCooldown: 1,
  lastRefreshDay: -2,
  activeCollabCustomerIds: []
})
