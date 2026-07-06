<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
      isActive
        ? 'text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    ]"
    :style="isActive ? 'background: var(--vmp-gradient)' : ''"
  >
    <i :class="`fas ${icon} w-4 text-center`"></i>
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ icon: string; label: string; to: string; exact?: boolean }>()
const route = useRoute()
const isActive = computed(() =>
  props.exact ? route.path === props.to : route.path.startsWith(props.to)
)
</script>
