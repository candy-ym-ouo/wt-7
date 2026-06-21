<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'

const gameStore = useGameStore()

const trends = computed(() => gameStore.communityTrends)

const topTrends = computed(() => trends.value.slice(0, 5))
const otherTrends = computed(() => trends.value.slice(5))

const getRankChange = (trend: { rank: number; previousRank: number }) => {
  return trend.previousRank - trend.rank
}
</script>

<template>
  <div class="community-trends">
    <div class="trends-header">
      <h3 class="section-title">热门风格趋势</h3>
      <span class="trends-subtitle">基于社群讨论和销售数据</span>
    </div>

    <div class="top-trends">
      <div 
        v-for="(trend, index) in topTrends" 
        :key="trend.genre"
        class="trend-card top-card"
        :class="`rank-${index + 1}`"
      >
        <div class="trend-rank">
          <span class="rank-number">{{ index + 1 }}</span>
          <span 
            class="rank-change" 
            :class="{ up: getRankChange(trend) > 0, down: getRankChange(trend) < 0 }"
          >
            {{ gameStore.getCommunityTrendIcon(trend.trend) }}
            <span v-if="getRankChange(trend) !== 0">
              {{ Math.abs(getRankChange(trend)) }}
            </span>
          </span>
        </div>

        <div class="trend-icon-large">
          {{ gameStore.getCommunityGenreIcon(trend.genre) }}
        </div>

        <div class="trend-info">
          <h4 class="trend-name">{{ trend.genre }}</h4>
          <p class="trend-desc">{{ trend.description }}</p>
        </div>

        <div class="trend-stats">
          <div class="heat-bar">
            <div 
              class="heat-fill"
              :style="{ 
                width: trend.heatValue + '%',
                background: `linear-gradient(90deg, ${gameStore.getCommunityTrendColor(trend.heatLevel)}88 0%, ${gameStore.getCommunityTrendColor(trend.heatLevel)} 100%)`
              }"
            ></div>
          </div>
          <div class="heat-meta">
            <span 
              class="heat-level" 
              :style="{ color: gameStore.getCommunityTrendColor(trend.heatLevel) }"
            >
              {{ gameStore.getCommunityHeatLevelLabel(trend.heatLevel) }}
            </span>
            <span class="heat-value">{{ trend.heatValue }}°</span>
          </div>
        </div>

        <div class="trend-details">
          <div class="detail-item">
            <span class="detail-icon">📝</span>
            <span class="detail-value">{{ trend.postCount }}</span>
            <span class="detail-label">帖子</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💬</span>
            <span class="detail-value">{{ trend.discussionCount }}</span>
            <span class="detail-label">讨论</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">📈</span>
            <span class="detail-value" :class="{ positive: trend.salesGrowth > 0, negative: trend.salesGrowth < 0 }">
              {{ trend.salesGrowth > 0 ? '+' : '' }}{{ trend.salesGrowth }}%
            </span>
            <span class="detail-label">销量</span>
          </div>
        </div>
      </div>
    </div>

    <div class="other-trends card">
      <h4 class="other-title">更多风格</h4>
      <div class="trend-list">
        <div 
          v-for="trend in otherTrends" 
          :key="trend.genre"
          class="trend-item"
        >
          <span class="trend-rank-small">{{ trend.rank }}</span>
          <span class="trend-icon-small">{{ gameStore.getCommunityGenreIcon(trend.genre) }}</span>
          <span class="trend-name-small">{{ trend.genre }}</span>
          
          <div class="trend-heat-mini">
            <div class="mini-heat-bar">
              <div 
                class="mini-heat-fill"
                :style="{ 
                  width: trend.heatValue + '%',
                  background: gameStore.getCommunityTrendColor(trend.heatLevel)
                }"
              ></div>
            </div>
          </div>

          <span class="trend-change-small" :class="{ up: trend.trend === 'rising', down: trend.trend === 'falling' }">
            {{ gameStore.getCommunityTrendIcon(trend.trend) }}
          </span>
        </div>
      </div>
    </div>

    <div class="trend-insight card">
      <div class="insight-header">
        <span class="insight-icon">💡</span>
        <span class="insight-title">趋势洞察</span>
      </div>
      <p class="insight-content">
        本周
        <strong :style="{ color: gameStore.getCommunityTrendColor(topTrends[0]?.heatLevel || 'cool') }">
          {{ topTrends[0]?.genre || '爵士' }}
        </strong>
        热度持续攀升，建议多关注相关唱片的进货和陈列。复古风潮带动
        <strong>迪斯科</strong>和
        <strong>灵魂乐</strong>
        的关注度上升，可以考虑举办主题活动。
      </p>
    </div>
  </div>
</template>

<style scoped>
.community-trends {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trends-header {
  margin-bottom: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.trends-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.top-trends {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trend-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.trend-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-gold);
}

.trend-card.rank-1::before { background: linear-gradient(180deg, #ffd700 0%, #ffaa00 100%); }
.trend-card.rank-2::before { background: linear-gradient(180deg, #c0c0c0 0%, #a0a0a0 100%); }
.trend-card.rank-3::before { background: linear-gradient(180deg, #cd7f32 0%, #8b4513 100%); }
.trend-card.rank-4::before { background: linear-gradient(180deg, #4299e1 0%, #3182ce 100%); }
.trend-card.rank-5::before { background: linear-gradient(180deg, #9f7aea 0%, #805ad5 100%); }

.trend-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rank-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  width: 24px;
}

.rank-change {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--text-muted);
}

.rank-change.up {
  color: var(--success);
}

.rank-change.down {
  color: var(--danger);
}

.trend-icon-large {
  position: absolute;
  right: 14px;
  top: 14px;
  font-size: 28px;
  opacity: 0.3;
}

.trend-info {
  margin-bottom: 10px;
}

.trend-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.trend-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.trend-stats {
  margin-bottom: 12px;
}

.heat-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.heat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.heat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.heat-level {
  font-size: 11px;
  font-weight: 600;
}

.heat-value {
  font-size: 11px;
  color: var(--text-muted);
}

.trend-details {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.detail-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.detail-icon {
  font-size: 14px;
}

.detail-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-value.positive {
  color: var(--success);
}

.detail-value.negative {
  color: var(--danger);
}

.detail-label {
  font-size: 10px;
  color: var(--text-muted);
}

.other-trends {
  padding: 12px;
}

.other-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.trend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--bg-secondary);
}

.trend-rank-small {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  width: 18px;
  text-align: center;
}

.trend-icon-small {
  font-size: 16px;
}

.trend-name-small {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.trend-heat-mini {
  width: 60px;
}

.mini-heat-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.mini-heat-fill {
  height: 100%;
  border-radius: 2px;
}

.trend-change-small {
  font-size: 12px;
  width: 20px;
  text-align: center;
}

.trend-change-small.up {
  color: var(--success);
}

.trend-change-small.down {
  color: var(--danger);
}

.trend-insight {
  padding: 14px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.insight-icon {
  font-size: 18px;
}

.insight-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
}

.insight-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.insight-content strong {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
