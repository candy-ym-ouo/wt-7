<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import type { MemberLevel } from '@/types'
import { memberBenefits, getLevelIcon, getLevelColor } from '@/data/members'

const emit = defineEmits<{
  back: []
}>()

const gameStore = useGameStore()

const todayStats = computed(() => {
  return gameStore.dailyStats[gameStore.dailyStats.length - 1]
})

const memberLevelDistribution = computed(() => {
  const levels: MemberLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  return levels.map(level => ({
    level,
    levelName: memberBenefits.find(b => b.level === level)?.levelName || level,
    icon: getLevelIcon(level),
    color: getLevelColor(level),
    count: gameStore.memberStats.byLevel[level]
  })).filter(item => item.count > 0)
})

const memberSalesRatio = computed(() => {
  if (gameStore.currentLevelSales === 0) return 0
  return Math.round((gameStore.currentLevelMemberSales / gameStore.currentLevelSales) * 100)
})

const continueAction = () => {
  if (gameStore.isLastDay) {
    if (gameStore.isLevelComplete) {
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

      <div v-if="todayStats && (todayStats.newMembers > 0 || todayStats.returningCustomers > 0 || gameStore.members.length > 0)" class="member-stats-card card">
        <h3 class="ms-title">👥 会员运营数据</h3>

        <div class="member-stats-grid">
          <div v-if="todayStats.newMembers > 0" class="mstat-card success">
            <span class="mstat-icon">✨</span>
            <span class="mstat-value">{{ todayStats.newMembers }}</span>
            <span class="mstat-label">新增会员</span>
          </div>
          <div v-if="todayStats.returningCustomers > 0" class="mstat-card info">
            <span class="mstat-icon">🔄</span>
            <span class="mstat-value">{{ todayStats.returningCustomers }}</span>
            <span class="mstat-label">回头客来访</span>
          </div>
          <div v-if="todayStats.memberSalesCount > 0" class="mstat-card gold">
            <span class="mstat-icon">💳</span>
            <span class="mstat-value">{{ todayStats.memberSalesCount }}</span>
            <span class="mstat-label">会员订单</span>
          </div>
          <div v-if="todayStats.totalGrowthPointsEarned > 0" class="mstat-card purple">
            <span class="mstat-icon">📈</span>
            <span class="mstat-value">{{ todayStats.totalGrowthPointsEarned }}</span>
            <span class="mstat-label">成长值产出</span>
          </div>
        </div>

        <div v-if="memberLevelDistribution.length > 0" class="member-distribution">
          <span class="md-label">会员等级分布</span>
          <div class="md-list">
            <div v-for="item in memberLevelDistribution" :key="item.level" class="md-item">
              <span class="md-icon" :style="{ color: item.color }">{{ item.icon }}</span>
              <span class="md-name">{{ item.levelName }}</span>
              <span class="md-count">{{ item.count }}人</span>
            </div>
          </div>
        </div>

        <div class="member-total">
          <span>会员总数：</span>
          <span class="member-total-count">{{ gameStore.members.length }} 人</span>
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

        <div class="member-targets">
          <h4 class="mt-title">🎯 会员目标</h4>

          <div class="progress-item">
            <div class="pi-header">
              <span class="pi-label">新增会员数</span>
              <span class="pi-value">
                {{ gameStore.currentLevelNewMembers }} / {{ gameStore.currentLevelConfig?.memberTargets.targetNewMembers }}
              </span>
            </div>
            <div class="pi-bar">
              <div
                class="pi-fill member"
                :style="{ width: Math.min(100, gameStore.memberLevelProgress.newMembers) + '%' }"
              ></div>
            </div>
          </div>

          <div class="progress-item">
            <div class="pi-header">
              <span class="pi-label">回头客来访</span>
              <span class="pi-value">
                {{ gameStore.currentLevelReturningVisits }} / {{ gameStore.currentLevelConfig?.memberTargets.targetReturningVisits }}
              </span>
            </div>
            <div class="pi-bar">
              <div
                class="pi-fill returning"
                :style="{ width: Math.min(100, gameStore.memberLevelProgress.returningVisits) + '%' }"
              ></div>
            </div>
          </div>

          <div class="progress-item">
            <div class="pi-header">
              <span class="pi-label">会员销售占比</span>
              <span class="pi-value">
                {{ memberSalesRatio }}% / {{ Math.round((gameStore.currentLevelConfig?.memberTargets.targetMemberSalesRatio || 0) * 100) }}%
              </span>
            </div>
            <div class="pi-bar">
              <div
                class="pi-fill ratio"
                :style="{ width: Math.min(100, gameStore.memberLevelProgress.memberSalesRatio) + '%' }"
              ></div>
            </div>
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

        <div v-if="gameStore.members.length > 0" class="member-summary card">
          <h4 class="ms-header">🏆 会员运营成果</h4>
          <div class="member-summary-grid">
            <div class="ms-item">
              <span class="ms-icon">👥</span>
              <span class="ms-value">{{ gameStore.members.length }}</span>
              <span class="ms-label">会员总数</span>
            </div>
            <div class="ms-item">
              <span class="ms-icon">✨</span>
              <span class="ms-value">{{ gameStore.currentLevelNewMembers }}</span>
              <span class="ms-label">新增会员</span>
            </div>
            <div class="ms-item">
              <span class="ms-icon">🔄</span>
              <span class="ms-value">{{ gameStore.currentLevelReturningVisits }}</span>
              <span class="ms-label">回头客来访</span>
            </div>
            <div class="ms-item">
              <span class="ms-icon">💳</span>
              <span class="ms-value">{{ memberSalesRatio }}%</span>
              <span class="ms-label">会员销售占比</span>
            </div>
          </div>

          <div v-if="memberLevelDistribution.length > 0" class="member-summary-dist">
            <span class="msd-label">等级构成</span>
            <div class="msd-bars">
              <div
                v-for="item in memberLevelDistribution"
                :key="item.level"
                class="msd-bar"
                :style="{ background: `linear-gradient(90deg, ${item.color}40 0%, ${item.color}80 100%)` }"
              >
                <span class="msd-icon">{{ item.icon }}</span>
                <span class="msd-count">{{ item.count }}</span>
              </div>
            </div>
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

.pi-fill.member {
  background: linear-gradient(90deg, #f6e05e 0%, #ecc94b 100%);
}

.pi-fill.returning {
  background: linear-gradient(90deg, #38b2ac 0%, #319795 100%);
}

.pi-fill.ratio {
  background: linear-gradient(90deg, #9f7aea 0%, #805ad5 100%);
}

.member-targets {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}

.mt-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.member-stats-card {
  margin: 0 16px;
}

.ms-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.member-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.mstat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 10px;
  text-align: center;
}

.mstat-card.success {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.mstat-card.info {
  background: rgba(56, 178, 172, 0.1);
  border: 1px solid rgba(56, 178, 172, 0.2);
}

.mstat-card.gold {
  background: rgba(246, 224, 94, 0.1);
  border: 1px solid rgba(246, 224, 94, 0.2);
}

.mstat-card.purple {
  background: rgba(159, 122, 234, 0.1);
  border: 1px solid rgba(159, 122, 234, 0.2);
}

.mstat-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.mstat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.mstat-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

.member-distribution {
  margin-bottom: 12px;
}

.md-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.md-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.md-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 11px;
}

.md-icon {
  font-size: 12px;
}

.md-name {
  color: var(--text-secondary);
}

.md-count {
  color: var(--text-primary);
  font-weight: 600;
}

.member-total {
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.member-total-count {
  font-weight: 700;
  color: var(--accent-gold);
  font-size: 14px;
}

.member-summary {
  margin-top: 16px;
  padding: 16px;
}

.ms-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.member-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.ms-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(243, 156, 18, 0.08) 100%);
  border-radius: 10px;
  border: 1px solid rgba(246, 224, 94, 0.15);
}

.ms-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.ms-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-gold);
  line-height: 1.2;
}

.ms-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

.member-summary-dist {
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.msd-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.msd-bars {
  display: flex;
  gap: 6px;
}

.msd-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 8px;
  min-height: 50px;
  justify-content: center;
}

.msd-icon {
  font-size: 14px;
  margin-bottom: 2px;
}

.msd-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
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
