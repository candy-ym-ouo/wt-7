<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import type { SupplierContractTier, Genre } from '@/types'
import {
  getContractTierConfig,
  getNextContractTier,
  getTierColor,
  getTierBgColor,
  contractTiers,
  breachPenaltyConfig,
  getBreachTypeLabel,
  getBreachTypeIcon
} from '@/data/supplierRelationship'
import { getSupplierById, getSupplierName, getSupplierTypeColor } from '@/data/suppliers'

const gameStore = useGameStore()
const selectedSupplierId = ref<string | null>(null)
const activeTab = ref<'overview' | 'contracts' | 'milestones' | 'breaches'>('overview')

const allRelationships = computed(() => {
  return gameStore.availableSuppliers.map(supplier => {
    const rel = gameStore.getSupplierRelationship(supplier.id)
    const bonus = gameStore.getSupplierBonusSummaryFor(supplier.id)
    return { supplier, rel, bonus }
  })
})

const selectedData = computed(() => {
  if (!selectedSupplierId.value) return null
  const supplier = getSupplierById(selectedSupplierId.value)
  if (!supplier) return null
  const rel = gameStore.getSupplierRelationship(selectedSupplierId.value)
  const bonus = gameStore.getSupplierBonusSummaryFor(selectedSupplierId.value)
  const exclusiveSupplies = gameStore.getSupplierExclusiveSupplies(selectedSupplierId.value)
  const milestones = gameStore.getSupplierMilestones(selectedSupplierId.value)
  const nextTier = getNextContractTier(rel.contractTier)
  return { supplier, rel, bonus, exclusiveSupplies, milestones, nextTier }
})

const selectSupplier = (supplierId: string) => {
  selectedSupplierId.value = supplierId
}

const handleSignContract = (supplierId: string, targetTier: SupplierContractTier) => {
  const result = gameStore.signSupplierContract(supplierId, targetTier)
  alert(result.message)
}

const handleCancelContract = (supplierId: string) => {
  if (!confirm('确定要解除合约吗？这将导致信任度下降和违约罚款。')) return
  const result = gameStore.cancelSupplierContract(supplierId)
  alert(result.message)
}

const genreEmoji: { [key in Genre]: string } = {
  Jazz: '🎷', Rock: '🎸', Soul: '🎤', Funk: '🕺', Disco: '💃',
  Classical: '🎻', Blues: '🎹', Pop: '🎵', Electronic: '🎧', Folk: '🪕'
}

const totalDiscountSavings = computed(() => {
  let total = 0
  for (const supplier of gameStore.availableSuppliers) {
    const rel = gameStore.getSupplierRelationship(supplier.id)
    total += rel.cumulativeDiscount
  }
  return total
})

const totalBreachCount = computed(() => {
  let total = 0
  for (const supplier of gameStore.availableSuppliers) {
    total += gameStore.getSupplierRelationship(supplier.id).breachCount
  }
  return total
})

const totalTrustAcrossAll = computed(() => {
  let total = 0
  for (const supplier of gameStore.availableSuppliers) {
    total += gameStore.getSupplierRelationship(supplier.id).trustPoints
  }
  return total
})
</script>

<template>
  <div class="supplier-rel-view">
    <div class="overview-summary card">
      <div class="os-header">
        <span class="os-icon">🤝</span>
        <span class="os-title">供应商关系总览</span>
      </div>
      <div class="os-stats">
        <div class="os-stat">
          <span class="oss-value">{{ gameStore.availableSuppliers.length }}</span>
          <span class="oss-label">合作供应商</span>
        </div>
        <div class="os-stat">
          <span class="oss-value">{{ totalTrustAcrossAll }}</span>
          <span class="oss-label">总信任度</span>
        </div>
        <div class="os-stat">
          <span class="oss-value accent">¥{{ totalDiscountSavings }}</span>
          <span class="oss-label">累计折扣节省</span>
        </div>
        <div class="os-stat">
          <span class="oss-value" :class="{ danger: totalBreachCount > 0 }">{{ totalBreachCount }}</span>
          <span class="oss-label">累计违约</span>
        </div>
      </div>
    </div>

    <div class="supplier-rel-list">
      <div 
        v-for="{ supplier, rel, bonus } in allRelationships" 
        :key="supplier.id"
        class="srel-card card"
        :class="{ selected: selectedSupplierId === supplier.id }"
        :style="{ borderLeftColor: getTierColor(rel.contractTier) }"
        @click="selectSupplier(supplier.id)"
      >
        <div class="srel-top">
          <span class="srel-icon">{{ supplier.icon }}</span>
          <div class="srel-info">
            <div class="srel-name">{{ supplier.name }}</div>
            <div class="srel-tier" :style="{ color: getTierColor(rel.contractTier) }">
              {{ getContractTierConfig(rel.contractTier).icon }}
              {{ getContractTierConfig(rel.contractTier).tierName }}
            </div>
          </div>
          <div class="srel-trust">
            <span class="srel-trust-num" :style="{ color: getTierColor(rel.contractTier) }">
              {{ rel.trustPoints }}
            </span>
            <span class="srel-trust-label">信任</span>
          </div>
        </div>
        <div v-if="bonus" class="srel-bonuses-row">
          <span class="sb-tag" :style="{ background: getTierBgColor(rel.contractTier), color: getTierColor(rel.contractTier) }">
            -{{ Math.round(bonus.totalDiscountRate * 100) }}%
          </span>
          <span v-if="bonus.exclusiveSlots > 0" class="sb-tag">
            🔓 {{ bonus.exclusiveSlots }}专属
          </span>
          <span v-if="rel.breachCount > 0" class="sb-tag danger">
            ⚠️ {{ rel.breachCount }}违约
          </span>
        </div>
        <div class="srel-trust-bar">
          <div 
            class="srel-trust-fill"
            :style="{ 
              width: bonus ? bonus.trustProgressPercent + '%' : '0%',
              background: getTierColor(rel.contractTier)
            }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="selectedData" class="supplier-detail card" :style="{ background: getTierBgColor(selectedData.rel.contractTier) }">
      <div class="sd-header">
        <span class="sd-icon">{{ selectedData.supplier.icon }}</span>
        <div class="sd-info">
          <h3 class="sd-name">{{ selectedData.supplier.name }}</h3>
          <span 
            class="sd-type"
            :style="{ background: getSupplierTypeColor(selectedData.supplier.type) + '25', color: getSupplierTypeColor(selectedData.supplier.type) }"
          >
            {{ getSupplierName(selectedData.supplier.type) }}
          </span>
        </div>
        <div class="sd-tier-badge" :style="{ background: getTierColor(selectedData.rel.contractTier) + '20', color: getTierColor(selectedData.rel.contractTier) }">
          {{ getContractTierConfig(selectedData.rel.contractTier).icon }}
          {{ getContractTierConfig(selectedData.rel.contractTier).tierName }}
        </div>
      </div>

      <div class="sd-tabs">
        <button 
          class="sd-tab" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >📊 概览</button>
        <button 
          class="sd-tab" 
          :class="{ active: activeTab === 'contracts' }"
          @click="activeTab = 'contracts'"
        >📋 合约</button>
        <button 
          class="sd-tab" 
          :class="{ active: activeTab === 'milestones' }"
          @click="activeTab = 'milestones'"
        >🎯 里程碑</button>
        <button 
          class="sd-tab" 
          :class="{ active: activeTab === 'breaches' }"
          @click="activeTab = 'breaches'"
        >⚠️ 违约</button>
      </div>

      <div v-show="activeTab === 'overview'" class="sd-content">
        <div class="sd-bonus-grid">
          <div class="sd-bonus-item">
            <span class="sdb-label">采购折扣</span>
            <span class="sdb-value" :style="{ color: getTierColor(selectedData.rel.contractTier) }">
              -{{ Math.round(selectedData.bonus.totalDiscountRate * 100) }}%
            </span>
          </div>
          <div class="sd-bonus-item">
            <span class="sdb-label">专属货位</span>
            <span class="sdb-value">{{ selectedData.bonus.exclusiveSlots }} 个</span>
          </div>
          <div class="sd-bonus-item">
            <span class="sdb-label">稀有品加成</span>
            <span class="sdb-value">+{{ Math.round(selectedData.bonus.rareItemBonus * 100) }}%</span>
          </div>
          <div class="sd-bonus-item">
            <span class="sdb-label">配送加速</span>
            <span class="sdb-value">{{ selectedData.bonus.deliverySpeedBonus > 0 ? `-${selectedData.bonus.deliverySpeedBonus}天` : '无' }}</span>
          </div>
          <div class="sd-bonus-item">
            <span class="sdb-label">违约豁免</span>
            <span class="sdb-value">{{ selectedData.bonus.breachForgiveness }} 次</span>
          </div>
          <div class="sd-bonus-item">
            <span class="sdb-label">累计节省</span>
            <span class="sdb-value accent">¥{{ selectedData.rel.cumulativeDiscount }}</span>
          </div>
        </div>

        <div v-if="selectedData.exclusiveSupplies.length > 0" class="sd-exclusive">
          <div class="sd-section-title">🔓 专属货源渠道</div>
          <div class="sd-exclusive-list">
            <div 
              v-for="(supply, idx) in selectedData.exclusiveSupplies" 
              :key="idx"
              class="sd-exclusive-item"
            >
              <span class="sde-genre">{{ genreEmoji[supply.genre] }} {{ supply.genre }}</span>
              <span class="sde-rarity">{{ supply.minRarity }}星+</span>
              <span class="sde-stock">+{{ supply.bonusStockCount }}张</span>
              <span class="sde-price">上限 ¥{{ supply.priceCap }}</span>
            </div>
          </div>
        </div>

        <div class="sd-purchase-stats">
          <div class="sd-section-title">📈 合作数据</div>
          <div class="sd-stats-grid">
            <div class="sd-stat-item">
              <span class="sds-label">累计采购额</span>
              <span class="sds-value">¥{{ selectedData.rel.totalSpent }}</span>
            </div>
            <div class="sd-stat-item">
              <span class="sds-label">累计采购量</span>
              <span class="sds-value">{{ selectedData.rel.totalPurchased }} 张</span>
            </div>
            <div class="sd-stat-item">
              <span class="sds-label">连续采购天数</span>
              <span class="sds-value">{{ selectedData.rel.consecutivePurchaseDays }} 天</span>
            </div>
            <div class="sd-stat-item">
              <span class="sds-label">今日信任获得</span>
              <span class="sds-value">+{{ selectedData.rel.dailyTrustGained }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'contracts'" class="sd-content">
        <div class="sd-contract-tiers">
          <div 
            v-for="tier in contractTiers" 
            :key="tier.tier"
            class="sd-tier-card"
            :class="{ current: selectedData.rel.contractTier === tier.tier, locked: selectedData.rel.trustPoints < tier.minTrustPoints }"
            :style="{ borderColor: getTierColor(tier.tier) + (selectedData.rel.contractTier === tier.tier ? '' : '40') }"
          >
            <div class="sdt-header">
              <span class="sdt-icon">{{ tier.icon }}</span>
              <div class="sdt-info">
                <span class="sdt-name" :style="{ color: getTierColor(tier.tier) }">{{ tier.tierName }}</span>
                <span class="sdt-req">{{ tier.minTrustPoints }} 信任</span>
              </div>
              <span v-if="selectedData.rel.contractTier === tier.tier" class="sdt-current">当前</span>
            </div>
            <p class="sdt-desc">{{ tier.description }}</p>
            <div class="sdt-benefits">
              <span class="sdt-benefit">折扣 {{ Math.round(tier.discountRate * 100) }}%</span>
              <span class="sdt-benefit">专属 {{ tier.exclusiveSlotCount }}位</span>
              <span class="sdt-benefit">稀有 +{{ Math.round(tier.rareItemBonus * 100) }}%</span>
              <span v-if="tier.deliveryBonus > 0" class="sdt-benefit">配送 -{{ tier.deliveryBonus }}天</span>
              <span v-if="tier.breachForgiveness > 0" class="sdt-benefit">豁免 {{ tier.breachForgiveness }}次</span>
            </div>
            <button 
              v-if="selectedData.nextTier && selectedData.nextTier.tier === tier.tier && selectedData.rel.trustPoints >= tier.minTrustPoints && selectedData.rel.contractTier !== tier.tier"
              class="btn-primary sdt-sign-btn"
              :style="{ background: getTierColor(tier.tier) }"
              @click="handleSignContract(selectedSupplierId!, tier.tier)"
            >
              升级至{{ tier.tierName }}
            </button>
          </div>
        </div>

        <div v-if="selectedData.rel.isActive" class="sd-cancel-section">
          <button class="btn-secondary sd-cancel-btn" @click="handleCancelContract(selectedSupplierId!)">
            ❌ 解除合约
          </button>
          <p class="sd-cancel-hint">解除合约将导致信任度大幅下降和违约罚款</p>
        </div>
      </div>

      <div v-show="activeTab === 'milestones'" class="sd-content">
        <div class="sd-milestone-list">
          <div 
            v-for="ms in selectedData.milestones" 
            :key="ms.id"
            class="sd-milestone-item"
            :class="{ unlocked: ms.isUnlocked }"
          >
            <span class="sdm-icon">{{ ms.icon }}</span>
            <div class="sdm-info">
              <span class="sdm-name">{{ ms.name }}</span>
              <span class="sdm-reward">{{ ms.rewardDescription }}</span>
              <div class="sdm-req">
                <span>{{ ms.requiredTrustPoints }} 信任</span>
                <span>{{ getContractTierConfig(ms.requiredContractTier).tierName }}+</span>
              </div>
            </div>
            <span v-if="ms.isUnlocked" class="sdm-status done">✅ 已解锁</span>
            <span v-else class="sdm-status locked">🔒</span>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'breaches'" class="sd-content">
        <div v-if="selectedData.rel.breachRecords.length === 0" class="sd-no-breach">
          <span class="snb-icon">✅</span>
          <p>暂无违约记录，继续保持良好合作！</p>
        </div>
        <div v-else class="sd-breach-list">
          <div 
            v-for="breach in selectedData.rel.breachRecords" 
            :key="breach.id"
            class="sd-breach-item"
          >
            <div class="sdb-top">
              <span class="sdb-icon">{{ getBreachTypeIcon(breach.type) }}</span>
              <span class="sdb-type">{{ getBreachTypeLabel(breach.type) }}</span>
              <span class="sdb-day">第{{ breach.day }}天</span>
            </div>
            <p class="sdb-desc">{{ breach.description }}</p>
            <div class="sdb-penalties">
              <span v-if="breach.trustPenalty > 0" class="sdb-penalty">信任 -{{ breach.trustPenalty }}</span>
              <span v-if="breach.reputationPenalty > 0" class="sdb-penalty">声望 -{{ breach.reputationPenalty }}</span>
              <span v-if="breach.fineAmount > 0" class="sdb-penalty">罚款 ¥{{ breach.fineAmount }}</span>
            </div>
          </div>
        </div>

        <div class="sd-breach-rules">
          <div class="sd-section-title">📜 违约规则</div>
          <div 
            v-for="(config, type) in breachPenaltyConfig" 
            :key="type"
            class="sd-rule-item"
          >
            <span class="sdr-icon">{{ getBreachTypeIcon(type as any) }}</span>
            <div class="sdr-info">
              <span class="sdr-label">{{ config.label }}</span>
              <span class="sdr-desc">{{ config.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="sd-empty card">
      <span class="sde-icon">👆</span>
      <p>选择一个供应商查看详细关系信息</p>
    </div>
  </div>
</template>

<style scoped>
.supplier-rel-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.overview-summary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.os-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.os-icon {
  font-size: 18px;
}

.os-title {
  font-size: 15px;
  font-weight: 700;
  color: #667eea;
}

.os-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.os-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.oss-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.oss-value.accent {
  color: var(--success);
}

.oss-value.danger {
  color: #f56565;
}

.oss-label {
  font-size: 10px;
  color: var(--text-muted);
}

.supplier-rel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.srel-card {
  border-left: 3px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.srel-card.selected {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.srel-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.srel-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.srel-info {
  flex: 1;
  min-width: 0;
}

.srel-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.srel-tier {
  font-size: 11px;
  font-weight: 600;
}

.srel-trust {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.srel-trust-num {
  font-size: 18px;
  font-weight: 800;
}

.srel-trust-label {
  font-size: 9px;
  color: var(--text-muted);
}

.srel-bonuses-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.sb-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-secondary);
}

.sb-tag.danger {
  background: rgba(245, 101, 101, 0.15);
  color: #f56565;
}

.srel-trust-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.srel-trust-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.supplier-detail {
  border: 1px solid var(--border);
}

.sd-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.sd-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.sd-info {
  flex: 1;
}

.sd-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.sd-type {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.sd-tier-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 10px;
  flex-shrink: 0;
}

.sd-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 4px;
}

.sd-tab {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  background: transparent;
  color: var(--text-secondary);
}

.sd-tab.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.sd-content {
  animation: slideUp 0.2s ease-out;
}

.sd-bonus-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.sd-bonus-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.sdb-label {
  font-size: 10px;
  color: var(--text-muted);
}

.sdb-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.sdb-value.accent {
  color: var(--success);
}

.sd-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.sd-exclusive {
  margin-bottom: 16px;
}

.sd-exclusive-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sd-exclusive-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  font-size: 11px;
}

.sde-genre {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.sde-rarity {
  color: var(--accent-gold);
  font-weight: 600;
}

.sde-stock {
  color: var(--success);
  font-weight: 600;
}

.sde-price {
  color: var(--text-secondary);
}

.sd-purchase-stats {
  margin-bottom: 16px;
}

.sd-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.sd-stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  font-size: 11px;
}

.sds-label {
  color: var(--text-muted);
}

.sds-value {
  font-weight: 600;
  color: var(--text-primary);
}

.sd-contract-tiers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.sd-tier-card {
  padding: 12px;
  border: 1px solid;
  border-radius: 10px;
  opacity: 0.6;
}

.sd-tier-card.current {
  opacity: 1;
}

.sd-tier-card.locked {
  opacity: 0.4;
}

.sdt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.sdt-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.sdt-info {
  flex: 1;
}

.sdt-name {
  font-size: 13px;
  font-weight: 700;
}

.sdt-req {
  font-size: 10px;
  color: var(--text-muted);
}

.sdt-current {
  font-size: 10px;
  font-weight: 600;
  color: var(--success);
  background: rgba(72, 187, 120, 0.15);
  padding: 2px 8px;
  border-radius: 8px;
}

.sdt-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.sdt-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.sdt-benefit {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-secondary);
}

.sdt-sign-btn {
  width: 100%;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}

.sd-cancel-section {
  text-align: center;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}

.sd-cancel-btn {
  margin-bottom: 6px;
}

.sd-cancel-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0;
}

.sd-milestone-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sd-milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  opacity: 0.5;
}

.sd-milestone-item.unlocked {
  opacity: 1;
  background: rgba(72, 187, 120, 0.08);
}

.sdm-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.sdm-info {
  flex: 1;
  min-width: 0;
}

.sdm-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.sdm-reward {
  display: block;
  font-size: 10px;
  color: var(--success);
  font-weight: 500;
}

.sdm-req {
  display: flex;
  gap: 8px;
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}

.sdm-status {
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.sdm-status.done {
  color: var(--success);
}

.sdm-status.locked {
  color: var(--text-muted);
}

.sd-no-breach {
  text-align: center;
  padding: 20px;
}

.snb-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.sd-no-breach p {
  font-size: 13px;
  color: var(--success);
  margin: 0;
}

.sd-breach-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.sd-breach-item {
  padding: 10px 12px;
  background: rgba(245, 101, 101, 0.06);
  border: 1px solid rgba(245, 101, 101, 0.2);
  border-radius: 8px;
}

.sdb-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.sdb-icon {
  font-size: 14px;
}

.sdb-type {
  font-size: 12px;
  font-weight: 600;
  color: #f56565;
  flex: 1;
}

.sdb-day {
  font-size: 10px;
  color: var(--text-muted);
}

.sdb-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
}

.sdb-penalties {
  display: flex;
  gap: 8px;
}

.sdb-penalty {
  font-size: 10px;
  font-weight: 600;
  color: #f56565;
  background: rgba(245, 101, 101, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.sd-breach-rules {
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.sd-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.sdr-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.sdr-info {
  flex: 1;
}

.sdr-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.sdr-desc {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
}

.sd-empty {
  text-align: center;
  padding: 32px;
}

.sde-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.sd-empty p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
