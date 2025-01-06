<template>
  <div class="status-indicator" :class="{'safe': isSafe, 'unsafe': !isSafe}">
    <span class="status-icon">●</span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { apiStore } from '@/store/store';

const store = apiStore();
const isSafe = computed(() => store.safetyInfo.IsSafe);
const statusText = computed(() => isSafe.value ? 'Safe' : 'Unsafe');
</script>

<style scoped>
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.status-icon {
  font-size: 1.2rem;
}

.safe {
  background-color: #dcfce7;
  color: #16a34a;
}

.unsafe {
  background-color: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .status-text {
    display: none;
  }
  
  .status-indicator {
    padding: 0.5rem;
  }
}
</style>
