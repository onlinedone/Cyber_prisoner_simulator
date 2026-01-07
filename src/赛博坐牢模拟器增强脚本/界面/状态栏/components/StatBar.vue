<template>
  <div class="stat-bar">
    <div class="stat-label">
      <span>{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
    </div>
    <div class="stat-track">
      <div class="stat-fill" :style="{ width: `${value}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
}>();
</script>

<style lang="scss" scoped>
.stat-bar {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.stat-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-granite);

  .stat-value {
    color: var(--c-grey-olive);
    font-size: 0.9rem;
  }
}

.stat-track {
  height: 10px;
  border: 1.5px solid var(--c-granite);
  background: var(--c-mint-cream);
  position: relative;
  overflow: hidden;
}

.stat-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--c-celadon);
  border-right: 1.5px solid var(--c-granite);
  transition: width 0.25s ease;
}
</style>
