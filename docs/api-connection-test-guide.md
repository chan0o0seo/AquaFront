# API 연결 테스트 가이드

> 개발 서버: `npm run dev` → `http://localhost:5173` (백엔드 proxy: `http://localhost:8080`)

---

## 공통 테스트 환경

- 브라우저 DevTools → Network 탭에서 요청/응답 확인
- 백엔드 미연결 시 `ERR_CONNECTION_REFUSED` 또는 `502` 오류 발생
- 401 응답 → 자동 로그아웃 + `/login` 리다이렉트
- 500 응답 → `/error` 페이지 리다이렉트

---

## 1. Auth — 이메일 중복 체크

**API:** `GET /api/auth/email/check?email=`
**파일:** `src/api/auth.api.ts` → `authApi.checkEmail()`

### 테스트 방법
회원가입 페이지(`/register`)에서 이메일 입력 시 버튼 클릭 또는 이메일 필드 blur 이벤트에서 호출하도록 연결 필요.

직접 테스트:
```
GET http://localhost:8080/api/auth/email/check?email=test@example.com
→ { "success": true, "data": false, "message": "..." }  // false = 사용가능
→ { "success": true, "data": true, "message": "..." }   // true = 중복
```

---

## 2. Product — 타입별 상품 목록

**API:** `GET /api/products/type/{productType}`
**파일:** `src/api/product.api.ts` → `productApi.searchByType()`

### 테스트 방법
ShopPage 또는 HomePage에서 카테고리 탭 선택 시 호출 가능.

직접 테스트:
```
GET http://localhost:8080/api/products/type/FISH
GET http://localhost:8080/api/products/type/PLANT?page=0&size=10
→ { "success": true, "data": [...], "message": "..." }
```

productType 가능값: `FISH | INVERTEBRATE | PLANT | EQUIPMENT | FOOD | ACCESSORY`

---

## 3. ProductImage — 상품 이미지 개별 관리

**API 4개:** `src/api/seller.api.ts`

| 메서드 | API | 함수 |
|--------|-----|------|
| POST | `/api/products/{id}/images` | `sellerApi.uploadProductImages()` |
| PATCH | `/api/products/{id}/images/order` | `sellerApi.reorderProductImages()` |
| PATCH | `/api/products/{id}/images/{imageId}/representative` | `sellerApi.setRepresentativeImage()` |
| DELETE | `/api/products/{id}/images/{imageId}` | `sellerApi.deleteProductImage()` |

### 테스트 방법
판매자 로그인 → 상품 수정 페이지(`/seller/products/:id/edit`)에서 이미지 관련 액션 수행.

현재 상품 폼은 S3 presigned URL 방식 사용 중. 위 API는 서버에서 직접 파일을 받는 방식.

직접 테스트 (curl):
```bash
# 이미지 업로드
curl -X POST http://localhost:8080/api/products/1/images \
  -H "Cookie: [auth_cookie]" \
  -F "files=@image.jpg"

# 이미지 삭제
curl -X DELETE http://localhost:8080/api/products/1/images/3 \
  -H "Cookie: [auth_cookie]"
```

---

## 4. ProductWishlist — 찜 수 조회

**API:** `GET /api/products/{productId}/wishlist/count`
**파일:** `src/api/product.api.ts` → `productApi.getWishlistCount()`
  
### 테스트 방법
상품 상세 페이지(`/products/:id`)에서 찜 버튼 옆에 카운트 표시 시 활용.

직접 테스트:
```
GET http://localhost:8080/api/products/1/wishlist/count
→ { "success": true, "data": 42, "message": "..." }
```

---

## 5. Payment — 결제 (신규 파일)

**파일:** `src/api/payment.api.ts`
**⚠️ 주의:** PG(결제 게이트웨이) SDK 연동 필요. 현재 CheckoutPage는 `orderApi.createOrder()`만 호출함.

### 정상 결제 플로우
1. `orderApi.createOrder()` → orderId 획득
2. PG SDK로 결제 진행 (Toss, 아임포트 등) → paymentKey 획득
3. `paymentApi.verify({ orderId, paymentKey, amount })` → 결제 검증
4. 성공 시 `/orders/complete` 이동

| 함수 | API | 설명 |
|------|-----|------|
| `paymentApi.verify()` | `POST /api/payments/verify` | PG 결제 검증 |
| `paymentApi.getByOrder(orderId)` | `GET /api/payments/orders/{id}` | 결제 정보 조회 |
| `paymentApi.cancel(orderId)` | `POST /api/payments/orders/{id}/cancel` | 결제 취소 |

### 테스트 방법
```
# 결제 조회 (주문 후)
GET http://localhost:8080/api/payments/orders/1
→ { "success": true, "data": { "id": 1, "orderId": 1, "status": "PAID", ... }, "message": "..." }

# 결제 취소
POST http://localhost:8080/api/payments/orders/1/cancel
→ { "success": true, "data": { "status": "CANCELLED", ... }, "message": "..." }
```

---

## 6. Settlement — 정산 (신규 파일)

**파일:** `src/api/settlement.api.ts`
**접근:** 판매자 대시보드(`/mypage/seller`) → "정산 관리" 탭

### 테스트 방법

**판매자 로그인 후 정산 탭 접근:**
1. `/mypage/seller` 접속
2. 좌측 사이드바 "정산 관리" 탭 클릭
3. 페이지 로드 시 자동으로 `settlementApi.getSettlements()` 호출

**정산 계좌 등록:**
1. "계좌 등록" 버튼 클릭
2. 은행명, 계좌번호, 예금주 입력 후 저장
3. `POST /api/seller/settlement-account` 호출

**월간 보고서 조회:**
1. 연도/월 선택 후 "조회" 버튼 클릭
2. `GET /api/seller/settlements/report/monthly?year=2025&month=1` 호출

**PDF 다운로드:**
1. 정산 목록에서 "PDF" 버튼 클릭
2. `GET /api/seller/settlements/{id}/pdf` → Blob 다운로드

직접 테스트:
```
GET http://localhost:8080/api/seller/settlements
GET http://localhost:8080/api/seller/settlements/report/monthly?year=2025&month=3
GET http://localhost:8080/api/seller/settlement-account
POST http://localhost:8080/api/seller/settlement-account
  Body: { "bankName": "국민은행", "accountNumber": "123456789012", "accountHolder": "홍길동" }
```

---

## 7. SettlementAccount — 정산 계좌

정산 계좌는 Settlement 탭 내에 포함되어 있음 (위 §6 참고)

---

## 8. CommissionPolicy — 수수료 정책 (관리자)

**접근:** 관리자 로그인 후 `/admin` → "수수료 정책" 탭

### 테스트 방법

**수수료 정책 목록 조회:**
1. `/admin` 접속 (ADMIN 권한 계정 필요)
2. "수수료 정책" 탭 클릭 시 자동 조회

**정책 생성:**
1. "정책 추가" 버튼 클릭
2. 수수료율, 적용 상품 유형, 설명 입력 후 저장

**정책 수정:**
1. 목록에서 수정 아이콘(✏️) 클릭 → 폼 수정

**정책 삭제:**
1. 삭제 아이콘(🗑️) 클릭 → 확인 후 삭제

직접 테스트:
```
GET  http://localhost:8080/api/admin/commission-policies
POST http://localhost:8080/api/admin/commission-policies
  Body: { "rate": 5.0, "productType": "FISH", "description": "어류 기본 수수료" }
PUT  http://localhost:8080/api/admin/commission-policies/1
  Body: { "rate": 4.5 }
DELETE http://localhost:8080/api/admin/commission-policies/1
```

---

## 9. Settlement Batch — 정산 일괄 처리 (관리자)

**접근:** `/admin` → "정산 처리" 탭

### 테스트 방법
1. 관리자 로그인
2. `/admin` → "정산 처리" 탭
3. "정산 일괄 처리 실행" 버튼 클릭 → 확인 팝업 → 실행
4. 성공/실패 메시지 확인

직접 테스트:
```
POST http://localhost:8080/api/admin/settlements/batch
→ { "success": true, "data": null, "message": "정산 처리 완료" }
```

---

## 10. Auction — 경매 삭제

**API:** `DELETE /api/auctions/{auctionId}`
**파일:** `src/api/auction.api.ts` → `auctionApi.cancelAuction()`

> SellerDashboardPage에서 이미 `auctionApi.cancelAuction()` 호출 코드가 있었으나 API 메서드가 없었음. 이제 연결됨.

### 테스트 방법
1. 판매자 로그인 → `/mypage/seller` → "내 경매 관리" 탭
2. **SCHEDULED(예정)** 상태 경매의 "취소" 버튼 클릭
3. 확인 팝업 → 삭제 실행

> ACTIVE/ENDED 경매는 취소 버튼이 표시되지 않음 (UI에서 SCHEDULED만 노출)

직접 테스트:
```
DELETE http://localhost:8080/api/auctions/5
→ 204 No Content (또는 200)
```

---

## 요약표

| # | API | 파일 | UI 접근 경로 | 상태 |
|---|-----|------|-------------|------|
| 1 | GET /auth/email/check | auth.api.ts | /register | ✅ API 연결 완료 (UI 연결 별도) |
| 2 | GET /products/type/{type} | product.api.ts | ShopPage | ✅ API 연결 완료 (UI 연결 별도) |
| 3 | POST /products/{id}/images | seller.api.ts | /seller/products/:id/edit | ✅ API 연결 완료 |
| 4 | PATCH /products/{id}/images/order | seller.api.ts | — | ✅ API 연결 완료 |
| 5 | PATCH /products/{id}/images/{imageId}/representative | seller.api.ts | — | ✅ API 연결 완료 |
| 6 | DELETE /products/{id}/images/{imageId} | seller.api.ts | — | ✅ API 연결 완료 |
| 7 | GET /products/{id}/wishlist/count | product.api.ts | /products/:id | ✅ API 연결 완료 (UI 연결 별도) |
| 8 | POST /payments/verify | payment.api.ts | CheckoutPage | ✅ API 연결 완료 (PG SDK 연동 필요) |
| 9 | GET /payments/orders/{id} | payment.api.ts | OrderDetailPage | ✅ API 연결 완료 |
| 10 | POST /payments/orders/{id}/cancel | payment.api.ts | OrderDetailPage | ✅ API 연결 완료 |
| 11 | GET /seller/settlements | settlement.api.ts | /mypage/seller → 정산 탭 | ✅ UI + API |
| 12 | GET /seller/settlements/{id} | settlement.api.ts | 정산 탭 | ✅ API 연결 완료 |
| 13 | GET /seller/settlements/{id}/pdf | settlement.api.ts | 정산 탭 → PDF 버튼 | ✅ UI + API |
| 14 | GET /seller/settlements/report/monthly | settlement.api.ts | 정산 탭 → 월간 보고서 | ✅ UI + API |
| 15 | POST /admin/settlements/batch | settlement.api.ts | /admin → 정산 처리 탭 | ✅ UI + API |
| 16 | GET /seller/settlement-account | settlement.api.ts | 정산 탭 → 계좌 섹션 | ✅ UI + API |
| 17 | POST /seller/settlement-account | settlement.api.ts | 정산 탭 → 계좌 등록 | ✅ UI + API |
| 18 | PUT /seller/settlement-account | settlement.api.ts | 정산 탭 → 계좌 수정 | ✅ UI + API |
| 19 | GET /admin/commission-policies | seller.api.ts | /admin → 수수료 정책 탭 | ✅ UI + API |
| 20 | POST /admin/commission-policies | seller.api.ts | /admin → 정책 추가 | ✅ UI + API |
| 21 | PUT /admin/commission-policies/{id} | seller.api.ts | /admin → 정책 수정 | ✅ UI + API |
| 22 | DELETE /admin/commission-policies/{id} | seller.api.ts | /admin → 정책 삭제 | ✅ UI + API |
| 23 | DELETE /auctions/{id} | auction.api.ts | /mypage/seller → 경매 탭 | ✅ UI + API |
