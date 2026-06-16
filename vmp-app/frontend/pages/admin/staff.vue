<template>
  <div class="space-y-5">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-heading font-bold text-gray-900">Staff Management</h2>
        <button @click="showAdd = !showAdd" class="btn-vmp text-sm py-2 px-4">
          <i class="fas fa-plus"></i> Add Staff
        </button>
      </div>

      <!-- Add Staff Form -->
      <Transition name="fade">
        <div v-if="showAdd" class="bg-gray-50 rounded-xl p-5 mb-5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="vmp-label">Name *</label>
              <input v-model="newStaff.name" type="text" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Mobile (Login ID) *</label>
              <input v-model="newStaff.mobile" type="tel" maxlength="10" class="vmp-input text-sm" />
            </div>
            <div>
              <label class="vmp-label">Password *</label>
              <input v-model="newStaff.password" type="text" class="vmp-input text-sm" placeholder="Temporary password" />
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="addStaff" :disabled="!newStaff.name || !newStaff.mobile || !newStaff.password || adding" class="btn-vmp text-sm disabled:opacity-50">
              <span v-if="adding">Adding...</span><span v-else>Add Staff</span>
            </button>
            <button @click="showAdd = false" class="btn-vmp-outline text-sm">Cancel</button>
          </div>
          <p v-if="addError" class="text-red-500 text-sm mt-2">{{ addError }}</p>
        </div>
      </Transition>

      <!-- Users List -->
      <div class="space-y-3">
        <div v-for="u in users" :key="u.id" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: var(--vmp-gradient)">
            {{ u.name[0].toUpperCase() }}
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-900">{{ u.name }}</p>
            <p class="text-gray-400 text-xs">{{ u.mobile }} · <span class="capitalize">{{ u.role }}</span></p>
          </div>
          <div class="flex items-center gap-2">
            <span :class="['text-xs px-2.5 py-1 rounded-full font-medium', u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
              {{ u.active ? 'Active' : 'Inactive' }}
            </span>
            <button v-if="u.role === 'staff'" @click="toggleUserActive(u)"
              class="text-xs px-2.5 py-1 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors font-medium">
              {{ u.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
        <div v-if="users.length === 0" class="text-center py-8 text-gray-400 text-sm">No users found.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'admin', middleware: ['auth', 'owner'] })

const { get, post, put } = useApi()
const users = ref<any[]>([])
const showAdd = ref(false)
const adding = ref(false)
const addError = ref('')

const newStaff = reactive({ name: '', mobile: '', password: '' })

async function load() {
  const res = await get<any>('/auth/users')
  users.value = res.users
}

async function addStaff() {
  adding.value = true
  addError.value = ''
  try {
    await post('/auth/staff', { ...newStaff })
    Object.assign(newStaff, { name: '', mobile: '', password: '' })
    showAdd.value = false
    await load()
  } catch (err: any) {
    addError.value = err?.message || 'Failed to add staff.'
  } finally {
    adding.value = false
  }
}

async function toggleUserActive(u: any) {
  await put(`/auth/users/${u.id}`, { active: !u.active })
  u.active = !u.active
}

onMounted(load)
</script>

<style scoped>
.vmp-label { @apply block text-sm font-semibold text-gray-700 mb-1.5; }
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
