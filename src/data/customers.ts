import type { Customer, Genre, MemberProfile, TimeSlot } from '@/types'
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

const generatePreference = () => {
  const bundle = genreBundles[Math.floor(Math.random() * genreBundles.length)]
  const priceRanges: [number, number][] = [
    [100, 250],
    [200, 400],
    [300, 500],
    [400, 600]
  ]
  const priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)]
  const preferredRarity = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 2, 3],
    [3, 4, 5]
  ][Math.floor(Math.random() * 6)] as number[]

  return {
    favoriteGenres: bundle.genres,
    priceRange,
    preferredRarity,
    preferenceStrength: 0.4 + Math.random() * 0.6
  }
}

export const generateCustomer = (
  id: string,
  memberProfile: MemberProfile | null = null,
  reputation: number = 50,
  inventoryGenres: Genre[] = [],
  timeSlot: TimeSlot = 'afternoon'
): Customer => {
  let preference
  let name
  let avatar
  let budget
  let patience
  let memberDiscount = 0

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
    patience = 40 + Math.floor(Math.random() * 40) + updatedMember.visitCount
    memberDiscount = calculateMemberDiscount(updatedMember.level)

    const memberBargainBias = updatedMember.level === 'Diamond' || updatedMember.level === 'Platinum' ? -0.2 :
                              updatedMember.level === 'Gold' ? -0.1 : 0
    return {
      id,
      name,
      avatar,
      preference,
      budget,
      patience,
      satisfaction: 50 + Math.floor(updatedMember.visitCount * 2),
      memberProfile: updatedMember,
      isReturningCustomer: true,
      memberDiscount,
      bargainAggressiveness: Math.max(0.1, Math.min(0.8, 0.3 + Math.random() * 0.4 + memberBargainBias)),
      bargainToughness: Math.max(0.2, Math.min(0.9, 0.4 + Math.random() * 0.4 + memberBargainBias * 0.5)),
      willBargain: Math.random() < (0.35 + memberBargainBias + updatedMember.visitCount * 0.01)
    }
  } else {
    const nameIndex = Math.floor(Math.random() * customerNames.length)
    const avatarIndex = Math.floor(Math.random() * avatars.length)
    preference = generatePreference()
    name = customerNames[nameIndex]
    avatar = avatars[avatarIndex]
    const slotConfig = getTimeSlotConfig(timeSlot)
    preference.favoriteGenres = adjustGenrePreferences(preference.favoriteGenres, timeSlot)
    preference.priceRange = adjustPriceRange(preference.priceRange, timeSlot)
    const slotRarity = slotConfig.rarityPreferenceBonus
    if (slotRarity.length > 0 && Math.random() < 0.4) {
      preference.preferredRarity = slotRarity
    }
    const baseBudget = preference.priceRange[1] * (1.5 + Math.random())
    budget = getBudgetWithReputation(Math.floor(baseBudget), reputation)
    patience = 30 + Math.floor(Math.random() * 40)

    if (inventoryGenres.length > 0) {
      preference.favoriteGenres = alignPreferencesWithInventory(
        preference.favoriteGenres,
        inventoryGenres,
        reputation
      )
    }

    return {
      id,
      name,
      avatar,
      preference,
      budget,
      patience,
      satisfaction: 50,
      memberProfile: null,
      isReturningCustomer: false,
      memberDiscount: 0,
      bargainAggressiveness: 0.2 + Math.random() * 0.6,
      bargainToughness: 0.3 + Math.random() * 0.5,
      willBargain: Math.random() < 0.45
    }
  }
}

export const generateDailyCustomers = (
  count: number,
  day: number,
  existingMembers: MemberProfile[] = [],
  reputation: number = 50,
  inventoryGenres: Genre[] = [],
  timeSlot: TimeSlot = 'afternoon'
): { customers: Customer[]; newMembers: MemberProfile[] } => {
  const customers: Customer[] = []
  const newMemberProfiles: MemberProfile[] = []

  const returningMemberCount = Math.min(
    existingMembers.length,
    Math.floor(count * (0.1 + day * 0.05))
  )
  const shuffledMembers = [...existingMembers].sort(() => Math.random() - 0.5)
  const selectedReturningMembers = shuffledMembers.slice(0, returningMemberCount)

  for (let i = 0; i < selectedReturningMembers.length; i++) {
    const member = selectedReturningMembers[i]
    const customer = generateCustomer(`cust-${day}-return-${i}-${Date.now()}`, member, reputation, inventoryGenres, timeSlot)
    customer.budget = Math.floor(customer.budget * (1 + day * 0.05))
    customers.push(customer)
  }

  const newCustomerCount = count - selectedReturningMembers.length
  for (let i = 0; i < newCustomerCount; i++) {
    const customer = generateCustomer(`cust-${day}-new-${i}-${Date.now()}`, null, reputation, inventoryGenres, timeSlot)
    customer.budget = Math.floor(customer.budget * (1 + day * 0.05))
    customer.patience = Math.floor(customer.patience * (1 - day * 0.02))
    customers.push(customer)
  }

  return {
    customers: customers.sort(() => Math.random() - 0.5),
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

export { createMemberProfile }
