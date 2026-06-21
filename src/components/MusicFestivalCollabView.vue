<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { MusicFestivalCollabTheme, MusicFestivalCollabTask } from '@/types'
import {
  collabThemes,
  getRewardTierColor,
  collabRewardTiers,
  getThemeName
} from '@/data/musicFestivalCollab'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'records' | 'customers' | 'tasks' | 'rewards' | 'badges'>('records')
const toastMessage = ref('')
const showToast = ref(false)
const showStartModal = ref(false)
const selectedTheme = ref<MusicFestivalCollabTheme | null>(null)

const collab = computed(() => gameStore.musicFestivalCollab)
const isCollabActive = computed(() => collab.value.isCollabActive)
const themeConfig = computed(() => gameStore.activeCollabTheme)
const score = computed(() => gameStore.collabScore)
const rewardTier = computed(() => gameStore.collabRewardTier)
const availableThemes = computed(() => gameStore.collabAvailableThemes)

const limitedRecords = computed(() => gameStore.collabLimitedRecords)
const collabCustomers = computed(() => gameStore.collabUnlockedCustomers)
const collabTasks = computed(() => collab.value.tasks)
const collabSettlements = computed(() => collab.value.settlements)
const collabBadges = computed(() => gameStore.collabUnlockedBadges)
const canRefresh = computed(() => gameStore.canRefreshCollabCustomers)
const refreshCost = computed(() => gameStore.collabCustomerRefreshCost)

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

const handleStartCollab = (theme: MusicFestivalCollabTheme) => {
  selectedTheme.value = theme
  showStartModal.value = true
}

const confirmStartCollab = () => {
  if (!selectedTheme.value) return
  const result = gameStore.startMusicFestivalCollab(selectedTheme.value.id)
  showNotification(result.message)
  if (result.success) {
    showStartModal.value = false
    selectedTheme.value = null
  }
}

const handlePurchaseRecord = (recordId: string) => {
  const result = gameStore.purchaseLimitedRecord(recordId)
  showNotification(result.message)
}

const handleRefreshCustomers = () => {
  const result = gameStore.refreshCollabCustomers()
  showNotification(result.message)
}

const handleClaimTaskReward = (taskId: string) => {
  const result = gameStore.claimCollabTaskReward(taskId)
  showNotification(result.message)
}

const handleClaimCollabReward = () => {
  const result = gameStore.claimMusicFestivalCollabReward()
  showNotification(result.message)
}

const handleEndCollab = () => {
  gameStore.endMusicFestivalCollab()
  showNotification('联名活动已结束，请领取奖励！')
}

const getTaskProgressPercent = (task: MusicFestivalCollabTask) => {
  if (task.target <= 0) return 0
  return Math.min(100, Math.round((task.current / task.target) * 100))
}

const getStockStatusColor = (remaining: number, limited: number) => {
  if (remaining <= 0) return '#f56565'
  if (remaining <= limited * 0.2) return '#ed8936'
  return '#48bb78'
}

const getStockStatusLabel = (remaining: number) => {
  if (remaining <= 0) return '售罄'
  if (remaining <= 3) return '即将售罄'
  return '有货'
}
</script>

<template>
  <div class="collab-overlay">
    <div class="collab-container">
      <div class="collab-header">
        <button class="close-btn" @click="emit('close')">✕</button>
        <h2 v-if="isCollabActive" class="collab-title" :style="{ color: themeConfig?.accentColor }">
          {{ themeConfig?.icon }} {{ themeConfig?.name }}
        </h2>
        <h2 v-else class="collab-title">🎵 音乐节联名</h2>
        <div v-if="isCollabActive" class="collab-day-info">
          第 {{ collab.collabDay }} / {{ collab.maxCollabDays }} 天
          <span class="score-badge" :style="{ background: rewardTier.icon === '💎' ? '#e5e4e2' : rewardTier.icon === '🥇' ? '#ffd700' : rewardTier.icon === '🥈' ? '#c0c0c0' : '#cd7f32' }">
            {{ rewardTier.icon }} {{ score }}分
          </span>
        </div>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in (isCollabActive
            ? [
              { key: 'records', label: '限定唱片', icon: '💿' },
              { key: 'customers', label: '联动客群', icon: '👥' },
              { key: 'tasks', label: '活动任务', icon: '🎯' },
              { key: 'rewards', label: '奖励结算', icon: '🏆' },
              { key: 'badges', label: '收藏徽章', icon: '🎖️' }
            ]
            : [
              { key: 'records', label: '选择主题', icon: '🎵' },
              { key: 'rewards', label: '历史结算', icon: '🏆' },
              { key: 'badges', label: '收藏徽章', icon: '🎖️' }
            ]
          )"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key as any"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <template v-if="!isCollabActive && activeTab === 'records'">
          <div class="theme-grid">
            <div
              v-for="theme in collabThemes"
              :key="theme.id"
              class="theme-card"
              :class="{ locked: !availableThemes.some(t => t.id === theme.id) }"
              :style="{ borderLeftColor: theme.accentColor }"
            >
              <div class="theme-icon">{{ theme.icon }}</div>
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-desc">{{ theme.description }}</div>
                <div class="theme-genres">
                  <span v-for="g in theme.genreAffinity" :key="g" class="genre-tag">{{ g }}</span>
                </div>
                <div v-if="!availableThemes.some(t => t.id === theme.id)" class="unlock-hint">
                  需要等级 {{ theme.requiredLevel }} | 声望 {{ theme.requiredReputation }}
                </div>
              </div>
              <div class="theme-meta">
                <div class="meta-item">📅 持续 {{ theme.endDay - theme.startDay + 1 }}天</div>
                <div class="meta-item">💴 启动资金 ¥500</div>
              </div>
              <button
                class="btn-start"
                :style="{ background: theme.accentColor }"
                :disabled="!availableThemes.some(t => t.id === theme.id)"
                @click="handleStartCollab(theme)"
              >
                开启联名
              </button>
            </div>
          </div>
        </template>

        <template v-if="isCollabActive && activeTab === 'records'">
          <div class="records-section">
            <div v-for="record in limitedRecords" :key="record.id" class="record-card">
              <div class="record-rarity" :style="{ background: gameStore.getCollabRarityColor(record.rarity) }">
                {{ gameStore.getCollabRarityLabel(record.rarity) }}
              </div>
              <div class="record-info">
                <div class="record-title">{{ record.record.title }}</div>
                <div class="record-artist">{{ record.record.artist }}</div>
                <div class="record-genres">
                  <span class="genre-tag">{{ record.record.genre }}</span>
                </div>
                <div class="record-stock">
                  <span :style="{ color: getStockStatusColor(record.remainingStock, record.limitedStock) }">
                    {{ getStockStatusLabel(record.remainingStock) }}
                  </span>
                  <span class="stock-count">剩余 {{ record.remainingStock }}/{{ record.limitedStock }}</span>
                  <span class="sold-count">已售 {{ record.soldCount }}</span>
                </div>
              </div>
              <div class="record-price">
                <span class="original-price">¥{{ record.record.costPrice * 3 }}</span>
                <span class="collab-price" :style="{ color: themeConfig?.accentColor }">¥{{ record.collabPrice }}</span>
              </div>
              <button
                v-if="record.remainingStock > 0"
                class="btn-buy"
                :disabled="gameStore.budget < record.collabPrice || !record.isUnlocked"
                :style="{ background: themeConfig?.accentColor }"
                @click="handlePurchaseRecord(record.id)"
              >
                {{ record.isUnlocked ? '购入' : '未解锁' }}
              </button>
              <span v-else class="sold-out-label">已售罄</span>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'customers'">
          <div class="customers-section">
            <div v-if="!isCollabActive" class="empty-state">
              <div class="empty-icon">👥</div>
              <div>暂无联名活动，限定顾客不会出现</div>
            </div>
            <template v-else>
              <div class="refresh-section">
                <button
                  class="btn-refresh"
                  :disabled="!canRefresh || gameStore.budget < refreshCost"
                  :style="{ background: themeConfig?.accentColor }"
                  @click="handleRefreshCustomers"
                >
                  🔄 刷新客群 (¥{{ refreshCost }})
                </button>
                <span v-if="!canRefresh" class="cooldown-hint">
                  冷却中，还需 {{ collab.customerRefreshCooldown - (gameStore.currentDay - collab.lastRefreshDay) }} 天
                </span>
              </div>

              <div
                v-for="customer in collabCustomers"
                :key="customer.id"
                class="customer-card"
                :style="{ borderLeftColor: gameStore.getCollabRarityColor(customer.rarity) }"
              >
                <div class="customer-avatar">{{ customer.avatar }}</div>
                <div class="customer-info">
                  <div class="customer-name">
                    {{ customer.name }}
                    <span class="rarity-badge" :style="{ color: gameStore.getCollabRarityColor(customer.rarity), borderColor: gameStore.getCollabRarityColor(customer.rarity) }">
                      {{ gameStore.getCollabRarityLabel(customer.rarity) }}
                    </span>
                  </div>
                  <div class="customer-title">{{ customer.title }}</div>
                  <div class="customer-desc">{{ customer.description }}</div>
                  <div class="customer-stats">
                    <span>💰 预算×{{ customer.budgetMultiplier }}</span>
                    <span>❤️ 满意+{{ customer.satisfactionBonus }}</span>
                    <span>👋 遭遇×{{ customer.encounterCount }}</span>
                  </div>
                  <div class="customer-genres">
                    <span v-for="g in customer.favoriteGenres" :key="g" class="genre-tag">{{ g }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'tasks'">
          <div class="tasks-section">
            <div v-if="!isCollabActive" class="empty-state">
              <div class="empty-icon">🎯</div>
              <div>暂无联名活动，无活动任务</div>
            </div>
            <template v-else>
              <div
                v-for="task in collabTasks"
                :key="task.id"
                class="task-card"
                :class="{ locked: task.status === 'locked', completed: task.status === 'completed' || task.status === 'claimed' }"
                :style="{ borderLeftColor: gameStore.getCollabTaskStatusColor(task.status) }"
              >
                <div class="task-icon">{{ task.icon }}</div>
                <div class="task-info">
                  <div class="task-name">{{ task.name }}</div>
                  <div class="task-desc">{{ task.description }}</div>
                  <div class="task-type">
                    <span class="type-tag">{{ gameStore.getCollabTaskTypeLabel(task.type) }}</span>
                    <span v-if="task.genre" class="genre-tag">{{ task.genre }}</span>
                    <span v-if="task.minRarity" class="rarity-tag">稀有度≥{{ task.minRarity }}</span>
                  </div>
                  <div class="task-progress-bar">
                    <div
                      class="task-progress-fill"
                      :style="{ width: getTaskProgressPercent(task) + '%', background: gameStore.getCollabTaskStatusColor(task.status) }"
                    ></div>
                  </div>
                  <div class="task-progress-text">
                    <span :style="{ color: gameStore.getCollabTaskStatusColor(task.status) }">
                      {{ gameStore.getCollabTaskStatusLabel(task.status) }}
                    </span>
                    <span>{{ task.current }} / {{ task.target }}</span>
                  </div>
                  <div class="task-reward">
                    奖励: 💰¥{{ task.reward.budget }} ⭐+{{ task.reward.reputation }} 📈+{{ task.reward.growthPoints }}
                    <span v-if="task.reward.bonusItems && task.reward.bonusItems.length > 0">🎁 {{ task.reward.bonusItems.join(', ') }}</span>
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
            <div v-if="isCollabActive" class="current-reward">
              <h3 class="section-title">🏆 当前预计奖励</h3>
              <div class="reward-tier-display" :style="{ borderColor: getRewardTierColor(rewardTier.tier) }">
                <div class="tier-icon">{{ rewardTier.icon }}</div>
                <div class="tier-name" :style="{ color: getRewardTierColor(rewardTier.tier) }">{{ rewardTier.tierName }}</div>
                <div class="tier-desc">{{ rewardTier.description }}</div>
                <div class="tier-rewards">
                  <span>💰 ¥{{ rewardTier.rewards.budget }}</span>
                  <span>⭐ +{{ rewardTier.rewards.reputation }}</span>
                  <span>📈 +{{ rewardTier.rewards.growthPoints }}</span>
                  <span v-if="rewardTier.rewards.bonusItems && rewardTier.rewards.bonusItems.length > 0">🎁 {{ rewardTier.rewards.bonusItems.join(', ') }}</span>
                </div>
              </div>
              <div class="score-progress">
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: score + '%' }"></div>
                  <div
                    v-for="tier in collabRewardTiers"
                    :key="tier.tier"
                    class="tier-marker"
                    :style="{ left: tier.minScore + '%' }"
                    :title="tier.tierName"
                  >
                    {{ tier.icon }}
                  </div>
                </div>
                <div class="score-label">联名积分: {{ score }} / 100</div>
              </div>
              <div class="reward-stats">
                <div class="stat-item">
                  <span class="stat-label">唱片销量</span>
                  <span class="stat-value">{{ collab.limitedRecordsSold }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">顾客接待</span>
                  <span class="stat-value">{{ collab.collabCustomersServed }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">任务完成</span>
                  <span class="stat-value">{{ collab.tasksCompleted }} / {{ collab.tasks.length }}</span>
                </div>
              </div>
              <div class="reward-actions">
                <button v-if="collab.hasUnclaimedRewards" class="btn-primary" @click="handleClaimCollabReward">
                  🎁 领取联名奖励
                </button>
                <button v-if="isCollabActive" class="btn-secondary" @click="handleEndCollab">
                  结束联名活动
                </button>
              </div>
            </div>

            <div v-if="collabSettlements.length > 0" class="settlement-history">
              <h3 class="section-title">📊 历史结算</h3>
              <div
                v-for="(s, idx) in collabSettlements"
                :key="idx"
                class="settlement-card"
                :style="{ borderLeftColor: getRewardTierColor(s.rewardTier.tier) }"
              >
                <div class="settlement-header">
                  <span>{{ s.rewardTier.icon }} {{ getThemeName(s.collabThemeId) }}</span>
                  <span class="settlement-score">{{ s.totalScore }}分</span>
                </div>
                <div class="settlement-details">
                  <span>任务 {{ s.tasksCompleted }}/{{ s.totalTasks }}</span>
                  <span>顾客 {{ s.customersServed }}</span>
                  <span>唱片 {{ s.limitedRecordsSold }}</span>
                </div>
                <div v-if="s.bonusRewards && s.bonusRewards.length > 0" class="settlement-bonuses">
                  🎁 {{ s.bonusRewards.join(', ') }}
                </div>
              </div>
            </div>

            <div v-if="!isCollabActive && collabSettlements.length === 0" class="empty-state">
              <div class="empty-icon">🏆</div>
              <div>暂无联名结算记录，开启你的第一个音乐节联名吧！</div>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'badges'">
          <div class="badges-section">
            <h3 class="section-title">🎖️ 收藏徽章</h3>
            <div class="badges-grid">
              <div
                v-for="badge in collab.badges"
                :key="badge.id"
                class="badge-card"
                :class="{ locked: !badge.isUnlocked }"
              >
                <div class="badge-icon">{{ badge.isUnlocked ? badge.icon : '🔒' }}</div>
                <div class="badge-name">{{ badge.isUnlocked ? badge.name : '???' }}</div>
                <div class="badge-desc">{{ badge.isUnlocked ? badge.description : '参与联名活动解锁' }}</div>
                <div v-if="badge.isUnlocked" class="badge-date">
                  解锁于 {{ new Date(badge.unlockedDate || 0).toLocaleDateString() }}
                </div>
                <div v-else class="badge-requirement">
                  {{ badge.unlockCondition }}
                </div>
              </div>
            </div>
            <div class="badges-progress">
              已解锁 {{ collabBadges.length }} / {{ collab.badges.length }}
            </div>
          </div>
        </template>
      </div>

      <div v-if="showToast" class="toast">{{ toastMessage }}</div>

      <div v-if="showStartModal" class="modal-overlay" @click.self="showStartModal = false">
        <div class="modal-content">
          <h3 v-if="selectedTheme" class="modal-title">
            {{ selectedTheme.icon }} 开启{{ selectedTheme.name }}联名？
          </h3>
          <p v-if="selectedTheme" class="modal-desc">
            {{ selectedTheme.description }}<br>
            活动将持续 {{ selectedTheme.endDay - selectedTheme.startDay + 1 }} 天，启动资金 ¥500，期间可获得音乐节限定奖励！
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showStartModal = false">取消</button>
            <button
              v-if="selectedTheme"
              class="btn-primary"
              :style="{ background: selectedTheme.accentColor }"
              @click="confirmStartCollab"
            >
              确认开启
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collab-overlay {
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

.collab-container {
  padding: 16px;
  padding-bottom: 80px;
}

.collab-header {
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

.collab-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.collab-day-info {
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

.theme-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-left: 4px solid;
}

.theme-card.locked {
  opacity: 0.6;
}

.theme-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.theme-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.theme-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.theme-genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.genre-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 10px;
  color: var(--text-secondary);
}

.unlock-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.theme-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 11px;
  color: var(--accent-gold);
}

.btn-start {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.records-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-rarity {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.record-artist {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.record-genres {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.record-stock {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 10px;
}

.stock-count, .sold-count {
  color: var(--text-muted);
}

.record-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.original-price {
  font-size: 10px;
  color: var(--text-muted);
  text-decoration: line-through;
}

.collab-price {
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

.sold-out-label {
  padding: 8px 12px;
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.customers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.refresh-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.btn-refresh {
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cooldown-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.customer-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-left: 4px solid;
  display: flex;
  gap: 12px;
}

.customer-avatar {
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

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rarity-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
}

.customer-title {
  font-size: 11px;
  color: var(--accent-gold);
  margin-bottom: 4px;
}

.customer-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.4;
}

.customer-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.customer-genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--border);
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

.task-type {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.type-tag {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(155, 135, 245, 0.2);
  color: #9b87f5;
  font-size: 10px;
  font-weight: 600;
}

.rarity-tag {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 215, 64, 0.2);
  color: #ffd740;
  font-size: 10px;
  font-weight: 600;
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

.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  cursor: pointer;
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
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-left: 4px solid;
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
  margin-bottom: 4px;
}

.settlement-bonuses {
  font-size: 11px;
  color: #48bb78;
}

.badges-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.badge-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  text-align: center;
}

.badge-card.locked {
  opacity: 0.5;
}

.badge-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.badge-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.badge-date {
  font-size: 10px;
  color: var(--accent-gold);
}

.badge-requirement {
  font-size: 10px;
  color: var(--text-muted);
}

.badges-progress {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
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

.modal-actions .btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-actions .btn-primary {
  color: white;
}
</style>
