<template>
  <div class="space-y-6">
    <!-- Header + Add button -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 class="font-heading font-bold text-2xl text-gray-900">Service Jobs</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track all repair & service work</p>
      </div>
      <button @click="openAdd" class="btn-vmp"><i class="fas fa-plus mr-2"></i>New Job</button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" type="text" placeholder="Search name, mobile, model..." class="vmp-input text-sm max-w-xs" @input="debounceLoad" />
      <select v-model="filterStatus" class="vmp-input text-sm max-w-[160px]" @change="load">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="ready">Ready</option>
        <option value="delivered">Delivered</option>
        <option value="returned">Returned</option>
      </select>
      <input type="date" v-model="filterFrom" class="vmp-input text-sm max-w-[155px]" @change="load" />
      <span class="text-gray-400 text-sm">to</span>
      <input type="date" v-model="filterTo" class="vmp-input text-sm max-w-[155px]" @change="load" />
      <span class="ml-auto text-sm text-gray-400">{{ total }} jobs</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Customer</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Model</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Problem</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">In Date</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Out Date</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Ready Date</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ job.customer_name }}</p>
                <p class="text-xs text-gray-400">{{ job.mobile || '—' }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ job.mobile_model || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate" :title="job.problem">{{ job.problem || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmtDate(job.in_date) }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmtDate(job.out_date) }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmtDate(job.ready_date) }}</td>
              <td class="px-4 py-3"><StatusBadge :status="job.status" /></td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ job.amount > 0 ? `₹${fmt(job.amount)}` : '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="openEdit(job)" class="text-gray-300 hover:text-blue-500 text-xs"><i class="fas fa-pen"></i></button>
                  <button @click="remove(job)" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="jobs.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-400">No service jobs found.</td>
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
            <h3 class="font-heading font-bold text-gray-900 text-lg">{{ modal.id ? 'Edit Job' : 'New Service Job' }}</h3>
            <button @click="modal = null" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Customer Name *</label>
              <input v-model="modal.customer_name" type="text" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Mobile</label>
              <input v-model="modal.mobile" type="tel" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Mobile Model</label>
              <input v-model="modal.mobile_model" type="text" class="vmp-input text-sm" placeholder="e.g. VIVO V21" />
            </div>
            <div>
              <label class="vmp-label">Problem *</label>
              <input v-model="modal.problem" type="text" class="vmp-input text-sm" placeholder="e.g. DISPLAY DAMAGE" />
            </div>
            <div>
              <label class="vmp-label">In Date *</label>
              <input v-model="modal.in_date" type="date" class="vmp-input text-sm" required />
            </div>
            <div>
              <label class="vmp-label">Out Date</label>
              <input v-model="modal.out_date" type="date" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Ready Date</label>
              <input v-model="modal.ready_date" type="date" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Status</label>
              <select v-model="modal.status" class="vmp-input text-sm">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div>
              <label class="vmp-label">Work Done</label>
              <input v-model="modal.work_done" type="text" class="vmp-input text-sm" placeholder="e.g. DISPLAY CHANGE" />
            </div>
            <div>
              <label class="vmp-label">Amount (₹)</label>
              <input v-model.number="modal.amount" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Advance (₹)</label>
              <input v-model.number="modal.advance" type="number" min="0" class="vmp-input text-sm" />
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

const jobs = ref<any[]>([])
const total = ref(0)
const search = ref('')
const filterStatus = ref('')
const filterFrom = ref('')
const filterTo = ref('')
const modal = ref<any>(null)
const saving = ref(false)
let debounceTimer: any = null

async function load() {
  const params: any = { limit: 200 }
  if (search.value) params.search = search.value
  if (filterStatus.value) params.status = filterStatus.value
  if (filterFrom.value) params.from = filterFrom.value
  if (filterTo.value) params.to = filterTo.value
  const res = await get<any>('/service-jobs', params)
  jobs.value = res.rows
  total.value = res.total
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 350)
}

function openAdd() {
  modal.value = { customer_name: '', mobile: '', mobile_model: '', problem: '', in_date: dayjs().format('YYYY-MM-DD'), out_date: '', ready_date: '', status: 'pending', work_done: '', amount: 0, advance: 0, notes: '' }
}

function openEdit(job: any) { modal.value = { ...job } }

async function save() {
  saving.value = true
  try {
    if (modal.value.id) await put(`/service-jobs/${modal.value.id}`, modal.value)
    else await post('/service-jobs', modal.value)
    modal.value = null
    await load()
  } finally { saving.value = false }
}

async function remove(job: any) {
  if (!confirm(`Delete job for ${job.customer_name}?`)) return
  await del(`/service-jobs/${job.id}`)
  await load()
}

function fmtDate(d: string) { return d ? dayjs(d).format('DD-MM-YY') : '—' }
function fmt(n: any) { return Number(n || 0).toLocaleString('en-IN') }

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-600',
  returned: 'bg-red-100 text-red-700',
}

const StatusBadge = defineComponent({
  props: ['status'],
  setup(props) {
    return () => h('span', { class: `capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[props.status] || 'bg-gray-100 text-gray-600'}` }, props.status?.replace('_', ' '))
  }
})

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-xs font-semibold text-gray-600 mb-1; }
</style>
