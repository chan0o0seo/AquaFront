<script setup lang="ts">
import { Bell } from 'lucide-vue-next'

const notices = [
  { id: 1, badge: '서비스', title: '아쿠아 Hub 정식 서비스 오픈 안내', date: '2025.03.01', important: true },
  { id: 2, badge: '경매', title: '실시간 경매 기능 업데이트 안내', date: '2025.02.20', important: false },
  { id: 3, badge: '정책', title: '판매자 수수료 정책 안내', date: '2025.02.10', important: false },
  { id: 4, badge: '서비스', title: '소셜 로그인(카카오·네이버) 지원 안내', date: '2025.01.28', important: false },
  { id: 5, badge: '서비스', title: '커뮤니티 게시판 오픈 안내', date: '2025.01.15', important: false },
  { id: 6, badge: '점검', title: '정기 서버 점검 안내 (매주 화요일 새벽 2~4시)', date: '2025.01.01', important: false },
]

const expanded = ref<number | null>(null)
const toggle = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

import { ref } from 'vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 class="text-2xl font-black text-slate-800 mb-2">공지사항</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub의 새로운 소식을 전달합니다.</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div class="space-y-2">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="bg-white rounded-2xl border overflow-hidden"
          :class="notice.important ? 'border-sky-200' : 'border-sky-100'"
        >
          <button
            @click="toggle(notice.id)"
            class="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-sky-50/40 transition-colors"
          >
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              :class="notice.important ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'"
            >
              {{ notice.badge }}
            </span>
            <span class="text-sm font-semibold text-slate-800 flex-1 text-left">{{ notice.title }}</span>
            <span class="text-xs text-slate-400 flex-shrink-0">{{ notice.date }}</span>
          </button>
          <div v-if="expanded === notice.id" class="px-6 pb-5 pt-1 border-t border-sky-50">
            <p class="text-sm text-slate-600 leading-relaxed">
              안녕하세요, 아쿠아 Hub입니다.<br /><br />
              <strong>{{ notice.title }}</strong>와 관련하여 안내드립니다.<br /><br />
              서비스 이용에 불편이 없도록 최선을 다하겠습니다.<br />
              자세한 내용은 고객센터로 문의해 주세요.<br /><br />
              감사합니다.
            </p>
          </div>
        </div>
      </div>

      <div v-if="notices.length === 0" class="text-center py-20">
        <Bell class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-400 text-sm">등록된 공지사항이 없습니다.</p>
      </div>
    </div>
  </div>
</template>
