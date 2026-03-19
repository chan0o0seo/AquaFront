<script setup lang="ts">
import { Shield } from 'lucide-vue-next'

const policies = [
  {
    title: '청소년 보호 원칙',
    content: '아쿠아 Hub는 청소년이 건전하고 안전하게 서비스를 이용할 수 있도록 「청소년 보호법」을 준수하며, 청소년에게 유해한 정보가 유통되지 않도록 최선을 다합니다.',
  },
  {
    title: '청소년 유해 정보 차단',
    content: '서비스 내 청소년에게 유해한 내용이 포함된 게시물은 관련 법령에 따라 즉시 삭제 또는 차단됩니다. 이용자는 커뮤니티 게시판에 청소년 유해 정보를 게시할 수 없습니다.',
  },
  {
    title: '청소년 보호 책임자',
    content: '성명: 홍길동\n직위: 청소년보호 책임자\n연락처: youth@aquahub.kr\n\n청소년 유해 정보를 발견하신 경우 위 이메일로 신고해 주시기 바랍니다.',
  },
  {
    title: '불건전 정보 신고',
    content: '불건전한 정보를 발견한 경우 고객센터(1:1 문의) 또는 청소년 보호 책임자에게 신고해 주세요. 신고 접수 후 24시간 이내에 처리 결과를 안내드립니다.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-sky-50 rounded-2xl mb-4">
          <Shield class="w-6 h-6 text-sky-500" />
        </div>
        <h1 class="text-2xl font-black text-slate-800 mb-2">청소년보호정책</h1>
        <p class="text-slate-500 text-sm">시행일: 2025년 3월 1일</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 mb-6 text-sm text-slate-600 leading-relaxed">
        아쿠아 Hub는 청소년이 안전한 환경에서 서비스를 이용할 수 있도록 청소년보호정책을 수립·시행합니다.
      </div>

      <div class="bg-white rounded-2xl border border-sky-100 divide-y divide-slate-50">
        <div v-for="policy in policies" :key="policy.title" class="px-6 py-6">
          <h2 class="font-black text-slate-800 text-sm mb-2">{{ policy.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ policy.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
