import type {
  SubscriptionBoxTheme,
  SubscriptionPlan,
  Subscriber,
  SubscriberPreference,
  MonthlyBox,
  BoxRecordItem,
  Complaint,
  SubscriptionBoxStats,
  SubscriptionBoxGameState,
  Genre,
  Record as VinylRecord,
  MemberLevel
} from '@/types'
import { allRecords } from './records'

export const subscriptionBoxThemes: SubscriptionBoxTheme[] = [
  {
    id: 'theme-jazz-evening',
    type: 'genre_focus',
    name: '爵士夜曲',
    icon: '🎷',
    description: '沉浸在爵士的深邃与浪漫中，每月精选经典与当代爵士佳作',
    coreGenres: ['Jazz', 'Blues'],
    bonusGenres: ['Soul'],
    rarityRange: [2, 5],
    priceRange: [200, 500],
    moodTagline: '夜色渐浓，爵士响起',
    color: '#2d3748',
    minLevel: 1,
    popularity: 85
  },
  {
    id: 'theme-rock-legends',
    type: 'genre_focus',
    name: '摇滚传奇',
    icon: '🎸',
    description: '从经典摇滚到前卫摇滚，探索摇滚史上的里程碑专辑',
    coreGenres: ['Rock'],
    bonusGenres: ['Funk', 'Pop'],
    rarityRange: [2, 5],
    priceRange: [250, 550],
    moodTagline: '摇滚不灭，传奇永恒',
    color: '#742a2a',
    minLevel: 1,
    popularity: 90
  },
  {
    id: 'theme-soul-groove',
    type: 'genre_focus',
    name: '灵魂律动',
    icon: '❤️',
    description: '感受灵魂乐的真挚情感，从Motown到新灵魂的完美旅程',
    coreGenres: ['Soul', 'Funk', 'Disco'],
    bonusGenres: ['Pop'],
    rarityRange: [2, 4],
    priceRange: [180, 450],
    moodTagline: '让灵魂随音乐起舞',
    color: '#744210',
    minLevel: 2,
    popularity: 78
  },
  {
    id: 'theme-classical-elegance',
    type: 'genre_focus',
    name: '古典雅韵',
    icon: '🎻',
    description: '品味古典音乐的永恒之美，从巴洛克到浪漫主义',
    coreGenres: ['Classical'],
    bonusGenres: ['Jazz'],
    rarityRange: [3, 5],
    priceRange: [300, 600],
    moodTagline: '穿越时空的优雅',
    color: '#2c5282',
    minLevel: 3,
    popularity: 65
  },
  {
    id: 'theme-electronic-dreams',
    type: 'genre_focus',
    name: '电子梦境',
    icon: '🎛️',
    description: '探索电子音乐的无限可能，从合成器浪潮到现代电子',
    coreGenres: ['Electronic'],
    bonusGenres: ['Pop', 'Funk'],
    rarityRange: [1, 4],
    priceRange: [150, 400],
    moodTagline: '霓虹闪烁的音乐梦境',
    color: '#553c9a',
    minLevel: 2,
    popularity: 72
  },
  {
    id: 'theme-70s-golden',
    type: 'era_nostalgia',
    name: '70年代黄金',
    icon: '🕺',
    description: '回到音乐的黄金年代，迪斯科、灵魂、摇滚交织的辉煌十年',
    coreGenres: ['Disco', 'Soul', 'Rock', 'Funk'],
    bonusGenres: ['Pop'],
    rarityRange: [2, 5],
    priceRange: [200, 500],
    moodTagline: '喇叭裤与黑胶的年代',
    color: '#b7791f',
    minLevel: 2,
    popularity: 88
  },
  {
    id: 'theme-80s-retro',
    type: 'era_nostalgia',
    name: '80年代复古',
    icon: '📼',
    description: '合成器、霓虹灯、MTV时代的流行与摇滚，充满怀旧气息',
    coreGenres: ['Pop', 'Rock', 'Electronic'],
    bonusGenres: ['Funk'],
    rarityRange: [2, 4],
    priceRange: [180, 450],
    moodTagline: '霓虹灯下的青春回忆',
    color: '#d53f8c',
    minLevel: 3,
    popularity: 75
  },
  {
    id: 'theme-rare-treasures',
    type: 'rare_treasure',
    name: '稀世珍藏',
    icon: '💎',
    description: '专为收藏爱好者打造，每期一张稀有或绝版珍品唱片',
    coreGenres: ['Jazz', 'Rock', 'Soul', 'Classical'],
    bonusGenres: ['Funk', 'Blues', 'Folk'],
    rarityRange: [4, 5],
    priceRange: [500, 1000],
    moodTagline: '每一张都是故事',
    color: '#d69e2e',
    minLevel: 5,
    popularity: 60
  },
  {
    id: 'theme-mood-relaxing',
    type: 'mood_vibe',
    name: '悠然时光',
    icon: '☕',
    description: '适合午后与夜晚的放松音乐，抚平一天的疲惫',
    coreGenres: ['Jazz', 'Folk', 'Soul'],
    bonusGenres: ['Classical', 'Blues'],
    rarityRange: [1, 4],
    priceRange: [150, 400],
    moodTagline: '慢下来，感受音乐',
    color: '#68d391',
    minLevel: 1,
    popularity: 82
  },
  {
    id: 'theme-mystery-surprise',
    type: 'surprise_mystery',
    name: '惊喜盲盒',
    icon: '🎁',
    description: '完全随机的音乐惊喜，让每次开箱都充满期待',
    coreGenres: ['Jazz', 'Rock', 'Soul', 'Funk', 'Pop', 'Classical', 'Blues', 'Electronic', 'Folk', 'Disco'],
    bonusGenres: [],
    rarityRange: [1, 5],
    priceRange: [200, 600],
    moodTagline: '未知的音乐奇遇',
    color: '#9f7aea',
    minLevel: 2,
    popularity: 95
  }
]

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    tier: 'basic',
    name: '基础盒',
    icon: '📦',
    description: '入门级订阅，每月1张精选唱片，开启你的黑胶之旅',
    monthlyPrice: 199,
    recordCount: 1,
    minRarity: 1,
    maxRarity: 3,
    priceDiscount: 0.9,
    satisfactionBonus: 5,
    reputationGain: 1,
    perks: [
      '每月1张精选唱片',
      '基础主题选择',
      '免费配送',
      '7天无理由退换'
    ],
    minLevel: 1
  },
  {
    id: 'plan-standard',
    tier: 'standard',
    name: '标准盒',
    icon: '🎁',
    description: '最受欢迎的选择，每月2张唱片，性价比之选',
    monthlyPrice: 349,
    recordCount: 2,
    minRarity: 2,
    maxRarity: 4,
    priceDiscount: 0.85,
    satisfactionBonus: 10,
    reputationGain: 2,
    perks: [
      '每月2张精选唱片',
      '全部主题可选',
      '免费配送',
      '专属会员折扣',
      '优先发货'
    ],
    minLevel: 2,
    isPopular: true
  },
  {
    id: 'plan-premium',
    tier: 'premium',
    name: '尊享盒',
    icon: '👑',
    description: '高品质体验，每月3张唱片，含稀有珍品',
    monthlyPrice: 599,
    recordCount: 3,
    minRarity: 3,
    maxRarity: 5,
    priceDiscount: 0.8,
    satisfactionBonus: 15,
    reputationGain: 3,
    perks: [
      '每月3张精选唱片',
      '含1张稀有唱片',
      '全部主题可选',
      '顺丰包邮',
      '专属客服',
      '生日特别礼'
    ],
    minLevel: 4
  },
  {
    id: 'plan-elite',
    tier: 'elite',
    name: '至臻盒',
    icon: '💎',
    description: '顶级订阅体验，每月4张精选，含绝版珍藏',
    monthlyPrice: 999,
    recordCount: 4,
    minRarity: 4,
    maxRarity: 5,
    priceDiscount: 0.75,
    satisfactionBonus: 25,
    reputationGain: 5,
    perks: [
      '每月4张精选唱片',
      '含1-2张绝版珍藏',
      '定制主题服务',
      '专人配送',
      'VIP专属客服',
      '限量版周边',
      '品鉴会邀请'
    ],
    minLevel: 6
  }
]

const subscriberAvatars = ['👤', '👨', '👩', '🧑', '👴', '👵', '👱', '👸', '🤴', '🧔']
const subscriberNames = [
  '张先生', '李女士', '王先生', '陈小姐', '刘先生',
  '赵女士', '孙先生', '周小姐', '吴先生', '郑女士',
  '冯先生', '陈小姐', '褚女士', '卫先生', '蒋小姐',
  '沈先生', '韩女士', '杨先生', '朱小姐', '秦先生'
]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomPreference(themeId?: string): SubscriberPreference {
  const themes = subscriptionBoxThemes
  const theme = themeId ? themes.find(t => t.id === themeId) : getRandomItem(themes)
  
  const favoriteGenres = theme 
    ? [...theme.coreGenres].sort(() => Math.random() - 0.5).slice(0, Math.min(3, theme.coreGenres.length))
    : getRandomItem([['Jazz'], ['Rock', 'Pop'], ['Soul', 'Funk'], ['Classical']]) as Genre[]
  
  const rarityOptions = theme
    ? Array.from({ length: theme.rarityRange[1] - theme.rarityRange[0] + 1 }, (_, i) => theme.rarityRange[0] + i)
    : [2, 3, 4]
  
  const priceRange: [number, number] = theme
    ? [theme.priceRange[0], theme.priceRange[1]]
    : [200, 500]
  
  return {
    favoriteGenres,
    preferredRarity: rarityOptions,
    priceRange,
    preferredThemes: theme ? [theme.id] : [getRandomItem(themes).id],
    dislikeGenres: [],
    note: ''
  }
}

export function generateSubscriber(
  planId: string,
  currentDay: number,
  themeId?: string
): Subscriber {
  const plan = subscriptionPlans.find(p => p.id === planId) || subscriptionPlans[0]
  const name = getRandomItem(subscriberNames)
  const avatar = getRandomItem(subscriberAvatars)
  const preference = generateRandomPreference(themeId)
  const memberLevels: (MemberLevel | null)[] = [null, null, null, 'Bronze', 'Silver']
  const memberLevel = getRandomItem(memberLevels)
  
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    avatar,
    planId: plan.id,
    status: 'active',
    preference,
    subscriptionStartDay: currentDay,
    subscriptionEndDay: null,
    currentPeriodStart: currentDay,
    currentPeriodEnd: currentDay + 30,
    boxesReceived: 0,
    totalSpent: 0,
    satisfaction: 75 + Math.floor(Math.random() * 20),
    memberLevel,
    isMember: memberLevel !== null,
    lastBoxRating: null,
    consecutiveMonths: 0,
    autoRenew: Math.random() > 0.3,
    tier: plan.tier
  }
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(p => p.id === planId)
}

export function getThemeById(themeId: string): SubscriptionBoxTheme | undefined {
  return subscriptionBoxThemes.find(t => t.id === themeId)
}

export function calculateMatchScore(
  subscriber: Subscriber,
  record: VinylRecord,
  theme?: SubscriptionBoxTheme
): number {
  let score = 50
  
  const genreMatch = subscriber.preference.favoriteGenres.includes(record.genre)
  if (genreMatch) {
    score += 25
  }
  
  const rarityMatch = subscriber.preference.preferredRarity.includes(record.rarity)
  if (rarityMatch) {
    score += 15
  }
  
  const inPriceRange = record.marketPrice >= subscriber.preference.priceRange[0] && 
                       record.marketPrice <= subscriber.preference.priceRange[1]
  if (inPriceRange) {
    score += 10
  }
  
  if (theme) {
    if (theme.coreGenres.includes(record.genre)) {
      score += 10
    } else if (theme.bonusGenres.includes(record.genre)) {
      score += 5
    }
  }
  
  return Math.min(100, Math.max(0, score))
}

export function selectRecordsForBox(
  subscriber: Subscriber,
  plan: SubscriptionPlan,
  theme: SubscriptionBoxTheme,
  inventory: { record: VinylRecord; conditionScore: number }[]
): BoxRecordItem[] {
  const results: BoxRecordItem[] = []
  const usedIds = new Set<string>()
  
  const scoredRecords = inventory.map(item => ({
    ...item,
    matchScore: calculateMatchScore(subscriber, item.record, theme)
  })).sort((a, b) => b.matchScore - a.matchScore)
  
  for (const item of scoredRecords) {
    if (results.length >= plan.recordCount) break
    if (usedIds.has(item.record.id)) continue
    
    if (item.record.rarity >= plan.minRarity && item.record.rarity <= plan.maxRarity) {
      const matchReason = generateMatchReason(item.matchScore, item.record, theme)
      results.push({
        record: item.record,
        conditionScore: item.conditionScore,
        matchScore: item.matchScore,
        matchReason,
        isSurprise: item.matchScore < 50,
        estimatedValue: item.record.marketPrice
      })
      usedIds.add(item.record.id)
    }
  }
  
  while (results.length < plan.recordCount && scoredRecords.length > 0) {
    const randomRecord = scoredRecords[Math.floor(Math.random() * scoredRecords.length)]
    if (!usedIds.has(randomRecord.record.id)) {
      results.push({
        record: randomRecord.record,
        conditionScore: randomRecord.conditionScore,
        matchScore: randomRecord.matchScore,
        matchReason: '惊喜选曲',
        isSurprise: true,
        estimatedValue: randomRecord.record.marketPrice
      })
      usedIds.add(randomRecord.record.id)
    }
  }
  
  return results
}

function generateMatchReason(score: number, record: VinylRecord, theme: SubscriptionBoxTheme): string {
  if (score >= 80) {
    return `完美匹配您的${record.genre}音乐偏好`
  } else if (score >= 60) {
    return `符合${theme.name}主题风格`
  } else if (score >= 40) {
    return '与您的品味有些相似'
  } else {
    return '为您精心挑选的惊喜'
  }
}

export function generateComplaint(
  subscriber: Subscriber,
  box: MonthlyBox,
  day: number
): Complaint {
  const complaintTypes = [
    { type: 'wrong_item' as const, name: '商品不符', icon: '❌', weight: 20 },
    { type: 'damaged' as const, name: '运输损坏', icon: '💔', weight: 25 },
    { type: 'poor_quality' as const, name: '品质问题', icon: '⚠️', weight: 20 },
    { type: 'bad_match' as const, name: '匹配度低', icon: '😕', weight: 25 },
    { type: 'late_delivery' as const, name: '配送延迟', icon: '⏰', weight: 15 },
    { type: 'other' as const, name: '其他问题', icon: '💬', weight: 5 }
  ]
  
  const totalWeight = complaintTypes.reduce((sum, c) => sum + c.weight, 0)
  let random = Math.random() * totalWeight
  let selected = complaintTypes[0]
  
  for (const ct of complaintTypes) {
    random -= ct.weight
    if (random <= 0) {
      selected = ct
      break
    }
  }
  
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'low', 'medium', 'medium', 'medium', 'high']
  const severity = getRandomItem(severities)
  
  const descriptions: Record<string, string[]> = {
    wrong_item: [
      '收到的唱片和我预期的不一样',
      '订单内容与描述不符',
      '唱片版本不对'
    ],
    damaged: [
      '包装有破损，唱片封套有折痕',
      '唱片有轻微划痕',
      '运输过程中包装损坏'
    ],
    poor_quality: [
      '唱片音质不如预期',
      '品相描述与实际不符',
      '感觉是二手的'
    ],
    bad_match: [
      '这次选的歌不太合我口味',
      '风格和我偏好的差太远了',
      '匹配度太低了'
    ],
    late_delivery: [
      '比预计晚了好几天才到',
      '物流太慢了',
      '等了好久才收到'
    ],
    other: [
      '有些小问题需要反馈',
      '希望能改进服务',
      '有一些建议想提'
    ]
  }
  
  const description = getRandomItem(descriptions[selected.type] || descriptions.other)
  
  const reputationLossBySeverity = { low: 1, medium: 3, high: 5, critical: 10 }
  const satisfactionLossBySeverity = { low: 5, medium: 10, high: 15, critical: 25 }
  
  return {
    id: `complaint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subscriberId: subscriber.id,
    subscriberName: subscriber.name,
    subscriberAvatar: subscriber.avatar,
    boxId: box.id,
    type: selected.type,
    typeName: selected.name,
    typeIcon: selected.icon,
    description,
    status: 'pending',
    severity,
    createdAt: Date.now(),
    dayCreated: day,
    resolvedAt: null,
    dayResolved: null,
    resolution: null,
    refundAmount: 0,
    reputationLoss: reputationLossBySeverity[severity],
    satisfactionLoss: satisfactionLossBySeverity[severity],
    handledBy: null,
    responseDeadline: day + 3
  }
}

export function calculateSubscriptionStats(
  subscribers: Subscriber[],
  boxes: MonthlyBox[],
  complaints: Complaint[]
): SubscriptionBoxStats {
  const activeSubscribers = subscribers.filter(s => s.status === 'active')
  const totalRevenue = boxes.reduce((sum, b) => sum + b.subscriberCost, 0)
  const totalProfit = boxes.reduce((sum, b) => sum + b.shopProfit, 0)
  const avgSatisfaction = activeSubscribers.length > 0 
    ? activeSubscribers.reduce((sum, s) => sum + s.satisfaction, 0) / activeSubscribers.length 
    : 0
  
  const ratedBoxes = boxes.filter(b => b.rating !== null)
  const avgRating = ratedBoxes.length > 0
    ? ratedBoxes.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBoxes.length
    : 0
  
  const avgMatchScore = boxes.length > 0
    ? boxes.reduce((sum, b) => {
        const avgItemScore = b.items.length > 0 
          ? b.items.reduce((s, i) => s + i.matchScore, 0) / b.items.length 
          : 0
        return sum + avgItemScore
      }, 0) / boxes.length
    : 0
  
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length
  const complaintResolutionRate = complaints.length > 0
    ? resolvedComplaints / complaints.length
    : 0
  
  const byTier = {
    basic: activeSubscribers.filter(s => s.tier === 'basic').length,
    standard: activeSubscribers.filter(s => s.tier === 'standard').length,
    premium: activeSubscribers.filter(s => s.tier === 'premium').length,
    elite: activeSubscribers.filter(s => s.tier === 'elite').length
  }
  
  const autoRenewCount = activeSubscribers.filter(s => s.autoRenew).length
  const renewRate = activeSubscribers.length > 0 ? autoRenewCount / activeSubscribers.length : 0
  
  const themeCounts: { [key: string]: number } = {}
  for (const box of boxes) {
    themeCounts[box.theme.id] = (themeCounts[box.theme.id] || 0) + 1
  }
  const topTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  
  const churnCount = subscribers.filter(s => s.status === 'cancelled' || s.status === 'expired').length
  const churnRate = subscribers.length > 0 ? churnCount / subscribers.length : 0
  
  return {
    totalSubscribers: subscribers.length,
    activeSubscribers: activeSubscribers.length,
    byTier,
    totalRevenue,
    totalProfit,
    monthlyRevenue: totalRevenue / Math.max(1, boxes.length),
    avgSatisfaction,
    churnRate,
    totalBoxesShipped: boxes.length,
    avgMatchScore,
    pendingComplaints,
    resolvedComplaints,
    complaintResolutionRate,
    avgRating,
    renewRate,
    topTheme
  }
}

export function createInitialSubscriptionBoxState(): SubscriptionBoxGameState {
  return {
    themes: subscriptionBoxThemes,
    plans: subscriptionPlans,
    subscribers: [],
    boxes: [],
    complaints: [],
    stats: {
      totalSubscribers: 0,
      activeSubscribers: 0,
      byTier: { basic: 0, standard: 0, premium: 0, elite: 0 },
      totalRevenue: 0,
      totalProfit: 0,
      monthlyRevenue: 0,
      avgSatisfaction: 0,
      churnRate: 0,
      totalBoxesShipped: 0,
      avgMatchScore: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      complaintResolutionRate: 0,
      avgRating: 0,
      renewRate: 0,
      topTheme: null
    },
    isSubscriptionServiceActive: false,
    nextShipmentDay: 0,
    selectedSubscriberId: null,
    selectedTab: 'subscribers',
    notifications: [],
    lastProcessDay: 0,
    totalSubscriptionProfit: 0
  }
}

export function getComplaintTypeLabel(type: string): string {
  const types: Record<string, string> = {
    wrong_item: '商品不符',
    damaged: '运输损坏',
    poor_quality: '品质问题',
    bad_match: '匹配度低',
    late_delivery: '配送延迟',
    other: '其他问题'
  }
  return types[type] || '其他'
}

export function getComplaintTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    wrong_item: '❌',
    damaged: '💔',
    poor_quality: '⚠️',
    bad_match: '😕',
    late_delivery: '⏰',
    other: '💬'
  }
  return icons[type] || '💬'
}

export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: '轻微',
    medium: '一般',
    high: '严重',
    critical: '紧急'
  }
  return labels[severity] || '一般'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: '#68d391',
    medium: '#f6ad55',
    high: '#fc8181',
    critical: '#e53e3e'
  }
  return colors[severity] || '#f6ad55'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    rejected: '已驳回',
    active: '活跃',
    paused: '已暂停',
    cancelled: '已取消',
    expired: '已过期',
    preparing: '准备中',
    shipped: '已发货',
    delivered: '已送达',
    returned: '已退回'
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f6ad55',
    processing: '#63b3ed',
    resolved: '#68d391',
    rejected: '#fc8181',
    active: '#68d391',
    paused: '#a0aec0',
    cancelled: '#fc8181',
    expired: '#a0aec0',
    preparing: '#f6ad55',
    shipped: '#63b3ed',
    delivered: '#68d391',
    returned: '#fc8181'
  }
  return colors[status] || '#a0aec0'
}
