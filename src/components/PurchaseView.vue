<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import RecordCard from './RecordCard.vue'
import type { Record } from '@/types'
import { ref } from 'vue'
import { getConditionColor, getConditionScoreFromLabel } from '@/data/condition'

const gameStore = useGameStore()
const selectedRecord = ref<Record | null>(null)
const quantity = ref(1)
const message = ref('')

const openPurchaseModal = (record: Record) => {
  selectedRecord.value = record
  quantity.value = 1
  message.value = ''
}

const closeModal = () => {
  selectedRecord.value = null
  message.value = ''
}

const handlePurchase = () => {
  if (!selectedRecord.value) return
  
  const totalCost = selectedRecord.value.costPrice * quantity.value
  if (gameStore.budget < totalCost) {
    message.value = '预算不足！'
    return
  }

  const success = gameStore.purchaseRecord(selectedRecord.value, quantity.value)
  if (success) {
    message.value = `成功购入 ${quantity.value} 张《${selectedRecord.value.title}》！`
    setTimeout(() => {
      closeModal()
    }, 1000)
  }
}

const changeQuantity = (delta: number) => {
  const newQty = quantity.value + delta
  if (newQty >= 1 && newQty <= 10) {
    quantity.value = newQty
  }
}

const goToNextPhase = () => {
  gameStore.advancePhase()
}
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
    </div>

    <div class="section-header">
      <h2 class="section-title">📦 供应商货单</h2>
      <p class="section-desc">点击唱片查看详情并购买</p>
    </div>

    <div class="records-list">
      <RecordCard
        v-for="record in gameStore.shopRecordsForPurchase"
        :key="record.id"
        :record="record"
        :show-cost="true"
        :show-price="true"
        @click="openPurchaseModal(record)"
      />
    </div>

    <div v-if="gameStore.inventory.length > 0" class="inventory-section">
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
        />
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
      <div v-if="selectedRecord" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>购买唱片</h3>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <RecordCard 
              :record="selectedRecord" 
              :show-cost="true" 
              :show-price="true" 
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

            <div class="quantity-selector">
              <span class="qty-label">购买数量</span>
              <div class="qty-controls">
                <button class="qty-btn" @click="changeQuantity(-1)">-</button>
                <span class="qty-value">{{ quantity }}</span>
                <button class="qty-btn" @click="changeQuantity(1)">+</button>
              </div>
            </div>

            <div class="total-row">
              <span class="total-label">总计</span>
              <span class="total-value">¥{{ selectedRecord.costPrice * quantity }}</span>
            </div>

            <p v-if="message" class="message" :class="{ error: message.includes('不足') }">
              {{ message }}
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">取消</button>
            <button 
              class="btn-primary"
              :disabled="gameStore.budget < selectedRecord.costPrice * quantity"
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

.section-header {
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-section {
  margin-top: 8px;
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

.qty-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-gold);
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
</style>
