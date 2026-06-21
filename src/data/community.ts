import type {
  CommunityPost,
  CommunityPostType,
  GenreTrend,
  WordOfMouthSpreadNode,
  WordOfMouthChannel,
  CommunityEvent,
  CommunityEventType,
  CommunityReward,
  RewardType,
  CommunityStats,
  CommunityState,
  EventSignupResult,
  RewardClaimResult,
  Genre
} from '@/types'

const postTypeConfigs: Record<CommunityPostType, { name: string; icon: string; reputationReward: number }> = {
  review: { name: '唱片点评', icon: '📝', reputationReward: 2 },
  recommendation: { name: '好物推荐', icon: '💫', reputationReward: 3 },
  discussion: { name: '音乐讨论', icon: '💬', reputationReward: 1 },
  event_share: { name: '活动分享', icon: '🎉', reputationReward: 4 },
  collection_show: { name: '收藏展示', icon: '🏆', reputationReward: 3 }
}

const eventTypeConfigs: Record<CommunityEventType, { name: string; icon: string }> = {
  listening_party: { name: '聆听派对', icon: '🎧' },
  swap_meet: { name: '交换市集', icon: '🔄' },
  genre_night: { name: '风格之夜', icon: '🌙' },
  workshop: { name: '黑胶工坊', icon: '🔧' },
  artist_visit: { name: '艺人来访', icon: '🎤' },
  anniversary: { name: '店庆活动', icon: '🎂' }
}

const rewardTypeConfigs: Record<RewardType, { name: string; icon: string }> = {
  daily_checkin: { name: '每日签到', icon: '📅' },
  post_reward: { name: '发帖奖励', icon: '✍️' },
  spread_reward: { name: '扩散奖励', icon: '📣' },
  event_reward: { name: '活动奖励', icon: '🎪' },
  milestone_reward: { name: '里程碑奖励', icon: '🏆' },
  referral_bonus: { name: '推荐奖励', icon: '👥' }
}

const genreIcons: Record<Genre, string> = {
  Jazz: '🎷',
  Rock: '🎸',
  Soul: '🎤',
  Funk: '🕺',
  Disco: '💃',
  Classical: '🎻',
  Blues: '🎹',
  Pop: '🎵',
  Electronic: '🎛️',
  Folk: '🎸'
}

const samplePosts: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'review',
    typeName: '唱片点评',
    typeIcon: '📝',
    authorName: '爵士乐迷小王',
    authorAvatar: '🎩',
    authorLevel: 'Gold',
    content: '今天淘到了一张Miles Davis的《Kind of Blue首版，音质太棒了！那种温暖的音色，真的是黑胶独有的魅力。推荐给所有喜欢爵士的朋友！',
    recordTitle: 'Kind of Blue',
    recordArtist: 'Miles Davis',
    recordGenre: 'Jazz',
    recordCoverColor: '#1a1a2e',
    likes: 128,
    comments: 32,
    shares: 15,
    isLiked: false,
    timestamp: Date.now() - 3600000,
    dayPosted: 1,
    tags: ['爵士', '经典', '必听'],
    reputationImpact: 2,
    isPinned: true
  },
  {
    id: 'post-2',
    type: 'recommendation',
    typeName: '好物推荐',
    typeIcon: '💫',
    authorName: '摇滚青年阿杰',
    authorAvatar: '🎸',
    authorLevel: 'Silver',
    content: '最近发现一张很棒的摇滚专辑，吉他solo简直燃爆了！推荐给所有摇滚爱好者，绝对值得收藏。',
    recordTitle: 'Electric Ladyland',
    recordArtist: 'Jimi Hendrix',
    recordGenre: 'Rock',
    recordCoverColor: '#8B0000',
    likes: 89,
    comments: 21,
    shares: 8,
    isLiked: true,
    timestamp: Date.now() - 7200000,
    dayPosted: 1,
    tags: ['摇滚', '吉他大师'],
    reputationImpact: 3
  },
  {
    id: 'post-3',
    type: 'discussion',
    typeName: '音乐讨论',
    typeIcon: '💬',
    authorName: '古典乐迷老陈',
    authorAvatar: '🎻',
    authorLevel: 'Bronze',
    content: '大家觉得黑胶和数字音乐最大的区别是什么？我觉得是那种聆听的仪式感，放唱片、翻面、等前奏...',
    likes: 56,
    comments: 45,
    shares: 5,
    isLiked: false,
    timestamp: Date.now() - 10800000,
    dayPosted: 1,
    tags: ['讨论', '黑胶文化'],
    reputationImpact: 1
  },
  {
    id: 'post-4',
    type: 'collection_show',
    typeName: '收藏展示',
    typeIcon: '🏆',
    authorName: '收藏达人老李',
    authorAvatar: '👑',
    authorLevel: 'Platinum',
    content: '今天整理了一下我的爵士收藏，终于凑齐了Blue Note的经典系列！花了三年时间，慢慢收齐的那一刻真的太满足！',
    likes: 256,
    comments: 67,
    shares: 34,
    isLiked: false,
    timestamp: Date.now() - 14400000,
    dayPosted: 1,
    tags: ['收藏', '爵士', 'Blue Note'],
    reputationImpact: 4
  },
  {
    id: 'post-5',
    type: 'event_share',
    typeName: '活动分享',
    typeIcon: '🎉',
    authorName: '活动达人小美',
    authorAvatar: '🎉',
    authorLevel: 'Gold',
    content: '上周的聆听派对太棒了！认识了好多同好，希望以后要常来参加！',
    likes: 145,
    comments: 28,
    shares: 22,
    isLiked: true,
    timestamp: Date.now() - 18000000,
    dayPosted: 1,
    tags: ['活动', '聆听派对'],
    reputationImpact: 4
  }
]

const sampleTrends: GenreTrend[] = [
  { genre: 'Jazz', rank: 1, previousRank: 2, trend: 'rising', heatValue: 85, heatLevel: 'hot', postCount: 128, discussionCount: 45, salesGrowth: 15, icon: '🎷', description: '经典爵士回潮，老唱片价格攀升' },
  { genre: 'Rock', rank: 2, previousRank: 1, trend: 'falling', heatValue: 78, heatLevel: 'hot', postCount: 112, discussionCount: 38, salesGrowth: 8, icon: '🎸', description: '经典摇滚热度稍降但依然热门' },
  { genre: 'Soul', rank: 3, previousRank: 4, trend: 'rising', heatValue: 72, heatLevel: 'warm', postCount: 95, discussionCount: 29, salesGrowth: 12, icon: '🎤', description: '灵魂乐逐渐受到关注' },
  { genre: 'Funk', rank: 4, previousRank: 3, trend: 'stable', heatValue: 65, heatLevel: 'warm', postCount: 78, discussionCount: 22, salesGrowth: 5, icon: '🕺', description: '放克音乐保持稳定热度' },
  { genre: 'Disco', rank: 5, previousRank: 6, trend: 'rising', heatValue: 58, heatLevel: 'warm', postCount: 65, discussionCount: 18, salesGrowth: 20, icon: '💃', description: '迪斯科复古风潮兴起' },
  { genre: 'Classical', rank: 6, previousRank: 5, trend: 'stable', heatValue: 52, heatLevel: 'cool', postCount: 54, discussionCount: 15, salesGrowth: 3, icon: '🎻', description: '古典乐收藏群体稳定' },
  { genre: 'Blues', rank: 7, previousRank: 8, trend: 'rising', heatValue: 45, heatLevel: 'cool', postCount: 42, discussionCount: 12, salesGrowth: 8, icon: '🎹', description: '布鲁斯小众但忠实听众增长' },
  { genre: 'Pop', rank: 8, previousRank: 7, trend: 'falling', heatValue: 38, heatLevel: 'cool', postCount: 35, discussionCount: 10, salesGrowth: -2, icon: '🎵', description: '流行黑胶热度下降' },
  { genre: 'Electronic', rank: 9, previousRank: 9, trend: 'stable', heatValue: 32, heatLevel: 'cold', postCount: 28, discussionCount: 8, salesGrowth: 5, icon: '🎛️', description: '电子黑胶小众稳定' },
  { genre: 'Folk', rank: 10, previousRank: 10, trend: 'stable', heatValue: 25, heatLevel: 'cold', postCount: 20, discussionCount: 6, salesGrowth: 2, icon: '🎸', description: '民谣黑胶平稳发展' }
]

const sampleSpreadNodes: WordOfMouthSpreadNode[] = [
  { id: 'node-1', name: '爵士乐迷小王', avatar: '🎩', level: 'Gold', influence: 85, reach: 1200, spreadCount: 15, isActive: true, lastSpreadDay: 1 },
  { id: 'node-2', name: '摇滚青年阿杰', avatar: '🎸', level: 'Silver', influence: 65, reach: 800, spreadCount: 8, isActive: true, lastSpreadDay: 1 },
  { id: 'node-3', name: '收藏达人老李', avatar: '👑', level: 'Platinum', influence: 95, reach: 2500, spreadCount: 25, isActive: true, lastSpreadDay: 1 },
  { id: 'node-4', name: '古典乐迷老陈', avatar: '🎻', level: 'Bronze', influence: 45, reach: 400, spreadCount: 3, isActive: false, lastSpreadDay: 2 },
  { id: 'node-5', name: '活动达人小美', avatar: '🎉', level: 'Gold', influence: 75, reach: 950, spreadCount: 12, isActive: true, lastSpreadDay: 1 },
  { id: 'node-6', name: '独立音乐爱好者', avatar: '🎧', level: 'Silver', influence: 55, reach: 600, spreadCount: 6, isActive: true, lastSpreadDay: 1 },
  { id: 'node-7', name: '唱片收藏家阿伟', avatar: '💎', level: 'Diamond', influence: 100, reach: 5000, spreadCount: 40, isActive: true, lastSpreadDay: 1 }
]

const sampleChannels: WordOfMouthChannel[] = [
  { id: 'channel-1', name: '邻里口传', icon: '🏘️', description: '街坊邻居之间的口耳相传', reachMultiplier: 1.0, reputationGainMultiplier: 1.0, unlockReputation: 0, isUnlocked: true, currentReach: 500, dailyGrowth: 10 },
  { id: 'channel-2', name: '音乐爱好者圈子', icon: '🎵', description: '本地音乐爱好者社群', reachMultiplier: 1.5, reputationGainMultiplier: 1.2, unlockReputation: 30, isUnlocked: false, currentReach: 0, dailyGrowth: 0 },
  { id: 'channel-3', name: '社交媒体', icon: '📱', description: '线上社交平台传播', reachMultiplier: 2.0, reputationGainMultiplier: 1.5, unlockReputation: 50, isUnlocked: false, currentReach: 0, dailyGrowth: 0 },
  { id: 'channel-4', name: '电台合作', icon: '📻', description: '与本地电台合作推广', reachMultiplier: 2.5, reputationGainMultiplier: 1.8, unlockReputation: 70, isUnlocked: false, currentReach: 0, dailyGrowth: 0 },
  { id: 'channel-5', name: '全国媒体', icon: '📰', description: '获得全国性媒体报道', reachMultiplier: 3.5, reputationGainMultiplier: 2.5, unlockReputation: 90, isUnlocked: false, currentReach: 0, dailyGrowth: 0 }
]

const sampleEvents: CommunityEvent[] = [
  {
    id: 'event-1',
    type: 'listening_party',
    typeName: '聆听派对',
    typeIcon: '🎧',
    title: '爵士经典夜',
    description: '一起聆听经典爵士唱片，分享你的珍藏，认识同好。',
    bannerIcon: '🎷',
    status: 'signup',
    signupStartDay: 1,
    signupEndDay: 3,
    eventDay: 5,
    maxParticipants: 30,
    currentParticipants: 12,
    minReputation: 10,
    entryFee: 0,
    rewards: { reputation: 15, budget: 0, growthPoints: 20 },
    genreFocus: ['Jazz'],
    isParticipating: false,
    participantAvatars: ['🎩', '🎻', '👑', '🎉']
  },
  {
    id: 'event-2',
    type: 'swap_meet',
    typeName: '交换市集',
    typeIcon: '🔄',
    title: '黑胶交换市集',
    description: '带着你的闲置唱片来交换吧！',
    bannerIcon: '🔄',
    status: 'upcoming',
    signupStartDay: 3,
    signupEndDay: 7,
    eventDay: 10,
    maxParticipants: 50,
    currentParticipants: 0,
    minReputation: 5,
    entryFee: 0,
    rewards: { reputation: 10, budget: 0, growthPoints: 15 },
    isParticipating: false,
    participantAvatars: []
  },
  {
    id: 'event-3',
    type: 'workshop',
    typeName: '黑胶工坊',
    typeIcon: '🔧',
    title: '黑胶保养入门',
    description: '学习如何正确保养和清洁你的黑胶唱片。',
    bannerIcon: '🧹',
    status: 'ended',
    signupStartDay: -2,
    signupEndDay: 0,
    eventDay: 1,
    maxParticipants: 20,
    currentParticipants: 18,
    minReputation: 0,
    entryFee: 20,
    rewards: { reputation: 8, budget: 0, growthPoints: 30 },
    isParticipating: true,
    participantAvatars: ['🎩', '🎸', '🎻', '👑', '🎉'],
    satisfaction: 4.5
  }
]

const sampleRewards: CommunityReward[] = [
  {
    id: 'reward-1',
    type: 'daily_checkin',
    typeName: '每日签到',
    typeIcon: '📅',
    title: '每日签到',
    description: '每日在社群签到获得奖励',
    icon: '📅',
    budgetReward: 10,
    reputationReward: 1,
    growthPointsReward: 0,
    requirement: { type: 'checkin_days', target: 1, current: 0 },
    isClaimed: false,
    isClaimable: true
  },
  {
    id: 'reward-2',
    type: 'post_reward',
    typeName: '发帖奖励',
    typeIcon: '✍️',
    title: '首次发帖',
    description: '在社群发布你的第一条帖子',
    icon: '📝',
    budgetReward: 30,
    reputationReward: 5,
    growthPointsReward: 10,
    requirement: { type: 'posts', target: 1, current: 0 },
    isClaimed: false,
    isClaimable: false
  },
  {
    id: 'reward-3',
    type: 'post_reward',
    typeName: '发帖奖励',
    typeIcon: '✍️',
    title: '活跃发帖达人',
    description: '累计发布5条帖子',
    icon: '🏅',
    budgetReward: 100,
    reputationReward: 15,
    growthPointsReward: 25,
    requirement: { type: 'posts', target: 5, current: 0 },
    isClaimed: false,
    isClaimable: false
  },
  {
    id: 'reward-4',
    type: 'spread_reward',
    typeName: '扩散奖励',
    typeIcon: '📣',
    title: '口碑扩散者',
    description: '让更多人知道你的店',
    icon: '📣',
    budgetReward: 50,
    reputationReward: 10,
    growthPointsReward: 15,
    requirement: { type: 'shares', target: 10, current: 0 },
    isClaimed: false,
    isClaimable: false
  },
  {
    id: 'reward-5',
    type: 'event_reward',
    typeName: '活动奖励',
    typeIcon: '🎪',
    title: '活动达人',
    description: '参加3次社群活动',
    icon: '🎟️',
    budgetReward: 200,
    reputationReward: 30,
    growthPointsReward: 50,
    requirement: { type: 'event_participation', target: 3, current: 1 },
    isClaimed: false,
    isClaimable: false
  },
  {
    id: 'reward-6',
    type: 'milestone_reward',
    typeName: '里程碑奖励',
    typeIcon: '🏆',
    title: '社群新星',
    description: '社群影响力达到100',
    icon: '⭐',
    budgetReward: 150,
    reputationReward: 20,
    growthPointsReward: 30,
    requirement: { type: 'likes', target: 100, current: 0 },
    isClaimed: false,
    isClaimable: false
  }
]

const initialStats: CommunityStats = {
  totalPosts: 5,
  totalLikes: 672,
  totalShares: 84,
  totalComments: 211,
  activeUsers: 25,
  dailyPosts: 3,
  weeklyPosts: 15,
  eventsParticipated: 1,
  totalRewardsClaimed: 0,
  totalBudgetRewarded: 0,
  totalReputationGained: 0,
  consecutiveCheckinDays: 0,
  longestCheckinStreak: 0,
  influenceScore: 45,
  communityLevel: 2
}

export const createInitialCommunityState = (): CommunityState => {
  return {
    posts: [...samplePosts],
    trends: [...sampleTrends],
    spreadNodes: [...sampleSpreadNodes],
    channels: sampleChannels.map(c => ({ ...c })),
    events: sampleEvents.map(e => ({ ...e })),
    rewards: sampleRewards.map(r => ({ ...r })),
    stats: { ...initialStats },
    lastRefreshDay: 1,
    selectedTab: 'posts',
    todayCheckedIn: false,
    unreadNotifications: 3
  }
}

export const getPostTypeConfig = (type: CommunityPostType) => {
  return postTypeConfigs[type]
}

export const getEventTypeConfig = (type: CommunityEventType) => {
  return eventTypeConfigs[type]
}

export const getRewardTypeConfig = (type: RewardType) => {
  return rewardTypeConfigs[type]
}

export const getGenreIcon = (genre: Genre) => {
  return genreIcons[genre] || '🎵'
}

export const getTrendColor = (heatLevel: string): string => {
  const colors: Record<string, string> = {
    cold: '#718096',
    cool: '#4299e1',
    warm: '#ed8936',
    hot: '#f56565',
    scorching: '#e94560'
  }
  return colors[heatLevel] || colors.cool
}

export const getTrendIcon = (trend: 'rising' | 'stable' | 'falling'): string => {
  const icons = { rising: '📈', stable: '➡️', falling: '📉' }
  return icons[trend]
}

export const getHeatLevelLabel = (heatLevel: string): string => {
  const labels: Record<string, string> = {
    cold: '冷门',
    cool: '微凉',
    warm: '温暖',
    hot: '火热',
    scorching: '爆火'
  }
  return labels[heatLevel] || '未知'
}

export const likePost = (postId: string, state: CommunityState): { post: CommunityPost | undefined; reputationGain: number; growthPoints: number } => {
  const post = state.posts.find(p => p.id === postId)
  if (!post) return { post: undefined, reputationGain: 0, growthPoints: 0 }

  if (post.isLiked) {
    post.likes = Math.max(0, post.likes - 1)
    post.isLiked = false
    return { post: { ...post }, reputationGain: 0, growthPoints: 0 }
  } else {
    post.likes += 1
    post.isLiked = true
    state.stats.totalLikes += 1
    const reputationGain = 1
    const growthPoints = updateRewardProgress(state, 'likes', 1)
    return { post: { ...post }, reputationGain, growthPoints }
  }
}

export const sharePost = (postId: string, state: CommunityState): { post: CommunityPost | undefined; reputationGain: number; growthPoints: number } => {
  const post = state.posts.find(p => p.id === postId)
  if (!post) return { post: undefined, reputationGain: 0, growthPoints: 0 }

  post.shares += 1
  state.stats.totalShares += 1
  const reputationGain = 2
  const growthPoints = updateRewardProgress(state, 'shares', 1)
  return { post: { ...post }, reputationGain, growthPoints }
}

export const createPost = (
  type: CommunityPostType,
  content: string,
  recordTitle?: string,
  recordArtist?: string,
  recordGenre?: Genre,
  recordCoverColor?: string,
  tags: string[] = []
): CommunityPost => {
  const config = postTypeConfigs[type]
  return {
    id: `post-${Date.now()}`,
    type,
    typeName: config.name,
    typeIcon: config.icon,
    authorName: '你',
    authorAvatar: '🏪',
    authorLevel: null,
    content,
    recordTitle,
    recordArtist,
    recordGenre,
    recordCoverColor,
    likes: 0,
    comments: 0,
    shares: 0,
    isLiked: false,
    timestamp: Date.now(),
    dayPosted: 1,
    tags,
    reputationImpact: config.reputationReward
  }
}

export const checkin = (state: CommunityState): { success: boolean; message: string; budgetReward: number; reputationReward: number } => {
  if (state.todayCheckedIn) {
    return { success: false, message: '今天已经签到过了', budgetReward: 0, reputationReward: 0 }
  }

  state.todayCheckedIn = true
  state.stats.consecutiveCheckinDays += 1
  if (state.stats.consecutiveCheckinDays > state.stats.longestCheckinStreak) {
    state.stats.longestCheckinStreak = state.stats.consecutiveCheckinDays
  }

  const baseBudget = 10 + state.stats.consecutiveCheckinDays * 2
  const baseReputation = 1 + Math.floor(state.stats.consecutiveCheckinDays / 3)

  state.stats.totalBudgetRewarded += baseBudget
  state.stats.totalReputationGained += baseReputation

  const dailyReward = state.rewards.find(r => r.type === 'daily_checkin')
  if (dailyReward) {
    dailyReward.requirement.current = Math.min(dailyReward.requirement.current + 1, dailyReward.requirement.target)
  }

  return {
    success: true,
    message: `签到成功！连续签到${state.stats.consecutiveCheckinDays}天`,
    budgetReward: baseBudget,
    reputationReward: baseReputation
  }
}

export const signupForEvent = (eventId: string, state: CommunityState, reputation: number, budget: number): EventSignupResult => {
  const event = state.events.find(e => e.id === eventId)
  if (!event) {
    return { success: false, message: '活动不存在' }
  }

  if (event.status !== 'signup') {
    return { success: false, message: '活动不在报名期' }
  }

  if (event.isParticipating) {
    return { success: false, message: '已经报名了该活动' }
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return { success: false, message: '活动名额已满' }
  }

  if (reputation < event.minReputation) {
    return { success: false, message: `声望不足，需要${event.minReputation}声望` }
  }

  if (budget < event.entryFee) {
    return { success: false, message: '预算不足' }
  }

  event.isParticipating = true
  event.currentParticipants += 1
  state.stats.eventsParticipated += 1

  updateRewardProgress(state, 'event_participation', 1)

  const eventReward = state.rewards.find(r => r.type === 'event_reward')
  if (eventReward) {
    eventReward.requirement.current = Math.min(
      eventReward.requirement.current + 1,
      eventReward.requirement.target
    )
    if (eventReward.requirement.current >= eventReward.requirement.target) {
      eventReward.isClaimable = true
    }
  }

  return {
    success: true,
    message: `成功报名活动：${event.title}`,
    event: { ...event },
    cost: event.entryFee
  }
}

export const claimReward = (rewardId: string, state: CommunityState): RewardClaimResult => {
  const reward = state.rewards.find(r => r.id === rewardId)
  if (!reward) {
    return { success: false, message: '奖励不存在' }
  }

  if (reward.isClaimed) {
    return { success: false, message: '奖励已领取' }
  }

  if (!reward.isClaimable && reward.requirement.current < reward.requirement.target) {
    return { success: false, message: '未达到领取条件' }
  }

  reward.isClaimed = true
  reward.claimDay = 1
  state.stats.totalRewardsClaimed += 1

  return {
    success: true,
    message: `成功领取：${reward.title}`,
    reward: { ...reward },
    budgetGained: reward.budgetReward,
    reputationGained: reward.reputationReward,
    growthPointsGained: reward.growthPointsReward
  }
}

export const updateChannelsByReputation = (state: CommunityState, reputation: number) => {
  state.channels.forEach(channel => {
    if (reputation >= channel.unlockReputation && !channel.isUnlocked) {
      channel.isUnlocked = true
      channel.currentReach = 100
      channel.dailyGrowth = 5 + channel.reachMultiplier * 2
    }
  })
}

export const getTotalReach = (state: CommunityState): number => {
  return state.channels
    .filter(c => c.isUnlocked)
    .reduce((sum, c) => sum + c.currentReach, 0)
}

export const getActiveSpreadNodes = (state: CommunityState): WordOfMouthSpreadNode[] => {
  return state.spreadNodes.filter(n => n.isActive)
}

export const getUpcomingEvents = (state: CommunityState): CommunityEvent[] => {
  return state.events.filter(e => e.status === 'upcoming' || e.status === 'signup')
}

export const getClaimableRewardsCount = (state: CommunityState): number => {
  return state.rewards.filter(r => r.isClaimable && !r.isClaimed).length
}

export const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

export const refreshCommunityDaily = (state: CommunityState, currentDay: number) => {
  if (state.lastRefreshDay >= currentDay) return

  state.todayCheckedIn = false
  state.lastRefreshDay = currentDay

  state.stats.dailyPosts = 0

  state.channels.forEach(channel => {
    if (channel.isUnlocked) {
      channel.currentReach += channel.dailyGrowth
    }
  })

  state.events.forEach(event => {
    if (currentDay >= event.signupStartDay && currentDay <= event.signupEndDay && event.status === 'upcoming') {
      event.status = 'signup'
    }
    if (currentDay > event.signupEndDay && event.status === 'signup') {
      event.status = 'upcoming'
    }
    if (currentDay === event.eventDay && (event.status === 'signup' || event.status === 'upcoming')) {
      event.status = 'in_progress'
    }
    if (currentDay > event.eventDay && event.status === 'in_progress') {
      event.status = 'ended'
      event.satisfaction = 4 + Math.random() * 1.5
    }
  })

  state.rewards.forEach(reward => {
    if (!reward.isClaimed && reward.requirement.current >= reward.requirement.target) {
      reward.isClaimable = true
    }
  })
}

export const updateRewardProgress = (
  state: CommunityState,
  requirementType: 'posts' | 'likes' | 'shares' | 'checkin_days' | 'referrals' | 'event_participation',
  increment: number = 1
): number => {
  let totalGrowthPoints = 0

  state.rewards.forEach(reward => {
    if (!reward.isClaimed && reward.requirement.type === requirementType) {
      reward.requirement.current = Math.min(
        reward.requirement.current + increment,
        reward.requirement.target
      )
      if (reward.requirement.current >= reward.requirement.target) {
        reward.isClaimable = true
      }
    }
  })

  return totalGrowthPoints
}
