<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { CollectionItem } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const selectedItem = ref<CollectionItem | null>(null)
const filterGenre = ref<string>('all')
const sortBy = ref<'date' | 'price' | 'rarity'>('date')

const genres = computed(() => {
  const gs = new Set(gameStore.collection.map(c => c.record.genre))
  return ['all', ...Array.from(gs)]
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
  }
  
  return items
})

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

const conditionColor = (condition: string) => {
  const colors: { [key: string]: string } = {
    'Mint': '#48bb78',
    'Near Mint': '#38b2ac',
    'Very Good': '#ed8936',
    'Good': '#e53e3e'
  }
  return colors[condition] || '#718096'
}
</script>

<template>
  <div class="collection-view">
    <div class="cv-header">
      <button class="back-btn" @click="emit('close')">← 返回</button>
      <h1 class="cv-title">📚 我的收藏</h1>
      <div class="cv-count">
        {{ gameStore.collection.length }} 张
      </div>
    </div>

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
          </div>
          <div class="ci-bottom">
            <span class="ci-price">¥{{ item.purchasePrice }}</span>
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
                  :style="{ color: conditionColor(selectedItem.record.condition) }"
                >
                  {{ selectedItem.record.condition }}
                </span>
              </div>

              <div class="detail-rarity">
                <span style="color: #f6e05e">{{ rarityStars(selectedItem.record.rarity) }}</span>
                <span class="rarity-label">{{ selectedItem.record.rarity }} 星稀有</span>
              </div>

              <p class="detail-desc">{{ selectedItem.record.description }}</p>

              <div class="detail-stats">
                <div class="ds-item">
                  <span class="ds-label">购入价格</span>
                  <span class="ds-value">¥{{ selectedItem.purchasePrice }}</span>
                </div>
                <div class="ds-item">
                  <span class="ds-label">购入时间</span>
                  <span class="ds-value">{{ formatDate(selectedItem.acquiredDate) }}</span>
                </div>
                <div class="ds-item">
                  <span class="ds-label">曲目数量</span>
                  <span class="ds-value">{{ selectedItem.record.trackCount }} 首</span>
                </div>
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
</style>
