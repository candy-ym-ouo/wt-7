import type { MemberLevel, MemberBenefit, MemberProfile, Genre } from '@/types'

export const memberBenefits: MemberBenefit[] = [
  {
    level: 'Bronze',
    levelName: '青铜会员',
    minGrowthPoints: 0,
    discountRate: 0,
    bonusGrowthRate: 1,
    priorityBoost: 0,
    priceRangeExpand: 0,
    description: '新会员，享受基础服务'
  },
  {
    level: 'Silver',
    levelName: '白银会员',
    minGrowthPoints: 100,
    discountRate: 0.05,
    bonusGrowthRate: 1.2,
    priorityBoost: 5,
    priceRangeExpand: 0.1,
    description: '享受5%折扣，成长值加速20%'
  },
  {
    level: 'Gold',
    levelName: '黄金会员',
    minGrowthPoints: 300,
    discountRate: 0.1,
    bonusGrowthRate: 1.5,
    priorityBoost: 10,
    priceRangeExpand: 0.2,
    description: '享受10%折扣，成长值加速50%，优先推荐'
  },
  {
    level: 'Platinum',
    levelName: '铂金会员',
    minGrowthPoints: 700,
    discountRate: 0.15,
    bonusGrowthRate: 2,
    priorityBoost: 15,
    priceRangeExpand: 0.35,
    description: '享受15%折扣，成长值翻倍'
  },
  {
    level: 'Diamond',
    levelName: '钻石会员',
    minGrowthPoints: 1500,
    discountRate: 0.2,
    bonusGrowthRate: 3,
    priorityBoost: 25,
    priceRangeExpand: 0.5,
    description: '尊享20%折扣，成长值三倍，专属礼遇'
  }
]

export const getMemberBenefit = (level: MemberLevel): MemberBenefit => {
  return memberBenefits.find(b => b.level === level) || memberBenefits[0]
}

export const getLevelByGrowthPoints = (points: number): MemberLevel => {
  let level: MemberLevel = 'Bronze'
  for (const benefit of memberBenefits) {
    if (points >= benefit.minGrowthPoints) {
      level = benefit.level
    }
  }
  return level
}

export const getNextLevelInfo = (currentLevel: MemberLevel): MemberBenefit | null => {
  const currentIndex = memberBenefits.findIndex(b => b.level === currentLevel)
  if (currentIndex < memberBenefits.length - 1) {
    return memberBenefits[currentIndex + 1]
  }
  return null
}

export const calculateGrowthPoints = (
  salePrice: number,
  satisfaction: number,
  memberLevel: MemberLevel,
  isReturning: boolean
): number => {
  const basePoints = Math.floor(salePrice / 10)
  const satisfactionBonus = satisfaction >= 80 ? 15 : satisfaction >= 60 ? 5 : 0
  const returningBonus = isReturning ? 10 : 0
  const levelBonus = getMemberBenefit(memberLevel).bonusGrowthRate

  return Math.floor((basePoints + satisfactionBonus + returningBonus) * levelBonus)
}

export const calculateMemberDiscount = (level: MemberLevel): number => {
  return getMemberBenefit(level).discountRate
}

export const getLevelColor = (level: MemberLevel): string => {
  const colors: Record<MemberLevel, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
    Diamond: '#b9f2ff'
  }
  return colors[level]
}

export const getLevelIcon = (level: MemberLevel): string => {
  const icons: Record<MemberLevel, string> = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑'
  }
  return icons[level]
}

export const createMemberProfile = (
  customer: {
    id: string
    name: string
    avatar: string
    preference: {
      favoriteGenres: Genre[]
      priceRange: [number, number]
      preferredRarity: number[]
      preferenceStrength: number
    }
  },
  initialSpent: number = 0
): MemberProfile => {
  const initialPoints = initialSpent > 0 ? calculateGrowthPoints(initialSpent, 80, 'Bronze', false) : 0
  return {
    id: `member-${customer.id}`,
    name: customer.name,
    avatar: customer.avatar,
    level: getLevelByGrowthPoints(initialPoints),
    growthPoints: initialPoints,
    totalSpent: initialSpent,
    visitCount: 1,
    purchaseCount: initialSpent > 0 ? 1 : 0,
    lastVisitDate: Date.now(),
    joinDate: Date.now(),
    favoriteGenres: [...customer.preference.favoriteGenres],
    priceRange: [...customer.preference.priceRange] as [number, number],
    preferredRarity: [...customer.preference.preferredRarity],
    preferenceStrength: customer.preference.preferenceStrength,
    isReturning: false,
    notes: ''
  }
}

export const updateMemberAfterPurchase = (
  member: MemberProfile,
  salePrice: number,
  satisfaction: number
): MemberProfile => {
  const growthEarned = calculateGrowthPoints(salePrice, satisfaction, member.level, member.isReturning)
  const newTotalPoints = member.growthPoints + growthEarned
  const newLevel = getLevelByGrowthPoints(newTotalPoints)

  return {
    ...member,
    growthPoints: newTotalPoints,
    level: newLevel,
    totalSpent: member.totalSpent + salePrice,
    purchaseCount: member.purchaseCount + 1,
    lastVisitDate: Date.now(),
    isReturning: true
  }
}

export const updateMemberOnVisit = (member: MemberProfile): MemberProfile => {
  const benefit = getMemberBenefit(member.level)
  const expandedPriceRange: [number, number] = [
    Math.floor(member.priceRange[0] * (1 - benefit.priceRangeExpand)),
    Math.floor(member.priceRange[1] * (1 + benefit.priceRangeExpand))
  ]

  return {
    ...member,
    visitCount: member.visitCount + 1,
    isReturning: true,
    lastVisitDate: Date.now(),
    priceRange: expandedPriceRange,
    preferenceStrength: Math.min(1, member.preferenceStrength + 0.05)
  }
}

export const shouldCustomerBecomeMember = (
  customerSatisfaction: number,
  totalVisits: number
): boolean => {
  if (customerSatisfaction >= 90) return true
  if (customerSatisfaction >= 80 && totalVisits >= 1) return true
  if (customerSatisfaction >= 70 && totalVisits >= 2) return true
  return false
}

export const generateMemberNoteIdeas = (level: MemberLevel, genres: Genre[]): string => {
  const genreText = genres.length > 0 ? genres.join('、') : '音乐'
  const levelNote: Record<MemberLevel, string> = {
    Bronze: `热爱${genreText}的新朋友，欢迎加入！`,
    Silver: `对${genreText}有一定品味的常客`,
    Gold: `鉴赏${genreText}的资深爱好者`,
    Platinum: `痴迷${genreText}的收藏家级发烧友`,
    Diamond: `${genreText}领域的传奇品鉴大师`
  }
  return levelNote[level]
}

export { memberBenefits as default }
