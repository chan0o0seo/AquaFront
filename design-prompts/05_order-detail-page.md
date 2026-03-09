# Prompt: 주문 상세 페이지 (OrderDetailPage)

Build a **Vue 3 Single File Component** (`OrderDetailPage.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
This is a standalone full-page route (e.g., `/orders/:orderId`) — include the full page layout with max-width container and back button, but NOT the navbar/footer (those are in App.vue).

---

## Design System

- **Background**: `min-h-screen bg-white`, inner container `max-w-2xl mx-auto px-6 py-12 mt-16`
- **Section cards**: `bg-white rounded-2xl border border-sky-100 p-6 mb-4`
- **Highlight areas**: `bg-sky-50 rounded-2xl p-4`
- **Primary color**: `sky-500`
- **Status badge colors**:
  - 결제완료: `bg-sky-100 text-sky-600`
  - 배송준비중: `bg-amber-100 text-amber-600`
  - 배송중: `bg-blue-100 text-blue-600`
  - 배송완료: `bg-emerald-100 text-emerald-600`
  - 취소됨: `bg-slate-100 text-slate-500`
- **Divider**: `border-b border-sky-50`
- **Icons**: `lucide-vue-next`

---

## Component Spec

### Back Button (top)
```
← 주문 내역
```
- `flex items-center gap-1 text-sm text-slate-400 hover:text-sky-500 transition-colors mb-6`
- On click: `router.back()`

### Section 1: 주문 상태 (Order Status)

Card at top with:
- Order number row: `text-xs text-slate-400` "주문번호" + `text-slate-700 font-mono` value
- Order date row: `text-xs text-slate-400` "주문일시" + value
- Large status badge: `rounded-full px-4 py-1.5 text-sm font-semibold` centered or left-aligned
- **배송 진행 스테퍼** (horizontal):

```
결제완료 ──── 배송준비중 ──── 배송중 ──── 배송완료
   ✓              ✓           ●           ○
```
- Active steps: `bg-sky-500` circle with white check or filled dot
- Current step: `ring-4 ring-sky-200 bg-sky-500`
- Future steps: `border-2 border-slate-200 bg-white`
- Connecting lines: `h-0.5` colored `bg-sky-300` for completed, `bg-slate-200` for upcoming
- Step label: `text-xs` below each circle

---

### Section 2: 배송 정보

Card with title "배송 정보" (`font-bold text-slate-900 mb-4`)

Rows (label left, value right pattern):
- 수령인: 홍길동
- 연락처: 010-1234-5678
- 배송지: 서울시 강남구 테헤란로 123, 아파트 456동 789호
- 배송 메모: "부재시 경비실에 맡겨주세요"

Each row: `flex justify-between py-2 border-b border-sky-50 last:border-0`
Label: `text-sm text-slate-400 w-20 flex-shrink-0`
Value: `text-sm text-slate-700`

---

### Section 3: 주문 상품

Card with title "주문 상품"

Product row:
```
[Image 56x56]  상품명                     수량: 1개
               판매자: 강남아쿠아리움      45,000원
```
- Image: `w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100`
- Name: `font-medium text-slate-900 text-sm`
- Seller: `text-xs text-slate-400`
- Price: `font-bold text-sky-600 text-sm`
- Quantity: `text-xs text-slate-500`

If status is '배송완료': show "리뷰 작성" button below the product row
- `text-sm text-sky-500 border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50`

---

### Section 4: 결제 정보

Card with title "결제 정보"

Rows:
- 상품 금액: 45,000원
- 배송비: 3,000원
- 할인: -0원 (show in `text-emerald-500` if > 0)
- Divider
- **총 결제금액**: `font-black text-lg text-slate-900` + `font-black text-xl text-sky-600 text-right`
- 결제 수단: 카카오페이

---

### Section 5: Action Buttons

At the bottom of the page (stacked or side-by-side):

If status is `결제완료` or `배송준비중`:
- "주문 취소" button: `border border-red-200 text-red-500 rounded-full py-3 px-6 hover:bg-red-50 w-full`

If status is `배송완료`:
- "교환/반품 신청" button (ghost outline)
- "재구매" button (sky-500 solid)

---

### Mock Data
```ts
const order = ref({
  id: 'ORD-20250115-001',
  date: '2025-01-15 14:32',
  status: '배송중' as '결제완료' | '배송준비중' | '배송중' | '배송완료' | '취소됨',
  product: {
    name: '레드 크리스탈 새우 10마리',
    seller: '강남아쿠아리움',
    quantity: 1,
    price: 45000
  },
  delivery: {
    recipient: '홍길동',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123, 456동 789호',
    memo: '부재시 경비실에 맡겨주세요'
  },
  payment: {
    productPrice: 45000,
    shippingFee: 3000,
    discount: 0,
    method: '카카오페이'
  }
})
```

The stepper should dynamically highlight steps based on `order.value.status`.

---

## Code Requirements
- `<script setup lang="ts">` only
- `useRouter` from `vue-router` for back navigation
- `useRoute` from `vue-router` to read `route.params.orderId` (display only)
- Tailwind utility classes only
- `lucide-vue-next`: `ArrowLeft`, `CheckCircle`, `Truck`, `Package`, `MapPin`, `CreditCard`
- No external UI libraries
- Computed `stepperSteps` that returns array with status for each step (completed/current/pending)
