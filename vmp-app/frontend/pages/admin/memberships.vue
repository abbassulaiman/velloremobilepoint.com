<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 class="font-heading font-bold text-2xl text-gray-900">Memberships</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage VMP membership cards</p>
      </div>
      <button @click="openAdd" class="btn-vmp"><i class="fas fa-plus mr-2"></i>New Member</button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" type="text" placeholder="Search name, mobile, member ID..." class="vmp-input text-sm max-w-xs" @input="debounceLoad" />
      <select v-model="filterStatus" class="vmp-input text-sm max-w-[150px]" @change="load">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <span class="ml-auto text-sm text-gray-400">{{ total }} members</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Member ID</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Full Name</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Mobile</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">DOB</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Start</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Expiry</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Phone</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">IMEI</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amt</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="m in members" :key="m.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 font-mono text-xs font-semibold text-red-600">{{ m.membership_id }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ m.full_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ m.mobile }}</td>
              <td class="px-4 py-3 text-gray-500">{{ fmtDate(m.dob) }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmtDate(m.start_date) }}</td>
              <td class="px-4 py-3 whitespace-nowrap" :class="isExpiring(m.expiry_date) ? 'text-orange-600 font-semibold' : 'text-gray-600'">{{ fmtDate(m.expiry_date) }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ [m.phone_brand, m.phone_model].filter(Boolean).join(' ') || '—' }}</td>
              <td class="px-4 py-3 text-gray-400 text-xs font-mono">{{ m.imei || '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ m.amount > 0 ? `₹${fmt(m.amount)}` : '—' }}</td>
              <td class="px-4 py-3">
                <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusColor(m.status)">{{ m.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="openEdit(m)" class="text-gray-300 hover:text-blue-500 text-xs"><i class="fas fa-pen"></i></button>
                  <button @click="remove(m)" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="members.length === 0">
              <td colspan="11" class="px-4 py-12 text-center text-gray-400">No members found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-gray-900 text-lg">{{ modal.id ? 'Edit Member' : 'New Member' }}</h3>
            <button @click="modal = null" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Full Name *</label>
              <input v-model="modal.full_name" type="text" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Mobile *</label>
              <input v-model="modal.mobile" type="tel" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Date of Birth</label>
              <input v-model="modal.dob" type="date" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Member ID <span class="text-gray-400 font-normal">(auto if blank)</span></label>
              <input v-model="modal.membership_id" type="text" class="vmp-input text-sm" placeholder="e.g. VMP0001" />
            </div>
            <div>
              <label class="vmp-label">Start Date</label>
              <input v-model="modal.start_date" type="date" class="vmp-input text-sm" @change="onStartDateChange" />
            </div>
            <div>
              <label class="vmp-label">Expiry Date</label>
              <input v-model="modal.expiry_date" type="date" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Payment Mode</label>
              <select v-model="modal.payment_mode" class="vmp-input text-sm">
                <option value="cash">Cash</option>
                <option value="gpay">GPay</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label class="vmp-label">Amount (₹)</label>
              <input v-model.number="modal.amount" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Phone Brand</label>
              <input v-model="modal.phone_brand" type="text" class="vmp-input text-sm" placeholder="e.g. Samsung" />
            </div>
            <div>
              <label class="vmp-label">Phone Model</label>
              <input v-model="modal.phone_model" type="text" class="vmp-input text-sm" placeholder="e.g. Galaxy A54" />
            </div>
            <div>
              <label class="vmp-label">IMEI Number</label>
              <input v-model="modal.imei" type="text" maxlength="20" class="vmp-input text-sm font-mono" />
            </div>
            <div>
              <label class="vmp-label">Status</label>
              <select v-model="modal.status" class="vmp-input text-sm">
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="vmp-label">Notes</label>
              <textarea v-model="modal.notes" class="vmp-input text-sm h-20 resize-none"></textarea>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 justify-end pt-2">
            <button @click="modal = null" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button @click="save" :disabled="saving" class="btn-vmp disabled:opacity-50">
              <i class="fas fa-check"></i> <span v-if="saving">Saving...</span><span v-else>Save</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })
const { get, post, put, del } = useApi()

const members = ref<any[]>([])
const total = ref(0)
const search = ref('')
const filterStatus = ref('')
const modal = ref<any>(null)
const saving = ref(false)
let debounceTimer: any = null

async function load() {
  const params: any = { limit: 200 }
  if (search.value) params.search = search.value
  if (filterStatus.value) params.status = filterStatus.value
  const res = await get<any>('/memberships', params)
  members.value = res.rows
  total.value = res.total
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 350)
}

function openAdd() {
  const start = dayjs().format('YYYY-MM-DD')
  const expiry = dayjs().add(1, 'year').format('YYYY-MM-DD')
  modal.value = { full_name: '', mobile: '', dob: '', membership_id: '', start_date: start, expiry_date: expiry, payment_mode: 'cash', amount: 0, phone_brand: '', phone_model: '', imei: '', status: 'active', notes: '' }
}

function onStartDateChange() {
  if (modal.value?.start_date) {
    modal.value.expiry_date = dayjs(modal.value.start_date).add(1, 'year').format('YYYY-MM-DD')
  }
}

function openEdit(m: any) { modal.value = { ...m } }

async function save() {
  saving.value = true
  try {
    if (modal.value.id) await put(`/memberships/${modal.value.id}`, modal.value)
    else await post('/memberships', modal.value)
    modal.value = null
    await load()
  } finally { saving.value = false }
}

async function remove(m: any) {
  if (!confirm(`Delete membership for ${m.full_name}?`)) return
  await del(`/memberships/${m.id}`)
  await load()
}

function fmtDate(d: string) { return d ? dayjs(d).format('DD-MM-YYYY') : '—' }
function fmt(n: any) { return Number(n || 0).toLocaleString('en-IN') }
function isExpiring(d: string) { return d && dayjs(d).diff(dayjs(), 'day') <= 30 }
function statusColor(s: string) {
  return { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600'
}

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-xs font-semibold text-gray-600 mb-1; }
</style>
