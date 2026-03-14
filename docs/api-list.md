# AquaHub Frontend - API 목록

> 총 65개 엔드포인트 (baseURL: `/api` → `http://localhost:8080`)

---

## 🔐 Auth

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| POST | `/auth/login` | 로그인 | auth.api.ts |
| POST | `/auth/logout` | 로그아웃 | auth.api.ts |
| POST | `/auth/signup` | 회원가입 | auth.api.ts |
| POST | `/auth/refresh` | 토큰 갱신 | auth.api.ts |
| POST | `/auth/email/send` | 인증 코드 발송 | auth.api.ts |
| POST | `/auth/email/verify` | 인증 코드 검증 | auth.api.ts |
| GET | `/auth/nickname/check?nickName=` | 닉네임 중복 확인 | auth.api.ts |
| GET | `/members/me` | 내 정보 조회 | auth.api.ts |
| PATCH | `/members/me/nick` | 닉네임 변경 | auth.api.ts |
| DELETE | `/members/me` | 회원 탈퇴 | auth.api.ts |

---

## 👤 Member

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| PATCH | `/members/me` | 프로필 수정 | member.api.ts |
| POST | `/members/me/password/verify-email` | 비밀번호 변경용 인증 코드 발송 | member.api.ts |
| PATCH | `/members/me/password` | 비밀번호 변경 | member.api.ts |
| GET | `/members/me/addresses` | 배송지 목록 | member.api.ts |
| POST | `/members/me/addresses` | 배송지 추가 | member.api.ts |
| PATCH | `/members/me/addresses/:id` | 배송지 수정 | member.api.ts |
| DELETE | `/members/me/addresses/:id` | 배송지 삭제 | member.api.ts |
| PATCH | `/members/me/addresses/:id/default` | 기본 배송지 설정 | member.api.ts |
| GET | `/members/me/wishlist` | 찜 목록 | product.api.ts |
| GET | `/members/me/following` | 팔로우한 판매자 목록 | seller.api.ts |

---

## 🐟 Product

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/products` | 상품 검색/목록 | product.api.ts |
| GET | `/products/:id` | 상품 상세 | product.api.ts |
| GET | `/products/me` | 내 상품 목록 (판매자) | seller.api.ts |
| POST | `/products` | 상품 등록 | seller.api.ts |
| PATCH | `/products/:id` | 상품 수정 | seller.api.ts |
| PATCH | `/products/:id/stock` | 재고 수정 | seller.api.ts |
| PATCH | `/products/:id/status` | 상태 토글 (ACTIVE/SOLD_OUT) | seller.api.ts |
| DELETE | `/products/:id` | 상품 삭제 | seller.api.ts |
| GET | `/products/:id/reviews` | 리뷰 목록 | product.api.ts |
| POST | `/products/:id/reviews` | 리뷰 작성 | product.api.ts |
| PATCH | `/products/:id/reviews/:reviewId` | 리뷰 수정 | product.api.ts |
| DELETE | `/products/:id/reviews/:reviewId` | 리뷰 삭제 | product.api.ts |
| GET | `/products/:id/reviews/eligible` | 리뷰 작성 가능 여부 | product.api.ts |
| POST | `/products/:id/wishlist` | 찜 토글 | product.api.ts |
| GET | `/products/:id/wishlist/status` | 찜 여부 확인 | product.api.ts |

---

## 🛒 Cart

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/cart` | 장바구니 조회 | cart.api.ts |
| POST | `/cart/items` | 상품 추가 | cart.api.ts |
| PATCH | `/cart/items/:productId` | 수량 변경 | cart.api.ts |
| DELETE | `/cart/items/:productId` | 상품 제거 | cart.api.ts |
| DELETE | `/cart` | 장바구니 전체 삭제 | cart.api.ts |

---

## 📦 Order

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| POST | `/orders` | 주문 생성 | order.api.ts |
| GET | `/orders` | 내 주문 목록 | order.api.ts |
| GET | `/orders/:orderId` | 주문 상세 | order.api.ts |
| POST | `/orders/:orderId/confirm` | 구매 확정 | order.api.ts |
| DELETE | `/orders/:orderId` | 주문 취소 | order.api.ts |

---

## 🏪 Seller

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| POST | `/seller-applications` | 판매자 신청 | seller.api.ts |
| GET | `/seller-applications/me` | 내 신청 상태 | seller.api.ts |
| GET | `/seller/profile` | 내 판매자 프로필 | seller.api.ts |
| PATCH | `/seller/profile` | 판매자 프로필 수정 | seller.api.ts |
| GET | `/seller/stats` | 판매자 통계 | seller.api.ts |
| GET | `/sellers` | 전체 판매자 목록 | seller.api.ts |
| GET | `/sellers/:memberId/profile` | 판매자 공개 프로필 | seller.api.ts |
| GET | `/sellers/:memberId/products` | 판매자 상품 목록 | seller.api.ts |
| POST | `/sellers/:sellerId/follow` | 팔로우/언팔로우 토글 | seller.api.ts |
| GET | `/sellers/:sellerId/followers/count` | 팔로워 수 | seller.api.ts |
| GET | `/sellers/:sellerId/follow/status` | 팔로우 여부 | seller.api.ts |

---

## 🔨 Auction

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/auctions/active` | 진행 중 경매 목록 | auction.api.ts |
| GET | `/auctions/scheduled` | 예정 경매 목록 | auction.api.ts |
| GET | `/auctions/:id` | 경매 상세 | auction.api.ts |
| GET | `/auctions/:id/bids` | 입찰 목록 | auction.api.ts |
| POST | `/auctions/:id/bids` | 입찰 | auction.api.ts |
| POST | `/auctions/:id/buy-now` | 즉시 구매 | auction.api.ts |
| GET | `/auctions/me/bids` | 내 입찰 목록 | auction.api.ts |
| GET | `/auctions/seller/me` | 내 경매 목록 (판매자) | auction.api.ts |
| POST | `/auctions` | 경매 등록 (multipart/form-data) | auction.api.ts |

---

## 💬 Community

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/community/categories` | 게시판 카테고리 목록 | community.api.ts |
| GET | `/community/posts` | 게시글 목록 (페이지네이션) | community.api.ts |
| GET | `/community/posts/:id` | 게시글 상세 | community.api.ts |
| POST | `/community/posts` | 게시글 작성 | community.api.ts |
| PATCH | `/community/posts/:id` | 게시글 수정 | community.api.ts |
| DELETE | `/community/posts/:id` | 게시글 삭제 | community.api.ts |
| POST | `/community/posts/:id/view` | 조회수 증가 | community.api.ts |
| POST | `/community/posts/:id/like` | 좋아요 토글 | community.api.ts |
| GET | `/community/posts/:id/comments` | 댓글 목록 | community.api.ts |
| POST | `/community/posts/:id/comments` | 댓글 작성 (대댓글 포함) | community.api.ts |
| PATCH | `/community/comments/:id` | 댓글 수정 | community.api.ts |
| DELETE | `/community/comments/:id` | 댓글 삭제 | community.api.ts |

---

## 🔍 Search

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/search` | 통합 검색 | search.api.ts |
| GET | `/search/autocomplete?keyword=` | 자동완성 | search.api.ts |
| GET | `/search/popular` | 인기 검색어 | search.api.ts |

---

## 🗂️ S3

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| POST | `/s3/presigned-url` | S3 업로드용 presigned URL 발급 | s3.api.ts |

---

## 🛡️ Admin

| Method | Endpoint | 설명 | 파일 |
|--------|----------|------|------|
| GET | `/admin/seller-applications` | PENDING 신청 목록 | seller.api.ts |
| POST | `/admin/seller-applications/:id/approve` | 판매자 신청 승인 | seller.api.ts |
| POST | `/admin/seller-applications/:id/reject` | 판매자 신청 거절 | seller.api.ts |
