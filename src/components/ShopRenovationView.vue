<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import {
  shopStyleConfigs,
  shopAreaConfigs,
  displaySlotUpgradeConfigs,
  customerAttractionConfigs,
  revenueBonusConfigs
} from '@/data/shopRenovation'
import type { DisplaySlotType } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const activeTab = ref<'style' | 'area' | 'display' | 'attraction' | 'revenue'>('style')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const selectedDisplaySlotId = ref<number | null>(null)

const tabs = [
  { id: 'style' as const, name: '风格升级', icon: '✨' },
  { id: 'area' as const, name: '区域扩容', icon: '📐' },
  { id: 'display' as const, name: '展示位', icon: '🖼️' },
  { id: 'attraction' as const, name: '客群吸引', icon: '🎯' },
  { id: 'revenue' as const, name: '收益加成', icon: '💰' }
]

const renovationBonus = computed(() => gameStore.shopRenovationBonus)

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 2500)
}

const handleUpgradeStyle = () => {
  const result = gameStore.upgradeShopStyle()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const handleUpgradeArea = () => {
  const result = gameStore.upgradeShopArea()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const handleUpgradeAttraction = () => {
  const result = gameStore.upgradeShopAttraction()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const handleUpgradeRevenue = () => {
  const result = gameStore.upgradeShopRevenue()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const handleUpgradeDisplaySlot = (slotId: number) => {
  const result = gameStore.upgradeDisplaySlotType(slotId)
  showMessage(result.message, result.success ? 'success' : 'error')
}

const getSlotTypeConfig = (type: DisplaySlotType) => {
  return displaySlotUpgradeConfigs.find(c => c.type === type) || displaySlotUpgradeConfigs[0]
}
</script>

<template>
  <div class="shop-renovation-overlay" @click.self="emit('close')">
    <div class="shop-renovation-view">
      <div class="renovation-header">
        <h2>🏗️ 店铺装修</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      <div class="summary-card card">
      <div class="summary-header">
        <span class="summary-icon">🏪</span>
        <span class="summary-title">店铺装修总览</span>
      </div>
      <div class="summary-stats">
        <div class="summary-stat">
          <span class="stat-icon">{{ gameStore.currentShopStyleConfig.icon }}</span>
          <span class="stat-label">风格</span>
          <span class="stat-value">{{ gameStore.currentShopStyleConfig.tierName }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-icon">{{ gameStore.currentShopAreaConfig.icon }}</span>
          <span class="stat-label">区域</span>
          <span class="stat-value">{{ gameStore.currentShopAreaConfig.tierName }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-icon">{{ gameStore.currentCustomerAttractionConfig.icon }}</span>
          <span class="stat-label">客源</span>
          <span class="stat-value">{{ gameStore.currentCustomerAttractionConfig.tierName }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-icon">{{ gameStore.currentRevenueBonusConfig.icon }}</span>
          <span class="stat-label">收益</span>
          <span class="stat-value">{{ gameStore.currentRevenueBonusConfig.tierName }}</span>
        </div>
      </div>
      <div class="summary-bonuses">
        <div class="bonus-row">
          <span class="bonus-label">客流加成</span>
          <span class="bonus-value positive">+{{ Math.round(renovationBonus.customerCountModifier * 100) }}%</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">预算加成</span>
          <span class="bonus-value positive">×{{ renovationBonus.budgetModifier.toFixed(2) }}</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">满意度加成</span>
          <span class="bonus-value positive">+{{ renovationBonus.satisfactionBonus }}</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">购买率加成</span>
          <span class="bonus-value positive">+{{ Math.round(renovationBonus.buyChanceBonus * 100) }}%</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">匹配度加成</span>
          <span class="bonus-value positive">+{{ renovationBonus.matchScoreBonus.toFixed(1) }}</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">售价加成</span>
          <span class="bonus-value positive">+{{ Math.round(renovationBonus.salePriceBonus * 100) }}%</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">利润率加成</span>
          <span class="bonus-value positive">+{{ Math.round(renovationBonus.profitMarginBonus * 100) }}%</span>
        </div>
        <div class="bonus-row">
          <span class="bonus-label">展示位数</span>
          <span class="bonus-value">{{ renovationBonus.totalDisplaySlots }}</span>
        </div>
        <div v-if="renovationBonus.attractGenres.length > 0" class="bonus-row">
          <span class="bonus-label">吸引风格</span>
          <span class="bonus-value genres">{{ renovationBonus.attractGenres.join('、') }}</span>
        </div>
      </div>
      <div class="summary-spent">
        <span>累计装修投入</span>
        <span class="spent-amount">¥{{ gameStore.shopRenovation.totalRenovationSpent }}</span>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-name">{{ tab.name }}</span>
      </button>
    </div>

    <p v-if="message" class="renovation-message" :class="messageType">
      {{ message }}
    </p>

    <div v-if="activeTab === 'style'" class="tab-content">
      <div class="upgrade-card card">
        <div class="upgrade-current">
          <div class="uc-header">
            <span class="uc-icon">{{ gameStore.currentShopStyleConfig.icon }}</span>
            <span class="uc-name">当前：{{ gameStore.currentShopStyleConfig.tierName }}</span>
          </div>
          <p class="uc-desc">{{ gameStore.currentShopStyleConfig.description }}</p>
          <div class="uc-effects">
            <span class="effect-tag">客流 +{{ Math.round(gameStore.currentShopStyleConfig.customerCountModifier * 100) }}%</span>
            <span class="effect-tag">预算 ×{{ gameStore.currentShopStyleConfig.budgetModifier.toFixed(2) }}</span>
            <span class="effect-tag">满意 +{{ gameStore.currentShopStyleConfig.satisfactionBonus }}</span>
          </div>
        </div>

        <div v-if="gameStore.canUpgradeShopStyle.nextConfig" class="upgrade-next">
          <div class="un-arrow">⬇️</div>
          <div class="un-header">
            <span class="un-icon">{{ gameStore.canUpgradeShopStyle.nextConfig.icon }}</span>
            <span class="un-name">升级到：{{ gameStore.canUpgradeShopStyle.nextConfig.tierName }}</span>
            <span class="un-cost">¥{{ gameStore.canUpgradeShopStyle.nextConfig.cost }}</span>
          </div>
          <p class="un-desc">{{ gameStore.canUpgradeShopStyle.nextConfig.description }}</p>
          <div class="un-effects">
            <span class="effect-tag positive">客流 +{{ Math.round(gameStore.canUpgradeShopStyle.nextConfig.customerCountModifier * 100) }}%</span>
            <span class="effect-tag positive">预算 ×{{ gameStore.canUpgradeShopStyle.nextConfig.budgetModifier.toFixed(2) }}</span>
            <span class="effect-tag positive">满意 +{{ gameStore.canUpgradeShopStyle.nextConfig.satisfactionBonus }}</span>
            <span class="effect-tag positive">购买 +{{ Math.round(gameStore.canUpgradeShopStyle.nextConfig.buyChanceBonus * 100) }}%</span>
          </div>
          <button
            class="upgrade-btn"
            :disabled="!gameStore.canUpgradeShopStyle.canUpgrade"
            @click="handleUpgradeStyle"
          >
            {{ gameStore.canUpgradeShopStyle.canUpgrade ? '✨ 升级风格' : gameStore.canUpgradeShopStyle.reason }}
          </button>
        </div>
        <div v-else class="max-level">
          <span class="ml-icon">🏆</span>
          <span class="ml-text">已达到最高等级！</span>
        </div>
      </div>

      <div class="all-tiers card">
        <h4 class="at-title">所有风格等级</h4>
        <div class="at-list">
          <div
            v-for="config in shopStyleConfigs"
            :key="config.tier"
            class="at-item"
            :class="{ active: config.tier === gameStore.shopRenovation.currentStyle }"
          >
            <span class="ati-icon">{{ config.icon }}</span>
            <span class="ati-name">{{ config.tierName }}</span>
            <span class="ati-cost">¥{{ config.cost }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'area'" class="tab-content">
      <div class="upgrade-card card">
        <div class="upgrade-current">
          <div class="uc-header">
            <span class="uc-icon">{{ gameStore.currentShopAreaConfig.icon }}</span>
            <span class="uc-name">当前：{{ gameStore.currentShopAreaConfig.tierName }}</span>
          </div>
          <p class="uc-desc">{{ gameStore.currentShopAreaConfig.description }}</p>
          <div class="uc-effects">
            <span class="effect-tag">展示位 {{ gameStore.currentShopAreaConfig.baseDisplaySlots }}</span>
            <span class="effect-tag">最大客流 +{{ gameStore.currentShopAreaConfig.maxCustomersBonus }}</span>
            <span class="effect-tag">客流 +{{ Math.round(gameStore.currentShopAreaConfig.customerCountModifier * 100) }}%</span>
          </div>
        </div>

        <div v-if="gameStore.canUpgradeShopArea.nextConfig" class="upgrade-next">
          <div class="un-arrow">⬇️</div>
          <div class="un-header">
            <span class="un-icon">{{ gameStore.canUpgradeShopArea.nextConfig.icon }}</span>
            <span class="un-name">扩容到：{{ gameStore.canUpgradeShopArea.nextConfig.tierName }}</span>
            <span class="un-cost">¥{{ gameStore.canUpgradeShopArea.nextConfig.cost }}</span>
          </div>
          <p class="un-desc">{{ gameStore.canUpgradeShopArea.nextConfig.description }}</p>
          <div class="un-effects">
            <span class="effect-tag positive">展示位 {{ gameStore.canUpgradeShopArea.nextConfig.baseDisplaySlots }}</span>
            <span class="effect-tag positive">最大客流 +{{ gameStore.canUpgradeShopArea.nextConfig.maxCustomersBonus }}</span>
            <span class="effect-tag positive">客流 +{{ Math.round(gameStore.canUpgradeShopArea.nextConfig.customerCountModifier * 100) }}%</span>
          </div>
          <button
            class="upgrade-btn"
            :disabled="!gameStore.canUpgradeShopArea.canUpgrade"
            @click="handleUpgradeArea"
          >
            {{ gameStore.canUpgradeShopArea.canUpgrade ? '📐 扩容区域' : gameStore.canUpgradeShopArea.reason }}
          </button>
        </div>
        <div v-else class="max-level">
          <span class="ml-icon">🏆</span>
          <span class="ml-text">已达到最大规模！</span>
        </div>
      </div>

      <div class="all-tiers card">
        <h4 class="at-title">所有区域等级</h4>
        <div class="at-list">
          <div
            v-for="config in shopAreaConfigs"
            :key="config.tier"
            class="at-item"
            :class="{ active: config.tier === gameStore.shopRenovation.currentArea }"
          >
            <span class="ati-icon">{{ config.icon }}</span>
            <span class="ati-name">{{ config.tierName }}</span>
            <span class="ati-cost">¥{{ config.cost }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'display'" class="tab-content">
      <div class="display-slots-card card">
        <h4 class="dsc-title">
          展示位升级
          <span class="dsc-subtitle">（共 {{ gameStore.shopRenovation.displaySlots.length }} 个展示位）</span>
        </h4>
        <div class="display-slots-grid">
          <div
            v-for="slot in gameStore.shopRenovation.displaySlots"
            :key="slot.id"
            class="display-slot-item"
            :class="{ selected: selectedDisplaySlotId === slot.id }"
            @click="selectedDisplaySlotId = selectedDisplaySlotId === slot.id ? null : slot.id"
          >
            <div class="dsi-header">
              <span class="dsi-icon">{{ getSlotTypeConfig(slot.type).icon }}</span>
              <span class="dsi-id">#{{ slot.id + 1 }}</span>
            </div>
            <span class="dsi-type">{{ getSlotTypeConfig(slot.type).typeName }}</span>
            <div class="dsi-effects">
              <span class="mini-tag">+{{ getSlotTypeConfig(slot.type).matchScoreBonus }}</span>
              <span class="mini-tag">+{{ Math.round(getSlotTypeConfig(slot.type).buyChanceBonus * 100) }}%</span>
            </div>
          </div>
        </div>

        <div v-if="selectedDisplaySlotId !== null" class="slot-upgrade-panel">
          <div
            v-if="gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig"
            class="slot-upgrade-info"
          >
            <span class="sup-arrow">⬇️ 升级到</span>
            <span class="sup-icon">{{ gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.icon }}</span>
            <span class="sup-name">{{ gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.typeName }}</span>
            <span class="sup-cost">¥{{ gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.cost }}</span>
            <div class="sup-effects">
              <span class="effect-tag positive">匹配 +{{ gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.matchScoreBonus }}</span>
              <span class="effect-tag positive">购买 +{{ Math.round(gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.buyChanceBonus * 100) }}%</span>
              <span class="effect-tag positive">品相保护 +{{ Math.round(gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).nextConfig!.conditionPreservationBonus * 100) }}%</span>
            </div>
            <button
              class="upgrade-btn"
              :disabled="!gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).canUpgrade"
              @click="handleUpgradeDisplaySlot(selectedDisplaySlotId!)"
            >
              {{ gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).canUpgrade ? '🖼️ 升级此展示位' : gameStore.getCanUpgradeDisplaySlot(selectedDisplaySlotId).reason }}
            </button>
          </div>
          <div v-else class="max-level">
            <span class="ml-icon">🏆</span>
            <span class="ml-text">此展示位已达最高等级！</span>
          </div>
        </div>
      </div>

      <div class="all-tiers card">
        <h4 class="at-title">展示位类型</h4>
        <div class="at-list">
          <div
            v-for="config in displaySlotUpgradeConfigs"
            :key="config.type"
            class="at-item"
          >
            <span class="ati-icon">{{ config.icon }}</span>
            <span class="ati-name">{{ config.typeName }}</span>
            <span class="ati-cost">¥{{ config.cost }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'attraction'" class="tab-content">
      <div class="upgrade-card card">
        <div class="upgrade-current">
          <div class="uc-header">
            <span class="uc-icon">{{ gameStore.currentCustomerAttractionConfig.icon }}</span>
            <span class="uc-name">当前：{{ gameStore.currentCustomerAttractionConfig.tierName }}</span>
          </div>
          <p class="uc-desc">{{ gameStore.currentCustomerAttractionConfig.description }}</p>
          <div class="uc-effects">
            <span class="effect-tag">特殊客群 +{{ Math.round(gameStore.currentCustomerAttractionConfig.specialCustomerWeightBoost * 100) }}%</span>
            <span class="effect-tag">会员概率 +{{ Math.round(gameStore.currentCustomerAttractionConfig.memberChanceBonus * 100) }}%</span>
          </div>
        </div>

        <div v-if="gameStore.canUpgradeShopAttraction.nextConfig" class="upgrade-next">
          <div class="un-arrow">⬇️</div>
          <div class="un-header">
            <span class="un-icon">{{ gameStore.canUpgradeShopAttraction.nextConfig.icon }}</span>
            <span class="un-name">升级到：{{ gameStore.canUpgradeShopAttraction.nextConfig.tierName }}</span>
            <span class="un-cost">¥{{ gameStore.canUpgradeShopAttraction.nextConfig.cost }}</span>
          </div>
          <p class="un-desc">{{ gameStore.canUpgradeShopAttraction.nextConfig.description }}</p>
          <div class="un-effects">
            <span class="effect-tag positive">特殊客群 +{{ Math.round(gameStore.canUpgradeShopAttraction.nextConfig.specialCustomerWeightBoost * 100) }}%</span>
            <span class="effect-tag positive">会员概率 +{{ Math.round(gameStore.canUpgradeShopAttraction.nextConfig.memberChanceBonus * 100) }}%</span>
            <span class="effect-tag positive">高预算 +{{ Math.round(gameStore.canUpgradeShopAttraction.nextConfig.highBudgetCustomerChance * 100) }}%</span>
          </div>
          <button
            class="upgrade-btn"
            :disabled="!gameStore.canUpgradeShopAttraction.canUpgrade"
            @click="handleUpgradeAttraction"
          >
            {{ gameStore.canUpgradeShopAttraction.canUpgrade ? '🎯 升级客源吸引' : gameStore.canUpgradeShopAttraction.reason }}
          </button>
        </div>
        <div v-else class="max-level">
          <span class="ml-icon">🏆</span>
          <span class="ml-text">已达到最高吸引力！</span>
        </div>
      </div>

      <div class="all-tiers card">
        <h4 class="at-title">所有客群吸引等级</h4>
        <div class="at-list">
          <div
            v-for="config in customerAttractionConfigs"
            :key="config.tier"
            class="at-item"
            :class="{ active: config.tier === gameStore.shopRenovation.customerAttraction }"
          >
            <span class="ati-icon">{{ config.icon }}</span>
            <span class="ati-name">{{ config.tierName }}</span>
            <span class="ati-cost">¥{{ config.cost }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'revenue'" class="tab-content">
      <div class="upgrade-card card">
        <div class="upgrade-current">
          <div class="uc-header">
            <span class="uc-icon">{{ gameStore.currentRevenueBonusConfig.icon }}</span>
            <span class="uc-name">当前：{{ gameStore.currentRevenueBonusConfig.tierName }}</span>
          </div>
          <p class="uc-desc">{{ gameStore.currentRevenueBonusConfig.description }}</p>
          <div class="uc-effects">
            <span class="effect-tag">售价 +{{ Math.round(gameStore.currentRevenueBonusConfig.salePriceBonus * 100) }}%</span>
            <span class="effect-tag">利润 +{{ Math.round(gameStore.currentRevenueBonusConfig.profitMarginBonus * 100) }}%</span>
          </div>
        </div>

        <div v-if="gameStore.canUpgradeShopRevenue.nextConfig" class="upgrade-next">
          <div class="un-arrow">⬇️</div>
          <div class="un-header">
            <span class="un-icon">{{ gameStore.canUpgradeShopRevenue.nextConfig.icon }}</span>
            <span class="un-name">升级到：{{ gameStore.canUpgradeShopRevenue.nextConfig.tierName }}</span>
            <span class="un-cost">¥{{ gameStore.canUpgradeShopRevenue.nextConfig.cost }}</span>
          </div>
          <p class="un-desc">{{ gameStore.canUpgradeShopRevenue.nextConfig.description }}</p>
          <div class="un-effects">
            <span class="effect-tag positive">售价 +{{ Math.round(gameStore.canUpgradeShopRevenue.nextConfig.salePriceBonus * 100) }}%</span>
            <span class="effect-tag positive">利润 +{{ Math.round(gameStore.canUpgradeShopRevenue.nextConfig.profitMarginBonus * 100) }}%</span>
            <span class="effect-tag positive">会员消费 +{{ Math.round(gameStore.canUpgradeShopRevenue.nextConfig.memberSpendBonus * 100) }}%</span>
          </div>
          <button
            class="upgrade-btn"
            :disabled="!gameStore.canUpgradeShopRevenue.canUpgrade"
            @click="handleUpgradeRevenue"
          >
            {{ gameStore.canUpgradeShopRevenue.canUpgrade ? '💰 升级收益加成' : gameStore.canUpgradeShopRevenue.reason }}
          </button>
        </div>
        <div v-else class="max-level">
          <span class="ml-icon">🏆</span>
          <span class="ml-text">已达到最高收益等级！</span>
        </div>
      </div>

      <div class="all-tiers card">
        <h4 class="at-title">所有收益加成等级</h4>
        <div class="at-list">
          <div
            v-for="config in revenueBonusConfigs"
            :key="config.tier"
            class="at-item"
            :class="{ active: config.tier === gameStore.shopRenovation.revenueBonus }"
          >
            <span class="ati-icon">{{ config.icon }}</span>
            <span class="ati-name">{{ config.tierName }}</span>
            <span class="ati-cost">¥{{ config.cost }}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.shop-renovation-overlay {
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

.shop-renovation-view {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: 24px;
}

.renovation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.renovation-header h2 {
  font-size: 18px;
  font-weight: 600;
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
}

.summary-card {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.1) 0%, rgba(233, 69, 96, 0.1) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.summary-icon {
  font-size: 20px;
}

.summary-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-gold);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-bonuses {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  margin-bottom: 12px;
}

.bonus-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.bonus-label {
  color: var(--text-secondary);
}

.bonus-value {
  font-weight: 600;
  color: var(--text-primary);
}

.bonus-value.positive {
  color: var(--success);
}

.bonus-value.genres {
  text-align: right;
  max-width: 60%;
}

.summary-spent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed rgba(246, 224, 94, 0.3);
  font-size: 12px;
  color: var(--text-secondary);
}

.spent-amount {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-orange);
}

.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.2) 0%, rgba(233, 69, 96, 0.2) 100%);
  color: var(--accent-gold);
  border-color: rgba(246, 224, 94, 0.4);
}

.tab-icon {
  font-size: 14px;
}

.renovation-message {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

.renovation-message.success {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.renovation-message.error {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.upgrade-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.upgrade-current {
  padding: 12px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}

.uc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.uc-icon {
  font-size: 22px;
}

.uc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.uc-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.uc-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.effect-tag {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.effect-tag.positive {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.upgrade-next {
  padding: 12px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(56, 178, 172, 0.08) 100%);
  border: 1px dashed rgba(72, 187, 120, 0.3);
  border-radius: 10px;
  animation: slideUp 0.3s ease-out;
}

.un-arrow {
  text-align: center;
  font-size: 14px;
  color: var(--success);
  margin-bottom: 6px;
}

.un-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.un-icon {
  font-size: 22px;
}

.un-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--success);
  flex: 1;
}

.un-cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-orange);
  padding: 2px 10px;
  background: rgba(237, 137, 54, 0.15);
  border-radius: 10px;
}

.un-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.un-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.upgrade-btn {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
}

.upgrade-btn:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.max-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: rgba(246, 224, 94, 0.1);
  border: 1px dashed rgba(246, 224, 94, 0.4);
  border-radius: 10px;
}

.ml-icon {
  font-size: 24px;
}

.ml-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
}

.all-tiers {
  padding: 14px;
}

.at-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.at-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.at-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.at-item.active {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.15) 0%, rgba(233, 69, 96, 0.15) 100%);
  border-color: rgba(246, 224, 94, 0.35);
}

.ati-icon {
  font-size: 18px;
}

.ati-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.ati-cost {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-orange);
}

.display-slots-card {
  padding: 14px;
}

.dsc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.dsc-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 6px;
}

.display-slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.display-slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.display-slot-item.selected {
  border-color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.1);
}

.dsi-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dsi-icon {
  font-size: 22px;
}

.dsi-id {
  font-size: 9px;
  color: var(--text-muted);
}

.dsi-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.dsi-effects {
  display: flex;
  gap: 3px;
}

.mini-tag {
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 500;
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
}

.slot-upgrade-panel {
  padding: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 1px dashed rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  animation: slideUp 0.3s ease-out;
}

.slot-upgrade-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sup-arrow {
  font-size: 12px;
  color: var(--success);
}

.sup-icon {
  font-size: 24px;
}

.sup-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sup-cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-orange);
  padding: 2px 10px;
  background: rgba(237, 137, 54, 0.15);
  border-radius: 10px;
}

.sup-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
