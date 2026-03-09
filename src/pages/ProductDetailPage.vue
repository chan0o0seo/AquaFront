<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, ShoppingCart, Shield, Thermometer, Fish, Check, Heart } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'
import ProductImageGallery from '../components/product/ProductImageGallery.vue'
import ProductBioSpecs from '../components/product/ProductBioSpecs.vue'
import QuantitySelector from '../components/product/QuantitySelector.vue'
import ReviewSummary from '../components/product/ReviewSummary.vue'
import ReviewCard from '../components/product/ReviewCard.vue'
import ReviewWriteForm from '../components/product/ReviewWriteForm.vue'

// Types
interface Product {
  id: number
  name: string
  description: string | null
  price: number
  shippingFee: number
  stock: number
  status: 'ACTIVE' | 'SOLD_OUT' | 'DELETED'
  productType: 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'
  categoryName: string | null
  thumbnailUrl: string | null
  imageUrls: string[]
  tags: string[]
  sellerId: number
  sellerNickName: string
  averageRating: number
  reviewCount: number
  lowStockWarning: boolean
  waterType: 'FRESHWATER' | 'SALTWATER' | 'BRACKISH' | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  waterTemperatureMin: number | null
  waterTemperatureMax: number | null
  phMin: number | null
  phMax: number | null
  isCompatible: boolean | null
  minimumTankSize: number | null
  brand: string | null
}

interface Review {
  id: number
  reviewerId: number
  reviewerNickName: string
  rating: number
  content: string
  imageUrls: string[]
  createdAt: string
}

interface ReviewForm {
  rating: number
  content: string
  imageUrls: string[]
}

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// Wishlist state
const isWishlisted = ref(false)
const isTogglingWishlist = ref(false)
const heartAnimating = ref(false)

const toggleWishlist = async () => {
  if (isTogglingWishlist.value) return
  isTogglingWishlist.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  isWishlisted.value = !isWishlisted.value
  isTogglingWishlist.value = false
}

watch(isWishlisted, () => {
  heartAnimating.value = true
  setTimeout(() => { heartAnimating.value = false }, 300)
})

// State
const isAddingToCart = ref(false)
const showAddedToast = ref(false)
const product = ref<Product | null>(null)
const reviews = ref<Review[]>([])
const reviewPage = ref(0)
const reviewHasMore = ref(true)
const isLoadingProduct = ref(true)
const isLoadingReviews = ref(false)
const quantity = ref(1)
const activeTab = ref<'description' | 'reviews' | 'specs'>('description')
const isWritingReview = ref(false)
const editingReviewId = ref<number | null>(null)
const isSubmittingReview = ref(false)

// Mock current user (in real app, from auth store)
const currentUserId = ref<number | null>(1)
const isLoggedIn = computed(() => currentUserId.value !== null)

// Badge mappings
const productTypeLabels: Record<string, { label: string; class: string }> = {
  FISH: { label: '어류', class: 'bg-sky-100 text-sky-700' },
  INVERTEBRATE: { label: '무척추동물', class: 'bg-purple-100 text-purple-700' },
  PLANT: { label: '수초', class: 'bg-green-100 text-green-700' },
  EQUIPMENT: { label: '용품/장비', class: 'bg-amber-100 text-amber-700' },
  FOOD: { label: '사료', class: 'bg-orange-100 text-orange-700' },
  ACCESSORY: { label: '소품', class: 'bg-pink-100 text-pink-700' }
}

const waterTypeLabels: Record<string, { label: string; class: string }> = {
  FRESHWATER: { label: '담수', class: 'bg-blue-50 text-blue-600' },
  SALTWATER: { label: '해수', class: 'bg-cyan-50 text-cyan-600' },
  BRACKISH: { label: '기수', class: 'bg-teal-50 text-teal-600' }
}

const difficultyLabels: Record<string, { label: string; class: string }> = {
  BEGINNER: { label: '입문', class: 'bg-emerald-50 text-emerald-600' },
  INTERMEDIATE: { label: '중급', class: 'bg-amber-50 text-amber-600' },
  ADVANCED: { label: '고급', class: 'bg-red-50 text-red-600' }
}

const statusLabels: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: '판매중', class: 'bg-emerald-100 text-emerald-700' },
  SOLD_OUT: { label: '품절', class: 'bg-slate-100 text-slate-500' }
}

// Computed
const myReview = computed(() => {
  if (!currentUserId.value) return null
  return reviews.value.find(r => r.reviewerId === currentUserId.value) || null
})

const ratingBreakdown = computed(() => {
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(r => {
    if (breakdown[r.rating] !== undefined) {
      breakdown[r.rating]++
    }
  })
  return breakdown
})

const sellerInitial = computed(() => {
  return product.value?.sellerNickName.charAt(0).toUpperCase() || 'S'
})

const filledStars = computed(() => {
  return Math.round(product.value?.averageRating || 0)
})

// API Functions
const fetchProduct = async (productId: string) => {
  isLoadingProduct.value = true
  try {
    // Mock API call - replace with actual fetch
    await new Promise(resolve => setTimeout(resolve, 800))

    // Mock data
    product.value = {
      id: parseInt(productId),
      name: '풀레드 구피 (1쌍)',
      description: '건강하고 아름다운 풀레드 구피입니다.\n\n색상이 선명하고 지느러미가 넓어 관상용으로 최고입니다.\n\n초보자도 쉽게 기를 수 있으며, 번식력이 좋아 개체 증식에도 적합합니다.\n\n수온 24~28도, pH 7.0~7.5에서 최적의 상태를 유지합니다.',
      price: 15000,
      shippingFee: 3000,
      stock: 5,
      status: 'ACTIVE',
      productType: 'FISH',
      categoryName: '열대어 > 난태생어',
      thumbnailUrl: 'https://picsum.photos/seed/guppy1/600/600',
      imageUrls: [
        'https://picsum.photos/seed/guppy1/600/600',
        'https://picsum.photos/seed/guppy2/600/600',
        'https://picsum.photos/seed/guppy3/600/600',
        'https://picsum.photos/seed/guppy4/600/600'
      ],
      tags: ['구피', '열대어', '초보추천', '번식용'],
      sellerId: 101,
      sellerNickName: '아쿠아팜',
      averageRating: 4.7,
      reviewCount: 23,
      lowStockWarning: true,
      waterType: 'FRESHWATER',
      difficulty: 'BEGINNER',
      waterTemperatureMin: 24,
      waterTemperatureMax: 28,
      phMin: 7.0,
      phMax: 7.5,
      isCompatible: true,
      minimumTankSize: 20,
      brand: null
    }

    // Fetch reviews after product
    await fetchReviews(productId, true)
  } catch (error) {
    console.error('Failed to fetch product:', error)
  } finally {
    isLoadingProduct.value = false
  }
}

const fetchReviews = async (productId: string, reset = false) => {
  if (isLoadingReviews.value) return

  isLoadingReviews.value = true
  try {
    if (reset) {
      reviewPage.value = 0
      reviews.value = []
    }

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock reviews data
    const mockReviews: Review[] = [
      {
        id: 1,
        reviewerId: 1,
        reviewerNickName: '물생활러버',
        rating: 5,
        content: '정말 건강하고 예쁜 구피가 왔어요! 색상도 사진과 똑같고, 패킹도 꼼꼼하게 해주셔서 감사합니다. 다음에도 여기서 구매할게요!',
        imageUrls: ['https://picsum.photos/seed/review1/200/200'],
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        reviewerId: 2,
        reviewerNickName: '초보어항',
        rating: 4,
        content: '처음 키우는 열대어인데 잘 적응하고 있어요. 다만 배송이 조금 늦어서 별 하나 뺄게요.',
        imageUrls: [],
        createdAt: '2024-01-10T14:20:00'
      },
      {
        id: 3,
        reviewerId: 3,
        reviewerNickName: '구피매니아',
        rating: 5,
        content: '풀레드 색상이 정말 진해요. 다른 구피들이랑 같이 키우���데 합사도 잘 되네요.',
        imageUrls: [
          'https://picsum.photos/seed/review3a/200/200',
          'https://picsum.photos/seed/review3b/200/200'
        ],
        createdAt: '2024-01-05T09:15:00'
      }
    ]

    if (reviewPage.value === 0) {
      reviews.value = mockReviews
    } else {
      reviews.value = [...reviews.value, ...mockReviews]
    }

    // Mock pagination
    reviewHasMore.value = reviewPage.value < 2
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
  } finally {
    isLoadingReviews.value = false
  }
}

const loadMoreReviews = () => {
  if (!reviewHasMore.value || isLoadingReviews.value) return
  reviewPage.value++
  const productId = route.params.productId as string
  fetchReviews(productId)
}

// Review Actions
const handleReviewSubmit = async (form: ReviewForm) => {
  isSubmittingReview.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingReviewId.value) {
      // Update existing review
      const index = reviews.value.findIndex(r => r.id === editingReviewId.value)
      if (index !== -1) {
        reviews.value[index] = {
          ...reviews.value[index],
          rating: form.rating,
          content: form.content,
          imageUrls: form.imageUrls
        }
      }
      editingReviewId.value = null
    } else {
      // Create new review
      const newReview: Review = {
        id: Date.now(),
        reviewerId: currentUserId.value!,
        reviewerNickName: '내 닉네임',
        rating: form.rating,
        content: form.content,
        imageUrls: form.imageUrls,
        createdAt: new Date().toISOString()
      }
      reviews.value.unshift(newReview)
    }

    isWritingReview.value = false
  } catch (error) {
    console.error('Failed to submit review:', error)
    alert('리뷰 등록에 실패했습니다.')
  } finally {
    isSubmittingReview.value = false
  }
}

const handleReviewEdit = (review: Review) => {
  editingReviewId.value = review.id
  isWritingReview.value = false
}

const handleReviewDelete = async (reviewId: number) => {
  if (!confirm('리뷰를 삭제하시겠습니까?')) return

  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
  } catch (error) {
    console.error('Failed to delete review:', error)
    alert('리뷰 삭제에 실패했습니다.')
  }
}

const cancelReviewForm = () => {
  isWritingReview.value = false
  editingReviewId.value = null
}

// Cart Actions
const addToCart = async () => {
  if (!product.value || isAddingToCart.value) return

  isAddingToCart.value = true

  // Add to cart store
  cartStore.addItem({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    shippingFee: product.value.shippingFee,
    stock: product.value.stock,
    status: product.value.status as 'ACTIVE' | 'SOLD_OUT',
    productType: product.value.productType,
    thumbnailUrl: product.value.thumbnailUrl,
    sellerNickName: product.value.sellerNickName,
    lowStockWarning: product.value.lowStockWarning
  }, quantity.value)

  // Show toast
  showAddedToast.value = true

  // Hide toast after 2 seconds
  setTimeout(() => {
    showAddedToast.value = false
  }, 2000)

  isAddingToCart.value = false
}

const buyNow = () => {
  router.push(`/checkout?productId=${product.value?.id}&quantity=${quantity.value}`)
}

const goToSellerProducts = () => {
  if (product.value) {
    router.push(`/search?seller=${product.value.sellerId}`)
  }
}

const scrollToReviews = () => {
  activeTab.value = 'reviews'
  const reviewSection = document.getElementById('review-section')
  if (reviewSection) {
    reviewSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Watch route params
watch(
    () => route.params.productId,
    (newId) => {
      if (newId) {
        fetchProduct(newId as string)
      }
    },
    { immediate: true }
)
</script>

<template>
  <main class="min-h-screen bg-white">
    <!-- Loading Skeleton -->
    <div v-show="isLoadingProduct" class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Left skeleton -->
        <div class="lg:w-[55%]">
          <div class="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
          <div class="flex gap-2 mt-3">
            <div v-for="i in 4" :key="i" class="w-16 h-16 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
        <!-- Right skeleton -->
        <div class="lg:w-[45%] space-y-4">
          <div class="h-4 w-1/3 bg-slate-100 rounded-full animate-pulse" />
          <div class="h-8 w-3/4 bg-slate-100 rounded-full animate-pulse" />
          <div class="h-6 w-1/2 bg-slate-100 rounded-full animate-pulse" />
          <div class="h-12 w-1/3 bg-slate-100 rounded-full animate-pulse" />
          <div class="h-32 w-full bg-slate-100 rounded-2xl animate-pulse" />
          <div class="h-14 w-full bg-slate-100 rounded-full animate-pulse" />
          <div class="h-14 w-full bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Product Detail -->
    <div v-show="product && !isLoadingProduct" class="max-w-6xl mx-auto px-6 py-24">
      <!-- Two Column Layout -->
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- LEFT: Image Gallery -->
        <div class="lg:w-[55%]">
          <ProductImageGallery
              v-if="product"
              :image-urls="product.imageUrls"
              :status="product.status"
              :product-name="product.name"
          />
        </div>

        <!-- RIGHT: Product Info -->
        <div class="lg:w-[45%]">
          <!-- Badge Row -->
          <div class="flex gap-2 flex-wrap">
            <span
                v-if="product?.productType"
                :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                productTypeLabels[product.productType].class
              ]"
            >
              {{ productTypeLabels[product.productType].label }}
            </span>
            <span
                v-if="product?.waterType"
                :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                waterTypeLabels[product.waterType].class
              ]"
            >
              {{ waterTypeLabels[product.waterType].label }}
            </span>
            <span
                v-if="product?.difficulty"
                :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                difficultyLabels[product.difficulty].class
              ]"
            >
              {{ difficultyLabels[product.difficulty].label }}
            </span>
            <span
                v-if="product?.status"
                :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                statusLabels[product.status].class
              ]"
            >
              {{ statusLabels[product.status].label }}
            </span>
            <span
                v-show="product?.lowStockWarning && product?.status === 'ACTIVE'"
                class="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200"
            >
              재고 {{ product?.stock }}개 남음
            </span>
          </div>

          <!-- Category Breadcrumb -->
          <p v-if="product?.categoryName" class="text-sm text-slate-400 mt-3">
            {{ product.categoryName }}
          </p>

          <!-- Product Name -->
          <h1 class="text-3xl font-black text-slate-900 mt-1">
            {{ product?.name }}
          </h1>

          <!-- Rating Row -->
          <div class="flex items-center gap-2 mt-2">
            <div class="flex gap-0.5">
              <Star
                  v-for="i in 5"
                  :key="i"
                  :size="18"
                  :class="i <= filledStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
              />
            </div>
            <span class="font-bold text-slate-800">{{ product?.averageRating.toFixed(1) }}</span>
            <button
                @click="scrollToReviews"
                class="text-slate-400 text-sm hover:underline"
            >
              (리뷰 {{ product?.reviewCount }}개)
            </button>
            <span class="flex items-center gap-1 text-slate-400 text-sm ml-2">
              <Heart
                  class="w-3.5 h-3.5 transition-colors duration-200"
                  :class="isWishlisted ? 'fill-red-400 text-red-400' : ''"
              />
            </span>
          </div>

          <!-- Price Section -->
          <div class="mt-4">
            <p class="text-4xl font-black text-sky-600">
              ₩{{ product?.price.toLocaleString() }}
            </p>
            <div class="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span v-if="product?.shippingFee === 0" class="text-emerald-500 font-bold text-xs">
                무료배송
              </span>
              <span v-else>
                배송비 ₩{{ product?.shippingFee.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Bio Specs (compact) -->
          <ProductBioSpecs
              v-if="product"
              :water-type="product.waterType"
              :difficulty="product.difficulty"
              :water-temperature-min="product.waterTemperatureMin"
              :water-temperature-max="product.waterTemperatureMax"
              :ph-min="product.phMin"
              :ph-max="product.phMax"
              :is-compatible="product.isCompatible"
              :minimum-tank-size="product.minimumTankSize"
              :brand="product.brand"
          />

          <!-- Tags -->
          <div v-if="product?.tags.length" class="flex flex-wrap gap-2 mt-4">
            <span
                v-for="tag in product.tags"
                :key="tag"
                class="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-sm"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Seller Info -->
          <div class="flex items-center gap-3 mt-5 p-4 bg-white rounded-2xl border border-sky-100">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-bold">
              {{ sellerInitial }}
            </div>
            <span class="font-semibold text-slate-800">{{ product?.sellerNickName }}</span>
            <button
                @click="goToSellerProducts"
                class="ml-auto text-sky-500 text-sm hover:underline"
            >
              판매자 상품 보기 →
            </button>
          </div>

          <!-- Quantity + CTA -->
          <div class="mt-6">
            <!-- Quantity Selector -->
            <div v-show="product?.status === 'ACTIVE'" class="mb-4">
              <QuantitySelector
                  v-model="quantity"
                  :max-quantity="product?.stock || 99"
              />
            </div>

            <!-- Wishlist Button -->
            <button
                @click="toggleWishlist"
                :disabled="isTogglingWishlist"
                class="w-full py-4 px-8 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :class="[
                  isWishlisted
                    ? 'border-red-400 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-400'
                ]"
            >
              <Heart
                  class="w-5 h-5 transition-all duration-200"
                  :class="[isWishlisted ? 'fill-current' : '', heartAnimating ? 'heart-pop' : '']"
              />
              <span>{{ isWishlisted ? '찜 완료' : '찜하기' }}</span>
            </button>


            <!-- Add to Cart -->
            <button
                @click="addToCart"
                :disabled="product?.status === 'SOLD_OUT' || isAddingToCart"
                class="w-full py-4 px-8 rounded-full font-bold mt-2 transition-all duration-200
                     bg-white border-2 border-sky-400 text-sky-600
                     hover:bg-sky-50
                 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <template v-if="isAddingToCart">
                <span class="inline-block w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mr-2" />
                담는 중...
              </template>
              <template v-else>
                <ShoppingCart :size="20" class="inline mr-2" />
                장바구니 담기
              </template>
            </button>

            <!-- Buy Now -->
            <button
                @click="buyNow"
                :disabled="product?.status === 'SOLD_OUT'"
                class="w-full py-4 px-8 rounded-full font-bold mt-2 transition-all duration-200
                     bg-sky-500 text-white
                     hover:bg-sky-600
                     disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              바로 구매하기
            </button>

            <!-- Sold Out Message -->
            <div
                v-show="product?.status === 'SOLD_OUT'"
                class="bg-slate-100 text-slate-500 text-center rounded-2xl py-5 font-semibold mt-4"
            >
              현재 품절된 상품입니다
            </div>

            <!-- Safety Badges -->
            <div class="flex gap-4 justify-center mt-4 text-xs text-slate-400">
              <span class="flex items-center gap-1">
                <Shield :size="14" />
                에스크로 결제
              </span>
              <span class="flex items-center gap-1">
                <Thermometer :size="14" />
                날씨 연동 배송
              </span>
              <span class="flex items-center gap-1">
                <Fish :size="14" />
                생물 사체 보상
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description & Reviews Section -->
      <div id="review-section" class="mt-12 border-t border-sky-100 pt-12">
        <!-- Tab Bar -->
        <div class="flex gap-6 border-b border-sky-100 mb-8">
          <button
              @click="activeTab = 'description'"
              :class="[
              'pb-3 transition-colors',
              activeTab === 'description'
                ? 'border-b-2 border-sky-500 text-sky-600 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            상품 설명
          </button>
          <button
              @click="activeTab = 'reviews'"
              :class="[
              'pb-3 transition-colors',
              activeTab === 'reviews'
                ? 'border-b-2 border-sky-500 text-sky-600 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            리뷰 ({{ product?.reviewCount || 0 }})
          </button>
          <button
              @click="activeTab = 'specs'"
              :class="[
              'pb-3 transition-colors',
              activeTab === 'specs'
                ? 'border-b-2 border-sky-500 text-sky-600 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            사육 정보
          </button>
        </div>

        <!-- Tab: Description -->
        <div v-show="activeTab === 'description'">
          <div
              v-if="product?.description"
              class="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap"
          >
            {{ product.description }}
          </div>
          <p v-else class="text-slate-400 text-center py-12">
            등록된 상품 설명이 없습니다
          </p>
        </div>

        <!-- Tab: Reviews -->
        <div v-show="activeTab === 'reviews'">
          <!-- Review Summary -->
          <ReviewSummary
              v-if="product"
              :average-rating="product.averageRating"
              :review-count="product.reviewCount"
              :rating-breakdown="ratingBreakdown"
          />

          <!-- Write Review Button -->
          <div class="flex justify-end mb-4">
            <button
                v-show="isLoggedIn && !myReview && !isWritingReview"
                @click="isWritingReview = true"
                class="px-6 py-2 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-colors"
            >
              리뷰 작성
            </button>
          </div>

          <!-- Review Write Form -->
          <ReviewWriteForm
              v-show="isWritingReview"
              :is-submitting="isSubmittingReview"
              @submit="handleReviewSubmit"
              @cancel="cancelReviewForm"
          />

          <!-- Review List -->
          <div class="space-y-0">
            <template v-for="review in reviews" :key="review.id">
              <!-- Edit Form -->
              <ReviewWriteForm
                  v-if="editingReviewId === review.id"
                  :initial-data="{ rating: review.rating, content: review.content, imageUrls: review.imageUrls }"
                  :is-editing="true"
                  :is-submitting="isSubmittingReview"
                  @submit="handleReviewSubmit"
                  @cancel="cancelReviewForm"
              />
              <!-- Review Card -->
              <ReviewCard
                  v-else
                  :review="review"
                  :current-user-id="currentUserId"
                  @edit="handleReviewEdit"
                  @delete="handleReviewDelete"
              />
            </template>
          </div>

          <!-- Load More -->
          <div class="mt-6 text-center">
            <button
                v-show="reviewHasMore && !isLoadingReviews"
                @click="loadMoreReviews"
                class="px-6 py-2 text-slate-500 font-medium rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              리뷰 더 보기
            </button>
            <div v-show="isLoadingReviews" class="text-slate-400 text-sm">
              로딩 중...
            </div>
            <p v-show="!reviewHasMore && reviews.length > 0" class="text-slate-400 text-sm">
              모든 리뷰를 불러왔어요
            </p>
            <p v-show="!isLoadingReviews && reviews.length === 0" class="text-slate-400 py-12">
              아직 작성된 리뷰가 없습니다
            </p>
          </div>
        </div>

        <!-- Tab: Specs -->
        <div v-show="activeTab === 'specs'">
          <ProductBioSpecs
              v-if="product"
              :water-type="product.waterType"
              :difficulty="product.difficulty"
              :water-temperature-min="product.waterTemperatureMin"
              :water-temperature-max="product.waterTemperatureMax"
              :ph-min="product.phMin"
              :ph-max="product.phMax"
              :is-compatible="product.isCompatible"
              :minimum-tank-size="product.minimumTankSize"
              :brand="product.brand"
              :expanded="true"
          />
          <p
              v-if="!product?.waterType && !product?.difficulty"
              class="text-slate-400 text-center py-12"
          >
            등록된 사육 정보가 없습니다
          </p>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
    >
      <div
          v-if="showAddedToast"
          class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
      >
        <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check :size="14" class="text-white" />
        </div>
        <span class="font-medium">장바구니에 담았어요</span>
        <router-link
            to="/cart"
            class="text-sky-400 hover:text-sky-300 text-sm font-medium ml-2"
        >
          바로가기 →
        </router-link>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.heart-pop {
  animation: heartPop 0.3s ease;
}
@keyframes heartPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
