<template>
  <div>
    <!-- ── HERO ──────────────────────────────────────────── -->
    <section class="relative min-h-[88vh] flex items-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div class="absolute inset-0 opacity-20" style="background-image: url('/img/hero-bg.jpg'); background-size: cover; background-position: center;"></div>

      <!-- Slide cycling -->
      <div class="relative container mx-auto px-4 py-20 text-center w-full">
        <Transition name="hero-fade" mode="out-in">
          <div :key="activeSlide" data-aos="fade-up">
            <p class="sub-title text-red-400 mb-3">
              <span class="!text-white/70">{{ slides[activeSlide].tag }}</span>
            </p>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6" v-html="slides[activeSlide].heading"></h1>
            <p class="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
              {{ slides[activeSlide].sub }}
            </p>
            <div class="flex flex-wrap gap-4 justify-center">
              <NuxtLink :to="slides[activeSlide].cta1.to" class="btn-vmp text-base">
                <i :class="`fas ${slides[activeSlide].cta1.icon}`"></i> {{ slides[activeSlide].cta1.label }}
              </NuxtLink>
              <a
                v-if="slides[activeSlide].cta2.href"
                :href="slides[activeSlide].cta2.href"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-vmp-outline text-base border-white text-white hover:border-transparent"
              >
                <i :class="`fas ${slides[activeSlide].cta2.icon}`"></i> {{ slides[activeSlide].cta2.label }}
              </a>
              <NuxtLink
                v-else
                :to="slides[activeSlide].cta2.to"
                class="btn-vmp-outline text-base border-white text-white hover:border-transparent"
              >
                <i :class="`fas ${slides[activeSlide].cta2.icon}`"></i> {{ slides[activeSlide].cta2.label }}
              </NuxtLink>
            </div>
          </div>
        </Transition>

        <!-- Slide dots -->
        <div class="flex justify-center gap-2 mt-10">
          <button
            v-for="(_, i) in slides"
            :key="i"
            @click="activeSlide = i"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="i === activeSlide ? 'scale-125' : 'bg-white/30'"
            :style="i === activeSlide ? 'background: var(--vmp-gradient);' : ''"
          ></button>
        </div>

        <!-- Trust badges -->
        <div class="flex flex-wrap justify-center gap-6 mt-8">
          <div v-for="badge in badges" :key="badge.label" class="flex items-center gap-2 text-gray-300">
            <i :class="`fas ${badge.icon} text-red-400`"></i>
            <span class="text-sm">{{ badge.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── ABOUT MINI ─────────────────────────────────────── -->
    <section class="section-padding bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl">
          <div data-aos="fade-right">
            <p class="sub-title"><span>About Vellore Mobile Point</span></p>
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2 mb-5">
              Your Trusted Mobile<br>Partner in Vellore
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6 text-justify">
              With over <strong>15 years of experience</strong> in the mobile industry, Vellore Mobile Point (VMP) has been serving the people of Vellore with genuine products, affordable pricing, and expert repairs. From flagship smartphones to everyday accessories — we have it all.
            </p>
            <!-- Icon feature -->
            <div class="flex gap-4 items-start mb-5" data-aos="fade-up">
              <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl" style="background: #fff5f5;">
                <i class="fas fa-screwdriver-wrench text-xl" style="color: var(--vmp-red);"></i>
              </div>
              <div>
                <h4 class="font-heading font-bold text-gray-900 mb-1">Same-Day Repair Service</h4>
                <span class="text-gray-500 text-sm">Most repairs completed within 1–2 hours with genuine parts and warranty.</span>
              </div>
            </div>
            <!-- Checklist -->
            <ul class="space-y-2 mb-7">
              <li v-for="item in aboutChecklist" :key="item" class="flex items-center gap-2 text-gray-700 text-sm">
                <i class="fas fa-circle-check" style="color: var(--vmp-red);"></i> {{ item }}
              </li>
            </ul>
            <div class="flex flex-wrap items-center gap-5">
              <NuxtLink to="/about" class="btn-vmp">More About Us</NuxtLink>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--vmp-gradient);">
                  <i class="fas fa-phone text-white text-sm"></i>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Call to Expert</p>
                  <a href="tel:+919790599905" class="font-heading font-bold text-gray-900 hover:text-red-600 transition-colors">+91 97905 99905</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SERVICES ───────────────────────────────────────── -->
    <section class="section-padding bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-12 items-start">

          <!-- 4 service boxes -->
          <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              v-for="(svc, i) in serviceBoxes"
              :key="svc.title"
              class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              data-aos="fade-up"
              :data-aos-delay="i * 80"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background: linear-gradient(135deg,#fff0ef,#fff5f0);">
                <i :class="`fas ${svc.icon} text-xl`" style="color: var(--vmp-red);"></i>
              </div>
              <h3 class="font-heading font-bold text-gray-900 mb-2">
                <NuxtLink to="/service" class="hover:text-red-600 transition-colors">{{ svc.title }}</NuxtLink>
              </h3>
              <p class="text-gray-500 text-sm leading-relaxed text-justify">{{ svc.desc }}</p>
            </div>
          </div>

          <!-- Right: headline + trust points -->
          <div class="lg:col-span-3" data-aos="fade-left">
            <p class="sub-title"><span>Expert Repair Services</span></p>
            <h2 class="text-3xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Fast, Reliable &amp;<br>Affordable Repairs
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6 text-justify">
              Our expert technicians handle all types of mobile phone issues with precision. From basic screen repairs to complex motherboard fixes — we do it all with a service warranty.
            </p>
            <div class="space-y-4 mb-7">
              <div class="flex gap-3 items-start" data-aos="fade-up">
                <img src="/img/service/icon-1.png" alt="Genuine Parts" class="w-10 h-10 flex-shrink-0 mt-0.5 object-contain" />
                <div>
                  <h4 class="font-heading font-bold text-gray-900">Genuine Quality Parts</h4>
                  <span class="text-gray-500 text-sm">We use only quality-tested, durable replacement parts.</span>
                </div>
              </div>
              <div class="flex gap-3 items-start" data-aos="fade-up" data-aos-delay="80">
                <img src="/img/service/icon-2.png" alt="Service Warranty" class="w-10 h-10 flex-shrink-0 mt-0.5 object-contain" />
                <div>
                  <h4 class="font-heading font-bold text-gray-900">Service Warranty</h4>
                  <span class="text-gray-500 text-sm">All repairs come with warranty on parts and workmanship.</span>
                </div>
              </div>
            </div>
            <NuxtLink to="/service" class="btn-vmp" data-aos="fade-up">View All Services</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ───────────────────────────────────── -->
    <section class="section-padding bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
          <p class="sub-title"><span>How It Works</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Simple Steps to Get Your<br>Phone Repaired</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(step, i) in howItWorks"
            :key="step.title"
            class="text-center p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
            data-aos="fade-up"
            :data-aos-delay="i * 80"
          >
            <div class="w-16 h-16 mx-auto mb-4">
              <img :src="`/img/process-icon/0${i + 1}.svg`" :alt="step.title" class="w-full h-full object-contain" />
            </div>
            <h3 class="font-heading font-bold text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed text-justify">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FAQ ───────────────────────────────────────────── -->
    <section class="section-padding bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div class="relative rounded-3xl overflow-hidden shadow-xl h-80 lg:h-full min-h-64" data-aos="fade-right">
            <img src="/img/faq/faq.png" alt="VMP FAQ" class="w-full h-full object-cover rounded-3xl" />
          </div>
          <div data-aos="fade-left">
            <p class="sub-title"><span>Frequently Asked Questions</span></p>
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2 mb-6">Common Questions<br>About VMP</h2>
            <div class="space-y-3">
              <div
                v-for="(faq, i) in faqs"
                :key="i"
                class="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  @click="openFaq = openFaq === i ? null : i"
                  class="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:text-red-600 transition-colors"
                >
                  <span>{{ i + 1 }}. {{ faq.q }}</span>
                  <i :class="`fas fa-chevron-${openFaq === i ? 'up' : 'down'} text-sm ml-3 flex-shrink-0`" style="color: var(--vmp-red);"></i>
                </button>
                <div v-show="openFaq === i" class="px-5 pb-4 text-gray-500 text-sm leading-relaxed text-justify">
                  {{ faq.a }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── GOOGLE REVIEWS ─────────────────────────────────── -->
    <section class="section-padding bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12" data-aos="fade-up">
          <p class="sub-title"><span>What Our Customers Say</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Real Reviews from<br>Real Customers</h2>
          <a href="https://g.page/r/CUn_qR8kRnKTEBM/review" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 hover:shadow-md transition-shadow text-sm font-semibold text-gray-700">
            <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <strong>4.9 ★</strong> · Google Reviews
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(review, i) in reviews"
            :key="review.name"
            class="vmp-review-card"
            data-aos="fade-up"
            :data-aos-delay="i * 70"
          >
            <div class="vmp-review-stars">★★★★★</div>
            <p class="text-gray-600 text-sm leading-relaxed text-justify flex-1">"{{ review.text }}"</p>
            <div class="vmp-review-author">
              <div class="vmp-review-avatar">{{ review.initial }}</div>
              <div>
                <div class="vmp-review-name">{{ review.name }}</div>
                <div class="vmp-review-meta">{{ review.meta }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── INSTAGRAM ──────────────────────────────────────── -->
    <section class="section-padding bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-10" data-aos="fade-up">
          <p class="sub-title"><span>Follow Us on Instagram</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">@velloremobilepoint</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div v-for="post in instaPosts" :key="post" class="rounded-2xl overflow-hidden shadow-sm" data-aos="fade-up">
            <blockquote
              class="instagram-media w-full"
              :data-instgrm-permalink="`https://www.instagram.com/p/${post}/`"
              data-instgrm-version="14"
            ></blockquote>
          </div>
        </div>
        <div class="text-center mt-8" data-aos="fade-up">
          <a href="https://www.instagram.com/velloremobilepoint/" target="_blank" rel="noopener noreferrer" class="btn-vmp">
            <i class="fab fa-instagram"></i> Follow on Instagram
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────── -->
    <section class="section-padding text-white text-center" style="background: var(--vmp-gradient)">
      <div class="container mx-auto px-4" data-aos="zoom-in">
        <p class="sub-title"><span class="!text-white/70">Get Help Today</span></p>
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-white mt-2 mb-3">
          Is Your Phone Damaged?<br>We'll Fix It Fast!
        </h2>
        <div class="flex flex-wrap gap-4 justify-center mt-6">
          <NuxtLink to="/service#booking" class="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105" style="background:#fff; color:var(--vmp-red);">
            Book Repair Now
          </NuxtLink>
          <a href="tel:+919790599905" class="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105" style="background:#fff; color:var(--vmp-red);">
            <i class="fas fa-phone"></i> Call +91 97905 99905
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

useHead({ title: 'Vellore Mobile Point | Best Mobile Shop in Vellore — Sales, Repairs & Accessories' })

// Hero slides
const slides = [
  {
    tag: "Vellore's #1 Mobile Shop",
    heading: 'Smartphones, Accessories<br><span class="vmp-gradient-text">&amp; Expert Repairs</span>',
    sub: 'Your one-stop mobile shop in Vellore since 2012 — all top brands, same-day repairs, and premium accessories under one roof.',
    cta1: { label: 'Our Services', icon: 'fa-store', to: '/service' },
    cta2: { label: 'Find Us', icon: 'fa-map-pin', href: 'https://maps.google.com/?q=Vellore+Mobile+Point,+Sathuvachari,+Vellore' },
  },
  {
    tag: 'Same-Day Mobile Repairs',
    heading: 'Screen Crack? Battery Dead?<br><span class="vmp-gradient-text">We Fix It Fast</span>',
    sub: 'Trusted by 10,000+ customers for fast, affordable repairs with genuine parts and service warranty.',
    cta1: { label: 'Book a Repair', icon: 'fa-calendar-plus', to: '/service#booking' },
    cta2: { label: 'Call Now', icon: 'fa-phone', href: 'tel:+919790599905' },
  },
  {
    tag: 'Premium Mobile Accessories',
    heading: 'Cases, Chargers, Earphones<br><span class="vmp-gradient-text">&amp; Much More</span>',
    sub: 'Genuine accessories for all phone models — TWS earbuds, power banks, tempered glass, cables and more at fair prices.',
    cta1: { label: 'Visit Our Store', icon: 'fa-shop', to: '/contact' },
    cta2: { label: 'About VMP', icon: 'fa-info-circle', to: '/about' },
  },
]

const activeSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval>

onMounted(() => {
  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 4500)
  if (window.AOS) window.AOS.init({ once: true, duration: 450 })
  // Load Instagram embeds
  const s = document.createElement('script')
  s.src = 'https://www.instagram.com/embed.js'
  s.async = true
  document.body.appendChild(s)
})

onUnmounted(() => clearInterval(slideTimer))

const badges = [
  { icon: 'fa-mobile-screen', label: 'All Top Brands' },
  { icon: 'fa-bolt', label: 'Same-Day Repair' },
  { icon: 'fa-star', label: '4.9★ Rating' },
  { icon: 'fa-shield-halved', label: 'Service Warranty' },
  { icon: 'fa-users', label: '10,000+ Customers' },
]

const aboutChecklist = [
  'All Major Mobile Brands Available',
  'Certified & Experienced Technicians',
  'Genuine Accessories at Best Prices',
  'Free Device Consultation',
]

const serviceBoxes = [
  { icon: 'fa-mobile-screen', title: 'Screen Replacement', desc: 'Cracked or broken display? We replace screens for all major brands with original-quality parts, same day.' },
  { icon: 'fa-battery-full', title: 'Battery Replacement', desc: 'Battery draining fast? Get genuine battery replacement with quality assurance at competitive prices.' },
  { icon: 'fa-bag-shopping', title: 'Mobile Accessories', desc: 'Cases, chargers, earphones, screen guards, cables and premium accessories for all phone models.' },
  { icon: 'fa-screwdriver-wrench', title: 'All Repair Services', desc: 'Charging port, water damage, camera, speaker, back glass — complete mobile repair solutions.' },
]

const howItWorks = [
  { title: 'Visit or Call Us', desc: 'Walk into our Sathuvachari store or call +91 97905 99905 to describe your issue.' },
  { title: 'Free Device Check', desc: 'Our technician diagnoses your device for free and provides a transparent quote.' },
  { title: 'Expert Repair Done', desc: 'Trained technician completes the repair, usually within 1–2 hours using quality parts.' },
  { title: 'Collect with Warranty', desc: 'Pick up your device, fully repaired and tested, with service warranty included.' },
]

const openFaq = ref<number | null>(0)
const faqs = [
  { q: 'How long does a screen repair take?', a: 'Most screen replacements are completed within 30–60 minutes. Complex repairs may take 1–2 hours. We\'ll give you an exact time estimate after diagnosing your device.' },
  { q: 'Do you provide warranty on repairs?', a: 'Yes, all our repairs come with a service warranty. If the same issue reoccurs within the warranty period due to our repair, we fix it at no extra charge.' },
  { q: 'Which phone brands do you repair?', a: 'We repair all major brands including Apple iPhone, Samsung, Redmi, Realme, OnePlus, Vivo, OPPO, Motorola, Nokia, and more.' },
  { q: 'Do you sell both new and second-hand phones?', a: 'We primarily sell brand new phones from authorized distributors. We also have quality-checked refurbished phones available. Contact us for current stock.' },
]

const reviews = [
  { name: 'Kalairajan Nagarajan', initial: 'K', meta: 'Local Guide · 28 reviews · 8 months ago', text: 'Excellent mobile shop with a wide variety of phones & accessories. Shop owner was very knowledgeable and helped me choose the right accessories within my budget. Service was quick, and they also assisted with setting up my device. Highly recommended!' },
  { name: 'Divakar Divakar', initial: 'D', meta: '1 review · 6 months ago', text: 'The owner Vinoth is very friendly, polite, and always ready to help customers. The shop has a great collection of mobile accessories — from cases and chargers to earphones — all of excellent quality and at fair prices.' },
  { name: 'Yuvanesh Yuva', initial: 'Y', meta: '3 reviews · 6 months ago', text: 'Best service centre 👌 I came to fix my Samsung S21 FE display problem. He fixed it within one hour and charged less compared to the showroom. Absolutely brilliant!' },
  { name: 'Sarath K', initial: 'S', meta: '1 review · 8 months ago', text: 'VELLORE MOBILE POINT offers top-notch service and quality products. Vinoth Kumar goes above and beyond to assist customers. Friendly, professional, and trustworthy — highly recommended!' },
  { name: 'Appas S', initial: 'A', meta: '2 reviews · 20 photos · 1 month ago', text: 'All original accessories are available here at below official OG products cost. I replaced my Samsung S23 display. First class services. Will definitely visit again!' },
  { name: 'Bavicky Appu', initial: 'B', meta: '5 reviews · 5 months ago', text: 'This is a very nice shop to service your phones. All kinds of accessories are available. Special edition customised key chains also available! Thank you Vinoth sir ❤️' },
]

const instaPosts = ['DZO0jIiRS7G', 'DY2sXgzS218', 'DYqJMe7lGBv']
</script>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.hero-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.hero-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
