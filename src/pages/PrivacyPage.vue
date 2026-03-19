<script setup lang="ts">
const sections = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: '회원가입 시: 이메일, 비밀번호, 닉네임\n판매자 신청 시: 사업자등록번호, 대표자명, 계좌정보\n서비스 이용 시: 접속 로그, IP 주소, 쿠키, 기기 정보\n결제 시: 결제 수단 정보(카드사에서 처리, 당사 미저장)',
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    content: '회원 가입 및 관리, 서비스 제공, 결제 처리 및 정산, 민원 처리, 고지사항 전달, 마케팅 및 광고(동의 시), 서비스 개선 및 통계 분석',
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    content: '원칙적으로 회원 탈퇴 시 즉시 삭제합니다. 단, 관련 법령에 따라 일정 기간 보관합니다.\n- 계약·청약철회 기록: 5년 (전자상거래법)\n- 대금결제 기록: 5년 (전자상거래법)\n- 소비자 불만·분쟁 기록: 3년 (전자상거래법)',
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content: '회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우에는 예외로 합니다.',
  },
  {
    title: '5. 이용자의 권리',
    content: '이용자는 언제든지 등록된 개인정보를 조회하거나 수정할 수 있으며, 개인정보 처리 동의 철회나 가입 해지를 요청할 수도 있습니다. 이용자의 개인정보 처리 관련 민원은 개인정보보호 담당자(privacy@aquahub.kr)에게 문의하실 수 있습니다.',
  },
  {
    title: '6. 개인정보보호 책임자',
    content: '성명: 홍길동\n직위: 개인정보보호 담당자\n연락처: privacy@aquahub.kr',
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">개인정보처리방침</h1>
        <p class="text-slate-500 text-sm">시행일: 2025년 3월 1일</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 mb-6 text-sm text-slate-600 leading-relaxed">
        아쿠아 Hub(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
        본 방침은 회사가 이용자의 개인정보를 어떻게 수집·이용·보호하는지 안내합니다.
      </div>

      <div class="bg-white rounded-2xl border border-sky-100 divide-y divide-slate-50">
        <div v-for="section in sections" :key="section.title" class="px-6 py-6">
          <h2 class="font-black text-slate-800 text-sm mb-2">{{ section.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ section.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
