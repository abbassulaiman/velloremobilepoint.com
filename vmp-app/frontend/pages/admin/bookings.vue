<template>
  <div class="space-y-5">
    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="s in statusFilters"
          :key="s.value"
          @click="filterStatus = s.value; loadBookings()"
          :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', filterStatus === s.value ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          :style="filterStatus === s.value ? 'background: var(--vmp-gradient)' : ''"
        >
          {{ s.label }}
        </button>
      </div>
      <div class="ml-auto text-sm text-gray-400">{{ total }} booking{{ total !== 1 ? 's' : '' }}</div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Customer</th>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Device</th>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Service</th>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Status</th>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Date</th>
              <th class="text-left px-5 py-3 text-gray-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="b in bookings" :key="b.id" class="hover:bg-gray-50/50">
              <td class="px-5 py-4">
                <p class="font-semibold text-gray-900">{{ b.customer_name }}</p>
                <p class="text-gray-400 text-xs">{{ b.mobile }}</p>
              </td>
              <td class="px-5 py-4 text-gray-700">{{ b.device_brand }} {{ b.device_model }}</td>
              <td class="px-5 py-4 text-gray-700 max-w-[200px] truncate">{{ b.service_type }}</td>
              <td class="px-5 py-4"><BookingStatusBadge :status="b.status" /></td>
              <td class="px-5 py-4 text-gray-500 text-xs">{{ formatDate(b.created_at) }}</td>
              <td class="px-5 py-4">
                <button @click="openDetail(b)" class="text-sm font-medium hover:underline" style="color: var(--vmp-red)">
                  View
                </button>
              </td>
            </tr>
            <tr v-if="bookings.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-gray-400">No bookings found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="selected = null">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h2 class="font-heading font-bold text-xl text-gray-900">{{ selected.customer_name }}</h2>
                <p class="text-gray-400 text-sm">{{ selected.mobile }}</p>
              </div>
              <button @click="selected = null" class="text-gray-400 hover:text-gray-700 text-xl"><i class="fas fa-times"></i></button>
            </div>
            <div class="space-y-3 text-sm mb-6">
              <DetailRow label="Device" :value="`${selected.device_brand} ${selected.device_model || ''}`" />
              <DetailRow label="Service" :value="selected.service_type" />
              <DetailRow v-if="selected.service_other" label="Other Service" :value="selected.service_other" />
              <DetailRow v-if="selected.issue_description" label="Issue" :value="selected.issue_description" />
              <DetailRow label="OTP Verified" :value="selected.otp_verified ? '✅ Yes' : '❌ No'" />
              <DetailRow label="Booked On" :value="formatDate(selected.created_at)" />
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-gray-500 font-medium">Status</span>
                <select v-model="newStatus" class="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-red-400">
                  <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div>
                <label class="text-gray-500 font-medium block mb-1">Notes</label>
                <textarea v-model="notes" rows="2" class="vmp-input text-sm" placeholder="Internal notes..."></textarea>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="updateStatus" :disabled="updating" class="btn-vmp flex-1 justify-center disabled:opacity-50">
                <span v-if="updating"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>Save Changes</span>
              </button>
              <button @click="selected = null" class="btn-vmp-outline flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const { get, patch } = useApi()

const bookings = ref<any[]>([])
const total = ref(0)
const filterStatus = ref('')
const selected = ref<any>(null)
const newStatus = ref('')
const notes = ref('')
const updating = ref(false)

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

async function loadBookings() {
  const params: any = { limit: 50 }
  if (filterStatus.value) params.status = filterStatus.value
  const res = await get<any>('/bookings', params)
  bookings.value = res.bookings
  total.value = res.total
}

function openDetail(b: any) {
  selected.value = b
  newStatus.value = b.status
  notes.value = b.notes || ''
}

async function updateStatus() {
  if (!selected.value) return
  updating.value = true
  try {
    await patch(`/bookings/${selected.value.id}/status`, { status: newStatus.value, notes: notes.value })
    selected.value.status = newStatus.value
    selected.value.notes = notes.value
    await loadBookings()
    selected.value = null
  } finally {
    updating.value = false
  }
}

function formatDate(d: string) {
  return dayjs(d).format('DD MMM YYYY, hh:mm A')
}

onMounted(loadBookings)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
