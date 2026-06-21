<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import { getLevelColor } from '@/data/members'

const gameStore = useGameStore()

const channels = computed(() => gameStore.communityChannels)
const spreadNodes = computed(() => gameStore.communityActiveSpreadNodes)
const totalReach = computed(() => gameStore.communityTotalReach)

const unlockedChannels = computed(() => channels.value.filter(c => c.isUnlocked))
const lockedChannels = computed(() => channels.value.filter(c => !c.isUnlocked))

const topInfluencers = computed(() => {
  return [...spreadNodes.value]
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 5)
})

const formatReach = (value: number): string => {
  if (value >= 10000) return (value / 10000).toFixed(1) + '万'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k'
  return value.toString()
}
</script>

<template>
  <div class="community-spread">
    <div class="spread-header">
      <h3 class="section-title">口碑扩散</h3>
      <span class="spread-subtitle">好的口碑会让更多人知道你的店</span>
    </div>

    <div class="total-reach-card card">
      <div class="reach-header">
        <span class="reach-icon">📣</span>
        <span class="reach-label">总触达人数</span>
      </div>
      <div class="reach-value">{{ formatReach(totalReach) }}</div>
      <div class="reach-growth">
        <span class="growth-icon">📈</span>
        <span class="growth-text">每日自然增长 +{{ channels.reduce((sum, c) => sum + (c.isUnlocked ? c.dailyGrowth : 0), 0) }}</span>
      </div>
    </div>

    <div class="section-sub-header">
      <h4 class="sub-title">传播渠道</h4>
    </div>

    <div class="channels-list">
      <div 
        v-for="channel in unlockedChannels" 
        :key="channel.id"
        class="channel-card card unlocked"
      >
        <div class="channel-icon">
          {{ channel.icon }}
        </div>
        <div class="channel-info">
          <div class="channel-name">{{ channel.name }}</div>
          <div class="channel-desc">{{ channel.description }}</div>
        </div>
        <div class="channel-stats">
          <div class="channel-reach">
            <span class="stat-label">触达</span>
            <span class="stat-value">{{ formatReach(channel.currentReach) }}</span>
          </div>
          <div class="channel-multiplier">
            <span class="stat-label">倍率</span>
            <span class="stat-value highlight">×{{ channel.reachMultiplier.toFixed(1) }}</span>
          </div>
        </div>
        <div class="channel-progress">
          <div class="growth-bar">
            <div 
              class="growth-fill" 
              :style="{ width: Math.min(100, channel.dailyGrowth / 50 * 100) + '%' }"
            ></div>
          </div>
          <span class="growth-text-small">+{{ channel.dailyGrowth }}/天</span>
        </div>
      </div>

      <div 
        v-for="channel in lockedChannels" 
        :key="channel.id"
        class="channel-card card locked"
      >
        <div class="channel-icon locked">
          🔒
        </div>
        <div class="channel-info">
          <div class="channel-name">{{ channel.name }}</div>
          <div class="channel-desc">{{ channel.description }}</div>
        </div>
        <div class="channel-lock-info">
          <span class="lock-req">需要{{ channel.unlockReputation }}声望</span>
          <span class="lock-icon">🔒</span>
        </div>
      </div>
    </div>

    <div class="section-sub-header">
      <h4 class="sub-title">核心传播节点</h4>
      <span class="sub-desc">高影响力乐迷帮你扩散口碑</span>
    </div>

    <div class="influencers-list">
      <div 
        v-for="(node, index) in topInfluencers" 
        :key="node.id"
        class="influencer-card card"
      >
        <div class="influencer-rank">
          <span v-if="index === 0" class="rank-badge gold">🥇</span>
          <span v-else-if="index === 1" class="rank-badge silver">🥈</span>
          <span v-else-if="index === 2" class="rank-badge bronze">🥉</span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>

        <div class="influencer-avatar">
          {{ node.avatar }}
          <div 
            v-if="node.level" 
            class="level-badge"
            :style="{ background: getLevelColor(node.level) }"
          ></div>
        </div>

        <div class="influencer-info">
          <div class="influencer-name">{{ node.name }}</div>
          <div 
            v-if="node.level" 
            class="influencer-level"
            :style="{ color: getLevelColor(node.level) }"
          >
            {{ node.level }}会员
          </div>
        </div>

        <div class="influencer-stats">
          <div class="stat-col">
            <span class="stat-value-lg">{{ node.influence }}</span>
            <span class="stat-label-sm">影响力</span>
          </div>
          <div class="stat-col">
            <span class="stat-value-lg">{{ formatReach(node.reach) }}</span>
            <span class="stat-label-sm">覆盖</span>
          </div>
          <div class="stat-col">
            <span class="stat-value-lg">{{ node.spreadCount }}</span>
            <span class="stat-label-sm">扩散</span>
          </div>
        </div>

        <div class="influencer-status">
          <span 
            class="status-dot" 
            :class="{ active: node.isActive }"
          ></span>
          <span class="status-text">{{ node.isActive ? '活跃' : '休眠' }}</span>
        </div>
      </div>
    </div>

    <div class="spread-tips card">
      <div class="tips-header">
        <span class="tips-icon">💡</span>
        <span class="tips-title">扩散小贴士</span>
      </div>
      <ul class="tips-list">
        <li>提升店铺声望可以解锁更多传播渠道</li>
        <li>活跃的核心会员会帮你自发宣传</li>
        <li>举办社群活动可以快速提升口碑</li>
        <li>高满意度的顾客更愿意推荐给朋友</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.community-spread {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.spread-header {
  margin-bottom: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.spread-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.total-reach-card {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  border: 1px solid rgba(233, 69, 96, 0.4);
  text-align: center;
  padding: 20px 16px;
}

.reach-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.reach-icon {
  font-size: 24px;
}

.reach-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.reach-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.3);
}

.reach-growth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--success);
}

.growth-icon {
  font-size: 14px;
}

.section-sub-header {
  margin-top: 4px;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sub-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: 8px;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-card {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  grid-template-rows: auto auto;
  gap: 8px 12px;
  padding: 12px;
  align-items: center;
}

.channel-card.unlocked {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(56, 178, 172, 0.08) 100%);
  border-color: rgba(72, 187, 120, 0.3);
}

.channel-card.locked {
  opacity: 0.6;
}

.channel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  grid-row: span 2;
}

.channel-icon.locked {
  background: var(--bg-secondary);
  font-size: 18px;
}

.channel-info {
  min-width: 0;
}

.channel-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.channel-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

.channel-stats {
  display: flex;
  gap: 16px;
  grid-column: 3;
  grid-row: 1;
}

.channel-reach,
.channel-multiplier {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.highlight {
  color: var(--success);
}

.channel-progress {
  grid-column: 2 / 4;
  grid-row: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.growth-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.growth-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success) 0%, #38b2ac 100%);
  border-radius: 2px;
}

.growth-text-small {
  font-size: 10px;
  color: var(--success);
  font-weight: 500;
  flex-shrink: 0;
}

.channel-lock-info {
  grid-column: 3;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.lock-req {
  font-size: 11px;
  color: var(--text-muted);
}

.lock-icon {
  font-size: 16px;
}

.influencers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.influencer-card {
  display: grid;
  grid-template-columns: 28px 44px 1fr auto;
  grid-template-rows: auto auto;
  gap: 6px 10px;
  padding: 12px;
  align-items: center;
}

.influencer-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: span 2;
}

.rank-badge {
  font-size: 20px;
}

.rank-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  width: 20px;
  text-align: center;
}

.influencer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
  grid-row: span 2;
}

.level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
}

.influencer-info {
  min-width: 0;
}

.influencer-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.influencer-level {
  font-size: 11px;
  font-weight: 500;
}

.influencer-stats {
  display: flex;
  gap: 16px;
  grid-column: 4;
  grid-row: 1;
}

.stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value-lg {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label-sm {
  font-size: 9px;
  color: var(--text-muted);
}

.influencer-status {
  grid-column: 4;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-dot.active {
  background: var(--success);
  box-shadow: 0 0 6px rgba(72, 187, 120, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.status-text {
  font-size: 10px;
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.spread-tips {
  padding: 14px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(237, 137, 54, 0.1) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.tips-icon {
  font-size: 18px;
}

.tips-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--warning);
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tips-list li {
  font-size: 12px;
  color: var(--text-secondary);
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--warning);
  font-weight: bold;
}
</style>
