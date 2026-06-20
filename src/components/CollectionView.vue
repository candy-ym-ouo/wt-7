<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, watch } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { CollectionItem, MemberProfile, MemberLevel, AlbumEntry } from '@/types'
import { getLevelIcon, getLevelColor, getMemberBenefit, getNextLevelInfo } from '@/data/members'
import { getConditionLabel, getConditionColor, getConditionDescription, getRenovationOptions } from '@/data/condition'
import { checkAlbumActivation } from '@/data/album'
import { getSourceTypeLabel } from '@/data/stories'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const selectedItem = ref<CollectionItem | null>(null)
const selectedMember = ref<MemberProfile | null>(null)
const selectedAlbum = ref<AlbumEntry | null>(null)
const filterGenre = ref<string>('all')
const sortBy = ref<'date' | 'price' | 'rarity' | 'value'>('date')
const activeTab = ref<'records' | 'members' | 'album'>('records')
const memberSortBy = ref<'level' | 'visits' | 'spent'>('level')
const memberLevelFilter = ref<MemberLevel | 'all'>('all')
const selectedAlbumCategory = ref<string | null>(null)

watch(() => gameStore.currentDay, () => {
  if (selectedItem.value) {
    gameStore.updateCollectionStoryProgress(selectedItem.value.record.id)
    gameStore.checkAndUpdateAchievements(selectedItem.value.record.id)
    selectedItem.value = gameStore.collection.find(c => c.record.id === selectedItem.value!.record.id) || null
  }
})

const genres = computed(() => {
  const gs = new Set(gameStore.collection.map(c => c.record.genre))
  return ['all', ...Array.from(gs)]
})

const memberLevels = computed(() => {
  return ['all', ...(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const)]
})

const filteredCollection = computed(() => {
  let items = [...gameStore.collection]

  if (filterGenre.value !== 'all') {
    items = items.filter(c => c.record.genre === filterGenre.value)
  }

  switch (sortBy.value) {
    case 'date':
      items.sort((a, b) => b.acquiredDate - a.acquiredDate)
      break
    case 'price':
      items.sort((a, b) => b.purchasePrice - a.purchasePrice)
      break
    case 'rarity':
      items.sort((a, b) => b.record.rarity - a.record.rarity)
      break
    case 'value':
      items.sort((a, b) => b.collectionValue - a.collectionValue)
      break
  }

  return items
})

const levelOrder: Record<MemberLevel, number> = {
  Diamond: 5, Platinum: 4, Gold: 3, Silver: 2, Bronze: 1
}

const sortedMembers = computed(() => {
  let members = [...gameStore.members]

  if (memberLevelFilter.value !== 'all') {
    members = members.filter(m => m.level === memberLevelFilter.value)
  }

  switch (memberSortBy.value) {
    case 'level':
      members.sort((a, b) => levelOrder[b.level] - levelOrder[a.level])
      break
    case 'visits':
      members.sort((a, b) => b.visitCount - a.visitCount)
      break
    case 'spent':
      members.sort((a, b) => b.totalSpent - a.totalSpent)
      break
  }

  return members
})

const memberStatsSummary = computed(() => {
  const stats = gameStore.memberStats
  const totalSpent = stats.totalMemberSpent
  const avgSatisfaction = Math.round(stats.avgMemberSatisfaction)
  const highValue = Object.entries(stats.byLevel)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({
      level: level as MemberLevel,
      count
    }))
  return {
    totalMembers: stats.totalMembers,
    totalSpent,
    avgSatisfaction,
    byLevel: highValue
  }
})

const getMemberProgress = (member: MemberProfile) => {
  const benefit = getMemberBenefit(member.level)
  const nextLevel = getNextLevelInfo(member.level)
  const progressToNext = nextLevel
    ? Math.min(100, ((member.growthPoints - benefit.minGrowthPoints) / (nextLevel.minGrowthPoints - benefit.minGrowthPoints)) * 100)
    : 100
  return { benefit, nextLevel, progressToNext }
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const rarityStars = (rarity: number) => '★'.repeat(rarity) + '☆'.repeat(5 - rarity)

const openDetail = (item: CollectionItem) => {
  selectedItem.value = item
}

const closeDetail = () => {
  selectedItem.value = null
}

const openMemberDetail = (member: MemberProfile) => {
  selectedMember.value = member
}

const closeMemberDetail = () => {
  selectedMember.value = null
}

const toggleFav = (recordId: string) => {
  gameStore.toggleFavorite(recordId)
}

const updateNotes = (recordId: string, notes: string) => {
  gameStore.updateCollectionNotes(recordId, notes)
}

const handleNotesInput = (e: Event) => {
  if (!selectedItem.value) return
  const target = e.target as HTMLTextAreaElement
  updateNotes(selectedItem.value.record.id, target.value)
}

const handleMemberNotesInput = (e: Event) => {
  if (!selectedMember.value) return
  const target = e.target as HTMLTextAreaElement
  gameStore.updateMemberNotes(selectedMember.value.id, target.value)
}

const showRenovateModal = ref(false)
const renovateItem = ref<CollectionItem | null>(null)
const renovateMessage = ref('')
const renovateMessageType = ref<'success' | 'error'>('success')

const detailTab = ref<'info' | 'story' | 'achievements' | 'history' | 'display'>('info')

const openRenovateModal = (item: CollectionItem) => {
  renovateItem.value = item
  renovateMessage.value = ''
  showRenovateModal.value = true
}

const closeRenovateModal = () => {
  showRenovateModal.value = false
  renovateItem.value = null
  renovateMessage.value = ''
}

const handleRenovate = (targetScore: number) => {
  if (!renovateItem.value) return
  const result = gameStore.renovateCollectionItem(renovateItem.value.record.id, targetScore)
  renovateMessage.value = result.message
  renovateMessageType.value = result.success ? 'success' : 'error'
  if (result.success) {
    setTimeout(() => {
      closeRenovateModal()
    }, 1500)
  }
}

const totalCollectionValue = computed(() => {
  return gameStore.collection.reduce((sum, item) => sum + item.collectionValue, 0)
})

const levelNameMap: Record<MemberLevel, string> = {
  Bronze: '青铜会员',
  Silver: '白银会员',
  Gold: '黄金会员',
  Platinum: '铂金会员',
  Diamond: '钻石会员'
}

const albumStats = computed(() => {
  return gameStore.albumState
})

const filteredAlbumCategories = computed(() => {
  if (!selectedAlbumCategory.value) {
    return gameStore.albumState.categories
  }
  return gameStore.albumState.categories.filter(c => c.id === selectedAlbumCategory.value)
})

const getAlbumEntryProgress = (entry: AlbumEntry): number => {
  if (entry.isActivated) return 100
  const total = entry.requiredRecordIds.length
  const collected = entry.requiredRecordIds.filter(id => {
    const item = gameStore.collection.find(c => c.record.id === id)
    return item && item.conditionScore >= entry.requiredMinCondition && item.record.rarity >= entry.requiredMinRarity
  }).length
  return Math.round((collected / total) * 100)
}

const isAlbumEntryAvailable = (entry: AlbumEntry): boolean => {
  return checkAlbumActivation(entry, gameStore.collection)
}

const getRecordById = (id: string) => {
  return gameStore.collection.find(c => c.record.id === id)?.record
}

const openAlbumDetail = (entry: AlbumEntry) => {
  selectedAlbum.value = entry
}

const closeAlbumDetail = () => {
  selectedAlbum.value = null
}

const selectCategory = (categoryId: string | null) => {
  selectedAlbumCategory.value = categoryId
}

const unlockedSpecialCustomers = computed(() => {
  return gameStore.specialCustomersState.filter(sc => sc.isUnlocked)
})

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
</script>

<template>
  <div class="collection-view">
    <div class="cv-header">
      <button class="back-btn" @click="emit('close')">← 返回</button>
      <h1 class="cv-title">📚 我的收藏</h1>
      <div class="cv-count">
        {{ gameStore.collection.length }} 张 · ¥{{ totalCollectionValue }} 收藏价值
      </div>
    </div>

    <div class="cv-tabs">
      <button
        class="cv-tab"
        :class="{ active: activeTab === 'records' }"
        @click="activeTab = 'records'"
      >
        📀 唱片收藏
        <span class="tab-count">{{ gameStore.collection.length }}</span>
      </button>
      <button
        class="cv-tab"
        :class="{ active: activeTab === 'album' }"
        @click="activeTab = 'album'"
      >
        📖 收藏图鉴
        <span class="tab-count">{{ albumStats.totalActivated }}/{{ albumStats.totalAvailable }}</span>
      </button>
      <button
        class="cv-tab"
        :class="{ active: activeTab === 'members' }"
        @click="activeTab = 'members'"
      >
        👥 会员成果
        <span class="tab-count">{{ gameStore.members.length }}</span>
      </button>
    </div>

    <template v-if="activeTab === 'records'">
      <div class="cv-toolbar">
        <div class="filter-group">
          <button
            v-for="genre in genres"
            :key="genre"
            class="filter-btn"
            :class="{ active: filterGenre === genre }"
            @click="filterGenre = genre"
          >
            {{ genre === 'all' ? '全部' : genre }}
          </button>
        </div>
        <select v-model="sortBy" class="sort-select">
          <option value="date">按日期</option>
          <option value="price">按价格</option>
          <option value="rarity">按稀有度</option>
          <option value="value">按收藏价值</option>
        </select>
      </div>

      <div v-if="filteredCollection.length > 0" class="collection-grid">
        <div
          v-for="item in filteredCollection"
          :key="item.record.id"
          class="collection-item"
          @click="openDetail(item)"
        >
          <div class="ci-cover">
            <VinylRecord :record="item.record" size="medium" />
            <span v-if="item.isFavorite" class="fav-icon">❤️</span>
          </div>
          <div class="ci-info">
            <h3 class="ci-title">{{ item.record.title }}</h3>
            <p class="ci-artist">{{ item.record.artist }}</p>
            <div class="ci-meta">
              <span class="ci-rarity" style="color: #f6e05e">{{ rarityStars(item.record.rarity) }}</span>
              <span class="ci-genre">{{ item.record.genre }}</span>
              <span class="ci-condition" :style="{ color: getConditionColor(item.conditionScore) }">
                {{ getConditionLabel(item.conditionScore) }}
              </span>
            </div>
            <div class="ci-bottom">
              <span class="ci-price">¥{{ item.collectionValue }}</span>
              <span class="ci-date">{{ formatDate(item.acquiredDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-collection">
        <div class="ec-icon">📀</div>
        <h3>还没有收藏</h3>
        <p>当顾客满意度达到 80% 以上时，有几率获得唱片收藏！</p>
      </div>
    </template>

    <template v-else-if="activeTab === 'members'">
      <div v-if="gameStore.members.length > 0" class="member-stats-card">
        <div class="msc-grid">
          <div class="msc-item">
            <span class="msc-icon">👥</span>
            <div class="msc-info">
              <span class="msc-value">{{ memberStatsSummary.totalMembers }}</span>
              <span class="msc-label">会员总数</span>
            </div>
          </div>
          <div class="msc-item">
            <span class="msc-icon">💰</span>
            <div class="msc-info">
              <span class="msc-value">¥{{ memberStatsSummary.totalSpent }}</span>
              <span class="msc-label">会员消费</span>
            </div>
          </div>
          <div class="msc-item">
            <span class="msc-icon">😊</span>
            <div class="msc-info">
              <span class="msc-value">{{ memberStatsSummary.avgSatisfaction }}%</span>
              <span class="msc-label">平均满意度</span>
            </div>
          </div>
        </div>

        <div v-if="memberStatsSummary.byLevel.length > 0" class="msc-legend">
          <span class="mscl-label">等级分布：</span>
          <div class="mscl-list">
            <span
              v-for="item in memberStatsSummary.byLevel"
              :key="item.level"
              class="mscl-badge"
              :style="{ color: getLevelColor(item.level), borderColor: getLevelColor(item.level) + '50' }"
            >
              {{ getLevelIcon(item.level) }} {{ levelNameMap[item.level] }}: {{ item.count }}人
            </span>
          </div>
        </div>
      </div>

      <div class="cv-toolbar">
        <div class="filter-group">
          <button
            v-for="level in memberLevels"
            :key="level"
            class="filter-btn"
            :class="{ active: memberLevelFilter === level }"
            @click="memberLevelFilter = level as any"
          >
            {{ level === 'all' ? '全部' : getLevelIcon(level as MemberLevel) + ' ' + levelNameMap[level as MemberLevel] }}
          </button>
        </div>
        <select v-model="memberSortBy" class="sort-select">
          <option value="level">按等级</option>
          <option value="visits">按到访次数</option>
          <option value="spent">按消费金额</option>
        </select>
      </div>

      <div v-if="sortedMembers.length > 0" class="member-grid">
        <div
          v-for="member in sortedMembers"
          :key="member.id"
          class="member-card"
          @click="openMemberDetail(member)"
        >
          <div class="mc-avatar-wrap">
            <div class="mc-avatar">{{ member.avatar }}</div>
            <span
              class="mc-level-badge"
              :style="{ background: getLevelColor(member.level) }"
            >
              {{ getLevelIcon(member.level) }}
            </span>
          </div>
          <div class="mc-info">
            <div class="mc-name-row">
              <h3 class="mc-name">{{ member.name }}</h3>
              <span
                class="mc-level-name"
                :style="{ color: getLevelColor(member.level) }"
              >
                {{ levelNameMap[member.level] }}
              </span>
            </div>
            <div class="mc-stats">
              <span class="mc-stat">
                📈 {{ member.growthPoints }}
              </span>
              <span class="mc-stat">
                🔄 {{ member.visitCount }}次
              </span>
              <span class="mc-stat">
                💰 ¥{{ member.totalSpent }}
              </span>
            </div>
            <div class="mc-progress">
              <div
                class="mc-progress-bar"
                :style="{
                  width: getMemberProgress(member).progressToNext + '%',
                  background: `linear-gradient(90deg, ${getLevelColor(member.level)} 0%, var(--accent-gold) 100%)`
                }"
              ></div>
            </div>
            <div class="mc-progress-label">
              <span>{{ getMemberProgress(member).benefit.levelName }}</span>
              <span v-if="getMemberProgress(member).nextLevel">
                → {{ getMemberProgress(member).nextLevel!.levelName }}
              </span>
              <span v-else>已满级</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-collection">
        <div class="ec-icon">👥</div>
        <h3>还没有会员</h3>
        <p>让顾客满意，他们会成为你的忠实会员！高满意度的顾客更容易加入会员。</p>
      </div>
    </template>

    <template v-else-if="activeTab === 'album'">
      <div class="album-stats-card">
        <div class="asc-grid">
          <div class="asc-item">
            <span class="asc-icon">📖</span>
            <div class="asc-info">
              <span class="asc-value">{{ albumStats.totalActivated }}/{{ albumStats.totalAvailable }}</span>
              <span class="asc-label">已激活图鉴</span>
            </div>
          </div>
          <div class="asc-item">
            <span class="asc-icon">✨</span>
            <div class="asc-info">
              <span class="asc-value">{{ gameStore.activatedAlbumBonuses.length }}</span>
              <span class="asc-label">激活加成</span>
            </div>
          </div>
          <div class="asc-item">
            <span class="asc-icon">🎭</span>
            <div class="asc-info">
              <span class="asc-value">{{ unlockedSpecialCustomers.length }}/{{ gameStore.specialCustomersState.length }}</span>
              <span class="asc-label">特殊顾客</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="gameStore.collectionBonuses.length > 0" class="active-bonuses-card">
        <h4 class="abc-title">🎁 当前生效的收藏加成</h4>
        <div class="abc-list">
          <div v-for="(bonus, index) in gameStore.collectionBonuses" :key="index" class="abc-item">
            <span class="abc-bonus">{{ bonus.description }}</span>
          </div>
        </div>
      </div>

      <div class="cv-toolbar">
        <div class="filter-group">
          <button
            class="filter-btn"
            :class="{ active: selectedAlbumCategory === null }"
            @click="selectCategory(null)"
          >
            全部分类
          </button>
          <button
            v-for="category in albumStats.categories"
            :key="category.id"
            class="filter-btn"
            :class="{ active: selectedAlbumCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.icon }} {{ category.name }}
          </button>
        </div>
      </div>

      <div class="album-categories">
        <div v-for="category in filteredAlbumCategories" :key="category.id" class="album-category">
          <div class="ac-header">
            <span class="ac-icon">{{ category.icon }}</span>
            <div class="ac-info">
              <h3 class="ac-name">{{ category.name }}</h3>
              <p class="ac-desc">{{ category.description }}</p>
            </div>
          </div>

          <div class="album-entries">
            <div
              v-for="entry in category.entries"
              :key="entry.id"
              class="album-entry"
              :class="{ 
                activated: entry.isActivated, 
                available: isAlbumEntryAvailable(entry) && !entry.isActivated 
              }"
              @click="openAlbumDetail(entry)"
            >
              <div class="ae-icon">{{ entry.icon }}</div>
              <div class="ae-info">
                <h4 class="ae-name">
                  {{ entry.name }}
                  <span v-if="entry.isActivated" class="ae-activated-badge">✓ 已激活</span>
                </h4>
                <p class="ae-desc">{{ entry.description }}</p>
                <div class="ae-progress">
                  <div class="ae-progress-bar">
                    <div 
                      class="ae-progress-fill" 
                      :style="{ 
                        width: getAlbumEntryProgress(entry) + '%',
                        background: entry.isActivated ? 'var(--success)' : 'var(--accent-gold)'
                      }"
                    ></div>
                  </div>
                  <span class="ae-progress-text">{{ getAlbumEntryProgress(entry) }}%</span>
                </div>
                <div class="ae-bonuses">
                  <span 
                    v-for="(bonus, idx) in entry.bonuses" 
                    :key="idx" 
                    class="ae-bonus-tag"
                  >
                    {{ getBonusTypeLabel(bonus.type) }} {{ formatBonusValue(bonus.type, bonus.value) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="selectedItem" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>唱片详情</h3>
            <button class="close-btn" @click="closeDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="detail-cover">
              <VinylRecord :record="selectedItem.record" size="large" :spinning="true" />
            </div>

            <div class="detail-info">
              <div class="detail-header">
                <h2 class="detail-title">{{ selectedItem.record.title }}</h2>
                <button
                  class="fav-btn"
                  :class="{ active: selectedItem.isFavorite }"
                  @click.stop="toggleFav(selectedItem.record.id)"
                >
                  {{ selectedItem.isFavorite ? '❤️' : '🤍' }}
                </button>
              </div>
              <p class="detail-artist">{{ selectedItem.record.artist }}</p>

              <div class="detail-tags">
                <span class="detail-tag">{{ selectedItem.record.genre }}</span>
                <span class="detail-tag">{{ selectedItem.record.year }}</span>
                <span
                  class="detail-tag"
                  :style="{ color: getConditionColor(selectedItem.conditionScore), borderColor: getConditionColor(selectedItem.conditionScore) + '40' }"
                >
                  {{ getConditionLabel(selectedItem.conditionScore) }}
                </span>
                <span v-if="selectedItem.extended.source" class="detail-tag" :style="{ color: getSourceTypeLabel(selectedItem.extended.source.type).color, borderColor: getSourceTypeLabel(selectedItem.extended.source.type).color + '40' }">
                  {{ getSourceTypeLabel(selectedItem.extended.source.type).icon }} {{ getSourceTypeLabel(selectedItem.extended.source.type).label }}
                </span>
              </div>

              <div class="detail-quick-stats card">
                <div class="dqs-item">
                  <span class="dqs-icon">📜</span>
                  <div class="dqs-info">
                    <span class="dqs-value">{{ selectedItem.extended.story?.unlockedChapters || 0 }}/{{ selectedItem.extended.story?.totalChapters || 0 }}</span>
                    <span class="dqs-label">故事章节</span>
                  </div>
                </div>
                <div class="dqs-item">
                  <span class="dqs-icon">🏆</span>
                  <div class="dqs-info">
                    <span class="dqs-value">{{ selectedItem.extended.unlockedAchievementCount }}/{{ selectedItem.extended.achievements.length }}</span>
                    <span class="dqs-label">成就解锁</span>
                  </div>
                </div>
                <div class="dqs-item">
                  <span class="dqs-icon">💰</span>
                  <div class="dqs-info">
                    <span class="dqs-value">{{ selectedItem.extended.totalSalesCount }}</span>
                    <span class="dqs-label">成交次数</span>
                  </div>
                </div>
                <div class="dqs-item">
                  <span class="dqs-icon">📅</span>
                  <div class="dqs-info">
                    <span class="dqs-value">{{ selectedItem.extended.daysOwned }}天</span>
                    <span class="dqs-label">收藏天数</span>
                  </div>
                </div>
              </div>

              <div class="detail-tabs">
                <button
                  v-for="tab in [
                    { key: 'info', label: '📋 信息', icon: '📋' },
                    { key: 'story', label: '📜 故事', icon: '📜' },
                    { key: 'achievements', label: '🏆 成就', icon: '🏆' },
                    { key: 'history', label: '📊 历史', icon: '📊' },
                    { key: 'display', label: '✨ 展示', icon: '✨' }
                  ]"
                  :key="tab.key"
                  class="detail-tab-btn"
                  :class="{ active: detailTab === tab.key as any }"
                  @click="detailTab = tab.key as any"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div v-show="detailTab === 'info'" class="detail-tab-content">
                <div class="detail-condition-section">
                  <div class="dcs-header">
                    <span class="dcs-label">品相评分</span>
                    <span class="dcs-score" :style="{ color: getConditionColor(selectedItem.conditionScore) }">
                      {{ selectedItem.conditionScore }}/100
                    </span>
                  </div>
                  <div class="dcs-bar">
                    <div 
                      class="dcs-fill" 
                      :style="{ width: selectedItem.conditionScore + '%', background: getConditionColor(selectedItem.conditionScore) }"
                    ></div>
                  </div>
                  <p class="dcs-desc">{{ getConditionDescription(getConditionLabel(selectedItem.conditionScore) as any) }}</p>
                </div>

                <div class="detail-rarity">
                  <span style="color: #f6e05e">{{ rarityStars(selectedItem.record.rarity) }}</span>
                  <span class="rarity-label">{{ selectedItem.record.rarity }} 星稀有</span>
                </div>

                <p class="detail-desc">{{ selectedItem.record.description }}</p>

                <div v-if="selectedItem.extended.source" class="source-section card">
                  <h4 class="section-title">🎁 获取来源</h4>
                  <div class="source-info">
                    <div class="source-icon" :style="{ background: getSourceTypeLabel(selectedItem.extended.source.type).color + '20' }">
                      {{ selectedItem.extended.source.sourceIcon }}
                    </div>
                    <div class="source-content">
                      <div class="source-name">
                        <span :style="{ color: getSourceTypeLabel(selectedItem.extended.source.type).color, fontWeight: 600 }">
                          {{ selectedItem.extended.source.sourceName }}
                        </span>
                      </div>
                      <p class="source-desc">{{ selectedItem.extended.source.description }}</p>
                      <div v-if="selectedItem.extended.source.customerName" class="source-meta">
                        <span>来自：{{ selectedItem.extended.source.customerName }}</span>
                        <span>{{ formatDate(selectedItem.extended.source.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="detail-stats">
                  <div class="ds-item">
                    <span class="ds-label">购入价格</span>
                    <span class="ds-value">¥{{ selectedItem.purchasePrice }}</span>
                  </div>
                  <div class="ds-item">
                    <span class="ds-label">收藏价值</span>
                    <span class="ds-value" :style="{ color: getConditionColor(selectedItem.conditionScore) }">¥{{ selectedItem.collectionValue }}</span>
                  </div>
                  <div class="ds-item">
                    <span class="ds-label">购入时间</span>
                    <span class="ds-value">{{ formatDate(selectedItem.acquiredDate) }}</span>
                  </div>
                  <div class="ds-item">
                    <span class="ds-label">曲目数量</span>
                    <span class="ds-value">{{ selectedItem.record.trackCount }} 首</span>
                  </div>
                  <div class="ds-item">
                    <span class="ds-label">翻新次数</span>
                    <span class="ds-value">{{ selectedItem.extended.timesRenovated }} 次</span>
                  </div>
                  <div class="ds-item">
                    <span class="ds-label">累计营收</span>
                    <span class="ds-value" style="color: var(--success)">¥{{ selectedItem.extended.totalSaleRevenue }}</span>
                  </div>
                </div>

                <div v-if="getRenovationOptions(selectedItem.conditionScore, selectedItem.record.rarity).length > 0" class="renovate-section">
                  <button class="renovate-trigger-btn" @click="openRenovateModal(selectedItem)">
                    🔧 翻新维护 · 提升收藏价值
                  </button>
                </div>

                <div class="notes-section">
                  <label class="notes-label">我的笔记</label>
                  <textarea
                    class="notes-input"
                    :value="selectedItem.notes"
                    @input="handleNotesInput"
                    placeholder="记录你对这张唱片的感受..."
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div v-show="detailTab === 'story'" class="detail-tab-content">
                <div v-if="selectedItem.extended.story" class="story-section">
                  <div class="story-header-card card">
                    <div class="story-icon">{{ selectedItem.extended.story.storyIcon }}</div>
                    <div class="story-title-info">
                      <h3 class="story-title">{{ selectedItem.extended.story.storyTitle }}</h3>
                      <div class="story-progress-info">
                        <div class="story-progress-bar">
                          <div 
                            class="story-progress-fill"
                            :style="{ width: (selectedItem.extended.story.unlockedChapters / selectedItem.extended.story.totalChapters * 100) + '%' }"
                          ></div>
                        </div>
                        <span class="story-progress-text">
                          {{ selectedItem.extended.story.unlockedChapters }}/{{ selectedItem.extended.story.totalChapters }} 章节
                        </span>
                      </div>
                      <div v-if="selectedItem.extended.story.isStoryComplete" class="story-complete-badge">
                        🎉 故事已全部解锁
                      </div>
                    </div>
                  </div>

                  <div class="story-chapters">
                    <div 
                      v-for="chapter in selectedItem.extended.story.chapters"
                      :key="chapter.id"
                      class="story-chapter-card"
                      :class="{ unlocked: chapter.isUnlocked, locked: !chapter.isUnlocked }"
                    >
                      <div class="chapter-header">
                        <div class="chapter-index">
                          {{ chapter.isUnlocked ? chapter.chapterIndex : '🔒' }}
                        </div>
                        <div class="chapter-title-info">
                          <h4 class="chapter-title">{{ chapter.isUnlocked ? chapter.title : '???' }}</h4>
                          <p class="chapter-condition">
                            <template v-if="chapter.isUnlocked">{{ chapter.unlockedDate ? formatDate(chapter.unlockedDate) : '' }}</template>
                            <template v-else>
                              解锁条件：{{ chapter.unlockCondition }}
                              <span v-if="chapter.requiredDaysOwned" class="chapter-days-hint">
                                （已持有 {{ selectedItem.extended.daysOwned }}/{{ chapter.requiredDaysOwned }} 天）
                              </span>
                            </template>
                          </p>
                        </div>
                      </div>
                      <p v-if="chapter.isUnlocked" class="chapter-content">
                        {{ chapter.content }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-show="detailTab === 'achievements'" class="detail-tab-content">
                <div class="achievements-section">
                  <div class="achievements-summary card">
                    <div class="ach-summary-icon">🏆</div>
                    <div class="ach-summary-info">
                      <h4>成就进度</h4>
                      <div class="ach-summary-progress">
                        <div class="ach-progress-bar">
                          <div 
                            class="ach-progress-fill"
                            :style="{ width: (selectedItem.extended.unlockedAchievementCount / selectedItem.extended.achievements.length * 100) + '%' }"
                          ></div>
                        </div>
                        <span class="ach-progress-text">
                          {{ selectedItem.extended.unlockedAchievementCount }}/{{ selectedItem.extended.achievements.length }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="achievements-grid">
                    <div 
                      v-for="achievement in selectedItem.extended.achievements"
                      :key="achievement.id"
                      class="achievement-card"
                      :class="{ unlocked: achievement.isUnlocked, locked: !achievement.isUnlocked }"
                    >
                      <div class="ach-icon" :class="{ unlocked: achievement.isUnlocked }">
                        {{ achievement.isUnlocked ? achievement.icon : '🔒' }}
                      </div>
                      <div class="ach-info">
                        <h5 class="ach-name">{{ achievement.name }}</h5>
                        <p class="ach-desc">{{ achievement.description }}</p>
                        <div v-if="!achievement.isUnlocked && achievement.target > 1" class="ach-progress-mini">
                          <div class="achpm-bar">
                            <div 
                              class="achpm-fill"
                              :style="{ width: Math.min(100, (achievement.progress / achievement.target * 100)) + '%' }"
                            ></div>
                          </div>
                          <span class="achpm-text">{{ achievement.progress }}/{{ achievement.target }}</span>
                        </div>
                        <div v-if="achievement.isUnlocked && achievement.unlockedDate" class="ach-date">
                          {{ formatDate(achievement.unlockedDate) }} 解锁
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-show="detailTab === 'history'" class="detail-tab-content">
                <div class="history-section">
                  <div v-if="selectedItem.extended.saleHistory.length > 0" class="history-subsection">
                    <h4 class="subsection-title">💰 成交记录</h4>
                    <div class="history-list">
                      <div 
                        v-for="(sale, idx) in [...selectedItem.extended.saleHistory].reverse()"
                        :key="idx"
                        class="history-item-card card"
                      >
                        <div class="hi-header">
                          <span class="hi-price">¥{{ sale.salePrice }}</span>
                          <span class="hi-date">{{ formatDate(sale.timestamp) }}</span>
                        </div>
                        <div class="hi-details">
                          <span class="hi-customer">👤 {{ sale.customerName }}</span>
                          <span class="hi-satisfaction" :style="{ color: sale.satisfaction >= 80 ? 'var(--success)' : (sale.satisfaction >= 60 ? 'var(--accent-gold)' : 'var(--danger)') }">
                            😊 满意度 {{ sale.satisfaction }}%
                          </span>
                        </div>
                        <div class="hi-tags">
                          <span v-if="sale.wasMember" class="hi-tag hi-tag-member">
                            {{ getLevelIcon(sale.memberLevel!) }} 会员
                          </span>
                          <span v-if="sale.wasBargained" class="hi-tag hi-tag-bargain">
                            🤝 砍价成交
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="history-summary card">
                      <div class="hs-item">
                        <span class="hs-label">总成交次数</span>
                        <span class="hs-value">{{ selectedItem.extended.totalSalesCount }} 次</span>
                      </div>
                      <div class="hs-item">
                        <span class="hs-label">累计营收</span>
                        <span class="hs-value" style="color: var(--success)">¥{{ selectedItem.extended.totalSaleRevenue }}</span>
                      </div>
                      <div class="hs-item">
                        <span class="hs-label">平均售价</span>
                        <span class="hs-value">¥{{ selectedItem.extended.totalSalesCount > 0 ? Math.round(selectedItem.extended.totalSaleRevenue / selectedItem.extended.totalSalesCount) : 0 }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-history">
                    <div class="eh-icon">💰</div>
                    <p>暂无成交记录</p>
                  </div>

                  <div v-if="selectedItem.extended.clearHistory.length > 0" class="history-subsection" style="margin-top: 20px">
                    <h4 class="subsection-title">🏆 通关成就</h4>
                    <div class="history-list">
                      <div 
                        v-for="(clear, idx) in [...selectedItem.extended.clearHistory].reverse()"
                        :key="idx"
                        class="history-item-card card"
                      >
                        <div class="hi-header">
                          <span class="hi-level">{{ clear.levelName }}</span>
                          <span class="hi-grade" :class="'grade-' + clear.grade.toLowerCase()">
                            {{ clear.grade }} 级
                          </span>
                        </div>
                        <div class="hi-details">
                          <span class="hi-score">📊 得分：{{ clear.totalScore }}</span>
                          <span class="hi-date">{{ formatDate(clear.clearedDate) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-show="detailTab === 'display'" class="detail-tab-content">
                <div v-if="selectedItem.extended.displayCopy" class="display-section">
                  <div class="display-headline card">
                    <h3 class="dh-title">{{ selectedItem.extended.displayCopy.headline }}</h3>
                    <p class="dh-tagline">{{ selectedItem.extended.displayCopy.tagline }}</p>
                  </div>

                  <div class="display-quote card">
                    <div class="dq-icon">💬</div>
                    <p class="dq-content">{{ selectedItem.extended.displayCopy.quote }}</p>
                  </div>

                  <div class="display-history card">
                    <h4 class="section-title">📖 专辑历史</h4>
                    <p class="display-text">{{ selectedItem.extended.displayCopy.history }}</p>
                  </div>

                  <div class="display-trivia card">
                    <h4 class="section-title">🎵 趣闻轶事</h4>
                    <p class="display-text">{{ selectedItem.extended.displayCopy.trivia }}</p>
                  </div>

                  <div class="display-mood card">
                    <h4 class="section-title">🎧 氛围描述</h4>
                    <p class="display-text">{{ selectedItem.extended.displayCopy.moodDescription }}</p>
                  </div>

                  <div class="display-pairing card">
                    <h4 class="section-title">🍷 推荐搭配</h4>
                    <p class="display-text">{{ selectedItem.extended.displayCopy.recommendedPairing }}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedMember" class="modal-overlay" @click.self="closeMemberDetail">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>会员档案</h3>
            <button class="close-btn" @click="closeMemberDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="member-detail-header">
              <div class="mdh-avatar-wrap">
                <div class="mdh-avatar">{{ selectedMember.avatar }}</div>
                <span
                  class="mdh-level-badge"
                  :style="{ background: getLevelColor(selectedMember.level) }"
                >
                  {{ getLevelIcon(selectedMember.level) }}
                </span>
              </div>
              <div class="mdh-info">
                <h2 class="mdh-name">{{ selectedMember.name }}</h2>
                <p
                  class="mdh-level"
                  :style="{ color: getLevelColor(selectedMember.level) }"
                >
                  {{ getLevelIcon(selectedMember.level) }} {{ getMemberProgress(selectedMember).benefit.levelName }}
                </p>
                <p class="mdh-joined">
                  入会日期：{{ formatDate(selectedMember.joinDate) }}
                </p>
              </div>
            </div>

            <div class="member-detail-progress card">
              <div class="mdp-header">
                <span>成长值进度</span>
                <span class="mdp-points">{{ selectedMember.growthPoints }} 点</span>
              </div>
              <div class="mdp-bar">
                <div
                  class="mdp-fill"
                  :style="{
                    width: getMemberProgress(selectedMember).progressToNext + '%',
                    background: `linear-gradient(90deg, ${getLevelColor(selectedMember.level)} 0%, var(--accent-gold) 100%)`
                  }"
                ></div>
              </div>
              <div class="mdp-footer">
                <span>{{ getMemberProgress(selectedMember).benefit.levelName }} ({{ getMemberProgress(selectedMember).benefit.minGrowthPoints }}点)</span>
                <span v-if="getMemberProgress(selectedMember).nextLevel">
                  {{ getMemberProgress(selectedMember).nextLevel!.levelName }} ({{ getMemberProgress(selectedMember).nextLevel!.minGrowthPoints }}点)
                </span>
                <span v-else>已满级</span>
              </div>
            </div>

            <div class="member-detail-stats">
              <div class="mds-item">
                <span class="mds-icon">🔄</span>
                <span class="mds-value">{{ selectedMember.visitCount }}</span>
                <span class="mds-label">到访次数</span>
              </div>
              <div class="mds-item">
                <span class="mds-icon">💳</span>
                <span class="mds-value">{{ selectedMember.purchaseCount }}</span>
                <span class="mds-label">购买次数</span>
              </div>
              <div class="mds-item">
                <span class="mds-icon">💰</span>
                <span class="mds-value">¥{{ selectedMember.totalSpent }}</span>
                <span class="mds-label">累计消费</span>
              </div>
              <div class="mds-item">
                <span class="mds-icon">🎯</span>
                <span class="mds-value">{{ Math.round(getMemberProgress(selectedMember).benefit.discountRate * 100) }}%</span>
                <span class="mds-label">专属折扣</span>
              </div>
            </div>

            <div class="member-detail-preferences card">
              <h4 class="mdp-title">🎵 偏好档案</h4>
              <div class="mdpref-item">
                <span class="mdpref-label">喜欢风格</span>
                <span class="mdpref-value">{{ selectedMember.favoriteGenres.join('、') }}</span>
              </div>
              <div class="mdpref-item">
                <span class="mdpref-label">价格范围</span>
                <span class="mdpref-value">¥{{ selectedMember.priceRange[0] }} - ¥{{ selectedMember.priceRange[1] }}</span>
              </div>
              <div class="mdpref-item">
                <span class="mdpref-label">稀有度偏好</span>
                <span class="mdpref-value">{{ selectedMember.preferredRarity.map(r => r + '星').join('、') }}</span>
              </div>
              <div class="mdpref-item">
                <span class="mdpref-label">偏好强度</span>
                <span class="mdpref-value">{{ Math.round(selectedMember.preferenceStrength * 100) }}%</span>
              </div>
            </div>

            <div class="member-detail-benefit card">
              <h4 class="mdp-title">🎁 当前等级权益</h4>
              <p class="mdp-desc">{{ getMemberProgress(selectedMember).benefit.description }}</p>
              <div class="mdp-benefits-list">
                <div class="mdp-benefit-item">
                  <span>💸 专属折扣</span>
                  <span class="mdp-benefit-value">{{ Math.round(getMemberProgress(selectedMember).benefit.discountRate * 100) }}%</span>
                </div>
                <div class="mdp-benefit-item">
                  <span>📈 成长加速</span>
                  <span class="mdp-benefit-value">x{{ getMemberProgress(selectedMember).benefit.bonusGrowthRate }}</span>
                </div>
                <div class="mdp-benefit-item">
                  <span>⭐ 推荐优先度</span>
                  <span class="mdp-benefit-value">+{{ getMemberProgress(selectedMember).benefit.priorityBoost }}</span>
                </div>
                <div class="mdp-benefit-item">
                  <span>💰 价格范围扩展</span>
                  <span class="mdp-benefit-value">+{{ Math.round(getMemberProgress(selectedMember).benefit.priceRangeExpand * 100) }}%</span>
                </div>
              </div>
            </div>

            <div class="notes-section">
              <label class="notes-label">会员备注</label>
              <textarea
                class="notes-input"
                :value="selectedMember.notes"
                @input="handleMemberNotesInput"
                placeholder="记录这位会员的特殊喜好、生日等信息..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRenovateModal && renovateItem" class="modal-overlay" @click.self="closeRenovateModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>🔧 翻新收藏</h3>
            <button class="close-btn" @click="closeRenovateModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="renovate-record-info">
              <h4>{{ renovateItem.record.title }}</h4>
              <p>{{ renovateItem.record.artist }}</p>
              <div class="renovate-current-condition">
                <span>当前品相</span>
                <div class="condition-bar-lg">
                  <div 
                    class="condition-fill-lg" 
                    :style="{ width: renovateItem.conditionScore + '%', background: getConditionColor(renovateItem.conditionScore) }"
                  ></div>
                </div>
                <span :style="{ color: getConditionColor(renovateItem.conditionScore) }">
                  {{ getConditionLabel(renovateItem.conditionScore) }} ({{ renovateItem.conditionScore }})
                </span>
              </div>
              <div class="renovate-value-preview">
                <span>当前收藏价值</span>
                <span class="rvp-value">¥{{ renovateItem.collectionValue }}</span>
              </div>
            </div>

            <div class="renovate-options">
              <h4 class="ro-title">选择翻新方案</h4>
              <div 
                v-for="option in getRenovationOptions(renovateItem.conditionScore, renovateItem.record.rarity)" 
                :key="option.targetScore"
                class="renovate-option"
                :class="{ disabled: gameStore.budget < option.cost }"
                @click="handleRenovate(option.targetScore)"
              >
                <div class="ro-info">
                  <span class="ro-label" :style="{ color: getConditionColor(option.targetScore) }">
                    {{ option.targetLabel }}
                  </span>
                  <span class="ro-desc">{{ option.description }}</span>
                </div>
                <span class="ro-cost" :class="{ 'cannot-afford': gameStore.budget < option.cost }">
                  ¥{{ option.cost }}
                </span>
              </div>
            </div>

            <p v-if="renovateMessage" class="renovate-message" :class="renovateMessageType">
              {{ renovateMessage }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="selectedAlbum" class="modal-overlay" @click.self="closeAlbumDetail">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>📖 图鉴详情</h3>
            <button class="close-btn" @click="closeAlbumDetail">✕</button>
          </div>

          <div class="modal-body">
            <div class="album-detail-header">
              <div class="adh-icon">{{ selectedAlbum.icon }}</div>
              <div class="adh-info">
                <h2 class="adh-name">
                  {{ selectedAlbum.name }}
                  <span v-if="selectedAlbum.isActivated" class="adh-activated">✓ 已激活</span>
                </h2>
                <p class="adh-desc">{{ selectedAlbum.description }}</p>
                <div class="adh-progress">
                  <div class="adh-progress-bar">
                    <div 
                      class="adh-progress-fill" 
                      :style="{ 
                        width: getAlbumEntryProgress(selectedAlbum) + '%',
                        background: selectedAlbum.isActivated ? 'var(--success)' : 'var(--accent-gold)'
                      }"
                    ></div>
                  </div>
                  <span class="adh-progress-text">{{ getAlbumEntryProgress(selectedAlbum) }}% 完成</span>
                </div>
              </div>
            </div>

            <div class="album-requirements card">
              <h4 class="ar-title">📋 激活条件</h4>
              <div class="ar-info">
                <span>最低品相：{{ getConditionLabel(selectedAlbum.requiredMinCondition) }}</span>
                <span>最低稀有度：{{ selectedAlbum.requiredMinRarity }} 星</span>
              </div>
              <div class="ar-records">
                <div 
                  v-for="recordId in selectedAlbum.requiredRecordIds" 
                  :key="recordId"
                  class="ar-record-item"
                  :class="{ collected: getRecordById(recordId) }"
                >
                  <span class="arr-icon">
                    {{ getRecordById(recordId) ? '✓' : '○' }}
                  </span>
                  <span class="arr-title">
                    {{ getRecordById(recordId)?.title || '未收集' }}
                  </span>
                  <span v-if="getRecordById(recordId)" class="arr-rarity">
                    {{ rarityStars(getRecordById(recordId)!.rarity) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="album-bonuses card">
              <h4 class="ab-title">🎁 激活加成</h4>
              <div class="ab-list">
                <div 
                  v-for="(bonus, idx) in selectedAlbum.bonuses" 
                  :key="idx"
                  class="ab-item"
                  :class="{ active: selectedAlbum.isActivated }"
                >
                  <span class="ab-icon">✨</span>
                  <span class="ab-type">{{ getBonusTypeLabel(bonus.type) }}</span>
                  <span class="ab-value">{{ formatBonusValue(bonus.type, bonus.value) }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedAlbum.activatedDate" class="album-activated-date">
              激活时间：{{ formatDate(selectedAlbum.activatedDate) }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.collection-view {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 100vh;
  background: var(--bg-primary);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.cv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.cv-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.cv-count {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.cv-toolbar {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--accent-gold);
  color: white;
}

.sort-select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  width: fit-content;
}

.collection-grid {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.collection-item:hover {
  border-color: var(--accent-gold);
  transform: translateX(4px);
}

.ci-cover {
  position: relative;
  flex-shrink: 0;
}

.fav-icon {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 16px;
}

.ci-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ci-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ci-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.ci-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ci-rarity {
  font-size: 11px;
  letter-spacing: 1px;
}

.ci-genre {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.ci-condition {
  font-size: 10px;
  font-weight: 600;
}

.ci-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.ci-price {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-orange);
}

.ci-date {
  font-size: 10px;
  color: var(--text-muted);
}

.empty-collection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.ec-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-collection h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-collection p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 280px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 1;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
}

.modal-body {
  padding: 20px 16px;
}

.detail-cover {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  margin-right: 12px;
}

.fav-btn {
  background: transparent;
  font-size: 24px;
  padding: 0;
}

.detail-artist {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.detail-tag {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.detail-rarity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.rarity-label {
  font-size: 12px;
  color: var(--text-muted);
}

.detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.ds-item {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.ds-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.ds-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notes-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.notes-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: none;
}

.notes-input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.notes-input::placeholder {
  color: var(--text-muted);
}

.cv-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
}

.cv-tab {
  flex: 1;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.cv-tab.active {
  color: var(--accent-gold);
  border-bottom-color: var(--accent-gold);
}

.tab-count {
  background: var(--bg-secondary);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.cv-tab.active .tab-count {
  background: var(--accent-gold);
  color: var(--bg-primary);
}

.member-stats-card {
  margin: 12px 16px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.08) 0%, rgba(233, 69, 96, 0.08) 100%);
  border: 1px solid rgba(246, 224, 94, 0.2);
  border-radius: 12px;
}

.msc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.msc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  background: var(--bg-card);
  border-radius: 8px;
}

.msc-icon {
  font-size: 20px;
}

.msc-info {
  display: flex;
  flex-direction: column;
}

.msc-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-gold);
  line-height: 1.1;
}

.msc-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}

.msc-legend {
  padding-top: 10px;
  border-top: 1px dashed rgba(246, 224, 94, 0.3);
}

.mscl-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.mscl-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mscl-badge {
  padding: 3px 8px;
  background: var(--bg-card);
  border: 1px solid;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.member-grid {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.member-card:hover {
  transform: translateX(4px);
  border-color: var(--accent-gold);
}

.mc-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.mc-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.mc-level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid var(--bg-card);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.mc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mc-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.mc-level-name {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  background: currentColor;
  opacity: 0.15;
  border-radius: 8px;
}

.mc-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.mc-stat {
  font-size: 10px;
  color: var(--text-secondary);
}

.mc-progress {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.mc-progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.mc-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--text-muted);
}

.member-detail-header {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.mdh-avatar-wrap {
  position: relative;
}

.mdh-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.mdh-level-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 3px solid var(--bg-card);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.mdh-info {
  flex: 1;
}

.mdh-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.mdh-level {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.mdh-joined {
  font-size: 11px;
  color: var(--text-muted);
}

.member-detail-progress {
  margin-bottom: 16px;
}

.mdp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.mdp-points {
  color: var(--accent-gold);
  font-weight: 700;
}

.mdp-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.mdp-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.mdp-footer {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--text-muted);
}

.member-detail-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.mds-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.mds-icon {
  font-size: 14px;
  margin-bottom: 4px;
}

.mds-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}

.mds-label {
  font-size: 8px;
  color: var(--text-muted);
  margin-top: 2px;
}

.member-detail-preferences {
  margin-bottom: 16px;
  padding: 14px;
}

.mdp-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.mdpref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--bg-secondary);
}

.mdpref-item:last-child {
  border-bottom: none;
}

.mdpref-label {
  font-size: 11px;
  color: var(--text-muted);
}

.mdpref-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.member-detail-benefit {
  margin-bottom: 16px;
  padding: 14px;
}

.mdp-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.6;
}

.mdp-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mdp-benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.mdp-benefit-value {
  font-weight: 700;
  color: var(--accent-gold);
}

.detail-condition-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.dcs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dcs-label {
  font-size: 11px;
  color: var(--text-muted);
}

.dcs-score {
  font-size: 14px;
  font-weight: 700;
}

.dcs-bar {
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dcs-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.dcs-desc {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
}

.renovate-section {
  margin-bottom: 16px;
}

.renovate-trigger-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.15) 0%, rgba(233, 69, 96, 0.1) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
  border-radius: 10px;
  color: var(--accent-gold);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.renovate-trigger-btn:hover {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.25) 0%, rgba(233, 69, 96, 0.15) 100%);
  border-color: var(--accent-gold);
}

.renovate-record-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.renovate-record-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.renovate-current-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.condition-bar-lg {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.condition-fill-lg {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.renovate-value-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(246, 224, 94, 0.08);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.rvp-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-gold);
}

.ro-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.renovate-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  margin-bottom: 6px;
}

.renovate-option:hover:not(.disabled) {
  border-color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.1);
}

.renovate-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ro-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ro-label {
  font-size: 13px;
  font-weight: 600;
}

.ro-desc {
  font-size: 10px;
  color: var(--text-muted);
}

.ro-cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-gold);
}

.ro-cost.cannot-afford {
  color: var(--danger);
}

.renovate-message {
  text-align: center;
  font-size: 13px;
  padding: 10px;
  border-radius: 6px;
}

.renovate-message.success {
  color: var(--success);
  background: rgba(72, 187, 120, 0.1);
}

.renovate-message.error {
  color: var(--danger);
  background: rgba(245, 101, 101, 0.1);
}

.album-stats-card {
  margin: 12px 16px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(233, 69, 96, 0.1) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
  border-radius: 12px;
}

.asc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.asc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  background: var(--bg-card);
  border-radius: 8px;
}

.asc-icon {
  font-size: 20px;
}

.asc-info {
  display: flex;
  flex-direction: column;
}

.asc-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-gold);
  line-height: 1.1;
}

.asc-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}

.active-bonuses-card {
  margin: 0 16px 12px;
  padding: 14px;
  background: rgba(72, 187, 120, 0.08);
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 12px;
}

.abc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.abc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.abc-item {
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.album-categories {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.album-category {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.ac-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(90deg, rgba(246, 224, 94, 0.08) 0%, transparent 100%);
  border-bottom: 1px solid var(--border);
}

.ac-icon {
  font-size: 28px;
}

.ac-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.ac-info p {
  font-size: 11px;
  color: var(--text-muted);
}

.album-entries {
  display: flex;
  flex-direction: column;
}

.album-entry {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;
}

.album-entry:last-child {
  border-bottom: none;
}

.album-entry.available {
  opacity: 0.9;
  background: rgba(246, 224, 94, 0.05);
}

.album-entry.activated {
  opacity: 1;
  background: rgba(72, 187, 120, 0.08);
}

.album-entry:hover {
  background: rgba(246, 224, 94, 0.1);
  transform: translateX(4px);
}

.ae-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.ae-info {
  flex: 1;
  min-width: 0;
}

.ae-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ae-activated-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--success);
  background: rgba(72, 187, 120, 0.2);
  padding: 2px 6px;
  border-radius: 6px;
}

.ae-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  line-height: 1.4;
}

.ae-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ae-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.ae-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ae-progress-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.ae-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ae-bonus-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.15);
  padding: 3px 8px;
  border-radius: 8px;
}

.album-detail-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.adh-icon {
  font-size: 56px;
  flex-shrink: 0;
}

.adh-info {
  flex: 1;
}

.adh-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.adh-activated {
  font-size: 12px;
  font-weight: 700;
  color: var(--success);
  background: rgba(72, 187, 120, 0.2);
  padding: 3px 8px;
  border-radius: 8px;
}

.adh-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.adh-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adh-progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.adh-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.adh-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-gold);
  white-space: nowrap;
}

.album-requirements {
  margin-bottom: 16px;
  padding: 14px;
}

.ar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.ar-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border);
}

.ar-records {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ar-record-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 12px;
  opacity: 0.6;
}

.ar-record-item.collected {
  opacity: 1;
  background: rgba(72, 187, 120, 0.1);
}

.arr-icon {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted);
}

.ar-record-item.collected .arr-icon {
  color: var(--success);
}

.arr-title {
  flex: 1;
  color: var(--text-secondary);
}

.ar-record-item.collected .arr-title {
  color: var(--text-primary);
  font-weight: 500;
}

.arr-rarity {
  font-size: 10px;
  color: var(--accent-gold);
}

.album-bonuses {
  margin-bottom: 16px;
  padding: 14px;
}

.ab-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.ab-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  opacity: 0.5;
  transition: all 0.2s;
}

.ab-item.active {
  opacity: 1;
  background: rgba(246, 224, 94, 0.1);
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.ab-icon {
  font-size: 16px;
}

.ab-type {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.ab-item.active .ab-type {
  color: var(--text-primary);
  font-weight: 500;
}

.ab-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-gold);
}

.album-activated-date {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.card {
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 12px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.detail-quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.dqs-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.dqs-icon {
  font-size: 18px;
}

.dqs-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dqs-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-gold);
  line-height: 1.1;
}

.dqs-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}

.detail-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 16px;
}

.detail-tab-btn {
  flex: 1;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.detail-tab-btn.active {
  background: var(--accent-gold);
  color: var(--bg-primary);
}

.detail-tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.source-section {
  margin-bottom: 16px;
}

.source-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.source-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.source-content {
  flex: 1;
  min-width: 0;
}

.source-name {
  margin-bottom: 4px;
  font-size: 14px;
}

.source-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.source-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
}

.story-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-header-card {
  display: flex;
  gap: 14px;
  align-items: center;
}

.story-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.story-title-info {
  flex: 1;
  min-width: 0;
}

.story-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.story-progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.story-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.story-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.story-progress-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-gold);
  white-space: nowrap;
}

.story-complete-badge {
  display: inline-block;
  padding: 3px 10px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.2) 0%, rgba(233, 69, 96, 0.2) 100%);
  color: var(--accent-gold);
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
}

.story-chapters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.story-chapter-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.story-chapter-card.unlocked {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.08) 0%, rgba(233, 69, 96, 0.05) 100%);
  border-color: rgba(246, 224, 94, 0.2);
}

.story-chapter-card.locked {
  opacity: 0.5;
}

.chapter-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.chapter-index {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--accent-gold);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.story-chapter-card.locked .chapter-index {
  background: var(--bg-card);
  color: var(--text-muted);
}

.chapter-title-info {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.chapter-condition {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
}

.chapter-days-hint {
  color: #f59e0b;
  font-weight: 600;
}

.chapter-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 44px;
}

.achievements-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.achievements-summary {
  display: flex;
  gap: 14px;
  align-items: center;
}

.ach-summary-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.ach-summary-info {
  flex: 1;
  min-width: 0;
}

.ach-summary-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.ach-summary-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ach-progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.ach-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.ach-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
  white-space: nowrap;
}

.achievements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.achievement-card {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  transition: all 0.2s;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(246, 224, 94, 0.08) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.achievement-card.locked {
  opacity: 0.6;
}

.ach-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  filter: grayscale(0.8);
  transition: all 0.2s;
}

.ach-icon.unlocked {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.2) 0%, rgba(233, 69, 96, 0.2) 100%);
  filter: grayscale(0);
}

.ach-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ach-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.ach-desc {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 6px;
}

.ach-progress-mini {
  display: flex;
  align-items: center;
  gap: 6px;
}

.achpm-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-card);
  border-radius: 2px;
  overflow: hidden;
}

.achpm-fill {
  height: 100%;
  background: var(--accent-gold);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.achpm-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
}

.ach-date {
  font-size: 10px;
  color: var(--success);
  font-weight: 500;
}

.history-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.history-item-card {
  margin-bottom: 0;
}

.hi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hi-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-gold);
}

.hi-level {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.hi-date {
  font-size: 11px;
  color: var(--text-muted);
}

.hi-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.hi-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hi-tag {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.hi-tag-member {
  background: rgba(246, 224, 94, 0.15);
  color: var(--accent-gold);
}

.hi-tag-bargain {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.hi-grade {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
}

.hi-grade.grade-s {
  background: linear-gradient(135deg, #f6e05e, #ecc94b);
  color: #744210;
}

.hi-grade.grade-a {
  background: linear-gradient(135deg, #68d391, #48bb78);
  color: #22543d;
}

.hi-grade.grade-b {
  background: linear-gradient(135deg, #63b3ed, #4299e1);
  color: #1a365d;
}

.hi-grade.grade-c {
  background: linear-gradient(135deg, #fbd38d, #f6ad55);
  color: #7b341e;
}

.hi-grade.grade-d {
  background: linear-gradient(135deg, #fc8181, #f56565);
  color: #742a2a;
}

.history-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 0;
}

.hs-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.hs-label {
  font-size: 9px;
  color: var(--text-muted);
}

.hs-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.empty-history .eh-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-history p {
  font-size: 13px;
  color: var(--text-muted);
}

.display-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.display-headline {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.12) 0%, rgba(233, 69, 96, 0.12) 100%);
  border-color: rgba(246, 224, 94, 0.3);
  text-align: center;
}

.dh-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dh-tagline {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.display-quote {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 179, 237, 0.08) 100%);
  border-color: rgba(139, 92, 246, 0.2);
}

.dq-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.dq-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  font-style: italic;
  flex: 1;
}

.display-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.display-history,
.display-trivia,
.display-mood,
.display-pairing {
  background: var(--bg-card);
}
</style>
