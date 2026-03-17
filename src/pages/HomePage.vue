<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 폴드 위(즉시 보이는 영역) — 동기 import 유지
import HeroSection from '@/components/HeroSection.vue'
import CategorySection from '@/components/CategorySection.vue'

// 폴드 아래(스크롤해야 보이는 영역) — 비동기 로드
const LiveAuctionSection = defineAsyncComponent(() => import('@/components/LiveAuctionSection.vue'))
const ProductSection     = defineAsyncComponent(() => import('@/components/ProductSection.vue'))
const SellerBanner       = defineAsyncComponent(() => import('@/components/SellerBanner.vue'))
const GallerySection     = defineAsyncComponent(() => import('@/components/GallerySection.vue'))
const TrustBar           = defineAsyncComponent(() => import('@/components/TrustBar.vue'))
</script>

<template>
  <main>
    <HeroSection />
    <CategorySection />
    <LiveAuctionSection />
    <ProductSection />
    <SellerBanner />
    <GallerySection />
    <TrustBar />
  </main>
</template>
