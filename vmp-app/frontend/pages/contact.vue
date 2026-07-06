<template>
  <div>
    <PageBreadcrumb title="Contact Us" />

    <section class="section-padding bg-white">
      <div class="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <!-- Info -->
        <div data-aos="fade-right">
          <p class="sub-title"><span>Get in Touch</span></p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-2 mb-5">We're Here to Help</h2>
          <p class="text-gray-600 leading-relaxed mb-8">
            Have a question or need a repair? Drop us a message and we'll get back to you via WhatsApp or phone call.
          </p>
          <div class="space-y-5">
            <ContactInfoCard icon="fa-map-marker-alt" label="Address" value="Sathuvachari Falls Trial, Phase 2, Sathuvachari, Vellore, Tamil Nadu 632009" />
            <ContactInfoCard icon="fa-clock" label="Business Hours" value="All Days: 9:30 AM – 9:30 PM" />
            <ContactInfoCard icon="fa-phone" label="Phone" value="+91 97905 99905" href="tel:+919790599905" />
            <ContactInfoCard icon="fa-whatsapp" label="WhatsApp" value="Chat with us" :href="`https://wa.me/${config.public.ownerWhatsapp}?text=I+need+help`" brand />
          </div>
        </div>

        <!-- Form -->
        <div data-aos="fade-left">
          <div class="bg-white rounded-3xl shadow-lg border-t-4 p-8 md:p-10" style="border-top-color: var(--vmp-red)">
            <div v-if="!sent">
              <h3 class="text-xl font-heading font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form @submit.prevent="submitContact" novalidate class="space-y-5">
                <div>
                  <label class="vmp-label">Full Name *</label>
                  <input v-model="form.name" type="text" class="vmp-input" :class="getFieldClass('name')" placeholder="Your name" @blur="touch('name')" @input="validate" />
                  <p v-if="errors.name" class="vmp-error">{{ errors.name }}</p>
                </div>
                <div>
                  <label class="vmp-label">Mobile Number *</label>
                  <input v-model="form.mobile" type="tel" maxlength="10" class="vmp-input" :class="getFieldClass('mobile')" placeholder="10-digit mobile" @blur="touch('mobile')" @input="validate" />
                  <p v-if="errors.mobile" class="vmp-error">{{ errors.mobile }}</p>
                </div>
                <div>
                  <label class="vmp-label flex justify-between">
                    <span>Message *</span>
                    <span class="font-normal" :class="form.message.length > 450 ? 'text-red-500' : 'text-gray-400'">{{ form.message.length }}/500</span>
                  </label>
                  <textarea v-model="form.message" rows="4" maxlength="500" class="vmp-input" :class="getFieldClass('message')" placeholder="Tell us about your issue or question..." @blur="touch('message')" @input="validate"></textarea>
                  <p v-if="errors.message" class="vmp-error">{{ errors.message }}</p>
                </div>
                <button type="submit" :disabled="!isFormValid || loading" class="btn-vmp w-full justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
                  <span v-else><i class="fab fa-whatsapp"></i> Send Message</span>
                </button>
                <p v-if="apiError" class="text-red-500 text-sm text-center">{{ apiError }}</p>
              </form>
            </div>
            <div v-else class="text-center py-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style="background: var(--vmp-gradient)">
                <i class="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-heading font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p class="text-gray-500 mb-5">Thanks, <strong>{{ form.name }}</strong>! We'll reach you at <strong>{{ form.mobile }}</strong> soon.</p>
              <button @click="reset" class="btn-vmp-outline">Send Another</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
useHead({ title: 'Contact Us — Vellore Mobile Point' })

const { post } = useApi()
const sent = ref(false)
const loading = ref(false)
const apiError = ref('')
const touched = ref<Set<string>>(new Set())

const form = reactive({ name: '', mobile: '', message: '' })

function touch(field: string) { touched.value.add(field) }

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (touched.value.has('name') && form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
  if (touched.value.has('mobile') && !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.'
  if (touched.value.has('message') && form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
  return e
})

const isFormValid = computed(() =>
  form.name.trim().length >= 2 &&
  /^\d{10}$/.test(form.mobile) &&
  form.message.trim().length >= 10
)

function getFieldClass(field: string) {
  if (!touched.value.has(field)) return ''
  return errors.value[field] ? 'is-invalid' : 'is-valid'
}

function validate() { /* reactive via computed */ }

async function submitContact() {
  ['name', 'mobile', 'message'].forEach(f => touch(f))
  if (!isFormValid.value) return

  loading.value = true
  apiError.value = ''
  try {
    await post('/contacts', form)
    sent.value = true
  } catch (err: any) {
    apiError.value = err?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function reset() {
  form.name = ''
  form.mobile = ''
  form.message = ''
  touched.value.clear()
  sent.value = false
}

onMounted(() => {
  if (window.AOS) window.AOS.init({ once: true, duration: 450 })
})
</script>

<style scoped>
.vmp-label {
  @apply block text-sm font-semibold text-gray-700 mb-1.5;
}
.vmp-error {
  @apply text-red-500 text-xs mt-1;
}
</style>
