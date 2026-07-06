import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  // On SSR, localStorage isn't available — skip the check and let the client
  // handle auth redirect after hydration.
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.hydrate()

  if (!auth.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
