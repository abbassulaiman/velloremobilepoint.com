<template>
  <div class="flex items-center gap-2">
    <select :value="month" @change="onMonth" class="vmp-input text-sm py-2 max-w-[130px]">
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select :value="year" @change="onYear" class="vmp-input text-sm py-2 max-w-[90px]">
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const month = computed(() => props.modelValue.split('-')[1])
const year  = computed(() => props.modelValue.split('-')[0])

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const currentYear = dayjs().year()
const years = Array.from({ length: currentYear - 2011 }, (_, i) => String(currentYear - i))

function onMonth(e: Event) {
  emit('update:modelValue', `${year.value}-${(e.target as HTMLSelectElement).value}`)
}
function onYear(e: Event) {
  emit('update:modelValue', `${(e.target as HTMLSelectElement).value}-${month.value}`)
}
</script>
