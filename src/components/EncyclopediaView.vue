<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, watch } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type {
  EncyclopediaSeries,
  EncyclopediaAchievement,
  EncyclopediaMilestone,
  EncyclopediaEntry,
  EncyclopediaFilterOptions
} from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'catalog' | 'series' | 'achievements' | 'milestones'>('catalog')
const selectedEntry = ref<EncyclopediaEntry | null>(null)
const selectedSeries = ref<EncyclopediaSeries | null>(null)
const selectedAchievement = ref<EncyclopediaAchievement | null>(null)
const claimMessage = ref<{ show: boolean; type: 'success' | 'error'; text: string } | null>(null)

const filters = ref<EncyclopediaFilterOptions>({
  category: 'all',
  rarity: 'all',
  collected: 'all',
  sortBy: 'rarity'
})

const filterCategories = computed(() => [
  { id: 'all', name: '全部分类', icon: '📚' },
  ...gameStore.encyclopedia.categories
    .filter(c => c.isUnlocked)
    .map(c => ({ id: c.id, name: c.name, icon: c.icon }))
])

const rarityFilters = computed(() => [
  { tier: 'all' as const, name: '全部稀有度', icon: '🎯' },
  ...gameStore.rarityConfigs.map(r => ({ tier: r.tier, name: r.tierName, icon: r.icon }))
])

const filteredEntries = computed(() => {
  return gameStore.getFilteredEncyclopediaEntries(filters.value)
})

const unlockedCategories = computed(() => {
  return gameStore.encyclopedia.categories.filter(c => c.isUnlocked)
})

const lockedCategories = computed(() => {
  return gameStore.encyclopedia.categories.filter(c => !c.isUnlocked)
})

const claimableSeries = computed(() => {
  const result: { series: EncyclopediaSeries; categoryId: string }[] = []
  for (const category of gameStore.encyclopedia.categories) {
    for (const series of category.series) {
      if (series.isCompleted && !series.rewardClaimed && series.isUnlocked) {
        result.push({ series, categoryId: category.id })
      }
    }
  }
  return result
})

const claimableAchievements = computed(() => {
  return gameStore.encyclopedia.achievements.filter(a => a.isUnlocked && !a.rewardClaimed)
})

const claimableMilestones = computed(() => {
  return gameStore.encyclopedia.milestones.filter(m => m.isCompleted && !m.isClaimed)
})

const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return '未获得'
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const rarityStars = (rarity: number): string => {
  return '★'.repeat(rarity) + '☆'.repeat(5 - rarity)
}

const getBonusTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'reputation': '声望',
    'match_score': '匹配度',
    'customer_budget': '顾客预算',
    'buy_chance': '购买概率',
    'level_reward': '关卡奖励',
    'special_customer': '特殊顾客',
    'price_bonus': '售价加成',
    'record_unlock': '稀有唱片'
  }
  return labels[type] || type
}

const formatBonusValue = (type: string, value: number): string => {
  if (type === 'reputation' || type === 'match_score') {
    return `+${value}`
  }
  return `+${Math.round(value * 100)}%`
}

const openEntryDetail = (entry: EncyclopediaEntry) => {
  selectedEntry.value = entry
}

const closeEntryDetail = () => {
  selectedEntry.value = null
}

const openSeriesDetail = (series: EncyclopediaSeries) => {
  selectedSeries.value = series
}

const closeSeriesDetail = () => {
  selectedSeries.value = null
}

const openAchievementDetail = (achievement: EncyclopediaAchievement) => {
  selectedAchievement.value = achievement
}

const closeAchievementDetail = () => {
  selectedAchievement.value = null
}

const showClaimMessage = (type: 'success' | 'error', text: string) => {
  claimMessage.value = { show: true, type, text }
  setTimeout(() => {
    claimMessage.value = null
  }, 2000)
}

const claimSeriesReward = (seriesId: string) => {
  const result = gameStore.claimEncyclopediaSeriesReward(seriesId)
  showClaimMessage(result.success ? 'success' : 'error', result.message)
}

const claimAchievementReward = (achievementId: string) => {
  const result = gameStore.claimEncyclopediaAchievementReward(achievementId)
  showClaimMessage(result.success ? 'success' : 'error', result.message)
}

const claimMilestoneReward = (milestoneId: string) => {
  const result = gameStore.claimEncyclopediaMilestoneReward(milestoneId)
  showClaimMessage(result.success ? 'success' : 'error', result.message)
}

const getSeriesTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'genre': '风格套系',
    'artist': '艺人套系',
    'decade': '年代套系',
    'theme': '主题套系',
    'special': '特殊套系'
  }
  return labels[type] || type
}

const getAchievementCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'collection': '收藏成就',
    'series': '套系成就',
    'rarity': '稀有成就',
    'condition': '品相成就',
    'special': '特殊成就'
  }
  return labels[category] || category
}

const getMilestoneMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    'total_collected': '收集数量',
    'total_value': '收藏价值',
    'rare_count': '稀有数量',
    'perfect_count': '完美品相',
    'series_completed': '套系完成'
  }
  return labels[metric] || metric
}

const getAchievementProgressPercent = (achievement: EncyclopediaAchievement): number => {
  if (achievement.isUnlocked) return 100
  return Math.min(100, Math.round((achievement.current / achievement.target) * 100))
}

const getMilestoneProgressPercent = (milestone: EncyclopediaMilestone): number => {
  if (milestone.isCompleted) return 100
  const current = getMilestoneCurrentValue(milestone)
  return Math.min(100, Math.round((current / milestone.target) * 100))
}

const getMilestoneCurrentValue = (milestone: EncyclopediaMilestone): number => {
  const collection = gameStore.collection
  switch (milestone.metric) {
    case 'total_collected':
      return collection.length
    case 'total_value':
      return Math.round(collection.reduce((sum, c) => sum + c.collectionValue, 0))
    case 'rare_count':
      return collection.filter(c => c.record.rarity >= 4).length
    case 'perfect_count':
      return collection.filter(c => c.conditionScore >= 95).length
    case 'series_completed':
      return gameStore.encyclopedia.categories.reduce((sum, cat) =>
        sum + cat.series.filter(s => s.isCompleted).length, 0
      )
    default:
      return 0
  }
}

const getRecordById = (id: string) => {
  return gameStore.encyclopedia.entries.find(e => e.record.id === id)
}

const isRecordCollected = (recordId: string): boolean => {
  const entry = getRecordById(recordId)
  return entry?.isCollected || false
}

const getRecordCondition = (recordId: string): number => {
  const entry = getRecordById(recordId)
  return entry?.bestConditionScore || 0
}

const checkMeetsRequirements = (
  recordId: string,
  minCondition?: number,
  minRarity?: number
): boolean => {
  const entry = getRecordById(recordId)
  if (!entry || !entry.isCollected) return false
  
  const meetsCondition = minCondition ? entry.bestConditionScore >= minCondition : true
  const meetsRarity = minRarity ? entry.record.rarity >= minRarity : true
  
  return meetsCondition && meetsRarity
}

watch(() => gameStore.encyclopediaNotification, (notification) => {
  if (notification?.show) {
    showClaimMessage('success', `${notification.name} - ${notification.message}`)
  }
}, { deep: true })
</script>

<template>
  <div class="encyclopedia-view">
    <div class="ev-header">
      <button class="back-btn" @click="emit('close')">← 返回</button>
      <h1 class="ev-title">📖 唱片百科图鉴</h1>
      <div class="ev-stats">
        <span class="ev-stat">
          <span class="ev-stat-icon">📀</span>
          {{ gameStore.encyclopedia.stats.collectedRecords }}/{{ gameStore.encyclopedia.stats.totalRecords }}
        </span>
        <span v-if="gameStore.getClaimableRewardsCount > 0" class="ev-stat ev-claimable">
          <span class="ev-stat-icon">🎁</span>
          {{ gameStore.getClaimableRewardsCount }} 个奖励待领取
        </span>
      </div>
    </div>

    <div class="ev-overview card">
      <div class="evo-grid">
        <div class="evo-item">
          <span class="evo-icon">📚</span>
          <div class="evo-info">
            <span class="evo-value">{{ gameStore.encyclopedia.stats.collectionProgress }}%</span>
            <span class="evo-label">收集进度</span>
          </div>
        </div>
        <div class="evo-item">
          <span class="evo-icon">💎</span>
          <div class="evo-info">
            <span class="evo-value">{{ gameStore.encyclopedia.stats.rareRecordsCount }}</span>
            <span class="evo-label">稀有唱片</span>
          </div>
        </div>
        <div class="evo-item">
          <span class="evo-icon">✨</span>
          <div class="evo-info">
            <span class="evo-value">{{ gameStore.encyclopedia.stats.perfectRecordsCount }}</span>
            <span class="evo-label">完美品相</span>
          </div>
        </div>
        <div class="evo-item">
          <span class="evo-icon">💰</span>
          <div class="evo-info">
            <span class="evo-value">¥{{ gameStore.encyclopedia.stats.totalCollectionValue.toLocaleString() }}</span>
            <span class="evo-label">总价值</span>
          </div>
        </div>
        <div class="evo-item">
          <span class="evo-icon">🎯</span>
          <div class="evo-info">
            <span class="evo-value">{{ gameStore.encyclopedia.stats.completedSeries }}/{{ gameStore.encyclopedia.stats.totalSeries }}</span>
            <span class="evo-label">套系完成</span>
          </div>
        </div>
        <div class="evo-item">
          <span class="evo-icon">🏆</span>
          <div class="evo-info">
            <span class="evo-value">{{ gameStore.encyclopedia.stats.unlockedAchievements }}/{{ gameStore.encyclopedia.stats.totalAchievements }}</span>
            <span class="evo-label">成就解锁</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ev-tabs">
      <button
        class="ev-tab"
        :class="{ active: activeTab === 'catalog' }"
        @click="activeTab = 'catalog'"
      >
        📀 唱片图鉴
      </button>
      <button
        class="ev-tab"
        :class="{ active: activeTab === 'series' }"
        @click="activeTab = 'series'"
      >
        🎯 套系收集
        <span v-if="claimableSeries.length > 0" class="tab-badge">{{ claimableSeries.length }}</span>
      </button>
      <button
        class="ev-tab"
        :class="{ active: activeTab === 'achievements' }"
        @click="activeTab = 'achievements'"
      >
        🏆 成就展示
        <span v-if="claimableAchievements.length > 0" class="tab-badge">{{ claimableAchievements.length }}</span>
      </button>
      <button
        class="ev-tab"
        :class="{ active: activeTab === 'milestones' }"
        @click="activeTab = 'milestones'"
      >
        ⭐ 里程碑
        <span v-if="claimableMilestones.length > 0" class="tab-badge">{{ claimableMilestones.length }}</span>
      </button>
    </div>

    <template v-if="activeTab === 'catalog'">
      <div class="ev-toolbar">
        <div class="filter-group">
          <button
            v-for="cat in filterCategories"
            :key="cat.id"
            class="filter-btn"
            :class="{ active: filters.category === cat.id }"
            @click="filters.category = cat.id"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
        <div class="filter-group">
          <button
            v-for="rf in rarityFilters"
            :key="rf.tier"
            class="filter-btn filter-btn-sm"
            :class="{ active: filters.rarity === rf.tier }"
            @click="filters.rarity = rf.tier"
          >
            {{ rf.icon }} {{ rf.name }}
          </button>
        </div>
        <div class="filter-group">
          <button
            v-for="opt in [
              { key: 'all', label: '全部' },
              { key: 'collected', label: '已收集' },
              { key: 'uncollected', label: '未收集' }
            ]"
            :key="opt.key"
            class="filter-btn filter-btn-sm"
            :class="{ active: filters.collected === opt.key }"
            @click="filters.collected = opt.key as any"
          >
            {{ opt.label }}
          </button>
        </div>
        <select v-model="filters.sortBy" class="sort-select">
          <option value="rarity">按稀有度</option>
          <option value="name">按名称</option>
          <option value="date">按获得日期</option>
          <option value="value">按价值</option>
        </select>
      </div>

      <div v-if="filteredEntries.length > 0" class="catalog-grid">
        <div
          v-for="entry in filteredEntries"
          :key="entry.record.id"
          class="catalog-card"
          :class="{ 
            collected: entry.isCollected,
            uncollected: !entry.isCollected,
            legendary: entry.record.rarity === 5,
            epic: entry.record.rarity === 4
          }"
          @click="openEntryDetail(entry)"
        >
          <div class="cc-cover">
            <div v-if="!entry.isCollected" class="cc-lock">🔒</div>
            <VinylRecord 
              :record="entry.record" 
              size="medium" 
              :class="{ 'grayscale': !entry.isCollected }"
            />
            <div 
              class="cc-rarity-badge"
              :style="{ background: gameStore.getRarityColor(entry.record.rarity) }"
            >
              {{ rarityStars(entry.record.rarity) }}
            </div>
          </div>
          <div class="cc-info">
            <h4 class="cc-title" :class="{ 'text-muted': !entry.isCollected }">
              {{ entry.isCollected ? entry.record.title : '???' }}
            </h4>
            <p class="cc-artist" :class="{ 'text-muted': !entry.isCollected }">
              {{ entry.isCollected ? entry.record.artist : '未解锁' }}
            </p>
            <div class="cc-meta">
              <span class="cc-genre">{{ entry.record.genre }}</span>
              <span v-if="entry.isCollected" class="cc-date">
                {{ formatDate(entry.firstCollectedDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="es-icon">📀</div>
        <h3>暂无唱片</h3>
        <p>调整筛选条件或继续收集唱片吧！</p>
      </div>
    </template>

    <template v-else-if="activeTab === 'series'">
      <div v-if="claimableSeries.length > 0" class="claimable-section card">
        <h3 class="cs-title">🎁 待领取奖励</h3>
        <div class="claimable-list">
          <div 
            v-for="item in claimableSeries" 
            :key="item.series.id"
            class="claimable-item"
          >
            <div class="ci-icon" :style="{ background: item.series.coverColor + '20' }">
              {{ item.series.icon }}
            </div>
            <div class="ci-info">
              <span class="ci-name">{{ item.series.name }}</span>
              <span class="ci-desc">套系完成奖励</span>
            </div>
            <button 
              class="claim-btn"
              @click.stop="claimSeriesReward(item.series.id)"
            >
              领取奖励
            </button>
          </div>
        </div>
      </div>

      <div class="series-categories">
        <div 
          v-for="category in unlockedCategories" 
          :key="category.id"
          class="series-category card"
        >
          <div class="sc-header">
            <div class="sc-icon" :style="{ background: category.coverColor }">
              {{ category.icon }}
            </div>
            <div class="sc-info">
              <h3 class="sc-name">{{ category.name }}</h3>
              <p class="sc-desc">{{ category.description }}</p>
              <div class="sc-progress">
                <span class="sc-progress-text">
                  {{ category.series.filter(s => s.isCompleted).length }}/{{ category.series.length }} 套系完成
                </span>
              </div>
            </div>
          </div>

          <div class="series-list">
            <div
              v-for="series in category.series"
              :key="series.id"
              class="series-card"
              :class="{ 
                unlocked: series.isUnlocked,
                locked: !series.isUnlocked,
                completed: series.isCompleted,
                'claimable': series.isCompleted && !series.rewardClaimed
              }"
              @click="series.isUnlocked && openSeriesDetail(series)"
            >
              <div class="ser-icon" :style="{ background: series.coverColor + '20' }">
                {{ series.isUnlocked ? series.icon : '🔒' }}
              </div>
              <div class="ser-info">
                <div class="ser-header">
                  <h4 class="ser-name">
                    {{ series.isUnlocked ? series.name : '???' }}
                    <span v-if="series.isCompleted" class="ser-badge completed">✓ 已完成</span>
                    <span v-if="series.isCompleted && !series.rewardClaimed" class="ser-badge claimable">
                      🎁 可领取
                    </span>
                  </h4>
                  <span class="ser-type">{{ getSeriesTypeLabel(series.type) }}</span>
                </div>
                <p v-if="series.isUnlocked" class="ser-desc">{{ series.description }}</p>
                <p v-else class="ser-desc text-muted">
                  需要达到第 {{ series.unlockLevel }} 关解锁
                </p>
                <div v-if="series.isUnlocked" class="ser-progress">
                  <div class="ser-progress-bar">
                    <div 
                      class="ser-progress-fill"
                      :style="{ 
                        width: gameStore.getEncyclopediaSeriesProgress(series) + '%',
                        background: series.isCompleted ? 'var(--success)' : 'var(--accent-gold)'
                      }"
                    ></div>
                  </div>
                  <span class="ser-progress-text">
                    {{ gameStore.getEncyclopediaSeriesProgress(series) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="lockedCategories.length > 0" class="locked-categories">
          <h3 class="lc-title">🔒 待解锁分类</h3>
          <div class="locked-list">
            <div 
              v-for="category in lockedCategories" 
              :key="category.id"
              class="locked-category card"
            >
              <div class="lc-icon">🔒</div>
              <div class="lc-info">
                <span class="lc-name">{{ category.name }}</span>
                <span class="lc-desc">第 {{ category.unlockLevel }} 关解锁</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="activeTab === 'achievements'">
      <div v-if="claimableAchievements.length > 0" class="claimable-section card">
        <h3 class="cs-title">🎁 待领取成就奖励</h3>
        <div class="claimable-list">
          <div 
            v-for="ach in claimableAchievements" 
            :key="ach.id"
            class="claimable-item"
          >
            <div class="ci-icon" style="background: rgba(245, 158, 11, 0.2)">
              {{ ach.icon }}
            </div>
            <div class="ci-info">
              <span class="ci-name">{{ ach.name }}</span>
              <span class="ci-desc">成就奖励</span>
            </div>
            <button 
              class="claim-btn"
              @click.stop="claimAchievementReward(ach.id)"
            >
              领取奖励
            </button>
          </div>
        </div>
      </div>

      <div class="achievements-grid">
        <div
          v-for="achievement in gameStore.encyclopedia.achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{
            unlocked: achievement.isUnlocked,
            locked: !achievement.isUnlocked,
            claimable: achievement.isUnlocked && !achievement.rewardClaimed
          }"
          @click="openAchievementDetail(achievement)"
        >
          <div 
            class="ach-icon"
            :class="{ unlocked: achievement.isUnlocked }"
          >
            {{ achievement.isUnlocked ? achievement.icon : '🔒' }}
          </div>
          <div class="ach-info">
            <div class="ach-header">
              <h4 class="ach-name">
                {{ achievement.isUnlocked ? achievement.name : '???' }}
              </h4>
              <span class="ach-category">{{ getAchievementCategoryLabel(achievement.category) }}</span>
            </div>
            <p class="ach-desc">
              {{ achievement.isUnlocked ? achievement.description : '完成特定条件解锁' }}
            </p>
            <div class="ach-progress">
              <div class="ach-progress-bar">
                <div 
                  class="ach-progress-fill"
                  :style="{ 
                    width: getAchievementProgressPercent(achievement) + '%',
                    background: achievement.isUnlocked ? 'var(--success)' : 'var(--accent-gold)'
                  }"
                ></div>
              </div>
              <span class="ach-progress-text">
                {{ achievement.isUnlocked ? '已解锁' : `${achievement.current}/${achievement.target}` }}
              </span>
            </div>
            <div v-if="achievement.isUnlocked && !achievement.rewardClaimed" class="ach-claim-hint">
              🎁 点击领取奖励
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="activeTab === 'milestones'">
      <div v-if="claimableMilestones.length > 0" class="claimable-section card">
        <h3 class="cs-title">🎁 待领取里程碑奖励</h3>
        <div class="claimable-list">
          <div 
            v-for="mile in claimableMilestones" 
            :key="mile.id"
            class="claimable-item"
          >
            <div class="ci-icon" style="background: rgba(16, 185, 129, 0.2)">
              {{ mile.icon }}
            </div>
            <div class="ci-info">
              <span class="ci-name">{{ mile.name }}</span>
              <span class="ci-desc">里程碑奖励</span>
            </div>
            <button 
              class="claim-btn"
              @click.stop="claimMilestoneReward(mile.id)"
            >
              领取奖励
            </button>
          </div>
        </div>
      </div>

      <div class="milestones-list">
        <div
          v-for="milestone in gameStore.encyclopedia.milestones"
          :key="milestone.id"
          class="milestone-card card"
          :class="{
            completed: milestone.isCompleted,
            claimable: milestone.isCompleted && !milestone.isClaimed
          }"
        >
          <div class="mile-icon" :class="{ completed: milestone.isCompleted }">
            {{ milestone.icon }}
          </div>
          <div class="mile-info">
            <div class="mile-header">
              <h4 class="mile-name">{{ milestone.name }}</h4>
              <span v-if="milestone.isClaimed" class="mile-badge">✓ 已领取</span>
              <span v-else-if="milestone.isCompleted" class="mile-badge claimable">🎁 可领取</span>
            </div>
            <p class="mile-desc">{{ milestone.description }}</p>
            <div class="mile-progress">
              <div class="mile-progress-bar">
                <div 
                  class="mile-progress-fill"
                  :style="{ 
                    width: getMilestoneProgressPercent(milestone) + '%',
                    background: milestone.isCompleted ? 'var(--success)' : 'var(--accent-gold)'
                  }"
                ></div>
              </div>
              <span class="mile-progress-text">
                {{ getMilestoneCurrentValue(milestone).toLocaleString() }}/{{ milestone.target.toLocaleString() }}
                ({{ getMilestoneMetricLabel(milestone.metric) }})
              </span>
            </div>
            <div class="mile-rewards">
              <span 
                v-for="(bonus, idx) in milestone.rewards" 
                :key="idx"
                class="mile-reward-tag"
              >
                {{ getBonusTypeLabel(bonus.type) }} {{ formatBonusValue(bonus.type, bonus.value) }}
              </span>
            </div>
          </div>
          <button
            v-if="milestone.isCompleted && !milestone.isClaimed"
            class="claim-btn mile-claim-btn"
            @click.stop="claimMilestoneReward(milestone.id)"
          >
            领取
          </button>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="claimMessage?.show" class="toast-message" :class="claimMessage.type">
        {{ claimMessage.text }}
      </div>

      <div v-if="selectedEntry" class="modal-overlay" @click.self="closeEntryDetail">
        <div class="modal-content animate-slide-up encyclopedia-modal">
          <div class="modal-header">
            <h3>唱片详情</h3>
            <button class="close-btn" @click="closeEntryDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="entry-detail-cover" :class="{ 'uncollected': !selectedEntry.isCollected }">
              <div v-if="!selectedEntry.isCollected" class="edc-lock">🔒 未收集</div>
              <VinylRecord 
                :record="selectedEntry.record" 
                size="large" 
                :spinning="selectedEntry.isCollected"
                :class="{ 'grayscale': !selectedEntry.isCollected }"
              />
            </div>

            <div class="entry-detail-info">
              <div class="edi-header">
                <h2 class="edi-title" :class="{ 'text-muted': !selectedEntry.isCollected }">
                  {{ selectedEntry.isCollected ? selectedEntry.record.title : '???' }}
                </h2>
                <div 
                  class="edi-rarity"
                  :style="{ color: gameStore.getRarityColor(selectedEntry.record.rarity) }"
                >
                  {{ rarityStars(selectedEntry.record.rarity) }}
                  {{ gameStore.getRarityConfig(selectedEntry.record.rarity).tierName }}
                </div>
              </div>
              <p class="edi-artist" :class="{ 'text-muted': !selectedEntry.isCollected }">
                {{ selectedEntry.isCollected ? selectedEntry.record.artist : '未解锁艺人信息' }}
              </p>

              <div class="edi-tags">
                <span class="edi-tag">{{ selectedEntry.record.genre }}</span>
                <span class="edi-tag">{{ selectedEntry.record.year }}年</span>
                <span class="edi-tag">{{ selectedEntry.record.trackCount }}首曲目</span>
              </div>

              <div v-if="selectedEntry.isCollected" class="edi-stats card">
                <div class="edi-stat">
                  <span class="edi-stat-icon">📅</span>
                  <div class="edi-stat-info">
                    <span class="edi-stat-value">{{ formatDate(selectedEntry.firstCollectedDate) }}</span>
                    <span class="edi-stat-label">获得日期</span>
                  </div>
                </div>
                <div class="edi-stat">
                  <span class="edi-stat-icon">🔄</span>
                  <div class="edi-stat-info">
                    <span class="edi-stat-value">{{ selectedEntry.collectedCount }}次</span>
                    <span class="edi-stat-label">收集次数</span>
                  </div>
                </div>
                <div class="edi-stat">
                  <span class="edi-stat-icon">⭐</span>
                  <div class="edi-stat-info">
                    <span class="edi-stat-value">{{ selectedEntry.bestConditionScore }}分</span>
                    <span class="edi-stat-label">最佳品相</span>
                  </div>
                </div>
                <div class="edi-stat">
                  <span class="edi-stat-icon">💰</span>
                  <div class="edi-stat-info">
                    <span class="edi-stat-value">¥{{ selectedEntry.record.marketPrice }}</span>
                    <span class="edi-stat-label">市场价值</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedEntry.isCollected" class="edi-description card">
                <h4 class="section-title">📖 专辑介绍</h4>
                <p>{{ selectedEntry.record.description }}</p>
              </div>

              <div v-if="selectedEntry.seriesMemberships.length > 0" class="edi-series card">
                <h4 class="section-title">🎯 所属套系</h4>
                <div class="edi-series-list">
                  <div 
                    v-for="seriesId in selectedEntry.seriesMemberships" 
                    :key="seriesId"
                    class="edi-series-item"
                  >
                    <template v-for="category in gameStore.encyclopedia.categories" :key="category.id">
                      <template v-for="series in category.series" :key="series.id">
                        <template v-if="series.id === seriesId && series.isUnlocked">
                          <span class="esi-icon">{{ series.icon }}</span>
                          <span class="esi-name">{{ series.name }}</span>
                          <span 
                            class="esi-status"
                            :class="{ completed: series.isCompleted }"
                          >
                            {{ series.isCompleted ? '✓ 已完成' : `${gameStore.getEncyclopediaSeriesProgress(series)}%` }}
                          </span>
                        </template>
                      </template>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else class="edi-series card">
                <h4 class="section-title">🎯 所属套系</h4>
                <p class="text-muted">该唱片暂未加入任何套系</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedSeries" class="modal-overlay" @click.self="closeSeriesDetail">
        <div class="modal-content animate-slide-up encyclopedia-modal">
          <div class="modal-header">
            <h3>套系详情</h3>
            <button class="close-btn" @click="closeSeriesDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="series-detail-header card">
              <div class="sdh-icon" :style="{ background: selectedSeries.coverColor }">
                {{ selectedSeries.icon }}
              </div>
              <div class="sdh-info">
                <h2 class="sdh-name">{{ selectedSeries.name }}</h2>
                <p class="sdh-type">{{ getSeriesTypeLabel(selectedSeries.type) }}</p>
                <p class="sdh-desc">{{ selectedSeries.description }}</p>
                <div class="sdh-progress">
                  <div class="sdh-progress-bar">
                    <div 
                      class="sdh-progress-fill"
                      :style="{ 
                        width: gameStore.getEncyclopediaSeriesProgress(selectedSeries) + '%',
                        background: selectedSeries.isCompleted ? 'var(--success)' : 'var(--accent-gold)'
                      }"
                    ></div>
                  </div>
                  <span class="sdh-progress-text">
                    {{ gameStore.getEncyclopediaSeriesProgress(selectedSeries) }}% 完成
                  </span>
                </div>
              </div>
            </div>

            <div v-if="selectedSeries.isCompleted && !selectedSeries.rewardClaimed" class="sd-claim-section card">
              <div class="sdc-info">
                <span class="sdc-icon">🎁</span>
                <div class="sdc-text">
                  <span class="sdc-title">套系完成奖励</span>
                  <div class="sdc-rewards">
                    <span 
                      v-for="(bonus, idx) in selectedSeries.rewards" 
                      :key="idx"
                      class="sdc-reward-tag"
                    >
                      {{ getBonusTypeLabel(bonus.type) }} {{ formatBonusValue(bonus.type, bonus.value) }}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                class="claim-btn sdc-claim-btn"
                @click="claimSeriesReward(selectedSeries.id)"
              >
                立即领取
              </button>
            </div>

            <div class="sd-requirements card">
              <h4 class="section-title">
                📋 收集要求
                <span v-if="selectedSeries.requiredMinCondition" class="req-tag">
                  品相 ≥ {{ selectedSeries.requiredMinCondition }}分
                </span>
                <span v-if="selectedSeries.requiredMinRarity" class="req-tag">
                  稀有度 ≥ {{ selectedSeries.requiredMinRarity }}星
                </span>
              </h4>
              <div class="sd-records-grid">
                <div
                  v-for="recordId in selectedSeries.requiredRecordIds"
                  :key="recordId"
                  class="sd-record-item"
                  :class="{ 
                    collected: checkMeetsRequirements(recordId, selectedSeries.requiredMinCondition, selectedSeries.requiredMinRarity),
                    'partial': isRecordCollected(recordId) && !checkMeetsRequirements(recordId, selectedSeries.requiredMinCondition, selectedSeries.requiredMinRarity),
                    uncollected: !isRecordCollected(recordId)
                  }"
                >
                  <div class="sdri-status">
                    <span v-if="checkMeetsRequirements(recordId, selectedSeries.requiredMinCondition, selectedSeries.requiredMinRarity)">✓</span>
                    <span v-else-if="isRecordCollected(recordId)">!</span>
                    <span v-else>○</span>
                  </div>
                  <div class="sdri-info">
                    <span class="sdri-title" :class="{ 'text-muted': !isRecordCollected(recordId) }">
                      {{ isRecordCollected(recordId) ? getRecordById(recordId)?.record.title : '???' }}
                    </span>
                    <span class="sdri-meta">
                      <template v-if="isRecordCollected(recordId)">
                        <span :style="{ color: gameStore.getRarityColor(getRecordById(recordId)?.record.rarity || 1) }">
                          {{ rarityStars(getRecordById(recordId)?.record.rarity || 1) }}
                        </span>
                        <span>品相 {{ getRecordCondition(recordId) }}分</span>
                        <template v-if="selectedSeries.requiredMinCondition && getRecordCondition(recordId) < selectedSeries.requiredMinCondition">
                          <span class="sdri-warning">（需要 ≥{{ selectedSeries.requiredMinCondition }}分）</span>
                        </template>
                      </template>
                      <template v-else>
                        <span class="text-muted">未收集</span>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedAchievement" class="modal-overlay" @click.self="closeAchievementDetail">
        <div class="modal-content animate-slide-up encyclopedia-modal">
          <div class="modal-header">
            <h3>成就详情</h3>
            <button class="close-btn" @click="closeAchievementDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="achievement-detail-header card">
              <div 
                class="adh-icon"
                :class="{ unlocked: selectedAchievement.isUnlocked }"
              >
                {{ selectedAchievement.isUnlocked ? selectedAchievement.icon : '🔒' }}
              </div>
              <div class="adh-info">
                <h2 class="adh-name">
                  {{ selectedAchievement.isUnlocked ? selectedAchievement.name : '???' }}
                </h2>
                <p class="adh-category">{{ getAchievementCategoryLabel(selectedAchievement.category) }}</p>
                <p class="adh-desc">
                  {{ selectedAchievement.isUnlocked ? selectedAchievement.description : '完成特定条件解锁此成就' }}
                </p>
                <div class="adh-progress">
                  <div class="adh-progress-bar">
                    <div 
                      class="adh-progress-fill"
                      :style="{ 
                        width: getAchievementProgressPercent(selectedAchievement) + '%',
                        background: selectedAchievement.isUnlocked ? 'var(--success)' : 'var(--accent-gold)'
                      }"
                    ></div>
                  </div>
                  <span class="adh-progress-text">
                    {{ selectedAchievement.isUnlocked 
                      ? '已解锁' 
                      : `进度 ${selectedAchievement.current}/${selectedAchievement.target}` 
                    }}
                  </span>
                </div>
                <div v-if="selectedAchievement.unlockedDate" class="adh-unlock-date">
                  🎉 {{ formatDate(selectedAchievement.unlockedDate) }} 解锁
                </div>
              </div>
            </div>

            <div v-if="selectedAchievement.isUnlocked && !selectedAchievement.rewardClaimed" class="adh-claim-section card">
              <div class="adhc-info">
                <span class="adhc-icon">🎁</span>
                <div class="adhc-text">
                  <span class="adhc-title">成就奖励</span>
                  <div class="adhc-rewards">
                    <span 
                      v-for="(bonus, idx) in selectedAchievement.rewards" 
                      :key="idx"
                      class="adhc-reward-tag"
                    >
                      {{ getBonusTypeLabel(bonus.type) }} {{ formatBonusValue(bonus.type, bonus.value) }}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                class="claim-btn adhc-claim-btn"
                @click="claimAchievementReward(selectedAchievement.id)"
              >
                立即领取
              </button>
            </div>

            <div v-if="selectedAchievement.isUnlocked && selectedAchievement.rewardClaimed" class="adh-rewarded card">
              <div class="adhr-icon">✓</div>
              <span>奖励已领取 · {{ formatDate(selectedAchievement.rewardClaimedDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.encyclopedia-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-dark);
  z-index: 1000;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 40px;
}

.ev-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background: var(--bg-dark);
  z-index: 10;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  background: var(--bg-card);
  border: none;
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-hover);
}

.ev-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.ev-stats {
  display: flex;
  gap: 12px;
}

.ev-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.ev-stat-icon {
  font-size: 16px;
}

.ev-claimable {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-gold);
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.ev-overview {
  margin-bottom: 20px;
}

.evo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.evo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-hover);
  border-radius: 12px;
}

.evo-icon {
  font-size: 28px;
}

.evo-info {
  display: flex;
  flex-direction: column;
}

.evo-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.evo-label {
  font-size: 12px;
  color: var(--text-muted);
}

.ev-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ev-tab {
  background: var(--bg-card);
  border: none;
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.ev-tab:hover {
  background: var(--bg-hover);
}

.ev-tab.active {
  background: var(--accent-gold);
  color: #000;
}

.tab-badge {
  background: var(--danger);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.ev-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--accent-gold);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--accent-gold);
  border-color: var(--accent-gold);
  color: #000;
}

.filter-btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.sort-select {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.catalog-card {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.catalog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.catalog-card.collected:hover {
  border-color: var(--accent-gold);
}

.catalog-card.uncollected {
  opacity: 0.6;
}

.catalog-card.uncollected:hover {
  opacity: 0.8;
}

.catalog-card.legendary {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.catalog-card.epic {
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}

.cc-cover {
  position: relative;
  padding: 16px;
  background: var(--bg-hover);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cc-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.7);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cc-rarity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: #000;
  font-weight: 700;
}

.cc-info {
  padding: 12px;
}

.cc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

.text-muted {
  color: var(--text-muted) !important;
}

.grayscale {
  filter: grayscale(100%);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.es-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.claimable-section {
  margin-bottom: 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.cs-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-gold);
  margin: 0 0 12px 0;
}

.claimable-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.claimable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 10px;
}

.ci-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.ci-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ci-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ci-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.claim-btn {
  background: var(--accent-gold);
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.claim-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.series-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.series-category {
  padding: 16px;
}

.sc-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.sc-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.sc-info {
  flex: 1;
}

.sc-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.sc-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.sc-progress-text {
  font-size: 12px;
  color: var(--accent-gold);
  font-weight: 500;
}

.series-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-hover);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.series-card.unlocked:hover {
  background: var(--bg-card);
  border-color: var(--accent-gold);
}

.series-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.series-card.completed {
  border-left: 3px solid var(--success);
}

.series-card.claimable {
  background: rgba(245, 158, 11, 0.1);
  animation: pulse 2s infinite;
}

.ser-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.ser-info {
  flex: 1;
}

.ser-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ser-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ser-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.ser-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.ser-badge.claimable {
  background: var(--accent-gold);
  color: #000;
}

.ser-type {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.ser-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.ser-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ser-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  overflow: hidden;
}

.ser-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.ser-progress-text {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 35px;
  text-align: right;
}

.locked-categories {
  margin-top: 20px;
}

.lc-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.locked-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.locked-category {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  opacity: 0.6;
}

.lc-icon {
  font-size: 24px;
}

.lc-info {
  display: flex;
  flex-direction: column;
}

.lc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.lc-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.achievement-card.unlocked {
  border-color: var(--accent-gold);
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-card.claimable {
  background: rgba(245, 158, 11, 0.1);
  animation: pulse 2s infinite;
}

.ach-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg-hover);
}

.ach-icon.unlocked {
  background: rgba(245, 158, 11, 0.2);
}

.ach-info {
  flex: 1;
}

.ach-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.ach-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.ach-category {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 10px;
}

.ach-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.ach-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.ach-progress-bar {
  flex: 1;
  height: 5px;
  background: var(--bg-hover);
  border-radius: 3px;
  overflow: hidden;
}

.ach-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.ach-progress-text {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 60px;
  text-align: right;
}

.ach-claim-hint {
  font-size: 11px;
  color: var(--accent-gold);
  font-weight: 500;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: center;
  transition: all 0.2s;
}

.milestone-card.completed {
  border-left: 3px solid var(--success);
}

.milestone-card.claimable {
  background: rgba(245, 158, 11, 0.1);
  animation: pulse 2s infinite;
}

.mile-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg-hover);
}

.mile-icon.completed {
  background: rgba(16, 185, 129, 0.2);
}

.mile-info {
  flex: 1;
}

.mile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.mile-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

.mile-badge.claimable {
  background: var(--accent-gold);
  color: #000;
}

.mile-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.mile-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.mile-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-hover);
  border-radius: 3px;
  overflow: hidden;
}

.mile-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.mile-progress-text {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 100px;
  text-align: right;
}

.mile-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mile-reward-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  border-radius: 10px;
  font-weight: 500;
}

.mile-claim-btn {
  margin-left: 12px;
}

.toast-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.toast-message.success {
  background: var(--success);
  color: #000;
}

.toast-message.error {
  background: var(--danger);
  color: #fff;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.encyclopedia-modal {
  max-width: 750px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 2;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-detail-cover {
  position: relative;
  padding: 30px;
  background: var(--bg-hover);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.entry-detail-cover.uncollected {
  opacity: 0.7;
}

.edc-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
  z-index: 2;
}

.entry-detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.edi-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.edi-rarity {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.edi-artist {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.edi-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edi-tag {
  background: var(--bg-hover);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.edi-stats {
  padding: 16px;
}

.edi-stats .edi-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.edi-stats .edi-stat:last-child {
  border-bottom: none;
}

.edi-stat-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.edi-stat-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edi-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.edi-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.edi-description {
  padding: 16px;
}

.edi-series {
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.edi-series-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edi-series-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.esi-icon {
  font-size: 16px;
}

.esi-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.esi-status {
  font-size: 11px;
  color: var(--text-muted);
}

.esi-status.completed {
  color: var(--success);
  font-weight: 500;
}

.series-detail-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 20px;
}

.sdh-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}

.sdh-info {
  flex: 1;
}

.sdh-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.sdh-type {
  font-size: 12px;
  color: var(--accent-gold);
  margin: 0 0 6px 0;
}

.sdh-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.sdh-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sdh-progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.sdh-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.sdh-progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: right;
}

.sd-claim-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.sdc-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sdc-icon {
  font-size: 32px;
}

.sdc-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sdc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
}

.sdc-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sdc-reward-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent-gold);
  border-radius: 10px;
  font-weight: 500;
}

.sdc-claim-btn {
  padding: 10px 20px;
  font-size: 14px;
}

.sd-requirements {
  padding: 20px;
}

.sd-requirements .section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.req-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border-radius: 8px;
  font-weight: 500;
}

.sd-records-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.sd-record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: var(--bg-hover);
  border-left: 3px solid transparent;
}

.sd-record-item.collected {
  border-left-color: var(--success);
}

.sd-record-item.partial {
  border-left-color: var(--warning);
}

.sdri-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: var(--bg-card);
}

.sd-record-item.collected .sdri-status {
  background: var(--success);
  color: #000;
}

.sd-record-item.partial .sdri-status {
  background: var(--warning);
  color: #000;
}

.sdri-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sdri-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.sdri-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sdri-warning {
  color: var(--warning);
  font-weight: 500;
}

.achievement-detail-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 20px;
}

.adh-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
  background: var(--bg-hover);
}

.adh-icon.unlocked {
  background: rgba(245, 158, 11, 0.2);
}

.adh-info {
  flex: 1;
}

.adh-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.adh-category {
  font-size: 12px;
  color: var(--accent-gold);
  margin: 0 0 6px 0;
}

.adh-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.adh-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.adh-progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.adh-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.adh-progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 100px;
  text-align: right;
}

.adh-unlock-date {
  font-size: 13px;
  color: var(--success);
  font-weight: 500;
}

.adh-claim-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.adhc-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.adhc-icon {
  font-size: 32px;
}

.adhc-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.adhc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
}

.adhc-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.adhc-reward-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent-gold);
  border-radius: 10px;
  font-weight: 500;
}

.adhc-claim-btn {
  padding: 10px 20px;
  font-size: 14px;
}

.adh-rewarded {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success);
  font-weight: 500;
}

.adhr-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--success);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .ev-header {
    flex-wrap: wrap;
  }
  
  .ev-title {
    font-size: 18px;
  }
  
  .evo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .catalog-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .series-detail-header,
  .achievement-detail-header,
  .sd-claim-section,
  .adh-claim-section {
    flex-direction: column;
    text-align: center;
  }
  
  .sdh-icon,
  .adh-icon {
    margin: 0 auto;
  }
  
  .sd-claim-section .claim-btn,
  .adh-claim-section .claim-btn {
    width: 100%;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>