<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VinylRecord from './VinylRecord.vue'
import type { InventoryItem, RepairQuality, RepairMaterialType, RepairTask } from '@/types'
import { getConditionLabel, getConditionColor, calculateCollectionValue } from '@/data/condition'
import {
  repairMaterials,
  repairQualityConfigs,
  getRepairMaterial,
  getRepairQualityConfig
} from '@/data/repairWorkshop'

const emit = defineEmits<{
  close: []
}>()

type TabType = 'inventory' | 'materials' | 'history'

const gameStore = useGameStore()
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const selectedInventory = ref<InventoryItem | null>(null)
const selectedQuality = ref<RepairQuality>('professional')
const targetCondition = ref(75)
const showConfirmModal = ref(false)
const activeTab = ref<TabType>('inventory')
const taskProgress = ref<Record<string, number>>({})
let progressTimer: number | null = null

const stats = computed(() => gameStore.repairStats)
const materials = computed(() => gameStore.repairMaterials)
const activeTasks = computed(() => gameStore.activeRepairTasks)
const repairHistory = computed(() => gameStore.repairHistory)
const repairableItems = computed(() => {
  const repairingIds = activeTasks.value.map(t => t.inventoryId)
  return gameStore.inventory.filter((item, idx) => {
    return item.conditionScore < 85 && !repairingIds.includes(idx.toString())
  })
})

const selectedEstimate = computed(() => {
  if (!selectedInventory.value) return null
  return gameStore.getRepairTaskEstimate(
    selectedInventory.value,
    targetCondition.value,
    selectedQuality.value
  )
})

const availableQualities = computed(() => {
  return repairQualityConfigs.filter(q => 
    gameStore.repairWorkshop.unlockedQualities.includes(q.quality)
  )
})

const totalMaterialCost = computed(() => stats.value.totalMaterialCost)
const totalLaborCost = computed(() => stats.value.totalLaborCost)
const totalRepairCost = computed(() => totalMaterialCost.value + totalLaborCost.value)
const netProfit = computed(() => stats.value.totalPriceIncrease - totalRepairCost.value)

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}

const selectInventory = (item: InventoryItem) => {
  selectedInventory.value = item
  const recommendedTarget = Math.min(90, item.conditionScore + 25)
  targetCondition.value = Math.max(item.conditionScore + 5, recommendedTarget)
}

const handleBuyMaterial = (type: RepairMaterialType) => {
  const result = gameStore.buyRepairMaterial(type, 1)
  showMessage(result.message, result.success ? 'success' : 'error')
}

const startRepair = () => {
  if (!selectedInventory.value) return
  const result = gameStore.startRepairTask(
    selectedInventory.value,
    targetCondition.value,
    selectedQuality.value
  )
  showMessage(result.message, result.success ? 'success' : 'error')
  if (result.success && result.taskId) {
    taskProgress.value[result.taskId] = 0
    selectedInventory.value = null
    showConfirmModal.value = false
  }
}

const handleUnlockMaster = () => {
  const result = gameStore.unlockMasterQuality()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const handleExpandCapacity = () => {
  const result = gameStore.expandRepairCapacity()
  showMessage(result.message, result.success ? 'success' : 'error')
}

const getMaterialQuantity = (type: RepairMaterialType): number => {
  const inv = materials.value.find(m => m.type === type)
  return inv ? inv.quantity : 0
}

const formatCollectionValue = (value: number) => {
  if (value >= 10000) return (value / 10000).toFixed(1) + '万'
  return value.toString()
}

const getTaskProgress = (task: RepairTask): number => {
  if (taskProgress.value[task.id] !== undefined) {
    return taskProgress.value[task.id]
  }
  if (task.startTime) {
    const elapsed = Date.now() - task.startTime
    const totalDuration = task.durationMinutes * 100
    return Math.min(100, Math.floor((elapsed / totalDuration) * 100))
  }
  return 0
}

const getProgressText = (task: RepairTask): string => {
  const progress = getTaskProgress(task)
  if (progress < 30) return '准备修复材料中...'
  if (progress < 60) return '清洁与划痕处理中...'
  if (progress < 85) return '精细抛光与稳定中...'
  return '最终品质检查中...'
}

const switchTab = (tab: TabType) => {
  activeTab.value = tab
}

onMounted(() => {
  activeTasks.value.forEach(task => {
    if (taskProgress.value[task.id] === undefined) {
      taskProgress.value[task.id] = getTaskProgress(task)
    }
  })
  progressTimer = window.setInterval(() => {
    activeTasks.value.forEach(task => {
      const current = taskProgress.value[task.id] || 0
      if (current < 100) {
        taskProgress.value[task.id] = Math.min(100, current + 2)
      }
    })
  }, 100)
})

onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})
</script>

<template>
  <div class="repair-workshop-overlay" @click.self="emit('close')">
    <div class="repair-workshop-modal">
      <div class="modal-header">
        <div class="header-title">
          <span class="header-icon">🔧</span>
          <h2>唱片修复工坊</h2>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="workshop-stats card">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">✅</span>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalRepairsCompleted }}</span>
              <span class="stat-label">成功修复</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <div class="stat-content">
              <span class="stat-value">{{ stats.successRate }}%</span>
              <span class="stat-label">成功率</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <div class="stat-content">
              <span class="stat-value success">+¥{{ stats.totalPriceIncrease }}</span>
              <span class="stat-label">售价提升</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <div class="stat-content">
              <span class="stat-value">{{ stats.rarityUpgrades }}</span>
              <span class="stat-label">稀有度提升</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📦</span>
            <div class="stat-content">
              <span class="stat-value">¥{{ totalRepairCost }}</span>
              <span class="stat-label">总投入成本</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📈</span>
            <div class="stat-content">
              <span class="stat-value" :class="{ success: netProfit > 0, negative: netProfit <= 0 }">
                {{ netProfit > 0 ? '+' : '' }}¥{{ netProfit }}
              </span>
              <span class="stat-label">净利润</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="message" class="message-bar" :class="messageType">
        {{ message }}
      </div>

      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'inventory' }"
          @click="switchTab('inventory')"
        >
          📦 待修库存
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'materials' }"
          @click="switchTab('materials')"
        >
          🧴 耗材管理
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'history' }"
          @click="switchTab('history')"
        >
          📋 修复记录
        </button>
      </div>

      <div class="workshop-content">
        <template v-if="activeTab === 'inventory'">
          <div v-if="activeTasks.length > 0" class="active-tasks-section">
            <h3 class="section-subtitle">🔄 修复中 ({{ activeTasks.length }}/{{ gameStore.repairWorkshop.maxActiveTasks }})</h3>
            <div class="active-tasks-list">
              <div v-for="task in activeTasks" :key="task.id" class="active-task-card">
                <div class="task-record-info">
                  <VinylRecord :record="task.record" size="small" />
                  <div class="task-details">
                    <span class="task-title">{{ task.record.title }}</span>
                    <div class="task-quality-row">
                      <span class="task-quality">
                        {{ getRepairQualityConfig(task.quality).icon }} {{ getRepairQualityConfig(task.quality).qualityName }}
                      </span>
                      <span class="task-cost">投入 ¥{{ task.totalCost }}</span>
                    </div>
                    <div class="task-condition-row">
                      <span 
                        class="mini-condition"
                        :style="{ color: getConditionColor(task.initialConditionScore) }"
                      >
                        {{ getConditionLabel(task.initialConditionScore) }}
                      </span>
                      <span class="arrow">→</span>
                      <span 
                        class="mini-condition target"
                        :style="{ color: getConditionColor(task.targetConditionScore) }"
                      >
                        {{ getConditionLabel(task.targetConditionScore) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="task-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getTaskProgress(task) + '%' }"
                    ></div>
                  </div>
                  <div class="progress-info">
                    <span class="progress-text">{{ getProgressText(task) }}</span>
                    <span class="progress-percent">{{ getTaskProgress(task) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="materials-bar">
            <span class="materials-label">耗材库存:</span>
            <div class="materials-chips">
              <span 
                v-for="mat in repairMaterials" 
                :key="mat.type" 
                class="material-chip"
                :class="{ low: getMaterialQuantity(mat.type) <= 2 }"
                :title="mat.name + ': 库存' + getMaterialQuantity(mat.type)"
              >
                {{ mat.icon }} {{ getMaterialQuantity(mat.type) }}
              </span>
            </div>
          </div>

          <div class="repairable-section">
            <h3 class="section-subtitle">📦 待修唱片 ({{ repairableItems.length }})</h3>
            
            <div v-if="repairableItems.length === 0" class="empty-state">
              <div class="empty-icon">🎵</div>
              <p>暂无可修复的唱片</p>
              <p class="empty-sub">所有唱片品相良好！</p>
            </div>

            <div class="repairable-list">
              <div 
                v-for="(item, index) in repairableItems" 
                :key="index"
                class="repairable-item card"
                :class="{ selected: selectedInventory === item }"
                @click="selectInventory(item)"
              >
                <VinylRecord :record="item.record" size="small" />
                <div class="item-info">
                  <h4 class="item-title">{{ item.record.title }}</h4>
                  <p class="item-artist">{{ item.record.artist }}</p>
                  <div class="item-meta">
                    <span 
                      class="condition-badge"
                      :style="{ 
                        color: getConditionColor(item.conditionScore),
                        background: getConditionColor(item.conditionScore) + '20'
                      }"
                    >
                      {{ getConditionLabel(item.conditionScore) }} ({{ item.conditionScore }})
                    </span>
                    <span class="price-tag">¥{{ item.record.marketPrice }}</span>
                    <span class="rarity-stars">{{ '★'.repeat(item.record.rarity) }}</span>
                  </div>
                </div>
                <div class="item-value-info">
                  <span class="collection-value-label">收藏价值</span>
                  <span class="collection-value">
                    ¥{{ formatCollectionValue(calculateCollectionValue(item.record.rarity, item.conditionScore, item.record.marketPrice)) }}
                  </span>
                  <span class="repair-hint">点击修复</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'materials'">
          <div class="materials-stats card">
            <div class="ms-row">
              <span class="ms-label">耗材总投入</span>
              <span class="ms-value">¥{{ totalMaterialCost }}</span>
            </div>
            <div class="ms-row">
              <span class="ms-label">人工总投入</span>
              <span class="ms-value">¥{{ totalLaborCost }}</span>
            </div>
            <div class="ms-row highlight">
              <span class="ms-label">投入总计</span>
              <span class="ms-value">¥{{ totalRepairCost }}</span>
            </div>
          </div>

          <h3 class="section-subtitle">🛒 耗材库存</h3>
          <div class="shop-balance">
            当前预算: <span class="balance-value">¥{{ gameStore.budget }}</span>
          </div>
          <div class="material-shop-list">
            <div v-for="mat in repairMaterials" :key="mat.type" class="shop-item card">
              <div class="shop-item-icon">{{ mat.icon }}</div>
              <div class="shop-item-info">
                <h4>{{ mat.name }}</h4>
                <p>{{ mat.description }}</p>
                <div class="shop-item-effects">
                  <span>品相 +{{ mat.conditionBoost }}</span>
                  <span v-if="mat.priceBoostPercent > 0">售价 +{{ Math.round(mat.priceBoostPercent * 100) }}%</span>
                  <span v-if="mat.rarityBoostChance > 0">稀有度 +{{ Math.round(mat.rarityBoostChance * 100) }}%</span>
                </div>
              </div>
              <div class="shop-item-actions">
                <span 
                  class="shop-stock" 
                  :class="{ low: getMaterialQuantity(mat.type) <= 2 }"
                >
                  库存: {{ getMaterialQuantity(mat.type) }}
                </span>
                <button 
                  class="btn-primary buy-btn"
                  @click="handleBuyMaterial(mat.type)"
                >
                  ¥{{ mat.unitCost }} 购买
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'history'">
          <div class="history-summary card">
            <div class="hs-grid">
              <div class="hs-item">
                <span class="hs-label">总修复次数</span>
                <span class="hs-value">{{ stats.totalRepairsCompleted + stats.totalRepairsFailed }}</span>
              </div>
              <div class="hs-item">
                <span class="hs-label">成功次数</span>
                <span class="hs-value success">{{ stats.totalRepairsCompleted }}</span>
              </div>
              <div class="hs-item">
                <span class="hs-label">失败次数</span>
                <span class="hs-value negative">{{ stats.totalRepairsFailed }}</span>
              </div>
              <div class="hs-item">
                <span class="hs-label">成功率</span>
                <span class="hs-value">{{ stats.successRate }}%</span>
              </div>
              <div class="hs-item">
                <span class="hs-label">累计售价提升</span>
                <span class="hs-value success">+¥{{ stats.totalPriceIncrease }}</span>
              </div>
              <div class="hs-item">
                <span class="hs-label">收藏价值提升</span>
                <span class="hs-value success">+¥{{ stats.totalCollectionValueGain }}</span>
              </div>
            </div>
          </div>

          <div v-if="repairHistory.length > 0" class="completed-section">
            <h3 class="section-subtitle">📜 历史记录 (最近{{ Math.min(repairHistory.length, 20) }}条)</h3>
            <div class="completed-list">
              <div 
                v-for="entry in repairHistory.slice(0, 20)" 
                :key="entry.id" 
                class="completed-item card history-item"
                :class="{ success: entry.success, failed: !entry.success }"
              >
                <div class="completed-header">
                  <span class="completed-title">{{ entry.recordTitle }}</span>
                  <div class="completed-right">
                    <span class="completed-day">第{{ entry.day }}天</span>
                    <span class="completed-status" :class="entry.success ? 'completed' : 'failed'">
                      {{ entry.success ? '✓' : '✗' }}
                    </span>
                  </div>
                </div>
                <div class="history-condition-row">
                  <span :style="{ color: getConditionColor(entry.initialCondition) }">
                    {{ getConditionLabel(entry.initialCondition) }} ({{ entry.initialCondition }})
                  </span>
                  <span class="arrow">→</span>
                  <span :style="{ color: getConditionColor(entry.finalCondition) }">
                    {{ getConditionLabel(entry.finalCondition) }} ({{ entry.finalCondition }})
                  </span>
                </div>
                <div class="completed-meta">
                  <span :class="{ positive: entry.priceIncrease > 0, negative: entry.priceIncrease < 0 }">
                    售价 {{ entry.priceIncrease > 0 ? '+' : '' }}¥{{ entry.priceIncrease }}
                  </span>
                  <span>投入 ¥{{ entry.totalCost }}</span>
                  <span>{{ getRepairQualityConfig(entry.quality).icon }} {{ getRepairQualityConfig(entry.quality).qualityName }}</span>
                  <span v-if="entry.rarityUpgraded" class="rarity-up">⭐ 稀有度提升!</span>
                </div>
                <div class="history-materials">
                  <span v-for="matType in entry.materialsUsed" :key="matType" class="history-mat-chip">
                    {{ getRepairMaterial(matType).icon }} {{ getRepairMaterial(matType).name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <p>暂无修复记录</p>
            <p class="empty-sub">开始修复唱片后，记录将显示在这里</p>
          </div>
        </template>
      </div>

      <div v-if="activeTab === 'inventory'" class="workshop-upgrades card">
        <div class="upgrade-item">
          <div class="upgrade-info">
            <span class="upgrade-icon">🏆</span>
            <div>
              <span class="upgrade-name">大师修复</span>
              <span class="upgrade-desc">
                {{ gameStore.repairWorkshop.unlockedQualities.includes('master') ? '已解锁' : '需完成10次修复 + ¥2000' }}
              </span>
            </div>
          </div>
          <button 
            class="btn-secondary"
            :disabled="gameStore.repairWorkshop.unlockedQualities.includes('master')"
            @click="handleUnlockMaster"
          >
            {{ gameStore.repairWorkshop.unlockedQualities.includes('master') ? '已解锁' : '解锁 ¥2000' }}
          </button>
        </div>
        <div class="upgrade-item">
          <div class="upgrade-info">
            <span class="upgrade-icon">🏭</span>
            <div>
              <span class="upgrade-name">扩展容量</span>
              <span class="upgrade-desc">
                当前: {{ gameStore.repairWorkshop.maxActiveTasks }}个并行任务
                {{ gameStore.repairWorkshop.maxActiveTasks < 6 ? ` (升级¥${gameStore.repairWorkshop.maxActiveTasks * 1500})` : ' · 已达最大' }}
              </span>
            </div>
          </div>
          <button 
            class="btn-secondary"
            :disabled="gameStore.repairWorkshop.maxActiveTasks >= 6"
            @click="handleExpandCapacity"
          >
            {{ gameStore.repairWorkshop.maxActiveTasks >= 6 ? '已满级' : '扩展' }}
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedInventory && showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
        <div class="modal-content animate-slide-up repair-config-modal">
          <div class="modal-header">
            <h3>修复配置</h3>
            <button class="close-btn" @click="showConfirmModal = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="repair-record-preview">
              <VinylRecord :record="selectedInventory.record" size="medium" />
              <div class="repair-record-info">
                <h4>{{ selectedInventory.record.title }}</h4>
                <p>{{ selectedInventory.record.artist }}</p>
                <div class="current-condition">
                  当前品相: 
                  <span :style="{ color: getConditionColor(selectedInventory.conditionScore) }">
                    {{ getConditionLabel(selectedInventory.conditionScore) }} ({{ selectedInventory.conditionScore }})
                  </span>
                </div>
                <div class="current-price">当前售价: ¥{{ selectedInventory.record.marketPrice }}</div>
              </div>
            </div>

            <div class="config-section">
              <label class="config-label">修复品质</label>
              <div class="quality-options">
                <button 
                  v-for="q in availableQualities" 
                  :key="q.quality"
                  class="quality-btn"
                  :class="{ active: selectedQuality === q.quality }"
                  @click="selectedQuality = q.quality"
                >
                  <span class="quality-icon">{{ q.icon }}</span>
                  <div class="quality-info">
                    <span class="quality-name">{{ q.qualityName }}</span>
                    <span class="quality-desc">{{ q.description }}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="config-section">
              <label class="config-label">目标品相: {{ targetCondition }} ({{ getConditionLabel(targetCondition) }})</label>
              <input 
                type="range" 
                v-model.number="targetCondition" 
                :min="selectedInventory.conditionScore + 5" 
                :max="95"
                class="condition-slider"
              />
            </div>

            <div v-if="selectedEstimate" class="estimate-card">
              <h4 class="estimate-title">📊 预估效果</h4>
              <div class="estimate-grid">
                <div class="estimate-item">
                  <span class="estimate-label">预计品相</span>
                  <span class="estimate-value">{{ getConditionLabel(selectedEstimate.estimatedFinalCondition) }} ({{ selectedEstimate.estimatedFinalCondition }})</span>
                </div>
                <div class="estimate-item">
                  <span class="estimate-label">预计售价</span>
                  <span class="estimate-value success">¥{{ selectedEstimate.estimatedPrice }}</span>
                </div>
                <div class="estimate-item">
                  <span class="estimate-label">预计利润</span>
                  <span class="estimate-value" :class="{ positive: selectedEstimate.estimatedProfit > 0, negative: selectedEstimate.estimatedProfit <= 0 }">
                    {{ selectedEstimate.estimatedProfit > 0 ? '+' : '' }}¥{{ selectedEstimate.estimatedProfit }}
                  </span>
                </div>
                <div class="estimate-item">
                  <span class="estimate-label">成功率</span>
                  <span class="estimate-value">{{ selectedEstimate.successRate }}%</span>
                </div>
                <div class="estimate-item">
                  <span class="estimate-label">稀有度提升概率</span>
                  <span class="estimate-value rarity">{{ selectedEstimate.rarityUpChance }}%</span>
                </div>
                <div class="estimate-item">
                  <span class="estimate-label">投资回报率</span>
                  <span class="estimate-value" :class="{ positive: selectedEstimate.roi > 0 }">
                    {{ selectedEstimate.roi.toFixed(1) }}%
                  </span>
                </div>
              </div>

              <div class="cost-breakdown">
                <h5>耗材清单</h5>
                <div class="materials-list">
                  <div 
                    v-for="matType in selectedEstimate.materials" 
                    :key="matType" 
                    class="material-row"
                  >
                    <span class="mat-icon">{{ getRepairMaterial(matType).icon }}</span>
                    <span class="mat-name">{{ getRepairMaterial(matType).name }}</span>
                    <span class="mat-cost">¥{{ getRepairMaterial(matType).unitCost }}</span>
                    <span 
                      class="mat-status"
                      :class="{ available: getMaterialQuantity(matType) > 0, unavailable: getMaterialQuantity(matType) <= 0 }"
                    >
                      库存: {{ getMaterialQuantity(matType) }}
                    </span>
                  </div>
                </div>
                <div class="cost-summary">
                  <span>耗材费用: ¥{{ selectedEstimate.materialCost }}</span>
                  <span>人工费用: ¥{{ selectedEstimate.laborCost }}</span>
                  <span class="total-cost">总费用: ¥{{ selectedEstimate.totalCost }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="showConfirmModal = false">取消</button>
            <button 
              class="btn-primary"
              :disabled="!gameStore.canStartNewRepair"
              @click="startRepair"
            >
              开始修复
            </button>
          </div>
        </div>
      </div>

    </Teleport>

    <Teleport to="body">
      <div v-if="selectedInventory && !showConfirmModal && activeTab === 'inventory'" class="floating-repair-bar">
        <div class="frb-info">
          <span class="frb-title">已选: {{ selectedInventory.record.title }}</span>
          <span class="frb-condition" :style="{ color: getConditionColor(selectedInventory.conditionScore) }">
            {{ getConditionLabel(selectedInventory.conditionScore) }} → {{ getConditionLabel(targetCondition) }}
          </span>
        </div>
        <button class="btn-primary" @click="showConfirmModal = true">
          配置修复方案 →
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.repair-workshop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.repair-workshop-modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.15) 0%, rgba(243, 156, 18, 0.15) 100%);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 22px;
}

.modal-header h2 {
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

.workshop-stats {
  margin: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.success {
  color: var(--success);
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.message-bar {
  margin: 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.message-bar.success {
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.message-bar.error {
  background: rgba(245, 101, 101, 0.15);
  color: var(--danger);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-gold);
}

.workshop-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.active-tasks-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.active-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.active-task-card {
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--accent-gold);
  border-radius: 10px;
}

.task-record-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.task-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-quality {
  font-size: 11px;
  color: var(--accent-gold);
}

.task-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

@keyframes progressPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.materials-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.materials-label {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.materials-chips {
  flex: 1;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.material-chip {
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-primary);
}

.material-chip.low {
  background: rgba(245, 101, 101, 0.2);
  color: var(--danger);
}

.btn-ghost {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.empty-state {
  padding: 24px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.repairable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.repairable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.repairable-item:hover {
  border-color: var(--accent-gold);
}

.repairable-item.selected {
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
  box-shadow: 0 0 12px rgba(233, 69, 96, 0.2);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.condition-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.price-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-orange);
}

.rarity-stars {
  font-size: 11px;
  color: var(--accent-gold);
}

.item-value-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.collection-value {
  font-size: 10px;
  color: var(--text-muted);
}

.completed-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.completed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.completed-item {
  padding: 10px 12px;
  border-radius: 8px;
}

.completed-item.success {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.completed-item.failed {
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
}

.completed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.completed-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.completed-status {
  font-size: 11px;
  font-weight: 600;
}

.completed-status.completed {
  color: var(--success);
}

.completed-status.failed {
  color: var(--danger);
}

.completed-notes {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 4px 0;
  font-style: italic;
}

.completed-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
}

.completed-meta .positive {
  color: var(--success);
}

.completed-meta .negative {
  color: var(--danger);
}

.rarity-up {
  color: var(--accent-gold);
  font-weight: 600;
}

.collection-change {
  color: var(--text-muted);
}

.workshop-upgrades {
  margin: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.upgrade-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.upgrade-icon {
  font-size: 22px;
}

.upgrade-info > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upgrade-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.upgrade-desc {
  font-size: 10px;
  color: var(--text-muted);
}

.btn-secondary {
  padding: 8px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.repair-config-modal .repair-record-preview {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.repair-record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.repair-record-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.repair-record-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.current-condition, .current-price {
  font-size: 12px;
  color: var(--text-secondary);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.quality-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quality-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quality-btn.active {
  border-color: var(--accent-gold);
  background: rgba(233, 69, 96, 0.1);
}

.quality-icon {
  font-size: 22px;
}

.quality-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quality-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.quality-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.condition-slider {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.condition-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 50%;
  cursor: pointer;
}

.estimate-card {
  padding: 12px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 10px;
}

.estimate-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.estimate-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.estimate-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.estimate-label {
  font-size: 10px;
  color: var(--text-muted);
}

.estimate-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.estimate-value.success,
.estimate-value.positive {
  color: var(--success);
}

.estimate-value.negative {
  color: var(--danger);
}

.estimate-value.rarity {
  color: var(--accent-gold);
}

.cost-breakdown h5 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.material-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.mat-icon {
  font-size: 16px;
}

.mat-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
}

.mat-cost {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-orange);
}

.mat-status {
  font-size: 10px;
}

.mat-status.available {
  color: var(--success);
}

.mat-status.unavailable {
  color: var(--danger);
}

.cost-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px dashed rgba(72, 187, 120, 0.3);
  font-size: 12px;
  color: var(--text-secondary);
}

.total-cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-orange);
}

.material-shop-modal .shop-balance {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.balance-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-orange);
}

.material-shop-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.shop-item-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.shop-item-info {
  flex: 1;
  min-width: 0;
}

.shop-item-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.shop-item-info p {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 6px 0;
}

.shop-item-effects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.shop-item-effects span {
  padding: 2px 6px;
  background: rgba(72, 187, 120, 0.15);
  color: var(--success);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.shop-item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.shop-stock {
  font-size: 11px;
  color: var(--text-muted);
}

.buy-btn {
  white-space: nowrap;
}

.floating-repair-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 448px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--accent-gold);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  z-index: 1500;
  animation: slideUp 0.3s ease-out;
}

.frb-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.frb-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frb-condition {
  font-size: 11px;
  font-weight: 500;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.stat-value.negative {
  color: var(--danger);
}

.task-quality-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.task-cost {
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.2);
  padding: 1px 6px;
  border-radius: 8px;
}

.task-condition-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.mini-condition {
  font-size: 10px;
  font-weight: 600;
}

.mini-condition.target {
  font-weight: 700;
}

.arrow {
  font-size: 10px;
  color: var(--text-muted);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.progress-info .progress-text {
  text-align: left;
  font-size: 10px;
}

.progress-percent {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-gold);
}

.collection-value-label {
  font-size: 9px;
  color: var(--text-muted);
}

.repair-hint {
  font-size: 9px;
  color: var(--accent-gold);
  font-weight: 500;
  margin-top: 2px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-sub {
  font-size: 11px !important;
  color: var(--text-muted) !important;
  opacity: 0.7;
  margin-top: 4px !important;
}

.materials-stats {
  padding: 12px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ms-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.ms-label {
  color: var(--text-secondary);
}

.ms-value {
  font-weight: 600;
  color: var(--text-primary);
}

.ms-row.highlight {
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}

.ms-row.highlight .ms-label {
  color: var(--text-primary);
  font-weight: 600;
}

.ms-row.highlight .ms-value {
  color: var(--accent-orange);
  font-size: 14px;
}

.shop-stock.low {
  color: var(--danger);
  font-weight: 600;
}

.shop-balance {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.history-summary {
  padding: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.hs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.hs-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.hs-label {
  font-size: 10px;
  color: var(--text-muted);
}

.hs-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.hs-value.success {
  color: var(--success);
}

.hs-value.negative {
  color: var(--danger);
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.completed-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.completed-day {
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
}

.history-condition-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
}

.history-materials {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding-top: 4px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.history-mat-chip {
  font-size: 9px;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
}

.item-value-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
</style>
