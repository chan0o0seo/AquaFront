# 미연결 API 목록

> 백엔드에 구현되어 있으나 프론트엔드에 아직 연결되지 않은 API 목록입니다.

---

## 1. Auth - 1개

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/auth/email/check` | 이메일 중복 체크 |

---

## 2. Product - 1개

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/products/type/{productType}` | 타입별 상품 목록 |

---

## 3. ProductImage - 4개 (전체 미연결)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/products/{productId}/images` | 상품 이미지 업로드 |
| PATCH | `/api/products/{productId}/images/order` | 이미지 순서 변경 |
| PATCH | `/api/products/{productId}/images/{imageId}/representative` | 대표 이미지 설정 |
| DELETE | `/api/products/{productId}/images/{imageId}` | 이미지 삭제 |

---

## 4. ProductWishlist - 1개

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/products/{productId}/wishlist/count` | 찜 수 조회 |

---

## 5. Payment - 3개 (전체 미연결, `payment.api.ts` 파일 없음) ⚠️

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/payments/verify` | 결제 검증 |
| GET | `/api/payments/orders/{orderId}` | 주문별 결제 정보 조회 |
| POST | `/api/payments/orders/{orderId}/cancel` | 결제 취소 |

---

## 6. Settlement (정산) - 5개 (전체 미연결) ⚠️

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/seller/settlements` | 정산 목록 |
| GET | `/api/seller/settlements/{settlementId}` | 정산 상세 |
| GET | `/api/seller/settlements/{settlementId}/pdf` | 정산 PDF |
| GET | `/api/seller/settlements/report/monthly` | 월간 정산 보고서 |
| POST | `/api/admin/settlements/batch` | 정산 일괄 처리 (관리자) |

---

## 7. SettlementAccount (정산 계좌) - 3개 (전체 미연결) ⚠️

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/seller/settlement-account` | 정산 계좌 조회 |
| POST | `/api/seller/settlement-account` | 정산 계좌 등록 |
| PUT | `/api/seller/settlement-account` | 정산 계좌 수정 |

---

## 8. CommissionPolicy (수수료 정책) - 4개 (전체 미연결) ⚠️

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/admin/commission-policies` | 수수료 정책 목록 |
| POST | `/api/admin/commission-policies` | 수수료 정책 추가 |
| PUT | `/api/admin/commission-policies/{id}` | 수수료 정책 수정 |
| DELETE | `/api/admin/commission-policies/{id}` | 수수료 정책 삭제 |

---

## 9. Auction - 1개

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| DELETE | `/api/auctions/{auctionId}` | 경매 삭제 |

---

## 요약

| 카테고리 | 미연결 수 | 비고 |
|---------|---------|------|
| Auth | 1 | |
| Product | 1 | |
| ProductImage | 4 | 전체 미연결 |
| ProductWishlist | 1 | |
| Payment | 3 | 전체 미연결, 파일 없음 |
| Settlement | 5 | 전체 미연결 |
| SettlementAccount | 3 | 전체 미연결 |
| CommissionPolicy | 4 | 전체 미연결 |
| Auction | 1 | |
| **합계** | **23개** | |

### 우선순위
1. **Payment** - 결제 핵심 기능, `payment.api.ts` 신규 생성 필요
2. **ProductImage** - 상품 등록 시 이미지 업로드 필수
3. **SettlementAccount / Settlement** - 판매자 정산 기능
4. **CommissionPolicy** - 관리자 수수료 관리




---
  API 목록

  ┌────────┬───────────────────────────────────────────────┬────────────────┐
  │ 메서드 │                  엔드포인트                   │      설명      │
  ├────────┼───────────────────────────────────────────────┼────────────────┤
  │ POST   │ /api/members/me/notifications/fcm-token       │ 토큰 저장/갱신 │
  ├────────┼───────────────────────────────────────────────┼────────────────┤
  │ GET    │ /api/members/me/notifications/settings        │ 알림 설정 목록 │
  ├────────┼───────────────────────────────────────────────┼────────────────┤
  │ PATCH  │ /api/members/me/notifications/settings/{type} │ 켜기/끄기      │
  └────────┴───────────────────────────────────────────────┴────────────────┘

  {type} 값: AUCTION_ENDING, FOLLOWED_NEW_PRODUCT, ORDER_DELIVERY, MARKETING


