import type { Customer, Genre, MemberProfile, TimeSlot, PatienceLevel, PatienceConfig, CustomerQueueSortStrategy, CustomerIdentityTag, CustomerIdentityConfig } from '@/types'
import {
  createMemberProfile,
  updateMemberOnVisit,
  calculateMemberDiscount,
  getMemberBenefit
} from './members'
import {
  getBudgetWithReputation,
  alignPreferencesWithInventory,
  getMatchScoreBonus
} from './wordOfMouth'
import {
  adjustGenrePreferences,
  adjustPriceRange,
  getTimeSlotConfig
} from './timeSlots'

const customerNames = [
  '老爵士王', '摇滚青年', '灵魂歌者', '放克达人', '迪斯科女王',
  '古典乐迷', '布鲁斯大叔', '流行天后', '电子玩家', '民谣诗人',
  '收藏家老李', '音乐教授', '文艺青年', '复古潮人', '黑胶新手',
  '爵士乐手', '唱片猎人', '音响发烧友', '独立音乐人', '电台DJ'
]

const avatars = ['👨‍🎤', '👩‍🎨', '👴', '👵', '🧑', '👨‍💼', '👩‍💻', '🧑‍🎨', '👨‍🎓', '👩‍🏫', '🕺', '💃', '🎸', '🎹', '🥁', '🎺', '🎻', '🎤', '🎧', '📀']

const genreBundles: { genres: Genre[], name: string }[] = [
  { genres: ['Jazz', 'Blues'], name: '爵士布鲁斯迷' },
  { genres: ['Rock', 'Funk'], name: '摇滚放克党' },
  { genres: ['Soul', 'Pop'], name: '灵魂流行派' },
  { genres: ['Disco', 'Electronic'], name: '电子跳舞族' },
  { genres: ['Classical', 'Folk'], name: '古典民谣党' },
  { genres: ['Jazz', 'Classical'], name: '高雅音乐派' },
  { genres: ['Rock', 'Pop'], name: '流行摇滚迷' },
  { genres: ['Funk', 'Soul', 'Disco'], name: '黑人音乐迷' },
  { genres: ['Electronic', 'Pop'], name: '电子流行派' },
  { genres: ['Blues', 'Rock', 'Folk'], name: '根源音乐党' }
]

export const customerIdentityConfigs: CustomerIdentityConfig[] = [
  {
    tag: 'newbie',
    name: '音乐新手',
    icon: '🌱',
    description: '初次接触黑胶唱片，对各种音乐风格都充满好奇',
    baseWeight: 25,
    preferenceStrength: [0.2, 0.4],
    priceRangeMultiplier: [0.7, 0.9],
    budgetMultiplier: [0.7, 1.0],
    rarityBias: [1, 1, 1, 0.3, 0.1],
    genreFocusCount: [3, 5],
    satisfactionOnMatch: 8,
    satisfactionOnMismatch: -3,
    collectionChanceBonus: -0.1,
    bargainModifier: 0.15,
    patienceModifier: 1.1
  },
  {
    tag: 'collector',
    name: '资深收藏家',
    icon: '💎',
    description: '追求稀有珍品，只收精品，愿意为心头好一掷千金',
    baseWeight: 10,
    preferenceStrength: [0.8, 1.0],
    priceRangeMultiplier: [1.5, 2.5],
    budgetMultiplier: [1.8, 3.0],
    rarityBias: [0.1, 0.3, 0.6, 1.0, 1.5],
    genreFocusCount: [1, 2],
    satisfactionOnMatch: 15,
    satisfactionOnMismatch: -10,
    collectionChanceBonus: 0.4,
    bargainModifier: -0.15,
    patienceModifier: 0.9,
    unlockedByAlbumIds: ['album-rare-1']
  },
  {
    tag: 'connoisseur',
    name: '鉴赏行家',
    icon: '🎓',
    description: '对品相要求极高，注重唱片的收藏价值和保存状态',
    baseWeight: 12,
    preferenceStrength: [0.6, 0.85],
    priceRangeMultiplier: [1.2, 1.8],
    budgetMultiplier: [1.3, 2.0],
    rarityBias: [0.2, 0.5, 0.8, 1.0, 0.8],
    genreFocusCount: [2, 3],
    satisfactionOnMatch: 12,
    satisfactionOnMismatch: -8,
    collectionChanceBonus: 0.25,
    bargainModifier: -0.05,
    patienceModifier: 1.0,
    unlockedByAlbumIds: ['album-rare-2']
  },
  {
    tag: 'enthusiast',
    name: '音乐发烧友',
    icon: '🔥',
    description: '对特定风格极度热爱，深入挖掘该流派的每一张唱片',
    baseWeight: 18,
    preferenceStrength: [0.7, 0.95],
    priceRangeMultiplier: [1.0, 1.5],
    budgetMultiplier: [1.1, 1.8],
    rarityBias: [0.3, 0.6, 0.9, 1.0, 0.7],
    genreFocusCount: [1, 2],
    satisfactionOnMatch: 18,
    satisfactionOnMismatch: -12,
    collectionChanceBonus: 0.15,
    bargainModifier: 0.05,
    patienceModifier: 0.85
  },
  {
    tag: 'pragmatist',
    name: '实用主义者',
    icon: '💰',
    description: '注重性价比，只买合适的不买贵的',
    baseWeight: 20,
    preferenceStrength: [0.3, 0.6],
    priceRangeMultiplier: [0.6, 0.9],
    budgetMultiplier: [0.6, 0.95],
    rarityBias: [1.0, 1.0, 0.7, 0.4, 0.2],
    genreFocusCount: [2, 4],
    satisfactionOnMatch: 6,
    satisfactionOnMismatch: -5,
    collectionChanceBonus: -0.05,
    bargainModifier: 0.2,
    patienceModifier: 1.05
  },
  {
    tag: 'adventurer',
    name: '猎奇探索家',
    icon: '🗺️',
    description: '喜欢尝试各种小众音乐风格，乐于发现新声音',
    baseWeight: 15,
    preferenceStrength: [0.4, 0.7],
    priceRangeMultiplier: [0.8, 1.2],
    budgetMultiplier: [0.9, 1.4],
    rarityBias: [0.5, 0.8, 1.0, 0.9, 0.6],
    genreFocusCount: [4, 6],
    satisfactionOnMatch: 10,
    satisfactionOnMismatch: 2,
    collectionChanceBonus: 0.1,
    bargainModifier: 0.0,
    patienceModifier: 1.15
  }
]

const getIdentityConfig = (tag: CustomerIdentityTag): CustomerIdentityConfig => {
  return customerIdentityConfigs.find(c => c.tag === tag) || customerIdentityConfigs[0]
}

export const generateIdentityTag = (
  unlockedAlbumIds: string[] = [],
  reputation: number = 50
): CustomerIdentityTag | null => {
  const availableConfigs = customerIdentityConfigs.filter(config => {
    if (config.unlockedByAlbumIds && config.unlockedByAlbumIds.length > 0) {
      return config.unlockedByAlbumIds.every(id => unlockedAlbumIds.includes(id))
    }
    return true
  })

  if (availableConfigs.length === 0) return null

  const reputationBoost = Math.min(0.5, reputation / 200)
  const weights = availableConfigs.map(config => {
    let weight = config.baseWeight
    if (config.tag === 'collector' || config.tag === 'connoisseur') {
      weight *= (1 + reputationBoost)
    }
    if (config.tag === 'newbie') {
      weight *= (1 - reputationBoost * 0.5)
    }
    return weight
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < availableConfigs.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return availableConfigs[i].tag
    }
  }

  return availableConfigs[0].tag
}

const generatePreference = (identityTag: CustomerIdentityTag | null = null) => {
  const bundle = genreBundles[Math.floor(Math.random() * genreBundles.length)]
  const priceRanges: [number, number][] = [
    [100, 250],
    [200, 400],
    [300, 500],
    [400, 600]
  ]
  let priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)]
  let preferredRarity = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 2, 3],
    [3, 4, 5]
  ][Math.floor(Math.random() * 6)] as number[]

  let preferenceStrength = 0.4 + Math.random() * 0.6
  let favoriteGenres = [...bundle.genres]

  if (identityTag) {
    const identityConfig = getIdentityConfig(identityTag)

    const strengthMin = identityConfig.preferenceStrength[0]
    const strengthMax = identityConfig.preferenceStrength[1]
    preferenceStrength = strengthMin + Math.random() * (strengthMax - strengthMin)

    const priceMultMin = identityConfig.priceRangeMultiplier[0]
    const priceMultMax = identityConfig.priceRangeMultiplier[1]
    const priceMultiplier = priceMultMin + Math.random() * (priceMultMax - priceMultMin)
    priceRange = [
      Math.floor(priceRange[0] * priceMultiplier),
      Math.floor(priceRange[1] * priceMultiplier)
    ]

    const genreCountMin = identityConfig.genreFocusCount[0]
    const genreCountMax = identityConfig.genreFocusCount[1]
    const targetGenreCount = Math.floor(genreCountMin + Math.random() * (genreCountMax - genreCountMin + 1))

    if (targetGenreCount > favoriteGenres.length) {
      const allGenres: Genre[] = ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk']
      const availableGenres = allGenres.filter(g => !favoriteGenres.includes(g))
      const shuffled = availableGenres.sort(() => Math.random() - 0.5)
      const additionalGenres = shuffled.slice(0, targetGenreCount - favoriteGenres.length)
      favoriteGenres = [...favoriteGenres, ...additionalGenres]
    } else if (targetGenreCount < favoriteGenres.length) {
      favoriteGenres = favoriteGenres.slice(0, targetGenreCount)
    }

    const rarityBias = identityConfig.rarityBias
    const weightedRarities: number[] = []
    for (let rarity = 1; rarity <= 5; rarity++) {
      const count = Math.ceil(rarityBias[rarity - 1] * 10)
      for (let i = 0; i < count; i++) {
        weightedRarities.push(rarity)
      }
    }
    if (weightedRarities.length > 0) {
      const selectedRarities = new Set<number>()
      while (selectedRarities.size < 2 && weightedRarities.length > 0) {
        const idx = Math.floor(Math.random() * weightedRarities.length)
        selectedRarities.add(weightedRarities[idx])
        weightedRarities.splice(idx, 1)
      }
      preferredRarity = Array.from(selectedRarities).sort((a, b) => a - b)
    }
  }

  return {
    favoriteGenres,
    priceRange,
    preferredRarity,
    preferenceStrength
  }
}

export const defaultPatienceConfig: PatienceConfig = {
  decayBaseRate: 1.0,
  playbackSlowdownFactor: 0.5,
  genreMatchSlowdownFactor: 0.65,
  skipChainPenaltyFactor: 1.5,
  lowPatienceUrgencyBoost: 30,
  maxPriorityBonus: 50
}

export const getPatienceLevel = (patience: number, maxPatience: number): PatienceLevel => {
  const ratio = patience / maxPatience
  if (ratio >= 0.8) return 'calm'
  if (ratio >= 0.6) return 'waiting'
  if (ratio >= 0.4) return 'restless'
  if (ratio >= 0.2) return 'impatient'
  return 'furious'
}

export const getPatienceLevelLabel = (level: PatienceLevel): string => {
  const labels: Record<PatienceLevel, string> = {
    calm: '从容',
    waiting: '等候中',
    restless: '略显烦躁',
    impatient: '不耐烦',
    furious: '即将离开'
  }
  return labels[level]
}

export const getPatienceLevelColor = (level: PatienceLevel): string => {
  const colors: Record<PatienceLevel, string> = {
    calm: '#48bb78',
    waiting: '#ecc94b',
    restless: '#ed8936',
    impatient: '#ed64a6',
    furious: '#f56565'
  }
  return colors[level]
}

const calculatePriorityScore = (
  customer: Customer,
  config: PatienceConfig,
  arrivalOrder: number
): number => {
  let score = 0

  const patienceRatio = customer.patience / customer.maxPatience
  score += (1 - patienceRatio) * config.lowPatienceUrgencyBoost

  if (customer.memberProfile) {
    const memberLevelBonus: Record<string, number> = {
      Diamond: 40,
      Platinum: 30,
      Gold: 20,
      Silver: 10,
      Bronze: 5
    }
    score += memberLevelBonus[customer.memberProfile.level] || 0
  }

  if (customer.isReturningCustomer && !customer.memberProfile) {
    score += 5
  }

  const budgetScore = Math.min(20, customer.budget / 50)
  score += budgetScore

  score -= arrivalOrder * 0.1

  return Math.min(config.maxPriorityBonus + 100, Math.max(0, score))
}

export const calculatePatienceDecay = (
  customer: Customer,
  isPlaying: boolean,
  playingRecordGenres: Genre[],
  config: PatienceConfig = defaultPatienceConfig
): number => {
  let decay = customer.patienceDecayRate

  if (isPlaying && playingRecordGenres.length > 0) {
    const hasGenreMatch = customer.preference.favoriteGenres.some(
      g => playingRecordGenres.includes(g)
    )
    if (hasGenreMatch) {
      decay *= config.genreMatchSlowdownFactor
    } else {
      decay *= config.playbackSlowdownFactor
    }
  }

  return decay
}

export const applyPatienceDecay = (
  customer: Customer,
  decayAmount: number
): Customer => {
  const newPatience = Math.max(0, customer.patience - decayAmount)
  const patienceRatio = newPatience / customer.maxPatience
  return {
    ...customer,
    patience: newPatience,
    isImpatient: patienceRatio <= 0.3,
    hasLeftAngrily: newPatience <= 0
  }
}

export const sortCustomerQueue = (
  customers: Customer[],
  strategy: CustomerQueueSortStrategy = {
    prioritizeImpatient: true,
    prioritizeMembers: true,
    prioritizeHighBudget: true,
    prioritizeSpecial: true
  }
): Customer[] => {
  return [...customers].sort((a, b) => {
    if (a.hasLeftAngrily && !b.hasLeftAngrily) return 1
    if (!a.hasLeftAngrily && b.hasLeftAngrily) return -1

    let scoreA = a.priorityScore
    let scoreB = b.priorityScore

    if (strategy.prioritizeImpatient) {
      const patiencePenaltyA = (a.patience / a.maxPatience) * 40
      const patiencePenaltyB = (b.patience / b.maxPatience) * 40
      scoreA += (40 - patiencePenaltyA)
      scoreB += (40 - patiencePenaltyB)
    }

    if (strategy.prioritizeMembers) {
      if (a.memberProfile && !b.memberProfile) scoreA += 25
      if (!a.memberProfile && b.memberProfile) scoreB += 25
    }

    if (strategy.prioritizeHighBudget) {
      const budgetDiff = a.budget - b.budget
      scoreA += Math.min(15, budgetDiff / 100)
      scoreB -= Math.min(15, budgetDiff / 100)
    }

    return scoreB - scoreA
  })
}

export const generateCustomer = (
  id: string,
  memberProfile: MemberProfile | null = null,
  reputation: number = 50,
  inventoryGenres: Genre[] = [],
  timeSlot: TimeSlot = 'afternoon',
  arrivalOrder: number = 0,
  identityTag: CustomerIdentityTag | null = null
): Customer => {
  let preference
  let name
  let avatar
  let budget
  let basePatience
  let memberDiscount = 0
  let patienceDecayRate = defaultPatienceConfig.decayBaseRate
  let baseSatisfaction = 50

  if (memberProfile) {
    const updatedMember = updateMemberOnVisit(memberProfile)
    let memberGenres = updatedMember.favoriteGenres
    if (inventoryGenres.length > 0) {
      const slotAdjusted = adjustGenrePreferences(memberGenres, timeSlot)
      const hasMatch = memberGenres.some(g => slotAdjusted.includes(g))
      if (!hasMatch || Math.random() < 0.5) {
        memberGenres = [...new Set([...slotAdjusted, ...memberGenres.slice(0, 1)])]
      }
    }
    preference = {
      favoriteGenres: memberGenres,
      priceRange: adjustPriceRange(updatedMember.priceRange, timeSlot),
      preferredRarity: updatedMember.preferredRarity,
      preferenceStrength: updatedMember.preferenceStrength
    }
    name = updatedMember.name
    avatar = updatedMember.avatar
    const slotConfig = getTimeSlotConfig(timeSlot)
    const baseBudget = preference.priceRange[1] * (1.8 + Math.random() * 0.8)
    budget = Math.floor(getBudgetWithReputation(baseBudget, reputation) * slotConfig.budgetModifier * (1 + updatedMember.visitCount * 0.03))
    basePatience = 50 + Math.floor(Math.random() * 50) + updatedMember.visitCount
    memberDiscount = calculateMemberDiscount(updatedMember.level)
    baseSatisfaction = 50 + Math.floor(updatedMember.visitCount * 2)

    const levelDecayMod: Record<string, number> = {
      Diamond: 0.6,
      Platinum: 0.7,
      Gold: 0.8,
      Silver: 0.9,
      Bronze: 0.95
    }
    patienceDecayRate *= (levelDecayMod[updatedMember.level] || 1.0)

    const memberBargainBias = updatedMember.level === 'Diamond' || updatedMember.level === 'Platinum' ? -0.2 :
                              updatedMember.level === 'Gold' ? -0.1 : 0

    const customer: Customer = {
      id,
      name,
      avatar,
      preference,
      budget,
      patience: basePatience,
      maxPatience: basePatience,
      patienceDecayRate,
      arrivalOrder,
      priorityScore: 0,
      satisfaction: baseSatisfaction,
      memberProfile: updatedMember,
      isReturningCustomer: true,
      memberDiscount,
      bargainAggressiveness: Math.max(0.1, Math.min(0.8, 0.3 + Math.random() * 0.4 + memberBargainBias)),
      bargainToughness: Math.max(0.2, Math.min(0.9, 0.4 + Math.random() * 0.4 + memberBargainBias * 0.5)),
      willBargain: Math.random() < (0.35 + memberBargainBias + updatedMember.visitCount * 0.01),
      isImpatient: false,
      hasLeftAngrily: false,
      identityTag
    }

    customer.priorityScore = calculatePriorityScore(customer, defaultPatienceConfig, arrivalOrder)
    return customer
  } else {
    const nameIndex = Math.floor(Math.random() * customerNames.length)
    const avatarIndex = Math.floor(Math.random() * avatars.length)
    preference = generatePreference(identityTag)
    name = customerNames[nameIndex]
    avatar = avatars[avatarIndex]
    const slotConfig = getTimeSlotConfig(timeSlot)
    preference.favoriteGenres = adjustGenrePreferences(preference.favoriteGenres, timeSlot)
    preference.priceRange = adjustPriceRange(preference.priceRange, timeSlot)
    const slotRarity = slotConfig.rarityPreferenceBonus
    if (slotRarity.length > 0 && Math.random() < 0.4) {
      preference.preferredRarity = slotRarity
    }

    let baseBudget = preference.priceRange[1] * (1.5 + Math.random())

    let bargainModifier = 0
    let patienceModifier = 1.0

    if (identityTag) {
      const identityConfig = getIdentityConfig(identityTag)
      const budgetMultMin = identityConfig.budgetMultiplier[0]
      const budgetMultMax = identityConfig.budgetMultiplier[1]
      const budgetMultiplier = budgetMultMin + Math.random() * (budgetMultMax - budgetMultMin)
      baseBudget *= budgetMultiplier

      bargainModifier = identityConfig.bargainModifier
      patienceModifier = identityConfig.patienceModifier
    }

    budget = getBudgetWithReputation(Math.floor(baseBudget), reputation)
    basePatience = Math.floor((30 + Math.floor(Math.random() * 40)) * patienceModifier)

    if (timeSlot === 'night') {
      patienceDecayRate *= 1.15
    }

    if (inventoryGenres.length > 0) {
      preference.favoriteGenres = alignPreferencesWithInventory(
        preference.favoriteGenres,
        inventoryGenres,
        reputation
      )
    }

    const customer: Customer = {
      id,
      name,
      avatar,
      preference,
      budget,
      patience: basePatience,
      maxPatience: basePatience,
      patienceDecayRate,
      arrivalOrder,
      priorityScore: 0,
      satisfaction: baseSatisfaction,
      memberProfile: null,
      isReturningCustomer: false,
      memberDiscount: 0,
      bargainAggressiveness: Math.max(0.1, Math.min(0.8, 0.2 + Math.random() * 0.6 + bargainModifier)),
      bargainToughness: Math.max(0.2, Math.min(0.9, 0.3 + Math.random() * 0.5 + bargainModifier * 0.5)),
      willBargain: Math.random() < (0.45 + bargainModifier),
      isImpatient: false,
      hasLeftAngrily: false,
      identityTag
    }

    customer.priorityScore = calculatePriorityScore(customer, defaultPatienceConfig, arrivalOrder)
    return customer
  }
}

export const generateDailyCustomers = (
  count: number,
  day: number,
  existingMembers: MemberProfile[] = [],
  reputation: number = 50,
  inventoryGenres: Genre[] = [],
  timeSlot: TimeSlot = 'afternoon',
  unlockedAlbumIds: string[] = []
): { customers: Customer[]; newMembers: MemberProfile[] } => {
  const customers: Customer[] = []
  const newMemberProfiles: MemberProfile[] = []
  let arrivalCounter = 0

  const returningMemberCount = Math.min(
    existingMembers.length,
    Math.floor(count * (0.1 + day * 0.05))
  )
  const shuffledMembers = [...existingMembers].sort(() => Math.random() - 0.5)
  const selectedReturningMembers = shuffledMembers.slice(0, returningMemberCount)

  for (let i = 0; i < selectedReturningMembers.length; i++) {
    const member = selectedReturningMembers[i]
    const memberIdentityTag = generateIdentityTag(unlockedAlbumIds, reputation)
    const customer = generateCustomer(
      `cust-${day}-return-${i}-${Date.now()}`,
      member,
      reputation,
      inventoryGenres,
      timeSlot,
      arrivalCounter++,
      memberIdentityTag
    )
    customer.budget = Math.floor(customer.budget * (1 + day * 0.05))
    customers.push(customer)
  }

  const newCustomerCount = count - selectedReturningMembers.length
  for (let i = 0; i < newCustomerCount; i++) {
    const identityTag = generateIdentityTag(unlockedAlbumIds, reputation)
    const customer = generateCustomer(
      `cust-${day}-new-${i}-${Date.now()}`,
      null,
      reputation,
      inventoryGenres,
      timeSlot,
      arrivalCounter++,
      identityTag
    )
    customer.budget = Math.floor(customer.budget * (1 + day * 0.05))
    const dayPatienceMod = Math.max(0.7, 1 - day * 0.02)
    customer.patience = Math.floor(customer.patience * dayPatienceMod)
    customer.maxPatience = customer.patience
    customer.priorityScore = calculatePriorityScore(customer, defaultPatienceConfig, customer.arrivalOrder)
    customers.push(customer)
  }

  const initialShuffle = [...customers].sort(() => Math.random() - 0.5)
  const sortedQueue = sortCustomerQueue(initialShuffle, {
    prioritizeImpatient: true,
    prioritizeMembers: true,
    prioritizeHighBudget: false,
    prioritizeSpecial: true
  })

  return {
    customers: sortedQueue,
    newMembers: newMemberProfiles
  }
}

export const calculateMatchScore = (customer: Customer, record: any, reputation: number = 50): number => {
  let score = 0

  if (customer.preference.favoriteGenres.includes(record.genre)) {
    score += 30 * customer.preference.preferenceStrength
  }

  if (record.marketPrice >= customer.preference.priceRange[0] &&
      record.marketPrice <= customer.preference.priceRange[1]) {
    score += 25
  } else if (record.marketPrice < customer.preference.priceRange[0]) {
    score += 10
  } else {
    score -= 20
  }

  if (customer.preference.preferredRarity.includes(record.rarity)) {
    score += 20 * customer.preference.preferenceStrength
  }

  const conditionBonus: Record<string, number> = {
    'Mint': 15,
    'Near Mint': 10,
    'Very Good': 5,
    'Good': 0
  }
  score += conditionBonus[record.condition] || 0

  const priceRatio = record.marketPrice / customer.budget
  if (priceRatio <= 0.5) {
    score += 10
  }

  if (customer.memberProfile) {
    const benefit = getMemberBenefit(customer.memberProfile.level)
    score += benefit.priorityBoost
    score += Math.min(10, customer.memberProfile.visitCount * 0.5)
  }

  score += getMatchScoreBonus(reputation)

  return Math.max(0, Math.min(100, score))
}

const bargainReactions = {
  aggressive: [
    '这个价格太贵了！',
    '你这是狮子大开口吧？',
    '再便宜点！不行我走了！',
    '这价格我能买两张了！'
  ],
  moderate: [
    '价格能不能再商量一下？',
    '有点超出我的预算了...',
    '给个优惠价呗？',
    '再少一点我就要了'
  ],
  friendly: [
    '老板，给个友情价嘛~',
    '第一次来，便宜点呗',
    '这个价格有点小贵呢',
    '能打个折就更好了'
  ],
  accept: [
    '行，这个价格我要了！',
    '成交！就这个价',
    '好吧，看你也不容易',
    '行吧，下次给我优惠点'
  ],
  reject: [
    '算了，太贵了',
    '这价格我接受不了',
    '我再去别家看看',
    '算了，不买了'
  ]
}

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const generateCustomerBargainOffer = (
  customer: Customer,
  askPrice: number,
  costPrice: number,
  marketPrice: number
): { offerPrice: number; reaction: string; minAcceptable: number } => {
  const aggressiveness = customer.bargainAggressiveness
  const toughness = customer.bargainToughness

  const priceFloor = Math.max(costPrice, Math.floor(marketPrice * (0.55 + aggressiveness * 0.15)))
  const targetDiscount = 0.1 + aggressiveness * 0.25
  const offerPrice = Math.max(priceFloor, Math.floor(askPrice * (1 - targetDiscount)))

  const minAcceptable = Math.max(
    costPrice,
    Math.floor(askPrice * (1 - targetDiscount * (0.4 + toughness * 0.5)))
  )

  let reactionCategory: 'aggressive' | 'moderate' | 'friendly'
  if (aggressiveness >= 0.65) {
    reactionCategory = 'aggressive'
  } else if (aggressiveness >= 0.4) {
    reactionCategory = 'moderate'
  } else {
    reactionCategory = 'friendly'
  }

  return {
    offerPrice,
    reaction: getRandomItem(bargainReactions[reactionCategory]),
    minAcceptable
  }
}

export const generateCustomerCounterOffer = (
  customer: Customer,
  lastOffer: number,
  sellerCounter: number,
  costPrice: number,
  marketPrice: number,
  round: number
): { offerPrice: number | null; reaction: string; accepted: boolean } => {
  const toughness = customer.bargainToughness
  const gap = sellerCounter - lastOffer
  const concessionRatio = 0.3 + (1 - toughness) * 0.4 - round * 0.08

  if (round >= 3) {
    if (sellerCounter <= lastOffer * 1.08) {
      return {
        offerPrice: sellerCounter,
        reaction: getRandomItem(bargainReactions.accept),
        accepted: true
      }
    } else {
      return {
        offerPrice: null,
        reaction: getRandomItem(bargainReactions.reject),
        accepted: false
      }
    }
  }

  const acceptableTop = Math.max(
    costPrice,
    Math.floor(marketPrice * (0.75 + (1 - toughness) * 0.2))
  )

  if (sellerCounter <= acceptableTop) {
    return {
      offerPrice: sellerCounter,
      reaction: getRandomItem(bargainReactions.accept),
      accepted: true
    }
  }

  const newOffer = Math.min(
    acceptableTop,
    Math.floor(lastOffer + gap * concessionRatio)
  )

  if (newOffer <= lastOffer) {
    return {
      offerPrice: null,
      reaction: getRandomItem(bargainReactions.reject),
      accepted: false
    }
  }

  let reactionCategory: 'aggressive' | 'moderate' | 'friendly'
  if (toughness >= 0.7) {
    reactionCategory = 'aggressive'
  } else if (toughness >= 0.45) {
    reactionCategory = 'moderate'
  } else {
    reactionCategory = 'friendly'
  }

  return {
    offerPrice: newOffer,
    reaction: getRandomItem(bargainReactions[reactionCategory]),
    accepted: false
  }
}

export const calculateBargainSatisfactionBonus = (
  wasBargained: boolean,
  bargainSuccess: boolean,
  agreedPrice: number,
  initialAsk: number,
  customer: Customer
): number => {
  if (!wasBargained) return 0

  const discountRatio = 1 - agreedPrice / initialAsk

  if (bargainSuccess) {
    const baseBonus = 5 + discountRatio * 30
    const toughnessBonus = (1 - customer.bargainToughness) * 10
    return Math.floor(baseBonus + toughnessBonus)
  } else {
    return -15
  }
}

export const calculateIdentitySatisfactionModifier = (
  customer: Customer,
  isGenreMatch: boolean,
  isRarityMatch: boolean,
  conditionScore: number
): number => {
  if (!customer.identityTag) return 0

  const config = getIdentityConfig(customer.identityTag)
  let modifier = 0

  if (isGenreMatch) {
    modifier += config.satisfactionOnMatch
  } else {
    modifier += config.satisfactionOnMismatch
  }

  if (isRarityMatch && customer.identityTag === 'collector') {
    modifier += 8
  }

  if (customer.identityTag === 'connoisseur' && conditionScore >= 85) {
    modifier += 10
  } else if (customer.identityTag === 'connoisseur' && conditionScore < 60) {
    modifier -= 10
  }

  if (customer.identityTag === 'newbie' && !isGenreMatch && !isRarityMatch) {
    modifier += 5
  }

  return modifier
}

export const getIdentityCollectionChanceBonus = (
  customer: Customer
): number => {
  if (!customer.identityTag) return 0

  const config = getIdentityConfig(customer.identityTag)
  return config.collectionChanceBonus
}

export const getIdentityTagInfo = (tag: CustomerIdentityTag | null): {
  name: string
  icon: string
  description: string
} => {
  if (!tag) {
    return {
      name: '普通顾客',
      icon: '👤',
      description: '一位普通的音乐爱好者'
    }
  }

  const config = getIdentityConfig(tag)
  return {
    name: config.name,
    icon: config.icon,
    description: config.description
  }
}

export { createMemberProfile }
