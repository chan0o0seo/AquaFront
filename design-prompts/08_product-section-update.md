# Prompt: 홈 상품 섹션 업데이트 (ProductSection Component)

Rewrite the following **Vue 3 Single File Component** (`ProductSection.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
Keep all existing visual design exactly the same — only add router navigation and wishlist toggle functionality.

---

## Existing Code to Rewrite

```vue
<script setup lang="ts">
import { Heart, ShoppingCart } from 'lucide-vue-next'

const products = [
  { id: 1, name: '네온 테트라 (10마리)',      store: '서울 강남 수족관',      price: '₩12,000', difficulty: 2, liked: false },
  { id: 2, name: '카디널 테트라 (5마리)',      store: '부산 해운대 아쿠아',    price: '₩15,000', difficulty: 2, liked: true  },
  { id: 3, name: '코리도라스 스테르바이',      store: '대전 수족관 월드',      price: '₩8,500',  difficulty: 1, liked: false },
  { id: 4, name: '엔젤피쉬 블랙',             store: '인천 송도 아쿠아리움',  price: '₩25,000', difficulty: 3, liked: false },
  { id: 5, name: '구피 코브라 (1쌍)',         store: '대구 팔공 수족관',      price: '₩18,000', difficulty: 1, liked: true  },
  { id: 6, name: '베타 하프문 레드',          store: '광주 상무 아쿠아',      price: '₩35,000', difficulty: 2, liked: false },
  { id: 7, name: '플레코 브리슬노즈',         store: '서울 홍대 피쉬샵',      price: '₩15,000', difficulty: 1, liked: false },
  { id: 8, name: '레드 체리 쉬림프 (10마리)', store: '수원 영통 수족관',      price: '₩12,000', difficulty: 2, liked: true  },
]

const getDifficultyStars = (level: number) => '★'.repeat(level) + '☆'.repeat(3 - level)
</script>

<template>
  <section id="shop" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-2">지금 인기있는 생물</h2>
        <p class="text-slate-500">전국 수족관에서 판매 중인 개체</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
        >
          <div class="relative aspect-square bg-gradient-to-br from-sky-200 to-teal-300 flex items-center justify-center">
            <span class="text-5xl">🐟</span>
            <button
              class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              :class="product.liked ? 'text-red-500' : 'text-slate-400'"
            >
              <Heart class="w-5 h-5" :fill="product.liked ? 'currentColor' : 'none'" />
            </button>
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <span>🏪</span><span>{{ product.store }}</span>
            </div>
            <h3 class="font-semibold text-slate-800 line-clamp-1">{{ product.name }}</h3>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">난이도 <span class="text-amber-500">{{ getDifficultyStars(product.difficulty) }}</span></span>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sky-600 font-bold">{{ product.price }}</span>
              <button class="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors">
                <ShoppingCart class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-12">
        <button class="px-8 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-sky-500 hover:text-sky-600 transition-all duration-200">
          더 많은 상품 보기
        </button>
      </div>
    </div>
  </section>
</template>
```

---

## Changes Required

### 1. Products 타입을 `ref` 배열로 변경 (liked 토글 가능하게)

```ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, ShoppingCart } from 'lucide-vue-next'

const router = useRouter()

const products = ref([
  { id: 1, name: '네온 테트라 (10마리)',      store: '서울 강남 수족관',      price: '₩12,000', difficulty: 2, liked: false },
  // ... same data
])
```

### 2. 상품 카드 전체 클릭 → 상품 상세 이동

- 카드 div에 `@click="router.push('/products/' + product.id)"` 추가
- 카드에 `cursor-pointer` 추가
- 단, 찜 버튼과 장바구니 버튼은 카드 클릭 이벤트와 분리 → `@click.stop` 사용

### 3. 찜 버튼 — 클릭 시 liked 토글

```ts
const toggleLike = (productId: number, e: Event) => {
  e.stopPropagation()
  const product = products.value.find(p => p.id === productId)
  if (product) product.liked = !product.liked
}
```

- 찜 버튼에 `@click="toggleLike(product.id, $event)"` 적용
- liked 상태에 따라 Heart 아이콘 fill 토글 유지

### 4. 장바구니 버튼 — 클릭 이벤트 전파 중단

```ts
const handleCartClick = (productId: number, e: Event) => {
  e.stopPropagation()
  // 실제 구현시 cart store에 추가
  // 현재는 시각적 피드백만
}
```

### 5. "더 많은 상품 보기" 버튼 → 검색 페이지 이동

```ts
@click="router.push('/search')"
```

---

## Visual Design Rules (변경 금지)
- 모든 색상, 간격, 폰트 크기 그대로 유지
- 카드 hover 효과(`hover:shadow-lg`, `hover:scale-[1.02]`) 유지
- 찜 버튼 스타일(`bg-white/80 backdrop-blur-sm rounded-full`) 유지
- 장바구니 버튼 스타일(`bg-sky-50 text-sky-600 rounded-lg`) 유지
- 난이도 별 표시 유지

---

## Code Requirements
- `<script setup lang="ts">` only
- `useRouter` from `vue-router`
- `ref` from `vue`
- `lucide-vue-next`: `Heart`, `ShoppingCart`
- Tailwind utility classes only
- No external UI libraries
