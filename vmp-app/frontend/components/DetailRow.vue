<template>
  <div class="flex justify-between py-2 border-b border-gray-100">
    <span class="text-gray-500 font-medium">{{ label }}</span>
    <span class="text-gray-900 text-right max-w-[60%]">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
