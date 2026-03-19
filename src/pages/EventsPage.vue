<script setup lang="ts">
import { Gift } from 'lucide-vue-next'

const events = [
  {
    id: 1,
    tag: '진행중',
    tagColor: 'bg-red-500 text-white animate-pulse',
    title: '아쿠아 Hub 오픈 기념 첫 구매 할인',
    desc: '첫 구매 시 5,000원 할인 쿠폰을 드립니다.',
    period: '2025.03.01 ~ 2025.03.31',
    image: null,
  },
  {
    id: 2,
    tag: '진행중',
    tagColor: 'bg-red-500 text-white animate-pulse',
    title: '봄맞이 수초 특가전',
    desc: '인기 수초 상품을 최대 30% 할인된 가격으로 만나보세요.',
    period: '2025.03.15 ~ 2025.03.31',
    image: null,
  },
  {
    id: 3,
    tag: '예정',
    tagColor: 'bg-sky-100 text-sky-600',
    title: '4월 브리더 위크 경매 이벤트',
    desc: '국내 최고 브리더들이 참여하는 특별 경매 이벤트.',
    period: '2025.04.01 ~ 2025.04.07',
    image: null,
  },
  {
    id: 4,
    tag: '종료',
    tagColor: 'bg-slate-100 text-slate-400',
    title: '신규 가입 리워드 이벤트',
    desc: '회원가입 시 웰컴 포인트 1,000원을 지급했습니다.',
    period: '2025.01.01 ~ 2025.02.28',
    image: null,
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">이벤트</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub의 다양한 이벤트에 참여해 혜택을 누리세요.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-white rounded-2xl border border-sky-100 overflow-hidden"
          :class="event.tag === '종료' ? 'opacity-60' : ''"
        >
          <!-- 이미지 플레이스홀더 -->
          <div class="h-36 bg-gradient-to-r from-sky-100 to-sky-50 flex items-center justify-center">
            <Gift class="w-10 h-10 text-sky-300" />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-2">
              <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', event.tagColor]">{{ event.tag }}</span>
              <span class="text-xs text-slate-400">{{ event.period }}</span>
            </div>
            <p class="font-black text-slate-800 text-sm mb-1">{{ event.title }}</p>
            <p class="text-xs text-slate-500">{{ event.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
