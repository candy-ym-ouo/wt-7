<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, onMounted } from 'vue'
import type { SecondHandAppraisal, SecondHandInventoryItem } from '@/types'
import VinylRecord from './VinylRecord.vue'

const emit = defineEmits<{ close: [] }>()

const gameStore = useGameStore()

type Tab = 'appraisal' | 'inventory' | 'split' | 'sales' | 'reputation'
const activeTab = ref<Tab>('appraisal')

const selectedAppraisal = ref<SecondHandAppraisal | null>(null)
const appraisalConditionScore = ref(60)
const appraisalResult = ref<any>(null)
const negotiatedPrice = ref(0)
const showAppraisalModal = ref(false)
const rejectReason = ref('')
const showRejectModal = ref(false)

const selectedInventoryItem = ref<SecondHandInventoryItem | null>(null)
const adjustedPrice = ref(0)
const showPriceModal = ref(false)

const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 2500)
}

const tabs = [
  { key: 'appraisal', label: '估价流程', icon: '🔍' },
  { key: 'inventory', label: '库存入库', icon: '📦' },
  { key: 'split', label: '售价分成', icon: '💰' },
  { key: 'sales', label: '成交记录', icon: '📋' },
  { key: 'reputation', label: '信誉影响', icon: '⭐' }
]

onMounted(() => {
  gameStore.refreshSecondHandAppraisals()
  gameStore.markSecondHandNotificationsRead()
})

const pendingAppraisals = computed(() => gameStore.secondHandPendingAppraisals)
const inStockItems = computed(() => gameStore.secondHandInStockItems)
const saleRecords = computed(() => gameStore.secondHandSoldItems)
const reputationChanges = computed(() => gameStore.secondHand.reputationChanges.slice(0, 30))
const sellerProfiles = computed(() => gameStore.secondHand.sellerProfiles)
const stats = computed(() => gameStore.secondHand.stats)

const openAppraisalDetail = (appraisal: SecondHandAppraisal) => {
  selectedAppraisal.value = appraisal
  appraisalConditionScore.value = 60
  appraisalResult.value = null
  negotiatedPrice.value = 0
  showAppraisalModal.value = true
}

const doAppraisal = () => {
  if (!selectedAppraisal.value) return
  const result = gameStore.performSecondHandAppraisal(
    selectedAppraisal.value.id,
    appraisalConditionScore.value
  )
  if (result.success) {
    appraisalResult.value = result
    negotiatedPrice.value = selectedAppraisal.value.source === 'recycle'
      ? (result.suggestedRecyclePrice ?? 0)
      : (result.suggestedConsignmentPrice ?? 0)
  } else {
    showMessage(result.message, 'error')
  }
}

const acceptAppraisal = () => {
  if (!selectedAppraisal.value || !appraisalResult.value) return
  const result = gameStore.acceptSecondHandAppraisal(
    selectedAppraisal.value.id,
    negotiatedPrice.value
  )
  if (result.success) {
    showMessage(result.message, 'success')
    closeAppraisalModal()
  } else {
    showMessage(result.message, 'error')
  }
}

const openRejectModal = () => {
  rejectReason.value = ''
  showRejectModal.value = true
}

const doReject = () => {
  if (!selectedAppraisal.value) return
  const finalReason = rejectReason.value || '品相不符合标准'
  const result = gameStore.rejectSecondHandAppraisal(
    selectedAppraisal.value.id,
    finalReason
  )
  if (result.success) {
    showMessage(result.message, 'success')
    showRejectModal.value = false
    closeAppraisalModal()
  } else {
    showMessage(result.message, 'error')
  }
}

const closeAppraisalModal = () => {
  showAppraisalModal.value = false
  selectedAppraisal.value = null
  appraisalResult.value = null
  rejectReason.value = ''
  showRejectModal.value = false
}

const openPriceAdjust = (item: SecondHandInventoryItem) => {
  selectedInventoryItem.value = item
  adjustedPrice.value = item.currentPrice
  showPriceModal.value = true
}

const confirmPriceAdjust = () => {
  if (!selectedInventoryItem.value) return
  const result = gameStore.adjustSecondHandPrice(
    selectedInventoryItem.value.id,
    adjustedPrice.value
  )
  if (result.success) {
    showMessage(result.message, 'success')
    showPriceModal.value = false
  } else {
    showMessage(result.message, 'error')
  }
}

const getUrgencyLabel = (u: string) => u === 'high' ? '紧急' : u === 'normal' ? '普通' : '不急'
const getUrgencyColor = (u: string) => u === 'high' ? '#f56565' : u === 'normal' ? '#ed8936' : '#a0aec0'
const getRiskLabel = (r: string) => r === 'high' ? '高风险' : r === 'medium' ? '中等' : '低风险'
const getRiskColor = (r: string) => r === 'high' ? '#f56565' : r === 'medium' ? '#ed8936' : '#48bb78'

const profitPreview = computed(() => {
  if (!selectedInventoryItem.value) return 0
  return adjustedPrice.value - selectedInventoryItem.value.actualCostPrice
})
</script>

<template>
  <div class="secondhand-view">
    <div class="modal-backdrop" @click="emit('close')">
      <div class="modal-panel" @click.stop>
        <div class="panel-header">
          <h2 class="panel-title">♻️ 二手回收与寄售</h2>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="stats-summary card">
          <div class="stat-box">
            <span class="stat-icon">🔍</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.pendingAppraisals }}</span>
              <span class="stat-label">待估价</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-icon">📦</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalInventoryItems }}</span>
              <span class="stat-label">在售</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-icon">💵</span>
            <div class="stat-info">
              <span class="stat-value">¥{{ stats.totalShopProfit }}</span>
              <span class="stat-label">总利润</span>
            </div>
          </div>
          <div class="stat-box reputation" :class="{ positive: stats.totalReputationImpact > 0, negative: stats.totalReputationImpact < 0 }">
            <span class="stat-icon">⭐</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalReputationImpact > 0 ? '+' : '' }}{{ stats.totalReputationImpact }}</span>
              <span class="stat-label">信誉影响</span>
            </div>
          </div>
        </div>

        <div class="tabs-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key as Tab"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
            <span v-if="tab.key === 'appraisal' && pendingAppraisals.length > 0" class="tab-badge">
              {{ pendingAppraisals.length }}
            </span>
          </button>
        </div>

        <p v-if="message" class="flash-message" :class="messageType">{{ message }}</p>

        <div class="tab-content">

          <div v-if="activeTab === 'appraisal'" class="tab-pane">
            <div class="section-header">
              <h3>估价队列</h3>
              <p class="section-hint">对卖家提交的二手唱片进行估价、决定回收或接收寄售</p>
            </div>

            <div v-if="pendingAppraisals.length === 0" class="empty-state card">
              <div class="empty-icon">📭</div>
              <p>暂无待估价申请，明天可能会有新的申请</p>
            </div>

            <div v-else class="appraisal-list">
              <div
                v-for="appr in pendingAppraisals"
                :key="appr.id"
                class="appraisal-card card"
              >
                <div class="appraisal-top">
                  <VinylRecord :record="appr.record" size="small" />
                  <div class="appraisal-info">
                    <div class="appraisal-title-row">
                      <h4 class="appraisal-title">{{ appr.record.title }}</h4>
                      <span
                        class="source-tag"
                        :style="{ background: appr.source === 'recycle' ? 'rgba(72,187,120,0.2)' : 'rgba(102,126,234,0.2)', color: appr.source === 'recycle' ? '#48bb78' : '#667eea' }"
                      >
                        {{ gameStore.getSourceIcon(appr.source) }} {{ appr.sourceName }}
                      </span>
                    </div>
                    <p class="appraisal-artist">{{ appr.record.artist }} · {{ appr.record.year }}</p>
                    <div class="appraisal-meta">
                      <span class="meta-chip genre">{{ appr.record.genre }}</span>
                      <span class="meta-chip rarity">{{ appr.record.rarity }}星</span>
                      <span class="meta-chip urgency" :style="{ color: getUrgencyColor(appr.urgency) }">⏱ {{ getUrgencyLabel(appr.urgency) }}</span>
                      <span class="meta-chip risk" :style="{ color: getRiskColor(appr.authenticityRisk) }">🛡 {{ getRiskLabel(appr.authenticityRisk) }}</span>
                      <span v-if="appr.isMember" class="meta-chip member">{{ appr.memberLevel }}会员</span>
                    </div>
                    <div class="seller-row">
                      <span class="seller-avatar">{{ appr.sellerAvatar }}</span>
                      <span class="seller-name">{{ appr.sellerName }}</span>
                      <span class="price-range">估价参考 ¥{{ appr.estimatedMinPrice }} - ¥{{ appr.estimatedMaxPrice }}</span>
                    </div>
                  </div>
                </div>
                <div class="appraisal-desc">
                  <span class="desc-label">卖家描述：</span>
                  <span class="desc-text">{{ appr.conditionDescription }}</span>
                  <span v-if="appr.hasProvenance" class="prov-tag">📜 有来源证明</span>
                </div>
                <div v-if="appr.provenanceNote" class="provenance-note">
                  📜 {{ appr.provenanceNote }}
                </div>
                <button class="btn-primary appraise-btn" @click="openAppraisalDetail(appr)">
                  开始估价 →
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'inventory'" class="tab-pane">
            <div class="section-header">
              <h3>二手库存</h3>
              <p class="section-hint">管理已回收和寄售的二手唱片</p>
            </div>

            <div class="inventory-stats-row">
              <div class="inv-stat">
                <span class="inv-stat-icon">♻️</span>
                <span class="inv-stat-label">回收商品</span>
                <span class="inv-stat-value">{{ stats.recycleItems }}</span>
              </div>
              <div class="inv-stat">
                <span class="inv-stat-icon">📦</span>
                <span class="inv-stat-label">寄售商品</span>
                <span class="inv-stat-value">{{ stats.consignmentItems }}</span>
              </div>
              <div class="inv-stat">
                <span class="inv-stat-icon">💎</span>
                <span class="inv-stat-label">可信卖家</span>
                <span class="inv-stat-value">{{ stats.trustedSellers }}</span>
              </div>
            </div>

            <div v-if="inStockItems.length === 0" class="empty-state card">
              <div class="empty-icon">📦</div>
              <p>暂无二手库存</p>
            </div>

            <div v-else class="inventory-list">
              <div
                v-for="item in inStockItems"
                :key="item.id"
                class="inventory-card card"
              >
                <div class="inv-top">
                  <VinylRecord :record="item.record" size="small" />
                  <div class="inv-info">
                    <div class="inv-title-row">
                      <h4 class="inv-title">{{ item.record.title }}</h4>
                      <span
                        class="source-tag"
                        :style="{ background: item.isConsignment ? 'rgba(102,126,234,0.2)' : 'rgba(72,187,120,0.2)', color: item.isConsignment ? '#667eea' : '#48bb78' }"
                      >
                        {{ gameStore.getSourceIcon(item.source) }} {{ item.sourceName }}
                      </span>
                      <span
                        class="quality-tag"
                        :style="{ background: gameStore.getAppraisalQualityColor(item.qualityTag) + '22', color: gameStore.getAppraisalQualityColor(item.qualityTag) }"
                      >
                        {{ gameStore.getAppraisalQualityLabel(item.qualityTag) }}
                      </span>
                    </div>
                    <p class="inv-artist">{{ item.record.artist }} · {{ item.record.genre }}</p>
                    <div class="inv-price-row">
                      <span v-if="!item.isConsignment" class="cost-price">成本 ¥{{ item.actualCostPrice }}</span>
                      <span class="current-price">售价 ¥{{ item.currentPrice }}</span>
                      <span v-if="item.currentPrice !== item.listedPrice" class="price-changed">(原价 ¥{{ item.listedPrice }})</span>
                    </div>
                    <div v-if="item.consignmentTerms" class="consignment-terms">
                      <span class="term-chip">佣金 {{ Math.round(item.consignmentTerms.shopCommissionRate * 100) }}%</span>
                      <span class="term-chip">卖家分成 {{ Math.round(item.consignmentTerms.sellerPayoutRate * 100) }}%</span>
                      <span class="term-chip">最低 ¥{{ item.consignmentTerms.minPrice }}</span>
                    </div>
                    <div class="inv-tags">
                      <span v-if="item.authenticityGuaranteed" class="inv-tag auth">🛡 保真</span>
                      <span v-if="item.genreMarketHeatBonus > 0" class="inv-tag heat">🔥 热门 +{{ Math.round(item.genreMarketHeatBonus * 100) }}%</span>
                      <span class="inv-tag seller">来自 {{ item.sellerName }}</span>
                    </div>
                  </div>
                </div>
                <button class="btn-secondary adjust-btn" @click="openPriceAdjust(item)">
                  ✏️ 调整售价
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'split'" class="tab-pane">
            <div class="section-header">
              <h3>售价分成规则</h3>
              <p class="section-hint">回收和寄售的分成方式与定价策略</p>
            </div>

            <div class="split-card card recycle-card">
              <div class="split-header">
                <span class="split-icon">♻️</span>
                <div>
                  <h4>回收模式</h4>
                  <p class="split-desc">直接从卖家处购入，赚取销售差价</p>
                </div>
              </div>
              <div class="split-details">
                <div class="split-row">
                  <span class="split-label">收购价</span>
                  <span class="split-value">估价 × 60%（可议价）</span>
                </div>
                <div class="split-row">
                  <span class="split-label">建议售价</span>
                  <span class="split-value">收购价 × 140%</span>
                </div>
                <div class="split-row highlight">
                  <span class="split-label">利润空间</span>
                  <span class="split-value positive">约 40% 毛利率</span>
                </div>
                <div class="split-row">
                  <span class="split-label">风险</span>
                  <span class="split-value">压货风险，需自行承担</span>
                </div>
              </div>
            </div>

            <div class="split-card card consignment-card">
              <div class="split-header">
                <span class="split-icon">📦</span>
                <div>
                  <h4>寄售模式</h4>
                  <p class="split-desc">卖家委托销售，成交后按比例分成</p>
                </div>
              </div>
              <div class="split-details">
                <div class="split-row">
                  <span class="split-label">普通佣金</span>
                  <span class="split-value">30%</span>
                </div>
                <div class="split-row">
                  <span class="split-label">Silver会员</span>
                  <span class="split-value">27% 佣金</span>
                </div>
                <div class="split-row">
                  <span class="split-label">Gold会员</span>
                  <span class="split-value">25% 佣金 + 即时结算</span>
                </div>
                <div class="split-row">
                  <span class="split-label">Platinum会员</span>
                  <span class="split-value">22% 佣金 + 即时结算</span>
                </div>
                <div class="split-row highlight">
                  <span class="split-label">Diamond会员</span>
                  <span class="split-value positive">20% 佣金 + 即时结算</span>
                </div>
                <div class="split-row">
                  <span class="split-label">风险</span>
                  <span class="split-value">无压货风险，30天未售出自动降价</span>
                </div>
              </div>
            </div>

            <div class="split-card card tips-card">
              <div class="split-header">
                <span class="split-icon">💡</span>
                <div>
                  <h4>经营建议</h4>
                  <p class="split-desc">提升二手业务利润的策略</p>
                </div>
              </div>
              <ul class="tips-list">
                <li><strong>品相为王：</strong>优先收购品相优秀的唱片，估价 '优秀' 和 '完美' 的唱片可显著提升口碑</li>
                <li><strong>热门流派：</strong>关注市场热度，热门流派的二手唱片周转更快</li>
                <li><strong>来源证明：</strong>有明确来源记录的唱片可信度高，买家愿意支付溢价</li>
                <li><strong>会员寄售：</strong>高等级会员寄售的佣金更低，但结算更快，卖家满意度更高</li>
                <li><strong>信誉影响：</strong>定价公道提升口碑，议价过多或定价过高会损害声誉</li>
              </ul>
            </div>
          </div>

          <div v-if="activeTab === 'sales'" class="tab-pane">
            <div class="section-header">
              <h3>成交记录</h3>
              <p class="section-hint">二手唱片的销售历史和分成明细</p>
            </div>

            <div v-if="saleRecords.length === 0" class="empty-state card">
              <div class="empty-icon">📋</div>
              <p>暂无成交记录</p>
            </div>

            <div v-else class="sales-list">
              <div
                v-for="sale in saleRecords"
                :key="sale.id"
                class="sale-card card"
              >
                <div class="sale-top">
                  <div class="sale-title-section">
                    <h4 class="sale-title">{{ sale.recordTitle }}</h4>
                    <span
                      class="source-tag"
                      :style="{ background: sale.source === 'recycle' ? 'rgba(72,187,120,0.2)' : 'rgba(102,126,234,0.2)', color: sale.source === 'recycle' ? '#48bb78' : '#667eea' }"
                    >
                      {{ gameStore.getSourceIcon(sale.source) }} {{ sale.sourceName }}
                    </span>
                  </div>
                  <span class="sale-price">¥{{ sale.finalSalePrice }}</span>
                </div>
                <p class="sale-artist">{{ sale.recordArtist }}</p>
                <div class="sale-split-row">
                  <div class="sale-split-item">
                    <span class="ss-label">成交价</span>
                    <span class="ss-value">¥{{ sale.finalSalePrice }}</span>
                  </div>
                  <div v-if="sale.discountApplied > 0" class="sale-split-item">
                    <span class="ss-label">优惠</span>
                    <span class="ss-value discount">-¥{{ sale.discountApplied }}</span>
                  </div>
                  <div class="sale-split-item">
                    <span class="ss-label">店铺收益</span>
                    <span class="ss-value profit">+¥{{ sale.shopProfit }}</span>
                  </div>
                  <div v-if="sale.source === 'consignment'" class="sale-split-item">
                    <span class="ss-label">卖家分成</span>
                    <span class="ss-value">¥{{ sale.sellerPayout }}</span>
                  </div>
                  <div v-if="sale.shopCommission > 0" class="sale-split-item">
                    <span class="ss-label">佣金</span>
                    <span class="ss-value">¥{{ sale.shopCommission }}</span>
                  </div>
                </div>
                <div class="sale-footer">
                  <div class="sale-parties">
                    <span class="party-item">
                      <span class="party-avatar">{{ sale.sellerAvatar }}</span>
                      <span class="party-name">{{ sale.sellerName }}</span>
                    </span>
                    <span class="party-arrow">→</span>
                    <span class="party-item">
                      <span class="party-avatar">{{ sale.buyerAvatar }}</span>
                      <span class="party-name">{{ sale.buyerName }}</span>
                      <span v-if="sale.isBuyerMember" class="party-member">({{ sale.buyerMemberLevel }})</span>
                    </span>
                  </div>
                  <div class="sale-meta">
                    <span v-if="sale.wasBargained" class="meta-badge bargain">议价×{{ sale.bargainingRounds }}</span>
                    <span
                      class="meta-badge reputation"
                      :class="{ positive: sale.reputationImpact > 0, negative: sale.reputationImpact < 0 }"
                    >
                      信誉 {{ sale.reputationImpact > 0 ? '+' : '' }}{{ sale.reputationImpact }}
                    </span>
                    <span class="meta-badge satisfaction">
                      买家满意 {{ sale.buyerSatisfaction }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'reputation'" class="tab-pane">
            <div class="section-header">
              <h3>信誉影响记录</h3>
              <p class="section-hint">二手业务对店铺口碑的具体影响</p>
            </div>

            <div class="rep-summary-row">
              <div class="rep-summary-card positive">
                <span class="rs-icon">📈</span>
                <div class="rs-info">
                  <span class="rs-value">+{{ stats.positiveReputationChanges }}</span>
                  <span class="rs-label">正向影响</span>
                </div>
              </div>
              <div class="rep-summary-card negative">
                <span class="rs-icon">📉</span>
                <div class="rs-info">
                  <span class="rs-value">{{ stats.negativeReputationChanges }}</span>
                  <span class="rs-label">负向影响</span>
                </div>
              </div>
              <div class="rep-summary-card total">
                <span class="rs-icon">⭐</span>
                <div class="rs-info">
                  <span class="rs-value">{{ stats.totalReputationImpact > 0 ? '+' : '' }}{{ stats.totalReputationImpact }}</span>
                  <span class="rs-label">净影响</span>
                </div>
              </div>
            </div>

            <div class="seller-profile-section">
              <h4 class="sub-title">合作卖家</h4>
              <div v-if="sellerProfiles.length === 0" class="empty-inline">
                暂无卖家档案
              </div>
              <div v-else class="seller-list">
                <div
                  v-for="seller in sellerProfiles.slice(0, 10)"
                  :key="seller.id"
                  class="seller-card-mini"
                >
                  <span class="seller-avatar-sm">{{ seller.avatar }}</span>
                  <div class="seller-info-sm">
                    <div class="seller-name-row">
                      <span class="seller-name-sm">{{ seller.name }}</span>
                      <span v-if="seller.isTrustedSeller" class="trusted-badge">✅ 可信</span>
                      <span v-if="seller.isMember" class="member-badge-sm">{{ seller.memberLevel }}</span>
                    </div>
                    <div class="seller-stats-sm">
                      <span>成交 {{ seller.totalItemsSold }}</span>
                      <span>接受率 {{ Math.round(seller.acceptanceRate * 100) }}%</span>
                      <span>信任 {{ seller.trustScore }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 class="sub-title">变动日志</h4>
            <div v-if="reputationChanges.length === 0" class="empty-inline">
              暂无信誉变动
            </div>
            <div v-else class="rep-log-list">
              <div
                v-for="log in reputationChanges"
                :key="log.id"
                class="rep-log-item"
              >
                <span
                  class="rep-change"
                  :class="{ positive: log.changeAmount > 0, negative: log.changeAmount < 0 }"
                >
                  {{ log.changeAmount > 0 ? '+' : '' }}{{ log.changeAmount }}
                </span>
                <div class="rep-log-content">
                  <div class="rep-log-type">{{ log.changeTypeName }}</div>
                  <div class="rep-log-desc">{{ log.description }}</div>
                  <div class="rep-log-meta">
                    <span>第 {{ log.day }} 天</span>
                    <span v-if="log.sellerName">· 卖家: {{ log.sellerName }}</span>
                    <span v-if="log.buyerName">· 买家: {{ log.buyerName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAppraisalModal && selectedAppraisal" class="nested-modal-overlay" @click.self="closeAppraisalModal">
        <div class="nested-modal-content">
          <div class="nested-modal-header">
            <h3>📋 估价详情</h3>
            <button class="close-btn" @click="closeAppraisalModal">✕</button>
          </div>
          <div class="nested-modal-body">
            <div class="appr-detail-top card">
              <VinylRecord :record="selectedAppraisal.record" size="medium" />
              <div class="appr-detail-info">
                <h4>{{ selectedAppraisal.record.title }}</h4>
                <p>{{ selectedAppraisal.record.artist }} · {{ selectedAppraisal.record.year }} · {{ selectedAppraisal.record.genre }}</p>
                <div class="appr-detail-meta">
                  <span class="meta-chip rarity">{{ selectedAppraisal.record.rarity }}星稀有</span>
                  <span class="meta-chip"
                    :style="{ background: selectedAppraisal.source === 'recycle' ? 'rgba(72,187,120,0.2)' : 'rgba(102,126,234,0.2)', color: selectedAppraisal.source === 'recycle' ? '#48bb78' : '#667eea' }">
                    {{ gameStore.getSourceIcon(selectedAppraisal.source) }} {{ selectedAppraisal.sourceName }}
                  </span>
                </div>
                <p class="appraiser-seller">
                  <span class="seller-avatar">{{ selectedAppraisal.sellerAvatar }}</span>
                  {{ selectedAppraisal.sellerName }}
                  <span v-if="selectedAppraisal.isMember" class="member-badge-sm">{{ selectedAppraisal.memberLevel }}</span>
                  · 参考价 ¥{{ selectedAppraisal.estimatedMinPrice }}-¥{{ selectedAppraisal.estimatedMaxPrice }}
                </p>
              </div>
            </div>

            <div class="condition-section card">
              <h5>🔍 品相评估</h5>
              <p class="section-hint">根据实际品相打分，影响最终估价和收购价</p>
              <div class="condition-slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  v-model.number="appraisalConditionScore"
                  class="condition-slider"
                  :disabled="!!appraisalResult"
                />
                <span class="condition-score" :style="{ color: gameStore.getAppraisalQualityColor(
                  appraisalConditionScore >= 90 ? 'perfect' :
                  appraisalConditionScore >= 75 ? 'excellent' :
                  appraisalConditionScore >= 55 ? 'good' :
                  appraisalConditionScore >= 35 ? 'fair' : 'poor'
                ) }">
                  {{ appraisalConditionScore }}分
                </span>
              </div>
              <div class="condition-labels">
                <span>0 较差</span>
                <span>35 一般</span>
                <span>55 良好</span>
                <span>75 优秀</span>
                <span>90 完美</span>
              </div>

              <button
                v-if="!appraisalResult"
                class="btn-primary appraise-action-btn"
                @click="doAppraisal"
              >
                执行估价
              </button>
            </div>

            <div v-if="appraisalResult" class="appraisal-result card">
              <div class="ar-header">
                <span
                  class="ar-quality"
                  :style="{ background: gameStore.getAppraisalQualityColor(appraisalResult.quality) + '22', color: gameStore.getAppraisalQualityColor(appraisalResult.quality) }"
                >
                  {{ gameStore.getAppraisalQualityLabel(appraisalResult.quality) }}
                </span>
                <span class="ar-value">估价 ¥{{ appraisalResult.finalValue }}</span>
              </div>
              <p class="ar-note">📝 {{ appraisalResult.note }}</p>

              <div class="ar-pricing">
                <div class="ar-price-row">
                  <span class="ar-label">{{ selectedAppraisal.source === 'recycle' ? '建议回收价' : '建议寄售底价' }}</span>
                  <span class="ar-price-value">
                    ¥{{ selectedAppraisal.source === 'recycle' ? appraisalResult.suggestedRecyclePrice : appraisalResult.suggestedConsignmentPrice }}
                  </span>
                </div>
                <div class="negotiate-price-row">
                  <span class="np-label">{{ selectedAppraisal.source === 'recycle' ? '实际收购价' : '寄售底价' }}</span>
                  <div class="np-controls">
                    <button class="np-btn" @click="negotiatedPrice = Math.max(10, negotiatedPrice - 10)">-10</button>
                    <input type="number" v-model.number="negotiatedPrice" class="np-input" :min="10" />
                    <button class="np-btn" @click="negotiatedPrice = negotiatedPrice + 10">+10</button>
                  </div>
                </div>
                <div class="ar-preview-row">
                  <span class="ar-label">预计售价</span>
                  <span class="ar-price-value">
                    ¥{{ selectedAppraisal.source === 'recycle'
                      ? Math.floor(negotiatedPrice * 1.4)
                      : Math.floor(appraisalResult.finalValue * (1 + gameStore.secondHand.defaultConsignmentRate * 0.3)) }}
                  </span>
                </div>
                <div v-if="selectedAppraisal.source === 'recycle'" class="ar-preview-row">
                  <span class="ar-label">预计利润</span>
                  <span class="ar-price-value positive">
                    +¥{{ Math.floor(negotiatedPrice * 0.4) }}
                  </span>
                </div>
                <div v-else class="ar-preview-row">
                  <span class="ar-label">佣金比例</span>
                  <span class="ar-price-value">
                    {{ Math.round(gameStore.secondHand.defaultConsignmentRate * 100) }}% (¥{{ Math.floor(appraisalResult.finalValue * gameStore.secondHand.defaultConsignmentRate) }}/件)
                  </span>
                </div>
              </div>

              <div v-if="appraisalResult.reputationImpact !== 0" class="ar-reputation" :class="{ positive: appraisalResult.reputationImpact > 0, negative: appraisalResult.reputationImpact < 0 }">
                ⭐ 预计信誉影响：{{ appraisalResult.reputationImpact > 0 ? '+' : '' }}{{ appraisalResult.reputationImpact }}
              </div>
            </div>
          </div>
          <div class="nested-modal-footer">
            <button v-if="showRejectModal" class="nested-modal-footer-full">
              <div class="reject-reason-box">
                <input
                  type="text"
                  v-model="rejectReason"
                  class="reject-reason-input"
                  placeholder="请输入拒绝原因（选填）"
                />
                <div class="reject-actions">
                  <button class="btn-secondary" @click="showRejectModal = false">取消</button>
                  <button class="btn-danger" @click="doReject">确认拒绝</button>
                </div>
              </div>
            </button>
            <template v-else>
              <button class="btn-secondary" @click="closeAppraisalModal">关闭</button>
              <button
                v-if="appraisalResult"
                class="btn-danger reject-action-btn"
                @click="openRejectModal"
              >
                拒绝申请
              </button>
              <button
                v-if="appraisalResult"
                class="btn-primary"
                :disabled="selectedAppraisal.source === 'recycle' && negotiatedPrice > gameStore.budget"
                @click="acceptAppraisal"
              >
                {{ selectedAppraisal.source === 'recycle' ? `确认收购 ¥${negotiatedPrice}` : '确认接收寄售' }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="showPriceModal && selectedInventoryItem" class="nested-modal-overlay" @click.self="showPriceModal = false">
        <div class="nested-modal-content small">
          <div class="nested-modal-header">
            <h3>✏️ 调整售价</h3>
            <button class="close-btn" @click="showPriceModal = false">✕</button>
          </div>
          <div class="nested-modal-body">
            <div class="price-adjust-card card">
              <VinylRecord :record="selectedInventoryItem.record" size="small" />
              <div class="pa-info">
                <h4>{{ selectedInventoryItem.record.title }}</h4>
                <p>当前售价：¥{{ selectedInventoryItem.currentPrice }}</p>
                <p v-if="!selectedInventoryItem.isConsignment">成本价：¥{{ selectedInventoryItem.actualCostPrice }}</p>
                <p v-if="selectedInventoryItem.consignmentTerms">
                  寄售底价：¥{{ selectedInventoryItem.consignmentTerms.minPrice }}
                </p>
              </div>
            </div>
            <div class="price-editor">
              <span class="pe-label">新售价</span>
              <div class="pe-controls">
                <button class="pe-btn" @click="adjustedPrice = Math.max(selectedInventoryItem.actualCostPrice || selectedInventoryItem.consignmentTerms?.minPrice || 10, adjustedPrice - 10)">-10</button>
                <input type="number" v-model.number="adjustedPrice" class="pe-input" />
                <button class="pe-btn" @click="adjustedPrice = adjustedPrice + 10">+10</button>
              </div>
            </div>
            <div v-if="!selectedInventoryItem.isConsignment" class="profit-preview">
              <span class="pp-label">预计利润</span>
              <span class="pp-value" :class="{ positive: profitPreview > 0 }">
                {{ profitPreview > 0 ? '+' : '' }}¥{{ profitPreview }}
              </span>
            </div>
          </div>
          <div class="nested-modal-footer">
            <button class="btn-secondary" @click="showPriceModal = false">取消</button>
            <button class="btn-primary" @click="confirmPriceAdjust">确认调整</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.secondhand-view {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12px;
  overflow-y: auto;
}

.modal-panel {
  width: 100%;
  max-width: 520px;
  background: var(--bg-card);
  border-radius: 16px;
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
  margin: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(72, 187, 120, 0.08) 100%);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-box.reputation.positive {
  background: rgba(72, 187, 120, 0.15);
}

.stat-box.reputation.negative {
  background: rgba(245, 101, 101, 0.15);
}

.stat-icon {
  font-size: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.tabs-bar {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  position: relative;
}

.tab-btn.active {
  color: var(--accent-gold);
  border-bottom-color: var(--accent-gold);
}

.tab-icon {
  font-size: 14px;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.flash-message {
  margin: 8px 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.flash-message.success {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.flash-message.error {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 24px;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.section-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.appraisal-list,
.inventory-list,
.sales-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.appraisal-card,
.inventory-card,
.sale-card {
  animation: fadeIn 0.2s ease;
}

.appraisal-top,
.inv-top,
.sale-top {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.appraisal-info,
.inv-info {
  flex: 1;
  min-width: 0;
}

.appraisal-title-row,
.inv-title-row,
.sale-title-section {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.appraisal-title,
.inv-title,
.sale-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-tag,
.quality-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.appraisal-artist,
.inv-artist,
.sale-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
}

.appraisal-meta,
.inv-tags,
.sale-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.meta-chip,
.inv-tag {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.meta-chip.genre {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.meta-chip.rarity {
  background: rgba(246, 224, 94, 0.15);
  color: var(--accent-gold);
}

.meta-chip.member {
  background: rgba(246, 224, 94, 0.2);
  color: var(--accent-gold);
  font-weight: 600;
}

.meta-chip.bargain {
  background: rgba(237, 137, 54, 0.15);
  color: #ed8936;
}

.meta-chip.reputation.positive {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.meta-chip.reputation.negative {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.meta-chip.satisfaction {
  background: rgba(66, 153, 225, 0.15);
  color: #4299e1;
}

.inv-tag.auth {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.inv-tag.heat {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.seller-row,
.appraiser-seller {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.seller-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.price-range {
  margin-left: auto;
  color: var(--accent-orange);
  font-weight: 500;
}

.appraisal-desc {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.desc-label {
  color: var(--text-muted);
}

.desc-text {
  color: var(--text-primary);
}

.prov-tag {
  margin-left: 6px;
  padding: 1px 6px;
  background: rgba(128, 90, 213, 0.15);
  color: #805ad5;
  border-radius: 4px;
  font-size: 10px;
}

.provenance-note {
  font-size: 11px;
  color: #805ad5;
  padding: 6px 8px;
  background: rgba(128, 90, 213, 0.08);
  border-radius: 6px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.appraise-btn,
.adjust-btn {
  width: 100%;
  padding: 10px;
}

.inv-price-row,
.sale-split-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.cost-price {
  color: var(--text-muted);
  font-size: 11px;
}

.current-price,
.sale-price {
  color: var(--accent-orange);
  font-size: 14px;
  font-weight: 700;
}

.price-changed {
  color: var(--text-muted);
  font-size: 10px;
  text-decoration: line-through;
}

.consignment-terms {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.term-chip {
  padding: 2px 6px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 4px;
  font-size: 10px;
}

.inventory-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.inv-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.inv-stat-icon {
  font-size: 18px;
}

.inv-stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.inv-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.split-card {
  margin-bottom: 12px;
}

.split-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.split-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recycle-card .split-icon {
  background: rgba(72, 187, 120, 0.15);
}

.consignment-card .split-icon {
  background: rgba(102, 126, 234, 0.15);
}

.tips-card .split-icon {
  background: rgba(246, 224, 94, 0.15);
}

.split-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.split-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}

.split-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.split-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 12px;
}

.split-row.highlight {
  background: rgba(72, 187, 120, 0.1);
}

.split-label {
  color: var(--text-secondary);
}

.split-value {
  font-weight: 600;
  color: var(--text-primary);
}

.split-value.positive {
  color: var(--success);
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.tips-list strong {
  color: var(--accent-gold);
}

.sale-split-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  min-width: 70px;
}

.ss-label {
  font-size: 10px;
  color: var(--text-muted);
}

.ss-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.ss-value.profit {
  color: var(--success);
}

.ss-value.discount {
  color: var(--danger);
}

.sale-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.sale-parties {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.party-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.party-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.party-arrow {
  color: var(--text-muted);
}

.party-member {
  color: var(--accent-gold);
  font-weight: 600;
}

.rep-summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.rep-summary-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
}

.rep-summary-card.positive {
  background: rgba(72, 187, 120, 0.12);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.rep-summary-card.negative {
  background: rgba(245, 101, 101, 0.12);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.rep-summary-card.total {
  background: rgba(246, 224, 94, 0.12);
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.rs-icon {
  font-size: 20px;
}

.rs-info {
  display: flex;
  flex-direction: column;
}

.rs-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.positive .rs-value {
  color: var(--success);
}

.negative .rs-value {
  color: var(--danger);
}

.total .rs-value {
  color: var(--accent-gold);
}

.rs-label {
  font-size: 10px;
  color: var(--text-muted);
}

.sub-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 16px 0 8px 0;
}

.empty-inline {
  padding: 16px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.seller-list,
.rep-log-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.seller-card-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.seller-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.seller-info-sm {
  flex: 1;
  min-width: 0;
}

.seller-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.seller-name-sm {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.trusted-badge {
  font-size: 10px;
  color: var(--success);
}

.member-badge-sm {
  padding: 1px 6px;
  background: rgba(246, 224, 94, 0.2);
  color: var(--accent-gold);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.seller-stats-sm {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--text-muted);
}

.rep-log-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.rep-change {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.rep-change.positive {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.rep-change.negative {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.rep-log-content {
  flex: 1;
  min-width: 0;
}

.rep-log-type {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.rep-log-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.rep-log-meta {
  font-size: 10px;
  color: var(--text-muted);
}

.nested-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.nested-modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease-out;
}

.nested-modal-content.small {
  max-height: 70vh;
}

.nested-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.nested-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.nested-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nested-modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
}

.nested-modal-footer button {
  flex: 1;
}

.nested-modal-footer-full {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reject-reason-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reject-reason-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  box-sizing: border-box;
}

.reject-actions {
  display: flex;
  gap: 10px;
}

.reject-actions button {
  flex: 1;
}

.btn-danger {
  padding: 10px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border: none;
}

.btn-danger:disabled {
  opacity: 0.5;
}

.appr-detail-top,
.price-adjust-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.appr-detail-info {
  flex: 1;
  min-width: 0;
}

.appr-detail-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.appr-detail-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.appr-detail-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.condition-section h5 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.condition-slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.condition-slider {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  outline: none;
}

.condition-score {
  font-size: 16px;
  font-weight: 700;
  min-width: 50px;
  text-align: right;
}

.condition-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
}

.appraise-action-btn {
  width: 100%;
  margin-top: 12px;
}

.ar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ar-quality {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.ar-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-orange);
}

.ar-note {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.ar-pricing {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ar-price-row,
.negotiate-price-row,
.ar-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ar-label,
.np-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.ar-price-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.ar-price-value.positive {
  color: var(--success);
}

.np-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.np-btn,
.pe-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--border);
}

.np-input,
.pe-input {
  width: 80px;
  height: 32px;
  padding: 0 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.ar-reputation {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.ar-reputation.positive {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.ar-reputation.negative {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
}

.reject-action-btn {
  flex: 1;
}

.pa-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.pa-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.price-editor,
.profit-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.pe-label,
.pp-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.pe-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pp-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.pp-value.positive {
  color: var(--success);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.btn-primary {
  padding: 10px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border: none;
}

.btn-primary:disabled {
  opacity: 0.5;
}

.btn-secondary {
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
}
</style>