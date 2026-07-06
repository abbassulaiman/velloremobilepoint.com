<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
      :class="`bg-${color}-500`"
      :style="color === 'red' ? 'background: var(--vmp-gradient)' : ''"
    >
      <i :class="`fas ${icon} text-lg`"></i>
    </div>
    <div class="min-w-0">
      <p class="text-2xl font-bold font-heading text-gray-900 truncate">{{ value }}</p>
      <p class="text-gray-400 text-xs">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string; icon: string; color: string }>()
</script>
