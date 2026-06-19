<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'

const emit = defineEmits<{
  back: []
}>()

const gameStore = useGameStore()

const todayStats = computed(() => {
  return gameStore.dailyStats[gameStore.dailyStats.length - 1]
})

const continueAction = () => {
  if (gameStore.isLastDay) {
    if (gameStore.isLevelComplete) {
      // 关卡完成，可以选择下一关或返回菜单
    }
  }
  gameStore.advancePhase()
}

const goNextLevel = () => {
  gameStore.goToNextLevel()
}

const restartLevel = () => {
  gameStore.restartLevel()
}

const backToMenu = () => {
  emit('back')
}
</script>

<template>
  <div class="settlement-view">
    <div v-if="!gameStore.isLastDay" class="daily-settlement">
      <div class="settlement-header">
        <div class="sh-icon">📊</div>
        <h2 class="sh-title">第 {{ gameStore.currentDay }} 天营业结束</h2>
      </div>

      <div class="stats-grid" v-if="todayStats">
        <div class="stat-card">
          <span class="stat-label">营业收入</span>
          <span class="stat-value revenue">+¥{{ todayStats.revenue }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">进货成本</span>
          <span class="stat-value cost">-¥{{ todayStats.cost }}</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-label">今日利润</span>
          <span class="stat-value profit">¥{{ todayStats.profit }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">销售数量</span>
          <span class="stat-value">{{ todayStats.salesCount }} 张</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">接待顾客</span>
          <span class="stat-value">{{ todayStats.customersServed }} 人</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">平均满意度</span>
          <span class="stat-value satisfaction">{{ Math.round(todayStats.avgSatisfaction) }}%</span>
        </div>
      </div>

      <div class="level-progress-card card">
        <h3 class="lp-title">关卡进度</h3>
        
        <div class="progress-item">
          <div class="pi-header">
            <span class="pi-label">目标利润</span>
            <span class="pi-value">
              ¥{{ gameStore.currentLevelProfit }} / ¥{{ gameStore.currentLevelConfig?.targetProfit }}
            </span>
          </div>
          <div class="pi-bar">
            <div 
              class="pi-fill" 
              :style="{ width: Math.min(100, gameStore.levelProgress.profit) + '%' }"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="pi-header">
            <span class="pi-label">销售数量</span>
            <span class="pi-value">
              {{ gameStore.currentLevelSales }} / {{ gameStore.currentLevelConfig?.targetSales }}
            </span>
          </div>
          <div class="pi-bar">
            <div 
              class="pi-fill success" 
              :style="{ width: Math.min(100, gameStore.levelProgress.sales) + '%' }"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="pi-header">
            <span class="pi-label">店铺声望</span>
            <span class="pi-value">
              {{ gameStore.shopReputation }} / {{ gameStore.currentLevelConfig?.targetSatisfaction }}
            </span>
          </div>
          <div class="pi-bar">
            <div 
              class="pi-fill warning" 
              :style="{ width: Math.min(100, gameStore.levelProgress.satisfaction) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-primary action-btn" @click="continueAction">
          继续：第 {{ gameStore.currentDay + 1 }} 天 →
        </button>
      </div>
    </div>

    <div v-else class="level-result">
      <div class="result-header" :class="{ success: gameStore.isLevelComplete, fail: !gameStore.isLevelComplete }">
        <div class="rh-icon">{{ gameStore.isLevelComplete ? '🏆' : '💪' }}</div>
        <h2 class="rh-title">
          {{ gameStore.isLevelComplete ? '恭喜通关！' : '挑战失败' }}
        </h2>
        <p class="rh-subtitle">
          {{ gameStore.currentLevelConfig?.name }}
        </p>
      </div>

      <div class="final-stats">
        <h3 class="fs-title">最终成绩</h3>
        
        <div class="fs-grid">
          <div class="fs-item">
            <span class="fs-label">总利润</span>
            <span class="fs-value">¥{{ gameStore.currentLevelProfit }}</span>
          </div>
          <div class="fs-item">
            <span class="fs-label">总销量</span>
            <span class="fs-value">{{ gameStore.currentLevelSales }} 张</span>
          </div>
          <div class="fs-item">
            <span class="fs-label">剩余资金</span>
            <span class="fs-value">¥{{ gameStore.budget }}</span>
          </div>
          <div class="fs-item">
            <span class="fs-label">店铺声望</span>
            <span class="fs-value">{{ gameStore.shopReputation }}</span>
          </div>
        </div>

        <div v-if="gameStore.collection.length > 0" class="collection-unlock">
          <span class="cu-icon">📚</span>
          <span class="cu-text">
            获得了 {{ gameStore.collection.length }} 张珍贵唱片收藏！
          </span>
        </div>
      </div>

      <div class="daily-breakdown">
        <h3 class="db-title">每日明细</h3>
        <div class="db-list">
          <div 
            v-for="(stat, index) in gameStore.dailyStats" 
            :key="index"
            class="db-item"
          >
            <span class="db-day">第 {{ stat.day }} 天</span>
            <span class="db-profit" :class="{ positive: stat.profit >= 0 }">
              {{ stat.profit >= 0 ? '+' : '' }}¥{{ stat.profit }}
            </span>
            <span class="db-sales">{{ stat.salesCount }} 张</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button 
          v-if="gameStore.isLevelComplete && gameStore.currentLevel < 5"
          class="btn-primary"
          @click="goNextLevel"
        >
          下一关 →
        </button>
        <button 
          class="btn-secondary"
          @click="restartLevel"
        >
          重玩本关
        </button>
        <button 
          class="btn-secondary"
          @click="backToMenu"
        >
          返回菜单
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settlement-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.settlement-header {
  text-align: center;
  padding: 24px 16px;
}

.sh-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.sh-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 16px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  text-align: center;
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.15) 0%, rgba(243, 156, 18, 0.15) 100%);
  border-color: rgba(233, 69, 96, 0.4);
  grid-column: span 2;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.revenue {
  color: var(--success);
}

.stat-value.cost {
  color: var(--danger);
}

.stat-value.profit {
  color: var(--accent-gold);
  font-size: 24px;
}

.stat-value.satisfaction {
  color: var(--accent-orange);
}

.level-progress-card {
  margin: 0 16px;
}

.lp-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.progress-item + .progress-item {
  margin-top: 14px;
}

.pi-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pi-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.pi-value {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.pi-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.pi-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.pi-fill.success {
  background: linear-gradient(90deg, var(--success) 0%, #38b2ac 100%);
}

.pi-fill.warning {
  background: linear-gradient(90deg, var(--warning) 0%, var(--accent-orange) 100%);
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 16px;
  background: linear-gradient(to top, var(--bg-primary) 70%, transparent);
  z-index: 50;
}

.action-btn {
  width: 100%;
}

.level-result {
  padding-bottom: 32px;
}

.result-header {
  text-align: center;
  padding: 32px 16px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.15) 0%, rgba(56, 178, 172, 0.15) 100%);
  border-radius: 0 0 24px 24px;
}

.result-header.fail {
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(237, 137, 54, 0.15) 100%);
}

.rh-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.rh-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rh-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.final-stats {
  padding: 20px 16px;
}

.fs-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.fs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.fs-item {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  border: 1px solid var(--border);
}

.fs-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.fs-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-gold);
}

.collection-unlock {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(246, 224, 94, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: var(--accent-orange);
}

.cu-icon {
  font-size: 18px;
}

.daily-breakdown {
  padding: 0 16px;
}

.db-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.db-list {
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.db-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.db-item:last-child {
  border-bottom: none;
}

.db-day {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.db-profit {
  font-size: 14px;
  font-weight: 600;
  color: var(--danger);
  margin-right: 16px;
  min-width: 80px;
  text-align: right;
}

.db-profit.positive {
  color: var(--success);
}

.db-sales {
  font-size: 12px;
  color: var(--text-muted);
}

.result-actions {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-actions button {
  width: 100%;
}
</style>
