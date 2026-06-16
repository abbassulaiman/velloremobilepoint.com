<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      :class="['fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl flex flex-col transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0']"
    >
      <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <img src="/img/logo/logo.png" alt="VMP" class="h-10 w-auto" />
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <AdminNavItem icon="fa-gauge-high" label="Dashboard" to="/admin" exact />
        <AdminNavItem icon="fa-calendar-check" label="Bookings" to="/admin/bookings" />
        <AdminNavItem icon="fa-envelope" label="Messages" to="/admin/contacts" />
        <div class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Tracker</p>
        </div>
        <AdminNavItem icon="fa-pen-to-square" label="Daily Entry" to="/admin/tracker" exact />
        <AdminNavItem icon="fa-chart-line" label="Reports" to="/admin/tracker/reports" />
        <AdminNavItem icon="fa-users" label="Customers" to="/admin/tracker/customers" />
        <div class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shop Management</p>
        </div>
        <AdminNavItem icon="fa-screwdriver-wrench" label="Service Jobs" to="/admin/service-jobs" />
        <AdminNavItem icon="fa-id-card" label="Memberships" to="/admin/memberships" />
        <AdminNavItem icon="fa-cube" label="3D Orders" to="/admin/3d-orders" />
        <AdminNavItem icon="fa-magnifying-glass" label="Product Enquiries" to="/admin/product-enquiries" />
        <AdminNavItem icon="fa-boxes-stacked" label="Inventory" to="/admin/inventory" />
        <div v-if="auth.isOwner" class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
        </div>
        <AdminNavItem v-if="auth.isOwner" icon="fa-sliders" label="CMS" to="/admin/cms" />
        <AdminNavItem v-if="auth.isOwner" icon="fa-users-gear" label="Staff" to="/admin/staff" />
      </nav>

      <div class="px-4 py-4 border-t border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
            {{ auth.user?.name?.[0]?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ auth.user?.role }}</p>
          </div>
        </div>
        <button
          @click="auth.logout()"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <i class="fas fa-right-from-bracket w-4"></i> Logout
        </button>
      </div>
    </aside>

    <!-- Backdrop (mobile) -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/40 md:hidden" @click="sidebarOpen = false"></div>

    <!-- Main content -->
    <div class="flex-1 md:ml-64 flex flex-col min-h-screen">
      <!-- Top bar -->
      <header class="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex flex-wrap items-center gap-4">
        <button class="md:hidden text-gray-500 hover:text-gray-800" @click="sidebarOpen = !sidebarOpen">
          <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="flex-1">
          <h1 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h1>
        </div>
        <span class="text-sm text-gray-400">{{ today }}</span>
      </header>

      <main class="flex-1 p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import dayjs from 'dayjs'

const auth = useAuthStore()
const sidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on navigation (mobile)
watch(() => route.path, () => { sidebarOpen.value = false })

const today = computed(() => dayjs().format('ddd, DD MMM YYYY'))

const titleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Repair Bookings',
  '/admin/contacts': 'Contact Messages',
  '/admin/tracker': 'Daily Entry',
  '/admin/tracker/reports': 'Reports',
  '/admin/tracker/customers': 'Customer History',
  '/admin/cms': 'CMS Editor',
  '/admin/staff': 'Staff Management',
  '/admin/service-jobs': 'Service Jobs',
  '/admin/memberships': 'Memberships',
  '/admin/3d-orders': '3D Orders',
  '/admin/product-enquiries': 'Product Enquiries',
  '/admin/inventory': 'Inventory',
}
const pageTitle = computed(() => titleMap[route.path] || 'Admin Panel')
</script>
