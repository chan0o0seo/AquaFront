# Prompt: 주문 완료 페이지 (OrderCompletePage)

Build a **Vue 3 Single File Component** (`OrderCompletePage.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
Full standalone page at route `/orders/complete`. Do NOT include navbar/footer (handled by App.vue).
This page is shown immediately after a successful payment.

---

## Design System

- **Page bg**: `min-h-screen bg-sky-50 flex items-center justify-center py-16`
- **Card**: `bg-white rounded-3xl border border-sky-100 shadow-sm p-10 w-full max-w-md mx-6 text-center`
- **Primary color**: `sky-500`
- **Success color**: `emerald-500`
- **Icons**: `lucide-vue-next`

---

## Page Layout

Single centered card. No sidebar, no back button.

```
┌──────────────────────────────────┐
│                                  │
│      [ ✓ success circle ]        │
│                                  │
│   주문이 완료되었습니다! 🎉      │
│   주문번호: ORD-20250116-042     │
│                                  │
│  ┌────────────────────────────┐  │
│  │  주문 상품 요약 (1건)       │  │
│  │  [img] 레드 크리스탈 새우  │  │
│  │        1개 · ₩45,000       │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  결제 정보                  │  │
│  │  상품금액    ₩45,000        │  │
│  │  배송비      ₩3,000         │  │
│  │  ─────────────────         │  │
│  │  총결제금액  ₩48,000        │  │
│  │  결제수단    카카오페이      │  │
│  └────────────────────────────┘  │
│                                  │
│  [ 주문 상세 보기 ]  (primary)   │
│  [ 쇼핑 계속하기 ]  (ghost)      │
│                                  │
└──────────────────────────────────┘
```

---

## Section 1: Success Animation

Animated checkmark circle at the top:
```html
<div class="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
  <!-- Animated SVG checkmark (draw-on animation) -->
  <svg class="w-14 h-14 text-emerald-500" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3"
      style="stroke-dasharray:166; stroke-dashoffset:0; animation: circle 0.6s ease-in-out forwards" />
    <path fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
      d="M14 27l8 8 16-16"
      style="stroke-dasharray:48; stroke-dashoffset:0; animation: check 0.3s 0.6s ease-in-out forwards" />
  </svg>
</div>
```

Add in `<style>` block:
```css
@keyframes circle {
  from { stroke-dashoffset: 166; }
  to { stroke-dashoffset: 0; }
}
@keyframes check {
  from { stroke-dashoffset: 48; }
  to { stroke-dashoffset: 0; }
}
svg circle { animation: circle 0.6s ease-in-out forwards; }
svg path { stroke-dashoffset: 48; animation: check 0.3s 0.6s ease-in-out forwards; }
```

Heading: `text-2xl font-black text-slate-900 mb-1` → "주문이 완료되었습니다!"
Subtext: `text-sm text-slate-400` → "주문번호: {{ order.id }}"

---

## Section 2: 주문 상품 요약

Inner card: `bg-sky-50 rounded-2xl p-4 mt-6 text-left`
Title: `text-sm font-bold text-slate-700 mb-3` → "주문 상품 {{ order.items.length }}건"

Each item row (flex, items-center, gap-3):
- Thumbnail: `w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex-shrink-0`
- Name: `text-sm font-medium text-slate-800 line-clamp-1`
- Quantity + Price: `text-xs text-slate-500` + `text-sm font-bold text-sky-600 ml-auto`

If more than 1 item, show first item + "외 N건" text below.

---

## Section 3: 결제 정보

Inner card: `bg-white rounded-2xl border border-sky-100 p-4 mt-3 text-left`

Rows (`flex justify-between text-sm py-1.5`):
- 상품금액: `text-slate-500` / `text-slate-800 font-medium`
- 배송비: `text-slate-500` / `text-slate-800 font-medium`
- Divider: `border-t border-sky-100 my-2`
- 총 결제금액: `font-bold text-slate-900` / `font-black text-sky-600 text-base`
- 결제수단: `text-slate-500` / `text-slate-700`

---

## Section 4: 배송 안내 메시지

Small info box: `bg-amber-50 rounded-xl p-3 mt-4 border border-amber-100`
Icon: `Truck` (lucide) `text-amber-500 w-4 h-4`
Text: `text-xs text-amber-700` → "생물 특성상 날씨에 따라 출하가 조정될 수 있습니다. 배송 시작 시 알림을 드려요."

---

## Section 5: Action Buttons

```
[주문 상세 보기]  → bg-sky-500, router.push(`/orders/${order.id}`)
[쇼핑 계속하기]  → border border-sky-200 text-sky-600, router.push('/')
```

Both `rounded-full py-3 w-full font-semibold transition-colors`
Stacked vertically, gap-3, margin-top-6.

---

## Mock Data & State

```ts
const router = useRouter()
const route = useRoute()

// In real app, get order ID from route query or store
const order = ref({
  id: 'ORD-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-042',
  paymentMethod: '카카오페이',
  items: [
    {
      productId: 1,
      name: '레드 크리스탈 새우 10마리',
      quantity: 1,
      price: 45000,
      thumbnailUrl: null
    }
  ],
  subtotal: 45000,
  shippingFee: 3000,
  totalPrice: 48000
})

// Confetti effect on mount (optional - use simple CSS animation on the card)
// Add a subtle scale-in animation to the card on mount
// .card-enter { animation: scaleIn 0.4s ease-out }
// @keyframes scaleIn { from { opacity:0; transform: scale(0.95) } to { opacity:1; transform: scale(1) } }
```

---

## Code Requirements
- `<script setup lang="ts">` only
- `useRouter`, `useRoute` from `vue-router`
- Tailwind utility classes only
- `lucide-vue-next`: `CheckCircle`, `ArrowRight`, `ShoppingBag`, `Truck`
- `<style scoped>` for keyframe animations only
- No external UI libraries
