<script setup lang="ts">
import { TrendingUp, Package, Gavel, Users, ShoppingBag } from 'lucide-vue-next'

const props = defineProps<{
  stats: {
    totalProducts: number
    soldCount: number
    activeAuctions: number
    followerCount: number
    monthlyRevenue: number
  }
}>()

const formatRevenue = (n: number) => {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString()
}
</script>

<template>
  <div class="grid grid-cols-5 gap-3">
    <!-- 이번달 매출 -->
    <div class="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 col-span-2">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wide">이번달 매출</span>
        <TrendingUp class="w-4 h-4 text-emerald-400" />
      </div>
      <div class="text-3xl font-black text-slate-900">
        {{ formatRevenue(stats.monthlyRevenue) }}
      </div>
      <div class="text-sm text-slate-500 mt-1">원</div>
    </div>

    <!-- 등록 상품 -->
    <div class="bg-sky-50 rounded-2xl p-5 border border-sky-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-sky-600 uppercase tracking-wide">등록 상품</span>
        <Package class="w-4 h-4 text-sky-400" />
      </div>
      <div class="text-3xl font-black text-slate-900">{{ stats.totalProducts }}</div>
      <div class="text-sm text-slate-500 mt-1">개</div>
    </div>

    <!-- 판매 완료 -->
    <div class="bg-amber-50 rounded-2xl p-5 border border-amber-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-amber-600 uppercase tracking-wide">판매 완료</span>
        <ShoppingBag class="w-4 h-4 text-amber-400" />
      </div>
      <div class="text-3xl font-black text-slate-900">{{ stats.soldCount }}</div>
      <div class="text-sm text-slate-500 mt-1">건</div>
    </div>

    <!-- 팔로워 -->
    <div class="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-purple-600 uppercase tracking-wide">팔로워</span>
        <Users class="w-4 h-4 text-purple-400" />
      </div>
      <div class="text-3xl font-black text-slate-900">{{ stats.followerCount }}</div>
      <div class="text-sm text-slate-500 mt-1">명</div>
    </div>
  </div>

  <!-- 진행 중 경매 — 별도 행 (LIVE 강조) -->
  <div
    v-if="stats.activeAuctions > 0"
    class="mt-3 flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3"
  >
    <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
    <Gavel class="w-4 h-4 text-red-500 flex-shrink-0" />
    <span class="text-sm font-bold text-red-600">경매 {{ stats.activeAuctions }}건 진행 중</span>
    <span class="text-xs text-red-400">실시간으로 입찰이 진행되고 있습니다</span>
  </div>
</template>
