<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4 items-center">
      <div class="flex gap-2">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap', activeTab === tab.value ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600']"
          :style="activeTab === tab.value ? 'background: var(--vmp-gradient)' : ''">
          <i :class="`fas ${tab.icon} mr-1`"></i> {{ tab.label }}
        </button>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <template v-if="activeTab === 'monthly' || activeTab === 'staff'">
          <div class="flex items-center gap-2">
            <select :value="pickerMonth" @change="onPickerMonth" class="vmp-input text-sm py-2 max-w-[140px]">
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select :value="pickerYear" @change="onPickerYear" class="vmp-input text-sm py-2 max-w-[95px]">
              <option v-for="y in pickerYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </template>
        <template v-else-if="activeTab === 'yearly'">
          <input type="number" v-model.number="selectedYear" min="2012" :max="currentYear" class="vmp-input text-sm max-w-[120px]" @change="loadYearly" />
        </template>
        <template v-else-if="activeTab === 'daily'">
          <input type="date" v-model="selectedDate" class="vmp-input text-sm max-w-[170px]" @change="loadDaily" />
        </template>
      </div>
    </div>

    <!-- Monthly Report -->
    <div v-if="activeTab === 'monthly' && monthData">
      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Income" :value="`₹${fmt(monthData.summary.total_income)}`" icon="fa-indian-rupee-sign" color="red" />
        <KpiCard label="Total Expense" :value="`₹${fmt(monthData.summary.total_expense)}`" icon="fa-receipt" color="orange" />
        <KpiCard v-if="auth.isOwner" label="Net Profit" :value="`₹${fmt(monthData.summary.net_profit)}`" icon="fa-chart-line" :color="monthData.summary.net_profit >= 0 ? 'green' : 'red'" />
        <KpiCard label="Working Days" :value="String(monthData.summary.working_days)" icon="fa-calendar" color="blue" />
      </div>

      <!-- Opening Balance + Total Cash Available -->
      <div v-if="auth.isOwner" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style="background: var(--vmp-gradient)">
              <i class="fas fa-wallet text-sm"></i>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Carry-Forward from {{ prevMonthLabel }}</p>
              <p class="text-xl font-bold font-heading text-gray-700">₹{{ fmt(carryForward) }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Total cash available up to end of {{ prevMonthLabel }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-gray-300 text-2xl font-light">+</div>

          <div>
            <p class="text-xs text-gray-500 font-medium">This Month Net</p>
            <p class="text-xl font-bold font-heading" :class="Number(monthData.summary.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'">
              ₹{{ fmt(monthData.summary.net_profit) }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-gray-300 text-2xl font-light">=</div>

          <div class="ml-auto">
            <p class="text-xs text-gray-500 font-medium">Total Cash Available</p>
            <p class="text-3xl font-bold font-heading" :class="totalCashAvailable >= 0 ? 'text-green-600' : 'text-red-600'">
              ₹{{ fmt(totalCashAvailable) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 class="font-heading font-bold text-gray-900 mb-4">Daily Income vs Expense — {{ selectedMonth }}</h3>
        <client-only>
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" class="max-h-80" />
        </client-only>
      </div>

      <!-- Expense by Category -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Expense by Category</h3>
          <div class="space-y-3">
            <div v-for="cat in visibleCategories(monthData.expense_by_category)" :key="cat.category" class="flex items-center gap-3">
              <span class="capitalize text-sm text-gray-600 w-20">{{ cat.category }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" style="background: var(--vmp-gradient)"
                  :style="`width: ${(Number(cat.total) / monthData.summary.total_expense * 100).toFixed(1)}%`"></div>
              </div>
              <span class="text-sm font-semibold text-gray-800 w-20 text-right">₹{{ fmt(cat.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Day-by-day table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-heading font-bold text-gray-900">Day-by-Day</h3>
          </div>
          <div class="overflow-x-auto overflow-y-auto max-h-72">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="text-left px-4 py-2 text-gray-500 font-semibold">Date</th>
                  <th class="text-right px-4 py-2 text-gray-500 font-semibold">Income</th>
                  <th class="text-right px-4 py-2 text-gray-500 font-semibold">Expense</th>
                  <th class="text-right px-4 py-2 text-gray-500 font-semibold">Net</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="d in monthData.by_day" :key="d.date" class="hover:bg-gray-50/50">
                  <td class="px-4 py-2 text-gray-700">{{ formatDay(d.date) }}</td>
                  <td class="px-4 py-2 text-right text-green-600 font-medium">{{ fmt(d.income) }}</td>
                  <td class="px-4 py-2 text-right text-red-600">{{ fmt(d.expense) }}</td>
                  <td class="px-4 py-2 text-right font-bold" :class="d.net >= 0 ? 'text-green-700' : 'text-red-700'">{{ fmt(d.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Yearly Report -->
    <div v-if="activeTab === 'yearly' && yearData">
      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Income" :value="`₹${fmt(yearData.summary.total_income)}`" icon="fa-indian-rupee-sign" color="red" />
        <KpiCard label="Total Expense" :value="`₹${fmt(yearData.summary.total_expense)}`" icon="fa-receipt" color="orange" />
        <KpiCard v-if="auth.isOwner" label="Net Profit" :value="`₹${fmt(yearData.summary.net_profit)}`" icon="fa-chart-line" :color="yearData.summary.net_profit >= 0 ? 'green' : 'red'" />
        <KpiCard label="Active Months" :value="String(yearData.summary.active_months)" icon="fa-calendar" color="blue" />
      </div>

      <!-- Bar chart: monthly income vs expense -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 class="font-heading font-bold text-gray-900 mb-4">Monthly Income vs Expense — {{ selectedYear }}</h3>
        <client-only>
          <Bar v-if="yearChartData" :data="yearChartData" :options="chartOptions" class="max-h-80" />
        </client-only>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Expense by category -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Expense by Category</h3>
            <div v-if="visibleCategories(yearData.expense_by_category).length > 0" class="space-y-3">
            <div v-for="cat in visibleCategories(yearData.expense_by_category)" :key="cat.category" class="flex items-center gap-3">
              <span class="capitalize text-sm text-gray-600 w-20">{{ cat.category }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" style="background: var(--vmp-gradient)"
                  :style="`width: ${(Number(cat.total) / yearData.summary.total_expense * 100).toFixed(1)}%`"></div>
              </div>
              <span class="text-sm font-semibold text-gray-800 w-20 text-right">₹{{ fmt(cat.total) }}</span>
            </div>
          </div>
          <p v-else class="text-center text-gray-400 py-8">No expenses recorded.</p>
        </div>

        <!-- Month-by-month table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-heading font-bold text-gray-900">Month-by-Month</h3>
          </div>
          <div class="overflow-x-auto overflow-y-auto max-h-80">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="text-left px-4 py-2 text-gray-500 font-semibold">Month</th>
                  <th class="text-right px-4 py-2 text-gray-500 font-semibold">Income</th>
                  <th class="text-right px-4 py-2 text-gray-500 font-semibold">Expense</th>
                  <th v-if="auth.isOwner" class="text-right px-4 py-2 text-gray-500 font-semibold">Net</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="m in yearData.by_month" :key="m.month" class="hover:bg-gray-50/50">
                  <td class="px-4 py-2 text-gray-700 font-medium">{{ formatMonth(m.month) }}</td>
                  <td class="px-4 py-2 text-right text-green-600 font-medium">{{ fmt(m.income) }}</td>
                  <td class="px-4 py-2 text-right text-red-600">{{ fmt(m.expense) }}</td>
                  <td v-if="auth.isOwner" class="px-4 py-2 text-right font-bold" :class="m.net >= 0 ? 'text-green-700' : 'text-red-700'">{{ fmt(m.net) }}</td>
                </tr>
                <!-- Totals row -->
                <tr class="bg-gray-50 font-bold">
                  <td class="px-4 py-2 text-gray-700">Total</td>
                  <td class="px-4 py-2 text-right text-green-700">{{ fmt(yearData.summary.total_income) }}</td>
                  <td class="px-4 py-2 text-right text-red-700">{{ fmt(yearData.summary.total_expense) }}</td>
                  <td v-if="auth.isOwner" class="px-4 py-2 text-right" :class="yearData.summary.net_profit >= 0 ? 'text-green-800' : 'text-red-800'">{{ fmt(yearData.summary.net_profit) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Report -->
    <div v-if="activeTab === 'daily' && dayData">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Revenue" :value="`₹${fmt(dayData.summary.total_income)}`" icon="fa-indian-rupee-sign" color="red" />
        <KpiCard label="Cash" :value="`₹${fmt(dayData.summary.total_cash)}`" icon="fa-money-bill" color="green" />
        <KpiCard label="GPay" :value="`₹${fmt(dayData.summary.total_gpay)}`" icon="fa-mobile-screen" color="blue" />
        <KpiCard v-if="auth.isOwner" label="Net Profit" :value="`₹${fmt(dayData.summary.net_profit)}`" icon="fa-chart-line" :color="dayData.summary.net_profit >= 0 ? 'green' : 'red'" />
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-heading font-bold text-gray-900">Transactions — {{ formatDay(selectedDate) }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">#</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Product</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Cash</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">GPay</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="tx in dayData.transactions" :key="tx.id">
                <td class="px-4 py-2.5 text-gray-400">{{ tx.serial_no }}</td>
                <td class="px-4 py-2.5 text-gray-800">{{ tx.customer_name || '—' }}</td>
                <td class="px-4 py-2.5 text-gray-600 max-w-[200px] truncate" :title="tx.product_desc">{{ tx.product_desc }}</td>
                <td class="px-4 py-2.5 text-right font-semibold">{{ fmt(tx.amount) }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">{{ fmt(tx.cash) }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">{{ fmt(tx.gpay) }}</td>
              </tr>
              <tr v-if="dayData.transactions.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-400">No transactions for this date.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Daily Expenses -->
      <div v-if="dayData.expenses && dayData.expenses.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div class="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-heading font-bold text-gray-900">Expenses — {{ formatDay(selectedDate) }}</h3>
          <span class="text-sm font-semibold text-red-600">Total: ₹{{ fmt(dayData.expenses.reduce((s, e) => s + Number(e.amount), 0)) }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Category</th>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Description</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="exp in dayData.expenses" :key="exp.id">
                <td class="px-4 py-2.5">
                  <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{{ exp.category }}</span>
                </td>
                <td class="px-4 py-2.5 text-gray-600">{{ exp.description }}</td>
                <td class="px-4 py-2.5 text-right font-semibold text-red-600">{{ fmt(exp.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Staff Breakdown -->
    <div v-if="activeTab === 'staff' && staffData">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header with period + person filters -->
        <div class="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-heading font-bold text-gray-900">Staff Expense Breakdown</h3>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Period toggle -->
            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button @click="staffPeriod = 'month'; loadStaff()"
                :class="staffPeriod === 'month' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-1.5 font-medium transition-colors">
                {{ formatMonth(selectedMonth) }}
              </button>
              <button @click="staffPeriod = 'all'; loadStaff()"
                :class="staffPeriod === 'all' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-1.5 font-medium border-l border-gray-200 transition-colors">
                All Time
              </button>
            </div>
          </div>
        </div>

        <!-- Per-person filter pills -->
        <div v-if="staffData.breakdown.length > 1" class="px-5 py-3 border-b border-gray-50 flex flex-wrap gap-2">
          <button @click="selectedStaff = ''"
            :class="selectedStaff === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            class="px-3 py-1 rounded-full text-xs font-semibold transition-colors">
            All Staff
          </button>
          <button v-for="row in staffData.breakdown" :key="row.staff_name"
            @click="selectedStaff = row.staff_name; expandedStaff = new Set([row.staff_name])"
            :class="selectedStaff === row.staff_name ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            :style="selectedStaff === row.staff_name ? 'background: var(--vmp-gradient)' : ''"
            class="px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/30 inline-flex items-center justify-center text-[10px] font-bold">
              {{ row.staff_name?.[0]?.toUpperCase() || '?' }}
            </span>
            {{ row.staff_name || 'Unknown' }}
            <span class="opacity-70">₹{{ fmt(row.total) }}</span>
          </button>
        </div>

        <div class="p-5 space-y-3">
          <div v-for="row in filteredStaff" :key="row.staff_name" class="border border-gray-100 rounded-xl overflow-hidden">
            <!-- Header row — click to expand -->
            <button type="button"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              @click="toggleStaff(row.staff_name)">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style="background: var(--vmp-gradient)">
                  {{ row.staff_name?.[0]?.toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ row.staff_name || 'Unknown' }}</p>
                  <p class="text-xs text-gray-400">{{ row.entries }} {{ row.entries == 1 ? 'entry' : 'entries' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <p class="text-xl font-bold font-heading text-red-600">₹{{ fmt(row.total) }}</p>
                <i class="fas text-gray-400 text-sm transition-transform"
                  :class="expandedStaff.has(row.staff_name) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </button>

            <!-- Expandable detail table -->
            <div v-if="expandedStaff.has(row.staff_name)" class="border-t border-gray-100 overflow-x-auto">
              <table class="w-full text-sm min-w-[320px]">
                <thead class="bg-white">
                  <tr>
                    <th class="text-left px-4 py-2 text-gray-400 font-semibold text-xs">Date</th>
                    <th class="text-left px-4 py-2 text-gray-400 font-semibold text-xs">Description</th>
                    <th class="text-right px-4 py-2 text-gray-400 font-semibold text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="exp in row.expenses" :key="exp.id" class="hover:bg-gray-50/50">
                    <td class="px-4 py-2.5 text-gray-500 whitespace-nowrap">{{ formatDay(exp.date) }}</td>
                    <td class="px-4 py-2.5 text-gray-700">{{ exp.description }}</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-red-600">₹{{ fmt(exp.amount) }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 border-t border-gray-100">
                  <tr>
                    <td colspan="2" class="px-4 py-2 text-xs font-semibold text-gray-500">Total</td>
                    <td class="px-4 py-2 text-right font-bold text-red-600">₹{{ fmt(row.total) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="filteredStaff.length === 0" class="text-center py-10 text-gray-400">
            No staff expenses for this period.
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Flow History tab -->
    <div v-if="activeTab === 'cashflow'">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-heading font-bold text-gray-900">Monthly Cash Flow History</h3>
            <p class="text-xs text-gray-400 mt-0.5">Carry-Forward &amp; Total Cash Available per month — auto-updated when any month's report is loaded.</p>
          </div>
          <button @click="loadCashFlow(true)"
            class="vmp-btn-sm flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
            <i class="fas fa-sync-alt text-xs"></i> Recalculate All
          </button>
        </div>

        <div v-if="balancesData.length === 0" class="text-center py-12 text-gray-400">
          <i class="fas fa-stream text-3xl mb-3 block opacity-30"></i>
          No balances stored yet. Open any Monthly P&amp;L report to auto-save.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 text-gray-500 font-semibold">Month</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Carry-Forward</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Net Profit</th>
                <th class="text-right px-4 py-3 text-gray-500 font-semibold">Total Cash Available</th>
                <th class="text-right px-4 py-3 text-gray-400 font-medium text-xs">Last Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="b in balancesData" :key="b.month" class="hover:bg-gray-50/50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ formatMonth(b.month) }}</td>
                <td class="px-4 py-3 text-right" :class="Number(b.carry_forward) >= 0 ? 'text-blue-600' : 'text-red-500'">
                  ₹{{ fmt(b.carry_forward) }}
                </td>
                <td class="px-4 py-3 text-right" :class="Number(b.net_profit) >= 0 ? 'text-green-600' : 'text-red-500'">
                  ₹{{ fmt(b.net_profit) }}
                </td>
                <td class="px-4 py-3 text-right font-bold" :class="Number(b.total_cash_available) >= 0 ? 'text-gray-900' : 'text-red-600'">
                  ₹{{ fmt(b.total_cash_available) }}
                </td>
                <td class="px-4 py-3 text-right text-gray-400 text-xs">
                  {{ b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('en-IN') : '—' }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td class="px-4 py-3 font-bold text-gray-700">Total</td>
                <td class="px-4 py-3 text-right text-gray-500">—</td>
                <td class="px-4 py-3 text-right font-bold text-green-700">
                  ₹{{ fmt(balancesData.reduce((s, b) => s + Number(b.net_profit), 0)) }}
                </td>
                <td class="px-4 py-3 text-right font-bold text-gray-900">
                  ₹{{ fmt(balancesData[balancesData.length - 1]?.total_cash_available ?? 0) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Excel Import -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-heading font-bold text-gray-900 mb-2 flex items-center gap-2">
        <i class="fas fa-file-import text-green-600"></i> Import from Excel / CSV
      </h3>
      <p class="text-gray-500 text-sm mb-4">Import your existing spreadsheet data. Expected columns: Date, S. No, Name, Mobile Number, Products, Amount, Cash, Gpay, VMP, Sales, Service.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">Transactions</p>
          <input type="file" accept=".xlsx,.xls,.csv" @change="handleTxImport" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          <p v-if="txImportResult" class="text-green-600 text-sm mt-2"><i class="fas fa-check"></i> {{ txImportResult }}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">Expenses</p>
          <input type="file" accept=".xlsx,.xls,.csv" @change="handleExpImport" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
          <p v-if="expImportResult" class="text-green-600 text-sm mt-2"><i class="fas fa-check"></i> {{ expImportResult }}</p>
        </div>
      </div>
      <p v-if="importError" class="text-red-500 text-sm mt-3">{{ importError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const auth = useAuthStore()
const { get, uploadFile } = useApi()

const activeTab = ref('daily')
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedYear = ref(dayjs().year())
const currentYear = dayjs().year()

const pickerMonth = computed(() => selectedMonth.value.split('-')[1])
const pickerYear  = computed(() => selectedMonth.value.split('-')[0])
const pickerYears = Array.from({ length: currentYear - 2011 }, (_, i) => String(currentYear - i))

function onPickerMonth(e: Event) {
  selectedMonth.value = `${pickerYear.value}-${(e.target as HTMLSelectElement).value}`
  // Invalidate cached data so a tab-switch always fetches fresh data for the new month
  monthData.value = null
  staffData.value = null
  activeTab.value === 'staff' ? loadStaff() : loadMonthly()
}
function onPickerYear(e: Event) {
  selectedMonth.value = `${(e.target as HTMLSelectElement).value}-${pickerMonth.value}`
  monthData.value = null
  staffData.value = null
  activeTab.value === 'staff' ? loadStaff() : loadMonthly()
}
const monthData = ref<any>(null)
const dayData = ref<any>(null)
const yearData = ref<any>(null)
const staffData = ref<any>(null)
const txImportResult = ref('')
const expImportResult = ref('')
const importError = ref('')
const expandedStaff = ref<Set<string>>(new Set())
const staffPeriod = ref<'month' | 'all'>('month')
const selectedStaff = ref('')

const filteredStaff = computed(() => {
  const list = staffData.value?.breakdown ?? []
  return selectedStaff.value ? list.filter((r: any) => r.staff_name === selectedStaff.value) : list
})

// Carry-forward: cumulative net profit from Sep 2025 up to start of selected month.
// Sep 2025 = 0 (anchor). Fetched fresh from backend — always accurate.
const carryForward = ref(0)

const prevMonthLabel = computed(() => dayjs(selectedMonth.value + '-01').subtract(1, 'month').format('MMM YYYY'))

const totalCashAvailable = computed(() =>
  carryForward.value + Number(monthData.value?.summary?.net_profit || 0)
)

function toggleStaff(name: string) {
  const s = new Set(expandedStaff.value)
  s.has(name) ? s.delete(name) : s.add(name)
  expandedStaff.value = s
}

const allTabs = [
  { value: 'daily', label: 'Daily', icon: 'fa-calendar-day' },
  { value: 'monthly', label: 'Monthly P&L', icon: 'fa-calendar-alt' },
  { value: 'yearly', label: 'Yearly', icon: 'fa-chart-bar' },
  { value: 'staff', label: 'Staff', icon: 'fa-users', ownerOnly: true },
  { value: 'cashflow', label: 'Cash Flow', icon: 'fa-stream', ownerOnly: true },
]

const tabs = computed(() => allTabs.filter(t => !t.ownerOnly || auth.isOwner))

const OWNER_ONLY_CATEGORIES = ['shop', 'petrol', 'staff', '3d']
function visibleCategories(list: any[]) {
  if (auth.isOwner) return list
  return list.filter(c => !OWNER_ONLY_CATEGORIES.includes(c.category))
}

const chartData = computed(() => {
  if (!monthData.value) return null
  const days = monthData.value.by_day
  return {
    labels: days.map((d: any) => dayjs(d.date).format('DD')),
    datasets: [
      {
        label: 'Income',
        data: days.map((d: any) => d.income),
        backgroundColor: '#e70302cc',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: days.map((d: any) => d.expense),
        backgroundColor: '#fc6906cc',
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const } },
  scales: { y: { ticks: { callback: (v: any) => `₹${v}` } } },
}

const yearChartData = computed(() => {
  if (!yearData.value) return null
  const months = yearData.value.by_month
  return {
    labels: months.map((m: any) => dayjs(m.month + '-01').format('MMM')),
    datasets: [
      {
        label: 'Income',
        data: months.map((m: any) => m.income),
        backgroundColor: '#e70302cc',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: months.map((m: any) => m.expense),
        backgroundColor: '#fc6906cc',
        borderRadius: 4,
      },
    ],
  }
})

const balancesData = ref<any[]>([])

async function loadCashFlow(recalc = false) {
  const url = recalc ? '/reports/all-balances?recalc=1' : '/reports/all-balances'
  const res = await get<any>(url)
  balancesData.value = res?.balances ?? []
}

async function loadYearly() {
  const res = await get<any>(`/reports/yearly?year=${selectedYear.value}`)
  yearData.value = res
}

async function loadMonthly() {
  const [res, cf] = await Promise.all([
    get<any>(`/reports/monthly?month=${selectedMonth.value}`),
    get<any>(`/reports/cumulative-cash?month=${selectedMonth.value}`).catch(() => ({ carry_forward: 0 })),
  ])
  monthData.value = res
  carryForward.value = cf?.carry_forward ?? 0
}

async function loadDaily() {
  const res = await get<any>(`/reports/daily?date=${selectedDate.value}`)
  dayData.value = res
}

async function loadStaff() {
  expandedStaff.value = new Set()
  selectedStaff.value = ''
  const query = staffPeriod.value === 'all' ? '' : `?month=${selectedMonth.value}`
  const res = await get<any>(`/reports/staff${query}`)
  staffData.value = res
  // Auto-expand when only one person is shown
  if (res?.breakdown?.length === 1) {
    expandedStaff.value = new Set([res.breakdown[0].staff_name])
  }
}

async function handleTxImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importError.value = ''
  try {
    const res = await uploadFile<{ imported: number }>('/transactions/import', file)
    txImportResult.value = `${res.imported} transactions imported!`
  } catch (err: any) {
    importError.value = err?.message || 'Import failed.'
  }
}

async function handleExpImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importError.value = ''
  try {
    const res = await uploadFile<{ imported: number }>('/expenses/import', file)
    expImportResult.value = `${res.imported} expenses imported!`
  } catch (err: any) {
    importError.value = err?.message || 'Import failed.'
  }
}

function fmt(n: number | string) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatMonth(m: string) {
  return dayjs(m + '-01').format('MMM YYYY')
}

function formatDay(d: string) {
  return dayjs(d).format('DD MMM YYYY (ddd)')
}

onMounted(() => {
  loadDaily()
})

watch(activeTab, (tab) => {
  if (tab === 'monthly' && !monthData.value) loadMonthly()
  if (tab === 'yearly' && !yearData.value) loadYearly()
  if (tab === 'daily' && !dayData.value) loadDaily()
  if (tab === 'staff' && !staffData.value) loadStaff()
  if (tab === 'cashflow' && balancesData.value.length === 0) loadCashFlow()
})
</script>
