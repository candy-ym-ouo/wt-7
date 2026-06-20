import type {
  Genre, PresaleItem, PresaleItemConfig, PresaleOrder,
  PresaleOrderStatus, PresaleSyncLog, PresaleEventPage, PresaleSettlement,
  PresaleStats, MemberProfile
} from '@/types'
import { allRecords } from '@/data/records'

export const presaleEventTemplates: { theme: PresaleEventPage['theme']; title: string; subtitle: string; bannerIcon: string; themeColor: string; bonusTagline: string }[] = [
  { theme: 'new_release', title: '新碟首发', subtitle: '抢先预订，新品到家', bannerIcon: '🆕', themeColor: '#667eea', bonusTagline: '预售专享价，发货最快' },
  { theme: 'limited', title: '限量发售', subtitle: '稀有珍品，错过不再', bannerIcon: '💎', themeColor: '#e94560', bonusTagline: '限量库存，先到先得' },
  { theme: 'seasonal', title: '季节特惠', subtitle: '应季精选，限时优惠', bannerIcon: '🌸', themeColor: '#38b2ac', bonusTagline: '当季推荐，折扣力度大' },
  { theme: 'exclusive', title: '独家预售', subtitle: '仅此一家，独家版本', bannerIcon: '👑', themeColor: '#f6e05e', bonusTagline: '独家渠道，会员优先' },
  { theme: 'anniversary', title: '周年庆典', subtitle: '周年回馈，感恩有你', bannerIcon: '🎉', themeColor: '#ed8936', bonusTagline: '庆典特惠，额外积分' }
]

export const generatePresaleItems = (
  currentDay: number,
  _currentLevel: number,
  unlockedGenres: Genre[],
  existingPresaleItemIds: string[],
  count: number = 4
): PresaleItem[] => {
  const candidates = allRecords.filter(r =>
    unlockedGenres.includes(r.genre) &&
    !existingPresaleItemIds.includes(r.id) &&
    r.rarity >= 3
  )

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  return selected.map((record, index) => {
    const isLimited = record.rarity >= 4 || Math.random() < 0.3
    const isExclusive = record.rarity === 5 && Math.random() < 0.4
    const earlyBirdDiscount = isLimited ? 0.15 : (isExclusive ? 0.2 : 0.1)
    const presalePrice = Math.round(record.marketPrice * (1 - earlyBirdDiscount * 0.5))
    const totalStock = isLimited ? Math.floor(3 + Math.random() * 5) : Math.floor(8 + Math.random() * 12)

    const config: PresaleItemConfig = {
      recordId: record.id,
      presalePrice,
      retailPrice: record.marketPrice,
      earlyBirdDiscount,
      depositRate: isExclusive ? 0.3 : 0.2,
      totalStock,
      reservedStock: 0,
      maxPerCustomer: isLimited ? 1 : 2,
      startDate: currentDay,
      endDate: currentDay + 2 + Math.floor(Math.random() * 2),
      expectedShipDate: currentDay + 3 + Math.floor(Math.random() * 3),
      bonusDescription: isExclusive
        ? '独家版本含特别彩胶和限定编号证书'
        : isLimited
          ? '限量编号版，附赠收藏卡'
          : '预售专享价，首批发货',
      isLimited,
      isExclusive
    }

    const item: PresaleItem = {
      id: `presale-${currentDay}-${index}-${Date.now()}`,
      record,
      config,
      status: 'preselling',
      soldCount: 0,
      lockedCount: 0,
      availableStock: totalStock,
      dailySyncLog: [{
        day: currentDay,
        syncType: 'status_change',
        before: 'none',
        after: 'preselling',
        detail: `预售上架，库存 ${totalStock} 张，预售价 ¥${presalePrice}`
      }],
      createdAt: Date.now()
    }

    return item
  })
}

export const generateEventPages = (
  currentDay: number,
  _currentLevel: number,
  presaleItems: PresaleItem[]
): PresaleEventPage[] => {
  if (presaleItems.length === 0) return []

  const pages: PresaleEventPage[] = []
  const availableThemes = [...presaleEventTemplates]

  const itemGroups: PresaleItem[][] = []
  const remaining = [...presaleItems]

  for (let i = 0; i < Math.min(2, Math.ceil(presaleItems.length / 2)); i++) {
    const group = remaining.splice(0, Math.ceil(remaining.length / (2 - i)))
    if (group.length > 0) itemGroups.push(group)
  }

  itemGroups.forEach((group, idx) => {
    const template = availableThemes[idx % availableThemes.length]
    const page: PresaleEventPage = {
      id: `event-${currentDay}-${idx}`,
      title: template.title,
      subtitle: template.subtitle,
      bannerIcon: template.bannerIcon,
      theme: template.theme,
      themeColor: template.themeColor,
      description: getThemeDescription(template.theme, group),
      startDate: currentDay,
      endDate: currentDay + 3,
      itemIds: group.map(item => item.id),
      isActive: true,
      bonusTagline: template.bonusTagline
    }
    pages.push(page)
  })

  return pages
}

const getThemeDescription = (theme: PresaleEventPage['theme'], items: PresaleItem[]): string => {
  const genres = [...new Set(items.map(i => i.record.genre))]
  const genreStr = genres.join('、')
  switch (theme) {
    case 'new_release': return `${genreStr}新作即将面世！现在预订享受首发优惠，首批到货优先发出。`
    case 'limited': return `限量珍品仅此一批！${genreStr}精品限量编号版，售完即止。`
    case 'seasonal': return `应季精选推荐，${genreStr}风格正好配此刻心情，限时折扣别错过。`
    case 'exclusive': return `独家渠道专享！${genreStr}特别版本仅在本店可订，会员优先购买。`
    case 'anniversary': return `庆典回馈季！精选${genreStr}佳作预售，下单即享额外积分奖励。`
  }
}

export const syncPresaleInventory = (
  item: PresaleItem,
  currentDay: number
): PresaleItem => {
  const updated = { ...item }
  const logs: PresaleSyncLog[] = [...item.dailySyncLog]

  const orderedCount = item.soldCount + item.lockedCount
  updated.availableStock = Math.max(0, item.config.totalStock - orderedCount)

  if (currentDay >= item.config.expectedShipDate && item.status === 'locked') {
    logs.push({
      day: currentDay,
      syncType: 'status_change',
      before: item.status,
      after: 'shipped',
      detail: `预售商品已发货，共 ${item.lockedCount} 张`
    })
    updated.status = 'shipped'
  }

  if (currentDay >= item.config.expectedShipDate + 1 && item.status === 'shipped') {
    logs.push({
      day: currentDay,
      syncType: 'status_change',
      before: item.status,
      after: 'delivered',
      detail: `预售商品已到货，可交付顾客`
    })
    updated.status = 'delivered'
  }

  if (currentDay > item.config.endDate && item.status === 'preselling' && item.soldCount === 0) {
    logs.push({
      day: currentDay,
      syncType: 'status_change',
      before: item.status,
      after: 'cancelled',
      detail: `预售期结束无人购买，已取消`
    })
    updated.status = 'cancelled'
  }

  updated.dailySyncLog = logs
  return updated
}

export const lockPresaleOrders = (
  item: PresaleItem,
  orders: PresaleOrder[],
  currentDay: number
): { updatedItem: PresaleItem; updatedOrders: PresaleOrder[] } => {
  const pendingOrders = orders.filter(o =>
    o.presaleItemId === item.id && (o.status === 'paid' || o.status === 'confirmed')
  )

  if (pendingOrders.length === 0 || item.status !== 'preselling') {
    return { updatedItem: item, updatedOrders: orders }
  }

  const updatedItem: PresaleItem = {
    ...item,
    status: 'locked',
    lockedCount: pendingOrders.reduce((sum, o) => sum + o.quantity, 0),
    dailySyncLog: [
      ...item.dailySyncLog,
      {
        day: currentDay,
        syncType: 'stock_update',
        before: `available: ${item.availableStock}`,
        after: `locked: ${pendingOrders.reduce((sum, o) => sum + o.quantity, 0)}`,
        detail: `预售锁定，${pendingOrders.length} 笔订单已确认`
      }
    ]
  }

  const updatedOrders = orders.map(o => {
    if (o.presaleItemId === item.id && (o.status === 'paid' || o.status === 'confirmed')) {
      return { ...o, status: 'locked' as PresaleOrderStatus, lockDate: currentDay }
    }
    return o
  })

  return { updatedItem, updatedOrders }
}

export const generatePresaleRecommendation = (
  customerPreference: { favoriteGenres: Genre[]; preferredRarity: number[]; priceRange: [number, number] },
  presaleItems: PresaleItem[],
  shopReputation: number
): { item: PresaleItem; score: number; reason: string }[] => {
  const results: { item: PresaleItem; score: number; reason: string }[] = []

  for (const item of presaleItems) {
    if (item.status !== 'preselling') continue
    if (item.availableStock <= 0) continue

    const record = item.record
    let score = 0
    const reasons: string[] = []

    const genreMatch = customerPreference.favoriteGenres.includes(record.genre)
    if (genreMatch) {
      score += 40
      reasons.push(`偏好风格匹配: ${record.genre}`)
    }

    const rarityMatch = customerPreference.preferredRarity.some(r => Math.abs(r - record.rarity) <= 1)
    if (rarityMatch) {
      score += 20
      reasons.push(`稀有度偏好匹配: ${record.rarity}星`)
    }

    const priceInRange = record.marketPrice >= customerPreference.priceRange[0] * 0.7 &&
      record.marketPrice <= customerPreference.priceRange[1] * 1.3
    if (priceInRange) {
      score += 15
      reasons.push('价格范围合适')
    }

    const discount = item.config.earlyBirdDiscount
    if (discount >= 0.15) {
      score += 10
      reasons.push(`早鸟折扣 ${Math.round(discount * 100)}%`)
    }

    if (item.config.isLimited) {
      score += 10
      reasons.push('限量版，稀缺性好')
    }

    if (item.config.isExclusive) {
      score += 8
      reasons.push('独家版本，收藏价值高')
    }

    score += Math.round(shopReputation / 20)

    if (score >= 30) {
      results.push({ item, score: Math.min(100, score), reason: reasons.slice(0, 2).join('；') })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

export const createPresaleOrder = (
  item: PresaleItem,
  customerId: string,
  customerName: string,
  customerAvatar: string,
  memberProfile: MemberProfile | null,
  quantity: number,
  currentDay: number,
  matchScore: number,
  recommendedReason: string
): { order: PresaleOrder; updatedItem: PresaleItem } | null => {
  if (item.status !== 'preselling') return null
  if (item.availableStock < quantity) return null
  if (quantity > item.config.maxPerCustomer) return null

  const isEarlyBird = item.soldCount < Math.ceil(item.config.totalStock * 0.3)
  const discountRate = isEarlyBird ? item.config.earlyBirdDiscount : 0
  const unitPrice = Math.round(item.config.presalePrice * (1 - discountRate))
  const totalPrice = unitPrice * quantity
  const depositAmount = Math.round(totalPrice * item.config.depositRate)
  const remainingAmount = totalPrice - depositAmount

  const order: PresaleOrder = {
    id: `porder-${currentDay}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerId,
    customerName,
    customerAvatar,
    memberProfile,
    memberLevel: memberProfile?.level || null,
    presaleItemId: item.id,
    recordId: item.record.id,
    recordTitle: item.record.title,
    quantity,
    unitPrice,
    totalPrice,
    depositAmount,
    remainingAmount,
    status: 'pending',
    isEarlyBird,
    discountRate,
    preferenceMatchScore: matchScore,
    recommendedReason,
    orderDate: currentDay,
    confirmDate: null,
    payDate: null,
    lockDate: null,
    shipDate: null,
    deliverDate: null,
    cancelDate: null,
    refundDate: null,
    note: '',
    satisfactionBonus: isEarlyBird ? 15 : (item.config.isLimited ? 10 : 5)
  }

  const updatedItem: PresaleItem = {
    ...item,
    soldCount: item.soldCount + quantity,
    availableStock: Math.max(0, item.availableStock - quantity),
    dailySyncLog: [
      ...item.dailySyncLog,
      {
        day: currentDay,
        syncType: 'stock_update',
        before: `sold: ${item.soldCount}, available: ${item.availableStock}`,
        after: `sold: ${item.soldCount + quantity}, available: ${Math.max(0, item.availableStock - quantity)}`,
        detail: `${customerName} 预订了 ${quantity} 张`
      }
    ]
  }

  return { order, updatedItem }
}

export const confirmPresaleOrder = (
  order: PresaleOrder,
  currentDay: number
): PresaleOrder => {
  return {
    ...order,
    status: 'confirmed',
    confirmDate: currentDay,
    note: order.isEarlyBird ? '早鸟价已确认' : '订单已确认'
  }
}

export const payPresaleOrder = (
  order: PresaleOrder,
  currentDay: number
): PresaleOrder => {
  return {
    ...order,
    status: 'paid',
    payDate: currentDay,
    note: `已支付定金 ¥${order.depositAmount}，尾款 ¥${order.remainingAmount} 发货后支付`
  }
}

export const deliverPresaleOrder = (
  order: PresaleOrder,
  currentDay: number
): { updatedOrder: PresaleOrder; settlement: PresaleSettlement } | null => {
  if (order.status !== 'locked' && order.status !== 'shipped') return null

  const platformFee = Math.round(order.totalPrice * 0.03)
  const netRevenue = order.totalPrice - platformFee

  const updatedOrder: PresaleOrder = {
    ...order,
    status: 'delivered',
    deliverDate: currentDay,
    note: '已交付完成'
  }

  const satisfaction = Math.min(100, 60 + order.preferenceMatchScore * 0.3 + order.satisfactionBonus)
  const reputationImpact = Math.round(satisfaction / 20)

  const settlement: PresaleSettlement = {
    id: `psettle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId: order.id,
    recordId: order.recordId,
    recordTitle: order.recordTitle,
    customerName: order.customerName,
    finalPrice: order.totalPrice,
    depositUsed: order.depositAmount,
    remainingPaid: order.remainingAmount,
    platformFee,
    netRevenue,
    settledDay: currentDay,
    satisfaction: Math.round(satisfaction),
    reputationImpact
  }

  return { updatedOrder, settlement }
}

export const cancelPresaleOrder = (
  order: PresaleOrder,
  currentDay: number
): PresaleOrder => {
  return {
    ...order,
    status: 'cancelled',
    cancelDate: currentDay,
    note: '订单已取消，定金将退还'
  }
}

export const calculatePresaleStats = (
  orders: PresaleOrder[],
  settlements: PresaleSettlement[],
  presaleItems: PresaleItem[]
): PresaleStats => {
  const totalOrders = orders.length
  const totalRevenue = settlements.reduce((sum, s) => sum + s.netRevenue, 0)
  const totalDeposits = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.depositAmount, 0)
  const totalSettled = settlements.length
  const avgMatchScore = totalOrders > 0
    ? Math.round(orders.reduce((sum, o) => sum + o.preferenceMatchScore, 0) / totalOrders)
    : 0
  const earlyBirdCount = orders.filter(o => o.isEarlyBird).length
  const memberOrderCount = orders.filter(o => o.memberProfile !== null).length
  const cancellationCount = orders.filter(o => o.status === 'cancelled').length

  const genreCountMap = new Map<Genre, number>()
  for (const item of presaleItems) {
    if (item.soldCount > 0) {
      genreCountMap.set(item.record.genre, (genreCountMap.get(item.record.genre) || 0) + item.soldCount)
    }
  }
  const topGenreEntry = [...genreCountMap.entries()].sort((a, b) => b[1] - a[1])[0]

  const presaleToFulfill = orders.filter(o =>
    o.status === 'confirmed' || o.status === 'paid' || o.status === 'locked'
  ).length

  return {
    totalOrders,
    totalRevenue,
    totalDeposits,
    totalSettled,
    avgMatchScore,
    earlyBirdCount,
    memberOrderCount,
    cancellationCount,
    topGenre: topGenreEntry ? topGenreEntry[0] : null,
    presaleToFulfill,
    eventPageViews: 0
  }
}

export const createInitialPresaleStats = (): PresaleStats => ({
  totalOrders: 0,
  totalRevenue: 0,
  totalDeposits: 0,
  totalSettled: 0,
  avgMatchScore: 0,
  earlyBirdCount: 0,
  memberOrderCount: 0,
  cancellationCount: 0,
  topGenre: null,
  presaleToFulfill: 0,
  eventPageViews: 0
})

export const getPresaleStatusLabel = (status: PresaleOrderStatus): { label: string; color: string; icon: string } => {
  const map: { [K in PresaleOrderStatus]: { label: string; color: string; icon: string } } = {
    pending: { label: '待确认', color: '#a0aec0', icon: '⏳' },
    confirmed: { label: '已确认', color: '#4299e1', icon: '✅' },
    paid: { label: '已付定金', color: '#48bb78', icon: '💰' },
    locked: { label: '已锁定', color: '#667eea', icon: '🔒' },
    shipped: { label: '已发货', color: '#ed8936', icon: '🚚' },
    delivered: { label: '已交付', color: '#38b2ac', icon: '📦' },
    cancelled: { label: '已取消', color: '#f56565', icon: '❌' },
    refunded: { label: '已退款', color: '#a0aec0', icon: '💸' }
  }
  return map[status]
}

export const getItemStatusInfo = (status: PresaleItem['status']): { label: string; color: string; icon: string } => {
  const map: { [key: string]: { label: string; color: string; icon: string } } = {
    upcoming: { label: '即将开售', color: '#667eea', icon: '🔜' },
    preselling: { label: '预售中', color: '#48bb78', icon: '🔥' },
    locked: { label: '已锁定', color: '#4299e1', icon: '🔒' },
    shipped: { label: '已发货', color: '#ed8936', icon: '🚚' },
    delivered: { label: '已到货', color: '#38b2ac', icon: '📦' },
    cancelled: { label: '已取消', color: '#f56565', icon: '❌' }
  }
  return map[status] || { label: status, color: '#a0aec0', icon: '❓' }
}

export const getThemeLabel = (theme: PresaleEventPage['theme']): string => {
  const map: { [K in PresaleEventPage['theme']]: string } = {
    new_release: '新碟首发',
    limited: '限量发售',
    seasonal: '季节特惠',
    exclusive: '独家预售',
    anniversary: '周年庆典'
  }
  return map[theme]
}

export const getThemeIcon = (theme: PresaleEventPage['theme']): string => {
  const map: { [K in PresaleEventPage['theme']]: string } = {
    new_release: '🆕',
    limited: '💎',
    seasonal: '🌸',
    exclusive: '👑',
    anniversary: '🎉'
  }
  return map[theme]
}

export const refreshPresaleData = (
  currentDay: number,
  currentLevel: number,
  unlockedGenres: Genre[],
  existingItems: PresaleItem[],
  existingOrders: PresaleOrder[],
  nextRefresh: number
): { items: PresaleItem[]; orders: PresaleOrder[]; eventPages: PresaleEventPage[]; nextRefreshDay: number } => {
  const syncedItems = existingItems.map(item => syncPresaleInventory(item, currentDay))

  const lockResults = syncedItems.map(item =>
    lockPresaleOrders(item, existingOrders, currentDay)
  )

  let finalItems: PresaleItem[] = []
  let finalOrders = [...existingOrders]

  for (const result of lockResults) {
    finalItems.push(result.updatedItem)
    finalOrders = result.updatedOrders
  }

  finalItems = finalItems.filter(item => item.status !== 'cancelled')

  let newEventPages: PresaleEventPage[] = []

  if (currentDay >= nextRefresh) {
    const existingIds = finalItems.map(i => i.id)
    const newItems = generatePresaleItems(currentDay, currentLevel, unlockedGenres, existingIds)
    finalItems = [...finalItems, ...newItems]
    newEventPages = generateEventPages(currentDay, currentLevel, newItems)
  }

  return {
    items: finalItems,
    orders: finalOrders,
    eventPages: newEventPages,
    nextRefreshDay: currentDay >= nextRefresh ? currentDay + 3 : nextRefresh
  }
}
