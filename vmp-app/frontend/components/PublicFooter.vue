<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <!-- Brand -->
      <div>
        <img src="/img/logo/logo.png" alt="Vellore Mobile Point" class="h-10 w-auto mb-3" />
        <p class="text-sm leading-relaxed">
          Your trusted mobile shop in Vellore since 2012. Sales, same-day repairs, and all mobile accessories at Sathuvachari, Vellore.
        </p>
        <div class="flex gap-3 mt-5">
          <a v-for="s in socials" :key="s.icon" :href="s.href" target="_blank" rel="noopener" class="social-btn">
            <i :class="`fab ${s.icon}`"></i>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h4 class="text-white font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2 text-sm">
          <li v-for="link in links" :key="link.to">
            <NuxtLink :to="link.to" class="hover:text-red-400 transition-colors flex items-center gap-2">
              <i class="fas fa-chevron-right text-xs text-red-500"></i> {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Services -->
      <div>
        <h4 class="text-white font-semibold mb-4">Services</h4>
        <ul class="space-y-2 text-sm">
          <li v-for="svc in services" :key="svc" class="flex items-center gap-2">
            <i class="fas fa-wrench text-xs text-red-500"></i> {{ svc }}
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="text-white font-semibold mb-4">Contact Us</h4>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start gap-3">
            <i class="fas fa-map-marker-alt mt-0.5 text-red-500"></i>
            <span>Sathuvachari Falls Trial, Phase 2, Sathuvachari, Vellore, Tamil Nadu 632009</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-clock text-red-500"></i>
            <span>All Days: 9:30 AM – 9:30 PM</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-phone text-red-500"></i>
            <a href="tel:+919876543210" class="hover:text-red-400 transition-colors">+91 97905 99905</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-800 py-5 text-center text-sm text-gray-500">
      © {{ year }} Vellore Mobile Point. All rights reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const socials = [
  { icon: 'fa-facebook-f', href: 'https://www.facebook.com/velloremobilepoint' },
  { icon: 'fa-instagram', href: 'https://www.instagram.com/velloremobilepoint/' },
  { icon: 'fa-whatsapp', href: 'https://wa.me/919790599905' },
  { icon: 'fa-youtube', href: 'https://www.youtube.com/@velloremobilepoint' },
]

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/service', label: 'Services' },
  { to: '/contact', label: 'Contact' },
  { to: '/service#booking', label: 'Book a Repair' },
]

const services = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Repair',
  'Water Damage Repair',
  'Software & Flashing',
  'Camera Repair',
]
</script>

<style scoped>
.social-btn {
  @apply w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110;
}
.social-btn:hover {
  background: var(--vmp-gradient);
}
</style>
