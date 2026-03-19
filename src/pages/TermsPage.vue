<script setup lang="ts">
const sections = [
  {
    title: '제1조 (목적)',
    content: '이 약관은 아쿠아 Hub(이하 "회사")가 제공하는 아쿠아 Hub 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (정의)',
    content: '"서비스"란 회사가 제공하는 물생활 관련 상품 거래, 실시간 경매, 커뮤니티 등 모든 온라인 서비스를 의미합니다. "이용자"란 이 약관에 동의하고 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.',
  },
  {
    title: '제3조 (약관의 효력 및 변경)',
    content: '이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 화면에 공시함으로써 효력이 발생합니다.',
  },
  {
    title: '제4조 (서비스 이용)',
    content: '서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다. 회사는 서비스를 일정 범위로 분할하여 각 범위 별로 이용 가능 시간을 별도로 정할 수 있습니다.',
  },
  {
    title: '제5조 (이용자의 의무)',
    content: '이용자는 관계 법령, 이 약관의 규정, 이용 안내 및 주의사항 등 회사가 공지하는 사항을 준수하여야 하며, 기타 회사 업무에 방해되는 행위를 하여서는 안 됩니다.',
  },
  {
    title: '제6조 (금지행위)',
    content: '이용자는 서비스를 이용함에 있어 다음 행위를 해서는 안 됩니다: 허위 정보 등록, 타인의 정보 도용, 회사의 저작권 등 지식재산권 침해, 서비스 운영을 방해하는 행위, 불법 거래, 욕설·비방 등 타인의 명예를 훼손하는 행위.',
  },
  {
    title: '제7조 (면책조항)',
    content: '회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 회사는 책임을 지지 않습니다.',
  },
  {
    title: '제8조 (분쟁 해결)',
    content: '회사와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할 법원에 제소합니다. 이 약관은 대한민국 법률에 따라 규율되고 해석됩니다.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">서비스 이용약관</h1>
        <p class="text-slate-500 text-sm">시행일: 2025년 3월 1일</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="bg-white rounded-2xl border border-sky-100 divide-y divide-slate-50">
        <div v-for="section in sections" :key="section.title" class="px-6 py-6">
          <h2 class="font-black text-slate-800 text-sm mb-2">{{ section.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed">{{ section.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
