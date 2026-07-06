import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  mobile: string
  role: 'owner' | 'staff'
  active: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isOwner: (state) => state.user?.role === 'owner',
    isStaff: (state) => state.user?.role === 'staff',
  },

  actions: {
    async login(mobile: string, password: string) {
      const config = useRuntimeConfig()
      const { data, error } = await useFetch<{ token: string; user: User }>('/auth/login', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { mobile, password },
      })
      if (error.value) throw new Error(error.value.data?.message || 'Login failed.')
      if (data.value) {
        this.token = data.value.token
        this.user = data.value.user
        if (import.meta.client) {
          localStorage.setItem('vmp_token', data.value.token)
          localStorage.setItem('vmp_user', JSON.stringify(data.value.user))
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('vmp_token')
        localStorage.removeItem('vmp_user')
      }
      navigateTo('/admin/login')
    },

    hydrate() {
      if (import.meta.client) {
        const token = localStorage.getItem('vmp_token')
        const user = localStorage.getItem('vmp_user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
        }
      }
    },
  },
})
