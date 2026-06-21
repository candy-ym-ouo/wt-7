import type {
  Quest, QuestConfig, QuestRarity, QuestType,
  QuestRequirement, QuestReward, DailyQuestBoard,
  QuestProgressUpdate, QuestAcceptResult, QuestClaimResult,
  Genre
} from '@/types'
import { allRecords } from './records'

const QUEST_CLIENT_NAMES = [
  '老王收藏家', '音乐发烧友小李', '复古咖啡馆老板', '电台DJ阿杰',
  '爵士乐手张老师', '私人收藏家陈先生', '青年音乐人小米', '艺术策展人Linda',
  '老唱片店店主', '大学生音乐社社长', '文化遗产研究员', '独立电影导演'
]

const QUEST_CLIENT_AVATARS = [
  '👴', '🧑‍🎤', '☕', '🎙️', '🎷', '🎩', '🎸', '🎨', '📻', '🎓', '🔬', '🎬'
]

const QUEST_ICONS: { [key in QuestType]: string } = {
  daily_order: '📦',
  collect_record: '💿',
  time_limited: '⏰',
  genre_sales: '🎵',
  profit_target: '💰'
}

const QUEST_TITLES: { [key in QuestType]: string[] } = {
  daily_order: [
    '老顾客的月度订单', '社区唱片订购计划', '咖啡馆背景音乐补货',
    '企业年会礼品采购', '节日礼品定制'
  ],
  collect_record: [
    '爵士经典收藏计划', '摇滚黄金时代寻踪', '灵魂乐珍本征集',
    '古典名盘系列收藏', '罕见独立唱片寻找'
  ],
  time_limited: [
    '紧急！派对DJ急需', '限时展览筹备中', '电台节目录制倒计时',
    '电影拍摄紧迫需求', '婚礼现场特别要求'
  ],
  genre_sales: [
    '爵士乐推广月', '摇滚乐复兴计划', '迪斯科复古派对',
    '古典音乐鉴赏季', '灵魂乐周末特卖'
  ],
  profit_target: [
    '月末冲刺目标', '季度利润挑战', '新店扩张资金',
    '装修储备金计划', '会员回馈活动经费'
  ]
}

const QUEST_DESCRIPTIONS: { [key in QuestType]: string[] } = {
  daily_order: [
    '熟客再次上门，需要一批品质稳定的唱片作为日常进货。请在期限内完成销售目标。',
    '社区团购订单已确认，帮助邻居们找到心仪的唱片吧！',
    '街角咖啡馆需要补充背景音乐库存，要求风格统一、品相良好。',
    '某公司年会准备礼品，需要大量中等价位的经典唱片。',
    '节日临近，客户需要定制一批唱片作为商务礼品赠送。'
  ],
  collect_record: [
    '一位资深收藏家正在补全他的爵士经典系列，请帮忙寻找指定的几张唱片。',
    '摇滚迷正在收集70年代的黄金专辑，完成他的心愿清单吧！',
    '灵魂乐爱好者渴望拥有那些传奇歌手的原版唱片。',
    '古典音乐迷正在寻找一系列大师演绎的经典名盘。',
    '独立厂牌的唱片非常难找，这位客户愿意出高价求购。'
  ],
  time_limited: [
    '周末的派对就等这批唱片打碟了！必须在指定时间内完成交付。',
    '下周的复古音乐展览即将开幕，展品还缺几张关键唱片。',
    '电台特别节目要录制专题，急需一批特定风格的唱片作为素材。',
    '电影剧组拍摄场景需要一批年代感十足的唱片道具。',
    '婚礼新人希望在仪式上播放具有特殊意义的唱片，请尽快准备好！'
  ],
  genre_sales: [
    '本店计划举办爵士乐推广活动，在活动期间多卖爵士唱片吧！',
    '摇滚乐复兴势头正盛，抓住机会多推销一些摇滚专辑。',
    '迪斯科复古派对之夜，让顾客们带走那些跳动的节奏！',
    '古典音乐鉴赏季开始了，帮助顾客找到那些永恒的旋律。',
    '周末灵魂乐特卖会正在进行，用热情感染每一位顾客！'
  ],
  profit_target: [
    '本月利润目标还差一点，加把劲完成销售任务！',
    '季度末冲刺，如果达成利润目标将获得额外奖金。',
    '计划扩张新店，需要积累足够的启动资金。',
    '店面装修迫在眉睫，需要尽快凑齐装修费用。',
    '会员回馈活动需要经费支持，多赚些钱让活动更精彩！'
  ]
}

const RARITY_BUDGET_MULTIPLIER: { [key in QuestRarity]: number } = {
  common: 1,
  uncommon: 1.5,
  rare: 2.2,
  epic: 3.5,
  legendary: 5
}

const RARITY_REPUTATION_MULTIPLIER: { [key in QuestRarity]: number } = {
  common: 1,
  uncommon: 1.3,
  rare: 1.8,
  epic: 2.5,
  legendary: 4
}

const RARITY_COLORS: { [key in QuestRarity]: string } = {
  common: '#a0aec0',
  uncommon: '#48bb78',
  rare: '#4299e1',
  epic: '#9f7aea',
  legendary: '#ed8936'
}

const RARITY_LABELS: { [key in QuestRarity]: string } = {
  common: '普通',
  uncommon: '优良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
}

const GENRES: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rollRarity(level: number): QuestRarity {
  const roll = Math.random() * 100
  const legendaryChance = Math.min(5, level * 0.5)
  const epicChance = Math.min(15, level * 1.2)
  const rareChance = Math.min(30, level * 2 + 10)
  const uncommonChance = Math.min(40, level * 2 + 20)

  if (roll < legendaryChance) return 'legendary'
  if (roll < legendaryChance + epicChance) return 'epic'
  if (roll < legendaryChance + epicChance + rareChance) return 'rare'
  if (roll < legendaryChance + epicChance + rareChance + uncommonChance) return 'uncommon'
  return 'common'
}

function generateRequirements(type: QuestType, rarity: QuestRarity, level: number): QuestRequirement[] {
  const baseMultiplier = RARITY_BUDGET_MULTIPLIER[rarity]
  const levelBonus = 1 + (level - 1) * 0.15
  const requirements: QuestRequirement[] = []

  switch (type) {
    case 'daily_order': {
      const quantity = Math.floor(randomInt(3, 6) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'sell_quantity',
        target: quantity,
        current: 0,
        description: `卖出 ${quantity} 张唱片`
      })
      const profitTarget = Math.floor(randomInt(500, 1200) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'reach_profit',
        target: profitTarget,
        current: 0,
        description: `获得 ¥${profitTarget} 利润`
      })
      break
    }
    case 'collect_record': {
      const targetGenre = randomChoice(GENRES)
      const recordsInGenre = allRecords.filter(r => r.genre === targetGenre)
      const recordCount = Math.min(Math.floor(randomInt(2, 4) * baseMultiplier), recordsInGenre.length)
      const shuffled = [...recordsInGenre].sort(() => Math.random() - 0.5)
      const targetRecords = shuffled.slice(0, recordCount)
      requirements.push({
        type: 'collect_record',
        target: recordCount,
        current: 0,
        genre: targetGenre,
        recordIds: targetRecords.map(r => r.id),
        minRarity: rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' ? 3 : 2,
        description: `收集 ${recordCount} 张${targetGenre}风格唱片（${targetRecords.map(r => r.title).join('、')}）`
      })
      break
    }
    case 'time_limited': {
      const targetGenre = randomChoice(GENRES)
      const sellCount = Math.floor(randomInt(4, 8) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'sell_genre',
        target: sellCount,
        current: 0,
        genre: targetGenre,
        description: `在时限内卖出 ${sellCount} 张${targetGenre}风格唱片`
      })
      const avgSat = rarity === 'legendary' ? 85 : rarity === 'epic' ? 80 : 75
      requirements.push({
        type: 'customer_satisfaction',
        target: avgSat * sellCount,
        current: 0,
        description: `累计满意度达到 ${avgSat * sellCount}（平均${avgSat}分/单）`
      })
      break
    }
    case 'genre_sales': {
      const targetGenre = randomChoice(GENRES)
      const quantity = Math.floor(randomInt(5, 10) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'sell_genre',
        target: quantity,
        current: 0,
        genre: targetGenre,
        description: `卖出 ${quantity} 张${targetGenre}风格唱片`
      })
      const revenue = Math.floor(randomInt(1500, 3500) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'reach_profit',
        target: revenue,
        current: 0,
        genre: targetGenre,
        description: `${targetGenre}唱片利润达到 ¥${revenue}`
      })
      break
    }
    case 'profit_target': {
      const profit = Math.floor(randomInt(2000, 5000) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'reach_profit',
        target: profit,
        current: 0,
        description: `总利润达到 ¥${profit}`
      })
      const salesCount = Math.floor(randomInt(8, 15) * baseMultiplier * levelBonus)
      requirements.push({
        type: 'sell_quantity',
        target: salesCount,
        current: 0,
        description: `完成 ${salesCount} 笔销售`
      })
      break
    }
  }

  return requirements
}

function generateReward(_type: QuestType, rarity: QuestRarity, level: number, requirements: QuestRequirement[]): QuestReward {
  const budgetMultiplier = RARITY_BUDGET_MULTIPLIER[rarity]
  const repMultiplier = RARITY_REPUTATION_MULTIPLIER[rarity]
  const levelBonus = 1 + (level - 1) * 0.1

  const baseBudget = requirements.reduce((sum, req) => {
    if (req.type === 'reach_profit') return sum + req.target * 0.15
    if (req.type === 'sell_quantity' || req.type === 'sell_genre') return sum + req.target * 80
    return sum + 200
  }, 500)

  const budget = Math.floor(baseBudget * budgetMultiplier * levelBonus)
  const reputation = Math.floor(randomInt(5, 15) * repMultiplier)
  const growthPoints = rarity === 'common' ? 0 : Math.floor(randomInt(10, 30) * repMultiplier)

  let bonusRecordId: string | undefined
  if (rarity === 'epic' || rarity === 'legendary') {
    const minRarity = rarity === 'legendary' ? 4 : 3
    const candidates = allRecords.filter(r => r.rarity >= minRarity)
    if (candidates.length > 0) {
      bonusRecordId = randomChoice(candidates).id
    }
  }

  let descriptionParts: string[] = []
  descriptionParts.push(`现金 ¥${budget}`)
  if (reputation > 0) descriptionParts.push(`声望 +${reputation}`)
  if (growthPoints > 0) descriptionParts.push(`成长值 +${growthPoints}`)
  if (bonusRecordId) {
    const rec = allRecords.find(r => r.id === bonusRecordId)
    if (rec) descriptionParts.push(`赠送唱片「${rec.title}」`)
  }

  return {
    budget,
    reputation,
    growthPoints: growthPoints > 0 ? growthPoints : undefined,
    bonusRecordId,
    description: descriptionParts.join('、')
  }
}

export function generateQuestConfig(level: number, forceType?: QuestType): QuestConfig {
  const type = forceType || randomChoice(['daily_order', 'collect_record', 'time_limited', 'genre_sales', 'profit_target'] as QuestType[])
  const rarity = rollRarity(level)
  const title = randomChoice(QUEST_TITLES[type])
  const description = randomChoice(QUEST_DESCRIPTIONS[type])
  const clientIndex = randomInt(0, QUEST_CLIENT_NAMES.length - 1)
  const clientName = QUEST_CLIENT_NAMES[clientIndex]
  const clientAvatar = QUEST_CLIENT_AVATARS[clientIndex]

  const requirements = generateRequirements(type, rarity, level)
  const reward = generateReward(type, rarity, level, requirements)

  const durationDays = type === 'time_limited'
    ? Math.max(1, randomInt(1, 2))
    : (rarity === 'legendary' ? randomInt(4, 6) : rarity === 'epic' ? randomInt(3, 5) : randomInt(2, 4))

  const startTimeSlot = type === 'time_limited' ? (Math.random() > 0.5 ? 'afternoon' : 'night') : undefined

  const id = `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    type,
    title,
    icon: QUEST_ICONS[type],
    description,
    clientName,
    clientAvatar,
    rarity,
    requirements,
    reward,
    minLevel: Math.max(1, level - 1),
    durationDays,
    startTimeSlot,
    isRepeatable: type === 'daily_order' || type === 'genre_sales',
    cooldownDays: rarity === 'legendary' ? 7 : rarity === 'epic' ? 5 : 3
  }
}

export function createQuestFromConfig(config: QuestConfig): Quest {
  return {
    config,
    status: 'available',
    acceptedDay: null,
    deadlineDay: null,
    completedDay: null,
    claimedDay: null,
    failedDay: null,
    progress: config.requirements.map(r => ({ ...r, current: 0 })),
    notifications: []
  }
}

export function generateDailyQuests(level: number, count: number = 4): Quest[] {
  const quests: Quest[] = []
  const typePool: QuestType[] = ['daily_order', 'collect_record', 'time_limited', 'genre_sales', 'profit_target']

  for (let i = 0; i < count; i++) {
    const forceType = typePool[i % typePool.length]
    const config = generateQuestConfig(level, forceType)
    quests.push(createQuestFromConfig(config))
  }

  return quests
}

export function createInitialQuestBoard(): DailyQuestBoard {
  return {
    day: 1,
    availableQuests: [],
    activeQuests: [],
    completedQuests: [],
    claimedQuests: [],
    failedQuests: [],
    lastRefreshDay: 0,
    totalQuestsCompleted: 0,
    totalRewardsEarned: {
      budget: 0,
      reputation: 0,
      growthPoints: 0
    },
    consecutiveDailyCompletion: 0
  }
}

export function updateQuestProgress(
  quest: Quest,
  update: QuestProgressUpdate
): { quest: Quest; justCompleted: boolean } {
  if (quest.status !== 'active') return { quest, justCompleted: false }

  let justCompleted = false
  const newProgress = quest.progress.map(req => {
    let shouldUpdate = false

    switch (req.type) {
      case 'sell_record':
        shouldUpdate = update.type === 'sell_record' &&
          (!req.recordIds || req.recordIds.includes(update.recordId || '')) &&
          (!req.minRarity || (update.rarity || 0) >= req.minRarity) &&
          (!req.minCondition || (update.condition || 0) >= req.minCondition)
        break
      case 'collect_record':
        shouldUpdate = update.type === 'collect_record' &&
          (!req.genre || req.genre === update.genre) &&
          (!req.recordIds || req.recordIds.includes(update.recordId || '')) &&
          (!req.minRarity || (update.rarity || 0) >= req.minRarity)
        break
      case 'sell_genre':
        shouldUpdate = update.type === 'sell_genre' || update.type === 'sell_record'
        if (shouldUpdate && req.genre && update.genre !== req.genre) shouldUpdate = false
        break
      case 'sell_quantity':
        shouldUpdate = update.type === 'sell_quantity' || update.type === 'sell_record' || update.type === 'sell_genre'
        break
      case 'reach_profit':
        shouldUpdate = update.type === 'reach_profit'
        if (shouldUpdate && req.genre && update.genre !== req.genre) shouldUpdate = false
        break
      case 'customer_satisfaction':
        shouldUpdate = update.type === 'customer_satisfaction'
        break
    }

    if (shouldUpdate && update.value > 0) {
      const newCurrent = Math.min(req.target, req.current + update.value)
      return { ...req, current: newCurrent }
    }
    return req
  })

  const allCompleted = newProgress.every(req => req.current >= req.target)
  const wasPreviouslyComplete = quest.progress.every(req => req.current >= req.target)

  if (allCompleted && !wasPreviouslyComplete) {
    justCompleted = true
  }

  const newQuest: Quest = {
    ...quest,
    progress: newProgress,
    status: allCompleted ? 'completed' : quest.status
  }

  if (justCompleted) {
    newQuest.notifications = [
      ...quest.notifications,
      { day: 0, message: '🎉 任务目标全部达成！', type: 'success' }
    ]
  }

  return { quest: newQuest, justCompleted }
}

export function acceptQuest(
  quest: Quest,
  currentDay: number,
  activeQuestsCount: number,
  maxActiveQuests: number = 3
): QuestAcceptResult {
  if (quest.status !== 'available') {
    return { success: false, message: '该任务不可领取' }
  }
  if (activeQuestsCount >= maxActiveQuests) {
    return { success: false, message: `同时进行的任务已达上限（${maxActiveQuests}个）` }
  }

  const deadlineDay = currentDay + quest.config.durationDays
  const updatedQuest: Quest = {
    ...quest,
    status: 'active',
    acceptedDay: currentDay,
    deadlineDay,
    notifications: [
      ...quest.notifications,
      { day: currentDay, message: `任务已领取，截止日期：第${deadlineDay}天`, type: 'info' }
    ]
  }

  return { success: true, message: `成功领取任务「${quest.config.title}」`, quest: updatedQuest }
}

export function claimQuestReward(
  quest: Quest,
  _currentDay: number
): QuestClaimResult {
  if (quest.status !== 'completed') {
    return { success: false, message: '任务尚未完成，无法领取奖励' }
  }

  return {
    success: true,
    message: `恭喜获得奖励：${quest.config.reward.description}`,
    reward: quest.config.reward
  }
}

export function checkQuestExpiry(
  quest: Quest,
  currentDay: number
): { quest: Quest; expired: boolean } {
  if (quest.status !== 'active') return { quest, expired: false }
  if (!quest.deadlineDay || currentDay <= quest.deadlineDay) return { quest, expired: false }

  const expiredQuest: Quest = {
    ...quest,
    status: 'expired',
    failedDay: currentDay,
    notifications: [
      ...quest.notifications,
      { day: currentDay, message: '⌛ 任务已超时失败', type: 'warning' }
    ]
  }

  return { quest: expiredQuest, expired: true }
}

export function getQuestRarityColor(rarity: QuestRarity): string {
  return RARITY_COLORS[rarity]
}

export function getQuestRarityLabel(rarity: QuestRarity): string {
  return RARITY_LABELS[rarity]
}

export function getQuestTypeLabel(type: QuestType): string {
  const labels: { [key in QuestType]: string } = {
    daily_order: '每日订单',
    collect_record: '唱片收集',
    time_limited: '限时交付',
    genre_sales: '风格推广',
    profit_target: '利润目标'
  }
  return labels[type]
}

export function getOverallProgress(quest: Quest): number {
  if (quest.progress.length === 0) return 0
  const totalProgress = quest.progress.reduce((sum, req) => {
    return sum + Math.min(1, req.current / Math.max(1, req.target))
  }, 0)
  return totalProgress / quest.progress.length
}

export function getDaysRemaining(quest: Quest, currentDay: number): number {
  if (!quest.deadlineDay) return quest.config.durationDays
  return Math.max(0, quest.deadlineDay - currentDay)
}

export function formatDeadlineText(quest: Quest, currentDay: number): string {
  const days = getDaysRemaining(quest, currentDay)
  if (quest.status === 'completed') return '✓ 已完成'
  if (quest.status === 'claimed') return '✓ 奖励已领取'
  if (quest.status === 'expired' || quest.status === 'failed') return '✗ 已失败'
  if (days === 0) return '🔴 今日截止！'
  if (days === 1) return '🟠 还剩1天'
  if (days <= 3) return `🟡 还剩${days}天`
  return `🟢 还剩${days}天`
}
