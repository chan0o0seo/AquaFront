<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const plans = [
  {
    name: '바이어',
    price: '무료',
    desc: '구매만 원하는 일반 회원',
    color: 'border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-600',
    features: [
      '상품 검색 및 구매',
      '실시간 경매 참여',
      '커뮤니티 이용',
      '판매자 팔로우',
      '리뷰 작성',
    ],
  },
  {
    name: '판매자',
    price: '무료',
    sub: '수수료 5%',
    desc: '상품 판매 및 경매를 열고 싶은 분',
    color: 'border-sky-400 ring-2 ring-sky-100',
    badgeColor: 'bg-sky-500 text-white',
    badge: '인기',
    features: [
      '바이어 혜택 전체 포함',
      '상품 등록 및 판매',
      '실시간 경매 개설',
      '판매자 스토어 페이지',
      '판매 통계 대시보드',
      '정산 계좌 등록',
    ],
  },
]

const fees = [
  { type: '일반 상품 판매', rate: '5%', note: '구매 확정 금액 기준' },
  { type: '경매 낙찰', rate: '5%', note: '낙찰 금액 기준' },
  { type: '결제 수수료', rate: '0%', note: '아쿠아 Hub 부담' },
  { type: '정산 소요', rate: '영업일 3일', note: '구매 확정 기준' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">요금 안내</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub는 기본 이용이 무료입니다. 판매 시에만 수수료가 발생합니다.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-12">
      <!-- 플랜 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 max-w-2xl mx-auto">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="bg-white rounded-2xl border p-6 flex flex-col"
          :class="plan.color"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-black text-slate-800">{{ plan.name }}</span>
            <span v-if="plan.badge" :class="['text-xs font-semibold px-2 py-0.5 rounded-full', plan.badgeColor]">{{ plan.badge }}</span>
            <span v-else :class="['text-xs font-semibold px-2 py-0.5 rounded-full', plan.badgeColor]">{{ plan.name[0] }}</span>
          </div>
          <p class="text-xs text-slate-400 mb-4">{{ plan.desc }}</p>
          <div class="mb-5">
            <span class="text-2xl font-black text-slate-800">{{ plan.price }}</span>
            <span v-if="plan.sub" class="text-sm text-slate-500 ml-1">+ {{ plan.sub }}</span>
          </div>
          <ul class="space-y-2 flex-1">
            <li v-for="f in plan.features" :key="f" class="flex items-center gap-2 text-xs text-slate-600">
              <Check class="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
              {{ f }}
            </li>
          </ul>
          <RouterLink
            to="/seller/apply"
            class="mt-6 block text-center py-2.5 rounded-full text-sm font-semibold transition-colors"
            :class="plan.name === '판매자' ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-sky-300'"
          >
            {{ plan.name === '바이어' ? '무료 시작' : '신청하기' }}
          </RouterLink>
        </div>
      </div>

      <!-- 수수료 상세 -->
      <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-sky-50">
          <h2 class="font-black text-slate-800 text-sm">수수료 상세</h2>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="fee in fees" :key="fee.type" class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-700">{{ fee.type }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ fee.note }}</p>
            </div>
            <span class="text-sm font-black text-sky-600">{{ fee.rate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
