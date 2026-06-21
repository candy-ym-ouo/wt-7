<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed, ref } from 'vue'
import type { CommunityReward } from '@/types'

const gameStore = useGameStore()

const showRewardDetail = ref<CommunityReward | null>(null)

const rewards = computed(() => gameStore.communityRewards)
const checkinStatus = computed(() => gameStore.communityCheckinStatus)

const claimableRewards = computed(() => 
  rewards.value.filter(r => r.isClaimable && !r.isClaimed)
)

const claimedRewards = computed(() => 
  rewards.value.filter(r => r.isClaimed)
)

const lockedRewards = computed(() => 
  rewards.value.filter(r => !r.isClaimable && !r.isClaimed)
)

const getRewardTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    daily_checkin: '📅',
    post_reward: '📝',
    spread_reward: '📣',
    event_reward: '🎉',
    milestone_reward: '🏆',
    referral_bonus: '👥'
  }
  return icons[type] || '🎁'
}

const getRewardTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    daily_checkin: '签到奖励',
    post_reward: '发帖奖励',
    spread_reward: '扩散奖励',
    event_reward: '活动奖励',
    milestone_reward: '里程碑',
    referral_bonus: '邀请奖励'
  }
  return labels[type] || '奖励'
}

const handleClaimReward = (rewardId: string) => {
  gameStore.claimCommunityReward(rewardId)
}

const handleCheckIn = () => {
  gameStore.communityCheckin()
}

const openRewardDetail = (reward: CommunityReward) => {
  showRewardDetail.value = reward
}

const closeDetail = () => {
  showRewardDetail.value = null
}
</script>

<template>
  <div class="community-rewards">
    <div class="rewards-header">
      <h3 class="section-title">奖励中心</h3>
      <span class="rewards-subtitle">参与社群活动，领取丰厚奖励</span>
    </div>

    <div class="checkin-card card">
      <div class="checkin-header">
        <div class="checkin-icon">📅</div>
        <div class="checkin-info">
          <h4 class="checkin-title">每日签到</h4>
          <p class="checkin-streak">
            已连续签到 <span class="streak-num">{{ checkinStatus.streakDays }}</span> 天
          </p>
        </div>
      </div>

      <div class="checkin-week">
        <div 
          v-for="(day, index) in checkinStatus.weeklyCheckin" 
          :key="index"
          class="day-item"
          :class="{ checked: day.checked, today: day.isToday, reward: day.isRewardDay }"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-reward">
            <span v-if="day.rewardType === 'coins'">💰</span>
            <span v-else-if="day.rewardType === 'reputation'">🌟</span>
            <span v-else>🎁</span>
          </span>
          <span class="day-value" v-if="day.checked">✓</span>
          <span class="day-value" v-else-if="day.isToday && checkinStatus.todayCheckedIn">✓</span>
          <span class="day-number" v-else>{{ day.dayNum }}</span>
        </div>
      </div>

      <button 
        class="checkin-btn"
        :class="{ done: checkinStatus.todayCheckedIn }"
        :disabled="checkinStatus.todayCheckedIn"
        @click="handleCheckIn"
      >
        {{ checkinStatus.todayCheckedIn ? '✓ 今日已签到' : '立即签到' }}
      </button>
    </div>

    <div v-if="claimableRewards.length > 0" class="rewards-section">
      <div class="section-header">
        <h4 class="section-subtitle">
          🎁 可领取
          <span class="section-badge">{{ claimableRewards.length }}</span>
        </h4>
      </div>
      
      <div class="reward-list">
        <div 
          v-for="reward in claimableRewards" 
          :key="reward.id"
          class="reward-card card claimable"
        >
          <div class="reward-icon-wrapper">
            <span class="reward-icon">{{ getRewardTypeIcon(reward.type) }}</span>
            <span class="reward-type-tag">{{ getRewardTypeLabel(reward.type) }}</span>
          </div>
          
          <div class="reward-content">
            <h5 class="reward-title">{{ reward.title }}</h5>
            <p class="reward-desc">{{ reward.description }}</p>
            
            <div class="reward-items">
              <span v-if="reward.reputationReward > 0" class="reward-item">
                🌟 +{{ reward.reputationReward }}
              </span>
              <span v-if="reward.budgetReward > 0" class="reward-item">
                💰 +{{ reward.budgetReward }}
              </span>
              <span v-if="reward.growthPointsReward > 0" class="reward-item">
                📈 +{{ reward.growthPointsReward }}
              </span>
            </div>
          </div>
          
          <button 
            class="claim-btn"
            @click="handleClaimReward(reward.id)"
          >
            领取
          </button>
        </div>
      </div>
    </div>

    <div class="rewards-section">
      <div class="section-header">
        <h4 class="section-subtitle">
          🎯 进行中
        </h4>
        <span class="section-hint">完成任务解锁奖励</span>
      </div>
      
      <div class="reward-list">
        <div 
          v-for="reward in lockedRewards" 
          :key="reward.id"
          class="reward-card card locked"
          @click="openRewardDetail(reward)"
        >
          <div class="reward-icon-wrapper locked">
            <span class="reward-icon">{{ getRewardTypeIcon(reward.type) }}</span>
            <span class="lock-icon">🔒</span>
          </div>
          
          <div class="reward-content">
            <h5 class="reward-title">{{ reward.title }}</h5>
            <p class="reward-desc">{{ reward.description }}</p>
            
            <div class="progress-section">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: (reward.requirement.current / reward.requirement.target) * 100 + '%' }"
                ></div>
              </div>
              <span class="progress-text">
                {{ reward.requirement.current }} / {{ reward.requirement.target }}
              </span>
            </div>
            
            <div class="reward-items faded">
              <span v-if="reward.reputationReward > 0" class="reward-item">
                🌟 +{{ reward.reputationReward }}
              </span>
              <span v-if="reward.budgetReward > 0" class="reward-item">
                💰 +{{ reward.budgetReward }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="claimedRewards.length > 0" class="rewards-section">
      <div class="section-header">
        <h4 class="section-subtitle">
          ✅ 已领取
          <span class="section-count">{{ claimedRewards.length }}</span>
        </h4>
      </div>
      
      <div class="claimed-list">
        <div 
          v-for="reward in claimedRewards" 
          :key="reward.id"
          class="claimed-item"
        >
          <span class="claimed-icon">{{ getRewardTypeIcon(reward.type) }}</span>
          <span class="claimed-title">{{ reward.title }}</span>
          <span class="claimed-badge">已领取</span>
        </div>
      </div>
    </div>

    <div class="reward-tips card">
      <div class="tips-header">
        <span class="tips-icon">💡</span>
        <span class="tips-title">奖励攻略</span>
      </div>
      <ul class="tips-list">
        <li>每日签到可获得连续签到奖励</li>
        <li>发表优质帖子和评论获取声望</li>
        <li>参与社群活动获得丰厚奖励</li>
        <li>邀请好友加入可获得邀请奖励</li>
        <li>累计里程碑解锁特殊成就</li>
      </ul>
    </div>

    <Teleport to="body">
      <div v-if="showRewardDetail" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>奖励详情</h3>
            <button class="close-btn" @click="closeDetail">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-icon-box">
              <span class="detail-icon">{{ getRewardTypeIcon(showRewardDetail.type) }}</span>
            </div>
            
            <h4 class="detail-title">{{ showRewardDetail.title }}</h4>
            <p class="detail-desc">{{ showRewardDetail.description }}</p>
            
            <div class="detail-section">
              <span class="detail-label">任务进度</span>
              <div class="progress-bar-large">
                <div 
                  class="progress-fill"
                  :style="{ width: (showRewardDetail.requirement.current / showRewardDetail.requirement.target) * 100 + '%' }"
                ></div>
              </div>
              <span class="progress-text-lg">
                {{ showRewardDetail.requirement.current }} / {{ showRewardDetail.requirement.target }}
              </span>
            </div>
            
            <div class="detail-section">
              <span class="detail-label">奖励内容</span>
              <div class="reward-items-grid">
                <div v-if="showRewardDetail.reputationReward > 0" class="reward-detail-item">
                  <span class="reward-detail-icon">🌟</span>
                  <span class="reward-detail-name">声望</span>
                  <span class="reward-detail-value">+{{ showRewardDetail.reputationReward }}</span>
                </div>
                <div v-if="showRewardDetail.budgetReward > 0" class="reward-detail-item">
                  <span class="reward-detail-icon">💰</span>
                  <span class="reward-detail-name">金币</span>
                  <span class="reward-detail-value">+{{ showRewardDetail.budgetReward }}</span>
                </div>
                <div v-if="showRewardDetail.growthPointsReward > 0" class="reward-detail-item">
                  <span class="reward-detail-icon">📈</span>
                  <span class="reward-detail-name">成长点</span>
                  <span class="reward-detail-value">+{{ showRewardDetail.growthPointsReward }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-primary full-width" @click="closeDetail">
              知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.community-rewards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rewards-header {
  margin-bottom: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rewards-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.checkin-card {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.15) 0%, rgba(237, 137, 54, 0.15) 100%);
  border: 1px solid rgba(246, 224, 94, 0.4);
  padding: 16px;
}

.checkin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.checkin-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.checkin-info {
  flex: 1;
}

.checkin-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.checkin-streak {
  font-size: 12px;
  color: var(--text-secondary);
}

.streak-num {
  color: var(--accent-gold);
  font-weight: 700;
  font-size: 14px;
}

.checkin-week {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 14px;
}

.day-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.day-item.checked {
  background: var(--success);
}

.day-item.today {
  background: rgba(233, 69, 96, 0.3);
  border: 2px solid var(--accent-gold);
}

.day-item.reward {
  background: rgba(159, 122, 234, 0.3);
}

.day-item.reward.checked {
  background: var(--success);
}

.day-name {
  font-size: 10px;
  color: var(--text-secondary);
}

.day-item.checked .day-name,
.day-item.today .day-name {
  color: white;
}

.day-reward {
  font-size: 16px;
}

.day-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.day-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-muted);
}

.checkin-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
}

.checkin-btn.done {
  background: var(--success);
}

.checkin-btn:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-badge {
  background: var(--danger);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.section-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.section-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.reward-card.claimable {
  border-color: var(--success);
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
}

.reward-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reward-icon-wrapper.locked {
  background: var(--bg-secondary);
  opacity: 0.6;
}

.reward-icon {
  font-size: 24px;
}

.reward-type-tag {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  padding: 2px 6px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border-radius: 8px;
  white-space: nowrap;
}

.lock-icon {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 14px;
}

.reward-content {
  flex: 1;
  min-width: 0;
}

.reward-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.reward-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  line-height: 1.4;
}

.progress-section {
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: var(--text-muted);
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reward-items.faded {
  opacity: 0.6;
}

.reward-item {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(246, 224, 94, 0.2);
  color: var(--warning);
  font-weight: 600;
}

.reward-item.bonus {
  background: rgba(159, 122, 234, 0.2);
  color: #9f7aea;
}

.claim-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--success);
  color: white;
  flex-shrink: 0;
}

.claimed-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.claimed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.claimed-icon {
  font-size: 18px;
  opacity: 0.6;
}

.claimed-title {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
}

.claimed-badge {
  font-size: 10px;
  color: var(--text-muted);
}

.reward-tips {
  padding: 14px;
  background: linear-gradient(135deg, rgba(159, 122, 234, 0.1) 0%, rgba(237, 137, 54, 0.1) 100%);
  border: 1px solid rgba(159, 122, 234, 0.3);
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
  color: #9f7aea;
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
  color: #9f7aea;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.detail-icon-box {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-icon {
  font-size: 42px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

.detail-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted);
}

.progress-bar-large {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-text-lg {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
}

.reward-items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.reward-detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.reward-detail-item.bonus {
  background: linear-gradient(135deg, rgba(159, 122, 234, 0.2) 0%, rgba(237, 137, 54, 0.2) 100%);
  grid-column: span 2;
}

.reward-detail-icon {
  font-size: 24px;
}

.reward-detail-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.reward-detail-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.btn-primary.full-width {
  width: 100%;
}
</style>
