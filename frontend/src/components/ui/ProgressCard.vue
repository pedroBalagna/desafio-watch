<template>
  <v-card class="progress-card">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-subtitle-2">{{ title }}</span>
        <span class="text-subtitle-2">{{ value }}/{{ total }}</span>
      </div>
      <v-progress-linear
        :model-value="(value / total) * 100"
        :color="color"
        height="8"
        rounded
        class="mb-2"
      ></v-progress-linear>
      <div class="d-flex align-center">
        <v-icon :color="color" size="small" class="me-1">{{ icon }}</v-icon>
        <span class="text-caption">{{ description }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  total: number
  color: string
  icon: string
  description: string
}>()
</script>

<style scoped>
.progress-card {
  height: 100%;
}
</style>
