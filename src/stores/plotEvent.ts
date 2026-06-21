import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PlotEventGameState,
  PlotEventConfig,
  PlotEventNode,
  PlotEventChoiceEffect,
  PlotEventProgress,
  PlotEventTriggerResult,
  PlotEventChoiceResult,
  PlotEndingType,
  CustomerRelationship,
  RelationshipLevel,
  SpecialOrderProgress,
  SpecialOrderAcceptResult,
  SpecialOrderRequirement,
  LevelEndingConfig
} from '@/types'
import {
  allPlotEvents,
  getEventById,
  getNodeById,
  initialRelationships,
  getRelationshipLevelInfo,
  getNextLevelTrust,
  getLevelEndings,
  getSpecialOrderById
} from '@/data/plotEvents'

export const usePlotEventStore = defineStore('plotEvent', () => {
  const state = ref<PlotEventGameState>({
    activeEvent: null,
    activeProgress: null,
    activeNode: null,
    eventProgresses: [],
    relationships: JSON.parse(JSON.stringify(initialRelationships)),
    specialOrders: [],
    levelEndings: [],
    flags: {},
    totalEventsCompleted: 0,
    totalSpecialOrdersFulfilled: 0,
    perfectEndingsAchieved: 0,
    dailyEventPool: [],
    pendingEvents: [],
    notifications: []
  })

  const hasActiveEvent = computed(() => state.value.activeEvent !== null)
  const currentNode = computed(() => state.value.activeNode)
  const currentChoices = computed(() => state.value.activeNode?.choices || [])
  const unreadNotifications = computed(() => state.value.notifications.filter(n => !n.read))

  const relationshipsByLevel = computed(() => {
    const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'confidant', 'soulmate']
    const result: { level: RelationshipLevel; items: CustomerRelationship[] }[] = []
    levels.forEach(level => {
      result.push({
        level,
        items: state.value.relationships.filter(r => r.level === level)
      })
    })
    return result
  })

  const completedEvents = computed(() => 
    state.value.eventProgresses.filter(p => p.status === 'completed')
  )
  const inProgressEvents = computed(() => 
    state.value.eventProgresses.filter(p => p.status === 'in_progress')
  )
  const availableEvents = computed(() => 
    state.value.eventProgresses.filter(p => p.status === 'available')
  )

  const activeSpecialOrders = computed(() => 
    state.value.specialOrders.filter(o => o.isActive && !o.isCompleted && !o.isFailed)
  )

  const getProgressForEvent = (eventId: string): PlotEventProgress | undefined => {
    return state.value.eventProgresses.find(p => p.eventId === eventId)
  }

  const getRelationshipForCustomer = (customerId: string): CustomerRelationship | undefined => {
    return state.value.relationships.find(r => r.customerId === customerId)
  }

  const getFlag = (flagId: string): boolean | number | string | undefined => {
    return state.value.flags[flagId]
  }

  const setFlag = (flagId: string, value: boolean | number | string) => {
    state.value.flags[flagId] = value
  }

  const checkEventCondition = (
    event: PlotEventConfig,
    context: {
      currentLevel: number
      currentDay: number
      reputation: number
      budget: number
      completedEventIds: string[]
      collectionCount: number
      memberCount: number
    }
  ): boolean => {
    const cond = event.triggerCondition
    const progress = getProgressForEvent(event.id)

    if (progress && progress.status === 'completed' && !event.isRepeatable) {
      return false
    }

    if (progress && event.cooldownDays > 0 && progress.lastTriggeredDay !== null) {
      if (context.currentDay - progress.lastTriggeredDay < event.cooldownDays) {
        return false
      }
    }

    if (cond.minLevel && context.currentLevel < cond.minLevel) return false
    if (cond.maxLevel && context.currentLevel > cond.maxLevel) return false
    if (cond.minDay && context.currentDay < cond.minDay) return false
    if (cond.minReputation && context.reputation < cond.minReputation) return false
    if (cond.minBudget && context.budget < cond.minBudget) return false
    if (cond.requiredMemberCount && context.memberCount < cond.requiredMemberCount) return false
    if (cond.requiredCollectionCount && context.collectionCount < cond.requiredCollectionCount) return false

    if (cond.requiredCompletedEventIds) {
      for (const requiredId of cond.requiredCompletedEventIds) {
        if (!context.completedEventIds.includes(requiredId)) return false
      }
    }

    if (cond.requiredFlags) {
      for (const flagId of cond.requiredFlags) {
        if (!state.value.flags[flagId]) return false
      }
    }

    if (cond.requiredRelationshipLevel) {
      const rel = getRelationshipForCustomer(cond.requiredRelationshipLevel.customerId)
      if (!rel) return false
      const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'confidant', 'soulmate']
      const currentIdx = levels.indexOf(rel.level)
      const requiredIdx = levels.indexOf(cond.requiredRelationshipLevel.level)
      if (currentIdx < requiredIdx) return false
    }

    return true
  }

  const rollDailyEventPool = (context: {
    currentLevel: number
    currentDay: number
    reputation: number
    budget: number
    completedEventIds: string[]
    collectionCount: number
    memberCount: number
  }): PlotEventConfig[] => {
    const eligibleEvents = allPlotEvents.filter(event => 
      checkEventCondition(event, context)
    )

    const weightedPool: PlotEventConfig[] = []
    eligibleEvents.forEach(event => {
      const weight = event.triggerCondition.probabilityWeight || 50
      for (let i = 0; i < weight; i++) {
        weightedPool.push(event)
      }
    })

    const selectedIds = new Set<string>()
    const results: PlotEventConfig[] = []
    const maxEvents = Math.min(3, weightedPool.length)

    while (results.length < maxEvents && weightedPool.length > 0) {
      const idx = Math.floor(Math.random() * weightedPool.length)
      const selected = weightedPool[idx]
      if (!selectedIds.has(selected.id)) {
        selectedIds.add(selected.id)
        results.push(selected)
      }
      weightedPool.splice(idx, 1)
    }

    state.value.dailyEventPool = results
    return results
  }

  const triggerEvent = (eventId: string, currentDay: number): PlotEventTriggerResult => {
    const event = getEventById(eventId)
    if (!event) {
      return { triggered: false, reason: '事件不存在' }
    }

    if (state.value.activeEvent) {
      return { triggered: false, reason: '已有进行中的事件' }
    }

    let progress = getProgressForEvent(eventId)
    if (!progress) {
      progress = {
        eventId,
        status: 'available',
        currentNodeId: null,
        startedDay: null,
        completedDay: null,
        chosenChoiceIds: [],
        visitedNodeIds: [],
        satisfactionScore: 0,
        earnedRewards: {
          budget: 0,
          reputation: 0,
          growthPoints: 0,
          records: [],
          customers: []
        },
        lastTriggeredDay: null,
        triggerCount: 0
      }
      state.value.eventProgresses.push(progress)
    }

    progress.status = 'in_progress'
    progress.startedDay = currentDay
    progress.lastTriggeredDay = currentDay
    progress.triggerCount++
    progress.currentNodeId = event.startNodeId
    progress.visitedNodeIds = [event.startNodeId]

    state.value.activeEvent = event
    state.value.activeProgress = progress
    state.value.activeNode = getNodeById(event, event.startNodeId) || null

    addNotification({
      eventId: event.id,
      eventTitle: event.title,
      eventIcon: event.icon,
      message: `新剧情解锁：${event.title}`,
      type: 'available'
    })

    return { triggered: true, event }
  }

  const makeChoice = (choiceId: string): PlotEventChoiceResult => {
    if (!state.value.activeEvent || !state.value.activeProgress || !state.value.activeNode) {
      return { success: false, message: '没有进行中的事件' }
    }

    const choice = state.value.activeNode.choices?.find(c => c.id === choiceId)
    if (!choice) {
      return { success: false, message: '选项不存在' }
    }

    state.value.activeProgress.chosenChoiceIds.push(choiceId)

    const appliedEffects = applyChoiceEffects(choice.effects)

    let eventCompleted = false
    let endingType: PlotEndingType | undefined
    let nextNode: PlotEventNode | null = null

    if (choice.nextNodeId) {
      nextNode = getNodeById(state.value.activeEvent, choice.nextNodeId) || null
      if (nextNode) {
        state.value.activeProgress.currentNodeId = nextNode.id
        if (!state.value.activeProgress.visitedNodeIds.includes(nextNode.id)) {
          state.value.activeProgress.visitedNodeIds.push(nextNode.id)
        }
        state.value.activeNode = nextNode

        if (nextNode.isEnding) {
          eventCompleted = true
          endingType = nextNode.endingType
          applyEndingReward(nextNode)
          finalizeEvent()
        }
      }
    } else {
      eventCompleted = true
      finalizeEvent()
    }

    return {
      success: true,
      nextNode,
      effects: appliedEffects,
      eventCompleted,
      endingAchieved: endingType,
      message: choice.description
    }
  }

  const applyChoiceEffects = (effects: PlotEventChoiceEffect[]): PlotEventChoiceEffect[] => {
    const applied: PlotEventChoiceEffect[] = []

    effects.forEach(effect => {
      switch (effect.type) {
        case 'budget':
          if (state.value.activeProgress) {
            state.value.activeProgress.earnedRewards.budget += effect.value
          }
          applied.push(effect)
          break
        case 'reputation':
          if (state.value.activeProgress) {
            state.value.activeProgress.earnedRewards.reputation += effect.value
          }
          applied.push(effect)
          break
        case 'growth_points':
          if (state.value.activeProgress) {
            state.value.activeProgress.earnedRewards.growthPoints += effect.value
          }
          applied.push(effect)
          break
        case 'special_flag':
          if (effect.targetId) {
            setFlag(effect.targetId, effect.value)
          }
          applied.push(effect)
          break
        case 'relationship':
          if (effect.targetId) {
            addRelationshipTrust(effect.targetId, effect.value)
          }
          applied.push(effect)
          break
        case 'unlock_customer':
          if (effect.targetId && state.value.activeProgress) {
            if (!state.value.activeProgress.earnedRewards.customers.includes(effect.targetId)) {
              state.value.activeProgress.earnedRewards.customers.push(effect.targetId)
            }
          }
          applied.push(effect)
          break
        case 'unlock_record':
          if (effect.targetId && state.value.activeProgress) {
            if (!state.value.activeProgress.earnedRewards.records.includes(effect.targetId)) {
              state.value.activeProgress.earnedRewards.records.push(effect.targetId)
            }
          }
          applied.push(effect)
          break
        case 'satisfaction':
          if (state.value.activeProgress) {
            state.value.activeProgress.satisfactionScore += effect.value
          }
          applied.push(effect)
          break
        default:
          applied.push(effect)
      }
    })

    return applied
  }

  const applyEndingReward = (node: PlotEventNode) => {
    if (!node.unlockReward || !state.value.activeProgress) return

    const reward = node.unlockReward
    if (reward.budget) {
      state.value.activeProgress.earnedRewards.budget += reward.budget
    }
    if (reward.reputation) {
      state.value.activeProgress.earnedRewards.reputation += reward.reputation
    }
    if (reward.growthPoints) {
      state.value.activeProgress.earnedRewards.growthPoints += reward.growthPoints
    }
    if (reward.recordId) {
      if (!state.value.activeProgress.earnedRewards.records.includes(reward.recordId)) {
        state.value.activeProgress.earnedRewards.records.push(reward.recordId)
      }
    }
    if (reward.customerId) {
      if (!state.value.activeProgress.earnedRewards.customers.includes(reward.customerId)) {
        state.value.activeProgress.earnedRewards.customers.push(reward.customerId)
      }
    }

    if (node.endingType === 'perfect') {
      state.value.perfectEndingsAchieved++
    }
  }

  const finalizeEvent = () => {
    if (!state.value.activeProgress || !state.value.activeEvent) return

    state.value.activeProgress.status = 'completed'
    state.value.activeProgress.completedDay = Date.now()
    state.value.totalEventsCompleted++

    addNotification({
      eventId: state.value.activeEvent.id,
      eventTitle: state.value.activeEvent.title,
      eventIcon: state.value.activeEvent.icon,
      message: `剧情完成：${state.value.activeEvent.title}`,
      type: 'complete'
    })

    state.value.activeEvent = null
    state.value.activeProgress = null
    state.value.activeNode = null
  }

  const advanceAutoNode = (): PlotEventChoiceResult | null => {
    if (!state.value.activeEvent || !state.value.activeProgress || !state.value.activeNode) {
      return null
    }

    const node = state.value.activeNode
    if (node.autoNextDelay && node.nextNodeId) {
      const nextNode = getNodeById(state.value.activeEvent, node.nextNodeId)
      if (nextNode) {
        state.value.activeProgress.currentNodeId = nextNode.id
        if (!state.value.activeProgress.visitedNodeIds.includes(nextNode.id)) {
          state.value.activeProgress.visitedNodeIds.push(nextNode.id)
        }
        state.value.activeNode = nextNode

        if (nextNode.isEnding) {
          applyEndingReward(nextNode)
          finalizeEvent()
          return {
            success: true,
            nextNode: null,
            eventCompleted: true,
            endingAchieved: nextNode.endingType
          }
        }

        return {
          success: true,
          nextNode,
          eventCompleted: false
        }
      }
    }

    if (node.isEnding) {
      applyEndingReward(node)
      finalizeEvent()
      return {
        success: true,
        nextNode: null,
        eventCompleted: true,
        endingAchieved: node.endingType
      }
    }

    return null
  }

  const dismissEvent = () => {
    if (state.value.activeEvent) {
      addNotification({
        eventId: state.value.activeEvent.id,
        eventTitle: state.value.activeEvent.title,
        eventIcon: state.value.activeEvent.icon,
        message: `剧情已暂停，可随时继续`,
        type: 'progress'
      })
    }
    state.value.activeEvent = null
    state.value.activeNode = null
  }

  const resumeEvent = (eventId: string): boolean => {
    const progress = getProgressForEvent(eventId)
    const event = getEventById(eventId)
    if (!progress || !event || progress.status !== 'in_progress') return false
    if (!progress.currentNodeId) return false

    state.value.activeEvent = event
    state.value.activeProgress = progress
    state.value.activeNode = getNodeById(event, progress.currentNodeId) || null
    return true
  }

  const addRelationshipTrust = (customerId: string, amount: number) => {
    const rel = getRelationshipForCustomer(customerId)
    if (!rel) return

    rel.trustPoints += amount

    const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'confidant', 'soulmate']
    let currentLevelIdx = levels.indexOf(rel.level)
    let nextLevelTrust = getNextLevelTrust(rel.level)

    while (rel.trustPoints >= nextLevelTrust && currentLevelIdx < levels.length - 1) {
      currentLevelIdx++
      rel.level = levels[currentLevelIdx]
      nextLevelTrust = getNextLevelTrust(rel.level)

      const levelInfo = getRelationshipLevelInfo(rel.level)
      rel.sharedMoments.push(`关系升级：${levelInfo.name}`)

      if (rel.level === 'friend') {
        rel.specialPerks.push('购买时自动享受 5% 折扣')
      } else if (rel.level === 'confidant') {
        rel.specialPerks.push('会介绍特殊顾客来店')
      } else if (rel.level === 'soulmate') {
        rel.specialPerks.push('会赠送稀有唱片给你')
      }
    }

    const currentLevelMin = getRelationshipLevelInfo(rel.level).minTrust
    const nextLevelMin = getNextLevelTrust(rel.level)
    rel.levelProgress = rel.trustPoints - currentLevelMin
    rel.nextLevelProgress = nextLevelMin - currentLevelMin
  }

  const acceptSpecialOrder = (
    orderId: string,
    currentDay: number,
    currentBudget: number
  ): SpecialOrderAcceptResult => {
    const orderConfig = getSpecialOrderById(orderId)
    if (!orderConfig) {
      return { success: false, message: '订单不存在' }
    }

    const existingProgress = state.value.specialOrders.find(o => o.orderId === orderId)
    if (existingProgress && existingProgress.isActive) {
      return { success: false, message: '该订单已在进行中' }
    }

    const deposit = Math.floor(orderConfig.reward.basePayment * 0.1)
    if (currentBudget < deposit) {
      return { success: false, message: `需要 ¥${deposit} 作为启动资金` }
    }

    const deadlineDays = (orderConfig as any).deadlineDays || 14
    const newProgress: SpecialOrderProgress = {
      orderId,
      config: orderConfig,
      isActive: true,
      acceptedDay: currentDay,
      deadlineDay: currentDay + deadlineDays,
      completedItems: [],
      isCompleted: false,
      isFailed: false,
      fulfilledDay: null,
      earnedReward: null
    }

    if (existingProgress) {
      Object.assign(existingProgress, newProgress)
    } else {
      state.value.specialOrders.push(newProgress)
    }

    addNotification({
      eventId: orderConfig.eventId,
      eventTitle: orderConfig.title,
      eventIcon: '📋',
      message: `接受特殊订单：${orderConfig.title}`,
      type: 'special_order'
    })

    return {
      success: true,
      message: `订单已接受！请在 ${deadlineDays} 天内完成`,
      orderProgress: newProgress,
      cost: deposit
    }
  }

  const checkOrderRequirement = (
    requirement: SpecialOrderRequirement,
    record: { genre?: string; rarity?: number; condition?: number; id?: string; artist?: string; marketPrice?: number }
  ): boolean => {
    switch (requirement.type) {
      case 'genre':
        return record.genre === requirement.value
      case 'rarity':
        return (record.rarity || 0) >= (requirement.value as number)
      case 'condition':
        return (record.condition || 0) >= (requirement.value as number)
      case 'specific_record':
        return record.id === requirement.value
      case 'artist':
        return record.artist === requirement.value
      case 'price_range':
        const [min, max] = requirement.value as [number, number]
        return (record.marketPrice || 0) >= min && (record.marketPrice || 0) <= max
      default:
        return false
    }
  }

  const fulfillSpecialOrder = (
    orderId: string,
    currentDay: number,
    providedRecords: { id: string; genre?: string; rarity?: number; condition?: number; artist?: string; marketPrice?: number }[]
  ): { success: boolean; message: string; reward?: { basePayment: number; bonusPayment: number; reputation: number; growthPoints: number } } => {
    const orderConfig = getSpecialOrderById(orderId)
    const progress = state.value.specialOrders.find(o => o.orderId === orderId)
    if (!orderConfig || !progress) {
      return { success: false, message: '订单不存在' }
    }
    if (!progress.isActive || progress.isCompleted || progress.isFailed) {
      return { success: false, message: '订单状态异常' }
    }

    if (progress.deadlineDay && currentDay > progress.deadlineDay) {
      progress.isFailed = true
      progress.isActive = false
      return { success: false, message: '订单已超时！' }
    }

    const requirements = [...(orderConfig as any).requirements as SpecialOrderRequirement[]]
    const usedRecordIds = new Set<string>()
    let allRequirementsMet = true

    for (const req of requirements) {
      const requiredCount = req.count || 1
      let matchedCount = 0

      for (const rec of providedRecords) {
        if (usedRecordIds.has(rec.id!)) continue
        if (checkOrderRequirement(req, rec)) {
          usedRecordIds.add(rec.id!)
          progress.completedItems.push({ recordId: rec.id!, requirementMet: true })
          matchedCount++
          if (matchedCount >= requiredCount) break
        }
      }

      if (matchedCount < requiredCount) {
        allRequirementsMet = false
        break
      }
    }

    if (!allRequirementsMet) {
      return { success: false, message: '提供的唱片不满足全部要求' }
    }

    progress.isCompleted = true
    progress.isActive = false
    progress.fulfilledDay = currentDay

    const isPerfect = progress.deadlineDay && (progress.deadlineDay - currentDay) >= 3
    const reward = {
      basePayment: orderConfig.reward.basePayment,
      bonusPayment: isPerfect ? orderConfig.reward.bonusPayment : Math.floor(orderConfig.reward.bonusPayment * 0.5),
      reputation: orderConfig.reward.reputation,
      growthPoints: orderConfig.reward.growthPoints
    }
    progress.earnedReward = reward
    state.value.totalSpecialOrdersFulfilled++

    if (orderConfig.reward.relationshipBonus) {
      addRelationshipTrust(orderConfig.customerId, orderConfig.reward.relationshipBonus)
    }

    addNotification({
      eventId: orderConfig.eventId,
      eventTitle: orderConfig.title,
      eventIcon: '🎉',
      message: `订单完成：${orderConfig.title}`,
      type: 'complete'
    })

    return {
      success: true,
      message: isPerfect ? '完美完成！获得全部奖励！' : '订单完成，获得部分奖励',
      reward
    }
  }

  const evaluateLevelEndings = (params: {
    levelId: number
    profit: number
    avgSatisfaction: number
    reputation: number
    completedEventIds: string[]
    collectionCount: number
  }): LevelEndingConfig | null => {
    const levelConfigs = getLevelEndings(params.levelId)
    if (levelConfigs.length === 0) return null

    let bestEnding: LevelEndingConfig | null = null
    let bestScore = -1

    const endingPriority: Record<PlotEndingType, number> = {
      perfect: 100,
      secret: 90,
      good: 70,
      normal: 50,
      bad: 10
    }

    for (const config of levelConfigs) {
      const cond = config.conditions
      let score = 0
      let meetsAll = true

      if (cond.minProfit && params.profit < cond.minProfit) meetsAll = false
      if (cond.minSatisfaction && params.avgSatisfaction < cond.minSatisfaction) meetsAll = false
      if (cond.minReputation && params.reputation < cond.minReputation) meetsAll = false
      if (cond.requiredCollectionCount && params.collectionCount < cond.requiredCollectionCount) meetsAll = false

      if (cond.requiredCompletedEventIds) {
        for (const eid of cond.requiredCompletedEventIds) {
          if (!params.completedEventIds.includes(eid)) {
            meetsAll = false
            break
          }
        }
      }

      if (cond.specialFlags) {
        for (const flag of cond.specialFlags) {
          if (!state.value.flags[flag]) {
            meetsAll = false
            break
          }
        }
      }

      if (!meetsAll) continue

      score = endingPriority[config.type] || 0
      if (score > bestScore) {
        bestScore = score
        bestEnding = config
      }
    }

    if (!bestEnding) {
      for (const config of levelConfigs) {
        if (config.type === 'bad') {
          bestEnding = config
          break
        }
      }
    }

    if (bestEnding) {
      let progress = state.value.levelEndings.find(l => l.levelId === params.levelId)
      if (!progress) {
        progress = {
          levelId: params.levelId,
          achievedEndingId: null,
          achieved: false,
          endingId: null,
          endingType: null,
          config: null,
          achievedDay: null,
          candidateEndings: [],
          viewedEndings: []
        }
        state.value.levelEndings.push(progress)
      }
      progress.achievedEndingId = bestEnding.id
      progress.endingId = bestEnding.id
      progress.endingType = bestEnding.type
      progress.achieved = true
      progress.config = bestEnding
      progress.achievedDay = Date.now()
      if (!progress.viewedEndings.includes(bestEnding.id)) {
        progress.viewedEndings.push(bestEnding.id)
      }

      addNotification({
        eventId: `level_${params.levelId}_ending`,
        eventTitle: bestEnding.title,
        eventIcon: bestEnding.icon,
        message: `达成结局：${bestEnding.typeName} - ${bestEnding.title}`,
        type: 'ending'
      })
    }

    return bestEnding
  }

  const addNotification = (notif: Omit<PlotEventGameState['notifications'][0], 'id' | 'read' | 'createdAt'>) => {
    state.value.notifications.unshift({
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      read: false,
      createdAt: Date.now()
    })
  }

  const markNotificationRead = (notifId: string) => {
    const notif = state.value.notifications.find(n => n.id === notifId)
    if (notif) notif.read = true
  }

  const markAllNotificationsRead = () => {
    state.value.notifications.forEach(n => n.read = true)
  }

  const getAllEndingConfigsForLevel = (levelId: number): LevelEndingConfig[] => {
    return getLevelEndings(levelId)
  }

  const getLevelEndingProgressForDisplay = (levelId: number) => {
    return state.value.levelEndings.find(l => l.levelId === levelId)
  }

  const closeEvent = dismissEvent
  const advanceToNextNode = advanceAutoNode

  const calculateOrderProgress = (orderId: string): { completed: number; total: number; progressPercent: number } => {
    const progress = state.value.specialOrders.find(o => o.orderId === orderId)
    const orderConfig = getSpecialOrderById(orderId)
    if (!orderConfig) return { completed: 0, total: 0, progressPercent: 0 }

    const requirements = (orderConfig as any).requirements || []
    const total = requirements.reduce((sum: number, req: any) => sum + (req.count || 1), 0)
    const completed = progress?.completedItems.filter(i => i.requirementMet).length || 0
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, progressPercent }
  }

  return {
    state,
    hasActiveEvent,
    currentNode,
    currentChoices,
    unreadNotifications,
    relationshipsByLevel,
    completedEvents,
    inProgressEvents,
    availableEvents,
    activeSpecialOrders,

    getProgressForEvent,
    getRelationshipForCustomer,
    getFlag,
    setFlag,

    checkEventCondition,
    rollDailyEventPool,
    triggerEvent,
    makeChoice,
    advanceAutoNode,
    advanceToNextNode,
    dismissEvent,
    closeEvent,
    resumeEvent,

    addRelationshipTrust,

    acceptSpecialOrder,
    checkOrderRequirement,
    fulfillSpecialOrder,
    calculateOrderProgress,

    evaluateLevelEndings,
    getAllEndingConfigsForLevel,
    getLevelEndingProgressForDisplay,

    addNotification,
    markNotificationRead,
    markAllNotificationsRead
  }
})
