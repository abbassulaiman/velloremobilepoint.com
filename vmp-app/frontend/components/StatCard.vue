<template>
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg shrink-0">
      <i :class="`fas ${icon}`"></i>
    </div>
    <div>
      <p class="text-white font-bold text-xl font-heading">{{ value }}</p>
      <p class="text-white/60 text-sm">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; value: string; label: string }>()
</script>
