<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { Record, MemberLevel } from '@/types'
import { calculateMatchScore } from '@/data/customers'
import { getLevelIcon, getLevelColor, getMemberBenefit, getNextLevelInfo } from '@/data/members'

const gameStore = useGameStore()
const selectedRecord = ref<Record | null>(null)
const customPrice = ref<number>(0)
const showSellModal = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const recommendations = computed(() => {
  if (!gameStore.currentCustomer) return []
  return gameStore.getCustomerRecommendations(gameStore.currentCustomer)
})

const customerPreferGenresText = computed(() => {
  if (!gameStore.currentCustomer) return ''
  return gameStore.currentCustomer.preference.favoriteGenres.join('、')
})

const customerPriceRangeText = computed(() => {
  if (!gameStore.currentCustomer) return ''
  const [min, max] = gameStore.currentCustomer.preference.priceRange
  return `¥${min} - ¥${max}`
})

const customerMemberInfo = computed(() => {
  const customer = gameStore.currentCustomer
  if (!customer || !customer.memberProfile) return null

  const member = customer.memberProfile
  const benefit = getMemberBenefit(member.level)
  const nextLevel = getNextLevelInfo(member.level)
  const progressToNext = nextLevel
    ? Math.min(100, ((member.growthPoints - getMemberBenefit(member.level).minGrowthPoints) / (nextLevel.minGrowthPoints - getMemberBenefit(member.level).minGrowthPoints)) * 100)
    : 100

  return {
    level: member.level as MemberLevel,
    levelName: benefit.levelName,
    icon: getLevelIcon(member.level),
    color: getLevelColor(member.level),
    growthPoints: member.growthPoints,
    visitCount: member.visitCount,
    purchaseCount: member.purchaseCount,
    discount: benefit.discountRate,
    totalSpent: member.totalSpent,
    nextLevelName: nextLevel?.levelName,
    progressToNext,
    notes: member.notes
  }
})

const isReturningBadge = computed(() => {
  const customer = gameStore.currentCustomer
  if (!customer) return null
  if (customer.isReturningCustomer) {
    return customer.memberProfile ? '会员回访' : '回头客'
  }
  return null
})

const openSellModal = (record: Record) => {
  selectedRecord.value = record
  customPrice.value = record.marketPrice
  message.value = ''
  showSellModal.value = true
}

const closeSellModal = () => {
  showSellModal.value = false
  selectedRecord.value = null
  message.value = ''
}

const handleSell = () => {
  if (!selectedRecord.value) return

  const result = gameStore.trySellToCustomer(selectedRecord.value.id, customPrice.value)
  message.value = result.message
  messageType.value = result.success ? 'success' : 'error'

  if (result.success) {
    setTimeout(() => {
      closeSellModal()
      gameStore.nextCustomer()
    }, 2000)
  }
}

const handleSkip = () => {
  gameStore.skipCustomer()
}

const handlePlayRecord = (record: Record) => {
  if (gameStore.currentPlayingRecord?.id === record.id) {
    gameStore.stopPlaying()
  } else {
    gameStore.playRecord(record)
  }
}

const endDay = () => {
  gameStore.advancePhase()
}

let autoPlayTimer: number | null = null

onMounted(() => {
  if (gameStore.displayedRecords.length > 0 && !gameStore.isPlaying) {
    const randomRecord = gameStore.displayedRecords[Math.floor(Math.random() * gameStore.displayedRecords.length)]
    if (randomRecord) {
      gameStore.playRecord(randomRecord.item.record)
    }
  }
})

onUnmounted(() => {
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
  }
})
</script>

<template>
  <div class="business-view">
    <div v-if="gameStore.currentPlayingRecord" class="now-playing card">
      <div class="np-header">
        <span class="np-icon">🎵</span>
        <span class="np-title">正在播放</span>
        <button class="stop-btn" @click="gameStore.stopPlaying()">
          ⏹
        </button>
      </div>
      <div class="np-content">
        <VinylRecord 
          :record="gameStore.currentPlayingRecord" 
          size="small" 
          :spinning="true" 
        />
        <div class="np-info">
          <h4 class="np-record-title">{{ gameStore.currentPlayingRecord.title }}</h4>
          <p class="np-record-artist">{{ gameStore.currentPlayingRecord.artist }}</p>
          <span class="np-genre">{{ gameStore.currentPlayingRecord.genre }}</span>
        </div>
      </div>
      <p class="np-hint">播放中的唱片会提高顾客的购买意愿！</p>
    </div>

    <template v-if="gameStore.currentCustomer">
      <div class="customer-card card">
        <div class="customer-header">
          <div class="customer-avatar">
            {{ gameStore.currentCustomer.avatar }}
            <span v-if="customerMemberInfo" class="avatar-badge" :style="{ background: customerMemberInfo.color }">
              {{ customerMemberInfo.icon }}
            </span>
          </div>
          <div class="customer-info">
            <div class="customer-name-row">
              <h3 class="customer-name">{{ gameStore.currentCustomer.name }}</h3>
              <span v-if="isReturningBadge" class="returning-badge">
                {{ isReturningBadge }}
              </span>
            </div>
            <p class="customer-budget">预算: ¥{{ gameStore.currentCustomer.budget }}</p>
            <p v-if="customerMemberInfo" class="customer-member" :style="{ color: customerMemberInfo.color }">
              {{ customerMemberInfo.icon }} {{ customerMemberInfo.levelName }} · 来店{{ customerMemberInfo.visitCount }}次
            </p>
          </div>
          <div class="customer-index">
            {{ gameStore.currentCustomerIndex + 1 }}/{{ gameStore.customers.length }}
          </div>
        </div>

        <div v-if="customerMemberInfo" class="member-progress card">
          <div class="mp-header">
            <span class="mp-level" :style="{ color: customerMemberInfo.color }">
              {{ customerMemberInfo.icon }} {{ customerMemberInfo.levelName }}
            </span>
            <span class="mp-points">{{ customerMemberInfo.growthPoints }} 成长值</span>
          </div>
          <div class="mp-bar">
            <div 
              class="mp-fill" 
              :style="{ 
                width: customerMemberInfo.progressToNext + '%',
                background: `linear-gradient(90deg, ${customerMemberInfo.color} 0%, var(--accent-gold) 100%)`
              }"
            ></div>
          </div>
          <div class="mp-footer">
            <span v-if="customerMemberInfo.discount > 0" class="mp-benefit">
              专属折扣 {{ Math.round(customerMemberInfo.discount * 100) }}%
            </span>
            <span v-if="customerMemberInfo.nextLevelName" class="mp-next">
              下一等级: {{ customerMemberInfo.nextLevelName }}
            </span>
            <span v-else class="mp-max">已达最高等级</span>
          </div>
          <p v-if="customerMemberInfo.notes" class="mp-notes">「{{ customerMemberInfo.notes }}」</p>
        </div>

        <div class="customer-preferences">
          <div class="pref-item">
            <span class="pref-label">🎶 喜欢风格</span>
            <span class="pref-value">{{ customerPreferGenresText }}</span>
          </div>
          <div class="pref-item">
            <span class="pref-label">💰 价格范围</span>
            <span class="pref-value">{{ customerPriceRangeText }}</span>
          </div>
          <div class="pref-item">
            <span class="pref-label">⭐ 稀有度偏好</span>
            <span class="pref-value">
              {{ gameStore.currentCustomer.preference.preferredRarity.map(r => r + '星').join('、') }}
            </span>
          </div>
        </div>

        <div v-if="recommendations.length > 0 && recommendations[0]?.score >= 60" class="recommendation">
          <span class="rec-icon">💡</span>
          <span class="rec-text">
            这位{{ customerMemberInfo ? customerMemberInfo.levelName + '会员' : (gameStore.currentCustomer?.isReturningCustomer ? '回头客' : '新顾客') }}可能喜欢 
            <strong>{{ recommendations[0]?.item.record.title }}</strong>
            （匹配度 {{ Math.round(recommendations[0]?.score || 0) }}%）
            <span v-if="customerMemberInfo && customerMemberInfo.discount > 0" class="discount-hint">
              · 会员价可省 ¥{{ Math.round(recommendations[0]?.item.record.marketPrice * customerMemberInfo.discount) }}
            </span>
          </span>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">🎼 店内陈列</h2>
        <p class="section-desc">点击唱片向顾客推销，或播放试听</p>
      </div>

      <div class="display-grid">
        <div 
          v-for="disp in recommendations" 
          :key="disp.slot.id"
          class="display-item"
          :class="{ playing: gameStore.currentPlayingRecord?.id === disp.item.record.id }"
        >
          <div class="display-record">
            <VinylRecord 
              :record="disp.item.record" 
              size="medium"
              :spinning="gameStore.currentPlayingRecord?.id === disp.item.record.id"
            />
          </div>
          <div class="display-info">
            <h4 class="display-title">{{ disp.item.record.title }}</h4>
            <p class="display-artist">{{ disp.item.record.artist }}</p>
            <div class="display-meta">
              <span class="price">¥{{ disp.item.record.marketPrice }}</span>
              <span 
                class="match-badge"
                :style="{ 
                  background: disp.score >= 60 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)',
                  color: disp.score >= 60 ? '#48bb78' : '#f56565'
                }"
              >
                {{ Math.round(disp.score) }}%
              </span>
            </div>
          </div>
          <div class="display-actions">
            <button 
              class="play-btn"
              :class="{ active: gameStore.currentPlayingRecord?.id === disp.item.record.id }"
              @click="handlePlayRecord(disp.item.record)"
            >
              {{ gameStore.currentPlayingRecord?.id === disp.item.record.id ? '⏸' : '▶' }}
            </button>
            <button 
              class="sell-btn"
              @click="openSellModal(disp.item.record)"
            >
              推销
            </button>
          </div>
        </div>
      </div>

      <div v-if="recommendations.length === 0 && gameStore.displayedRecords.length === 0" class="empty-state card">
        <p>货架上没有唱片，请先返回陈列阶段摆放唱片。</p>
      </div>

      <div class="action-bar">
        <button class="btn-secondary action-btn" @click="handleSkip">
          跳过顾客
        </button>
        <button 
          class="btn-primary action-btn"
          :disabled="gameStore.currentCustomerIndex < gameStore.customers.length - 1"
          @click="endDay"
        >
          {{ gameStore.currentCustomerIndex >= gameStore.customers.length - 1 ? '结束营业' : '还有顾客...' }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="no-customers card">
        <div class="nc-icon">🎉</div>
        <h3>今日顾客已全部接待完毕</h3>
        <p>点击下方按钮进行今日结算</p>
        <button class="btn-primary" @click="endDay">
          查看今日结算 →
        </button>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="showSellModal && selectedRecord" class="modal-overlay" @click.self="closeSellModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>向顾客推销</h3>
            <button class="close-btn" @click="closeSellModal">✕</button>
          </div>

          <div class="modal-body">
            <RecordCard
              :record="selectedRecord"
              :show-price="true"
              :match-score="gameStore.currentCustomer ? calculateMatchScore(gameStore.currentCustomer, selectedRecord) : 0"
            />

            <div v-if="customerMemberInfo" class="member-discount-info">
              <span class="mdi-icon">{{ customerMemberInfo.icon }}</span>
              <span class="mdi-text" :style="{ color: customerMemberInfo.color }">
                {{ customerMemberInfo.levelName }}专属: 立减 {{ Math.round(customerMemberInfo.discount * 100) }}%
              </span>
            </div>

            <div class="price-editor">
              <span class="pe-label">出价</span>
              <div class="pe-controls">
                <button class="pe-btn" @click="customPrice = Math.max(selectedRecord.costPrice, customPrice - 10)">-10</button>
                <input 
                  type="number" 
                  v-model.number="customPrice"
                  class="pe-input"
                  :min="selectedRecord.costPrice"
                />
                <button class="pe-btn" @click="customPrice = customPrice + 10">+10</button>
              </div>
            </div>

            <div class="price-hint">
              <span>建议售价: ¥{{ selectedRecord.marketPrice }}</span>
              <span>进价: ¥{{ selectedRecord.costPrice }}</span>
            </div>

            <div v-if="customerMemberInfo && customerMemberInfo.discount > 0" class="member-price-preview">
              <span class="mpp-label">{{ customerMemberInfo.icon }} 会员实付</span>
              <span class="mpp-value">
                ¥{{ Math.floor(customPrice * (1 - customerMemberInfo.discount)) }}
                <span class="mpp-save">省 ¥{{ Math.floor(customPrice * customerMemberInfo.discount) }}</span>
              </span>
            </div>

            <div class="profit-preview">
              <span class="pp-label">预计利润</span>
              <span class="pp-value" :class="{ positive: customPrice > selectedRecord.costPrice }">
                {{ customPrice > selectedRecord.costPrice ? '+' : '' }}¥{{ customPrice - selectedRecord.costPrice }}
              </span>
            </div>

            <p v-if="message" class="message" :class="messageType">
              {{ message }}
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeSellModal">取消</button>
            <button 
              class="btn-primary"
              :disabled="customPrice < selectedRecord.costPrice"
              @click="handleSell"
            >
              确认出价
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.business-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.now-playing {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.15) 0%, rgba(243, 156, 18, 0.15) 100%);
  border-color: rgba(233, 69, 96, 0.4);
}

.np-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.np-icon {
  font-size: 16px;
}

.np-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-gold);
}

.stop-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(233, 69, 96, 0.3);
  color: var(--accent-gold);
  font-size: 12px;
}

.np-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.np-info {
  flex: 1;
}

.np-record-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.np-record-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.np-genre {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.np-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.customer-card {
  animation: slideUp 0.3s ease-out;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.customer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  position: relative;
  flex-shrink: 0;
}

.avatar-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid var(--bg-card);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.returning-badge {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(56, 178, 172, 0.2) 100%);
  color: var(--success);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.customer-member {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
}

.member-progress {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.08) 0%, rgba(233, 69, 96, 0.08) 100%);
  border: 1px solid rgba(246, 224, 94, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.mp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mp-level {
  font-size: 13px;
  font-weight: 700;
}

.mp-points {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.mp-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.mp-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.mp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}

.mp-benefit {
  color: var(--success);
  font-weight: 600;
}

.mp-next {
  color: var(--text-muted);
}

.mp-max {
  color: var(--accent-gold);
  font-weight: 600;
}

.mp-notes {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(246, 224, 94, 0.2);
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
}

.discount-hint {
  color: var(--success);
  font-weight: 600;
}

.member-discount-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(233, 69, 96, 0.1) 100%);
  border-radius: 8px;
  border: 1px solid rgba(246, 224, 94, 0.2);
}

.mdi-icon {
  font-size: 16px;
}

.mdi-text {
  font-size: 12px;
  font-weight: 600;
  flex: 1;
}

.member-price-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(72, 187, 120, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.mpp-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.mpp-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--success);
}

.mpp-save {
  font-size: 11px;
  font-weight: 500;
  color: var(--success);
  opacity: 0.8;
  margin-left: 6px;
}

.customer-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.customer-budget {
  font-size: 13px;
  color: var(--accent-orange);
  font-weight: 500;
}

.customer-index {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 12px;
}

.customer-preferences {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.pref-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.pref-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.pref-value {
  font-size: 12px;
  color: var(--text-primary);
  text-align: right;
  flex: 1;
}

.recommendation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  background: rgba(72, 187, 120, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.rec-icon {
  font-size: 14px;
}

.rec-text strong {
  color: var(--success);
  font-weight: 600;
}

.section-header {
  margin-top: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.section-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.display-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.display-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.display-item.playing {
  border-color: var(--accent-gold);
  box-shadow: 0 0 16px rgba(233, 69, 96, 0.2);
}

.display-record {
  flex-shrink: 0;
}

.display-info {
  flex: 1;
  min-width: 0;
}

.display-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.display-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.display-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-orange);
}

.match-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.display-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.play-btn.active {
  background: var(--accent-gold);
  color: white;
}

.sell-btn {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 24px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 13px;
}

.no-customers {
  text-align: center;
  padding: 32px 24px;
}

.nc-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-customers h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.no-customers p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 16px;
  display: flex;
  gap: 12px;
  background: linear-gradient(to top, var(--bg-primary) 70%, transparent);
  z-index: 50;
}

.action-btn {
  flex: 1;
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
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-editor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px 16px;
}

.pe-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.pe-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pe-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.pe-input {
  width: 80px;
  height: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.price-hint {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

.profit-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(72, 187, 120, 0.1);
  border-radius: 8px;
}

.pp-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.pp-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--danger);
}

.pp-value.positive {
  color: var(--success);
}

.message {
  text-align: center;
  font-size: 13px;
  padding: 10px;
  border-radius: 6px;
}

.message.success {
  color: var(--success);
  background: rgba(72, 187, 120, 0.1);
}

.message.error {
  color: var(--danger);
  background: rgba(245, 101, 101, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border);
}

.modal-footer button {
  flex: 1;
}
</style>
