<template>
  <div class="text-center p-6" v-bind="$attrs">
    <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-5" style="background: var(--vmp-gradient)">
      <i :class="`fas ${icon}`"></i>
    </div>
    <h3 class="font-heading font-bold text-gray-900 text-lg mb-2">{{ title }}</h3>
    <p class="text-gray-500 text-sm leading-relaxed">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; title: string; desc: string }>()
</script>
