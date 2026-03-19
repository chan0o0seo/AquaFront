<script setup lang="ts">
const sections = [
  {
    title: '제1조 (목적)',
    content: '본 약관은 아쿠아 Hub(이하 "회사")가 제공하는 위치기반서비스에 대해 회사와 개인위치정보주체(이하 "이용자") 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (위치기반서비스 내용)',
    content: '회사는 이용자의 위치정보를 이용하여 다음의 서비스를 제공합니다.\n- 주변 수족관·판매자 검색 기능\n- 배송지 자동완성 서비스\n- 지역 기반 상품 추천 서비스',
  },
  {
    title: '제3조 (위치정보 수집)',
    content: '회사는 서비스 제공을 위해 이용자의 위치정보를 수집할 수 있습니다. 이용자는 언제든지 위치정보 수집에 대한 동의를 철회할 수 있으며, 동의 철회 시 일부 서비스 이용이 제한될 수 있습니다.',
  },
  {
    title: '제4조 (개인위치정보의 보유 목적 및 기간)',
    content: '위치정보는 서비스 제공 목적으로만 이용되며, 서비스 이용 종료 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우에는 해당 기간 동안 보관합니다.',
  },
  {
    title: '제5조 (이용자의 권리)',
    content: '이용자는 개인위치정보의 수집·이용·제공에 대한 동의 전부 또는 일부를 철회할 수 있습니다. 또한 개인위치정보의 수집·이용·제공의 일시적 중지를 요구할 수 있습니다.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">위치기반서비스 이용약관</h1>
        <p class="text-slate-500 text-sm">시행일: 2025년 3월 1일</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="bg-white rounded-2xl border border-sky-100 divide-y divide-slate-50">
        <div v-for="section in sections" :key="section.title" class="px-6 py-6">
          <h2 class="font-black text-slate-800 text-sm mb-2">{{ section.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ section.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
