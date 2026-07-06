<template>
  <div class="space-y-6">
    <!-- Date selector + summary bar -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-3">
        <label class="text-sm font-semibold text-gray-700">Date</label>
        <input type="date" v-model="selectedDate" class="vmp-input max-w-[180px] text-sm" @change="loadDay" />
      </div>
      <div v-if="summary" class="flex flex-wrap gap-3 text-sm">
        <SummaryPill label="Revenue" :value="`₹${fmt(summary.total_income)}`" color="green" />
        <SummaryPill label="Sales" :value="`₹${fmt(summary.total_sales)}`" color="blue" />
        <SummaryPill label="Service" :value="`₹${fmt(summary.total_service)}`" color="purple" />
        <SummaryPill v-if="auth.isOwner" label="Profit" :value="`₹${fmt(summary.total_cost)}`" color="green" />
        <SummaryPill label="Expense" :value="`₹${fmt(summary.total_expense)}`" color="red" />
        <SummaryPill v-if="auth.isOwner" label="Net" :value="`₹${fmt(summary.net_profit)}`" :color="summary.net_profit >= 0 ? 'green' : 'red'" bold />
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Transaction Entry Form -->
      <div class="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-heading font-bold text-gray-900 mb-5 flex items-center gap-2">
          <i class="fas fa-plus-circle text-red-500"></i> Add Transaction
        </h2>
        <form @submit.prevent="addTransaction" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Customer Name</label>
              <input v-model="txForm.customer_name" type="text" class="vmp-input text-sm" placeholder="Name or NA" />
            </div>
            <div>
              <label class="vmp-label">Mobile Number</label>
              <input v-model="txForm.mobile" type="tel" maxlength="10" class="vmp-input text-sm" placeholder="10 digits or NA" />
            </div>
            <div class="sm:col-span-2">
              <label class="vmp-label">Product / Service Description *</label>
              <input v-model="txForm.product_desc" type="text" class="vmp-input text-sm" placeholder="e.g. VIVO T1 DISPLAY CHANGE AND TEMPER" required />
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-gray-50 rounded-xl p-4">
            <div>
              <label class="vmp-label text-xs">Amount</label>
              <input v-model.number="txForm.amount" type="number" min="0" step="0.01" class="vmp-input text-sm" @input="autoSplit" />
            </div>
            <div>
              <label class="vmp-label text-xs">Cash</label>
              <input v-model.number="txForm.cash" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">GPay</label>
              <input v-model.number="txForm.gpay" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div v-if="auth.isOwner">
              <label class="vmp-label text-xs">Profit</label>
              <input v-model.number="txForm.vmp_cost" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">Sales</label>
              <input v-model.number="txForm.sales_amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">Service</label>
              <input v-model.number="txForm.service_amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <button type="submit" :disabled="!txForm.product_desc || txSaving" class="btn-vmp disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-plus"></i> <span v-if="txSaving">Saving...</span><span v-else>Add Transaction</span>
            </button>
            <span class="text-xs text-gray-400">S.No will be <span class="font-semibold text-gray-600">#{{ txForm.serial_no }}</span></span>
          </div>
        </form>
      </div>

      <!-- Expense Entry Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-heading font-bold text-gray-900 mb-5 flex items-center gap-2">
          <i class="fas fa-receipt text-orange-500"></i> Add Expense
        </h2>
        <form @submit.prevent="addExpense" class="space-y-4">
          <div>
            <label class="vmp-label">Category</label>
            <select v-model="expForm.category" class="vmp-input text-sm">
              <option v-if="auth.isOwner" value="shop">Shop Expense</option>
              <option v-if="auth.isOwner" value="petrol">Petrol</option>
              <option v-if="auth.isOwner" value="staff">Staff (Vinoth / Sarath...)</option>
              <option value="service">Service Expense</option>
              <option value="sales">Sales Expense</option>
              <option v-if="auth.isOwner" value="3d">3D</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div v-if="expForm.category === 'staff'">
            <label class="vmp-label">Staff Name</label>
            <input v-model="expForm.staff_name" type="text" class="vmp-input text-sm" placeholder="e.g. Vinoth, Sarath" />
          </div>
          <div>
            <label class="vmp-label">Description *</label>
            <input v-model="expForm.description" type="text" class="vmp-input text-sm" placeholder="e.g. HOSPITAL DENTAL" required />
          </div>
          <div>
            <label class="vmp-label">Amount *</label>
            <input v-model.number="expForm.amount" type="number" min="0" step="0.01" class="vmp-input text-sm" required />
          </div>
          <button type="submit" :disabled="!expForm.description || !expForm.amount || expSaving" class="btn-vmp w-full justify-center disabled:opacity-50">
            <i class="fas fa-plus"></i> <span v-if="expSaving">Saving...</span><span v-else>Add Expense</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-heading font-bold text-gray-900">Transactions — {{ formatDateDisplay(selectedDate) }}</h2>
        <span class="text-sm text-gray-400">{{ transactions.length }} entries</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">S.No</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Product / Service</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Cash</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">GPay</th>
              <th v-if="auth.isOwner" class="text-right px-4 py-3 text-gray-500 font-semibold">Profit</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Sales</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Service</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 text-gray-500">{{ tx.serial_no }}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ tx.customer_name || '—' }}</p>
                <p class="text-gray-400 text-xs">{{ tx.mobile || '' }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-[200px]">
                <p class="truncate" :title="tx.product_desc">{{ tx.product_desc }}</p>
              </td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ fmt(tx.amount) }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ fmt(tx.cash) }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ fmt(tx.gpay) }}</td>
              <td v-if="auth.isOwner" class="px-4 py-3 text-right text-green-600 font-medium">{{ fmt(tx.vmp_cost) }}</td>
              <td class="px-4 py-3 text-right text-blue-600">{{ fmt(tx.sales_amount) }}</td>
              <td class="px-4 py-3 text-right text-purple-600">{{ fmt(tx.service_amount) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button @click="openEditTx(tx)" class="text-gray-300 hover:text-blue-500 transition-colors text-xs">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click="deleteTransaction(tx)" class="text-gray-300 hover:text-red-500 transition-colors text-xs">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="transactions.length > 0" class="bg-gray-50 font-bold">
              <td class="px-4 py-3 text-gray-700" colspan="3">Total</td>
              <td class="px-4 py-3 text-right text-gray-900">{{ fmt(colSum('amount')) }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ fmt(colSum('cash')) }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ fmt(colSum('gpay')) }}</td>
              <td v-if="auth.isOwner" class="px-4 py-3 text-right text-green-700 font-semibold">{{ fmt(colSum('vmp_cost')) }}</td>
              <td class="px-4 py-3 text-right text-blue-700">{{ fmt(colSum('sales_amount')) }}</td>
              <td class="px-4 py-3 text-right text-purple-700">{{ fmt(colSum('service_amount')) }}</td>
              <td></td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td :colspan="auth.isOwner ? 10 : 9" class="px-4 py-10 text-center text-gray-400">No transactions for this date.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-heading font-bold text-gray-900">Expenses — {{ formatDateDisplay(selectedDate) }}</h2>
        <span class="text-sm font-semibold text-red-600">Total: ₹{{ fmt(expenses.reduce((s, e) => s + Number(e.amount), 0)) }}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Category</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Description</th>
              <th class="text-left px-4 py-3 text-gray-500 font-semibold">Staff</th>
              <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3">
                <span class="capitalize px-2 py-0.5 rounded-full text-xs font-medium" :class="catClass(exp.category)">{{ exp.category }}</span>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ exp.description }}</td>
              <td class="px-4 py-3 text-gray-500">{{ exp.staff_name || '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-red-600">₹{{ fmt(exp.amount) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button @click="openEditExp(exp)" class="text-gray-300 hover:text-blue-500 transition-colors text-xs">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click="deleteExpense(exp)" class="text-gray-300 hover:text-red-500 text-xs">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expenses.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-gray-400">No expenses recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Transaction Modal -->
    <Teleport to="body">
      <div v-if="editTx" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="editTx = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-gray-900 text-lg">Edit Transaction #{{ editTx.serial_no }}</h3>
            <button @click="editTx = null" class="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Customer Name</label>
              <input v-model="editTx.customer_name" type="text" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Mobile Number</label>
              <input v-model="editTx.mobile" type="tel" maxlength="10" class="vmp-input text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="vmp-label">Product / Service Description *</label>
              <input v-model="editTx.product_desc" type="text" class="vmp-input text-sm" required />
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-gray-50 rounded-xl p-4">
            <div>
              <label class="vmp-label text-xs">Amount</label>
              <input v-model.number="editTx.amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">Cash</label>
              <input v-model.number="editTx.cash" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">GPay</label>
              <input v-model.number="editTx.gpay" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div v-if="auth.isOwner">
              <label class="vmp-label text-xs">Profit</label>
              <input v-model.number="editTx.vmp_cost" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">Sales</label>
              <input v-model.number="editTx.sales_amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label text-xs">Service</label>
              <input v-model.number="editTx.service_amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
          </div>
          <div class="flex flex-wrap gap-3 justify-end pt-2">
            <button @click="editTx = null" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button @click="saveEditTx" :disabled="txSaving" class="btn-vmp disabled:opacity-50">
              <i class="fas fa-check"></i> <span v-if="txSaving">Saving...</span><span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Expense Modal -->
    <Teleport to="body">
      <div v-if="editExp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="editExp = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-gray-900 text-lg">Edit Expense</h3>
            <button @click="editExp = null" class="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>
          <div>
            <label class="vmp-label">Category</label>
            <select v-model="editExp.category" class="vmp-input text-sm">
              <option v-if="auth.isOwner" value="shop">Shop Expense</option>
              <option v-if="auth.isOwner" value="petrol">Petrol</option>
              <option v-if="auth.isOwner" value="staff">Staff (Vinoth / Sarath...)</option>
              <option value="service">Service Expense</option>
              <option value="sales">Sales Expense</option>
              <option v-if="auth.isOwner" value="3d">3D</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div v-if="editExp.category === 'staff'">
            <label class="vmp-label">Staff Name</label>
            <input v-model="editExp.staff_name" type="text" class="vmp-input text-sm" />
          </div>
          <div>
            <label class="vmp-label">Description *</label>
            <input v-model="editExp.description" type="text" class="vmp-input text-sm" required />
          </div>
          <div>
            <label class="vmp-label">Amount *</label>
            <input v-model.number="editExp.amount" type="number" min="0" step="0.01" class="vmp-input text-sm" />
          </div>
          <div class="flex flex-wrap gap-3 justify-end pt-2">
            <button @click="editExp = null" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button @click="saveEditExp" :disabled="expSaving" class="btn-vmp disabled:opacity-50">
              <i class="fas fa-check"></i> <span v-if="expSaving">Saving...</span><span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const auth = useAuthStore()
const { get, post, put, del } = useApi()

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const transactions = ref<any[]>([])
const expenses = ref<any[]>([])
const summary = ref<any>(null)
const txSaving = ref(false)
const expSaving = ref(false)

const editTx = ref<any>(null)
const editExp = ref<any>(null)

const defaultTx = () => ({
  serial_no: transactions.value.length + 1,
  customer_name: '',
  mobile: '',
  product_desc: '',
  amount: 0,
  cash: 0,
  gpay: 0,
  vmp_cost: 0,
  sales_amount: 0,
  service_amount: 0,
})

const txForm = reactive(defaultTx())

const expForm = reactive({
  category: 'sales', // corrected to owner default in onMounted once auth is hydrated
  description: '',
  amount: 0,
  staff_name: '',
})

async function loadDay() {
  const res = await get<any>(`/reports/daily?date=${selectedDate.value}`)
  transactions.value = res.transactions || []
  expenses.value = res.expenses || []
  summary.value = res.summary
  txForm.serial_no = transactions.value.length + 1
}

async function addTransaction() {
  txSaving.value = true
  try {
    await post('/transactions', { ...txForm, date: selectedDate.value })
    Object.assign(txForm, defaultTx())
    await loadDay()
  } finally {
    txSaving.value = false
  }
}

async function addExpense() {
  expSaving.value = true
  try {
    await post('/expenses', { ...expForm, date: selectedDate.value })
    expForm.description = ''
    expForm.amount = 0
    expForm.staff_name = ''
    await loadDay()
  } finally {
    expSaving.value = false
  }
}

function openEditTx(tx: any) {
  editTx.value = { ...tx }
}

function openEditExp(exp: any) {
  editExp.value = { ...exp }
}

async function saveEditTx() {
  if (!editTx.value) return
  txSaving.value = true
  try {
    await put(`/transactions/${editTx.value.id}`, editTx.value)
    editTx.value = null
    await loadDay()
  } finally {
    txSaving.value = false
  }
}

async function saveEditExp() {
  if (!editExp.value) return
  expSaving.value = true
  try {
    await put(`/expenses/${editExp.value.id}`, editExp.value)
    editExp.value = null
    await loadDay()
  } finally {
    expSaving.value = false
  }
}

async function deleteTransaction(tx: any) {
  if (!confirm('Delete this transaction?')) return
  await del(`/transactions/${tx.id}`)
  await loadDay()
}

async function deleteExpense(exp: any) {
  if (!confirm('Delete this expense?')) return
  await del(`/expenses/${exp.id}`)
  await loadDay()
}

function autoSplit() {
  if (txForm.cash === 0) txForm.gpay = txForm.amount
}

function colSum(key: string) {
  return transactions.value.reduce((s, t) => s + Number(t[key] || 0), 0)
}

function fmt(n: number | string) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatDateDisplay(d: string) {
  return dayjs(d).format('DD MMM YYYY (ddd)')
}

function catClass(cat: string) {
  const map: Record<string, string> = {
    shop: 'bg-gray-100 text-gray-700',
    petrol: 'bg-yellow-100 text-yellow-700',
    staff: 'bg-blue-100 text-blue-700',
    service: 'bg-purple-100 text-purple-700',
    sales: 'bg-green-100 text-green-700',
    '3d': 'bg-pink-100 text-pink-700',
    other: 'bg-orange-100 text-orange-700',
  }
  return map[cat] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  expForm.category = auth.isOwner ? 'shop' : 'sales'
  loadDay()
})
</script>

<style scoped>
.vmp-label {
  @apply block text-xs font-semibold text-gray-600 mb-1;
}
</style>
