<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 class="font-heading font-bold text-2xl text-gray-900">3D Orders</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track 3D product orders</p>
      </div>
      <button @click="openAdd" class="btn-vmp"><i class="fas fa-plus mr-2"></i>New Order</button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" type="text" placeholder="Search name, mobile, product..." class="vmp-input text-sm max-w-xs" @input="debounceLoad" />
      <select v-model="filterStatus" class="vmp-input text-sm max-w-[160px]" @change="load">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="ready">Ready</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <span class="ml-auto text-sm text-gray-400">{{ total }} orders</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Customer</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Product</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Advance</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Total</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Margin</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ fmtDate(order.order_date) }}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ order.customer_name || '—' }}</p>
                <p class="text-xs text-gray-400">{{ order.mobile || '' }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-[200px] truncate" :title="order.product_name">{{ order.product_name }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ order.advance > 0 ? `₹${fmt(order.advance)}` : '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ order.total > 0 ? `₹${fmt(order.total)}` : '—' }}</td>
              <td class="px-4 py-3 text-right text-green-600 font-medium">{{ order.margin > 0 ? `₹${fmt(order.margin)}` : '—' }}</td>
              <td class="px-4 py-3">
                <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusColor(order.status)">{{ order.status?.replace('_', ' ') }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="openEdit(order)" class="text-gray-300 hover:text-blue-500 text-xs"><i class="fas fa-pen"></i></button>
                  <button @click="remove(order)" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">No 3D orders found.</td>
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
            <h3 class="font-heading font-bold text-gray-900 text-lg">{{ modal.id ? 'Edit Order' : 'New 3D Order' }}</h3>
            <button @click="modal = null" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Date *</label>
              <input v-model="modal.order_date" type="date" class="vmp-input text-sm" required />
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
              <label class="vmp-label">Product Name *</label>
              <input v-model="modal.product_name" type="text" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Advance (₹)</label>
              <input v-model.number="modal.advance" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Total (₹)</label>
              <input v-model.number="modal.total" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Margin (₹)</label>
              <input v-model.number="modal.margin" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Status</label>
              <select v-model="modal.status" class="vmp-input text-sm">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="vmp-label">Notes</label>
              <textarea v-model="modal.notes" class="vmp-input text-sm h-16 resize-none"></textarea>
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

const orders = ref<any[]>([])
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
  const res = await get<any>('/3d-orders', params)
  orders.value = res.rows
  total.value = res.total
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 350)
}

function openAdd() {
  modal.value = { order_date: dayjs().format('YYYY-MM-DD'), customer_name: '', mobile: '', product_name: '', advance: 0, total: 0, margin: 0, status: 'pending', notes: '' }
}

function openEdit(o: any) { modal.value = { ...o } }

async function save() {
  saving.value = true
  try {
    if (modal.value.id) await put(`/3d-orders/${modal.value.id}`, modal.value)
    else await post('/3d-orders', modal.value)
    modal.value = null
    await load()
  } finally { saving.value = false }
}

async function remove(o: any) {
  if (!confirm('Delete this order?')) return
  await del(`/3d-orders/${o.id}`)
  await load()
}

function fmtDate(d: string) { return d ? dayjs(d).format('DD-MM-YY') : '—' }
function fmt(n: any) { return Number(n || 0).toLocaleString('en-IN') }
function statusColor(s: string) {
  return { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', ready: 'bg-green-100 text-green-700', delivered: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600'
}

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-xs font-semibold text-gray-600 mb-1; }
</style>
