<script setup lang="ts">
const features = [
  { icon: '📦', text: '손쉬운 모바일 경매 등록' },
  { icon: '📊', text: '판매 분석 대시보드 제공' },
  { icon: '🔔', text: '단골 구독자 자동 알림' },
]
</script>

<template>
  <section id="join" class="py-16 md:py-24 bg-slate-900">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Left Content -->
        <div class="space-y-6">
          <span class="text-sky-400 text-sm font-semibold uppercase tracking-widest">
            판매자를 위한 플랫폼
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
            내 어장을,<br />
            전국에 알리세요
          </h2>
          <p class="text-slate-400 text-lg leading-relaxed max-w-md">
            입점 수족관부터 홈 브리더까지. 아쿠아 Hub에서 새로운 판로를 시작하세요.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button class="px-8 py-4 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-all duration-200 hover:shadow-lg">
              수족관 입점 신청
            </button>
            <button class="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-200">
              브리더 등록
            </button>
          </div>
        </div>

        <!-- Right Features -->
        <div class="space-y-6">
          <div
            v-for="feature in features"
            :key="feature.text"
            class="flex items-center gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50"
          >
            <span class="text-3xl">{{ feature.icon }}</span>
            <span class="text-white font-medium text-lg">{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
