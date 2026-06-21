<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { LocalPerfArtist, LocalPerfListeningEvent } from '@/types'
import {
  getRarityLabel,
  getRarityColor,
  getEventTypeLabel,
  getEventTypeInfo,
  getTaskStatusLabel,
  getTaskStatusColor,
  localPerfReputationTiers
} from '@/data/localPerformance'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'artists' | 'events' | 'limited' | 'tasks' | 'rewards'>('artists')
const toastMessage = ref('')
const showToast = ref(false)
const showInviteModal = ref(false)
const showEventModal = ref(false)
const selectedArtist = ref<LocalPerfArtist | null>(null)
const selectedEvent = ref<LocalPerfListeningEvent | null>(null)

const lp = computed(() => gameStore.localPerformance)
const isActive = computed(() => lp.value.isActive)
const residency = computed(() => lp.value.residency)
const currentArtist = computed(() => {
  if (!lp.value.currentArtistId) return null
  return lp.value.artists.find((a: LocalPerfArtist) => a.id === lp.value.currentArtistId) || null
})
const score = computed(() => gameStore.localPerfScore)
const rewardTier = computed(() => gameStore.localPerfRewardTier)
const bonusSummary = computed(() => gameStore.localPerfBonusSummary)
const availableArtists = computed(() => lp.value.artists.filter((a: LocalPerfArtist) => a.isUnlocked && a.id !== lp.value.currentArtistId))
const availableEvents = computed(() => lp.value.listeningEvents.filter((e: LocalPerfListeningEvent) => e.isUnlocked))

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

const handleInviteArtist = (artist: LocalPerfArtist) => {
  selectedArtist.value = artist
  showInviteModal.value = true
}

const confirmInviteArtist = () => {
  if (!selectedArtist.value) return
  const result = gameStore.inviteLocalPerfArtist(selectedArtist.value.id)
  showNotification(result.message)
  if (result.success) {
    showInviteModal.value = false
    selectedArtist.value = null
  }
}

const handleStartEvent = (event: LocalPerfListeningEvent) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const confirmStartEvent = () => {
  if (!selectedEvent.value) return
  const result = gameStore.startLocalPerfEvent(selectedEvent.value.id)
  showNotification(result.message)
  if (result.success) {
    showEventModal.value = false
    selectedEvent.value = null
  }
}

const handleBuyLimited = (itemId: string) => {
  const result = gameStore.buyLocalPerfLimitedItem(itemId)
  showNotification(result.message)
}

const handleClaimTaskReward = (taskId: string) => {
  const result = gameStore.claimLocalPerfTaskReward(taskId)
  showNotification(result.message)
}

const handleClaimReward = () => {
  const result = gameStore.claimLocalPerfReward()
  showNotification(result.message)
}

const handleEndResidency = () => {
  gameStore.endLocalPerfResidency()
  showNotification('驻店演出已结束，请领取声望奖励！')
}

const getTaskProgressPercent = (task: { target: number; current: number }) => {
  if (task.target <= 0) return 0
  return Math.min(100, Math.round((task.current / task.target) * 100))
}

const getStockStatusColor = (remaining: number, limited: number) => {
  if (remaining <= 0) return '#f56565'
  if (remaining <= limited * 0.2) return '#ed8936'
  return '#48bb78'
}

const getResidencyDaysText = (days: number) => {
  return days <= 0 ? '已结束' : `剩余${days}天`
}
</script>

<template>
  <div class="lp-overlay">
    <div class="lp-container">
      <div class="lp-header">
        <button class="close-btn" @click="emit('close')">✕</button>
        <h2 v-if="isActive && currentArtist" class="lp-title" :style="{ color: getRarityColor(currentArtist.rarity) }">
          {{ currentArtist.avatar }} {{ currentArtist.name }}·驻店中
        </h2>
        <h2 v-else class="lp-title">🎤 本地演出合作</h2>
        <div v-if="isActive && residency" class="lp-day-info">
          {{ getResidencyDaysText(residency.daysRemaining) }}
          <span class="score-badge" :style="{ background: rewardTier.icon === '💎' ? '#e5e4e2' : rewardTier.icon === '🥇' ? '#ffd700' : rewardTier.icon === '🥈' ? '#c0c0c0' : '#cd7f32' }">
            {{ rewardTier.icon }} {{ score }}分
          </span>
        </div>
      </div>

      <div v-if="isActive && bonusSummary" class="bonus-banner card">
        <div class="bb-header">
          <span class="bb-icon">✨</span>
          <span class="bb-title">当前加成</span>
        </div>
        <div class="bb-bonuses">
          <span v-if="bonusSummary.customerAttractBonus > 0" class="bb-bonus">👥 客流+{{ Math.round(bonusSummary.customerAttractBonus * 100) }}%</span>
          <span v-if="bonusSummary.atmosphereBonus > 0" class="bb-bonus">🎭 氛围+{{ bonusSummary.atmosphereBonus }}</span>
          <span v-if="bonusSummary.satisfactionBonus > 0" class="bb-bonus">😊 满意度+{{ bonusSummary.satisfactionBonus }}</span>
          <span v-if="bonusSummary.buyChanceBonus > 0" class="bb-bonus">🎯 购买率+{{ Math.round(bonusSummary.buyChanceBonus * 100) }}%</span>
          <span v-if="bonusSummary.playBoostBonus > 0" class="bb-bonus">🎵 试听+{{ bonusSummary.playBoostBonus }}</span>
          <span v-if="bonusSummary.reputationDailyBonus > 0" class="bb-bonus">⭐ 声望+{{ bonusSummary.reputationDailyBonus }}/日</span>
        </div>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in [
            { key: 'artists', label: '艺人驻店', icon: '🎤' },
            { key: 'events', label: '试听活动', icon: '🎵' },
            { key: 'limited', label: '限定销售', icon: '💿' },
            { key: 'tasks', label: '合作任务', icon: '🎯' },
            { key: 'rewards', label: '声望奖励', icon: '🏆' }
          ]"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key as any"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <template v-if="activeTab === 'artists'">
          <div class="artists-section">
            <div v-if="isActive && residency && residency.status === 'performing' && currentArtist" class="current-artist card">
              <div class="ca-header">
                <span class="ca-avatar">{{ currentArtist.avatar }}</span>
                <div class="ca-info">
                  <div class="ca-name">
                    {{ currentArtist.name }}
                    <span class="rarity-badge" :style="{ color: getRarityColor(currentArtist.rarity), borderColor: getRarityColor(currentArtist.rarity) }">
                      {{ getRarityLabel(currentArtist.rarity) }}
                    </span>
                  </div>
                  <div class="ca-title">{{ currentArtist.title }}</div>
                </div>
              </div>
              <p class="ca-desc">{{ currentArtist.description }}</p>
              <div class="ca-stats">
                <span>👥 客流+{{ Math.round(currentArtist.customerAttractBonus * 100) }}%</span>
                <span>🎭 氛围+{{ currentArtist.atmosphereBonus }}</span>
                <span>😊 满意度+{{ currentArtist.satisfactionBonus }}</span>
                <span>🎯 购买率+{{ Math.round(currentArtist.buyChanceBonus * 100) }}%</span>
              </div>
              <div class="ca-progress">
                <div class="ca-progress-bar">
                  <div class="ca-progress-fill" :style="{ width: ((residency.totalDays - residency.daysRemaining) / residency.totalDays * 100) + '%' }"></div>
                </div>
                <div class="ca-progress-text">
                  第{{ residency.totalDays - residency.daysRemaining + 1 }}/{{ residency.totalDays }}天
                  · 吸引{{ residency.customersAttracted }}位顾客
                  · 售出{{ residency.limitedSold }}件限定
                </div>
              </div>
              <button class="btn-end" @click="handleEndResidency">结束驻店</button>
            </div>

            <div v-for="artist in availableArtists" :key="artist.id" class="artist-card card" :style="{ borderLeftColor: getRarityColor(artist.rarity) }">
              <div class="ac-header">
                <span class="ac-avatar">{{ artist.avatar }}</span>
                <div class="ac-info">
                  <div class="ac-name">
                    {{ artist.name }}
                    <span class="rarity-badge" :style="{ color: getRarityColor(artist.rarity), borderColor: getRarityColor(artist.rarity) }">
                      {{ getRarityLabel(artist.rarity) }}
                    </span>
                  </div>
                  <div class="ac-title">{{ artist.title }}</div>
                </div>
              </div>
              <p class="ac-desc">{{ artist.description }}</p>
              <div class="ac-meta">
                <span>{{ getEventTypeLabel(artist.performanceType) }}</span>
                <span>驻店{{ artist.residencyDays }}天</span>
                <span>¥{{ artist.costPerDay }}/日</span>
              </div>
              <div class="ac-genres">
                <span class="genre-tag">{{ artist.genre }}</span>
                <span v-for="g in artist.subGenres" :key="g" class="genre-tag sub">{{ g }}</span>
              </div>
              <div class="ac-stats">
                <span>👥 +{{ Math.round(artist.customerAttractBonus * 100) }}%</span>
                <span>🎭 +{{ artist.atmosphereBonus }}</span>
                <span>😊 +{{ artist.satisfactionBonus }}</span>
              </div>
              <button
                class="btn-invite"
                :style="{ background: getRarityColor(artist.rarity) }"
                :disabled="isActive || gameStore.budget < artist.costPerDay * artist.residencyDays"
                @click="handleInviteArtist(artist)"
              >
                邀请驻店 (¥{{ artist.costPerDay * artist.residencyDays }})
              </button>
            </div>

            <div v-for="artist in lp.artists.filter((a: LocalPerfArtist) => !a.isUnlocked)" :key="artist.id" class="artist-card card locked">
              <div class="ac-header">
                <span class="ac-avatar">🔒</span>
                <div class="ac-info">
                  <div class="ac-name">???</div>
                  <div class="ac-title">需声望{{ artist.minReputation }} · 等级{{ artist.minLevel }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'events'">
          <div class="events-section">
            <div v-if="!isActive" class="empty-state card">
              <div class="empty-icon">🎵</div>
              <div>需要先邀请艺人驻店才能举办试听活动</div>
            </div>
            <template v-else>
              <div v-if="lp.activeEvent" class="active-event card">
                <div class="ae-header">
                  <span class="ae-icon">{{ lp.activeEvent.eventConfig.icon }}</span>
                  <div class="ae-info">
                    <div class="ae-name">{{ lp.activeEvent.eventConfig.name }}</div>
                    <div class="ae-type" :style="{ color: getEventTypeInfo(lp.activeEvent.eventConfig.type).color }">
                      {{ getEventTypeLabel(lp.activeEvent.eventConfig.type) }}
                    </div>
                  </div>
                  <div class="ae-days">剩余{{ lp.activeEvent.daysRemaining }}天</div>
                </div>
                <p class="ae-desc">{{ lp.activeEvent.eventConfig.description }}</p>
                <div class="ae-bonuses">
                  <span>👥 +{{ Math.round(lp.activeEvent.eventConfig.customerAttractModifier * 100) }}%</span>
                  <span>😊 +{{ lp.activeEvent.eventConfig.satisfactionBonus }}</span>
                  <span>🎯 +{{ Math.round(lp.activeEvent.eventConfig.buyChanceBonus * 100) }}%</span>
                  <span>🎵 +{{ lp.activeEvent.eventConfig.playBoostBonus }}</span>
                </div>
                <div class="ae-stats">
                  <span>已吸引{{ lp.activeEvent.customersAttracted }}位</span>
                  <span>售出{{ lp.activeEvent.recordsSold }}张</span>
                </div>
              </div>

              <div v-if="!lp.activeEvent" class="event-tip">
                <span>💡 当前无活动进行中，选择下方活动举办</span>
              </div>

              <div
                v-for="event in availableEvents"
                :key="event.id"
                class="event-card card"
                :style="{ borderLeftColor: getEventTypeInfo(event.type).color }"
              >
                <div class="ec-header">
                  <span class="ec-icon">{{ event.icon }}</span>
                  <div class="ec-info">
                    <div class="ec-name">{{ event.name }}</div>
                    <div class="ec-type" :style="{ color: getEventTypeInfo(event.type).color }">
                      {{ getEventTypeLabel(event.type) }}
                    </div>
                  </div>
                </div>
                <p class="ec-desc">{{ event.description }}</p>
                <div class="ec-meta">
                  <span>{{ event.genreFocus }}</span>
                  <span>{{ event.durationDays }}天</span>
                  <span>¥{{ event.cost }}</span>
                </div>
                <div class="ec-bonuses">
                  <span>👥 +{{ Math.round(event.customerAttractModifier * 100) }}%</span>
                  <span>😊 +{{ event.satisfactionBonus }}</span>
                  <span>⭐ +{{ event.reputationBonus }}声望</span>
                </div>
                <button
                  class="btn-event"
                  :disabled="!!lp.activeEvent || gameStore.budget < event.cost"
                  @click="handleStartEvent(event)"
                >
                  举办 (¥{{ event.cost }})
                </button>
              </div>

              <div v-for="event in lp.listeningEvents.filter((e: LocalPerfListeningEvent) => !e.isUnlocked)" :key="event.id" class="event-card card locked">
                <div class="ec-header">
                  <span class="ec-icon">🔒</span>
                  <div class="ec-info">
                    <div class="ec-name">???</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'limited'">
          <div class="limited-section">
            <div v-if="!isActive" class="empty-state card">
              <div class="empty-icon">💿</div>
              <div>需要先邀请艺人驻店才能购买限定商品</div>
            </div>
            <template v-else>
              <div v-for="item in lp.limitedItems" :key="item.id" class="limited-card card">
                <div class="lc-rarity" :style="{ background: getRarityColor(item.rarity) }">
                  {{ getRarityLabel(item.rarity) }}
                </div>
                <div class="lc-info">
                  <div class="lc-title">{{ item.recordTitle }}</div>
                  <div class="lc-artist">{{ item.recordArtist }}</div>
                  <div class="lc-meta">
                    <span class="genre-tag">{{ item.genre }}</span>
                    <span class="lc-stock" :style="{ color: getStockStatusColor(item.remainingStock, item.limitedStock) }">
                      剩余 {{ item.remainingStock }}/{{ item.limitedStock }}
                    </span>
                  </div>
                  <div class="lc-bonus">{{ item.bonusDescription }}</div>
                </div>
                <div class="lc-price">
                  <span class="lc-original">¥{{ item.originalPrice }}</span>
                  <span class="lc-collab" :style="{ color: currentArtist ? getRarityColor(currentArtist.rarity) : 'var(--accent-gold)' }">¥{{ item.collabPrice }}</span>
                </div>
                <button
                  v-if="item.remainingStock > 0 && item.status !== 'sold_out'"
                  class="btn-buy"
                  :disabled="gameStore.budget < item.collabPrice"
                  :style="{ background: currentArtist ? getRarityColor(currentArtist.rarity) : 'var(--accent-gold)' }"
                  @click="handleBuyLimited(item.id)"
                >
                  购入
                </button>
                <span v-else class="sold-out">售罄</span>
              </div>

              <div v-if="lp.limitedItems.length === 0" class="empty-state card">
                <div class="empty-icon">💿</div>
                <div>暂无限定商品</div>
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'tasks'">
          <div class="tasks-section">
            <div v-if="!isActive" class="empty-state card">
              <div class="empty-icon">🎯</div>
              <div>需要先邀请艺人驻店才能查看任务</div>
            </div>
            <template v-else>
              <div
                v-for="task in lp.tasks"
                :key="task.id"
                class="task-card card"
                :class="{ locked: task.status === 'locked', completed: task.status === 'completed' || task.status === 'claimed' }"
                :style="{ borderLeftColor: getTaskStatusColor(task.status) }"
              >
                <div class="task-icon">{{ task.icon }}</div>
                <div class="task-info">
                  <div class="task-name">{{ task.name }}</div>
                  <div class="task-desc">{{ task.description }}</div>
                  <div class="task-progress-bar">
                    <div class="task-progress-fill" :style="{ width: getTaskProgressPercent(task) + '%', background: getTaskStatusColor(task.status) }"></div>
                  </div>
                  <div class="task-progress-text">
                    <span :style="{ color: getTaskStatusColor(task.status) }">{{ getTaskStatusLabel(task.status) }}</span>
                    <span>{{ task.current }} / {{ task.target }}</span>
                  </div>
                  <div class="task-reward">
                    奖励: 💰¥{{ task.reward.budget }} ⭐+{{ task.reward.reputation }} 📈+{{ task.reward.growthPoints }}
                    <span v-if="task.reward.bonusItems.length > 0">🎁 {{ task.reward.bonusItems.join(', ') }}</span>
                  </div>
                </div>
                <button
                  v-if="task.status === 'completed'"
                  class="btn-claim"
                  @click="handleClaimTaskReward(task.id)"
                >
                  领取
                </button>
                <div v-if="task.status === 'locked'" class="lock-icon">🔒</div>
                <div v-if="task.status === 'claimed'" class="claimed-icon">✓</div>
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'rewards'">
          <div class="rewards-section">
            <div v-if="isActive" class="current-reward">
              <h3 class="section-title">🏆 当前预计声望奖励</h3>
              <div class="reward-tier-display" :style="{ borderColor: getRarityColor(rewardTier.tier === 'platinum' ? 'legendary' : rewardTier.tier === 'gold' ? 'epic' : rewardTier.tier === 'silver' ? 'rare' : 'common') }">
                <div class="tier-icon">{{ rewardTier.icon }}</div>
                <div class="tier-name" :style="{ color: getRarityColor(rewardTier.tier === 'platinum' ? 'legendary' : rewardTier.tier === 'gold' ? 'epic' : rewardTier.tier === 'silver' ? 'rare' : 'common') }">{{ rewardTier.tierName }}</div>
                <div class="tier-desc">{{ rewardTier.description }}</div>
                <div class="tier-rewards">
                  <span>💰 ¥{{ rewardTier.rewards.budget }}</span>
                  <span>⭐ +{{ rewardTier.rewards.reputation }}</span>
                  <span>📈 +{{ rewardTier.rewards.growthPoints }}</span>
                  <span v-if="rewardTier.rewards.bonusItems.length > 0">🎁 {{ rewardTier.rewards.bonusItems.join(', ') }}</span>
                </div>
              </div>
              <div class="score-progress">
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: Math.min(100, score / 7) + '%' }"></div>
                  <div
                    v-for="tier in localPerfReputationTiers"
                    :key="tier.tier"
                    class="tier-marker"
                    :style="{ left: (tier.minScore / 7) + '%' }"
                  >
                    {{ tier.icon }}
                  </div>
                </div>
                <div class="score-label">合作积分: {{ score }}</div>
              </div>
              <div class="reward-stats">
                <div class="stat-item">
                  <span class="stat-label">客流吸引</span>
                  <span class="stat-value">{{ lp.totalCustomersAttracted }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">限定售出</span>
                  <span class="stat-value">{{ lp.totalLimitedSold }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">任务完成</span>
                  <span class="stat-value">{{ lp.tasksCompleted }} / {{ lp.tasks.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">活动举办</span>
                  <span class="stat-value">{{ lp.eventHeldCount }}</span>
                </div>
              </div>
              <div class="reward-actions">
                <button v-if="lp.hasUnclaimedRewards" class="btn-primary" @click="handleClaimReward">
                  🎁 领取声望奖励
                </button>
              </div>
            </div>

            <div v-if="lp.settlements.length > 0" class="settlement-history">
              <h3 class="section-title">📊 历史结算</h3>
              <div
                v-for="(s, idx) in lp.settlements"
                :key="idx"
                class="settlement-card card"
              >
                <div class="settlement-header">
                  <span>{{ s.artistName }}</span>
                  <span class="settlement-score">{{ s.totalScore }}分 · {{ s.rewardTier.tierName }}</span>
                </div>
                <div class="settlement-details">
                  <span>驻店{{ s.daysPerformed }}天</span>
                  <span>顾客{{ s.customersAttracted }}</span>
                  <span>限定{{ s.limitedSold }}件</span>
                  <span>任务{{ s.tasksCompleted }}/{{ s.totalTasks }}</span>
                </div>
              </div>
            </div>

            <div v-if="!isActive && lp.settlements.length === 0" class="empty-state card">
              <div class="empty-icon">🏆</div>
              <div>暂无声望奖励记录，邀请艺人驻店开始合作吧！</div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="showToast" class="toast">{{ toastMessage }}</div>

      <div v-if="showInviteModal && selectedArtist" class="modal-overlay" @click.self="showInviteModal = false">
        <div class="modal-content">
          <h3 class="modal-title">{{ selectedArtist.avatar }} 邀请{{ selectedArtist.name }}驻店？</h3>
          <p class="modal-desc">
            {{ selectedArtist.description }}<br>
            驻店{{ selectedArtist.residencyDays }}天，费用 ¥{{ selectedArtist.costPerDay * selectedArtist.residencyDays }}
            （¥{{ selectedArtist.costPerDay }}/日）<br>
            加成：客流+{{ Math.round(selectedArtist.customerAttractBonus * 100) }}% · 氛围+{{ selectedArtist.atmosphereBonus }} · 满意度+{{ selectedArtist.satisfactionBonus }}
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showInviteModal = false">取消</button>
            <button
              class="btn-primary"
              :style="{ background: getRarityColor(selectedArtist.rarity) }"
              @click="confirmInviteArtist"
            >
              确认邀请
            </button>
          </div>
        </div>
      </div>

      <div v-if="showEventModal && selectedEvent" class="modal-overlay" @click.self="showEventModal = false">
        <div class="modal-content">
          <h3 class="modal-title">{{ selectedEvent.icon }} 举办{{ selectedEvent.name }}？</h3>
          <p class="modal-desc">
            {{ selectedEvent.description }}<br>
            持续{{ selectedEvent.durationDays }}天，费用 ¥{{ selectedEvent.cost }}<br>
            加成：客流+{{ Math.round(selectedEvent.customerAttractModifier * 100) }}% · 试听+{{ selectedEvent.playBoostBonus }} · 声望+{{ selectedEvent.reputationBonus }}
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showEventModal = false">取消</button>
            <button
              class="btn-primary"
              @click="confirmStartEvent"
            >
              确认举办
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lp-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  z-index: 200;
  overflow-y: auto;
}

.lp-container {
  padding: 16px;
  padding-bottom: 80px;
}

.lp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lp-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.lp-day-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.score-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--bg-primary);
}

.bonus-banner {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
  margin-bottom: 12px;
}

.bb-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.bb-icon {
  font-size: 14px;
}

.bb-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
}

.bb-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bb-bonus {
  padding: 3px 8px;
  background: rgba(72, 187, 120, 0.12);
  color: #68d391;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-btn.active {
  background: var(--accent-gold);
  color: white;
}

.tab-content {
  min-height: 400px;
}

.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--border);
}

.artists-section,
.events-section,
.limited-section,
.tasks-section,
.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-artist {
  border: 2px solid var(--accent-gold);
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(243, 156, 18, 0.08) 100%);
}

.ca-header,
.ac-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.ca-avatar,
.ac-avatar {
  font-size: 36px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
  flex-shrink: 0;
}

.ca-info,
.ac-info {
  flex: 1;
}

.ca-name,
.ac-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ca-title,
.ac-title {
  font-size: 11px;
  color: var(--accent-gold);
}

.rarity-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
}

.ca-desc,
.ac-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.ca-stats,
.ac-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 10px;
  color: var(--text-muted);
}

.ca-progress {
  margin-bottom: 8px;
}

.ca-progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.ca-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), #ffd700);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.ca-progress-text {
  font-size: 10px;
  color: var(--text-muted);
}

.btn-end {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 12px;
}

.artist-card {
  border-left: 4px solid;
}

.artist-card.locked {
  opacity: 0.5;
}

.ac-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.ac-genres {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.genre-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 10px;
  color: var(--text-secondary);
}

.genre-tag.sub {
  opacity: 0.7;
}

.btn-invite {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.btn-invite:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-event {
  border: 2px solid var(--success);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(56, 178, 172, 0.08) 100%);
}

.ae-header,
.ec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ae-icon,
.ec-icon {
  font-size: 28px;
}

.ae-info,
.ec-info {
  flex: 1;
}

.ae-name,
.ec-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.ae-type,
.ec-type {
  font-size: 11px;
  font-weight: 600;
}

.ae-days {
  font-size: 11px;
  color: var(--accent-gold);
  font-weight: 600;
}

.ae-desc,
.ec-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.ae-bonuses,
.ec-bonuses {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--success);
  font-weight: 600;
  margin-bottom: 6px;
}

.ae-stats {
  font-size: 10px;
  color: var(--text-muted);
  display: flex;
  gap: 12px;
}

.event-tip {
  padding: 10px;
  background: rgba(246, 224, 94, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: var(--accent-gold);
  text-align: center;
  border: 1px solid rgba(246, 224, 94, 0.2);
}

.event-card {
  border-left: 4px solid;
}

.event-card.locked {
  opacity: 0.5;
}

.ec-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.btn-event {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  background: var(--accent-gold);
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.btn-event:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.limited-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lc-rarity {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lc-info {
  flex: 1;
}

.lc-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.lc-artist {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.lc-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.lc-stock {
  font-size: 10px;
}

.lc-bonus {
  font-size: 10px;
  color: var(--text-muted);
}

.lc-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 60px;
}

.lc-original {
  font-size: 10px;
  color: var(--text-muted);
  text-decoration: line-through;
}

.lc-collab {
  font-size: 14px;
  font-weight: 700;
}

.btn-buy {
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.btn-buy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sold-out {
  padding: 8px 12px;
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.task-card {
  border-left: 4px solid;
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-card.locked {
  opacity: 0.5;
}

.task-card.completed {
  background: rgba(72, 187, 120, 0.05);
}

.task-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.task-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.task-progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  margin-bottom: 4px;
  overflow: hidden;
}

.task-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.task-progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  margin-bottom: 4px;
}

.task-reward {
  font-size: 10px;
  color: var(--text-muted);
}

.btn-claim {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--accent-gold);
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.lock-icon {
  font-size: 20px;
  color: var(--text-muted);
}

.claimed-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #48bb78;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.reward-tier-display {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid;
  text-align: center;
  margin-bottom: 16px;
}

.tier-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.tier-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.tier-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.tier-rewards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
}

.score-progress {
  margin-bottom: 16px;
}

.score-bar {
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  position: relative;
  margin-bottom: 8px;
  overflow: visible;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), #ffd700);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.tier-marker {
  position: absolute;
  top: -2px;
  transform: translateX(-50%);
  font-size: 14px;
}

.score-label {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

.reward-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.reward-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: var(--accent-gold);
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.btn-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 13px;
}

.settlement-history {
  margin-top: 16px;
}

.settlement-card {
  margin-bottom: 8px;
}

.settlement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.settlement-header span:first-child {
  font-weight: 600;
  color: var(--text-primary);
}

.settlement-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-gold);
}

.settlement-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  z-index: 300;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  width: 100%;
  border: 1px solid var(--border);
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-align: center;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
}
</style>
