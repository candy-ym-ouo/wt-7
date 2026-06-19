<script setup lang="ts">
import type { Record } from '@/types'

interface Props {
  record: Record
  size?: 'small' | 'medium' | 'large'
  spinning?: boolean
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  spinning: false,
  showLabel: true
})

const sizeMap = {
  small: '60px',
  medium: '100px',
  large: '140px'
}

const labelSizeMap = {
  small: '20px',
  medium: '35px',
  large: '50px'
}
</script>

<template>
  <div 
    class="vinyl-container"
    :style="{ 
      width: sizeMap[size], 
      height: sizeMap[size] 
    }"
  >
    <div 
      class="vinyl-disc"
      :class="{ spinning: spinning }"
      :style="{ 
        background: `linear-gradient(135deg, var(--vinyl-black) 0%, var(--vinyl-groove) 50%, var(--vinyl-black) 100%)`
      }"
    >
      <div class="vinyl-grooves">
        <div v-for="i in 5" :key="i" class="groove" :style="{ 
          width: `${100 - i * 15}%`,
          height: `${100 - i * 15}%`,
        }"></div>
      </div>
      
      <div 
        v-if="showLabel"
        class="vinyl-label"
        :style="{ 
          width: labelSizeMap[size], 
          height: labelSizeMap[size],
          background: record.coverColor
        }"
      >
        <div class="label-center"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vinyl-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(0, 0, 0, 0.8);
}

.vinyl-disc.spinning {
  animation: spin 3s linear infinite;
}

.vinyl-grooves {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.vinyl-label {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 
    inset 0 0 10px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.1);
}

.label-center {
  width: 8px;
  height: 8px;
  background: var(--vinyl-black);
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
}
</style>
