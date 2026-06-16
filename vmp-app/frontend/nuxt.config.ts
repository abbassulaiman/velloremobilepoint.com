export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    port: 9100,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    // Server-only
    jwtSecret: process.env.JWT_SECRET,
    // Public
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:9200/api',
      ownerWhatsapp: process.env.OWNER_WHATSAPP || '919790599905',
    },
  },

  app: {
    head: {
      title: 'Vellore Mobile Point',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Vellore\'s trusted mobile repair experts since 2012. Screen replacement, battery, water damage & more.' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css' },
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js', defer: true },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            'vmp-red': '#e70302',
            'vmp-orange': '#fc6906',
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            heading: ['Poppins', 'sans-serif'],
          },
        },
      },
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
})
