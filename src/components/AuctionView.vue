<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { AuctionItem } from '@/types'
import { getMinNextBid } from '@/data/auctions'
import RecordCard from './RecordCard.vue'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const showBidModal = ref(false)
const bidAmount = ref(0)
const showSettlementModal = ref(false)
const addToCollectionOption = ref(true)
const searchQuery = ref('')
const toastMessage = ref('')
const showToast = ref(false)

const filters = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'active', label: '进行中', icon: '🔥' },
  { key: 'upcoming', label: '即将开始', icon: '⏰' },
  { key: 'ended', label: '已结束', icon: '✅' },
  { key: 'rare', label: '珍稀拍品', icon: '💎' },
  { key: 'collector', label: '藏家推荐', icon: '🎩' }
]

const displayedAuctions = computed(() => {
  let items = gameStore.getFilteredAuctions
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(a => 
      a.record.title.toLowerCase().includes(q) ||
      a.record.artist.toLowerCase().includes(q) ||
      a.record.genre.toLowerCase().includes(q)
    )
  }
  return items
})

const getStatusBadge = (auction: AuctionItem) => {
  switch (auction.status) {
    case 'active': return { label: '竞价中', class: 'status-active' }
    case 'upcoming': return { label: '即将开始', class: 'status-upcoming' }
    case 'ended': return { label: '待结算', class: 'status-ended' }
    case 'settled': return { label: '已成交', class: 'status-settled' }
    case 'cancelled': return { label: '已取消', class: 'status-cancelled' }
    default: return { label: '未知', class: '' }
  }
}

const formatTime = (day: number) => `第${day}天`

const getTimeLeft = (auction: AuctionItem) => {
  if (auction.status === 'upcoming') {
    const diff = auction.startTime - gameStore.currentDay
    return diff > 0 ? `${diff}天后开始` : '今日开始'
  }
  if (auction.status === 'active') {
    const diff = auction.endTime - gameStore.currentDay
    return diff > 0 ? `剩余${diff}天` : '今日结束'
  }
  return '已结束'
}

const openBidModal = (auction: AuctionItem) => {
  gameStore.selectAuction(auction.id)
  const minBid = getMinNextBid(auction)
  bidAmount.value = minBid
  showBidModal.value = true
}

const closeBidModal = () => {
  showBidModal.value = false
  bidAmount.value = 0
}

const confirmBid = () => {
  const auctionId = gameStore.selectedAuctionId
  if (!auctionId) return
  const result = gameStore.placeAuctionBid(auctionId, bidAmount.value)
  showNotification(result.message)
  closeBidModal()
}

const quickBid = (auction: AuctionItem, increment: number = 1) => {
  const currentMin = getMinNextBid(auction)
  const bid = currentMin + auction.minBidIncrement * (increment - 1)
  const result = gameStore.placeAuctionBid(auction.id, bid)
  showNotification(result.message)
}

const openSettlement = (auction: AuctionItem) => {
  gameStore.selectAuction(auction.id)
  addToCollectionOption.value = true
  showSettlementModal.value = true
}

const closeSettlement = () => {
  showSettlementModal.value = false
}

const confirmSettlement = () => {
  const auctionId = gameStore.selectedAuctionId
  if (!auctionId) return
  const result = gameStore.settleAuction(auctionId, addToCollectionOption.value)
  showNotification(result.message)
  closeSettlement()
}

const settleAll = () => {
  const results = gameStore.settleAllEndedAuctions(true)
  if (results.length > 0) {
    showNotification(`已结算${results.length}个拍卖`)
  } else {
    showNotification('没有待结算的拍卖')
  }
}

const acceptOffer = (collectorId: string, recordId: string | null) => {
  const offerId = recordId ? `${collectorId}-${recordId}` : collectorId
  const result = gameStore.acceptCollectorOffer(offerId)
  showNotification(result.message)
}

const showNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const selectedAuctionDetails = computed(() => gameStore.getSelectedAuction)

const isPlayerWinning = (auction: AuctionItem) => {
  if (auction.bidHistory.length === 0) return false
  return auction.bidHistory[auction.bidHistory.length - 1].bidderId === 'player'
}

const getBidderAvatar = (bidderId: string, bidderAvatar: string) => {
  if (bidderId === 'player') return '🧑'
  return bidderAvatar
}

const getBidderName = (bidderId: string, bidderName: string) => {
  if (bidderId === 'player') return '我'
  return bidderName
}

const pendingOffers = computed(() => {
  return gameStore.pendingCollectorOffers.filter(o => !o.isAccepted && o.expirationTime >= gameStore.currentDay)
})

const getOfferTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'private_sale': '私售',
    'commission': '委托',
    'trade': '交换'
  }
  return map[type] || type
}
</script>

<template>
  <div class="auction-view-overlay" @click.self="emit('close')">
    <div class="auction-view-container">
      <div class="auction-view-header">
        <h2>🔨 唱片拍卖行</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div v-if="showToast" class="toast">{{ toastMessage }}</div>
      
      <div class="auction-header">
        <div class="header-title">
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-label">可用资金</span>
              <span class="stat-value">¥{{ gameStore.availableBudgetForAuctions.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔒</span>
              <span class="stat-label">冻结资金</span>
              <span class="stat-value frozen">¥{{ gameStore.totalFrozenFunds.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <span class="stat-label">总成交</span>
              <span class="stat-value">{{ gameStore.auctionHouseStats.totalAuctionsSold }}/{{ gameStore.auctionHouseStats.totalAuctionsHeld }}</span>
            </div>
            <div class="stat-item" v-if="gameStore.endedAuctions.length > 0">
              <button class="settle-all-btn" @click="settleAll">
                📦 批量结算 ({{ gameStore.endedAuctions.filter(a => a.status === 'ended').length }})
              </button>
            </div>
          </div>
        </div>
      </div>

    <div v-if="pendingOffers.length > 0" class="collector-offers">
      <h3>🎩 稀有收藏家特惠</h3>
      <div class="offers-list">
        <div v-for="offer in pendingOffers" :key="`${offer.collectorId}-${offer.recordId}`" class="offer-card">
          <div class="offer-header">
            <span class="offer-collector">{{ offer.collectorName }}</span>
            <span class="offer-type">{{ getOfferTypeLabel(offer.offerType) }}</span>
          </div>
          <p class="offer-desc">{{ offer.description }}</p>
          <div class="offer-price">
            <span>价格: ¥{{ offer.offerPrice.toLocaleString() }}</span>
            <span class="offer-expire">有效期至 第{{ offer.expirationTime }}天</span>
          </div>
          <div class="offer-bonuses">
            <span v-for="(b, i) in offer.bonusRewards" :key="i" class="bonus-tag">🎁 {{ b }}</span>
          </div>
          <button 
            class="accept-offer-btn"
            :disabled="gameStore.budget < offer.offerPrice"
            @click="acceptOffer(offer.collectorId, offer.recordId)"
          >
            {{ gameStore.budget < offer.offerPrice ? '资金不足' : '接受交易' }}
          </button>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="f in filters"
          :key="f.key"
          :class="['filter-btn', { active: gameStore.selectedAuctionFilter === f.key }]"
          @click="gameStore.setAuctionFilter(f.key)"
        >
          <span class="filter-icon">{{ f.icon }}</span>
          <span class="filter-label">{{ f.label }}</span>
        </button>
      </div>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 搜索唱片、艺人或流派..."
          class="search-input"
        />
      </div>
    </div>

    <div class="auctions-grid">
      <div 
        v-for="auction in displayedAuctions" 
        :key="auction.id" 
        class="auction-card"
        :class="{ rare: auction.isRareItem, linked: auction.linkedRareCustomerId }"
      >
        <div class="auction-status-badge" :class="getStatusBadge(auction).class">
          {{ getStatusBadge(auction).label }}
        </div>
        
        <div v-if="auction.isRareItem" class="rare-badge">💎 珍稀</div>
        <div v-if="auction.linkedRareCustomerId" class="collector-badge">
          🎩 {{ gameStore.getCollectorInfo(auction.linkedRareCustomerId)?.name }}推荐
        </div>

        <div class="card-header">
          <RecordCard :record="auction.record" :show-price="false" :show-cost="false" :condition-score="auction.conditionScoreAtStart" />
        </div>

        <div class="auction-info">
          <div class="info-row">
            <span class="info-label">来源</span>
            <span class="info-value">{{ auction.sourceIcon }} {{ auction.sourceName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">起拍价</span>
            <span class="info-value">¥{{ auction.startingPrice.toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">保留价</span>
            <span class="info-value">{{ auction.currentBid >= auction.reservePrice ? '✅ 已达' : '🔒 保密' }}</span>
          </div>
          <div class="info-row highlight">
            <span class="info-label">当前出价</span>
            <span class="info-value price">¥{{ auction.currentBid.toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">加价幅度</span>
            <span class="info-value">¥{{ auction.minBidIncrement.toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">出价次数</span>
            <span class="info-value">{{ auction.bidCount }} 次</span>
          </div>
          <div class="info-row">
            <span class="info-label">时间</span>
            <span class="info-value">{{ getTimeLeft(auction) }}</span>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: gameStore.getAuctionProgress(auction) + '%' }"
            ></div>
          </div>
        </div>

        <div class="provenance-text">
          <span class="provenance-label">📜 来源背景:</span>
          <p class="provenance-content">{{ auction.provenance }}</p>
        </div>

        <div v-if="auction.bidHistory.length > 0" class="bid-history-preview">
          <div class="history-title">最近出价</div>
          <div 
            v-for="(bid, idx) in auction.bidHistory.slice(-3).reverse()" 
            :key="bid.id" 
            class="bid-item"
            :class="{ winning: idx === 0 && bid.isWinningBid, mine: bid.bidderId === 'player' }"
          >
            <span class="bid-avatar">{{ getBidderAvatar(bid.bidderId, bid.bidderAvatar) }}</span>
            <span class="bid-name">{{ getBidderName(bid.bidderId, bid.bidderName) }}</span>
            <span class="bid-amount">¥{{ bid.bidAmount.toLocaleString() }}</span>
          </div>
        </div>

        <div class="auction-actions">
          <template v-if="auction.status === 'active'">
            <div class="quick-bids">
              <button 
                class="quick-bid-btn" 
                :disabled="gameStore.availableBudgetForAuctions < getMinNextBid(auction)"
                @click="quickBid(auction, 1)"
              >
                +1档
              </button>
              <button 
                class="quick-bid-btn" 
                :disabled="gameStore.availableBudgetForAuctions < getMinNextBid(auction) + auction.minBidIncrement"
                @click="quickBid(auction, 3)"
              >
                +3档
              </button>
              <button 
                class="quick-bid-btn" 
                :disabled="gameStore.availableBudgetForAuctions < getMinNextBid(auction) + auction.minBidIncrement * 4"
                @click="quickBid(auction, 5)"
              >
                +5档
              </button>
            </div>
            <button 
              class="bid-btn primary"
              :disabled="gameStore.availableBudgetForAuctions < getMinNextBid(auction)"
              @click="openBidModal(auction)"
            >
              自定义出价
            </button>
            <div v-if="isPlayerWinning(auction)" class="winning-tag">
              🏆 您领先
            </div>
          </template>
          
          <template v-else-if="auction.status === 'ended'">
            <button 
              v-if="auction.winnerId === 'player'"
              class="bid-btn success"
              @click="openSettlement(auction)"
            >
              🎉 结算入藏
            </button>
            <button 
              v-else
              class="bid-btn"
              @click="openSettlement(auction)"
            >
              查看结果
            </button>
          </template>
          
          <template v-else-if="auction.status === 'settled'">
            <div class="settled-info">
              <span v-if="auction.winnerId === 'player'">✅ 已入藏</span>
              <span v-else>📦 已完成</span>
            </div>
          </template>
          
          <template v-else-if="auction.status === 'upcoming'">
            <div class="upcoming-info">
              {{ formatTime(auction.startTime) }} 开始
            </div>
          </template>
          
          <template v-else-if="auction.status === 'cancelled'">
            <div class="cancelled-info">❌ 已流拍</div>
          </template>
        </div>
      </div>

      <div v-if="displayedAuctions.length === 0" class="empty-state">
        <div class="empty-icon">🎵</div>
        <h3>暂无拍卖品</h3>
        <p>稍等片刻，新的拍品即将上架...</p>
      </div>
    </div>

    <div v-if="showBidModal && selectedAuctionDetails" class="modal-overlay" @click.self="closeBidModal">
      <div class="modal bid-modal">
      <div class="modal-header">
        <h3>🎯 出价竞拍</h3>
        <button class="close-btn" @click="closeBidModal">×</button>
      </div>
      <div class="modal-body">
        <div class="bid-auction-info">
          <h4>{{ selectedAuctionDetails.record.title }}</h4>
          <p class="artist">{{ selectedAuctionDetails.record.artist }}</p>
          <div class="bid-price-info">
            <div class="price-row">
              <span>当前出价</span>
              <span class="current-price">¥{{ selectedAuctionDetails.currentBid.toLocaleString() }}</span>
            </div>
            <div class="price-row">
              <span>最低加价</span>
              <span>¥{{ selectedAuctionDetails.minBidIncrement.toLocaleString() }}</span>
            </div>
            <div class="price-row highlight">
              <span>最低可出价</span>
              <span class="min-bid">¥{{ getMinNextBid(selectedAuctionDetails).toLocaleString() }}</span>
            </div>
          </div>
          <div class="bid-input-section">
            <label>您的出价 (¥)</label>
            <input 
              v-model.number="bidAmount"
              type="number"
              :min="getMinNextBid(selectedAuctionDetails)"
              :step="selectedAuctionDetails.minBidIncrement"
              class="bid-input"
            />
            <div class="bid-quick-select">
              <button @click="bidAmount = getMinNextBid(selectedAuctionDetails)">最低</button>
              <button @click="bidAmount = getMinNextBid(selectedAuctionDetails) + selectedAuctionDetails.minBidIncrement * 2">+2档</button>
              <button @click="bidAmount = getMinNextBid(selectedAuctionDetails) + selectedAuctionDetails.minBidIncrement * 5">+5档</button>
              <button @click="bidAmount = Math.round(getMinNextBid(selectedAuctionDetails) * 1.2)">+20%</button>
            </div>
          </div>
          <div class="bid-budget-info">
            <span>可用资金: ¥{{ gameStore.availableBudgetForAuctions.toLocaleString() }}</span>
            <span :class="{ insufficient: bidAmount > gameStore.availableBudgetForAuctions }">
              {{ bidAmount > gameStore.availableBudgetForAuctions ? '⚠️ 资金不足' : '✓ 资金充足' }}
            </span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeBidModal">取消</button>
        <button 
          class="btn-confirm"
          :disabled="bidAmount < getMinNextBid(selectedAuctionDetails) || bidAmount > gameStore.availableBudgetForAuctions"
          @click="confirmBid"
        >
          确认出价 ¥{{ bidAmount.toLocaleString() }}
        </button>
      </div>
    </div>
    </div>

    <div v-if="showSettlementModal && selectedAuctionDetails" class="modal-overlay" @click.self="closeSettlement">
      <div class="modal settlement-modal">
      <div class="modal-header">
        <h3>📦 拍卖结算</h3>
        <button class="close-btn" @click="closeSettlement">×</button>
      </div>
      <div class="modal-body">
        <div v-if="selectedAuctionDetails.winnerId === 'player'" class="settlement-winner">
          <div class="winner-badge">🎉 恭喜您赢得了本次拍卖！</div>
          <div class="settlement-details">
            <div class="detail-row">
              <span>拍品</span>
              <span class="strong">{{ selectedAuctionDetails.record.title }}</span>
            </div>
            <div class="detail-row">
              <span>成交价格</span>
              <span class="price">¥{{ selectedAuctionDetails.finalSalePrice?.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span>拍卖行手续费 (8%)</span>
              <span class="fee">-¥{{ Math.round((selectedAuctionDetails.finalSalePrice || 0) * 0.08).toLocaleString() }}</span>
            </div>
            <div class="detail-row total">
              <span>总计支付</span>
              <span class="total-price">¥{{ ((selectedAuctionDetails.finalSalePrice || 0) + Math.round((selectedAuctionDetails.finalSalePrice || 0) * 0.08)).toLocaleString() }}</span>
            </div>
          </div>
          <div class="settlement-option">
            <label class="option-label">
              <input type="radio" v-model="addToCollectionOption" :value="true" />
              <span>📚 加入收藏 (推荐，可激活图鉴)</span>
            </label>
            <label class="option-label">
              <input type="radio" v-model="addToCollectionOption" :value="false" />
              <span>🛒 加入库存 (可用于销售)</span>
            </label>
          </div>
        </div>
        <div v-else class="settlement-loser">
          <div class="loser-badge">
            {{ selectedAuctionDetails.winnerName ? `${selectedAuctionDetails.winnerName} 赢得了本次拍卖` : '本次拍卖流拍' }}
          </div>
          <p>您的冻结资金将自动解冻</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-confirm full" @click="confirmSettlement">
          {{ selectedAuctionDetails.winnerId === 'player' ? '确认结算' : '确认' }}
        </button>
      </div>
    </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.auction-view-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auction-view-container {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  padding: 20px;
}

.auction-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.auction-view-header h2 {
  margin: 0;
  color: var(--accent-gold);
  font-size: 22px;
}

.auction-view-header .close-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.auction-view-header .close-btn:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.auction-view {
  position: relative;
}

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-gold);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.auction-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.header-title h2 {
  margin: 0 0 12px 0;
  color: var(--accent-gold);
  font-size: 24px;
}

.header-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 14px;
  border-radius: 8px;
}

.stat-icon { font-size: 18px; }
.stat-label { font-size: 12px; color: var(--text-muted); }
.stat-value { font-weight: 600; color: var(--text-primary); }
.stat-value.frozen { color: var(--warning); }

.settle-all-btn {
  margin-left: auto;
  background: var(--success);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.settle-all-btn:hover {
  background: #219653;
  transform: translateY(-1px);
}

.collector-offers {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.collector-offers h3 {
  margin: 0 0 12px 0;
  color: var(--accent-gold);
  font-size: 16px;
}

.offers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.offer-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.offer-collector {
  font-weight: 600;
  color: var(--text-primary);
}

.offer-type {
  background: var(--accent-gold);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.offer-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.offer-price {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.offer-expire {
  color: var(--text-muted);
  font-size: 11px;
}

.offer-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.bonus-tag {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.accept-offer-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-offer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.accept-offer-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.filter-btn:hover {
  border-color: var(--accent-gold);
}

.filter-btn.active {
  background: var(--accent-gold);
  color: white;
  border-color: var(--accent-gold);
}

.filter-icon { font-size: 14px; }
.filter-label { font-size: 13px; font-weight: 500; }

.search-box {
  margin-left: auto;
}

.search-input {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 8px;
  color: var(--text-primary);
  width: 260px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--accent-gold);
}

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.auction-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 14px;
  padding: 16px;
  border: 2px solid var(--border);
  transition: all 0.25s ease;
  overflow: hidden;
}

.auction-card.rare {
  border-color: rgba(233, 69, 96, 0.5);
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.1);
}

.auction-card.linked {
  border-color: rgba(245, 158, 11, 0.5);
}

.auction-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.auction-status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  z-index: 2;
}

.status-active { background: var(--danger); color: white; }
.status-upcoming { background: var(--info); color: white; }
.status-ended { background: var(--warning); color: #1a1a2e; }
.status-settled { background: var(--success); color: white; }
.status-cancelled { background: var(--text-muted); color: white; }

.rare-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #f6e05e, #f6ad55);
  color: #1a1a2e;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
}

.collector-badge {
  position: absolute;
  top: 42px;
  left: 10px;
  background: linear-gradient(135deg, #9f7aea, #b794f4);
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  z-index: 2;
}

.card-header {
  margin-bottom: 12px;
}

.auction-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-row.highlight {
  background: var(--bg-secondary);
  padding: 6px 10px;
  border-radius: 6px;
  margin: 4px 0;
}

.info-label {
  color: var(--text-muted);
}

.info-value {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value.price {
  color: var(--accent-gold);
  font-weight: 700;
  font-size: 15px;
}

.progress-section {
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-orange));
  transition: width 0.3s;
}

.provenance-text {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid var(--accent-orange);
  padding: 8px 10px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 12px;
}

.provenance-label {
  font-size: 11px;
  color: var(--accent-orange);
  font-weight: 600;
}

.provenance-content {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.bid-history-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 12px;
}

.history-title {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 600;
}

.bid-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid var(--border);
}

.bid-item:last-child { border-bottom: none; }
.bid-item.winning { color: var(--success); }
.bid-item.mine { color: var(--accent-gold); }

.bid-avatar { font-size: 14px; }
.bid-name { flex: 1; color: var(--text-secondary); }
.bid-amount { font-weight: 600; }

.auction-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-bids {
  display: flex;
  gap: 6px;
}

.quick-bid-btn {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-bid-btn:hover:not(:disabled) {
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
}

.quick-bid-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bid-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  color: white;
}

.bid-btn.primary {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
}

.bid-btn.success {
  background: linear-gradient(135deg, var(--success), #10b981);
}

.bid-btn.primary:disabled,
.bid-btn.success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bid-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.winning-tag {
  text-align: center;
  padding: 8px;
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.settled-info,
.upcoming-info,
.cancelled-info {
  text-align: center;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
}

.btn-confirm {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm.full {
  flex: none;
  width: 100%;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bid-auction-info h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 18px;
}

.bid-auction-info .artist {
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.bid-price-info {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.price-row.highlight {
  border-top: 1px solid var(--border);
  margin-top: 6px;
  padding-top: 10px;
}

.current-price {
  color: var(--accent-gold);
  font-weight: 700;
  font-size: 16px;
}

.min-bid {
  color: var(--success);
  font-weight: 700;
}

.bid-input-section {
  margin-bottom: 16px;
}

.bid-input-section label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.bid-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;
}

.bid-input:focus {
  border-color: var(--accent-gold);
}

.bid-quick-select {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.bid-quick-select button {
  flex: 1;
  padding: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.bid-quick-select button:hover {
  border-color: var(--accent-gold);
}

.bid-budget-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
}

.bid-budget-info .insufficient {
  color: var(--danger);
}

.settlement-winner,
.settlement-loser {
  text-align: center;
}

.winner-badge,
.loser-badge {
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 16px;
}

.winner-badge {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
  color: var(--success);
  border: 1px solid var(--success);
}

.loser-badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.settlement-details {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.detail-row.total {
  border-top: 2px solid var(--border);
  margin-top: 8px;
  padding-top: 12px;
}

.detail-row .strong {
  font-weight: 600;
  color: var(--text-primary);
}

.detail-row .price {
  color: var(--accent-gold);
  font-weight: 600;
}

.detail-row .fee {
  color: var(--danger);
}

.detail-row.total .total-price {
  color: var(--success);
  font-size: 18px;
  font-weight: 700;
}

.settlement-option {
  text-align: left;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}

.option-label input[type="radio"] {
  accent-color: var(--accent-gold);
}

.settlement-loser p {
  color: var(--text-muted);
  font-size: 14px;
}
</style>
