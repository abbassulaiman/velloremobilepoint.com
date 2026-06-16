<template>
  <div>
    <!-- Breadcrumb -->
    <PageBreadcrumb title="About Vellore Mobile Point" />

    <!-- ── ABOUT SECTION ──────────────────────────────────── -->
    <section class="section-padding bg-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          <!-- Left: Content -->
          <div data-aos="fade-right">
            <p class="sub-title"><span>About Vellore Mobile Point</span></p>
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2 mb-5">
              Vellore's Most Trusted Mobile Shop Since 2012
            </h2>
            <p class="text-gray-600 leading-relaxed mb-4 text-justify">
              What began in 2012 under a different name has grown into <strong>Vellore Mobile Point (VMP)</strong> — Vellore's go-to destination for smartphones, mobile accessories, and same-day phone repair services. With over <strong>15 years of combined experience</strong>, our team understands every mobile brand, model, and problem inside out.
            </p>
            <p class="text-gray-600 leading-relaxed mb-6 text-justify">
              Now officially registered as <strong>Vellore Mobile Point LLP (LLPIN: ACY-3014)</strong> with the Ministry of Corporate Affairs, we are committed to growing with trust and transparency — serving every customer in Vellore and the surrounding areas of Tamil Nadu.
            </p>

            <!-- Icon feature boxes -->
            <div class="space-y-5 mb-7">
              <div class="flex gap-4 items-start" data-aos="fade-up">
                <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl" style="background: #fff5f5;">
                  <i class="fas fa-shield-halved text-2xl" style="color: var(--vmp-red);"></i>
                </div>
                <div>
                  <h4 class="font-heading font-bold text-gray-900 mb-1">Genuine Products Only</h4>
                  <p class="text-gray-500 text-sm text-justify">We sell and use only 100% original spare parts and authentic accessories — no counterfeits, ever.</p>
                </div>
              </div>
              <div class="flex gap-4 items-start" data-aos="fade-up" data-aos-delay="80">
                <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl" style="background: #fff8f2;">
                  <i class="fas fa-clock text-2xl" style="color: var(--vmp-orange);"></i>
                </div>
                <div>
                  <h4 class="font-heading font-bold text-gray-900 mb-1">Same-Day Repair Service</h4>
                  <p class="text-gray-500 text-sm text-justify">Most repairs — screen replacement, battery, charging port — completed within the hour. Your time matters.</p>
                </div>
              </div>
            </div>

            <!-- Progress bars -->
            <div class="space-y-4 mb-8" data-aos="fade-up">
              <div v-for="bar in progressBars" :key="bar.label">
                <div class="flex justify-between text-sm font-semibold mb-1">
                  <span class="text-gray-700">{{ bar.label }}</span>
                  <span style="color: var(--vmp-red)">{{ bar.value }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full" :style="`width: ${bar.value}; background: var(--vmp-gradient);`"></div>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div class="flex flex-wrap items-center gap-5" data-aos="fade-up">
              <NuxtLink to="/service#booking" class="btn-vmp">Book a Repair</NuxtLink>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--vmp-gradient);">
                  <i class="fas fa-phone text-white text-sm"></i>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Call Our Expert</p>
                  <a href="tel:+919790599905" class="font-heading font-bold text-gray-900 hover:text-red-600 transition-colors">+91 97905 99905</a>
                </div>
              </div>
            </div>
          </div>

        <!-- Right: Stats + Company reg -->
          <div class="space-y-5" data-aos="fade-left">
            <div class="grid grid-cols-2 gap-5">
              <div v-for="stat in stats" :key="stat.label" class="vmp-stat-card" data-aos="fade-up" :data-aos-delay="stat.delay">
                <div class="num">{{ stat.value }}</div>
                <div class="lbl">{{ stat.label }}</div>
              </div>
            </div>

            <!-- Company Registration Card -->
            <div class="rounded-2xl p-6 border-2" style="background: #fff7f5; border-color: var(--vmp-red);" data-aos="fade-up" data-aos-delay="200">
              <h5 class="font-heading font-bold mb-4 flex items-center gap-2" style="color: var(--vmp-red);">
                <i class="fas fa-certificate"></i> Official Registration
              </h5>
              <table class="w-full text-sm">
                <tbody>
                  <tr v-for="row in regDetails" :key="row.label" class="border-b border-gray-100 last:border-0">
                    <td class="py-1.5 text-gray-500 w-36">{{ row.label }}</td>
                    <td class="py-1.5 font-semibold text-gray-800">
                      <span v-if="row.badge" class="inline-block px-2 py-0.5 rounded text-white text-xs" style="background: #19a553;">{{ row.value }}</span>
                      <span v-else>{{ row.value }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── JOURNEY / TIMELINE ──────────────────────────────── -->
    <section class="section-padding pt-0">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div class="lg:col-span-2" data-aos="fade-right">
            <p class="sub-title"><span>Our Journey</span></p>
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2 mb-5">
              15 Years of Mobile Excellence in Vellore
            </h2>
            <p class="text-gray-600 leading-relaxed text-justify">
              From a humble mobile accessories stall to Vellore's most recognised mobile shop — the journey of Vellore Mobile Point is built on trust, expertise, and a genuine passion for technology.
            </p>
          </div>
          <div class="lg:col-span-3" data-aos="fade-left">
            <div class="vmp-timeline">
              <div v-for="(item, i) in timeline" :key="i" class="vmp-timeline-item">
                <h5>{{ item.year }}</h5>
                <p class="text-gray-600 text-sm leading-relaxed text-justify" v-html="item.desc"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SERVICES OVERVIEW ──────────────────────────────── -->
    <section class="section-padding pt-0 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-12 items-start">

          <!-- Service boxes (4 boxes) -->
          <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              v-for="(svc, i) in serviceBoxes"
              :key="svc.title"
              class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              data-aos="fade-up"
              :data-aos-delay="i * 80"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background: linear-gradient(135deg, #fff0ef, #fff5f0);">
                <i :class="`fas ${svc.icon} text-xl`" style="color: var(--vmp-red);"></i>
              </div>
              <h3 class="font-heading font-bold text-gray-900 mb-2">
                <NuxtLink :to="svc.to" class="hover:text-red-600 transition-colors">{{ svc.title }}</NuxtLink>
              </h3>
              <p class="text-gray-500 text-sm leading-relaxed text-justify">{{ svc.desc }}</p>
            </div>
          </div>

          <!-- Why choose VMP -->
          <div class="lg:col-span-3" data-aos="fade-left">
            <p class="sub-title"><span>Why Choose VMP?</span></p>
            <h2 class="text-3xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Fast, Honest &amp; Expert Mobile Service
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6 text-justify">
              At Vellore Mobile Point, we don't just fix phones — we build lasting relationships with our customers. Our experts are trained on all major brands, and we use only genuine parts. Every repair comes with honest pricing and no hidden charges.
            </p>
            <div class="space-y-4 mb-7">
              <div class="flex gap-3 items-start" data-aos="fade-up">
                <i class="fas fa-circle-check text-2xl flex-shrink-0 mt-0.5" style="color: var(--vmp-red);"></i>
                <div>
                  <h4 class="font-heading font-bold text-gray-900">Transparent Pricing</h4>
                  <span class="text-gray-500 text-sm">No hidden charges — we quote before we fix</span>
                </div>
              </div>
              <div class="flex gap-3 items-start" data-aos="fade-up" data-aos-delay="80">
                <i class="fas fa-star text-2xl flex-shrink-0 mt-0.5" style="color: var(--vmp-orange);"></i>
                <div>
                  <h4 class="font-heading font-bold text-gray-900">5-Star Rated in Vellore</h4>
                  <span class="text-gray-500 text-sm">18+ Google reviews with consistent 5-star ratings</span>
                </div>
              </div>
            </div>
            <NuxtLink to="/contact" class="btn-vmp" data-aos="fade-up">Get in Touch</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── LEADERSHIP TEAM ──────────────────────────────────── -->
    <section class="section-padding">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12" data-aos="fade-up">
          <p class="sub-title"><span>The People Behind VMP</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Meet Our Designated Partners</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div v-for="(member, i) in partners" :key="member.name" class="vmp-team-card" data-aos="fade-up" :data-aos-delay="i * 80">
            <div class="vmp-team-avatar">
              <div class="vmp-team-icon">
                <i class="fas fa-user text-4xl text-white"></i>
              </div>
            </div>
            <div class="vmp-team-body">
              <h4>{{ member.name }}</h4>
              <span>{{ member.role }}</span>
              <p class="mt-2 text-gray-500 text-sm">{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── VMP BRAND COMING SOON ──────────────────────────── -->
    <section class="section-padding pt-0" id="vmp-brand">
      <div class="container mx-auto px-4">
        <div class="vmp-brand-section" data-aos="fade-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div class="lg:col-span-2">
              <h2>VMP Brand — Coming Soon</h2>
              <p class="mt-3 text-justify">
                We are preparing to launch our own line of <strong>VMP-branded electronic products and accessories</strong> — designed with quality, tested by experts, and priced honestly for the Indian market. From earbuds and chargers to power banks and protective gear — every product will carry the trust of 15+ years of mobile expertise.
              </p>
              <div class="flex flex-wrap gap-3 mt-6">
                <a href="https://api.whatsapp.com/send/?phone=919790599905&text=Hello%20VMP!%20I%20am%20interested%20in%20VMP%20Brand%20products." target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold bg-white transition-all hover:scale-105" style="color: var(--vmp-red);">
                  <i class="fab fa-whatsapp"></i> Get Notified
                </a>
                <a href="https://www.instagram.com/velloremobilepoint/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold border-2 border-white text-white transition-all hover:bg-white" style="hover:color: var(--vmp-red);">
                  <i class="fab fa-instagram"></i> Follow for Updates
                </a>
              </div>
            </div>
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 border-4 border-white/40">
                <i class="fas fa-mobile-screen text-white text-5xl"></i>
              </div>
              <p class="text-white/80 text-sm mt-3 font-semibold">Vellore Mobile Point LLP</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── GOOGLE REVIEWS ─────────────────────────────────── -->
    <section class="section-padding pt-0 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12" data-aos="fade-up">
          <p class="sub-title"><span>What Vellore Says About Us</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Real Google Reviews from Our Customers</h2>
          <p class="mt-2 text-gray-500">
            Rated <a href="https://g.page/r/CUn_qR8kRnKTEBM/review" target="_blank" class="font-bold hover:underline" style="color: var(--vmp-orange);">4.9 ★</a> by customers in Vellore, Tamil Nadu
          </p>
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
        <div class="text-center mt-10" data-aos="fade-up">
          <a href="https://maps.google.com/?q=Vellore+Mobile+Point" target="_blank" rel="noopener noreferrer" class="btn-vmp">
            <i class="fab fa-google"></i> See All Reviews on Google
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────── -->
    <section class="section-padding text-white text-center" style="background: var(--vmp-gradient);">
      <div class="container mx-auto px-4" data-aos="zoom-in">
        <p class="sub-title text-red-200"><span class="!text-white/80">Get Help Today</span></p>
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-white mt-2 mb-3">
          Is Your Phone Damaged?<br>We'll Fix It Fast!
        </h2>
        <div class="flex flex-wrap gap-4 justify-center mt-6">
          <NuxtLink to="/service#booking" class="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105" style="background: #fff; color: var(--vmp-red);">
            Book Repair Now
          </NuxtLink>
          <a href="tel:+919790599905" class="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105" style="background: #fff; color: var(--vmp-red);">
            <i class="fas fa-phone"></i> Call +91 97905 99905
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'About Us — Vellore Mobile Point' })

const progressBars = [
  { label: 'Customer Satisfaction', value: '98%' },
  { label: 'Genuine Parts Used', value: '100%' },
  { label: 'Same-Day Repair Success', value: '95%' },
]

const stats = [
  { value: '15+', label: 'Years of Experience', delay: 80 },
  { value: '10,000+', label: 'Happy Customers', delay: 100 },
  { value: '50+', label: 'Brands Serviced', delay: 150 },
  { value: '1 Hr', label: 'Avg. Repair Time', delay: 80 },
]

const regDetails = [
  { label: 'Company Name', value: 'Vellore Mobile Point LLP' },
  { label: 'LLPIN', value: 'ACY-3014' },
  { label: 'Incorporated', value: '16 May 2026' },
  { label: 'ROC', value: 'ROC Chennai' },
  { label: 'Status', value: 'Active', badge: true },
  { label: 'Activity', value: 'Wholesale of Mobile & Communications Equipment' },
]

const timeline = [
  { year: '2012 — The Beginning', desc: 'Started operations in Vellore under a different name, selling mobile accessories and providing basic phone repair services. Our commitment to quality and honesty quickly built a loyal local customer base.' },
  { year: '2015 — Expanded to Full Mobile Sales', desc: 'Extended to full smartphone sales — covering Samsung, Redmi, Vivo, Realme, and more. Became a one-stop destination for mobile needs in Sathuvachari, Vellore.' },
  { year: '2019 — Advanced Repair Centre', desc: 'Upgraded to a professional repair centre offering same-day screen replacement, battery replacement, motherboard-level repairs, and water damage service for all major brands including iPhone and Samsung.' },
  { year: '2024 — Rebranded as Vellore Mobile Point (VMP)', desc: 'Officially rebranded as <strong>Vellore Mobile Point</strong> with a bold new identity to reflect our growth and vision. Launched social media presence and expanded our digital reach across Tamil Nadu.' },
  { year: '2026 — Registered as LLP & VMP Brand Launch', desc: 'Officially registered as <strong>Vellore Mobile Point LLP (LLPIN: ACY-3014)</strong> with ROC Chennai. Preparing to launch our own <strong>VMP Brand</strong> — a line of quality electronic accessories manufactured and branded exclusively by us.' },
]

const serviceBoxes = [
  { icon: 'fa-mobile-screen', title: 'Mobile Sales', to: '/service#sales', desc: 'Latest smartphones from Samsung, Redmi, Realme, Vivo, OnePlus, iPhone and more — at the best prices in Vellore.' },
  { icon: 'fa-screwdriver-wrench', title: 'Phone Repair', to: '/service#repairs', desc: 'Expert same-day repair for screen replacement, battery, charging port, water damage and more — all brands.' },
  { icon: 'fa-headphones', title: 'Accessories', to: '/service#accessories', desc: 'Earphones, TWS earbuds, chargers, power banks, tempered glass, covers, cables — genuine products at fair prices.' },
  { icon: 'fa-tag', title: 'VMP Brand (Coming Soon)', to: '#vmp-brand', desc: 'Our own line of quality electronic accessories — exclusively designed and branded by Vellore Mobile Point.' },
]

const partners = [
  { name: 'Vinothkumar', role: 'Designated Partner', bio: 'DIN: 11724060 · The driving force behind VMP — known for exceptional customer care and deep mobile expertise. Customers call him Vinoth sir.' },
  { name: 'Jayakumar', role: 'Designated Partner', bio: 'DIN: 11724061 · Appointed 16 May 2026. Brings strong business operations expertise to Vellore Mobile Point LLP.' },
]

const reviews = [
  { name: 'Kalairajan Nagarajan', initial: 'K', meta: 'Local Guide · 28 reviews · 8 months ago', text: 'Excellent mobile shop with a wide variety of phones & accessories. Shop owner was very knowledgeable and helped me choose the right accessories within my budget. Service was quick, and they also assisted with setting up my device. Highly recommended!' },
  { name: 'Divakar Divakar', initial: 'D', meta: '1 review · 6 months ago', text: 'The owner, Vinoth, is very friendly, polite, and always ready to help customers find exactly what they need. The shop has a great collection of mobile accessories — from cases and chargers to earphones — all of excellent quality and at fair prices.' },
  { name: 'Yuvanesh Yuva', initial: 'Y', meta: '3 reviews · 6 months ago', text: 'Best service centre 👌 I came to this shop to fix my Samsung S21 FE for a display problem. He fixed it within one hour and charged less compared to the showroom. Absolutely brilliant!' },
  { name: 'Sarath K', initial: 'S', meta: '1 review · 8 months ago', text: 'VELLORE MOBILE POINT offers top-notch service and quality products. Vinoth Kumar goes above and beyond to assist customers. Friendly, professional, and trustworthy — highly recommended!' },
  { name: 'Appas S', initial: 'A', meta: '2 reviews · 20 photos · 1 month ago', text: 'All original accessories are available here at below official OG products cost. I replaced my Samsung S23 display. First class services. Will definitely visit again!' },
  { name: 'Bavicky Appu', initial: 'B', meta: '5 reviews · 5 months ago', text: 'I this is very nice shop to service your phones. All kinds of accessories are available. Please visit this shop — thank you Vinoth sir for your service ❤️ Special edition customised key chains are also available!' },
]

onMounted(() => {
  if (window.AOS) window.AOS.init({ once: true, duration: 450 })
})
</script>
