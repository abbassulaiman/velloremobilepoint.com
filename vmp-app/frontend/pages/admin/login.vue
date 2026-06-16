<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/img/logo/logo.png" alt="Vellore Mobile Point" class="h-16 w-auto mx-auto mb-4" />
        <h1 class="text-2xl font-heading font-bold text-gray-900">Vellore Mobile Point</h1>
        <p class="text-gray-500 text-sm mt-1">Admin Panel — Sign In</p>
      </div>

      <div class="bg-white rounded-3xl shadow-lg border-t-4 p-8" style="border-top-color: var(--vmp-red)">
        <form @submit.prevent="handleLogin" novalidate class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
            <input
              v-model="form.mobile"
              type="tel"
              maxlength="10"
              class="vmp-input"
              placeholder="Registered mobile number"
              autocomplete="username"
              :disabled="loading"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="vmp-input pr-12"
                placeholder="Enter password"
                autocomplete="current-password"
                :disabled="loading"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="showPass = !showPass">
                <i :class="`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`"></i>
              </button>
            </div>
          </div>
          <p v-if="error" class="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">{{ error }}</p>
          <button type="submit" :disabled="loading || !form.mobile || !form.password" class="btn-vmp w-full justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Signing in...</span>
            <span v-else><i class="fas fa-right-to-bracket"></i> Sign In</span>
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        <NuxtLink to="/" class="hover:text-gray-600 transition-colors">← Back to website</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const auth = useAuthStore()
const router = useRouter()

// Redirect if already logged in
onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated) router.replace('/admin')
})

const form = reactive({ mobile: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.mobile, form.password)
    router.push('/admin')
  } catch (err: any) {
    error.value = err?.message || 'Login failed. Check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
