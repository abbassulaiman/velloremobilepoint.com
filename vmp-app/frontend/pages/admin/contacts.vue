<template>
  <div class="space-y-5">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <div class="flex gap-2">
        <button v-for="s in statusFilters" :key="s.value" @click="filterStatus = s.value; load()"
          :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', filterStatus === s.value ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600']"
          :style="filterStatus === s.value ? 'background: var(--vmp-gradient)' : ''">
          {{ s.label }}
        </button>
      </div>
      <div class="ml-auto text-sm text-gray-400">{{ total }} message{{ total !== 1 ? 's' : '' }}</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="c in contacts"
        :key="c.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        :class="c.status === 'new' ? 'border-l-4 border-l-blue-500' : ''"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-semibold text-gray-900">{{ c.name }}</p>
            <a :href="`tel:${c.mobile}`" class="text-sm text-gray-400 hover:text-red-500">{{ c.mobile }}</a>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="c.status === 'new' ? 'bg-blue-100 text-blue-700' : c.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            {{ c.status }}
          </span>
        </div>
        <p class="text-gray-600 text-sm leading-relaxed mb-4">{{ c.message }}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ formatDate(c.created_at) }}</span>
          <div class="flex gap-2">
            <a :href="`https://wa.me/91${c.mobile}?text=${encodeURIComponent('Hi ' + c.name + ', regarding your message...')}`" target="_blank"
              class="text-sm px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors font-medium">
              <i class="fab fa-whatsapp"></i> Reply
            </a>
            <button v-if="c.status !== 'replied'" @click="markStatus(c, 'replied')"
              class="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium">
              Mark Replied
            </button>
          </div>
        </div>
      </div>
      <div v-if="contacts.length === 0" class="col-span-full text-center py-16 text-gray-400">
        No messages found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const { get, patch } = useApi()
const contacts = ref<any[]>([])
const total = ref(0)
const filterStatus = ref('')

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
]

async function load() {
  const params: any = { limit: 50 }
  if (filterStatus.value) params.status = filterStatus.value
  const res = await get<any>('/contacts', params)
  contacts.value = res.contacts
  total.value = res.total
}

async function markStatus(c: any, status: string) {
  await patch(`/contacts/${c.id}/status`, { status })
  c.status = status
}

function formatDate(d: string) {
  return dayjs(d).format('DD MMM YYYY, hh:mm A')
}

onMounted(load)
</script>
