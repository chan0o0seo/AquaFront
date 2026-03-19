<script setup lang="ts">
import { Truck, Clock, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const policies = [
  {
    icon: Truck,
    title: '배송 방법',
    color: 'bg-sky-50 text-sky-500',
    items: [
      '생물 상품은 생물 전용 포장(산소포장, 보냉 처리)으로 발송됩니다.',
      '용품·사료 등 비생물 상품은 일반 택배로 발송됩니다.',
      '판매자마다 이용하는 택배사가 다를 수 있습니다.',
      '일부 지역(도서·산간)은 추가 배송비가 발생할 수 있습니다.',
    ],
  },
  {
    icon: Clock,
    title: '배송 기간',
    color: 'bg-emerald-50 text-emerald-500',
    items: [
      '결제 완료 후 평균 1~3 영업일 내 발송됩니다.',
      '생물 상품은 기상 조건에 따라 발송이 지연될 수 있습니다.',
      '주말 및 공휴일에는 발송이 이루어지지 않습니다.',
      '발송 후 수도권 기준 1~2일, 지방 기준 2~3일 소요됩니다.',
    ],
  },
  {
    icon: AlertCircle,
    title: '생물 배송 주의사항',
    color: 'bg-amber-50 text-amber-500',
    items: [
      '생물은 살아있는 상태로 발송되나, 장거리·고온·혹한기 배송 시 폐사 위험이 있습니다.',
      '수령 즉시 개봉하여 상태를 확인해 주세요.',
      '폐사 도착 시 수령 후 1시간 이내에 사진을 첨부하여 판매자에게 신고하세요.',
      '판매자 정책에 따라 보상 기준이 다를 수 있습니다.',
    ],
  },
  {
    icon: RefreshCw,
    title: '반품·교환',
    color: 'bg-purple-50 text-purple-500',
    items: [
      '생물 상품 특성상 단순 변심에 의한 반품은 불가합니다.',
      '상품 불량·오배송의 경우 수령 후 24시간 이내에 고객센터로 문의하세요.',
      '비생물 상품은 수령 후 7일 이내 미개봉 상태에서 반품 가능합니다.',
      '반품 배송비는 귀책 사유에 따라 구매자 또는 판매자가 부담합니다.',
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">배송 정책</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub의 배송 및 반품 정책을 안내합니다.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-12 space-y-5">
      <div
        v-for="policy in policies"
        :key="policy.title"
        class="bg-white rounded-2xl border border-sky-100 p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <div :class="['w-9 h-9 rounded-xl flex items-center justify-center', policy.color]">
            <component :is="policy.icon" class="w-4 h-4" />
          </div>
          <h2 class="font-black text-slate-800 text-sm">{{ policy.title }}</h2>
        </div>
        <ul class="space-y-2">
          <li v-for="item in policy.items" :key="item" class="flex items-start gap-2 text-sm text-slate-600">
            <span class="w-1 h-1 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
            {{ item }}
          </li>
        </ul>
      </div>

      <p class="text-xs text-slate-400 text-center pt-2">
        배송 관련 추가 문의는 <RouterLink to="/support" class="text-sky-500 hover:underline">고객센터</RouterLink>를 이용해 주세요.
      </p>
    </div>
  </div>
</template>
