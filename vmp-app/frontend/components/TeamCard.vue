<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300" v-bind="$attrs">
    <div class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold font-heading mx-auto mb-4" style="background: var(--vmp-gradient)">
      {{ initials }}
    </div>
    <h3 class="font-heading font-bold text-gray-900 text-lg">{{ name }}</h3>
    <p class="text-sm font-medium mb-3" style="color: var(--vmp-red)">{{ role }}</p>
    <p class="text-gray-500 text-sm leading-relaxed">{{ bio }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string; role: string; initials: string; bio: string }>()
</script>
