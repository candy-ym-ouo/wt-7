<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import RecordCard from './RecordCard.vue'
import type { Record, SupplierInventoryItem, Genre, SupplierContractTier } from '@/types'
import { ref, computed } from 'vue'
import { getConditionColor, getConditionScoreFromLabel } from '@/data/condition'
import { 
  getSupplierName, 
  getSupplierTypeColor, 
  getRiskLabel, 
  getRiskColor,
  getPerformanceLabel,
  getPerformanceColor
} from '@/data/suppliers'
import {
  getHeatLabel,
  getHeatIcon,
  getHeatColor,
  getTrendIcon,
  getTrendLabel,
  getHeatLevelInfo,
  formatHeatValue
} from '@/data/marketHeat'
import type { MarketHeatLevel } from '@/types'
import {
  getContractTierConfig,
  getTierColor,
  getTierBgColor,
  getNextContractTier
} from '@/data/supplierRelationship'
import type { SupplierRelationshipBonusSummary } from '@/types'

const gameStore = useGameStore()
const selectedRecord = ref<Record | null>(null)
const selectedSupplierItem = ref<SupplierInventoryItem | null>(null)
const quantity = ref(1)
const message = ref('')
const showSupplierInfo = ref(false)
const activeTab = ref<'suppliers' | 'inventory'>('suppliers')

const currentSupplier = computed(() => gameStore.currentSupplier)
const supplierInventory = computed(() => gameStore.currentSupplierInventory)
const availableSuppliers = computed(() => gameStore.availableSuppliers)
const inventoryRiskScore = computed(() => gameStore.inventoryRiskScore)
const purchaseRecommendations = computed(() => gameStore.purchaseRecommendations)
const hottestGenresToday = computed(() => gameStore.hottestGenresToday)
const coldestGenresToday = computed(() => gameStore.coldestGenresToday)

const getSupplierStats = (supplierId: string) => {
  return gameStore.supplierStats(supplierId)
}

const getRecordPerformance = (recordId: string) => {
  return gameStore.recordPerformances.find(p => p.recordId === recordId)
}

const getRecommendationForRecord = (recordId: string) => {
  return purchaseRecommendations.value.find(r => r.recordId === recordId)
}

const selectSupplier = (supplierId: string) => {
  gameStore.selectSupplier(supplierId)
}

const refreshInventory = () => {
  gameStore.refreshSupplierInventory()
}

const openPurchaseModal = (supplierItem: SupplierInventoryItem) => {
  selectedSupplierItem.value = supplierItem
  selectedRecord.value = supplierItem.record
  quantity.value = 1
  message.value = ''
}

const closeModal = () => {
  selectedRecord.value = null
  selectedSupplierItem.value = null
  message.value = ''
}

const handlePurchase = () => {
  if (!selectedSupplierItem.value) return
  
  const result = gameStore.purchaseFromSupplier(selectedSupplierItem.value, quantity.value)
  message.value = result.message
  
  if (result.success) {
    setTimeout(() => {
      closeModal()
    }, 1500)
  }
}

const changeQuantity = (delta: number) => {
  const newQty = quantity.value + delta
  const maxQty = selectedSupplierItem.value?.quantityAvailable || 10
  if (newQty >= 1 && newQty <= Math.min(10, maxQty)) {
    quantity.value = newQty
  }
}

const goToNextPhase = () => {
  gameStore.advancePhase()
}

const formatPercent = (value: number) => {
  return Math.round(value * 100) + '%'
}

const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
  const icons = { low: '✅', medium: '⚠️', high: '🚨' }
  return icons[risk]
}

const getMarketHeatInfo = (level: MarketHeatLevel) => getHeatLevelInfo(level)

const shouldShowHeatBadge = (heat: MarketHeatLevel) => {
  return heat !== 'normal'
}

const formatPriceModifier = (mod: number) => {
  const pct = Math.round((mod - 1) * 100)
  if (pct > 0) return `+${pct}%`
  if (pct < 0) return `${pct}%`
  return '持平'
}

const nextDayReservations = computed(() => {
  const nextDay = gameStore.currentDay + 1
  return gameStore.reservations.filter(r => r.targetDay === nextDay && (r.status === 'pending' || r.status === 'confirmed'))
})

const nextDayRequiredRecords = computed(() => {
  const recordMap = new Map<string, { count: number; title: string; genre: Genre; marketPrice: number }>()
  for (const r of nextDayReservations.value) {
    for (const item of r.items) {
      if (!item.isFulfilled) {
        const existing = recordMap.get(item.recordId)
        if (existing) {
          existing.count += item.quantity
        } else {
          const rec = gameStore.getRecordById(item.recordId)
          recordMap.set(item.recordId, {
            count: item.quantity,
            title: item.recordTitle,
            genre: item.genre,
            marketPrice: rec?.marketPrice || 300
          })
        }
      }
    }
  }
  return Array.from(recordMap.entries()).map(([id, data]) => ({ id, ...data }))
})

const nextDayRequiredGenres = computed(() => {
  const genreMap = new Map<Genre, number>()
  for (const item of nextDayRequiredRecords.value) {
    const existing = genreMap.get(item.genre) || 0
    genreMap.set(item.genre, existing + item.count)
  }
  return Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
})

const nextDayReservationEstimatedRevenue = computed(() => {
  return nextDayRequiredRecords.value.reduce((sum, item) => sum + item.marketPrice * item.count, 0)
})

const nextDayReservationDeposit = computed(() => {
  return nextDayReservations.value.reduce((sum, r) => sum + r.deposit, 0)
})

const isRecordInInventory = (recordId: string) => {
  return gameStore.inventory.some(i => i.record.id === recordId)
}

const getInventoryStock = (recordId: string) => {
  const item = gameStore.inventory.find(i => i.record.id === recordId)
  return item ? item.quantity : 0
}

const genreEmoji: { [key in Genre]: string } = {
  Jazz: '🎷',
  Rock: '🎸',
  Soul: '🎤',
  Funk: '🕺',
  Disco: '💃',
  Classical: '🎻',
  Blues: '🎹',
  Pop: '🎵',
  Electronic: '🎧',
  Folk: '🪕'
}

const currentSupplierRel = computed(() => {
  if (!gameStore.currentSupplierId) return null
  return gameStore.getSupplierRelationship(gameStore.currentSupplierId)
})

const currentRelBonus = computed<SupplierRelationshipBonusSummary | null>(() => {
  if (!currentSupplierRel.value) return null
  return gameStore.getSupplierBonusSummaryFor(gameStore.currentSupplierId!)
})

const currentRelTierConfig = computed(() => {
  if (!currentSupplierRel.value) return null
  return getContractTierConfig(currentSupplierRel.value.contractTier)
})

const nextRelTier = computed(() => {
  if (!currentSupplierRel.value) return null
  return getNextContractTier(currentSupplierRel.value.contractTier)
})

const canSignNextTier = computed(() => {
  if (!currentSupplierRel.value || !nextRelTier.value) return false
  return currentSupplierRel.value.trustPoints >= nextRelTier.value.minTrustPoints
})

const handleSignContract = (targetTier: SupplierContractTier) => {
  if (!gameStore.currentSupplierId) return
  const result = gameStore.signSupplierContract(gameStore.currentSupplierId, targetTier)
  message.value = result.message
}

const currentSupplierExclusiveSupplies = computed(() => {
  if (!gameStore.currentSupplierId) return []
  return gameStore.getSupplierExclusiveSupplies(gameStore.currentSupplierId)
})

const currentSupplierMilestones = computed(() => {
  if (!gameStore.currentSupplierId) return []
  return gameStore.getSupplierMilestones(gameStore.currentSupplierId)
})
</script>

<template>
  <div class="purchase-view">
    <div class="inventory-summary card">
      <div class="summary-row">
        <span class="summary-label">当前库存</span>
        <span class="summary-value">{{ gameStore.inventory.reduce((sum, i) => sum + i.quantity, 0) }} 张</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">剩余预算</span>
        <span class="summary-value budget">¥{{ gameStore.budget }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">库存风险</span>
        <span 
          class="summary-value"
          :style="{ color: inventoryRiskScore > 0.6 ? '#f56565' : inventoryRiskScore > 0.4 ? '#ed8936' : '#48bb78' }"
        >
          {{ Math.round(inventoryRiskScore * 100) }}%
        </span>
      </div>
    </div>

    <div v-if="hottestGenresToday.length > 0 || coldestGenresToday.length > 0" class="market-heat-card card">
      <div class="heat-header">
        <span class="heat-icon">📊</span>
        <span class="heat-title">今日市场热度</span>
      </div>
      <div class="heat-content">
        <div v-if="hottestGenresToday.length > 0" class="heat-section">
          <span class="heat-section-label hot">🔥 热门</span>
          <div class="heat-tags">
            <span 
              v-for="gh in hottestGenresToday" 
              :key="gh.genre" 
              class="heat-tag"
              :style="{ background: getHeatColor(gh.heatLevel) + '25', color: getHeatColor(gh.heatLevel), borderColor: getHeatColor(gh.heatLevel) + '60' }"
            >
              {{ getHeatIcon(gh.heatLevel) }} {{ gh.genre }}
              <span class="heat-trend">{{ getTrendIcon(gh.trend) }}</span>
            </span>
          </div>
        </div>
        <div v-if="coldestGenresToday.length > 0" class="heat-section">
          <span class="heat-section-label cold">🧊 冷门</span>
          <div class="heat-tags">
            <span 
              v-for="gh in coldestGenresToday" 
              :key="gh.genre" 
              class="heat-tag"
              :style="{ background: getHeatColor(gh.heatLevel) + '25', color: getHeatColor(gh.heatLevel), borderColor: getHeatColor(gh.heatLevel) + '60' }"
            >
              {{ getHeatIcon(gh.heatLevel) }} {{ gh.genre }}
              <span class="heat-trend">{{ getTrendIcon(gh.trend) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="purchaseRecommendations.length > 0" class="recommendations-card card">
      <div class="rec-header">
        <span class="rec-icon">💡</span>
        <span class="rec-title">智能进货建议</span>
      </div>
      <div class="rec-list">
        <div 
          v-for="(rec, idx) in purchaseRecommendations.slice(0, 3)" 
          :key="idx"
          class="rec-item"
          :class="rec.priority"
        >
          <span class="rec-priority">{{ rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢' }}</span>
          <span class="rec-text">{{ rec.reason }}</span>
        </div>
      </div>
    </div>

    <div v-if="nextDayReservations.length > 0" class="reservation-prep-card card">
      <div class="rp-header">
        <span class="rp-icon">📋</span>
        <span class="rp-title">明日预约备货清单</span>
        <span class="rp-badge">{{ nextDayReservations.length }} 单</span>
      </div>

      <div class="rp-stats">
        <div class="rp-stat">
          <span class="rp-stat-icon">💰</span>
          <div class="rp-stat-info">
            <span class="rp-stat-label">已收定金</span>
            <span class="rp-stat-value">+¥{{ nextDayReservationDeposit }}</span>
          </div>
        </div>
        <div class="rp-stat">
          <span class="rp-stat-icon">📈</span>
          <div class="rp-stat-info">
            <span class="rp-stat-label">预估营收</span>
            <span class="rp-stat-value">¥{{ nextDayReservationEstimatedRevenue }}</span>
          </div>
        </div>
        <div class="rp-stat">
          <span class="rp-stat-icon">🎯</span>
          <div class="rp-stat-info">
            <span class="rp-stat-label">需备货</span>
            <span class="rp-stat-value">{{ nextDayRequiredRecords.length }} 种</span>
          </div>
        </div>
      </div>

      <div v-if="nextDayRequiredGenres.length > 0" class="rp-genres">
        <span class="rp-section-label">📊 需求流派分布</span>
        <div class="rp-genre-tags">
          <span 
            v-for="g in nextDayRequiredGenres" 
            :key="g.genre" 
            class="rp-genre-tag"
          >
            {{ genreEmoji[g.genre] }} {{ g.genre }} ×{{ g.count }}
          </span>
        </div>
      </div>

      <div class="rp-records-section">
        <span class="rp-section-label">🎵 需准备唱片清单</span>
        <div class="rp-records-list">
          <div 
            v-for="rec in nextDayRequiredRecords" 
            :key="rec.id"
            class="rp-record-item"
            :class="{ 'in-stock': isRecordInInventory(rec.id) }"
          >
            <div class="rp-record-info">
              <span class="rp-record-genre">{{ genreEmoji[rec.genre] }}</span>
              <div class="rp-record-detail">
                <span class="rp-record-title">{{ rec.title }}</span>
                <span class="rp-record-price">市价 ¥{{ rec.marketPrice }}</span>
              </div>
            </div>
            <div class="rp-record-qty">
              <span class="rp-qty-label">需 ×{{ rec.count }}</span>
              <span 
                class="rp-stock-status" 
                :class="{ 
                  sufficient: getInventoryStock(rec.id) >= rec.count,
                  insufficient: getInventoryStock(rec.id) > 0 && getInventoryStock(rec.id) < rec.count,
                  'out-of-stock': getInventoryStock(rec.id) === 0
                }"
              >
                {{ getInventoryStock(rec.id) === 0 ? '❌ 缺货' : 
                   getInventoryStock(rec.id) >= rec.count ? '✅ 备齐' : 
                   `⚠️ 差${rec.count - getInventoryStock(rec.id)}张` }}
                <span class="rp-stock-count">(库存 {{ getInventoryStock(rec.id) }})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="nextDayReservations.length > 0" class="rp-customers">
        <span class="rp-section-label">👥 预约顾客名单</span>
        <div class="rp-customer-list">
          <div v-for="res in nextDayReservations" :key="res.id" class="rp-customer-item">
            <span class="rp-customer-avatar">{{ res.customerAvatar }}</span>
            <div class="rp-customer-info">
              <span class="rp-customer-name">{{ res.customerName }}</span>
              <span class="rp-customer-meta">
                {{ res.timeSlot === 'afternoon' ? '☀️ 午后' : '🌙 夜场' }}
                <span v-if="res.memberLevel"> · {{ res.memberLevel }}会员</span>
                · 预算 ¥{{ res.totalBudget }}
              </span>
            </div>
            <span class="rp-customer-items">{{ res.items.length }} 张</span>
          </div>
        </div>
      </div>

      <p v-if="nextDayRequiredRecords.some(r => getInventoryStock(r.id) < r.count)" class="rp-warning">
        ⚠️ 有 {{ nextDayRequiredRecords.filter(r => getInventoryStock(r.id) < r.count).length }} 种唱片库存不足，请及时补货！
      </p>
      <p v-else class="rp-success">
        ✅ 所有预约唱片备货充足！
      </p>
    </div>

    <div class="view-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'suppliers' }"
        @click="activeTab = 'suppliers'"
      >
        📦 供应商货单
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'inventory' }"
        @click="activeTab = 'inventory'"
      >
        🗃️ 我的库存
      </button>
    </div>

    <div v-show="activeTab === 'suppliers'" class="suppliers-section">
      <div class="section-header">
        <h2 class="section-title">选择供应商</h2>
        <button class="refresh-btn" @click="refreshInventory" title="刷新货单">
          🔄
        </button>
      </div>
      
      <div class="suppliers-list">
        <div
          v-for="supplier in availableSuppliers"
          :key="supplier.id"
          class="supplier-card"
          :class="{ active: gameStore.currentSupplierId === supplier.id }"
          @click="selectSupplier(supplier.id)"
        >
          <div class="supplier-header">
            <span class="supplier-icon">{{ supplier.icon }}</span>
            <div class="supplier-info">
              <div class="supplier-name">
                {{ supplier.name }}
                <span 
                  class="supplier-type-badge"
                  :style="{ background: getSupplierTypeColor(supplier.type) + '30', color: getSupplierTypeColor(supplier.type) }"
                >
                  {{ getSupplierName(supplier.type) }}
                </span>
              </div>
              <div class="supplier-meta">
                <span>⭐ 信誉 {{ supplier.reputation }}</span>
                <span>💰 价格 ×{{ supplier.priceModifier.toFixed(2) }}</span>
                <span>📦 最低 ¥{{ supplier.minOrderAmount }}</span>
              </div>
            </div>
          </div>
          
          <div class="supplier-genres">
            <span 
              v-for="genre in supplier.genreFocus.slice(0, 4)" 
              :key="genre"
              class="genre-tag"
            >
              {{ genre }}
            </span>
          </div>

          <div v-if="gameStore.currentSupplierId === supplier.id" class="supplier-stats">
            <div class="stat-item">
              <span class="stat-label">累计采购</span>
              <span class="stat-value">¥{{ getSupplierStats(supplier.id).totalSpent }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">采购数量</span>
              <span class="stat-value">{{ getSupplierStats(supplier.id).totalItems }} 张</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">合约等级</span>
              <span 
                class="stat-value"
                :style="{ color: getTierColor(gameStore.getSupplierRelationship(supplier.id).contractTier) }"
              >
                {{ getContractTierConfig(gameStore.getSupplierRelationship(supplier.id).contractTier).icon }}
                {{ getContractTierConfig(gameStore.getSupplierRelationship(supplier.id).contractTier).tierName }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">信任度</span>
              <span class="stat-value">{{ gameStore.getSupplierRelationship(supplier.id).trustPoints }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentSupplier" class="supplier-detail-card card">
        <div class="detail-header" @click="showSupplierInfo = !showSupplierInfo">
          <span class="detail-icon">{{ currentSupplier.icon }}</span>
          <div class="detail-info">
            <h3 class="detail-title">{{ currentSupplier.name }} · 今日货单</h3>
            <p class="detail-desc">{{ currentSupplier.description }}</p>
          </div>
          <span class="expand-icon">{{ showSupplierInfo ? '▲' : '▼' }}</span>
        </div>

        <div v-show="showSupplierInfo" class="supplier-detail-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">稀有度分布</span>
              <div class="rarity-bars">
                <div 
                  v-for="(weight, idx) in currentSupplier.rarityDistribution" 
                  :key="idx"
                  class="rarity-bar"
                  :style="{ width: weight + '%' }"
                >
                  {{ idx + 1 }}★
                </div>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">库存风险系数</span>
              <span class="info-value">{{ (currentSupplier.stockRiskModifier * 100).toFixed(0) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">到货时间</span>
              <span class="info-value">{{ currentSupplier.deliveryDays }} 天</span>
            </div>
            <div class="info-item">
              <span class="info-label">特价概率</span>
              <span class="info-value">{{ (currentSupplier.specialOfferChance * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <div class="records-list">
          <div 
            v-for="supplierItem in supplierInventory" 
            :key="supplierItem.record.id"
            class="supplier-record-wrapper"
          >
            <div 
              v-if="supplierItem.isSpecialOffer" 
              class="special-offer-badge"
            >
              🔥 特价 -{{ supplierItem.discountPercent }}%
            </div>
            
            <div 
              v-if="shouldShowHeatBadge(supplierItem.marketHeat)" 
              class="market-heat-badge"
              :style="{ background: getHeatColor(supplierItem.marketHeat), color: '#fff' }"
            >
              {{ getHeatIcon(supplierItem.marketHeat) }} {{ getHeatLabel(supplierItem.marketHeat) }} {{ getTrendIcon(supplierItem.marketTrend) }}
            </div>
            
            <div 
              v-if="getRecommendationForRecord(supplierItem.record.id)" 
              class="recommendation-badge"
              :class="getRecommendationForRecord(supplierItem.record.id)?.priority"
            >
              {{ getRecommendationForRecord(supplierItem.record.id)?.priority === 'high' ? '🔴 建议补货' : '🟡 可考虑' }}
            </div>

            <RecordCard
              :record="supplierItem.record"
              :show-cost="false"
              :show-price="true"
              :custom-cost="supplierItem.adjustedCostPrice"
              @click="openPurchaseModal(supplierItem)"
            />

            <div class="record-meta-bar">
              <div class="meta-item">
                <span class="meta-label">采购价</span>
                <span 
                  class="meta-value cost"
                  :class="{ discounted: supplierItem.isSpecialOffer }"
                >
                  ¥{{ supplierItem.adjustedCostPrice }}
                  <span v-if="!supplierItem.isSpecialOffer && supplierItem.marketPriceModifier !== 1" class="heat-price-mod" :style="{ color: getHeatColor(supplierItem.marketHeat) }">
                    ({{ formatPriceModifier(supplierItem.marketPriceModifier) }})
                  </span>
                  <span v-if="supplierItem.isSpecialOffer" class="original-price">
                    ¥{{ Math.round(supplierItem.record.costPrice * currentSupplier.priceModifier) }}
                  </span>
                </span>
              </div>

              <div class="meta-item">
                <span class="meta-label">市场热度</span>
                <span 
                  class="meta-value"
                  :style="{ color: getHeatColor(supplierItem.marketHeat) }"
                >
                  {{ getHeatIcon(supplierItem.marketHeat) }} {{ getHeatLabel(supplierItem.marketHeat) }}
                </span>
              </div>

              <div class="meta-item">
                <span class="meta-label">库存</span>
                <span class="meta-value">{{ supplierItem.quantityAvailable }} 张</span>
              </div>

              <div class="meta-item">
                <span class="meta-label">风险</span>
                <span 
                  class="meta-value"
                  :style="{ color: getRiskColor(supplierItem.stockRisk) }"
                >
                  {{ getRiskIcon(supplierItem.stockRisk) }} {{ getRiskLabel(supplierItem.stockRisk) }}
                </span>
              </div>

              <div class="meta-item">
                <span class="meta-label">预计周转</span>
                <span class="meta-value">{{ formatPercent(supplierItem.expectedTurnoverRate) }}</span>
              </div>

              <div class="meta-item">
                <span class="meta-label">历史表现</span>
                <span 
                  class="meta-value"
                  :style="{ color: getPerformanceColor(supplierItem.salePerformanceScore) }"
                >
                  {{ getPerformanceLabel(supplierItem.salePerformanceScore) }}
                </span>
              </div>
            </div>

            <div v-if="getRecordPerformance(supplierItem.record.id)" class="record-performance">
              <div class="perf-item">
                <span>累计销量</span>
                <span>{{ getRecordPerformance(supplierItem.record.id)?.totalSold }} 张</span>
              </div>
              <div class="perf-item">
                <span>累计利润</span>
                <span>¥{{ getRecordPerformance(supplierItem.record.id)?.totalProfit }}</span>
              </div>
              <div class="perf-item">
                <span>售罄率</span>
                <span>{{ formatPercent(getRecordPerformance(supplierItem.record.id)?.sellThroughRate || 0) }}</span>
              </div>
              <div class="perf-item">
                <span>平均库存天数</span>
                <span>{{ Math.round(getRecordPerformance(supplierItem.record.id)?.avgDaysInStock || 0) }} 天</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="supplierInventory.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p class="empty-text">该供应商今日暂无新货</p>
          <button class="btn-secondary" @click="refreshInventory">刷新货单</button>
        </div>
      </div>

      <div v-if="currentSupplierRel && currentRelTierConfig" class="relationship-card card" :style="{ background: getTierBgColor(currentSupplierRel.contractTier), borderColor: getTierColor(currentSupplierRel.contractTier) + '50' }">
        <div class="rel-header">
          <span class="rel-tier-icon">{{ currentRelTierConfig.icon }}</span>
          <div class="rel-title-area">
            <h3 class="rel-title" :style="{ color: getTierColor(currentSupplierRel.contractTier) }">
              {{ currentRelTierConfig.tierName }}
            </h3>
            <p class="rel-desc">{{ currentRelTierConfig.description }}</p>
          </div>
          <div class="rel-trust-area">
            <span class="rel-trust-label">信任度</span>
            <span class="rel-trust-value" :style="{ color: getTierColor(currentSupplierRel.contractTier) }">
              {{ currentSupplierRel.trustPoints }}
            </span>
          </div>
        </div>

        <div class="rel-trust-bar">
          <div 
            class="rel-trust-fill"
            :style="{ 
              width: currentRelBonus ? currentRelBonus.trustProgressPercent + '%' : '0%',
              background: `linear-gradient(90deg, ${getTierColor(currentSupplierRel.contractTier)} 0%, ${getTierColor(currentSupplierRel.contractTier)}cc 100%)`
            }"
          ></div>
        </div>
        <div class="rel-trust-hint">
          <span v-if="nextRelTier" class="rel-next-tier">
            下一等级: {{ nextRelTier.icon }} {{ nextRelTier.tierName }}（需 {{ nextRelTier.minTrustPoints }} 信任）
          </span>
          <span v-else class="rel-max-tier">已达最高等级</span>
        </div>

        <div v-if="currentRelBonus" class="rel-bonuses">
          <div class="rel-bonus-item">
            <span class="rb-label">采购折扣</span>
            <span class="rb-value" :style="{ color: getTierColor(currentSupplierRel.contractTier) }">
              -{{ Math.round(currentRelBonus.totalDiscountRate * 100) }}%
            </span>
          </div>
          <div class="rel-bonus-item">
            <span class="rb-label">专属货位</span>
            <span class="rb-value">{{ currentRelBonus.exclusiveSlots }} 个</span>
          </div>
          <div class="rel-bonus-item">
            <span class="rb-label">稀有品加成</span>
            <span class="rb-value">+{{ Math.round(currentRelBonus.rareItemBonus * 100) }}%</span>
          </div>
          <div v-if="currentRelBonus.deliverySpeedBonus > 0" class="rel-bonus-item">
            <span class="rb-label">配送加速</span>
            <span class="rb-value">-{{ currentRelBonus.deliverySpeedBonus }} 天</span>
          </div>
          <div v-if="currentRelBonus.breachForgiveness > 0" class="rel-bonus-item">
            <span class="rb-label">违约豁免</span>
            <span class="rb-value">{{ currentRelBonus.breachForgiveness }} 次</span>
          </div>
        </div>

        <div v-if="canSignNextTier && nextRelTier" class="rel-sign-section">
          <button 
            class="btn-primary rel-sign-btn"
            :style="{ background: `linear-gradient(135deg, ${getTierColor(nextRelTier.tier)} 0%, ${getTierColor(nextRelTier.tier)}cc 100%)` }"
            @click="handleSignContract(nextRelTier.tier)"
          >
            {{ nextRelTier.icon }} 升级至{{ nextRelTier.tierName }}
          </button>
        </div>

        <div v-if="currentSupplierRel.contractTier === 'none' && !currentSupplierRel.isActive" class="rel-sign-section">
          <button 
            class="btn-primary rel-sign-btn"
            @click="handleSignContract('trial')"
          >
            📋 签订试用合约
          </button>
        </div>

        <div v-if="currentSupplierExclusiveSupplies.length > 0" class="rel-exclusive-section">
          <div class="rel-section-header">
            <span>🔓 专属货源</span>
          </div>
          <div class="rel-exclusive-list">
            <div 
              v-for="(supply, idx) in currentSupplierExclusiveSupplies" 
              :key="idx"
              class="rel-exclusive-item"
            >
              <span class="re-genre">{{ genreEmoji[supply.genre] }} {{ supply.genre }}</span>
              <span class="re-rarity">{{ supply.minRarity }}星+</span>
              <span class="re-stock">+{{ supply.bonusStockCount }}张</span>
              <span class="re-price">≤¥{{ supply.priceCap }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentSupplierMilestones.length > 0" class="rel-milestones-section">
          <div class="rel-section-header">
            <span>🎯 成长里程碑</span>
          </div>
          <div class="rel-milestone-list">
            <div 
              v-for="ms in currentSupplierMilestones" 
              :key="ms.id"
              class="rel-milestone-item"
              :class="{ unlocked: ms.isUnlocked }"
            >
              <span class="rm-icon">{{ ms.icon }}</span>
              <div class="rm-info">
                <span class="rm-name">{{ ms.name }}</span>
                <span class="rm-reward">{{ ms.rewardDescription }}</span>
              </div>
              <span v-if="ms.isUnlocked" class="rm-status">✅</span>
              <span v-else class="rm-status">{{ ms.requiredTrustPoints }}信任</span>
            </div>
          </div>
        </div>

        <div v-if="currentSupplierRel.breachCount > 0" class="rel-breach-warning">
          <span class="rbw-icon">⚠️</span>
          <span class="rbw-text">累计违约 {{ currentSupplierRel.breachCount }} 次</span>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'inventory'" class="inventory-section">
      <div class="section-header">
        <h2 class="section-title">🗃️ 我的库存</h2>
      </div>
      <div class="records-list">
        <RecordCard
          v-for="item in gameStore.inventory"
          :key="item.record.id"
          :record="item.record"
          :quantity="item.quantity"
          :show-cost="true"
          :show-price="true"
          :custom-cost="item.actualCostPrice"
        />
      </div>
      <div v-if="gameStore.inventory.length === 0" class="empty-state">
        <span class="empty-icon">📦</span>
        <p class="empty-text">暂无库存，去供应商那里选购吧！</p>
      </div>
    </div>

    <div class="action-bar">
      <button 
        class="btn-primary action-btn"
        :disabled="!gameStore.canAdvancePhase"
        @click="goToNextPhase"
      >
        下一步：去陈列 →
      </button>
    </div>

    <Teleport to="body">
      <div v-if="selectedRecord && selectedSupplierItem" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>购买唱片</h3>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div v-if="selectedSupplierItem.isSpecialOffer" class="modal-special-banner">
              🔥 限时特价！立省 {{ selectedSupplierItem.discountPercent }}%
            </div>

            <RecordCard 
              :record="selectedRecord" 
              :show-cost="false" 
              :show-price="true" 
              :custom-cost="selectedSupplierItem.adjustedCostPrice"
            />

            <div class="condition-info-row">
              <span class="cir-label">初始品相</span>
              <div class="cir-bar">
                <div 
                  class="cir-fill" 
                  :style="{ width: getConditionScoreFromLabel(selectedRecord.condition) + '%', background: getConditionColor(getConditionScoreFromLabel(selectedRecord.condition)) }"
                ></div>
              </div>
              <span class="cir-value" :style="{ color: getConditionColor(getConditionScoreFromLabel(selectedRecord.condition)) }">
                {{ selectedRecord.condition }} ({{ getConditionScoreFromLabel(selectedRecord.condition) }})
              </span>
            </div>

            <div class="risk-warning-row" :class="selectedSupplierItem.stockRisk">
              <span class="risk-icon">{{ getRiskIcon(selectedSupplierItem.stockRisk) }}</span>
              <span class="risk-text">
                {{ getRiskLabel(selectedSupplierItem.stockRisk) }} · 有{{ Math.round(selectedSupplierItem.riskFactor * 30) }}%概率运输中品相受损
              </span>
            </div>

            <div class="supplier-info-row">
              <span class="supplier-small-icon">{{ currentSupplier?.icon }}</span>
              <span class="supplier-small-name">{{ currentSupplier?.name }}</span>
              <span class="min-order">最低 ¥{{ currentSupplier?.minOrderAmount }}</span>
            </div>

            <div 
              v-if="shouldShowHeatBadge(selectedSupplierItem.marketHeat)"
              class="market-heat-row"
              :style="{ borderColor: getHeatColor(selectedSupplierItem.marketHeat) + '50', background: getHeatColor(selectedSupplierItem.marketHeat) + '10' }"
            >
              <span class="mh-icon">{{ getHeatIcon(selectedSupplierItem.marketHeat) }}</span>
              <div class="mh-info">
                <span class="mh-label" :style="{ color: getHeatColor(selectedSupplierItem.marketHeat) }">
                  {{ getHeatLabel(selectedSupplierItem.marketHeat) }} · {{ getTrendLabel(selectedSupplierItem.marketTrend) }} {{ getTrendIcon(selectedSupplierItem.marketTrend) }}
                </span>
                <span class="mh-desc">
                  热度值 {{ formatHeatValue(selectedSupplierItem.marketHeatValue) }}
                  · 价格{{ formatPriceModifier(selectedSupplierItem.marketPriceModifier) }}
                  · 需求×{{ selectedSupplierItem.marketHeat && getMarketHeatInfo(selectedSupplierItem.marketHeat) ? (getMarketHeatInfo(selectedSupplierItem.marketHeat)!.demandModifier[0] + getMarketHeatInfo(selectedSupplierItem.marketHeat)!.demandModifier[1]) / 2 : 1 }}
                </span>
              </div>
            </div>

            <div class="performance-preview">
              <div class="perf-preview-item">
                <span class="pp-label">预计利润率</span>
                <span class="pp-value">{{ formatPercent(selectedSupplierItem.historicalProfitMargin) }}</span>
              </div>
              <div class="perf-preview-item">
                <span class="pp-label">预计周转</span>
                <span class="pp-value">{{ formatPercent(selectedSupplierItem.expectedTurnoverRate) }}</span>
              </div>
              <div class="perf-preview-item">
                <span class="pp-label">表现评分</span>
                <span class="pp-value" :style="{ color: getPerformanceColor(selectedSupplierItem.salePerformanceScore) }">
                  {{ selectedSupplierItem.salePerformanceScore }}
                </span>
              </div>
            </div>

            <div class="quantity-selector">
              <span class="qty-label">购买数量</span>
              <div class="qty-controls">
                <button class="qty-btn" @click="changeQuantity(-1)">-</button>
                <span class="qty-value">{{ quantity }}</span>
                <button 
                  class="qty-btn" 
                  @click="changeQuantity(1)"
                  :disabled="quantity >= (selectedSupplierItem.quantityAvailable || 10)"
                >+</button>
              </div>
              <span class="qty-available">（库存 {{ selectedSupplierItem.quantityAvailable }} 张）</span>
            </div>

            <div class="total-row">
              <span class="total-label">总计</span>
              <div class="total-values">
                <span v-if="selectedSupplierItem.isSpecialOffer" class="total-original">
                  ¥{{ Math.round(selectedRecord.costPrice * (currentSupplier?.priceModifier || 1)) * quantity }}
                </span>
                <span class="total-value">¥{{ selectedSupplierItem.adjustedCostPrice * quantity }}</span>
              </div>
            </div>

            <div v-if="currentSupplier && selectedSupplierItem.adjustedCostPrice * quantity < currentSupplier.minOrderAmount" class="min-order-warning">
              ⚠️ 未达到最低订货金额 ¥{{ currentSupplier.minOrderAmount }}
            </div>

            <p v-if="message" class="message" :class="{ error: message.includes('不足') || message.includes('未达到') }">
              {{ message }}
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">取消</button>
            <button 
              class="btn-primary"
              :disabled="
                gameStore.budget < selectedSupplierItem.adjustedCostPrice * quantity ||
                (currentSupplier !== null && selectedSupplierItem.adjustedCostPrice * quantity < currentSupplier.minOrderAmount)
              "
              @click="handlePurchase"
            >
              确认购买
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.purchase-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.inventory-summary {
  display: flex;
  justify-content: space-around;
}

.summary-row {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-value.budget {
  color: var(--accent-orange);
}

.recommendations-card {
  margin: 0 16px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(237, 137, 54, 0.1) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rec-icon {
  font-size: 18px;
}

.rec-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-orange);
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--bg-card);
}

.rec-item.high {
  border-left: 3px solid #f56565;
}

.rec-item.medium {
  border-left: 3px solid #ed8936;
}

.rec-item.low {
  border-left: 3px solid #48bb78;
}

.rec-priority {
  font-size: 14px;
}

.rec-text {
  color: var(--text-secondary);
}

.view-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-muted);
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--accent-gold);
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  font-size: 18px;
}

.suppliers-list {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.supplier-card {
  flex-shrink: 0;
  width: 280px;
  padding: 14px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.supplier-card.active {
  border-color: var(--accent-gold);
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(233, 69, 96, 0.05) 100%);
}

.supplier-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.supplier-icon {
  font-size: 36px;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.supplier-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.supplier-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--text-muted);
}

.supplier-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.genre-tag {
  font-size: 10px;
  padding: 3px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.supplier-stats {
  display: flex;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-gold);
}

.supplier-detail-card {
  margin: 0 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border);
  cursor: pointer;
}

.detail-icon {
  font-size: 32px;
}

.detail-info {
  flex: 1;
}

.detail-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.detail-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.expand-icon {
  font-size: 12px;
  color: var(--text-muted);
}

.supplier-detail-info {
  padding: 12px 0;
  border-bottom: 1px dashed var(--border);
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 11px;
  color: var(--text-muted);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.rarity-bars {
  display: flex;
  gap: 2px;
  height: 20px;
}

.rarity-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: white;
  background: linear-gradient(90deg, var(--success), var(--accent-gold));
  border-radius: 2px;
  min-width: 24px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.supplier-record-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.special-offer-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  padding: 4px 10px;
  background: linear-gradient(135deg, #f56565, #ed8936);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.4);
}

.recommendation-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  z-index: 10;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.recommendation-badge.high {
  background: linear-gradient(135deg, #f56565, #c53030);
  color: white;
}

.recommendation-badge.medium {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.recommendation-badge.low {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.record-meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 0 0 10px 10px;
  margin-top: -2px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 10px;
  color: var(--text-muted);
}

.meta-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.meta-value.cost {
  color: var(--danger);
}

.meta-value.cost.discounted {
  color: var(--success);
}

.original-price {
  font-size: 10px;
  text-decoration: line-through;
  color: var(--text-muted);
  margin-left: 4px;
}

.record-performance {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px 12px;
  background: rgba(56, 178, 172, 0.1);
  border-top: 1px dashed var(--border);
}

.perf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.perf-item span:first-child {
  font-size: 10px;
  color: var(--text-muted);
}

.perf-item span:last-child {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
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

.inventory-section {
  padding: 0 16px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 16px;
  background: linear-gradient(to top, var(--bg-primary) 70%, transparent);
  z-index: 50;
}

.action-btn {
  width: 100%;
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
  max-height: 90vh;
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

.modal-special-banner {
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.2), rgba(237, 137, 54, 0.2));
  border: 1px solid rgba(245, 101, 101, 0.4);
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #f56565;
}

.condition-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.cir-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.cir-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.cir-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.cir-value {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.risk-warning-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
}

.risk-warning-row.low {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.risk-warning-row.medium {
  background: rgba(237, 137, 54, 0.1);
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.risk-warning-row.high {
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.risk-icon {
  font-size: 18px;
}

.risk-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.supplier-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.supplier-small-icon {
  font-size: 18px;
}

.supplier-small-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.min-order {
  font-size: 11px;
  color: var(--text-muted);
}

.performance-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.perf-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.pp-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.pp-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.quantity-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px 16px;
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
  cursor: not-allowed;
}

.qty-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.qty-available {
  font-size: 11px;
  color: var(--text-muted);
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

.total-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-original {
  font-size: 12px;
  text-decoration: line-through;
  color: var(--text-muted);
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-gold);
}

.min-order-warning {
  padding: 10px 12px;
  background: rgba(237, 137, 54, 0.1);
  border: 1px solid rgba(237, 137, 54, 0.3);
  border-radius: 8px;
  font-size: 12px;
  color: #ed8936;
  text-align: center;
}

.message {
  text-align: center;
  font-size: 13px;
  color: var(--success);
  padding: 8px;
  background: rgba(72, 187, 120, 0.1);
  border-radius: 6px;
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

.market-heat-card {
  margin: 0 16px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(246, 173, 85, 0.08) 0%, rgba(99, 179, 237, 0.08) 100%);
  border: 1px solid rgba(246, 173, 85, 0.2);
}

.heat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.heat-icon {
  font-size: 18px;
}

.heat-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.heat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.heat-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heat-section-label {
  font-size: 11px;
  font-weight: 600;
  min-width: 50px;
  padding: 2px 8px;
  border-radius: 4px;
  text-align: center;
}

.heat-section-label.hot {
  background: rgba(246, 173, 85, 0.2);
  color: #dd6b20;
}

.heat-section-label.cold {
  background: rgba(99, 179, 237, 0.2);
  color: #2b6cb0;
}

.heat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.heat-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 500;
}

.heat-trend {
  font-size: 10px;
}

.supplier-record-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.market-heat-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.heat-price-mod {
  font-size: 10px;
  margin-left: 4px;
  font-weight: 600;
}

.market-heat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid;
  border-radius: 8px;
  margin-bottom: 10px;
}

.mh-icon {
  font-size: 22px;
}

.mh-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mh-label {
  font-size: 12px;
  font-weight: 600;
}

.mh-desc {
  font-size: 10px;
  color: var(--text-muted);
}

.inventory-section .section-header {
  padding: 0;
  margin-bottom: 12px;
}

.reservation-prep-card {
  margin: 0 16px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(159, 122, 234, 0.08) 100%);
  border: 1px solid rgba(102, 126, 234, 0.25);
}

.rp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rp-icon {
  font-size: 20px;
}

.rp-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.rp-badge {
  padding: 3px 10px;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.rp-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.rp-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.rp-stat-icon {
  font-size: 18px;
}

.rp-stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rp-stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.rp-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.rp-section-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 500;
}

.rp-genres {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border);
}

.rp-genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rp-genre-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  color: #667eea;
  font-weight: 500;
}

.rp-records-section {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border);
}

.rp-records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rp-record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.rp-record-item.in-stock {
  border-color: rgba(72, 187, 120, 0.3);
  background: rgba(72, 187, 120, 0.05);
}

.rp-record-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rp-record-genre {
  font-size: 20px;
}

.rp-record-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rp-record-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.rp-record-price {
  font-size: 10px;
  color: var(--text-muted);
}

.rp-record-qty {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.rp-qty-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-orange);
}

.rp-stock-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rp-stock-status.sufficient {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.rp-stock-status.insufficient {
  background: rgba(237, 137, 54, 0.15);
  color: var(--warning);
}

.rp-stock-status.out-of-stock {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.rp-stock-count {
  font-size: 9px;
  opacity: 0.7;
}

.rp-customers {
  margin-bottom: 12px;
}

.rp-customer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rp-customer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.rp-customer-avatar {
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.rp-customer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rp-customer-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.rp-customer-meta {
  font-size: 10px;
  color: var(--text-muted);
}

.rp-customer-items {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-gold);
}

.rp-warning {
  margin: 12px 0 0 0;
  padding: 10px 12px;
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
  border-radius: 8px;
  font-size: 12px;
  color: var(--danger);
  font-weight: 500;
  text-align: center;
}

.rp-success {
  margin: 12px 0 0 0;
  padding: 10px 12px;
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 8px;
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
  text-align: center;
}

.relationship-card {
  border: 1px solid;
  animation: slideUp 0.3s ease-out;
}

.rel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rel-tier-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.rel-title-area {
  flex: 1;
  min-width: 0;
}

.rel-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.rel-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

.rel-trust-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.rel-trust-label {
  font-size: 10px;
  color: var(--text-muted);
}

.rel-trust-value {
  font-size: 20px;
  font-weight: 800;
}

.rel-trust-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.rel-trust-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.rel-trust-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.rel-max-tier {
  color: var(--accent-gold);
  font-weight: 600;
}

.rel-bonuses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.rel-bonus-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rb-label {
  font-size: 10px;
  color: var(--text-muted);
}

.rb-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.rel-sign-section {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.rel-sign-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.rel-exclusive-section,
.rel-milestones-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.rel-section-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.rel-exclusive-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rel-exclusive-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  font-size: 11px;
}

.re-genre {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.re-rarity {
  color: var(--accent-gold);
  font-weight: 600;
}

.re-stock {
  color: var(--success);
  font-weight: 600;
}

.re-price {
  color: var(--text-secondary);
}

.rel-milestone-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rel-milestone-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  font-size: 11px;
  opacity: 0.6;
}

.rel-milestone-item.unlocked {
  opacity: 1;
  background: rgba(72, 187, 120, 0.08);
}

.rm-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.rm-info {
  flex: 1;
  min-width: 0;
}

.rm-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.rm-reward {
  display: block;
  font-size: 10px;
  color: var(--text-secondary);
}

.rm-status {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}

.rel-milestone-item.unlocked .rm-status {
  color: var(--success);
}

.rel-breach-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
  border-radius: 8px;
}

.rbw-icon {
  font-size: 14px;
}

.rbw-text {
  font-size: 12px;
  color: #f56565;
  font-weight: 600;
}
</style>
