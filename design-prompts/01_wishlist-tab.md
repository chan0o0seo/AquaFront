# Prompt: 찜 목록 탭 (WishlistTab Component)

Build a **Vue 3 Single File Component** (`WishlistTab.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
This is a tab panel rendered inside a larger MyPage layout — do NOT include the surrounding page shell or sidebar.

---

## Design System

- **Background**: white page, `bg-sky-50` for cards and highlight areas
- **Border**: `border-sky-100`, `rounded-2xl` for cards, `rounded-xl` for smaller elements
- **Primary color**: `sky-500` (buttons, badges, accents)
- **Text**: `text-slate-900` (headings), `text-slate-600` (body), `text-slate-400` (secondary/meta)
- **Status badges**: pill shape `rounded-full`, small padding `px-3 py-1 text-xs`
- **Shadows**: avoid heavy shadows — use `border` instead
- **Icons**: use `lucide-vue-next`
- **Font weight**: headings `font-black`, subheadings `font-bold`, labels `font-semibold`

---

## Component Spec

### Layout
- Full-width panel (parent is a flex container, this occupies `flex-1`)
- Page heading: `text-3xl font-black text-slate-900 mb-6` → "찜 목록"
- Filter bar at top: tabs or pills to switch between `전체`, `어류`, `수초`, `용품`
- Product grid: **2 columns** on desktop, 1 column on mobile
- Each card includes product image placeholder, name, price, seller name, and a filled heart button

### Wishlist Card (`WishlistItem`)
```
┌────────────────────────────────┐
│  [Product Image 4:3]     ♥    │  ← heart button top-right, filled sky-500
│                                │
│  상품명                        │
│  판매자명              가격    │
│  [찜 해제]  [장바구니 담기]    │
└────────────────────────────────┘
```
- Image placeholder: `bg-gradient-to-br from-sky-100 to-teal-100 rounded-xl aspect-[4/3]`
- Heart icon: `Heart` from lucide, filled `text-sky-500` when wishlisted, unfilled when not
- "찜 해제" button: `text-sm text-slate-400 hover:text-red-400`
- "장바구니 담기" button: `bg-sky-500 text-white text-sm rounded-full px-4 py-2`
- Product name: `font-semibold text-slate-900 text-sm mt-2`
- Seller: `text-xs text-slate-400`
- Price: `font-bold text-sky-600`

### Empty State
When wishlist is empty:
- Large heart icon (outline, `w-16 h-16 text-slate-200`) centered
- Text: "아직 찜한 상품이 없어요" (`text-slate-400`)
- CTA button: "쇼핑 시작하기" → `bg-sky-500 text-white rounded-full px-8 py-3`

### Mock Data (use `ref` array)
```ts
const wishlistItems = ref([
  { id: 1, name: '레드 크리스탈 새우 10마리', seller: '강남아쿠아리움', price: 45000, category: '어류' },
  { id: 2, name: 'ADA 아마조니아 소일 9L',    seller: '브리더팜',     price: 35000, category: '용품' },
  { id: 3, name: '수초 종합 세트',             seller: '수초팜',       price: 28000, category: '수초' },
  { id: 4, name: '슈퍼레드 구피 수컷 5마리',  seller: '홈브리더김씨', price: 18000, category: '어류' },
])
```

### Interaction
- Category filter: `activeFilter` ref, pills highlight with `bg-sky-500 text-white` when active, otherwise `bg-sky-50 text-slate-600`
- Computed `filteredItems`: returns all when `activeFilter === '전체'`, else filters by category
- Heart button click → removes item from list with a brief fade (use `v-if` transition)
- "장바구니 담기" → shows a small toast-style feedback (e.g., change button text to "담겼어요!" for 1.5s)

---

## Code Requirements
- `<script setup lang="ts">` only
- Tailwind utility classes only (no scoped CSS unless for transitions)
- `lucide-vue-next` for icons: `Heart`, `ShoppingCart`, `Fish`
- No external UI libraries
- Export as default SFC — no router, no store imports needed
