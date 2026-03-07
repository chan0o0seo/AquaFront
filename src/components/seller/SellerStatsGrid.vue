<script setup lang="ts">
import { TrendingUp, Package, Gavel, Users } from 'lucide-vue-next'

interface Stats {
  totalProducts: number
  soldCount: number
  activeAuctions: number
  followerCount: number
}

const props = defineProps<{
  stats: Stats
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    <div class="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wide">판매 완료</span>
        <TrendingUp class="w-4 h-4 text-emerald-400" />
      </div>
      <div class="text-3xl font-black text-slate-900">{{ stats.soldCount }}</div>
      <div class="text-sm text-slate-500 mt-1">건</div>
    </div>

    <!-- 진행 중 경매 -->
    <div class="bg-amber-50 rounded-2xl p-5 border border-amber-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-amber-600 uppercase tracking-wide">진행 경매</span>
        <Gavel class="w-4 h-4 text-amber-400" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-3xl font-black text-slate-900">{{ stats.activeAuctions }}</span>
        <span
          v-if="stats.activeAuctions > 0"
          class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold"
        >경매중</span>
      </div>
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
</template>
