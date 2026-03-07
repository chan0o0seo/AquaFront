<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import ProductTypeSelector from '@/components/seller/ProductTypeSelector.vue'
import ProductImageUploader from '@/components/seller/ProductImageUploader.vue'
import BioSpecsSection from '@/components/seller/BioSpecsSection.vue'
import TagInput from '@/components/seller/TagInput.vue'
import ProductFormFooter from '@/components/seller/ProductFormFooter.vue'

type ProductType = 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'

const router = useRouter()
const route = useRoute()

// Edit mode detection
const isEditMode = computed(() => route.name === 'SellerProductEdit')
const productId = computed(() => route.params.id as string | undefined)

// Form state
const form = reactive({
  name: '',
  price: null as number | null,
  stock: null as number | null,
  description: '',
  categoryId: null as number | null,
  shippingFee: 0,
  deliveryDays: null as number | null,
  productType: null as ProductType | null,
  brand: '',
  // Bio specs
  waterType: null as 'FRESHWATER' | 'SALTWATER' | 'BRACKISH' | null,
  difficulty: null as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null,
  waterTemperatureMin: null as number | null,
  waterTemperatureMax: null as number | null,
  phMin: null as number | null,
  phMax: null as number | null,
  isCompatible: null as boolean | null,
  minimumTankSize: null as number | null
})

// Images
const images = ref<File[]>([])

// Tags
const tags = ref<string[]>([])

// Free shipping toggle
const freeShipping = ref(false)

// Submission state
const isSubmitting = ref(false)

// Delivery days options
const deliveryDaysOptions = [1, 2, 3, 5, 7]

// Bio specs model
const bioSpecs = computed({
  get: () => ({
    waterType: form.waterType,
    difficulty: form.difficulty,
    waterTemperatureMin: form.waterTemperatureMin,
    waterTemperatureMax: form.waterTemperatureMax,
    phMin: form.phMin,
    phMax: form.phMax,
    isCompatible: form.isCompatible,
    minimumTankSize: form.minimumTankSize
  }),
  set: (val) => {
    form.waterType = val.waterType
    form.difficulty = val.difficulty
    form.waterTemperatureMin = val.waterTemperatureMin
    form.waterTemperatureMax = val.waterTemperatureMax
    form.phMin = val.phMin
    form.phMax = val.phMax
    form.isCompatible = val.isCompatible
    form.minimumTankSize = val.minimumTankSize
  }
})

// Show bio section for living products
const isBioType = computed(() => 
  ['FISH', 'INVERTEBRATE', 'PLANT'].includes(form.productType || '')
)

// Show brand section for equipment/accessories
const isEquipmentType = computed(() => 
  ['EQUIPMENT', 'ACCESSORY'].includes(form.productType || '')
)

// Form validation
const isFormValid = computed(() => {
  return (
    form.name.trim().length > 0 &&
    form.price !== null && form.price >= 0 &&
    form.stock !== null && form.stock >= 0 &&
    form.deliveryDays !== null && form.deliveryDays >= 1 &&
    form.productType !== null
  )
})

// Low stock warning
const showLowStockWarning = computed(() => 
  form.stock !== null && form.stock > 0 && form.stock <= 5
)

// Handle free shipping toggle
const handleFreeShippingChange = () => {
  if (freeShipping.value) {
    form.shippingFee = 0
  }
}

// Handle delivery days selection
const selectDeliveryDays = (days: number) => {
  form.deliveryDays = days
}

// Submit handler
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const formData = new FormData()
    
    // Append basic fields
    formData.append('name', form.name)
    formData.append('price', String(form.price))
    formData.append('stock', String(form.stock))
    formData.append('description', form.description)
    formData.append('productType', form.productType!)
    formData.append('shippingFee', String(form.shippingFee))
    formData.append('deliveryDays', String(form.deliveryDays))
    
    if (form.categoryId) {
      formData.append('categoryId', String(form.categoryId))
    }
    
    if (form.brand) {
      formData.append('brand', form.brand)
    }
    
    // Append bio specs if applicable
    if (isBioType.value) {
      if (form.waterType) formData.append('waterType', form.waterType)
      if (form.difficulty) formData.append('difficulty', form.difficulty)
      if (form.waterTemperatureMin !== null) formData.append('waterTemperatureMin', String(form.waterTemperatureMin))
      if (form.waterTemperatureMax !== null) formData.append('waterTemperatureMax', String(form.waterTemperatureMax))
      if (form.phMin !== null) formData.append('phMin', String(form.phMin))
      if (form.phMax !== null) formData.append('phMax', String(form.phMax))
      if (form.isCompatible !== null) formData.append('isCompatible', String(form.isCompatible))
      if (form.minimumTankSize !== null) formData.append('minimumTankSize', String(form.minimumTankSize))
    }
    
    // Append tags
    tags.value.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag)
    })
    
    // Append images
    images.value.forEach((file, index) => {
      formData.append(`images`, file)
    })
    
    // Simulated API call
    // const endpoint = isEditMode.value 
    //   ? `/api/products/${productId.value}` 
    //   : '/api/products'
    // const method = isEditMode.value ? 'PATCH' : 'POST'
    // await fetch(endpoint, { method, body: formData })
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    router.push('/mypage/seller')
  } catch (e) {
    alert('상품 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

// Save draft handler
const handleSaveDraft = () => {
  // Implement draft saving to localStorage or API
  alert('임시저장 기능은 준비 중입니다.')
}

// Preview handler
const handlePreview = () => {
  // Implement preview modal
  alert('미리보기 기능은 준비 중입니다.')
}

// Go back
const goBack = () => {
  router.push('/mypage/seller')
}
</script>

<template>
  <main class="min-h-screen bg-sky-50 pt-24 pb-16">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-500 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        판매자 센터
      </button>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
        <!-- Header -->
        <h1 class="text-3xl font-black text-slate-900">
          {{ isEditMode ? '상품 수정' : '상품 등록' }}
        </h1>
        <p class="text-slate-400 text-sm mt-2">
          판매할 상품 정보를 입력해주세요.
        </p>

        <!-- SECTION 1: Basic Info -->
        <div class="mt-8 bg-white rounded-2xl border border-sky-100 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-5">기본 정보</h2>
          
          <!-- Product Type -->
          <ProductTypeSelector v-model="form.productType" />
          
          <!-- Product Name -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              상품명 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.name"
                type="text"
                maxlength="50"
                placeholder="상품명을 입력해주세요"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {{ form.name.length }}/50
              </span>
            </div>
          </div>
          
          <!-- Category (placeholder) -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">카테고리</label>
            <select
              v-model="form.categoryId"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
            >
              <option :value="null">카테고리 선택</option>
              <option :value="1">열대어 &gt; 구피</option>
              <option :value="2">열대어 &gt; 베타</option>
              <option :value="3">새우 &gt; 체리새우</option>
              <option :value="4">수초 &gt; 음성수초</option>
              <option :value="5">용품 &gt; 여과기</option>
            </select>
          </div>
          
          <!-- Description -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">상품 설명</label>
            <div class="relative">
              <textarea
                v-model="form.description"
                rows="6"
                maxlength="2000"
                placeholder="상품 특징, 사육 환경 권장 사항, 주의사항 등을 자세히 써주시면 판매에 도움이 됩니다."
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150 resize-none"
              ></textarea>
              <span class="absolute right-3 bottom-3 text-xs text-slate-400">
                {{ form.description.length }}/2000
              </span>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Images -->
        <div class="mt-4 bg-white rounded-2xl border border-sky-100 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-5">이미지 등록</h2>
          <ProductImageUploader v-model="images" :max-images="3" />
        </div>

        <!-- SECTION 3: Price & Stock -->
        <div class="mt-4 bg-white rounded-2xl border border-sky-100 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-5">가격 및 재고</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Price -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                판매가격 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-3 pr-10 rounded-xl border border-sky-100 bg-white text-slate-800
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                         focus:border-transparent transition-all duration-150"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">원</span>
              </div>
              <p v-if="form.price && form.price > 0" class="text-sky-600 text-sm mt-1 font-medium">
                ₩{{ form.price.toLocaleString() }}
              </p>
            </div>
            
            <!-- Stock -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                재고 수량 <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150"
              />
              <p v-show="showLowStockWarning" class="text-amber-600 text-sm mt-1 font-medium">
                재고가 5개 이하입니다
              </p>
            </div>
          </div>
          
          <!-- Shipping Fee -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">배송비</label>
            <div class="flex items-center gap-4">
              <div class="relative flex-1">
                <input
                  v-model.number="form.shippingFee"
                  type="number"
                  min="0"
                  :disabled="freeShipping"
                  placeholder="0"
                  class="w-full px-4 py-3 pr-10 rounded-xl border border-sky-100 bg-white text-slate-800
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                         focus:border-transparent transition-all duration-150
                         disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">원</span>
              </div>
              <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input
                  v-model="freeShipping"
                  type="checkbox"
                  @change="handleFreeShippingChange"
                  class="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                />
                <span class="text-sm text-slate-700">무료배송</span>
              </label>
            </div>
          </div>
          
          <!-- Delivery Days -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              배송 예정일 <span class="text-red-500">*</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="days in deliveryDaysOptions"
                :key="days"
                type="button"
                @click="selectDeliveryDays(days)"
                class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
                :class="[
                  form.deliveryDays === days
                    ? 'border-sky-400 bg-sky-50 text-sky-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                ]"
              >
                {{ days }}일
              </button>
              <input
                v-model.number="form.deliveryDays"
                type="number"
                min="1"
                placeholder="직접 입력"
                class="w-24 px-3 py-2 rounded-full border border-sky-100 bg-white text-slate-800 text-center
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150"
              />
            </div>
          </div>
        </div>

        <!-- SECTION 4: Bio Specs (conditional) -->
        <div v-show="isBioType" class="mt-4">
          <BioSpecsSection v-model="bioSpecs" />
        </div>

        <!-- SECTION 5: Brand (conditional) -->
        <div v-show="isEquipmentType" class="mt-4 bg-white rounded-2xl border border-sky-100 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-5">브랜드 정보</h2>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">브랜드명</label>
            <input
              v-model="form.brand"
              type="text"
              placeholder="예: ADA, JBL, Eheim"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>

        <!-- SECTION 6: Tags -->
        <div class="mt-4 bg-white rounded-2xl border border-sky-100 p-6">
          <TagInput v-model="tags" :max-tags="10" />
        </div>

        <!-- Submit Footer -->
        <ProductFormFooter
          :is-valid="isFormValid"
          :is-submitting="isSubmitting"
          :is-edit-mode="isEditMode"
          @save-draft="handleSaveDraft"
          @preview="handlePreview"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </main>
</template>
