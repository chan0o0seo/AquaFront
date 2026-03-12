<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, X, Loader2 } from 'lucide-vue-next'
import ProductTypeSelector from '@/components/seller/ProductTypeSelector.vue'
import ProductImageUploader from '@/components/seller/ProductImageUploader.vue'
import BioSpecsSection from '@/components/seller/BioSpecsSection.vue'
import TagInput from '@/components/seller/TagInput.vue'
import ProductFormFooter from '@/components/seller/ProductFormFooter.vue'
import { sellerApi, productApi, uploadFiles } from '@/api'

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
  parentCategoryName: '',
  categoryName: '',
  shippingFee: 0,
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

// 수정 모드: 서버에 이미 올라간 기존 이미지 URL 목록
const existingImageUrls = ref<string[]>([])

// 새로 추가할 File 목록
const images = ref<File[]>([])

// 현재 슬롯 잔여 수 (기존 + 새 파일 합산)
const remainingSlots = computed(() => 3 - existingImageUrls.value.length - images.value.length)

const removeExistingImage = (index: number) => {
  existingImageUrls.value.splice(index, 1)
}

// Tags
const tags = ref<string[]>([])

// Free shipping toggle
const freeShipping = ref(false)

// Submission/loading state
const isSubmitting = ref(false)
const isLoadingProduct = ref(false)

// 수정 모드 진입 시 기존 상품 데이터 로드
onMounted(async () => {
  if (!isEditMode.value || !productId.value) return
  isLoadingProduct.value = true
  try {
    const p = await productApi.getDetail(Number(productId.value))
    form.name = p.name
    form.price = p.price
    form.stock = p.stock
    form.description = p.description ?? ''
    form.shippingFee = p.shippingFee
    form.productType = p.productType as ProductType
    form.brand = p.brand ?? ''
    form.waterType = p.waterType ?? null
    form.difficulty = p.difficulty ?? null
    form.waterTemperatureMin = p.waterTemperatureMin ?? null
    form.waterTemperatureMax = p.waterTemperatureMax ?? null
    form.phMin = p.phMin ?? null
    form.phMax = p.phMax ?? null
    form.isCompatible = p.isCompatible ?? null
    form.minimumTankSize = p.minimumTankSize ?? null
    // 카테고리: parentCategoryName이 있으면 2단계, 없으면 1단계
    form.parentCategoryName = (p as any).parentCategoryName ?? ''
    form.categoryName = p.categoryName ?? ''
    // 기존 이미지 URL
    existingImageUrls.value = p.images.map(img => img.imageUrl)
    // 배송비 0 → 무료배송 체크
    freeShipping.value = p.shippingFee === 0
    // 태그
    tags.value = p.tags ?? []
  } catch {
    alert('상품 정보를 불러오는 데 실패했습니다.')
    router.push('/mypage/seller')
  } finally {
    isLoadingProduct.value = false
  }
})

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

// Submit handler
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // 1. 새 파일 S3 업로드 후 URL 취득, 기존 URL과 합산
    const newUrls = images.value.length > 0 ? await uploadFiles(images.value) : []
    const imageUrls = [...existingImageUrls.value, ...newUrls]

    // 2. Build request body
    const body = {
      name: form.name,
      price: form.price!,
      stock: form.stock!,
      description: form.description || undefined,
      parentCategoryName: form.parentCategoryName.trim() || undefined,
      categoryName: form.categoryName.trim() || undefined,
      productType: form.productType!,
      shippingFee: form.shippingFee,
      imageUrls,
      tags: tags.value.length > 0 ? tags.value : undefined,
      brand: form.brand || undefined,
      ...(isBioType.value && {
        waterType: form.waterType ?? undefined,
        difficulty: form.difficulty ?? undefined,
        waterTemperatureMin: form.waterTemperatureMin ?? undefined,
        waterTemperatureMax: form.waterTemperatureMax ?? undefined,
        phMin: form.phMin ?? undefined,
        phMax: form.phMax ?? undefined,
        minimumTankSize: form.minimumTankSize ?? undefined,
      }),
    }

    // 3. Create or update
    if (isEditMode.value && productId.value) {
      await sellerApi.updateProduct(Number(productId.value), body)
    } else {
      await sellerApi.createProduct(body)
    }

    router.push('/mypage/seller')
  } catch (e) {
    alert(isEditMode.value ? '상품 수정에 실패했습니다. 다시 시도해주세요.' : '상품 등록에 실패했습니다. 다시 시도해주세요.')
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

      <!-- 로딩 -->
      <div v-if="isLoadingProduct" class="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-sky-100">
        <Loader2 class="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p class="text-slate-400 text-sm">상품 정보를 불러오는 중...</p>
      </div>

      <!-- Main Card -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
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
          
          <!-- Category -->
          <div class="mt-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">카테고리 <span class="text-slate-400 font-normal">(선택)</span></label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.parentCategoryName"
                type="text"
                maxlength="30"
                placeholder="대분류 예: 열대어"
                class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150"
              />
              <span class="text-slate-300 text-lg font-light flex-shrink-0">/</span>
              <input
                v-model="form.categoryName"
                type="text"
                maxlength="30"
                :placeholder="form.parentCategoryName ? '소분류 예: 구피' : '소분류 (대분류 입력 후)'"
                :disabled="!form.parentCategoryName.trim()"
                class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150
                       disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              />
            </div>
            <!-- 미리보기 -->
            <p v-if="form.parentCategoryName.trim()" class="text-xs text-sky-500 mt-1.5 font-medium">
              {{ form.parentCategoryName.trim() }}{{ form.categoryName.trim() ? ` > ${form.categoryName.trim()}` : '' }}
            </p>
            <p v-else class="text-xs text-slate-400 mt-1.5">대분류만 입력하거나 소분류까지 세분화할 수 있어요</p>
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
          <h2 class="text-lg font-bold text-slate-800 mb-5">
            이미지 등록
            <span class="text-sm font-normal text-slate-400 ml-1">(최대 3장)</span>
          </h2>

          <!-- 기존 이미지 (수정 모드) -->
          <div v-if="existingImageUrls.length > 0" class="mb-4">
            <p class="text-xs text-slate-400 mb-2">등록된 이미지 — X를 눌러 삭제할 수 있어요</p>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="(url, i) in existingImageUrls"
                :key="url"
                class="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200"
              >
                <img :src="url" :alt="`기존 이미지 ${i + 1}`" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeExistingImage(i)"
                  class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
                >
                  <X class="w-4 h-4 text-slate-500 hover:text-red-500" />
                </button>
                <div v-if="i === 0" class="absolute bottom-2 left-2 px-2 py-1 bg-sky-500 text-white text-xs rounded-lg font-medium">
                  썸네일
                </div>
              </div>
            </div>
          </div>

          <!-- 새 이미지 업로더 (남은 슬롯만큼만) -->
          <ProductImageUploader
            v-if="remainingSlots > 0"
            v-model="images"
            :max-images="remainingSlots"
          />
          <p v-else class="text-xs text-slate-400 mt-1">이미지 3장이 모두 등록되었습니다.</p>
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
