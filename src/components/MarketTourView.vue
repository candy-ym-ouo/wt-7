<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import type { MarketCity, MarketInventoryItem, CustomerFlowWave } from '@/types'
import { getWaveLabel, getWaveColor, getWaveIcon, getCityTierLabel, getCityTierColor, getEventRarityLabel, getEventCategoryLabel, getEventRarityColor } from '@/data/marketTour'
import RecordCard from './RecordCard.vue'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'cities' | 'inventory' | 'selling' | 'stats'>('cities')
const selectedInventoryIds = ref<string[]>([])
const inventoryQuantities = ref<Map<string, number>>(new Map())
const toastMessage = ref('')
const showToast = ref(false)
const counterOfferPrice = ref(0)
const showCounterModal = ref(false)
const showEventModal = ref(false)

const phaseLabels: Record<string, { label: string; icon: string; color: string }> = {
  planning: { label: '规划中', icon: '📋', color: '#3b82f6' },
  traveling: { label: '旅途中', icon: '🚗', color: '#8b5cf6' },
  setup: { label: '布置中', icon: '🎪', color: '#f59e0b' },
  selling: { label: '营业中', icon: '💰', color: '#10b981' },
  event: { label: '事件中', icon: '⚡', color: '#ef4444' },
  settlement: { label: '结算中', icon: '📊', color: '#06b6d4' },
  return: { label: '返程中', icon: '🏠', color: '#6366f1' }
}

const marketTour = computed(() => gameStore.marketTour)
const phaseInfo = computed(() => phaseLabels[marketTour.value.phase] || phaseLabels.planning)

const currentCity = computed(() => gameStore.currentMarketCity)
const availableCities = computed(() => gameStore.availableMarketCities)
const currentCustomer = computed(() => gameStore.getCurrentMarketCustomer())
const marketRecommendations = computed(() => gameStore.getMarketRecommendations(currentCustomer.value))
const currentBargain = computed(() => gameStore.currentMarketBargain)
const marketStats = computed(() => gameStore.getMarketSalesStats())

const tempInventory = computed(() => marketTour.value.temporaryInventory)
const totalInventoryValue = computed(() => gameStore.getMarketInventoryValue())
const totalInventoryCount = computed(() => 
  tempInventory.value.reduce((s, i) => s + (i.quantity - i.soldQuantity), 0)
)

const waveInfo = computed(() => {
  const w = marketTour.value.customerFlow.currentWave
  return {
    label: getWaveLabel(w),
    color: getWaveColor(w),
    icon: getWaveIcon(w)
  }
})

watch(() => marketTour.value.phase, (newPhase) => {
  if (newPhase === 'event') {
    showEventModal.value = true
  }
})

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

const handleStartPlanning = () => {
  gameStore.startMarketPlanning()
  activeTab.value = 'cities'
  showNotification('开始规划市集行程！')
}

const handleSelectCity = (cityId: string) => {
  const res = gameStore.selectMarketCity(cityId)
  showNotification(res.message)
  if (res.success) {
    initInventorySelection()
  }
}

const handleUnlockCity = (cityId: string) => {
  const res = gameStore.unlockMarketCity(cityId)
  showNotification(res.message)
}

const initInventorySelection = () => {
  selectedInventoryIds.value = []
  inventoryQuantities.value = new Map()
  for (const item of gameStore.inventory) {
    if (item.quantity > 0) {
      const defaultQty = Math.min(item.quantity, Math.ceil(item.quantity * 0.3))
      if (defaultQty > 0) {
        selectedInventoryIds.value.push(item.record.id)
        inventoryQuantities.value.set(item.record.id, defaultQty)
      }
    }
  }
  activeTab.value = 'inventory'
}

const toggleInventoryItem = (recordId: string) => {
  const idx = selectedInventoryIds.value.indexOf(recordId)
  if (idx >= 0) {
    selectedInventoryIds.value.splice(idx, 1)
    inventoryQuantities.value.delete(recordId)
  } else {
    selectedInventoryIds.value.push(recordId)
    const storeItem = gameStore.inventory.find(i => i.record.id === recordId)
    if (storeItem) {
      inventoryQuantities.value.set(recordId, Math.min(storeItem.quantity, 1))
    }
  }
}

const setItemQuantity = (recordId: string, qty: number) => {
  const storeItem = gameStore.inventory.find(i => i.record.id === recordId)
  if (!storeItem) return
  const maxQty = storeItem.quantity
  const finalQty = Math.max(0, Math.min(maxQty, Math.floor(qty)))
  if (finalQty > 0) {
    if (!selectedInventoryIds.value.includes(recordId)) {
      selectedInventoryIds.value.push(recordId)
    }
    inventoryQuantities.value.set(recordId, finalQty)
  } else {
    const idx = selectedInventoryIds.value.indexOf(recordId)
    if (idx >= 0) selectedInventoryIds.value.splice(idx, 1)
    inventoryQuantities.value.delete(recordId)
  }
}

const handleSetInventory = () => {
  const res = gameStore.setMarketInventory(selectedInventoryIds.value, inventoryQuantities.value)
  showNotification(res.message)
}

const handleStartTrip = () => {
  const res = gameStore.startMarketTrip()
  showNotification(res.message)
  if (res.success) {
    advanceThroughTravel()
  }
}

const advanceThroughTravel = async () => {
  while (marketTour.value.phase === 'traveling') {
    await new Promise(r => setTimeout(r, 600))
    const res = gameStore.advanceMarketDay()
    showNotification(res.message)
  }
  if (marketTour.value.phase === 'setup') {
    await new Promise(r => setTimeout(r, 800))
    const res = gameStore.advanceMarketDay()
    showNotification(res.message)
    activeTab.value = 'selling'
  }
}

const handleAdvanceDay = async () => {
  const res = gameStore.advanceMarketDay()
  showNotification(res.message)
  if (res.phase === 'settlement') {
    await new Promise(r => setTimeout(r, 500))
    const sRes = gameStore.settleMarketTour()
    showNotification(sRes.message)
  }
}

const handleTrySale = (recordId: string, price: number) => {
  const res = gameStore.tryMarketSale(recordId, price)
  showNotification(res.message)
}

const handleStartBargain = (recordId: string, price: number) => {
  const res = gameStore.startMarketBargain(recordId, price)
  showNotification(res.message)
  if (res.success) {
    counterOfferPrice.value = price
  }
}

const handleMakeCounterOffer = () => {
  const res = gameStore.makeMarketCounterOffer(counterOfferPrice.value)
  showNotification(res.message)
  if (res.nextOffer !== undefined) {
    counterOfferPrice.value = Math.floor((res.nextOffer + counterOfferPrice.value) / 2)
  } else {
    showCounterModal.value = false
  }
}

const handleAcceptOffer = () => {
  const res = gameStore.acceptMarketOffer()
  showNotification(res.message)
  showCounterModal.value = false
}

const handleRejectBargain = () => {
  gameStore.rejectMarketBargain()
  showCounterModal.value = false
  showNotification('已拒绝议价')
}

const handleAdvanceCustomer = () => {
  const res = gameStore.advanceMarketCustomer()
  showNotification(res.message)
}

const handleResolveEvent = (choiceId: string) => {
  const res = gameStore.resolveMarketEvent(choiceId)
  showNotification(res.message + (res.effects ? ` (${res.effects.join('，')})` : ''))
  showEventModal.value = false
}

const handleSettle = () => {
  const res = gameStore.settleMarketTour()
  showNotification(res.message)
}

const handleReturn = () => {
  const res = gameStore.returnFromMarket()
  showNotification(res.message)
  if (res.success) {
    emit('close')
  }
}

const handleAdjustPrice = (item: MarketInventoryItem, newPrice: number) => {
  const res = gameStore.adjustMarketSalePrice(item.record.id, newPrice)
  showNotification(res.message)
}

const formatCityInfo = (city: MarketCity) => {
  const budgetMult = (city.baseBudgetMultiplier * 100).toFixed(0)
  const genres = city.preferredGenres.slice(0, 3).join('、')
  return {
    tierLabel: getCityTierLabel(city.tier),
    tierColor: getCityTierColor(city.tier),
    budgetMult: `${budgetMult}%`,
    genres
  }
}

const pendingSettlement = computed(() => marketTour.value.pendingSettlement)
</script>

<template>
  <div class="market-tour-view">
    <div class="view-header">
      <div class="header-left">
        <button class="close-btn" @click="emit('close')">← 返回</button>
        <h2>🚛 城市巡回市集</h2>
      </div>
      <div class="phase-indicator" :style="{ background: phaseInfo.color }">
        <span>{{ phaseInfo.icon }}</span>
        <span class="phase-label">{{ phaseInfo.label }}</span>
      </div>
    </div>

    <div v-if="!marketTour.isActive" class="start-panel">
      <div class="start-card">
        <div class="start-icon">🎪</div>
        <h3>开启城市巡回</h3>
        <p class="start-desc">带上精选唱片，去各地市集摆摊吧！结识更多爱好者，拓展店铺声望。</p>
        <ul class="feature-list">
          <li>🗺️ 选择目的地城市，了解当地偏好</li>
          <li>📦 准备临时库存，调整售价策略</li>
          <li>👥 应对客流波动，灵活议价销售</li>
          <li>⚡ 处理随机事件，做出明智选择</li>
          <li>💰 结算收益，带回未售商品</li>
        </ul>
        <button class="btn-primary" @click="handleStartPlanning">🚀 开始规划行程</button>
      </div>
    </div>

    <div v-else class="market-content">
      <div class="market-stats-bar">
        <div class="stat-item">
          <span class="stat-label">当前资金</span>
          <span class="stat-value money">¥{{ gameStore.budget.toLocaleString() }}</span>
        </div>
        <div class="stat-item" v-if="currentCity">
          <span class="stat-label">所在城市</span>
          <span class="stat-value">{{ currentCity.icon }} {{ currentCity.name }}</span>
        </div>
        <div class="stat-item" v-if="marketTour.daysAtMarket > 0">
          <span class="stat-label">市集天数</span>
          <span class="stat-value">第{{ marketTour.daysAtMarket }}/{{ marketTour.maxDaysAtMarket }}天</span>
        </div>
        <div class="stat-item" v-if="marketTour.phase === 'selling'">
          <span class="stat-label">客流状态</span>
          <span class="stat-value" :style="{ color: waveInfo.color }">
            {{ waveInfo.icon }} {{ waveInfo.label }}
          </span>
        </div>
        <div class="stat-item" v-if="marketTour.phase === 'selling'">
          <span class="stat-label">今日收入</span>
          <span class="stat-value money positive">+¥{{ marketTour.currentMarketDayRevenue }}</span>
        </div>
        <div class="stat-item" v-if="marketTour.phase === 'selling'">
          <span class="stat-value">今日出单：{{ marketTour.currentMarketDaySalesCount }}单</span>
        </div>
      </div>

      <div class="tabs-bar" v-if="marketTour.phase === 'planning'">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'cities' }"
          @click="activeTab = 'cities'"
        >🗺️ 选择城市</button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'inventory' }"
          :disabled="!marketTour.selectedCityId"
          @click="activeTab = 'inventory'"
        >📦 准备库存</button>
      </div>

      <div v-if="marketTour.phase === 'planning' && activeTab === 'cities'" class="cities-panel">
        <div class="cities-grid">
          <div 
            v-for="city in availableCities" 
            :key="city.id"
            class="city-card"
            :class="{ 
              selected: marketTour.selectedCityId === city.id,
              locked: !city.isUnlocked,
              disabled: city.minLevel > gameStore.currentLevel
            }"
          >
            <div class="city-header">
              <span class="city-icon">{{ city.icon }}</span>
              <div class="city-title">
                <h4>{{ city.name }}</h4>
                <span class="city-tier" :style="{ background: formatCityInfo(city).tierColor }">
                  {{ formatCityInfo(city).tierLabel }}
                </span>
              </div>
            </div>
            <p class="city-desc">{{ city.description }}</p>
            <div class="city-info-row">
              <span>🚗 旅费：¥{{ city.travelCost }}</span>
              <span>⏱️ {{ city.travelDays }}天</span>
            </div>
            <div class="city-info-row">
              <span>🎪 租金：¥{{ city.rentCost }}/天</span>
              <span>⭐ {{ city.reputationReward }}声望</span>
            </div>
            <div class="city-info-row">
              <span>💸 预算：{{ formatCityInfo(city).budgetMult }}</span>
              <span>👥 客流：{{ city.baseCustomerCount }}+/天</span>
            </div>
            <div class="city-preferred">
              <span class="preferred-label">偏好：</span>
              <span class="genre-tags">{{ formatCityInfo(city).genres }}</span>
            </div>
            <div class="city-level-req" v-if="city.minLevel > gameStore.currentLevel">
              🔒 需要达到第{{ city.minLevel }}关
            </div>
            <div class="city-actions">
              <template v-if="city.isUnlocked">
                <button 
                  class="btn-primary"
                  :disabled="city.minLevel > gameStore.currentLevel"
                  @click="handleSelectCity(city.id)"
                >
                  {{ marketTour.selectedCityId === city.id ? '✓ 已选择' : '选择此城市' }}
                </button>
              </template>
              <template v-else>
                <button 
                  class="btn-secondary"
                  @click="handleUnlockCity(city.id)"
                >
                  🔓 解锁 (¥{{ city.unlockCost?.toLocaleString() }})
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-if="marketTour.phase === 'planning' && activeTab === 'inventory'" class="inventory-panel">
        <div class="panel-info">
          <h4>从店铺库存选择要带出的唱片</h4>
          <p class="hint">建议选择当地偏好风格的唱片，利润更高</p>
          <div class="selected-info">
            <span>已选：{{ selectedInventoryIds.length }}种唱片</span>
            <span>总库存价值：¥{{ 
              Array.from(inventoryQuantities.entries()).reduce((sum, [id, qty]) => {
                const item = gameStore.inventory.find(i => i.record.id === id)
                return sum + (item ? item.actualCostPrice * qty : 0)
              }, 0).toLocaleString()
            }}</span>
          </div>
        </div>
        
        <div class="inventory-list">
          <div 
            v-for="item in gameStore.inventory" 
            :key="item.record.id"
            class="inventory-item"
            :class="{ selected: selectedInventoryIds.includes(item.record.id) }"
            @click="toggleInventoryItem(item.record.id)"
          >
            <div class="item-checkbox">
              <input type="checkbox" :checked="selectedInventoryIds.includes(item.record.id)" readonly />
            </div>
            <div class="item-cover">
              <RecordCard :record="item.record" size="sm" />
            </div>
            <div class="item-info">
              <h5>{{ item.record.title }}</h5>
              <p class="item-artist">{{ item.record.artist }}</p>
              <div class="item-meta">
                <span class="item-genre">{{ item.record.genre }}</span>
                <span class="item-rarity">⭐{{ item.record.rarity }}</span>
              </div>
              <div class="item-price-info">
                <span>进价：¥{{ item.actualCostPrice }}</span>
                <span>市价：¥{{ item.record.marketPrice }}</span>
              </div>
            </div>
            <div class="item-qty-control" @click.stop>
              <span class="stock-label">库存：{{ item.quantity }}</span>
              <div class="qty-controls">
                <button 
                  class="qty-btn" 
                  @click="setItemQuantity(item.record.id, (inventoryQuantities.get(item.record.id) || 0) - 1)"
                  :disabled="!selectedInventoryIds.includes(item.record.id)"
                >-</button>
                <input 
                  type="number" 
                  class="qty-input"
                  :value="inventoryQuantities.get(item.record.id) || 0"
                  @change="(e) => setItemQuantity(item.record.id, parseInt((e.target as HTMLInputElement).value) || 0)"
                  :disabled="!selectedInventoryIds.includes(item.record.id)"
                  min="0"
                  :max="item.quantity"
                />
                <button 
                  class="qty-btn" 
                  @click="setItemQuantity(item.record.id, (inventoryQuantities.get(item.record.id) || 0) + 1)"
                  :disabled="!selectedInventoryIds.includes(item.record.id)"
                >+</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-actions">
          <button class="btn-secondary" @click="activeTab = 'cities'">← 返回选城市</button>
          <button 
            class="btn-primary"
            :disabled="selectedInventoryIds.length === 0"
            @click="handleSetInventory"
          >✓ 确认库存清单</button>
        </div>
      </div>

      <div v-if="marketTour.phase === 'planning' && tempInventory.length > 0" class="ready-panel">
        <div class="ready-card">
          <h4>📋 出发准备完成</h4>
          <div class="ready-summary">
            <div class="summary-row">
              <span>目的地：</span>
              <span>{{ currentCity?.icon }} {{ currentCity?.name }}</span>
            </div>
            <div class="summary-row">
              <span>携带商品：</span>
              <span>{{ tempInventory.length }}种 / {{ totalInventoryCount }}张</span>
            </div>
            <div class="summary-row">
              <span>库存成本：</span>
              <span class="money">¥{{ totalInventoryValue.toLocaleString() }}</span>
            </div>
            <div class="summary-row">
              <span>往返旅费：</span>
              <span class="money negative">-¥{{ (currentCity?.travelCost || 0) * 2 }}</span>
            </div>
            <div class="summary-row">
              <span>预计摊位租金：</span>
              <span class="money negative">-¥{{ (currentCity?.rentCost || 0) * 3 }}（3天）</span>
            </div>
          </div>
          <div class="temp-inventory-preview">
            <h5>📦 临时库存</h5>
            <div class="temp-items">
              <div v-for="item in tempInventory.slice(0, 8)" :key="item.record.id" class="temp-item">
                <span class="temp-title">{{ item.record.title }}</span>
                <span class="temp-qty">×{{ item.quantity }}</span>
                <span class="temp-price">¥{{ item.salePrice }}</span>
              </div>
              <div v-if="tempInventory.length > 8" class="temp-more">...等{{ tempInventory.length }}种</div>
            </div>
          </div>
          <div class="ready-actions">
            <button class="btn-secondary" @click="initInventorySelection">📦 重新选择库存</button>
            <button class="btn-primary" @click="handleStartTrip">🚗 出发！</button>
          </div>
        </div>
      </div>

      <div v-if="marketTour.phase === 'traveling'" class="travel-panel">
        <div class="travel-content">
          <div class="travel-animation">🚗💨💨</div>
          <h3>正在前往{{ currentCity?.name }}...</h3>
          <p>还剩{{ marketTour.travelDaysRemaining }}天路程</p>
          <div class="travel-progress">
            <div 
              class="progress-fill"
              :style="{ width: `${((currentCity?.travelDays || 1) - marketTour.travelDaysRemaining) / (currentCity?.travelDays || 1) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="marketTour.phase === 'setup'" class="setup-panel">
        <div class="setup-content">
          <div class="setup-icon">🎪</div>
          <h3>正在布置摊位...</h3>
          <p>{{ currentCity?.name }}市集，一切准备就绪！</p>
        </div>
      </div>

      <div v-if="marketTour.phase === 'selling'" class="selling-panel">
        <div class="selling-layout">
          <div class="customer-column">
            <div class="customer-card" v-if="currentCustomer">
              <div class="customer-header">
                <div class="customer-avatar">{{ currentCustomer.avatar }}</div>
                <div class="customer-info">
                  <h4>{{ currentCustomer.name }}</h4>
                  <div class="customer-tags">
                    <span v-if="currentCustomer.isLocalCollector" class="tag tag-special">🎩 本地藏家</span>
                    <span v-if="currentCustomer.isTourist" class="tag tag-tourist">📸 游客</span>
                    <span v-if="currentCustomer.willBargain" class="tag tag-bargain">🤝 会议价</span>
                  </div>
                </div>
              </div>
              <div class="customer-detail-grid">
                <div class="detail-item">
                  <span class="detail-label">预算</span>
                  <span class="detail-value money">¥{{ currentCustomer.budget }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">价格范围</span>
                  <span class="detail-value">¥{{ currentCustomer.priceRange[0] }}-¥{{ currentCustomer.priceRange[1] }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">喜爱风格</span>
                  <span class="detail-value">{{ currentCustomer.favoriteGenres.slice(0, 2).join('、') }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">耐心值</span>
                  <div class="patience-bar">
                    <div 
                      class="patience-fill"
                      :style="{ width: `${currentCustomer.patience}%`, background: currentCustomer.patience > 50 ? '#10b981' : currentCustomer.patience > 25 ? '#f59e0b' : '#ef4444' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="customer-hint">
                <p>💡 {{ currentCustomer.quote }}</p>
              </div>
            </div>
            <div class="customer-card empty" v-else>
              <div class="empty-icon">🚶</div>
              <p>今日顾客已全部接待完毕</p>
              <p class="hint">点击"进入下一天"继续</p>
            </div>
            
            <div class="customer-controls" v-if="currentCustomer">
              <button class="btn-secondary" @click="handleAdvanceCustomer">跳过此顾客 →</button>
            </div>
            
            <div class="price-adjustment" v-if="currentBargain && currentBargain.active">
              <div class="bargain-panel">
                <h5>🤝 议价进行中</h5>
                <div class="bargain-round">第 {{ currentBargain.round }}/{{ currentBargain.maxRounds }} 轮</div>
                <div class="bargain-prices">
                  <div class="price-row">
                    <span>您的初始报价：</span>
                    <span class="money">¥{{ currentBargain.initialPrice }}</span>
                  </div>
                  <div class="price-row highlight">
                    <span>顾客出价：</span>
                    <span class="money customer-offer">¥{{ currentBargain.customerOffer }}</span>
                  </div>
                </div>
                <div class="bargain-input">
                  <label>您的还价：</label>
                  <input 
                    type="number" 
                    v-model.number="counterOfferPrice"
                    min="0"
                  />
                </div>
                <div class="bargain-actions">
                  <button class="btn-danger" @click="handleRejectBargain">❌ 拒绝交易</button>
                  <button class="btn-success" @click="handleAcceptOffer">✅ 接受出价</button>
                  <button class="btn-primary" @click="handleMakeCounterOffer">🔄 继续还价</button>
                </div>
              </div>
            </div>
          </div>

          <div class="sales-column">
            <div class="column-header">
              <h4>💿 推荐商品（匹配度排序）</h4>
              <span class="header-sub">基于顾客偏好智能推荐</span>
            </div>
            <div class="sale-items-list">
              <div 
                v-for="rec in marketRecommendations.slice(0, 6)" 
                :key="rec.item.record.id"
                class="sale-item-card"
              >
                <div class="match-score" :style="{ background: rec.score >= 75 ? '#10b981' : rec.score >= 50 ? '#f59e0b' : '#ef4444' }">
                  {{ Math.round(rec.score) }}%
                </div>
                <div class="sale-item-content">
                  <div class="sale-item-header">
                    <h5>{{ rec.item.record.title }}</h5>
                    <span class="sold-count">剩{{ rec.item.quantity - rec.item.soldQuantity }}张</span>
                  </div>
                  <p class="sale-item-artist">{{ rec.item.record.artist }}</p>
                  <div class="match-reasons" v-if="rec.matchReasons.length > 0">
                    <span v-for="r in rec.matchReasons" :key="r" class="match-tag">{{ r }}</span>
                  </div>
                  <div class="sale-price-row">
                    <span class="cost-label">进价¥{{ rec.item.actualCostPrice }}</span>
                    <div class="price-adjust">
                      <label>售价：</label>
                      <input 
                        type="number" 
                        :value="rec.item.salePrice"
                        min="rec.item.actualCostPrice"
                        @change="(e) => handleAdjustPrice(rec.item, parseInt((e.target as HTMLInputElement).value) || rec.item.actualCostPrice)"
                      />
                    </div>
                  </div>
                  <div class="sale-actions" v-if="currentCustomer && !currentBargain?.active">
                    <button 
                      class="btn-success"
                      :disabled="(rec.item.quantity - rec.item.soldQuantity) <= 0"
                      @click="handleTrySale(rec.item.record.id, rec.item.salePrice)"
                    >💰 直接销售</button>
                    <button 
                      class="btn-secondary"
                      :disabled="(rec.item.quantity - rec.item.soldQuantity) <= 0 || !currentCustomer.willBargain"
                      @click="handleStartBargain(rec.item.record.id, rec.item.salePrice)"
                    >🤝 尝试议价</button>
                  </div>
                </div>
              </div>
              <div v-if="marketRecommendations.length === 0" class="empty-state">
                <p>库存已售罄！</p>
              </div>
            </div>
          </div>

          <div class="stats-column">
            <div class="mini-stats card">
              <h4>📊 实时数据</h4>
              <div class="stat-grid">
                <div class="mini-stat">
                  <span class="mini-label">总收入</span>
                  <span class="mini-value positive">+¥{{ marketStats.totalRevenue.toLocaleString() }}</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">总利润</span>
                  <span 
                    class="mini-value"
                    :class="marketStats.totalProfit >= 0 ? 'positive' : 'negative'"
                  >{{ marketStats.totalProfit >= 0 ? '+' : '' }}¥{{ marketStats.totalProfit.toLocaleString() }}</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">成交单数</span>
                  <span class="mini-value">{{ marketStats.salesCount }}单</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">满意度</span>
                  <span class="mini-value">{{ Math.round(marketStats.avgSatisfaction) }}%</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">剩余库存</span>
                  <span class="mini-value">{{ totalInventoryCount }}张</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">库存价值</span>
                  <span class="mini-value money">¥{{ totalInventoryValue.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="daily-summary card">
              <h4>📅 每日业绩</h4>
              <div class="daily-list">
                <div v-for="(rev, idx) in marketTour.dailyMarketRevenue" :key="idx" class="daily-row">
                  <span>第{{ idx + 1 }}天</span>
                  <span class="money positive">+¥{{ rev }}</span>
                  <span class="money negative">-¥{{ marketTour.dailyMarketCost[idx] || 0 }}</span>
                  <span class="count">{{ marketTour.dailyMarketSalesCount[idx] || 0 }}单</span>
                </div>
                <div v-if="marketTour.dailyMarketRevenue.length === 0" class="empty-row">
                  暂无数据
                </div>
              </div>
            </div>

            <div class="event-trigger card" v-if="marketTour.activeEvent && !marketTour.activeEvent.resolved">
              <div class="event-alert">
                <span class="event-icon">⚡</span>
                <span>发生了随机事件！</span>
              </div>
              <button class="btn-primary" @click="showEventModal = true">查看详情</button>
            </div>

            <div class="control-panel card">
              <button class="btn-primary full-width" @click="handleAdvanceDay">
                🌙 进入下一天
              </button>
              <button 
                class="btn-secondary full-width" 
                @click="handleSettle"
              >📊 提前结算并返程
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="marketTour.phase === 'settlement' || marketTour.phase === 'return'" class="settlement-panel">
        <div v-if="pendingSettlement" class="settlement-card">
          <div class="settlement-header">
            <h2>📊 {{ pendingSettlement.cityName }}市集结算报告</h2>
            <div class="settlement-period">
              共经营 {{ pendingSettlement.totalDays }} 天
            </div>
          </div>

          <div class="settlement-section">
            <h4>💰 收益明细</h4>
            <div class="detail-rows">
              <div class="detail-row">
                <span>销售总收入：</span>
                <span class="positive money">+¥{{ pendingSettlement.totalRevenue.toLocaleString() }}</span>
              </div>
              <div class="detail-row sub">
                <span>商品成本：</span>
                <span class="money">-¥{{ pendingSettlement.totalCost.toLocaleString() }}</span>
              </div>
              <div class="detail-row sub">
                <span>交通费用：</span>
                <span class="negative money">-¥{{ pendingSettlement.travelCost.toLocaleString() }}</span>
              </div>
              <div class="detail-row sub">
                <span>摊位租金：</span>
                <span class="negative money">-¥{{ pendingSettlement.rentCost.toLocaleString() }}</span>
              </div>
              <div class="detail-row sub" v-if="pendingSettlement.otherCosts > 0">
                <span>其他支出：</span>
                <span class="negative money">-¥{{ pendingSettlement.otherCosts.toLocaleString() }}</span>
              </div>
              <div class="detail-row total">
                <span>净利润：</span>
                <span 
                  class="total-value money"
                  :class="pendingSettlement.totalProfit >= 0 ? 'positive' : 'negative'"
                >
                  {{ pendingSettlement.totalProfit >= 0 ? '+' : '' }}¥{{ pendingSettlement.totalProfit.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div class="settlement-section">
            <h4>📈 经营数据</h4>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-num">{{ pendingSettlement.salesCount }}</span>
                <span class="stat-name">成交单数</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ Math.round(pendingSettlement.avgSatisfaction) }}%</span>
                <span class="stat-name">平均满意度</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ getWaveLabel(pendingSettlement.peakSalesWave as CustomerFlowWave) }}</span>
                <span class="stat-name">销售高峰时段</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ pendingSettlement.eventsEncountered }}</span>
                <span class="stat-name">遭遇事件</span>
              </div>
            </div>
          </div>

          <div class="settlement-section" v-if="pendingSettlement.bonusRewards.length > 0">
            <h4>🏆 额外奖励</h4>
            <div class="bonus-list">
              <span v-for="b in pendingSettlement.bonusRewards" :key="b" class="badge bonus">{{ b }}</span>
            </div>
          </div>

          <div class="settlement-section">
            <h4>⭐ 声望收获</h4>
            <div class="reputation-gain">
              <span class="gain positive">+{{ pendingSettlement.reputationGained }} 声望</span>
            </div>
          </div>

          <div class="settlement-section" v-if="pendingSettlement.unsoldItems.length > 0">
            <h4>📦 未售商品（将运回店铺）</h4>
            <div class="unsold-list">
              <div v-for="item in pendingSettlement.unsoldItems" :key="item.recordId" class="unsold-item">
                <span>{{ item.title }}</span>
                <span class="qty">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="settlement-actions">
            <button class="btn-primary big" @click="handleReturn">🏠 结束并返回本店</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEventModal && marketTour.activeEvent" class="modal-overlay" @click.self="showEventModal = false">
      <div class="modal event-modal">
        <div class="modal-header">
          <span 
            class="event-type-badge" 
            :style="{ background: getEventRarityColor(marketTour.activeEvent.config.rarity), color: 'white' }"
          >
            {{ marketTour.activeEvent.config.rarity === 'legendary' ? '🌟' : marketTour.activeEvent.config.rarity === 'rare' ? '💎' : marketTour.activeEvent.config.rarity === 'uncommon' ? '✨' : '📌' }}
            {{ getEventRarityLabel(marketTour.activeEvent.config.rarity) }}
          </span>
          <h3>{{ marketTour.activeEvent.config.name }}</h3>
          <div class="event-category-tag">{{ getEventCategoryLabel(marketTour.activeEvent.config.category) }}</div>
        </div>
        <div class="modal-body">
          <p class="event-desc">{{ marketTour.activeEvent.config.description }}</p>
          <div class="event-choices">
            <button 
              v-for="choice in marketTour.activeEvent.config.choices" 
              :key="choice.id"
              class="choice-btn"
              :class="{ disabled: choice.cost && choice.cost > gameStore.budget }"
              @click="handleResolveEvent(choice.id)"
            >
              <div class="choice-label">{{ choice.label }}</div>
              <div class="choice-desc">{{ choice.description }}</div>
              <div class="choice-cost" v-if="choice.cost && choice.cost > 0">
                💸 需要资金：¥{{ choice.cost.toLocaleString() }}
              </div>
              <div class="choice-effects">
                <span v-if="choice.effects.customerCountModifier !== 0" 
                  :class="choice.effects.customerCountModifier > 0 ? 'positive' : 'negative'">
                  客流{{ choice.effects.customerCountModifier > 0 ? '+' : '' }}{{ Math.round(choice.effects.customerCountModifier * 100) }}%
                </span>
                <span v-if="choice.effects.budgetModifier !== 0"
                  :class="choice.effects.budgetModifier > 0 ? 'positive' : 'negative'">
                  预算{{ choice.effects.budgetModifier > 0 ? '+' : '' }}{{ Math.round(choice.effects.budgetModifier * 100) }}%
                </span>
                <span v-if="choice.effects.buyChanceModifier !== 0"
                  :class="choice.effects.buyChanceModifier > 0 ? 'positive' : 'negative'">
                  购买意愿{{ choice.effects.buyChanceModifier > 0 ? '+' : '' }}{{ Math.round(choice.effects.buyChanceModifier * 100) }}%
                </span>
                <span v-if="choice.effects.reputationChange !== 0"
                  :class="choice.effects.reputationChange > 0 ? 'positive' : 'negative'">
                  声望{{ choice.effects.reputationChange > 0 ? '+' : '' }}{{ choice.effects.reputationChange }}
                </span>
                <span v-if="choice.effects.budgetChange !== 0"
                  :class="choice.effects.budgetChange > 0 ? 'positive' : 'negative'">
                  资金{{ choice.effects.budgetChange > 0 ? '+' : '' }}¥{{ choice.effects.budgetChange }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast-notification">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.market-tour-view {
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(120, 53, 15, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.close-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #78350f;
}

.view-header h2 {
  margin: 0;
  color: #78350f;
  font-size: 28px;
}

.phase-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.phase-label {
  font-size: 15px;
}

.start-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.start-card {
  background: white;
  border-radius: 20px;
  padding: 48px;
  max-width: 560px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(120, 53, 15, 0.2);
}

.start-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.start-card h3 {
  font-size: 28px;
  color: #78350f;
  margin: 0 0 12px 0;
}

.start-desc {
  color: #92400e;
  margin-bottom: 24px;
  line-height: 1.6;
}

.feature-list {
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.feature-list li {
  padding: 10px 0;
  color: #78350f;
  border-bottom: 1px dashed #fde68a;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary.full-width {
  width: 100%;
}

.btn-primary.big {
  padding: 18px 48px;
  font-size: 18px;
}

.btn-secondary {
  background: white;
  color: #78350f;
  border: 2px solid #fbbf24;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #fffbeb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary.full-width {
  width: 100%;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-success:disabled {
  opacity: 0.5;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.market-stats-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(120, 53, 15, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #92400e;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #78350f;
}

.stat-value.money {
  font-family: 'Courier New', monospace;
}

.stat-value.positive {
  color: #059669;
}

.stat-value.negative {
  color: #dc2626;
}

.tabs-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid transparent;
  border-radius: 12px;
  font-weight: 600;
  color: #92400e;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  border-color: #f59e0b;
  color: #78350f;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.city-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(120, 53, 15, 0.1);
  border: 3px solid transparent;
  transition: all 0.2s;
}

.city-card:hover:not(.locked):not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(120, 53, 15, 0.15);
}

.city-card.selected {
  border-color: #f59e0b;
  background: #fffbeb;
}

.city-card.locked, .city-card.disabled {
  opacity: 0.7;
}

.city-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.city-icon {
  font-size: 40px;
}

.city-title h4 {
  margin: 0;
  font-size: 20px;
  color: #78350f;
}

.city-tier {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.city-desc {
  color: #92400e;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.city-info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #78350f;
  border-bottom: 1px dashed #fef3c7;
}

.city-preferred {
  padding: 10px 0;
  font-size: 12px;
  color: #92400e;
}

.preferred-label {
  font-weight: 600;
  color: #78350f;
}

.city-level-req {
  padding: 8px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 13px;
  margin: 10px 0;
  text-align: center;
}

.city-actions {
  margin-top: 12px;
}

.city-actions button {
  width: 100%;
}

.panel-info {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(120, 53, 15, 0.1);
}

.panel-info h4 {
  margin: 0 0 8px 0;
  color: #78350f;
  font-size: 18px;
}

.panel-info .hint {
  color: #92400e;
  font-size: 13px;
  margin: 0 0 12px 0;
}

.selected-info {
  display: flex;
  gap: 32px;
  padding: 12px;
  background: #fffbeb;
  border-radius: 8px;
}

.selected-info span {
  font-weight: 600;
  color: #78350f;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(120, 53, 15, 0.08);
}

.inventory-item:hover {
  border-color: #fde68a;
}

.inventory-item.selected {
  border-color: #f59e0b;
  background: #fffbeb;
}

.item-checkbox {
  flex-shrink: 0;
}

.item-cover {
  width: 80px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h5 {
  margin: 0 0 4px 0;
  color: #78350f;
  font-size: 15px;
}

.item-artist {
  margin: 0 0 6px 0;
  color: #92400e;
  font-size: 13px;
}

.item-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.item-genre {
  padding: 2px 8px;
  background: #fef3c7;
  border-radius: 4px;
  font-size: 11px;
  color: #78350f;
}

.item-rarity {
  font-size: 12px;
  color: #b45309;
}

.item-price-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #92400e;
}

.item-qty-control {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.stock-label {
  font-size: 12px;
  color: #92400e;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #fbbf24;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  color: #78350f;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 56px;
  height: 28px;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  color: #78350f;
}

.qty-input:disabled {
  opacity: 0.4;
}

.panel-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.ready-panel {
  display: flex;
  justify-content: center;
}

.ready-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(120, 53, 15, 0.15);
}

.ready-card h4 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #78350f;
}

.ready-summary {
  background: #fffbeb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #78350f;
}

.summary-row.total {
  border-top: 2px solid #fde68a;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 700;
  font-size: 16px;
}

.money {
  font-family: 'Courier New', monospace;
}

.money.positive {
  color: #059669;
}

.money.negative {
  color: #dc2626;
}

.temp-inventory-preview {
  margin-bottom: 24px;
}

.temp-inventory-preview h5 {
  margin: 0 0 12px 0;
  color: #78350f;
}

.temp-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.temp-item, .temp-more {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fef9c3;
  border-radius: 6px;
  font-size: 13px;
  color: #78350f;
}

.temp-title {
  flex: 1;
}

.ready-actions {
  display: flex;
  gap: 12px;
}

.ready-actions button {
  flex: 1;
}

.travel-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.travel-content {
  text-align: center;
  background: white;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(120, 53, 15, 0.15);
}

.travel-animation {
  font-size: 72px;
  margin-bottom: 16px;
  animation: bounce 0.6s infinite alternate;
}

@keyframes bounce {
  from { transform: translateX(-10px); }
  to { transform: translateX(10px); }
}

.travel-content h3 {
  margin: 0 0 8px 0;
  color: #78350f;
  font-size: 24px;
}

.travel-progress {
  width: 320px;
  height: 12px;
  background: #fef3c7;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: width 0.5s;
  border-radius: 6px;
}

.setup-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.setup-content {
  text-align: center;
  background: white;
  padding: 48px;
  border-radius: 20px;
}

.setup-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.selling-layout {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 16px;
  align-items: start;
}

.customer-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(120, 53, 15, 0.1);
}

.customer-card.empty {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.customer-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.customer-avatar {
  width: 56px;
  height: 56px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.customer-info h4 {
  margin: 0 0 6px 0;
  color: #78350f;
}

.customer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.tag-special {
  background: #fce7f3;
  color: #9d174d;
}

.tag-tourist {
  background: #dbeafe;
  color: #1e40af;
}

.tag-bargain {
  background: #dcfce7;
  color: #166534;
}

.customer-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  color: #92400e;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #78350f;
}

.patience-bar {
  height: 8px;
  background: #fef3c7;
  border-radius: 4px;
  overflow: hidden;
}

.patience-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s;
}

.customer-hint {
  background: #fffbeb;
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

.customer-hint p {
  margin: 0;
  font-size: 13px;
  color: #78350f;
  font-style: italic;
}

.customer-controls {
  display: flex;
  justify-content: center;
}

.bargain-panel {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(120, 53, 15, 0.15);
}

.bargain-panel h5 {
  margin: 0 0 8px 0;
  color: #78350f;
  font-size: 16px;
}

.bargain-round {
  font-size: 12px;
  color: #92400e;
  margin-bottom: 12px;
}

.bargain-prices {
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #78350f;
}

.price-row.highlight {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 8px 0;
  font-size: 15px;
  font-weight: 600;
}

.customer-offer {
  color: #059669;
  font-size: 17px;
}

.bargain-input {
  margin-bottom: 16px;
}

.bargain-input label {
  display: block;
  font-size: 12px;
  color: #92400e;
  margin-bottom: 4px;
}

.bargain-input input {
  width: 100%;
  height: 36px;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #78350f;
  box-sizing: border-box;
}

.bargain-actions {
  display: flex;
  gap: 8px;
}

.bargain-actions button {
  flex: 1;
}

.sales-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(120, 53, 15, 0.08);
}

.column-header h4 {
  margin: 0 0 4px 0;
  color: #78350f;
  font-size: 16px;
}

.header-sub {
  font-size: 12px;
  color: #92400e;
}

.sale-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.sale-item-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(120, 53, 15, 0.08);
  position: relative;
}

.match-score {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: white;
  font-weight: 700;
  font-size: 12px;
}

.sale-item-content {
  padding-right: 60px;
}

.sale-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sale-item-header h5 {
  margin: 0;
  color: #78350f;
  font-size: 15px;
}

.sold-count {
  font-size: 12px;
  color: #92400e;
  font-weight: 600;
}

.sale-item-artist {
  margin: 0 0 8px 0;
  color: #92400e;
  font-size: 13px;
}

.match-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.match-tag {
  padding: 2px 8px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.sale-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 8px;
  margin-bottom: 10px;
}

.cost-label {
  font-size: 12px;
  color: #92400e;
}

.price-adjust {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-adjust label {
  font-size: 12px;
  font-weight: 600;
  color: #78350f;
}

.price-adjust input {
  width: 80px;
  height: 30px;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  color: #78350f;
}

.sale-actions {
  display: flex;
  gap: 8px;
}

.sale-actions button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  color: #92400e;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(120, 53, 15, 0.08);
}

.card h4 {
  margin: 0 0 12px 0;
  color: #78350f;
  font-size: 15px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  background: #fffbeb;
  border-radius: 8px;
}

.mini-label {
  font-size: 11px;
  color: #92400e;
}

.mini-value {
  font-size: 14px;
  font-weight: 700;
  color: #78350f;
}

.mini-value.positive {
  color: #059669;
}

.mini-value.negative {
  color: #dc2626;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.daily-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 50px;
  gap: 8px;
  padding: 6px 8px;
  background: #fffbeb;
  border-radius: 6px;
  font-size: 12px;
  align-items: center;
}

.daily-row .count {
  font-weight: 600;
  color: #78350f;
}

.empty-row {
  text-align: center;
  padding: 12px;
  color: #92400e;
  font-size: 12px;
}

.event-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #fef2f2;
  border-radius: 8px;
  margin-bottom: 10px;
  color: #dc2626;
  font-weight: 600;
  font-size: 13px;
}

.event-icon {
  font-size: 18px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settlement-panel {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.settlement-card {
  background: white;
  border-radius: 24px;
  padding: 36px;
  max-width: 640px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(120, 53, 15, 0.2);
}

.settlement-header {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #fef3c7;
}

.settlement-header h2 {
  margin: 0 0 8px 0;
  color: #78350f;
  font-size: 26px;
}

.settlement-period {
  color: #92400e;
  font-size: 14px;
}

.settlement-section {
  margin-bottom: 24px;
}

.settlement-section h4 {
  margin: 0 0 14px 0;
  color: #78350f;
  font-size: 17px;
  padding-left: 10px;
  border-left: 4px solid #f59e0b;
}

.detail-rows {
  background: #fffbeb;
  border-radius: 12px;
  padding: 16px 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #78350f;
}

.detail-row.sub {
  padding-left: 16px;
  font-size: 13px;
  color: #92400e;
}

.detail-row.total {
  border-top: 2px solid #fde68a;
  margin-top: 10px;
  padding-top: 14px;
  font-weight: 700;
  font-size: 17px;
}

.total-value {
  font-size: 20px;
}

.positive {
  color: #059669;
}

.negative {
  color: #dc2626;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  background: #fffbeb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #78350f;
  margin-bottom: 4px;
}

.stat-name {
  font-size: 12px;
  color: #92400e;
}

.bonus-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.badge.bonus {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 2px solid #f59e0b;
}

.reputation-gain {
  padding: 16px;
  background: #ecfdf5;
  border-radius: 12px;
  text-align: center;
}

.gain {
  font-size: 24px;
  font-weight: 800;
}

.unsold-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.unsold-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fef9c3;
  border-radius: 8px;
  font-size: 13px;
  color: #78350f;
}

.unsold-item .qty {
  font-weight: 700;
}

.settlement-actions {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 28px 16px;
  border-bottom: 1px solid #fef3c7;
}

.event-type-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 10px;
}

.event-type-badge.positive {
  background: #dcfce7;
  color: #166534;
}

.event-type-badge.negative {
  background: #fee2e2;
  color: #991b1b;
}

.event-type-badge.neutral {
  background: #dbeafe;
  color: #1e40af;
}

.modal-header h3 {
  margin: 0;
  color: #78350f;
  font-size: 22px;
}

.event-category-tag {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.modal-body {
  padding: 20px 28px 28px;
}

.event-desc {
  padding: 16px;
  background: #fffbeb;
  border-radius: 12px;
  color: #78350f;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 15px;
}

.event-choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-btn {
  text-align: left;
  background: white;
  border: 2px solid #fde68a;
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.choice-btn:hover:not(.disabled) {
  border-color: #f59e0b;
  background: #fffbeb;
  transform: translateY(-2px);
}

.choice-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-label {
  font-weight: 700;
  color: #78350f;
  font-size: 16px;
  margin-bottom: 6px;
}

.choice-desc {
  color: #92400e;
  font-size: 13px;
  margin-bottom: 10px;
}

.choice-cost {
  font-size: 12px;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 8px;
}

.choice-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.choice-effects span {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: #fef9c3;
  color: #78350f;
}

.choice-effects span.positive {
  background: #dcfce7;
  color: #166534;
}

.choice-effects span.negative {
  background: #fee2e2;
  color: #991b1b;
}

.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #78350f;
  color: white;
  padding: 12px 28px;
  border-radius: 999px;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 8px 24px rgba(120, 53, 15, 0.4);
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@media (max-width: 1280px) {
  .selling-layout {
    grid-template-columns: 260px 1fr 260px;
  }
}

@media (max-width: 1024px) {
  .selling-layout {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>