<script setup lang="ts">
import { Mail, Building2, Fish, Users } from 'lucide-vue-next'
import { ref } from 'vue'

const types = [
  { icon: Building2, title: '수족관·펫샵 입점', desc: '오프라인 수족관이나 펫샵을 운영 중이라면 판매자로 입점해 온라인 판로를 넓히세요.' },
  { icon: Fish, title: '브리더 파트너십', desc: '전문 브리더 인증을 통해 희귀 어종을 더 많은 애호가에게 공급할 수 있습니다.' },
  { icon: Users, title: '마케팅·콘텐츠 제휴', desc: '물생활 관련 콘텐츠 크리에이터, 유튜버, 블로거와의 제휴를 환영합니다.' },
  { icon: Mail, title: '기타 비즈니스 제휴', desc: '사료, 용품, 수조 제조사 등 다양한 비즈니스 파트너십을 논의합니다.' },
]

const form = ref({ company: '', name: '', email: '', phone: '', type: '', message: '' })
const submitted = ref(false)

const submit = () => {
  // 실제 연동 없이 UI 시연
  submitted.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">제휴 문의</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub와 함께 성장할 파트너를 환영합니다.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <!-- 제휴 유형 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="t in types"
          :key="t.title"
          class="bg-white rounded-2xl border border-sky-100 p-5 flex gap-4"
        >
          <div class="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <component :is="t.icon" class="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800 mb-1">{{ t.title }}</p>
            <p class="text-xs text-slate-500 leading-relaxed">{{ t.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 제휴 문의 폼 -->
      <div class="bg-white rounded-2xl border border-sky-100 p-6">
        <div v-if="submitted" class="text-center py-10">
          <Mail class="w-10 h-10 text-sky-400 mx-auto mb-3" />
          <p class="font-semibold text-slate-800 mb-1">문의가 접수되었습니다</p>
          <p class="text-sm text-slate-500">담당자가 영업일 기준 2~3일 내에 연락드립니다.</p>
        </div>

        <template v-else>
          <h2 class="font-black text-slate-800 mb-5 text-sm">문의 양식</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">회사/브랜드명</label>
              <input v-model="form.company" type="text" placeholder="아쿠아 스튜디오" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">담당자 성명</label>
              <input v-model="form.name" type="text" placeholder="홍길동" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">이메일</label>
              <input v-model="form.email" type="email" placeholder="contact@company.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">연락처</label>
              <input v-model="form.phone" type="tel" placeholder="010-0000-0000" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">제휴 유형</label>
              <select v-model="form.type" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 bg-white">
                <option value="">선택해주세요</option>
                <option>수족관·펫샵 입점</option>
                <option>브리더 파트너십</option>
                <option>마케팅·콘텐츠 제휴</option>
                <option>기타 비즈니스 제휴</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">문의 내용</label>
              <textarea v-model="form.message" rows="4" placeholder="제휴 목적과 내용을 간략히 설명해주세요" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 resize-none" />
            </div>
          </div>
          <button @click="submit" class="mt-4 w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full text-sm transition-colors">
            문의 제출하기
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
