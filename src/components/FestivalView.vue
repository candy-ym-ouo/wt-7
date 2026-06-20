<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { FestivalTheme, FestivalTaskConfig } from '@/types'
import {
  festivalThemeConfigs,
  getFestivalThemeConfig,
  getCustomerRarityLabel,
  getCustomerRarityColor,
  getTaskStatusLabel,
  getTaskStatusColor,
  getRewardTierColor,
  festivalRewardTiers,
  getThemeName
} from '@/data/festival'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'menu' | 'customers' | 'tasks' | 'rewards' | 'atmosphere'>('menu')
const toastMessage = ref('')
const showToast = ref(false)
const showStartModal = ref(false)
const selectedTheme = ref<FestivalTheme | null>(null)

const festival = computed(() => gameStore.festival)
const isFestivalActive = computed(() => festival.value.isFestivalActive)
const themeConfig = computed(() => gameStore.festivalThemeConfig)
const score = computed(() => gameStore.festivalScore)
const rewardTier = computed(() => gameStore.festivalRewardTier)

const availableThemes = computed(() => festivalThemeConfigs)

const festivalMenus = computed(() => festival.value.menus)
const festivalCustomers = computed(() => festival.value.customers)
const festivalTasks = computed(() => festival.value.tasks)
const festivalSettlements = computed(() => festival.value.settlements)
const encounteredCustomers = computed(() => festival.value.encounteredCustomers)

const getRecordById = (id: string) => {
  return gameStore.getRecordById(id)
}

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

const handleStartFestival = (theme: FestivalTheme) => {
  selectedTheme.value = theme
  showStartModal.value = true
}

const confirmStartFestival = () => {
  if (!selectedTheme.value) return
  const result = gameStore.startFestival(selectedTheme.value)
  showNotification(result.message)
  if (result.success) {
    showStartModal.value = false
    selectedTheme.value = null
  }
}

const handlePurchaseMenuItem = (menuId: string, recordId: string) => {
  const result = gameStore.purchaseFestivalMenuItem(menuId, recordId)
  showNotification(result.message)
}

const handleClaimTaskReward = (taskId: string) => {
  const result = gameStore.claimFestivalTaskReward(taskId)
  showNotification(result.message)
}

const handleClaimFestivalReward = () => {
  const result = gameStore.claimFestivalReward()
  showNotification(result.message)
}

const handleSwitchAtmosphere = (theme: FestivalTheme | null) => {
  gameStore.switchFestivalAtmosphere(theme)
  if (theme) {
    showNotification(`切换至${getThemeName(theme)}氛围`)
  } else {
    showNotification('恢复默认氛围')
  }
}

const handleEndFestival = () => {
  gameStore.endFestival()
  showNotification('节日活动已结束，请领取奖励！')
}

const getTaskProgressPercent = (task: FestivalTaskConfig) => {
  if (task.target <= 0) return 0
  return Math.min(100, Math.round((task.current / task.target) * 100))
}

const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#48bb78'
    case 'limited': return '#ed8936'
    case 'sold_out': return '#f56565'
    default: return '#718096'
  }
}

const getStockStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return '有货'
    case 'limited': return '限量'
    case 'sold_out': return '售罄'
    default: return status
  }
}
</script>

<template>
  <div class="festival-overlay">
    <div class="festival-container">
      <div class="festival-header">
        <button class="close-btn" @click="emit('close')">✕</button>
        <h2 v-if="isFestivalActive" class="festival-title" :style="{ color: themeConfig?.accentColor }">
          {{ themeConfig?.icon }} {{ themeConfig?.name }}
        </h2>
        <h2 v-else class="festival-title">🎪 节日运营</h2>
        <div v-if="isFestivalActive" class="festival-day-info">
          第 {{ festival.festivalDay }} / {{ festival.maxFestivalDays }} 天
          <span class="score-badge" :style="{ background: rewardTier.icon === '💎' ? '#e5e4e2' : rewardTier.icon === '🥇' ? '#ffd700' : rewardTier.icon === '🥈' ? '#c0c0c0' : '#cd7f32' }">
            {{ rewardTier.icon }} {{ score }}分
          </span>
        </div>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in (isFestivalActive
            ? [
              { key: 'menu', label: '专题货单', icon: '📋' },
              { key: 'customers', label: '限定顾客', icon: '👥' },
              { key: 'tasks', label: '任务目标', icon: '🎯' },
              { key: 'rewards', label: '奖励结算', icon: '🏆' },
              { key: 'atmosphere', label: '氛围切换', icon: '🎨' }
            ]
            : [
              { key: 'menu', label: '选择节日', icon: '🎪' },
              { key: 'rewards', label: '历史结算', icon: '🏆' }
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
        <template v-if="!isFestivalActive && activeTab === 'menu'">
          <div class="theme-grid">
            <div
              v-for="theme in availableThemes"
              :key="theme.theme"
              class="theme-card"
              :style="{ borderLeftColor: theme.accentColor }"
            >
              <div class="theme-icon">{{ theme.icon }}</div>
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-desc">{{ theme.description }}</div>
                <div class="theme-genres">
                  <span v-for="g in theme.genreAffinity" :key="g" class="genre-tag">{{ g }}</span>
                </div>
              </div>
              <div class="theme-bonuses">
                <div class="bonus-item">💰 预算+{{ Math.round(theme.customerBudgetBonus * 100) }}%</div>
                <div class="bonus-item">🎯 成交+{{ Math.round(theme.buyChanceBonus * 100) }}%</div>
              </div>
              <button
                class="btn-start"
                :style="{ background: theme.accentColor }"
                @click="handleStartFestival(theme.theme)"
              >
                开启活动
              </button>
            </div>
          </div>
        </template>

        <template v-if="isFestivalActive && activeTab === 'menu'">
          <div class="menu-section">
            <div v-for="menu in festivalMenus" :key="menu.id" class="menu-block">
              <div class="menu-header">
                <span class="menu-icon">{{ menu.icon }}</span>
                <span class="menu-name">{{ menu.name }}</span>
                <span class="menu-purchased">已购 {{ menu.totalPurchased }} / 赠礼需 {{ menu.bonusBuyThreshold }} 件</span>
              </div>
              <div class="menu-items">
                <div
                  v-for="item in menu.items"
                  :key="item.recordId"
                  class="menu-item"
                  :class="{ 'sold-out': item.status === 'sold_out' }"
                >
                  <div class="item-info">
                    <div class="item-name">{{ getRecordById(item.recordId)?.title || item.recordId }}</div>
                    <div class="item-artist">{{ getRecordById(item.recordId)?.artist }}</div>
                    <div class="item-tags">
                      <span v-if="item.tagLabel" class="tag-label" :class="item.tagLabel">{{ item.tagLabel }}</span>
                      <span class="stock-status" :style="{ color: getStockStatusColor(item.status) }">
                        {{ getStockStatusLabel(item.status) }}
                      </span>
                      <span class="stock-count">剩余 {{ item.stock }}/{{ item.maxStock }}</span>
                    </div>
                  </div>
                  <div class="item-price">
                    <span class="original-price">¥{{ item.originalPrice }}</span>
                    <span class="festival-price" :style="{ color: themeConfig?.accentColor }">¥{{ item.festivalPrice }}</span>
                  </div>
                  <button
                    v-if="item.status !== 'sold_out'"
                    class="btn-buy"
                    :disabled="gameStore.budget < item.festivalPrice"
                    :style="{ background: themeConfig?.accentColor }"
                    @click="handlePurchaseMenuItem(menu.id, item.recordId)"
                  >
                    购买
                  </button>
                  <span v-else class="sold-out-label">已售罄</span>
                </div>
              </div>
              <div v-if="menu.totalPurchased >= menu.bonusBuyThreshold" class="bonus-unlocked">
                🎁 已达成选购礼包条件！{{ menu.bonusReward }}
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'customers'">
          <div class="customers-section">
            <div v-if="!isFestivalActive" class="empty-state">
              <div class="empty-icon">👥</div>
              <div>暂无节日活动，限定顾客不会出现</div>
            </div>
            <template v-else>
              <div
                v-for="customer in festivalCustomers"
                :key="customer.id"
                class="customer-card"
                :class="{ locked: !customer.isUnlocked }"
                :style="{ borderLeftColor: getCustomerRarityColor(customer.rarity) }"
              >
                <div class="customer-avatar">{{ customer.avatar }}</div>
                <div class="customer-info">
                  <div class="customer-name">
                    {{ customer.isUnlocked ? customer.name : '???' }}
                    <span class="rarity-badge" :style="{ color: getCustomerRarityColor(customer.rarity), borderColor: getCustomerRarityColor(customer.rarity) }">
                      {{ getCustomerRarityLabel(customer.rarity) }}
                    </span>
                  </div>
                  <div class="customer-title">{{ customer.isUnlocked ? customer.title : '未解锁' }}</div>
                  <div v-if="customer.isUnlocked" class="customer-desc">{{ customer.description }}</div>
                  <div v-if="!customer.isUnlocked" class="unlock-hint">
                    需要声望 {{ customer.requiredReputation }} 解锁
                  </div>
                  <div v-if="customer.isUnlocked" class="customer-stats">
                    <span>💰 预算×{{ customer.budgetMultiplier }}</span>
                    <span>🎯 成交+{{ Math.round(customer.buyChanceBonus * 100) }}%</span>
                    <span>❤️ 满意+{{ customer.satisfactionBonus }}</span>
                  </div>
                  <div v-if="customer.isUnlocked" class="customer-genres">
                    <span v-for="g in customer.favoriteGenres" :key="g" class="genre-tag">{{ g }}</span>
                  </div>
                </div>
              </div>

              <div v-if="encounteredCustomers.length > 0" class="encounter-section">
                <h3 class="section-title">📋 遭遇记录</h3>
                <div
                  v-for="enc in encounteredCustomers"
                  :key="enc.config.id"
                  class="encounter-card"
                >
                  <span class="enc-avatar">{{ enc.config.avatar }}</span>
                  <span class="enc-name">{{ enc.config.name }}</span>
                  <span class="enc-day">第{{ enc.day }}天</span>
                  <span class="enc-satisfaction">满意度 {{ enc.satisfaction }}</span>
                  <span class="enc-purchases">购买 {{ enc.purchasedRecordIds.length }} 件</span>
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'tasks'">
          <div class="tasks-section">
            <div v-if="!isFestivalActive" class="empty-state">
              <div class="empty-icon">🎯</div>
              <div>暂无节日活动，无任务目标</div>
            </div>
            <template v-else>
              <div
                v-for="task in festivalTasks"
                :key="task.id"
                class="task-card"
                :class="{ locked: task.status === 'locked', completed: task.status === 'completed' || task.status === 'claimed' }"
                :style="{ borderLeftColor: getTaskStatusColor(task.status) }"
              >
                <div class="task-icon">{{ task.icon }}</div>
                <div class="task-info">
                  <div class="task-name">{{ task.name }}</div>
                  <div class="task-desc">{{ task.description }}</div>
                  <div class="task-progress-bar">
                    <div
                      class="task-progress-fill"
                      :style="{ width: getTaskProgressPercent(task) + '%', background: getTaskStatusColor(task.status) }"
                    ></div>
                  </div>
                  <div class="task-progress-text">
                    <span :style="{ color: getTaskStatusColor(task.status) }">
                      {{ getTaskStatusLabel(task.status) }}
                    </span>
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
              </div>
            </template>
          </div>
        </template>

        <template v-if="activeTab === 'rewards'">
          <div class="rewards-section">
            <div v-if="isFestivalActive" class="current-reward">
              <h3 class="section-title">🏆 当前预计奖励</h3>
              <div class="reward-tier-display" :style="{ borderColor: getRewardTierColor(rewardTier.tier) }">
                <div class="tier-icon">{{ rewardTier.icon }}</div>
                <div class="tier-name" :style="{ color: getRewardTierColor(rewardTier.tier) }">{{ rewardTier.tierName }}</div>
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
                  <div class="score-fill" :style="{ width: score + '%' }"></div>
                  <div
                    v-for="tier in festivalRewardTiers"
                    :key="tier.tier"
                    class="tier-marker"
                    :style="{ left: tier.minScore + '%' }"
                    :title="tier.tierName"
                  >
                    {{ tier.icon }}
                  </div>
                </div>
                <div class="score-label">节日积分: {{ score }} / 100</div>
              </div>
              <div class="reward-stats">
                <div class="stat-item">
                  <span class="stat-label">货单销量</span>
                  <span class="stat-value">{{ festival.menuItemsSold }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">顾客接待</span>
                  <span class="stat-value">{{ festival.customersServed }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">任务完成</span>
                  <span class="stat-value">{{ festival.tasksCompleted }} / {{ festival.tasks.length }}</span>
                </div>
              </div>
              <div class="reward-actions">
                <button v-if="festival.hasUnclaimedRewards" class="btn-primary" @click="handleClaimFestivalReward">
                  🎁 领取节日奖励
                </button>
                <button v-if="isFestivalActive" class="btn-secondary" @click="handleEndFestival">
                  结束节日活动
                </button>
              </div>
            </div>

            <div v-if="festivalSettlements.length > 0" class="settlement-history">
              <h3 class="section-title">📊 历史结算</h3>
              <div
                v-for="(s, idx) in festivalSettlements"
                :key="idx"
                class="settlement-card"
                :style="{ borderLeftColor: getRewardTierColor(s.rewardTier.tier) }"
              >
                <div class="settlement-header">
                  <span>{{ s.rewardTier.icon }} {{ getThemeName(s.festivalTheme) }}</span>
                  <span class="settlement-score">{{ s.totalScore }}分</span>
                </div>
                <div class="settlement-details">
                  <span>任务 {{ s.tasksCompleted }}/{{ s.totalTasks }}</span>
                  <span>顾客 {{ s.customersServed }}</span>
                  <span>货单 {{ s.menuItemsSold }}</span>
                </div>
                <div v-if="s.bonusRewards.length > 0" class="settlement-bonuses">
                  🎁 {{ s.bonusRewards.join(', ') }}
                </div>
              </div>
            </div>

            <div v-if="!isFestivalActive && festivalSettlements.length === 0" class="empty-state">
              <div class="empty-icon">🏆</div>
              <div>暂无节日结算记录，开启你的第一个节日吧！</div>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'atmosphere'">
          <div class="atmosphere-section">
            <div v-if="!isFestivalActive" class="empty-state">
              <div class="empty-icon">🎨</div>
              <div>开启节日活动后可切换界面氛围</div>
            </div>
            <template v-else>
              <div class="current-atmosphere">
                <h3 class="section-title">🎨 当前氛围</h3>
                <div
                  v-if="festival.atmosphereOverride"
                  class="atmosphere-preview"
                  :style="{ background: festival.atmosphereOverride.bgGradient }"
                >
                  <div class="atmosphere-label">
                    {{ themeConfig?.icon }} {{ themeConfig?.name }}
                  </div>
                  <div class="atmosphere-accent" :style="{ background: festival.atmosphereOverride.accentColor }">
                    主题色
                  </div>
                  <div class="atmosphere-particles">{{ festival.atmosphereOverride.particleEffect }}</div>
                </div>
              </div>

              <h3 class="section-title">🎭 切换氛围主题</h3>
              <div class="atmosphere-grid">
                <div
                  class="atmosphere-option"
                  :class="{ active: !festival.atmosphereOverride }"
                  @click="handleSwitchAtmosphere(null)"
                >
                  <div class="atmosphere-swatch" style="background: linear-gradient(135deg, #1a1a2e, #16213e);">
                    默认
                  </div>
                  <span>恢复默认</span>
                </div>
                <div
                  v-for="t in availableThemes"
                  :key="t.theme"
                  class="atmosphere-option"
                  :class="{ active: festival.atmosphereOverride?.theme === t.theme }"
                  @click="handleSwitchAtmosphere(t.theme)"
                >
                  <div class="atmosphere-swatch" :style="{ background: t.bgGradient }">
                    {{ t.icon }}
                  </div>
                  <span>{{ t.name }}</span>
                </div>
              </div>

              <div class="atmosphere-effects">
                <h3 class="section-title">✨ 氛围效果</h3>
                <div v-if="themeConfig" class="effect-list">
                  <div class="effect-item">
                    <span>💰 顾客预算加成</span>
                    <span :style="{ color: themeConfig.accentColor }">+{{ Math.round(themeConfig.customerBudgetBonus * 100) }}%</span>
                  </div>
                  <div class="effect-item">
                    <span>🎯 成交率加成</span>
                    <span :style="{ color: themeConfig.accentColor }">+{{ Math.round(themeConfig.buyChanceBonus * 100) }}%</span>
                  </div>
                  <div class="effect-item">
                    <span>⭐ 声望加成</span>
                    <span :style="{ color: themeConfig.accentColor }">+{{ themeConfig.reputationBonus }}</span>
                  </div>
                  <div class="effect-item">
                    <span>❤️ 满意度加成</span>
                    <span :style="{ color: themeConfig.accentColor }">+{{ themeConfig.satisfactionBonus }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>

      <div v-if="showToast" class="toast">{{ toastMessage }}</div>

      <div v-if="showStartModal" class="modal-overlay" @click.self="showStartModal = false">
        <div class="modal-content">
          <h3 v-if="selectedTheme" class="modal-title">
            {{ getFestivalThemeConfig(selectedTheme).icon }} 开启{{ getFestivalThemeConfig(selectedTheme).name }}？
          </h3>
          <p v-if="selectedTheme" class="modal-desc">
            {{ getFestivalThemeConfig(selectedTheme).description }}<br>
            活动将持续 {{ festival.maxFestivalDays }} 天，期间可获得节日限定奖励！
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showStartModal = false">取消</button>
            <button
              v-if="selectedTheme"
              class="btn-primary"
              :style="{ background: getFestivalThemeConfig(selectedTheme).accentColor }"
              @click="confirmStartFestival"
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
.festival-overlay {
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

.festival-container {
  padding: 16px;
  padding-bottom: 80px;
}

.festival-header {
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

.festival-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.festival-day-info {
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

.theme-bonuses {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.bonus-item {
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

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-block {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.menu-icon {
  font-size: 20px;
}

.menu-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

.menu-purchased {
  font-size: 11px;
  color: var(--text-muted);
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.menu-item.sold-out {
  opacity: 0.5;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-artist {
  font-size: 11px;
  color: var(--text-muted);
}

.item-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  align-items: center;
}

.tag-label {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.tag-label.限定 {
  background: rgba(171, 71, 188, 0.2);
  color: #ab47bc;
}

.tag-label.热门 {
  background: rgba(255, 215, 64, 0.2);
  color: #ffd740;
}

.tag-label.特惠 {
  background: rgba(72, 219, 120, 0.2);
  color: #48bb78;
}

.stock-status {
  font-size: 10px;
  font-weight: 600;
}

.stock-count {
  font-size: 10px;
  color: var(--text-muted);
}

.item-price {
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

.festival-price {
  font-size: 15px;
  font-weight: 700;
}

.btn-buy {
  padding: 6px 14px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.btn-buy:disabled {
  opacity: 0.4;
}

.sold-out-label {
  font-size: 12px;
  color: var(--text-muted);
}

.bonus-unlocked {
  margin-top: 8px;
  padding: 8px;
  background: rgba(255, 215, 64, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: #ffd740;
  text-align: center;
}

.customers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-left: 4px solid;
  display: flex;
  gap: 12px;
}

.customer-card.locked {
  opacity: 0.6;
}

.customer-avatar {
  font-size: 32px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.rarity-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  margin-left: 6px;
  font-weight: 600;
}

.customer-title {
  font-size: 11px;
  color: var(--accent-gold);
  margin-top: 2px;
}

.customer-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.unlock-hint {
  font-size: 11px;
  color: var(--warning);
  margin-top: 4px;
}

.customer-stats {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-secondary);
}

.customer-genres {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.encounter-section {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.encounter-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.enc-avatar {
  font-size: 18px;
}

.enc-name {
  font-weight: 600;
  color: var(--text-primary);
}

.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-left: 4px solid;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.task-card.locked {
  opacity: 0.5;
}

.task-card.completed {
  border-left-color: #ffd740;
}

.task-icon {
  font-size: 24px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.task-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.task-progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
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
  margin-top: 4px;
  color: var(--text-muted);
}

.task-reward {
  font-size: 10px;
  color: var(--accent-gold);
  margin-top: 4px;
}

.btn-claim {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--accent-gold);
  color: white;
  font-weight: 600;
  font-size: 12px;
  align-self: center;
}

.lock-icon {
  font-size: 20px;
  align-self: center;
}

.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-reward {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
}

.reward-tier-display {
  text-align: center;
  padding: 16px;
  border: 2px solid;
  border-radius: 12px;
  margin-bottom: 16px;
}

.tier-icon {
  font-size: 36px;
}

.tier-name {
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
}

.tier-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.tier-rewards {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.score-progress {
  margin-bottom: 16px;
}

.score-bar {
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700, #e5e4e2);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.tier-marker {
  position: absolute;
  top: -18px;
  transform: translateX(-50%);
  font-size: 12px;
}

.score-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  text-align: center;
}

.reward-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.reward-stats .stat-item {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.reward-stats .stat-label {
  font-size: 10px;
  color: var(--text-muted);
  display: block;
}

.reward-stats .stat-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-top: 2px;
}

.reward-actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-gold) 0%, #c73e54 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  flex: 1;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  flex: 1;
}

.settlement-history {
  margin-top: 8px;
}

.settlement-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-left: 4px solid;
  margin-bottom: 8px;
}

.settlement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.settlement-score {
  font-size: 12px;
  color: var(--accent-gold);
}

.settlement-details {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.settlement-bonuses {
  margin-top: 6px;
  font-size: 11px;
  color: #ffd740;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.atmosphere-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.atmosphere-preview {
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.atmosphere-label {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.atmosphere-accent {
  width: 40px;
  height: 20px;
  border-radius: 4px;
  margin: 8px auto;
  font-size: 9px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.atmosphere-particles {
  font-size: 24px;
  margin-top: 4px;
}

.atmosphere-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.atmosphere-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid transparent;
}

.atmosphere-option.active {
  border-color: var(--accent-gold);
}

.atmosphere-option span {
  font-size: 10px;
  color: var(--text-secondary);
}

.atmosphere-swatch {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.atmosphere-effects {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
}

.effect-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 300;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 250;
}

.modal-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  margin: 20px;
  max-width: 360px;
  width: 100%;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 12px;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  flex: 1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
