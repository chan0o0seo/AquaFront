# AquaFront — v0.dev Design Prompts

마이페이지 미구현 탭/기능에 대한 v0.dev 프롬프트 모음.
각 파일의 내용을 **그대로 v0.dev 채팅창에 붙여넣기** 하면 됩니다.

---

## 공통 디자인 시스템 (모든 컴포넌트 공유)

| 항목 | 값 |
|------|-----|
| Framework | Vue 3, `<script setup lang="ts">` |
| Styling | Tailwind CSS |
| Icons | `lucide-vue-next` |
| 주 색상 | `sky-500` (#0ea5e9) |
| 배경 | white + `bg-sky-50` 카드 |
| 보더 | `border-sky-100`, `rounded-2xl` |
| 제목 폰트 | `font-black` (heading), `font-bold` (subheading) |
| 텍스트 색상 | `text-slate-900` / `text-slate-600` / `text-slate-400` |

---

## 프롬프트 목록

### 마이페이지 플로우

| 파일 | 컴포넌트 | 설명 | 타입 |
|------|----------|------|------|
| `01_wishlist-tab.md` | `WishlistTab.vue` | 찜 목록 탭 — 필터링, 카드 그리드, 빈 상태 | 탭 패널 |
| `02_account-settings-tab.md` | `AccountSettingsTab.vue` | 계정 설정 탭 — 닉네임/PW 변경, 탈퇴 확인 모달 | 탭 패널 |
| `03_profile-edit-modal.md` | `ProfileEditModal.vue` | 프로필 편집 모달 — v-model, 닉네임 수정, 아바타 변경 | 모달 |
| `04_tank-profile-tab.md` | `TankProfileTab.vue` | 내 수조 프로필 — 등록/조회/편집 3단계 상태 | 탭 패널 |
| `05_order-detail-page.md` | `OrderDetailPage.vue` | 주문 상세 페이지 — 배송 스테퍼, 상품/결제 정보 | 전체 페이지 |

### 쇼핑 플로우

| 파일 | 컴포넌트 | 설명 | 타입 |
|------|----------|------|------|
| `06_checkout-page.md` | `CheckoutPage.vue` | 결제/주문 페이지 — 배송지, 결제수단, 주문 요약 | 전체 페이지 |
| `07_order-complete-page.md` | `OrderCompletePage.vue` | 주문 완료 페이지 — 성공 애니메이션, 주문 요약 | 전체 페이지 |
| `08_product-section-update.md` | `ProductSection.vue` | 홈 상품 카드 수정 — 클릭 시 상품 상세 이동, 찜 토글 | 컴포넌트 수정 |
| `09_product-detail-wishlist.md` | `ProductDetailPage.vue` | 상품 상세 찜하기 버튼 추가 — 하트 애니메이션 포함 | 부분 수정 |

---

## 라우터에 추가해야 할 경로 (쇼핑 플로우)

```ts
// router/index.ts 에 추가
import CheckoutPage from '../pages/CheckoutPage.vue'
import OrderCompletePage from '../pages/OrderCompletePage.vue'

{ path: '/checkout',        name: 'Checkout',      component: CheckoutPage },
{ path: '/orders/complete', name: 'OrderComplete',  component: OrderCompletePage },
```

---

## v0.dev 사용 팁

1. 각 `.md` 파일 내용 전체를 복사해서 v0.dev 입력창에 붙여넣기
2. 생성된 컴포넌트의 기술 스택이 **Vue + Tailwind**로 설정됐는지 확인
3. 생성 후 이 프로젝트에 붙여넣을 위치:
   - 탭 패널 (`*Tab.vue`) → `src/components/mypage/`
   - 모달 (`*Modal.vue`) → `src/components/mypage/`
   - 전체 페이지 (`*Page.vue`) → `src/pages/`
   - 컴포넌트 수정 → 해당 파일에 직접 반영
