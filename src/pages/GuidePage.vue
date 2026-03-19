<script setup lang="ts">
import { ShoppingBag, Gavel, Store, MessageSquare, ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const sections = [
  {
    icon: ShoppingBag,
    title: '쇼핑하기',
    color: 'bg-sky-50 text-sky-500',
    steps: [
      { step: '01', desc: '상품 검색 또는 스토어에서 원하는 어류·수초·용품을 탐색하세요.' },
      { step: '02', desc: '상품 상세 페이지에서 사양, 리뷰를 확인 후 장바구니에 담으세요.' },
      { step: '03', desc: '배송지와 결제 수단을 입력하고 주문을 완료하세요.' },
      { step: '04', desc: '배송 완료 후 구매확정하면 판매자에게 정산이 이루어집니다.' },
    ],
  },
  {
    icon: Gavel,
    title: '경매 참여하기',
    color: 'bg-amber-50 text-amber-500',
    steps: [
      { step: '01', desc: '경매 페이지에서 진행 중이거나 예정된 경매를 확인하세요.' },
      { step: '02', desc: '경매 상세에서 현재 최고가 이상의 입찰 금액을 입력하세요.' },
      { step: '03', desc: '경매 종료 시 최고가 입찰자가 낙찰되며 결제 안내를 받습니다.' },
      { step: '04', desc: '24시간 내 결제를 완료하면 거래가 성사됩니다.' },
    ],
  },
  {
    icon: Store,
    title: '판매하기',
    color: 'bg-emerald-50 text-emerald-500',
    steps: [
      { step: '01', desc: '판매자 신청 페이지에서 신청서를 작성하고 관리자 승인을 기다리세요.' },
      { step: '02', desc: '승인 후 판매자 프로필과 정산 계좌를 등록하세요.' },
      { step: '03', desc: '상품을 등록하거나 경매를 열어 판매를 시작하세요.' },
      { step: '04', desc: '구매 확정 후 정산 계좌로 수수료 차감 금액이 입금됩니다.' },
    ],
  },
  {
    icon: MessageSquare,
    title: '커뮤니티 이용하기',
    color: 'bg-purple-50 text-purple-500',
    steps: [
      { step: '01', desc: '커뮤니티 탭에서 자유게시판, 정보 공유, 질문 게시판을 이용하세요.' },
      { step: '02', desc: '글을 작성하거나 댓글로 다른 회원과 소통하세요.' },
      { step: '03', desc: '마음에 드는 판매자를 팔로우하면 새 상품·경매 알림을 받습니다.' },
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">이용 가이드</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub 서비스를 더 잘 활용하는 방법을 안내합니다.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div
        v-for="section in sections"
        :key="section.title"
        class="bg-white rounded-2xl border border-sky-100 overflow-hidden"
      >
        <div class="px-6 py-5 border-b border-sky-50 flex items-center gap-3">
          <div :class="['w-9 h-9 rounded-xl flex items-center justify-center', section.color]">
            <component :is="section.icon" class="w-4 h-4" />
          </div>
          <h2 class="font-black text-slate-800">{{ section.title }}</h2>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="s in section.steps" :key="s.step" class="px-6 py-4 flex items-start gap-4">
            <span class="text-xs font-black text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">{{ s.step }}</span>
            <p class="text-sm text-slate-600">{{ s.desc }}</p>
          </div>
        </div>
      </div>

      <div class="bg-sky-50 rounded-2xl border border-sky-100 p-6 flex items-center justify-between">
        <div>
          <p class="font-semibold text-slate-800 text-sm mb-1">더 궁금한 점이 있으신가요?</p>
          <p class="text-xs text-slate-500">고객센터에서 FAQ와 1:1 문의를 이용하실 수 있습니다.</p>
        </div>
        <RouterLink to="/support" class="flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700">
          고객센터 <ChevronRight class="w-4 h-4" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
