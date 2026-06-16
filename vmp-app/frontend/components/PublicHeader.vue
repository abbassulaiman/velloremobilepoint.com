<template>
  <header>
    <!-- Top bar -->
    <div class="hidden md:block text-white text-sm py-2.5" style="background: var(--vmp-gradient)">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-2">
            <i class="fas fa-map-marker-alt"></i> Sathuvachari, Vellore - 632009
          </span>
          <span class="flex items-center gap-2">
            <i class="fas fa-clock"></i> All Days: 9:30 AM – 9:30 PM
          </span>
        </div>
        <div class="flex items-center gap-4">
          <a :href="`tel:${settings.phone}`" class="flex items-center gap-2 hover:opacity-80">
            <i class="fas fa-phone"></i> {{ settings.phone }}
          </a>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <nav class="bg-white shadow-md sticky top-0 z-30">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center">
          <img src="/img/logo/logo.png" alt="Vellore Mobile Point" class="h-10 w-auto" />
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-8">
          <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link" :class="{ active: route.path === '/about' }">About</NuxtLink>
          <NuxtLink to="/service" class="nav-link" :class="{ active: route.path === '/service' }">Services</NuxtLink>
          <NuxtLink to="/contact" class="nav-link" :class="{ active: route.path === '/contact' }">Contact</NuxtLink>
          <NuxtLink to="/service#booking" class="btn-vmp text-sm py-2 px-5">
            <i class="fas fa-calendar-plus"></i> Book Repair
          </NuxtLink>
        </div>

        <!-- Mobile hamburger -->
        <button class="md:hidden text-gray-700 text-2xl" @click="menuOpen = !menuOpen">
          <i :class="menuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="menuOpen" class="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-1">
          <NuxtLink to="/" class="mobile-nav-link" @click="menuOpen = false">Home</NuxtLink>
          <NuxtLink to="/about" class="mobile-nav-link" @click="menuOpen = false">About</NuxtLink>
          <NuxtLink to="/service" class="mobile-nav-link" @click="menuOpen = false">Services</NuxtLink>
          <NuxtLink to="/contact" class="mobile-nav-link" @click="menuOpen = false">Contact</NuxtLink>
          <NuxtLink to="/service#booking" class="btn-vmp w-full justify-center mt-2" @click="menuOpen = false">
            <i class="fas fa-calendar-plus"></i> Book Repair
          </NuxtLink>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const settings = reactive({ phone: '+91 97905 99905' })

// Close menu on route change
watch(() => route.path, () => { menuOpen.value = false })
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 font-medium hover:text-red-600 transition-colors duration-200 relative pb-1;
}
.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200;
  background: var(--vmp-gradient);
}
.nav-link:hover::after, .nav-link.active::after {
  @apply w-full;
}
.nav-link.active {
  color: var(--vmp-red);
}
.mobile-nav-link {
  @apply block py-2.5 px-3 rounded-lg text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 transition-colors;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
