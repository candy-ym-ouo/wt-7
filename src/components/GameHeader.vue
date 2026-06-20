<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import { getTimeSlotConfig } from '@/data/timeSlots'

const emit = defineEmits<{
  back: []
  collection: []
  staff: []
  auction: []
  presale: []
  renovation: []
  'market-tour': []
}>()

const gameStore = useGameStore()

const phaseName = computed(() => {
  const names: Record<string, string> = {
    purchase: '进货',
    display: '陈列',
    business: '营业',
    settlement: '结算'
  }
  return names[gameStore.phase] || ''
})

const phaseDescription = computed(() => {
  const descriptions: Record<string, string> = {
    purchase: '从供应商处采购唱片',
    display: '将唱片摆上货架',
    business: '接待顾客销售唱片',
    settlement: '今日营业结算'
  }
  return descriptions[gameStore.phase] || ''
})

const timeSlotLabel = computed(() => {
  if (gameStore.phase !== 'business') return ''
  const config = getTimeSlotConfig(gameStore.currentTimeSlot)
  return `${config.icon} ${config.name}`
})
</script>

<template>
  <header class="game-header">
    <div class="header-top">
      <button class="icon-btn" @click="emit('back')">
        ←
      </button>
      
      <div class="level-info">
        <div class="level-name">{{ gameStore.currentLevelConfig?.name || '第 ' + gameStore.currentLevel + ' 关' }}</div>
        <div class="day-info">第 {{ gameStore.currentDay }} / {{ gameStore.currentLevelConfig?.days }} 天</div>
      </div>

      <div class="header-buttons">
        <button class="icon-btn market-tour-btn" @click="emit('market-tour')">
          🚛
          <span v-if="gameStore.marketTour.totalMarketSales > 0 && !gameStore.marketTour.isActive" class="badge active-dot">●</span>
        </button>
        <button class="icon-btn renovation-btn" @click="emit('renovation')">
          🏗️
        </button>
        <button class="icon-btn presale-btn" @click="emit('presale')">
          🏪
          <span v-if="gameStore.presaleToFulfillCount > 0" class="badge">{{ gameStore.presaleToFulfillCount }}</span>
        </button>
        <button class="icon-btn auction-btn" @click="emit('auction')">
          🔨
          <span v-if="gameStore.endedAuctions.filter(a => a.status === 'ended').length > 0" class="badge">{{ gameStore.endedAuctions.filter(a => a.status === 'ended').length }}</span>
        </button>
        <button class="icon-btn staff-btn" @click="emit('staff')">
          👥
          <span v-if="gameStore.staff.availablePoints > 0" class="badge">{{ gameStore.staff.availablePoints }}</span>
        </button>
        <button class="icon-btn" @click="emit('collection')">
          📚
        </button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-icon">💰</span>
        <span class="stat-value">¥{{ gameStore.budget }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📈</span>
        <span class="stat-value">+¥{{ gameStore.currentLevelProfit }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⭐</span>
        <span class="stat-value">{{ gameStore.shopReputation }}</span>
      </div>
      <div class="stat-item word-of-mouth">
        <span class="stat-icon">{{ gameStore.wordOfMouthConfig.icon }}</span>
        <span class="stat-value wom-tier">{{ gameStore.wordOfMouthConfig.tierName }}</span>
      </div>
    </div>

    <div class="phase-indicator" :class="{ 'night-phase': gameStore.phase === 'business' && gameStore.currentTimeSlot === 'night' }">
      <div class="phase-name">{{ phaseName }}{{ timeSlotLabel ? ` · ${timeSlotLabel}` : '' }}</div>
      <div class="phase-desc">{{ phaseDescription }}</div>
    </div>

    <div class="progress-section">
      <div class="progress-row">
        <span class="progress-label">利润目标</span>
        <span class="progress-value">{{ Math.round(gameStore.levelProgress.profit) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: gameStore.levelProgress.profit + '%' }"></div>
      </div>
      
      <div class="progress-row">
        <span class="progress-label">销售数量</span>
        <span class="progress-value">{{ gameStore.currentLevelSales }} / {{ gameStore.currentLevelConfig?.targetSales }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill success" :style="{ width: gameStore.levelProgress.sales + '%' }"></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.game-header {
  background: var(--bg-card);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--bg-primary);
}

.level-info {
  text-align: center;
  flex: 1;
}

.level-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.day-info {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.stats-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-item.word-of-mouth {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.15) 0%, rgba(233, 69, 96, 0.15) 100%);
}

.wom-tier {
  font-size: 11px;
}

.stat-icon {
  font-size: 14px;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.phase-indicator {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.phase-indicator.night-phase {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
}

.phase-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 2px;
}

.phase-desc {
  font-size: 11px;
  color: var(--text-secondary);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 10px;
  color: var(--text-muted);
}

.progress-value {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-fill.success {
  background: linear-gradient(90deg, var(--success) 0%, #38b2ac 100%);
}

.header-buttons {
  display: flex;
  gap: 6px;
}

.staff-btn {
  position: relative;
}

.staff-btn .badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--accent-gold);
  color: var(--bg-card);
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
