<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import CommunityPosts from './CommunityPosts.vue'
import CommunityTrends from './CommunityTrends.vue'
import CommunitySpread from './CommunitySpread.vue'
import CommunityEvents from './CommunityEvents.vue'
import CommunityRewards from './CommunityRewards.vue'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const tabs = [
  { id: 'posts', name: '乐迷帖子', icon: '📝' },
  { id: 'trends', name: '风格趋势', icon: '📈' },
  { id: 'spread', name: '口碑扩散', icon: '📣' },
  { id: 'events', name: '活动报名', icon: '🎉' },
  { id: 'rewards', name: '奖励回流', icon: '🎁' }
]

const currentTab = computed(() => gameStore.communitySelectedTab)

const switchTab = (tabId: string) => {
  gameStore.setCommunityTab(tabId as 'posts' | 'trends' | 'spread' | 'events' | 'rewards')
}

const checkinStatus = computed(() => ({
  checkedIn: gameStore.communityTodayCheckedIn,
  streak: gameStore.communityStats.consecutiveCheckinDays,
  unreadRewards: gameStore.communityClaimableRewardsCount
}))

const handleCheckin = () => {
  const result = gameStore.communityCheckin()
  if (result.success) {
  }
}
</script>

<template>
  <div class="community-view modal-overlay" @click.self="emit('close')">
    <div class="community-content animate-slide-up" @click.stop>
      <div class="community-header">
        <div class="header-top">
          <h2 class="header-title">🎵 黑胶社群</h2>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>
        
        <div class="checkin-banner" :class="{ checked: checkinStatus.checkedIn }">
          <div class="checkin-info">
            <span class="checkin-icon">{{ checkinStatus.checkedIn ? '✅' : '📅' }}</span>
            <div class="checkin-text">
              <span class="checkin-title">{{ checkinStatus.checkedIn ? '今日已签到' : '每日签到' }}</span>
              <span class="checkin-streak">连续{{ checkinStatus.streak }}天</span>
            </div>
          </div>
          <button 
            class="checkin-btn" 
            :class="{ disabled: checkinStatus.checkedIn }"
            :disabled="checkinStatus.checkedIn"
            @click="handleCheckin"
          >
            {{ checkinStatus.checkedIn ? '已签到' : '立即签到' }}
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-icon">👥</span>
            <span class="stat-value">{{ gameStore.communityStats.activeUsers }}</span>
            <span class="stat-label">活跃乐迷</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📝</span>
            <span class="stat-value">{{ gameStore.communityStats.totalPosts }}</span>
            <span class="stat-label">总帖子</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📣</span>
            <span class="stat-value">{{ gameStore.communityTotalReach }}</span>
            <span class="stat-label">总触达</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{{ gameStore.communityStats.influenceScore }}</span>
            <span class="stat-label">影响力</span>
          </div>
        </div>

        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: currentTab === tab.id }"
            @click="switchTab(tab.id)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-name">{{ tab.name }}</span>
            <span 
              v-if="tab.id === 'rewards' && checkinStatus.unreadRewards > 0" 
              class="tab-badge"
            >
              {{ checkinStatus.unreadRewards }}
            </span>
          </button>
        </div>
      </div>

      <div class="community-body">
        <CommunityPosts v-if="currentTab === 'posts'" />
        <CommunityTrends v-else-if="currentTab === 'trends'" />
        <CommunitySpread v-else-if="currentTab === 'spread'" />
        <CommunityEvents v-else-if="currentTab === 'events'" />
        <CommunityRewards v-else-if="currentTab === 'rewards'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.community-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.community-content {
  width: 100%;
  max-width: 480px;
  height: 90vh;
  background: var(--bg-primary);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.community-header {
  background: var(--bg-card);
  padding: 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
}

.checkin-banner {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.checkin-banner.checked {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.15) 0%, rgba(56, 178, 172, 0.15) 100%);
  border-color: rgba(72, 187, 120, 0.3);
}

.checkin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkin-icon {
  font-size: 28px;
}

.checkin-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkin-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.checkin-streak {
  font-size: 11px;
  color: var(--text-secondary);
}

.checkin-btn {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.checkin-btn.disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  opacity: 0.7;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 4px;
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
  color: var(--text-secondary);
  font-size: 10px;
  position: relative;
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--accent-gold);
  font-weight: 600;
}

.tab-icon {
  font-size: 16px;
}

.tab-name {
  font-size: 10px;
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  background: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.community-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>
