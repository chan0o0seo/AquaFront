<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Menu, X, ShoppingCart, Fish, User, Store } from 'lucide-vue-next'
import { useSellerMode } from '@/composables/useSellerMode'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const { isSeller, isEligible, setSellerMode, setUserRole } = useSellerMode()
const cartStore = useCartStore()
const { cartItems } = storeToRefs(cartStore)

// For demo: simulate logged in seller
onMounted(() => {
  // Simulate a user with seller role for testing
  setUserRole('SELLER')
})
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: '쇼핑몰', href: '/#shop' },
  { name: '경매', href: '/#auction' },
  { name: '브리더샵', href: '/#breeder' },
  { name: '커뮤니티', href: '/#community' },
  { name: '입점안내', href: '/#join' },
]

const isLoggedIn = ref(true) // For demo purposes

// Handle seller mode toggle
const handleBuyerMode = () => {
  setSellerMode(false)
  if (route.path.startsWith('/mypage/seller') || route.path.startsWith('/seller/')) {
    router.push('/mypage')
  }
}

const handleSellerMode = () => {
  setSellerMode(true)
  router.push('/mypage/seller')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
    :class="[
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-white'
    ]"
  >
    <nav class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <Fish class="w-7 h-7 text-sky-500" />
          <span class="text-xl font-bold text-sky-600">아쿠아 Hub</span>
        </RouterLink>
        <!-- Seller Mode Badge -->
        <span 
          v-show="isSeller && isEligible" 
          class="hidden md:inline-flex px-3 py-1 bg-amber-100 text-amber-600 text-xs rounded-full font-semibold"
        >
          판매자 모드
        </span>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          class="text-slate-600 hover:text-sky-600 transition-colors duration-200 text-sm font-medium"
        >
          {{ link.name }}
        </a>
      </div>

      <!-- Seller Mode Toggle -->
      <div v-show="isEligible && isLoggedIn" class="hidden md:flex items-center">
        <div class="bg-slate-100 rounded-full p-1 flex items-center gap-1 text-sm">
          <button
            @click="handleBuyerMode"
            class="px-4 py-1.5 rounded-full cursor-pointer transition-all duration-200 font-medium"
            :class="[
              !isSeller 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            ]"
          >
            <ShoppingCart class="w-4 h-4 inline mr-1" />
            구매자
          </button>
          <button
            @click="handleSellerMode"
            class="px-4 py-1.5 rounded-full cursor-pointer transition-all duration-200 font-medium"
            :class="[
              isSeller 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            ]"
          >
            <Store class="w-4 h-4 inline mr-1" />
            판매자
          </button>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="hidden md:flex items-center gap-3">
        <template v-if="!isLoggedIn">
          <RouterLink 
            to="/login" 
            class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
          >
            로그인
          </RouterLink>
          <RouterLink 
            to="/register" 
            class="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors"
          >
            회원가입
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink 
            to="/mypage" 
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
          >
            <User class="w-4 h-4" />
            마이페이지
          </RouterLink>
        </template>
        <RouterLink to="/cart" class="relative p-2 text-slate-600 hover:text-sky-600 transition-colors">
          <ShoppingCart class="w-5 h-5" />
          <span 
            v-show="cartItems.length > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ cartItems.length }}
          </span>
        </RouterLink>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 text-slate-600"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Menu v-show="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-show="isMobileMenuOpen" class="w-6 h-6" />
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div
      v-show="isMobileMenuOpen"
      class="md:hidden bg-white border-t border-slate-100 shadow-lg"
    >
      <div class="px-6 py-4 space-y-3">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          class="block py-2 text-slate-600 hover:text-sky-600 transition-colors font-medium"
          @click="isMobileMenuOpen = false"
        >
          {{ link.name }}
        </a>
        <div class="pt-4 border-t border-slate-100 space-y-3">
          <template v-if="!isLoggedIn">
            <RouterLink 
              to="/login" 
              class="block w-full py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors text-center"
              @click="isMobileMenuOpen = false"
            >
              로그인
            </RouterLink>
            <RouterLink 
              to="/register" 
              class="block w-full py-3 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors text-center"
              @click="isMobileMenuOpen = false"
            >
              회원가입
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink 
              to="/mypage" 
              class="block w-full py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors text-center"
              @click="isMobileMenuOpen = false"
            >
              마이페이지
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
