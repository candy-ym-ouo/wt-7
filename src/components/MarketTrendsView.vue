<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import {
  getHeatLevelInfo,
  getTrendIcon as getMarketTrendIcon,
  formatHeatValue
} from '@/data/marketHeat'
import {
  getTrendColor,
  getTrendArrow,
  getRiskColor,
  getRiskLabel,
  getDemandLabel,
  getDemandColor,
  getInsightCategoryColor,
  getInsightCategoryLabel,
  getRarityColor,
  getRarityLabel
} from '@/data/marketTrends'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

type TabType = 'heat' | 'price' | 'rare' | 'purchase'
const activeTab = ref<TabType>('heat')

const tabs = [
  { id: 'heat' as TabType, name: '风格热度', icon: '🔥' },
  { id: 'price' as TabType, name: '价格指数', icon: '📊' },
  { id: 'rare' as TabType, name: '稀有波动', icon: '⭐' },
  { id: 'purchase' as TabType, name: '采购建议', icon: '💡' }
]

const allGenreHeats = computed(() => {
  return Array.from(gameStore.genreMarketHeat.values())
    .sort((a, b) => b.heatValue - a.heatValue)
})

const allGenrePriceIndices = computed(() => {
  return Array.from(gameStore.genrePriceIndicesComputed.values())
    .sort((a, b) => b.currentIndex - a.currentIndex)
})

const marketSummary = computed(() => gameStore.marketCenterSummary)

const overallTrendIcon = computed(() => {
  const trend = gameStore.overallMarketTrend
  const icons = { rising: '📈', stable: '➡️', falling: '📉' }
  return icons[trend as keyof typeof icons]
})

const overallTrendColor = computed(() => {
  const trend = gameStore.overallMarketTrend
  const colors = { rising: '#48bb78', stable: '#a0aec0', falling: '#fc8181' }
  return colors[trend as keyof typeof colors]
})

const getHeatBarWidth = (heatValue: number) => {
  return `${Math.round(heatValue * 100)}%`
}

const getPriceBarWidth = (index: number) => {
  const min = Math.min(...Array.from(gameStore.genrePriceIndicesComputed.values()).map(i => i.currentIndex))
  const max = Math.max(...Array.from(gameStore.genrePriceIndicesComputed.values()).map(i => i.currentIndex))
  if (max === min) return '50%'
  return `${Math.round(((index - min) / (max - min)) * 80 + 10)}%`
}

const getSparklinePoints = (history: number[]) => {
  if (history.length < 2) return ''
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const width = 100
  const height = 30
  const step = width / (history.length - 1)
  
  return history.map((val, i) => {
    const x = i * step
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')
}

const getSparklineColor = (trend: string) => {
  return getTrendColor(trend as any)
}

const formatIndexChange = (change: number) => {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

const formatPriceChange = (change: number, changePercent: number) => {
  const sign = change > 0 ? '+' : ''
  return `${sign}¥${change} (${sign}${changePercent.toFixed(1)}%)`
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return labels[priority] || priority
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: '#fc8181',
    medium: '#f6ad55',
    low: '#a0aec0'
  }
  return colors[priority] || '#a0aec0'
}
</script>

<template>
  <div class="market-trends-overlay">
    <div class="market-trends-panel animate-slide-up">
      <div class="panel-header">
        <div class="header-left">
          <span class="header-icon">📈</span>
          <div>
            <h2 class="header-title">市场行情中心</h2>
            <p class="header-subtitle">第 {{ gameStore.currentDay }} 天 · 实时行情</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="market-summary-card">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">综合市场指数</span>
            <div class="summary-value-row">
              <span class="summary-value">{{ gameStore.overallMarketIndex }}</span>
              <span class="summary-trend" :style="{ color: overallTrendColor }">
                {{ overallTrendIcon }} {{ formatIndexChange(marketSummary.overallPriceChange) }}
              </span>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-label">稀有唱片指数</span>
            <div class="summary-value-row">
              <span class="summary-value">¥{{ marketSummary.rareRecordIndex }}</span>
              <span class="summary-trend" :style="{ color: getTrendColor(marketSummary.rareRecordPriceChange >= 0 ? 'rising' : 'falling') }">
                {{ marketSummary.rareRecordPriceChange >= 0 ? '📈' : '📉' }} {{ formatIndexChange(marketSummary.rareRecordPriceChange) }}
              </span>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-label">最火风格</span>
            <span class="summary-value highlight">{{ marketSummary.hottestGenre }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最冷风格</span>
            <span class="summary-value cold">{{ marketSummary.coldestGenre }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均利润率</span>
            <span class="summary-value profit">{{ marketSummary.avgProfitMargin }}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最佳销量稀有度</span>
            <span class="summary-value" :style="{ color: getRarityColor(marketSummary.bestSellingRarity) }">{{ getRarityLabel(marketSummary.bestSellingRarity) }}</span>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'heat'" class="heat-content">
          <div class="section-header">
            <h3>风格热度排行</h3>
            <p>各音乐风格的当前市场热度与趋势</p>
          </div>
          
          <div class="heat-list">
            <div
              v-for="(heat, index) in allGenreHeats"
              :key="heat.genre"
              class="heat-item"
            >
              <div class="heat-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</div>
              
              <div class="heat-info">
                <div class="heat-genre-row">
                  <span class="heat-genre">{{ heat.genre }}</span>
                  <span class="heat-level-icon">{{ getHeatLevelInfo(heat.heatLevel).icon }}</span>
                  <span class="heat-level" :style="{ color: getHeatLevelInfo(heat.heatLevel).color }">
                    {{ getHeatLevelInfo(heat.heatLevel).label }}
                  </span>
                  <span class="heat-trend-icon">{{ getMarketTrendIcon(heat.trend) }}</span>
                </div>
                
                <div class="heat-bar-container">
                  <div class="heat-bar-bg">
                    <div
                      class="heat-bar-fill"
                      :style="{
                        width: getHeatBarWidth(heat.heatValue),
                        background: `linear-gradient(90deg, ${getHeatLevelInfo(heat.heatLevel).color}80 0%, ${getHeatLevelInfo(heat.heatLevel).color} 100%)`
                      }"
                    ></div>
                  </div>
                  <span class="heat-value">{{ formatHeatValue(heat.heatValue) }}</span>
                </div>
                
                <div class="heat-modifiers">
                  <span class="modifier">
                    <span class="modifier-label">售价</span>
                    <span class="modifier-value" :class="{ positive: heat.priceModifier > 1, negative: heat.priceModifier < 1 }">
                      ×{{ heat.priceModifier.toFixed(2) }}
                    </span>
                  </span>
                  <span class="modifier">
                    <span class="modifier-label">需求</span>
                    <span class="modifier-value" :class="{ positive: heat.demandModifier > 1, negative: heat.demandModifier < 1 }">
                      ×{{ heat.demandModifier.toFixed(2) }}
                    </span>
                  </span>
                  <span class="modifier">
                    <span class="modifier-label">利润</span>
                    <span class="modifier-value" :class="{ positive: heat.profitMarginModifier > 1, negative: heat.profitMarginModifier < 1 }">
                      ×{{ heat.profitMarginModifier.toFixed(2) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'price'" class="price-content">
          <div class="section-header">
            <h3>价格指数</h3>
            <p>各风格唱片的价格走势与波动</p>
          </div>

          <div class="price-overview">
            <div class="price-index-card">
              <span class="p-index-label">综合指数</span>
              <div class="p-index-value-row">
                <span class="p-index-value">{{ gameStore.overallMarketIndex }}</span>
                <span class="p-index-change" :style="{ color: overallTrendColor }">
                  {{ getTrendArrow(gameStore.overallMarketTrend as any) }}
                  {{ formatIndexChange(marketSummary.overallPriceChange) }}
                </span>
              </div>
              <p class="p-index-desc">基于所有风格的加权平均价格指数</p>
            </div>
          </div>

          <div class="price-list">
            <div
              v-for="priceIndex in allGenrePriceIndices"
              :key="priceIndex.genre"
              class="price-item"
            >
              <div class="price-main">
                <div class="price-left">
                  <span class="price-genre">{{ priceIndex.genre }}</span>
                  <div class="price-sparkline">
                    <svg width="100" height="30" viewBox="0 0 100 30">
                      <polyline
                        :points="getSparklinePoints(priceIndex.weeklyHistory)"
                        fill="none"
                        :stroke="getSparklineColor(priceIndex.trend)"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                </div>
                
                <div class="price-right">
                  <div class="price-index-row">
                    <span class="price-index">{{ priceIndex.currentIndex }}</span>
                    <span
                      class="price-change"
                      :style="{ color: getTrendColor(priceIndex.trend) }"
                    >
                      {{ getTrendArrow(priceIndex.trend) }}
                      {{ formatIndexChange(priceIndex.changePercent) }}
                    </span>
                  </div>
                  <div class="price-bar-container">
                    <div class="price-bar-bg">
                      <div
                        class="price-bar-fill"
                        :style="{
                          width: getPriceBarWidth(priceIndex.currentIndex),
                          background: `linear-gradient(90deg, ${getTrendColor(priceIndex.trend)}80 0%, ${getTrendColor(priceIndex.trend)} 100%)`
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="price-details">
                <span class="price-detail">
                  <span class="pd-label">均价</span>
                  <span class="pd-value">¥{{ priceIndex.avgMarketPrice }}</span>
                </span>
                <span class="price-detail">
                  <span class="pd-label">进价</span>
                  <span class="pd-value">¥{{ priceIndex.avgCostPrice }}</span>
                </span>
                <span class="price-detail">
                  <span class="pd-label">利润率</span>
                  <span class="pd-value profit">{{ priceIndex.profitMargin }}%</span>
                </span>
                <span class="price-detail">
                  <span class="pd-label">波动率</span>
                  <span class="pd-value" :class="{ warning: priceIndex.volatility > 0.3 }">
                    {{ (priceIndex.volatility * 100).toFixed(0) }}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'rare'" class="rare-content">
          <div class="section-header">
            <h3>稀有唱片波动</h3>
            <p>高稀有度唱片的价格变动与市场需求</p>
          </div>

          <div v-if="gameStore.rareRecordFluctuations.length === 0" class="empty-state">
            <p>暂无稀有唱片数据</p>
          </div>

          <div v-else class="rare-list">
            <div
              v-for="rare in gameStore.rareRecordFluctuations"
              :key="rare.recordId"
              class="rare-item"
            >
              <div class="rare-header">
                <div class="rare-cover" :style="{ background: rare.record.coverColor }">
                  <span class="rare-rarity" :style="{ color: getRarityColor(rare.rarity) }">★{{ rare.rarity }}</span>
                </div>
                <div class="rare-info">
                  <h4 class="rare-title">{{ rare.record.title }}</h4>
                  <p class="rare-artist">{{ rare.record.artist }}</p>
                  <div class="rare-tags">
                    <span class="rare-genre">{{ rare.record.genre }}</span>
                    <span class="rare-demand" :style="{ background: getDemandColor(rare.demandLevel) + '20', color: getDemandColor(rare.demandLevel) }">
                      {{ getDemandLabel(rare.demandLevel) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="rare-price-section">
                <div class="rare-current-price">
                  <span class="rcp-label">当前价格</span>
                  <span class="rcp-value">¥{{ rare.currentPrice }}</span>
                  <span
                    class="rcp-change"
                    :style="{ color: getTrendColor(rare.trend) }"
                  >
                    {{ getTrendArrow(rare.trend) }}
                    {{ formatPriceChange(rare.priceChange, rare.changePercent) }}
                  </span>
                </div>

                <div class="rare-price-chart">
                  <svg width="100%" height="40" viewBox="0 0 200 40">
                    <polyline
                      :points="getSparklinePoints(rare.priceHistory.map(p => p.price))"
                      fill="none"
                      :stroke="getTrendColor(rare.trend)"
                      stroke-width="2"
                    />
                  </svg>
                </div>

                <div class="rare-stats">
                  <div class="rare-stat">
                    <span class="rs-label">预测价格</span>
                    <span class="rs-value">¥{{ rare.predictedNextPrice }}</span>
                  </div>
                  <div class="rare-stat">
                    <span class="rs-label">波动率</span>
                    <span class="rs-value" :class="{ warning: rare.volatility > 0.3 }">
                      {{ (rare.volatility * 100).toFixed(0) }}%
                    </span>
                  </div>
                  <div class="rare-stat">
                    <span class="rs-label">收藏家兴趣</span>
                    <span class="rs-value collector">{{ rare.collectorInterest }}%</span>
                  </div>
                  <div class="rare-stat">
                    <span class="rs-label">历史销量</span>
                    <span class="rs-value">{{ rare.totalSalesCount }}张</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'purchase'" class="purchase-content">
          <div class="section-header">
            <h3>采购决策辅助</h3>
            <p>基于市场行情的智能采购建议</p>
          </div>

          <div class="insights-section">
            <h4 class="subsection-title">📡 市场洞察</h4>
            <div class="insights-list">
              <div
                v-for="insight in gameStore.marketInsights.slice(0, 5)"
                :key="insight.id"
                class="insight-item"
              >
                <div class="insight-icon" :style="{ background: getInsightCategoryColor(insight.category) + '20' }">
                  {{ insight.icon }}
                </div>
                <div class="insight-content">
                  <div class="insight-header">
                    <span class="insight-category" :style="{ color: getInsightCategoryColor(insight.category) }">
                      {{ getInsightCategoryLabel(insight.category) }}
                    </span>
                    <span class="insight-priority" :style="{ color: getPriorityColor(insight.priority) }">
                      {{ getPriorityLabel(insight.priority) }}
                    </span>
                  </div>
                  <h5 class="insight-title">{{ insight.title }}</h5>
                  <p class="insight-desc">{{ insight.description }}</p>
                  <p class="insight-impact">{{ insight.impactDescription }}</p>
                  <p v-if="insight.action" class="insight-action">💡 {{ insight.action }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="recommendations-section">
            <h4 class="subsection-title">🎯 推荐采购</h4>
            <p class="subsection-desc">当前预算：¥{{ gameStore.budget }}</p>
            
            <div v-if="gameStore.purchaseRecommendationsForMarket.length === 0" class="empty-state">
              <p>暂无推荐的采购选项</p>
            </div>

            <div v-else class="recommendations-list">
              <div
                v-for="rec in gameStore.purchaseRecommendationsForMarket"
                :key="rec.id"
                class="recommendation-item"
                :class="{ hot: rec.isHotPick, undervalued: rec.isUndervalued }"
              >
                <div class="rec-rank">{{ gameStore.purchaseRecommendationsForMarket.indexOf(rec) + 1 }}</div>
                
                <div class="rec-cover" :style="{ background: rec.record.coverColor }">
                  <span v-if="rec.isHotPick" class="rec-badge hot">🔥 热门</span>
                  <span v-else-if="rec.isUndervalued" class="rec-badge undervalued">💎 低估</span>
                </div>

                <div class="rec-info">
                  <h5 class="rec-title">{{ rec.record.title }}</h5>
                  <p class="rec-artist">{{ rec.record.artist }}</p>
                  <p class="rec-supplier">🏪 {{ rec.supplierName }}</p>
                  <div class="rec-tags">
                    <span class="rec-genre">{{ rec.record.genre }}</span>
                    <span class="rec-rarity" :style="{ color: getRarityColor(rec.record.rarity) }">
                      ★{{ rec.record.rarity }}
                    </span>
                    <span
                      class="rec-risk"
                      :style="{ background: getRiskColor(rec.riskLevel) + '20', color: getRiskColor(rec.riskLevel) }"
                    >
                      {{ getRiskLabel(rec.riskLevel) }}
                    </span>
                  </div>
                  <p class="rec-reason">{{ rec.reason }}</p>
                </div>

                <div class="rec-pricing">
                  <div class="rec-price-row">
                    <span class="rec-cost">¥{{ rec.adjustedCostPrice }}</span>
                    <span class="rec-arrow">→</span>
                    <span class="rec-market">¥{{ rec.marketPrice }}</span>
                  </div>
                  <div class="rec-profit-row">
                    <span class="rec-profit" :class="{ positive: rec.expectedProfit > 0 }">
                      +¥{{ rec.expectedProfit }}
                    </span>
                    <span class="rec-margin">{{ rec.profitMargin }}%</span>
                  </div>
                </div>

                <div class="rec-score">
                  <div class="rec-score-circle" :style="{ background: `conic-gradient(#48bb78 ${rec.priorityScore * 1.2}deg, #e2e8f0 0deg)` }">
                    <span>{{ Math.min(100, Math.round(rec.priorityScore)) }}</span>
                  </div>
                  <span class="rec-score-label">综合评分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-trends-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.market-trends-panel {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 28px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: 2px 0 0 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.market-summary-card {
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(56, 178, 172, 0.08) 100%);
  border-bottom: 1px solid var(--border);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 10px;
  color: var(--text-muted);
}

.summary-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.summary-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-value.highlight {
  color: var(--accent-gold);
}

.summary-value.cold {
  color: #63b3ed;
}

.summary-value.profit {
  color: var(--success);
}

.summary-trend {
  font-size: 10px;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
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
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--bg-card);
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--accent-gold);
}

.tab-icon {
  font-size: 16px;
}

.tab-name {
  font-weight: 600;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.section-header p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.subsection-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
}

.heat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heat-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.heat-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.heat-rank.top3 {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
}

.heat-info {
  flex: 1;
  min-width: 0;
}

.heat-genre-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.heat-genre {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.heat-level-icon {
  font-size: 12px;
}

.heat-level {
  font-size: 11px;
  font-weight: 600;
}

.heat-trend-icon {
  font-size: 12px;
}

.heat-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.heat-bar-bg {
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.heat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.heat-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 36px;
  text-align: right;
}

.heat-modifiers {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modifier {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.modifier-label {
  color: var(--text-muted);
}

.modifier-value {
  font-weight: 600;
  color: var(--text-secondary);
}

.modifier-value.positive {
  color: var(--success);
}

.modifier-value.negative {
  color: var(--danger);
}

.price-overview {
  margin-bottom: 16px;
}

.price-index-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.p-index-label {
  font-size: 11px;
  color: var(--text-muted);
}

.p-index-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 4px;
}

.p-index-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.p-index-change {
  font-size: 14px;
  font-weight: 600;
}

.p-index-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 8px 0 0 0;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-item {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.price-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.price-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-genre {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.price-sparkline svg {
  display: block;
}

.price-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.price-index-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-index {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.price-change {
  font-size: 11px;
  font-weight: 600;
}

.price-bar-container {
  width: 100px;
}

.price-bar-bg {
  height: 4px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
}

.price-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.price-details {
  display: flex;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.price-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pd-label {
  font-size: 9px;
  color: var(--text-muted);
}

.pd-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.pd-value.profit {
  color: var(--success);
}

.pd-value.warning {
  color: var(--warning);
}

.rare-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rare-item {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.rare-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.rare-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.rare-rarity {
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.rare-info {
  flex: 1;
  min-width: 0;
}

.rare-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rare-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
}

.rare-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.rare-genre {
  padding: 2px 6px;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

.rare-demand {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.rare-price-section {
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.rare-current-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.rcp-label {
  font-size: 11px;
  color: var(--text-muted);
}

.rcp-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-gold);
}

.rcp-change {
  font-size: 11px;
  font-weight: 600;
}

.rare-price-chart {
  margin-bottom: 12px;
}

.rare-price-chart svg {
  width: 100%;
}

.rare-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.rare-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rs-label {
  font-size: 9px;
  color: var(--text-muted);
}

.rs-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.rs-value.warning {
  color: var(--warning);
}

.rs-value.collector {
  color: #f687b3;
}

.insights-section {
  margin-bottom: 24px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.insight-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
  min-width: 0;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.insight-category {
  font-size: 11px;
  font-weight: 600;
}

.insight-priority {
  font-size: 10px;
  font-weight: 600;
}

.insight-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.insight-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
  line-height: 1.5;
}

.insight-impact {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 4px 0;
}

.insight-action {
  font-size: 11px;
  color: var(--accent-gold);
  margin: 0;
  font-weight: 500;
}

.recommendations-section {
  margin-bottom: 24px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid var(--border);
  position: relative;
  overflow: hidden;
}

.recommendation-item.hot {
  border-color: rgba(245, 101, 101, 0.4);
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.08) 0%, var(--bg-secondary) 100%);
}

.recommendation-item.undervalued {
  border-color: rgba(72, 187, 120, 0.4);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, var(--bg-secondary) 100%);
}

.rec-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.rec-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
}

.rec-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.rec-badge.hot {
  background: linear-gradient(135deg, #f56565 0%, #ed8936 100%);
  color: white;
}

.rec-badge.undervalued {
  background: linear-gradient(135deg, #48bb78 0%, #38b2ac 100%);
  color: white;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 2px 0;
}

.rec-supplier {
  font-size: 10px;
  color: var(--accent-gold);
  margin: 0 0 6px 0;
  font-weight: 500;
}

.rec-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.rec-genre,
.rec-rarity,
.rec-risk {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.rec-genre {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.rec-risk {
  font-weight: 600;
}

.rec-reason {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
}

.rec-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 80px;
}

.rec-price-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.rec-cost {
  color: var(--text-secondary);
  font-weight: 500;
}

.rec-arrow {
  color: var(--text-muted);
  font-size: 10px;
}

.rec-market {
  color: var(--accent-orange);
  font-weight: 600;
}

.rec-profit-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rec-profit {
  font-size: 12px;
  font-weight: 700;
}

.rec-profit.positive {
  color: var(--success);
}

.rec-margin {
  font-size: 10px;
  color: var(--text-muted);
}

.rec-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 50px;
}

.rec-score-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rec-score-circle::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.rec-score-circle span {
  position: relative;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.rec-score-label {
  font-size: 9px;
  color: var(--text-muted);
}

.empty-state {
  padding: 32px;
  text-align: center;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
