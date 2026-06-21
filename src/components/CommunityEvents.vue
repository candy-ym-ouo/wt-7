<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed, ref } from 'vue'
import type { CommunityEvent, CommunityEventStatus } from '@/types'

const gameStore = useGameStore()

const selectedEvent = ref<CommunityEvent | null>(null)
const showDetailModal = ref(false)

const events = computed(() => gameStore.communityEvents)

const upcomingEvents = computed(() => 
  events.value.filter(e => e.status === 'upcoming' || e.status === 'signup')
)

const inProgressEvents = computed(() => 
  events.value.filter(e => e.status === 'in_progress')
)

const endedEvents = computed(() => 
  events.value.filter(e => e.status === 'ended')
)

const getStatusLabel = (status: CommunityEventStatus): string => {
  const labels: Record<CommunityEventStatus, string> = {
    upcoming: '即将开始',
    signup: '报名中',
    in_progress: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return labels[status]
}

const getStatusClass = (status: CommunityEventStatus): string => {
  return status
}

const formatDaysUntil = (day: number): string => {
  const currentDay = gameStore.currentDay
  const diff = day - currentDay
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff > 0) return `${diff}天后`
  return `${Math.abs(diff)}天前`
}

const handleSignup = (eventId: string) => {
  gameStore.signupCommunityEvent(eventId)
}

const openEventDetail = (event: CommunityEvent) => {
  selectedEvent.value = event
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedEvent.value = null
}
</script>

<template>
  <div class="community-events">
    <div class="events-header">
      <h3 class="section-title">社群活动</h3>
      <span class="events-subtitle">参与活动获得丰厚奖励</span>
    </div>

    <div v-if="inProgressEvents.length > 0" class="event-section">
      <h4 class="section-subtitle">
        <span class="live-dot"></span>
        进行中
      </h4>
      <div class="event-list">
        <div 
          v-for="event in inProgressEvents" 
          :key="event.id"
          class="event-card card live"
          @click="openEventDetail(event)"
        >
          <div class="event-banner live-banner">
            <span class="banner-icon">{{ event.bannerIcon }}</span>
            <span class="live-badge">LIVE</span>
          </div>
          
          <div class="event-body">
            <div class="event-type-badge">
              {{ event.typeIcon }} {{ event.typeName }}
            </div>
            
            <h4 class="event-title">{{ event.title }}</h4>
            <p class="event-desc">{{ event.description }}</p>
            
            <div class="event-info-row">
              <span class="info-item">
                📅 {{ formatDaysUntil(event.eventDay) }}
              </span>
              <span class="info-item">
                👥 {{ event.currentParticipants }}/{{ event.maxParticipants }}人
              </span>
            </div>
            
            <div class="participants-preview">
              <div class="avatar-stack">
                <span 
                  v-for="(avatar, index) in event.participantAvatars.slice(0, 5)" 
                  :key="index"
                  class="mini-avatar"
                  :style="{ marginLeft: index > 0 ? '-8px' : '0' }"
                >
                  {{ avatar }}
                </span>
              </div>
              <span class="participate-status" v-if="event.isParticipating">
                ✓ 已报名
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="event-section">
      <h4 class="section-subtitle">
        📋 即将开始
        <span class="section-count">{{ upcomingEvents.length }}</span>
      </h4>
      <div class="event-list">
        <div 
          v-for="event in upcomingEvents" 
          :key="event.id"
          class="event-card card"
          @click="openEventDetail(event)"
        >
          <div class="event-banner">
            <span class="banner-icon">{{ event.bannerIcon }}</span>
            <span class="status-badge" :class="getStatusClass(event.status)">
              {{ getStatusLabel(event.status) }}
            </span>
          </div>
          
          <div class="event-body">
            <div class="event-type-badge">
              {{ event.typeIcon }} {{ event.typeName }}
            </div>
            
            <h4 class="event-title">{{ event.title }}</h4>
            <p class="event-desc">{{ event.description }}</p>
            
            <div v-if="event.genreFocus && event.genreFocus.length > 0" class="genre-tags">
              <span 
                v-for="genre in event.genreFocus.slice(0, 2)" 
                :key="genre"
                class="genre-tag"
              >
                {{ gameStore.getCommunityGenreIcon(genre) }} {{ genre }}
              </span>
            </div>
            
            <div class="event-info-row">
              <span class="info-item">
                📅 第{{ event.eventDay }}天
              </span>
              <span class="info-item">
                👥 {{ event.currentParticipants }}人
              </span>
            </div>
            
            <div class="event-footer">
              <div class="rewards-preview">
                <span class="reward-item" v-if="event.rewards.reputation > 0">
                  🌟 +{{ event.rewards.reputation }}
                </span>
                <span class="reward-item" v-if="event.rewards.budget > 0">
                  💰 +{{ event.rewards.budget }}
                </span>
              </div>
              
              <button 
                class="signup-btn"
                :class="{ joined: event.isParticipating }"
                :disabled="event.status !== 'signup' || event.currentParticipants >= event.maxParticipants"
                @click.stop="handleSignup(event.id)"
              >
                {{ event.isParticipating ? '已报名' : (event.status === 'signup' ? '立即报名' : '即将开放') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="endedEvents.length > 0" class="event-section">
      <h4 class="section-subtitle">
        📜 历史活动
        <span class="section-count">{{ endedEvents.length }}</span>
      </h4>
      <div class="event-list">
        <div 
          v-for="event in endedEvents" 
          :key="event.id"
          class="event-card card ended"
          @click="openEventDetail(event)"
        >
          <div class="event-banner ended-banner">
            <span class="banner-icon" style="opacity: 0.6;">{{ event.bannerIcon }}</span>
            <span class="status-badge ended">已结束</span>
          </div>
          
          <div class="event-body">
            <div class="event-type-badge faded">
              {{ event.typeIcon }} {{ event.typeName }}
            </div>
            
            <h4 class="event-title faded">{{ event.title }}</h4>
            
            <div class="event-info-row">
              <span class="info-item">
                👥 {{ event.currentParticipants }}人参与
              </span>
              <span class="info-item" v-if="event.satisfaction">
                ⭐ {{ event.satisfaction }}分
              </span>
            </div>
            
            <div class="participation-status">
              <span v-if="event.isParticipating" class="joined-tag">
                ✓ 已参与
              </span>
              <span v-else class="missed-tag">
                未参与
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showDetailModal && selectedEvent" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-banner" :class="getStatusClass(selectedEvent.status)">
            <button class="back-btn" @click="closeDetailModal">← 返回</button>
            <span class="banner-icon-large">{{ selectedEvent.bannerIcon }}</span>
            <span class="banner-status">{{ getStatusLabel(selectedEvent.status) }}</span>
          </div>
          
          <div class="modal-body">
            <div class="detail-header">
              <span class="event-type-tag">
                {{ selectedEvent.typeIcon }} {{ selectedEvent.typeName }}
              </span>
              <h2 class="event-title-lg">{{ selectedEvent.title }}</h2>
            </div>
            
            <p class="event-desc-lg">{{ selectedEvent.description }}</p>
            
            <div class="detail-section">
              <h5 class="detail-label">活动信息</h5>
              <div class="info-grid">
                <div class="info-card">
                  <span class="info-icon">📅</span>
                  <span class="info-text">第{{ selectedEvent.eventDay }}天</span>
                </div>
                <div class="info-card">
                  <span class="info-icon">👥</span>
                  <span class="info-text">{{ selectedEvent.currentParticipants }}/{{ selectedEvent.maxParticipants }}人</span>
                </div>
                <div class="info-card" v-if="selectedEvent.minReputation > 0">
                  <span class="info-icon">⭐</span>
                  <span class="info-text">{{ selectedEvent.minReputation }}声望以上</span>
                </div>
                <div class="info-card" v-if="selectedEvent.entryFee > 0">
                  <span class="info-icon">💰</span>
                  <span class="info-text">报名费 ¥{{ selectedEvent.entryFee }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedEvent.genreFocus && selectedEvent.genreFocus.length > 0" class="detail-section">
              <h5 class="detail-label">主题风格</h5>
              <div class="genre-list">
                <span 
                  v-for="genre in selectedEvent.genreFocus" 
                  :key="genre"
                  class="genre-tag-lg"
                >
                  {{ gameStore.getCommunityGenreIcon(genre) }} {{ genre }}
                </span>
              </div>
            </div>
            
            <div class="detail-section">
              <h5 class="detail-label">活动奖励</h5>
              <div class="rewards-list">
                <div class="reward-card" v-if="selectedEvent.rewards.reputation > 0">
                  <span class="reward-icon">🌟</span>
                  <div class="reward-info">
                    <span class="reward-name">声望</span>
                    <span class="reward-value">+{{ selectedEvent.rewards.reputation }}</span>
                  </div>
                </div>
                <div class="reward-card" v-if="selectedEvent.rewards.budget > 0">
                  <span class="reward-icon">💰</span>
                  <div class="reward-info">
                    <span class="reward-name">金币</span>
                    <span class="reward-value">+{{ selectedEvent.rewards.budget }}</span>
                  </div>
                </div>
                <div class="reward-card" v-if="selectedEvent.rewards.growthPoints > 0">
                  <span class="reward-icon">📈</span>
                  <div class="reward-info">
                    <span class="reward-name">成长点</span>
                    <span class="reward-value">+{{ selectedEvent.rewards.growthPoints }}</span>
                  </div>
                </div>
                <div class="reward-card bonus" v-if="selectedEvent.rewards.bonusRecordId">
                  <span class="reward-icon">🎁</span>
                  <div class="reward-info">
                    <span class="reward-name">神秘唱片</span>
                    <span class="reward-value">限定奖励</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h5 class="detail-label">参与乐迷 ({{ selectedEvent.currentParticipants }})</h5>
              <div class="participants-grid">
                <div 
                  v-for="(avatar, index) in selectedEvent.participantAvatars" 
                  :key="index"
                  class="participant-avatar"
                >
                  {{ avatar }}
                </div>
                <div 
                  v-if="selectedEvent.currentParticipants > selectedEvent.participantAvatars.length"
                  class="more-participants"
                >
                  +{{ selectedEvent.currentParticipants - selectedEvent.participantAvatars.length }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              class="btn-primary full-width"
              :class="{ joined: selectedEvent.isParticipating }"
              :disabled="selectedEvent.status !== 'signup' || selectedEvent.currentParticipants >= selectedEvent.maxParticipants"
              @click="handleSignup(selectedEvent.id)"
            >
              {{ selectedEvent.isParticipating 
                ? '✓ 已报名参加' 
                : (selectedEvent.status === 'signup' 
                  ? '立即报名参加' 
                  : (selectedEvent.status === 'upcoming' ? '报名即将开放' : '活动已结束')) }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.community-events {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.events-header {
  margin-bottom: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.events-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.event-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  animation: livePulse 1.5s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(229, 62, 62, 0); }
}

.section-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-card {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:active {
  transform: scale(0.98);
}

.event-card.live {
  border-color: var(--danger);
  background: linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, transparent 50%);
}

.event-banner {
  height: 60px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.live-banner {
  background: linear-gradient(135deg, #e53e3e 0%, #dd6b20 100%);
}

.ended-banner {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.banner-icon {
  font-size: 32px;
}

.live-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: #e53e3e;
  padding: 2px 8px;
  border-radius: 10px;
  animation: livePulse 1.5s ease-in-out infinite;
}

.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.status-badge.signup {
  background: var(--success);
  color: white;
}

.status-badge.in_progress {
  background: var(--danger);
  color: white;
}

.status-badge.ended {
  background: var(--text-muted);
  color: white;
}

.event-body {
  padding: 12px;
}

.event-type-badge {
  display: inline-block;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.event-type-badge.faded {
  opacity: 0.6;
}

.event-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.event-title.faded {
  opacity: 0.6;
}

.event-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.genre-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.genre-tag {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.event-info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.info-item {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.rewards-preview {
  display: flex;
  gap: 8px;
}

.reward-item {
  font-size: 11px;
  color: var(--warning);
  font-weight: 600;
}

.signup-btn {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
}

.signup-btn:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.signup-btn.joined {
  background: var(--success);
}

.participants-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid var(--bg-card);
}

.participate-status {
  font-size: 10px;
  color: var(--success);
  font-weight: 600;
}

.participation-status {
  padding-top: 8px;
}

.joined-tag {
  font-size: 11px;
  color: var(--success);
  font-weight: 600;
}

.missed-tag {
  font-size: 11px;
  color: var(--text-muted);
}

.event-card.ended {
  opacity: 0.75;
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
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-banner {
  height: 120px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-banner.signup {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.modal-banner.in_progress {
  background: linear-gradient(135deg, #e53e3e 0%, #dd6b20 100%);
}

.modal-banner.ended {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.back-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
}

.banner-icon-large {
  font-size: 48px;
  margin-bottom: 6px;
}

.banner-status {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-header {
  margin-bottom: 4px;
}

.event-type-tag {
  display: inline-block;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-gold);
  margin-bottom: 10px;
}

.event-title-lg {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.event-desc-lg {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.info-icon {
  font-size: 18px;
}

.info-text {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-tag-lg {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-gold);
  font-weight: 500;
}

.rewards-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.reward-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(237, 137, 54, 0.1) 100%);
  border-radius: 10px;
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.reward-card.bonus {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(159, 122, 234, 0.15) 0%, rgba(237, 137, 54, 0.1) 100%);
  border-color: rgba(159, 122, 234, 0.3);
}

.reward-icon {
  font-size: 24px;
}

.reward-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reward-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.reward-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.participants-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.more-participants {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-muted);
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
  background: var(--bg-card);
}

.btn-primary.full-width {
  width: 100%;
}

.btn-primary.joined {
  background: var(--success);
}

.btn-primary:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}
</style>
