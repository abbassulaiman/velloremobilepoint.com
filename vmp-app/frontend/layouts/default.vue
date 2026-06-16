<template>
  <div>
    <PublicHeader />
    <main>
      <slot />
    </main>
    <PublicFooter />
    <a
      :href="`https://wa.me/${config.public.ownerWhatsapp}?text=${encodeURIComponent('I need help')}`"
      target="_blank"
      rel="noopener noreferrer"
      class="vmp-whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <i class="fab fa-whatsapp"></i>
    </a>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
