<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 class="font-heading font-bold text-2xl text-gray-900">Inventory</h1>
        <p class="text-sm text-gray-500 mt-0.5">Stock management for cases, tempers & accessories</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/admin/inventory/scan"
          class="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-red-300 transition-all flex items-center gap-1.5">
          <i class="fas fa-qrcode"></i> Scan QR
        </NuxtLink>
        <button v-if="selectedIds.size > 0" @click="openPrintModal"
          class="px-4 py-2 rounded-xl text-sm font-medium border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all flex items-center gap-1.5">
          <i class="fas fa-print"></i> Print QR
          <span class="bg-indigo-200 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">{{ selectedIds.size }}</span>
        </button>
        <button @click="showLowStock = !showLowStock" :class="['px-4 py-2 rounded-xl text-sm font-medium border transition-all', showLowStock ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300']">
          <i class="fas fa-triangle-exclamation mr-1"></i> Low Stock
          <span v-if="lowStockCount > 0" class="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{{ lowStockCount }}</span>
        </button>
        <button @click="openAdd" class="btn-vmp"><i class="fas fa-plus mr-2"></i>Add Item</button>
      </div>
    </div>

    <!-- Brand summary pills -->
    <div v-if="brandSummary.length" class="flex flex-wrap gap-2">
      <button @click="filterBrand = ''" :class="['px-3 py-1.5 rounded-full text-xs font-semibold border transition-all', filterBrand === '' ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300']" :style="filterBrand === '' ? 'background:var(--vmp-gradient)' : ''">
        All Brands
      </button>
      <button v-for="b in brandSummary" :key="b.phone_brand" @click="filterBrand = b.phone_brand; load()"
        :class="['px-3 py-1.5 rounded-full text-xs font-semibold border transition-all', filterBrand === b.phone_brand ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300']"
        :style="filterBrand === b.phone_brand ? 'background:var(--vmp-gradient)' : ''">
        {{ b.phone_brand || 'Unbranded' }}
        <span class="opacity-70 ml-1">{{ b.total_qty }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" type="text" placeholder="Search product, brand, model..." class="vmp-input text-sm max-w-xs" @input="debounceLoad" />
      <select v-model="filterCategory" class="vmp-input text-sm max-w-[150px]" @change="load">
        <option value="">All Categories</option>
        <option value="case">Case</option>
        <option value="temper">Temper Glass</option>
        <option value="pouch">Pouch</option>
        <option value="cable">Cable</option>
        <option value="charger">Charger</option>
        <option value="earphone">Earphone</option>
        <option value="other">Other</option>
      </select>
      <span class="ml-auto text-sm text-gray-400">{{ items.length }} items · <span class="font-semibold text-gray-700">{{ totalQty }} total stock</span></span>
    </div>

    <!-- Grouped by Brand -->
    <div v-for="(group, brand) in groupedItems" :key="brand" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-3">
          <input type="checkbox" class="w-4 h-4 rounded accent-red-600 cursor-pointer"
            :checked="isBrandAllSelected(group)"
            :indeterminate="isBrandPartialSelected(group)"
            @change="toggleBrand(group)" />
          <h3 class="font-heading font-bold text-gray-800">{{ brand || 'Other' }}</h3>
        </div>
        <span class="text-xs text-gray-400">{{ group.length }} items · {{ group.reduce((s,i) => s + i.quantity, 0) }} units</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50/50">
            <tr>
              <th class="w-8 px-4 py-2"></th>
              <th class="text-left px-4 py-2 text-gray-400 font-semibold text-xs">Model</th>
              <th class="text-left px-4 py-2 text-gray-400 font-semibold text-xs">Product</th>
              <th class="text-left px-4 py-2 text-gray-400 font-semibold text-xs">Category</th>
              <th class="text-right px-4 py-2 text-gray-400 font-semibold text-xs">Buy ₹</th>
              <th class="text-right px-4 py-2 text-gray-400 font-semibold text-xs">Sell ₹</th>
              <th class="text-center px-4 py-2 text-gray-400 font-semibold text-xs">Stock</th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in group" :key="item.id"
              :class="['hover:bg-gray-50/50 transition-colors', item.quantity <= item.min_quantity ? 'bg-orange-50/30' : '', selectedIds.has(item.id) ? 'bg-indigo-50/40' : '']">
              <td class="px-4 py-2.5">
                <input type="checkbox" class="w-4 h-4 rounded accent-red-600 cursor-pointer"
                  :checked="selectedIds.has(item.id)"
                  @change="toggleItem(item.id)" />
              </td>
              <td class="px-4 py-2.5 text-gray-600 text-xs">{{ item.phone_model || '—' }}</td>
              <td class="px-4 py-2.5 font-medium text-gray-800">{{ item.product_name }}</td>
              <td class="px-4 py-2.5">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="catColor(item.category)">{{ item.category }}</span>
              </td>
              <td class="px-4 py-2.5 text-right text-gray-500 text-xs">{{ item.purchase_price > 0 ? `₹${item.purchase_price}` : '—' }}</td>
              <td class="px-4 py-2.5 text-right text-gray-700 text-xs font-medium">{{ item.selling_price > 0 ? `₹${item.selling_price}` : '—' }}</td>
              <td class="px-4 py-2.5">
                <div class="flex items-center justify-center gap-2">
                  <button @click="adjust(item, -1)" class="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 flex items-center justify-center text-xs font-bold transition-colors">−</button>
                  <span class="w-8 text-center font-bold text-sm" :class="item.quantity <= item.min_quantity ? 'text-orange-600' : item.quantity === 0 ? 'text-red-600' : 'text-gray-900'">{{ item.quantity }}</span>
                  <button @click="adjust(item, +1)" class="w-6 h-6 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 text-gray-600 flex items-center justify-center text-xs font-bold transition-colors">+</button>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex gap-1.5">
                  <button @click="openEdit(item)" class="text-gray-300 hover:text-blue-500 text-xs"><i class="fas fa-pen"></i></button>
                  <button @click="remove(item)" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="items.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-400">
      No inventory items found. Add your first item to get started.
    </div>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-gray-900 text-lg">{{ modal.id ? 'Edit Item' : 'Add Stock Item' }}</h3>
            <button @click="modal = null" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="vmp-label">Product Name *</label>
              <input v-model="modal.product_name" type="text" class="vmp-input text-sm" placeholder="e.g. SLIM CASE, FLIP CASE, TEMPER" required />
            </div>
            <div>
              <label class="vmp-label">Category</label>
              <select v-model="modal.category" class="vmp-input text-sm">
                <option value="case">Case</option>
                <option value="temper">Temper Glass</option>
                <option value="pouch">Pouch</option>
                <option value="cable">Cable</option>
                <option value="charger">Charger</option>
                <option value="earphone">Earphone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="vmp-label">Phone Brand</label>
              <input v-model="modal.phone_brand" type="text" class="vmp-input text-sm" placeholder="e.g. iPhone, Samsung, Realme" list="brand-list" />
              <datalist id="brand-list">
                <option v-for="b in brandSummary" :key="b.phone_brand" :value="b.phone_brand" />
              </datalist>
            </div>
            <div>
              <label class="vmp-label">Phone Model</label>
              <input v-model="modal.phone_model" type="text" class="vmp-input text-sm" placeholder="e.g. 14 PLUS, A55, NORD CE 5" />
            </div>
            <div>
              <label class="vmp-label">Quantity</label>
              <input v-model.number="modal.quantity" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Low Stock Alert <span class="text-gray-400 font-normal">(min qty)</span></label>
              <input v-model.number="modal.min_quantity" type="number" min="0" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Purchase Price (₹)</label>
              <input v-model.number="modal.purchase_price" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Selling Price (₹)</label>
              <input v-model.number="modal.selling_price" type="number" min="0" step="0.01" class="vmp-input text-sm" />
            </div>
            <div class="sm:col-span-2">
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

    <!-- Print QR Modal -->
    <Teleport to="body">
      <div v-if="printModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print" @click.self="printModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 no-print">
            <div>
              <h3 class="font-heading font-bold text-gray-900 text-lg">Print QR Labels</h3>
              <p class="text-xs text-gray-400 mt-0.5">{{ selectedItems.length }} labels · 4 per row · A4 sheet</p>
            </div>
            <div class="flex gap-2">
              <button @click="printModal = false" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button @click="triggerPrint" class="btn-vmp flex items-center gap-2">
                <i class="fas fa-print"></i> Print
              </button>
            </div>
          </div>

          <!-- Label grid — this is what gets printed -->
          <div id="qr-print-area" class="p-6">
            <div v-if="generatingQr" class="text-center py-12 text-gray-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-3 block"></i>Generating QR codes…
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="item in selectedItems" :key="item.id"
                class="border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center print-label">
                <img v-if="qrDataUrls[item.id]" :src="qrDataUrls[item.id]" :alt="`QR for ${item.product_name}`"
                  class="w-24 h-24 object-contain" />
                <p class="font-bold text-gray-900 text-xs leading-tight mt-1">{{ item.product_name }}</p>
                <p class="text-gray-500 text-xs">{{ [item.phone_brand, item.phone_model].filter(Boolean).join(' · ') || '—' }}</p>
                <span class="text-xs px-1.5 py-0.5 rounded-full font-medium" :class="catColor(item.category)">{{ item.category }}</span>
                <p class="text-xs text-gray-400">Stock: <span class="font-semibold text-gray-700">{{ item.quantity }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })
const { get, post, put, patch, del } = useApi()
const { generateQrBatch } = useQrCode()

const items = ref<any[]>([])
const brandSummary = ref<any[]>([])
const search = ref('')
const filterCategory = ref('')
const filterBrand = ref('')
const showLowStock = ref(false)
const modal = ref<any>(null)
const saving = ref(false)
let debounceTimer: any = null

// ── QR selection ──────────────────────────────────────────────────────────────
const selectedIds = ref<Set<number>>(new Set())
const printModal = ref(false)
const generatingQr = ref(false)
const qrDataUrls = ref<Record<string, string>>({})

const selectedItems = computed(() =>
  items.value.filter(i => selectedIds.value.has(i.id))
)

function toggleItem(id: number) {
  const s = new Set(selectedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedIds.value = s
}

function isBrandAllSelected(group: any[]) {
  return group.length > 0 && group.every(i => selectedIds.value.has(i.id))
}

function isBrandPartialSelected(group: any[]) {
  return group.some(i => selectedIds.value.has(i.id)) && !isBrandAllSelected(group)
}

function toggleBrand(group: any[]) {
  const s = new Set(selectedIds.value)
  if (isBrandAllSelected(group)) {
    group.forEach(i => s.delete(i.id))
  } else {
    group.forEach(i => s.add(i.id))
  }
  selectedIds.value = s
}

async function openPrintModal() {
  printModal.value = true
  generatingQr.value = true
  qrDataUrls.value = await generateQrBatch(selectedItems.value, 192)
  generatingQr.value = false
}

function triggerPrint() {
  window.print()
}

// ── Inventory CRUD ─────────────────────────────────────────────────────────────
const totalQty = computed(() => items.value.reduce((s, i) => s + (i.quantity || 0), 0))
const lowStockCount = computed(() => items.value.filter(i => i.quantity <= i.min_quantity).length)

const groupedItems = computed(() => {
  const filtered = showLowStock.value ? items.value.filter(i => i.quantity <= i.min_quantity) : items.value
  return filtered.reduce((acc: Record<string, any[]>, item) => {
    const key = item.phone_brand || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
})

async function load() {
  const params: any = { limit: 1000 }
  if (search.value) params.search = search.value
  if (filterCategory.value) params.category = filterCategory.value
  if (filterBrand.value) params.brand = filterBrand.value
  const res = await get<any>('/inventory', params)
  items.value = res.rows
}

async function loadBrands() {
  brandSummary.value = await get<any[]>('/inventory/brands')
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
}

function openAdd() {
  modal.value = { product_name: '', category: 'case', phone_brand: '', phone_model: '', quantity: 0, min_quantity: 1, purchase_price: 0, selling_price: 0, notes: '' }
}

function openEdit(item: any) { modal.value = { ...item } }

async function save() {
  saving.value = true
  try {
    if (modal.value.id) await put(`/inventory/${modal.value.id}`, modal.value)
    else await post('/inventory', modal.value)
    modal.value = null
    await Promise.all([load(), loadBrands()])
  } finally { saving.value = false }
}

async function adjust(item: any, delta: number) {
  const updated = await patch<any>(`/inventory/${item.id}/adjust`, { delta })
  const idx = items.value.findIndex(i => i.id === item.id)
  if (idx !== -1) items.value[idx] = updated
}

async function remove(item: any) {
  if (!confirm(`Delete "${item.product_name}"?`)) return
  await del(`/inventory/${item.id}`)
  await Promise.all([load(), loadBrands()])
}

function catColor(c: string) {
  return { case: 'bg-blue-100 text-blue-700', temper: 'bg-purple-100 text-purple-700', pouch: 'bg-pink-100 text-pink-700', cable: 'bg-yellow-100 text-yellow-700', charger: 'bg-orange-100 text-orange-700', earphone: 'bg-green-100 text-green-700', other: 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
}

onMounted(() => Promise.all([load(), loadBrands()]))
</script>

<style scoped>
.vmp-label { @apply block text-xs font-semibold text-gray-600 mb-1; }

@media print {
  /* Hide everything except the QR print area */
  :global(body > *:not(#teleports)) { display: none !important; }
  :global(#teleports > *:not(:last-child)) { display: none !important; }
  .no-print { display: none !important; }
  #qr-print-area {
    display: block !important;
    padding: 0 !important;
  }
  .print-label {
    break-inside: avoid;
    border: 1px solid #ddd !important;
    page-break-inside: avoid;
  }
}
</style>
