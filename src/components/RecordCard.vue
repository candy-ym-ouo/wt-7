<script setup lang="ts">
import type { Record as VinylRecordType } from '@/types'
import VinylRecord from './VinylRecord.vue'
import { getConditionLabel, getConditionColor } from '@/data/condition'
import { computed } from 'vue'

interface Props {
  record: VinylRecordType
  showPrice?: boolean
  showCost?: boolean
  customCost?: number
  quantity?: number
  highlight?: boolean
  matchScore?: number
  conditionScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  showPrice: true,
  showCost: false,
  customCost: 0,
  quantity: 0,
  highlight: false,
  matchScore: 0,
  conditionScore: -1
})

const effectiveCost = computed(() => {
  return props.customCost > 0 ? props.customCost : props.record.costPrice
})

const emit = defineEmits<{
  click: []
}>()

const rarityStars = (rarity: number) => '★'.repeat(rarity) + '☆'.repeat(5 - rarity)

const effectiveConditionScore = () => {
  return props.conditionScore >= 0 ? props.conditionScore : getConditionScoreFromLabel(props.record.condition)
}

const getConditionScoreFromLabel = (label: string): number => {
  const map: Record<string, number> = {
    'Mint': 95,
    'Near Mint': 82,
    'Very Good': 65,
    'Good': 45,
    'Poor': 20
  }
  return map[label] || 50
}
</script>

<template>
  <div 
    class="record-card"
    :class="{ highlight, clickable: $attrs.onClick }"
    @click="emit('click')"
  >
    <div class="card-header">
      <VinylRecord :record="record" size="small" />
      <div class="record-basic">
        <h3 class="record-title">{{ record.title }}</h3>
        <p class="record-artist">{{ record.artist }}</p>
        <div class="record-meta">
          <span class="genre-tag">{{ record.genre }}</span>
          <span class="year">{{ record.year }}</span>
        </div>
      </div>
      <div v-if="quantity > 0" class="quantity-badge">×{{ quantity }}</div>
    </div>

    <div class="card-body">
      <div class="meta-row">
        <span class="rarity" :style="{ color: '#f6e05e' }">{{ rarityStars(record.rarity) }}</span>
        <span class="condition" :style="{ color: getConditionColor(effectiveConditionScore()) }">
          {{ getConditionLabel(effectiveConditionScore()) }}
        </span>
      </div>
      
      <div class="condition-bar">
        <div 
          class="condition-fill" 
          :style="{ 
            width: effectiveConditionScore() + '%', 
            background: getConditionColor(effectiveConditionScore())
          }"
        ></div>
        <span class="condition-score">{{ effectiveConditionScore() }}</span>
      </div>

      <div v-if="matchScore > 0" class="match-score">
        <div class="match-bar">
          <div class="match-fill" :style="{ width: `${matchScore}%` }"></div>
        </div>
        <span class="match-text">匹配度 {{ Math.round(matchScore) }}%</span>
      </div>

      <p class="description">{{ record.description }}</p>

      <div class="price-section">
        <div v-if="showCost" class="price-row">
          <span class="price-label">进价</span>
          <span class="cost-price">¥{{ effectiveCost }}</span>
        </div>
        <div v-if="showPrice" class="price-row">
          <span class="price-label">售价</span>
          <span class="market-price">¥{{ record.marketPrice }}</span>
        </div>
        <div v-if="showPrice && showCost" class="profit-row">
          <span class="profit-label">利润</span>
          <span class="profit-value">+¥{{ record.marketPrice - effectiveCost }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.record-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.record-card.clickable {
  cursor: pointer;
}

.record-card.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--accent-gold);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.2);
}

.record-card.highlight {
  border-color: var(--accent-gold);
  box-shadow: 0 0 16px rgba(233, 69, 96, 0.3);
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
}

.record-basic {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.record-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.genre-tag {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.year {
  font-size: 10px;
  color: var(--text-muted);
}

.quantity-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-gold);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.card-body {
  margin-top: 10px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rarity {
  font-size: 12px;
  letter-spacing: 1px;
}

.condition {
  font-size: 11px;
  font-weight: 500;
}

.condition-bar {
  position: relative;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.condition-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.condition-score {
  position: absolute;
  right: 4px;
  top: -1px;
  font-size: 8px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 8px;
}

.match-score {
  margin-bottom: 8px;
}

.match-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.match-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success) 0%, var(--accent-orange) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.match-text {
  font-size: 10px;
  color: var(--text-secondary);
}

.description {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px;
}

.price-row,
.profit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.price-row + .price-row {
  margin-top: 4px;
}

.profit-row {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}

.price-label,
.profit-label {
  color: var(--text-muted);
}

.cost-price {
  color: var(--danger);
  font-weight: 600;
}

.market-price {
  color: var(--text-primary);
  font-weight: 600;
}

.profit-value {
  color: var(--success);
  font-weight: 600;
}
</style>
