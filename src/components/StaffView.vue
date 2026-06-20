<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import { getSkillDescriptionWithEffect } from '@/data/staff'
import type { StaffSkillType } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const skills = computed(() => gameStore.staff.skills)
const availablePoints = computed(() => gameStore.staff.availablePoints)
const totalPoints = computed(() => gameStore.staff.totalStaffPoints)

const handleUpgrade = (skillType: StaffSkillType) => {
  const result = gameStore.upgradeStaffSkill(skillType)
  if (!result.success) {
    console.log(result.message)
  }
}

const getSkillEffectText = (skill: any): string => {
  return getSkillDescriptionWithEffect(skill)
}

const getProgressPercent = (skill: any): number => {
  return (skill.level / skill.maxLevel) * 100
}
</script>

<template>
  <div class="staff-view-overlay" @click.self="emit('close')">
    <div class="staff-view">
      <div class="staff-header">
        <h2>👥 店员协助</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="points-info">
        <div class="points-display">
          <span class="points-icon">⭐</span>
          <span class="points-value">可用技能点: {{ availablePoints }}</span>
        </div>
        <div class="points-total">总计获得: {{ totalPoints }}</div>
      </div>

      <div class="skills-list">
        <div 
          v-for="skill in skills" 
          :key="skill.type" 
          class="skill-card"
          :class="{ 'can-upgrade': availablePoints > 0 && skill.level < skill.maxLevel }"
        >
          <div class="skill-icon">{{ skill.icon }}</div>
          
          <div class="skill-info">
            <div class="skill-name">
              {{ skill.name }}
              <span class="skill-level">Lv.{{ skill.level }} / {{ skill.maxLevel }}</span>
            </div>
            <div class="skill-desc">{{ getSkillEffectText(skill) }}</div>
            
            <div class="skill-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercent(skill) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <button 
            class="upgrade-btn"
            :disabled="availablePoints <= 0 || skill.level >= skill.maxLevel"
            @click="handleUpgrade(skill.type)"
          >
            {{ skill.level >= skill.maxLevel ? '已满级' : '升级' }}
          </button>
        </div>
      </div>

      <div class="staff-tips">
        <p>💡 提示：完成关卡挑战可获得技能点，升级店员能力提升经营效率！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.staff-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.staff-view {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid #8b6914;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.staff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.staff-header h2 {
  margin: 0;
  color: #f0d9b5;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #f0d9b5;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.points-info {
  background: rgba(139, 105, 20, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.points-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 4px;
}

.points-icon {
  font-size: 1.5rem;
}

.points-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffd700;
}

.points-total {
  font-size: 0.85rem;
  color: #a08060;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(139, 105, 20, 0.3);
  transition: all 0.3s;
}

.skill-card.can-upgrade {
  border-color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
}

.skill-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 105, 20, 0.2);
  border-radius: 10px;
  flex-shrink: 0;
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-weight: bold;
  color: #f0d9b5;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-level {
  font-size: 0.85rem;
  color: #a08060;
  font-weight: normal;
}

.skill-desc {
  font-size: 0.85rem;
  color: #c0a080;
  margin-bottom: 8px;
  line-height: 1.4;
}

.skill-progress {
  margin-top: 6px;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffaa00);
  border-radius: 3px;
  transition: width 0.3s;
}

.upgrade-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #8b6914 0%, #6b4f0f 100%);
  color: #f0d9b5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.upgrade-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a67c1a 0%, #8b6914 100%);
  transform: translateY(-1px);
}

.upgrade-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.staff-tips {
  margin-top: 20px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.staff-tips p {
  margin: 0;
  font-size: 0.85rem;
  color: #a08060;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .staff-view {
    padding: 16px;
  }
  
  .skill-card {
    flex-wrap: wrap;
  }
  
  .upgrade-btn {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
