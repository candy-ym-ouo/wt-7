<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { InventoryItem, DisplaySlot } from '@/types'
import { getConditionLabel, getConditionColor, getRenovationOptions } from '@/data/condition'

const gameStore = useGameStore()
const selectedInventory = ref<InventoryItem | null>(null)
const showRenovateModal = ref(false)
const renovateInventory = ref<InventoryItem | null>(null)
const renovateMessage = ref('')
const renovateMessageType = ref<'success' | 'error'>('success')

const getInventoryDisplayCount = (recordId: string) => {
  return gameStore.displaySlots.filter(s => s.inventoryId === recordId).length
}

const getInventoryMinConditionScore = (inv: InventoryItem) => {
  const displayed = gameStore.displaySlots
    .filter(s => s.inventoryId === inv.record.id && s.conditionScore !== null)
    .map(s => s.conditionScore as number)
  const allScores = [...displayed]
  for (let i = 0; i < inv.quantity; i++) {
    allScores.push(inv.conditionScore)
  }
  return allScores.length ? Math.min(...allScores) : inv.conditionScore
}

const getInventoryMaxConditionScore = (inv: InventoryItem) => {
  const displayed = gameStore.displaySlots
    .filter(s => s.inventoryId === inv.record.id && s.conditionScore !== null)
    .map(s => s.conditionScore as number)
  const allScores = [...displayed]
  for (let i = 0; i < inv.quantity; i++) {
    allScores.push(inv.conditionScore)
  }
  return allScores.length ? Math.max(...allScores) : inv.conditionScore
}

const selectInventoryItem = (item: InventoryItem) => {
  if (item.quantity > 0) {
    selectedInventory.value = item
  }
}

const placeRecord = (slot: DisplaySlot) => {
  if (!selectedInventory.value) return
  
  const success = gameStore.placeToDisplay(selectedInventory.value.record.id, slot.id)
  if (success) {
    if (selectedInventory.value.quantity <= 0) {
      selectedInventory.value = null
    }
  }
}

const removeRecord = (slot: DisplaySlot) => {
  if (slot.inventoryId) {
    gameStore.removeFromDisplay(slot.id)
  }
}

const getDisplayedRecord = (slot: DisplaySlot) => {
  if (!slot.inventoryId) return null
  const invItem = gameStore.inventory.find(i => i.record.id === slot.inventoryId)
  return invItem?.record || null
}

const getDisplayedConditionScore = (slot: DisplaySlot) => {
  return slot.conditionScore ?? -1
}

const openRenovateModal = (item: InventoryItem) => {
  renovateInventory.value = item
  renovateMessage.value = ''
  showRenovateModal.value = true
}

const closeRenovateModal = () => {
  showRenovateModal.value = false
  renovateInventory.value = null
  renovateMessage.value = ''
}

const handleRenovate = (targetScore: number) => {
  if (!renovateInventory.value) return
  const result = gameStore.renovateInventoryRecord(renovateInventory.value.record.id, targetScore)
  renovateMessage.value = result.message
  renovateMessageType.value = result.success ? 'success' : 'error'
  if (result.success) {
    setTimeout(() => {
      closeRenovateModal()
    }, 1500)
  }
}

const goToNextPhase = () => {
  gameStore.advancePhase()
}

const goToPrevPhase = () => {
  gameStore.phase = 'purchase'
}
</script>

<template>
  <div class="display-view">
    <div class="info-card card">
      <p class="info-text">
        💡 从库存中选择唱片，然后点击货架空位进行陈列。<br>
        精心的陈列可以提高顾客的购买意愿！<br>
        ⚠️ 陈列中的唱片品相会加速衰减，注意翻新维护！
      </p>
    </div>

    <div class="section-header">
      <h2 class="section-title">🏪 店内壁架</h2>
      <p class="section-desc">
        已陈列 {{ gameStore.displaySlots.filter(s => s.inventoryId).length }} / {{ gameStore.displaySlots.length }} 格
      </p>
    </div>

    <div class="display-rack">
      <div 
        v-for="slot in gameStore.displaySlots" 
        :key="slot.id"
        class="display-slot"
        :class="{ 
          filled: slot.inventoryId, 
          selected: selectedInventory && !slot.inventoryId 
        }"
        @click="slot.inventoryId ? removeRecord(slot) : placeRecord(slot)"
      >
        <template v-if="getDisplayedRecord(slot)">
          <VinylRecord 
            :record="getDisplayedRecord(slot)!" 
            size="medium"
          />
          <div class="record-name">{{ getDisplayedRecord(slot)?.title }}</div>
          <div class="slot-condition" :style="{ color: getConditionColor(getDisplayedConditionScore(slot)) }">
            {{ getConditionLabel(getDisplayedConditionScore(slot)) }}
          </div>
          <div class="remove-hint">点击移除</div>
        </template>
        <template v-else>
          <div class="empty-slot">
            <span class="plus-icon">+</span>
            <span class="empty-text">空位</span>
          </div>
        </template>
      </div>
    </div>

    <div class="section-header">
      <h2 class="section-title">📦 我的库存</h2>
      <p class="section-desc">点击选择要陈列的唱片</p>
    </div>

    <div class="inventory-list">
      <div 
        v-for="item in gameStore.inventory"
        :key="item.record.id"
        class="inventory-item"
        :class="{ 
          selected: selectedInventory?.record.id === item.record.id,
          disabled: item.quantity <= 0
        }"
        @click="selectInventoryItem(item)"
      >
        <VinylRecord :record="item.record" size="small" />
        <div class="item-info">
          <h3 class="item-title">{{ item.record.title }}</h3>
          <p class="item-artist">{{ item.record.artist }}</p>
          <span class="genre-tag">{{ item.record.genre }}</span>
          <div class="item-condition">
            <div class="condition-bar-mini">
              <div 
                class="condition-fill-mini" 
                :style="{ width: item.conditionScore + '%', background: getConditionColor(item.conditionScore) }"
              ></div>
            </div>
            <span class="condition-text" :style="{ color: getConditionColor(item.conditionScore) }">
              {{ getConditionLabel(item.conditionScore) }}
            </span>
          </div>
        </div>
        <div class="item-actions">
          <div class="item-qty">
            <span class="qty-label">库存</span>
            <span class="qty-value">{{ item.quantity }}</span>
          </div>
          <button 
            class="renovate-btn"
            @click.stop="openRenovateModal(item)"
            :disabled="getRenovationOptions(getInventoryMinConditionScore(item), item.record.rarity).length === 0"
          >
            🔧
          </button>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-secondary action-btn" @click="goToPrevPhase">
        ← 返回进货
      </button>
      <button 
        class="btn-primary action-btn"
        :disabled="!gameStore.canAdvancePhase"
        @click="goToNextPhase"
      >
        开始营业 →
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showRenovateModal && renovateInventory" class="modal-overlay" @click.self="closeRenovateModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>🔧 翻新唱片</h3>
            <button class="close-btn" @click="closeRenovateModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="renovate-record-info">
              <h4>{{ renovateInventory.record.title }}</h4>
              <p>{{ renovateInventory.record.artist }}</p>
              <div class="renovate-pieces-info">
                <span class="rpi-tag">库存×{{ renovateInventory.quantity }}</span>
                <span class="rpi-tag">陈列×{{ getInventoryDisplayCount(renovateInventory.record.id) }}</span>
                <span class="rpi-tag">共{{ renovateInventory.quantity + getInventoryDisplayCount(renovateInventory.record.id) }}张</span>
              </div>
              <div class="renovate-current-condition">
                <span>当前品相</span>
                <div class="condition-bar-lg">
                  <div 
                    class="condition-fill-lg" 
                    :style="{ width: getInventoryMinConditionScore(renovateInventory) + '%', background: getConditionColor(getInventoryMinConditionScore(renovateInventory)) }"
                  ></div>
                </div>
                <span :style="{ color: getConditionColor(getInventoryMinConditionScore(renovateInventory)) }">
                  {{ getConditionLabel(getInventoryMinConditionScore(renovateInventory)) }}
                  ({{ getInventoryMinConditionScore(renovateInventory) }}{{ getInventoryMinConditionScore(renovateInventory) !== getInventoryMaxConditionScore(renovateInventory) ? '-' + getInventoryMaxConditionScore(renovateInventory) : '' }})
                </span>
              </div>
            </div>

            <div class="renovate-options">
              <h4 class="ro-title">选择翻新方案（所有副本统一升级）</h4>
              <div 
                v-for="option in getRenovationOptions(getInventoryMinConditionScore(renovateInventory), renovateInventory.record.rarity)" 
                :key="option.targetScore"
                class="renovate-option"
                :class="{ disabled: gameStore.budget < option.cost }"
                @click="handleRenovate(option.targetScore)"
              >
                <div class="ro-info">
                  <span class="ro-label" :style="{ color: getConditionColor(option.targetScore) }">
                    {{ option.targetLabel }}
                  </span>
                  <span class="ro-desc">{{ option.description }}</span>
                </div>
                <span class="ro-cost" :class="{ 'cannot-afford': gameStore.budget < option.cost }">
                  ¥{{ option.cost }}
                </span>
              </div>
              <div v-if="getRenovationOptions(getInventoryMinConditionScore(renovateInventory), renovateInventory.record.rarity).length === 0" class="ro-maxed">
                品相已达最佳，无需翻新
              </div>
            </div>

            <p v-if="renovateMessage" class="renovate-message" :class="renovateMessageType">
              {{ renovateMessage }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.display-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.info-card {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(243, 156, 18, 0.1) 100%);
  border-color: rgba(233, 69, 96, 0.3);
}

.info-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
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

.display-rack {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.display-slot {
  aspect-ratio: 1;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px dashed var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  padding: 8px;
}

.display-slot.selected {
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
  animation: pulse 1.5s ease-in-out infinite;
}

.display-slot.filled {
  border-style: solid;
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
}

.empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.plus-icon {
  font-size: 24px;
  color: var(--text-muted);
}

.empty-text {
  font-size: 10px;
  color: var(--text-muted);
}

.record-name {
  font-size: 9px;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.remove-hint {
  font-size: 8px;
  color: var(--danger);
  opacity: 0.7;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  cursor: pointer;
}

.inventory-item:hover:not(.disabled) {
  border-color: var(--accent-gold);
}

.inventory-item.selected {
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
}

.inventory-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.genre-tag {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.item-qty {
  text-align: center;
}

.item-qty .qty-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.item-qty .qty-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-orange);
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 16px;
  display: flex;
  gap: 12px;
  background: linear-gradient(to top, var(--bg-primary) 70%, transparent);
  z-index: 50;
}

.action-btn {
  flex: 1;
}

.slot-condition {
  font-size: 8px;
  font-weight: 600;
}

.item-condition {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.condition-bar-mini {
  flex: 1;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.condition-fill-mini {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.condition-text {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.renovate-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-secondary);
  font-size: 14px;
  transition: all 0.2s;
}

.renovate-btn:hover:not(:disabled) {
  background: rgba(246, 224, 94, 0.2);
  border-color: var(--accent-gold);
}

.renovate-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

.renovate-record-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.renovate-record-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.renovate-pieces-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.rpi-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
}

.renovate-current-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.condition-bar-lg {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.condition-fill-lg {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ro-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.renovate-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.renovate-option:hover:not(.disabled) {
  border-color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.1);
}

.renovate-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ro-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ro-label {
  font-size: 13px;
  font-weight: 600;
}

.ro-desc {
  font-size: 10px;
  color: var(--text-muted);
}

.ro-cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-gold);
}

.ro-cost.cannot-afford {
  color: var(--danger);
}

.ro-maxed {
  text-align: center;
  padding: 16px;
  color: var(--success);
  font-size: 13px;
  font-weight: 500;
}

.renovate-message {
  text-align: center;
  font-size: 13px;
  padding: 10px;
  border-radius: 6px;
}

.renovate-message.success {
  color: var(--success);
  background: rgba(72, 187, 120, 0.1);
}

.renovate-message.error {
  color: var(--danger);
  background: rgba(245, 101, 101, 0.1);
}
</style>
