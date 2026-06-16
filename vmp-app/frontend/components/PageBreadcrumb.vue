<template>
  <section class="py-16 relative overflow-hidden" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)">
    <div class="absolute inset-0 opacity-10" style="background: var(--vmp-gradient)"></div>
    <div class="container mx-auto px-4 relative text-center" data-aos="fade-up">
      <h1 class="text-3xl md:text-4xl font-heading font-bold text-white mb-3">{{ title }}</h1>
      <nav class="flex items-center justify-center gap-2 text-sm text-gray-300">
        <NuxtLink to="/" class="hover:text-red-400 transition-colors">Home</NuxtLink>
        <i class="fas fa-minus text-xs text-gray-500"></i>
        <span class="text-gray-400">{{ title }}</span>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
