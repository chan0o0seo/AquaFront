<script setup lang="ts">
import { Fish, Users, ShoppingBag, Gavel, Star } from 'lucide-vue-next'

const stats = [
  { label: '등록 판매자', value: '2,400+' },
  { label: '누적 거래', value: '180,000+' },
  { label: '월 활성 사용자', value: '52,000+' },
  { label: '평균 만족도', value: '4.8 / 5' },
]

const values = [
  { icon: Users, title: '커뮤니티 중심', desc: '물생활을 사랑하는 사람들이 모여 지식과 경험을 나누는 플랫폼을 만듭니다.' },
  { icon: ShoppingBag, title: '신뢰할 수 있는 거래', desc: '검증된 판매자와 안전한 결제 시스템으로 믿을 수 있는 쇼핑 환경을 제공합니다.' },
  { icon: Gavel, title: '투명한 경매', desc: '실시간 경매 시스템으로 희귀 어종도 공정하게 거래할 수 있습니다.' },
  { icon: Star, title: '전문가 네트워크', desc: '국내 최고 브리더와 수족관 전문가들이 함께하는 프리미엄 생태계를 구축합니다.' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <!-- 히어로 -->
    <section class="bg-gradient-to-br from-sky-600 to-sky-400 text-white">
      <div class="max-w-4xl mx-auto px-6 py-20 text-center">
        <Fish class="w-14 h-14 mx-auto mb-5 opacity-90" />
        <h1 class="text-3xl font-black mb-4">아쿠아 Hub 소개</h1>
        <p class="text-sky-100 text-base leading-relaxed max-w-xl mx-auto">
          국내 최대 물생활 이커머스 플랫폼으로,<br />
          어류·수초·용품을 거래하고 브리더와 소통하는 공간입니다.
        </p>
      </div>
    </section>

    <!-- 통계 -->
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div v-for="stat in stats" :key="stat.label">
            <p class="text-2xl font-black text-sky-600 mb-1">{{ stat.value }}</p>
            <p class="text-sm text-slate-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 미션 -->
    <section class="max-w-4xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-xl font-black text-slate-800 mb-3">우리의 미션</h2>
        <p class="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
          아쿠아 Hub는 물생활 문화의 저변 확대와 지속 가능한 거래 생태계 조성을 목표로 합니다.
          브리더, 판매자, 애호가가 함께 성장하는 커뮤니티를 만들어 갑니다.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="v in values"
          :key="v.title"
          class="bg-white rounded-2xl border border-sky-100 p-6 flex gap-4"
        >
          <div class="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <component :is="v.icon" class="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p class="font-semibold text-slate-800 mb-1 text-sm">{{ v.title }}</p>
            <p class="text-xs text-slate-500 leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 연혁 -->
    <section class="bg-white border-t border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-16">
        <h2 class="text-xl font-black text-slate-800 mb-8 text-center">연혁</h2>
        <div class="space-y-6 max-w-lg mx-auto">
          <div v-for="(item, i) in [
            { year: '2025', desc: '아쿠아 Hub 정식 서비스 오픈, 실시간 경매 기능 출시' },
            { year: '2024', desc: '베타 서비스 운영, 브리더 파트너십 200개 체결' },
            { year: '2023', desc: '서비스 기획 및 개발 시작, 시드 투자 유치' },
          ]" :key="i" class="flex gap-6 items-start">
            <span class="text-sky-600 font-black text-sm w-12 flex-shrink-0">{{ item.year }}</span>
            <p class="text-sm text-slate-600">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
