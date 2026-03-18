import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // DevTools는 개발 환경에서만
    mode === 'development' && vueDevTools(),
  ].filter(Boolean),

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2/authorization': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    // 청크 경고 한도 (기본 500kB → 700kB)
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        // node_modules를 역할별로 청크 분리
        manualChunks(id) {
          // Tiptap 에디터 관련 → editor 청크 (판매자 전용, 일반 사용자에게 불필요)
          if (id.includes('@tiptap')) return 'editor'

          // Vue 핵심 런타임
          if (id.includes('node_modules/vue/') ||
              id.includes('node_modules/vue-router/') ||
              id.includes('node_modules/@vue/')) return 'vue'

          // 상태관리 + HTTP
          if (id.includes('node_modules/pinia') ||
              id.includes('node_modules/axios')) return 'state'

          // 아이콘 (lucide-vue-next는 tree-shaking 되지만 청크 분리로 캐시 효율 ↑)
          if (id.includes('node_modules/lucide-vue-next')) return 'icons'
        },
      },
    },
  },
}))
