<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 class="font-heading font-bold text-2xl text-gray-900">Product Enquiries</h1>
        <p class="text-sm text-gray-500 mt-0.5">Pouch list & product sourcing tracker</p>
      </div>
      <button @click="openAdd" class="btn-vmp"><i class="fas fa-plus mr-2"></i>New Enquiry</button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" type="text" placeholder="Search name, mobile, product..." class="vmp-input text-sm max-w-xs" @input="debounceLoad" />
      <select v-model="filterStatus" class="vmp-input text-sm max-w-[160px]" @change="load">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="ordered">Ordered</option>
        <option value="available">Available</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <span class="ml-auto text-sm text-gray-400">{{ total }} enquiries</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Customer</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Brand</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Model</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Product</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Shop Need</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="enq in enquiries" :key="enq.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ fmtDate(enq.enquiry_date) }}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ enq.customer_name || '—' }}</p>
                <p class="text-xs text-gray-400">{{ enq.mobile || '' }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ enq.brand_name || '—' }}</td>
              <td class="px-4 py-3 text-gray-700">{{ enq.model_number || '—' }}</td>
              <td class="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate" :title="enq.product">{{ enq.product }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate" :title="enq.shop_need">{{ enq.shop_need || '—' }}</td>
              <td class="px-4 py-3">
                <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusColor(enq.status)">{{ enq.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="openEdit(enq)" class="text-gray-300 hover:text-blue-500 text-xs"><i class="fas fa-pen"></i></button>
                  <button @click="remove(enq)" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="enquiries.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">No enquiries found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-gray-900 text-lg">{{ modal.id ? 'Edit Enquiry' : 'New Enquiry' }}</h3>
            <button @click="modal = null" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Date *</label>
              <input v-model="modal.enquiry_date" type="date" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Customer Name</label>
              <input v-model="modal.customer_name" type="text" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Mobile</label>
              <input v-model="modal.mobile" type="tel" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Product *</label>
              <input v-model="modal.product" type="text" class="vmp-input text-sm" placeholder="e.g. BACK POUCH" required />
            </div>
            <div>
              <label class="vmp-label">Brand Name</label>
              <input v-model="modal.brand_name" type="text" class="vmp-input text-sm" placeholder="e.g. VIVO" />
            </div>
            <div>
              <label class="vmp-label">Model Number</label>
              <input v-model="modal.model_number" type="text" class="vmp-input text-sm" placeholder="e.g. Y17S" />
            </div>
            <div>
              <label class="vmp-label">Status</label>
              <select v-model="modal.status" class="vmp-input text-sm">
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="available">Available</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="vmp-label">Notes</label>
              <input v-model="modal.notes" type="text" class="vmp-input text-sm" />
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

const enquiries = ref<any[]>([])
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
  const res = await get<any>('/product-enquiries', params)
  enquiries.value = res.rows
  total.value = res.total
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 350)
}

function openAdd() {
  modal.value = { enquiry_date: dayjs().format('YYYY-MM-DD'), customer_name: '', mobile: '', product: '', brand_name: '', model_number: '', shop_need: '', status: 'pending', notes: '' }
}

function openEdit(e: any) { modal.value = { ...e } }

async function save() {
  saving.value = true
  try {
    if (modal.value.id) await put(`/product-enquiries/${modal.value.id}`, modal.value)
    else await post('/product-enquiries', modal.value)
    modal.value = null
    await load()
  } finally { saving.value = false }
}

async function remove(e: any) {
  if (!confirm('Delete this enquiry?')) return
  await del(`/product-enquiries/${e.id}`)
  await load()
}

function fmtDate(d: string) { return d ? dayjs(d).format('DD-MM-YY') : '—' }
function statusColor(s: string) {
  return { pending: 'bg-yellow-100 text-yellow-700', ordered: 'bg-blue-100 text-blue-700', available: 'bg-green-100 text-green-700', delivered: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600'
}

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-xs font-semibold text-gray-600 mb-1; }
</style>
