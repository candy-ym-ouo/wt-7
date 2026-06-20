<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { PresaleItem, PresaleOrder, Genre } from '@/types'
import { getItemStatusInfo, getPresaleStatusLabel, getThemeLabel, getThemeIcon } from '@/data/presale'
import VinylRecord from './VinylRecord.vue'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'events' | 'items' | 'orders' | 'settlements'>('events')
const showOrderModal = ref(false)
const selectedPresaleItem = ref<PresaleItem | null>(null)
const orderQuantity = ref(1)
const orderMessage = ref('')
const showOrderDetail = ref(false)
const selectedOrder = ref<PresaleOrder | null>(null)

const genreEmoji: { [K in Genre]: string } = {
  Jazz: '🎷', Rock: '🎸', Soul: '🎤', Funk: '🕺', Disco: '💃',
  Classical: '🎻', Blues: '🎹', Pop: '🎵', Electronic: '🎧', Folk: '🪕'
}

const activeEventPages = computed(() => {
  return gameStore.presaleEventPages.filter(p => p.isActive && gameStore.currentDay <= p.endDate)
})

const pendingOrders = computed(() => {
  return gameStore.presaleOrders.filter(o =>
    o.status === 'pending' || o.status === 'confirmed' || o.status === 'paid' || o.status === 'locked'
  )
})

const completedOrders = computed(() => {
  return gameStore.presaleOrders.filter(o => o.status === 'delivered')
})

const cancelledOrders = computed(() => {
  return gameStore.presaleOrders.filter(o => o.status === 'cancelled' || o.status === 'refunded')
})

const stockPercentage = (item: PresaleItem) => {
  if (item.config.totalStock === 0) return 0
  return Math.round((item.soldCount / item.config.totalStock) * 100)
}

const earlyBirdRemaining = (item: PresaleItem) => {
  const earlyBirdThreshold = Math.ceil(item.config.totalStock * 0.3)
  return Math.max(0, earlyBirdThreshold - item.soldCount)
}

const openOrderModal = (item: PresaleItem) => {
  selectedPresaleItem.value = item
  orderQuantity.value = 1
  orderMessage.value = ''
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedPresaleItem.value = null
  orderMessage.value = ''
}

const handlePlaceOrder = () => {
  if (!selectedPresaleItem.value) return
  const item = selectedPresaleItem.value
  const recs = gameStore.getPresaleRecommendations({
    favoriteGenres: item.record.genre ? [item.record.genre] : [],
    preferredRarity: [item.record.rarity],
    priceRange: [item.config.presalePrice * 0.5, item.config.presalePrice * 2]
  })
  const matchScore = recs.length > 0 ? recs[0].score : 50
  const reason = recs.length > 0 ? recs[0].reason : '预售商品推荐'

  const result = gameStore.placePresaleOrder(
    item.id, 'player', '我', '🧑', null,
    orderQuantity.value, matchScore, reason
  )
  orderMessage.value = result.message
  if (result.success) {
    setTimeout(() => closeOrderModal(), 1500)
  }
}

const handleConfirmOrder = (orderId: string) => {
  const result = gameStore.confirmPresaleOrderAction(orderId)
  orderMessage.value = result.message
}

const handlePayOrder = (orderId: string) => {
  const result = gameStore.payPresaleOrderAction(orderId)
  orderMessage.value = result.message
}

const handleCancelOrder = (orderId: string) => {
  const result = gameStore.cancelPresaleOrderAction(orderId)
  orderMessage.value = result.message
}

const handleSettleDeliveries = () => {
  gameStore.settlePresaleDeliveries()
}

const openOrderDetail = (order: PresaleOrder) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
}
</script>

<template>
  <div class="presale-view">
    <div class="presale-header">
      <button class="back-btn" @click="emit('close')">← 返回</button>
      <h2 class="view-title">🏪 线上预售商城</h2>
      <div class="header-stats">
        <span class="hs-item">
          <span class="hs-icon">📦</span>
          <span>{{ gameStore.activePresaleItems.length }} 件在售</span>
        </span>
        <span class="hs-item">
          <span class="hs-icon">📋</span>
          <span>{{ gameStore.presaleToFulfillCount }} 待履约</span>
        </span>
        <span class="hs-item">
          <span class="hs-icon">💰</span>
          <span>定金 ¥{{ gameStore.presaleTotalDeposits }}</span>
        </span>
      </div>
    </div>

    <div v-if="gameStore.presaleStats.totalRevenue > 0" class="presale-stats-card card">
      <div class="ps-header">
        <span class="ps-icon">📊</span>
        <span class="ps-title">预售经营数据</span>
      </div>
      <div class="ps-grid">
        <div class="ps-item">
          <span class="psi-label">累计营收</span>
          <span class="psi-value revenue">¥{{ gameStore.presaleTotalRevenue }}</span>
        </div>
        <div class="ps-item">
          <span class="psi-label">总订单</span>
          <span class="psi-value">{{ gameStore.presaleStats.totalOrders }}</span>
        </div>
        <div class="ps-item">
          <span class="psi-label">已结算</span>
          <span class="psi-value">{{ gameStore.presaleStats.totalSettled }}</span>
        </div>
        <div class="ps-item">
          <span class="psi-label">平均匹配度</span>
          <span class="psi-value">{{ gameStore.presaleStats.avgMatchScore }}%</span>
        </div>
        <div class="ps-item">
          <span class="psi-label">早鸟订单</span>
          <span class="psi-value">{{ gameStore.presaleStats.earlyBirdCount }}</span>
        </div>
        <div class="ps-item">
          <span class="psi-label">取消订单</span>
          <span class="psi-value" :class="{ danger: gameStore.presaleStats.cancellationCount > 0 }">{{ gameStore.presaleStats.cancellationCount }}</span>
        </div>
      </div>
    </div>

    <div class="view-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'events' }" @click="activeTab = 'events'">🎪 活动页</button>
      <button class="tab-btn" :class="{ active: activeTab === 'items' }" @click="activeTab = 'items'">📦 预售商品</button>
      <button class="tab-btn" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">📋 我的订单</button>
      <button class="tab-btn" :class="{ active: activeTab === 'settlements' }" @click="activeTab = 'settlements'">💰 结算</button>
    </div>

    <div v-show="activeTab === 'events'" class="events-section">
      <div v-if="activeEventPages.length > 0" class="event-pages-list">
        <div v-for="page in activeEventPages" :key="page.id" class="event-page-card card" :style="{ borderColor: page.themeColor + '50' }">
          <div class="epc-banner" :style="{ background: `linear-gradient(135deg, ${page.themeColor}20 0%, ${page.themeColor}08 100%)` }">
            <span class="epc-banner-icon">{{ page.bannerIcon }}</span>
            <div class="epc-banner-info">
              <h3 class="epc-title" :style="{ color: page.themeColor }">{{ page.title }}</h3>
              <p class="epc-subtitle">{{ page.subtitle }}</p>
            </div>
            <span class="epc-theme-badge" :style="{ background: page.themeColor + '20', color: page.themeColor }">
              {{ getThemeIcon(page.theme) }} {{ getThemeLabel(page.theme) }}
            </span>
          </div>
          <p class="epc-desc">{{ page.description }}</p>
          <div class="epc-meta">
            <span class="epc-tagline">{{ page.bonusTagline }}</span>
            <span class="epc-period">第{{ page.startDate }}-{{ page.endDate }}天</span>
            <span class="epc-count">{{ page.itemIds.length }} 件商品</span>
          </div>
          <div class="epc-items">
            <div v-for="itemId in page.itemIds" :key="itemId" class="epc-item-preview">
              <template v-if="gameStore.presaleItems.find(i => i.id === itemId)">
                <VinylRecord :record="(gameStore.presaleItems.find(i => i.id === itemId))!.record" size="small" />
                <span class="epc-item-title">{{ (gameStore.presaleItems.find(i => i.id === itemId))!.record.title }}</span>
                <span class="epc-item-price">¥{{ (gameStore.presaleItems.find(i => i.id === itemId))!.config.presalePrice }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state card">
        <span class="empty-icon">🎪</span>
        <p class="empty-text">暂无活动页面</p>
      </div>
    </div>

    <div v-show="activeTab === 'items'" class="items-section">
      <div v-if="gameStore.activePresaleItems.length > 0" class="presale-items-list">
        <div v-for="item in gameStore.activePresaleItems" :key="item.id" class="presale-item-card card">
          <div class="pic-header">
            <VinylRecord :record="item.record" size="medium" />
            <div class="pic-info">
              <div class="pic-title-row">
                <h4 class="pic-title">{{ item.record.title }}</h4>
                <span v-if="item.config.isLimited" class="pic-badge limited">限量</span>
                <span v-if="item.config.isExclusive" class="pic-badge exclusive">独家</span>
              </div>
              <p class="pic-artist">{{ item.record.artist }}</p>
              <div class="pic-meta">
                <span class="pic-genre">{{ genreEmoji[item.record.genre] }} {{ item.record.genre }}</span>
                <span class="pic-year">{{ item.record.year }}</span>
                <span class="pic-rarity">{{ item.record.rarity }}★</span>
              </div>
            </div>
          </div>

          <div class="pic-pricing">
            <div class="pic-price-main">
              <span class="pic-price-label">预售价</span>
              <span class="pic-price-value">¥{{ item.config.presalePrice }}</span>
              <span class="pic-price-original">零售 ¥{{ item.config.retailPrice }}</span>
            </div>
            <div v-if="earlyBirdRemaining(item) > 0" class="pic-early-bird">
              <span class="peb-icon">🐦</span>
              <span class="peb-text">早鸟优惠 -{{ Math.round(item.config.earlyBirdDiscount * 100) }}%</span>
              <span class="peb-remaining">剩余 {{ earlyBirdRemaining(item) }} 名</span>
            </div>
          </div>

          <div class="pic-stock">
            <div class="pic-stock-header">
              <span class="pis-label">库存进度</span>
              <span class="pis-count">{{ item.soldCount }}/{{ item.config.totalStock }}</span>
            </div>
            <div class="pic-stock-bar">
              <div class="pic-stock-fill" :style="{ width: stockPercentage(item) + '%' }" :class="{ low: stockPercentage(item) >= 80, mid: stockPercentage(item) >= 50 && stockPercentage(item) < 80 }"></div>
            </div>
            <span v-if="item.availableStock <= 2" class="pic-stock-warning">⚠️ 仅剩 {{ item.availableStock }} 张</span>
          </div>

          <div class="pic-details">
            <div class="pic-detail">
              <span class="pid-label">定金比例</span>
              <span class="pid-value">{{ Math.round(item.config.depositRate * 100) }}%</span>
            </div>
            <div class="pic-detail">
              <span class="pid-label">每人限购</span>
              <span class="pid-value">{{ item.config.maxPerCustomer }} 张</span>
            </div>
            <div class="pic-detail">
              <span class="pid-label">预售期</span>
              <span class="pid-value">第{{ item.config.startDate }}-{{ item.config.endDate }}天</span>
            </div>
            <div class="pic-detail">
              <span class="pid-label">预计发货</span>
              <span class="pid-value">第{{ item.config.expectedShipDate }}天</span>
            </div>
          </div>

          <p v-if="item.config.bonusDescription" class="pic-bonus">🎁 {{ item.config.bonusDescription }}</p>

          <div class="pic-status-row">
            <span class="pic-status" :style="{ color: getItemStatusInfo(item.status).color }">
              {{ getItemStatusInfo(item.status).icon }} {{ getItemStatusInfo(item.status).label }}
            </span>
            <button
              class="btn-primary pic-order-btn"
              :disabled="item.availableStock <= 0"
              @click="openOrderModal(item)"
            >
              {{ item.availableStock <= 0 ? '已售罄' : '立即预订' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state card">
        <span class="empty-icon">📦</span>
        <p class="empty-text">暂无在售预售商品</p>
        <button class="btn-secondary" @click="gameStore.refreshPresaleItems()">刷新预售</button>
      </div>
    </div>

    <div v-show="activeTab === 'orders'" class="orders-section">
      <div v-if="pendingOrders.length > 0" class="orders-group">
        <h3 class="og-title">⏳ 待处理订单 ({{ pendingOrders.length }})</h3>
        <div class="orders-list">
          <div v-for="order in pendingOrders" :key="order.id" class="order-card card" @click="openOrderDetail(order)">
            <div class="oc-header">
              <span class="oc-title">{{ order.recordTitle }}</span>
              <span class="oc-status" :style="{ color: getPresaleStatusLabel(order.status).color, background: getPresaleStatusLabel(order.status).color + '15' }">
                {{ getPresaleStatusLabel(order.status).icon }} {{ getPresaleStatusLabel(order.status).label }}
              </span>
            </div>
            <div class="oc-body">
              <div class="oc-info">
                <span>数量: {{ order.quantity }}</span>
                <span>总价: ¥{{ order.totalPrice }}</span>
                <span>定金: ¥{{ order.depositAmount }}</span>
                <span>尾款: ¥{{ order.remainingAmount }}</span>
              </div>
              <div v-if="order.isEarlyBird" class="oc-early-bird">🐦 早鸟优惠</div>
              <div class="oc-match">匹配度 {{ Math.round(order.preferenceMatchScore) }}%</div>
            </div>
            <div class="oc-actions">
              <button v-if="order.status === 'pending'" class="btn-primary oc-btn" @click.stop="handleConfirmOrder(order.id)">确认订单</button>
              <button v-if="order.status === 'confirmed'" class="btn-primary oc-btn" @click.stop="handlePayOrder(order.id)">支付定金 ¥{{ order.depositAmount }}</button>
              <button v-if="order.status === 'pending' || order.status === 'confirmed'" class="btn-secondary oc-btn" @click.stop="handleCancelOrder(order.id)">取消</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="completedOrders.length > 0" class="orders-group">
        <h3 class="og-title completed">✅ 已完成订单 ({{ completedOrders.length }})</h3>
        <div class="orders-list">
          <div v-for="order in completedOrders" :key="order.id" class="order-card card completed">
            <div class="oc-header">
              <span class="oc-title">{{ order.recordTitle }}</span>
              <span class="oc-status" style="color: #38b2ac; background: rgba(56, 178, 172, 0.15)">📦 已交付</span>
            </div>
            <div class="oc-body">
              <div class="oc-info">
                <span>数量: {{ order.quantity }}</span>
                <span>总价: ¥{{ order.totalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cancelledOrders.length > 0" class="orders-group">
        <h3 class="og-title cancelled">❌ 已取消订单 ({{ cancelledOrders.length }})</h3>
        <div class="orders-list">
          <div v-for="order in cancelledOrders" :key="order.id" class="order-card card cancelled">
            <div class="oc-header">
              <span class="oc-title">{{ order.recordTitle }}</span>
              <span class="oc-status" style="color: #f56565; background: rgba(245, 101, 101, 0.15)">❌ 已取消</span>
            </div>
            <div class="oc-body">
              <div class="oc-info">
                <span>数量: {{ order.quantity }}</span>
                <span>退款: ¥{{ order.depositAmount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="gameStore.presaleOrders.length === 0" class="empty-state card">
        <span class="empty-icon">📋</span>
        <p class="empty-text">暂无预售订单</p>
      </div>
    </div>

    <div v-show="activeTab === 'settlements'" class="settlements-section">
      <div v-if="gameStore.presaleToFulfillCount > 0" class="settle-action card">
        <div class="sa-info">
          <span class="sa-icon">🚚</span>
          <div>
            <h4 class="sa-title">有待交付的预售订单</h4>
            <p class="sa-desc">{{ gameStore.presaleToFulfillCount }} 笔订单等待结算</p>
          </div>
        </div>
        <button class="btn-primary" @click="handleSettleDeliveries">批量结算</button>
      </div>

      <div v-if="gameStore.presaleSettlements.length > 0" class="settlements-list">
        <h3 class="sl-title">💰 结算记录</h3>
        <div v-for="s in gameStore.presaleSettlements" :key="s.id" class="settlement-card card">
          <div class="sc-header">
            <span class="sc-title">{{ s.recordTitle }}</span>
            <span class="sc-customer">{{ s.customerName }}</span>
          </div>
          <div class="sc-grid">
            <div class="sc-item">
              <span class="sci-label">成交价</span>
              <span class="sci-value">¥{{ s.finalPrice }}</span>
            </div>
            <div class="sc-item">
              <span class="sci-label">定金抵扣</span>
              <span class="sci-value">¥{{ s.depositUsed }}</span>
            </div>
            <div class="sc-item">
              <span class="sci-label">尾款收取</span>
              <span class="sci-value">¥{{ s.remainingPaid }}</span>
            </div>
            <div class="sc-item">
              <span class="sci-label">平台费</span>
              <span class="sci-value cost">-¥{{ s.platformFee }}</span>
            </div>
            <div class="sc-item highlight">
              <span class="sci-label">净收入</span>
              <span class="sci-value revenue">+¥{{ s.netRevenue }}</span>
            </div>
            <div class="sc-item">
              <span class="sci-label">满意度</span>
              <span class="sci-value">{{ s.satisfaction }}%</span>
            </div>
            <div class="sc-item">
              <span class="sci-label">声望影响</span>
              <span class="sci-value" :class="{ positive: s.reputationImpact > 0, negative: s.reputationImpact < 0 }">
                {{ s.reputationImpact > 0 ? '+' : '' }}{{ s.reputationImpact }}
              </span>
            </div>
            <div class="sc-item">
              <span class="sci-label">结算日</span>
              <span class="sci-value">第{{ s.settledDay }}天</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state card">
        <span class="empty-icon">💰</span>
        <p class="empty-text">暂无结算记录</p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showOrderModal && selectedPresaleItem" class="modal-overlay" @click.self="closeOrderModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>预售预订</h3>
            <button class="close-btn" @click="closeOrderModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="order-record-info">
              <VinylRecord :record="selectedPresaleItem.record" size="medium" />
              <div class="ori-detail">
                <h4>{{ selectedPresaleItem.record.title }}</h4>
                <p>{{ selectedPresaleItem.record.artist }}</p>
                <span>{{ genreEmoji[selectedPresaleItem.record.genre] }} {{ selectedPresaleItem.record.genre }} · {{ selectedPresaleItem.record.rarity }}★</span>
              </div>
            </div>

            <div v-if="earlyBirdRemaining(selectedPresaleItem) > 0" class="early-bird-banner">
              🐦 早鸟优惠 -{{ Math.round(selectedPresaleItem.config.earlyBirdDiscount * 100) }}%
              <span class="ebb-remaining">剩余 {{ earlyBirdRemaining(selectedPresaleItem) }} 名</span>
            </div>

            <div class="order-pricing-detail">
              <div class="opd-row">
                <span>预售价</span>
                <span>¥{{ selectedPresaleItem.config.presalePrice }}</span>
              </div>
              <div class="opd-row">
                <span>零售价</span>
                <span class="opd-original">¥{{ selectedPresaleItem.config.retailPrice }}</span>
              </div>
              <div class="opd-row">
                <span>定金 ({{ Math.round(selectedPresaleItem.config.depositRate * 100) }}%)</span>
                <span>¥{{ Math.round(selectedPresaleItem.config.presalePrice * selectedPresaleItem.config.depositRate * orderQuantity) }}</span>
              </div>
              <div class="opd-row">
                <span>尾款</span>
                <span>¥{{ selectedPresaleItem.config.presalePrice * orderQuantity - Math.round(selectedPresaleItem.config.presalePrice * selectedPresaleItem.config.depositRate * orderQuantity) }}</span>
              </div>
            </div>

            <div class="quantity-selector">
              <span class="qty-label">购买数量</span>
              <div class="qty-controls">
                <button class="qty-btn" @click="orderQuantity = Math.max(1, orderQuantity - 1)">-</button>
                <span class="qty-value">{{ orderQuantity }}</span>
                <button class="qty-btn" :disabled="orderQuantity >= Math.min(selectedPresaleItem.config.maxPerCustomer, selectedPresaleItem.availableStock)" @click="orderQuantity += 1">+</button>
              </div>
              <span class="qty-hint">限购 {{ selectedPresaleItem.config.maxPerCustomer }} 张，库存 {{ selectedPresaleItem.availableStock }} 张</span>
            </div>

            <div class="total-row">
              <span class="total-label">总计</span>
              <span class="total-value">¥{{ selectedPresaleItem.config.presalePrice * orderQuantity }}</span>
            </div>

            <p v-if="selectedPresaleItem.config.bonusDescription" class="order-bonus">🎁 {{ selectedPresaleItem.config.bonusDescription }}</p>

            <p v-if="orderMessage" class="message" :class="{ success: orderMessage.includes('成功'), error: orderMessage.includes('不足') || orderMessage.includes('无法') }">
              {{ orderMessage }}
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeOrderModal">取消</button>
            <button class="btn-primary" :disabled="selectedPresaleItem.availableStock <= 0 || orderQuantity > selectedPresaleItem.availableStock" @click="handlePlaceOrder">
              确认预订
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showOrderDetail && selectedOrder" class="modal-overlay" @click.self="closeOrderDetail">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>订单详情</h3>
            <button class="close-btn" @click="closeOrderDetail">✕</button>
          </div>
          <div class="modal-body">
            <div class="od-status-row" :style="{ color: getPresaleStatusLabel(selectedOrder.status).color }">
              {{ getPresaleStatusLabel(selectedOrder.status).icon }} {{ getPresaleStatusLabel(selectedOrder.status).label }}
            </div>
            <div class="od-info-grid">
              <div class="od-item"><span class="odi-label">商品</span><span class="odi-value">{{ selectedOrder.recordTitle }}</span></div>
              <div class="od-item"><span class="odi-label">数量</span><span class="odi-value">{{ selectedOrder.quantity }}</span></div>
              <div class="od-item"><span class="odi-label">单价</span><span class="odi-value">¥{{ selectedOrder.unitPrice }}</span></div>
              <div class="od-item"><span class="odi-label">总价</span><span class="odi-value">¥{{ selectedOrder.totalPrice }}</span></div>
              <div class="od-item"><span class="odi-label">定金</span><span class="odi-value">¥{{ selectedOrder.depositAmount }}</span></div>
              <div class="od-item"><span class="odi-label">尾款</span><span class="odi-value">¥{{ selectedOrder.remainingAmount }}</span></div>
              <div v-if="selectedOrder.isEarlyBird" class="od-item"><span class="odi-label">优惠</span><span class="odi-value early-bird">早鸟 -{{ Math.round(selectedOrder.discountRate * 100) }}%</span></div>
              <div class="od-item"><span class="odi-label">匹配度</span><span class="odi-value">{{ Math.round(selectedOrder.preferenceMatchScore) }}%</span></div>
              <div class="od-item"><span class="odi-label">下单日</span><span class="odi-value">第{{ selectedOrder.orderDate }}天</span></div>
            </div>
            <p v-if="selectedOrder.recommendedReason" class="od-reason">💡 {{ selectedOrder.recommendedReason }}</p>
            <p v-if="selectedOrder.note" class="od-note">{{ selectedOrder.note }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeOrderDetail">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.presale-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: 80px;
}

.presale-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.view-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.hs-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.hs-icon {
  font-size: 14px;
}

.presale-stats-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(159, 122, 234, 0.08) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.ps-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ps-icon {
  font-size: 18px;
}

.ps-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.psi-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.psi-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.psi-value.revenue {
  color: var(--success);
}

.psi-value.danger {
  color: var(--danger);
}

.view-tabs {
  display: flex;
  gap: 6px;
}

.tab-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-muted);
  transition: all 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.event-pages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-page-card {
  overflow: hidden;
}

.epc-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  margin: -12px -12px 12px;
}

.epc-banner-icon {
  font-size: 36px;
}

.epc-banner-info {
  flex: 1;
}

.epc-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.epc-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.epc-theme-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.epc-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
}

.epc-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
}

.epc-tagline {
  padding: 3px 8px;
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border-radius: 8px;
  font-weight: 600;
}

.epc-period {
  color: var(--text-muted);
}

.epc-count {
  color: var(--accent-orange);
  font-weight: 600;
}

.epc-items {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.epc-item-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.epc-item-title {
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 72px;
}

.epc-item-price {
  font-size: 11px;
  color: var(--accent-orange);
  font-weight: 700;
}

.presale-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.presale-item-card {
  padding: 16px;
}

.pic-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.pic-info {
  flex: 1;
  min-width: 0;
}

.pic-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.pic-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pic-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.pic-badge.limited {
  background: rgba(233, 69, 96, 0.15);
  color: #e94560;
}

.pic-badge.exclusive {
  background: rgba(246, 224, 94, 0.2);
  color: #d69e2e;
}

.pic-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.pic-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.pic-rarity {
  font-weight: 600;
}

.pic-pricing {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.pic-price-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pic-price-label {
  font-size: 11px;
  color: var(--text-muted);
}

.pic-price-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-gold);
}

.pic-price-original {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: line-through;
}

.pic-early-bird {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.25);
  border-radius: 8px;
}

.peb-icon {
  font-size: 16px;
}

.peb-text {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
}

.peb-remaining {
  font-size: 11px;
  color: var(--accent-orange);
  font-weight: 600;
}

.pic-stock {
  margin-bottom: 12px;
}

.pic-stock-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.pis-label {
  font-size: 11px;
  color: var(--text-muted);
}

.pis-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.pic-stock-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.pic-stock-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--success), #38b2ac);
  transition: width 0.3s;
}

.pic-stock-fill.mid {
  background: linear-gradient(90deg, var(--accent-orange), #dd6b20);
}

.pic-stock-fill.low {
  background: linear-gradient(90deg, var(--danger), #c53030);
}

.pic-stock-warning {
  font-size: 10px;
  color: var(--danger);
  font-weight: 600;
  margin-top: 4px;
}

.pic-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.pic-detail {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.pid-label {
  font-size: 11px;
  color: var(--text-muted);
}

.pid-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.pic-bonus {
  font-size: 12px;
  color: var(--accent-gold);
  padding: 8px 10px;
  background: rgba(246, 224, 94, 0.1);
  border-radius: 6px;
  margin-bottom: 12px;
}

.pic-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pic-status {
  font-size: 12px;
  font-weight: 600;
}

.pic-order-btn {
  padding: 8px 20px;
}

.orders-group {
  margin-bottom: 16px;
}

.og-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.og-title.completed {
  color: var(--success);
}

.og-title.cancelled {
  color: var(--danger);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-card {
  cursor: pointer;
  transition: all 0.2s;
}

.order-card.completed {
  opacity: 0.8;
}

.order-card.cancelled {
  opacity: 0.6;
}

.oc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.oc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.oc-status {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.oc-body {
  margin-bottom: 10px;
}

.oc-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.oc-early-bird {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 6px;
}

.oc-match {
  font-size: 11px;
  color: var(--accent-orange);
  margin-top: 4px;
}

.oc-actions {
  display: flex;
  gap: 8px;
}

.oc-btn {
  padding: 6px 16px;
  font-size: 12px;
}

.settle-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
  margin-bottom: 16px;
}

.sa-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-icon {
  font-size: 28px;
}

.sa-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.sa-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.sl-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.settlements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settlement-card {
  padding: 14px;
}

.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sc-customer {
  font-size: 12px;
  color: var(--text-secondary);
}

.sc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.sc-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.sc-item.highlight {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.2);
  grid-column: span 2;
}

.sci-label {
  font-size: 11px;
  color: var(--text-muted);
}

.sci-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.sci-value.cost {
  color: var(--danger);
}

.sci-value.revenue {
  color: var(--success);
  font-size: 14px;
}

.sci-value.positive {
  color: var(--success);
}

.sci-value.negative {
  color: var(--danger);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
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
  gap: 14px;
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

.order-record-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.ori-detail {
  flex: 1;
}

.ori-detail h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.ori-detail p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.ori-detail span {
  font-size: 11px;
  color: var(--text-muted);
}

.early-bird-banner {
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.15), rgba(56, 178, 172, 0.15));
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
}

.ebb-remaining {
  margin-left: 8px;
  font-size: 11px;
  color: var(--accent-orange);
}

.order-pricing-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.opd-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
}

.opd-original {
  text-decoration: line-through;
  color: var(--text-muted);
}

.quantity-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.qty-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.qty-btn:disabled {
  opacity: 0.5;
}

.qty-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.qty-hint {
  font-size: 11px;
  color: var(--text-muted);
  width: 100%;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(233, 69, 96, 0.1);
  border-radius: 8px;
}

.total-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.total-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-gold);
}

.order-bonus {
  font-size: 12px;
  color: var(--accent-gold);
  padding: 8px 10px;
  background: rgba(246, 224, 94, 0.1);
  border-radius: 6px;
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

.od-status-row {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  padding: 12px;
}

.od-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.od-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.odi-label {
  font-size: 12px;
  color: var(--text-muted);
}

.odi-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.odi-value.early-bird {
  color: var(--success);
}

.od-reason {
  font-size: 12px;
  color: var(--accent-orange);
  padding: 8px 10px;
  background: rgba(237, 137, 54, 0.1);
  border-radius: 6px;
}

.od-note {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}
</style>
