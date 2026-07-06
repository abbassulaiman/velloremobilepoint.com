<template>
  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium" :class="bgClass">
    <span class="text-gray-500">{{ label }}:</span>
    <span :class="[bold ? 'font-bold text-base' : '', textClass]">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string; value: string; color: string; bold?: boolean }>()

const bgClass = computed(() => {
  const map: Record<string, string> = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  }
  return map[props.color] || 'bg-gray-50'
})

const textClass = computed(() => {
  const map: Record<string, string> = {
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700',
  }
  return map[props.color] || 'text-gray-700'
})
</script>
