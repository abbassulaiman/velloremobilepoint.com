<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group" v-bind="$attrs">
    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white mb-5 group-hover:scale-110 transition-transform duration-300" style="background: var(--vmp-gradient)">
      <i :class="`fas ${icon}`"></i>
    </div>
    <h3 class="font-heading font-bold text-gray-900 text-lg mb-2">{{ name }}</h3>
    <p class="text-gray-500 text-sm leading-relaxed mb-3">{{ description }}</p>
    <p class="text-sm font-semibold" style="color: var(--vmp-red)">{{ price }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string; icon: string; description: string; price: string }>()
</script>
