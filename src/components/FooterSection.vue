<script setup lang="ts">
import { Fish } from 'lucide-vue-next'

const footerLinks = [
  {
    title: '서비스 소개',
    links: ['회사 소개', '이용 가이드', '요금 안내', '제휴 문의']
  },
  {
    title: '입점 안내',
    links: ['수족관 입점', '브리더 등록', '판매자 센터', '배송 정책']
  },
  {
    title: '고객센터',
    links: ['자주 묻는 질문', '1:1 문의', '공지사항', '이벤트']
  },
  {
    title: '이용약관',
    links: ['서비스 이용약관', '개인정보처리방침', '위치기반서비스', '청소년보호정책']
  },
]
</script>

<template>
  <footer class="bg-slate-900 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Top Section -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
        <!-- Logo & Tagline -->
        <div class="col-span-2 md:col-span-1">
          <a href="#" class="flex items-center gap-2 mb-4">
            <Fish class="w-7 h-7 text-sky-500" />
            <span class="text-xl font-bold text-white">아쿠아 Hub</span>
          </a>
          <p class="text-slate-400 text-sm leading-relaxed">
            국내 최대 물생활<br />이커머스 생태계
          </p>
        </div>

        <!-- Link Columns -->
        <div
          v-for="column in footerLinks"
          :key="column.title"
          class="space-y-4"
        >
          <h4 class="text-white font-semibold">{{ column.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in column.links" :key="link">
              <a href="#" class="text-slate-400 text-sm hover:text-sky-400 transition-colors">
                {{ link }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-slate-500 text-sm">
          © 2025 아쿠아 Hub. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.89 6h-1.667c-.598 0-.723.289-.723.711V10h2.39l-.31 2.5h-2.08V19h-2.5v-6.5H10V10h2v-1.9c0-1.99 1.21-3.1 3-3.1.85 0 1.59.063 1.89.09V8z"/>
            </svg>
          </a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
