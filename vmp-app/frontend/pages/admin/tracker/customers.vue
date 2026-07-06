<template>
  <div class="space-y-5">
    <!-- Search bar -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 class="font-heading font-bold text-gray-900 mb-4">Customer History</h2>
      <div class="flex gap-3">
        <input
          v-model="query"
          type="text"
          class="vmp-input flex-1"
          placeholder="Search by name or mobile number..."
          @keyup.enter="search"
        />
        <button @click="search" :disabled="!query || loading" class="btn-vmp disabled:opacity-50">
          <i class="fas fa-search"></i> Search
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="space-y-4">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-4">
        <KpiCard label="Total Visits" :value="String(result.total_visits)" icon="fa-store" color="blue" />
        <KpiCard label="Total Spend" :value="`₹${fmt(result.total_spend)}`" icon="fa-indian-rupee-sign" color="red" />
        <KpiCard label="Avg per Visit" :value="`₹${fmt(result.total_visits > 0 ? result.total_spend / result.total_visits : 0)}`" icon="fa-calculator" color="green" />
      </div>

      <!-- Transaction history -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-heading font-bold text-gray-900">Results for "{{ result.query }}"</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Mobile</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Product / Service</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Cash</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">GPay</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="tx in result.transactions" :key="tx.id" class="hover:bg-gray-50/50">
                <td class="px-4 py-3 text-gray-500 text-xs">{{ dayjs(tx.date).format('DD MMM YYYY') }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ tx.customer_name || '—' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ tx.mobile || '—' }}</td>
                <td class="px-4 py-3 text-gray-700 max-w-[200px] truncate" :title="tx.product_desc">{{ tx.product_desc }}</td>
                <td class="px-4 py-3 text-right font-semibold">{{ fmt(tx.amount) }}</td>
                <td class="px-4 py-3 text-right text-gray-500">{{ fmt(tx.cash) }}</td>
                <td class="px-4 py-3 text-right text-gray-500">{{ fmt(tx.gpay) }}</td>
              </tr>
              <tr v-if="result.transactions.length === 0">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="searched && !loading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
      No records found for "{{ query }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const { get } = useApi()
const query = ref('')
const result = ref<any>(null)
const loading = ref(false)
const searched = ref(false)

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  searched.value = true
  result.value = null
  try {
    const res = await get<any>(`/reports/customers?q=${encodeURIComponent(query.value)}`)
    result.value = res
  } finally {
    loading.value = false
  }
}

function fmt(n: number | string) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>
