<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlotEventStore } from '@/stores/plotEvent'
import { useGameStore } from '@/stores/game'
import PlotEventDialog from './PlotEventDialog.vue'
import type { PlotEventType, RelationshipLevel, PlotEndingType } from '@/types'
import { getRelationshipLevelInfo } from '@/data/plotEvents'

const emit = defineEmits<{
  close: []
}>()

const plotEventStore = usePlotEventStore()
const gameStore = useGameStore()

const activeTab = ref<'events' | 'relationships' | 'orders' | 'endings'>('events')

const typeConfig: Record<PlotEventType, { label: string; icon: string; color: string }> = {
  owner_growth: { label: '店主成长', icon: '🌱', color: '#48bb78' },
  customer_relationship: { label: '顾客故事', icon: '💕', color: '#ed64a6' },
  special_order: { label: '特殊订单', icon: '📦', color: '#4299e1' },
  multi_ending: { label: '命运抉择', icon: '🎭', color: '#9f7aea' }
}

const relationshipLevelExtendedConfig: Record<RelationshipLevel, { 
  label: string; 
  icon: string; 
  color: string;
  benefits: string[];
  nextLevel: RelationshipLevel | null
}> = {
  stranger: { 
    label: '陌生人', 
    icon: '👋', 
    color: '#718096', 
    benefits: ['标准购买体验'],
    nextLevel: 'acquaintance'
  },
  acquaintance: { 
    label: '相识', 
    icon: '🙂', 
    color: '#4299e1', 
    benefits: ['偶尔的闲聊', '购买时有 2% 折扣'],
    nextLevel: 'friend'
  },
  friend: { 
    label: '朋友', 
    icon: '😊', 
    color: '#48bb78', 
    benefits: ['主动推荐唱片', '购买时享受 5% 折扣'],
    nextLevel: 'confidant'
  },
  confidant: { 
    label: '知己', 
    icon: '💝', 
    color: '#ed64a6', 
    benefits: ['会介绍特殊顾客', '享受专属优惠'],
    nextLevel: 'soulmate'
  },
  soulmate: { 
    label: '灵魂伴侣', 
    icon: '👑', 
    color: '#ecc94b', 
    benefits: ['会赠送稀有唱片', '完全信任你的推荐'],
    nextLevel: null
  }
}

const relationshipLevelConfig: Record<RelationshipLevel, { label: string; icon: string; color: string }> = {
  stranger: { label: '陌生人', icon: '👋', color: '#718096' },
  acquaintance: { label: '相识', icon: '🙂', color: '#4299e1' },
  friend: { label: '朋友', icon: '😊', color: '#48bb78' },
  confidant: { label: '知己', icon: '💝', color: '#ed64a6' },
  soulmate: { label: '灵魂伴侣', icon: '👑', color: '#ecc94b' }
}

const endingConfig: Record<PlotEndingType, { label: string; icon: string; color: string }> = {
  perfect: { label: '完美', icon: '👑', color: '#ecc94b' },
  good: { label: '圆满', icon: '🌟', color: '#48bb78' },
  normal: { label: '普通', icon: '✨', color: '#4299e1' },
  bad: { label: '遗憾', icon: '💔', color: '#f56565' },
  secret: { label: '隐藏', icon: '🔮', color: '#9f7aea' }
}

const dailyPool = computed(() => plotEventStore.state.dailyEventPool)
const pending = computed(() => plotEventStore.state.pendingEvents)
const relationships = computed(() => plotEventStore.state.relationships)
const specialOrders = computed(() => plotEventStore.state.specialOrders)
const levelEndings = computed(() => plotEventStore.state.levelEndings)

const stats = computed(() => ({
  completed: plotEventStore.state.totalEventsCompleted,
  orders: plotEventStore.state.totalSpecialOrdersFulfilled,
  perfect: plotEventStore.state.perfectEndingsAchieved,
  relationships: relationships.value.filter(r => r.level !== 'stranger').length
}))

const tabs = [
  { key: 'events', label: '剧情事件', icon: '📖', count: dailyPool.value.length + pending.value.length },
  { key: 'relationships', label: '顾客关系', icon: '💕', count: stats.value.relationships },
  { key: 'orders', label: '特殊订单', icon: '📦', count: specialOrders.value.filter(o => o.isActive && !o.isCompleted).length },
  { key: 'endings', label: '结局收集', icon: '🎭', count: levelEndings.value.filter(e => e.achieved).length }
]

const handleTriggerEvent = (eventId: string) => {
  const result = plotEventStore.triggerEvent(eventId, gameStore.currentDay)
  if (!result.triggered) {
    console.warn('触发失败:', result.reason)
  }
}

const handleAcceptOrder = (orderId: string) => {
  plotEventStore.acceptSpecialOrder(orderId, gameStore.currentDay, gameStore.budget)
}

const handleFulfillOrder = (orderId: string) => {
  plotEventStore.fulfillSpecialOrder(orderId, gameStore.currentDay, [])
}

const getOrderProgress = (order: typeof specialOrders.value[0]) => {
  return plotEventStore.calculateOrderProgress(order.orderId)
}

const getRelationshipTrustProgress = (rel: typeof relationships.value[0]) => {
  if (rel.level === 'soulmate') return 100
  const currentLevelInfo = getRelationshipLevelInfo(rel.level)
  const nextLevelInfo = getNextLevelInfo(rel.level)
  if (!nextLevelInfo) return 100
  const currentMin = currentLevelInfo.minTrust
  const nextMin = nextLevelInfo.minTrust
  return Math.min(100, Math.max(0, ((rel.trustPoints - currentMin) / (nextMin - currentMin)) * 100))
}

const getNextLevelInfo = (level: RelationshipLevel) => {
  const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'confidant', 'soulmate']
  const idx = levels.indexOf(level)
  if (idx < levels.length - 1) {
    return getRelationshipLevelInfo(levels[idx + 1])
  }
  return null
}
</script>

<template>
  <div class="plot-panel-overlay">
    <div class="plot-panel-container">
      <div class="panel-header">
        <button class="close-btn" @click="emit('close')">✕</button>
        <h2 class="panel-title">🎬 剧情事件中心</h2>
        <div class="panel-stats">
          <span class="stat-chip">📖 {{ stats.completed }}</span>
          <span class="stat-chip">💕 {{ stats.relationships }}</span>
          <span class="stat-chip">👑 {{ stats.perfect }}</span>
        </div>
      </div>

      <div class="stats-banner">
        <div class="banner-stat">
          <span class="bs-icon">📖</span>
          <div class="bs-info">
            <span class="bs-value">{{ stats.completed }}</span>
            <span class="bs-label">事件完成</span>
          </div>
        </div>
        <div class="banner-stat">
          <span class="bs-icon">📦</span>
          <div class="bs-info">
            <span class="bs-value">{{ stats.orders }}</span>
            <span class="bs-label">订单交付</span>
          </div>
        </div>
        <div class="banner-stat">
          <span class="bs-icon">💕</span>
          <div class="bs-info">
            <span class="bs-value">{{ stats.relationships }}</span>
            <span class="bs-label">建立羁绊</span>
          </div>
        </div>
        <div class="banner-stat">
          <span class="bs-icon">👑</span>
          <div class="bs-info">
            <span class="bs-value">{{ stats.perfect }}</span>
            <span class="bs-label">完美结局</span>
          </div>
        </div>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key as any"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
        </button>
      </div>

      <div class="tab-content">
        <template v-if="activeTab === 'events'">
          <div v-if="dailyPool.length > 0 || pending.length > 0" class="section-card">
            <h3 class="section-title">🌟 今日可触发</h3>
            <p class="section-desc">这些事件今天可能会在营业中发生</p>
            <div class="event-list">
              <div
                v-for="event in [...dailyPool, ...pending]"
                :key="event.id"
                class="event-card"
                :style="{ borderLeftColor: event.coverColor }"
              >
                <div class="ec-header">
                  <div class="ec-type" :style="{ background: typeConfig[event.type].color + '20', color: typeConfig[event.type].color }">
                    {{ typeConfig[event.type].icon }} {{ typeConfig[event.type].label }}
                  </div>
                  <span
                    class="ec-category"
                    :class="event.category"
                  >
                    {{ event.category === 'main' ? '主线' : event.category === 'side' ? '支线' : '隐藏' }}
                  </span>
                </div>
                <div class="ec-body">
                  <div class="ec-icon" :style="{ background: event.coverColor + '20' }">
                    {{ event.icon }}
                  </div>
                  <div class="ec-info">
                    <h4 class="ec-title">{{ event.title }}</h4>
                    <p v-if="event.subtitle" class="ec-subtitle">{{ event.subtitle }}</p>
                    <p class="ec-desc">{{ event.description }}</p>
                  </div>
                </div>
                <div class="ec-footer">
                  <span class="ec-reward">🎁 {{ event.rewardPreview }}</span>
                  <button
                    class="btn-primary btn-sm"
                    @click="handleTriggerEvent(event.id)"
                  >
                    立即触发
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="plotEventStore.completedEvents.length > 0" class="section-card">
            <h3 class="section-title">📚 已完成</h3>
            <div class="event-list compact">
              <div
                v-for="prog in plotEventStore.completedEvents.slice(0, 10)"
                :key="prog.eventId"
                class="event-card compact"
              >
                <span class="ec-compact-icon">✅</span>
                <span class="ec-compact-title">
                  {{ plotEventStore.state.eventProgresses.find(p => p.eventId === prog.eventId)?.eventId || prog.eventId }}
                </span>
                <span class="ec-compact-day">第{{ prog.completedDay }}天</span>
              </div>
            </div>
          </div>

          <div v-if="dailyPool.length === 0 && pending.length === 0 && plotEventStore.completedEvents.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-text">暂无可用的剧情事件</p>
            <p class="empty-hint">继续经营店铺，新的故事会逐步解锁~</p>
          </div>
        </template>

        <template v-else-if="activeTab === 'relationships'">
          <div class="section-card">
            <h3 class="section-title">💕 顾客关系网</h3>
            <p class="section-desc">与顾客建立更深的羁绊，解锁专属剧情和奖励</p>
            <div class="relationship-list">
              <div
                v-for="rel in relationships"
                :key="rel.customerId"
                class="relationship-card"
                :style="{ borderColor: relationshipLevelConfig[rel.level].color + '40' }"
              >
                <div class="rc-header">
                  <div class="rc-avatar">{{ rel.customerAvatar }}</div>
                  <div class="rc-info">
                    <h4 class="rc-name">{{ rel.customerName }}</h4>
                    <span
                      class="rc-level"
                      :style="{ background: relationshipLevelConfig[rel.level].color + '20', color: relationshipLevelConfig[rel.level].color }"
                    >
                      {{ relationshipLevelConfig[rel.level].icon }} {{ relationshipLevelConfig[rel.level].label }}
                    </span>
                  </div>
                  <div class="rc-trust">
                    <span class="rct-value">{{ rel.trustPoints }}</span>
                    <span class="rct-label">信任度</span>
                  </div>
                </div>
                <div class="rc-progress">
                  <div class="rc-bar">
                    <div
                      class="rc-fill"
                      :style="{
                        width: getRelationshipTrustProgress(rel) + '%',
                        background: relationshipLevelConfig[rel.level].color
                      }"
                    ></div>
                  </div>
                  <span class="rc-next">
                    {{ relationshipLevelExtendedConfig[rel.level].nextLevel ? '距离' + relationshipLevelConfig[relationshipLevelExtendedConfig[rel.level].nextLevel!].label : '已达最高等级' }}
                  </span>
                </div>
                <div class="rc-benefits">
                  <span v-for="(b, i) in relationshipLevelExtendedConfig[rel.level].benefits.slice(0, 3)" :key="i" class="benefit-tag">
                    {{ b }}
                  </span>
                </div>
                <div v-if="rel.unlockedEvents.length > 0" class="rc-unlocked">
                  🔓 已解锁 {{ rel.unlockedEvents.length }} 个专属剧情
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'orders'">
          <div v-if="specialOrders.length > 0" class="section-card">
            <h3 class="section-title">📦 特殊订单</h3>
            <p class="section-desc">完成顾客的特殊心愿，获得丰厚奖励</p>
            <div class="order-list">
              <div
                v-for="order in specialOrders"
                :key="order.config.id"
                class="order-card"
                :class="{
                  active: order.isActive && !order.isCompleted,
                  completed: order.isCompleted,
                  failed: order.isFailed
                }"
              >
                <div class="oc-header">
                  <div class="oc-customer">
                    <span class="occ-avatar">{{ order.config.customerAvatar }}</span>
                    <div class="occ-info">
                      <span class="occ-name">{{ order.config.customerName }}</span>
                      <span
                        class="occ-diff"
                        :class="'difficulty-' + order.config.difficulty"
                      >
                        {{ order.config.difficulty === 'easy' ? '简单' : order.config.difficulty === 'medium' ? '中等' : order.config.difficulty === 'hard' ? '困难' : '传奇' }}
                      </span>
                    </div>
                  </div>
                  <span
                    class="oc-status"
                    :style="{
                      color: order.isCompleted ? '#48bb78' : order.isFailed ? '#f56565' : order.isActive ? '#4299e1' : '#718096'
                    }"
                  >
                    {{ order.isCompleted ? '✅ 已完成' : order.isFailed ? '❌ 已失败' : order.isActive ? '⚡ 进行中' : '📋 待接受' }}
                  </span>
                </div>
                <div class="oc-body">
                  <h4 class="oc-title">{{ order.config.title }}</h4>
                  <p class="oc-desc">{{ order.config.description }}</p>
                  <p class="oc-story">「{{ order.config.story }}」</p>
                </div>
                <div v-if="order.isActive && !order.isCompleted" class="oc-progress">
                  <div class="ocp-header">
                    <span>完成进度</span>
                    <span>{{ getOrderProgress(order).progressPercent }}%</span>
                  </div>
                  <div class="ocp-bar">
                    <div
                      class="ocp-fill"
                      :style="{ width: getOrderProgress(order).progressPercent + '%' }"
                    ></div>
                  </div>
                  <div class="ocp-deadline" :class="{ urgent: order.deadlineDay && order.deadlineDay - gameStore.currentDay <= 3 }">
                    ⏰ {{ order.deadlineDay ? `截止第${order.deadlineDay}天（剩余${order.deadlineDay - gameStore.currentDay}天）` : '无期限' }}
                  </div>
                </div>
                <div class="oc-reward">
                  <span class="ocr-label">奖励:</span>
                  <span class="ocr-item">💰 ¥{{ order.config.reward.basePayment }}</span>
                  <span v-if="order.config.reward.bonusPayment" class="ocr-item bonus">🎁 +¥{{ order.config.reward.bonusPayment }}</span>
                  <span v-if="order.config.reward.reputation" class="ocr-item">⭐ +{{ order.config.reward.reputation }}</span>
                </div>
                <div class="oc-actions">
                  <button
                    v-if="!order.isActive && !order.isCompleted && !order.isFailed"
                    class="btn-primary btn-sm"
                    @click="handleAcceptOrder(order.config.id)"
                  >
                    📥 接受订单
                  </button>
                  <button
                    v-else-if="order.isActive && !order.isCompleted && getOrderProgress(order).progressPercent >= 100"
                    class="btn-primary btn-sm claim"
                    @click="handleFulfillOrder(order.config.id)"
                  >
                    ✅ 交付订单
                  </button>
                  <button
                    v-else
                    class="btn-secondary btn-sm"
                    disabled
                  >
                    {{ order.isCompleted ? '已完成' : order.isFailed ? '已失败' : '条件未达成' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📦</div>
            <p class="empty-text">暂无特殊订单</p>
            <p class="empty-hint">提升与顾客的关系以解锁特殊订单~</p>
          </div>
        </template>

        <template v-else-if="activeTab === 'endings'">
          <div class="section-card">
            <h3 class="section-title">🎭 结局收集</h3>
            <p class="section-desc">不同的选择将导向不同的命运</p>
            <div class="endings-summary">
              <div
                v-for="(cfg, type) in endingConfig"
                :key="type"
                class="ending-summary-item"
                :style="{ borderColor: cfg.color }"
              >
                <span class="esi-icon">{{ cfg.icon }}</span>
                <span class="esi-label">{{ cfg.label }}</span>
                <span class="esi-count" :style="{ color: cfg.color }">
                  {{ levelEndings.filter(e => e.achieved && e.endingType === type as PlotEndingType).length }}/{{ levelEndings.filter(e => e.endingType === type as PlotEndingType).length }}
                </span>
              </div>
            </div>
            <div class="endings-list">
              <div
                v-for="ending in levelEndings"
                :key="ending.levelId + '_' + (ending.endingId || 'locked')"
                class="ending-card"
                :class="{ achieved: ending.achieved, locked: !ending.achieved }"
              >
                <div class="enc-header">
                  <span class="enc-level">关卡 {{ ending.levelId }}</span>
                  <span
                    v-if="ending.endingType"
                    class="enc-type"
                    :style="{ background: endingConfig[ending.endingType].color + '20', color: endingConfig[ending.endingType].color }"
                  >
                    {{ endingConfig[ending.endingType].icon }} {{ endingConfig[ending.endingType].label }}
                  </span>
                  <span v-else class="enc-type locked">
                    🔒 未解锁
                  </span>
                </div>
                <h4 class="enc-title">{{ ending.achieved && ending.config ? ending.config.title : '???' }}</h4>
                <p class="enc-desc">{{ ending.achieved && ending.config ? ending.config.description : '达成条件未解锁' }}</p>
                <div v-if="ending.achieved" class="enc-meta">
                  <span>📅 第{{ ending.achievedDay }}天达成</span>
                  <span v-if="ending.config?.rewards">🎁 已领取奖励</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <PlotEventDialog
      @close="null"
      @choice-made="null"
      @event-completed="null"
    />
  </div>
</template>

<style scoped>
.plot-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  justify-content: center;
  overflow-y: auto;
}

.plot-panel-container {
  width: 100%;
  max-width: 560px;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  position: relative;
}

.close-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 16px;
}

.panel-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.panel-stats {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  gap: 4px;
}

.stat-chip {
  padding: 3px 8px;
  background: var(--bg-secondary);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stats-banner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.banner-stat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bs-icon {
  font-size: 18px;
}

.bs-info {
  display: flex;
  flex-direction: column;
}

.bs-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.bs-label {
  font-size: 9px;
  color: var(--text-muted);
}

.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--accent-gold);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tab-icon {
  font-size: 16px;
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  min-width: 16px;
  height: 14px;
  padding: 0 4px;
  background: var(--accent-orange);
  color: white;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.section-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 14px 0;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-list.compact {
  gap: 6px;
}

.event-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  border-left: 4px solid;
}

.event-card.compact {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ec-type {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.ec-category {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
}

.ec-category.main {
  background: rgba(233, 69, 96, 0.2);
  color: #e94560;
}

.ec-category.side {
  background: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.ec-category.hidden {
  background: rgba(159, 122, 234, 0.2);
  color: #9f7aea;
}

.ec-body {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.ec-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.ec-info {
  flex: 1;
  min-width: 0;
}

.ec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.ec-subtitle {
  font-size: 11px;
  color: var(--accent-orange);
  margin: 0 0 4px 0;
}

.ec-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.ec-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.ec-reward {
  font-size: 11px;
  color: var(--text-muted);
}

.ec-compact-icon {
  font-size: 14px;
}

.ec-compact-title {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.ec-compact-day {
  font-size: 10px;
  color: var(--text-muted);
}

.relationship-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relationship-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid;
}

.rc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rc-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.rc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.rc-level {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.rc-trust {
  text-align: center;
}

.rct-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-gold);
}

.rct-label {
  font-size: 9px;
  color: var(--text-muted);
}

.rc-progress {
  margin-bottom: 10px;
}

.rc-bar {
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.rc-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.rc-next {
  font-size: 10px;
  color: var(--text-muted);
}

.rc-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.benefit-tag {
  padding: 3px 8px;
  background: var(--bg-card);
  border-radius: 6px;
  font-size: 10px;
  color: var(--text-secondary);
}

.rc-unlocked {
  font-size: 11px;
  color: var(--success);
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card.completed {
  opacity: 0.75;
}

.order-card.failed {
  opacity: 0.6;
}

.oc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.oc-customer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.occ-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.occ-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.occ-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.occ-diff {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 6px;
  align-self: flex-start;
}

.occ-diff.difficulty-easy { background: rgba(72, 187, 120, 0.2); color: #48bb78; }
.occ-diff.difficulty-medium { background: rgba(237, 137, 54, 0.2); color: #ed8936; }
.occ-diff.difficulty-hard { background: rgba(245, 101, 101, 0.2); color: #f56565; }

.oc-status {
  font-size: 11px;
  font-weight: 600;
}

.oc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.oc-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 6px 0;
}

.oc-story {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 6px;
}

.oc-progress {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px 12px;
}

.ocp-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.ocp-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.ocp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-orange));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ocp-deadline {
  font-size: 10px;
  color: var(--text-muted);
}

.ocp-deadline.urgent {
  color: var(--danger);
  font-weight: 600;
}

.oc-reward {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.ocr-label {
  font-size: 11px;
  color: var(--text-muted);
}

.ocr-item {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-orange);
  padding: 2px 8px;
  background: var(--bg-card);
  border-radius: 6px;
}

.ocr-item.bonus {
  color: var(--success);
}

.oc-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 8px 16px !important;
  font-size: 12px !important;
}

.btn-sm.claim {
  background: linear-gradient(135deg, #48bb78, #38b2ac) !important;
  animation: claimPulse 1.5s ease-in-out infinite;
}

@keyframes claimPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); }
}

.endings-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.ending-summary-item {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 10px 4px;
  text-align: center;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.esi-icon {
  font-size: 18px;
}

.esi-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.esi-count {
  font-size: 13px;
  font-weight: 700;
}

.endings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ending-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s;
}

.ending-card.achieved {
  border: 1px solid var(--success);
}

.ending-card.locked {
  opacity: 0.5;
  filter: grayscale(0.5);
}

.enc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.enc-level {
  font-size: 10px;
  color: var(--text-muted);
}

.enc-type {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.enc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.enc-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 8px 0;
}

.enc-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--border);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 6px 0;
}

.empty-hint {
  color: var(--text-muted);
  font-size: 12px;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--border);
  cursor: pointer;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
