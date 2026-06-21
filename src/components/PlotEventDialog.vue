<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePlotEventStore } from '@/stores/plotEvent'
import type { PlotEventChoiceEffect, PlotEndingType } from '@/types'

const emit = defineEmits<{
  close: []
  choiceMade: [choiceId: string, effects: PlotEventChoiceEffect[]]
  eventCompleted: [endingType?: PlotEndingType]
}>()

const plotEventStore = usePlotEventStore()
const showEffects = ref(false)
const lastEffects = ref<PlotEventChoiceEffect[]>([])
const isTransitioning = ref(false)

const activeEvent = computed(() => plotEventStore.state.activeEvent)
const activeProgress = computed(() => plotEventStore.state.activeProgress)
const currentNode = computed(() => plotEventStore.currentNode)
const choices = computed(() => plotEventStore.currentChoices)

const emotionColors: Record<string, string> = {
  happy: 'linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(246, 224, 94, 0.2) 100%)',
  sad: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
  angry: 'linear-gradient(135deg, rgba(245, 101, 101, 0.2) 0%, rgba(237, 137, 54, 0.2) 100%)',
  surprised: 'linear-gradient(135deg, rgba(246, 224, 94, 0.2) 0%, rgba(237, 137, 54, 0.2) 100%)',
  neutral: 'linear-gradient(135deg, rgba(113, 128, 150, 0.15) 0%, rgba(160, 174, 192, 0.15) 100%)',
  mysterious: 'linear-gradient(135deg, rgba(159, 122, 234, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
}

const endingConfig: Record<PlotEndingType, { label: string; icon: string; color: string }> = {
  good: { label: '圆满结局', icon: '🌟', color: '#48bb78' },
  normal: { label: '普通结局', icon: '✨', color: '#4299e1' },
  bad: { label: '遗憾结局', icon: '💔', color: '#f56565' },
  secret: { label: '隐藏结局', icon: '🔮', color: '#9f7aea' },
  perfect: { label: '完美结局', icon: '👑', color: '#ecc94b' }
}

const getEffectLabel = (effect: PlotEventChoiceEffect): string => {
  const labels: Record<string, string> = {
    budget: '💰 资金',
    reputation: '⭐ 声望',
    satisfaction: '😊 满意度',
    customer_count: '👥 客流',
    buy_chance: '🎯 购买率',
    growth_points: '📈 成长值',
    unlock_customer: '🔓 解锁顾客',
    unlock_record: '📀 解锁唱片',
    relationship: '💝 关系',
    special_flag: '🚩 特殊标记'
  }
  return labels[effect.type] || effect.type
}

const getEffectValue = (effect: PlotEventChoiceEffect): string => {
  if (effect.type === 'unlock_customer' || effect.type === 'unlock_record' || effect.type === 'special_flag') {
    return effect.description
  }
  const prefix = effect.value > 0 ? '+' : ''
  if (effect.type === 'relationship') return `${prefix}${effect.value} 信任度`
  return `${prefix}${effect.value}`
}

const getEffectColor = (effect: PlotEventChoiceEffect): string => {
  if (effect.type === 'unlock_customer' || effect.type === 'unlock_record' || effect.type === 'special_flag') {
    return '#9f7aea'
  }
  return effect.value >= 0 ? '#48bb78' : '#f56565'
}

const handleChoice = (choiceId: string) => {
  if (isTransitioning.value) return
  isTransitioning.value = true

  const result = plotEventStore.makeChoice(choiceId)
  if (result.success) {
    lastEffects.value = result.effects || []
    showEffects.value = true

    emit('choiceMade', choiceId, result.effects || [])

    setTimeout(() => {
      showEffects.value = false

      if (result.eventCompleted) {
        emit('eventCompleted', result.endingAchieved)
        setTimeout(() => {
          plotEventStore.closeEvent()
          emit('close')
        }, 1500)
      }
      isTransitioning.value = false
    }, 1200)
  } else {
    isTransitioning.value = false
  }
}

const handleAutoNext = () => {
  if (isTransitioning.value) return
  if (!currentNode.value?.autoNextDelay || !currentNode.value?.nextNodeId) return

  isTransitioning.value = true
  const result = plotEventStore.advanceToNextNode()
  if (result?.eventCompleted) {
    emit('eventCompleted', result.endingAchieved)
    setTimeout(() => {
      plotEventStore.closeEvent()
      emit('close')
    }, 1500)
  }
  isTransitioning.value = false
}

const handleClose = () => {
  plotEventStore.closeEvent()
  emit('close')
}

watch(() => currentNode.value, (node) => {
  if (node?.autoNextDelay && node.nextNodeId && !node.choices) {
    setTimeout(() => {
      handleAutoNext()
    }, node.autoNextDelay)
  }
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <div v-if="activeEvent" class="plot-event-overlay">
      <div class="plot-event-container">
        <div
          class="event-header"
          :style="{ background: emotionColors[currentNode?.backgroundEmotion || 'neutral'] }"
        >
          <div class="event-type-badge" :style="{ background: activeEvent.coverColor + '30', color: activeEvent.coverColor }">
            {{ activeEvent.icon }} {{ activeEvent.type === 'owner_growth' ? '店主成长' : 
                 activeEvent.type === 'customer_relationship' ? '顾客故事' :
                 activeEvent.type === 'special_order' ? '特殊订单' : '命运抉择' }}
          </div>
          <div class="event-title-wrap">
            <h3 class="event-title">{{ activeEvent.title }}</h3>
            <span v-if="activeProgress" class="event-progress">
              {{ activeProgress.visitedNodeIds.length }} 节点
            </span>
          </div>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <div v-if="currentNode" class="event-body">
          <div
            v-if="currentNode.isEnding && currentNode.endingType"
            class="ending-banner"
            :style="{ background: endingConfig[currentNode.endingType].color + '20', borderColor: endingConfig[currentNode.endingType].color }"
          >
            <span class="ending-icon">{{ endingConfig[currentNode.endingType].icon }}</span>
            <span class="ending-label" :style="{ color: endingConfig[currentNode.endingType].color }">
              {{ endingConfig[currentNode.endingType].label }}
            </span>
          </div>

          <div v-if="currentNode.speakerAvatar || currentNode.speakerName" class="speaker-section">
            <div v-if="currentNode.speakerAvatar" class="speaker-avatar">
              {{ currentNode.speakerAvatar }}
            </div>
            <div class="speaker-info">
              <span v-if="currentNode.speakerName" class="speaker-name">{{ currentNode.speakerName }}</span>
            </div>
          </div>

          <div class="node-content-wrap">
            <h4 v-if="currentNode.title !== 'node_start' && currentNode.title" class="node-title">
              {{ currentNode.title }}
            </h4>
            <p class="node-content">{{ currentNode.content }}</p>
          </div>

          <div v-if="showEffects && lastEffects.length > 0" class="effects-popup">
            <div class="effects-header">📊 效果生效</div>
            <div class="effects-list">
              <div
                v-for="(effect, idx) in lastEffects.filter(e => !e.hidden)"
                :key="idx"
                class="effect-item"
              >
                <span class="effect-label">{{ getEffectLabel(effect) }}</span>
                <span class="effect-value" :style="{ color: getEffectColor(effect) }">
                  {{ getEffectValue(effect) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="currentNode.unlockReward" class="reward-section">
            <div class="reward-header">🎁 获得奖励</div>
            <div class="reward-list">
              <span v-if="currentNode.unlockReward.budget" class="reward-badge budget">
                💰 +¥{{ currentNode.unlockReward.budget }}
              </span>
              <span v-if="currentNode.unlockReward.reputation" class="reward-badge reputation">
                ⭐ +{{ currentNode.unlockReward.reputation }}
              </span>
              <span v-if="currentNode.unlockReward.growthPoints" class="reward-badge growth">
                📈 +{{ currentNode.unlockReward.growthPoints }}
              </span>
              <span v-if="currentNode.unlockReward.recordId" class="reward-badge record">
                📀 稀有唱片
              </span>
              <span v-if="currentNode.unlockReward.customerId" class="reward-badge customer">
                👤 新顾客
              </span>
              <span v-if="currentNode.unlockReward.achievementId" class="reward-badge achievement">
                🏅 成就
              </span>
            </div>
          </div>

          <div v-if="choices.length > 0 && !showEffects" class="choices-section">
            <div class="choices-header">🤔 做出选择</div>
            <div class="choices-list">
              <button
                v-for="choice in choices"
                :key="choice.id"
                class="choice-btn"
                :class="{ locked: choice.isLocked }"
                :disabled="choice.isLocked || isTransitioning"
                @click="handleChoice(choice.id)"
              >
                <div class="choice-main">
                  <span class="choice-icon">{{ choice.icon }}</span>
                  <div class="choice-text">
                    <span class="choice-label">{{ choice.label }}</span>
                    <span v-if="choice.description" class="choice-desc">{{ choice.description }}</span>
                  </div>
                </div>
                <div v-if="choice.isLocked && choice.requirementText" class="choice-lock-hint">
                  🔒 {{ choice.requirementText }}
                </div>
                <div v-else-if="choice.effects.filter(e => !e.hidden).length > 0" class="choice-effects-preview">
                  <span
                    v-for="(eff, i) in choice.effects.filter(e => !e.hidden).slice(0, 3)"
                    :key="i"
                    class="effect-preview-tag"
                    :style="{ color: getEffectColor(eff) }"
                  >
                    {{ getEffectLabel(eff).split(' ')[0] }} {{ eff.value > 0 ? '+' : '' }}{{ eff.value }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div
            v-else-if="!currentNode.choices && currentNode.autoNextDelay && !showEffects"
            class="auto-next-hint"
          >
            <span class="typing-dots">
              <span></span><span></span><span></span>
            </span>
            <span>剧情继续中...</span>
          </div>

          <div
            v-else-if="!currentNode.choices && !currentNode.autoNextDelay && !currentNode.isEnding && !showEffects"
            class="continue-section"
          >
            <button class="btn-primary continue-btn" @click="handleAutoNext">
              继续 →
            </button>
          </div>

          <div v-else-if="currentNode.isEnding && !showEffects" class="ending-section">
            <button class="btn-primary ending-btn" @click="handleClose">
              {{ currentNode.endingType === 'perfect' || currentNode.endingType === 'good' ? '✨ 完美收幕' : '📖 故事结束' }}
            </button>
          </div>
        </div>

        <div v-if="activeProgress && activeProgress.visitedNodeIds.length > 1" class="event-footer">
          <div class="progress-dots">
            <span
              v-for="(_, idx) in activeProgress.visitedNodeIds.slice(0, 10)"
              :key="idx"
              class="progress-dot visited"
            ></span>
            <span
              v-if="activeProgress.visitedNodeIds.length === 10"
              class="progress-dot more"
            >...</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.plot-event-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.plot-event-container {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  animation: slideUpFade 0.4s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.event-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.event-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
}

.event-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.event-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.event-progress {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
}

.event-body {
  padding: 20px 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ending-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid;
  animation: endingPulse 2s ease-in-out infinite;
}

@keyframes endingPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 0 20px 5px rgba(255, 255, 255, 0.05); }
}

.ending-icon {
  font-size: 28px;
}

.ending-label {
  font-size: 16px;
  font-weight: 700;
}

.speaker-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.speaker-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.speaker-info {
  flex: 1;
}

.speaker-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-content-wrap {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-gold);
  margin: 0 0 10px 0;
}

.node-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0;
}

.effects-popup {
  background: linear-gradient(135deg, rgba(246, 224, 94, 0.15) 0%, rgba(237, 137, 54, 0.15) 100%);
  border: 1px solid rgba(246, 224, 94, 0.3);
  border-radius: 12px;
  padding: 12px 14px;
  animation: fadeSlideIn 0.3s ease-out;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.effects-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-orange);
  margin-bottom: 8px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.effect-label {
  color: var(--text-secondary);
}

.effect-value {
  font-weight: 600;
}

.reward-section {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.12) 0%, rgba(56, 178, 172, 0.12) 100%);
  border: 1px solid rgba(72, 187, 120, 0.25);
  border-radius: 12px;
  padding: 12px 14px;
}

.reward-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
  margin-bottom: 10px;
}

.reward-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reward-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.reward-badge.budget {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.reward-badge.reputation {
  background: rgba(246, 224, 94, 0.2);
  color: #d69e2e;
}

.reward-badge.growth {
  background: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.reward-badge.record {
  background: rgba(159, 122, 234, 0.2);
  color: #9f7aea;
}

.reward-badge.customer {
  background: rgba(56, 178, 172, 0.2);
  color: #38b2ac;
}

.reward-badge.achievement {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.choices-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choices-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 12px;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
}

.choice-btn:hover:not(:disabled) {
  border-color: var(--accent-gold);
  background: rgba(246, 224, 94, 0.08);
  transform: translateX(4px);
}

.choice-btn.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.choice-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.choice-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--bg-card);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.choice-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.choice-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.choice-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

.choice-lock-hint {
  font-size: 11px;
  color: var(--danger);
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}

.choice-effects-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}

.effect-preview-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  background: var(--bg-card);
  border-radius: 4px;
}

.auto-next-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  color: var(--text-muted);
  font-size: 12px;
}

.typing-dots {
  display: inline-flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.continue-section,
.ending-section {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.continue-btn,
.ending-btn {
  min-width: 160px;
}

.event-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}

.progress-dots {
  display: flex;
  gap: 5px;
  align-items: center;
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bg-secondary);
  transition: all 0.2s;
}

.progress-dot.visited {
  background: var(--accent-gold);
  box-shadow: 0 0 8px rgba(246, 224, 94, 0.4);
}

.progress-dot.more {
  width: auto;
  height: auto;
  background: transparent;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1;
}
</style>
