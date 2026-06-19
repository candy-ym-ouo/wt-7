<script setup lang="ts">
import { levels } from '@/data/levels'
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'

const emit = defineEmits<{
  start: [levelId: number]
}>()

const gameStore = useGameStore()

const levelList = computed(() => {
  return levels.map(level => ({
    ...level,
    unlocked: level.id === 1 || gameStore.completedLevels.includes(level.id - 1),
    completed: gameStore.completedLevels.includes(level.id)
  }))
})
</script>

<template>
  <div class="level-select">
    <div class="hero-section">
      <div class="logo">
        <div class="vinyl-spin">
          <div class="vinyl-logo"></div>
        </div>
      </div>
      <h1 class="title">黑胶唱片店</h1>
      <p class="subtitle">Vinyl Record Shop</p>
      <p class="tagline">经营你的专属唱片店，收集每一张珍贵的黑胶</p>
    </div>

    <div class="levels-container">
      <h2 class="section-title">选择关卡</h2>
      
      <div class="levels-grid">
        <div 
          v-for="level in levelList" 
          :key="level.id"
          class="level-card"
          :class="{ unlocked: level.unlocked, completed: level.completed }"
          @click="level.unlocked && emit('start', level.id)"
        >
          <div class="level-header">
            <span class="level-number">{{ level.id }}</span>
            <span v-if="level.completed" class="completed-badge">✓</span>
            <span v-else-if="!level.unlocked" class="locked-badge">🔒</span>
          </div>
          
          <h3 class="level-name">{{ level.name }}</h3>
          <p class="level-desc">{{ level.description }}</p>
          
          <div class="level-stats">
            <div class="stat">
              <span class="stat-label">目标利润</span>
              <span class="stat-value">¥{{ level.targetProfit }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">天数</span>
              <span class="stat-value">{{ level.days }}天</span>
            </div>
            <div class="stat">
              <span class="stat-label">唱片架</span>
              <span class="stat-value">{{ level.displaySlots }}格</span>
            </div>
          </div>

          <div class="genres">
            <span v-for="genre in level.unlockGenres.slice(0, 5)" :key="genre" class="genre-chip">
              {{ genre }}
            </span>
            <span v-if="level.unlockGenres.length > 5" class="genre-chip more">
              +{{ level.unlockGenres.length - 5 }}
            </span>
          </div>

          <button 
            v-if="level.unlocked" 
            class="start-btn"
            :disabled="!level.unlocked"
          >
            {{ level.completed ? '再玩一次' : '开始游戏' }}
          </button>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="feature-item">
        <span class="feature-icon">🎵</span>
        <span class="feature-text">24张经典黑胶唱片</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🎯</span>
        <span class="feature-text">5个精心设计的关卡</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">📚</span>
        <span class="feature-text">收藏珍贵唱片</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-select {
  min-height: 100vh;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.hero-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.vinyl-spin {
  width: 100px;
  height: 100px;
  animation: spin 8s linear infinite;
}

.vinyl-logo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: 
    radial-gradient(circle, var(--accent-gold) 0%, var(--accent-gold) 20%, 
    var(--vinyl-black) 21%, var(--vinyl-groove) 50%, var(--vinyl-black) 100%);
  box-shadow: 
    0 8px 32px rgba(233, 69, 96, 0.3),
    inset 0 0 30px rgba(0, 0, 0, 0.8);
  position: relative;
}

.vinyl-logo::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--vinyl-black);
  border-radius: 50%;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.tagline {
  font-size: 12px;
  color: var(--text-secondary);
}

.levels-container {
  flex: 1;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.levels-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.level-card.unlocked {
  opacity: 1;
  cursor: pointer;
}

.level-card.unlocked:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(233, 69, 96, 0.2);
}

.level-card.completed {
  border-color: var(--success);
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.level-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.completed-badge {
  width: 24px;
  height: 24px;
  background: var(--success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.locked-badge {
  font-size: 18px;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.level-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.level-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.stat {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 9px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.genre-chip {
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-gold);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.genre-chip.more {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.start-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.start-btn:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.features {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-top: 24px;
  border-top: 1px solid var(--border);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.feature-icon {
  font-size: 20px;
}

.feature-text {
  font-size: 10px;
  color: var(--text-muted);
}
</style>
