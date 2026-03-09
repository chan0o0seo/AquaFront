# Prompt: 결제/주문 페이지 (CheckoutPage)

Build a **Vue 3 Single File Component** (`CheckoutPage.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
Full standalone page at route `/checkout`. Do NOT include navbar/footer (handled by App.vue).
Receives cart items from Pinia store OR a single product via query params (`?productId=&quantity=`).

---

## Design System

- **Page bg**: `min-h-screen bg-sky-50`
- **Inner container**: `max-w-3xl mx-auto px-6 py-12 mt-16`
- **Section cards**: `bg-white rounded-2xl border border-sky-100 p-6 mb-4`
- **Input style**: `w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all`
- **Select style**: same as input
- **Primary button**: `bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full py-4 w-full transition-colors`
- **Section title**: `text-lg font-bold text-slate-900 mb-4`
- **Row label**: `text-sm text-slate-400 w-24 flex-shrink-0`
- **Icons**: `lucide-vue-next`

---

## Page Layout (2-column on lg, stacked on mobile)

```
lg: [Left: 배송지 + 결제수단 (flex-1)] [Right: 주문 요약 (w-80 sticky)]
mobile: stacked, 주문하기 버튼 fixed bottom
```

Back button at top: `← 장바구니`  →  `router.back()`

---

## Section 1: 배송지 정보

Card title: "배송지"

Fields (stacked, full-width):
- **수령인** — text input, placeholder "홍길동"
- **연락처** — tel input, placeholder "010-1234-5678"
- **배송지 주소** — flex row: readonly text input + "주소 검색" button (`bg-sky-50 text-sky-600 rounded-xl px-4 py-3 hover:bg-sky-100` with `MapPin` icon)
- **상세 주소** — text input, placeholder "아파트 동/호수"
- **배송 메모** — `<select>` with options:
  - "배송 메모를 선택하세요" (disabled placeholder)
  - "부재시 경비실에 맡겨주세요"
  - "부재시 문 앞에 놓아주세요"
  - "배송 전 연락 부탁드립니다"
  - "직접 입력"
- When "직접 입력" is selected → show additional text input below

Validation: 수령인, 연락처, 주소 모두 채워져야 최종 버튼 활성화

---

## Section 2: 주문 상품

Card title: "주문 상품 {{ orderItems.length }}개"

Each item row:
```
[thumbnail 48x48 rounded-xl]  상품명 (line-clamp-1)           수량: N개
                               판매자명 · 배송비 ₩X,XXX        ₩XX,XXX
```
- Thumbnail: `w-12 h-12 rounded-xl object-cover bg-gradient-to-br from-sky-100 to-teal-100`
- Name: `font-medium text-slate-900 text-sm`
- Seller + shipping: `text-xs text-slate-400`
- Price: `font-bold text-sky-600 text-sm`
- Divider between items: `border-b border-sky-50`

---

## Section 3: 결제 수단

Card title: "결제 수단"

3 payment method cards in a grid (grid-cols-3 gap-3):
- **카카오페이** — kakao yellow `#FEE500` bg when selected, white when not
- **네이버페이** — naver green `#03C75A` text/border when selected
- **신용/체크카드** — sky when selected

Each card: `rounded-2xl border-2 p-4 text-center cursor-pointer transition-all`
- Selected: `border-sky-400 bg-sky-50`
- Unselected: `border-slate-200 bg-white hover:border-slate-300`

Below the grid, when "신용/체크카드" is selected, show card input fields:
- 카드 번호 (formatted XXXX-XXXX-XXXX-XXXX)
- 유효기간 (MM/YY), 생년월일 (YYMMDD) — side by side
- No real validation needed, UI only

---

## Right Panel: 주문 요약

Card: `bg-white rounded-2xl border border-sky-100 p-6`

Rows:
- 상품 금액: ₩XX,XXX
- 배송비: ₩X,XXX (or "무료" in `text-emerald-500`)
- 할인: -₩0
- Divider
- **총 결제금액**: `font-black text-xl text-sky-600` right-aligned

Safety badges below total:
```
🔒 에스크로 안전결제  🌡 날씨 연동 배송  🐟 생물 사체 보상
```
(`text-xs text-slate-400`, icons from lucide: `Lock`, `Thermometer`, `Fish`)

**주문하기 버튼** (in right panel on desktop, fixed bottom bar on mobile):
- Disabled state: `bg-slate-200 text-slate-400 cursor-not-allowed`
- Active: `bg-sky-500 hover:bg-sky-600 text-white`
- On click: simulate 1.5s loading (`Loader2 animate-spin`) then `router.push('/orders/complete')`

---

## State & Mock Data

```ts
// Delivery form
const form = reactive({
  recipient: '',
  phone: '',
  address: '',
  addressDetail: '',
  memo: '',
  memoCustom: ''
})

// Payment
const paymentMethod = ref<'kakao' | 'naver' | 'card'>('kakao')

// Mock order items (in real app, read from cart store)
const orderItems = ref([
  {
    productId: 1,
    name: '레드 크리스탈 새우 10마리',
    sellerNickName: '강남아쿠아리움',
    price: 45000,
    shippingFee: 3000,
    quantity: 1,
    thumbnailUrl: null
  },
  {
    productId: 2,
    name: 'ADA 아마조니아 소일 9L',
    sellerNickName: '수초팜',
    price: 35000,
    shippingFee: 3000,
    quantity: 2,
    thumbnailUrl: null
  }
])

// Computed totals
const subtotal = computed(() => orderItems.value.reduce((s, i) => s + i.price * i.quantity, 0))
const shippingFee = computed(() => {
  const sellers = new Set(orderItems.value.map(i => i.sellerNickName))
  return orderItems.value
    .filter((item, idx, arr) => arr.findIndex(i => i.sellerNickName === item.sellerNickName) === idx)
    .reduce((s, i) => s + i.shippingFee, 0)
})
const totalPrice = computed(() => subtotal.value + shippingFee.value)

const isFormValid = computed(() =>
  form.recipient.trim().length > 0 &&
  form.phone.trim().length > 0 &&
  form.address.trim().length > 0
)

const isSubmitting = ref(false)

const handleOrder = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isSubmitting.value = false
  router.push('/orders/complete')
}
```

---

## Code Requirements
- `<script setup lang="ts">` only
- `useRouter` from `vue-router`
- Tailwind utility classes only
- `lucide-vue-next`: `ArrowLeft`, `MapPin`, `Lock`, `Thermometer`, `Fish`, `Loader2`, `CreditCard`
- No external UI libraries
- Mobile: 주문하기 버튼을 `fixed bottom-0 left-0 right-0` 바에 배치
