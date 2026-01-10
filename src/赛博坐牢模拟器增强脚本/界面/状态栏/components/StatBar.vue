<template>
  <div class="stat-bar">
    <div class="stat-label">
      <span>{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
    </div>
    <div class="stat-progress">
      <div
        class="stat-fill"
        :style="{
          width: `${value}%`,
          background: color,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  color: string;
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
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;

  .stat-value {
    color: #667eea;
    font-size: 14px;
  }
}

.stat-progress {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-start, #f093fb) 0%, var(--color-end, #f5576c) 100%);
}
</style>