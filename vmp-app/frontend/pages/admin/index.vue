<template>
  <div class="space-y-6">

    <!-- Hero greeting banner -->
    <div class="rounded-2xl overflow-hidden relative" style="background: var(--vmp-gradient)">
      <div class="absolute inset-0 opacity-10" style="background-image: url('/img/logo/logo.png'); background-repeat: no-repeat; background-position: right -20px center; background-size: 220px;"></div>
      <div class="relative px-6 py-8 md:px-10">
        <p class="text-white/70 text-sm font-medium mb-1">{{ greeting }},</p>
        <h1 class="text-white font-heading font-bold text-2xl md:text-3xl mb-1">{{ auth.user?.name }}</h1>
        <p class="text-white/60 text-sm">{{ todayLabel }} · Vellore Mobile Point</p>
      </div>
    </div>

    <!-- Today's KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="kpi.bg">
          <i :class="`fas ${kpi.icon} text-lg`" :style="`color: ${kpi.iconColor}`"></i>
        </div>
        <div class="min-w-0">
          <p class="text-xs text-gray-500 font-medium truncate">{{ kpi.label }}</p>
          <p class="text-xl font-bold font-heading" :class="kpi.valueClass">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div>
      <h2 class="font-heading font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 px-1">Quick Actions</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all group text-center">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" :class="action.bg">
            <i :class="`fas ${action.icon} text-base`" :style="`color: ${action.color}`"></i>
          </div>
          <span class="text-xs font-semibold text-gray-700 leading-tight">{{ action.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Two-column: Today's transactions + Recent bookings -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Today's Transactions -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-heading font-bold text-gray-900">Today's Transactions</h2>
          <NuxtLink to="/admin/tracker" class="text-xs font-semibold px-3 py-1.5 rounded-full" style="background: var(--vmp-gradient); color: white">+ Add</NuxtLink>
        </div>
        <div v-if="todayTx.length === 0" class="px-6 py-10 text-center text-gray-400 text-sm">
          No transactions recorded today.
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div v-for="tx in todayTx.slice(0, 6)" :key="tx.id" class="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50">
            <div class="min-w-0">
              <p class="font-medium text-gray-800 text-sm truncate">{{ tx.customer_name || 'Walk-in' }}</p>
              <p class="text-gray-400 text-xs truncate">{{ tx.product_desc }}</p>
            </div>
            <span class="font-bold text-gray-900 text-sm shrink-0">₹{{ Number(tx.amount).toLocaleString('en-IN') }}</span>
          </div>
          <div v-if="todayTx.length > 6" class="px-6 py-3 text-center">
            <NuxtLink to="/admin/tracker" class="text-xs font-semibold" style="color: var(--vmp-red)">+{{ todayTx.length - 6 }} more → View all</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Recent Bookings -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-heading font-bold text-gray-900">Recent Bookings</h2>
          <NuxtLink to="/admin/bookings" class="text-xs font-semibold" style="color: var(--vmp-red)">View all →</NuxtLink>
        </div>
        <div v-if="recentBookings.length === 0" class="px-6 py-10 text-center text-gray-400 text-sm">
          No bookings yet.
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div v-for="b in recentBookings.slice(0, 6)" :key="b.id" class="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50">
            <div class="min-w-0">
              <p class="font-medium text-gray-800 text-sm truncate">{{ b.customer_name }}</p>
              <p class="text-gray-400 text-xs truncate">{{ b.service_type }} · {{ b.device_brand }} {{ b.device_model }}</p>
            </div>
            <BookingStatusBadge :status="b.status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Pending service jobs + New messages alert -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Pending service jobs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-heading font-bold text-gray-900">Pending Service Jobs</h2>
          <NuxtLink to="/admin/service-jobs" class="text-xs font-semibold" style="color: var(--vmp-red)">View all →</NuxtLink>
        </div>
        <div v-if="pendingJobs.length === 0" class="px-6 py-10 text-center text-gray-400 text-sm">
          No pending service jobs.
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div v-for="job in pendingJobs.slice(0, 5)" :key="job.id" class="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50">
            <div class="min-w-0">
              <p class="font-medium text-gray-800 text-sm truncate">{{ job.customer_name }}</p>
              <p class="text-gray-400 text-xs truncate">{{ job.mobile_model }} · {{ job.problem }}</p>
            </div>
            <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" :class="jobStatusClass(job.status)">{{ job.status?.replace('_',' ') }}</span>
          </div>
        </div>
      </div>

      <!-- Stats sidebar -->
      <div class="space-y-4">
        <!-- New messages -->
        <div v-if="newContacts > 0" class="rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3" style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)">
          <div class="flex items-center gap-3">
            <i class="fas fa-envelope text-white text-xl"></i>
            <div>
              <p class="font-semibold text-white">{{ newContacts }} new message{{ newContacts > 1 ? 's' : '' }}</p>
              <p class="text-white/70 text-xs">From the contact form</p>
            </div>
          </div>
          <NuxtLink to="/admin/contacts" class="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">View</NuxtLink>
        </div>

        <!-- Month summary pill -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-heading font-bold text-gray-900 mb-4">This Month</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-green-50 rounded-xl">
              <p class="text-xs text-green-600 font-medium mb-1">Income</p>
              <p class="text-lg font-bold text-green-700 font-heading">₹{{ fmtK(monthSummary?.total_income) }}</p>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-xl">
              <p class="text-xs text-red-600 font-medium mb-1">Expense</p>
              <p class="text-lg font-bold text-red-700 font-heading">₹{{ fmtK(monthSummary?.total_expense) }}</p>
            </div>
            <div class="text-center p-3 bg-blue-50 rounded-xl" v-if="auth.isOwner">
              <p class="text-xs text-blue-600 font-medium mb-1">Net Profit</p>
              <p class="text-lg font-bold font-heading" :class="(monthSummary?.net_profit || 0) >= 0 ? 'text-blue-700' : 'text-red-700'">₹{{ fmtK(monthSummary?.net_profit) }}</p>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-xl">
              <p class="text-xs text-purple-600 font-medium mb-1">Working Days</p>
              <p class="text-lg font-bold text-purple-700 font-heading">{{ monthSummary?.working_days || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const { get } = useApi()
const auth = useAuthStore()

const todayTx      = ref<any[]>([])
const recentBookings = ref<any[]>([])
const pendingJobs  = ref<any[]>([])
const newContacts  = ref(0)
const dailySummary = ref<any>(null)
const monthSummary = ref<any>(null)

const greeting = computed(() => {
  const h = dayjs().hour()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const todayLabel = computed(() => dayjs().format('dddd, DD MMM YYYY'))

const kpis = computed(() => {
  const s = dailySummary.value?.summary
  const all = [
    { label: "Today's Revenue", value: `₹${fmt(s?.total_income)}`, icon: 'fa-indian-rupee-sign', bg: 'bg-red-50', iconColor: '#e70302', valueClass: 'text-gray-900' },
    { label: "Today's Expense", value: `₹${fmt(s?.total_expense)}`, icon: 'fa-receipt', bg: 'bg-orange-50', iconColor: '#fc6906', valueClass: 'text-gray-900' },
    { label: 'Net Profit', value: `₹${fmt(s?.net_profit)}`, icon: 'fa-chart-line', bg: 'bg-green-50', iconColor: '#16a34a', valueClass: (s?.net_profit || 0) >= 0 ? 'text-green-700' : 'text-red-700', ownerOnly: true },
    { label: 'Pending Bookings', value: String(recentBookings.value.filter(b => b.status === 'pending').length), icon: 'fa-calendar-clock', bg: 'bg-blue-50', iconColor: '#3b82f6', valueClass: 'text-gray-900' },
  ]
  return all.filter(k => !k.ownerOnly || auth.isOwner)
})

const quickActions = [
  { label: 'Daily Entry', to: '/admin/tracker', icon: 'fa-pen-to-square', bg: 'bg-red-50', color: '#e70302' },
  { label: 'Service Jobs', to: '/admin/service-jobs', icon: 'fa-screwdriver-wrench', bg: 'bg-orange-50', color: '#fc6906' },
  { label: 'Memberships', to: '/admin/memberships', icon: 'fa-id-card', bg: 'bg-blue-50', color: '#3b82f6' },
  { label: '3D Orders', to: '/admin/3d-orders', icon: 'fa-cube', bg: 'bg-purple-50', color: '#9333ea' },
  { label: 'Inventory', to: '/admin/inventory', icon: 'fa-boxes-stacked', bg: 'bg-green-50', color: '#16a34a' },
  { label: 'Reports', to: '/admin/tracker/reports', icon: 'fa-chart-bar', bg: 'bg-yellow-50', color: '#d97706' },
]

function fmt(n: any) { return Number(n || 0).toLocaleString('en-IN') }
function fmtK(n: any) {
  const v = Number(n || 0)
  return v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v)
}

function jobStatusClass(s: string) {
  return { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', ready: 'bg-green-100 text-green-700', delivered: 'bg-gray-100 text-gray-500', returned: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600'
}

onMounted(async () => {
  const today = dayjs().format('YYYY-MM-DD')
  const month = dayjs().format('YYYY-MM')

  const [daily, bookings, contacts, jobs, monthly] = await Promise.allSettled([
    get<any>(`/reports/daily?date=${today}`),
    get<any>('/bookings?limit=10'),
    get<any>('/contacts?status=new&limit=1'),
    get<any>('/service-jobs?status=pending&limit=10'),
    get<any>(`/reports/monthly?month=${month}`),
  ])

  if (daily.status === 'fulfilled') {
    dailySummary.value = daily.value
    todayTx.value = daily.value.transactions || []
  }
  if (bookings.status === 'fulfilled') recentBookings.value = bookings.value.bookings || []
  if (contacts.status === 'fulfilled') newContacts.value = contacts.value.total || 0
  if (jobs.status === 'fulfilled') pendingJobs.value = jobs.value.rows || []
  if (monthly.status === 'fulfilled') monthSummary.value = monthly.value.summary
})
</script>
