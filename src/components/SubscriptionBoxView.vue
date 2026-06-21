<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import VinylRecord from './VinylRecord.vue'
import type { Subscriber, MonthlyBox, Complaint } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const activeTab = ref<'overview' | 'subscribers' | 'themes' | 'boxes' | 'complaints' | 'plans'>('overview')
const selectedSubscriber = ref<Subscriber | null>(null)
const selectedBox = ref<MonthlyBox | null>(null)
const selectedComplaint = ref<Complaint | null>(null)
const showComplaintModal = ref(false)
const showBoxDetailModal = ref(false)
const showSubscriberModal = ref(false)
const showActivateModal = ref(false)
const complaintAction = ref<'resolve' | 'reject'>('resolve')
const complaintResolution = ref('')
const complaintRefundAmount = ref(0)
const newSubscriberPlan = ref('')
const newSubscriberTheme = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const stats = computed(() => gameStore.subscriptionBoxStats)
const isActive = computed(() => gameStore.subscriptionBox.isSubscriptionServiceActive)
const subscribers = computed(() => gameStore.subscriptionBox.subscribers)
const boxes = computed(() => gameStore.subscriptionBox.boxes)
const complaints = computed(() => gameStore.subscriptionBox.complaints)
const themes = computed(() => gameStore.getAvailableThemesForLevel())
const plans = computed(() => gameStore.getAvailablePlansForLevel())

const pendingComplaintsCount = computed(() => 
  complaints.value.filter(c => c.status === 'pending').length
)

const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const activateService = () => {
  const result = gameStore.activateSubscriptionService()
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    showActivateModal.value = false
  }
}

const addSubscriber = () => {
  if (!newSubscriberPlan.value) {
    showMessage('请选择套餐', 'error')
    return
  }
  const result = gameStore.addNewSubscriber(
    newSubscriberPlan.value,
    newSubscriberTheme.value || undefined
  )
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    newSubscriberPlan.value = ''
    newSubscriberTheme.value = ''
  }
}

const prepareBox = (subscriberId: string) => {
  const subscriber = subscribers.value.find(s => s.id === subscriberId)
  if (!subscriber) return
  
  const preferredThemeId = subscriber.preference.preferredThemes[0] || themes.value[0]?.id
  if (!preferredThemeId) {
    showMessage('没有可用的主题', 'error')
    return
  }
  
  const result = gameStore.prepareMonthlyBox(subscriberId, preferredThemeId)
  showMessage(result.message, result.success ? 'success' : 'error')
}

const shipSelectedBox = () => {
  if (!selectedBox.value) return
  const result = gameStore.shipBox(selectedBox.value.id)
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    selectedBox.value = null
    showBoxDetailModal.value = false
  }
}

const deliverSelectedBox = () => {
  if (!selectedBox.value) return
  const result = gameStore.deliverBox(selectedBox.value.id)
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    selectedBox.value = null
    showBoxDetailModal.value = false
  }
}

const openComplaint = (complaint: Complaint) => {
  selectedComplaint.value = complaint
  complaintAction.value = 'resolve'
  complaintResolution.value = ''
  complaintRefundAmount.value = Math.floor(complaint.refundAmount || 50)
  showComplaintModal.value = true
}

const handleComplaint = () => {
  if (!selectedComplaint.value) return
  if (!complaintResolution.value.trim()) {
    showMessage('请填写处理说明', 'error')
    return
  }
  
  const result = gameStore.handleComplaint(
    selectedComplaint.value.id,
    complaintAction.value,
    complaintResolution.value,
    complaintAction.value === 'resolve' ? complaintRefundAmount.value : 0
  )
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    showComplaintModal.value = false
    selectedComplaint.value = null
  }
}

const cancelSubscriber = (subscriberId: string) => {
  const result = gameStore.cancelSubscription(subscriberId, '手动取消')
  showMessage(result.message, result.success ? 'success' : 'error')
}

const viewSubscriber = (subscriber: Subscriber) => {
  selectedSubscriber.value = subscriber
  showSubscriberModal.value = true
}

const viewBox = (box: MonthlyBox) => {
  selectedBox.value = box
  showBoxDetailModal.value = true
}

const getTierColor = (tier: string) => {
  const colors: Record<string, string> = {
    basic: '#a0aec0',
    standard: '#4299e1',
    premium: '#d69e2e',
    elite: '#9f7aea'
  }
  return colors[tier] || colors.basic
}

const getTierName = (tier: string) => {
  const names: Record<string, string> = {
    basic: '基础',
    standard: '标准',
    premium: '尊享',
    elite: '至臻'
  }
  return names[tier] || tier
}

onMounted(() => {
  gameStore.markSubscriptionBoxNotificationsRead()
})
</script>

<template>
  <div class="sub-box-overlay" @click.self="emit('close')">
    <div class="sub-box-container">
      <div class="sub-box-header">
        <h2>📦 唱片订阅盒子</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div v-if="!isActive" class="activate-section card">
        <div class="activate-icon">🎁</div>
        <h3>开启订阅盒子服务</h3>
        <p>为顾客提供每月精选唱片订阅服务，打造稳定的 recurring revenue</p>
        <div class="activate-features">
          <div class="feature">🎵 主题组合选曲</div>
          <div class="feature">📅 月度自动发货</div>
          <div class="feature">🎯 偏好智能匹配</div>
          <div class="feature">💰 持续续费收益</div>
        </div>
        <button class="btn-primary activate-btn" @click="showActivateModal = true">
          启动服务（¥500）
        </button>
      </div>

      <template v-else>
        <div class="tabs">
          <button 
            v-for="tab in [
              { key: 'overview', label: '📊 概览' },
              { key: 'subscribers', label: '👥 订阅者' },
              { key: 'themes', label: '🎨 主题' },
              { key: 'boxes', label: '📦 盒子' },
              { key: 'complaints', label: '📝 投诉', badge: pendingComplaintsCount },
              { key: 'plans', label: '💎 套餐' }
            ]" 
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key as any"
          >
            {{ tab.label }}
            <span v-if="tab.badge && tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </div>

        <div v-if="message" class="message-bar" :class="messageType">
          {{ message }}
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'overview'" class="overview-tab">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.activeSubscribers }}</div>
                  <div class="stat-label">活跃订阅者</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ Math.floor(stats.totalRevenue) }}</div>
                  <div class="stat-label">总收入</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-info">
                  <div class="stat-value">¥{{ Math.floor(stats.totalProfit) }}</div>
                  <div class="stat-label">总利润</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.avgSatisfaction.toFixed(1) }}</div>
                  <div class="stat-label">平均满意度</div>
                </div>
              </div>
            </div>

            <div class="quick-actions card">
              <h4>快捷操作</h4>
              <div class="action-buttons">
                <button class="btn-secondary" @click="activeTab = 'subscribers'">
                  ＋ 新增订阅
                </button>
                <button class="btn-secondary" @click="activeTab = 'boxes'">
                  📦 管理盒子
                </button>
                <button class="btn-secondary" @click="activeTab = 'complaints'">
                  📝 处理投诉
                  <span v-if="pendingComplaintsCount > 0" class="badge">{{ pendingComplaintsCount }}</span>
                </button>
              </div>
            </div>

            <div v-if="stats.totalBoxesShipped > 0" class="performance-card card">
              <h4>运营数据</h4>
              <div class="perf-grid">
                <div class="perf-item">
                  <span class="perf-label">已发货盒子</span>
                  <span class="perf-value">{{ stats.totalBoxesShipped }}</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">平均匹配度</span>
                  <span class="perf-value">{{ stats.avgMatchScore.toFixed(1) }}%</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">续费率</span>
                  <span class="perf-value">{{ (stats.renewRate * 100).toFixed(0) }}%</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">投诉解决率</span>
                  <span class="perf-value">{{ (stats.complaintResolutionRate * 100).toFixed(0) }}%</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">平均评分</span>
                  <span class="perf-value">
                    <span v-if="stats.avgRating > 0">{{ stats.avgRating.toFixed(1) }} ⭐</span>
                    <span v-else>暂无</span>
                  </span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">客户流失率</span>
                  <span class="perf-value danger">{{ (stats.churnRate * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <div v-if="subscribers.length > 0" class="tier-distribution card">
              <h4>套餐分布</h4>
              <div class="tier-list">
                <div v-for="(count, tier) in stats.byTier" :key="tier" class="tier-row">
                  <span class="tier-name" :style="{ color: getTierColor(tier) }">
                    {{ getTierName(tier) }}
                  </span>
                  <div class="tier-bar">
                    <div 
                      class="tier-fill" 
                      :style="{ 
                        width: stats.activeSubscribers > 0 ? (count / stats.activeSubscribers * 100) + '%' : '0%',
                        background: getTierColor(tier)
                      }"
                    ></div>
                  </div>
                  <span class="tier-count">{{ count }}人</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'subscribers'" class="subscribers-tab">
            <div class="add-subscriber-card card">
              <h4>快速新增订阅</h4>
              <div class="add-form">
                <select v-model="newSubscriberPlan" class="form-select">
                  <option value="">选择套餐</option>
                  <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                    {{ plan.name }} - ¥{{ plan.monthlyPrice }}/月
                  </option>
                </select>
                <select v-model="newSubscriberTheme" class="form-select">
                  <option value="">偏好主题（可选）</option>
                  <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                    {{ theme.icon }} {{ theme.name }}
                  </option>
                </select>
                <button class="btn-primary" @click="addSubscriber">添加订阅</button>
              </div>
            </div>

            <div class="subscriber-list">
              <div 
                v-for="subscriber in subscribers" 
                :key="subscriber.id"
                class="subscriber-card card"
                @click="viewSubscriber(subscriber)"
              >
                <div class="subscriber-avatar">{{ subscriber.avatar }}</div>
                <div class="subscriber-info">
                  <div class="subscriber-name">
                    {{ subscriber.name }}
                    <span 
                      class="tier-badge"
                      :style="{ background: getTierColor(subscriber.tier) + '20', color: getTierColor(subscriber.tier) }"
                    >
                      {{ getTierName(subscriber.tier) }}
                    </span>
                    <span 
                      v-if="subscriber.isMember" 
                      class="member-badge"
                    >
                      会员
                    </span>
                  </div>
                  <div class="subscriber-detail">
                    <span>已订阅 {{ subscriber.boxesReceived }} 个月</span>
                    <span>·</span>
                    <span>总消费 ¥{{ subscriber.totalSpent }}</span>
                  </div>
                  <div class="subscriber-meta">
                    <div class="satisfaction-bar">
                      <div 
                        class="satisfaction-fill"
                        :style="{ 
                          width: subscriber.satisfaction + '%',
                          background: subscriber.satisfaction >= 70 ? '#68d391' : subscriber.satisfaction >= 40 ? '#f6ad55' : '#fc8181'
                        }"
                      ></div>
                    </div>
                    <span class="satisfaction-value">{{ subscriber.satisfaction }}</span>
                  </div>
                </div>
                <div class="subscriber-status" :class="subscriber.status">
                  {{ gameStore.getSubscriptionBoxStatusLabel(subscriber.status) }}
                </div>
              </div>
            </div>

            <div v-if="subscribers.length === 0" class="empty-state">
              <p>还没有订阅者，快添加你的第一位订阅用户吧！</p>
            </div>
          </div>

          <div v-if="activeTab === 'themes'" class="themes-tab">
            <div class="themes-grid">
              <div 
                v-for="theme in gameStore.subscriptionBox.themes" 
                :key="theme.id"
                class="theme-card card"
                :class="{ locked: theme.minLevel > 1 }"
              >
                <div class="theme-header" :style="{ background: theme.color }">
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <span v-if="theme.minLevel > 1" class="theme-lock">🔒 Lv.{{ theme.minLevel }}</span>
                </div>
                <div class="theme-body">
                  <h4>{{ theme.name }}</h4>
                  <p class="theme-desc">{{ theme.description }}</p>
                  <p class="theme-tagline">「{{ theme.moodTagline }}」</p>
                  <div class="theme-genres">
                    <span 
                      v-for="genre in theme.coreGenres" 
                      :key="genre" 
                      class="genre-tag core"
                    >
                      {{ genre }}
                    </span>
                    <span 
                      v-for="genre in theme.bonusGenres" 
                      :key="genre" 
                      class="genre-tag bonus"
                    >
                      {{ genre }}
                    </span>
                  </div>
                  <div class="theme-meta">
                    <span>人气 {{ theme.popularity }}%</span>
                    <span>¥{{ theme.priceRange[0] }}-{{ theme.priceRange[1] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'boxes'" class="boxes-tab">
            <div class="boxes-filters">
              <span class="filter-label">盒子状态：</span>
              <span class="filter-count">共 {{ boxes.length }} 个盒子</span>
            </div>

            <div class="box-list">
              <div 
                v-for="box in boxes" 
                :key="box.id"
                class="box-card card"
                @click="viewBox(box)"
              >
                <div class="box-theme-icon" :style="{ background: box.theme.color }">
                  {{ box.theme.icon }}
                </div>
                <div class="box-info">
                  <div class="box-title">
                    {{ box.theme.name }} · 第{{ box.monthNumber }}期
                  </div>
                  <div class="box-subscriber">
                    📍 {{ box.subscriberName }}
                    <span 
                      class="tier-mini"
                      :style="{ color: getTierColor(box.planTier) }"
                    >
                      {{ getTierName(box.planTier) }}
                    </span>
                  </div>
                  <div class="box-meta">
                    <span>{{ box.items.length }} 张唱片</span>
                    <span>·</span>
                    <span>价值 ¥{{ box.totalValue }}</span>
                  </div>
                </div>
                <div 
                  class="box-status"
                  :style="{ color: gameStore.getSubscriptionBoxStatusLabel(box.status) ? '' : '' }"
                >
                  <span class="status-dot" :style="{ background: gameStore.getSubscriptionBoxStatusColor(box.status) }"></span>
                  {{ gameStore.getSubscriptionBoxStatusLabel(box.status) }}
                </div>
              </div>
            </div>

            <div v-if="boxes.length === 0" class="empty-state">
              <p>还没有盒子记录</p>
            </div>
          </div>

          <div v-if="activeTab === 'complaints'" class="complaints-tab">
            <div class="complaint-stats card">
              <div class="stat-mini">
                <span class="stat-mini-icon">⏳</span>
                <span class="stat-mini-value">{{ pendingComplaintsCount }}</span>
                <span class="stat-mini-label">待处理</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-icon">✅</span>
                <span class="stat-mini-value">{{ stats.resolvedComplaints }}</span>
                <span class="stat-mini-label">已解决</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-icon">📊</span>
                <span class="stat-mini-value">{{ (stats.complaintResolutionRate * 100).toFixed(0) }}%</span>
                <span class="stat-mini-label">解决率</span>
              </div>
            </div>

            <div class="complaint-list">
              <div 
                v-for="complaint in complaints" 
                :key="complaint.id"
                class="complaint-card card"
                :class="{ urgent: complaint.severity === 'critical' || complaint.severity === 'high' }"
              >
                <div class="complaint-icon">{{ complaint.typeIcon }}</div>
                <div class="complaint-info">
                  <div class="complaint-header">
                    <span class="complaint-type">{{ complaint.typeName }}</span>
                    <span 
                      class="severity-badge"
                      :style="{ 
                        background: gameStore.getSeverityColor(complaint.severity) + '20',
                        color: gameStore.getSeverityColor(complaint.severity)
                      }"
                    >
                      {{ gameStore.getSeverityLabel(complaint.severity) }}
                    </span>
                    <span 
                      class="complaint-status-badge"
                      :style="{ 
                        background: gameStore.getSubscriptionBoxStatusColor(complaint.status) + '20',
                        color: gameStore.getSubscriptionBoxStatusColor(complaint.status)
                      }"
                    >
                      {{ gameStore.getSubscriptionBoxStatusLabel(complaint.status) }}
                    </span>
                  </div>
                  <div class="complaint-submitter">
                    {{ complaint.subscriberAvatar }} {{ complaint.subscriberName }}
                  </div>
                  <p class="complaint-desc">{{ complaint.description }}</p>
                  <div class="complaint-footer">
                    <span class="complaint-date">第 {{ complaint.dayCreated }} 天提交</span>
                    <span v-if="complaint.responseDeadline" class="complaint-deadline">
                      截止第 {{ complaint.responseDeadline }} 天
                    </span>
                  </div>
                </div>
                <div class="complaint-actions">
                  <button 
                    v-if="complaint.status === 'pending'"
                    class="btn-small btn-primary"
                    @click.stop="openComplaint(complaint)"
                  >
                    处理
                  </button>
                </div>
              </div>
            </div>

            <div v-if="complaints.length === 0" class="empty-state">
              <p>暂无投诉，继续保持！</p>
            </div>
          </div>

          <div v-if="activeTab === 'plans'" class="plans-tab">
            <div class="plans-grid">
              <div 
                v-for="plan in gameStore.subscriptionBox.plans" 
                :key="plan.id"
                class="plan-card card"
                :class="{ 
                  popular: plan.isPopular,
                  locked: plan.minLevel > 1
                }"
              >
                <div v-if="plan.isPopular" class="plan-popular-badge">最受欢迎</div>
                <div v-if="plan.minLevel > 1" class="plan-lock">
                  🔒 Lv.{{ plan.minLevel }} 解锁
                </div>
                <div class="plan-icon">{{ plan.icon }}</div>
                <h3 class="plan-name">{{ plan.name }}</h3>
                <div class="plan-price">
                  <span class="price-currency">¥</span>
                  <span class="price-value">{{ plan.monthlyPrice }}</span>
                  <span class="price-period">/月</span>
                </div>
                <p class="plan-desc">{{ plan.description }}</p>
                <ul class="plan-perks">
                  <li v-for="perk in plan.perks" :key="perk">
                    <span class="perk-check">✓</span>
                    {{ perk }}
                  </li>
                </ul>
                <div class="plan-footer">
                  <span>含 {{ plan.recordCount }} 张唱片</span>
                  <span>{{ plan.minRarity }}-{{ plan.maxRarity }} 星</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <Teleport to="body">
        <div v-if="showActivateModal" class="modal-overlay" @click.self="showActivateModal = false">
          <div class="modal-content small">
            <div class="modal-header">
              <h3>确认启动订阅服务</h3>
              <button class="close-btn" @click="showActivateModal = false">✕</button>
            </div>
            <div class="modal-body">
              <p>启动订阅盒子服务需要支付 <strong>¥500</strong> 的启动资金。</p>
              <p>启动后你可以：</p>
              <ul>
                <li>🎵 创建主题盒子，吸引订阅用户</li>
                <li>💰 获得稳定的月度订阅收入</li>
                <li>📈 提升店铺口碑和影响力</li>
              </ul>
              <p class="current-budget">当前预算：¥{{ gameStore.budget }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showActivateModal = false">取消</button>
              <button 
                class="btn-primary" 
                :disabled="gameStore.budget < 500"
                @click="activateService"
              >
                确认启动
              </button>
            </div>
          </div>
        </div>

        <div v-if="showSubscriberModal && selectedSubscriber" class="modal-overlay" @click.self="showSubscriberModal = false">
          <div class="modal-content medium">
            <div class="modal-header">
              <h3>订阅者详情</h3>
              <button class="close-btn" @click="showSubscriberModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="sub-detail-header">
                <div class="sub-detail-avatar">{{ selectedSubscriber.avatar }}</div>
                <div class="sub-detail-info">
                  <h4>{{ selectedSubscriber.name }}</h4>
                  <span 
                    class="tier-badge"
                    :style="{ background: getTierColor(selectedSubscriber.tier) + '20', color: getTierColor(selectedSubscriber.tier) }"
                  >
                    {{ getTierName(selectedSubscriber.tier) }}
                  </span>
                </div>
              </div>
              
              <div class="sub-detail-stats">
                <div class="sub-stat">
                  <span class="sub-stat-value">{{ selectedSubscriber.boxesReceived }}</span>
                  <span class="sub-stat-label">已收盒子</span>
                </div>
                <div class="sub-stat">
                  <span class="sub-stat-value">¥{{ selectedSubscriber.totalSpent }}</span>
                  <span class="sub-stat-label">总消费</span>
                </div>
                <div class="sub-stat">
                  <span class="sub-stat-value">{{ selectedSubscriber.satisfaction }}</span>
                  <span class="sub-stat-label">满意度</span>
                </div>
                <div class="sub-stat">
                  <span class="sub-stat-value">{{ selectedSubscriber.autoRenew ? '✓' : '✗' }}</span>
                  <span class="sub-stat-label">自动续费</span>
                </div>
              </div>

              <div class="sub-detail-section">
                <h5>🎵 音乐偏好</h5>
                <div class="preference-tags">
                  <span 
                    v-for="genre in selectedSubscriber.preference.favoriteGenres" 
                    :key="genre" 
                    class="pref-tag"
                  >
                    {{ genre }}
                  </span>
                </div>
                <p class="pref-price">
                  预算范围：¥{{ selectedSubscriber.preference.priceRange[0] }} - ¥{{ selectedSubscriber.preference.priceRange[1] }}
                </p>
                <p class="pref-rarity">
                  稀有度偏好：{{ selectedSubscriber.preference.preferredRarity.map(r => r + '星').join('、') }}
                </p>
              </div>

              <div class="sub-detail-section">
                <h5>📦 历史盒子</h5>
                <div class="sub-boxes-list">
                  <div 
                    v-for="box in gameStore.getSubscriberBoxes(selectedSubscriber.id)" 
                    :key="box.id"
                    class="sub-box-item"
                  >
                    <span class="sub-box-icon" :style="{ background: box.theme.color }">{{ box.theme.icon }}</span>
                    <span class="sub-box-name">{{ box.theme.name }} 第{{ box.monthNumber }}期</span>
                    <span class="sub-box-rating" v-if="box.rating">
                      {{ box.rating }}⭐
                    </span>
                  </div>
                </div>
                <p v-if="gameStore.getSubscriberBoxes(selectedSubscriber.id).length === 0" class="empty-text">
                  暂无历史记录
                </p>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                v-if="selectedSubscriber.status === 'active'"
                class="btn-secondary danger" 
                @click="cancelSubscriber(selectedSubscriber!.id); showSubscriberModal = false"
              >
                取消订阅
              </button>
              <button 
                v-if="selectedSubscriber.status === 'active' && gameStore.inventory.length > 0"
                class="btn-primary"
                @click="prepareBox(selectedSubscriber!.id); showSubscriberModal = false"
              >
                准备本月盒子
              </button>
            </div>
          </div>
        </div>

        <div v-if="showBoxDetailModal && selectedBox" class="modal-overlay" @click.self="showBoxDetailModal = false">
          <div class="modal-content medium">
            <div class="modal-header">
              <h3>盒子详情</h3>
              <button class="close-btn" @click="showBoxDetailModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="box-detail-header" :style="{ background: selectedBox.theme.color }">
                <span class="box-detail-icon">{{ selectedBox.theme.icon }}</span>
                <div>
                  <h4>{{ selectedBox.theme.name }} · 第{{ selectedBox.monthNumber }}期</h4>
                  <p>{{ selectedBox.subscriberName }}的盒子</p>
                </div>
              </div>

              <div class="box-detail-status">
                <span 
                  class="status-badge"
                  :style="{ 
                    background: gameStore.getSubscriptionBoxStatusColor(selectedBox.status) + '20',
                    color: gameStore.getSubscriptionBoxStatusColor(selectedBox.status)
                  }"
                >
                  {{ gameStore.getSubscriptionBoxStatusLabel(selectedBox.status) }}
                </span>
                <span v-if="selectedBox.rating" class="box-rating">
                  {{ selectedBox.rating }} ⭐ 用户评分
                </span>
              </div>

              <div class="box-detail-records">
                <h5>内含唱片</h5>
                <div 
                  v-for="item in selectedBox.items" 
                  :key="item.record.id"
                  class="box-record-item"
                >
                  <VinylRecord :record="item.record" size="small" />
                  <div class="box-record-info">
                    <div class="br-title">{{ item.record.title }}</div>
                    <div class="br-artist">{{ item.record.artist }}</div>
                    <div class="br-meta">
                      <span 
                        class="match-badge"
                        :style="{ 
                          background: item.matchScore >= 60 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)',
                          color: item.matchScore >= 60 ? '#48bb78' : '#f56565'
                        }"
                      >
                        匹配 {{ Math.round(item.matchScore) }}%
                      </span>
                      <span v-if="item.isSurprise" class="surprise-tag">🎁 惊喜</span>
                    </div>
                    <p class="br-reason">{{ item.matchReason }}</p>
                  </div>
                  <div class="box-record-price">
                    ¥{{ item.estimatedValue }}
                  </div>
                </div>
              </div>

              <div class="box-detail-financial">
                <div class="fin-row">
                  <span>总价值</span>
                  <span>¥{{ selectedBox.totalValue }}</span>
                </div>
                <div class="fin-row">
                  <span>订阅价</span>
                  <span>¥{{ selectedBox.subscriberCost }}</span>
                </div>
                <div class="fin-row">
                  <span>成本</span>
                  <span>¥{{ selectedBox.shopCost }}</span>
                </div>
                <div class="fin-row highlight">
                  <span>利润</span>
                  <span class="profit">¥{{ selectedBox.shopProfit }}</span>
                </div>
              </div>

              <div v-if="selectedBox.feedback" class="box-feedback">
                <h5>用户反馈</h5>
                <p>"{{ selectedBox.feedback }}"</p>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                v-if="selectedBox.status === 'preparing'"
                class="btn-primary"
                @click="shipSelectedBox"
              >
                发货
              </button>
              <button 
                v-if="selectedBox.status === 'shipped'"
                class="btn-primary"
                @click="deliverSelectedBox"
              >
                确认送达
              </button>
            </div>
          </div>
        </div>

        <div v-if="showComplaintModal && selectedComplaint" class="modal-overlay" @click.self="showComplaintModal = false">
          <div class="modal-content medium">
            <div class="modal-header">
              <h3>处理投诉</h3>
              <button class="close-btn" @click="showComplaintModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="complaint-detail">
                <div class="cd-header">
                  <span class="cd-icon">{{ selectedComplaint.typeIcon }}</span>
                  <div>
                    <h4>{{ selectedComplaint.typeName }}</h4>
                    <span 
                      class="severity-badge"
                      :style="{ 
                        background: gameStore.getSeverityColor(selectedComplaint.severity) + '20',
                        color: gameStore.getSeverityColor(selectedComplaint.severity)
                      }"
                    >
                      {{ gameStore.getSeverityLabel(selectedComplaint.severity) }}
                    </span>
                  </div>
                </div>
                <div class="cd-submitter">
                  {{ selectedComplaint.subscriberAvatar }} {{ selectedComplaint.subscriberName }}
                </div>
                <p class="cd-desc">"{{ selectedComplaint.description }}"</p>
              </div>

              <div class="complaint-actions-section">
                <div class="action-toggle">
                  <button 
                    class="toggle-btn"
                    :class="{ active: complaintAction === 'resolve' }"
                    @click="complaintAction = 'resolve'"
                  >
                    ✅ 解决投诉
                  </button>
                  <button 
                    class="toggle-btn"
                    :class="{ active: complaintAction === 'reject' }"
                    @click="complaintAction = 'reject'"
                  >
                    ❌ 驳回投诉
                  </button>
                </div>

                <div class="form-group">
                  <label>处理说明</label>
                  <textarea 
                    v-model="complaintResolution" 
                    class="form-textarea"
                    placeholder="请输入处理说明..."
                    rows="3"
                  ></textarea>
                </div>

                <div v-if="complaintAction === 'resolve'" class="form-group">
                  <label>退款金额（¥）</label>
                  <input 
                    type="number" 
                    v-model.number="complaintRefundAmount"
                    class="form-input"
                    min="0"
                  />
                  <p class="form-hint">适当退款可以挽回用户满意度和口碑</p>
                </div>

                <div class="impact-preview">
                  <p>预计影响：</p>
                  <ul>
                    <li v-if="complaintAction === 'resolve'">
                      <span class="positive">+满意度恢复</span>
                      <span class="positive">+部分口碑恢复</span>
                      <span v-if="complaintRefundAmount > 0" class="negative">- ¥{{ complaintRefundAmount }} 退款</span>
                    </li>
                    <li v-else>
                      <span class="negative">-满意度下降</span>
                      <span class="negative">-口碑损失</span>
                      <span class="negative">可能取消订阅</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showComplaintModal = false">取消</button>
              <button 
                class="btn-primary"
                :class="complaintAction === 'reject' ? 'danger' : ''"
                :disabled="!complaintResolution.trim()"
                @click="handleComplaint"
              >
                确认{{ complaintAction === 'resolve' ? '解决' : '驳回' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.sub-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.sub-box-container {
  background: var(--bg-card);
  border-radius: 16px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.sub-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
}

.sub-box-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.activate-section {
  text-align: center;
  padding: 40px 24px;
  margin: 20px;
  background: linear-gradient(135deg, rgba(246, 173, 85, 0.1) 0%, rgba(233, 69, 96, 0.1) 100%);
  border: 2px dashed var(--accent-gold);
}

.activate-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.activate-section h3 {
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.activate-section > p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.activate-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.feature {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
}

.activate-btn {
  padding: 12px 32px;
  font-size: 15px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-wrap: nowrap;
}

.tab-btn {
  position: relative;
  padding: 8px 14px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-btn.active {
  color: var(--accent-gold);
  background: rgba(246, 173, 85, 0.1);
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--danger);
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
}

.tab-content {
  padding: 16px;
}

.message-bar {
  margin: 0 16px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  animation: slideDown 0.3s ease;
}

.message-bar.success {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.message-bar.error {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.stat-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.quick-actions {
  margin-bottom: 16px;
}

.quick-actions h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-buttons .btn-secondary {
  flex: 1;
  min-width: 100px;
  position: relative;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--danger);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.performance-card h4,
.tier-distribution h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.perf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.perf-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.perf-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.perf-value.danger {
  color: var(--danger);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tier-name {
  font-size: 12px;
  font-weight: 600;
  width: 40px;
  flex-shrink: 0;
}

.tier-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.tier-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.tier-count {
  font-size: 12px;
  color: var(--text-secondary);
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

.add-subscriber-card h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.subscriber-list,
.box-list,
.complaint-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subscriber-card,
.box-card,
.complaint-card {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscriber-card:hover,
.box-card:hover,
.complaint-card:hover {
  border-color: var(--accent-gold);
  transform: translateX(2px);
}

.subscriber-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.subscriber-info {
  flex: 1;
  min-width: 0;
}

.subscriber-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tier-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.member-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(246, 224, 94, 0.2);
  color: var(--accent-gold);
  font-weight: 600;
}

.subscriber-detail {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  gap: 6px;
}

.subscriber-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.satisfaction-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  max-width: 120px;
}

.satisfaction-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.satisfaction-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  width: 24px;
}

.subscriber-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  flex-shrink: 0;
}

.subscriber-status.cancelled,
.subscriber-status.expired {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.subscriber-status.paused {
  background: rgba(246, 173, 85, 0.15);
  color: var(--warning);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.themes-grid,
.plans-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.theme-card,
.plan-card {
  overflow: hidden;
  padding: 0;
  position: relative;
}

.theme-card.locked {
  opacity: 0.6;
}

.theme-header {
  padding: 16px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-icon {
  font-size: 32px;
}

.theme-lock {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
}

.theme-body {
  padding: 14px 16px 16px;
}

.theme-body h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: var(--text-primary);
}

.theme-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.theme-tagline {
  font-size: 12px;
  color: var(--accent-gold);
  font-style: italic;
  margin: 0 0 10px 0;
}

.theme-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.genre-tag {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.genre-tag.core {
  background: rgba(72, 187, 120, 0.2);
  color: var(--success);
}

.genre-tag.bonus {
  background: rgba(99, 179, 237, 0.2);
  color: #63b3ed;
}

.theme-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

.boxes-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.filter-label {
  color: var(--text-secondary);
}

.filter-count {
  color: var(--text-muted);
}

.box-theme-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  color: white;
}

.box-info {
  flex: 1;
  min-width: 0;
}

.box-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.box-subscriber {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tier-mini {
  font-size: 10px;
  font-weight: 600;
}

.box-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
}

.box-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.complaint-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 16px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-mini-icon {
  font-size: 20px;
}

.stat-mini-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-mini-label {
  font-size: 11px;
  color: var(--text-muted);
}

.complaint-card.urgent {
  border-color: var(--danger);
  box-shadow: 0 0 12px rgba(245, 101, 101, 0.2);
}

.complaint-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
  flex-shrink: 0;
}

.complaint-info {
  flex: 1;
  min-width: 0;
}

.complaint-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.complaint-type {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.severity-badge,
.complaint-status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.complaint-submitter {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.complaint-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.complaint-footer {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
}

.complaint-deadline {
  color: var(--danger);
}

.complaint-actions {
  flex-shrink: 0;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.plan-card {
  padding: 20px;
  text-align: center;
  position: relative;
}

.plan-card.popular {
  border-color: var(--accent-gold);
  box-shadow: 0 0 20px rgba(246, 173, 85, 0.15);
}

.plan-card.locked {
  opacity: 0.5;
}

.plan-popular-badge {
  position: absolute;
  top: 12px;
  right: -28px;
  background: var(--accent-gold);
  color: var(--bg-primary);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 32px;
  transform: rotate(45deg);
}

.plan-lock {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 6px;
}

.plan-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.plan-price {
  margin-bottom: 12px;
}

.price-currency {
  font-size: 16px;
  color: var(--accent-gold);
  vertical-align: top;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-gold);
}

.price-period {
  font-size: 14px;
  color: var(--text-muted);
}

.plan-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 14px 0;
  line-height: 1.5;
}

.plan-perks {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  text-align: left;
}

.plan-perks li {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.perk-check {
  color: var(--success);
  font-weight: 700;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@media (min-width: 480px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-content {
  background: var(--bg-card);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  animation: slideUp 0.3s ease;
}

@media (min-width: 480px) {
  .modal-content {
    border-radius: 16px;
  }
}

.modal-content.small {
  max-width: 380px;
}

.modal-content.medium {
  max-width: 480px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.modal-body {
  padding: 16px 20px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
  background: var(--bg-card);
}

.modal-footer button {
  flex: 1;
}

.current-budget {
  text-align: center;
  font-size: 14px;
  color: var(--accent-gold);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.sub-detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.sub-detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.sub-detail-info h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.sub-detail-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.sub-stat {
  text-align: center;
}

.sub-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.sub-stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.sub-detail-section {
  margin-bottom: 16px;
}

.sub-detail-section h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-primary);
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.pref-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(246, 173, 85, 0.15);
  color: var(--accent-gold);
  border-radius: 6px;
  font-weight: 500;
}

.pref-price,
.pref-rarity {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
}

.sub-boxes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-box-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.sub-box-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.sub-box-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
}

.sub-box-rating {
  font-size: 11px;
  color: var(--accent-gold);
  font-weight: 600;
}

.empty-text {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 12px;
}

.box-detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  color: white;
  margin-bottom: 16px;
}

.box-detail-icon {
  font-size: 36px;
}

.box-detail-header h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.box-detail-header p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.box-detail-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.box-rating {
  font-size: 13px;
  color: var(--accent-gold);
  font-weight: 600;
}

.box-detail-records {
  margin-bottom: 16px;
}

.box-detail-records h5 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: var(--text-primary);
}

.box-record-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 8px;
}

.box-record-info {
  flex: 1;
  min-width: 0;
}

.br-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.br-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.br-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.match-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.surprise-tag {
  font-size: 10px;
  color: var(--accent-gold);
}

.br-reason {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.3;
}

.box-record-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-gold);
  flex-shrink: 0;
}

.box-detail-financial {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.fin-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.fin-row.highlight {
  border-top: 1px solid var(--border);
  margin-top: 6px;
  padding-top: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.fin-row .profit {
  color: var(--success);
  font-size: 15px;
}

.box-feedback h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-primary);
}

.box-feedback p {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 0;
}

.complaint-detail {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.cd-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.cd-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.cd-header h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: var(--text-primary);
}

.cd-submitter {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.cd-desc {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  line-height: 1.5;
  margin: 0;
}

.complaint-actions-section {
  margin-top: 12px;
}

.action-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(246, 173, 85, 0.15);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.impact-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 12px;
}

.impact-preview p {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.impact-preview ul {
  margin: 0;
  padding-left: 16px;
}

.impact-preview li {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 2px 0;
  display: flex;
  gap: 8px;
}

.positive {
  color: var(--success);
}

.negative {
  color: var(--danger);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary.danger {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.btn-secondary.danger {
  color: var(--danger);
  border-color: rgba(245, 101, 101, 0.3);
}

.btn-secondary.danger:hover {
  background: rgba(245, 101, 101, 0.1);
  border-color: var(--danger);
  color: var(--danger);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .perf-grid {
    grid-template-columns: 1fr;
  }
  
  .sub-detail-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
