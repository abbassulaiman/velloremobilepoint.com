<template>
  <div class="flex items-start gap-4">
    <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style="background: var(--vmp-gradient)">
      <i :class="`${brand ? 'fab' : 'fas'} ${icon}`"></i>
    </div>
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{{ label }}</p>
      <a v-if="href" :href="href" target="_blank" rel="noopener" class="text-gray-800 font-medium hover:text-red-500 transition-colors">{{ value }}</a>
      <p v-else class="text-gray-800 font-medium">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; label: string; value: string; href?: string; brand?: boolean }>()
</script>
