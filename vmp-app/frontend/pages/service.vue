<template>
  <div>
    <PageBreadcrumb title="Our Services" />

    <!-- Services Grid -->
    <section class="section-padding bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
          <p class="sub-title"><span>What We Repair</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Complete Repair Services</h2>
          <p class="text-gray-500 mt-3 max-w-xl mx-auto">We repair all major smartphone brands with genuine parts and a 90-day warranty.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            v-for="(svc, i) in services"
            :key="svc.name"
            v-bind="svc"
            :data-aos="'fade-up'"
            :data-aos-delay="i * 70"
          />
        </div>
      </div>
    </section>

    <!-- Brands -->
    <section class="section-padding bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-10" data-aos="fade-up">
          <p class="sub-title"><span>Brands We Service</span></p>
          <h2 class="text-2xl md:text-3xl font-heading font-bold text-gray-900 mt-2">All Major Brands</h2>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <span
            v-for="(brand, i) in brands"
            :key="brand"
            class="px-5 py-2.5 bg-white rounded-full border border-gray-200 text-gray-700 font-medium text-sm shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200"
            :data-aos="'fade-up'"
            :data-aos-delay="i * 40"
          >
            {{ brand }}
          </span>
        </div>
      </div>
    </section>

    <!-- Booking Form -->
    <section id="booking" class="section-padding bg-white">
      <div class="container mx-auto px-4 max-w-2xl">
        <div class="text-center mb-10" data-aos="fade-up">
          <p class="sub-title"><span>Book Online</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2">Book a Repair</h2>
          <p class="text-gray-500 mt-3">Fill the form and we'll confirm via WhatsApp with a verification code.</p>
        </div>

        <!-- OTP Step: 1 = form, 2 = otp verify, 3 = success -->
        <div class="bg-white rounded-3xl shadow-lg border-t-4 p-8 md:p-10" style="border-top-color: var(--vmp-red)" data-aos="fade-up">
          <!-- Step 1: Booking Form -->
          <form v-if="step === 1" @submit.prevent="submitBooking" novalidate>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2">
                <label class="vmp-label">Full Name *</label>
                <input v-model="form.customer_name" type="text" class="vmp-input" :class="getFieldClass('customer_name')" placeholder="Your name" @blur="touch('customer_name')" />
                <p v-if="errors.customer_name" class="vmp-error">{{ errors.customer_name }}</p>
              </div>
              <div>
                <label class="vmp-label">Mobile Number *</label>
                <input v-model="form.mobile" type="tel" maxlength="10" class="vmp-input" :class="getFieldClass('mobile')" placeholder="10-digit mobile" @blur="touch('mobile')" />
                <p v-if="errors.mobile" class="vmp-error">{{ errors.mobile }}</p>
              </div>
              <div>
                <label class="vmp-label">Device Brand *</label>
                <select v-model="form.device_brand" class="vmp-input" :class="getFieldClass('device_brand')" @blur="touch('device_brand')">
                  <option value="">Select brand</option>
                  <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
                  <option value="Other">Other</option>
                </select>
                <p v-if="errors.device_brand" class="vmp-error">{{ errors.device_brand }}</p>
              </div>
              <div>
                <label class="vmp-label">Device Model</label>
                <input v-model="form.device_model" type="text" class="vmp-input" placeholder="e.g. Galaxy S23, iPhone 15" />
              </div>
              <div>
                <label class="vmp-label">Service Type *</label>
                <select v-model="form.service_type" class="vmp-input" :class="getFieldClass('service_type')" @change="onServiceTypeChange" @blur="touch('service_type')">
                  <option value="">Select service</option>
                  <option v-for="svc in serviceTypes" :key="svc" :value="svc">{{ svc }}</option>
                  <option value="Other / Not Listed">Other / Not Listed</option>
                </select>
                <p v-if="errors.service_type" class="vmp-error">{{ errors.service_type }}</p>
              </div>
              <Transition name="fade">
                <div v-if="showServiceOther">
                  <label class="vmp-label">Please Specify *</label>
                  <input v-model="form.service_other" type="text" class="vmp-input" placeholder="Describe the service needed" />
                </div>
              </Transition>
              <div class="md:col-span-2">
                <label class="vmp-label">Issue Description</label>
                <textarea v-model="form.issue_description" rows="3" class="vmp-input" placeholder="Describe the problem in detail..."></textarea>
              </div>
            </div>
            <button type="submit" :disabled="!isFormValid || loading" class="btn-vmp w-full mt-6 justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Submitting...</span>
              <span v-else><i class="fab fa-whatsapp"></i> Book & Get OTP on WhatsApp</span>
            </button>
          </form>

          <!-- Step 2: OTP Verification -->
          <div v-else-if="step === 2" class="text-center">
            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <i class="fab fa-whatsapp text-3xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-heading font-bold text-gray-900 mb-2">Check Your WhatsApp</h3>
            <p class="text-gray-500 mb-6">We sent a 6-digit OTP to <span class="font-semibold text-gray-800">{{ form.mobile }}</span>. Enter it below to confirm your booking.</p>
            <div class="max-w-xs mx-auto space-y-4">
              <input v-model="otp" type="text" maxlength="6" class="vmp-input text-center text-2xl tracking-[0.5em] font-bold" placeholder="000000" />
              <button @click="verifyOtp" :disabled="otp.length < 6 || loading" class="btn-vmp w-full justify-center disabled:opacity-50">
                <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Verifying...</span>
                <span v-else><i class="fas fa-check-circle"></i> Confirm Booking</span>
              </button>
              <p v-if="otpError" class="text-red-500 text-sm">{{ otpError }}</p>
              <button @click="step = 1" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to form</button>
            </div>
          </div>

          <!-- Step 3: Success -->
          <div v-else class="text-center py-4">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: var(--vmp-gradient)">
              <i class="fas fa-check text-white text-3xl"></i>
            </div>
            <h3 class="text-2xl font-heading font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p class="text-gray-500 mb-2">Hi <strong>{{ form.customer_name }}</strong>, your repair booking has been confirmed.</p>
            <p class="text-gray-400 text-sm mb-6">Our team will contact you on <strong>{{ form.mobile }}</strong> shortly.</p>
            <NuxtLink to="/" class="btn-vmp inline-flex">
              <i class="fas fa-house"></i> Back to Home
            </NuxtLink>
          </div>

          <p v-if="apiError" class="mt-4 text-red-500 text-sm text-center">{{ apiError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Services — Vellore Mobile Point' })

const { post } = useApi()

const step = ref(1)
const loading = ref(false)
const apiError = ref('')
const otpError = ref('')
const otp = ref('')
const bookingId = ref<number | null>(null)
const touched = ref<Set<string>>(new Set())

const form = reactive({
  customer_name: '',
  mobile: '',
  device_brand: '',
  device_model: '',
  service_type: '',
  service_other: '',
  issue_description: '',
})

const showServiceOther = computed(() => form.service_type === 'Other / Not Listed')

function onServiceTypeChange() {
  if (!showServiceOther.value) form.service_other = ''
}

function touch(field: string) {
  touched.value.add(field)
}

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (touched.value.has('customer_name') && form.customer_name.trim().length < 2)
    e.customer_name = 'Name must be at least 2 characters.'
  if (touched.value.has('mobile') && !/^\d{10}$/.test(form.mobile))
    e.mobile = 'Enter a valid 10-digit mobile number.'
  if (touched.value.has('device_brand') && !form.device_brand)
    e.device_brand = 'Please select a brand.'
  if (touched.value.has('service_type') && !form.service_type)
    e.service_type = 'Please select a service type.'
  return e
})

const isFormValid = computed(() =>
  form.customer_name.trim().length >= 2 &&
  /^\d{10}$/.test(form.mobile) &&
  form.device_brand &&
  form.service_type &&
  (!showServiceOther.value || form.service_other.trim().length >= 3)
)

function getFieldClass(field: string) {
  if (!touched.value.has(field)) return ''
  return errors.value[field] ? 'is-invalid' : 'is-valid'
}

async function submitBooking() {
  ['customer_name', 'mobile', 'device_brand', 'service_type'].forEach(f => touch(f))
  if (!isFormValid.value) return

  loading.value = true
  apiError.value = ''
  try {
    const res = await post<{ bookingId: number }>('/bookings', form)
    bookingId.value = res.bookingId
    step.value = 2
  } catch (err: any) {
    apiError.value = err?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

async function verifyOtp() {
  loading.value = true
  otpError.value = ''
  try {
    await post('/bookings/verify-otp', { bookingId: bookingId.value, otp: otp.value })
    step.value = 3
  } catch (err: any) {
    otpError.value = err?.message || 'Invalid OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const { get } = useApi()

const services = ref<any[]>([])

const serviceTypes = [
  'Screen Replacement', 'Battery Replacement', 'Charging Port Repair',
  'Water Damage Repair', 'Software & Flashing', 'Camera Repair',
  'Speaker/Mic Repair', 'Back Panel Replacement', 'Data Recovery',
]

const brands = ['Samsung', 'Apple (iPhone)', 'OnePlus', 'Vivo', 'OPPO', 'Realme', 'Xiaomi / Redmi', 'Motorola', 'Nokia', 'iQOO', 'Poco', 'Nothing']

onMounted(async () => {
  if (window.AOS) window.AOS.init({ once: true, duration: 450 })
  try {
    const res = await get<any>('/cms/services')
    services.value = res.services
      .filter((s: any) => s.active)
      .map((s: any) => ({
        name: s.name,
        icon: s.icon,
        description: s.description,
        price: s.price_range,
      }))
  } catch {
    // fallback to static list if API unavailable
    services.value = [
      { name: 'Screen Replacement', icon: 'fa-mobile-alt', description: 'Original & compatible screens for all brands.', price: '₹500 – ₹8,000' },
      { name: 'Battery Replacement', icon: 'fa-battery-full', description: 'Restore battery life with genuine replacements.', price: '₹300 – ₹1,500' },
      { name: 'Charging Port Repair', icon: 'fa-plug', description: 'USB-C, micro-USB and Lightning port fixes.', price: '₹200 – ₹800' },
      { name: 'Water Damage Repair', icon: 'fa-tint', description: 'Board-level cleaning and component replacement.', price: '₹500 – ₹3,000' },
      { name: 'Software & Flashing', icon: 'fa-code', description: 'OS flashing, updates, and data recovery.', price: '₹200 – ₹1,000' },
      { name: 'Camera Repair', icon: 'fa-camera', description: 'Front & rear camera module replacement.', price: '₹400 – ₹4,000' },
    ]
  }
})
</script>

<style scoped>
.vmp-label {
  @apply block text-sm font-semibold text-gray-700 mb-1.5;
}
.vmp-error {
  @apply text-red-500 text-xs mt-1;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
