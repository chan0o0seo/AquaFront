<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ShoppingCart, Fish } from 'lucide-vue-next'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: '쇼핑몰', href: '#shop' },
  { name: '경매', href: '#auction' },
  { name: '브리더샵', href: '#breeder' },
  { name: '커뮤니티', href: '#community' },
  { name: '입점안내', href: '#join' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
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
      <a href="#" class="flex items-center gap-2">
        <Fish class="w-7 h-7 text-sky-500" />
        <span class="text-xl font-bold text-sky-600">아쿠아 Hub</span>
      </a>

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

      <!-- Right Side Actions -->
      <div class="hidden md:flex items-center gap-3">
        <button class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
          로그인
        </button>
        <button class="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors">
          회원가입
        </button>
        <button class="relative p-2 text-slate-600 hover:text-sky-600 transition-colors">
          <ShoppingCart class="w-5 h-5" />
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 text-slate-600"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div
      v-if="isMobileMenuOpen"
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
          <button class="w-full py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
            로그인
          </button>
          <button class="w-full py-3 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors">
            회원가입
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
