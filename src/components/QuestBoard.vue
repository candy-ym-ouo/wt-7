<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { Quest, QuestRarity, QuestType } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const activeTab = ref<'available' | 'active' | 'completed' | 'history'>('available')
const selectedQuest = ref<Quest | null>(null)
const showDetailModal = ref(false)

const questBoard = computed(() => gameStore.questBoard)
const currentDay = computed(() => gameStore.currentDay)

const availableQuests = computed(() => questBoard.value.availableQuests)
const activeQuests = computed(() => questBoard.value.activeQuests)
const completedQuests = computed(() => [
  ...questBoard.value.completedQuests,
  ...questBoard.value.activeQuests.filter(q => q.status === 'completed')
])
const historyQuests = computed(() => [
  ...questBoard.value.claimedQuests,
  ...questBoard.value.failedQuests
])

const totalCompleted = computed(() => questBoard.value.totalQuestsCompleted)
const totalRewards = computed(() => questBoard.value.totalRewardsEarned)
const activeCount = computed(() => questBoard.value.activeQuests.filter(q => q.status !== 'completed').length)
const claimableCount = computed(() => gameStore.getClaimableQuestCount)

const getRarityColor = (rarity: QuestRarity) => gameStore.getQuestRarityColor(rarity)
const getRarityLabel = (rarity: QuestRarity) => gameStore.getQuestRarityLabel(rarity)
const getTypeLabel = (type: QuestType) => gameStore.getQuestTypeLabel(type)
const getProgress = (quest: Quest) => Math.round(gameStore.getOverallProgress(quest) * 100)
const getDeadlineText = (quest: Quest) => gameStore.formatDeadlineText(quest, currentDay.value)
const getDaysLeft = (quest: Quest) => gameStore.getDaysRemaining(quest, currentDay.value)

const handleAccept = (questId: string) => {
  gameStore.acceptQuestAction(questId)
}

const handleClaim = (questId: string) => {
  gameStore.claimQuestRewardAction(questId)
}

const openDetail = (quest: Quest) => {
  selectedQuest.value = quest
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedQuest.value = null
}

const getStatusBadge = (quest: Quest) => {
  switch (quest.status) {
    case 'available': return { text: '可领取', color: '#4299e1', bg: 'rgba(66, 153, 225, 0.15)' }
    case 'active': return { text: '进行中', color: '#48bb78', bg: 'rgba(72, 187, 120, 0.15)' }
    case 'completed': return { text: '待领奖', color: '#ed8936', bg: 'rgba(237, 137, 54, 0.15)' }
    case 'claimed': return { text: '已完成', color: '#718096', bg: 'rgba(113, 128, 150, 0.15)' }
    case 'expired':
    case 'failed': return { text: '已失败', color: '#f56565', bg: 'rgba(245, 101, 101, 0.15)' }
    default: return { text: quest.status, color: '#718096', bg: 'rgba(113, 128, 150, 0.15)' }
  }
}

const tabs = [
  { key: 'available', label: '委托大厅', icon: '📋', count: availableQuests.value.length },
  { key: 'active', label: '进行中', icon: '⚡', count: activeCount.value },
  { key: 'completed', label: '待领奖', icon: '🎁', count: claimableCount.value },
  { key: 'history', label: '历史记录', icon: '📜', count: historyQuests.value.length }
]

const getTabItems = (tab: string) => {
  switch (tab) {
    case 'available': return availableQuests.value
    case 'active': return activeQuests.value
    case 'completed': return completedQuests.value
    case 'history': return historyQuests.value
    default: return []
  }
}

const canAccept = () => activeCount.value < gameStore.maxActiveQuests
</script>

<template>
  <div class="quest-overlay">
    <div class="quest-container">
      <div class="quest-header">
        <button class="close-btn" @click="emit('close')">✕</button>
        <h2 class="quest-title">📮 店铺委托任务</h2>
        <div class="quest-stats">
          <span class="stat-badge">🏆 完成 {{ totalCompleted }}</span>
          <span class="stat-badge reward">💰 ¥{{ totalRewards.budget.toLocaleString() }}</span>
        </div>
      </div>

      <div class="stats-banner">
        <div class="stat-card">
          <span class="stat-icon">⚡</span>
          <div class="stat-info">
            <span class="stat-value">{{ activeCount }}/{{ gameStore.maxActiveQuests }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎁</span>
          <div class="stat-info">
            <span class="stat-value">{{ claimableCount }}</span>
            <span class="stat-label">待领奖</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <div class="stat-info">
            <span class="stat-value">+{{ totalRewards.reputation }}</span>
            <span class="stat-label">累计声望</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📈</span>
          <div class="stat-info">
            <span class="stat-value">{{ totalCompleted }}</span>
            <span class="stat-label">总完成</span>
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

      <div class="quest-list">
        <div v-if="getTabItems(activeTab).length === 0" class="empty-state">
          <div class="empty-icon">
            {{ activeTab === 'available' ? '📭' : activeTab === 'active' ? '💤' : activeTab === 'completed' ? '✨' : '📖' }}
          </div>
          <p class="empty-text">
            {{ activeTab === 'available' ? '暂无可领取的委托' : 
               activeTab === 'active' ? '还没有进行中的任务' :
               activeTab === 'completed' ? '没有待领取的奖励' :
               '暂无历史记录' }}
          </p>
          <p v-if="activeTab === 'available'" class="empty-hint">明天会刷新新的委托任务哦~</p>
        </div>

        <div
          v-for="quest in getTabItems(activeTab)"
          :key="quest.config.id"
          class="quest-card"
          :class="{ 
            completed: quest.status === 'completed' || quest.status === 'claimed',
            failed: quest.status === 'expired' || quest.status === 'failed',
            urgent: (quest.status === 'active' && getDaysLeft(quest) <= 1)
          }"
          :style="{ borderLeftColor: getRarityColor(quest.config.rarity) }"
          @click="openDetail(quest)"
        >
          <div class="quest-card-header">
            <div class="quest-client">
              <span class="client-avatar">{{ quest.config.clientAvatar }}</span>
              <div class="client-info">
                <span class="client-name">{{ quest.config.clientName }}</span>
                <span class="quest-type-tag" :style="{ color: getRarityColor(quest.config.rarity) }">
                  {{ quest.config.icon }} {{ getTypeLabel(quest.config.type) }}
                </span>
              </div>
            </div>
            <div class="quest-badges">
              <span 
                class="rarity-badge"
                :style="{ color: getRarityColor(quest.config.rarity), background: getRarityColor(quest.config.rarity) + '20' }"
              >
                {{ getRarityLabel(quest.config.rarity) }}
              </span>
              <span 
                class="status-badge"
                :style="{ color: getStatusBadge(quest).color, background: getStatusBadge(quest).bg }"
              >
                {{ getStatusBadge(quest).text }}
              </span>
            </div>
          </div>

          <div class="quest-card-body">
            <h3 class="quest-title">{{ quest.config.icon }} {{ quest.config.title }}</h3>
            <p class="quest-desc">{{ quest.config.description }}</p>

            <div class="quest-progress-section">
              <div v-if="quest.status === 'active' || quest.status === 'completed' || quest.status === 'claimed'" class="progress-bar-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ 
                      width: getProgress(quest) + '%',
                      background: `linear-gradient(90deg, ${getRarityColor(quest.config.rarity)} 0%, ${getRarityColor(quest.config.rarity)}cc 100%)`
                    }"
                  ></div>
                </div>
                <span class="progress-text">{{ getProgress(quest) }}%</span>
              </div>

              <div class="requirements-preview">
                <div 
                  v-for="(req, idx) in quest.progress.slice(0, 2)" 
                  :key="idx"
                  class="req-item"
                >
                  <span class="req-icon">
                    {{ req.current >= req.target ? '✅' : '⭕' }}
                  </span>
                  <span class="req-text">{{ req.description }}</span>
                  <span 
                    class="req-count"
                    :class="{ done: req.current >= req.target }"
                  >
                    {{ Math.min(req.current, req.target) }}/{{ req.target }}
                  </span>
                </div>
                <span v-if="quest.progress.length > 2" class="more-req">
                  +{{ quest.progress.length - 2 }}项条件
                </span>
              </div>
            </div>

            <div class="quest-meta">
              <div class="reward-preview">
                <span class="reward-icon">🎁</span>
                <span class="reward-text">{{ quest.config.reward.description }}</span>
              </div>
              <div 
                v-if="quest.status !== 'claimed' && quest.status !== 'expired' && quest.status !== 'failed'"
                class="deadline-info"
                :class="{ urgent: quest.status === 'active' && getDaysLeft(quest) <= 1 }"
              >
                {{ getDeadlineText(quest) }}
              </div>
            </div>
          </div>

          <div class="quest-card-actions" @click.stop>
            <button
              v-if="quest.status === 'available'"
              class="btn-accept"
              :class="{ disabled: !canAccept() }"
              :disabled="!canAccept()"
              @click="handleAccept(quest.config.id)"
            >
              {{ canAccept() ? '📥 领取委托' : `已达上限(${gameStore.maxActiveQuests})` }}
            </button>
            <button
              v-else-if="quest.status === 'completed'"
              class="btn-claim"
              @click="handleClaim(quest.config.id)"
            >
              🎁 领取奖励
            </button>
            <button
              v-else-if="quest.status === 'active'"
              class="btn-view"
              @click="openDetail(quest)"
            >
              📊 查看进度
            </button>
            <button
              v-else
              class="btn-view"
              @click="openDetail(quest)"
            >
              📖 查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showDetailModal && selectedQuest" 
        class="modal-overlay"
        @click.self="closeDetail"
      >
        <div class="modal-content detail-modal animate-slide-up">
          <div class="modal-header" :style="{ borderBottomColor: getRarityColor(selectedQuest.config.rarity) }">
            <div class="modal-title-wrap">
              <span class="detail-icon">{{ selectedQuest.config.icon }}</span>
              <div>
                <h3 class="modal-title">{{ selectedQuest.config.title }}</h3>
                <div class="modal-subtitle">
                  <span class="client-tag">{{ selectedQuest.config.clientAvatar }} {{ selectedQuest.config.clientName }}</span>
                  <span 
                    class="rarity-tag"
                    :style="{ color: getRarityColor(selectedQuest.config.rarity), background: getRarityColor(selectedQuest.config.rarity) + '20' }"
                  >
                    {{ getRarityLabel(selectedQuest.config.rarity) }}
                  </span>
                </div>
              </div>
            </div>
            <button class="close-btn" @click="closeDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="detail-section">
              <p class="detail-desc">{{ selectedQuest.config.description }}</p>
            </div>

            <div class="detail-section">
              <h4 class="section-title">📋 任务条件</h4>
              <div class="req-list">
                <div 
                  v-for="(req, idx) in selectedQuest.progress" 
                  :key="idx"
                  class="req-detail-item"
                  :class="{ done: req.current >= req.target }"
                >
                  <div class="req-detail-header">
                    <span class="req-check">{{ req.current >= req.target ? '✅' : '⭕' }}</span>
                    <span class="req-desc">{{ req.description }}</span>
                  </div>
                  <div class="req-progress-wrap">
                    <div class="req-progress-bar">
                      <div 
                        class="req-progress-fill"
                        :style="{ 
                          width: Math.min(100, (req.current / Math.max(1, req.target)) * 100) + '%',
                          background: req.current >= req.target ? '#48bb78' : getRarityColor(selectedQuest.config.rarity)
                        }"
                      ></div>
                    </div>
                    <span class="req-progress-text">
                      {{ Math.min(req.current, req.target).toLocaleString() }} / {{ req.target.toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="section-title">🎁 任务奖励</h4>
              <div class="reward-detail-card">
                <div class="reward-row">
                  <span class="reward-label">💰 现金奖励</span>
                  <span class="reward-value">¥{{ selectedQuest.config.reward.budget.toLocaleString() }}</span>
                </div>
                <div class="reward-row">
                  <span class="reward-label">⭐ 声望奖励</span>
                  <span class="reward-value">+{{ selectedQuest.config.reward.reputation }}</span>
                </div>
                <div v-if="selectedQuest.config.reward.growthPoints" class="reward-row">
                  <span class="reward-label">📈 成长值</span>
                  <span class="reward-value">+{{ selectedQuest.config.reward.growthPoints }}</span>
                </div>
                <p class="reward-desc">{{ selectedQuest.config.reward.description }}</p>
              </div>
            </div>

            <div v-if="selectedQuest.config.durationDays > 0" class="detail-section">
              <h4 class="section-title">⏰ 时间限制</h4>
              <div class="time-info">
                <div class="time-row">
                  <span>任务周期</span>
                  <span>{{ selectedQuest.config.durationDays }} 天</span>
                </div>
                <div v-if="selectedQuest.acceptedDay" class="time-row">
                  <span>领取日期</span>
                  <span>第 {{ selectedQuest.acceptedDay }} 天</span>
                </div>
                <div v-if="selectedQuest.deadlineDay" class="time-row urgent-row" :class="{ urgent: getDaysLeft(selectedQuest) <= 1 }">
                  <span>截止日期</span>
                  <span>第 {{ selectedQuest.deadlineDay }} 天 {{ getDeadlineText(selectedQuest) }}</span>
                </div>
                <div v-if="selectedQuest.completedDay" class="time-row completed-row">
                  <span>完成日期</span>
                  <span>第 {{ selectedQuest.completedDay }} 天</span>
                </div>
              </div>
            </div>

            <div v-if="selectedQuest.notifications.length > 0" class="detail-section">
              <h4 class="section-title">📝 任务日志</h4>
              <div class="notification-list">
                <div 
                  v-for="(notif, idx) in selectedQuest.notifications.slice(-5).reverse()" 
                  :key="idx"
                  class="notification-item"
                  :class="notif.type"
                >
                  <span class="notif-text">{{ notif.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              v-if="selectedQuest.status === 'available'"
              class="btn-primary btn-full"
              :class="{ disabled: !canAccept() }"
              :disabled="!canAccept()"
              @click="handleAccept(selectedQuest.config.id); closeDetail()"
            >
              {{ canAccept() ? '📥 领取委托' : '同时进行的任务已达上限' }}
            </button>
            <button
              v-else-if="selectedQuest.status === 'completed'"
              class="btn-primary btn-full claim-btn"
              @click="handleClaim(selectedQuest.config.id); closeDetail()"
            >
              🎁 立即领取奖励
            </button>
            <button v-else class="btn-secondary btn-full" @click="closeDetail">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.quest-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
}

.quest-container {
  width: 100%;
  max-width: 520px;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 16px;
  padding-bottom: 100px;
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 16px;
  flex-shrink: 0;
}

.quest-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.quest-stats {
  display: flex;
  gap: 6px;
}

.stat-badge {
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stat-badge.reward {
  color: var(--accent-orange);
  background: rgba(237, 137, 54, 0.12);
}

.stats-banner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
}

.stat-icon {
  font-size: 18px;
  display: block;
  margin-bottom: 4px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 9px;
  color: var(--text-muted);
}

.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 10px;
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
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s;
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
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  background: var(--accent-orange);
  color: white;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.quest-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 4px solid;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.quest-card.urgent {
  animation: urgentPulse 2s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(245, 101, 101, 0); }
}

.quest-card.completed {
  opacity: 0.85;
}

.quest-card.failed {
  opacity: 0.7;
}

.quest-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 14px 8px;
}

.quest-client {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.client-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.quest-type-tag {
  font-size: 10px;
  font-weight: 600;
}

.quest-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.rarity-badge, .status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.quest-card-body {
  padding: 0 14px 12px;
}

.quest-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.quest-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.quest-progress-section {
  margin-bottom: 12px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.requirements-preview {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.req-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.req-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.req-text {
  flex: 1;
  color: var(--text-secondary);
}

.req-count {
  font-weight: 600;
  color: var(--text-muted);
}

.req-count.done {
  color: var(--success);
}

.more-req {
  padding-left: 20px;
  color: var(--text-muted);
  font-size: 10px;
  font-style: italic;
}

.quest-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.reward-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--accent-orange);
}

.reward-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deadline-info {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
}

.deadline-info.urgent {
  color: var(--danger);
}

.quest-card-actions {
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}

.btn-accept, .btn-claim, .btn-view {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-accept {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: white;
}

.btn-accept.disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.btn-claim {
  background: linear-gradient(135deg, #48bb78, #38b2ac);
  color: white;
  animation: claimPulse 1.5s ease-in-out infinite;
}

@keyframes claimPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); }
}

.btn-view {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.detail-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.detail-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.modal-subtitle {
  display: flex;
  gap: 8px;
  align-items: center;
}

.client-tag {
  font-size: 12px;
  color: var(--text-secondary);
}

.rarity-tag {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.req-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.req-detail-item {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border);
}

.req-detail-item.done {
  border-color: var(--success);
  background: rgba(72, 187, 120, 0.08);
}

.req-detail-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.req-check {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

.req-desc {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.5;
}

.req-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 22px;
}

.req-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.req-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.req-progress-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 60px;
  text-align: right;
}

.reward-detail-card {
  background: linear-gradient(135deg, rgba(237, 137, 54, 0.1) 0%, rgba(246, 224, 94, 0.1) 100%);
  border: 1px solid rgba(237, 137, 54, 0.25);
  border-radius: 8px;
  padding: 12px;
}

.reward-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.reward-row:not(:last-child) {
  border-bottom: 1px dashed rgba(237, 137, 54, 0.2);
}

.reward-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.reward-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-orange);
}

.reward-desc {
  margin: 10px 0 0 0;
  padding-top: 10px;
  border-top: 1px dashed rgba(237, 137, 54, 0.2);
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}

.time-row:last-child {
  border-bottom: none;
}

.time-row.urgent-row {
  color: var(--danger);
  font-weight: 600;
}

.time-row.completed-row {
  color: var(--success);
  font-weight: 600;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.notification-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
}

.notification-item.info {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
}

.notification-item.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.notification-item.warning {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.btn-full {
  width: 100%;
}

.claim-btn {
  background: linear-gradient(135deg, #48bb78, #38b2ac) !important;
}

.btn-secondary {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}

.btn-full.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
