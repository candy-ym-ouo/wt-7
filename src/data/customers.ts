import type { Customer, Genre } from '@/types'

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
  { genres: ['Soul', 'R&B' as Genre, 'Pop'], name: '灵魂流行派' },
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

export const generateCustomer = (id: string): Customer => {
  const nameIndex = Math.floor(Math.random() * customerNames.length)
  const avatarIndex = Math.floor(Math.random() * avatars.length)
  const preference = generatePreference()
  const baseBudget = preference.priceRange[1] * (1.5 + Math.random())
  const patience = 30 + Math.floor(Math.random() * 40)

  return {
    id,
    name: customerNames[nameIndex],
    avatar: avatars[avatarIndex],
    preference,
    budget: Math.floor(baseBudget),
    patience,
    satisfaction: 50
  }
}

export const generateDailyCustomers = (count: number, day: number): Customer[] => {
  const customers: Customer[] = []
  for (let i = 0; i < count; i++) {
    const customer = generateCustomer(`cust-${day}-${i}-${Date.now()}`)
    customer.budget = Math.floor(customer.budget * (1 + day * 0.05))
    customer.patience = Math.floor(customer.patience * (1 - day * 0.02))
    customers.push(customer)
  }
  return customers
}

export const calculateMatchScore = (customer: Customer, record: any): number => {
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

  return Math.max(0, Math.min(100, score))
}
