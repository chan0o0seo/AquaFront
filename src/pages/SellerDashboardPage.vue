<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, Package, Plus, Gavel, TrendingUp,
  Bell, Settings, ChevronRight, Edit, Loader2
} from 'lucide-vue-next'
import SellerStatsGrid from '@/components/seller/SellerStatsGrid.vue'
import SellerProductList from '@/components/seller/SellerProductList.vue'
import { useSellerApplication } from '@/composables/useSellerApplication'
import { sellerApi, getThumbnailUrl, type SellerStats, type ProductDetail } from '@/api'

const router = useRouter()
const { profileData, fetchProfile } = useSellerApplication()

// Active tab
const activeTab = ref<'home' | 'products'>('home')

const stats = ref<SellerStats | null>(null)
const recentProducts = ref<ProductDetail[]>([])
const isLoadingHome = ref(false)

onMounted(async () => {
  isLoadingHome.value = true
  try {
    await fetchProfile()
    const [statsData, productsData] = await Promise.all([
      sellerApi.getStats(),
      sellerApi.getMyProducts(),
    ])
    stats.value = statsData
    recentProducts.value = productsData.slice(0, 5)
  } catch (e) {
    console.error('Failed to load seller dashboard', e)
  } finally {
    isLoadingHome.value = false
  }
})

const statusBadge = (status: string) => {
  if (status === 'ACTIVE')   return 'bg-emerald-100 text-emerald-700'
  if (status === 'SOLD_OUT') return 'bg-slate-100 text-slate-500'
  return 'bg-red-100 text-red-500'
}
const statusText = (status: string) => {
  if (status === 'ACTIVE')   return '판매중'
  if (status === 'SOLD_OUT') return '품절'
  return '삭제됨'
}

// Seller sidebar nav
const navItems = [
  { key: 'home',     icon: LayoutDashboard, label: '판매자 홈' },
  { key: 'products', icon: Package,         label: '내 상품 관리' },
]

const goToNewProduct = () => router.push('/seller/products/new')
const goToProfileEdit = () => router.push('/seller/profile/edit')
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <div class="flex gap-8">
        <!-- ── Seller Sidebar ── -->
        <aside class="w-64 flex-shrink-0">
          <div class="sticky top-24">
            <!-- Profile Card -->
            <div class="bg-sky-50 rounded-2xl p-6 border border-sky-100 mb-6">
              <!-- Logo / Avatar -->
              <div class="flex justify-center">
                <div
                  v-if="profileData?.logoImageUrl"
                  class="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-200"
                >
                  <img :src="profileData.logoImageUrl" alt="스토어 로고" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-teal-500
                         flex items-center justify-center text-white text-3xl font-black"
                >
                  {{ (profileData?.businessName ?? '아')[0] }}
                </div>
              </div>

              <!-- Name / Follower -->
              <div class="text-center mt-4">
                <div class="font-bold text-slate-900 text-lg">
                  {{ profileData?.businessName ?? '내 스토어' }}
                </div>
                <div class="text-sky-500 text-sm font-semibold mt-1">
                  팔로워 {{ profileData?.followerCount ?? 0 }}명
                </div>
              </div>

              <!-- Edit profile -->
              <button
                @click="goToProfileEdit"
                class="flex items-center justify-center gap-1 w-full mt-4 py-2 rounded-xl
                       text-sm text-sky-600 hover:bg-sky-100 transition-colors font-medium"
              >
                <Edit class="w-3.5 h-3.5" />
                프로필 편집
              </button>
            </div>

            <!-- Nav Menu -->
            <nav class="space-y-1 mb-4">
              <button
                v-for="item in navItems"
                :key="item.key"
                @click="activeTab = item.key as 'home' | 'products'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
                       transition-colors duration-150 text-left"
                :class="activeTab === item.key
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span>{{ item.label }}</span>
              </button>
            </nav>

            <!-- Shortcuts -->
            <div class="space-y-1 border-t border-sky-100 pt-4">
              <button
                @click="goToNewProduct"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <Plus class="w-5 h-5" />
                상품 등록
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-400 cursor-not-allowed opacity-60"
                disabled
              >
                <Gavel class="w-5 h-5" />
                경매 관리
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-400 cursor-not-allowed opacity-60"
                disabled
              >
                <TrendingUp class="w-5 h-5" />
                판매 분석
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-400 cursor-not-allowed opacity-60"
                disabled
              >
                <Bell class="w-5 h-5" />
                팔로워 알림 설정
              </button>
              <button
                @click="goToProfileEdit"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <Settings class="w-5 h-5" />
                판매자 정보 수정
              </button>
            </div>
          </div>
        </aside>

        <!-- ── Main Content ── -->
        <div class="flex-1 min-w-0">

          <!-- ── TAB: 판매자 홈 ── -->
          <div v-show="activeTab === 'home'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">판매자 홈</h1>

            <!-- Loading -->
            <div v-if="isLoadingHome" class="flex justify-center py-16">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>

            <template v-else>
            <!-- Stats grid -->
            <SellerStatsGrid :stats="stats ?? { totalProducts: 0, soldCount: 0, activeAuctions: 0, followerCount: profileData?.followerCount ?? 0, monthlyRevenue: 0 }" />

            <!-- Mini product list -->
            <section class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-slate-900">내 상품 현황</h2>
                <button
                  @click="activeTab = 'products'"
                  class="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600
                         font-semibold transition-colors"
                >
                  전체 상품 관리
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>

              <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                <div
                  v-for="(product, idx) in recentProducts"
                  :key="product.id"
                  class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-sky-50/50"
                  :class="{ 'border-b border-sky-50': idx < recentProducts.length - 1 }"
                >
                  <!-- Thumbnail -->
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100
                           flex items-center justify-center flex-shrink-0 overflow-hidden"
                  >
                    <img
                      v-if="getThumbnailUrl(product)"
                      :src="getThumbnailUrl(product)!"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <Package v-else class="w-6 h-6 text-sky-300" />
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ product.name }}</p>
                    <p class="text-slate-400 text-xs mt-0.5">재고 {{ product.stock }}개</p>
                  </div>

                  <!-- Price & Status -->
                  <div class="text-right flex-shrink-0">
                    <p class="font-bold text-sky-600 text-sm">₩{{ product.price.toLocaleString() }}</p>
                    <span
                      class="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      :class="statusBadge(product.status)"
                    >{{ statusText(product.status) }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Quick actions -->
            <section class="mt-8">
              <h2 class="text-xl font-bold text-slate-900 mb-4">빠른 메뉴</h2>
              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="goToNewProduct"
                  class="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white
                         rounded-2xl p-5 font-semibold transition-colors text-left"
                >
                  <Plus class="w-6 h-6 flex-shrink-0" />
                  <div>
                    <div class="font-bold">상품 등록</div>
                    <div class="text-sky-100 text-xs mt-0.5">새 상품을 등록해보세요</div>
                  </div>
                </button>
                <button
                  @click="activeTab = 'products'"
                  class="flex items-center gap-3 bg-sky-50 hover:bg-sky-100 text-slate-700
                         rounded-2xl p-5 font-semibold transition-colors text-left
                         border border-sky-100"
                >
                  <Package class="w-6 h-6 text-sky-500 flex-shrink-0" />
                  <div>
                    <div class="font-bold text-slate-800">상품 관리</div>
                    <div class="text-slate-400 text-xs mt-0.5">재고와 상태를 관리하세요</div>
                  </div>
                </button>
              </div>
            </section>
            </template>
          </div>

          <!-- ── TAB: 내 상품 관리 ── -->
          <div v-show="activeTab === 'products'">
            <SellerProductList />
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
