<template>
  <div class="space-y-6">
    <!-- Settings -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 class="font-heading font-bold text-gray-900 mb-5 flex items-center gap-2">
        <i class="fas fa-sliders text-red-500"></i> Business Settings
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-for="(value, key) in settings" :key="key">
          <label class="vmp-label">{{ settingLabels[key] || key }}</label>
          <input v-model="settings[key]" type="text" class="vmp-input text-sm" />
        </div>
      </div>
      <button @click="saveSettings" :disabled="saving" class="btn-vmp mt-5 disabled:opacity-50">
        <i class="fas fa-save"></i> <span v-if="saving">Saving...</span><span v-else>Save Settings</span>
      </button>
      <p v-if="settingsSaved" class="text-green-600 text-sm mt-2"><i class="fas fa-check"></i> Settings saved.</p>
    </div>

    <!-- Services -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-heading font-bold text-gray-900 flex items-center gap-2">
          <i class="fas fa-wrench text-orange-500"></i> Services
        </h2>
        <button @click="showAddService = !showAddService" class="btn-vmp text-sm py-2 px-4">
          <i class="fas fa-plus"></i> Add Service
        </button>
      </div>

      <!-- Add Form -->
      <Transition name="fade">
        <div v-if="showAddService" class="bg-gray-50 rounded-xl p-5 mb-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="vmp-label">Service Name *</label>
              <input v-model="newService.name" type="text" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Icon (Font Awesome class)</label>
              <input v-model="newService.icon" type="text" class="vmp-input text-sm" placeholder="e.g. fa-mobile-alt" />
            </div>
            <div>
              <label class="vmp-label">Price Range</label>
              <input v-model="newService.price_range" type="text" class="vmp-input text-sm" placeholder="e.g. ₹500 – ₹8,000" />
            </div>
            <div>
              <label class="vmp-label">Sort Order</label>
              <input v-model.number="newService.sort_order" type="number" class="vmp-input text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="vmp-label">Description</label>
              <textarea v-model="newService.description" rows="2" class="vmp-input text-sm"></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="addService" :disabled="!newService.name || svcSaving" class="btn-vmp text-sm disabled:opacity-50">
              <span v-if="svcSaving">Saving...</span><span v-else>Save Service</span>
            </button>
            <button @click="showAddService = false" class="btn-vmp-outline text-sm">Cancel</button>
          </div>
        </div>
      </Transition>

      <!-- Services list -->
      <div class="space-y-3">
        <div v-for="svc in services" :key="svc.id" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm" style="background: var(--vmp-gradient)">
            <i :class="`fas ${svc.icon || 'fa-wrench'}`"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900">{{ svc.name }}</p>
            <p class="text-gray-400 text-xs">{{ svc.price_range }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="toggleActive(svc)"
              :class="['text-xs px-2.5 py-1 rounded-full font-medium transition-all', svc.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500']">
              {{ svc.active ? 'Active' : 'Hidden' }}
            </button>
            <button @click="deleteSvc(svc)" class="text-gray-300 hover:text-red-500 text-sm transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div v-if="services.length === 0" class="text-center py-8 text-gray-400 text-sm">No services yet.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'admin', middleware: ['auth', 'owner'] })

const { get, put, post, del } = useApi()

const settings = ref<Record<string, string>>({})
const services = ref<any[]>([])
const saving = ref(false)
const settingsSaved = ref(false)
const showAddService = ref(false)
const svcSaving = ref(false)

const settingLabels: Record<string, string> = {
  business_name: 'Business Name',
  address: 'Address',
  phone: 'Phone Number',
  whatsapp: 'WhatsApp Number (with country code, no +)',
  business_hours: 'Business Hours',
  founded_year: 'Founded Year',
  tagline: 'Tagline',
}

const newService = reactive({
  name: '', icon: 'fa-wrench', price_range: '', description: '', sort_order: 0
})

async function load() {
  const [sets, svcs] = await Promise.all([
    get<any>('/cms/settings'),
    get<any>('/cms/services'),
  ])
  settings.value = sets.settings
  services.value = svcs.services
}

async function saveSettings() {
  saving.value = true
  settingsSaved.value = false
  try {
    await put('/cms/settings', settings.value)
    settingsSaved.value = true
    setTimeout(() => { settingsSaved.value = false }, 3000)
  } finally {
    saving.value = false
  }
}

async function addService() {
  svcSaving.value = true
  try {
    const res = await post<any>('/cms/services', { ...newService })
    services.value.push(res.service)
    Object.assign(newService, { name: '', icon: 'fa-wrench', price_range: '', description: '', sort_order: 0 })
    showAddService.value = false
  } finally {
    svcSaving.value = false
  }
}

async function toggleActive(svc: any) {
  await put(`/cms/services/${svc.id}`, { active: !svc.active })
  svc.active = !svc.active
}

async function deleteSvc(svc: any) {
  if (!confirm(`Delete "${svc.name}"?`)) return
  await del(`/cms/services/${svc.id}`)
  services.value = services.value.filter(s => s.id !== svc.id)
}

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-sm font-semibold text-gray-700 mb-1.5; }
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
