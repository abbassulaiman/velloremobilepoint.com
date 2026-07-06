<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6 space-y-5">
    <!-- Header -->
    <div class="w-full max-w-md flex items-center justify-between">
      <NuxtLink to="/admin/inventory"
        class="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors">
        <i class="fas fa-arrow-left"></i> Inventory
      </NuxtLink>
      <h1 class="font-heading font-bold text-gray-900 text-lg">Scan QR</h1>
      <div class="w-16"></div>
    </div>

    <div class="w-full max-w-md space-y-4">

      <!-- ── Camera scanner ── -->
      <div v-if="!scannedItem" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 pt-5 pb-3 text-center">
          <p class="text-sm text-gray-500">Point your camera at a VMP inventory QR code</p>
        </div>

        <!-- Video viewfinder -->
        <div class="relative bg-black aspect-square mx-4 mb-4 rounded-xl overflow-hidden">
          <video ref="videoEl" class="w-full h-full object-cover" muted playsinline></video>
          <!-- Corner-bracket overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-52 h-52 relative">
              <span class="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></span>
              <span class="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></span>
              <span class="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></span>
              <span class="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-red-500 rounded-br-lg"></span>
              <!-- Scanning animation line -->
              <div v-if="scannerActive" class="absolute left-1 right-1 h-0.5 bg-red-400/80 scan-line"></div>
            </div>
          </div>
          <!-- Status badge -->
          <div class="absolute bottom-3 left-0 right-0 flex justify-center">
            <span v-if="scannerActive" class="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              <i class="fas fa-circle text-green-400 text-[8px] mr-1 animate-pulse"></i>Scanning…
            </span>
            <span v-else-if="scanError" class="bg-red-600/80 text-white text-xs px-3 py-1 rounded-full">
              <i class="fas fa-exclamation-triangle mr-1"></i>{{ scanError }}
            </span>
          </div>
        </div>

        <!-- Manual ID fallback -->
        <div class="px-4 pb-5 border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-400 text-center mb-2">or enter item ID manually</p>
          <div class="flex gap-2">
            <input v-model.number="manualId" type="number" min="1" placeholder="Item ID"
              class="vmp-input text-sm flex-1" @keyup.enter="loadByManualId" />
            <button @click="loadByManualId" class="btn-vmp px-4">Go</button>
          </div>
        </div>
      </div>

      <!-- ── Scanned item card ── -->
      <div v-if="scannedItem" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="catColor(scannedItem.category)">
                {{ scannedItem.category }}
              </span>
              <h2 class="font-heading font-bold text-gray-900 text-xl mt-1">{{ scannedItem.product_name }}</h2>
              <p class="text-gray-500 text-sm">
                {{ [scannedItem.phone_brand, scannedItem.phone_model].filter(Boolean).join(' · ') || 'No brand/model' }}
              </p>
            </div>
            <button @click="resetScan" class="text-gray-300 hover:text-gray-600 text-xl shrink-0 transition-colors mt-1">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Stock adjustment -->
        <div class="px-5 py-6 flex flex-col items-center gap-6">
          <div class="text-center">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Current Stock</p>
            <span class="text-7xl font-bold font-heading leading-none"
              :class="scannedItem.quantity === 0 ? 'text-red-600' : scannedItem.quantity <= scannedItem.min_quantity ? 'text-orange-500' : 'text-gray-900'">
              {{ scannedItem.quantity }}
            </span>
            <p v-if="scannedItem.quantity <= scannedItem.min_quantity && scannedItem.quantity > 0"
              class="text-xs text-orange-500 mt-2 font-medium">
              <i class="fas fa-triangle-exclamation mr-1"></i>Low stock (min: {{ scannedItem.min_quantity }})
            </p>
            <p v-if="scannedItem.quantity === 0" class="text-xs text-red-500 mt-2 font-medium">
              <i class="fas fa-times-circle mr-1"></i>Out of stock
            </p>
          </div>

          <div class="flex items-center gap-6">
            <button @click="adjustStock(-1)" :disabled="adjusting || scannedItem.quantity === 0"
              class="w-20 h-20 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 active:scale-95 flex items-center justify-center text-4xl font-bold transition-all disabled:opacity-40 shadow-sm">
              −
            </button>
            <div class="w-10 flex items-center justify-center">
              <i v-if="adjusting" class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
            </div>
            <button @click="adjustStock(+1)" :disabled="adjusting"
              class="w-20 h-20 rounded-2xl bg-green-100 text-green-600 hover:bg-green-200 active:scale-95 flex items-center justify-center text-4xl font-bold transition-all disabled:opacity-40 shadow-sm">
              +
            </button>
          </div>

          <!-- Bulk input -->
          <div class="w-full border-t border-gray-100 pt-4">
            <p class="text-xs text-gray-400 text-center mb-2">Bulk adjustment</p>
            <div class="flex gap-2">
              <button @click="adjustStock(-bulkQty)" :disabled="adjusting || bulkQty < 1"
                class="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-40 flex-1">
                −{{ bulkQty }}
              </button>
              <input v-model.number="bulkQty" type="number" min="1" max="999"
                class="vmp-input text-sm text-center w-20" />
              <button @click="adjustStock(+bulkQty)" :disabled="adjusting || bulkQty < 1"
                class="px-4 py-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 text-sm font-semibold transition-colors disabled:opacity-40 flex-1">
                +{{ bulkQty }}
              </button>
            </div>
          </div>
        </div>

        <!-- Toast -->
        <Transition name="toast">
          <div v-if="toast" class="mx-4 mb-4 p-3 rounded-xl text-sm font-medium text-center"
            :class="toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-1"></i>
            {{ toast.message }}
          </div>
        </Transition>

        <div class="px-4 pb-4">
          <button @click="resetScan"
            class="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <i class="fas fa-qrcode"></i> Scan Another Item
          </button>
        </div>
      </div>

      <!-- Price info -->
      <div v-if="scannedItem && Number(scannedItem.selling_price) > 0"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
        <span class="text-sm text-gray-500">Selling Price</span>
        <span class="font-bold text-gray-900 text-lg">₹{{ scannedItem.selling_price }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'admin', middleware: 'auth' })

const { get, patch } = useApi()
const route = useRoute()

const videoEl = ref<HTMLVideoElement | null>(null)
const scannedItem = ref<any>(null)
const adjusting = ref(false)
const scannerActive = ref(false)
const scanError = ref('')
const manualId = ref<number | null>(null)
const bulkQty = ref(1)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)

let scanner: any = null
let toastTimer: any = null

function catColor(c: string) {
  return ({
    case: 'bg-blue-100 text-blue-700',
    temper: 'bg-purple-100 text-purple-700',
    pouch: 'bg-pink-100 text-pink-700',
    cable: 'bg-yellow-100 text-yellow-700',
    charger: 'bg-orange-100 text-orange-700',
    earphone: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-600',
  } as Record<string, string>)[c] || 'bg-gray-100 text-gray-600'
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}

async function loadItem(id: number | string) {
  try {
    const item = await get<any>(`/inventory/${id}`)
    scannedItem.value = item
    await stopScanner()
  } catch {
    showToast('error', `Item #${id} not found.`)
  }
}

async function loadByManualId() {
  if (!manualId.value || manualId.value < 1) return
  await loadItem(manualId.value)
}

function extractIdFromText(text: string): string | null {
  // Handles full URL: http://host/admin/inventory/scan?id=123
  try {
    const url = new URL(text)
    const id = url.searchParams.get('id')
    if (id) return id
  } catch {}
  // Plain number fallback
  if (/^\d+$/.test(text.trim())) return text.trim()
  return null
}

async function startScanner() {
  if (typeof window === 'undefined' || !videoEl.value) return
  scanError.value = ''
  try {
    const QrScanner = (await import('qr-scanner')).default
    // Point to the worker file we copied into /public
    QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

    scanner = new QrScanner(
      videoEl.value,
      (result: any) => {
        const text = typeof result === 'string' ? result : result.data
        const id = extractIdFromText(text)
        if (id) {
          loadItem(id)
        } else {
          showToast('error', 'Not a valid VMP QR code.')
        }
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: false, // we draw our own overlay
        highlightCodeOutline: false,
        returnDetailedScanResult: true,
      },
    )
    await scanner.start()
    scannerActive.value = true
  } catch (err: any) {
    scannerActive.value = false
    if (err?.message?.toLowerCase().includes('permission')) {
      scanError.value = 'Camera denied — allow access and reload'
    } else {
      scanError.value = 'Camera unavailable — use manual ID below'
    }
  }
}

async function stopScanner() {
  if (scanner) {
    scanner.stop()
    scanner.destroy()
    scanner = null
  }
  scannerActive.value = false
}

async function adjustStock(delta: number) {
  if (!scannedItem.value || adjusting.value) return
  adjusting.value = true
  try {
    const updated = await patch<any>(`/inventory/${scannedItem.value.id}/adjust`, { delta })
    scannedItem.value = updated
    const dir = delta > 0 ? `Added ${delta}` : `Removed ${Math.abs(delta)}`
    showToast('success', `${dir} — stock now ${updated.quantity}`)
  } catch {
    showToast('error', 'Failed to update stock.')
  } finally {
    adjusting.value = false
  }
}

async function resetScan() {
  scannedItem.value = null
  manualId.value = null
  toast.value = null
  bulkQty.value = 1
  await nextTick()
  startScanner()
}

onMounted(async () => {
  const qrId = route.query.id
  if (qrId) {
    await loadItem(String(qrId))
  } else {
    await nextTick()
    startScanner()
  }
})

onBeforeUnmount(() => {
  stopScanner()
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }

@keyframes scan {
  0%   { top: 10%; }
  50%  { top: 85%; }
  100% { top: 10%; }
}
.scan-line {
  animation: scan 2s ease-in-out infinite;
}
</style>
