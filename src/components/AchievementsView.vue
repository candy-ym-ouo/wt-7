<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import type { BusinessAchievementConfig, BusinessTitleConfig, BusinessAchievementCategory } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'achievements' | 'titles'>('achievements')
const selectedCategory = ref<BusinessAchievementCategory | 'all'>('all')
const selectedAchievement = ref<BusinessAchievementConfig | null>(null)
const selectedTitle = ref<BusinessTitleConfig | null>(null)
const claimMessage = ref<{ show: boolean; type: 'success' | 'error'; text: string } | null>(null)

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return gameStore.achievements.achievements
  }
  return gameStore.achievements.achievements.filter(a => a.category === selectedCategory.value)
})

const achievementCategories = computed(() => [
  { id: 'all' as const, name: '全部成就', icon: '🏆' },
  ...gameStore.achievementCategories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))
])

const unlockedAchievementsCount = computed(() => {
  return gameStore.achievements.achievements.filter(a => a.isUnlocked).length
})

const totalAchievementsCount = computed(() => {
  return gameStore.achievements.achievements.length
})

const unlockedTitlesCount = computed(() => {
  return gameStore.achievements.titles.filter(t => t.isUnlocked).length
})

const totalTitlesCount = computed(() => {
  return gameStore.achievements.titles.length
})

const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return '未获得'
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const getProgressPercent = (achievement: BusinessAchievementConfig): number => {
  if (achievement.progressType === 'boolean') {
    return achievement.isUnlocked ? 100 : 0
  }
  if (achievement.target === 0) return 0
  return Math.min(100, Math.round((achievement.progress / achievement.target) * 100))
}

const formatProgressValue = (achievement: BusinessAchievementConfig): string => {
  if (achievement.progressType === 'boolean') {
    return achievement.isUnlocked ? '已完成' : '未完成'
  }
  if (achievement.progressType === 'percent') {
    return `${achievement.progress}% / ${achievement.target}%`
  }
  if (achievement.progressType === 'value') {
    return `¥${achievement.progress.toLocaleString()} / ¥${achievement.target.toLocaleString()}`
  }
  return `${achievement.progress} / ${achievement.target}`
}

const openAchievementDetail = (achievement: BusinessAchievementConfig) => {
  selectedAchievement.value = achievement
}

const closeAchievementDetail = () => {
  selectedAchievement.value = null
}

const openTitleDetail = (title: BusinessTitleConfig) => {
  selectedTitle.value = title
}

const closeTitleDetail = () => {
  selectedTitle.value = null
}

const showClaimMessage = (type: 'success' | 'error', text: string) => {
  claimMessage.value = { show: true, type, text }
  setTimeout(() => {
    claimMessage.value = null
  }, 2000)
}

const claimReward = (achievementId: string) => {
  const result = gameStore.claimAchievementRewardAction(achievementId)
  showClaimMessage(result.success ? 'success' : 'error', result.message)
  if (selectedAchievement.value && selectedAchievement.value.id === achievementId) {
    const updated = gameStore.achievements.achievements.find(a => a.id === achievementId)
    if (updated) {
      selectedAchievement.value = updated
    }
  }
}

const equipTitle = (titleId: string) => {
  const result = gameStore.equipTitleAction(titleId)
  showClaimMessage(result.success ? 'success' : 'error', result.message)
  if (selectedTitle.value && selectedTitle.value.id === titleId) {
    const updated = gameStore.achievements.titles.find(t => t.id === titleId)
    if (updated) {
      selectedTitle.value = updated
    }
  }
}

const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    mythic: '#EF4444'
  }
  return colors[rarity] || colors.common
}

const getRarityBgColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: 'rgba(156, 163, 175, 0.1)',
    rare: 'rgba(59, 130, 246, 0.1)',
    epic: 'rgba(139, 92, 246, 0.1)',
    legendary: 'rgba(245, 158, 11, 0.1)',
    mythic: 'rgba(239, 68, 68, 0.1)'
  }
  return colors[rarity] || colors.common
}

const getTitleTierLabel = (tier: number): string => {
  const labels: Record<number, string> = {
    1: '一阶',
    2: '二阶',
    3: '三阶',
    4: '四阶',
    5: '五阶'
  }
  return labels[tier] || `${tier}阶`
}

const getTitleTierColor = (tier: number): string => {
  const colors: Record<number, string> = {
    1: '#9CA3AF',
    2: '#3B82F6',
    3: '#8B5CF6',
    4: '#F59E0B',
    5: '#EF4444'
  }
  return colors[tier] || colors[1]
}
</script>

<template>
  <div class="achievements-view">
    <div class="achievements-header">
      <h2>🏆 经营成就与称号</h2>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>

    <div class="achievements-tabs">
      <button 
        :class="{ active: activeTab === 'achievements' }"
        @click="activeTab = 'achievements'"
      >
        成就 ({{ unlockedAchievementsCount }}/{{ totalAchievementsCount }})
      </button>
      <button 
        :class="{ active: activeTab === 'titles' }"
        @click="activeTab = 'titles'"
      >
        称号 ({{ unlockedTitlesCount }}/{{ totalTitlesCount }})
      </button>
    </div>

    <div v-if="activeTab === 'achievements'" class="achievements-content">
      <div class="category-filters">
        <button
          v-for="cat in achievementCategories"
          :key="cat.id"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </button>
      </div>

      <div class="achievements-grid">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          :class="{ 
            'achievement-card': true, 
            'unlocked': achievement.isUnlocked,
            'claimable': achievement.isUnlocked && !achievement.rewardClaimed
          }"
          :style="{ 
            '--rarity-color': getRarityColor(achievement.rarity),
            '--rarity-bg': getRarityBgColor(achievement.rarity)
          }"
          @click="openAchievementDetail(achievement)"
        >
          <div class="achievement-icon">
            <span class="icon">{{ achievement.icon }}</span>
            <div v-if="achievement.isUnlocked && !achievement.rewardClaimed" class="claim-badge">!</div>
          </div>
          <div class="achievement-info">
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-rarity" :style="{ color: getRarityColor(achievement.rarity) }">
              {{ gameStore.getAchievementRarityLabel(achievement.rarity) }}
            </div>
            <div class="achievement-progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercent(achievement) + '%' }"
              ></div>
            </div>
            <div class="achievement-progress-text">
              {{ formatProgressValue(achievement) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'titles'" class="titles-content">
      <div v-if="gameStore.getCurrentTitle" class="current-title">
        <div class="current-title-label">当前称号</div>
        <div class="current-title-info">
          <span class="title-icon">{{ gameStore.getCurrentTitle.icon }}</span>
          <span class="title-name">{{ gameStore.getCurrentTitle.name }}</span>
        </div>
      </div>

      <div class="titles-grid">
        <div
          v-for="title in gameStore.achievements.titles"
          :key="title.id"
          :class="{ 
            'title-card': true, 
            'unlocked': title.isUnlocked,
            'equipped': title.isEquipped
          }"
          :style="{ '--tier-color': getTitleTierColor(title.tier) }"
          @click="openTitleDetail(title)"
        >
          <div class="title-icon">
            <span class="icon">{{ title.icon }}</span>
            <div v-if="title.isEquipped" class="equipped-badge">已装备</div>
          </div>
          <div class="title-info">
            <div class="title-name">{{ title.name }}</div>
            <div class="title-tier" :style="{ color: getTitleTierColor(title.tier) }">
              {{ getTitleTierLabel(title.tier) }}
            </div>
            <div class="title-effect">{{ title.bonusEffect }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedAchievement" class="modal-overlay" @click="closeAchievementDetail">
      <div class="modal-content achievement-detail" @click.stop>
        <button class="modal-close" @click="closeAchievementDetail">✕</button>
        
        <div 
          class="detail-header"
          :style="{ 
            '--rarity-color': getRarityColor(selectedAchievement.rarity),
            '--rarity-bg': getRarityBgColor(selectedAchievement.rarity)
          }"
        >
          <span class="detail-icon">{{ selectedAchievement.icon }}</span>
          <h3>{{ selectedAchievement.name }}</h3>
          <div class="detail-rarity" :style="{ color: getRarityColor(selectedAchievement.rarity) }">
            {{ gameStore.getAchievementRarityLabel(selectedAchievement.rarity) }}
          </div>
        </div>

        <div class="detail-body">
          <p class="detail-description">{{ selectedAchievement.description }}</p>
          
          <div class="detail-progress">
            <div class="progress-label">
              <span>进度</span>
              <span>{{ formatProgressValue(selectedAchievement) }}</span>
            </div>
            <div class="progress-bar-large">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercent(selectedAchievement) + '%' }"
              ></div>
            </div>
          </div>

          <div class="detail-reward">
            <div class="reward-label">奖励</div>
            <div class="reward-items">
              <span v-if="selectedAchievement.reward.budget" class="reward-item">
                💰 ¥{{ selectedAchievement.reward.budget.toLocaleString() }}
              </span>
              <span v-if="selectedAchievement.reward.reputation" class="reward-item">
                ⭐ 声望 +{{ selectedAchievement.reward.reputation }}
              </span>
              <span v-if="selectedAchievement.reward.growthPoints" class="reward-item">
                📈 成长点 +{{ selectedAchievement.reward.growthPoints }}
              </span>
            </div>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">解锁日期</span>
              <span class="meta-value">{{ formatDate(selectedAchievement.unlockedDate) }}</span>
            </div>
          </div>

          <div v-if="selectedAchievement.isUnlocked && !selectedAchievement.rewardClaimed">
            <button class="claim-btn" @click="claimReward(selectedAchievement.id)">
              领取奖励
            </button>
          </div>
          <div v-else-if="selectedAchievement.rewardClaimed" class="claimed-text">
            ✓ 奖励已领取
          </div>
          <div v-else class="locked-text">
            🔒 未解锁
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTitle" class="modal-overlay" @click="closeTitleDetail">
      <div class="modal-content title-detail" @click.stop>
        <button class="modal-close" @click="closeTitleDetail">✕</button>
        
        <div 
          class="detail-header"
          :style="{ '--tier-color': getTitleTierColor(selectedTitle.tier) }"
        >
          <span class="detail-icon">{{ selectedTitle.icon }}</span>
          <h3>{{ selectedTitle.name }}</h3>
          <div class="detail-tier" :style="{ color: getTitleTierColor(selectedTitle.tier) }">
            {{ getTitleTierLabel(selectedTitle.tier) }}
          </div>
        </div>

        <div class="detail-body">
          <p class="detail-description">{{ selectedTitle.description }}</p>
          
          <div class="detail-bonus">
            <div class="bonus-label">称号加成</div>
            <div class="bonus-effect">
              <span class="bonus-name">{{ selectedTitle.bonusEffect }}</span>
              <span class="bonus-value">+{{ selectedTitle.bonusValue }}%</span>
            </div>
          </div>

          <div class="detail-requirements">
            <div class="req-label">解锁条件</div>
            <div class="req-list">
              <div 
                v-for="achId in selectedTitle.requiredAchievementIds" 
                :key="achId" 
                :class="{ 
                  'req-item': true,
                  'completed': gameStore.achievements.achievements.find(a => a.id === achId)?.isUnlocked
                }"
              >
                <span class="req-icon">
                  {{ gameStore.achievements.achievements.find(a => a.id === achId)?.isUnlocked ? '✓' : '○' }}
                </span>
                <span class="req-name">
                  {{ gameStore.achievements.achievements.find(a => a.id === achId)?.name || achId }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">解锁日期</span>
              <span class="meta-value">{{ formatDate(selectedTitle.unlockedDate) }}</span>
            </div>
          </div>

          <div v-if="selectedTitle.isUnlocked && !selectedTitle.isEquipped">
            <button class="equip-btn" @click="equipTitle(selectedTitle.id)">
              装备称号
            </button>
          </div>
          <div v-else-if="selectedTitle.isEquipped" class="equipped-text">
            ✓ 已装备
          </div>
          <div v-else class="locked-text">
            🔒 未解锁
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="claimMessage?.show" :class="['claim-message', claimMessage.type]">
        {{ claimMessage.text }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.achievements-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: #fff;
}

.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.achievements-header h2 {
  margin: 0;
  font-size: 24px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.achievements-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.achievements-tabs button {
  flex: 1;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.achievements-tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.achievements-tabs button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.achievements-tabs button.active:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.category-filters button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.category-filters button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.category-filters button.active {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.cat-icon {
  font-size: 16px;
}

.achievements-content,
.titles-content {
  flex: 1;
  overflow-y: auto;
}

.achievements-grid,
.titles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.achievement-card,
.title-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  border: 2px solid transparent;
}

.achievement-card {
  border-color: var(--rarity-color, transparent);
  background: var(--rarity-bg, rgba(255, 255, 255, 0.08));
}

.title-card {
  border-color: var(--tier-color, transparent);
}

.achievement-card:hover,
.title-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.achievement-card.unlocked,
.title-card.unlocked {
  opacity: 1;
}

.achievement-card:not(.unlocked),
.title-card:not(.unlocked) {
  opacity: 0.5;
}

.achievement-card.claimable {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

.achievement-icon,
.title-icon {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.achievement-icon .icon,
.title-icon .icon {
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.claim-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: #F59E0B;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.equipped-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: #10B981;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  white-space: nowrap;
}

.achievement-info,
.title-info {
  flex: 1;
  min-width: 0;
}

.achievement-name,
.title-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.achievement-rarity,
.title-tier {
  font-size: 12px;
  margin-bottom: 8px;
}

.achievement-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.achievement-progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.title-effect {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.current-title {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.current-title-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.current-title-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-title-info .title-icon {
  font-size: 36px;
}

.current-title-info .title-name {
  font-size: 20px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.detail-header {
  text-align: center;
  padding: 30px 20px 20px;
  background: var(--rarity-bg, var(--tier-bg, rgba(255, 255, 255, 0.05)));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 12px;
}

.detail-header h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
}

.detail-rarity,
.detail-tier {
  font-size: 14px;
}

.detail-body {
  padding: 20px;
}

.detail-description {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.detail-progress,
.detail-reward,
.detail-bonus,
.detail-requirements,
.detail-meta {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.reward-label,
.bonus-label,
.req-label,
.meta-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.bonus-effect {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(102, 126, 234, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
}

.bonus-name {
  font-size: 14px;
}

.bonus-value {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.req-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.req-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  opacity: 0.6;
}

.req-item.completed {
  opacity: 1;
  background: rgba(16, 185, 129, 0.1);
}

.req-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.req-item.completed .req-icon {
  color: #10B981;
}

.req-name {
  font-size: 14px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.meta-value {
  font-size: 14px;
}

.claim-btn,
.equip-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.claim-btn:hover,
.equip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.claimed-text,
.equipped-text {
  text-align: center;
  padding: 14px;
  color: #10B981;
  font-size: 16px;
  font-weight: 600;
}

.locked-text {
  text-align: center;
  padding: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}

.claim-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 1200;
  animation: fadeIn 0.3s ease;
}

.claim-message.success {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
}

.claim-message.error {
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .achievements-view {
    padding: 12px;
  }
  
  .achievements-grid,
  .titles-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-card,
  .title-card {
    padding: 12px;
  }
  
  .achievement-icon,
  .title-icon {
    width: 50px;
    height: 50px;
  }
  
  .achievement-icon .icon,
  .title-icon .icon {
    font-size: 40px;
  }
}
</style>
