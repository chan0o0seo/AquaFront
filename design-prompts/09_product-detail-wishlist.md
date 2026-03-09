# Prompt: 상품 상세 찜하기 버튼 추가 (ProductDetailPage — Wishlist Button)

This is a **partial update** to an existing Vue 3 component (`ProductDetailPage.vue`).
Do NOT rewrite the entire page. Only output the **right-side action panel** section (the area with price, quantity, and CTA buttons) with the wishlist button added.
Use `<script setup lang="ts">` and **Tailwind CSS**.

---

## Design System

- **Primary color**: `sky-500`
- **Wishlist active**: `text-red-500`, Heart icon filled
- **Wishlist inactive**: `text-slate-400`, Heart icon outline
- **Button styles**: match existing buttons (`rounded-full`, `font-bold`, `py-4 px-8`, `w-full`)
- **Icons**: `lucide-vue-next` — `Heart`

---

## What to Add

### 1. Script section additions

```ts
// Add to existing script setup
import { Heart } from 'lucide-vue-next'  // add to existing import

// Wishlist state
const isWishlisted = ref(false)
const isTogglingWishlist = ref(false)

const toggleWishlist = async () => {
  if (isTogglingWishlist.value) return
  isTogglingWishlist.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400))
  isWishlisted.value = !isWishlisted.value
  isTogglingWishlist.value = false
}
```

### 2. Template — Wishlist button placement

Insert the wishlist button **between** the "장바구니 담기" button and the "바로 구매하기" button.

```html
<!-- Wishlist Button — insert between 장바구니 and 바로구매 -->
<button
  @click="toggleWishlist"
  :disabled="isTogglingWishlist"
  class="w-full py-4 px-8 rounded-full font-bold mt-2 transition-all duration-200 flex items-center justify-center gap-2 border-2"
  :class="[
    isWishlisted
      ? 'border-red-400 bg-red-50 text-red-500 hover:bg-red-100'
      : 'border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-400'
  ]"
>
  <Heart
    class="w-5 h-5 transition-all duration-200"
    :class="isWishlisted ? 'fill-current' : ''"
  />
  <span>{{ isWishlisted ? '찜 완료' : '찜하기' }}</span>
</button>
```

### 3. Wishlist count badge update (optional)

Near the product name/rating area, if there's a wishlist count display, show a small badge:
```html
<!-- Add next to rating row, after review count -->
<span class="flex items-center gap-1 text-slate-400 text-sm ml-2">
  <Heart class="w-3.5 h-3.5" :class="isWishlisted ? 'fill-red-400 text-red-400' : ''" />
  <span>{{ isWishlisted ? '찜함' : '찜' }}</span>
</span>
```

---

## Full Right Panel Context (for reference — do not rewrite, just show where to insert)

The right panel structure is:
```
[ Badge Row (상품타입, 수질, 난이도, 재고 뱃지들) ]
[ Category Breadcrumb ]
[ Product Name (h1) ]
[ Rating Row ]           ← add wishlist count here
[ Price Section ]
[ ProductBioSpecs component ]
[ Tags ]
[ Seller Info ]
[ Quantity Selector ]
─── INSERT WISHLIST BUTTON HERE ───
[ 장바구니 담기 button ]
─── INSERT WISHLIST BUTTON HERE ───  ← preferred location
[ 바로 구매하기 button ]
[ Sold Out message ]
[ Safety Badges ]
```

**Preferred position**: between 장바구니 and 바로구매 — user sees it as a secondary action between the two primary CTAs.

---

## Animation

Add a brief scale animation on wishlist toggle:
```css
/* In <style scoped> */
.heart-pop {
  animation: heartPop 0.3s ease;
}
@keyframes heartPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

Trigger by toggling a class on the Heart icon when `isWishlisted` changes (use `watch`):
```ts
import { watch } from 'vue'
const heartAnimating = ref(false)
watch(isWishlisted, () => {
  heartAnimating.value = true
  setTimeout(() => { heartAnimating.value = false }, 300)
})
```

Then in template: `:class="{ 'heart-pop': heartAnimating }"`

---

## Code Requirements
- Output only the **script additions** and the **wishlist button template snippet**
- Do not rewrite the entire ProductDetailPage
- `<script setup lang="ts">`
- `lucide-vue-next`: `Heart`
- Tailwind utility classes only
- `<style scoped>` for `heartPop` keyframe only
