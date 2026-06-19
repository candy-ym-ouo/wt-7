<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { InventoryItem, DisplaySlot } from '@/types'

const gameStore = useGameStore()
const selectedInventory = ref<InventoryItem | null>(null)

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
        精心的陈列可以提高顾客的购买意愿！
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
        </div>
        <div class="item-qty">
          <span class="qty-label">库存</span>
          <span class="qty-value">{{ item.quantity }}</span>
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
</style>
