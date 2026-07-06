<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="styles[status] || styles.pending">
    {{ labels[status] || status }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ status: string }>()

const styles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
const labels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
}
</script>
