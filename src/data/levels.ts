import type { LevelConfig, Genre } from '@/types'
import { getDifficultyScale } from './wordOfMouth'

export const defaultOverstockConfig = {
  slowThresholdDays: 2,
  overstockedThresholdDays: 4,
  deadstockThresholdDays: 6,
  slowDailyPenaltyRate: 0.02,
  overstockedDailyPenaltyRate: 0.05,
  deadstockDailyPenaltyRate: 0.1,
  slowSellThroughThreshold: 0.5,
  overstockedSellThroughThreshold: 0.2,
  maxDiscountRate: 0.5,
  discountStep: 0.1
}

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: '街角小店',
    description: '你刚刚开了一家小小的黑胶唱片店，从最基础的品类开始吧！',
    targetProfit: 800,
    targetSales: 5,
    targetSatisfaction: 60,
    maxCustomers: 8,
    unlockGenres: ['Jazz', 'Rock', 'Pop'],
    displaySlots: 4,
    initialBudget: 2000,
    days: 3,
    memberTargets: {
      targetNewMembers: 2,
      targetReturningVisits: 0,
      targetMemberSalesRatio: 0.2
    },
    challengeTargets: {
      genreSales: [
        { genre: 'Jazz', targetCount: 2 },
        { genre: 'Rock', targetCount: 2 }
      ],
      collection: {
        targetActivatedAlbums: 0,
        targetTotalCollectionValue: 500
      },
      avgSatisfaction: {
        minAvgSatisfaction: 65
      }
    },
    overstockConfig: {
      ...defaultOverstockConfig,
      slowThresholdDays: 3,
      overstockedThresholdDays: 5,
      deadstockThresholdDays: 7,
      slowDailyPenaltyRate: 0.01,
      overstockedDailyPenaltyRate: 0.03,
      deadstockDailyPenaltyRate: 0.06
    }
  },
  {
    id: 2,
    name: '渐入佳境',
    description: '你的小店开始有了一些回头客，试试扩展更多品类吧！',
    targetProfit: 2000,
    targetSales: 12,
    targetSatisfaction: 65,
    maxCustomers: 10,
    unlockGenres: ['Jazz', 'Rock', 'Pop', 'Soul', 'Funk'],
    displaySlots: 6,
    initialBudget: 3500,
    days: 4,
    memberTargets: {
      targetNewMembers: 5,
      targetReturningVisits: 3,
      targetMemberSalesRatio: 0.35
    },
    challengeTargets: {
      genreSales: [
        { genre: 'Jazz', targetCount: 3 },
        { genre: 'Soul', targetCount: 3 },
        { genre: 'Pop', targetCount: 3 }
      ],
      collection: {
        targetActivatedAlbums: 1,
        targetTotalCollectionValue: 1500
      },
      avgSatisfaction: {
        minAvgSatisfaction: 70
      }
    },
    overstockConfig: {
      ...defaultOverstockConfig,
      slowThresholdDays: 3,
      overstockedThresholdDays: 5,
      deadstockThresholdDays: 7,
      slowDailyPenaltyRate: 0.015,
      overstockedDailyPenaltyRate: 0.04,
      deadstockDailyPenaltyRate: 0.08
    }
  },
  {
    id: 3,
    name: '社区名店',
    description: '你已经是社区里小有名气的唱片店主了，顾客的要求也越来越高。',
    targetProfit: 4000,
    targetSales: 20,
    targetSatisfaction: 70,
    maxCustomers: 12,
    unlockGenres: ['Jazz', 'Rock', 'Pop', 'Soul', 'Funk', 'Disco', 'Blues'],
    displaySlots: 8,
    initialBudget: 5000,
    days: 5,
    memberTargets: {
      targetNewMembers: 8,
      targetReturningVisits: 8,
      targetMemberSalesRatio: 0.45
    },
    challengeTargets: {
      genreSales: [
        { genre: 'Rock', targetCount: 5 },
        { genre: 'Funk', targetCount: 4 },
        { genre: 'Blues', targetCount: 3 }
      ],
      collection: {
        targetActivatedAlbums: 2,
        targetTotalCollectionValue: 3500
      },
      avgSatisfaction: {
        minAvgSatisfaction: 75
      }
    },
    overstockConfig: {
      ...defaultOverstockConfig,
      slowDailyPenaltyRate: 0.02,
      overstockedDailyPenaltyRate: 0.05,
      deadstockDailyPenaltyRate: 0.1
    }
  },
  {
    id: 4,
    name: '城市地标',
    description: '你的唱片店已经成为城市的文化地标，收藏家们慕名而来。',
    targetProfit: 7000,
    targetSales: 30,
    targetSatisfaction: 75,
    maxCustomers: 15,
    unlockGenres: ['Jazz', 'Rock', 'Pop', 'Soul', 'Funk', 'Disco', 'Blues', 'Classical', 'Folk'],
    displaySlots: 10,
    initialBudget: 7500,
    days: 6,
    memberTargets: {
      targetNewMembers: 12,
      targetReturningVisits: 15,
      targetMemberSalesRatio: 0.55
    },
    challengeTargets: {
      genreSales: [
        { genre: 'Jazz', targetCount: 6 },
        { genre: 'Classical', targetCount: 4 },
        { genre: 'Disco', targetCount: 5 },
        { genre: 'Folk', targetCount: 3 }
      ],
      collection: {
        targetActivatedAlbums: 4,
        targetTotalCollectionValue: 7000
      },
      avgSatisfaction: {
        minAvgSatisfaction: 78
      }
    },
    overstockConfig: {
      ...defaultOverstockConfig,
      slowThresholdDays: 2,
      overstockedThresholdDays: 3,
      deadstockThresholdDays: 5,
      slowDailyPenaltyRate: 0.025,
      overstockedDailyPenaltyRate: 0.06,
      deadstockDailyPenaltyRate: 0.12
    }
  },
  {
    id: 5,
    name: '传奇老店',
    description: '恭喜！你的黑胶唱片店已经成为传奇，音乐爱好者的朝圣之地。',
    targetProfit: 12000,
    targetSales: 45,
    targetSatisfaction: 80,
    maxCustomers: 18,
    unlockGenres: ['Jazz', 'Rock', 'Soul', 'Funk', 'Disco', 'Classical', 'Blues', 'Pop', 'Electronic', 'Folk'],
    displaySlots: 12,
    initialBudget: 10000,
    days: 7,
    memberTargets: {
      targetNewMembers: 18,
      targetReturningVisits: 25,
      targetMemberSalesRatio: 0.65
    },
    challengeTargets: {
      genreSales: [
        { genre: 'Jazz', targetCount: 8 },
        { genre: 'Rock', targetCount: 8 },
        { genre: 'Electronic', targetCount: 5 },
        { genre: 'Classical', targetCount: 6 },
        { genre: 'Soul', targetCount: 5 }
      ],
      collection: {
        targetActivatedAlbums: 7,
        targetTotalCollectionValue: 15000
      },
      avgSatisfaction: {
        minAvgSatisfaction: 82
      }
    },
    overstockConfig: {
      ...defaultOverstockConfig,
      slowThresholdDays: 2,
      overstockedThresholdDays: 3,
      deadstockThresholdDays: 4,
      slowDailyPenaltyRate: 0.03,
      overstockedDailyPenaltyRate: 0.07,
      deadstockDailyPenaltyRate: 0.15
    }
  }
]

export const getLevelById = (id: number): LevelConfig | undefined => {
  return levels.find(l => l.id === id)
}

export const getNextLevel = (currentId: number): LevelConfig | undefined => {
  return levels.find(l => l.id === currentId + 1)
}

export const isLevelUnlocked = (levelId: number, completedLevels: number[]): boolean => {
  if (levelId === 1) return true
  return completedLevels.includes(levelId - 1)
}

export const getUnlockedGenres = (currentLevel: number): Genre[] => {
  const level = levels.find(l => l.id === currentLevel)
  return level?.unlockGenres || ['Jazz', 'Rock', 'Pop']
}

export const getScaledLevelConfig = (levelId: number, reputation: number): LevelConfig | undefined => {
  const base = getLevelById(levelId)
  if (!base) return undefined

  const scale = getDifficultyScale(reputation)

  return {
    ...base,
    targetProfit: Math.floor(base.targetProfit * scale),
    targetSales: Math.max(base.targetSales, Math.floor(base.targetSales * scale)),
    targetSatisfaction: Math.min(100, Math.floor(base.targetSatisfaction * scale)),
    challengeTargets: {
      ...base.challengeTargets,
      genreSales: base.challengeTargets.genreSales.map(t => ({
        ...t,
        targetCount: Math.max(1, Math.floor(t.targetCount * scale))
      })),
      collection: {
        ...base.challengeTargets.collection,
        targetTotalCollectionValue: Math.floor(base.challengeTargets.collection.targetTotalCollectionValue * scale)
      },
      avgSatisfaction: {
        minAvgSatisfaction: Math.min(100, Math.floor(base.challengeTargets.avgSatisfaction.minAvgSatisfaction * (0.9 + scale * 0.1)))
      }
    }
  }
}
