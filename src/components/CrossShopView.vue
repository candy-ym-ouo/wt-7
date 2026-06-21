<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, onMounted } from 'vue'
import type {
  CrossShopShop,
  CrossShopTrade,
  CrossShopTradeItem,
  CrossShopInventoryItem,
  CrossShopValuation
} from '@/types'
import VinylRecord from './VinylRecord.vue'

const emit = defineEmits<{ close: [] }>()
const gameStore = useGameStore()

type Tab = 'shops' | 'trades' | 'create' | 'negotiate' | 'stats'
const activeTab = ref<Tab>('shops')

const selectedShop = ref<CrossShopShop | null>(null)
const shopInventory = ref<CrossShopInventoryItem[]>([])
const selectedTrade = ref<CrossShopTrade | null>(null)

const selectedPlayerItems = ref<Map<string, { quantity: number; conditionScore: number; agreedValue: number }>>(new Map())
const selectedShopItems = ref<Map<string, { quantity: number; conditionScore: number; agreedValue: number }>>(new Map())
const cashFromPlayer = ref(0)
const cashFromShop = ref(0)

const message = ref('')
const messageType = ref<'success' | 'error' | 'warning'>('success')
const showMessage = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

const valuations = ref<Map<string, CrossShopValuation>>(new Map())

const tabs = [
  { key: 'shops' as Tab, label: '合作店铺', icon: '🏬' },
  { key: 'trades' as Tab, label: '交易记录', icon: '📋' },
  { key: 'stats' as Tab, label: '交换统计', icon: '📊' }
]

onMounted(() => {
  gameStore.refreshCrossShopShops()
  gameStore.markCrossShopNotificationsReadAction()
})

const shops = computed(() => gameStore.currentCrossShopShops)
const stats = computed(() => gameStore.crossShop.stats)
const playerTradeableItems = computed(() => gameStore.getPlayerTradeableItems())

const openShopDetail = (shop: CrossShopShop) => {
  if (!shop.isUnlocked) {
    showMessage(`需要达到第 ${shop.minLevel} 关且声望 ≥ ${shop.minLevel * 15}`, 'error')
    return
  }
  selectedShop.value = shop
  shopInventory.value = gameStore.getCrossShopInventory(shop.id)
  selectedPlayerItems.value.clear()
  selectedShopItems.value.clear()
  cashFromPlayer.value = 0
  cashFromShop.value = 0
  valuations.value.clear()
  activeTab.value = 'create'
}

const togglePlayerItem = (item: ReturnType<typeof gameStore.getPlayerTradeableItems>[number]) => {
  if (!selectedShop.value) return
  const key = item.record.id
  if (selectedPlayerItems.value.has(key)) {
    selectedPlayerItems.value.delete(key)
    valuations.value.delete('player_' + key)
  } else {
    const valuation = gameStore.evaluateCrossShopRecord(item.record, item.conditionScore, selectedShop.value.id)
    if (valuation) {
      selectedPlayerItems.value.set(key, {
        quantity: 1,
        conditionScore: item.conditionScore,
        agreedValue: valuation.finalEstimatedValue
      })
      valuations.value.set('player_' + key, valuation)
    }
  }
}

const toggleShopItem = (item: CrossShopInventoryItem) => {
  if (!selectedShop.value) return
  const key = item.record.id
  if (selectedShopItems.value.has(key)) {
    selectedShopItems.value.delete(key)
    valuations.value.delete('shop_' + key)
  } else {
    const valuation = gameStore.evaluateCrossShopRecord(item.record, item.conditionScore, selectedShop.value.id)
    if (valuation) {
      selectedShopItems.value.set(key, {
        quantity: 1,
        conditionScore: item.conditionScore,
        agreedValue: valuation.finalEstimatedValue
      })
      valuations.value.set('shop_' + key, valuation)
    }
  }
}

const totalPlayerValue = computed(() => {
  let total = 0
  for (const [, v] of selectedPlayerItems.value.entries()) {
    total += v.agreedValue * v.quantity
  }
  return total + cashFromPlayer.value
})

const totalShopValue = computed(() => {
  let total = 0
  for (const [, v] of selectedShopItems.value.entries()) {
    total += v.agreedValue * v.quantity
  }
  return total + cashFromShop.value
})

const valueBalance = computed(() => totalPlayerValue.value - totalShopValue.value)

const canProposeTrade = computed(() => {
  return (selectedPlayerItems.value.size > 0 || cashFromPlayer.value > 0) &&
         (selectedShopItems.value.size > 0 || cashFromShop.value > 0)
})

const proposeTrade = () => {
  if (!selectedShop.value || !canProposeTrade.value) return

  const playerTradeItems: CrossShopTradeItem[] = []
  for (const [recordId, data] of selectedPlayerItems.value.entries()) {
    const tradeable = playerTradeableItems.value.find(i => i.record.id === recordId)
    if (tradeable) {
      playerTradeItems.push({
        recordId,
        record: tradeable.record,
        quantity: data.quantity,
        conditionScore: data.conditionScore,
        agreedValue: data.agreedValue,
        source: 'player'
      })
    }
  }

  const shopTradeItems: CrossShopTradeItem[] = []
  for (const [recordId, data] of selectedShopItems.value.entries()) {
    const inv = shopInventory.value.find(i => i.record.id === recordId)
    if (inv) {
      shopTradeItems.push({
        recordId,
        record: inv.record,
        quantity: data.quantity,
        conditionScore: data.conditionScore,
        agreedValue: data.agreedValue,
        source: 'shop'
      })
    }
  }

  const result = gameStore.createCrossShopTrade(
    selectedShop.value.id,
    playerTradeItems,
    shopTradeItems,
    cashFromPlayer.value,
    cashFromShop.value
  )

  if (result.success) {
    showMessage(result.message, 'success')
    const evaluatedResult = (result as unknown as { evaluated?: { trade?: CrossShopTrade; isAccepted: boolean } }).evaluated
    if (evaluatedResult?.trade) {
      selectedTrade.value = evaluatedResult.trade
      activeTab.value = 'negotiate'
    } else if ('trade' in result && result.trade) {
      selectedTrade.value = result.trade
      activeTab.value = 'negotiate'
    }
  } else {
    showMessage(result.message, 'error')
  }
}

const openTradeDetail = (trade: CrossShopTrade) => {
  selectedTrade.value = trade
  selectedShop.value = trade.shop
  cashFromPlayer.value = trade.cashFromPlayer
  cashFromShop.value = trade.cashFromShop

  selectedPlayerItems.value.clear()
  selectedShopItems.value.clear()

  for (const item of trade.playerItems) {
    selectedPlayerItems.value.set(item.recordId, {
      quantity: item.quantity,
      conditionScore: item.conditionScore,
      agreedValue: item.agreedValue
    })
  }
  for (const item of trade.shopItems) {
    selectedShopItems.value.set(item.recordId, {
      quantity: item.quantity,
      conditionScore: item.conditionScore,
      agreedValue: item.agreedValue
    })
  }

  activeTab.value = 'negotiate'
}

const acceptCurrentTrade = () => {
  if (!selectedTrade.value) return
  const result = gameStore.completeCrossShopTrade(selectedTrade.value.id)
  if (result.success) {
    showMessage(result.message, 'success')
    selectedTrade.value = null
    activeTab.value = 'trades'
  } else {
    showMessage(result.message, 'error')
  }
}

const cancelCurrentTrade = () => {
  if (!selectedTrade.value) return
  const result = gameStore.cancelCrossShopTrade(selectedTrade.value.id)
  if (result.success) {
    showMessage(result.message, 'success')
    selectedTrade.value = null
    activeTab.value = 'trades'
  }
}

const adjustPlayerItemValue = (recordId: string, newVal: number) => {
  const item = selectedPlayerItems.value.get(recordId)
  if (item) {
    item.agreedValue = Math.max(0, newVal)
  }
}

const adjustShopItemValue = (recordId: string, newVal: number) => {
  const item = selectedShopItems.value.get(recordId)
  if (item) {
    item.agreedValue = Math.max(0, newVal)
  }
}

const continueNegotiation = () => {
  if (!selectedTrade.value) return

  const playerTradeItems: CrossShopTradeItem[] = []
  for (const [recordId, data] of selectedPlayerItems.value.entries()) {
    const tradeable = playerTradeableItems.value.find(i => i.record.id === recordId)
    if (tradeable) {
      playerTradeItems.push({
        recordId,
        record: tradeable.record,
        quantity: data.quantity,
        conditionScore: data.conditionScore,
        agreedValue: data.agreedValue,
        source: 'player'
      })
    }
  }

  const shopTradeItems: CrossShopTradeItem[] = []
  for (const [recordId, data] of selectedShopItems.value.entries()) {
    const inv = shopInventory.value.find(i => i.record.id === recordId)
    if (inv) {
      shopTradeItems.push({
        recordId,
        record: inv.record,
        quantity: data.quantity,
        conditionScore: data.conditionScore,
        agreedValue: data.agreedValue,
        source: 'shop'
      })
    }
  }

  const result = gameStore.continueCrossShopNegotiation(
    selectedTrade.value.id,
    playerTradeItems,
    shopTradeItems,
    cashFromPlayer.value,
    cashFromShop.value
  )

  if (result.success && result.trade) {
    selectedTrade.value = result.trade
    showMessage(result.message, result.isAccepted ? 'success' : 'warning')
    if (result.isRejected) {
      activeTab.value = 'trades'
      selectedTrade.value = null
    }
  } else {
    showMessage(result.message, 'error')
  }
}

const tradeTypeLabel = (type: CrossShopTrade['type']) => {
  const labels = {
    record_for_record: '唱片互换',
    record_for_cash: '现金交易',
    mixed: '混合交易'
  }
  return labels[type]
}

const getRarityStars = (rarity: number) => '⭐'.repeat(rarity)
</script>

<template>
  <div class="cross-shop-overlay">
    <div class="cross-shop-modal">
      <div class="modal-header">
        <h2>🔄 跨店交换系统</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div v-if="message" class="message-bar" :class="messageType">
        {{ message }}
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <div class="modal-content">
        <div v-if="activeTab === 'shops'" class="shops-list">
          <div v-for="shop in shops" :key="shop.id" class="shop-card" :class="{ locked: !shop.isUnlocked }">
            <div class="shop-header">
              <div class="shop-avatar">{{ shop.avatar }}</div>
              <div class="shop-info">
                <div class="shop-name">
                  {{ shop.icon }} {{ shop.name }}
                  <span class="shop-type-badge">{{ shop.typeName }}</span>
                </div>
                <div class="shop-owner">老板：{{ shop.ownerName }}</div>
              </div>
              <div class="shop-reputation">
                <div class="rep-score">⭐ {{ shop.reputation }}</div>
                <div class="trust-level">信任 Lv.{{ shop.trustLevel }}</div>
              </div>
            </div>
            <div class="shop-desc">{{ shop.description }}</div>
            <div class="shop-quote">"{{ shop.ownerQuote }}"</div>
            <div class="shop-preferences">
              <div class="pref-row">
                <span class="pref-label">偏好流派：</span>
                <span class="pref-tags">{{ shop.preferredGenres.join(' · ') }}</span>
              </div>
              <div class="pref-row">
                <span class="pref-label">偏好稀有度：</span>
                <span class="pref-tags">{{ getRarityStars(Math.min(...shop.preferredRarities)) }} - {{ getRarityStars(Math.max(...shop.preferredRarities)) }}</span>
              </div>
              <div class="pref-row">
                <span class="pref-label">交易风格：</span>
                <span class="pref-tags" :class="shop.tradeStyle">
                  {{ shop.tradeStyle === 'generous' ? '慷慨' : shop.tradeStyle === 'fair' ? '公平' : shop.tradeStyle === 'tough' ? '强硬' : '精明' }}
                </span>
              </div>
            </div>
            <div class="shop-footer">
              <span class="shop-address">📍 {{ shop.address }}</span>
              <button
                class="trade-btn"
                :disabled="!shop.isUnlocked"
                @click="openShopDetail(shop)"
              >
                {{ shop.isUnlocked ? '发起交换' : `需要 Lv.${shop.minLevel} 声望${shop.minLevel * 15}` }}
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'create' && selectedShop" class="trade-create">
          <div class="create-header">
            <div class="selected-shop-info">
              <span class="shop-avatar-sm">{{ selectedShop.avatar }}</span>
              <div>
                <div class="shop-name-sm">{{ selectedShop.name }}</div>
                <div class="shop-style">交易风格：{{ selectedShop.tradeStyle === 'generous' ? '慷慨' : selectedShop.tradeStyle === 'fair' ? '公平' : selectedShop.tradeStyle === 'tough' ? '强硬' : '精明' }}</div>
              </div>
              <button class="back-btn" @click="activeTab = 'shops'">← 返回店铺</button>
            </div>
          </div>

          <div class="trade-sections">
            <div class="trade-section">
              <div class="section-header">
                <h3>🎵 我的物品</h3>
                <span class="section-value">¥{{ totalPlayerValue.toLocaleString() }}</span>
              </div>
              <div class="items-grid">
                <div
                  v-for="item in playerTradeableItems.slice(0, 20)"
                  :key="item.type + item.record.id"
                  class="trade-item"
                  :class="{ selected: selectedPlayerItems.has(item.record.id) }"
                  @click="togglePlayerItem(item)"
                >
                  <VinylRecord :record="item.record" size="small" />
                  <div class="item-info">
                    <div class="item-title">{{ item.record.title }}</div>
                    <div class="item-artist">{{ item.record.artist }}</div>
                    <div class="item-meta">
                      <span class="rarity">{{ getRarityStars(item.record.rarity) }}</span>
                      <span class="condition">品相 {{ item.conditionScore }}</span>
                    </div>
                    <div v-if="selectedPlayerItems.has(item.record.id)" class="item-valuation">
                      估价 ¥{{ valuations.get('player_' + item.record.id)?.finalEstimatedValue?.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="cash-input">
                <label>补差价（我方支付）：</label>
                <input type="number" v-model.number="cashFromPlayer" min="0" />
              </div>
            </div>

            <div class="trade-section shop-section">
              <div class="section-header">
                <h3>🏪 对方物品</h3>
                <span class="section-value">¥{{ totalShopValue.toLocaleString() }}</span>
              </div>
              <div class="items-grid">
                <div
                  v-for="item in shopInventory"
                  :key="item.record.id"
                  class="trade-item"
                  :class="{ selected: selectedShopItems.has(item.record.id) }"
                  @click="toggleShopItem(item)"
                >
                  <VinylRecord :record="item.record" size="small" />
                  <div class="item-info">
                    <div class="item-title">{{ item.record.title }}</div>
                    <div class="item-artist">{{ item.record.artist }}</div>
                    <div class="item-meta">
                      <span class="rarity">{{ getRarityStars(item.record.rarity) }}</span>
                      <span class="condition">品相 {{ item.conditionScore }}</span>
                    </div>
                    <div class="item-note">{{ item.shopPreferenceNote }}</div>
                    <div v-if="selectedShopItems.has(item.record.id)" class="item-valuation">
                      估价 ¥{{ valuations.get('shop_' + item.record.id)?.finalEstimatedValue?.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="cash-input">
                <label>补差价（对方支付）：</label>
                <input type="number" v-model.number="cashFromShop" min="0" />
              </div>
            </div>
          </div>

          <div class="trade-summary">
            <div class="balance-display" :class="{ positive: valueBalance > 0, negative: valueBalance < 0 }">
              价值差额：{{ valueBalance > 0 ? '+' : '' }}¥{{ valueBalance.toLocaleString() }}
              <span class="balance-hint">{{ valueBalance > 50 ? '我方溢价较多，可能被还价' : valueBalance < -50 ? '对方溢价较多，可能成交' : '价值接近，合理' }}</span>
            </div>
            <button
              class="propose-btn"
              :disabled="!canProposeTrade"
              @click="proposeTrade"
            >
              💼 发起交易
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'negotiate' && selectedTrade" class="trade-negotiate">
          <div class="negotiate-header">
            <div>
              <div class="trade-title">与 {{ selectedTrade.shop.name }} 的交易</div>
              <div class="trade-meta">
                <span class="trade-type">{{ tradeTypeLabel(selectedTrade.type) }}</span>
                <span class="trade-status" :style="{ color: gameStore.getCrossShopTradeStatusColor(selectedTrade.status) }">
                  {{ gameStore.getCrossShopTradeStatusLabel(selectedTrade.status) }}
                </span>
                <span class="trade-round">第 {{ selectedTrade.currentRound }} / {{ selectedTrade.maxRounds }} 轮</span>
              </div>
            </div>
            <button class="back-btn" @click="activeTab = 'trades'; selectedTrade = null">← 返回列表</button>
          </div>

          <div class="rounds-history">
            <h4>💬 谈判记录</h4>
            <div class="rounds-list">
              <div
                v-for="round in selectedTrade.rounds"
                :key="round.round"
                class="round-item"
                :class="round.side"
              >
                <div class="round-header">
                  <span class="round-side">
                    {{ round.side === 'player' ? '👤 我' : selectedTrade.shop.avatar + ' ' + selectedTrade.shop.ownerName }}
                  </span>
                  <span v-if="round.reaction" class="round-reaction">{{ gameStore.getCrossShopReactionEmoji(round.reaction) }}</span>
                  <span class="round-num">第 {{ round.round }} 轮</span>
                </div>
                <div class="round-message">{{ round.message }}</div>
                <div class="round-items">
                  <span v-if="round.proposedItems.length > 0" class="items-count">
                    {{ round.proposedItems.length }} 张唱片
                  </span>
                  <span v-if="round.proposedCash !== 0" class="cash-amount" :class="{ positive: round.proposedCash > 0, negative: round.proposedCash < 0 }">
                    {{ round.proposedCash > 0 ? '+' : '' }}¥{{ Math.abs(round.proposedCash).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedTrade.status === 'accepted'" class="trade-accepted">
            <div class="accepted-banner">🎉 交易已达成！确认完成交易？</div>
            <div class="accepted-actions">
              <button class="confirm-btn" @click="acceptCurrentTrade">✅ 确认完成</button>
              <button class="cancel-btn" @click="cancelCurrentTrade">❌ 取消交易</button>
            </div>
          </div>

          <div v-else-if="selectedTrade.status === 'negotiating'" class="negotiate-actions">
            <div class="adjust-section">
              <h4>调整我方报价</h4>
              <div class="adjust-items">
                <div v-for="entry in Array.from(selectedPlayerItems.entries())" :key="'p_' + entry[0]" class="adjust-row">
                  <span class="adjust-name">{{ playerTradeableItems.find(i => i.record.id === entry[0])?.record.title }}</span>
                  <input type="number" v-model.number="entry[1].agreedValue" @change="adjustPlayerItemValue(entry[0], entry[1].agreedValue)" />
                </div>
              </div>
              <div class="adjust-cash">
                <label>我方现金：</label>
                <input type="number" v-model.number="cashFromPlayer" min="0" />
              </div>
            </div>
            <div class="adjust-section shop">
              <h4>调整对方报价</h4>
              <div class="adjust-items">
                <div v-for="entry in Array.from(selectedShopItems.entries())" :key="'s_' + entry[0]" class="adjust-row">
                  <span class="adjust-name">{{ shopInventory.find(i => i.record.id === entry[0])?.record.title }}</span>
                  <input type="number" v-model.number="entry[1].agreedValue" @change="adjustShopItemValue(entry[0], entry[1].agreedValue)" />
                </div>
              </div>
              <div class="adjust-cash">
                <label>对方现金：</label>
                <input type="number" v-model.number="cashFromShop" min="0" />
              </div>
            </div>
            <div class="negotiate-buttons">
              <button class="negotiate-btn" @click="continueNegotiation">🔄 提交新报价</button>
              <button class="cancel-btn" @click="cancelCurrentTrade">放弃交易</button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'trades'" class="trades-list">
          <div class="trades-subtabs">
            <button
              v-for="f in [['all', '全部'], ['active', '进行中'], ['completed', '已完成']]"
              :key="f[0]"
              class="subtab-btn"
              :class="{ active: gameStore.crossShop.tradeFilter === f[0] }"
              @click="gameStore.setCrossShopFilter(f[0] as any)"
            >{{ f[1] }}</button>
          </div>
          <div v-if="gameStore.getCrossShopFilteredTrades().length === 0" class="empty-state">
            暂无交易记录
          </div>
          <div
            v-for="trade in gameStore.getCrossShopFilteredTrades()"
            :key="trade.id"
            class="trade-card"
            @click="openTradeDetail(trade)"
          >
            <div class="trade-card-header">
              <div class="trade-shop">
                {{ trade.shop.avatar }} {{ trade.shop.name }}
              </div>
              <span class="trade-status-badge" :style="{ backgroundColor: gameStore.getCrossShopTradeStatusColor(trade.status) }">
                {{ gameStore.getCrossShopTradeStatusLabel(trade.status) }}
              </span>
            </div>
            <div class="trade-card-body">
              <div class="trade-side">
                <div class="side-label">我方</div>
                <div class="side-items">
                  <span>{{ trade.playerItems.length }} 张唱片</span>
                  <span v-if="trade.cashFromPlayer > 0">+ ¥{{ trade.cashFromPlayer.toLocaleString() }}</span>
                </div>
              </div>
              <div class="trade-arrow">⇄</div>
              <div class="trade-side">
                <div class="side-label">对方</div>
                <div class="side-items">
                  <span>{{ trade.shopItems.length }} 张唱片</span>
                  <span v-if="trade.cashFromShop > 0">+ ¥{{ trade.cashFromShop.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <div class="trade-card-footer">
              <span class="trade-type-mini">{{ tradeTypeLabel(trade.type) }}</span>
              <span class="trade-rounds">第 {{ trade.currentRound }}/{{ trade.maxRounds }} 轮</span>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'stats'" class="stats-panel">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-value">{{ stats.totalTradesProposed }}</div>
              <div class="stat-label">发起交易</div>
            </div>
            <div class="stat-card success">
              <div class="stat-icon">✅</div>
              <div class="stat-value">{{ stats.totalTradesCompleted }}</div>
              <div class="stat-label">成功交易</div>
            </div>
            <div class="stat-card rate">
              <div class="stat-icon">📈</div>
              <div class="stat-value">{{ stats.successfulTradeRate }}%</div>
              <div class="stat-label">成功率</div>
            </div>
            <div class="stat-card records">
              <div class="stat-icon">💿</div>
              <div class="stat-value">{{ stats.totalRecordsReceived }}</div>
              <div class="stat-label">获得唱片</div>
            </div>
            <div class="stat-card cash">
              <div class="stat-icon">💰</div>
              <div class="stat-value">{{ stats.totalCashEarned > stats.totalCashSpent ? '+' : '' }}¥{{ (stats.totalCashEarned - stats.totalCashSpent).toLocaleString() }}</div>
              <div class="stat-label">现金净流入</div>
            </div>
            <div class="stat-card rep">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">+{{ stats.totalReputationGained }}</div>
              <div class="stat-label">声望增益</div>
            </div>
            <div class="stat-card ency">
              <div class="stat-icon">📖</div>
              <div class="stat-value">{{ stats.newEncyclopediaEntriesFromTrading }}</div>
              <div class="stat-label">图鉴新增</div>
            </div>
            <div class="stat-card series">
              <div class="stat-icon">📚</div>
              <div class="stat-value">{{ stats.seriesUnlockedViaTrading }}</div>
              <div class="stat-label">系列解锁</div>
            </div>
          </div>

          <div class="notifications-section" v-if="gameStore.crossShop.notifications.length > 0">
            <h4>📬 系统通知</h4>
            <div class="notifications-list">
              <div
                v-for="n in gameStore.crossShop.notifications.slice(0, 15)"
                :key="n.id"
                class="notification-item"
                :class="n.type"
              >
                <span class="notif-icon">{{ n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
                <span class="notif-message">{{ n.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cross-shop-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.cross-shop-modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.message-bar {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
}

.message-bar.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.message-bar.error {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent-gold);
  color: var(--bg-card);
  font-weight: 600;
}

.tab-icon {
  font-size: 16px;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.shops-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.shop-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.shop-card:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

.shop-card.locked {
  opacity: 0.6;
}

.shop-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.shop-avatar {
  font-size: 36px;
  background: var(--bg-primary);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.shop-type-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border-radius: 10px;
  margin-left: 6px;
  color: var(--text-secondary);
  font-weight: normal;
}

.shop-owner {
  font-size: 12px;
  color: var(--text-muted);
}

.shop-reputation {
  text-align: right;
}

.rep-score {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
}

.trust-level {
  font-size: 11px;
  color: var(--text-muted);
}

.shop-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
}

.shop-quote {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  margin-bottom: 12px;
}

.shop-preferences {
  margin-bottom: 12px;
}

.pref-row {
  display: flex;
  font-size: 12px;
  margin-bottom: 4px;
}

.pref-label {
  color: var(--text-muted);
  min-width: 70px;
}

.pref-tags {
  color: var(--text-secondary);
}

.pref-tags.generous { color: #10B981; }
.pref-tags.fair { color: #3B82F6; }
.pref-tags.tough { color: #EF4444; }
.pref-tags.shrewd { color: #8B5CF6; }

.shop-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.shop-address {
  font-size: 12px;
  color: var(--text-muted);
}

.trade-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: opacity 0.2s;
}

.trade-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-header {
  margin-bottom: 16px;
}

.selected-shop-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shop-avatar-sm {
  font-size: 28px;
}

.shop-name-sm {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.shop-style {
  font-size: 12px;
  color: var(--text-muted);
}

.back-btn {
  margin-left: auto;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
}

.back-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.trade-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.trade-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
}

.section-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.trade-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.trade-item:hover {
  background: var(--bg-secondary);
}

.trade-item.selected {
  border-color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.1);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.item-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.item-note {
  font-size: 11px;
  color: var(--accent-gold);
  margin-top: 4px;
}

.item-valuation {
  font-size: 12px;
  font-weight: 600;
  color: #10B981;
  margin-top: 4px;
}

.rarity {
  font-size: 10px;
}

.condition {
  padding: 1px 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.cash-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.cash-input label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 100px;
}

.cash-input input {
  flex: 1;
  padding: 6px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.trade-summary {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-display {
  font-size: 16px;
  font-weight: 600;
}

.balance-display.positive {
  color: #10B981;
}

.balance-display.negative {
  color: #EF4444;
}

.balance-hint {
  font-size: 12px;
  font-weight: normal;
  color: var(--text-muted);
  margin-left: 8px;
}

.propose-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.propose-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.negotiate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.trade-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.trade-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
}

.trade-type {
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.trade-status {
  font-weight: 600;
}

.trade-round {
  color: var(--text-muted);
}

.rounds-history {
  margin-bottom: 20px;
}

.rounds-history h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.rounds-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.round-item {
  padding: 12px;
  border-radius: 10px;
  max-width: 80%;
}

.round-item.player {
  background: rgba(246, 224, 94, 0.1);
  align-self: flex-end;
}

.round-item.shop {
  background: var(--bg-secondary);
  align-self: flex-start;
}

.round-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.round-side {
  font-weight: 600;
  color: var(--text-primary);
}

.round-reaction {
  font-size: 16px;
}

.round-num {
  margin-left: auto;
  color: var(--text-muted);
}

.round-message {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.round-items {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.items-count {
  color: var(--text-secondary);
}

.cash-amount {
  font-weight: 600;
}

.cash-amount.positive {
  color: #10B981;
}

.cash-amount.negative {
  color: #EF4444;
}

.trade-accepted {
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.accepted-banner {
  font-size: 18px;
  font-weight: 600;
  color: #10B981;
  margin-bottom: 16px;
}

.accepted-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-btn, .cancel-btn, .negotiate-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.negotiate-btn {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: white;
}

.negotiate-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.adjust-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.adjust-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--text-primary);
}

.adjust-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.adjust-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.adjust-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adjust-row input {
  width: 100px;
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.adjust-cash {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.adjust-cash label {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 70px;
}

.adjust-cash input {
  flex: 1;
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.negotiate-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.trades-subtabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.subtab-btn {
  padding: 6px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
}

.subtab-btn.active {
  background: var(--accent-gold);
  color: var(--bg-card);
  border-color: var(--accent-gold);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.trade-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.trade-card:hover {
  border-color: var(--accent-gold);
  transform: translateX(4px);
}

.trade-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trade-shop {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.trade-status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.trade-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.trade-side {
  flex: 1;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 10px;
}

.side-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.side-items {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  gap: 8px;
}

.trade-arrow {
  font-size: 20px;
  color: var(--accent-gold);
}

.trade-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.stats-panel {
  max-width: 900px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid var(--border);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-card.success .stat-value { color: #10B981; }
.stat-card.rate .stat-value { color: #3B82F6; }
.stat-card.records .stat-value { color: #8B5CF6; }
.stat-card.cash .stat-value { color: var(--accent-gold); }
.stat-card.rep .stat-value { color: #F59E0B; }
.stat-card.ency .stat-value { color: #EC4899; }
.stat-card.series .stat-value { color: #14B8A6; }

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.notifications-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
}

.notification-item.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.notification-item.error {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.notification-item.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.notification-item.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.notif-icon {
  font-size: 16px;
}

.notif-message {
  flex: 1;
}
</style>
