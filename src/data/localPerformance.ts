import type {
  LocalPerfArtist,
  LocalPerfListeningEvent,
  LocalPerfLimitedItem,
  LocalPerfTask,
  LocalPerfReputationTier,
  LocalPerfArtistRarity,
  LocalPerfBonusSummary,
  LocalPerformanceState
} from '@/types'
import { allRecords } from './records'

export const localPerfArtists: LocalPerfArtist[] = [
  {
    id: 'lp_artist_jazz_01',
    name: '萨克斯手·老陈',
    avatar: '🎷',
    title: '街角爵士传奇',
    description: '三十年爵士生涯，每晚在老街角吹响萨克斯。他的驻店演出能让爵士爱好者流连忘返。',
    rarity: 'common',
    genre: 'Jazz',
    subGenres: ['Blues', 'Soul'],
    performanceType: 'live_show',
    residencyDays: 3,
    costPerDay: 200,
    minReputation: 20,
    minLevel: 2,
    isUnlocked: true,
    customerAttractBonus: 0.08,
    atmosphereBonus: 12,
    satisfactionBonus: 10,
    buyChanceBonus: 0.05,
    quotes: ['今晚的曲子，献给每一位驻足的旅人。', '音乐是最好的邀请函。', '来，让我用旋律为你打开一扇门。'],
    specialRewardId: 'lp_badge_jazz_corner'
  },
  {
    id: 'lp_artist_rock_01',
    name: '吉他少女·小焰',
    avatar: '🎸',
    title: '车库摇滚新星',
    description: '年轻但充满力量的摇滚吉他手，现场表演极具感染力。她的到来总能让店内热闹非凡。',
    rarity: 'rare',
    genre: 'Rock',
    subGenres: ['Funk', 'Blues'],
    performanceType: 'live_show',
    residencyDays: 4,
    costPerDay: 350,
    minReputation: 30,
    minLevel: 3,
    isUnlocked: true,
    customerAttractBonus: 0.12,
    atmosphereBonus: 18,
    satisfactionBonus: 15,
    buyChanceBonus: 0.08,
    quotes: ['让我用吉他炸翻全场！', '摇滚不只是音乐，是一种态度！', '这把吉他就是我的武器。'],
    specialRewardId: 'lp_badge_rock_flame'
  },
  {
    id: 'lp_artist_folk_01',
    name: '民谣诗人·林溪',
    avatar: '🎤',
    title: '城市吟游者',
    description: '用吉他和口琴编织故事的民谣歌手，擅长营造温馨的试听氛围，让顾客在音乐中找到共鸣。',
    rarity: 'rare',
    genre: 'Folk',
    subGenres: ['Pop', 'Classical'],
    performanceType: 'listening_session',
    residencyDays: 5,
    costPerDay: 280,
    minReputation: 35,
    minLevel: 3,
    isUnlocked: true,
    customerAttractBonus: 0.10,
    atmosphereBonus: 15,
    satisfactionBonus: 18,
    buyChanceBonus: 0.06,
    quotes: ['每首歌都是一个未完的故事。', '安静地听，你会听到心跳。', '音乐是最好的安眠药。'],
    specialRewardId: 'lp_badge_folk_poet'
  },
  {
    id: 'lp_artist_electronic_01',
    name: 'DJ脉冲·零号',
    avatar: '🎧',
    title: '地下电子先锋',
    description: '擅长电子混音与现场即兴的DJ，他的签售会总能吸引大批电子乐迷，限定混音带一碟难求。',
    rarity: 'epic',
    genre: 'Electronic',
    subGenres: ['Disco', 'Funk'],
    performanceType: 'signing_event',
    residencyDays: 3,
    costPerDay: 500,
    minReputation: 50,
    minLevel: 4,
    isUnlocked: false,
    customerAttractBonus: 0.15,
    atmosphereBonus: 22,
    satisfactionBonus: 20,
    buyChanceBonus: 0.12,
    quotes: ['让节拍接管一切。', '每一个BPM都是一次心跳。', '今晚，我们都是频率的同谋。'],
    specialRewardId: 'lp_badge_electronic_pulse'
  },
  {
    id: 'lp_artist_soul_01',
    name: '灵魂歌者·晨曦',
    avatar: '🎙️',
    title: '午夜灵魂之声',
    description: '极具穿透力的灵魂乐歌手，她的专辑试听会让人沉醉其中，夜场演出更是座无虚席。',
    rarity: 'epic',
    genre: 'Soul',
    subGenres: ['Jazz', 'Blues'],
    performanceType: 'album_preview',
    residencyDays: 5,
    costPerDay: 450,
    minReputation: 55,
    minLevel: 4,
    isUnlocked: false,
    customerAttractBonus: 0.14,
    atmosphereBonus: 20,
    satisfactionBonus: 22,
    buyChanceBonus: 0.10,
    quotes: ['灵魂不需要翻译。', '闭上眼，让声音带你旅行。', '每一首歌都是一次治愈。'],
    specialRewardId: 'lp_badge_soul_voice'
  },
  {
    id: 'lp_artist_classical_01',
    name: '钢琴师·暮白',
    avatar: '🎹',
    title: '古典唱片守护者',
    description: '低调而神秘的钢琴大师，极少公开演出。一旦驻店，将带来史无前例的古典音乐盛事。',
    rarity: 'legendary',
    genre: 'Classical',
    subGenres: ['Jazz', 'Folk'],
    performanceType: 'listening_session',
    residencyDays: 7,
    costPerDay: 800,
    minReputation: 70,
    minLevel: 5,
    isUnlocked: false,
    customerAttractBonus: 0.20,
    atmosphereBonus: 30,
    satisfactionBonus: 28,
    buyChanceBonus: 0.15,
    quotes: ['静默是最宏大的序曲。', '黑白之间，是无限的色彩。', '音乐不在指尖，在心中。'],
    specialRewardId: 'lp_badge_classical_master'
  }
]

export const localPerfListeningEvents: LocalPerfListeningEvent[] = [
  {
    id: 'lp_event_jazz_night',
    artistId: 'lp_artist_jazz_01',
    name: '爵士微醺夜',
    icon: '🌙',
    description: '在萨克斯的旋律中，为顾客呈现一场沉浸式爵士试听体验。客流与满意度双提升！',
    type: 'listening_session',
    genreFocus: 'Jazz',
    durationDays: 2,
    cost: 300,
    customerAttractModifier: 0.15,
    satisfactionBonus: 12,
    buyChanceBonus: 0.08,
    playBoostBonus: 3,
    reputationBonus: 8,
    minArtistRarity: 'common',
    isUnlocked: true,
    timesHeld: 0
  },
  {
    id: 'lp_event_rock_live',
    artistId: 'lp_artist_rock_01',
    name: '车库现场',
    icon: '🔥',
    description: '热血摇滚现场演出！年轻乐迷蜂拥而至，现场气氛燃到爆。',
    type: 'live_show',
    genreFocus: 'Rock',
    durationDays: 1,
    cost: 500,
    customerAttractModifier: 0.20,
    satisfactionBonus: 15,
    buyChanceBonus: 0.12,
    playBoostBonus: 5,
    reputationBonus: 12,
    minArtistRarity: 'rare',
    isUnlocked: true,
    timesHeld: 0
  },
  {
    id: 'lp_event_folk_garden',
    artistId: 'lp_artist_folk_01',
    name: '民谣花园',
    icon: '🌿',
    description: '温馨的民谣弹唱之夜，在轻柔的旋律中品味音乐的美好。适合吸引文艺顾客。',
    type: 'listening_session',
    genreFocus: 'Folk',
    durationDays: 3,
    cost: 400,
    customerAttractModifier: 0.12,
    satisfactionBonus: 18,
    buyChanceBonus: 0.06,
    playBoostBonus: 2,
    reputationBonus: 10,
    minArtistRarity: 'rare',
    isUnlocked: true,
    timesHeld: 0
  },
  {
    id: 'lp_event_electronic_rave',
    artistId: 'lp_artist_electronic_01',
    name: '脉冲派对',
    icon: '⚡',
    description: '地下电子音乐签售混音带，限量发售！电音爱好者绝不会错过。',
    type: 'signing_event',
    genreFocus: 'Electronic',
    durationDays: 1,
    cost: 800,
    customerAttractModifier: 0.25,
    satisfactionBonus: 20,
    buyChanceBonus: 0.15,
    playBoostBonus: 6,
    reputationBonus: 15,
    minArtistRarity: 'epic',
    isUnlocked: false,
    timesHeld: 0
  },
  {
    id: 'lp_event_soul_midnight',
    artistId: 'lp_artist_soul_01',
    name: '午夜灵魂电台',
    icon: '📻',
    description: '灵魂歌者的新专辑试听会，每首歌曲都直击心灵。夜场客流大幅提升！',
    type: 'album_preview',
    genreFocus: 'Soul',
    durationDays: 2,
    cost: 600,
    customerAttractModifier: 0.18,
    satisfactionBonus: 22,
    buyChanceBonus: 0.10,
    playBoostBonus: 4,
    reputationBonus: 12,
    minArtistRarity: 'epic',
    isUnlocked: false,
    timesHeld: 0
  },
  {
    id: 'lp_event_classical_salon',
    artistId: 'lp_artist_classical_01',
    name: '暮白沙龙',
    icon: '🏛️',
    description: '传奇钢琴师的私人音乐沙龙，极少数人能获得邀请。声望与客流将获得巨大提升。',
    type: 'listening_session',
    genreFocus: 'Classical',
    durationDays: 3,
    cost: 1500,
    customerAttractModifier: 0.30,
    satisfactionBonus: 30,
    buyChanceBonus: 0.18,
    playBoostBonus: 8,
    reputationBonus: 25,
    minArtistRarity: 'legendary',
    isUnlocked: false,
    timesHeld: 0
  }
]

const generateLimitedItems = (): LocalPerfLimitedItem[] => {
  const items: LocalPerfLimitedItem[] = []
  const genreRecords: Record<string, typeof allRecords> = {}

  for (const r of allRecords) {
    if (!genreRecords[r.genre]) genreRecords[r.genre] = []
    genreRecords[r.genre].push(r)
  }

  const createItem = (
    artist: LocalPerfArtist,
    rarity: LocalPerfArtistRarity,
    priceMultiplier: number,
    stock: number,
    isExclusive: boolean,
    bonusDesc: string
  ): LocalPerfLimitedItem | null => {
    const records = genreRecords[artist.genre]
    if (!records || records.length === 0) return null
    const base = records[Math.floor(Math.random() * Math.min(3, records.length))]
    if (!base) return null
    return {
      id: `lp_lim_${artist.id}_${rarity}`,
      artistId: artist.id,
      recordId: base.id,
      recordTitle: `【驻店限定】${base.title}`,
      recordArtist: base.artist,
      genre: base.genre,
      limitedStock: stock,
      remainingStock: stock,
      originalPrice: base.marketPrice,
      collabPrice: Math.floor(base.costPrice * priceMultiplier * 1.3),
      isExclusive,
      rarity,
      bonusDescription: bonusDesc,
      status: 'available',
      soldCount: 0
    }
  }

  for (const artist of localPerfArtists) {
    const item1 = createItem(artist, artist.rarity, 2.0, 5, true, '驻店演出纪念版')
    const item2 = createItem(artist, 'common', 1.3, 15, false, '合作基础款')
    if (item1) items.push(item1)
    if (item2) items.push(item2)
  }

  return items
}

export const generateLocalPerfTasks = (): LocalPerfTask[] => [
  {
    id: 'lp_task_attract_1',
    name: '客流初潮',
    icon: '👥',
    description: '演出期间吸引15位顾客进店',
    target: 15,
    current: 0,
    status: 'active',
    reward: { budget: 500, reputation: 10, growthPoints: 50, bonusItems: ['演出海报'] },
    requiredTaskIds: [],
    requiredDay: 1
  },
  {
    id: 'lp_task_attract_2',
    name: '门庭若市',
    icon: '🏪',
    description: '演出期间吸引40位顾客进店',
    target: 40,
    current: 0,
    status: 'locked',
    reward: { budget: 1200, reputation: 25, growthPoints: 120, bonusItems: ['VIP休息区'] },
    requiredTaskIds: ['lp_task_attract_1'],
    requiredDay: 2
  },
  {
    id: 'lp_task_limited_1',
    name: '限定热销',
    icon: '💿',
    description: '售出5件驻店限定商品',
    target: 5,
    current: 0,
    status: 'active',
    reward: { budget: 600, reputation: 12, growthPoints: 60, bonusItems: ['限定版贴纸'] },
    requiredTaskIds: [],
    requiredDay: 1
  },
  {
    id: 'lp_task_limited_2',
    name: '销售冠军',
    icon: '🏆',
    description: '售出12件驻店限定商品',
    target: 12,
    current: 0,
    status: 'locked',
    reward: { budget: 1500, reputation: 30, growthPoints: 150, bonusItems: ['签名照收藏夹'] },
    requiredTaskIds: ['lp_task_limited_1'],
    requiredDay: 3
  },
  {
    id: 'lp_task_event_1',
    name: '活动达人',
    icon: '🎵',
    description: '举办3场试听活动',
    target: 3,
    current: 0,
    status: 'active',
    reward: { budget: 400, reputation: 8, growthPoints: 40, bonusItems: ['活动策划手册'] },
    requiredTaskIds: [],
    requiredDay: 1
  },
  {
    id: 'lp_task_satisfaction_1',
    name: '好评如潮',
    icon: '⭐',
    description: '演出期间顾客平均满意度达到80',
    target: 80,
    current: 0,
    status: 'active',
    reward: { budget: 800, reputation: 15, growthPoints: 80, bonusItems: ['品质认证标牌'] },
    requiredTaskIds: [],
    requiredDay: 2
  }
]

export const localPerfReputationTiers: LocalPerfReputationTier[] = [
  {
    tier: 'bronze',
    tierName: '铜奖·街头演出',
    icon: '🥉',
    minScore: 80,
    rewards: { budget: 800, reputation: 15, growthPoints: 80, bonusItems: ['街头演出纪念章'] },
    description: '小试牛刀，已初见成效！'
  },
  {
    tier: 'silver',
    tierName: '银奖·驻店之星',
    icon: '🥈',
    minScore: 200,
    rewards: { budget: 2000, reputation: 40, growthPoints: 200, bonusItems: ['驻店之星奖杯', '折扣券x1'] },
    description: '声名渐起，客流涌动！'
  },
  {
    tier: 'gold',
    tierName: '金奖·演出名家',
    icon: '🥇',
    minScore: 400,
    rewards: { budget: 4000, reputation: 80, growthPoints: 400, bonusItems: ['演出名家金牌', '限定唱片x1', '折扣券x2'] },
    description: '名扬一方，客似云来！'
  },
  {
    tier: 'platinum',
    tierName: '铂金奖·传奇舞台',
    icon: '💎',
    minScore: 700,
    rewards: { budget: 8000, reputation: 150, growthPoints: 800, bonusItems: ['传奇舞台冠冕', '全系列限定唱片', '无限折扣券'] },
    description: '你的店铺就是这座城市最闪耀的舞台！'
  }
]

export const getRarityLabel = (rarity: LocalPerfArtistRarity): string => {
  const labels: { [key in LocalPerfArtistRarity]: string } = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity]
}

export const getRarityColor = (rarity: LocalPerfArtistRarity): string => {
  const colors: { [key in LocalPerfArtistRarity]: string } = {
    common: '#718096',
    rare: '#48bb78',
    epic: '#805ad5',
    legendary: '#d69e2e'
  }
  return colors[rarity]
}

export const getEventTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    listening_session: '试听会',
    live_show: '现场演出',
    signing_event: '签售会',
    album_preview: '专辑试听'
  }
  return labels[type] || type
}

export const getEventTypeInfo = (type: string): { icon: string; color: string } => {
  const info: { [key: string]: { icon: string; color: string } } = {
    listening_session: { icon: '🎧', color: '#48bb78' },
    live_show: { icon: '🔥', color: '#e94560' },
    signing_event: { icon: '✍️', color: '#805ad5' },
    album_preview: { icon: '💿', color: '#f6ad55' }
  }
  return info[type] || { icon: '🎵', color: '#718096' }
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

export const getReputationTierByScore = (score: number): LocalPerfReputationTier => {
  for (let i = localPerfReputationTiers.length - 1; i >= 0; i--) {
    if (score >= localPerfReputationTiers[i].minScore) {
      return localPerfReputationTiers[i]
    }
  }
  return localPerfReputationTiers[0]
}

export const calculateLocalPerfScore = (
  customersAttracted: number,
  limitedSold: number,
  eventsHeld: number,
  tasksCompleted: number,
  totalTasks: number
): number => {
  return (
    customersAttracted * 3 +
    limitedSold * 15 +
    eventsHeld * 20 +
    tasksCompleted * 25 +
    Math.floor((tasksCompleted / Math.max(totalTasks, 1)) * 100)
  )
}

export const calculateLocalPerfBonusSummary = (
  residency: LocalPerformanceState['residency'],
  activeEvent: LocalPerformanceState['activeEvent'],
  artists: LocalPerfArtist[]
): LocalPerfBonusSummary => {
  const summary: LocalPerfBonusSummary = {
    customerAttractBonus: 0,
    atmosphereBonus: 0,
    satisfactionBonus: 0,
    buyChanceBonus: 0,
    playBoostBonus: 0,
    reputationDailyBonus: 0
  }

  if (residency && residency.status === 'performing') {
    const artist = artists.find(a => a.id === residency.artistId)
    if (artist) {
      summary.customerAttractBonus += artist.customerAttractBonus
      summary.atmosphereBonus += artist.atmosphereBonus
      summary.satisfactionBonus += artist.satisfactionBonus
      summary.buyChanceBonus += artist.buyChanceBonus
      summary.reputationDailyBonus += 3
    }
  }

  if (activeEvent) {
    const evt = activeEvent.eventConfig
    summary.customerAttractBonus += evt.customerAttractModifier
    summary.satisfactionBonus += evt.satisfactionBonus
    summary.buyChanceBonus += evt.buyChanceBonus
    summary.playBoostBonus += evt.playBoostBonus
    summary.reputationDailyBonus += evt.reputationBonus
  }

  return summary
}

export const createInitialLocalPerformanceState = (): LocalPerformanceState => ({
  isActive: false,
  currentArtistId: null,
  residency: null,
  artists: JSON.parse(JSON.stringify(localPerfArtists)),
  listeningEvents: JSON.parse(JSON.stringify(localPerfListeningEvents)),
  activeEvent: null,
  limitedItems: generateLimitedItems(),
  tasks: generateLocalPerfTasks(),
  settlements: [],
  totalScore: 0,
  totalCustomersAttracted: 0,
  totalLimitedSold: 0,
  tasksCompleted: 0,
  hasUnclaimedRewards: false,
  eventHeldCount: 0,
  lastEventDay: -2
})
