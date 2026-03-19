<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Menu, X, ShoppingCart, Fish, User, Store, Search, Bell } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoggedIn, isSeller, isAdmin } = storeToRefs(authStore)
const cartStore = useCartStore()
const { cartItems } = storeToRefs(cartStore)

const isSellerMode = ref(localStorage.getItem('aquahub_seller_mode') === 'true')

const setSellerMode = (value: boolean) => {
  isSellerMode.value = value
  localStorage.setItem('aquahub_seller_mode', String(value))
}

const notificationStore = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(notificationStore)

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const showNotifications = ref(false)

const formatNotificationTime = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}시간 전`
  return `${d.getMonth() + 1}.${d.getDate()}`
}

const handleNotificationClick = async (n: typeof notifications.value[0]) => {
  if (!n.read) await notificationStore.markRead(n.id)
  showNotifications.value = false
  if (n.referenceId) {
    router.push(`/auction/${n.referenceId}`)
  }
}

// 드롭다운 바깥 클릭 시 닫기
const closeOnOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#notification-panel')) {
    showNotifications.value = false
  }
}
onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', closeOnOutsideClick))

const navLinks = [
  { name: '쇼핑몰', to: '/shop' },
  { name: '스토어', to: '/stores' },
  { name: '경매', to: '/auction' },
  { name: '커뮤니티', to: '/community' },
  { name: '고객센터', to: '/support' },
]

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

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeOnOutsideClick)
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
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="text-slate-600 hover:text-sky-600 transition-colors duration-200 text-sm font-medium"
        >
          {{ link.name }}
        </RouterLink>
      </div>

      <!-- Seller Mode Toggle -->
      <div v-show="isSeller && isLoggedIn && (route.path === '/mypage' || route.path === '/mypage/seller')" class="hidden md:flex items-center">
        <div class="bg-slate-100 rounded-full p-1 flex items-center gap-1 text-sm">
          <button
            @click="handleBuyerMode"
            class="px-4 py-1.5 rounded-full cursor-pointer transition-all duration-200 font-medium"
            :class="[
              !isSellerMode
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
              isSellerMode
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
            :to="isAdmin ? '/admin' : isSeller ? '/mypage/seller' : '/mypage'"
            @click="setSellerMode(true)"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
          >
            <User class="w-4 h-4" />
            {{ isAdmin ? '관리자 센터' : isSeller ? '판매자 센터' : '마이페이지' }}
          </RouterLink>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            로그아웃
          </button>
        </template>
        <button
          @click="router.push('/shop')"
          class="p-2 text-slate-600 hover:text-sky-600 transition-colors"
          aria-label="검색"
        >
          <Search class="w-5 h-5" />
        </button>
        <!-- 알림 벨 -->
        <div v-if="isLoggedIn" id="notification-panel" class="relative">
          <button
            @click.stop="showNotifications = !showNotifications"
            class="relative p-2 text-slate-600 hover:text-sky-600 transition-colors"
            aria-label="알림"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- 알림 드롭다운 -->
          <div
            v-if="showNotifications"
            class="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-sky-100 z-50 overflow-hidden"
          >
            <!-- 헤더 -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-sky-50">
              <span class="font-black text-slate-800 text-sm">알림</span>
              <button
                v-if="unreadCount > 0"
                @click="notificationStore.markAllRead()"
                class="text-xs text-sky-500 hover:text-sky-700 font-medium"
              >
                전체 읽음
              </button>
            </div>

            <!-- 알림 목록 -->
            <div class="max-h-80 overflow-y-auto">
              <div v-if="notifications.length === 0" class="py-10 text-center">
                <Bell class="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p class="text-sm text-slate-400">알림이 없습니다</p>
              </div>

              <div
                v-for="n in notifications"
                :key="n.id"
                @click="handleNotificationClick(n)"
                class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-sky-50 transition-colors border-b border-slate-50 last:border-0"
                :class="!n.read ? 'bg-sky-50/60' : ''"
              >
                <!-- 읽음 표시 -->
                <span
                  class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                  :class="!n.read ? 'bg-sky-500' : 'bg-transparent'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 leading-snug">{{ n.title }}</p>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                  <p class="text-xs text-slate-300 mt-1">{{ formatNotificationTime(n.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="block py-2 text-slate-600 hover:text-sky-600 transition-colors font-medium"
          @click="isMobileMenuOpen = false"
        >
          {{ link.name }}
        </RouterLink>
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
              :to="isAdmin ? '/admin' : isSeller ? '/mypage/seller' : '/mypage'"
              class="block w-full py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors text-center"
              @click="isMobileMenuOpen = false"
            >
              {{ isAdmin ? '관리자 센터' : isSeller ? '판매자 센터' : '마이페이지' }}
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
